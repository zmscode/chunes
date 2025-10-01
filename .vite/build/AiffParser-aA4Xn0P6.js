"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-BN3gJBRi.js");
require("node:fs/promises");
const ID3v2Parser = require("./ID3v2Parser-DfxJykZa.js");
const compressionTypes = {
  NONE: "not compressed	PCM	Apple Computer",
  sowt: "PCM (byte swapped)",
  fl32: "32-bit floating point IEEE 32-bit float",
  fl64: "64-bit floating point IEEE 64-bit float	Apple Computer",
  alaw: "ALaw 2:1	8-bit ITU-T G.711 A-law",
  ulaw: "µLaw 2:1	8-bit ITU-T G.711 µ-law	Apple Computer",
  ULAW: "CCITT G.711 u-law 8-bit ITU-T G.711 µ-law",
  ALAW: "CCITT G.711 A-law 8-bit ITU-T G.711 A-law",
  FL32: "Float 32	IEEE 32-bit float "
};
class AiffContentError extends main.makeUnexpectedFileContentError("AIFF") {
}
class Common {
  constructor(header, isAifc) {
    this.isAifc = isAifc;
    const minimumChunkSize = isAifc ? 22 : 18;
    if (header.chunkSize < minimumChunkSize)
      throw new AiffContentError(`COMMON CHUNK size should always be at least ${minimumChunkSize}`);
    this.len = header.chunkSize;
  }
  get(buf, off) {
    const shift = main.UINT16_BE.get(buf, off + 8) - 16398;
    const baseSampleRate = main.UINT16_BE.get(buf, off + 8 + 2);
    const res = {
      numChannels: main.UINT16_BE.get(buf, off),
      numSampleFrames: main.UINT32_BE.get(buf, off + 2),
      sampleSize: main.UINT16_BE.get(buf, off + 6),
      sampleRate: shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift
    };
    if (this.isAifc) {
      res.compressionType = main.FourCcToken.get(buf, off + 18);
      if (this.len > 22) {
        const strLen = main.UINT8.get(buf, off + 22);
        if (strLen > 0) {
          const padding = (strLen + 1) % 2;
          if (23 + strLen + padding === this.len) {
            res.compressionName = new main.StringType(strLen, "latin1").get(buf, off + 23);
          } else {
            throw new AiffContentError("Illegal pstring length");
          }
        } else {
          res.compressionName = void 0;
        }
      }
    } else {
      res.compressionName = "PCM";
    }
    return res;
  }
}
const Header = {
  len: 8,
  get: (buf, off) => {
    return {
      // Chunk type ID
      chunkID: main.FourCcToken.get(buf, off),
      // Chunk size
      chunkSize: Number(BigInt(main.UINT32_BE.get(buf, off + 4)))
    };
  }
};
const debug = main.initDebug("music-metadata:parser:aiff");
class AIFFParser extends main.BasicParser {
  constructor() {
    super(...arguments);
    this.isCompressed = null;
  }
  async parse() {
    const header = await this.tokenizer.readToken(Header);
    if (header.chunkID !== "FORM")
      throw new AiffContentError("Invalid Chunk-ID, expected 'FORM'");
    const type = await this.tokenizer.readToken(main.FourCcToken);
    switch (type) {
      case "AIFF":
        this.metadata.setFormat("container", type);
        this.isCompressed = false;
        break;
      case "AIFC":
        this.metadata.setFormat("container", "AIFF-C");
        this.isCompressed = true;
        break;
      default:
        throw new AiffContentError(`Unsupported AIFF type: ${type}`);
    }
    this.metadata.setFormat("lossless", !this.isCompressed);
    this.metadata.setAudioOnly();
    try {
      while (!this.tokenizer.fileInfo.size || this.tokenizer.fileInfo.size - this.tokenizer.position >= Header.len) {
        debug(`Reading AIFF chunk at offset=${this.tokenizer.position}`);
        const chunkHeader = await this.tokenizer.readToken(Header);
        const nextChunk = 2 * Math.round(chunkHeader.chunkSize / 2);
        const bytesRead = await this.readData(chunkHeader);
        await this.tokenizer.ignore(nextChunk - bytesRead);
      }
    } catch (err) {
      if (err instanceof main.EndOfStreamError) {
        debug("End-of-stream");
      } else {
        throw err;
      }
    }
  }
  async readData(header) {
    switch (header.chunkID) {
      case "COMM": {
        if (this.isCompressed === null) {
          throw new AiffContentError("Failed to parse AIFF.COMM chunk when compression type is unknown");
        }
        const common = await this.tokenizer.readToken(new Common(header, this.isCompressed));
        this.metadata.setFormat("bitsPerSample", common.sampleSize);
        this.metadata.setFormat("sampleRate", common.sampleRate);
        this.metadata.setFormat("numberOfChannels", common.numChannels);
        this.metadata.setFormat("numberOfSamples", common.numSampleFrames);
        this.metadata.setFormat("duration", common.numSampleFrames / common.sampleRate);
        if (common.compressionName || common.compressionType) {
          this.metadata.setFormat("codec", common.compressionName ?? compressionTypes[common.compressionType]);
        }
        return header.chunkSize;
      }
      case "ID3 ": {
        const id3_data = await this.tokenizer.readToken(new main.Uint8ArrayType(header.chunkSize));
        const rst = main.fromBuffer(id3_data);
        await new ID3v2Parser.ID3v2Parser().parse(this.metadata, rst, this.options);
        return header.chunkSize;
      }
      case "SSND":
        if (this.metadata.format.duration) {
          this.metadata.setFormat("bitrate", 8 * header.chunkSize / this.metadata.format.duration);
        }
        return 0;
      case "NAME":
      // Sample name chunk
      case "AUTH":
      // Author chunk
      case "(c) ":
      // Copyright chunk
      case "ANNO":
        return this.readTextChunk(header);
      default:
        debug(`Ignore chunk id=${header.chunkID}, size=${header.chunkSize}`);
        return 0;
    }
  }
  async readTextChunk(header) {
    const value = await this.tokenizer.readToken(new main.StringType(header.chunkSize, "ascii"));
    const values = value.split("\0").map((v) => v.trim()).filter((v) => v?.length);
    await Promise.all(values.map((v) => this.metadata.addTag("AIFF", header.chunkID, v)));
    return header.chunkSize;
  }
}
exports.AIFFParser = AIFFParser;
