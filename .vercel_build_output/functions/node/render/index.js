var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    if (error2 instanceof FetchBaseError) {
      throw error2;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error2) {
                reject(error2);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
        reject(error2);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
          reject(error2);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error2) => {
              reject(error2);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error2) => {
              reject(error2);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error2 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-vercel/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-vercel/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// .svelte-kit/vercel/entry.js
__export(exports, {
  default: () => entry_default
});
init_shims();

// node_modules/@sveltejs/kit/dist/node.js
init_shims();
function getRawBody(req) {
  return new Promise((fulfil, reject) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil(null);
    }
    req.on("error", reject);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil(null);
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject({
            status: 413,
            reason: 'Exceeded "Content-Length" limit'
          });
        }
        data.set(chunk, offset);
        offset = new_len;
      });
    } else {
      req.on("data", (chunk) => {
        const new_data = new Uint8Array(data.length + chunk.length);
        new_data.set(data, 0);
        new_data.set(chunk, data.length);
        data = new_data;
      });
    }
    req.on("end", () => {
      fulfil(data);
    });
  });
}

// .svelte-kit/output/server/app.js
init_shims();
var import_cookie = __toModule(require_cookie());

// node_modules/@lukeed/uuid/dist/index.mjs
init_shims();
var IDX = 256;
var HEX = [];
var BUFFER;
while (IDX--)
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
function v4() {
  var i = 0, num, out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = Array(i = 256);
    while (i--)
      BUFFER[i] = 256 * Math.random() | 0;
    i = IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i == 6)
      out += HEX[num & 15 | 64];
    else if (i == 8)
      out += HEX[num & 63 | 128];
    else
      out += HEX[num];
    if (i & 1 && i > 1 && i < 11)
      out += "-";
  }
  IDX++;
  return out;
}

