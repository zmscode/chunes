"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-vnI89Xz8.js");
require("node:fs/promises");
const AbstractID3Parser = require("./AbstractID3Parser-ClvzXPwP.js");
const ReplayGain = {
  len: 2,
  get: (buf, off) => {
    const gain_type = main.getBitAllignedNumber(buf, off, 0, 3);
    const sign = main.getBitAllignedNumber(buf, off, 6, 1);
    const gain_adj = main.getBitAllignedNumber(buf, off, 7, 9) / 10;
    if (gain_type > 0) {
      return {
        type: main.getBitAllignedNumber(buf, off, 0, 3),
        origin: main.getBitAllignedNumber(buf, off, 3, 3),
        adjustment: sign ? -gain_adj : gain_adj
      };
    }
    return void 0;
  }
};
const ExtendedLameHeader = {
  len: 27,
  get: (buf, off) => {
    const track_peak = main.UINT32_BE.get(buf, off + 2);
    return {
      revision: main.getBitAllignedNumber(buf, off, 0, 4),
      vbr_method: main.getBitAllignedNumber(buf, off, 4, 4),
      lowpass_filter: 100 * main.UINT8.get(buf, off + 1),
      track_peak: track_peak === 0 ? null : track_peak / 2 ** 23,
      track_gain: ReplayGain.get(buf, 6),
      album_gain: ReplayGain.get(buf, 8),
      music_length: main.UINT32_BE.get(buf, off + 20),
      music_crc: main.UINT8.get(buf, off + 24),
      header_crc: main.UINT16_BE.get(buf, off + 24)
    };
  }
};
const InfoTagHeaderTag = new main.StringType(4, "ascii");
const LameEncoderVersion = new main.StringType(6, "ascii");
const XingHeaderFlags = {
  len: 4,
  get: (buf, off) => {
    return {
      frames: main.isBitSet(buf, off, 31),
      bytes: main.isBitSet(buf, off, 30),
      toc: main.isBitSet(buf, off, 29),
      vbrScale: main.isBitSet(buf, off, 28)
    };
  }
};
async function readXingHeader(tokenizer) {
  const flags = await tokenizer.readToken(XingHeaderFlags);
  const xingInfoTag = { numFrames: null, streamSize: null, vbrScale: null };
  if (flags.frames) {
    xingInfoTag.numFrames = await tokenizer.readToken(main.UINT32_BE);
  }
  if (flags.bytes) {
    xingInfoTag.streamSize = await tokenizer.readToken(main.UINT32_BE);
  }
  if (flags.toc) {
    xingInfoTag.toc = new Uint8Array(100);
    await tokenizer.readBuffer(xingInfoTag.toc);
  }
  if (flags.vbrScale) {
    xingInfoTag.vbrScale = await tokenizer.readToken(main.UINT32_BE);
  }
  const lameTag = await tokenizer.peekToken(new main.StringType(4, "ascii"));
  if (lameTag === "LAME") {
    await tokenizer.ignore(4);
    xingInfoTag.lame = {
      version: await tokenizer.readToken(new main.StringType(5, "ascii"))
    };
    const match = xingInfoTag.lame.version.match(/\d+.\d+/g);
    if (match !== null) {
      const majorMinorVersion = match[0];
      const version = majorMinorVersion.split(".").map((n) => Number.parseInt(n, 10));
      if (version[0] >= 3 && version[1] >= 90) {
        xingInfoTag.lame.extended = await tokenizer.readToken(ExtendedLameHeader);
      }
    }
  }
  return xingInfoTag;
}
const debug = main.initDebug("music-metadata:parser:mpeg");
class MpegContentError extends main.makeUnexpectedFileContentError("MPEG") {
}
const maxPeekLen = 1024;
const MPEG4 = {
  /**
   * Audio Object Types
   */
  AudioObjectTypes: [
    "AAC Main",
    "AAC LC",
    // Low Complexity
    "AAC SSR",
    // Scalable Sample Rate
    "AAC LTP"
    // Long Term Prediction
  ],
  /**
   * Sampling Frequencies
   * https://wiki.multimedia.cx/index.php/MPEG-4_Audio#Sampling_Frequencies
   */
  SamplingFrequencies: [
    96e3,
    88200,
    64e3,
    48e3,
    44100,
    32e3,
    24e3,
    22050,
    16e3,
    12e3,
    11025,
    8e3,
    7350,
    null,
    null,
    -1
  ]
  /**
   * Channel Configurations
   */
};
const MPEG4_ChannelConfigurations = [
  void 0,
  ["front-center"],
  ["front-left", "front-right"],
  ["front-center", "front-left", "front-right"],
  ["front-center", "front-left", "front-right", "back-center"],
  ["front-center", "front-left", "front-right", "back-left", "back-right"],
  ["front-center", "front-left", "front-right", "back-left", "back-right", "LFE-channel"],
  ["front-center", "front-left", "front-right", "side-left", "side-right", "back-left", "back-right", "LFE-channel"]
];
class MpegFrameHeader {
  constructor(buf, off) {
    this.bitrateIndex = null;
    this.sampRateFreqIndex = null;
    this.padding = null;
    this.privateBit = null;
    this.channelModeIndex = null;
    this.modeExtension = null;
    this.isOriginalMedia = null;
    this.version = null;
    this.bitrate = null;
    this.samplingRate = null;
    this.frameLength = 0;
    this.versionIndex = main.getBitAllignedNumber(buf, off + 1, 3, 2);
    this.layer = MpegFrameHeader.LayerDescription[main.getBitAllignedNumber(buf, off + 1, 5, 2)];
    if (this.versionIndex > 1 && this.layer === 0) {
      this.parseAdtsHeader(buf, off);
    } else {
      this.parseMpegHeader(buf, off);
    }
    this.isProtectedByCRC = !main.isBitSet(buf, off + 1, 7);
  }
  calcDuration(numFrames) {
    return this.samplingRate == null ? null : numFrames * this.calcSamplesPerFrame() / this.samplingRate;
  }
  calcSamplesPerFrame() {
    return MpegFrameHeader.samplesInFrameTable[this.version === 1 ? 0 : 1][this.layer];
  }
  calculateSideInfoLength() {
    if (this.layer !== 3)
      return 2;
    if (this.channelModeIndex === 3) {
      if (this.version === 1) {
        return 17;
      }
      if (this.version === 2 || this.version === 2.5) {
        return 9;
      }
    } else {
      if (this.version === 1) {
        return 32;
      }
      if (this.version === 2 || this.version === 2.5) {
        return 17;
      }
    }
    return null;
  }
  calcSlotSize() {
    return [null, 4, 1, 1][this.layer];
  }
  parseMpegHeader(buf, off) {
    this.container = "MPEG";
    this.bitrateIndex = main.getBitAllignedNumber(buf, off + 2, 0, 4);
    this.sampRateFreqIndex = main.getBitAllignedNumber(buf, off + 2, 4, 2);
    this.padding = main.isBitSet(buf, off + 2, 6);
    this.privateBit = main.isBitSet(buf, off + 2, 7);
    this.channelModeIndex = main.getBitAllignedNumber(buf, off + 3, 0, 2);
    this.modeExtension = main.getBitAllignedNumber(buf, off + 3, 2, 2);
    this.isCopyrighted = main.isBitSet(buf, off + 3, 4);
    this.isOriginalMedia = main.isBitSet(buf, off + 3, 5);
    this.emphasis = main.getBitAllignedNumber(buf, off + 3, 7, 2);
    this.version = MpegFrameHeader.VersionID[this.versionIndex];
    this.channelMode = MpegFrameHeader.ChannelMode[this.channelModeIndex];
    this.codec = `MPEG ${this.version} Layer ${this.layer}`;
    const bitrateInKbps = this.calcBitrate();
    if (!bitrateInKbps) {
      throw new MpegContentError("Cannot determine bit-rate");
    }
    this.bitrate = bitrateInKbps * 1e3;
    this.samplingRate = this.calcSamplingRate();
    if (this.samplingRate == null) {
      throw new MpegContentError("Cannot determine sampling-rate");
    }
  }
  parseAdtsHeader(buf, off) {
    debug("layer=0 => ADTS");
    this.version = this.versionIndex === 2 ? 4 : 2;
    this.container = `ADTS/MPEG-${this.version}`;
    const profileIndex = main.getBitAllignedNumber(buf, off + 2, 0, 2);
    this.codec = "AAC";
    this.codecProfile = MPEG4.AudioObjectTypes[profileIndex];
    debug(`MPEG-4 audio-codec=${this.codec}`);
    const samplingFrequencyIndex = main.getBitAllignedNumber(buf, off + 2, 2, 4);
    this.samplingRate = MPEG4.SamplingFrequencies[samplingFrequencyIndex];
    debug(`sampling-rate=${this.samplingRate}`);
    const channelIndex = main.getBitAllignedNumber(buf, off + 2, 7, 3);
    this.mp4ChannelConfig = MPEG4_ChannelConfigurations[channelIndex];
    debug(`channel-config=${this.mp4ChannelConfig ? this.mp4ChannelConfig.join("+") : "?"}`);
    this.frameLength = main.getBitAllignedNumber(buf, off + 3, 6, 2) << 11;
  }
  calcBitrate() {
    if (this.bitrateIndex === 0 || // free
    this.bitrateIndex === 15) {
      return null;
    }
    if (this.version && this.bitrateIndex) {
      const codecIndex = 10 * Math.floor(this.version) + this.layer;
      return MpegFrameHeader.bitrate_index[this.bitrateIndex][codecIndex];
    }
    return null;
  }
  calcSamplingRate() {
    if (this.sampRateFreqIndex === 3 || this.version === null || this.sampRateFreqIndex == null)
      return null;
    return MpegFrameHeader.sampling_rate_freq_index[this.version][this.sampRateFreqIndex];
  }
}
MpegFrameHeader.SyncByte1 = 255;
MpegFrameHeader.SyncByte2 = 224;
MpegFrameHeader.VersionID = [2.5, null, 2, 1];
MpegFrameHeader.LayerDescription = [0, 3, 2, 1];
MpegFrameHeader.ChannelMode = ["stereo", "joint_stereo", "dual_channel", "mono"];
MpegFrameHeader.bitrate_index = {
  1: { 11: 32, 12: 32, 13: 32, 21: 32, 22: 8, 23: 8 },
  2: { 11: 64, 12: 48, 13: 40, 21: 48, 22: 16, 23: 16 },
  3: { 11: 96, 12: 56, 13: 48, 21: 56, 22: 24, 23: 24 },
  4: { 11: 128, 12: 64, 13: 56, 21: 64, 22: 32, 23: 32 },
  5: { 11: 160, 12: 80, 13: 64, 21: 80, 22: 40, 23: 40 },
  6: { 11: 192, 12: 96, 13: 80, 21: 96, 22: 48, 23: 48 },
  7: { 11: 224, 12: 112, 13: 96, 21: 112, 22: 56, 23: 56 },
  8: { 11: 256, 12: 128, 13: 112, 21: 128, 22: 64, 23: 64 },
  9: { 11: 288, 12: 160, 13: 128, 21: 144, 22: 80, 23: 80 },
  10: { 11: 320, 12: 192, 13: 160, 21: 160, 22: 96, 23: 96 },
  11: { 11: 352, 12: 224, 13: 192, 21: 176, 22: 112, 23: 112 },
  12: { 11: 384, 12: 256, 13: 224, 21: 192, 22: 128, 23: 128 },
  13: { 11: 416, 12: 320, 13: 256, 21: 224, 22: 144, 23: 144 },
  14: { 11: 448, 12: 384, 13: 320, 21: 256, 22: 160, 23: 160 }
};
MpegFrameHeader.sampling_rate_freq_index = {
  1: { 0: 44100, 1: 48e3, 2: 32e3 },
  2: { 0: 22050, 1: 24e3, 2: 16e3 },
  2.5: { 0: 11025, 1: 12e3, 2: 8e3 }
};
MpegFrameHeader.samplesInFrameTable = [
  /* Layer   I    II   III */
  [0, 384, 1152, 1152],
  // MPEG-1
  [0, 384, 1152, 576]
  // MPEG-2(.5
];
const FrameHeader = {
  len: 4,
  get: (buf, off) => {
    return new MpegFrameHeader(buf, off);
  }
};
function getVbrCodecProfile(vbrScale) {
  return `V${Math.floor((100 - vbrScale) / 10)}`;
}
class MpegParser extends AbstractID3Parser.AbstractID3Parser {
  constructor() {
    super(...arguments);
    this.frameCount = 0;
    this.syncFrameCount = -1;
    this.countSkipFrameData = 0;
    this.totalDataLength = 0;
    this.bitrates = [];
    this.offset = 0;
    this.frame_size = 0;
    this.crc = null;
    this.calculateEofDuration = false;
    this.samplesPerFrame = null;
    this.buf_frame_header = new Uint8Array(4);
    this.mpegOffset = null;
    this.syncPeek = {
      buf: new Uint8Array(maxPeekLen),
      len: 0
    };
  }
  /**
   * Called after ID3 headers have been parsed
   */
  async postId3v2Parse() {
    this.metadata.setFormat("lossless", false);
    this.metadata.setAudioOnly();
    try {
      let quit = false;
      while (!quit) {
        await this.sync();
        quit = await this.parseCommonMpegHeader();
      }
    } catch (err) {
      if (err instanceof main.EndOfStreamError) {
        debug("End-of-stream");
        if (this.calculateEofDuration) {
          if (this.samplesPerFrame !== null) {
            const numberOfSamples = this.frameCount * this.samplesPerFrame;
            this.metadata.setFormat("numberOfSamples", numberOfSamples);
            if (this.metadata.format.sampleRate) {
              const duration = numberOfSamples / this.metadata.format.sampleRate;
              debug(`Calculate duration at EOF: ${duration} sec.`, duration);
              this.metadata.setFormat("duration", duration);
            }
          }
        }
      } else {
        throw err;
      }
    }
  }
  /**
   * Called after file has been fully parsed, this allows, if present, to exclude the ID3v1.1 header length
   */
  finalize() {
    const format = this.metadata.format;
    const hasID3v1 = !!this.metadata.native.ID3v1;
    if (this.mpegOffset !== null) {
      if (format.duration && this.tokenizer.fileInfo.size) {
        const mpegSize = this.tokenizer.fileInfo.size - this.mpegOffset - (hasID3v1 ? 128 : 0);
        if (format.codecProfile && format.codecProfile[0] === "V") {
          this.metadata.setFormat("bitrate", mpegSize * 8 / format.duration);
        }
      }
      if (this.tokenizer.fileInfo.size && format.codecProfile === "CBR") {
        const mpegSize = this.tokenizer.fileInfo.size - this.mpegOffset - (hasID3v1 ? 128 : 0);
        if (this.frame_size !== null && this.samplesPerFrame !== null) {
          const numberOfSamples = Math.round(mpegSize / this.frame_size) * this.samplesPerFrame;
          this.metadata.setFormat("numberOfSamples", numberOfSamples);
          if (format.sampleRate && !format.duration) {
            const duration = numberOfSamples / format.sampleRate;
            debug("Calculate CBR duration based on file size: %s", duration);
            this.metadata.setFormat("duration", duration);
          }
        }
      }
    }
  }
  async sync() {
    let gotFirstSync = false;
    while (true) {
      let bo = 0;
      this.syncPeek.len = await this.tokenizer.peekBuffer(this.syncPeek.buf, { length: maxPeekLen, mayBeLess: true });
      if (this.syncPeek.len <= 163) {
        throw new main.EndOfStreamError();
      }
      while (true) {
        if (gotFirstSync && (this.syncPeek.buf[bo] & 224) === 224) {
          this.buf_frame_header[0] = MpegFrameHeader.SyncByte1;
          this.buf_frame_header[1] = this.syncPeek.buf[bo];
          await this.tokenizer.ignore(bo);
          debug(`Sync at offset=${this.tokenizer.position - 1}, frameCount=${this.frameCount}`);
          if (this.syncFrameCount === this.frameCount) {
            debug(`Re-synced MPEG stream, frameCount=${this.frameCount}`);
            this.frameCount = 0;
            this.frame_size = 0;
          }
          this.syncFrameCount = this.frameCount;
          return;
        }
        gotFirstSync = false;
        bo = this.syncPeek.buf.indexOf(MpegFrameHeader.SyncByte1, bo);
        if (bo === -1) {
          if (this.syncPeek.len < this.syncPeek.buf.length) {
            throw new main.EndOfStreamError();
          }
          await this.tokenizer.ignore(this.syncPeek.len);
          break;
        }
        ++bo;
        gotFirstSync = true;
      }
    }
  }
  /**
   * Combined ADTS & MPEG (MP2 & MP3) header handling
   * @return {Promise<boolean>} true if parser should quit
   */
  async parseCommonMpegHeader() {
    if (this.frameCount === 0) {
      this.mpegOffset = this.tokenizer.position - 1;
    }
    await this.tokenizer.peekBuffer(this.buf_frame_header.subarray(1), { length: 3 });
    let header;
    try {
      header = FrameHeader.get(this.buf_frame_header, 0);
    } catch (err) {
      await this.tokenizer.ignore(1);
      if (err instanceof Error) {
        this.metadata.addWarning(`Parse error: ${err.message}`);
        return false;
      }
      throw err;
    }
    await this.tokenizer.ignore(3);
    this.metadata.setFormat("container", header.container);
    this.metadata.setFormat("codec", header.codec);
    this.metadata.setFormat("lossless", false);
    this.metadata.setFormat("sampleRate", header.samplingRate);
    this.frameCount++;
    return header.version !== null && header.version >= 2 && header.layer === 0 ? this.parseAdts(header) : this.parseAudioFrameHeader(header);
  }
  /**
   * @return {Promise<boolean>} true if parser should quit
   */
  async parseAudioFrameHeader(header) {
    this.metadata.setFormat("numberOfChannels", header.channelMode === "mono" ? 1 : 2);
    this.metadata.setFormat("bitrate", header.bitrate);
    if (this.frameCount < 20 * 1e4) {
      debug("offset=%s MP%s bitrate=%s sample-rate=%s", this.tokenizer.position - 4, header.layer, header.bitrate, header.samplingRate);
    }
    const slot_size = header.calcSlotSize();
    if (slot_size === null) {
      throw new MpegContentError("invalid slot_size");
    }
    const samples_per_frame = header.calcSamplesPerFrame();
    debug(`samples_per_frame=${samples_per_frame}`);
    const bps = samples_per_frame / 8;
    if (header.bitrate !== null && header.samplingRate != null) {
      const fsize = bps * header.bitrate / header.samplingRate + (header.padding ? slot_size : 0);
      this.frame_size = Math.floor(fsize);
    }
    this.audioFrameHeader = header;
    if (header.bitrate !== null) {
      this.bitrates.push(header.bitrate);
    }
    if (this.frameCount === 1) {
      this.offset = FrameHeader.len;
      await this.skipSideInformation();
      return false;
    }
    if (this.frameCount === 4) {
      if (this.areAllSame(this.bitrates)) {
        this.samplesPerFrame = samples_per_frame;
        this.metadata.setFormat("codecProfile", "CBR");
        if (this.tokenizer.fileInfo.size)
          return true;
      } else if (this.metadata.format.duration) {
        return true;
      }
      if (!this.options.duration) {
        return true;
      }
    }
    if (this.options.duration && this.frameCount === 4) {
      this.samplesPerFrame = samples_per_frame;
      this.calculateEofDuration = true;
    }
    this.offset = 4;
    if (header.isProtectedByCRC) {
      await this.parseCrc();
      return false;
    }
    await this.skipSideInformation();
    return false;
  }
  async parseAdts(header) {
    const buf = new Uint8Array(3);
    await this.tokenizer.readBuffer(buf);
    header.frameLength += main.getBitAllignedNumber(buf, 0, 0, 11);
    this.totalDataLength += header.frameLength;
    this.samplesPerFrame = 1024;
    if (header.samplingRate !== null) {
      const framesPerSec = header.samplingRate / this.samplesPerFrame;
      const bytesPerFrame = this.frameCount === 0 ? 0 : this.totalDataLength / this.frameCount;
      const bitrate = 8 * bytesPerFrame * framesPerSec + 0.5;
      this.metadata.setFormat("bitrate", bitrate);
      debug(`frame-count=${this.frameCount}, size=${header.frameLength} bytes, bit-rate=${bitrate}`);
    }
    await this.tokenizer.ignore(header.frameLength > 7 ? header.frameLength - 7 : 1);
    if (this.frameCount === 3) {
      this.metadata.setFormat("codecProfile", header.codecProfile);
      if (header.mp4ChannelConfig) {
        this.metadata.setFormat("numberOfChannels", header.mp4ChannelConfig.length);
      }
      if (this.options.duration) {
        this.calculateEofDuration = true;
      } else {
        return true;
      }
    }
    return false;
  }
  async parseCrc() {
    this.crc = await this.tokenizer.readNumber(main.INT16_BE);
    this.offset += 2;
    return this.skipSideInformation();
  }
  async skipSideInformation() {
    if (this.audioFrameHeader) {
      const sideinfo_length = this.audioFrameHeader.calculateSideInfoLength();
      if (sideinfo_length !== null) {
        await this.tokenizer.readToken(new main.Uint8ArrayType(sideinfo_length));
        this.offset += sideinfo_length;
        await this.readXtraInfoHeader();
        return;
      }
    }
  }
  async readXtraInfoHeader() {
    const headerTag = await this.tokenizer.readToken(InfoTagHeaderTag);
    this.offset += InfoTagHeaderTag.len;
    switch (headerTag) {
      case "Info":
        this.metadata.setFormat("codecProfile", "CBR");
        return this.readXingInfoHeader();
      case "Xing": {
        const infoTag = await this.readXingInfoHeader();
        if (infoTag.vbrScale !== null) {
          const codecProfile = getVbrCodecProfile(infoTag.vbrScale);
          this.metadata.setFormat("codecProfile", codecProfile);
        }
        return null;
      }
      case "Xtra":
        break;
      case "LAME": {
        const version = await this.tokenizer.readToken(LameEncoderVersion);
        if (this.frame_size !== null && this.frame_size >= this.offset + LameEncoderVersion.len) {
          this.offset += LameEncoderVersion.len;
          this.metadata.setFormat("tool", `LAME ${version}`);
          await this.skipFrameData(this.frame_size - this.offset);
          return null;
        }
        this.metadata.addWarning("Corrupt LAME header");
        break;
      }
    }
    const frameDataLeft = this.frame_size - this.offset;
    if (frameDataLeft < 0) {
      this.metadata.addWarning(`Frame ${this.frameCount}corrupt: negative frameDataLeft`);
    } else {
      await this.skipFrameData(frameDataLeft);
    }
    return null;
  }
  /**
   * Ref: http://gabriel.mp3-tech.org/mp3infotag.html
   * @returns {Promise<string>}
   */
  async readXingInfoHeader() {
    const offset = this.tokenizer.position;
    const infoTag = await readXingHeader(this.tokenizer);
    this.offset += this.tokenizer.position - offset;
    if (infoTag.lame) {
      this.metadata.setFormat("tool", `LAME ${main.stripNulls(infoTag.lame.version)}`);
      if (infoTag.lame.extended) {
        this.metadata.setFormat("trackPeakLevel", infoTag.lame.extended.track_peak);
        if (infoTag.lame.extended.track_gain) {
          this.metadata.setFormat("trackGain", infoTag.lame.extended.track_gain.adjustment);
        }
        if (infoTag.lame.extended.album_gain) {
          this.metadata.setFormat("albumGain", infoTag.lame.extended.album_gain.adjustment);
        }
        this.metadata.setFormat("duration", infoTag.lame.extended.music_length / 1e3);
      }
    }
    if (infoTag.streamSize && this.audioFrameHeader && infoTag.numFrames !== null) {
      const duration = this.audioFrameHeader.calcDuration(infoTag.numFrames);
      this.metadata.setFormat("duration", duration);
      debug("Get duration from Xing header: %s", this.metadata.format.duration);
      return infoTag;
    }
    const frameDataLeft = this.frame_size - this.offset;
    await this.skipFrameData(frameDataLeft);
    return infoTag;
  }
  async skipFrameData(frameDataLeft) {
    if (frameDataLeft < 0)
      throw new MpegContentError("frame-data-left cannot be negative");
    await this.tokenizer.ignore(frameDataLeft);
    this.countSkipFrameData += frameDataLeft;
  }
  areAllSame(array) {
    const first = array[0];
    return array.every((element) => {
      return element === first;
    });
  }
}
exports.MpegContentError = MpegContentError;
exports.MpegParser = MpegParser;
