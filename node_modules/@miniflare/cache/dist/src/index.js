var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// packages/cache/src/index.ts
__export(exports, {
  Cache: () => Cache,
  CacheError: () => CacheError,
  CachePlugin: () => CachePlugin,
  CacheStorage: () => CacheStorage,
  NoOpCache: () => NoOpCache
});

// packages/cache/src/cache.ts
var import_url = __toModule(require("url"));
var import_core = __toModule(require("@miniflare/core"));
var import_shared2 = __toModule(require("@miniflare/shared"));
var import_http_cache_semantics = __toModule(require("http-cache-semantics"));
var import_undici = __toModule(require("undici"));

// packages/cache/src/error.ts
var import_shared = __toModule(require("@miniflare/shared"));
var CacheError = class extends import_shared.MiniflareError {
};

// packages/cache/src/cache.ts
function normaliseRequest(req) {
  return req instanceof import_core.Request || req instanceof import_undici.Request ? req : new import_core.Request(req);
}
function normaliseHeaders(headers) {
  const result = {};
  for (const [key, value] of headers)
    result[key.toLowerCase()] = value;
  return result;
}
function getKey(req) {
  if (req.cf?.cacheKey)
    return req.cf.cacheKey;
  try {
    const url = new import_url.URL(req.url);
    return url.toString();
  } catch (e) {
    throw new TypeError("Invalid URL. Cache API keys must be fully-qualified, valid URLs.");
  }
}
function getExpirationTtl(clock, req, res) {
  const reqHeaders = normaliseHeaders(req.headers);
  delete reqHeaders["cache-control"];
  const resHeaders = normaliseHeaders(res.headers);
  if (resHeaders["cache-control"]?.toLowerCase().includes("private=set-cookie")) {
    resHeaders["cache-control"] = resHeaders["cache-control"].replace(/private=set-cookie/i, "");
    delete resHeaders["set-cookie"];
  }
  const cacheReq = {
    url: req.url,
    method: req.method,
    headers: reqHeaders
  };
  const cacheRes = {
    status: res.status,
    headers: resHeaders
  };
  const originalNow = import_http_cache_semantics.default.prototype.now;
  import_http_cache_semantics.default.prototype.now = clock;
  try {
    const policy = new import_http_cache_semantics.default(cacheReq, cacheRes, { shared: true });
    if ("set-cookie" in resHeaders || !policy.storable()) {
      return;
    }
    return policy.timeToLive();
  } finally {
    import_http_cache_semantics.default.prototype.now = originalNow;
  }
}
var etagRegexp = /^(W\/)?"(.+)"$/;
function parseETag(value) {
  return etagRegexp.exec(value.trim())?.[2] ?? void 0;
}
var utcDateRegexp = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d\d (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d\d\d \d\d:\d\d:\d\d GMT$/;
function parseUTCDate(value) {
  return utcDateRegexp.test(value) ? Date.parse(value) : NaN;
}
function getMatchResponse(reqHeaders, resStatus, resHeaders, resBody) {
  const reqIfNoneMatchHeader = reqHeaders.get("If-None-Match");
  const resETagHeader = resHeaders.get("ETag");
  if (reqIfNoneMatchHeader !== null && resETagHeader !== null) {
    const resETag = parseETag(resETagHeader);
    if (resETag !== void 0) {
      if (reqIfNoneMatchHeader.trim() === "*") {
        return new import_core.Response(null, { status: 304, headers: resHeaders });
      }
      for (const reqIfNoneMatch of reqIfNoneMatchHeader.split(",")) {
        if (resETag === parseETag(reqIfNoneMatch)) {
          return new import_core.Response(null, { status: 304, headers: resHeaders });
        }
      }
    }
  }
  const reqIfModifiedSinceHeader = reqHeaders.get("If-Modified-Since");
  const resLastModifiedHeader = resHeaders.get("Last-Modified");
  if (reqIfModifiedSinceHeader !== null && resLastModifiedHeader !== null) {
    const reqIfModifiedSince = parseUTCDate(reqIfModifiedSinceHeader);
    const resLastModified = parseUTCDate(resLastModifiedHeader);
    if (resLastModified <= reqIfModifiedSince) {
      return new import_core.Response(null, { status: 304, headers: resHeaders });
    }
  }
  const reqRangeHeader = reqHeaders.get("Range");
  if (reqRangeHeader !== null) {
    return (0, import_core.getRangeResponse)(reqRangeHeader, resStatus, resHeaders, resBody);
  }
  return new import_core.Response(resBody, { status: resStatus, headers: resHeaders });
}
var Cache = class {
  #storage;
  #formDataFiles;
  #clock;
  #blockGlobalAsyncIO;
  constructor(storage, {
    formDataFiles = true,
    clock = import_shared2.defaultClock,
    blockGlobalAsyncIO = false
  } = {}) {
    this.#storage = storage;
    this.#formDataFiles = formDataFiles;
    this.#clock = clock;
    this.#blockGlobalAsyncIO = blockGlobalAsyncIO;
  }
  async put(req, res) {
    if (this.#blockGlobalAsyncIO)
      (0, import_shared2.assertInRequest)();
    const ctx = (0, import_shared2.getRequestContext)();
    ctx?.incrementExternalSubrequests();
    req = normaliseRequest(req);
    if (res instanceof import_core.Response && res.webSocket) {
      throw new TypeError("Cannot cache WebSocket upgrade response.");
    }
    if (req.method !== "GET") {
      throw new TypeError("Cannot cache response to non-GET request.");
    }
    if (res.status === 206) {
      throw new TypeError("Cannot cache response to a range request (206 Partial Content).");
    }
    if (res.headers.get("vary")?.includes("*")) {
      throw new TypeError("Cannot cache response with 'Vary: *' header.");
    }
    const url = new import_url.URL(req.url);
    if (url.pathname.startsWith("/" + import_shared2.SITES_NO_CACHE_PREFIX))
      return;
    const expirationTtl = getExpirationTtl(this.#clock, req, res);
    if (expirationTtl === void 0)
      return;
    const key = getKey(req);
    const metadata = {
      status: res.status,
      headers: [...res.headers]
    };
    await (0, import_shared2.waitForOpenOutputGate)();
    await this.#storage.put(key, {
      value: new Uint8Array(await res.arrayBuffer()),
      expiration: (0, import_shared2.millisToSeconds)(this.#clock() + expirationTtl),
      metadata
    });
    await (0, import_shared2.waitForOpenInputGate)();
    ctx?.advanceCurrentTime();
  }
  async match(req, options) {
    if (this.#blockGlobalAsyncIO)
      (0, import_shared2.assertInRequest)();
    const ctx = (0, import_shared2.getRequestContext)();
    ctx?.incrementExternalSubrequests();
    req = normaliseRequest(req);
    if (req.method !== "GET" && !options?.ignoreMethod)
      return;
    const key = getKey(req);
    const cached = await this.#storage.get(key);
    await (0, import_shared2.waitForOpenInputGate)();
    ctx?.advanceCurrentTime();
    if (!cached)
      return;
    if (!cached.metadata) {
      throw new CacheError("ERR_DESERIALIZATION", "Unable to deserialize stored cached data due to missing metadata.\nThe cached data storage format changed in Miniflare 2. You cannot load cached data created with Miniflare 1 and must delete it.");
    }
    const headers = new import_undici.Headers(cached.metadata.headers);
    headers.set("CF-Cache-Status", "HIT");
    let res = getMatchResponse(req.headers, cached.metadata.status, headers, cached.value);
    if (!this.#formDataFiles)
      res = (0, import_core.withStringFormDataFiles)(res);
    return (0, import_core.withImmutableHeaders)(res);
  }
  async delete(req, options) {
    if (this.#blockGlobalAsyncIO)
      (0, import_shared2.assertInRequest)();
    const ctx = (0, import_shared2.getRequestContext)();
    ctx?.incrementExternalSubrequests();
    req = normaliseRequest(req);
    if (req.method !== "GET" && !options?.ignoreMethod)
      return false;
    const key = getKey(req);
    await (0, import_shared2.waitForOpenOutputGate)();
    const result = this.#storage.delete(key);
    await (0, import_shared2.waitForOpenInputGate)();
    ctx?.advanceCurrentTime();
    return result;
  }
};

// packages/cache/src/noop.ts
var NoOpCache = class {
  async put(_req, _res) {
    return;
  }
  async match(_req, _options) {
    return;
  }
  async delete(_req, _options) {
    return false;
  }
};

// packages/cache/src/plugin.ts
var import_shared3 = __toModule(require("@miniflare/shared"));
var DEFAULT_CACHE_NAME = "default";
var MAX_CACHE_NAME_SIZE = 1024;
var NOOP_CACHE = new NoOpCache();
var CacheStorage = class {
  #options;
  #log;
  #storage;
  #internalOptions;
  #warnUsage;
  #defaultCache;
  constructor(options, log, storageFactory, internalOptions) {
    this.#options = options;
    this.#log = log;
    this.#storage = storageFactory;
    this.#warnUsage = options.cacheWarnUsage;
    this.#internalOptions = internalOptions;
  }
  #maybeWarnUsage() {
    if (!this.#warnUsage)
      return;
    this.#warnUsage = false;
    this.#log.warn("Cache operations will have no impact if you deploy to a workers.dev subdomain!");
  }
  get default() {
    const defaultCache = this.#defaultCache;
    if (defaultCache)
      return defaultCache;
    const { cache, cachePersist } = this.#options;
    if (cache === false)
      return NOOP_CACHE;
    this.#maybeWarnUsage();
    return this.#defaultCache = new Cache(this.#storage.storage(DEFAULT_CACHE_NAME, cachePersist), this.#internalOptions);
  }
  async open(cacheName) {
    if (cacheName === DEFAULT_CACHE_NAME) {
      throw new CacheError("ERR_RESERVED", `"${cacheName}" is a reserved cache name`);
    }
    if (cacheName.length > MAX_CACHE_NAME_SIZE) {
      throw new TypeError("Cache name is too long.");
    }
    const { cache, cachePersist } = this.#options;
    if (cache === false)
      return NOOP_CACHE;
    this.#maybeWarnUsage();
    return new Cache(this.#storage.storage(cacheName, cachePersist), this.#internalOptions);
  }
};
var CachePlugin = class extends import_shared3.Plugin {
  cache;
  cachePersist;
  cacheWarnUsage;
  #unblockedCaches;
  constructor(ctx, options) {
    super(ctx);
    this.assignOptions(options);
  }
  setup(storageFactory) {
    const persist = (0, import_shared3.resolveStoragePersist)(this.ctx.rootPath, this.cachePersist);
    const options = {
      cache: this.cache,
      cachePersist: persist,
      cacheWarnUsage: this.cacheWarnUsage
    };
    const files = this.ctx.compat.isEnabled("formdata_parser_supports_files");
    const blockGlobalAsyncIO = !this.ctx.globalAsyncIO;
    const caches = new CacheStorage(options, this.ctx.log, storageFactory, {
      formDataFiles: files,
      blockGlobalAsyncIO
    });
    this.#unblockedCaches = blockGlobalAsyncIO ? new CacheStorage(options, this.ctx.log, storageFactory, {
      formDataFiles: files,
      blockGlobalAsyncIO: false
    }) : caches;
    return { globals: { caches } };
  }
  getCaches() {
    return this.#unblockedCaches;
  }
};
__decorateClass([
  (0, import_shared3.Option)({
    type: import_shared3.OptionType.BOOLEAN,
    description: "Enable default/named caches (enabled by default)",
    negatable: true,
    logName: "Cache",
    fromWrangler: ({ miniflare }) => miniflare?.cache
  })
], CachePlugin.prototype, "cache", 2);
__decorateClass([
  (0, import_shared3.Option)({
    type: import_shared3.OptionType.BOOLEAN_STRING,
    description: "Persist cached data (to optional path)",
    logName: "Cache Persistence",
    fromWrangler: ({ miniflare }) => miniflare?.cache_persist
  })
], CachePlugin.prototype, "cachePersist", 2);
__decorateClass([
  (0, import_shared3.Option)({
    type: import_shared3.OptionType.NONE,
    fromWrangler: ({ workers_dev }) => workers_dev
  })
], CachePlugin.prototype, "cacheWarnUsage", 2);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cache,
  CacheError,
  CachePlugin,
  CacheStorage,
  NoOpCache
});
//# sourceMappingURL=index.js.map