// .svelte-kit/output/server/app.js
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped$2 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    });
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$9 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$9);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve2 }) => {
  const cookies = import_cookie.default.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<link rel="preconnect" href="https://fonts.googleapis.com">\n		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n		<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;600;700&display=swap" rel="stylesheet">\n	  \n		<link rel="manifest" href="/manifest.webmanifest">\n		<script async src="https://cdn.splitbee.io/sb.js"><\/script>\n		<meta charset="utf-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		<link\n      rel="apple-touch-icon"\n      sizes="192x192"\n      href="./favicon.png"\n    />\n    <link\n      rel="icon"\n      type="image/png"\n      sizes="32x32"\n      href="./favicon.png"\n    />\n    <link\n      rel="icon"\n      type="image/png"\n      sizes="16x16"\n      href="./favicon.png"\n    />\n\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-dfb2dde9.js",
      css: [assets + "/_app/assets/start-61d1577b.css", assets + "/_app/assets/vendor-5e1fe644.css"],
      js: [assets + "/_app/start-dfb2dde9.js", assets + "/_app/chunks/vendor-9bf41ffa.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "assets/meta_image.jpg", "size": 356607, "type": "image/jpeg" }, { "file": "favicon.png", "size": 53477, "type": "image/png" }, { "file": "manifest.webmanifest", "size": 352, "type": "application/manifest+json" }, { "file": "robots.txt", "size": 22, "type": "text/plain" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/listados\/?$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/listados.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/listados.svelte": () => Promise.resolve().then(function() {
    return listados;
  })
};
var metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-7b6945df.js", "css": ["assets/vendor-5e1fe644.css"], "js": ["layout.svelte-7b6945df.js", "chunks/vendor-9bf41ffa.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-dbdc2db2.js", "css": ["assets/vendor-5e1fe644.css"], "js": ["error.svelte-dbdc2db2.js", "chunks/vendor-9bf41ffa.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-9e4816fb.js", "css": ["assets/pages/index.svelte-d63c7bbb.css", "assets/vendor-5e1fe644.css", "assets/Cafecito-7421eca2.css"], "js": ["pages/index.svelte-9e4816fb.js", "chunks/vendor-9bf41ffa.js", "chunks/Cafecito-2de0e3b7.js"], "styles": [] }, "src/routes/listados.svelte": { "entry": "pages/listados.svelte-fa3fe620.js", "css": ["assets/pages/listados.svelte-01450a1f.css", "assets/vendor-5e1fe644.css", "assets/Cafecito-7421eca2.css"], "js": ["pages/listados.svelte-fa3fe620.js", "chunks/vendor-9bf41ffa.js", "chunks/Cafecito-2de0e3b7.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var StarOutline = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { size = "1em" } = $$props;
  let { width = size } = $$props;
  let { height = size } = $$props;
  let { color = "currentColor" } = $$props;
  let { viewBox = "0 0 24 24" } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.viewBox === void 0 && $$bindings.viewBox && viewBox !== void 0)
    $$bindings.viewBox(viewBox);
  return `<svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("viewBox", viewBox, 0)}><path d="${"M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"}"${add_attribute("fill", color, 0)}></path></svg>`;
});
var Star = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { size = "1em" } = $$props;
  let { width = size } = $$props;
  let { height = size } = $$props;
  let { color = "currentColor" } = $$props;
  let { viewBox = "0 0 24 24" } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.viewBox === void 0 && $$bindings.viewBox && viewBox !== void 0)
    $$bindings.viewBox(viewBox);
  return `<svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("viewBox", viewBox, 0)}><path d="${"M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"}"${add_attribute("fill", color, 0)}></path></svg>`;
});
var css$8 = {
  code: 'div.svelte-13aeabl{border-radius:5px;margin-bottom:3rem}table.svelte-13aeabl{font-family:"Nunito", sans-serif;border:none;border-collapse:collapse;min-width:100%}th.svelte-13aeabl{background-color:black;color:white;box-sizing:border-box;padding:1rem;text-align:left}td.svelte-13aeabl{border-bottom:1px solid #eff2f5;padding:0.8rem 1rem;font-weight:600}td.svelte-13aeabl:nth-child(6){text-align:right}.red.svelte-13aeabl{color:red}.green.svelte-13aeabl{color:green}img.svelte-13aeabl{border-radius:50%;max-height:1.5rem}tr.svelte-13aeabl:hover{background-color:#eff2f5}',
  map: '{"version":3,"file":"Tabla.svelte","sources":["Tabla.svelte"],"sourcesContent":["<script>\\n  import StarOutline from \\"svelte-material-icons/StarOutline.svelte\\";\\n  import Star from \\"svelte-material-icons/Star.svelte\\";\\n\\n  import { createEventDispatcher } from \\"svelte\\";\\n  const dispatch = createEventDispatcher();\\n  export let data;\\n  export let columns;\\n  export let watchlist;\\n\\n  $: priorityData = data.filter((row) => watchlist.includes(row.symbol));\\n  $: lowPriorityData = data.filter((row) => !watchlist.includes(row.symbol));\\n\\n\\n  function watchlisted(symbol) {\\n    console.log(\\"Watchlisted \\" + symbol);\\n    dispatch(\\"watchlisted\\", {\\n      symbol,\\n    });\\n  }\\n\\n  \\n  function unwatchlist(symbol) {\\n    console.log(\\"unWatchlisted \\" + symbol);\\n    dispatch(\\"unwatchlisted\\", {\\n      symbol,\\n    });\\n  }\\n<\/script>\\n\\n<div style=\\"overflow-x:auto;\\">\\n  <table>\\n    <tr>\\n      {#each columns as column, index}\\n        <th>{column}</th>\\n      {/each}\\n    </tr>\\n    {#each priorityData as row, index}\\n    <tr>\\n      {#if watchlist.includes(row.symbol)}\\n        <td on:click=\\"{unwatchlist(row.symbol)}\\"><Star color=\\"#EA5525\\" size=\\"1.3rem\\" /></td>\\n      {:else}\\n        <td on:click={watchlisted(row.symbol)}\\n          ><StarOutline size=\\"1.3rem\\" /></td\\n        >\\n      {/if}\\n      <td>\\n        <img src={row.image} loading=\\"lazy\\" alt={row.name} />\\n      </td>\\n      <td>{row.symbol}</td>\\n      <td>{row.name}</td>\\n      <td>{row.price}</td>\\n      <td class={parseFloat(row.change) < 0 ? \\"red\\" : \\"green\\"}\\n        >{row.change}</td\\n      >\\n    </tr>\\n  {/each}\\n    {#each lowPriorityData as row, index}\\n      <tr>\\n        {#if watchlist.includes(row.symbol)}\\n          <td><Star color=\\"#EA5525\\" size=\\"1.3rem\\" /></td>\\n        {:else}\\n          <td on:click={watchlisted(row.symbol)}\\n            ><StarOutline size=\\"1.3rem\\" /></td\\n          >\\n        {/if}\\n        <td>\\n          <img src={row.image} loading=\\"lazy\\" alt={row.name} />\\n        </td>\\n        <td>{row.symbol}</td>\\n        <td>{row.name}</td>\\n        <td>{row.price}</td>\\n        <td class={parseFloat(row.change) < 0 ? \\"red\\" : \\"green\\"}\\n          >{row.change}</td\\n        >\\n      </tr>\\n    {/each}\\n  </table>\\n</div>\\n\\n<style>\\n  div {\\n    border-radius: 5px;\\n    margin-bottom: 3rem;\\n  }\\n  table {\\n    font-family: \\"Nunito\\", sans-serif;\\n    border: none;\\n    border-collapse: collapse;\\n    min-width: 100%;\\n  }\\n\\n  th {\\n    background-color: black;\\n    color: white;\\n    box-sizing: border-box;\\n    padding: 1rem;\\n    text-align: left;\\n  }\\n\\n  td {\\n    border-bottom: 1px solid #eff2f5;\\n    padding: 0.8rem 1rem;\\n    font-weight: 600;\\n  }\\n\\n  td:nth-child(6) {\\n    text-align: right;\\n  }\\n\\n  .red {\\n    color: red;\\n  }\\n\\n  .green {\\n    color: green;\\n  }\\n\\n  img {\\n    border-radius: 50%;\\n    max-height: 1.5rem;\\n  }\\n\\n  tr:hover {\\n    background-color: #eff2f5;\\n  }\\n</style>\\n"],"names":[],"mappings":"AAiFE,GAAG,eAAC,CAAC,AACH,aAAa,CAAE,GAAG,CAClB,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,KAAK,eAAC,CAAC,AACL,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,MAAM,CAAE,IAAI,CACZ,eAAe,CAAE,QAAQ,CACzB,SAAS,CAAE,IAAI,AACjB,CAAC,AAED,EAAE,eAAC,CAAC,AACF,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,CACZ,UAAU,CAAE,UAAU,CACtB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,EAAE,eAAC,CAAC,AACF,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CAChC,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,iBAAE,WAAW,CAAC,CAAC,AAAC,CAAC,AACf,UAAU,CAAE,KAAK,AACnB,CAAC,AAED,IAAI,eAAC,CAAC,AACJ,KAAK,CAAE,GAAG,AACZ,CAAC,AAED,MAAM,eAAC,CAAC,AACN,KAAK,CAAE,KAAK,AACd,CAAC,AAED,GAAG,eAAC,CAAC,AACH,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,MAAM,AACpB,CAAC,AAED,iBAAE,MAAM,AAAC,CAAC,AACR,gBAAgB,CAAE,OAAO,AAC3B,CAAC"}'
};
var Tabla = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let priorityData;
  let lowPriorityData;
  createEventDispatcher();
  let { data } = $$props;
  let { columns } = $$props;
  let { watchlist } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0)
    $$bindings.columns(columns);
  if ($$props.watchlist === void 0 && $$bindings.watchlist && watchlist !== void 0)
    $$bindings.watchlist(watchlist);
  $$result.css.add(css$8);
  priorityData = data.filter((row) => watchlist.includes(row.symbol));
  lowPriorityData = data.filter((row) => !watchlist.includes(row.symbol));
  return `<div style="${"overflow-x:auto;"}" class="${"svelte-13aeabl"}"><table class="${"svelte-13aeabl"}"><tr class="${"svelte-13aeabl"}">${each(columns, (column, index2) => `<th class="${"svelte-13aeabl"}">${escape(column)}</th>`)}</tr>
    ${each(priorityData, (row, index2) => `<tr class="${"svelte-13aeabl"}">${watchlist.includes(row.symbol) ? `<td class="${"svelte-13aeabl"}">${validate_component(Star, "Star").$$render($$result, { color: "#EA5525", size: "1.3rem" }, {}, {})}</td>` : `<td class="${"svelte-13aeabl"}">${validate_component(StarOutline, "StarOutline").$$render($$result, { size: "1.3rem" }, {}, {})}</td>`}
      <td class="${"svelte-13aeabl"}"><img${add_attribute("src", row.image, 0)} loading="${"lazy"}"${add_attribute("alt", row.name, 0)} class="${"svelte-13aeabl"}"></td>
      <td class="${"svelte-13aeabl"}">${escape(row.symbol)}</td>
      <td class="${"svelte-13aeabl"}">${escape(row.name)}</td>
      <td class="${"svelte-13aeabl"}">${escape(row.price)}</td>
      <td class="${escape(null_to_empty(parseFloat(row.change) < 0 ? "red" : "green")) + " svelte-13aeabl"}">${escape(row.change)}</td>
    </tr>`)}
    ${each(lowPriorityData, (row, index2) => `<tr class="${"svelte-13aeabl"}">${watchlist.includes(row.symbol) ? `<td class="${"svelte-13aeabl"}">${validate_component(Star, "Star").$$render($$result, { color: "#EA5525", size: "1.3rem" }, {}, {})}</td>` : `<td class="${"svelte-13aeabl"}">${validate_component(StarOutline, "StarOutline").$$render($$result, { size: "1.3rem" }, {}, {})}</td>`}
        <td class="${"svelte-13aeabl"}"><img${add_attribute("src", row.image, 0)} loading="${"lazy"}"${add_attribute("alt", row.name, 0)} class="${"svelte-13aeabl"}"></td>
        <td class="${"svelte-13aeabl"}">${escape(row.symbol)}</td>
        <td class="${"svelte-13aeabl"}">${escape(row.name)}</td>
        <td class="${"svelte-13aeabl"}">${escape(row.price)}</td>
        <td class="${escape(null_to_empty(parseFloat(row.change) < 0 ? "red" : "green")) + " svelte-13aeabl"}">${escape(row.change)}</td>
      </tr>`)}</table>
</div>`;
});
var calculateRgba = (color, opacity) => {
  if (color[0] === "#") {
    color = color.slice(1);
  }
  if (color.length === 3) {
    let res = "";
    color.split("").forEach((c) => {
      res += c;
      res += c;
    });
    color = res;
  }
  const rgbValues = (color.match(/.{2}/g) || []).map((hex) => parseInt(hex, 16)).join(", ");
  return `rgba(${rgbValues}, ${opacity})`;
};
var range = (size, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);
var css$7 = {
  code: ".wrapper.svelte-vhcw6{height:calc(var(--size) / 15);width:calc(var(--size) * 2);background-color:var(--rgba);position:relative;overflow:hidden;background-clip:padding-box}.lines.svelte-vhcw6{height:calc(var(--size) / 15);background-color:var(--color)}.small-lines.svelte-vhcw6{position:absolute;overflow:hidden;background-clip:padding-box;display:block;border-radius:2px;will-change:left, right;animation-fill-mode:forwards}.small-lines.\\31 .svelte-vhcw6{animation:var(--duration) cubic-bezier(0.65, 0.815, 0.735, 0.395) 0s\r\n      infinite normal none running svelte-vhcw6-long}.small-lines.\\32 .svelte-vhcw6{animation:var(--duration) cubic-bezier(0.165, 0.84, 0.44, 1)\r\n      calc((var(--duration)+0.1) / 2) infinite normal none running svelte-vhcw6-short}@keyframes svelte-vhcw6-long{0%{left:-35%;right:100%}60%{left:100%;right:-90%}100%{left:100%;right:-90%}}@keyframes svelte-vhcw6-short{0%{left:-200%;right:100%}60%{left:107%;right:-8%}100%{left:107%;right:-8%}}",
  map: '{"version":3,"file":"BarLoader.svelte","sources":["BarLoader.svelte"],"sourcesContent":["<script>;\\r\\nimport { calculateRgba, range } from \\"./utils\\";\\r\\nexport let color = \\"#FF3E00\\";\\r\\nexport let unit = \\"px\\";\\r\\nexport let duration = \\"2.1s\\";\\r\\nexport let size = \\"60\\";\\r\\nlet rgba;\\r\\n$: rgba = calculateRgba(color, 0.2);\\r\\n<\/script>\\r\\n\\r\\n<style>\\r\\n  .wrapper {\\r\\n    height: calc(var(--size) / 15);\\r\\n    width: calc(var(--size) * 2);\\r\\n    background-color: var(--rgba);\\r\\n    position: relative;\\r\\n    overflow: hidden;\\r\\n    background-clip: padding-box;\\r\\n  }\\r\\n  .lines {\\r\\n    height: calc(var(--size) / 15);\\r\\n    background-color: var(--color);\\r\\n  }\\r\\n\\r\\n  .small-lines {\\r\\n    position: absolute;\\r\\n    overflow: hidden;\\r\\n    background-clip: padding-box;\\r\\n    display: block;\\r\\n    border-radius: 2px;\\r\\n    will-change: left, right;\\r\\n    animation-fill-mode: forwards;\\r\\n  }\\r\\n  .small-lines.\\\\31 {\\r\\n    animation: var(--duration) cubic-bezier(0.65, 0.815, 0.735, 0.395) 0s\\r\\n      infinite normal none running long;\\r\\n  }\\r\\n  .small-lines.\\\\32 {\\r\\n    animation: var(--duration) cubic-bezier(0.165, 0.84, 0.44, 1)\\r\\n      calc((var(--duration)+0.1) / 2) infinite normal none running short;\\r\\n  }\\r\\n\\r\\n  @keyframes long {\\r\\n    0% {\\r\\n      left: -35%;\\r\\n      right: 100%;\\r\\n    }\\r\\n    60% {\\r\\n      left: 100%;\\r\\n      right: -90%;\\r\\n    }\\r\\n    100% {\\r\\n      left: 100%;\\r\\n      right: -90%;\\r\\n    }\\r\\n  }\\r\\n  @keyframes short {\\r\\n    0% {\\r\\n      left: -200%;\\r\\n      right: 100%;\\r\\n    }\\r\\n    60% {\\r\\n      left: 107%;\\r\\n      right: -8%;\\r\\n    }\\r\\n    100% {\\r\\n      left: 107%;\\r\\n      right: -8%;\\r\\n    }\\r\\n  }\\r\\n</style>\\r\\n\\r\\n<div class=\\"wrapper\\" style=\\"--size: {size}{unit}; --rgba:{rgba}\\">\\r\\n  {#each range(2, 1) as version}\\r\\n    <div\\r\\n      class=\\"lines small-lines {version}\\"\\r\\n      style=\\"--color: {color}; --duration: {duration};\\" />\\r\\n  {/each}\\r\\n</div>\\r\\n"],"names":[],"mappings":"AAWE,QAAQ,aAAC,CAAC,AACR,MAAM,CAAE,KAAK,IAAI,MAAM,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAC9B,KAAK,CAAE,KAAK,IAAI,MAAM,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAC5B,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,QAAQ,CAAE,QAAQ,CAClB,QAAQ,CAAE,MAAM,CAChB,eAAe,CAAE,WAAW,AAC9B,CAAC,AACD,MAAM,aAAC,CAAC,AACN,MAAM,CAAE,KAAK,IAAI,MAAM,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAC9B,gBAAgB,CAAE,IAAI,OAAO,CAAC,AAChC,CAAC,AAED,YAAY,aAAC,CAAC,AACZ,QAAQ,CAAE,QAAQ,CAClB,QAAQ,CAAE,MAAM,CAChB,eAAe,CAAE,WAAW,CAC5B,OAAO,CAAE,KAAK,CACd,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,IAAI,CAAC,CAAC,KAAK,CACxB,mBAAmB,CAAE,QAAQ,AAC/B,CAAC,AACD,YAAY,kBAAK,CAAC,AAChB,SAAS,CAAE,IAAI,UAAU,CAAC,CAAC,aAAa,IAAI,CAAC,CAAC,KAAK,CAAC,CAAC,KAAK,CAAC,CAAC,KAAK,CAAC,CAAC,EAAE;MACnE,QAAQ,CAAC,MAAM,CAAC,IAAI,CAAC,OAAO,CAAC,iBACjC,CAAC,AACD,YAAY,kBAAK,CAAC,AAChB,SAAS,CAAE,IAAI,UAAU,CAAC,CAAC,aAAa,KAAK,CAAC,CAAC,IAAI,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC;MAC3D,KAAK,CAAC,IAAI,UAAU,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,QAAQ,CAAC,MAAM,CAAC,IAAI,CAAC,OAAO,CAAC,kBACjE,CAAC,AAED,WAAW,iBAAK,CAAC,AACf,EAAE,AAAC,CAAC,AACF,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IAAI,AACb,CAAC,AACD,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IAAI,AACb,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACD,WAAW,kBAAM,CAAC,AAChB,EAAE,AAAC,CAAC,AACF,IAAI,CAAE,KAAK,CACX,KAAK,CAAE,IAAI,AACb,CAAC,AACD,GAAG,AAAC,CAAC,AACH,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,GAAG,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,GAAG,AACZ,CAAC,AACH,CAAC"}'
};
var BarLoader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { color = "#FF3E00" } = $$props;
  let { unit = "px" } = $$props;
  let { duration = "2.1s" } = $$props;
  let { size = "60" } = $$props;
  let rgba;
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.unit === void 0 && $$bindings.unit && unit !== void 0)
    $$bindings.unit(unit);
  if ($$props.duration === void 0 && $$bindings.duration && duration !== void 0)
    $$bindings.duration(duration);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  $$result.css.add(css$7);
  rgba = calculateRgba(color, 0.2);
  return `<div class="${"wrapper svelte-vhcw6"}" style="${"--size: " + escape(size) + escape(unit) + "; --rgba:" + escape(rgba)}">${each(range(2, 1), (version) => `<div class="${"lines small-lines " + escape(version) + " svelte-vhcw6"}" style="${"--color: " + escape(color) + "; --duration: " + escape(duration) + ";"}"></div>`)}</div>`;
});
var Close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { size = "1em" } = $$props;
  let { width = size } = $$props;
  let { height = size } = $$props;
  let { color = "currentColor" } = $$props;
  let { viewBox = "0 0 24 24" } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.viewBox === void 0 && $$bindings.viewBox && viewBox !== void 0)
    $$bindings.viewBox(viewBox);
  return `<svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("viewBox", viewBox, 0)}><path d="${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}"${add_attribute("fill", color, 0)}></path></svg>`;
});
var css$6 = {
  code: 'article.svelte-1agp5t4{padding:1.5rem;margin:2rem 0;box-sizing:border-box;border-radius:0.5rem;position:relative}div.svelte-1agp5t4{position:absolute;top:0.5rem;right:0.5rem}p.svelte-1agp5t4{font-family:"Nunito", sans-serif}',
  map: `{"version":3,"file":"Callout.svelte","sources":["Callout.svelte"],"sourcesContent":["<script>\\n    import Close from \\"svelte-material-icons/Close.svelte\\";\\n    export let color = 'red';\\n\\n    let display = true;\\n<\/script>\\n\\n{#if display}\\n<article style=\\"background-color: {color}\\">\\n    <p><slot></slot></p>\\n<div on:click=\\"{() => display=false}\\">\\n    <Close></Close>\\n</div>\\n</article>\\n{/if}\\n\\n<style>\\n    article {\\n        padding: 1.5rem;\\n        margin: 2rem 0;\\n        box-sizing: border-box;\\n        border-radius: 0.5rem;\\n        position: relative;\\n    }\\n\\n    div {\\n        position: absolute;\\n        top: 0.5rem;\\n        right: 0.5rem;\\n    }\\n\\n    p {\\n        font-family: \\"Nunito\\", sans-serif;\\n    }\\n</style>"],"names":[],"mappings":"AAiBI,OAAO,eAAC,CAAC,AACL,OAAO,CAAE,MAAM,CACf,MAAM,CAAE,IAAI,CAAC,CAAC,CACd,UAAU,CAAE,UAAU,CACtB,aAAa,CAAE,MAAM,CACrB,QAAQ,CAAE,QAAQ,AACtB,CAAC,AAED,GAAG,eAAC,CAAC,AACD,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,MAAM,CACX,KAAK,CAAE,MAAM,AACjB,CAAC,AAED,CAAC,eAAC,CAAC,AACC,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,AACrC,CAAC"}`
};
var Callout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { color = "red" } = $$props;
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  $$result.css.add(css$6);
  return `${`<article style="${"background-color: " + escape(color)}" class="${"svelte-1agp5t4"}"><p class="${"svelte-1agp5t4"}">${slots.default ? slots.default({}) : ``}</p>
