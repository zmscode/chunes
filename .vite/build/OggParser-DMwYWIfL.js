"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-DVMleiKZ.js");
require("node:fs/promises");
const FlacParser = require("./FlacParser-BFR3TQ22.js");
class OpusContentError extends main.makeUnexpectedFileContentError("Opus") {
}
class IdHeader {
  constructor(len) {
    if (len < 19) {
      throw new OpusContentError("ID-header-page 0 should be at least 19 bytes long");
    }
    this.len = len;
  }
  get(buf, off) {
    return {
      magicSignature: new main.StringType(8, "ascii").get(buf, off + 0),
      version: main.UINT8.get(buf, off + 8),
      channelCount: main.UINT8.get(buf, off + 9),
      preSkip: main.UINT16_LE.get(buf, off + 10),
      inputSampleRate: main.UINT32_LE.get(buf, off + 12),
      outputGain: main.UINT16_LE.get(buf, off + 16),
      channelMapping: main.UINT8.get(buf, off + 18)
    };
  }
}
class OpusStream extends FlacParser.VorbisStream {
  constructor(metadata, options, tokenizer) {
    super(metadata, options);
    this.idHeader = null;
    this.lastPos = -1;
    this.tokenizer = tokenizer;
    this.durationOnLastPage = true;
  }
  /**
   * Parse first Opus Ogg page
   * @param {IPageHeader} header
   * @param {Uint8Array} pageData
   */
  parseFirstPage(_header, pageData) {
    this.metadata.setFormat("codec", "Opus");
    this.idHeader = new IdHeader(pageData.length).get(pageData, 0);
    if (this.idHeader.magicSignature !== "OpusHead")
      throw new OpusContentError("Illegal ogg/Opus magic-signature");
    this.metadata.setFormat("sampleRate", this.idHeader.inputSampleRate);
    this.metadata.setFormat("numberOfChannels", this.idHeader.channelCount);
    this.metadata.setAudioOnly();
  }
  async parseFullPage(pageData) {
    const magicSignature = new main.StringType(8, "ascii").get(pageData, 0);
    switch (magicSignature) {
      case "OpusTags":
        await this.parseUserCommentList(pageData, 8);
        this.lastPos = this.tokenizer.position - pageData.length;
        break;
    }
  }
  calculateDuration() {
    if (this.lastPageHeader && this.metadata.format.sampleRate && this.lastPageHeader.absoluteGranulePosition >= 0) {
      const pos_48bit = this.lastPageHeader.absoluteGranulePosition - this.idHeader.preSkip;
      this.metadata.setFormat("numberOfSamples", pos_48bit);
      this.metadata.setFormat("duration", pos_48bit / 48e3);
      if (this.lastPos !== -1 && this.tokenizer.fileInfo.size && this.metadata.format.duration) {
        const dataSize = this.tokenizer.fileInfo.size - this.lastPos;
        this.metadata.setFormat("bitrate", 8 * dataSize / this.metadata.format.duration);
      }
    }
  }
}
const Header = {
  len: 80,
  get: (buf, off) => {
    return {
      speex: new main.StringType(8, "ascii").get(buf, off + 0),
      version: main.trimRightNull(new main.StringType(20, "ascii").get(buf, off + 8)),
      version_id: main.INT32_LE.get(buf, off + 28),
      header_size: main.INT32_LE.get(buf, off + 32),
      rate: main.INT32_LE.get(buf, off + 36),
      mode: main.INT32_LE.get(buf, off + 40),
      mode_bitstream_version: main.INT32_LE.get(buf, off + 44),
      nb_channels: main.INT32_LE.get(buf, off + 48),
      bitrate: main.INT32_LE.get(buf, off + 52),
      frame_size: main.INT32_LE.get(buf, off + 56),
      vbr: main.INT32_LE.get(buf, off + 60),
      frames_per_packet: main.INT32_LE.get(buf, off + 64),
      extra_headers: main.INT32_LE.get(buf, off + 68),
      reserved1: main.INT32_LE.get(buf, off + 72),
      reserved2: main.INT32_LE.get(buf, off + 76)
    };
  }
};
const debug$3 = main.initDebug("music-metadata:parser:ogg:speex");
class SpeexStream extends FlacParser.VorbisStream {
  constructor(metadata, options, _tokenizer) {
    super(metadata, options);
  }
  /**
   * Parse first Speex Ogg page
   * @param {IPageHeader} header
   * @param {Uint8Array} pageData
   */
  parseFirstPage(_header, pageData) {
    debug$3("First Ogg/Speex page");
    const speexHeader = Header.get(pageData, 0);
    this.metadata.setFormat("codec", `Speex ${speexHeader.version}`);
    this.metadata.setFormat("numberOfChannels", speexHeader.nb_channels);
    this.metadata.setFormat("sampleRate", speexHeader.rate);
    if (speexHeader.bitrate !== -1) {
      this.metadata.setFormat("bitrate", speexHeader.bitrate);
    }
    this.metadata.setAudioOnly();
  }
}
const IdentificationHeader = {
  len: 42,
  get: (buf, off) => {
    return {
      id: new main.StringType(7, "ascii").get(buf, off),
      vmaj: main.UINT8.get(buf, off + 7),
      vmin: main.UINT8.get(buf, off + 8),
      vrev: main.UINT8.get(buf, off + 9),
      vmbw: main.UINT16_BE.get(buf, off + 10),
      vmbh: main.UINT16_BE.get(buf, off + 17),
      nombr: main.UINT24_BE.get(buf, off + 37),
      nqual: main.UINT8.get(buf, off + 40)
    };
  }
};
const debug$2 = main.initDebug("music-metadata:parser:ogg:theora");
class TheoraStream {
  constructor(metadata, _options, _tokenizer) {
    this.durationOnLastPage = false;
    this.metadata = metadata;
  }
  /**
   * Vorbis 1 parser
   * @param header Ogg Page Header
   * @param pageData Page data
   */
  async parsePage(header, pageData) {
    if (header.headerType.firstPage) {
      await this.parseFirstPage(header, pageData);
    }
  }
  calculateDuration() {
    debug$2("duration calculation not implemented");
  }
  /**
   * Parse first Theora Ogg page. the initial identification header packet
   */
  async parseFirstPage(_header, pageData) {
    debug$2("First Ogg/Theora page");
    this.metadata.setFormat("codec", "Theora");
    const idHeader = IdentificationHeader.get(pageData, 0);
    this.metadata.setFormat("bitrate", idHeader.nombr);
    this.metadata.setFormat("hasVideo", true);
  }
  flush() {
    return Promise.resolve();
  }
}
const PageHeader = {
  len: 27,
  get: (buf, off) => {
    return {
      capturePattern: new main.StringType(4, "latin1").get(buf, off),
      version: main.UINT8.get(buf, off + 4),
      headerType: {
        continued: main.getBit(buf, off + 5, 0),
        firstPage: main.getBit(buf, off + 5, 1),
        lastPage: main.getBit(buf, off + 5, 2)
      },
      // packet_flag: Token.UINT8.get(buf, off + 5),
      absoluteGranulePosition: Number(main.UINT64_LE.get(buf, off + 6)),
      streamSerialNumber: main.UINT32_LE.get(buf, off + 14),
      pageSequenceNo: main.UINT32_LE.get(buf, off + 18),
      pageChecksum: main.UINT32_LE.get(buf, off + 22),
      page_segments: main.UINT8.get(buf, off + 26)
    };
  }
};
class SegmentTable {
  static sum(buf, off, len) {
    const dv = new DataView(buf.buffer, 0);
    let s = 0;
    for (let i = off; i < off + len; ++i) {
      s += dv.getUint8(i);
    }
    return s;
  }
  constructor(header) {
    this.len = header.page_segments;
  }
  get(buf, off) {
    return {
      totalPageSize: SegmentTable.sum(buf, off, this.len)
    };
  }
}
const debug$1 = main.initDebug("music-metadata:parser:ogg:theora");
class FlacStream {
  constructor(metadata, options, tokenizer) {
    this.durationOnLastPage = false;
    this.metadata = metadata;
    this.options = options;
    this.tokenizer = tokenizer;
    this.flacParser = new FlacParser.FlacParser(this.metadata, this.tokenizer, options);
  }
  /**
   * Vorbis 1 parser
   * @param header Ogg Page Header
   * @param pageData Page data
   */
  async parsePage(header, pageData) {
    if (header.headerType.firstPage) {
      await this.parseFirstPage(header, pageData);
    }
  }
  calculateDuration() {
    debug$1("duration calculation not implemented");
  }
  /**
   * Parse first Theora Ogg page. the initial identification header packet
   */
  async parseFirstPage(_header, pageData) {
    debug$1("First Ogg/FLAC page");
    const fourCC = await main.FourCcToken.get(pageData, 9);
    if (fourCC.toString() !== "fLaC") {
      throw new Error("Invalid FLAC preamble");
    }
    const blockHeader = await FlacParser.BlockHeader.get(pageData, 13);
    await this.parseDataBlock(blockHeader, pageData.subarray(13 + FlacParser.BlockHeader.len));
  }
  async parseDataBlock(blockHeader, pageData) {
    debug$1(`blockHeader type=${blockHeader.type}, length=${blockHeader.length}`);
    switch (blockHeader.type) {
      case FlacParser.BlockType.STREAMINFO: {
        const streamInfo = FlacParser.BlockStreamInfo.get(pageData, 0);
        return this.flacParser.processsStreamInfo(streamInfo);
      }
      case FlacParser.BlockType.PADDING:
        break;
      case FlacParser.BlockType.APPLICATION:
        break;
      case FlacParser.BlockType.SEEKTABLE:
        break;
      case FlacParser.BlockType.VORBIS_COMMENT:
        return this.flacParser.parseComment(pageData);
      case FlacParser.BlockType.PICTURE:
        if (!this.options.skipCovers) {
          const picture = new FlacParser.VorbisPictureToken(pageData.length).get(pageData, 0);
          return this.flacParser.addPictureTag(picture);
        }
        break;
      default:
        this.metadata.addWarning(`Unknown block type: ${blockHeader.type}`);
    }
    return this.tokenizer.ignore(blockHeader.length).then();
  }
  flush() {
    return Promise.resolve();
  }
}
class OggContentError extends main.makeUnexpectedFileContentError("Ogg") {
}
const debug = main.initDebug("music-metadata:parser:ogg");
class OggStream {
  constructor(metadata, streamSerial, options) {
    this.pageNumber = 0;
    this.closed = false;
    this.metadata = metadata;
    this.streamSerial = streamSerial;
    this.options = options;
  }
  async parsePage(tokenizer, header) {
    this.pageNumber = header.pageSequenceNo;
    debug("serial=%s page#=%s, Ogg.id=%s", header.streamSerialNumber, header.pageSequenceNo, header.capturePattern);
    const segmentTable = await tokenizer.readToken(new SegmentTable(header));
    debug("totalPageSize=%s", segmentTable.totalPageSize);
    const pageData = await tokenizer.readToken(new main.Uint8ArrayType(segmentTable.totalPageSize));
    debug("firstPage=%s, lastPage=%s, continued=%s", header.headerType.firstPage, header.headerType.lastPage, header.headerType.continued);
    if (header.headerType.firstPage) {
      this.metadata.setFormat("container", "Ogg");
      const idData = pageData.subarray(0, 7);
      const asciiId = Array.from(idData).filter((b) => b >= 32 && b <= 126).map((b) => String.fromCharCode(b)).join("");
      switch (asciiId) {
        case "vorbis":
          debug(`Set Ogg stream serial ${header.streamSerialNumber}, codec=Vorbis`);
          this.pageConsumer = new FlacParser.VorbisStream(this.metadata, this.options);
          break;
        case "OpusHea":
          debug("Set page consumer to Ogg/Opus");
          this.pageConsumer = new OpusStream(this.metadata, this.options, tokenizer);
          break;
        case "Speex  ":
          debug("Set page consumer to Ogg/Speex");
          this.pageConsumer = new SpeexStream(this.metadata, this.options, tokenizer);
          break;
        case "fishead":
        case "theora":
          debug("Set page consumer to Ogg/Theora");
          this.pageConsumer = new TheoraStream(this.metadata, this.options, tokenizer);
          break;
        case "FLAC":
          debug("Set page consumer to Vorbis");
          this.pageConsumer = new FlacStream(this.metadata, this.options, tokenizer);
          break;
        default:
          throw new OggContentError(`Ogg codec not recognized (id=${asciiId}`);
      }
    }
    if (header.headerType.lastPage) {
      this.closed = true;
    }
    if (this.pageConsumer) {
      await this.pageConsumer.parsePage(header, pageData);
    } else
      throw new Error("pageConsumer should be initialized");
  }
}
class OggParser extends main.BasicParser {
  constructor() {
    super(...arguments);
    this.streams = /* @__PURE__ */ new Map();
  }
  /**
   * Parse page
   * @returns {Promise<void>}
   */
  async parse() {
    this.streams = /* @__PURE__ */ new Map();
    let header;
    try {
      do {
        header = await this.tokenizer.readToken(PageHeader);
        if (header.capturePattern !== "OggS")
          throw new OggContentError("Invalid Ogg capture pattern");
        let stream = this.streams.get(header.streamSerialNumber);
        if (!stream) {
          stream = new OggStream(this.metadata, header.streamSerialNumber, this.options);
          this.streams.set(header.streamSerialNumber, stream);
        }
        await stream.parsePage(this.tokenizer, header);
        if (stream.pageNumber > 12 && !(this.options.duration && [...this.streams.values()].find((stream2) => stream2.pageConsumer?.durationOnLastPage))) {
          debug("Stop processing Ogg stream");
          break;
        }
      } while (![...this.streams.values()].every((item) => item.closed));
    } catch (err) {
      if (err instanceof main.EndOfStreamError) {
        debug("Reached end-of-stream");
      } else if (err instanceof OggContentError) {
        this.metadata.addWarning(`Corrupt Ogg content at ${this.tokenizer.position}`);
      } else
        throw err;
    }
    for (const stream of this.streams.values()) {
      if (!stream.closed) {
        this.metadata.addWarning(`End-of-stream reached before reaching last page in Ogg stream serial=${stream.streamSerial}`);
        await stream.pageConsumer?.flush();
      }
      stream.pageConsumer?.calculateDuration();
    }
  }
}
exports.OggContentError = OggContentError;
exports.OggParser = OggParser;
