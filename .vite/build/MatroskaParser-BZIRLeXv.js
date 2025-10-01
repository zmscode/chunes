"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-zlywhVZr.js");
require("node:fs/promises");
const DataType = {
  string: 0,
  uint: 1,
  uid: 2,
  bool: 3,
  binary: 4,
  float: 5
};
const matroskaDtd = {
  name: "dtd",
  container: {
    440786851: {
      name: "ebml",
      container: {
        17030: { name: "ebmlVersion", value: DataType.uint },
        // 5.1.1
        17143: { name: "ebmlReadVersion", value: DataType.uint },
        // 5.1.2
        17138: { name: "ebmlMaxIDWidth", value: DataType.uint },
        // 5.1.3
        17139: { name: "ebmlMaxSizeWidth", value: DataType.uint },
        // 5.1.4
        17026: { name: "docType", value: DataType.string },
        // 5.1.5
        17031: { name: "docTypeVersion", value: DataType.uint },
        // 5.1.6
        17029: { name: "docTypeReadVersion", value: DataType.uint }
        // 5.1.7
      }
    },
    // Matroska segments
    408125543: {
      name: "segment",
      container: {
        // Meta Seek Information (also known as MetaSeek)
        290298740: {
          name: "seekHead",
          container: {
            19899: {
              name: "seek",
              multiple: true,
              container: {
                21419: { name: "id", value: DataType.binary },
                21420: { name: "position", value: DataType.uint }
              }
            }
          }
        },
        // Segment Information
        357149030: {
          name: "info",
          container: {
            29604: { name: "uid", value: DataType.uid },
            29572: { name: "filename", value: DataType.string },
            3979555: { name: "prevUID", value: DataType.uid },
            3965867: { name: "prevFilename", value: DataType.string },
            4110627: { name: "nextUID", value: DataType.uid },
            4096955: { name: "nextFilename", value: DataType.string },
            2807729: { name: "timecodeScale", value: DataType.uint },
            17545: { name: "duration", value: DataType.float },
            17505: { name: "dateUTC", value: DataType.uint },
            31657: { name: "title", value: DataType.string },
            19840: { name: "muxingApp", value: DataType.string },
            22337: { name: "writingApp", value: DataType.string }
          }
        },
        // Cluster
        524531317: {
          name: "cluster",
          multiple: true,
          container: {
            231: { name: "timecode", value: DataType.uid },
            22743: { name: "silentTracks ", multiple: true },
            167: { name: "position", value: DataType.uid },
            171: { name: "prevSize", value: DataType.uid },
            160: { name: "blockGroup" },
            163: { name: "simpleBlock" }
          }
        },
        // Track
        374648427: {
          name: "tracks",
          container: {
            174: {
              name: "entries",
              multiple: true,
              container: {
                215: { name: "trackNumber", value: DataType.uint },
                29637: { name: "uid", value: DataType.uid },
                131: { name: "trackType", value: DataType.uint },
                185: { name: "flagEnabled", value: DataType.bool },
                136: { name: "flagDefault", value: DataType.bool },
                21930: { name: "flagForced", value: DataType.bool },
                // extended
                156: { name: "flagLacing", value: DataType.bool },
                28135: { name: "minCache", value: DataType.uint },
                28136: { name: "maxCache", value: DataType.uint },
                2352003: { name: "defaultDuration", value: DataType.uint },
                2306383: { name: "timecodeScale", value: DataType.float },
                21358: { name: "name", value: DataType.string },
                2274716: { name: "language", value: DataType.string },
                134: { name: "codecID", value: DataType.string },
                25506: { name: "codecPrivate", value: DataType.binary },
                2459272: { name: "codecName", value: DataType.string },
                3839639: { name: "codecSettings", value: DataType.string },
                3883072: { name: "codecInfoUrl", value: DataType.string },
                2536e3: { name: "codecDownloadUrl", value: DataType.string },
                170: { name: "codecDecodeAll", value: DataType.bool },
                28587: { name: "trackOverlay", value: DataType.uint },
                // Video
                224: {
                  name: "video",
                  container: {
                    154: { name: "flagInterlaced", value: DataType.bool },
                    21432: { name: "stereoMode", value: DataType.uint },
                    176: { name: "pixelWidth", value: DataType.uint },
                    186: { name: "pixelHeight", value: DataType.uint },
                    21680: { name: "displayWidth", value: DataType.uint },
                    21690: { name: "displayHeight", value: DataType.uint },
                    21683: { name: "aspectRatioType", value: DataType.uint },
                    3061028: { name: "colourSpace", value: DataType.uint },
                    3126563: { name: "gammaValue", value: DataType.float }
                  }
                },
                // Audio
                225: {
                  name: "audio",
                  container: {
                    181: { name: "samplingFrequency", value: DataType.float },
                    30901: { name: "outputSamplingFrequency", value: DataType.float },
                    159: { name: "channels", value: DataType.uint },
                    // https://www.matroska.org/technical/specs/index.html
                    148: { name: "channels", value: DataType.uint },
                    32123: { name: "channelPositions", value: DataType.binary },
                    25188: { name: "bitDepth", value: DataType.uint }
                  }
                },
                // Content Encoding
                28032: {
                  name: "contentEncodings",
                  container: {
                    25152: {
                      name: "contentEncoding",
                      container: {
                        20529: { name: "order", value: DataType.uint },
                        20530: { name: "scope", value: DataType.bool },
                        20531: { name: "type", value: DataType.uint },
                        20532: {
                          name: "contentEncoding",
                          container: {
                            16980: { name: "contentCompAlgo", value: DataType.uint },
                            16981: { name: "contentCompSettings", value: DataType.binary }
                          }
                        },
                        20533: {
                          name: "contentEncoding",
                          container: {
                            18401: { name: "contentEncAlgo", value: DataType.uint },
                            18402: { name: "contentEncKeyID", value: DataType.binary },
                            18403: { name: "contentSignature ", value: DataType.binary },
                            18404: { name: "ContentSigKeyID  ", value: DataType.binary },
                            18405: { name: "contentSigAlgo ", value: DataType.uint },
                            18406: { name: "contentSigHashAlgo ", value: DataType.uint }
                          }
                        },
                        25188: { name: "bitDepth", value: DataType.uint }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // Cueing Data
        475249515: {
          name: "cues",
          container: {
            187: {
              name: "cuePoint",
              container: {
                179: { name: "cueTime", value: DataType.uid },
                183: {
                  name: "positions",
                  container: {
                    247: { name: "track", value: DataType.uint },
                    241: { name: "clusterPosition", value: DataType.uint },
                    21368: { name: "blockNumber", value: DataType.uint },
                    234: { name: "codecState", value: DataType.uint },
                    219: {
                      name: "reference",
                      container: {
                        150: { name: "time", value: DataType.uint },
                        151: { name: "cluster", value: DataType.uint },
                        21343: { name: "number", value: DataType.uint },
                        235: { name: "codecState", value: DataType.uint }
                      }
                    },
                    240: { name: "relativePosition", value: DataType.uint }
                    // extended
                  }
                }
              }
            }
          }
        },
        // Attachment
        423732329: {
          name: "attachments",
          container: {
            24999: {
              name: "attachedFiles",
              multiple: true,
              container: {
                18046: { name: "description", value: DataType.string },
                18030: { name: "name", value: DataType.string },
                18016: { name: "mimeType", value: DataType.string },
                18012: { name: "data", value: DataType.binary },
                18094: { name: "uid", value: DataType.uid }
              }
            }
          }
        },
        // Chapters
        272869232: {
          name: "chapters",
          container: {
            17849: {
              name: "editionEntry",
              container: {
                182: {
                  name: "chapterAtom",
                  container: {
                    29636: { name: "uid", value: DataType.uid },
                    145: { name: "timeStart", value: DataType.uint },
                    146: { name: "timeEnd", value: DataType.uid },
                    152: { name: "hidden", value: DataType.bool },
                    17816: { name: "enabled", value: DataType.uid },
                    143: {
                      name: "track",
                      container: {
                        137: { name: "trackNumber", value: DataType.uid },
                        128: {
                          name: "display",
                          container: {
                            133: { name: "string", value: DataType.string },
                            17276: { name: "language ", value: DataType.string },
                            17278: { name: "country ", value: DataType.string }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // Tagging
        307544935: {
          name: "tags",
          container: {
            29555: {
              name: "tag",
              multiple: true,
              container: {
                25536: {
                  name: "target",
                  container: {
                    25541: { name: "tagTrackUID", value: DataType.uid },
                    25540: { name: "tagChapterUID", value: DataType.uint },
                    25542: { name: "tagAttachmentUID", value: DataType.uid },
                    25546: { name: "targetType", value: DataType.string },
                    // extended
                    26826: { name: "targetTypeValue", value: DataType.uint },
                    // extended
                    25545: { name: "tagEditionUID", value: DataType.uid }
                    // extended
                  }
                },
                26568: {
                  name: "simpleTags",
                  multiple: true,
                  container: {
                    17827: { name: "name", value: DataType.string },
                    17543: { name: "string", value: DataType.string },
                    17541: { name: "binary", value: DataType.binary },
                    17530: { name: "language", value: DataType.string },
                    // extended
                    17531: { name: "languageIETF", value: DataType.string },
                    // extended
                    17540: { name: "default", value: DataType.bool }
                    // extended
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
const debug$1 = main.initDebug("music-metadata:parser:ebml");
class EbmlContentError extends main.makeUnexpectedFileContentError("EBML") {
}
const ParseAction = {
  ReadNext: 0,
  // Continue reading the next elements
  IgnoreElement: 2,
  // Ignore (do not read) this element
  SkipSiblings: 3,
  // Skip all remaining elements at the same level
  TerminateParsing: 4,
  // Terminate the parsing process
  SkipElement: 5
  // Consider the element has read, assume position is at the next element
};
class EbmlIterator {
  /**
   * @param {ITokenizer} tokenizer Input
   * @param tokenizer
   */
  constructor(tokenizer) {
    this.padding = 0;
    this.parserMap = /* @__PURE__ */ new Map();
    this.ebmlMaxIDLength = 4;
    this.ebmlMaxSizeLength = 8;
    this.tokenizer = tokenizer;
    this.parserMap.set(DataType.uint, (e) => this.readUint(e));
    this.parserMap.set(DataType.string, (e) => this.readString(e));
    this.parserMap.set(DataType.binary, (e) => this.readBuffer(e));
    this.parserMap.set(DataType.uid, async (e) => this.readBuffer(e));
    this.parserMap.set(DataType.bool, (e) => this.readFlag(e));
    this.parserMap.set(DataType.float, (e) => this.readFloat(e));
  }
  async iterate(dtdElement, posDone, listener) {
    return this.parseContainer(linkParents(dtdElement), posDone, listener);
  }
  async parseContainer(dtdElement, posDone, listener) {
    const tree = {};
    while (this.tokenizer.position < posDone) {
      let element;
      const elementPosition = this.tokenizer.position;
      try {
        element = await this.readElement();
      } catch (error) {
        if (error instanceof main.EndOfStreamError) {
          break;
        }
        throw error;
      }
      const child = dtdElement.container[element.id];
      if (child) {
        const action = listener.startNext(child);
        switch (action) {
          case ParseAction.ReadNext:
            {
              if (element.id === 524531317) ;
              debug$1(`Read element: name=${getElementPath(child)}{id=0x${element.id.toString(16)}, container=${!!child.container}} at position=${elementPosition}`);
              if (child.container) {
                const res = await this.parseContainer(child, element.len >= 0 ? this.tokenizer.position + element.len : -1, listener);
                if (child.multiple) {
                  if (!tree[child.name]) {
                    tree[child.name] = [];
                  }
                  tree[child.name].push(res);
                } else {
                  tree[child.name] = res;
                }
                await listener.elementValue(child, res, elementPosition);
              } else {
                const parser = this.parserMap.get(child.value);
                if (typeof parser === "function") {
                  const value = await parser(element);
                  tree[child.name] = value;
                  await listener.elementValue(child, value, elementPosition);
                }
              }
            }
            break;
          case ParseAction.SkipElement:
            debug$1(`Go to next element: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
            break;
          case ParseAction.IgnoreElement:
            debug$1(`Ignore element: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
            await this.tokenizer.ignore(element.len);
            break;
          case ParseAction.SkipSiblings:
            debug$1(`Ignore remaining container, at: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
            await this.tokenizer.ignore(posDone - this.tokenizer.position);
            break;
          case ParseAction.TerminateParsing:
            debug$1(`Terminate parsing at element: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
            return tree;
        }
      } else {
        switch (element.id) {
          case 236:
            this.padding += element.len;
            await this.tokenizer.ignore(element.len);
            break;
          default:
            debug$1(`parseEbml: parent=${getElementPath(dtdElement)}, unknown child: id=${element.id.toString(16)} at position=${elementPosition}`);
            this.padding += element.len;
            await this.tokenizer.ignore(element.len);
        }
      }
    }
    return tree;
  }
  async readVintData(maxLength) {
    const msb = await this.tokenizer.peekNumber(main.UINT8);
    let mask = 128;
    let oc = 1;
    while ((msb & mask) === 0) {
      if (oc > maxLength) {
        throw new EbmlContentError("VINT value exceeding maximum size");
      }
      ++oc;
      mask >>= 1;
    }
    const id = new Uint8Array(oc);
    await this.tokenizer.readBuffer(id);
    return id;
  }
  async readElement() {
    const id = await this.readVintData(this.ebmlMaxIDLength);
    const lenField = await this.readVintData(this.ebmlMaxSizeLength);
    lenField[0] ^= 128 >> lenField.length - 1;
    return {
      id: readUIntBE(id, id.length),
      len: readUIntBE(lenField, lenField.length)
    };
  }
  async readFloat(e) {
    switch (e.len) {
      case 0:
        return 0;
      case 4:
        return this.tokenizer.readNumber(main.Float32_BE);
      case 8:
        return this.tokenizer.readNumber(main.Float64_BE);
      case 10:
        return this.tokenizer.readNumber(main.Float64_BE);
      default:
        throw new EbmlContentError(`Invalid IEEE-754 float length: ${e.len}`);
    }
  }
  async readFlag(e) {
    return await this.readUint(e) === 1;
  }
  async readUint(e) {
    const buf = await this.readBuffer(e);
    return readUIntBE(buf, e.len);
  }
  async readString(e) {
    const rawString = await this.tokenizer.readToken(new main.StringType(e.len, "utf-8"));
    return rawString.replace(/\x00.*$/g, "");
  }
  async readBuffer(e) {
    const buf = new Uint8Array(e.len);
    await this.tokenizer.readBuffer(buf);
    return buf;
  }
}
function readUIntBE(buf, len) {
  return Number(readUIntBeAsBigInt(buf, len));
}
function readUIntBeAsBigInt(buf, len) {
  const normalizedNumber = new Uint8Array(8);
  const cleanNumber = buf.subarray(0, len);
  try {
    normalizedNumber.set(cleanNumber, 8 - len);
    return main.UINT64_BE.get(normalizedNumber, 0);
  } catch (_error) {
    return BigInt(-1);
  }
}
function linkParents(element) {
  if (element.container) {
    Object.keys(element.container).map((id) => {
      const child = element.container[id];
      child.id = Number.parseInt(id);
      return child;
    }).forEach((child) => {
      child.parent = element;
      linkParents(child);
    });
  }
  return element;
}
function getElementPath(element) {
  let path = "";
  if (element.parent && element.parent.name !== "dtd") {
    path += `${getElementPath(element.parent)}/`;
  }
  return path + element.name;
}
const debug = main.initDebug("music-metadata:parser:matroska");
class MatroskaParser extends main.BasicParser {
  constructor() {
    super(...arguments);
    this.seekHeadOffset = 0;
    this.flagUseIndexToSkipClusters = this.options.mkvUseIndex ?? false;
  }
  async parse() {
    const containerSize = this.tokenizer.fileInfo.size ?? Number.MAX_SAFE_INTEGER;
    const matroskaIterator = new EbmlIterator(this.tokenizer);
    debug("Initializing DTD end MatroskaIterator");
    await matroskaIterator.iterate(matroskaDtd, containerSize, {
      startNext: (element) => {
        switch (element.id) {
          // case 0x1f43b675: // cluster
          case 475249515:
            debug(`Skip element: name=${element.name}, id=0x${element.id.toString(16)}`);
            return ParseAction.IgnoreElement;
          case 524531317:
            if (this.flagUseIndexToSkipClusters && this.seekHead) {
              const index = this.seekHead.seek.find((index2) => index2.position + this.seekHeadOffset > this.tokenizer.position);
              if (index) {
                const ignoreSize = index.position + this.seekHeadOffset - this.tokenizer.position;
                debug(`Use index to go to next position, ignoring ${ignoreSize} bytes`);
                this.tokenizer.ignore(ignoreSize);
                return ParseAction.SkipElement;
              }
            }
            return ParseAction.IgnoreElement;
          default:
            return ParseAction.ReadNext;
        }
      },
      elementValue: async (element, value, offset) => {
        debug(`Received: name=${element.name}, value=${value}`);
        switch (element.id) {
          case 17026:
            this.metadata.setFormat("container", `EBML/${value}`);
            break;
          case 290298740:
            this.seekHead = value;
            this.seekHeadOffset = offset;
            break;
          case 357149030:
            {
              const info = value;
              const timecodeScale = info.timecodeScale ? info.timecodeScale : 1e6;
              if (typeof info.duration === "number") {
                const duration = info.duration * timecodeScale / 1e9;
                await this.addTag("segment:title", info.title);
                this.metadata.setFormat("duration", Number(duration));
              }
            }
            break;
          case 374648427:
            {
              const audioTracks = value;
              if (audioTracks?.entries) {
                audioTracks.entries.forEach((entry) => {
                  const stream = {
                    codecName: entry.codecID.replace("A_", "").replace("V_", ""),
                    codecSettings: entry.codecSettings,
                    flagDefault: entry.flagDefault,
                    flagLacing: entry.flagLacing,
                    flagEnabled: entry.flagEnabled,
                    language: entry.language,
                    name: entry.name,
                    type: entry.trackType,
                    audio: entry.audio,
                    video: entry.video
                  };
                  this.metadata.addStreamInfo(stream);
                });
                const audioTrack = audioTracks.entries.filter((entry) => entry.trackType === main.TrackType.audio).reduce((acc, cur) => {
                  if (!acc)
                    return cur;
                  if (cur.flagDefault && !acc.flagDefault)
                    return cur;
                  if (cur.trackNumber < acc.trackNumber)
                    return cur;
                  return acc;
                }, null);
                if (audioTrack) {
                  this.metadata.setFormat("codec", audioTrack.codecID.replace("A_", ""));
                  this.metadata.setFormat("sampleRate", audioTrack.audio.samplingFrequency);
                  this.metadata.setFormat("numberOfChannels", audioTrack.audio.channels);
                }
              }
            }
            break;
          case 307544935:
            {
              const tags = value;
              await Promise.all(tags.tag.map(async (tag) => {
                const target = tag.target;
                const targetType = target?.targetTypeValue ? main.TargetType[target.targetTypeValue] : target?.targetType ? target.targetType : "track";
                await Promise.all(tag.simpleTags.map(async (simpleTag) => {
                  const value2 = simpleTag.string ? simpleTag.string : simpleTag.binary;
                  await this.addTag(`${targetType}:${simpleTag.name}`, value2);
                }));
              }));
            }
            break;
          case 423732329:
            {
              const attachments = value;
              await Promise.all(attachments.attachedFiles.filter((file) => file.mimeType.startsWith("image/")).map((file) => this.addTag("picture", {
                data: file.data,
                format: file.mimeType,
                description: file.description,
                name: file.name
              })));
            }
            break;
        }
      }
    });
  }
  async addTag(tagId, value) {
    await this.metadata.addTag("matroska", tagId, value);
  }
}
exports.MatroskaParser = MatroskaParser;