<div class="${"svelte-1agp5t4"}">${validate_component(Close, "Close").$$render($$result, {}, {}, {})}</div></article>`}`;
});
var css$5 = {
  code: 'input.svelte-p4j7e6{border-radius:5px;padding:0.5rem 1rem;margin-bottom:1rem;border:1px solid #ff3e0080;font-family:"Nunito", sans-serif;font-weight:300}input.svelte-p4j7e6:focus-visible{outline:none;border:2px solid #FF3E00}',
  map: `{"version":3,"file":"Search.svelte","sources":["Search.svelte"],"sourcesContent":["<script>\\n    import { createEventDispatcher } from 'svelte';\\n    const dispatch = createEventDispatcher();\\n\\n\\n    export let searchedValue = '';\\n\\n    function search() {\\n        dispatch('search', {\\n            searchedValue\\n        })\\n    }\\n<\/script>\\n\\n<input on:keyup=\\"{search}\\" bind:value=\\"{searchedValue}\\" type=\\"text\\" placeholder=\\"AAPL\\">\\n\\n<style>\\n    input {\\n        border-radius: 5px;\\n        padding: 0.5rem 1rem;\\n        margin-bottom: 1rem;\\n        border: 1px solid #ff3e0080;\\n        font-family: \\"Nunito\\", sans-serif;\\n        font-weight: 300;\\n    }\\n\\n    input:focus-visible {\\n        outline: none;\\n        border: 2px solid #FF3E00;\\n    }\\n\\n</style>"],"names":[],"mappings":"AAiBI,KAAK,cAAC,CAAC,AACH,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,SAAS,CAC3B,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,WAAW,CAAE,GAAG,AACpB,CAAC,AAED,mBAAK,cAAc,AAAC,CAAC,AACjB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,AAC7B,CAAC"}`
};
var Search = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  let { searchedValue = "" } = $$props;
  if ($$props.searchedValue === void 0 && $$bindings.searchedValue && searchedValue !== void 0)
    $$bindings.searchedValue(searchedValue);
  $$result.css.add(css$5);
  return `<input type="${"text"}" placeholder="${"AAPL"}" class="${"svelte-p4j7e6"}"${add_attribute("value", searchedValue, 0)}>`;
});
var css$4 = {
  code: ".hidden.svelte-1nietkn.svelte-1nietkn{display:none}svg.svelte-1nietkn.svelte-1nietkn{width:20px;height:20px;margin-right:7px}button.svelte-1nietkn.svelte-1nietkn,.button.svelte-1nietkn.svelte-1nietkn{display:inline-flex;align-items:center;justify-content:center;height:auto;padding-top:8px;padding-bottom:8px;color:#353535;text-align:center;font-size:14px;font-weight:500;line-height:1.1;letter-spacing:2px;text-transform:capitalize;text-decoration:none;white-space:nowrap;border-radius:4px;border:1px solid #ff3e0080;cursor:pointer;background-color:#fdd2c1}button.svelte-1nietkn.svelte-1nietkn:hover,.button.svelte-1nietkn.svelte-1nietkn:hover{border-color:#cdd}.share-button.svelte-1nietkn.svelte-1nietkn,.copy-link.svelte-1nietkn.svelte-1nietkn{padding-left:30px;padding-right:30px}.share-button.svelte-1nietkn.svelte-1nietkn{margin-top:3rem}.share-dialog.svelte-1nietkn.svelte-1nietkn{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:none;width:95%;max-width:500px;box-shadow:0 8px 16px rgba(0, 0, 0, 0.15);z-index:-1;border:1px solid #ddd;padding:20px;border-radius:4px;background-color:#fff}.share-dialog.is-open.svelte-1nietkn.svelte-1nietkn{display:block;z-index:2}header.svelte-1nietkn.svelte-1nietkn{display:flex;justify-content:space-between;margin-bottom:20px}.targets.svelte-1nietkn.svelte-1nietkn{display:grid;grid-template-rows:1fr 1fr;grid-template-columns:1fr 1fr;grid-gap:20px;margin-bottom:20px}.close-button.svelte-1nietkn.svelte-1nietkn{background-color:transparent;border:none;padding:0}.close-button.svelte-1nietkn svg.svelte-1nietkn{margin-right:0}.link.svelte-1nietkn.svelte-1nietkn{display:flex;justify-content:center;align-items:center;padding:10px;border-radius:4px;background-color:#eee}.pen-url.svelte-1nietkn.svelte-1nietkn{margin-right:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  map: '{"version":3,"file":"Share.svelte","sources":["Share.svelte"],"sourcesContent":["<script>\\n  let share = false;\\n  let share_url = window.location;\\n\\n  function sharer() {\\n    if (navigator.share) {\\n      navigator\\n        .share({\\n          title: \\"Listado de CEDEARs\\",\\n          url: share_url,\\n        })\\n        .then(() => {\\n          console.log(\\"Gracias por compartir!\\");\\n        })\\n        .catch(console.error);\\n    } else {\\n      // fallback\\n      share = true;\\n    }\\n  }\\n\\n  /* copy to clipboard */\\n  function fallbackCopyTextToClipboard(text) {\\n    var textArea = document.createElement(\\"textarea\\");\\n    textArea.value = text;\\n\\n    // Avoid scrolling to bottom\\n    textArea.style.top = \\"0\\";\\n    textArea.style.left = \\"0\\";\\n    textArea.style.position = \\"fixed\\";\\n\\n    document.body.appendChild(textArea);\\n    textArea.focus();\\n    textArea.select();\\n\\n    try {\\n      var successful = document.execCommand(\\"copy\\");\\n      var msg = successful ? \\"successful\\" : \\"unsuccessful\\";\\n      console.log(\\"Fallback: Copying text command was \\" + msg);\\n    } catch (err) {\\n      console.error(\\"Fallback: Oops, unable to copy\\", err);\\n    }\\n\\n    document.body.removeChild(textArea);\\n  }\\n  function copyTextToClipboard(text) {\\n    if (!navigator.clipboard) {\\n      fallbackCopyTextToClipboard(text);\\n      return;\\n    }\\n    navigator.clipboard.writeText(text).then(\\n      function () {\\n        console.log(\\"Async: Copying to clipboard was successful!\\");\\n      },\\n      function (err) {\\n        console.error(\\"Async: Could not copy text: \\", err);\\n      }\\n    );\\n  }\\n<\/script>\\n\\n<div class={share == false ? \\"share-dialog\\" : \\"share-dialog is-open\\"}>\\n  <header>\\n    <h3 class=\\"dialog-title\\">Comparti esta vista!</h3>\\n    <button on:click={() => (share = false)} class=\\"close-button\\"\\n      ><svg><use href=\\"#close\\" /></svg></button\\n    >\\n  </header>\\n  <div class=\\"targets\\">\\n    <a\\n      href={\\"https://www.facebook.com/sharer/sharer.php?u=\\" + share_url}\\n      class=\\"button\\"\\n    >\\n      <svg>\\n        <use href=\\"#facebook\\" />\\n      </svg>\\n      <span>Facebook</span>\\n    </a>\\n\\n    <a\\n      href={\\"https://twitter.com/intent/tweet?url=\\" +\\n        share_url +\\n        \\"&text=Miren%20como%20viene%20este%20cedear!\\"}\\n      class=\\"button\\"\\n    >\\n      <svg>\\n        <use href=\\"#twitter\\" />\\n      </svg>\\n      <span>Twitter</span>\\n    </a>\\n\\n    <a\\n      href={\\"https://www.linkedin.com/shareArticle?mini=true&url=\\" + share_url}\\n      class=\\"button\\"\\n    >\\n      <svg>\\n        <use href=\\"#linkedin\\" />\\n      </svg>\\n      <span>LinkedIn</span>\\n    </a>\\n\\n    <a\\n      href={\\"mailto:info@example.com?&subject=&cc=&bcc=&body=\\" + share_url}\\n      class=\\"button\\"\\n    >\\n      <svg>\\n        <use href=\\"#email\\" />\\n      </svg>\\n      <span>Email</span>\\n    </a>\\n  </div>\\n  <div class=\\"link\\">\\n    <div class=\\"pen-url\\">{share_url}</div>\\n    <button on:click={() => copyTextToClipboard(share_url)} class=\\"copy-link\\"\\n      >Copy Link</button\\n    >\\n  </div>\\n</div>\\n\\n<button\\n  on:click={sharer}\\n  class=\\"share-button\\"\\n  type=\\"button\\"\\n  title=\\"Share this article\\"\\n>\\n  <svg>\\n    <use href=\\"#share-icon\\" />\\n  </svg>\\n  <span>Compartir</span>\\n</button>\\n\\n<svg class=\\"hidden\\">\\n  <defs>\\n    <symbol\\n      id=\\"share-icon\\"\\n      viewBox=\\"0 0 24 24\\"\\n      fill=\\"none\\"\\n      stroke=\\"currentColor\\"\\n      stroke-width=\\"2\\"\\n      stroke-linecap=\\"round\\"\\n      stroke-linejoin=\\"round\\"\\n      class=\\"feather feather-share\\"\\n      ><path d=\\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\\" /><polyline\\n        points=\\"16 6 12 2 8 6\\"\\n      /><line x1=\\"12\\" y1=\\"2\\" x2=\\"12\\" y2=\\"15\\" /></symbol\\n    >\\n\\n    <symbol\\n      id=\\"facebook\\"\\n      viewBox=\\"0 0 24 24\\"\\n      fill=\\"#3b5998\\"\\n      stroke=\\"#3b5998\\"\\n      stroke-width=\\"2\\"\\n      stroke-linecap=\\"round\\"\\n      stroke-linejoin=\\"round\\"\\n      class=\\"feather feather-facebook\\"\\n      ><path\\n        d=\\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\\"\\n      /></symbol\\n    >\\n\\n    <symbol\\n      id=\\"twitter\\"\\n      viewBox=\\"0 0 24 24\\"\\n      fill=\\"#1da1f2\\"\\n      stroke=\\"#1da1f2\\"\\n      stroke-width=\\"2\\"\\n      stroke-linecap=\\"round\\"\\n      stroke-linejoin=\\"round\\"\\n      class=\\"feather feather-twitter\\"\\n      ><path\\n        d=\\"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z\\"\\n      /></symbol\\n    >\\n\\n    <symbol\\n      id=\\"email\\"\\n      viewBox=\\"0 0 24 24\\"\\n      fill=\\"#777\\"\\n      stroke=\\"#fafafa\\"\\n      stroke-width=\\"2\\"\\n      stroke-linecap=\\"round\\"\\n      stroke-linejoin=\\"round\\"\\n      class=\\"feather feather-mail\\"\\n      ><path\\n        d=\\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\\"\\n      /><polyline points=\\"22,6 12,13 2,6\\" /></symbol\\n    >\\n\\n    <symbol\\n      id=\\"linkedin\\"\\n      viewBox=\\"0 0 24 24\\"\\n      fill=\\"#0077B5\\"\\n      stroke=\\"#0077B5\\"\\n      stroke-width=\\"2\\"\\n      stroke-linecap=\\"round\\"\\n      stroke-linejoin=\\"round\\"\\n      class=\\"feather feather-linkedin\\"\\n      ><path\\n        d=\\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\\"\\n      /><rect x=\\"2\\" y=\\"9\\" width=\\"4\\" height=\\"12\\" /><circle\\n        cx=\\"4\\"\\n        cy=\\"4\\"\\n        r=\\"2\\"\\n      /></symbol\\n    >\\n\\n    <symbol\\n      id=\\"close\\"\\n      viewBox=\\"0 0 24 24\\"\\n      fill=\\"none\\"\\n      stroke=\\"currentColor\\"\\n      stroke-width=\\"2\\"\\n      stroke-linecap=\\"round\\"\\n      stroke-linejoin=\\"round\\"\\n      class=\\"feather feather-x-square\\"\\n      ><rect x=\\"3\\" y=\\"3\\" width=\\"18\\" height=\\"18\\" rx=\\"2\\" ry=\\"2\\" /><line\\n        x1=\\"9\\"\\n        y1=\\"9\\"\\n        x2=\\"15\\"\\n        y2=\\"15\\"\\n      /><line x1=\\"15\\" y1=\\"9\\" x2=\\"9\\" y2=\\"15\\" /></symbol\\n    >\\n  </defs>\\n</svg>\\n\\n<style>\\n  .hidden {\\n    display: none;\\n  }\\n\\n  svg {\\n    width: 20px;\\n    height: 20px;\\n    margin-right: 7px;\\n  }\\n\\n  button,\\n  .button {\\n    display: inline-flex;\\n    align-items: center;\\n    justify-content: center;\\n    height: auto;\\n    padding-top: 8px;\\n    padding-bottom: 8px;\\n    color: #353535;\\n    text-align: center;\\n    font-size: 14px;\\n    font-weight: 500;\\n    line-height: 1.1;\\n    letter-spacing: 2px;\\n    text-transform: capitalize;\\n    text-decoration: none;\\n    white-space: nowrap;\\n    border-radius: 4px;\\n    border: 1px solid #ff3e0080;\\n    cursor: pointer;\\n    background-color: #fdd2c1;\\n  }\\n\\n  button:hover,\\n  .button:hover {\\n    border-color: #cdd;\\n  }\\n\\n  .share-button,\\n  .copy-link {\\n    padding-left: 30px;\\n    padding-right: 30px;\\n  }\\n\\n  .share-button {\\n    margin-top: 3rem;\\n  }\\n\\n  .share-dialog {\\n    position: absolute;\\n    top: 50%;\\n    left: 50%;\\n    transform: translate(-50%, -50%);\\n    display: none;\\n    width: 95%;\\n    max-width: 500px;\\n    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);\\n    z-index: -1;\\n    border: 1px solid #ddd;\\n    padding: 20px;\\n    border-radius: 4px;\\n    background-color: #fff;\\n  }\\n\\n  .share-dialog.is-open {\\n    display: block;\\n    z-index: 2;\\n  }\\n\\n  header {\\n    display: flex;\\n    justify-content: space-between;\\n    margin-bottom: 20px;\\n  }\\n\\n  .targets {\\n    display: grid;\\n    grid-template-rows: 1fr 1fr;\\n    grid-template-columns: 1fr 1fr;\\n    grid-gap: 20px;\\n    margin-bottom: 20px;\\n  }\\n\\n  .close-button {\\n    background-color: transparent;\\n    border: none;\\n    padding: 0;\\n  }\\n\\n  .close-button svg {\\n    margin-right: 0;\\n  }\\n\\n  .link {\\n    display: flex;\\n    justify-content: center;\\n    align-items: center;\\n    padding: 10px;\\n    border-radius: 4px;\\n    background-color: #eee;\\n  }\\n\\n  .pen-url {\\n    margin-right: 15px;\\n    overflow: hidden;\\n    text-overflow: ellipsis;\\n    white-space: nowrap;\\n  }\\n</style>\\n"],"names":[],"mappings":"AAmOE,OAAO,8BAAC,CAAC,AACP,OAAO,CAAE,IAAI,AACf,CAAC,AAED,GAAG,8BAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,GAAG,AACnB,CAAC,AAED,oCAAM,CACN,OAAO,8BAAC,CAAC,AACP,OAAO,CAAE,WAAW,CACpB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,CACnB,cAAc,CAAE,UAAU,CAC1B,eAAe,CAAE,IAAI,CACrB,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,SAAS,CAC3B,MAAM,CAAE,OAAO,CACf,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,oCAAM,MAAM,CACZ,qCAAO,MAAM,AAAC,CAAC,AACb,YAAY,CAAE,IAAI,AACpB,CAAC,AAED,2CAAa,CACb,UAAU,8BAAC,CAAC,AACV,YAAY,CAAE,IAAI,CAClB,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,GAAG,CACV,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC1C,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,OAAO,CAAE,IAAI,CACb,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,aAAa,QAAQ,8BAAC,CAAC,AACrB,OAAO,CAAE,KAAK,CACd,OAAO,CAAE,CAAC,AACZ,CAAC,AAED,MAAM,8BAAC,CAAC,AACN,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,QAAQ,8BAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,kBAAkB,CAAE,GAAG,CAAC,GAAG,CAC3B,qBAAqB,CAAE,GAAG,CAAC,GAAG,CAC9B,QAAQ,CAAE,IAAI,CACd,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,aAAa,8BAAC,CAAC,AACb,gBAAgB,CAAE,WAAW,CAC7B,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,AACZ,CAAC,AAED,4BAAa,CAAC,GAAG,eAAC,CAAC,AACjB,YAAY,CAAE,CAAC,AACjB,CAAC,AAED,KAAK,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,IAAI,CACb,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,IAAI,AACxB,CAAC,AAED,QAAQ,8BAAC,CAAC,AACR,YAAY,CAAE,IAAI,CAClB,QAAQ,CAAE,MAAM,CAChB,aAAa,CAAE,QAAQ,CACvB,WAAW,CAAE,MAAM,AACrB,CAAC"}'
};
var Share = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let share_url = window.location;
  $$result.css.add(css$4);
  return `<div class="${escape(null_to_empty("share-dialog")) + " svelte-1nietkn"}"><header class="${"svelte-1nietkn"}"><h3 class="${"dialog-title"}">Comparti esta vista!</h3>
    <button class="${"close-button svelte-1nietkn"}"><svg class="${"svelte-1nietkn"}"><use href="${"#close"}"></use></svg></button></header>
  <div class="${"targets svelte-1nietkn"}"><a${add_attribute("href", "https://www.facebook.com/sharer/sharer.php?u=" + share_url, 0)} class="${"button svelte-1nietkn"}"><svg class="${"svelte-1nietkn"}"><use href="${"#facebook"}"></use></svg>
      <span>Facebook</span></a>

    <a${add_attribute("href", "https://twitter.com/intent/tweet?url=" + share_url + "&text=Miren%20como%20viene%20este%20cedear!", 0)} class="${"button svelte-1nietkn"}"><svg class="${"svelte-1nietkn"}"><use href="${"#twitter"}"></use></svg>
      <span>Twitter</span></a>

    <a${add_attribute("href", "https://www.linkedin.com/shareArticle?mini=true&url=" + share_url, 0)} class="${"button svelte-1nietkn"}"><svg class="${"svelte-1nietkn"}"><use href="${"#linkedin"}"></use></svg>
      <span>LinkedIn</span></a>

    <a${add_attribute("href", "mailto:info@example.com?&subject=&cc=&bcc=&body=" + share_url, 0)} class="${"button svelte-1nietkn"}"><svg class="${"svelte-1nietkn"}"><use href="${"#email"}"></use></svg>
      <span>Email</span></a></div>
  <div class="${"link svelte-1nietkn"}"><div class="${"pen-url svelte-1nietkn"}">${escape(share_url)}</div>
    <button class="${"copy-link svelte-1nietkn"}">Copy Link</button></div></div>

<button class="${"share-button svelte-1nietkn"}" type="${"button"}" title="${"Share this article"}"><svg class="${"svelte-1nietkn"}"><use href="${"#share-icon"}"></use></svg>
  <span>Compartir</span></button>

<svg class="${"hidden svelte-1nietkn"}"><defs><symbol id="${"share-icon"}" viewBox="${"0 0 24 24"}" fill="${"none"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-share"}"><path d="${"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}"></path><polyline points="${"16 6 12 2 8 6"}"></polyline><line x1="${"12"}" y1="${"2"}" x2="${"12"}" y2="${"15"}"></line></symbol><symbol id="${"facebook"}" viewBox="${"0 0 24 24"}" fill="${"#3b5998"}" stroke="${"#3b5998"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-facebook"}"><path d="${"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"}"></path></symbol><symbol id="${"twitter"}" viewBox="${"0 0 24 24"}" fill="${"#1da1f2"}" stroke="${"#1da1f2"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-twitter"}"><path d="${"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"}"></path></symbol><symbol id="${"email"}" viewBox="${"0 0 24 24"}" fill="${"#777"}" stroke="${"#fafafa"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-mail"}"><path d="${"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"}"></path><polyline points="${"22,6 12,13 2,6"}"></polyline></symbol><symbol id="${"linkedin"}" viewBox="${"0 0 24 24"}" fill="${"#0077B5"}" stroke="${"#0077B5"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-linkedin"}"><path d="${"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"}"></path><rect x="${"2"}" y="${"9"}" width="${"4"}" height="${"12"}"></rect><circle cx="${"4"}" cy="${"4"}" r="${"2"}"></circle></symbol><symbol id="${"close"}" viewBox="${"0 0 24 24"}" fill="${"none"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-x-square"}"><rect x="${"3"}" y="${"3"}" width="${"18"}" height="${"18"}" rx="${"2"}" ry="${"2"}"></rect><line x1="${"9"}" y1="${"9"}" x2="${"15"}" y2="${"15"}"></line><line x1="${"15"}" y1="${"9"}" x2="${"9"}" y2="${"15"}"></line></symbol></defs></svg>`;
});
var css$3 = {
  code: 'a.svelte-p7ad6x{position:absolute;top:1rem;right:1rem;font-family:"Nunito", sans-serif;font-weight:800}a.svelte-p7ad6x:hover{text-decoration:none}@media(max-width: 700px){a.svelte-p7ad6x{visibility:hidden}}',
  map: '{"version":3,"file":"Cafecito.svelte","sources":["Cafecito.svelte"],"sourcesContent":["<a href=\\"https://cafecito.app/ferminrp\\">Ayudame con un Cafe \u2615</a>\\n\\n<style>\\n  a {\\n    position: absolute;\\n    top: 1rem;\\n    right: 1rem;\\n    font-family: \\"Nunito\\", sans-serif;\\n    font-weight: 800;\\n  }\\n\\n  a:hover {\\n      text-decoration: none;\\n  }\\n\\n  @media (max-width: 700px) {\\n      a {\\n        visibility: hidden;\\n      }\\n  }\\n</style>\\n"],"names":[],"mappings":"AAGE,CAAC,cAAC,CAAC,AACD,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,eAAC,MAAM,AAAC,CAAC,AACL,eAAe,CAAE,IAAI,AACzB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACvB,CAAC,cAAC,CAAC,AACD,UAAU,CAAE,MAAM,AACpB,CAAC,AACL,CAAC"}'
};
var Cafecito = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `<a href="${"https://cafecito.app/ferminrp"}" class="${"svelte-p7ad6x"}">Ayudame con un Cafe \u2615</a>`;
});
var css$2 = {
  code: 'main.svelte-1vcqatg{width:720px;margin:auto;max-width:90vw;margin-bottom:3rem}h1.svelte-1vcqatg{font-family:"Nunito", sans-serif;font-weight:800}.loader.svelte-1vcqatg{display:flex;justify-content:center;align-items:center;height:20rem}',
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\texport const prerender = false;\\n<\/script>\\n\\n<script>\\n\\timport Tabla from '$lib/UI/Tabla.svelte';\\n\\timport { BarLoader } from 'svelte-loading-spinners';\\n\\timport Callout from '$lib/UI/Callout.svelte';\\n\\timport Search from '$lib/UI/Search.svelte';\\n\\timport Share from '$lib/UI/Share.svelte';\\n\\timport Cafecito from '$lib/UI/Cafecito.svelte';\\n\\tlet data = [];\\n\\tlet columns = ['', '', 'Ticker', 'Nombre', 'Precio', 'Cambio'];\\n\\tlet searchedValue = '';\\n\\tlet filteredData = [];\\n\\tlet watchlist = [];\\n\\t$: {\\n\\t\\tif (searchedValue === '') {\\n\\t\\t\\tfilteredData = data;\\n\\t\\t} else {\\n\\t\\t\\tfilteredData = data.filter(\\n\\t\\t\\t\\t(cedear) =>\\n\\t\\t\\t\\t\\tcedear.symbol.includes(searchedValue.toUpperCase()) ||\\n\\t\\t\\t\\t\\tcedear.name.toUpperCase().includes(searchedValue.toUpperCase())\\n\\t\\t\\t);\\n\\t\\t}\\n\\t}\\n\\tconst cedeares = fetch(\\n\\t\\t'https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU'\\n\\t)\\n\\t\\t.then((response) => response.json())\\n\\t\\t.then((info) => {\\n\\t\\t\\tfor (let i = 0; i < info.values.length; i++) {\\n\\t\\t\\t\\tlet row = {};\\n\\t\\t\\t\\trow.symbol = info.values[i][0];\\n\\t\\t\\t\\trow.name = info.values[i][1];\\n\\t\\t\\t\\trow.price = info.values[i][2];\\n\\t\\t\\t\\trow.change = info.values[i][3];\\n\\t\\t\\t\\tinfo.values[i][4] !== undefined\\n\\t\\t\\t\\t\\t? (row.image = info.values[i][4])\\n\\t\\t\\t\\t\\t: (row.image = 'https://i.imgur.com/ERGz8GO.png');\\n\\t\\t\\t\\tdata = [...data, row];\\n\\t\\t\\t}\\n\\t\\t\\turlReader();\\n\\t\\t\\tif (JSON.parse(localStorage.getItem('watchlist')) !== null) {\\n\\t\\t\\t\\twatchlist = JSON.parse(localStorage.getItem('watchlist'));\\n\\t\\t\\t}\\n\\t\\t});\\n\\tfunction search(e) {\\n\\t\\tsearchedValue = e.detail.searchedValue;\\n\\t\\tif (searchedValue === '') {\\n\\t\\t\\twindow.history.pushState(\\n\\t\\t\\t\\t{ page: 'Listado de Cedears' },\\n\\t\\t\\t\\t'Listado de Cedears',\\n\\t\\t\\t\\twindow.location.origin\\n\\t\\t\\t);\\n\\t\\t} else {\\n\\t\\t\\twindow.history.pushState(\\n\\t\\t\\t\\t{ page: 'Listado de Cedears' },\\n\\t\\t\\t\\t'Listado de Cedears',\\n\\t\\t\\t\\twindow.location.origin + '/?search=' + searchedValue\\n\\t\\t\\t);\\n\\t\\t\\twindow.splitbee.track('Search', {\\n\\t\\t\\t\\tsearchedValue: searchedValue\\n\\t\\t\\t});\\n\\t\\t}\\n\\t}\\n\\tfunction urlReader() {\\n\\t\\t// Read search params in url\\n\\t\\tlet searchParams = window.location.search;\\n\\t\\tlet searchQuery = new URLSearchParams(searchParams);\\n\\t\\tlet searchValue = searchQuery.get('search');\\n\\t\\tsearchValue !== null ? (searchedValue = searchValue) : (searchedValue = '');\\n\\t}\\n\\tfunction watchlisted(event) {\\n\\t\\tlet symbol = event.detail.symbol;\\n\\t\\t// Add symbol to watchlist\\n\\t\\twatchlist = [...watchlist, symbol];\\n\\t\\t// Save watchlist in localStorage\\n\\t\\tlocalStorage.setItem('watchlist', JSON.stringify(watchlist));\\n\\t\\tconsole.log(JSON.parse(localStorage.getItem('watchlist')));\\n\\t\\twindow.splitbee.track('Watchlisted', {\\n\\t\\t\\tsymbol: symbol\\n\\t\\t});\\n\\t}\\n\\tfunction unwatchlisted(event) {\\n\\t\\tlet symbol = event.detail.symbol;\\n\\t\\t// Add symbol to watchlist\\n\\t\\twatchlist = watchlist.filter((cedear) => cedear !== symbol);\\n\\t\\t// Save watchlist in localStorage\\n\\t\\tlocalStorage.setItem('watchlist', JSON.stringify(watchlist));\\n\\t\\tconsole.log(JSON.parse(localStorage.getItem('watchlist')));\\n\\t\\twindow.splitbee.track('unwatchlisted', {\\n\\t\\t\\tsymbol: symbol\\n\\t\\t});\\n\\t}\\n<\/script>\\n\\n<svelte:head>\\n\\t<!-- Primary Meta Tags -->\\n\\t<title>Listado de Cedears</title>\\n\\t<meta name=\\"title\\" content=\\"Listado de Cedears\\" />\\n\\t<meta name=\\"description\\" content=\\"Herramientas para invertir en CEDEARs\\" />\\n\\n\\t<!-- Open Graph / Facebook -->\\n\\t<meta property=\\"og:type\\" content=\\"website\\" />\\n\\t<meta property=\\"og:url\\" content=\\"https://cedears.ar/\\" />\\n\\t<meta property=\\"og:title\\" content=\\"Listado de Cedears\\" />\\n\\t<meta property=\\"og:description\\" content=\\"Herramientas para invertir en CEDEARs\\" />\\n\\t<meta property=\\"og:image\\" content=\\"https://cedears.ar/assets/meta_image.jpg\\" />\\n\\n\\t<!-- Twitter -->\\n\\t<meta property=\\"twitter:card\\" content=\\"summary_large_image\\" />\\n\\t<meta name=\\"twitter:site\\" content=\\"@ferminrp\\" />\\n\\t<meta name=\\"twitter:creator\\" content=\\"@ferminrp\\" />\\n\\t<meta property=\\"twitter:url\\" content=\\"https://cedears.ar/\\" />\\n\\t<meta property=\\"twitter:title\\" content=\\"Listado de Cedears\\" />\\n\\t<meta property=\\"twitter:description\\" content=\\"Herramientas para invertir en CEDEARs\\" />\\n\\t<meta property=\\"twitter:image\\" content=\\"https://cedears.ar/assets/meta_image.jpg\\" />\\n</svelte:head>\\n\\n<main>\\n\\t<h1>Listado de CEDEARs</h1>\\n  \\n\\t<Callout color=\\"#FDD2C1\\"\\n\\t  >Bienvenido! Aca vas a poder analizar todos los CEDEARs que actualmente\\n\\t  cotizan en el mercado.</Callout\\n\\t>\\n\\t<Search on:search={search} {searchedValue} />\\n\\t{#if data.length > 0}\\n\\t  <Tabla\\n\\t\\ton:unwatchlisted={(e) => unwatchlisted(e)}\\n\\t\\ton:watchlisted={(e) => watchlisted(e)}\\n\\t\\t{watchlist}\\n\\t\\tdata={filteredData}\\n\\t\\t{columns}\\n\\t  />\\n\\t{:else}\\n\\t  <div class=\\"loader\\">\\n\\t\\t<BarLoader />\\n\\t  </div>\\n\\t{/if}\\n\\t{#if searchedValue.length > 0}\\n\\t  <Share />\\n\\t{/if}\\n  \\n  \\n  </main>\\n  \\n  <Cafecito />\\n  \\n  <style>\\n\\tmain {\\n\\t  width: 720px;\\n\\t  margin: auto;\\n\\t  max-width: 90vw;\\n\\t  margin-bottom: 3rem;\\n\\t}\\n\\th1 {\\n\\t  font-family: \\"Nunito\\", sans-serif;\\n\\t  font-weight: 800;\\n\\t}\\n\\t.loader {\\n\\t  display: flex;\\n\\t  justify-content: center;\\n\\t  align-items: center;\\n\\t  height: 20rem;\\n\\t}\\n  </style>"],"names":[],"mappings":"AAwJC,IAAI,eAAC,CAAC,AACJ,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,IAAI,AACrB,CAAC,AACD,EAAE,eAAC,CAAC,AACF,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,OAAO,eAAC,CAAC,AACP,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,KAAK,AACf,CAAC"}`
};
var prerender$1 = false;
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let data = [];
  let columns = ["", "", "Ticker", "Nombre", "Precio", "Cambio"];
  let searchedValue = "";
  let filteredData = [];
  let watchlist = [];
  fetch("https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU").then((response) => response.json()).then((info) => {
    for (let i = 0; i < info.values.length; i++) {
      let row = {};
      row.symbol = info.values[i][0];
      row.name = info.values[i][1];
      row.price = info.values[i][2];
      row.change = info.values[i][3];
      info.values[i][4] !== void 0 ? row.image = info.values[i][4] : row.image = "https://i.imgur.com/ERGz8GO.png";
      data = [...data, row];
    }
    urlReader();
    if (JSON.parse(localStorage.getItem("watchlist")) !== null) {
      watchlist = JSON.parse(localStorage.getItem("watchlist"));
    }
  });
  function urlReader() {
    let searchParams = window.location.search;
    let searchQuery = new URLSearchParams(searchParams);
    let searchValue = searchQuery.get("search");
    searchValue !== null ? searchedValue = searchValue : searchedValue = "";
  }
  $$result.css.add(css$2);
  {
    {
      if (searchedValue === "") {
        filteredData = data;
      } else {
        filteredData = data.filter((cedear) => cedear.symbol.includes(searchedValue.toUpperCase()) || cedear.name.toUpperCase().includes(searchedValue.toUpperCase()));
      }
    }
  }
  return `${$$result.head += `${$$result.title = `<title>Listado de Cedears</title>`, ""}<meta name="${"title"}" content="${"Listado de Cedears"}" data-svelte="svelte-sbg89x"><meta name="${"description"}" content="${"Herramientas para invertir en CEDEARs"}" data-svelte="svelte-sbg89x"><meta property="${"og:type"}" content="${"website"}" data-svelte="svelte-sbg89x"><meta property="${"og:url"}" content="${"https://cedears.ar/"}" data-svelte="svelte-sbg89x"><meta property="${"og:title"}" content="${"Listado de Cedears"}" data-svelte="svelte-sbg89x"><meta property="${"og:description"}" content="${"Herramientas para invertir en CEDEARs"}" data-svelte="svelte-sbg89x"><meta property="${"og:image"}" content="${"https://cedears.ar/assets/meta_image.jpg"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:card"}" content="${"summary_large_image"}" data-svelte="svelte-sbg89x"><meta name="${"twitter:site"}" content="${"@ferminrp"}" data-svelte="svelte-sbg89x"><meta name="${"twitter:creator"}" content="${"@ferminrp"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:url"}" content="${"https://cedears.ar/"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:title"}" content="${"Listado de Cedears"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:description"}" content="${"Herramientas para invertir en CEDEARs"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:image"}" content="${"https://cedears.ar/assets/meta_image.jpg"}" data-svelte="svelte-sbg89x">`, ""}

<main class="${"svelte-1vcqatg"}"><h1 class="${"svelte-1vcqatg"}">Listado de CEDEARs</h1>
  
	${validate_component(Callout, "Callout").$$render($$result, { color: "#FDD2C1" }, {}, {
    default: () => `Bienvenido! Aca vas a poder analizar todos los CEDEARs que actualmente
	  cotizan en el mercado.`
  })}
	${validate_component(Search, "Search").$$render($$result, { searchedValue }, {}, {})}
	${data.length > 0 ? `${validate_component(Tabla, "Tabla").$$render($$result, { watchlist, data: filteredData, columns }, {}, {})}` : `<div class="${"loader svelte-1vcqatg"}">${validate_component(BarLoader, "BarLoader").$$render($$result, {}, {}, {})}</div>`}
	${searchedValue.length > 0 ? `${validate_component(Share, "Share").$$render($$result, {}, {}, {})}` : ``}</main>
  
  ${validate_component(Cafecito, "Cafecito").$$render($$result, {}, {}, {})}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender: prerender$1
});
var css$1 = {
  code: "h3.svelte-2ex4am{font-family:'Nunito', sans-serif;font-weight:800}p.svelte-2ex4am{font-family:'Nunito', sans-serif;font-weight:400}.loader.svelte-2ex4am{display:flex;justify-content:center;align-items:center;height:20rem}",
  map: `{"version":3,"file":"Estrategia.svelte","sources":["Estrategia.svelte"],"sourcesContent":["<script>\\r\\n\\timport Tabla from '$lib/UI/Tabla.svelte';\\r\\n    import { BarLoader } from 'svelte-loading-spinners';\\r\\n    import Share from '$lib/UI/Share.svelte';\\r\\n\\texport let data;\\r\\n\\texport let nombre;\\r\\n\\texport let descripcion;\\r\\n    export let columns;\\r\\n    export let watchlist;\\r\\n    export let cedears;\\r\\n<\/script>\\r\\n\\r\\n<h3>{nombre}</h3>\\r\\n<p>{descripcion}</p>\\r\\n\\r\\n{#if data.length > 0}\\r\\n\\t  <Tabla\\r\\n\\t\\ton:unwatchlisted\\r\\n\\t\\ton:watchlisted\\r\\n\\t\\t{watchlist}\\r\\n\\t\\tdata={data.filter(item => cedears.includes(item.symbol))}\\r\\n\\t\\t{columns}\\r\\n\\t  />\\r\\n\\t{:else}\\r\\n\\t  <div class=\\"loader\\">\\r\\n\\t\\t<BarLoader />\\r\\n\\t  </div>\\r\\n\\t{/if}\\r\\n\\r\\n\\r\\n\\r\\n<style>\\r\\n\\th3 {\\r\\n\\t\\tfont-family: 'Nunito', sans-serif;\\r\\n\\t\\tfont-weight: 800;\\r\\n\\t}\\r\\n\\tp {\\r\\n\\t\\tfont-family: 'Nunito', sans-serif;\\r\\n\\t\\tfont-weight: 400;\\r\\n\\t}\\r\\n    .loader {\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\tjustify-content: center;\\r\\n\\t\\talign-items: center;\\r\\n\\t\\theight: 20rem;\\r\\n\\t}\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAgCC,EAAE,cAAC,CAAC,AACH,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,WAAW,CAAE,GAAG,AACjB,CAAC,AACD,CAAC,cAAC,CAAC,AACF,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,WAAW,CAAE,GAAG,AACjB,CAAC,AACE,OAAO,cAAC,CAAC,AACX,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,KAAK,AACd,CAAC"}`
};
var Estrategia = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { nombre } = $$props;
  let { descripcion } = $$props;
  let { columns } = $$props;
  let { watchlist } = $$props;
  let { cedears } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.nombre === void 0 && $$bindings.nombre && nombre !== void 0)
    $$bindings.nombre(nombre);
  if ($$props.descripcion === void 0 && $$bindings.descripcion && descripcion !== void 0)
    $$bindings.descripcion(descripcion);
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0)
    $$bindings.columns(columns);
  if ($$props.watchlist === void 0 && $$bindings.watchlist && watchlist !== void 0)
    $$bindings.watchlist(watchlist);
  if ($$props.cedears === void 0 && $$bindings.cedears && cedears !== void 0)
    $$bindings.cedears(cedears);
  $$result.css.add(css$1);
  return `<h3 class="${"svelte-2ex4am"}">${escape(nombre)}</h3>
<p class="${"svelte-2ex4am"}">${escape(descripcion)}</p>

${data.length > 0 ? `${validate_component(Tabla, "Tabla").$$render($$result, {
    watchlist,
    data: data.filter((item) => cedears.includes(item.symbol)),
    columns
  }, {}, {})}` : `<div class="${"loader svelte-2ex4am"}">${validate_component(BarLoader, "BarLoader").$$render($$result, {}, {}, {})}</div>`}`;
});
var estrategias = [
  {
    "nombre": "Veh\xEDculos Aut\xF3nomos",
    "descripcion": "Invert\xED en las empresas que llevan la delantera en la industria de veh\xEDculos aut\xF3nomos!",
    "cedears": ["NVDA", "TM", "GOOGL", "TSLA"]
  },
  {
    "nombre": "Inteligencia Artificial",
    "descripcion": "Invert\xED en las empresas que llevan la delantera en la industria de inteligencia artificial!",
    "cedears": ["GOOGL", "NVDA", "FB", "AMZN"]
  }
];
var css = {
  code: "main.svelte-13b5b90{width:720px;margin:auto;max-width:90vw;margin-bottom:3rem}h1.svelte-13b5b90{font-family:'Nunito', sans-serif;font-weight:800}",
  map: `{"version":3,"file":"listados.svelte","sources":["listados.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport const prerender = false;\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\timport Estrategia from '$lib/estrategias/Estrategia.svelte';\\r\\n\\timport { BarLoader } from 'svelte-loading-spinners';\\r\\n\\timport Callout from '$lib/UI/Callout.svelte';\\r\\n\\timport Share from '$lib/UI/Share.svelte';\\r\\n\\timport Cafecito from '$lib/UI/Cafecito.svelte';\\r\\n\\tlet data = [];\\r\\n\\tlet columns = ['', '', 'Ticker', 'Nombre', 'Precio', 'Cambio'];\\r\\n\\r\\n\\tlet watchlist = [];\\r\\n\\r\\n\\tconst cedeares = fetch(\\r\\n\\t\\t'https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU'\\r\\n\\t)\\r\\n\\t\\t.then((response) => response.json())\\r\\n\\t\\t.then((info) => {\\r\\n\\t\\t\\tfor (let i = 0; i < info.values.length; i++) {\\r\\n\\t\\t\\t\\tlet row = {};\\r\\n\\t\\t\\t\\trow.symbol = info.values[i][0];\\r\\n\\t\\t\\t\\trow.name = info.values[i][1];\\r\\n\\t\\t\\t\\trow.price = info.values[i][2];\\r\\n\\t\\t\\t\\trow.change = info.values[i][3];\\r\\n\\t\\t\\t\\tinfo.values[i][4] !== undefined\\r\\n\\t\\t\\t\\t\\t? (row.image = info.values[i][4])\\r\\n\\t\\t\\t\\t\\t: (row.image = 'https://i.imgur.com/ERGz8GO.png');\\r\\n\\t\\t\\t\\tdata = [...data, row];\\r\\n\\t\\t\\t}\\r\\n\\t\\t\\tif (JSON.parse(localStorage.getItem('watchlist')) !== null) {\\r\\n\\t\\t\\t\\twatchlist = JSON.parse(localStorage.getItem('watchlist'));\\r\\n\\t\\t\\t}\\r\\n\\t\\t});\\r\\n\\r\\n\\tfunction watchlisted(event) {\\r\\n\\t\\tlet symbol = event.detail.symbol;\\r\\n\\t\\t// Add symbol to watchlist\\r\\n\\t\\twatchlist = [...watchlist, symbol];\\r\\n\\t\\t// Save watchlist in localStorage\\r\\n\\t\\tlocalStorage.setItem('watchlist', JSON.stringify(watchlist));\\r\\n\\t\\tconsole.log(JSON.parse(localStorage.getItem('watchlist')));\\r\\n\\t\\twindow.splitbee.track('Watchlisted', {\\r\\n\\t\\t\\tsymbol: symbol\\r\\n\\t\\t});\\r\\n\\t}\\r\\n\\tfunction unwatchlisted(event) {\\r\\n\\t\\tlet symbol = event.detail.symbol;\\r\\n\\t\\t// Add symbol to watchlist\\r\\n\\t\\twatchlist = watchlist.filter((cedear) => cedear !== symbol);\\r\\n\\t\\t// Save watchlist in localStorage\\r\\n\\t\\tlocalStorage.setItem('watchlist', JSON.stringify(watchlist));\\r\\n\\t\\tconsole.log(JSON.parse(localStorage.getItem('watchlist')));\\r\\n\\t\\twindow.splitbee.track('unwatchlisted', {\\r\\n\\t\\t\\tsymbol: symbol\\r\\n\\t\\t});\\r\\n\\t}\\r\\n\\r\\n\\timport { estrategias } from '$lib/estrategias/estrategias.js';\\r\\n\\tconsole.log(estrategias);\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<!-- Primary Meta Tags -->\\r\\n\\t<title>Listado de Cedears</title>\\r\\n\\t<meta name=\\"title\\" content=\\"Listado de Cedears\\" />\\r\\n\\t<meta name=\\"description\\" content=\\"Herramientas para invertir en CEDEARs\\" />\\r\\n\\r\\n\\t<!-- Open Graph / Facebook -->\\r\\n\\t<meta property=\\"og:type\\" content=\\"website\\" />\\r\\n\\t<meta property=\\"og:url\\" content=\\"https://cedears.ar/\\" />\\r\\n\\t<meta property=\\"og:title\\" content=\\"Listado de Cedears\\" />\\r\\n\\t<meta property=\\"og:description\\" content=\\"Herramientas para invertir en CEDEARs\\" />\\r\\n\\t<meta property=\\"og:image\\" content=\\"https://cedears.ar/assets/meta_image.jpg\\" />\\r\\n\\r\\n\\t<!-- Twitter -->\\r\\n\\t<meta property=\\"twitter:card\\" content=\\"summary_large_image\\" />\\r\\n\\t<meta name=\\"twitter:site\\" content=\\"@ferminrp\\" />\\r\\n\\t<meta name=\\"twitter:creator\\" content=\\"@ferminrp\\" />\\r\\n\\t<meta property=\\"twitter:url\\" content=\\"https://cedears.ar/\\" />\\r\\n\\t<meta property=\\"twitter:title\\" content=\\"Listado de Cedears\\" />\\r\\n\\t<meta property=\\"twitter:description\\" content=\\"Herramientas para invertir en CEDEARs\\" />\\r\\n\\t<meta property=\\"twitter:image\\" content=\\"https://cedears.ar/assets/meta_image.jpg\\" />\\r\\n</svelte:head>\\r\\n\\r\\n<main>\\r\\n\\t<h1>Listados de la Comunidad</h1>\\r\\n\\r\\n\\t<Callout color=\\"#FDD2C1\\"\\r\\n\\t\\t>Estos listados fueron sugeridos por la comunidad, podes sugerir nuevos <a\\r\\n\\t\\t\\thref=\\"https://google.com\\">ac\xE1</a\\r\\n\\t\\t>!</Callout\\r\\n\\t>\\r\\n\\r\\n\\t{#each estrategias as estrategia}\\r\\n\\t\\t<Estrategia on:watchlisted=\\"{watchlisted}\\" on:unwatchlisted=\\"{unwatchlisted}\\" cedears=\\"{estrategia.cedears}\\" nombre={estrategia.nombre} descripcion={estrategia.descripcion} {data} {watchlist} {columns}/>\\r\\n\\t{/each}\\r\\n\\r\\n\\t\\r\\n</main>\\r\\n\\r\\n<Cafecito />\\r\\n\\r\\n<style>\\r\\n\\tmain {\\r\\n\\t\\twidth: 720px;\\r\\n\\t\\tmargin: auto;\\r\\n\\t\\tmax-width: 90vw;\\r\\n\\t\\tmargin-bottom: 3rem;\\r\\n\\t}\\r\\n\\th1,\\r\\n\\th3 {\\r\\n\\t\\tfont-family: 'Nunito', sans-serif;\\r\\n\\t\\tfont-weight: 800;\\r\\n\\t}\\r\\n\\t.loader {\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\tjustify-content: center;\\r\\n\\t\\talign-items: center;\\r\\n\\t\\theight: 20rem;\\r\\n\\t}\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAyGC,IAAI,eAAC,CAAC,AACL,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,IAAI,AACpB,CAAC,AACD,EAAE,eACC,CAAC,AACH,WAAW,CAAE,QAAQ,CAAC,CAAC,UAAU,CACjC,WAAW,CAAE,GAAG,AACjB,CAAC"}`
};
var prerender = false;
var Listados = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let data = [];
  let columns = ["", "", "Ticker", "Nombre", "Precio", "Cambio"];
  let watchlist = [];
  fetch("https://sheets.googleapis.com/v4/spreadsheets/1NDOyoL3PGNe-rAm-eMHGrLKLASE6j_tUjkJ3lwXTqu0/values/main!A2:E193?key=AIzaSyBhiqVypmyLHYPmqZYtvdSvxEopcLZBdYU").then((response) => response.json()).then((info) => {
    for (let i = 0; i < info.values.length; i++) {
      let row = {};
      row.symbol = info.values[i][0];
      row.name = info.values[i][1];
      row.price = info.values[i][2];
      row.change = info.values[i][3];
      info.values[i][4] !== void 0 ? row.image = info.values[i][4] : row.image = "https://i.imgur.com/ERGz8GO.png";
      data = [...data, row];
    }
    if (JSON.parse(localStorage.getItem("watchlist")) !== null) {
      watchlist = JSON.parse(localStorage.getItem("watchlist"));
    }
  });
  console.log(estrategias);
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>Listado de Cedears</title>`, ""}<meta name="${"title"}" content="${"Listado de Cedears"}" data-svelte="svelte-sbg89x"><meta name="${"description"}" content="${"Herramientas para invertir en CEDEARs"}" data-svelte="svelte-sbg89x"><meta property="${"og:type"}" content="${"website"}" data-svelte="svelte-sbg89x"><meta property="${"og:url"}" content="${"https://cedears.ar/"}" data-svelte="svelte-sbg89x"><meta property="${"og:title"}" content="${"Listado de Cedears"}" data-svelte="svelte-sbg89x"><meta property="${"og:description"}" content="${"Herramientas para invertir en CEDEARs"}" data-svelte="svelte-sbg89x"><meta property="${"og:image"}" content="${"https://cedears.ar/assets/meta_image.jpg"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:card"}" content="${"summary_large_image"}" data-svelte="svelte-sbg89x"><meta name="${"twitter:site"}" content="${"@ferminrp"}" data-svelte="svelte-sbg89x"><meta name="${"twitter:creator"}" content="${"@ferminrp"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:url"}" content="${"https://cedears.ar/"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:title"}" content="${"Listado de Cedears"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:description"}" content="${"Herramientas para invertir en CEDEARs"}" data-svelte="svelte-sbg89x"><meta property="${"twitter:image"}" content="${"https://cedears.ar/assets/meta_image.jpg"}" data-svelte="svelte-sbg89x">`, ""}

