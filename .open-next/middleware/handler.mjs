
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.9.10";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var __webpack_modules__ = {};
      var __webpack_module_cache__ = {};
      function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== void 0) {
          return cachedModule.exports;
        }
        var module2 = __webpack_module_cache__[moduleId] = {
          /******/
          // no module.id needed
          /******/
          // no module.loaded needed
          /******/
          exports: {}
          /******/
        };
        var threw = true;
        try {
          __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
          threw = false;
        } finally {
          if (threw) delete __webpack_module_cache__[moduleId];
        }
        return module2.exports;
      }
      __webpack_require__.m = __webpack_modules__;
      (() => {
        __webpack_require__.amdO = {};
      })();
      (() => {
        var deferred = [];
        __webpack_require__.O = (result, chunkIds, fn, priority) => {
          if (chunkIds) {
            priority = priority || 0;
            for (var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
            deferred[i] = [chunkIds, fn, priority];
            return;
          }
          var notFulfilled = Infinity;
          for (var i = 0; i < deferred.length; i++) {
            var [chunkIds, fn, priority] = deferred[i];
            var fulfilled = true;
            for (var j = 0; j < chunkIds.length; j++) {
              if ((priority & false || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => __webpack_require__.O[key](chunkIds[j]))) {
                chunkIds.splice(j--, 1);
              } else {
                fulfilled = false;
                if (priority < notFulfilled) notFulfilled = priority;
              }
            }
            if (fulfilled) {
              deferred.splice(i--, 1);
              var r = fn();
              if (r !== void 0) result = r;
            }
          }
          return result;
        };
      })();
      (() => {
        __webpack_require__.d = (exports2, definition) => {
          for (var key in definition) {
            if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
              Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
            }
          }
        };
      })();
      (() => {
        __webpack_require__.g = function() {
          if (typeof globalThis === "object") return globalThis;
          try {
            return this || new Function("return this")();
          } catch (e) {
            if (typeof window === "object") return window;
          }
        }();
      })();
      (() => {
        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
      })();
      (() => {
        __webpack_require__.r = (exports2) => {
          if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
          }
          Object.defineProperty(exports2, "__esModule", { value: true });
        };
      })();
      (() => {
        var installedChunks = {
          /******/
          993: 0
          /******/
        };
        __webpack_require__.O.j = (chunkId) => installedChunks[chunkId] === 0;
        var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
          var [chunkIds, moreModules, runtime] = data;
          var moduleId, chunkId, i = 0;
          if (chunkIds.some((id) => installedChunks[id] !== 0)) {
            for (moduleId in moreModules) {
              if (__webpack_require__.o(moreModules, moduleId)) {
                __webpack_require__.m[moduleId] = moreModules[moduleId];
              }
            }
            if (runtime) var result = runtime(__webpack_require__);
          }
          if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
          for (; i < chunkIds.length; i++) {
            chunkId = chunkIds[i];
            if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
              installedChunks[chunkId][0]();
            }
            installedChunks[chunkId] = 0;
          }
          return __webpack_require__.O(result);
        };
        var chunkLoadingGlobal = self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || [];
        chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
        chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
      })();
    })();
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// .next/server/middleware.js
var require_middleware = __commonJS({
  ".next/server/middleware.js"() {
    "use strict";
    (self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([
      [826],
      {
        /***/
        67: (
          /***/
          (module2) => {
            "use strict";
            module2.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
          }
        ),
        /***/
        195: (
          /***/
          (module2) => {
            "use strict";
            module2.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
          }
        ),
        /***/
        70: (
          /***/
          (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
              "default": () => (
                /* binding */
                nHandler
              )
            });
            var middleware_namespaceObject = {};
            __webpack_require__.r(middleware_namespaceObject);
            __webpack_require__.d(middleware_namespaceObject, {
              config: () => config,
              middleware: () => middleware
            });
            ;
            async function registerInstrumentation() {
              const register = "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && (await _ENTRIES.middleware_instrumentation).register;
              if (register) {
                try {
                  await register();
                } catch (err) {
                  err.message = `An error occurred while loading instrumentation hook: ${err.message}`;
                  throw err;
                }
              }
            }
            let registerInstrumentationPromise = null;
            function ensureInstrumentationRegistered() {
              if (!registerInstrumentationPromise) {
                registerInstrumentationPromise = registerInstrumentation();
              }
              return registerInstrumentationPromise;
            }
            function getUnsupportedModuleErrorMessage(module2) {
              return `The edge runtime does not support Node.js '${module2}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
            }
            function __import_unsupported(moduleName) {
              const proxy = new Proxy(function() {
              }, {
                get(_obj, prop) {
                  if (prop === "then") {
                    return {};
                  }
                  throw new Error(getUnsupportedModuleErrorMessage(moduleName));
                },
                construct() {
                  throw new Error(getUnsupportedModuleErrorMessage(moduleName));
                },
                apply(_target, _this, args) {
                  if (typeof args[0] === "function") {
                    return args[0](proxy);
                  }
                  throw new Error(getUnsupportedModuleErrorMessage(moduleName));
                }
              });
              return new Proxy({}, {
                get: () => proxy
              });
            }
            function enhanceGlobals() {
              if (process !== __webpack_require__.g.process) {
                process.env = __webpack_require__.g.process.env;
                __webpack_require__.g.process = process;
              }
              Object.defineProperty(globalThis, "__import_unsupported", {
                value: __import_unsupported,
                enumerable: false,
                configurable: false
              });
              void ensureInstrumentationRegistered();
            }
            enhanceGlobals();
            ;
            class PageSignatureError extends Error {
              constructor({ page: page2 }) {
                super(`The middleware "${page2}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
              }
            }
            class RemovedPageError extends Error {
              constructor() {
                super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
              }
            }
            class RemovedUAError extends Error {
              constructor() {
                super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
              }
            }
            ;
            const NEXT_QUERY_PARAM_PREFIX = "nxtP";
            const NEXT_INTERCEPTION_MARKER_PREFIX = "nxtI";
            const PRERENDER_REVALIDATE_HEADER = "x-prerender-revalidate";
            const PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER = "x-prerender-revalidate-if-generated";
            const RSC_PREFETCH_SUFFIX = ".prefetch.rsc";
            const RSC_SUFFIX = ".rsc";
            const ACTION_SUFFIX = ".action";
            const NEXT_DATA_SUFFIX = ".json";
            const NEXT_META_SUFFIX = ".meta";
            const NEXT_BODY_SUFFIX = ".body";
            const NEXT_CACHE_TAGS_HEADER = "x-next-cache-tags";
            const NEXT_CACHE_SOFT_TAGS_HEADER = "x-next-cache-soft-tags";
            const NEXT_CACHE_REVALIDATED_TAGS_HEADER = "x-next-revalidated-tags";
            const NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER = "x-next-revalidate-tag-token";
            const NEXT_CACHE_TAG_MAX_ITEMS = 128;
            const NEXT_CACHE_TAG_MAX_LENGTH = 256;
            const NEXT_CACHE_SOFT_TAG_MAX_LENGTH = 1024;
            const NEXT_CACHE_IMPLICIT_TAG_ID = "_N_T_";
            const CACHE_ONE_YEAR2 = 31536e3;
            const MIDDLEWARE_FILENAME = "middleware";
            const MIDDLEWARE_LOCATION_REGEXP = (
              /* unused pure expression or super */
              null
            );
            const INSTRUMENTATION_HOOK_FILENAME = "instrumentation";
            const PAGES_DIR_ALIAS = "private-next-pages";
            const DOT_NEXT_ALIAS = "private-dot-next";
            const ROOT_DIR_ALIAS = "private-next-root-dir";
            const APP_DIR_ALIAS = "private-next-app-dir";
            const RSC_MOD_REF_PROXY_ALIAS = "private-next-rsc-mod-ref-proxy";
            const RSC_ACTION_VALIDATE_ALIAS = "private-next-rsc-action-validate";
            const RSC_ACTION_PROXY_ALIAS = "private-next-rsc-server-reference";
            const RSC_ACTION_ENCRYPTION_ALIAS = "private-next-rsc-action-encryption";
            const RSC_ACTION_CLIENT_WRAPPER_ALIAS = "private-next-rsc-action-client-wrapper";
            const PUBLIC_DIR_MIDDLEWARE_CONFLICT = (
              /* unused pure expression or super */
              null
            );
            const SSG_GET_INITIAL_PROPS_CONFLICT = (
              /* unused pure expression or super */
              null
            );
            const SERVER_PROPS_GET_INIT_PROPS_CONFLICT = (
              /* unused pure expression or super */
              null
            );
            const SERVER_PROPS_SSG_CONFLICT = (
              /* unused pure expression or super */
              null
            );
            const STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR = (
              /* unused pure expression or super */
              null
            );
            const SERVER_PROPS_EXPORT_ERROR = (
              /* unused pure expression or super */
              null
            );
            const GSP_NO_RETURNED_VALUE = "Your `getStaticProps` function did not return an object. Did you forget to add a `return`?";
            const GSSP_NO_RETURNED_VALUE = "Your `getServerSideProps` function did not return an object. Did you forget to add a `return`?";
            const UNSTABLE_REVALIDATE_RENAME_ERROR = (
              /* unused pure expression or super */
              null
            );
            const GSSP_COMPONENT_MEMBER_ERROR = (
              /* unused pure expression or super */
              null
            );
            const NON_STANDARD_NODE_ENV = (
              /* unused pure expression or super */
              null
            );
            const SSG_FALLBACK_EXPORT_ERROR = (
              /* unused pure expression or super */
              null
            );
            const ESLINT_DEFAULT_DIRS = (
              /* unused pure expression or super */
              null
            );
            const SERVER_RUNTIME = {
              edge: "edge",
              experimentalEdge: "experimental-edge",
              nodejs: "nodejs"
            };
            const WEBPACK_LAYERS_NAMES = {
              /**
              * The layer for the shared code between the client and server bundles.
              */
              shared: "shared",
              /**
              * React Server Components layer (rsc).
              */
              reactServerComponents: "rsc",
              /**
              * Server Side Rendering layer for app (ssr).
              */
              serverSideRendering: "ssr",
              /**
              * The browser client bundle layer for actions.
              */
              actionBrowser: "action-browser",
              /**
              * The layer for the API routes.
              */
              api: "api",
              /**
              * The layer for the middleware code.
              */
              middleware: "middleware",
              /**
              * The layer for the instrumentation hooks.
              */
              instrument: "instrument",
              /**
              * The layer for assets on the edge.
              */
              edgeAsset: "edge-asset",
              /**
              * The browser client bundle layer for App directory.
              */
              appPagesBrowser: "app-pages-browser",
              /**
              * The server bundle layer for metadata routes.
              */
              appMetadataRoute: "app-metadata-route",
              /**
              * The layer for the server bundle for App Route handlers.
              */
              appRouteHandler: "app-route-handler"
            };
            const WEBPACK_LAYERS = {
              ...WEBPACK_LAYERS_NAMES,
              GROUP: {
                serverOnly: [
                  WEBPACK_LAYERS_NAMES.reactServerComponents,
                  WEBPACK_LAYERS_NAMES.actionBrowser,
                  WEBPACK_LAYERS_NAMES.appMetadataRoute,
                  WEBPACK_LAYERS_NAMES.appRouteHandler,
                  WEBPACK_LAYERS_NAMES.instrument
                ],
                clientOnly: [
                  WEBPACK_LAYERS_NAMES.serverSideRendering,
                  WEBPACK_LAYERS_NAMES.appPagesBrowser
                ],
                nonClientServerTarget: [
                  // middleware and pages api
                  WEBPACK_LAYERS_NAMES.middleware,
                  WEBPACK_LAYERS_NAMES.api
                ],
                app: [
                  WEBPACK_LAYERS_NAMES.reactServerComponents,
                  WEBPACK_LAYERS_NAMES.actionBrowser,
                  WEBPACK_LAYERS_NAMES.appMetadataRoute,
                  WEBPACK_LAYERS_NAMES.appRouteHandler,
                  WEBPACK_LAYERS_NAMES.serverSideRendering,
                  WEBPACK_LAYERS_NAMES.appPagesBrowser,
                  WEBPACK_LAYERS_NAMES.shared,
                  WEBPACK_LAYERS_NAMES.instrument
                ]
              }
            };
            const WEBPACK_RESOURCE_QUERIES = {
              edgeSSREntry: "__next_edge_ssr_entry__",
              metadata: "__next_metadata__",
              metadataRoute: "__next_metadata_route__",
              metadataImageMeta: "__next_metadata_image_meta__"
            };
            ;
            function fromNodeOutgoingHttpHeaders(nodeHeaders) {
              const headers = new Headers();
              for (let [key, value] of Object.entries(nodeHeaders)) {
                const values = Array.isArray(value) ? value : [
                  value
                ];
                for (let v of values) {
                  if (typeof v === "undefined") continue;
                  if (typeof v === "number") {
                    v = v.toString();
                  }
                  headers.append(key, v);
                }
              }
              return headers;
            }
            function splitCookiesString(cookiesString) {
              var cookiesStrings = [];
              var pos = 0;
              var start;
              var ch;
              var lastComma;
              var nextStart;
              var cookiesSeparatorFound;
              function skipWhitespace() {
                while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
                  pos += 1;
                }
                return pos < cookiesString.length;
              }
              function notSpecialChar() {
                ch = cookiesString.charAt(pos);
                return ch !== "=" && ch !== ";" && ch !== ",";
              }
              while (pos < cookiesString.length) {
                start = pos;
                cookiesSeparatorFound = false;
                while (skipWhitespace()) {
                  ch = cookiesString.charAt(pos);
                  if (ch === ",") {
                    lastComma = pos;
                    pos += 1;
                    skipWhitespace();
                    nextStart = pos;
                    while (pos < cookiesString.length && notSpecialChar()) {
                      pos += 1;
                    }
                    if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
                      cookiesSeparatorFound = true;
                      pos = nextStart;
                      cookiesStrings.push(cookiesString.substring(start, lastComma));
                      start = pos;
                    } else {
                      pos = lastComma + 1;
                    }
                  } else {
                    pos += 1;
                  }
                }
                if (!cookiesSeparatorFound || pos >= cookiesString.length) {
                  cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
                }
              }
              return cookiesStrings;
            }
            function toNodeOutgoingHttpHeaders(headers) {
              const nodeHeaders = {};
              const cookies = [];
              if (headers) {
                for (const [key, value] of headers.entries()) {
                  if (key.toLowerCase() === "set-cookie") {
                    cookies.push(...splitCookiesString(value));
                    nodeHeaders[key] = cookies.length === 1 ? cookies[0] : cookies;
                  } else {
                    nodeHeaders[key] = value;
                  }
                }
              }
              return nodeHeaders;
            }
            function validateURL(url) {
              try {
                return String(new URL(String(url)));
              } catch (error2) {
                throw new Error(`URL is malformed "${String(url)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, {
                  cause: error2
                });
              }
            }
            function normalizeNextQueryParam(key, onKeyNormalized) {
              const prefixes = [
                NEXT_QUERY_PARAM_PREFIX,
                NEXT_INTERCEPTION_MARKER_PREFIX
              ];
              for (const prefix of prefixes) {
                if (key !== prefix && key.startsWith(prefix)) {
                  const normalizedKey = key.substring(prefix.length);
                  onKeyNormalized(normalizedKey);
                }
              }
            }
            ;
            const responseSymbol = Symbol("response");
            const passThroughSymbol = Symbol("passThrough");
            const waitUntilSymbol = Symbol("waitUntil");
            class FetchEvent {
              // eslint-disable-next-line @typescript-eslint/no-useless-constructor
              constructor(_request) {
                this[waitUntilSymbol] = [];
                this[passThroughSymbol] = false;
              }
              respondWith(response) {
                if (!this[responseSymbol]) {
                  this[responseSymbol] = Promise.resolve(response);
                }
              }
              passThroughOnException() {
                this[passThroughSymbol] = true;
              }
              waitUntil(promise) {
                this[waitUntilSymbol].push(promise);
              }
            }
            class NextFetchEvent extends FetchEvent {
              constructor(params) {
                super(params.request);
                this.sourcePage = params.page;
              }
              /**
              * @deprecated The `request` is now the first parameter and the API is now async.
              *
              * Read more: https://nextjs.org/docs/messages/middleware-new-signature
              */
              get request() {
                throw new PageSignatureError({
                  page: this.sourcePage
                });
              }
              /**
              * @deprecated Using `respondWith` is no longer needed.
              *
              * Read more: https://nextjs.org/docs/messages/middleware-new-signature
              */
              respondWith() {
                throw new PageSignatureError({
                  page: this.sourcePage
                });
              }
            }
            ;
            function detectDomainLocale2(domainItems, hostname, detectedLocale) {
              if (!domainItems) return;
              if (detectedLocale) {
                detectedLocale = detectedLocale.toLowerCase();
              }
              for (const item of domainItems) {
                var _item_domain, _item_locales;
                const domainHostname = (_item_domain = item.domain) == null ? void 0 : _item_domain.split(":", 1)[0].toLowerCase();
                if (hostname === domainHostname || detectedLocale === item.defaultLocale.toLowerCase() || ((_item_locales = item.locales) == null ? void 0 : _item_locales.some((locale) => locale.toLowerCase() === detectedLocale))) {
                  return item;
                }
              }
            }
            ;
            function removeTrailingSlash(route) {
              return route.replace(/\/$/, "") || "/";
            }
            ;
            function parsePath(path3) {
              const hashIndex = path3.indexOf("#");
              const queryIndex = path3.indexOf("?");
              const hasQuery = queryIndex > -1 && (hashIndex < 0 || queryIndex < hashIndex);
              if (hasQuery || hashIndex > -1) {
                return {
                  pathname: path3.substring(0, hasQuery ? queryIndex : hashIndex),
                  query: hasQuery ? path3.substring(queryIndex, hashIndex > -1 ? hashIndex : void 0) : "",
                  hash: hashIndex > -1 ? path3.slice(hashIndex) : ""
                };
              }
              return {
                pathname: path3,
                query: "",
                hash: ""
              };
            }
            ;
            function addPathPrefix(path3, prefix) {
              if (!path3.startsWith("/") || !prefix) {
                return path3;
              }
              const { pathname, query, hash } = parsePath(path3);
              return "" + prefix + pathname + query + hash;
            }
            ;
            function addPathSuffix(path3, suffix) {
              if (!path3.startsWith("/") || !suffix) {
                return path3;
              }
              const { pathname, query, hash } = parsePath(path3);
              return "" + pathname + suffix + query + hash;
            }
            ;
            function pathHasPrefix(path3, prefix) {
              if (typeof path3 !== "string") {
                return false;
              }
              const { pathname } = parsePath(path3);
              return pathname === prefix || pathname.startsWith(prefix + "/");
            }
            ;
            function addLocale(path3, locale, defaultLocale, ignorePrefix) {
              if (!locale || locale === defaultLocale) return path3;
              const lower = path3.toLowerCase();
              if (!ignorePrefix) {
                if (pathHasPrefix(lower, "/api")) return path3;
                if (pathHasPrefix(lower, "/" + locale.toLowerCase())) return path3;
              }
              return addPathPrefix(path3, "/" + locale);
            }
            ;
            function formatNextPathnameInfo(info) {
              let pathname = addLocale(info.pathname, info.locale, info.buildId ? void 0 : info.defaultLocale, info.ignorePrefix);
              if (info.buildId || !info.trailingSlash) {
                pathname = removeTrailingSlash(pathname);
              }
              if (info.buildId) {
                pathname = addPathSuffix(addPathPrefix(pathname, "/_next/data/" + info.buildId), info.pathname === "/" ? "index.json" : ".json");
              }
              pathname = addPathPrefix(pathname, info.basePath);
              return !info.buildId && info.trailingSlash ? !pathname.endsWith("/") ? addPathSuffix(pathname, "/") : pathname : removeTrailingSlash(pathname);
            }
            ;
            function getHostname(parsed, headers) {
              let hostname;
              if ((headers == null ? void 0 : headers.host) && !Array.isArray(headers.host)) {
                hostname = headers.host.toString().split(":", 1)[0];
              } else if (parsed.hostname) {
                hostname = parsed.hostname;
              } else return;
              return hostname.toLowerCase();
            }
            ;
            function normalizeLocalePath(pathname, locales) {
              let detectedLocale;
              const pathnameParts = pathname.split("/");
              (locales || []).some((locale) => {
                if (pathnameParts[1] && pathnameParts[1].toLowerCase() === locale.toLowerCase()) {
                  detectedLocale = locale;
                  pathnameParts.splice(1, 1);
                  pathname = pathnameParts.join("/") || "/";
                  return true;
                }
                return false;
              });
              return {
                pathname,
                detectedLocale
              };
            }
            ;
            function removePathPrefix(path3, prefix) {
              if (!pathHasPrefix(path3, prefix)) {
                return path3;
              }
              const withoutPrefix = path3.slice(prefix.length);
              if (withoutPrefix.startsWith("/")) {
                return withoutPrefix;
              }
              return "/" + withoutPrefix;
            }
            ;
            function getNextPathnameInfo(pathname, options) {
              var _options_nextConfig;
              const { basePath, i18n, trailingSlash } = (_options_nextConfig = options.nextConfig) != null ? _options_nextConfig : {};
              const info = {
                pathname,
                trailingSlash: pathname !== "/" ? pathname.endsWith("/") : trailingSlash
              };
              if (basePath && pathHasPrefix(info.pathname, basePath)) {
                info.pathname = removePathPrefix(info.pathname, basePath);
                info.basePath = basePath;
              }
              let pathnameNoDataPrefix = info.pathname;
              if (info.pathname.startsWith("/_next/data/") && info.pathname.endsWith(".json")) {
                const paths = info.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
                const buildId = paths[0];
                info.buildId = buildId;
                pathnameNoDataPrefix = paths[1] !== "index" ? "/" + paths.slice(1).join("/") : "/";
                if (options.parseData === true) {
                  info.pathname = pathnameNoDataPrefix;
                }
              }
              if (i18n) {
                let result = options.i18nProvider ? options.i18nProvider.analyze(info.pathname) : normalizeLocalePath(info.pathname, i18n.locales);
                info.locale = result.detectedLocale;
                var _result_pathname;
                info.pathname = (_result_pathname = result.pathname) != null ? _result_pathname : info.pathname;
                if (!result.detectedLocale && info.buildId) {
                  result = options.i18nProvider ? options.i18nProvider.analyze(pathnameNoDataPrefix) : normalizeLocalePath(pathnameNoDataPrefix, i18n.locales);
                  if (result.detectedLocale) {
                    info.locale = result.detectedLocale;
                  }
                }
              }
              return info;
            }
            ;
            const REGEX_LOCALHOST_HOSTNAME = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
            function parseURL(url, base) {
              return new URL(String(url).replace(REGEX_LOCALHOST_HOSTNAME, "localhost"), base && String(base).replace(REGEX_LOCALHOST_HOSTNAME, "localhost"));
            }
            const Internal = Symbol("NextURLInternal");
            class NextURL {
              constructor(input, baseOrOpts, opts) {
                let base;
                let options;
                if (typeof baseOrOpts === "object" && "pathname" in baseOrOpts || typeof baseOrOpts === "string") {
                  base = baseOrOpts;
                  options = opts || {};
                } else {
                  options = opts || baseOrOpts || {};
                }
                this[Internal] = {
                  url: parseURL(input, base ?? options.base),
                  options,
                  basePath: ""
                };
                this.analyze();
              }
              analyze() {
                var _this_Internal_options_nextConfig_i18n, _this_Internal_options_nextConfig, _this_Internal_domainLocale, _this_Internal_options_nextConfig_i18n1, _this_Internal_options_nextConfig1;
                const info = getNextPathnameInfo(this[Internal].url.pathname, {
                  nextConfig: this[Internal].options.nextConfig,
                  parseData: true,
                  i18nProvider: this[Internal].options.i18nProvider
                });
                const hostname = getHostname(this[Internal].url, this[Internal].options.headers);
                this[Internal].domainLocale = this[Internal].options.i18nProvider ? this[Internal].options.i18nProvider.detectDomainLocale(hostname) : detectDomainLocale2((_this_Internal_options_nextConfig = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n = _this_Internal_options_nextConfig.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n.domains, hostname);
                const defaultLocale = ((_this_Internal_domainLocale = this[Internal].domainLocale) == null ? void 0 : _this_Internal_domainLocale.defaultLocale) || ((_this_Internal_options_nextConfig1 = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n1 = _this_Internal_options_nextConfig1.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n1.defaultLocale);
                this[Internal].url.pathname = info.pathname;
                this[Internal].defaultLocale = defaultLocale;
                this[Internal].basePath = info.basePath ?? "";
                this[Internal].buildId = info.buildId;
                this[Internal].locale = info.locale ?? defaultLocale;
                this[Internal].trailingSlash = info.trailingSlash;
              }
              formatPathname() {
                return formatNextPathnameInfo({
                  basePath: this[Internal].basePath,
                  buildId: this[Internal].buildId,
                  defaultLocale: !this[Internal].options.forceLocale ? this[Internal].defaultLocale : void 0,
                  locale: this[Internal].locale,
                  pathname: this[Internal].url.pathname,
                  trailingSlash: this[Internal].trailingSlash
                });
              }
              formatSearch() {
                return this[Internal].url.search;
              }
              get buildId() {
                return this[Internal].buildId;
              }
              set buildId(buildId) {
                this[Internal].buildId = buildId;
              }
              get locale() {
                return this[Internal].locale ?? "";
              }
              set locale(locale) {
                var _this_Internal_options_nextConfig_i18n, _this_Internal_options_nextConfig;
                if (!this[Internal].locale || !((_this_Internal_options_nextConfig = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n = _this_Internal_options_nextConfig.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n.locales.includes(locale))) {
                  throw new TypeError(`The NextURL configuration includes no locale "${locale}"`);
                }
                this[Internal].locale = locale;
              }
              get defaultLocale() {
                return this[Internal].defaultLocale;
              }
              get domainLocale() {
                return this[Internal].domainLocale;
              }
              get searchParams() {
                return this[Internal].url.searchParams;
              }
              get host() {
                return this[Internal].url.host;
              }
              set host(value) {
                this[Internal].url.host = value;
              }
              get hostname() {
                return this[Internal].url.hostname;
              }
              set hostname(value) {
                this[Internal].url.hostname = value;
              }
              get port() {
                return this[Internal].url.port;
              }
              set port(value) {
                this[Internal].url.port = value;
              }
              get protocol() {
                return this[Internal].url.protocol;
              }
              set protocol(value) {
                this[Internal].url.protocol = value;
              }
              get href() {
                const pathname = this.formatPathname();
                const search = this.formatSearch();
                return `${this.protocol}//${this.host}${pathname}${search}${this.hash}`;
              }
              set href(url) {
                this[Internal].url = parseURL(url);
                this.analyze();
              }
              get origin() {
                return this[Internal].url.origin;
              }
              get pathname() {
                return this[Internal].url.pathname;
              }
              set pathname(value) {
                this[Internal].url.pathname = value;
              }
              get hash() {
                return this[Internal].url.hash;
              }
              set hash(value) {
                this[Internal].url.hash = value;
              }
              get search() {
                return this[Internal].url.search;
              }
              set search(value) {
                this[Internal].url.search = value;
              }
              get password() {
                return this[Internal].url.password;
              }
              set password(value) {
                this[Internal].url.password = value;
              }
              get username() {
                return this[Internal].url.username;
              }
              set username(value) {
                this[Internal].url.username = value;
              }
              get basePath() {
                return this[Internal].basePath;
              }
              set basePath(value) {
                this[Internal].basePath = value.startsWith("/") ? value : `/${value}`;
              }
              toString() {
                return this.href;
              }
              toJSON() {
                return this.href;
              }
              [Symbol.for("edge-runtime.inspect.custom")]() {
                return {
                  href: this.href,
                  origin: this.origin,
                  protocol: this.protocol,
                  username: this.username,
                  password: this.password,
                  host: this.host,
                  hostname: this.hostname,
                  port: this.port,
                  pathname: this.pathname,
                  search: this.search,
                  searchParams: this.searchParams,
                  hash: this.hash
                };
              }
              clone() {
                return new NextURL(String(this), this[Internal].options);
              }
            }
            var _edge_runtime_cookies = __webpack_require__(945);
            ;
            ;
            const INTERNALS = Symbol("internal request");
            class NextRequest extends Request {
              constructor(input, init = {}) {
                const url = typeof input !== "string" && "url" in input ? input.url : String(input);
                validateURL(url);
                if (input instanceof Request) super(input, init);
                else super(url, init);
                const nextUrl = new NextURL(url, {
                  headers: toNodeOutgoingHttpHeaders(this.headers),
                  nextConfig: init.nextConfig
                });
                this[INTERNALS] = {
                  cookies: new _edge_runtime_cookies.RequestCookies(this.headers),
                  geo: init.geo || {},
                  ip: init.ip,
                  nextUrl,
                  url: false ? 0 : nextUrl.toString()
                };
              }
              [Symbol.for("edge-runtime.inspect.custom")]() {
                return {
                  cookies: this.cookies,
                  geo: this.geo,
                  ip: this.ip,
                  nextUrl: this.nextUrl,
                  url: this.url,
                  // rest of props come from Request
                  bodyUsed: this.bodyUsed,
                  cache: this.cache,
                  credentials: this.credentials,
                  destination: this.destination,
                  headers: Object.fromEntries(this.headers),
                  integrity: this.integrity,
                  keepalive: this.keepalive,
                  method: this.method,
                  mode: this.mode,
                  redirect: this.redirect,
                  referrer: this.referrer,
                  referrerPolicy: this.referrerPolicy,
                  signal: this.signal
                };
              }
              get cookies() {
                return this[INTERNALS].cookies;
              }
              get geo() {
                return this[INTERNALS].geo;
              }
              get ip() {
                return this[INTERNALS].ip;
              }
              get nextUrl() {
                return this[INTERNALS].nextUrl;
              }
              /**
              * @deprecated
              * `page` has been deprecated in favour of `URLPattern`.
              * Read more: https://nextjs.org/docs/messages/middleware-request-page
              */
              get page() {
                throw new RemovedPageError();
              }
              /**
              * @deprecated
              * `ua` has been removed in favour of \`userAgent\` function.
              * Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
              */
              get ua() {
                throw new RemovedUAError();
              }
              get url() {
                return this[INTERNALS].url;
              }
            }
            ;
            class ReflectAdapter {
              static get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === "function") {
                  return value.bind(target);
                }
                return value;
              }
              static set(target, prop, value, receiver) {
                return Reflect.set(target, prop, value, receiver);
              }
              static has(target, prop) {
                return Reflect.has(target, prop);
              }
              static deleteProperty(target, prop) {
                return Reflect.deleteProperty(target, prop);
              }
            }
            ;
            const response_INTERNALS = Symbol("internal response");
            const REDIRECTS2 = /* @__PURE__ */ new Set([
              301,
              302,
              303,
              307,
              308
            ]);
            function handleMiddlewareField(init, headers) {
              var _init_request;
              if (init == null ? void 0 : (_init_request = init.request) == null ? void 0 : _init_request.headers) {
                if (!(init.request.headers instanceof Headers)) {
                  throw new Error("request.headers must be an instance of Headers");
                }
                const keys = [];
                for (const [key, value] of init.request.headers) {
                  headers.set("x-middleware-request-" + key, value);
                  keys.push(key);
                }
                headers.set("x-middleware-override-headers", keys.join(","));
              }
            }
            class NextResponse extends Response {
              constructor(body, init = {}) {
                super(body, init);
                const headers = this.headers;
                const cookies = new _edge_runtime_cookies.ResponseCookies(headers);
                const cookiesProxy = new Proxy(cookies, {
                  get(target, prop, receiver) {
                    switch (prop) {
                      case "delete":
                      case "set": {
                        return (...args) => {
                          const result = Reflect.apply(target[prop], target, args);
                          const newHeaders = new Headers(headers);
                          if (result instanceof _edge_runtime_cookies.ResponseCookies) {
                            headers.set("x-middleware-set-cookie", result.getAll().map((cookie) => (0, _edge_runtime_cookies.stringifyCookie)(cookie)).join(","));
                          }
                          handleMiddlewareField(init, newHeaders);
                          return result;
                        };
                      }
                      default:
                        return ReflectAdapter.get(target, prop, receiver);
                    }
                  }
                });
                this[response_INTERNALS] = {
                  cookies: cookiesProxy,
                  url: init.url ? new NextURL(init.url, {
                    headers: toNodeOutgoingHttpHeaders(headers),
                    nextConfig: init.nextConfig
                  }) : void 0
                };
              }
              [Symbol.for("edge-runtime.inspect.custom")]() {
                return {
                  cookies: this.cookies,
                  url: this.url,
                  // rest of props come from Response
                  body: this.body,
                  bodyUsed: this.bodyUsed,
                  headers: Object.fromEntries(this.headers),
                  ok: this.ok,
                  redirected: this.redirected,
                  status: this.status,
                  statusText: this.statusText,
                  type: this.type
                };
              }
              get cookies() {
                return this[response_INTERNALS].cookies;
              }
              static json(body, init) {
                const response = Response.json(body, init);
                return new NextResponse(response.body, response);
              }
              static redirect(url, init) {
                const status = typeof init === "number" ? init : (init == null ? void 0 : init.status) ?? 307;
                if (!REDIRECTS2.has(status)) {
                  throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
                }
                const initObj = typeof init === "object" ? init : {};
                const headers = new Headers(initObj == null ? void 0 : initObj.headers);
                headers.set("Location", validateURL(url));
                return new NextResponse(null, {
                  ...initObj,
                  headers,
                  status
                });
              }
              static rewrite(destination, init) {
                const headers = new Headers(init == null ? void 0 : init.headers);
                headers.set("x-middleware-rewrite", validateURL(destination));
                handleMiddlewareField(init, headers);
                return new NextResponse(null, {
                  ...init,
                  headers
                });
              }
              static next(init) {
                const headers = new Headers(init == null ? void 0 : init.headers);
                headers.set("x-middleware-next", "1");
                handleMiddlewareField(init, headers);
                return new NextResponse(null, {
                  ...init,
                  headers
                });
              }
            }
            ;
            function relativizeURL(url, base) {
              const baseURL = typeof base === "string" ? new URL(base) : base;
              const relative = new URL(url, base);
              const origin = baseURL.protocol + "//" + baseURL.host;
              return relative.protocol + "//" + relative.host === origin ? relative.toString().replace(origin, "") : relative.toString();
            }
            ;
            const RSC_HEADER = "RSC";
            const ACTION = "Next-Action";
            const NEXT_ROUTER_STATE_TREE = "Next-Router-State-Tree";
            const NEXT_ROUTER_PREFETCH_HEADER = "Next-Router-Prefetch";
            const NEXT_URL = "Next-Url";
            const RSC_CONTENT_TYPE_HEADER = "text/x-component";
            const FLIGHT_PARAMETERS = [
              [
                RSC_HEADER
              ],
              [
                NEXT_ROUTER_STATE_TREE
              ],
              [
                NEXT_ROUTER_PREFETCH_HEADER
              ]
            ];
            const NEXT_RSC_UNION_QUERY = "_rsc";
            const NEXT_DID_POSTPONE_HEADER = "x-nextjs-postponed";
            ;
            const INTERNAL_QUERY_NAMES = [
              "__nextFallback",
              "__nextLocale",
              "__nextInferredLocaleFromDefault",
              "__nextDefaultLocale",
              "__nextIsNotFound",
              NEXT_RSC_UNION_QUERY
            ];
            const EDGE_EXTENDED_INTERNAL_QUERY_NAMES = [
              "__nextDataReq"
            ];
            function stripInternalQueries(query) {
              for (const name of INTERNAL_QUERY_NAMES) {
                delete query[name];
              }
            }
            function stripInternalSearchParams(url, isEdge) {
              const isStringUrl = typeof url === "string";
              const instance = isStringUrl ? new URL(url) : url;
              for (const name of INTERNAL_QUERY_NAMES) {
                instance.searchParams.delete(name);
              }
              if (isEdge) {
                for (const name of EDGE_EXTENDED_INTERNAL_QUERY_NAMES) {
                  instance.searchParams.delete(name);
                }
              }
              return isStringUrl ? instance.toString() : instance;
            }
            ;
            function normalizeAppPath(route) {
              return ensureLeadingSlash(route.split("/").reduce((pathname, segment, index, segments) => {
                if (!segment) {
                  return pathname;
                }
                if (isGroupSegment(segment)) {
                  return pathname;
                }
                if (segment[0] === "@") {
                  return pathname;
                }
                if ((segment === "page" || segment === "route") && index === segments.length - 1) {
                  return pathname;
                }
                return pathname + "/" + segment;
              }, ""));
            }
            function normalizeRscURL(url) {
              return url.replace(/\.rsc($|\?)/, "$1");
            }
            ;
            class ReadonlyHeadersError extends Error {
              constructor() {
                super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
              }
              static callable() {
                throw new ReadonlyHeadersError();
              }
            }
            class HeadersAdapter extends Headers {
              constructor(headers) {
                super();
                this.headers = new Proxy(headers, {
                  get(target, prop, receiver) {
                    if (typeof prop === "symbol") {
                      return ReflectAdapter.get(target, prop, receiver);
                    }
                    const lowercased = prop.toLowerCase();
                    const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
                    if (typeof original === "undefined") return;
                    return ReflectAdapter.get(target, original, receiver);
                  },
                  set(target, prop, value, receiver) {
                    if (typeof prop === "symbol") {
                      return ReflectAdapter.set(target, prop, value, receiver);
                    }
                    const lowercased = prop.toLowerCase();
                    const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
                    return ReflectAdapter.set(target, original ?? prop, value, receiver);
                  },
                  has(target, prop) {
                    if (typeof prop === "symbol") return ReflectAdapter.has(target, prop);
                    const lowercased = prop.toLowerCase();
                    const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
                    if (typeof original === "undefined") return false;
                    return ReflectAdapter.has(target, original);
                  },
                  deleteProperty(target, prop) {
                    if (typeof prop === "symbol") return ReflectAdapter.deleteProperty(target, prop);
                    const lowercased = prop.toLowerCase();
                    const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
                    if (typeof original === "undefined") return true;
                    return ReflectAdapter.deleteProperty(target, original);
                  }
                });
              }
              /**
              * Seals a Headers instance to prevent modification by throwing an error when
              * any mutating method is called.
              */
              static seal(headers) {
                return new Proxy(headers, {
                  get(target, prop, receiver) {
                    switch (prop) {
                      case "append":
                      case "delete":
                      case "set":
                        return ReadonlyHeadersError.callable;
                      default:
                        return ReflectAdapter.get(target, prop, receiver);
                    }
                  }
                });
              }
              /**
              * Merges a header value into a string. This stores multiple values as an
              * array, so we need to merge them into a string.
              *
              * @param value a header value
              * @returns a merged header value (a string)
              */
              merge(value) {
                if (Array.isArray(value)) return value.join(", ");
                return value;
              }
              /**
              * Creates a Headers instance from a plain object or a Headers instance.
              *
              * @param headers a plain object or a Headers instance
              * @returns a headers instance
              */
              static from(headers) {
                if (headers instanceof Headers) return headers;
                return new HeadersAdapter(headers);
              }
              append(name, value) {
                const existing = this.headers[name];
                if (typeof existing === "string") {
                  this.headers[name] = [
                    existing,
                    value
                  ];
                } else if (Array.isArray(existing)) {
                  existing.push(value);
                } else {
                  this.headers[name] = value;
                }
              }
              delete(name) {
                delete this.headers[name];
              }
              get(name) {
                const value = this.headers[name];
                if (typeof value !== "undefined") return this.merge(value);
                return null;
              }
              has(name) {
                return typeof this.headers[name] !== "undefined";
              }
              set(name, value) {
                this.headers[name] = value;
              }
              forEach(callbackfn, thisArg) {
                for (const [name, value] of this.entries()) {
                  callbackfn.call(thisArg, value, name, this);
                }
              }
              *entries() {
                for (const key of Object.keys(this.headers)) {
                  const name = key.toLowerCase();
                  const value = this.get(name);
                  yield [
                    name,
                    value
                  ];
                }
              }
              *keys() {
                for (const key of Object.keys(this.headers)) {
                  const name = key.toLowerCase();
                  yield name;
                }
              }
              *values() {
                for (const key of Object.keys(this.headers)) {
                  const value = this.get(key);
                  yield value;
                }
              }
              [Symbol.iterator]() {
                return this.entries();
              }
            }
            ;
            const sharedAsyncLocalStorageNotAvailableError = new Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
            class FakeAsyncLocalStorage {
              disable() {
                throw sharedAsyncLocalStorageNotAvailableError;
              }
              getStore() {
                return void 0;
              }
              run() {
                throw sharedAsyncLocalStorageNotAvailableError;
              }
              exit() {
                throw sharedAsyncLocalStorageNotAvailableError;
              }
              enterWith() {
                throw sharedAsyncLocalStorageNotAvailableError;
              }
            }
            const maybeGlobalAsyncLocalStorage = globalThis.AsyncLocalStorage;
            function createAsyncLocalStorage() {
              if (maybeGlobalAsyncLocalStorage) {
                return new maybeGlobalAsyncLocalStorage();
              }
              return new FakeAsyncLocalStorage();
            }
            ;
            const staticGenerationAsyncStorage = createAsyncLocalStorage();
            ;
            "TURBOPACK { transition: next-shared }";
            ;
            class ReadonlyRequestCookiesError extends Error {
              constructor() {
                super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options");
              }
              static callable() {
                throw new ReadonlyRequestCookiesError();
              }
            }
            class RequestCookiesAdapter {
              static seal(cookies) {
                return new Proxy(cookies, {
                  get(target, prop, receiver) {
                    switch (prop) {
                      case "clear":
                      case "delete":
                      case "set":
                        return ReadonlyRequestCookiesError.callable;
                      default:
                        return ReflectAdapter.get(target, prop, receiver);
                    }
                  }
                });
              }
            }
            const SYMBOL_MODIFY_COOKIE_VALUES = Symbol.for("next.mutated.cookies");
            function getModifiedCookieValues(cookies) {
              const modified = cookies[SYMBOL_MODIFY_COOKIE_VALUES];
              if (!modified || !Array.isArray(modified) || modified.length === 0) {
                return [];
              }
              return modified;
            }
            function appendMutableCookies(headers, mutableCookies) {
              const modifiedCookieValues = getModifiedCookieValues(mutableCookies);
              if (modifiedCookieValues.length === 0) {
                return false;
              }
              const resCookies = new ResponseCookies(headers);
              const returnedCookies = resCookies.getAll();
              for (const cookie of modifiedCookieValues) {
                resCookies.set(cookie);
              }
              for (const cookie of returnedCookies) {
                resCookies.set(cookie);
              }
              return true;
            }
            class MutableRequestCookiesAdapter {
              static wrap(cookies, onUpdateCookies) {
                const responseCookies = new _edge_runtime_cookies.ResponseCookies(new Headers());
                for (const cookie of cookies.getAll()) {
                  responseCookies.set(cookie);
                }
                let modifiedValues = [];
                const modifiedCookies = /* @__PURE__ */ new Set();
                const updateResponseCookies = () => {
                  const staticGenerationAsyncStore = staticGenerationAsyncStorage.getStore();
                  if (staticGenerationAsyncStore) {
                    staticGenerationAsyncStore.pathWasRevalidated = true;
                  }
                  const allCookies = responseCookies.getAll();
                  modifiedValues = allCookies.filter((c) => modifiedCookies.has(c.name));
                  if (onUpdateCookies) {
                    const serializedCookies = [];
                    for (const cookie of modifiedValues) {
                      const tempCookies = new _edge_runtime_cookies.ResponseCookies(new Headers());
                      tempCookies.set(cookie);
                      serializedCookies.push(tempCookies.toString());
                    }
                    onUpdateCookies(serializedCookies);
                  }
                };
                return new Proxy(responseCookies, {
                  get(target, prop, receiver) {
                    switch (prop) {
                      // A special symbol to get the modified cookie values
                      case SYMBOL_MODIFY_COOKIE_VALUES:
                        return modifiedValues;
                      // TODO: Throw error if trying to set a cookie after the response
                      // headers have been set.
                      case "delete":
                        return function(...args) {
                          modifiedCookies.add(typeof args[0] === "string" ? args[0] : args[0].name);
                          try {
                            target.delete(...args);
                          } finally {
                            updateResponseCookies();
                          }
                        };
                      case "set":
                        return function(...args) {
                          modifiedCookies.add(typeof args[0] === "string" ? args[0] : args[0].name);
                          try {
                            return target.set(...args);
                          } finally {
                            updateResponseCookies();
                          }
                        };
                      default:
                        return ReflectAdapter.get(target, prop, receiver);
                    }
                  }
                });
              }
            }
            ;
            var BaseServerSpan;
            (function(BaseServerSpan2) {
              BaseServerSpan2["handleRequest"] = "BaseServer.handleRequest";
              BaseServerSpan2["run"] = "BaseServer.run";
              BaseServerSpan2["pipe"] = "BaseServer.pipe";
              BaseServerSpan2["getStaticHTML"] = "BaseServer.getStaticHTML";
              BaseServerSpan2["render"] = "BaseServer.render";
              BaseServerSpan2["renderToResponseWithComponents"] = "BaseServer.renderToResponseWithComponents";
              BaseServerSpan2["renderToResponse"] = "BaseServer.renderToResponse";
              BaseServerSpan2["renderToHTML"] = "BaseServer.renderToHTML";
              BaseServerSpan2["renderError"] = "BaseServer.renderError";
              BaseServerSpan2["renderErrorToResponse"] = "BaseServer.renderErrorToResponse";
              BaseServerSpan2["renderErrorToHTML"] = "BaseServer.renderErrorToHTML";
              BaseServerSpan2["render404"] = "BaseServer.render404";
            })(BaseServerSpan || (BaseServerSpan = {}));
            var LoadComponentsSpan;
            (function(LoadComponentsSpan2) {
              LoadComponentsSpan2["loadDefaultErrorComponents"] = "LoadComponents.loadDefaultErrorComponents";
              LoadComponentsSpan2["loadComponents"] = "LoadComponents.loadComponents";
            })(LoadComponentsSpan || (LoadComponentsSpan = {}));
            var NextServerSpan;
            (function(NextServerSpan2) {
              NextServerSpan2["getRequestHandler"] = "NextServer.getRequestHandler";
              NextServerSpan2["getServer"] = "NextServer.getServer";
              NextServerSpan2["getServerRequestHandler"] = "NextServer.getServerRequestHandler";
              NextServerSpan2["createServer"] = "createServer.createServer";
            })(NextServerSpan || (NextServerSpan = {}));
            var NextNodeServerSpan;
            (function(NextNodeServerSpan2) {
              NextNodeServerSpan2["compression"] = "NextNodeServer.compression";
              NextNodeServerSpan2["getBuildId"] = "NextNodeServer.getBuildId";
              NextNodeServerSpan2["createComponentTree"] = "NextNodeServer.createComponentTree";
              NextNodeServerSpan2["clientComponentLoading"] = "NextNodeServer.clientComponentLoading";
              NextNodeServerSpan2["getLayoutOrPageModule"] = "NextNodeServer.getLayoutOrPageModule";
              NextNodeServerSpan2["generateStaticRoutes"] = "NextNodeServer.generateStaticRoutes";
              NextNodeServerSpan2["generateFsStaticRoutes"] = "NextNodeServer.generateFsStaticRoutes";
              NextNodeServerSpan2["generatePublicRoutes"] = "NextNodeServer.generatePublicRoutes";
              NextNodeServerSpan2["generateImageRoutes"] = "NextNodeServer.generateImageRoutes.route";
              NextNodeServerSpan2["sendRenderResult"] = "NextNodeServer.sendRenderResult";
              NextNodeServerSpan2["proxyRequest"] = "NextNodeServer.proxyRequest";
              NextNodeServerSpan2["runApi"] = "NextNodeServer.runApi";
              NextNodeServerSpan2["render"] = "NextNodeServer.render";
              NextNodeServerSpan2["renderHTML"] = "NextNodeServer.renderHTML";
              NextNodeServerSpan2["imageOptimizer"] = "NextNodeServer.imageOptimizer";
              NextNodeServerSpan2["getPagePath"] = "NextNodeServer.getPagePath";
              NextNodeServerSpan2["getRoutesManifest"] = "NextNodeServer.getRoutesManifest";
              NextNodeServerSpan2["findPageComponents"] = "NextNodeServer.findPageComponents";
              NextNodeServerSpan2["getFontManifest"] = "NextNodeServer.getFontManifest";
              NextNodeServerSpan2["getServerComponentManifest"] = "NextNodeServer.getServerComponentManifest";
              NextNodeServerSpan2["getRequestHandler"] = "NextNodeServer.getRequestHandler";
              NextNodeServerSpan2["renderToHTML"] = "NextNodeServer.renderToHTML";
              NextNodeServerSpan2["renderError"] = "NextNodeServer.renderError";
              NextNodeServerSpan2["renderErrorToHTML"] = "NextNodeServer.renderErrorToHTML";
              NextNodeServerSpan2["render404"] = "NextNodeServer.render404";
              NextNodeServerSpan2["startResponse"] = "NextNodeServer.startResponse";
              NextNodeServerSpan2["route"] = "route";
              NextNodeServerSpan2["onProxyReq"] = "onProxyReq";
              NextNodeServerSpan2["apiResolver"] = "apiResolver";
              NextNodeServerSpan2["internalFetch"] = "internalFetch";
            })(NextNodeServerSpan || (NextNodeServerSpan = {}));
            var StartServerSpan;
            (function(StartServerSpan2) {
              StartServerSpan2["startServer"] = "startServer.startServer";
            })(StartServerSpan || (StartServerSpan = {}));
            var RenderSpan;
            (function(RenderSpan2) {
              RenderSpan2["getServerSideProps"] = "Render.getServerSideProps";
              RenderSpan2["getStaticProps"] = "Render.getStaticProps";
              RenderSpan2["renderToString"] = "Render.renderToString";
              RenderSpan2["renderDocument"] = "Render.renderDocument";
              RenderSpan2["createBodyResult"] = "Render.createBodyResult";
            })(RenderSpan || (RenderSpan = {}));
            var AppRenderSpan;
            (function(AppRenderSpan2) {
              AppRenderSpan2["renderToString"] = "AppRender.renderToString";
              AppRenderSpan2["renderToReadableStream"] = "AppRender.renderToReadableStream";
              AppRenderSpan2["getBodyResult"] = "AppRender.getBodyResult";
              AppRenderSpan2["fetch"] = "AppRender.fetch";
            })(AppRenderSpan || (AppRenderSpan = {}));
            var RouterSpan;
            (function(RouterSpan2) {
              RouterSpan2["executeRoute"] = "Router.executeRoute";
            })(RouterSpan || (RouterSpan = {}));
            var constants_NodeSpan;
            (function(NodeSpan2) {
              NodeSpan2["runHandler"] = "Node.runHandler";
            })(constants_NodeSpan || (constants_NodeSpan = {}));
            var AppRouteRouteHandlersSpan;
            (function(AppRouteRouteHandlersSpan2) {
              AppRouteRouteHandlersSpan2["runHandler"] = "AppRouteRouteHandlers.runHandler";
            })(AppRouteRouteHandlersSpan || (AppRouteRouteHandlersSpan = {}));
            var ResolveMetadataSpan;
            (function(ResolveMetadataSpan2) {
              ResolveMetadataSpan2["generateMetadata"] = "ResolveMetadata.generateMetadata";
              ResolveMetadataSpan2["generateViewport"] = "ResolveMetadata.generateViewport";
            })(ResolveMetadataSpan || (ResolveMetadataSpan = {}));
            var MiddlewareSpan;
            (function(MiddlewareSpan2) {
              MiddlewareSpan2["execute"] = "Middleware.execute";
            })(MiddlewareSpan || (MiddlewareSpan = {}));
            const NextVanillaSpanAllowlist = [
              "Middleware.execute",
              "BaseServer.handleRequest",
              "Render.getServerSideProps",
              "Render.getStaticProps",
              "AppRender.fetch",
              "AppRender.getBodyResult",
              "Render.renderDocument",
              "Node.runHandler",
              "AppRouteRouteHandlers.runHandler",
              "ResolveMetadata.generateMetadata",
              "ResolveMetadata.generateViewport",
              "NextNodeServer.createComponentTree",
              "NextNodeServer.findPageComponents",
              "NextNodeServer.getLayoutOrPageModule",
              "NextNodeServer.startResponse",
              "NextNodeServer.clientComponentLoading"
            ];
            const LogSpanAllowList = [
              "NextNodeServer.findPageComponents",
              "NextNodeServer.createComponentTree",
              "NextNodeServer.clientComponentLoading"
            ];
            ;
            let api;
            if (true) {
              api = __webpack_require__(439);
            } else {
            }
            const { context, propagation, trace, SpanStatusCode, SpanKind, ROOT_CONTEXT } = api;
            const isPromise = (p) => {
              return p !== null && typeof p === "object" && typeof p.then === "function";
            };
            const closeSpanWithError = (span, error2) => {
              if ((error2 == null ? void 0 : error2.bubble) === true) {
                span.setAttribute("next.bubble", true);
              } else {
                if (error2) {
                  span.recordException(error2);
                }
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error2 == null ? void 0 : error2.message
                });
              }
              span.end();
            };
            const rootSpanAttributesStore = /* @__PURE__ */ new Map();
            const rootSpanIdKey = api.createContextKey("next.rootSpanId");
            let lastSpanId = 0;
            const getSpanId = () => lastSpanId++;
            class NextTracerImpl {
              /**
              * Returns an instance to the trace with configured name.
              * Since wrap / trace can be defined in any place prior to actual trace subscriber initialization,
              * This should be lazily evaluated.
              */
              getTracerInstance() {
                return trace.getTracer("next.js", "0.0.1");
              }
              getContext() {
                return context;
              }
              getActiveScopeSpan() {
                return trace.getSpan(context == null ? void 0 : context.active());
              }
              withPropagatedContext(carrier, fn, getter) {
                const activeContext = context.active();
                if (trace.getSpanContext(activeContext)) {
                  return fn();
                }
                const remoteContext = propagation.extract(activeContext, carrier, getter);
                return context.with(remoteContext, fn);
              }
              trace(...args) {
                var _trace_getSpanContext;
                const [type, fnOrOptions, fnOrEmpty] = args;
                const { fn, options } = typeof fnOrOptions === "function" ? {
                  fn: fnOrOptions,
                  options: {}
                } : {
                  fn: fnOrEmpty,
                  options: {
                    ...fnOrOptions
                  }
                };
                const spanName = options.spanName ?? type;
                if (!NextVanillaSpanAllowlist.includes(type) && process.env.NEXT_OTEL_VERBOSE !== "1" || options.hideSpan) {
                  return fn();
                }
                let spanContext = this.getSpanContext((options == null ? void 0 : options.parentSpan) ?? this.getActiveScopeSpan());
                let isRootSpan = false;
                if (!spanContext) {
                  spanContext = (context == null ? void 0 : context.active()) ?? ROOT_CONTEXT;
                  isRootSpan = true;
                } else if ((_trace_getSpanContext = trace.getSpanContext(spanContext)) == null ? void 0 : _trace_getSpanContext.isRemote) {
                  isRootSpan = true;
                }
                const spanId = getSpanId();
                options.attributes = {
                  "next.span_name": spanName,
                  "next.span_type": type,
                  ...options.attributes
                };
                return context.with(spanContext.setValue(rootSpanIdKey, spanId), () => this.getTracerInstance().startActiveSpan(spanName, options, (span) => {
                  const startTime = "performance" in globalThis ? globalThis.performance.now() : void 0;
                  const onCleanup = () => {
                    rootSpanAttributesStore.delete(spanId);
                    if (startTime && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && LogSpanAllowList.includes(type || "")) {
                      performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(type.split(".").pop() || "").replace(/[A-Z]/g, (match2) => "-" + match2.toLowerCase())}`, {
                        start: startTime,
                        end: performance.now()
                      });
                    }
                  };
                  if (isRootSpan) {
                    rootSpanAttributesStore.set(spanId, new Map(Object.entries(options.attributes ?? {})));
                  }
                  try {
                    if (fn.length > 1) {
                      return fn(span, (err) => closeSpanWithError(span, err));
                    }
                    const result = fn(span);
                    if (isPromise(result)) {
                      return result.then((res) => {
                        span.end();
                        return res;
                      }).catch((err) => {
                        closeSpanWithError(span, err);
                        throw err;
                      }).finally(onCleanup);
                    } else {
                      span.end();
                      onCleanup();
                    }
                    return result;
                  } catch (err) {
                    closeSpanWithError(span, err);
                    onCleanup();
                    throw err;
                  }
                }));
              }
              wrap(...args) {
                const tracer = this;
                const [name, options, fn] = args.length === 3 ? args : [
                  args[0],
                  {},
                  args[1]
                ];
                if (!NextVanillaSpanAllowlist.includes(name) && process.env.NEXT_OTEL_VERBOSE !== "1") {
                  return fn;
                }
                return function() {
                  let optionsObj = options;
                  if (typeof optionsObj === "function" && typeof fn === "function") {
                    optionsObj = optionsObj.apply(this, arguments);
                  }
                  const lastArgId = arguments.length - 1;
                  const cb = arguments[lastArgId];
                  if (typeof cb === "function") {
                    const scopeBoundCb = tracer.getContext().bind(context.active(), cb);
                    return tracer.trace(name, optionsObj, (_span, done) => {
                      arguments[lastArgId] = function(err) {
                        done == null ? void 0 : done(err);
                        return scopeBoundCb.apply(this, arguments);
                      };
                      return fn.apply(this, arguments);
                    });
                  } else {
                    return tracer.trace(name, optionsObj, () => fn.apply(this, arguments));
                  }
                };
              }
              startSpan(...args) {
                const [type, options] = args;
                const spanContext = this.getSpanContext((options == null ? void 0 : options.parentSpan) ?? this.getActiveScopeSpan());
                return this.getTracerInstance().startSpan(type, options, spanContext);
              }
              getSpanContext(parentSpan) {
                const spanContext = parentSpan ? trace.setSpan(context.active(), parentSpan) : void 0;
                return spanContext;
              }
              getRootSpanAttributes() {
                const spanId = context.active().getValue(rootSpanIdKey);
                return rootSpanAttributesStore.get(spanId);
              }
            }
            const tracer_getTracer = (() => {
              const tracer = new NextTracerImpl();
              return () => tracer;
            })();
            ;
            function wrapApiHandler(page2, handler4) {
              return (...args) => {
                var _getTracer_getRootSpanAttributes;
                (_getTracer_getRootSpanAttributes = getTracer().getRootSpanAttributes()) == null ? void 0 : _getTracer_getRootSpanAttributes.set("next.route", page2);
                return getTracer().trace(NodeSpan.runHandler, {
                  spanName: `executing api route (pages) ${page2}`
                }, () => handler4(...args));
              };
            }
            function sendStatusCode(res, statusCode) {
              res.statusCode = statusCode;
              return res;
            }
            function redirect(res, statusOrUrl, url) {
              if (typeof statusOrUrl === "string") {
                url = statusOrUrl;
                statusOrUrl = 307;
              }
              if (typeof statusOrUrl !== "number" || typeof url !== "string") {
                throw new Error(`Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`);
              }
              res.writeHead(statusOrUrl, {
                Location: url
              });
              res.write(url);
              res.end();
              return res;
            }
            function checkIsOnDemandRevalidate(req, previewProps) {
              const headers = HeadersAdapter.from(req.headers);
              const previewModeId = headers.get(PRERENDER_REVALIDATE_HEADER);
              const isOnDemandRevalidate = previewModeId === previewProps.previewModeId;
              const revalidateOnlyGenerated = headers.has(PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER);
              return {
                isOnDemandRevalidate,
                revalidateOnlyGenerated
              };
            }
            const COOKIE_NAME_PRERENDER_BYPASS = `__prerender_bypass`;
            const COOKIE_NAME_PRERENDER_DATA = `__next_preview_data`;
            const RESPONSE_LIMIT_DEFAULT = (
              /* unused pure expression or super */
              null
            );
            const SYMBOL_PREVIEW_DATA = Symbol(COOKIE_NAME_PRERENDER_DATA);
            const SYMBOL_CLEARED_COOKIES = Symbol(COOKIE_NAME_PRERENDER_BYPASS);
            function clearPreviewData(res, options = {}) {
              if (SYMBOL_CLEARED_COOKIES in res) {
                return res;
              }
              const { serialize } = __webpack_require__(133);
              const previous = res.getHeader("Set-Cookie");
              res.setHeader(`Set-Cookie`, [
                ...typeof previous === "string" ? [
                  previous
                ] : Array.isArray(previous) ? previous : [],
                serialize(COOKIE_NAME_PRERENDER_BYPASS, "", {
                  // To delete a cookie, set `expires` to a date in the past:
                  // https://tools.ietf.org/html/rfc6265#section-4.1.1
                  // `Max-Age: 0` is not valid, thus ignored, and the cookie is persisted.
                  expires: /* @__PURE__ */ new Date(0),
                  httpOnly: true,
                  sameSite: true ? "none" : 0,
                  secure: true,
                  path: "/",
                  ...options.path !== void 0 ? {
                    path: options.path
                  } : void 0
                }),
                serialize(COOKIE_NAME_PRERENDER_DATA, "", {
                  // To delete a cookie, set `expires` to a date in the past:
                  // https://tools.ietf.org/html/rfc6265#section-4.1.1
                  // `Max-Age: 0` is not valid, thus ignored, and the cookie is persisted.
                  expires: /* @__PURE__ */ new Date(0),
                  httpOnly: true,
                  sameSite: true ? "none" : 0,
                  secure: true,
                  path: "/",
                  ...options.path !== void 0 ? {
                    path: options.path
                  } : void 0
                })
              ]);
              Object.defineProperty(res, SYMBOL_CLEARED_COOKIES, {
                value: true,
                enumerable: false
              });
              return res;
            }
            class ApiError extends Error {
              constructor(statusCode, message) {
                super(message);
                this.statusCode = statusCode;
              }
            }
            function sendError(res, statusCode, message) {
              res.statusCode = statusCode;
              res.statusMessage = message;
              res.end(message);
            }
            function setLazyProp({ req }, prop, getter) {
              const opts = {
                configurable: true,
                enumerable: true
              };
              const optsReset = {
                ...opts,
                writable: true
              };
              Object.defineProperty(req, prop, {
                ...opts,
                get: () => {
                  const value = getter();
                  Object.defineProperty(req, prop, {
                    ...optsReset,
                    value
                  });
                  return value;
                },
                set: (value) => {
                  Object.defineProperty(req, prop, {
                    ...optsReset,
                    value
                  });
                }
              });
            }
            ;
            class DraftModeProvider {
              constructor(previewProps, req, cookies, mutableCookies) {
                var _cookies_get;
                const isOnDemandRevalidate = previewProps && checkIsOnDemandRevalidate(req, previewProps).isOnDemandRevalidate;
                const cookieValue = (_cookies_get = cookies.get(COOKIE_NAME_PRERENDER_BYPASS)) == null ? void 0 : _cookies_get.value;
                this.isEnabled = Boolean(!isOnDemandRevalidate && cookieValue && previewProps && (cookieValue === previewProps.previewModeId || // In dev mode, the cookie can be actual hash value preview id but the preview props can still be `development-id`.
                false));
                this._previewModeId = previewProps == null ? void 0 : previewProps.previewModeId;
                this._mutableCookies = mutableCookies;
              }
              enable() {
                if (!this._previewModeId) {
                  throw new Error("Invariant: previewProps missing previewModeId this should never happen");
                }
                this._mutableCookies.set({
                  name: COOKIE_NAME_PRERENDER_BYPASS,
                  value: this._previewModeId,
                  httpOnly: true,
                  sameSite: true ? "none" : 0,
                  secure: true,
                  path: "/"
                });
              }
              disable() {
                this._mutableCookies.set({
                  name: COOKIE_NAME_PRERENDER_BYPASS,
                  value: "",
                  httpOnly: true,
                  sameSite: true ? "none" : 0,
                  secure: true,
                  path: "/",
                  expires: /* @__PURE__ */ new Date(0)
                });
              }
            }
            ;
            function getHeaders(headers) {
              const cleaned = HeadersAdapter.from(headers);
              for (const param of FLIGHT_PARAMETERS) {
                cleaned.delete(param.toString().toLowerCase());
              }
              return HeadersAdapter.seal(cleaned);
            }
            function getMutableCookies(headers, onUpdateCookies) {
              const cookies = new _edge_runtime_cookies.RequestCookies(HeadersAdapter.from(headers));
              return MutableRequestCookiesAdapter.wrap(cookies, onUpdateCookies);
            }
            function mergeMiddlewareCookies(req, existingCookies) {
              if ("x-middleware-set-cookie" in req.headers && typeof req.headers["x-middleware-set-cookie"] === "string") {
                const setCookieValue = req.headers["x-middleware-set-cookie"];
                const responseHeaders = new Headers();
                for (const cookie of splitCookiesString(setCookieValue)) {
                  responseHeaders.append("set-cookie", cookie);
                }
                const responseCookies = new _edge_runtime_cookies.ResponseCookies(responseHeaders);
                for (const cookie of responseCookies.getAll()) {
                  existingCookies.set(cookie);
                }
              }
            }
            const RequestAsyncStorageWrapper = {
              /**
              * Wrap the callback with the given store so it can access the underlying
              * store using hooks.
              *
              * @param storage underlying storage object returned by the module
              * @param context context to seed the store
              * @param callback function to call within the scope of the context
              * @returns the result returned by the callback
              */
              wrap(storage, { req, res, renderOpts }, callback) {
                let previewProps = void 0;
                if (renderOpts && "previewProps" in renderOpts) {
                  previewProps = renderOpts.previewProps;
                }
                function defaultOnUpdateCookies(cookies) {
                  if (res) {
                    res.setHeader("Set-Cookie", cookies);
                  }
                }
                const cache = {};
                const store = {
                  get headers() {
                    if (!cache.headers) {
                      cache.headers = getHeaders(req.headers);
                    }
                    return cache.headers;
                  },
                  get cookies() {
                    if (!cache.cookies) {
                      const requestCookies = new _edge_runtime_cookies.RequestCookies(HeadersAdapter.from(req.headers));
                      mergeMiddlewareCookies(req, requestCookies);
                      cache.cookies = RequestCookiesAdapter.seal(requestCookies);
                    }
                    return cache.cookies;
                  },
                  get mutableCookies() {
                    if (!cache.mutableCookies) {
                      const mutableCookies = getMutableCookies(req.headers, (renderOpts == null ? void 0 : renderOpts.onUpdateCookies) || (res ? defaultOnUpdateCookies : void 0));
                      mergeMiddlewareCookies(req, mutableCookies);
                      cache.mutableCookies = mutableCookies;
                    }
                    return cache.mutableCookies;
                  },
                  get draftMode() {
                    if (!cache.draftMode) {
                      cache.draftMode = new DraftModeProvider(previewProps, req, this.cookies, this.mutableCookies);
                    }
                    return cache.draftMode;
                  },
                  reactLoadableManifest: (renderOpts == null ? void 0 : renderOpts.reactLoadableManifest) || {},
                  assetPrefix: (renderOpts == null ? void 0 : renderOpts.assetPrefix) || ""
                };
                return storage.run(store, callback, store);
              }
            };
            ;
            const request_async_storage_instance_requestAsyncStorage = createAsyncLocalStorage();
            ;
            "TURBOPACK { transition: next-shared }";
            function getExpectedRequestStore(callingExpression) {
              const store = requestAsyncStorage.getStore();
              if (store) return store;
              throw new Error("`" + callingExpression + "` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context");
            }
            ;
            function getEdgePreviewProps() {
              return {
                previewModeId: true ? process.env.__NEXT_PREVIEW_MODE_ID : 0,
                previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "",
                previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || ""
              };
            }
            ;
            class NextRequestHint extends NextRequest {
              constructor(params) {
                super(params.input, params.init);
                this.sourcePage = params.page;
              }
              get request() {
                throw new PageSignatureError({
                  page: this.sourcePage
                });
              }
              respondWith() {
                throw new PageSignatureError({
                  page: this.sourcePage
                });
              }
              waitUntil() {
                throw new PageSignatureError({
                  page: this.sourcePage
                });
              }
            }
            const headersGetter = {
              keys: (headers) => Array.from(headers.keys()),
              get: (headers, key) => headers.get(key) ?? void 0
            };
            let propagator = (request, fn) => {
              const tracer = tracer_getTracer();
              return tracer.withPropagatedContext(request.headers, fn, headersGetter);
            };
            let testApisIntercepted = false;
            function ensureTestApisIntercepted() {
              if (!testApisIntercepted) {
                testApisIntercepted = true;
                if (process.env.NEXT_PRIVATE_TEST_PROXY === "true") {
                  const { interceptTestApis, wrapRequestHandler } = __webpack_require__(177);
                  interceptTestApis();
                  propagator = wrapRequestHandler(propagator);
                }
              }
            }
            async function adapter(params) {
              ensureTestApisIntercepted();
              await ensureInstrumentationRegistered();
              const isEdgeRendering = typeof self.__BUILD_MANIFEST !== "undefined";
              params.request.url = normalizeRscURL(params.request.url);
              const requestUrl = new NextURL(params.request.url, {
                headers: params.request.headers,
                nextConfig: params.request.nextConfig
              });
              const keys = [
                ...requestUrl.searchParams.keys()
              ];
              for (const key of keys) {
                const value = requestUrl.searchParams.getAll(key);
                normalizeNextQueryParam(key, (normalizedKey) => {
                  requestUrl.searchParams.delete(normalizedKey);
                  for (const val of value) {
                    requestUrl.searchParams.append(normalizedKey, val);
                  }
                  requestUrl.searchParams.delete(key);
                });
              }
              const buildId = requestUrl.buildId;
              requestUrl.buildId = "";
              const isNextDataRequest = params.request.headers["x-nextjs-data"];
              if (isNextDataRequest && requestUrl.pathname === "/index") {
                requestUrl.pathname = "/";
              }
              const requestHeaders = fromNodeOutgoingHttpHeaders(params.request.headers);
              const flightHeaders = /* @__PURE__ */ new Map();
              if (!isEdgeRendering) {
                for (const param of FLIGHT_PARAMETERS) {
                  const key = param.toString().toLowerCase();
                  const value = requestHeaders.get(key);
                  if (value) {
                    flightHeaders.set(key, requestHeaders.get(key));
                    requestHeaders.delete(key);
                  }
                }
              }
              const normalizeUrl = false ? 0 : requestUrl;
              const request = new NextRequestHint({
                page: params.page,
                // Strip internal query parameters off the request.
                input: stripInternalSearchParams(normalizeUrl, true).toString(),
                init: {
                  body: params.request.body,
                  geo: params.request.geo,
                  headers: requestHeaders,
                  ip: params.request.ip,
                  method: params.request.method,
                  nextConfig: params.request.nextConfig,
                  signal: params.request.signal
                }
              });
              if (isNextDataRequest) {
                Object.defineProperty(request, "__isData", {
                  enumerable: false,
                  value: true
                });
              }
              if (
                // If we are inside of the next start sandbox
                // leverage the shared instance if not we need
                // to create a fresh cache instance each time
                !globalThis.__incrementalCacheShared && params.IncrementalCache
              ) {
                globalThis.__incrementalCache = new params.IncrementalCache({
                  appDir: true,
                  fetchCache: true,
                  minimalMode: true,
                  fetchCacheKeyPrefix: "",
                  dev: false,
                  requestHeaders: params.request.headers,
                  requestProtocol: "https",
                  getPrerenderManifest: () => {
                    return {
                      version: -1,
                      routes: {},
                      dynamicRoutes: {},
                      notFoundRoutes: [],
                      preview: getEdgePreviewProps()
                    };
                  }
                });
              }
              const event = new NextFetchEvent({
                request,
                page: params.page
              });
              let response;
              let cookiesFromResponse;
              response = await propagator(request, () => {
                const isMiddleware = params.page === "/middleware" || params.page === "/src/middleware";
                if (isMiddleware) {
                  return tracer_getTracer().trace(MiddlewareSpan.execute, {
                    spanName: `middleware ${request.method} ${request.nextUrl.pathname}`,
                    attributes: {
                      "http.target": request.nextUrl.pathname,
                      "http.method": request.method
                    }
                  }, () => RequestAsyncStorageWrapper.wrap(request_async_storage_instance_requestAsyncStorage, {
                    req: request,
                    renderOpts: {
                      onUpdateCookies: (cookies) => {
                        cookiesFromResponse = cookies;
                      },
                      // @ts-expect-error: TODO: investigate why previewProps isn't on RenderOpts
                      previewProps: getEdgePreviewProps()
                    }
                  }, () => params.handler(request, event)));
                }
                return params.handler(request, event);
              });
              if (response && !(response instanceof Response)) {
                throw new TypeError("Expected an instance of Response to be returned");
              }
              if (response && cookiesFromResponse) {
                response.headers.set("set-cookie", cookiesFromResponse);
              }
              const rewrite = response == null ? void 0 : response.headers.get("x-middleware-rewrite");
              if (response && rewrite && !isEdgeRendering) {
                const rewriteUrl = new NextURL(rewrite, {
                  forceLocale: true,
                  headers: params.request.headers,
                  nextConfig: params.request.nextConfig
                });
                if (true) {
                  if (rewriteUrl.host === request.nextUrl.host) {
                    rewriteUrl.buildId = buildId || rewriteUrl.buildId;
                    response.headers.set("x-middleware-rewrite", String(rewriteUrl));
                  }
                }
                const relativizedRewrite = relativizeURL(String(rewriteUrl), String(requestUrl));
                if (isNextDataRequest && // if the rewrite is external and external rewrite
                // resolving config is enabled don't add this header
                // so the upstream app can set it instead
                true) {
                  response.headers.set("x-nextjs-rewrite", relativizedRewrite);
                }
              }
              const redirect2 = response == null ? void 0 : response.headers.get("Location");
              if (response && redirect2 && !isEdgeRendering) {
                const redirectURL = new NextURL(redirect2, {
                  forceLocale: false,
                  headers: params.request.headers,
                  nextConfig: params.request.nextConfig
                });
                response = new Response(response.body, response);
                if (true) {
                  if (redirectURL.host === request.nextUrl.host) {
                    redirectURL.buildId = buildId || redirectURL.buildId;
                    response.headers.set("Location", String(redirectURL));
                  }
                }
                if (isNextDataRequest) {
                  response.headers.delete("Location");
                  response.headers.set("x-nextjs-redirect", relativizeURL(String(redirectURL), String(requestUrl)));
                }
              }
              const finalResponse = response ? response : NextResponse.next();
              const middlewareOverrideHeaders = finalResponse.headers.get("x-middleware-override-headers");
              const overwrittenHeaders = [];
              if (middlewareOverrideHeaders) {
                for (const [key, value] of flightHeaders) {
                  finalResponse.headers.set(`x-middleware-request-${key}`, value);
                  overwrittenHeaders.push(key);
                }
                if (overwrittenHeaders.length > 0) {
                  finalResponse.headers.set("x-middleware-override-headers", middlewareOverrideHeaders + "," + overwrittenHeaders.join(","));
                }
              }
              return {
                response: finalResponse,
                waitUntil: Promise.all(event[waitUntilSymbol]),
                fetchMetrics: request.fetchMetrics
              };
            }
            var ua_parser = __webpack_require__(340);
            ;
            function isBot(input) {
              return /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.test(input);
            }
            function userAgentFromString(input) {
              return {
                ...parseua(input),
                isBot: input === void 0 ? false : isBot(input)
              };
            }
            function userAgent({ headers }) {
              return userAgentFromString(headers.get("user-agent") || void 0);
            }
            ;
            const GlobalURLPattern = (
              // @ts-expect-error: URLPattern is not available in Node.js
              typeof URLPattern === "undefined" ? void 0 : URLPattern
            );
            ;
            ;
            ;
            async function middleware(request) {
              return NextResponse.next();
            }
            const config = {
              matcher: []
            };
            ;
            const mod = {
              ...middleware_namespaceObject
            };
            const handler3 = mod.middleware || mod.default;
            const page = "/middleware";
            if (typeof handler3 !== "function") {
              throw new Error(`The Middleware "${page}" must export a \`middleware\` or a \`default\` function`);
            }
            function nHandler(opts) {
              return adapter({
                ...opts,
                page,
                handler: handler3
              });
            }
          }
        ),
        /***/
        945: (
          /***/
          (module2) => {
            "use strict";
            var __defProp2 = Object.defineProperty;
            var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
            var __getOwnPropNames2 = Object.getOwnPropertyNames;
            var __hasOwnProp2 = Object.prototype.hasOwnProperty;
            var __export2 = (target, all) => {
              for (var name in all)
                __defProp2(target, name, { get: all[name], enumerable: true });
            };
            var __copyProps2 = (to, from, except, desc) => {
              if (from && typeof from === "object" || typeof from === "function") {
                for (let key of __getOwnPropNames2(from))
                  if (!__hasOwnProp2.call(to, key) && key !== except)
                    __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
              }
              return to;
            };
            var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
            var src_exports = {};
            __export2(src_exports, {
              RequestCookies: () => RequestCookies,
              ResponseCookies: () => ResponseCookies2,
              parseCookie: () => parseCookie,
              parseSetCookie: () => parseSetCookie,
              stringifyCookie: () => stringifyCookie
            });
            module2.exports = __toCommonJS2(src_exports);
            function stringifyCookie(c) {
              var _a;
              const attrs = [
                "path" in c && c.path && `Path=${c.path}`,
                "expires" in c && (c.expires || c.expires === 0) && `Expires=${(typeof c.expires === "number" ? new Date(c.expires) : c.expires).toUTCString()}`,
                "maxAge" in c && typeof c.maxAge === "number" && `Max-Age=${c.maxAge}`,
                "domain" in c && c.domain && `Domain=${c.domain}`,
                "secure" in c && c.secure && "Secure",
                "httpOnly" in c && c.httpOnly && "HttpOnly",
                "sameSite" in c && c.sameSite && `SameSite=${c.sameSite}`,
                "partitioned" in c && c.partitioned && "Partitioned",
                "priority" in c && c.priority && `Priority=${c.priority}`
              ].filter(Boolean);
              const stringified = `${c.name}=${encodeURIComponent((_a = c.value) != null ? _a : "")}`;
              return attrs.length === 0 ? stringified : `${stringified}; ${attrs.join("; ")}`;
            }
            function parseCookie(cookie) {
              const map = /* @__PURE__ */ new Map();
              for (const pair of cookie.split(/; */)) {
                if (!pair)
                  continue;
                const splitAt = pair.indexOf("=");
                if (splitAt === -1) {
                  map.set(pair, "true");
                  continue;
                }
                const [key, value] = [pair.slice(0, splitAt), pair.slice(splitAt + 1)];
                try {
                  map.set(key, decodeURIComponent(value != null ? value : "true"));
                } catch {
                }
              }
              return map;
            }
            function parseSetCookie(setCookie) {
              if (!setCookie) {
                return void 0;
              }
              const [[name, value], ...attributes] = parseCookie(setCookie);
              const {
                domain,
                expires,
                httponly,
                maxage,
                path: path3,
                samesite,
                secure,
                partitioned,
                priority
              } = Object.fromEntries(
                attributes.map(([key, value2]) => [key.toLowerCase(), value2])
              );
              const cookie = {
                name,
                value: decodeURIComponent(value),
                domain,
                ...expires && { expires: new Date(expires) },
                ...httponly && { httpOnly: true },
                ...typeof maxage === "string" && { maxAge: Number(maxage) },
                path: path3,
                ...samesite && { sameSite: parseSameSite(samesite) },
                ...secure && { secure: true },
                ...priority && { priority: parsePriority(priority) },
                ...partitioned && { partitioned: true }
              };
              return compact(cookie);
            }
            function compact(t) {
              const newT = {};
              for (const key in t) {
                if (t[key]) {
                  newT[key] = t[key];
                }
              }
              return newT;
            }
            var SAME_SITE = ["strict", "lax", "none"];
            function parseSameSite(string) {
              string = string.toLowerCase();
              return SAME_SITE.includes(string) ? string : void 0;
            }
            var PRIORITY = ["low", "medium", "high"];
            function parsePriority(string) {
              string = string.toLowerCase();
              return PRIORITY.includes(string) ? string : void 0;
            }
            function splitCookiesString(cookiesString) {
              if (!cookiesString)
                return [];
              var cookiesStrings = [];
              var pos = 0;
              var start;
              var ch;
              var lastComma;
              var nextStart;
              var cookiesSeparatorFound;
              function skipWhitespace() {
                while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
                  pos += 1;
                }
                return pos < cookiesString.length;
              }
              function notSpecialChar() {
                ch = cookiesString.charAt(pos);
                return ch !== "=" && ch !== ";" && ch !== ",";
              }
              while (pos < cookiesString.length) {
                start = pos;
                cookiesSeparatorFound = false;
                while (skipWhitespace()) {
                  ch = cookiesString.charAt(pos);
                  if (ch === ",") {
                    lastComma = pos;
                    pos += 1;
                    skipWhitespace();
                    nextStart = pos;
                    while (pos < cookiesString.length && notSpecialChar()) {
                      pos += 1;
                    }
                    if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
                      cookiesSeparatorFound = true;
                      pos = nextStart;
                      cookiesStrings.push(cookiesString.substring(start, lastComma));
                      start = pos;
                    } else {
                      pos = lastComma + 1;
                    }
                  } else {
                    pos += 1;
                  }
                }
                if (!cookiesSeparatorFound || pos >= cookiesString.length) {
                  cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
                }
              }
              return cookiesStrings;
            }
            var RequestCookies = class {
              constructor(requestHeaders) {
                this._parsed = /* @__PURE__ */ new Map();
                this._headers = requestHeaders;
                const header = requestHeaders.get("cookie");
                if (header) {
                  const parsed = parseCookie(header);
                  for (const [name, value] of parsed) {
                    this._parsed.set(name, { name, value });
                  }
                }
              }
              [Symbol.iterator]() {
                return this._parsed[Symbol.iterator]();
              }
              /**
               * The amount of cookies received from the client
               */
              get size() {
                return this._parsed.size;
              }
              get(...args) {
                const name = typeof args[0] === "string" ? args[0] : args[0].name;
                return this._parsed.get(name);
              }
              getAll(...args) {
                var _a;
                const all = Array.from(this._parsed);
                if (!args.length) {
                  return all.map(([_, value]) => value);
                }
                const name = typeof args[0] === "string" ? args[0] : (_a = args[0]) == null ? void 0 : _a.name;
                return all.filter(([n]) => n === name).map(([_, value]) => value);
              }
              has(name) {
                return this._parsed.has(name);
              }
              set(...args) {
                const [name, value] = args.length === 1 ? [args[0].name, args[0].value] : args;
                const map = this._parsed;
                map.set(name, { name, value });
                this._headers.set(
                  "cookie",
                  Array.from(map).map(([_, value2]) => stringifyCookie(value2)).join("; ")
                );
                return this;
              }
              /**
               * Delete the cookies matching the passed name or names in the request.
               */
              delete(names) {
                const map = this._parsed;
                const result = !Array.isArray(names) ? map.delete(names) : names.map((name) => map.delete(name));
                this._headers.set(
                  "cookie",
                  Array.from(map).map(([_, value]) => stringifyCookie(value)).join("; ")
                );
                return result;
              }
              /**
               * Delete all the cookies in the cookies in the request.
               */
              clear() {
                this.delete(Array.from(this._parsed.keys()));
                return this;
              }
              /**
               * Format the cookies in the request as a string for logging
               */
              [Symbol.for("edge-runtime.inspect.custom")]() {
                return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
              }
              toString() {
                return [...this._parsed.values()].map((v) => `${v.name}=${encodeURIComponent(v.value)}`).join("; ");
              }
            };
            var ResponseCookies2 = class {
              constructor(responseHeaders) {
                this._parsed = /* @__PURE__ */ new Map();
                var _a, _b, _c;
                this._headers = responseHeaders;
                const setCookie = (_c = (_b = (_a = responseHeaders.getSetCookie) == null ? void 0 : _a.call(responseHeaders)) != null ? _b : responseHeaders.get("set-cookie")) != null ? _c : [];
                const cookieStrings = Array.isArray(setCookie) ? setCookie : splitCookiesString(setCookie);
                for (const cookieString of cookieStrings) {
                  const parsed = parseSetCookie(cookieString);
                  if (parsed)
                    this._parsed.set(parsed.name, parsed);
                }
              }
              /**
               * {@link https://wicg.github.io/cookie-store/#CookieStore-get CookieStore#get} without the Promise.
               */
              get(...args) {
                const key = typeof args[0] === "string" ? args[0] : args[0].name;
                return this._parsed.get(key);
              }
              /**
               * {@link https://wicg.github.io/cookie-store/#CookieStore-getAll CookieStore#getAll} without the Promise.
               */
              getAll(...args) {
                var _a;
                const all = Array.from(this._parsed.values());
                if (!args.length) {
                  return all;
                }
                const key = typeof args[0] === "string" ? args[0] : (_a = args[0]) == null ? void 0 : _a.name;
                return all.filter((c) => c.name === key);
              }
              has(name) {
                return this._parsed.has(name);
              }
              /**
               * {@link https://wicg.github.io/cookie-store/#CookieStore-set CookieStore#set} without the Promise.
               */
              set(...args) {
                const [name, value, cookie] = args.length === 1 ? [args[0].name, args[0].value, args[0]] : args;
                const map = this._parsed;
                map.set(name, normalizeCookie({ name, value, ...cookie }));
                replace(map, this._headers);
                return this;
              }
              /**
               * {@link https://wicg.github.io/cookie-store/#CookieStore-delete CookieStore#delete} without the Promise.
               */
              delete(...args) {
                const [name, path3, domain] = typeof args[0] === "string" ? [args[0]] : [args[0].name, args[0].path, args[0].domain];
                return this.set({ name, path: path3, domain, value: "", expires: /* @__PURE__ */ new Date(0) });
              }
              [Symbol.for("edge-runtime.inspect.custom")]() {
                return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
              }
              toString() {
                return [...this._parsed.values()].map(stringifyCookie).join("; ");
              }
            };
            function replace(bag, headers) {
              headers.delete("set-cookie");
              for (const [, value] of bag) {
                const serialized = stringifyCookie(value);
                headers.append("set-cookie", serialized);
              }
            }
            function normalizeCookie(cookie = { name: "", value: "" }) {
              if (typeof cookie.expires === "number") {
                cookie.expires = new Date(cookie.expires);
              }
              if (cookie.maxAge) {
                cookie.expires = new Date(Date.now() + cookie.maxAge * 1e3);
              }
              if (cookie.path === null || cookie.path === void 0) {
                cookie.path = "/";
              }
              return cookie;
            }
          }
        ),
        /***/
        439: (
          /***/
          (module2, __unused_webpack_exports, __webpack_require__) => {
            var __dirname2 = "/";
            (() => {
              "use strict";
              var e = { 491: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.ContextAPI = void 0;
                const n = r2(223);
                const a = r2(172);
                const o = r2(930);
                const i = "context";
                const c = new n.NoopContextManager();
                class ContextAPI {
                  constructor() {
                  }
                  static getInstance() {
                    if (!this._instance) {
                      this._instance = new ContextAPI();
                    }
                    return this._instance;
                  }
                  setGlobalContextManager(e3) {
                    return (0, a.registerGlobal)(i, e3, o.DiagAPI.instance());
                  }
                  active() {
                    return this._getContextManager().active();
                  }
                  with(e3, t3, r3, ...n2) {
                    return this._getContextManager().with(e3, t3, r3, ...n2);
                  }
                  bind(e3, t3) {
                    return this._getContextManager().bind(e3, t3);
                  }
                  _getContextManager() {
                    return (0, a.getGlobal)(i) || c;
                  }
                  disable() {
                    this._getContextManager().disable();
                    (0, a.unregisterGlobal)(i, o.DiagAPI.instance());
                  }
                }
                t2.ContextAPI = ContextAPI;
              }, 930: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.DiagAPI = void 0;
                const n = r2(56);
                const a = r2(912);
                const o = r2(957);
                const i = r2(172);
                const c = "diag";
                class DiagAPI {
                  constructor() {
                    function _logProxy(e4) {
                      return function(...t3) {
                        const r3 = (0, i.getGlobal)("diag");
                        if (!r3) return;
                        return r3[e4](...t3);
                      };
                    }
                    const e3 = this;
                    const setLogger = (t3, r3 = { logLevel: o.DiagLogLevel.INFO }) => {
                      var n2, c2, s;
                      if (t3 === e3) {
                        const t4 = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                        e3.error((n2 = t4.stack) !== null && n2 !== void 0 ? n2 : t4.message);
                        return false;
                      }
                      if (typeof r3 === "number") {
                        r3 = { logLevel: r3 };
                      }
                      const u = (0, i.getGlobal)("diag");
                      const l = (0, a.createLogLevelDiagLogger)((c2 = r3.logLevel) !== null && c2 !== void 0 ? c2 : o.DiagLogLevel.INFO, t3);
                      if (u && !r3.suppressOverrideMessage) {
                        const e4 = (s = new Error().stack) !== null && s !== void 0 ? s : "<failed to generate stacktrace>";
                        u.warn(`Current logger will be overwritten from ${e4}`);
                        l.warn(`Current logger will overwrite one already registered from ${e4}`);
                      }
                      return (0, i.registerGlobal)("diag", l, e3, true);
                    };
                    e3.setLogger = setLogger;
                    e3.disable = () => {
                      (0, i.unregisterGlobal)(c, e3);
                    };
                    e3.createComponentLogger = (e4) => new n.DiagComponentLogger(e4);
                    e3.verbose = _logProxy("verbose");
                    e3.debug = _logProxy("debug");
                    e3.info = _logProxy("info");
                    e3.warn = _logProxy("warn");
                    e3.error = _logProxy("error");
                  }
                  static instance() {
                    if (!this._instance) {
                      this._instance = new DiagAPI();
                    }
                    return this._instance;
                  }
                }
                t2.DiagAPI = DiagAPI;
              }, 653: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.MetricsAPI = void 0;
                const n = r2(660);
                const a = r2(172);
                const o = r2(930);
                const i = "metrics";
                class MetricsAPI {
                  constructor() {
                  }
                  static getInstance() {
                    if (!this._instance) {
                      this._instance = new MetricsAPI();
                    }
                    return this._instance;
                  }
                  setGlobalMeterProvider(e3) {
                    return (0, a.registerGlobal)(i, e3, o.DiagAPI.instance());
                  }
                  getMeterProvider() {
                    return (0, a.getGlobal)(i) || n.NOOP_METER_PROVIDER;
                  }
                  getMeter(e3, t3, r3) {
                    return this.getMeterProvider().getMeter(e3, t3, r3);
                  }
                  disable() {
                    (0, a.unregisterGlobal)(i, o.DiagAPI.instance());
                  }
                }
                t2.MetricsAPI = MetricsAPI;
              }, 181: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.PropagationAPI = void 0;
                const n = r2(172);
                const a = r2(874);
                const o = r2(194);
                const i = r2(277);
                const c = r2(369);
                const s = r2(930);
                const u = "propagation";
                const l = new a.NoopTextMapPropagator();
                class PropagationAPI {
                  constructor() {
                    this.createBaggage = c.createBaggage;
                    this.getBaggage = i.getBaggage;
                    this.getActiveBaggage = i.getActiveBaggage;
                    this.setBaggage = i.setBaggage;
                    this.deleteBaggage = i.deleteBaggage;
                  }
                  static getInstance() {
                    if (!this._instance) {
                      this._instance = new PropagationAPI();
                    }
                    return this._instance;
                  }
                  setGlobalPropagator(e3) {
                    return (0, n.registerGlobal)(u, e3, s.DiagAPI.instance());
                  }
                  inject(e3, t3, r3 = o.defaultTextMapSetter) {
                    return this._getGlobalPropagator().inject(e3, t3, r3);
                  }
                  extract(e3, t3, r3 = o.defaultTextMapGetter) {
                    return this._getGlobalPropagator().extract(e3, t3, r3);
                  }
                  fields() {
                    return this._getGlobalPropagator().fields();
                  }
                  disable() {
                    (0, n.unregisterGlobal)(u, s.DiagAPI.instance());
                  }
                  _getGlobalPropagator() {
                    return (0, n.getGlobal)(u) || l;
                  }
                }
                t2.PropagationAPI = PropagationAPI;
              }, 997: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.TraceAPI = void 0;
                const n = r2(172);
                const a = r2(846);
                const o = r2(139);
                const i = r2(607);
                const c = r2(930);
                const s = "trace";
                class TraceAPI {
                  constructor() {
                    this._proxyTracerProvider = new a.ProxyTracerProvider();
                    this.wrapSpanContext = o.wrapSpanContext;
                    this.isSpanContextValid = o.isSpanContextValid;
                    this.deleteSpan = i.deleteSpan;
                    this.getSpan = i.getSpan;
                    this.getActiveSpan = i.getActiveSpan;
                    this.getSpanContext = i.getSpanContext;
                    this.setSpan = i.setSpan;
                    this.setSpanContext = i.setSpanContext;
                  }
                  static getInstance() {
                    if (!this._instance) {
                      this._instance = new TraceAPI();
                    }
                    return this._instance;
                  }
                  setGlobalTracerProvider(e3) {
                    const t3 = (0, n.registerGlobal)(s, this._proxyTracerProvider, c.DiagAPI.instance());
                    if (t3) {
                      this._proxyTracerProvider.setDelegate(e3);
                    }
                    return t3;
                  }
                  getTracerProvider() {
                    return (0, n.getGlobal)(s) || this._proxyTracerProvider;
                  }
                  getTracer(e3, t3) {
                    return this.getTracerProvider().getTracer(e3, t3);
                  }
                  disable() {
                    (0, n.unregisterGlobal)(s, c.DiagAPI.instance());
                    this._proxyTracerProvider = new a.ProxyTracerProvider();
                  }
                }
                t2.TraceAPI = TraceAPI;
              }, 277: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.deleteBaggage = t2.setBaggage = t2.getActiveBaggage = t2.getBaggage = void 0;
                const n = r2(491);
                const a = r2(780);
                const o = (0, a.createContextKey)("OpenTelemetry Baggage Key");
                function getBaggage(e3) {
                  return e3.getValue(o) || void 0;
                }
                t2.getBaggage = getBaggage;
                function getActiveBaggage() {
                  return getBaggage(n.ContextAPI.getInstance().active());
                }
                t2.getActiveBaggage = getActiveBaggage;
                function setBaggage(e3, t3) {
                  return e3.setValue(o, t3);
                }
                t2.setBaggage = setBaggage;
                function deleteBaggage(e3) {
                  return e3.deleteValue(o);
                }
                t2.deleteBaggage = deleteBaggage;
              }, 993: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.BaggageImpl = void 0;
                class BaggageImpl {
                  constructor(e3) {
                    this._entries = e3 ? new Map(e3) : /* @__PURE__ */ new Map();
                  }
                  getEntry(e3) {
                    const t3 = this._entries.get(e3);
                    if (!t3) {
                      return void 0;
                    }
                    return Object.assign({}, t3);
                  }
                  getAllEntries() {
                    return Array.from(this._entries.entries()).map(([e3, t3]) => [e3, t3]);
                  }
                  setEntry(e3, t3) {
                    const r2 = new BaggageImpl(this._entries);
                    r2._entries.set(e3, t3);
                    return r2;
                  }
                  removeEntry(e3) {
                    const t3 = new BaggageImpl(this._entries);
                    t3._entries.delete(e3);
                    return t3;
                  }
                  removeEntries(...e3) {
                    const t3 = new BaggageImpl(this._entries);
                    for (const r2 of e3) {
                      t3._entries.delete(r2);
                    }
                    return t3;
                  }
                  clear() {
                    return new BaggageImpl();
                  }
                }
                t2.BaggageImpl = BaggageImpl;
              }, 830: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.baggageEntryMetadataSymbol = void 0;
                t2.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
              }, 369: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.baggageEntryMetadataFromString = t2.createBaggage = void 0;
                const n = r2(930);
                const a = r2(993);
                const o = r2(830);
                const i = n.DiagAPI.instance();
                function createBaggage(e3 = {}) {
                  return new a.BaggageImpl(new Map(Object.entries(e3)));
                }
                t2.createBaggage = createBaggage;
                function baggageEntryMetadataFromString(e3) {
                  if (typeof e3 !== "string") {
                    i.error(`Cannot create baggage metadata from unknown type: ${typeof e3}`);
                    e3 = "";
                  }
                  return { __TYPE__: o.baggageEntryMetadataSymbol, toString() {
                    return e3;
                  } };
                }
                t2.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
              }, 67: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.context = void 0;
                const n = r2(491);
                t2.context = n.ContextAPI.getInstance();
              }, 223: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.NoopContextManager = void 0;
                const n = r2(780);
                class NoopContextManager {
                  active() {
                    return n.ROOT_CONTEXT;
                  }
                  with(e3, t3, r3, ...n2) {
                    return t3.call(r3, ...n2);
                  }
                  bind(e3, t3) {
                    return t3;
                  }
                  enable() {
                    return this;
                  }
                  disable() {
                    return this;
                  }
                }
                t2.NoopContextManager = NoopContextManager;
              }, 780: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.ROOT_CONTEXT = t2.createContextKey = void 0;
                function createContextKey(e3) {
                  return Symbol.for(e3);
                }
                t2.createContextKey = createContextKey;
                class BaseContext {
                  constructor(e3) {
                    const t3 = this;
                    t3._currentContext = e3 ? new Map(e3) : /* @__PURE__ */ new Map();
                    t3.getValue = (e4) => t3._currentContext.get(e4);
                    t3.setValue = (e4, r2) => {
                      const n = new BaseContext(t3._currentContext);
                      n._currentContext.set(e4, r2);
                      return n;
                    };
                    t3.deleteValue = (e4) => {
                      const r2 = new BaseContext(t3._currentContext);
                      r2._currentContext.delete(e4);
                      return r2;
                    };
                  }
                }
                t2.ROOT_CONTEXT = new BaseContext();
              }, 506: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.diag = void 0;
                const n = r2(930);
                t2.diag = n.DiagAPI.instance();
              }, 56: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.DiagComponentLogger = void 0;
                const n = r2(172);
                class DiagComponentLogger {
                  constructor(e3) {
                    this._namespace = e3.namespace || "DiagComponentLogger";
                  }
                  debug(...e3) {
                    return logProxy("debug", this._namespace, e3);
                  }
                  error(...e3) {
                    return logProxy("error", this._namespace, e3);
                  }
                  info(...e3) {
                    return logProxy("info", this._namespace, e3);
                  }
                  warn(...e3) {
                    return logProxy("warn", this._namespace, e3);
                  }
                  verbose(...e3) {
                    return logProxy("verbose", this._namespace, e3);
                  }
                }
                t2.DiagComponentLogger = DiagComponentLogger;
                function logProxy(e3, t3, r3) {
                  const a = (0, n.getGlobal)("diag");
                  if (!a) {
                    return;
                  }
                  r3.unshift(t3);
                  return a[e3](...r3);
                }
              }, 972: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.DiagConsoleLogger = void 0;
                const r2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
                class DiagConsoleLogger {
                  constructor() {
                    function _consoleFunc(e3) {
                      return function(...t3) {
                        if (console) {
                          let r3 = console[e3];
                          if (typeof r3 !== "function") {
                            r3 = console.log;
                          }
                          if (typeof r3 === "function") {
                            return r3.apply(console, t3);
                          }
                        }
                      };
                    }
                    for (let e3 = 0; e3 < r2.length; e3++) {
                      this[r2[e3].n] = _consoleFunc(r2[e3].c);
                    }
                  }
                }
                t2.DiagConsoleLogger = DiagConsoleLogger;
              }, 912: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.createLogLevelDiagLogger = void 0;
                const n = r2(957);
                function createLogLevelDiagLogger(e3, t3) {
                  if (e3 < n.DiagLogLevel.NONE) {
                    e3 = n.DiagLogLevel.NONE;
                  } else if (e3 > n.DiagLogLevel.ALL) {
                    e3 = n.DiagLogLevel.ALL;
                  }
                  t3 = t3 || {};
                  function _filterFunc(r3, n2) {
                    const a = t3[r3];
                    if (typeof a === "function" && e3 >= n2) {
                      return a.bind(t3);
                    }
                    return function() {
                    };
                  }
                  return { error: _filterFunc("error", n.DiagLogLevel.ERROR), warn: _filterFunc("warn", n.DiagLogLevel.WARN), info: _filterFunc("info", n.DiagLogLevel.INFO), debug: _filterFunc("debug", n.DiagLogLevel.DEBUG), verbose: _filterFunc("verbose", n.DiagLogLevel.VERBOSE) };
                }
                t2.createLogLevelDiagLogger = createLogLevelDiagLogger;
              }, 957: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.DiagLogLevel = void 0;
                var r2;
                (function(e3) {
                  e3[e3["NONE"] = 0] = "NONE";
                  e3[e3["ERROR"] = 30] = "ERROR";
                  e3[e3["WARN"] = 50] = "WARN";
                  e3[e3["INFO"] = 60] = "INFO";
                  e3[e3["DEBUG"] = 70] = "DEBUG";
                  e3[e3["VERBOSE"] = 80] = "VERBOSE";
                  e3[e3["ALL"] = 9999] = "ALL";
                })(r2 = t2.DiagLogLevel || (t2.DiagLogLevel = {}));
              }, 172: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.unregisterGlobal = t2.getGlobal = t2.registerGlobal = void 0;
                const n = r2(200);
                const a = r2(521);
                const o = r2(130);
                const i = a.VERSION.split(".")[0];
                const c = Symbol.for(`opentelemetry.js.api.${i}`);
                const s = n._globalThis;
                function registerGlobal(e3, t3, r3, n2 = false) {
                  var o2;
                  const i2 = s[c] = (o2 = s[c]) !== null && o2 !== void 0 ? o2 : { version: a.VERSION };
                  if (!n2 && i2[e3]) {
                    const t4 = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e3}`);
                    r3.error(t4.stack || t4.message);
                    return false;
                  }
                  if (i2.version !== a.VERSION) {
                    const t4 = new Error(`@opentelemetry/api: Registration of version v${i2.version} for ${e3} does not match previously registered API v${a.VERSION}`);
                    r3.error(t4.stack || t4.message);
                    return false;
                  }
                  i2[e3] = t3;
                  r3.debug(`@opentelemetry/api: Registered a global for ${e3} v${a.VERSION}.`);
                  return true;
                }
                t2.registerGlobal = registerGlobal;
                function getGlobal(e3) {
                  var t3, r3;
                  const n2 = (t3 = s[c]) === null || t3 === void 0 ? void 0 : t3.version;
                  if (!n2 || !(0, o.isCompatible)(n2)) {
                    return;
                  }
                  return (r3 = s[c]) === null || r3 === void 0 ? void 0 : r3[e3];
                }
                t2.getGlobal = getGlobal;
                function unregisterGlobal(e3, t3) {
                  t3.debug(`@opentelemetry/api: Unregistering a global for ${e3} v${a.VERSION}.`);
                  const r3 = s[c];
                  if (r3) {
                    delete r3[e3];
                  }
                }
                t2.unregisterGlobal = unregisterGlobal;
              }, 130: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.isCompatible = t2._makeCompatibilityCheck = void 0;
                const n = r2(521);
                const a = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
                function _makeCompatibilityCheck(e3) {
                  const t3 = /* @__PURE__ */ new Set([e3]);
                  const r3 = /* @__PURE__ */ new Set();
                  const n2 = e3.match(a);
                  if (!n2) {
                    return () => false;
                  }
                  const o = { major: +n2[1], minor: +n2[2], patch: +n2[3], prerelease: n2[4] };
                  if (o.prerelease != null) {
                    return function isExactmatch(t4) {
                      return t4 === e3;
                    };
                  }
                  function _reject(e4) {
                    r3.add(e4);
                    return false;
                  }
                  function _accept(e4) {
                    t3.add(e4);
                    return true;
                  }
                  return function isCompatible(e4) {
                    if (t3.has(e4)) {
                      return true;
                    }
                    if (r3.has(e4)) {
                      return false;
                    }
                    const n3 = e4.match(a);
                    if (!n3) {
                      return _reject(e4);
                    }
                    const i = { major: +n3[1], minor: +n3[2], patch: +n3[3], prerelease: n3[4] };
                    if (i.prerelease != null) {
                      return _reject(e4);
                    }
                    if (o.major !== i.major) {
                      return _reject(e4);
                    }
                    if (o.major === 0) {
                      if (o.minor === i.minor && o.patch <= i.patch) {
                        return _accept(e4);
                      }
                      return _reject(e4);
                    }
                    if (o.minor <= i.minor) {
                      return _accept(e4);
                    }
                    return _reject(e4);
                  };
                }
                t2._makeCompatibilityCheck = _makeCompatibilityCheck;
                t2.isCompatible = _makeCompatibilityCheck(n.VERSION);
              }, 886: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.metrics = void 0;
                const n = r2(653);
                t2.metrics = n.MetricsAPI.getInstance();
              }, 901: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.ValueType = void 0;
                var r2;
                (function(e3) {
                  e3[e3["INT"] = 0] = "INT";
                  e3[e3["DOUBLE"] = 1] = "DOUBLE";
                })(r2 = t2.ValueType || (t2.ValueType = {}));
              }, 102: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.createNoopMeter = t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t2.NOOP_OBSERVABLE_GAUGE_METRIC = t2.NOOP_OBSERVABLE_COUNTER_METRIC = t2.NOOP_UP_DOWN_COUNTER_METRIC = t2.NOOP_HISTOGRAM_METRIC = t2.NOOP_COUNTER_METRIC = t2.NOOP_METER = t2.NoopObservableUpDownCounterMetric = t2.NoopObservableGaugeMetric = t2.NoopObservableCounterMetric = t2.NoopObservableMetric = t2.NoopHistogramMetric = t2.NoopUpDownCounterMetric = t2.NoopCounterMetric = t2.NoopMetric = t2.NoopMeter = void 0;
                class NoopMeter {
                  constructor() {
                  }
                  createHistogram(e3, r2) {
                    return t2.NOOP_HISTOGRAM_METRIC;
                  }
                  createCounter(e3, r2) {
                    return t2.NOOP_COUNTER_METRIC;
                  }
                  createUpDownCounter(e3, r2) {
                    return t2.NOOP_UP_DOWN_COUNTER_METRIC;
                  }
                  createObservableGauge(e3, r2) {
                    return t2.NOOP_OBSERVABLE_GAUGE_METRIC;
                  }
                  createObservableCounter(e3, r2) {
                    return t2.NOOP_OBSERVABLE_COUNTER_METRIC;
                  }
                  createObservableUpDownCounter(e3, r2) {
                    return t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
                  }
                  addBatchObservableCallback(e3, t3) {
                  }
                  removeBatchObservableCallback(e3) {
                  }
                }
                t2.NoopMeter = NoopMeter;
                class NoopMetric {
                }
                t2.NoopMetric = NoopMetric;
                class NoopCounterMetric extends NoopMetric {
                  add(e3, t3) {
                  }
                }
                t2.NoopCounterMetric = NoopCounterMetric;
                class NoopUpDownCounterMetric extends NoopMetric {
                  add(e3, t3) {
                  }
                }
                t2.NoopUpDownCounterMetric = NoopUpDownCounterMetric;
                class NoopHistogramMetric extends NoopMetric {
                  record(e3, t3) {
                  }
                }
                t2.NoopHistogramMetric = NoopHistogramMetric;
                class NoopObservableMetric {
                  addCallback(e3) {
                  }
                  removeCallback(e3) {
                  }
                }
                t2.NoopObservableMetric = NoopObservableMetric;
                class NoopObservableCounterMetric extends NoopObservableMetric {
                }
                t2.NoopObservableCounterMetric = NoopObservableCounterMetric;
                class NoopObservableGaugeMetric extends NoopObservableMetric {
                }
                t2.NoopObservableGaugeMetric = NoopObservableGaugeMetric;
                class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
                }
                t2.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
                t2.NOOP_METER = new NoopMeter();
                t2.NOOP_COUNTER_METRIC = new NoopCounterMetric();
                t2.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
                t2.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
                t2.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
                t2.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
                t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
                function createNoopMeter() {
                  return t2.NOOP_METER;
                }
                t2.createNoopMeter = createNoopMeter;
              }, 660: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.NOOP_METER_PROVIDER = t2.NoopMeterProvider = void 0;
                const n = r2(102);
                class NoopMeterProvider {
                  getMeter(e3, t3, r3) {
                    return n.NOOP_METER;
                  }
                }
                t2.NoopMeterProvider = NoopMeterProvider;
                t2.NOOP_METER_PROVIDER = new NoopMeterProvider();
              }, 200: function(e2, t2, r2) {
                var n = this && this.__createBinding || (Object.create ? function(e3, t3, r3, n2) {
                  if (n2 === void 0) n2 = r3;
                  Object.defineProperty(e3, n2, { enumerable: true, get: function() {
                    return t3[r3];
                  } });
                } : function(e3, t3, r3, n2) {
                  if (n2 === void 0) n2 = r3;
                  e3[n2] = t3[r3];
                });
                var a = this && this.__exportStar || function(e3, t3) {
                  for (var r3 in e3) if (r3 !== "default" && !Object.prototype.hasOwnProperty.call(t3, r3)) n(t3, e3, r3);
                };
                Object.defineProperty(t2, "__esModule", { value: true });
                a(r2(46), t2);
              }, 651: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2._globalThis = void 0;
                t2._globalThis = typeof globalThis === "object" ? globalThis : __webpack_require__.g;
              }, 46: function(e2, t2, r2) {
                var n = this && this.__createBinding || (Object.create ? function(e3, t3, r3, n2) {
                  if (n2 === void 0) n2 = r3;
                  Object.defineProperty(e3, n2, { enumerable: true, get: function() {
                    return t3[r3];
                  } });
                } : function(e3, t3, r3, n2) {
                  if (n2 === void 0) n2 = r3;
                  e3[n2] = t3[r3];
                });
                var a = this && this.__exportStar || function(e3, t3) {
                  for (var r3 in e3) if (r3 !== "default" && !Object.prototype.hasOwnProperty.call(t3, r3)) n(t3, e3, r3);
                };
                Object.defineProperty(t2, "__esModule", { value: true });
                a(r2(651), t2);
              }, 939: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.propagation = void 0;
                const n = r2(181);
                t2.propagation = n.PropagationAPI.getInstance();
              }, 874: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.NoopTextMapPropagator = void 0;
                class NoopTextMapPropagator {
                  inject(e3, t3) {
                  }
                  extract(e3, t3) {
                    return e3;
                  }
                  fields() {
                    return [];
                  }
                }
                t2.NoopTextMapPropagator = NoopTextMapPropagator;
              }, 194: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.defaultTextMapSetter = t2.defaultTextMapGetter = void 0;
                t2.defaultTextMapGetter = { get(e3, t3) {
                  if (e3 == null) {
                    return void 0;
                  }
                  return e3[t3];
                }, keys(e3) {
                  if (e3 == null) {
                    return [];
                  }
                  return Object.keys(e3);
                } };
                t2.defaultTextMapSetter = { set(e3, t3, r2) {
                  if (e3 == null) {
                    return;
                  }
                  e3[t3] = r2;
                } };
              }, 845: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.trace = void 0;
                const n = r2(997);
                t2.trace = n.TraceAPI.getInstance();
              }, 403: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.NonRecordingSpan = void 0;
                const n = r2(476);
                class NonRecordingSpan {
                  constructor(e3 = n.INVALID_SPAN_CONTEXT) {
                    this._spanContext = e3;
                  }
                  spanContext() {
                    return this._spanContext;
                  }
                  setAttribute(e3, t3) {
                    return this;
                  }
                  setAttributes(e3) {
                    return this;
                  }
                  addEvent(e3, t3) {
                    return this;
                  }
                  setStatus(e3) {
                    return this;
                  }
                  updateName(e3) {
                    return this;
                  }
                  end(e3) {
                  }
                  isRecording() {
                    return false;
                  }
                  recordException(e3, t3) {
                  }
                }
                t2.NonRecordingSpan = NonRecordingSpan;
              }, 614: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.NoopTracer = void 0;
                const n = r2(491);
                const a = r2(607);
                const o = r2(403);
                const i = r2(139);
                const c = n.ContextAPI.getInstance();
                class NoopTracer {
                  startSpan(e3, t3, r3 = c.active()) {
                    const n2 = Boolean(t3 === null || t3 === void 0 ? void 0 : t3.root);
                    if (n2) {
                      return new o.NonRecordingSpan();
                    }
                    const s = r3 && (0, a.getSpanContext)(r3);
                    if (isSpanContext(s) && (0, i.isSpanContextValid)(s)) {
                      return new o.NonRecordingSpan(s);
                    } else {
                      return new o.NonRecordingSpan();
                    }
                  }
                  startActiveSpan(e3, t3, r3, n2) {
                    let o2;
                    let i2;
                    let s;
                    if (arguments.length < 2) {
                      return;
                    } else if (arguments.length === 2) {
                      s = t3;
                    } else if (arguments.length === 3) {
                      o2 = t3;
                      s = r3;
                    } else {
                      o2 = t3;
                      i2 = r3;
                      s = n2;
                    }
                    const u = i2 !== null && i2 !== void 0 ? i2 : c.active();
                    const l = this.startSpan(e3, o2, u);
                    const g = (0, a.setSpan)(u, l);
                    return c.with(g, s, void 0, l);
                  }
                }
                t2.NoopTracer = NoopTracer;
                function isSpanContext(e3) {
                  return typeof e3 === "object" && typeof e3["spanId"] === "string" && typeof e3["traceId"] === "string" && typeof e3["traceFlags"] === "number";
                }
              }, 124: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.NoopTracerProvider = void 0;
                const n = r2(614);
                class NoopTracerProvider {
                  getTracer(e3, t3, r3) {
                    return new n.NoopTracer();
                  }
                }
                t2.NoopTracerProvider = NoopTracerProvider;
              }, 125: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.ProxyTracer = void 0;
                const n = r2(614);
                const a = new n.NoopTracer();
                class ProxyTracer {
                  constructor(e3, t3, r3, n2) {
                    this._provider = e3;
                    this.name = t3;
                    this.version = r3;
                    this.options = n2;
                  }
                  startSpan(e3, t3, r3) {
                    return this._getTracer().startSpan(e3, t3, r3);
                  }
                  startActiveSpan(e3, t3, r3, n2) {
                    const a2 = this._getTracer();
                    return Reflect.apply(a2.startActiveSpan, a2, arguments);
                  }
                  _getTracer() {
                    if (this._delegate) {
                      return this._delegate;
                    }
                    const e3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
                    if (!e3) {
                      return a;
                    }
                    this._delegate = e3;
                    return this._delegate;
                  }
                }
                t2.ProxyTracer = ProxyTracer;
              }, 846: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.ProxyTracerProvider = void 0;
                const n = r2(125);
                const a = r2(124);
                const o = new a.NoopTracerProvider();
                class ProxyTracerProvider {
                  getTracer(e3, t3, r3) {
                    var a2;
                    return (a2 = this.getDelegateTracer(e3, t3, r3)) !== null && a2 !== void 0 ? a2 : new n.ProxyTracer(this, e3, t3, r3);
                  }
                  getDelegate() {
                    var e3;
                    return (e3 = this._delegate) !== null && e3 !== void 0 ? e3 : o;
                  }
                  setDelegate(e3) {
                    this._delegate = e3;
                  }
                  getDelegateTracer(e3, t3, r3) {
                    var n2;
                    return (n2 = this._delegate) === null || n2 === void 0 ? void 0 : n2.getTracer(e3, t3, r3);
                  }
                }
                t2.ProxyTracerProvider = ProxyTracerProvider;
              }, 996: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.SamplingDecision = void 0;
                var r2;
                (function(e3) {
                  e3[e3["NOT_RECORD"] = 0] = "NOT_RECORD";
                  e3[e3["RECORD"] = 1] = "RECORD";
                  e3[e3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
                })(r2 = t2.SamplingDecision || (t2.SamplingDecision = {}));
              }, 607: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.getSpanContext = t2.setSpanContext = t2.deleteSpan = t2.setSpan = t2.getActiveSpan = t2.getSpan = void 0;
                const n = r2(780);
                const a = r2(403);
                const o = r2(491);
                const i = (0, n.createContextKey)("OpenTelemetry Context Key SPAN");
                function getSpan(e3) {
                  return e3.getValue(i) || void 0;
                }
                t2.getSpan = getSpan;
                function getActiveSpan() {
                  return getSpan(o.ContextAPI.getInstance().active());
                }
                t2.getActiveSpan = getActiveSpan;
                function setSpan(e3, t3) {
                  return e3.setValue(i, t3);
                }
                t2.setSpan = setSpan;
                function deleteSpan(e3) {
                  return e3.deleteValue(i);
                }
                t2.deleteSpan = deleteSpan;
                function setSpanContext(e3, t3) {
                  return setSpan(e3, new a.NonRecordingSpan(t3));
                }
                t2.setSpanContext = setSpanContext;
                function getSpanContext(e3) {
                  var t3;
                  return (t3 = getSpan(e3)) === null || t3 === void 0 ? void 0 : t3.spanContext();
                }
                t2.getSpanContext = getSpanContext;
              }, 325: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.TraceStateImpl = void 0;
                const n = r2(564);
                const a = 32;
                const o = 512;
                const i = ",";
                const c = "=";
                class TraceStateImpl {
                  constructor(e3) {
                    this._internalState = /* @__PURE__ */ new Map();
                    if (e3) this._parse(e3);
                  }
                  set(e3, t3) {
                    const r3 = this._clone();
                    if (r3._internalState.has(e3)) {
                      r3._internalState.delete(e3);
                    }
                    r3._internalState.set(e3, t3);
                    return r3;
                  }
                  unset(e3) {
                    const t3 = this._clone();
                    t3._internalState.delete(e3);
                    return t3;
                  }
                  get(e3) {
                    return this._internalState.get(e3);
                  }
                  serialize() {
                    return this._keys().reduce((e3, t3) => {
                      e3.push(t3 + c + this.get(t3));
                      return e3;
                    }, []).join(i);
                  }
                  _parse(e3) {
                    if (e3.length > o) return;
                    this._internalState = e3.split(i).reverse().reduce((e4, t3) => {
                      const r3 = t3.trim();
                      const a2 = r3.indexOf(c);
                      if (a2 !== -1) {
                        const o2 = r3.slice(0, a2);
                        const i2 = r3.slice(a2 + 1, t3.length);
                        if ((0, n.validateKey)(o2) && (0, n.validateValue)(i2)) {
                          e4.set(o2, i2);
                        } else {
                        }
                      }
                      return e4;
                    }, /* @__PURE__ */ new Map());
                    if (this._internalState.size > a) {
                      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, a));
                    }
                  }
                  _keys() {
                    return Array.from(this._internalState.keys()).reverse();
                  }
                  _clone() {
                    const e3 = new TraceStateImpl();
                    e3._internalState = new Map(this._internalState);
                    return e3;
                  }
                }
                t2.TraceStateImpl = TraceStateImpl;
              }, 564: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.validateValue = t2.validateKey = void 0;
                const r2 = "[_0-9a-z-*/]";
                const n = `[a-z]${r2}{0,255}`;
                const a = `[a-z0-9]${r2}{0,240}@[a-z]${r2}{0,13}`;
                const o = new RegExp(`^(?:${n}|${a})$`);
                const i = /^[ -~]{0,255}[!-~]$/;
                const c = /,|=/;
                function validateKey(e3) {
                  return o.test(e3);
                }
                t2.validateKey = validateKey;
                function validateValue(e3) {
                  return i.test(e3) && !c.test(e3);
                }
                t2.validateValue = validateValue;
              }, 98: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.createTraceState = void 0;
                const n = r2(325);
                function createTraceState(e3) {
                  return new n.TraceStateImpl(e3);
                }
                t2.createTraceState = createTraceState;
              }, 476: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.INVALID_SPAN_CONTEXT = t2.INVALID_TRACEID = t2.INVALID_SPANID = void 0;
                const n = r2(475);
                t2.INVALID_SPANID = "0000000000000000";
                t2.INVALID_TRACEID = "00000000000000000000000000000000";
                t2.INVALID_SPAN_CONTEXT = { traceId: t2.INVALID_TRACEID, spanId: t2.INVALID_SPANID, traceFlags: n.TraceFlags.NONE };
              }, 357: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.SpanKind = void 0;
                var r2;
                (function(e3) {
                  e3[e3["INTERNAL"] = 0] = "INTERNAL";
                  e3[e3["SERVER"] = 1] = "SERVER";
                  e3[e3["CLIENT"] = 2] = "CLIENT";
                  e3[e3["PRODUCER"] = 3] = "PRODUCER";
                  e3[e3["CONSUMER"] = 4] = "CONSUMER";
                })(r2 = t2.SpanKind || (t2.SpanKind = {}));
              }, 139: (e2, t2, r2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.wrapSpanContext = t2.isSpanContextValid = t2.isValidSpanId = t2.isValidTraceId = void 0;
                const n = r2(476);
                const a = r2(403);
                const o = /^([0-9a-f]{32})$/i;
                const i = /^[0-9a-f]{16}$/i;
                function isValidTraceId(e3) {
                  return o.test(e3) && e3 !== n.INVALID_TRACEID;
                }
                t2.isValidTraceId = isValidTraceId;
                function isValidSpanId(e3) {
                  return i.test(e3) && e3 !== n.INVALID_SPANID;
                }
                t2.isValidSpanId = isValidSpanId;
                function isSpanContextValid(e3) {
                  return isValidTraceId(e3.traceId) && isValidSpanId(e3.spanId);
                }
                t2.isSpanContextValid = isSpanContextValid;
                function wrapSpanContext(e3) {
                  return new a.NonRecordingSpan(e3);
                }
                t2.wrapSpanContext = wrapSpanContext;
              }, 847: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.SpanStatusCode = void 0;
                var r2;
                (function(e3) {
                  e3[e3["UNSET"] = 0] = "UNSET";
                  e3[e3["OK"] = 1] = "OK";
                  e3[e3["ERROR"] = 2] = "ERROR";
                })(r2 = t2.SpanStatusCode || (t2.SpanStatusCode = {}));
              }, 475: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.TraceFlags = void 0;
                var r2;
                (function(e3) {
                  e3[e3["NONE"] = 0] = "NONE";
                  e3[e3["SAMPLED"] = 1] = "SAMPLED";
                })(r2 = t2.TraceFlags || (t2.TraceFlags = {}));
              }, 521: (e2, t2) => {
                Object.defineProperty(t2, "__esModule", { value: true });
                t2.VERSION = void 0;
                t2.VERSION = "1.6.0";
              } };
              var t = {};
              function __nccwpck_require__2(r2) {
                var n = t[r2];
                if (n !== void 0) {
                  return n.exports;
                }
                var a = t[r2] = { exports: {} };
                var o = true;
                try {
                  e[r2].call(a.exports, a, a.exports, __nccwpck_require__2);
                  o = false;
                } finally {
                  if (o) delete t[r2];
                }
                return a.exports;
              }
              if (typeof __nccwpck_require__2 !== "undefined") __nccwpck_require__2.ab = __dirname2 + "/";
              var r = {};
              (() => {
                var e2 = r;
                Object.defineProperty(e2, "__esModule", { value: true });
                e2.trace = e2.propagation = e2.metrics = e2.diag = e2.context = e2.INVALID_SPAN_CONTEXT = e2.INVALID_TRACEID = e2.INVALID_SPANID = e2.isValidSpanId = e2.isValidTraceId = e2.isSpanContextValid = e2.createTraceState = e2.TraceFlags = e2.SpanStatusCode = e2.SpanKind = e2.SamplingDecision = e2.ProxyTracerProvider = e2.ProxyTracer = e2.defaultTextMapSetter = e2.defaultTextMapGetter = e2.ValueType = e2.createNoopMeter = e2.DiagLogLevel = e2.DiagConsoleLogger = e2.ROOT_CONTEXT = e2.createContextKey = e2.baggageEntryMetadataFromString = void 0;
                var t2 = __nccwpck_require__2(369);
                Object.defineProperty(e2, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
                  return t2.baggageEntryMetadataFromString;
                } });
                var n = __nccwpck_require__2(780);
                Object.defineProperty(e2, "createContextKey", { enumerable: true, get: function() {
                  return n.createContextKey;
                } });
                Object.defineProperty(e2, "ROOT_CONTEXT", { enumerable: true, get: function() {
                  return n.ROOT_CONTEXT;
                } });
                var a = __nccwpck_require__2(972);
                Object.defineProperty(e2, "DiagConsoleLogger", { enumerable: true, get: function() {
                  return a.DiagConsoleLogger;
                } });
                var o = __nccwpck_require__2(957);
                Object.defineProperty(e2, "DiagLogLevel", { enumerable: true, get: function() {
                  return o.DiagLogLevel;
                } });
                var i = __nccwpck_require__2(102);
                Object.defineProperty(e2, "createNoopMeter", { enumerable: true, get: function() {
                  return i.createNoopMeter;
                } });
                var c = __nccwpck_require__2(901);
                Object.defineProperty(e2, "ValueType", { enumerable: true, get: function() {
                  return c.ValueType;
                } });
                var s = __nccwpck_require__2(194);
                Object.defineProperty(e2, "defaultTextMapGetter", { enumerable: true, get: function() {
                  return s.defaultTextMapGetter;
                } });
                Object.defineProperty(e2, "defaultTextMapSetter", { enumerable: true, get: function() {
                  return s.defaultTextMapSetter;
                } });
                var u = __nccwpck_require__2(125);
                Object.defineProperty(e2, "ProxyTracer", { enumerable: true, get: function() {
                  return u.ProxyTracer;
                } });
                var l = __nccwpck_require__2(846);
                Object.defineProperty(e2, "ProxyTracerProvider", { enumerable: true, get: function() {
                  return l.ProxyTracerProvider;
                } });
                var g = __nccwpck_require__2(996);
                Object.defineProperty(e2, "SamplingDecision", { enumerable: true, get: function() {
                  return g.SamplingDecision;
                } });
                var p = __nccwpck_require__2(357);
                Object.defineProperty(e2, "SpanKind", { enumerable: true, get: function() {
                  return p.SpanKind;
                } });
                var d = __nccwpck_require__2(847);
                Object.defineProperty(e2, "SpanStatusCode", { enumerable: true, get: function() {
                  return d.SpanStatusCode;
                } });
                var _ = __nccwpck_require__2(475);
                Object.defineProperty(e2, "TraceFlags", { enumerable: true, get: function() {
                  return _.TraceFlags;
                } });
                var f = __nccwpck_require__2(98);
                Object.defineProperty(e2, "createTraceState", { enumerable: true, get: function() {
                  return f.createTraceState;
                } });
                var b = __nccwpck_require__2(139);
                Object.defineProperty(e2, "isSpanContextValid", { enumerable: true, get: function() {
                  return b.isSpanContextValid;
                } });
                Object.defineProperty(e2, "isValidTraceId", { enumerable: true, get: function() {
                  return b.isValidTraceId;
                } });
                Object.defineProperty(e2, "isValidSpanId", { enumerable: true, get: function() {
                  return b.isValidSpanId;
                } });
                var v = __nccwpck_require__2(476);
                Object.defineProperty(e2, "INVALID_SPANID", { enumerable: true, get: function() {
                  return v.INVALID_SPANID;
                } });
                Object.defineProperty(e2, "INVALID_TRACEID", { enumerable: true, get: function() {
                  return v.INVALID_TRACEID;
                } });
                Object.defineProperty(e2, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
                  return v.INVALID_SPAN_CONTEXT;
                } });
                const O = __nccwpck_require__2(67);
                Object.defineProperty(e2, "context", { enumerable: true, get: function() {
                  return O.context;
                } });
                const P = __nccwpck_require__2(506);
                Object.defineProperty(e2, "diag", { enumerable: true, get: function() {
                  return P.diag;
                } });
                const N = __nccwpck_require__2(886);
                Object.defineProperty(e2, "metrics", { enumerable: true, get: function() {
                  return N.metrics;
                } });
                const S = __nccwpck_require__2(939);
                Object.defineProperty(e2, "propagation", { enumerable: true, get: function() {
                  return S.propagation;
                } });
                const C = __nccwpck_require__2(845);
                Object.defineProperty(e2, "trace", { enumerable: true, get: function() {
                  return C.trace;
                } });
                e2["default"] = { context: O.context, diag: P.diag, metrics: N.metrics, propagation: S.propagation, trace: C.trace };
              })();
              module2.exports = r;
            })();
          }
        ),
        /***/
        133: (
          /***/
          (module2) => {
            var __dirname2 = "/";
            (() => {
              "use strict";
              if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = __dirname2 + "/";
              var e = {};
              (() => {
                var r = e;
                r.parse = parse3;
                r.serialize = serialize;
                var i = decodeURIComponent;
                var t = encodeURIComponent;
                var a = /; */;
                var n = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
                function parse3(e2, r2) {
                  if (typeof e2 !== "string") {
                    throw new TypeError("argument str must be a string");
                  }
                  var t2 = {};
                  var n2 = r2 || {};
                  var o = e2.split(a);
                  var s = n2.decode || i;
                  for (var p = 0; p < o.length; p++) {
                    var f = o[p];
                    var u = f.indexOf("=");
                    if (u < 0) {
                      continue;
                    }
                    var v = f.substr(0, u).trim();
                    var c = f.substr(++u, f.length).trim();
                    if ('"' == c[0]) {
                      c = c.slice(1, -1);
                    }
                    if (void 0 == t2[v]) {
                      t2[v] = tryDecode(c, s);
                    }
                  }
                  return t2;
                }
                function serialize(e2, r2, i2) {
                  var a2 = i2 || {};
                  var o = a2.encode || t;
                  if (typeof o !== "function") {
                    throw new TypeError("option encode is invalid");
                  }
                  if (!n.test(e2)) {
                    throw new TypeError("argument name is invalid");
                  }
                  var s = o(r2);
                  if (s && !n.test(s)) {
                    throw new TypeError("argument val is invalid");
                  }
                  var p = e2 + "=" + s;
                  if (null != a2.maxAge) {
                    var f = a2.maxAge - 0;
                    if (isNaN(f) || !isFinite(f)) {
                      throw new TypeError("option maxAge is invalid");
                    }
                    p += "; Max-Age=" + Math.floor(f);
                  }
                  if (a2.domain) {
                    if (!n.test(a2.domain)) {
                      throw new TypeError("option domain is invalid");
                    }
                    p += "; Domain=" + a2.domain;
                  }
                  if (a2.path) {
                    if (!n.test(a2.path)) {
                      throw new TypeError("option path is invalid");
                    }
                    p += "; Path=" + a2.path;
                  }
                  if (a2.expires) {
                    if (typeof a2.expires.toUTCString !== "function") {
                      throw new TypeError("option expires is invalid");
                    }
                    p += "; Expires=" + a2.expires.toUTCString();
                  }
                  if (a2.httpOnly) {
                    p += "; HttpOnly";
                  }
                  if (a2.secure) {
                    p += "; Secure";
                  }
                  if (a2.sameSite) {
                    var u = typeof a2.sameSite === "string" ? a2.sameSite.toLowerCase() : a2.sameSite;
                    switch (u) {
                      case true:
                        p += "; SameSite=Strict";
                        break;
                      case "lax":
                        p += "; SameSite=Lax";
                        break;
                      case "strict":
                        p += "; SameSite=Strict";
                        break;
                      case "none":
                        p += "; SameSite=None";
                        break;
                      default:
                        throw new TypeError("option sameSite is invalid");
                    }
                  }
                  return p;
                }
                function tryDecode(e2, r2) {
                  try {
                    return r2(e2);
                  } catch (r3) {
                    return e2;
                  }
                }
              })();
              module2.exports = e;
            })();
          }
        ),
        /***/
        340: (
          /***/
          (module2, exports2, __webpack_require__) => {
            var __dirname2 = "/";
            var __WEBPACK_AMD_DEFINE_RESULT__;
            (() => {
              var i = { 226: function(i2, e2) {
                (function(o2, a) {
                  "use strict";
                  var r = "1.0.35", t = "", n = "?", s = "function", b = "undefined", w = "object", l = "string", d = "major", c = "model", u = "name", p = "type", m = "vendor", f = "version", h = "architecture", v = "console", g = "mobile", k = "tablet", x = "smarttv", _ = "wearable", y = "embedded", q = 350;
                  var T = "Amazon", S = "Apple", z = "ASUS", N = "BlackBerry", A = "Browser", C = "Chrome", E = "Edge", O = "Firefox", U = "Google", j = "Huawei", P = "LG", R = "Microsoft", M = "Motorola", B = "Opera", V = "Samsung", D = "Sharp", I = "Sony", W = "Viera", F = "Xiaomi", G = "Zebra", H = "Facebook", L = "Chromium OS", Z = "Mac OS";
                  var extend = function(i3, e3) {
                    var o3 = {};
                    for (var a2 in i3) {
                      if (e3[a2] && e3[a2].length % 2 === 0) {
                        o3[a2] = e3[a2].concat(i3[a2]);
                      } else {
                        o3[a2] = i3[a2];
                      }
                    }
                    return o3;
                  }, enumerize = function(i3) {
                    var e3 = {};
                    for (var o3 = 0; o3 < i3.length; o3++) {
                      e3[i3[o3].toUpperCase()] = i3[o3];
                    }
                    return e3;
                  }, has = function(i3, e3) {
                    return typeof i3 === l ? lowerize(e3).indexOf(lowerize(i3)) !== -1 : false;
                  }, lowerize = function(i3) {
                    return i3.toLowerCase();
                  }, majorize = function(i3) {
                    return typeof i3 === l ? i3.replace(/[^\d\.]/g, t).split(".")[0] : a;
                  }, trim = function(i3, e3) {
                    if (typeof i3 === l) {
                      i3 = i3.replace(/^\s\s*/, t);
                      return typeof e3 === b ? i3 : i3.substring(0, q);
                    }
                  };
                  var rgxMapper = function(i3, e3) {
                    var o3 = 0, r2, t2, n2, b2, l2, d2;
                    while (o3 < e3.length && !l2) {
                      var c2 = e3[o3], u2 = e3[o3 + 1];
                      r2 = t2 = 0;
                      while (r2 < c2.length && !l2) {
                        if (!c2[r2]) {
                          break;
                        }
                        l2 = c2[r2++].exec(i3);
                        if (!!l2) {
                          for (n2 = 0; n2 < u2.length; n2++) {
                            d2 = l2[++t2];
                            b2 = u2[n2];
                            if (typeof b2 === w && b2.length > 0) {
                              if (b2.length === 2) {
                                if (typeof b2[1] == s) {
                                  this[b2[0]] = b2[1].call(this, d2);
                                } else {
                                  this[b2[0]] = b2[1];
                                }
                              } else if (b2.length === 3) {
                                if (typeof b2[1] === s && !(b2[1].exec && b2[1].test)) {
                                  this[b2[0]] = d2 ? b2[1].call(this, d2, b2[2]) : a;
                                } else {
                                  this[b2[0]] = d2 ? d2.replace(b2[1], b2[2]) : a;
                                }
                              } else if (b2.length === 4) {
                                this[b2[0]] = d2 ? b2[3].call(this, d2.replace(b2[1], b2[2])) : a;
                              }
                            } else {
                              this[b2] = d2 ? d2 : a;
                            }
                          }
                        }
                      }
                      o3 += 2;
                    }
                  }, strMapper = function(i3, e3) {
                    for (var o3 in e3) {
                      if (typeof e3[o3] === w && e3[o3].length > 0) {
                        for (var r2 = 0; r2 < e3[o3].length; r2++) {
                          if (has(e3[o3][r2], i3)) {
                            return o3 === n ? a : o3;
                          }
                        }
                      } else if (has(e3[o3], i3)) {
                        return o3 === n ? a : o3;
                      }
                    }
                    return i3;
                  };
                  var $ = { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }, X = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" };
                  var K = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [f, [u, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [f, [u, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [u, f], [/opios[\/ ]+([\w\.]+)/i], [f, [u, B + " Mini"]], [/\bopr\/([\w\.]+)/i], [f, [u, B]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [u, f], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [f, [u, "UC" + A]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [f, [u, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [f, [u, "WeChat"]], [/konqueror\/([\w\.]+)/i], [f, [u, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [f, [u, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [f, [u, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[u, /(.+)/, "$1 Secure " + A], f], [/\bfocus\/([\w\.]+)/i], [f, [u, O + " Focus"]], [/\bopt\/([\w\.]+)/i], [f, [u, B + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [f, [u, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [f, [u, "Dolphin"]], [/coast\/([\w\.]+)/i], [f, [u, B + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [f, [u, "MIUI " + A]], [/fxios\/([-\w\.]+)/i], [f, [u, O]], [/\bqihu|(qi?ho?o?|360)browser/i], [[u, "360 " + A]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[u, /(.+)/, "$1 " + A], f], [/(comodo_dragon)\/([\w\.]+)/i], [[u, /_/g, " "], f], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [u, f], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [u], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[u, H], f], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [u, f], [/\bgsa\/([\w\.]+) .*safari\//i], [f, [u, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [f, [u, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [f, [u, C + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[u, C + " WebView"], f], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [f, [u, "Android " + A]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [u, f], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [f, [u, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [f, u], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [u, [f, strMapper, $]], [/(webkit|khtml)\/([\w\.]+)/i], [u, f], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[u, "Netscape"], f], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [f, [u, O + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [u, f], [/(cobalt)\/([\w\.]+)/i], [u, [f, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[h, "amd64"]], [/(ia32(?=;))/i], [[h, lowerize]], [/((?:i[346]|x)86)[;\)]/i], [[h, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[h, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[h, "armhf"]], [/windows (ce|mobile); ppc;/i], [[h, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[h, /ower/, t, lowerize]], [/(sun4\w)[;\)]/i], [[h, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[h, lowerize]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [c, [m, V], [p, k]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [c, [m, V], [p, g]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [c, [m, S], [p, g]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [c, [m, S], [p, k]], [/(macintosh);/i], [c, [m, S]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [c, [m, D], [p, g]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [c, [m, j], [p, k]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [c, [m, j], [p, g]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[c, /_/g, " "], [m, F], [p, g]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[c, /_/g, " "], [m, F], [p, k]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [c, [m, "OPPO"], [p, g]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [c, [m, "Vivo"], [p, g]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [c, [m, "Realme"], [p, g]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [c, [m, M], [p, g]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [c, [m, M], [p, k]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [c, [m, P], [p, k]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [c, [m, P], [p, g]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [c, [m, "Lenovo"], [p, k]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[c, /_/g, " "], [m, "Nokia"], [p, g]], [/(pixel c)\b/i], [c, [m, U], [p, k]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [c, [m, U], [p, g]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [c, [m, I], [p, g]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[c, "Xperia Tablet"], [m, I], [p, k]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [c, [m, "OnePlus"], [p, g]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [c, [m, T], [p, k]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[c, /(.+)/g, "Fire Phone $1"], [m, T], [p, g]], [/(playbook);[-\w\),; ]+(rim)/i], [c, m, [p, k]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [c, [m, N], [p, g]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [c, [m, z], [p, k]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [c, [m, z], [p, g]], [/(nexus 9)/i], [c, [m, "HTC"], [p, k]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [m, [c, /_/g, " "], [p, g]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [c, [m, "Acer"], [p, k]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [c, [m, "Meizu"], [p, g]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [m, c, [p, g]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [m, c, [p, k]], [/(surface duo)/i], [c, [m, R], [p, k]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [c, [m, "Fairphone"], [p, g]], [/(u304aa)/i], [c, [m, "AT&T"], [p, g]], [/\bsie-(\w*)/i], [c, [m, "Siemens"], [p, g]], [/\b(rct\w+) b/i], [c, [m, "RCA"], [p, k]], [/\b(venue[\d ]{2,7}) b/i], [c, [m, "Dell"], [p, k]], [/\b(q(?:mv|ta)\w+) b/i], [c, [m, "Verizon"], [p, k]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [c, [m, "Barnes & Noble"], [p, k]], [/\b(tm\d{3}\w+) b/i], [c, [m, "NuVision"], [p, k]], [/\b(k88) b/i], [c, [m, "ZTE"], [p, k]], [/\b(nx\d{3}j) b/i], [c, [m, "ZTE"], [p, g]], [/\b(gen\d{3}) b.+49h/i], [c, [m, "Swiss"], [p, g]], [/\b(zur\d{3}) b/i], [c, [m, "Swiss"], [p, k]], [/\b((zeki)?tb.*\b) b/i], [c, [m, "Zeki"], [p, k]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[m, "Dragon Touch"], c, [p, k]], [/\b(ns-?\w{0,9}) b/i], [c, [m, "Insignia"], [p, k]], [/\b((nxa|next)-?\w{0,9}) b/i], [c, [m, "NextBook"], [p, k]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[m, "Voice"], c, [p, g]], [/\b(lvtel\-)?(v1[12]) b/i], [[m, "LvTel"], c, [p, g]], [/\b(ph-1) /i], [c, [m, "Essential"], [p, g]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [c, [m, "Envizen"], [p, k]], [/\b(trio[-\w\. ]+) b/i], [c, [m, "MachSpeed"], [p, k]], [/\btu_(1491) b/i], [c, [m, "Rotor"], [p, k]], [/(shield[\w ]+) b/i], [c, [m, "Nvidia"], [p, k]], [/(sprint) (\w+)/i], [m, c, [p, g]], [/(kin\.[onetw]{3})/i], [[c, /\./g, " "], [m, R], [p, g]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [c, [m, G], [p, k]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [c, [m, G], [p, g]], [/smart-tv.+(samsung)/i], [m, [p, x]], [/hbbtv.+maple;(\d+)/i], [[c, /^/, "SmartTV"], [m, V], [p, x]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[m, P], [p, x]], [/(apple) ?tv/i], [m, [c, S + " TV"], [p, x]], [/crkey/i], [[c, C + "cast"], [m, U], [p, x]], [/droid.+aft(\w)( bui|\))/i], [c, [m, T], [p, x]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [c, [m, D], [p, x]], [/(bravia[\w ]+)( bui|\))/i], [c, [m, I], [p, x]], [/(mitv-\w{5}) bui/i], [c, [m, F], [p, x]], [/Hbbtv.*(technisat) (.*);/i], [m, c, [p, x]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[m, trim], [c, trim], [p, x]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[p, x]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [m, c, [p, v]], [/droid.+; (shield) bui/i], [c, [m, "Nvidia"], [p, v]], [/(playstation [345portablevi]+)/i], [c, [m, I], [p, v]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [c, [m, R], [p, v]], [/((pebble))app/i], [m, c, [p, _]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [c, [m, S], [p, _]], [/droid.+; (glass) \d/i], [c, [m, U], [p, _]], [/droid.+; (wt63?0{2,3})\)/i], [c, [m, G], [p, _]], [/(quest( 2| pro)?)/i], [c, [m, H], [p, _]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [m, [p, y]], [/(aeobc)\b/i], [c, [m, T], [p, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [c, [p, g]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [c, [p, k]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[p, k]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[p, g]], [/(android[-\w\. ]{0,9});.+buil/i], [c, [m, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [f, [u, E + "HTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [f, [u, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [u, f], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [f, u]], os: [[/microsoft (windows) (vista|xp)/i], [u, f], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [u, [f, strMapper, X]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[u, "Windows"], [f, strMapper, X]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[f, /_/g, "."], [u, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[u, Z], [f, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [f, u], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [u, f], [/\(bb(10);/i], [f, [u, N]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [f, [u, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [f, [u, O + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [f, [u, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [f, [u, "watchOS"]], [/crkey\/([\d\.]+)/i], [f, [u, C + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[u, L], f], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [u, f], [/(sunos) ?([\w\.\d]*)/i], [[u, "Solaris"], f], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [u, f]] };
                  var UAParser = function(i3, e3) {
                    if (typeof i3 === w) {
                      e3 = i3;
                      i3 = a;
                    }
                    if (!(this instanceof UAParser)) {
                      return new UAParser(i3, e3).getResult();
                    }
                    var r2 = typeof o2 !== b && o2.navigator ? o2.navigator : a;
                    var n2 = i3 || (r2 && r2.userAgent ? r2.userAgent : t);
                    var v2 = r2 && r2.userAgentData ? r2.userAgentData : a;
                    var x2 = e3 ? extend(K, e3) : K;
                    var _2 = r2 && r2.userAgent == n2;
                    this.getBrowser = function() {
                      var i4 = {};
                      i4[u] = a;
                      i4[f] = a;
                      rgxMapper.call(i4, n2, x2.browser);
                      i4[d] = majorize(i4[f]);
                      if (_2 && r2 && r2.brave && typeof r2.brave.isBrave == s) {
                        i4[u] = "Brave";
                      }
                      return i4;
                    };
                    this.getCPU = function() {
                      var i4 = {};
                      i4[h] = a;
                      rgxMapper.call(i4, n2, x2.cpu);
                      return i4;
                    };
                    this.getDevice = function() {
                      var i4 = {};
                      i4[m] = a;
                      i4[c] = a;
                      i4[p] = a;
                      rgxMapper.call(i4, n2, x2.device);
                      if (_2 && !i4[p] && v2 && v2.mobile) {
                        i4[p] = g;
                      }
                      if (_2 && i4[c] == "Macintosh" && r2 && typeof r2.standalone !== b && r2.maxTouchPoints && r2.maxTouchPoints > 2) {
                        i4[c] = "iPad";
                        i4[p] = k;
                      }
                      return i4;
                    };
                    this.getEngine = function() {
                      var i4 = {};
                      i4[u] = a;
                      i4[f] = a;
                      rgxMapper.call(i4, n2, x2.engine);
                      return i4;
                    };
                    this.getOS = function() {
                      var i4 = {};
                      i4[u] = a;
                      i4[f] = a;
                      rgxMapper.call(i4, n2, x2.os);
                      if (_2 && !i4[u] && v2 && v2.platform != "Unknown") {
                        i4[u] = v2.platform.replace(/chrome os/i, L).replace(/macos/i, Z);
                      }
                      return i4;
                    };
                    this.getResult = function() {
                      return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
                    };
                    this.getUA = function() {
                      return n2;
                    };
                    this.setUA = function(i4) {
                      n2 = typeof i4 === l && i4.length > q ? trim(i4, q) : i4;
                      return this;
                    };
                    this.setUA(n2);
                    return this;
                  };
                  UAParser.VERSION = r;
                  UAParser.BROWSER = enumerize([u, f, d]);
                  UAParser.CPU = enumerize([h]);
                  UAParser.DEVICE = enumerize([c, m, p, v, g, x, k, _, y]);
                  UAParser.ENGINE = UAParser.OS = enumerize([u, f]);
                  if (typeof e2 !== b) {
                    if ("object" !== b && i2.exports) {
                      e2 = i2.exports = UAParser;
                    }
                    e2.UAParser = UAParser;
                  } else {
                    if ("function" === s && __webpack_require__.amdO) {
                      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
                        return UAParser;
                      }.call(exports2, __webpack_require__, exports2, module2), __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                    } else if (typeof o2 !== b) {
                      o2.UAParser = UAParser;
                    }
                  }
                  var Q = typeof o2 !== b && (o2.jQuery || o2.Zepto);
                  if (Q && !Q.ua) {
                    var Y = new UAParser();
                    Q.ua = Y.getResult();
                    Q.ua.get = function() {
                      return Y.getUA();
                    };
                    Q.ua.set = function(i3) {
                      Y.setUA(i3);
                      var e3 = Y.getResult();
                      for (var o3 in e3) {
                        Q.ua[o3] = e3[o3];
                      }
                    };
                  }
                })(typeof window === "object" ? window : this);
              } };
              var e = {};
              function __nccwpck_require__2(o2) {
                var a = e[o2];
                if (a !== void 0) {
                  return a.exports;
                }
                var r = e[o2] = { exports: {} };
                var t = true;
                try {
                  i[o2].call(r.exports, r, r.exports, __nccwpck_require__2);
                  t = false;
                } finally {
                  if (t) delete e[o2];
                }
                return r.exports;
              }
              if (typeof __nccwpck_require__2 !== "undefined") __nccwpck_require__2.ab = __dirname2 + "/";
              var o = __nccwpck_require__2(226);
              module2.exports = o;
            })();
          }
        ),
        /***/
        488: (
          /***/
          (__unused_webpack_module, exports2, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports2, "__esModule", {
              value: true
            });
            function _export(target, all) {
              for (var name in all) Object.defineProperty(target, name, {
                enumerable: true,
                get: all[name]
              });
            }
            _export(exports2, {
              getTestReqInfo: function() {
                return getTestReqInfo;
              },
              withRequest: function() {
                return withRequest;
              }
            });
            const _nodeasync_hooks = __webpack_require__(67);
            const testStorage = new _nodeasync_hooks.AsyncLocalStorage();
            function extractTestInfoFromRequest(req, reader) {
              const proxyPortHeader = reader.header(req, "next-test-proxy-port");
              if (!proxyPortHeader) {
                return void 0;
              }
              const url = reader.url(req);
              const proxyPort = Number(proxyPortHeader);
              const testData = reader.header(req, "next-test-data") || "";
              return {
                url,
                proxyPort,
                testData
              };
            }
            function withRequest(req, reader, fn) {
              const testReqInfo = extractTestInfoFromRequest(req, reader);
              if (!testReqInfo) {
                return fn();
              }
              return testStorage.run(testReqInfo, fn);
            }
            function getTestReqInfo(req, reader) {
              const testReqInfo = testStorage.getStore();
              if (testReqInfo) {
                return testReqInfo;
              }
              if (req && reader) {
                return extractTestInfoFromRequest(req, reader);
              }
              return void 0;
            }
          }
        ),
        /***/
        375: (
          /***/
          (__unused_webpack_module, exports2, __webpack_require__) => {
            "use strict";
            var Buffer3 = __webpack_require__(195)["Buffer"];
            Object.defineProperty(exports2, "__esModule", {
              value: true
            });
            function _export(target, all) {
              for (var name in all) Object.defineProperty(target, name, {
                enumerable: true,
                get: all[name]
              });
            }
            _export(exports2, {
              handleFetch: function() {
                return handleFetch;
              },
              interceptFetch: function() {
                return interceptFetch;
              },
              reader: function() {
                return reader;
              }
            });
            const _context = __webpack_require__(488);
            const reader = {
              url(req) {
                return req.url;
              },
              header(req, name) {
                return req.headers.get(name);
              }
            };
            function getTestStack() {
              let stack = (new Error().stack ?? "").split("\n");
              for (let i = 1; i < stack.length; i++) {
                if (stack[i].length > 0) {
                  stack = stack.slice(i);
                  break;
                }
              }
              stack = stack.filter((f) => !f.includes("/next/dist/"));
              stack = stack.slice(0, 5);
              stack = stack.map((s) => s.replace("webpack-internal:///(rsc)/", "").trim());
              return stack.join("    ");
            }
            async function buildProxyRequest(testData, request) {
              const { url, method, headers, body, cache, credentials, integrity, mode, redirect, referrer, referrerPolicy } = request;
              return {
                testData,
                api: "fetch",
                request: {
                  url,
                  method,
                  headers: [
                    ...Array.from(headers),
                    [
                      "next-test-stack",
                      getTestStack()
                    ]
                  ],
                  body: body ? Buffer3.from(await request.arrayBuffer()).toString("base64") : null,
                  cache,
                  credentials,
                  integrity,
                  mode,
                  redirect,
                  referrer,
                  referrerPolicy
                }
              };
            }
            function buildResponse(proxyResponse) {
              const { status, headers, body } = proxyResponse.response;
              return new Response(body ? Buffer3.from(body, "base64") : null, {
                status,
                headers: new Headers(headers)
              });
            }
            async function handleFetch(originalFetch, request) {
              const testInfo = (0, _context.getTestReqInfo)(request, reader);
              if (!testInfo) {
                return originalFetch(request);
              }
              const { testData, proxyPort } = testInfo;
              const proxyRequest = await buildProxyRequest(testData, request);
              const resp = await originalFetch(`http://localhost:${proxyPort}`, {
                method: "POST",
                body: JSON.stringify(proxyRequest),
                next: {
                  // @ts-ignore
                  internal: true
                }
              });
              if (!resp.ok) {
                throw new Error(`Proxy request failed: ${resp.status}`);
              }
              const proxyResponse = await resp.json();
              const { api } = proxyResponse;
              switch (api) {
                case "continue":
                  return originalFetch(request);
                case "abort":
                case "unhandled":
                  throw new Error(`Proxy request aborted [${request.method} ${request.url}]`);
                default:
                  break;
              }
              return buildResponse(proxyResponse);
            }
            function interceptFetch(originalFetch) {
              __webpack_require__.g.fetch = function testFetch(input, init) {
                var _init_next;
                if (init == null ? void 0 : (_init_next = init.next) == null ? void 0 : _init_next.internal) {
                  return originalFetch(input, init);
                }
                return handleFetch(originalFetch, new Request(input, init));
              };
              return () => {
                __webpack_require__.g.fetch = originalFetch;
              };
            }
          }
        ),
        /***/
        177: (
          /***/
          (__unused_webpack_module, exports2, __webpack_require__) => {
            "use strict";
            Object.defineProperty(exports2, "__esModule", {
              value: true
            });
            function _export(target, all) {
              for (var name in all) Object.defineProperty(target, name, {
                enumerable: true,
                get: all[name]
              });
            }
            _export(exports2, {
              interceptTestApis: function() {
                return interceptTestApis;
              },
              wrapRequestHandler: function() {
                return wrapRequestHandler;
              }
            });
            const _context = __webpack_require__(488);
            const _fetch = __webpack_require__(375);
            function interceptTestApis() {
              return (0, _fetch.interceptFetch)(__webpack_require__.g.fetch);
            }
            function wrapRequestHandler(handler3) {
              return (req, fn) => (0, _context.withRequest)(req, _fetch.reader, () => handler3(req, fn));
            }
          }
        )
      },
      /******/
      (__webpack_require__) => {
        var __webpack_exec__ = (moduleId) => __webpack_require__(__webpack_require__.s = moduleId);
        var __webpack_exports__ = __webpack_exec__(70);
        (_ENTRIES = typeof _ENTRIES === "undefined" ? {} : _ENTRIES).middleware_middleware = __webpack_exports__;
      }
    ]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "middleware", "page": "/", "regex": [] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "eslint": { "ignoreDuringBuilds": false }, "typescript": { "ignoreBuildErrors": false, "tsconfigPath": "tsconfig.json" }, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.js", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "analyticsId": "", "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "inline", "remotePatterns": [], "unoptimized": true }, "devIndicators": { "buildActivity": true, "buildActivityPosition": "bottom-right" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "optimizeFonts": true, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": false, "httpAgentOptions": { "keepAlive": true }, "outputFileTracing": true, "staticPageGenerationTimeout": 60, "swcMinify": false, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "experimental": { "multiZoneDraftMode": false, "prerenderEarlyExit": false, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 1, "memoryBasedWorkersCount": false, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "outputFileTracingRoot": "/root/.openclaw/workspace/agent1", "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "adjustFontFallbacks": false, "adjustFontFallbacksWithSizeAdjust": false, "typedRoutes": false, "instrumentationHook": false, "bundlePagesExternals": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "missingSuspenseWithCSRBailout": true, "optimizeServerReact": true, "useEarlyImport": false, "staleTimes": { "dynamic": 30, "static": 300 }, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "configFileName": "next.config.js", "compiler": { "removeConsole": false, "emotion": false }, "_originalRewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "_originalRedirects": [] };
var BuildId = "iCD11espqYtQS9GQ4S4C9";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/auth/callback", "regex": "^/auth/callback(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/callback(?:/)?$" }, { "page": "/dashboard", "regex": "^/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard(?:/)?$" }, { "page": "/dashboard/buy", "regex": "^/dashboard/buy(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/buy(?:/)?$" }, { "page": "/debug", "regex": "^/debug(?:/)?$", "routeKeys": {}, "namedRegex": "^/debug(?:/)?$" }, { "page": "/debug-dashboard", "regex": "^/debug\\-dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/debug\\-dashboard(?:/)?$" }, { "page": "/emergency-login", "regex": "^/emergency\\-login(?:/)?$", "routeKeys": {}, "namedRegex": "^/emergency\\-login(?:/)?$" }, { "page": "/env-fixed-test", "regex": "^/env\\-fixed\\-test(?:/)?$", "routeKeys": {}, "namedRegex": "^/env\\-fixed\\-test(?:/)?$" }, { "page": "/history", "regex": "^/history(?:/)?$", "routeKeys": {}, "namedRegex": "^/history(?:/)?$" }, { "page": "/local-login", "regex": "^/local\\-login(?:/)?$", "routeKeys": {}, "namedRegex": "^/local\\-login(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }, { "page": "/new-dashboard", "regex": "^/new\\-dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/new\\-dashboard(?:/)?$" }, { "page": "/new-login", "regex": "^/new\\-login(?:/)?$", "routeKeys": {}, "namedRegex": "^/new\\-login(?:/)?$" }, { "page": "/privacy", "regex": "^/privacy(?:/)?$", "routeKeys": {}, "namedRegex": "^/privacy(?:/)?$" }, { "page": "/register", "regex": "^/register(?:/)?$", "routeKeys": {}, "namedRegex": "^/register(?:/)?$" }, { "page": "/terms", "regex": "^/terms(?:/)?$", "routeKeys": {}, "namedRegex": "^/terms(?:/)?$" }], "dynamic": [], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/dashboard/buy": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/buy", "dataRoute": "/dashboard/buy.rsc" }, "/dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard", "dataRoute": "/dashboard.rsc" }, "/debug": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/debug", "dataRoute": "/debug.rsc" }, "/history": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/history", "dataRoute": "/history.rsc" }, "/debug-dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/debug-dashboard", "dataRoute": "/debug-dashboard.rsc" }, "/env-fixed-test": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/env-fixed-test", "dataRoute": "/env-fixed-test.rsc" }, "/new-dashboard": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/new-dashboard", "dataRoute": "/new-dashboard.rsc" }, "/new-login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/new-login", "dataRoute": "/new-login.rsc" }, "/emergency-login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/emergency-login", "dataRoute": "/emergency-login.rsc" }, "/local-login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/local-login", "dataRoute": "/local-login.rsc" }, "/privacy": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/privacy", "dataRoute": "/privacy.rsc" }, "/register": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/register", "dataRoute": "/register.rsc" }, "/login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc" }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc" }, "/terms": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/terms", "dataRoute": "/terms.rsc" } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "bde1f1d8add17f1d4e0bd55d5b83557a", "previewModeSigningKey": "4741d9be5164b52ccd7348535201fead45515c20816a2eac0875c1ba21ce6378", "previewModeEncryptionKey": "411d6cb901b8512cad96ce59a1fc8489329f7dcf8e05bee3c708ab4a7670b9ea" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/middleware.js"], "name": "middleware", "page": "/", "matchers": [], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "iCD11espqYtQS9GQ4S4C9", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "LHdndtz2p9VnYlkiAt6yrNBCVKpl7x+NK91/vkXbT7w=", "__NEXT_PREVIEW_MODE_ID": "bde1f1d8add17f1d4e0bd55d5b83557a", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "411d6cb901b8512cad96ce59a1fc8489329f7dcf8e05bee3c708ab4a7670b9ea", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "4741d9be5164b52ccd7348535201fead45515c20816a2eac0875c1ba21ce6378" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/dashboard/buy/page": "/dashboard/buy", "/emergency-login/page": "/emergency-login", "/debug-dashboard/page": "/debug-dashboard", "/env-fixed-test/page": "/env-fixed-test", "/local-login/page": "/local-login", "/login/page": "/login", "/dashboard/page": "/dashboard", "/history/page": "/history", "/new-login/page": "/new-login", "/page": "/", "/new-dashboard/page": "/new-dashboard", "/privacy/page": "/privacy", "/register/page": "/register", "/auth/callback/route": "/auth/callback", "/terms/page": "/terms", "/api/test-points/route": "/api/test-points", "/api/paypal/webhook/route": "/api/paypal/webhook", "/api/process/route": "/api/process", "/debug/page": "/debug" };
var FunctionsConfigManifest = { "version": 1, "functions": { "/api/paypal/webhook": {}, "/api/test-points": {}, "/api/process": {}, "/auth/callback": {} } };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream2 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream2({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {});
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = Boolean(event.headers.rsc);
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath ?? "/") || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
