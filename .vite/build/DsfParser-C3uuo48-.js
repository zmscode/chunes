"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-C0uFtNwu.js");
const AbstractID3Parser = require("./AbstractID3Parser-C7hOeWLz.js");
const ID3v2Parser = require("./ID3v2Parser-D9O8IgZk.js");
const ChunkHeader = {
  len: 12,
  get: (buf, off) => {
    return { id: main.FourCcToken.get(buf, off), size: main.UINT64_LE.get(buf, off + 4) };
  }
};
const DsdChunk = {
  len: 16,
  get: (buf, off) => {
    return {
      fileSize: main.INT64_LE.get(buf, off),
      metadataPointer: main.INT64_LE.get(buf, off + 8)
    };
  }
};
const FormatChunk = {
  len: 40,
  get: (buf, off) => {
    return {
      formatVersion: main.INT32_LE.get(buf, off),
      formatID: main.INT32_LE.get(buf, off + 4),
      channelType: main.INT32_LE.get(buf, off + 8),
      channelNum: main.INT32_LE.get(buf, off + 12),
      samplingFrequency: main.INT32_LE.get(buf, off + 16),
      bitsPerSample: main.INT32_LE.get(buf, off + 20),
      sampleCount: main.INT64_LE.get(buf, off + 24),
      blockSizePerChannel: main.INT32_LE.get(buf, off + 32)
    };
  }
};
const debug = main.initDebug("music-metadata:parser:DSF");
class DsdContentParseError extends main.makeUnexpectedFileContentError("DSD") {
}
class DsfParser extends AbstractID3Parser.AbstractID3Parser {
  async postId3v2Parse() {
    const p0 = this.tokenizer.position;
    const chunkHeader = await this.tokenizer.readToken(ChunkHeader);
    if (chunkHeader.id !== "DSD ")
      throw new DsdContentParseError("Invalid chunk signature");
    this.metadata.setFormat("container", "DSF");
    this.metadata.setFormat("lossless", true);
    this.metadata.setAudioOnly();
    const dsdChunk = await this.tokenizer.readToken(DsdChunk);
    if (dsdChunk.metadataPointer === BigInt(0)) {
      debug("No ID3v2 tag present");
    } else {
      debug(`expect ID3v2 at offset=${dsdChunk.metadataPointer}`);
      await this.parseChunks(dsdChunk.fileSize - chunkHeader.size);
      await this.tokenizer.ignore(Number(dsdChunk.metadataPointer) - this.tokenizer.position - p0);
      return new ID3v2Parser.ID3v2Parser().parse(this.metadata, this.tokenizer, this.options);
    }
  }
  async parseChunks(bytesRemaining) {
    while (bytesRemaining >= ChunkHeader.len) {
      const chunkHeader = await this.tokenizer.readToken(ChunkHeader);
      debug(`Parsing chunk name=${chunkHeader.id} size=${chunkHeader.size}`);
      switch (chunkHeader.id) {
        case "fmt ": {
          const formatChunk = await this.tokenizer.readToken(FormatChunk);
          this.metadata.setFormat("numberOfChannels", formatChunk.channelNum);
          this.metadata.setFormat("sampleRate", formatChunk.samplingFrequency);
          this.metadata.setFormat("bitsPerSample", formatChunk.bitsPerSample);
          this.metadata.setFormat("numberOfSamples", formatChunk.sampleCount);
          this.metadata.setFormat("duration", Number(formatChunk.sampleCount) / formatChunk.samplingFrequency);
          const bitrate = formatChunk.bitsPerSample * formatChunk.samplingFrequency * formatChunk.channelNum;
          this.metadata.setFormat("bitrate", bitrate);
          return;
        }
        default:
          this.tokenizer.ignore(Number(chunkHeader.size) - ChunkHeader.len);
          break;
      }
      bytesRemaining -= chunkHeader.size;
    }
  }
}
exports.DsdContentParseError = DsdContentParseError;
exports.DsfParser = DsfParser;