<main class="${"svelte-13b5b90"}"><h1 class="${"svelte-13b5b90"}">Listados de la Comunidad</h1>

	${validate_component(Callout, "Callout").$$render($$result, { color: "#FDD2C1" }, {}, {
    default: () => `Estos listados fueron sugeridos por la comunidad, podes sugerir nuevos <a href="${"https://google.com"}">ac\xE1</a>!`
  })}

	${each(estrategias, (estrategia) => `${validate_component(Estrategia, "Estrategia").$$render($$result, {
    cedears: estrategia.cedears,
    nombre: estrategia.nombre,
    descripcion: estrategia.descripcion,
    data,
    watchlist,
    columns
  }, {}, {})}`)}</main>

${validate_component(Cafecito, "Cafecito").$$render($$result, {}, {}, {})}`;
});
var listados = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Listados,
  prerender
});

// .svelte-kit/vercel/entry.js
init();
var entry_default = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url || "", "http://localhost");
  let body;
  try {
    body = await getRawBody(req);
  } catch (err) {
    res.statusCode = err.status || 400;
    return res.end(err.reason || "Invalid request body");
  }
  const rendered = await render({
    method: req.method,
    headers: req.headers,
    path: pathname,
    query: searchParams,
    rawBody: body
  });
  if (rendered) {
    const { status, headers, body: body2 } = rendered;
    return res.writeHead(status, headers).end(body2);
  }
  return res.writeHead(404).end();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
