"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
require("node:fs/promises");
const main = require("./main-DVMleiKZ.js");
const ID3v2Parser = require("./ID3v2Parser-B5BqBpKS.js");
const Header = {
  len: 8,
  get: (buf, off) => {
    return {
      // Group-ID
      chunkID: new main.StringType(4, "latin1").get(buf, off),
      // Size
      chunkSize: main.UINT32_LE.get(buf, off + 4)
    };
  }
};
class ListInfoTagValue {
  constructor(tagHeader) {
    this.tagHeader = tagHeader;
    this.len = tagHeader.chunkSize;
    this.len += this.len & 1;
  }
  get(buf, off) {
    return new main.StringType(this.tagHeader.chunkSize, "ascii").get(buf, off);
  }
}
class WaveContentError extends main.makeUnexpectedFileContentError("Wave") {
}
const WaveFormat = {
  PCM: 1,
  // MPEG-4 and AAC Audio Types
  ADPCM: 2,
  IEEE_FLOAT: 3,
  MPEG_ADTS_AAC: 5632,
  MPEG_LOAS: 5634,
  RAW_AAC1: 255,
  // Dolby Audio Types
  DOLBY_AC3_SPDIF: 146,
  DVM: 8192,
  RAW_SPORT: 576,
  ESST_AC3: 577,
  DRM: 9,
  DTS2: 8193,
  MPEG: 80
};
const WaveFormatNameMap = {
  [WaveFormat.PCM]: "PCM",
  [WaveFormat.ADPCM]: "ADPCM",
  [WaveFormat.IEEE_FLOAT]: "IEEE_FLOAT",
  [WaveFormat.MPEG_ADTS_AAC]: "MPEG_ADTS_AAC",
  [WaveFormat.MPEG_LOAS]: "MPEG_LOAS",
  [WaveFormat.RAW_AAC1]: "RAW_AAC1",
  [WaveFormat.DOLBY_AC3_SPDIF]: "DOLBY_AC3_SPDIF",
  [WaveFormat.DVM]: "DVM",
  [WaveFormat.RAW_SPORT]: "RAW_SPORT",
  [WaveFormat.ESST_AC3]: "ESST_AC3",
  [WaveFormat.DRM]: "DRM",
  [WaveFormat.DTS2]: "DTS2",
  [WaveFormat.MPEG]: "MPEG"
};
class Format {
  constructor(header) {
    if (header.chunkSize < 16)
      throw new WaveContentError("Invalid chunk size");
    this.len = header.chunkSize;
  }
  get(buf, off) {
    return {
      wFormatTag: main.UINT16_LE.get(buf, off),
      nChannels: main.UINT16_LE.get(buf, off + 2),
      nSamplesPerSec: main.UINT32_LE.get(buf, off + 4),
      nAvgBytesPerSec: main.UINT32_LE.get(buf, off + 8),
      nBlockAlign: main.UINT16_LE.get(buf, off + 12),
      wBitsPerSample: main.UINT16_LE.get(buf, off + 14)
    };
  }
}
class FactChunk {
  constructor(header) {
    if (header.chunkSize < 4) {
      throw new WaveContentError("Invalid fact chunk size.");
    }
    this.len = header.chunkSize;
  }
  get(buf, off) {
    return {
      dwSampleLength: main.UINT32_LE.get(buf, off)
    };
  }
}
const BroadcastAudioExtensionChunk = {
  len: 420,
  get: (uint8array, off) => {
    return {
      description: main.stripNulls(new main.StringType(256, "ascii").get(uint8array, off)).trim(),
      originator: main.stripNulls(new main.StringType(32, "ascii").get(uint8array, off + 256)).trim(),
      originatorReference: main.stripNulls(new main.StringType(32, "ascii").get(uint8array, off + 288)).trim(),
      originationDate: main.stripNulls(new main.StringType(10, "ascii").get(uint8array, off + 320)).trim(),
      originationTime: main.stripNulls(new main.StringType(8, "ascii").get(uint8array, off + 330)).trim(),
      timeReferenceLow: main.UINT32_LE.get(uint8array, off + 338),
      timeReferenceHigh: main.UINT32_LE.get(uint8array, off + 342),
      version: main.UINT16_LE.get(uint8array, off + 346),
      umid: new main.Uint8ArrayType(64).get(uint8array, off + 348),
      loudnessValue: main.UINT16_LE.get(uint8array, off + 412),
      maxTruePeakLevel: main.UINT16_LE.get(uint8array, off + 414),
      maxMomentaryLoudness: main.UINT16_LE.get(uint8array, off + 416),
      maxShortTermLoudness: main.UINT16_LE.get(uint8array, off + 418)
    };
  }
};
const debug = main.initDebug("music-metadata:parser:RIFF");
class WaveParser extends main.BasicParser {
  constructor() {
    super(...arguments);
    this.blockAlign = 0;
  }
  async parse() {
    const riffHeader = await this.tokenizer.readToken(Header);
    debug(`pos=${this.tokenizer.position}, parse: chunkID=${riffHeader.chunkID}`);
    if (riffHeader.chunkID !== "RIFF")
      return;
    this.metadata.setAudioOnly();
    return this.parseRiffChunk(riffHeader.chunkSize).catch((err) => {
      if (!(err instanceof main.EndOfStreamError)) {
        throw err;
      }
    });
  }
  async parseRiffChunk(chunkSize) {
    const type = await this.tokenizer.readToken(main.FourCcToken);
    this.metadata.setFormat("container", type);
    switch (type) {
      case "WAVE":
        return this.readWaveChunk(chunkSize - main.FourCcToken.len);
      default:
        throw new WaveContentError(`Unsupported RIFF format: RIFF/${type}`);
    }
  }
  async readWaveChunk(remaining) {
    while (remaining >= Header.len) {
      const header = await this.tokenizer.readToken(Header);
      remaining -= Header.len + header.chunkSize;
      if (header.chunkSize > remaining) {
        this.metadata.addWarning("Data chunk size exceeds file size");
      }
      this.header = header;
      debug(`pos=${this.tokenizer.position}, readChunk: chunkID=RIFF/WAVE/${header.chunkID}`);
      switch (header.chunkID) {
        case "LIST":
          await this.parseListTag(header);
          break;
        case "fact":
          this.metadata.setFormat("lossless", false);
          this.fact = await this.tokenizer.readToken(new FactChunk(header));
          break;
        case "fmt ": {
          const fmt = await this.tokenizer.readToken(new Format(header));
          let subFormat = WaveFormatNameMap[fmt.wFormatTag];
          if (!subFormat) {
            debug(`WAVE/non-PCM format=${fmt.wFormatTag}`);
            subFormat = `non-PCM (${fmt.wFormatTag})`;
          }
          this.metadata.setFormat("codec", subFormat);
          this.metadata.setFormat("bitsPerSample", fmt.wBitsPerSample);
          this.metadata.setFormat("sampleRate", fmt.nSamplesPerSec);
          this.metadata.setFormat("numberOfChannels", fmt.nChannels);
          this.metadata.setFormat("bitrate", fmt.nBlockAlign * fmt.nSamplesPerSec * 8);
          this.blockAlign = fmt.nBlockAlign;
          break;
        }
        case "id3 ":
        // The way Picard, FooBar currently stores, ID3 meta-data
        case "ID3 ": {
          const id3_data = await this.tokenizer.readToken(new main.Uint8ArrayType(header.chunkSize));
          const rst = main.fromBuffer(id3_data);
          await new ID3v2Parser.ID3v2Parser().parse(this.metadata, rst, this.options);
          break;
        }
        case "data": {
          if (this.metadata.format.lossless !== false) {
            this.metadata.setFormat("lossless", true);
          }
          let chunkSize = header.chunkSize;
          if (this.tokenizer.fileInfo.size) {
            const calcRemaining = this.tokenizer.fileInfo.size - this.tokenizer.position;
            if (calcRemaining < chunkSize) {
              this.metadata.addWarning("data chunk length exceeding file length");
              chunkSize = calcRemaining;
            }
          }
          const numberOfSamples = this.fact ? this.fact.dwSampleLength : chunkSize === 4294967295 ? void 0 : chunkSize / this.blockAlign;
          if (numberOfSamples) {
            this.metadata.setFormat("numberOfSamples", numberOfSamples);
            if (this.metadata.format.sampleRate) {
              this.metadata.setFormat("duration", numberOfSamples / this.metadata.format.sampleRate);
            }
          }
          if (this.metadata.format.codec === "ADPCM") {
            this.metadata.setFormat("bitrate", 352e3);
          } else if (this.metadata.format.sampleRate) {
            this.metadata.setFormat("bitrate", this.blockAlign * this.metadata.format.sampleRate * 8);
          }
          await this.tokenizer.ignore(header.chunkSize);
          break;
        }
        case "bext": {
          const bext = await this.tokenizer.readToken(BroadcastAudioExtensionChunk);
          Object.keys(bext).forEach((key) => {
            this.metadata.addTag("exif", `bext.${key}`, bext[key]);
          });
          const bextRemaining = header.chunkSize - BroadcastAudioExtensionChunk.len;
          await this.tokenizer.ignore(bextRemaining);
          break;
        }
        case "\0\0\0\0":
          debug(`Ignore padding chunk: RIFF/${header.chunkID} of ${header.chunkSize} bytes`);
          this.metadata.addWarning(`Ignore chunk: RIFF/${header.chunkID}`);
          await this.tokenizer.ignore(header.chunkSize);
          break;
        default:
          debug(`Ignore chunk: RIFF/${header.chunkID} of ${header.chunkSize} bytes`);
          this.metadata.addWarning(`Ignore chunk: RIFF/${header.chunkID}`);
          await this.tokenizer.ignore(header.chunkSize);
      }
      if (this.header.chunkSize % 2 === 1) {
        debug("Read odd padding byte");
        await this.tokenizer.ignore(1);
      }
    }
  }
  async parseListTag(listHeader) {
    const listType = await this.tokenizer.readToken(new main.StringType(4, "latin1"));
    debug("pos=%s, parseListTag: chunkID=RIFF/WAVE/LIST/%s", this.tokenizer.position, listType);
    switch (listType) {
      case "INFO":
        return this.parseRiffInfoTags(listHeader.chunkSize - 4);
      default:
        this.metadata.addWarning(`Ignore chunk: RIFF/WAVE/LIST/${listType}`);
        debug(`Ignoring chunkID=RIFF/WAVE/LIST/${listType}`);
        return this.tokenizer.ignore(listHeader.chunkSize - 4).then();
    }
  }
  async parseRiffInfoTags(chunkSize) {
    while (chunkSize >= 8) {
      const header = await this.tokenizer.readToken(Header);
      const valueToken = new ListInfoTagValue(header);
      const value = await this.tokenizer.readToken(valueToken);
      this.addTag(header.chunkID, main.stripNulls(value));
      chunkSize -= 8 + valueToken.len;
    }
    if (chunkSize !== 0) {
      throw new WaveContentError(`Illegal remaining size: ${chunkSize}`);
    }
  }
  addTag(id, value) {
    this.metadata.addTag("exif", id, value);
  }
}
exports.WaveParser = WaveParser;
