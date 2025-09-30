"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-vnI89Xz8.js");
class GUID {
  static fromBin(bin, offset = 0) {
    return new GUID(GUID.decode(bin, offset));
  }
  /**
   * Decode GUID in format like "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
   * @param objectId Binary GUID
   * @param offset Read offset in bytes, default 0
   * @returns GUID as dashed hexadecimal representation
   */
  static decode(objectId, offset = 0) {
    const view = new DataView(objectId.buffer, offset);
    const guid = `${view.getUint32(0, true).toString(16)}-${view.getUint16(4, true).toString(16)}-${view.getUint16(6, true).toString(16)}-${view.getUint16(8).toString(16)}-${main.uint8ArrayToHex(objectId.subarray(offset + 10, offset + 16))}`;
    return guid.toUpperCase();
  }
  /**
   * Decode stream type
   * @param mediaType Media type GUID
   * @returns Media type
   */
  static decodeMediaType(mediaType) {
    switch (mediaType.str) {
      case GUID.AudioMedia.str:
        return "audio";
      case GUID.VideoMedia.str:
        return "video";
      case GUID.CommandMedia.str:
        return "command";
      case GUID.Degradable_JPEG_Media.str:
        return "degradable-jpeg";
      case GUID.FileTransferMedia.str:
        return "file-transfer";
      case GUID.BinaryMedia.str:
        return "binary";
    }
  }
  /**
   * Encode GUID
   * @param guid GUID like: "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
   * @returns Encoded Binary GUID
   */
  static encode(str) {
    const bin = new Uint8Array(16);
    const view = new DataView(bin.buffer);
    view.setUint32(0, Number.parseInt(str.substring(0, 8), 16), true);
    view.setUint16(4, Number.parseInt(str.substring(9, 13), 16), true);
    view.setUint16(6, Number.parseInt(str.substring(14, 18), 16), true);
    bin.set(main.hexToUint8Array(str.substring(19, 23)), 8);
    bin.set(main.hexToUint8Array(str.substring(24)), 10);
    return bin;
  }
  constructor(str) {
    this.str = str;
  }
  equals(guid) {
    return this.str === guid.str;
  }
  toBin() {
    return GUID.encode(this.str);
  }
}
GUID.HeaderObject = new GUID("75B22630-668E-11CF-A6D9-00AA0062CE6C");
GUID.DataObject = new GUID("75B22636-668E-11CF-A6D9-00AA0062CE6C");
GUID.SimpleIndexObject = new GUID("33000890-E5B1-11CF-89F4-00A0C90349CB");
GUID.IndexObject = new GUID("D6E229D3-35DA-11D1-9034-00A0C90349BE");
GUID.MediaObjectIndexObject = new GUID("FEB103F8-12AD-4C64-840F-2A1D2F7AD48C");
GUID.TimecodeIndexObject = new GUID("3CB73FD0-0C4A-4803-953D-EDF7B6228F0C");
GUID.FilePropertiesObject = new GUID("8CABDCA1-A947-11CF-8EE4-00C00C205365");
GUID.StreamPropertiesObject = new GUID("B7DC0791-A9B7-11CF-8EE6-00C00C205365");
GUID.HeaderExtensionObject = new GUID("5FBF03B5-A92E-11CF-8EE3-00C00C205365");
GUID.CodecListObject = new GUID("86D15240-311D-11D0-A3A4-00A0C90348F6");
GUID.ScriptCommandObject = new GUID("1EFB1A30-0B62-11D0-A39B-00A0C90348F6");
GUID.MarkerObject = new GUID("F487CD01-A951-11CF-8EE6-00C00C205365");
GUID.BitrateMutualExclusionObject = new GUID("D6E229DC-35DA-11D1-9034-00A0C90349BE");
GUID.ErrorCorrectionObject = new GUID("75B22635-668E-11CF-A6D9-00AA0062CE6C");
GUID.ContentDescriptionObject = new GUID("75B22633-668E-11CF-A6D9-00AA0062CE6C");
GUID.ExtendedContentDescriptionObject = new GUID("D2D0A440-E307-11D2-97F0-00A0C95EA850");
GUID.ContentBrandingObject = new GUID("2211B3FA-BD23-11D2-B4B7-00A0C955FC6E");
GUID.StreamBitratePropertiesObject = new GUID("7BF875CE-468D-11D1-8D82-006097C9A2B2");
GUID.ContentEncryptionObject = new GUID("2211B3FB-BD23-11D2-B4B7-00A0C955FC6E");
GUID.ExtendedContentEncryptionObject = new GUID("298AE614-2622-4C17-B935-DAE07EE9289C");
GUID.DigitalSignatureObject = new GUID("2211B3FC-BD23-11D2-B4B7-00A0C955FC6E");
GUID.PaddingObject = new GUID("1806D474-CADF-4509-A4BA-9AABCB96AAE8");
GUID.ExtendedStreamPropertiesObject = new GUID("14E6A5CB-C672-4332-8399-A96952065B5A");
GUID.AdvancedMutualExclusionObject = new GUID("A08649CF-4775-4670-8A16-6E35357566CD");
GUID.GroupMutualExclusionObject = new GUID("D1465A40-5A79-4338-B71B-E36B8FD6C249");
GUID.StreamPrioritizationObject = new GUID("D4FED15B-88D3-454F-81F0-ED5C45999E24");
GUID.BandwidthSharingObject = new GUID("A69609E6-517B-11D2-B6AF-00C04FD908E9");
GUID.LanguageListObject = new GUID("7C4346A9-EFE0-4BFC-B229-393EDE415C85");
GUID.MetadataObject = new GUID("C5F8CBEA-5BAF-4877-8467-AA8C44FA4CCA");
GUID.MetadataLibraryObject = new GUID("44231C94-9498-49D1-A141-1D134E457054");
GUID.IndexParametersObject = new GUID("D6E229DF-35DA-11D1-9034-00A0C90349BE");
GUID.MediaObjectIndexParametersObject = new GUID("6B203BAD-3F11-48E4-ACA8-D7613DE2CFA7");
GUID.TimecodeIndexParametersObject = new GUID("F55E496D-9797-4B5D-8C8B-604DFE9BFB24");
GUID.CompatibilityObject = new GUID("26F18B5D-4584-47EC-9F5F-0E651F0452C9");
GUID.AdvancedContentEncryptionObject = new GUID("43058533-6981-49E6-9B74-AD12CB86D58C");
GUID.AudioMedia = new GUID("F8699E40-5B4D-11CF-A8FD-00805F5C442B");
GUID.VideoMedia = new GUID("BC19EFC0-5B4D-11CF-A8FD-00805F5C442B");
GUID.CommandMedia = new GUID("59DACFC0-59E6-11D0-A3AC-00A0C90348F6");
GUID.JFIF_Media = new GUID("B61BE100-5B4E-11CF-A8FD-00805F5C442B");
GUID.Degradable_JPEG_Media = new GUID("35907DE0-E415-11CF-A917-00805F5C442B");
GUID.FileTransferMedia = new GUID("91BD222C-F21C-497A-8B6D-5AA86BFC0185");
GUID.BinaryMedia = new GUID("3AFB65E2-47EF-40F2-AC2C-70A90D71D343");
GUID.ASF_Index_Placeholder_Object = new GUID("D9AADE20-7C17-4F9C-BC28-8555DD98E2A2");
function getParserForAttr(i) {
  return attributeParsers[i];
}
function parseUnicodeAttr(uint8Array) {
  return main.stripNulls(main.decodeString(uint8Array, "utf-16le"));
}
const attributeParsers = [
  parseUnicodeAttr,
  parseByteArrayAttr,
  parseBoolAttr,
  parseDWordAttr,
  parseQWordAttr,
  parseWordAttr,
  parseByteArrayAttr
];
function parseByteArrayAttr(buf) {
  return new Uint8Array(buf);
}
function parseBoolAttr(buf, offset = 0) {
  return parseWordAttr(buf, offset) === 1;
}
function parseDWordAttr(buf, offset = 0) {
  return main.UINT32_LE.get(buf, offset);
}
function parseQWordAttr(buf, offset = 0) {
  return main.UINT64_LE.get(buf, offset);
}
function parseWordAttr(buf, offset = 0) {
  return main.UINT16_LE.get(buf, offset);
}
class AsfContentParseError extends main.makeUnexpectedFileContentError("ASF") {
}
const TopLevelHeaderObjectToken = {
  len: 30,
  get: (buf, off) => {
    return {
      objectId: GUID.fromBin(buf, off),
      objectSize: Number(main.UINT64_LE.get(buf, off + 16)),
      numberOfHeaderObjects: main.UINT32_LE.get(buf, off + 24)
      // Reserved: 2 bytes
    };
  }
};
const HeaderObjectToken = {
  len: 24,
  get: (buf, off) => {
    return {
      objectId: GUID.fromBin(buf, off),
      objectSize: Number(main.UINT64_LE.get(buf, off + 16))
    };
  }
};
class State {
  constructor(header) {
    this.len = Number(header.objectSize) - HeaderObjectToken.len;
  }
  postProcessTag(tags, name, valueType, data) {
    if (name === "WM/Picture") {
      tags.push({ id: name, value: WmPictureToken.fromBuffer(data) });
    } else {
      const parseAttr = getParserForAttr(valueType);
      if (!parseAttr) {
        throw new AsfContentParseError(`unexpected value headerType: ${valueType}`);
      }
      tags.push({ id: name, value: parseAttr(data) });
    }
  }
}
class IgnoreObjectState extends State {
  get(_buf, _off) {
    return null;
  }
}
class FilePropertiesObject extends State {
  get(buf, off) {
    return {
      fileId: GUID.fromBin(buf, off),
      fileSize: main.UINT64_LE.get(buf, off + 16),
      creationDate: main.UINT64_LE.get(buf, off + 24),
      dataPacketsCount: main.UINT64_LE.get(buf, off + 32),
      playDuration: main.UINT64_LE.get(buf, off + 40),
      sendDuration: main.UINT64_LE.get(buf, off + 48),
      preroll: main.UINT64_LE.get(buf, off + 56),
      flags: {
        broadcast: main.getBit(buf, off + 64, 24),
        seekable: main.getBit(buf, off + 64, 25)
      },
      // flagsNumeric: Token.UINT32_LE.get(buf, off + 64),
      minimumDataPacketSize: main.UINT32_LE.get(buf, off + 68),
      maximumDataPacketSize: main.UINT32_LE.get(buf, off + 72),
      maximumBitrate: main.UINT32_LE.get(buf, off + 76)
    };
  }
}
FilePropertiesObject.guid = GUID.FilePropertiesObject;
class StreamPropertiesObject extends State {
  get(buf, off) {
    return {
      streamType: GUID.decodeMediaType(GUID.fromBin(buf, off)),
      errorCorrectionType: GUID.fromBin(buf, off + 8)
      // ToDo
    };
  }
}
StreamPropertiesObject.guid = GUID.StreamPropertiesObject;
class HeaderExtensionObject {
  constructor() {
    this.len = 22;
  }
  get(buf, off) {
    const view = new DataView(buf.buffer, off);
    return {
      reserved1: GUID.fromBin(buf, off),
      reserved2: view.getUint16(16, true),
      extensionDataSize: view.getUint16(18, true)
    };
  }
}
HeaderExtensionObject.guid = GUID.HeaderExtensionObject;
const CodecListObjectHeader = {
  len: 20,
  get: (buf, off) => {
    const view = new DataView(buf.buffer, off);
    return {
      entryCount: view.getUint16(16, true)
    };
  }
};
async function readString(tokenizer) {
  const length = await tokenizer.readNumber(main.UINT16_LE);
  return (await tokenizer.readToken(new main.StringType(length * 2, "utf-16le"))).replace("\0", "");
}
async function readCodecEntries(tokenizer) {
  const codecHeader = await tokenizer.readToken(CodecListObjectHeader);
  const entries = [];
  for (let i = 0; i < codecHeader.entryCount; ++i) {
    entries.push(await readCodecEntry(tokenizer));
  }
  return entries;
}
async function readInformation(tokenizer) {
  const length = await tokenizer.readNumber(main.UINT16_LE);
  const buf = new Uint8Array(length);
  await tokenizer.readBuffer(buf);
  return buf;
}
async function readCodecEntry(tokenizer) {
  const type = await tokenizer.readNumber(main.UINT16_LE);
  return {
    type: {
      videoCodec: (type & 1) === 1,
      audioCodec: (type & 2) === 2
    },
    codecName: await readString(tokenizer),
    description: await readString(tokenizer),
    information: await readInformation(tokenizer)
  };
}
class ContentDescriptionObjectState extends State {
  get(buf, off) {
    const tags = [];
    const view = new DataView(buf.buffer, off);
    let pos = 10;
    for (let i = 0; i < ContentDescriptionObjectState.contentDescTags.length; ++i) {
      const length = view.getUint16(i * 2, true);
      if (length > 0) {
        const tagName = ContentDescriptionObjectState.contentDescTags[i];
        const end = pos + length;
        tags.push({ id: tagName, value: parseUnicodeAttr(buf.subarray(off + pos, off + end)) });
        pos = end;
      }
    }
    return tags;
  }
}
ContentDescriptionObjectState.guid = GUID.ContentDescriptionObject;
ContentDescriptionObjectState.contentDescTags = ["Title", "Author", "Copyright", "Description", "Rating"];
class ExtendedContentDescriptionObjectState extends State {
  get(buf, off) {
    const tags = [];
    const view = new DataView(buf.buffer, off);
    const attrCount = view.getUint16(0, true);
    let pos = 2;
    for (let i = 0; i < attrCount; i += 1) {
      const nameLen = view.getUint16(pos, true);
      pos += 2;
      const name = parseUnicodeAttr(buf.subarray(off + pos, off + pos + nameLen));
      pos += nameLen;
      const valueType = view.getUint16(pos, true);
      pos += 2;
      const valueLen = view.getUint16(pos, true);
      pos += 2;
      const value = buf.subarray(off + pos, off + pos + valueLen);
      pos += valueLen;
      this.postProcessTag(tags, name, valueType, value);
    }
    return tags;
  }
}
ExtendedContentDescriptionObjectState.guid = GUID.ExtendedContentDescriptionObject;
class ExtendedStreamPropertiesObjectState extends State {
  get(buf, off) {
    const view = new DataView(buf.buffer, off);
    return {
      startTime: main.UINT64_LE.get(buf, off),
      endTime: main.UINT64_LE.get(buf, off + 8),
      dataBitrate: view.getInt32(12, true),
      bufferSize: view.getInt32(16, true),
      initialBufferFullness: view.getInt32(20, true),
      alternateDataBitrate: view.getInt32(24, true),
      alternateBufferSize: view.getInt32(28, true),
      alternateInitialBufferFullness: view.getInt32(32, true),
      maximumObjectSize: view.getInt32(36, true),
      flags: {
        reliableFlag: main.getBit(buf, off + 40, 0),
        seekableFlag: main.getBit(buf, off + 40, 1),
        resendLiveCleanpointsFlag: main.getBit(buf, off + 40, 2)
      },
      // flagsNumeric: Token.UINT32_LE.get(buf, off + 64),
      streamNumber: view.getInt16(42, true),
      streamLanguageId: view.getInt16(44, true),
      averageTimePerFrame: view.getInt32(52, true),
      streamNameCount: view.getInt32(54, true),
      payloadExtensionSystems: view.getInt32(56, true),
      streamNames: [],
      // ToDo
      streamPropertiesObject: null
    };
  }
}
ExtendedStreamPropertiesObjectState.guid = GUID.ExtendedStreamPropertiesObject;
class MetadataObjectState extends State {
  get(uint8Array, off) {
    const tags = [];
    const view = new DataView(uint8Array.buffer, off);
    const descriptionRecordsCount = view.getUint16(0, true);
    let pos = 2;
    for (let i = 0; i < descriptionRecordsCount; i += 1) {
      pos += 4;
      const nameLen = view.getUint16(pos, true);
      pos += 2;
      const dataType = view.getUint16(pos, true);
      pos += 2;
      const dataLen = view.getUint32(pos, true);
      pos += 4;
      const name = parseUnicodeAttr(uint8Array.subarray(off + pos, off + pos + nameLen));
      pos += nameLen;
      const data = uint8Array.subarray(off + pos, off + pos + dataLen);
      pos += dataLen;
      this.postProcessTag(tags, name, dataType, data);
    }
    return tags;
  }
}
MetadataObjectState.guid = GUID.MetadataObject;
class MetadataLibraryObjectState extends MetadataObjectState {
}
MetadataLibraryObjectState.guid = GUID.MetadataLibraryObject;
class WmPictureToken {
  static fromBuffer(buffer) {
    const pic = new WmPictureToken(buffer.length);
    return pic.get(buffer, 0);
  }
  constructor(len) {
    this.len = len;
  }
  get(buffer, offset) {
    const view = new DataView(buffer.buffer, offset);
    const typeId = view.getUint8(0);
    const size = view.getInt32(1, true);
    let index = 5;
    while (view.getUint16(index) !== 0) {
      index += 2;
    }
    const format = new main.StringType(index - 5, "utf-16le").get(buffer, 5);
    while (view.getUint16(index) !== 0) {
      index += 2;
    }
    const description = new main.StringType(index - 5, "utf-16le").get(buffer, 5);
    return {
      type: main.AttachedPictureType[typeId],
      format,
      description,
      size,
      data: buffer.slice(index + 4)
    };
  }
}
const debug = main.initDebug("music-metadata:parser:ASF");
const headerType = "asf";
class AsfParser extends main.BasicParser {
  async parse() {
    const header = await this.tokenizer.readToken(TopLevelHeaderObjectToken);
    if (!header.objectId.equals(GUID.HeaderObject)) {
      throw new AsfContentParseError(`expected asf header; but was not found; got: ${header.objectId.str}`);
    }
    try {
      await this.parseObjectHeader(header.numberOfHeaderObjects);
    } catch (err) {
      debug("Error while parsing ASF: %s", err);
    }
  }
  async parseObjectHeader(numberOfObjectHeaders) {
    let tags;
    do {
      const header = await this.tokenizer.readToken(HeaderObjectToken);
      debug("header GUID=%s", header.objectId.str);
      switch (header.objectId.str) {
        case FilePropertiesObject.guid.str: {
          const fpo = await this.tokenizer.readToken(new FilePropertiesObject(header));
          this.metadata.setFormat("duration", Number(fpo.playDuration / BigInt(1e3)) / 1e4 - Number(fpo.preroll) / 1e3);
          this.metadata.setFormat("bitrate", fpo.maximumBitrate);
          break;
        }
        case StreamPropertiesObject.guid.str: {
          const spo = await this.tokenizer.readToken(new StreamPropertiesObject(header));
          this.metadata.setFormat("container", `ASF/${spo.streamType}`);
          break;
        }
        case HeaderExtensionObject.guid.str: {
          const extHeader = await this.tokenizer.readToken(new HeaderExtensionObject());
          await this.parseExtensionObject(extHeader.extensionDataSize);
          break;
        }
        case ContentDescriptionObjectState.guid.str:
          tags = await this.tokenizer.readToken(new ContentDescriptionObjectState(header));
          await this.addTags(tags);
          break;
        case ExtendedContentDescriptionObjectState.guid.str:
          tags = await this.tokenizer.readToken(new ExtendedContentDescriptionObjectState(header));
          await this.addTags(tags);
          break;
        case GUID.CodecListObject.str: {
          const codecs = await readCodecEntries(this.tokenizer);
          codecs.forEach((codec) => {
            this.metadata.addStreamInfo({
              type: codec.type.videoCodec ? main.TrackType.video : main.TrackType.audio,
              codecName: codec.codecName
            });
          });
          const audioCodecs = codecs.filter((codec) => codec.type.audioCodec).map((codec) => codec.codecName).join("/");
          this.metadata.setFormat("codec", audioCodecs);
          break;
        }
        case GUID.StreamBitratePropertiesObject.str:
          await this.tokenizer.ignore(header.objectSize - HeaderObjectToken.len);
          break;
        case GUID.PaddingObject.str:
          debug("Padding: %s bytes", header.objectSize - HeaderObjectToken.len);
          await this.tokenizer.ignore(header.objectSize - HeaderObjectToken.len);
          break;
        default:
          this.metadata.addWarning(`Ignore ASF-Object-GUID: ${header.objectId.str}`);
          debug("Ignore ASF-Object-GUID: %s", header.objectId.str);
          await this.tokenizer.readToken(new IgnoreObjectState(header));
      }
    } while (--numberOfObjectHeaders);
  }
  async addTags(tags) {
    await Promise.all(tags.map(({ id, value }) => this.metadata.addTag(headerType, id, value)));
  }
  async parseExtensionObject(extensionSize) {
    do {
      const header = await this.tokenizer.readToken(HeaderObjectToken);
      const remaining = header.objectSize - HeaderObjectToken.len;
      switch (header.objectId.str) {
        case ExtendedStreamPropertiesObjectState.guid.str:
          await this.tokenizer.readToken(new ExtendedStreamPropertiesObjectState(header));
          break;
        case MetadataObjectState.guid.str: {
          const moTags = await this.tokenizer.readToken(new MetadataObjectState(header));
          await this.addTags(moTags);
          break;
        }
        case MetadataLibraryObjectState.guid.str: {
          const mlTags = await this.tokenizer.readToken(new MetadataLibraryObjectState(header));
          await this.addTags(mlTags);
          break;
        }
        case GUID.PaddingObject.str:
          await this.tokenizer.ignore(remaining);
          break;
        case GUID.CompatibilityObject.str:
          await this.tokenizer.ignore(remaining);
          break;
        case GUID.ASF_Index_Placeholder_Object.str:
          await this.tokenizer.ignore(remaining);
          break;
        default:
          this.metadata.addWarning(`Ignore ASF-Object-GUID: ${header.objectId.str}`);
          await this.tokenizer.readToken(new IgnoreObjectState(header));
          break;
      }
      extensionSize -= header.objectSize;
    } while (extensionSize > 0);
  }
}
exports.AsfParser = AsfParser;
