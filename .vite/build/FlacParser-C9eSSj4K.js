"use strict";
const main = require("./main-C0uFtNwu.js");
const AbstractID3Parser = require("./AbstractID3Parser-C7hOeWLz.js");
class VorbisPictureToken {
  static fromBase64(base64str) {
    return VorbisPictureToken.fromBuffer(Uint8Array.from(atob(base64str), (c) => c.charCodeAt(0)));
  }
  static fromBuffer(buffer) {
    const pic = new VorbisPictureToken(buffer.length);
    return pic.get(buffer, 0);
  }
  constructor(len) {
    this.len = len;
  }
  get(buffer, offset) {
    const type = main.AttachedPictureType[main.UINT32_BE.get(buffer, offset)];
    offset += 4;
    const mimeLen = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const format = new main.StringType(mimeLen, "utf-8").get(buffer, offset);
    offset += mimeLen;
    const descLen = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const description = new main.StringType(descLen, "utf-8").get(buffer, offset);
    offset += descLen;
    const width = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const height = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const colour_depth = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const indexed_color = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const picDataLen = main.UINT32_BE.get(buffer, offset);
    offset += 4;
    const data = buffer.slice(offset, offset + picDataLen);
    return {
      type,
      format,
      description,
      width,
      height,
      colour_depth,
      indexed_color,
      data
    };
  }
}
const CommonHeader = {
  len: 7,
  get: (buf, off) => {
    return {
      packetType: main.UINT8.get(buf, off),
      vorbis: new main.StringType(6, "ascii").get(buf, off + 1)
    };
  }
};
const IdentificationHeader = {
  len: 23,
  get: (uint8Array, off) => {
    return {
      version: main.UINT32_LE.get(uint8Array, off + 0),
      channelMode: main.UINT8.get(uint8Array, off + 4),
      sampleRate: main.UINT32_LE.get(uint8Array, off + 5),
      bitrateMax: main.UINT32_LE.get(uint8Array, off + 9),
      bitrateNominal: main.UINT32_LE.get(uint8Array, off + 13),
      bitrateMin: main.UINT32_LE.get(uint8Array, off + 17)
    };
  }
};
class VorbisDecoder {
  constructor(data, offset) {
    this.data = data;
    this.offset = offset;
  }
  readInt32() {
    const value = main.UINT32_LE.get(this.data, this.offset);
    this.offset += 4;
    return value;
  }
  readStringUtf8() {
    const len = this.readInt32();
    const value = main.textDecode(this.data.subarray(this.offset, this.offset + len), "utf-8");
    this.offset += len;
    return value;
  }
  parseUserComment() {
    const offset0 = this.offset;
    const v = this.readStringUtf8();
    const idx = v.indexOf("=");
    return {
      key: v.substring(0, idx).toUpperCase(),
      value: v.substring(idx + 1),
      len: this.offset - offset0
    };
  }
}
const debug$1 = main.initDebug("music-metadata:parser:ogg:vorbis1");
class VorbisContentError extends main.makeUnexpectedFileContentError("Vorbis") {
}
class VorbisStream {
  constructor(metadata, options) {
    this.pageSegments = [];
    this.durationOnLastPage = true;
    this.metadata = metadata;
    this.options = options;
  }
  /**
   * Vorbis 1 parser
   * @param header Ogg Page Header
   * @param pageData Page data
   */
  async parsePage(header, pageData) {
    this.lastPageHeader = header;
    if (header.headerType.firstPage) {
      this.parseFirstPage(header, pageData);
    } else {
      if (header.headerType.continued) {
        if (this.pageSegments.length === 0) {
          throw new VorbisContentError("Cannot continue on previous page");
        }
        this.pageSegments.push(pageData);
      }
      if (header.headerType.lastPage || !header.headerType.continued) {
        if (this.pageSegments.length > 0) {
          const fullPage = VorbisStream.mergeUint8Arrays(this.pageSegments);
          await this.parseFullPage(fullPage);
        }
        this.pageSegments = header.headerType.lastPage ? [] : [pageData];
      }
    }
  }
  static mergeUint8Arrays(arrays) {
    const totalSize = arrays.reduce((acc, e) => acc + e.length, 0);
    const merged = new Uint8Array(totalSize);
    arrays.forEach((array, i, _arrays) => {
      const offset = _arrays.slice(0, i).reduce((acc, e) => acc + e.length, 0);
      merged.set(array, offset);
    });
    return merged;
  }
  async flush() {
    await this.parseFullPage(VorbisStream.mergeUint8Arrays(this.pageSegments));
  }
  async parseUserComment(pageData, offset) {
    const decoder = new VorbisDecoder(pageData, offset);
    const tag = decoder.parseUserComment();
    await this.addTag(tag.key, tag.value);
    return tag.len;
  }
  async addTag(id, value) {
    if (id === "METADATA_BLOCK_PICTURE" && typeof value === "string") {
      if (this.options.skipCovers) {
        debug$1("Ignore picture");
        return;
      }
      value = VorbisPictureToken.fromBase64(value);
      debug$1(`Push picture: id=${id}, format=${value.format}`);
    } else {
      debug$1(`Push tag: id=${id}, value=${value}`);
    }
    await this.metadata.addTag("vorbis", id, value);
  }
  calculateDuration() {
    if (this.lastPageHeader && this.metadata.format.sampleRate && this.lastPageHeader.absoluteGranulePosition >= 0) {
      this.metadata.setFormat("numberOfSamples", this.lastPageHeader.absoluteGranulePosition);
      this.metadata.setFormat("duration", this.lastPageHeader.absoluteGranulePosition / this.metadata.format.sampleRate);
    }
  }
  /**
   * Parse first Ogg/Vorbis page
   * @param _header
   * @param pageData
   */
  parseFirstPage(_header, pageData) {
    this.metadata.setFormat("codec", "Vorbis I");
    this.metadata.setFormat("hasAudio", true);
    debug$1("Parse first page");
    const commonHeader = CommonHeader.get(pageData, 0);
    if (commonHeader.vorbis !== "vorbis")
      throw new VorbisContentError("Metadata does not look like Vorbis");
    if (commonHeader.packetType === 1) {
      const idHeader = IdentificationHeader.get(pageData, CommonHeader.len);
      this.metadata.setFormat("sampleRate", idHeader.sampleRate);
      this.metadata.setFormat("bitrate", idHeader.bitrateNominal);
      this.metadata.setFormat("numberOfChannels", idHeader.channelMode);
      debug$1("sample-rate=%s[hz], bitrate=%s[b/s], channel-mode=%s", idHeader.sampleRate, idHeader.bitrateNominal, idHeader.channelMode);
    } else
      throw new VorbisContentError("First Ogg page should be type 1: the identification header");
  }
  async parseFullPage(pageData) {
    const commonHeader = CommonHeader.get(pageData, 0);
    debug$1("Parse full page: type=%s, byteLength=%s", commonHeader.packetType, pageData.byteLength);
    switch (commonHeader.packetType) {
      case 3:
        return this.parseUserCommentList(pageData, CommonHeader.len);
    }
  }
  /**
   * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-840005.2
   */
  async parseUserCommentList(pageData, offset) {
    const strLen = main.UINT32_LE.get(pageData, offset);
    offset += 4;
    offset += strLen;
    let userCommentListLength = main.UINT32_LE.get(pageData, offset);
    offset += 4;
    while (userCommentListLength-- > 0) {
      offset += await this.parseUserComment(pageData, offset);
    }
  }
}
const BlockType = {
  STREAMINFO: 0,
  // STREAMINFO
  PADDING: 1,
  // PADDING
  APPLICATION: 2,
  // APPLICATION
  SEEKTABLE: 3,
  // SEEKTABLE
  VORBIS_COMMENT: 4,
  // VORBIS_COMMENT
  CUESHEET: 5,
  // CUESHEET
  PICTURE: 6
  // PICTURE
};
const BlockHeader = {
  len: 4,
  get: (buf, off) => {
    return {
      lastBlock: main.getBit(buf, off, 7),
      type: main.getBitAllignedNumber(buf, off, 1, 7),
      length: main.UINT24_BE.get(buf, off + 1)
    };
  }
};
const BlockStreamInfo = {
  len: 34,
  get: (buf, off) => {
    return {
      // The minimum block size (in samples) used in the stream.
      minimumBlockSize: main.UINT16_BE.get(buf, off),
      // The maximum block size (in samples) used in the stream.
      // (Minimum blocksize == maximum blocksize) implies a fixed-blocksize stream.
      maximumBlockSize: main.UINT16_BE.get(buf, off + 2) / 1e3,
      // The minimum frame size (in bytes) used in the stream.
      // May be 0 to imply the value is not known.
      minimumFrameSize: main.UINT24_BE.get(buf, off + 4),
      // The maximum frame size (in bytes) used in the stream.
      // May be 0 to imply the value is not known.
      maximumFrameSize: main.UINT24_BE.get(buf, off + 7),
      // Sample rate in Hz. Though 20 bits are available,
      // the maximum sample rate is limited by the structure of frame headers to 655350Hz.
      // Also, a value of 0 is invalid.
      sampleRate: main.UINT24_BE.get(buf, off + 10) >> 4,
      // probably slower: sampleRate: common.getBitAllignedNumber(buf, off + 10, 0, 20),
      // (number of channels)-1. FLAC supports from 1 to 8 channels
      channels: main.getBitAllignedNumber(buf, off + 12, 4, 3) + 1,
      // bits per sample)-1.
      // FLAC supports from 4 to 32 bits per sample. Currently the reference encoder and decoders only support up to 24 bits per sample.
      bitsPerSample: main.getBitAllignedNumber(buf, off + 12, 7, 5) + 1,
      // Total samples in stream.
      // 'Samples' means inter-channel sample, i.e. one second of 44.1Khz audio will have 44100 samples regardless of the number of channels.
      // A value of zero here means the number of total samples is unknown.
      totalSamples: main.getBitAllignedNumber(buf, off + 13, 4, 36),
      // the MD5 hash of the file (see notes for usage... it's a littly tricky)
      fileMD5: new main.Uint8ArrayType(16).get(buf, off + 18)
    };
  }
};
const debug = main.initDebug("music-metadata:parser:FLAC");
class FlacContentError extends main.makeUnexpectedFileContentError("FLAC") {
}
class FlacParser extends AbstractID3Parser.AbstractID3Parser {
  constructor() {
    super(...arguments);
    this.vorbisParser = new VorbisStream(this.metadata, this.options);
    this.padding = 0;
  }
  async postId3v2Parse() {
    const fourCC = await this.tokenizer.readToken(main.FourCcToken);
    if (fourCC.toString() !== "fLaC") {
      throw new FlacContentError("Invalid FLAC preamble");
    }
    let blockHeader;
    do {
      blockHeader = await this.tokenizer.readToken(BlockHeader);
      await this.parseDataBlock(blockHeader);
    } while (!blockHeader.lastBlock);
    if (this.tokenizer.fileInfo.size && this.metadata.format.duration) {
      const dataSize = this.tokenizer.fileInfo.size - this.tokenizer.position;
      this.metadata.setFormat("bitrate", 8 * dataSize / this.metadata.format.duration);
    }
  }
  async parseDataBlock(blockHeader) {
    debug(`blockHeader type=${blockHeader.type}, length=${blockHeader.length}`);
    switch (blockHeader.type) {
      case BlockType.STREAMINFO:
        return this.readBlockStreamInfo(blockHeader.length);
      case BlockType.PADDING:
        this.padding += blockHeader.length;
        break;
      case BlockType.APPLICATION:
        break;
      case BlockType.SEEKTABLE:
        break;
      case BlockType.VORBIS_COMMENT:
        return this.readComment(blockHeader.length);
      case BlockType.CUESHEET:
        break;
      case BlockType.PICTURE:
        await this.parsePicture(blockHeader.length);
        return;
      default:
        this.metadata.addWarning(`Unknown block type: ${blockHeader.type}`);
    }
    return this.tokenizer.ignore(blockHeader.length).then();
  }
  /**
   * Parse STREAMINFO
   */
  async readBlockStreamInfo(dataLen) {
    if (dataLen !== BlockStreamInfo.len)
      throw new FlacContentError("Unexpected block-stream-info length");
    const streamInfo = await this.tokenizer.readToken(BlockStreamInfo);
    this.metadata.setFormat("container", "FLAC");
    this.processsStreamInfo(streamInfo);
  }
  /**
   * Parse STREAMINFO
   */
  processsStreamInfo(streamInfo) {
    this.metadata.setFormat("codec", "FLAC");
    this.metadata.setFormat("hasAudio", true);
    this.metadata.setFormat("lossless", true);
    this.metadata.setFormat("numberOfChannels", streamInfo.channels);
    this.metadata.setFormat("bitsPerSample", streamInfo.bitsPerSample);
    this.metadata.setFormat("sampleRate", streamInfo.sampleRate);
    if (streamInfo.totalSamples > 0) {
      this.metadata.setFormat("duration", streamInfo.totalSamples / streamInfo.sampleRate);
    }
  }
  /**
   * Read VORBIS_COMMENT from tokenizer
   * Ref: https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-640004.2.3
   */
  async readComment(dataLen) {
    const data = await this.tokenizer.readToken(new main.Uint8ArrayType(dataLen));
    return this.parseComment(data);
  }
  /**
   * Parse VORBIS_COMMENT
   * Ref: https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-640004.2.3
   */
  async parseComment(data) {
    const decoder = new VorbisDecoder(data, 0);
    const vendor = decoder.readStringUtf8();
    if (vendor.length > 0) {
      this.metadata.setFormat("tool", vendor);
    }
    const commentListLength = decoder.readInt32();
    const tags = new Array(commentListLength);
    for (let i = 0; i < commentListLength; i++) {
      tags[i] = decoder.parseUserComment();
    }
    await Promise.all(tags.map((tag) => {
      if (tag.key === "ENCODER") {
        this.metadata.setFormat("tool", tag.value);
      }
      return this.addTag(tag.key, tag.value);
    }));
  }
  async parsePicture(dataLen) {
    if (this.options.skipCovers) {
      return this.tokenizer.ignore(dataLen);
    }
    return this.addPictureTag(await this.tokenizer.readToken(new VorbisPictureToken(dataLen)));
  }
  addPictureTag(picture) {
    return this.addTag("METADATA_BLOCK_PICTURE", picture);
  }
  addTag(id, value) {
    return this.vorbisParser.addTag(id, value);
  }
}
const FlacParser$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FlacParser
}, Symbol.toStringTag, { value: "Module" }));
exports.BlockHeader = BlockHeader;
exports.BlockStreamInfo = BlockStreamInfo;
exports.BlockType = BlockType;
exports.FlacParser = FlacParser;
exports.FlacParser$1 = FlacParser$1;
exports.VorbisPictureToken = VorbisPictureToken;
exports.VorbisStream = VorbisStream;
