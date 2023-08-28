import mime from "mime";
import { attachToResponse, getSetCookiesFromResponse } from "../cookies/index.js";
import { call as callEndpoint } from "../endpoint/index.js";
import { consoleLogDestination } from "../logger/console.js";
import { error } from "../logger/core.js";
import { joinPaths, prependForwardSlash, removeTrailingForwardSlash } from "../path.js";
import {
  createEnvironment,
  createRenderContext,
  renderPage
} from "../render/index.js";
import { RouteCache } from "../render/route-cache.js";
import {
  createLinkStylesheetElementSet,
  createModuleScriptElement
} from "../render/ssr-element.js";
import { matchRoute } from "../routing/match.js";
import { deserializeManifest } from "./common.js";
const pagesVirtualModuleId = "@astrojs-pages-virtual-entry";
const resolvedPagesVirtualModuleId = "\0" + pagesVirtualModuleId;
const responseSentSymbol = Symbol.for("astro.responseSent");
class App {
  #env;
  #manifest;
  #manifestData;
  #routeDataToRouteInfo;
  #encoder = new TextEncoder();
  #logging = {
    dest: consoleLogDestination,
    level: "info"
  };
  #base;
  #baseWithoutTrailingSlash;
  constructor(manifest, streaming = true) {
    this.#manifest = manifest;
    this.#manifestData = {
      routes: manifest.routes.map((route) => route.routeData)
    };
    this.#routeDataToRouteInfo = new Map(manifest.routes.map((route) => [route.routeData, route]));
    this.#env = createEnvironment({
      adapterName: manifest.adapterName,
      logging: this.#logging,
      markdown: manifest.markdown,
      mode: "production",
      renderers: manifest.renderers,
      async resolve(specifier) {
        if (!(specifier in manifest.entryModules)) {
          throw new Error(`Unable to resolve [${specifier}]`);
        }
        const bundlePath = manifest.entryModules[specifier];
        switch (true) {
          case bundlePath.startsWith("data:"):
          case bundlePath.length === 0: {
            return bundlePath;
          }
          default: {
            return prependForwardSlash(joinPaths(manifest.base, bundlePath));
          }
        }
      },
      routeCache: new RouteCache(this.#logging),
      site: this.#manifest.site,
      ssr: true,
      streaming
    });
    this.#base = this.#manifest.base || "/";
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#base);
  }
  removeBase(pathname) {
    if (pathname.startsWith(this.#base)) {
      return pathname.slice(this.#baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  match(request, { matchNotFound = false } = {}) {
    const url = new URL(request.url);
    if (this.#manifest.assets.has(url.pathname)) {
      return void 0;
    }
    let pathname = "/" + this.removeBase(url.pathname);
    let routeData = matchRoute(pathname, this.#manifestData);
    if (routeData) {
      if (routeData.prerender)
        return void 0;
      return routeData;
    } else if (matchNotFound) {
      const notFoundRouteData = matchRoute("/404", this.#manifestData);
      if (notFoundRouteData == null ? void 0 : notFoundRouteData.prerender)
        return void 0;
      return notFoundRouteData;
    } else {
      return void 0;
    }
  }
  async render(request, routeData) {
    let defaultStatus = 200;
    if (!routeData) {
      routeData = this.match(request);
      if (!routeData) {
        defaultStatus = 404;
        routeData = this.match(request, { matchNotFound: true });
      }
      if (!routeData) {
        return new Response(null, {
          status: 404,
          statusText: "Not found"
        });
      }
    }
    if (routeData.route === "/404") {
      defaultStatus = 404;
    }
    let mod = this.#manifest.pageMap.get(routeData.component);
    if (routeData.type === "page") {
      let response = await this.#renderPage(request, routeData, mod, defaultStatus);
      if (response.status === 500) {
        const fiveHundredRouteData = matchRoute("/500", this.#manifestData);
        if (fiveHundredRouteData) {
          mod = this.#manifest.pageMap.get(fiveHundredRouteData.component);
          try {
            let fiveHundredResponse = await this.#renderPage(
              request,
              fiveHundredRouteData,
              mod,
              500
            );
            return fiveHundredResponse;
          } catch {
          }
        }
      }
      return response;
    } else if (routeData.type === "endpoint") {
      return this.#callEndpoint(request, routeData, mod, defaultStatus);
    } else {
      throw new Error(`Unsupported route type [${routeData.type}].`);
    }
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  async #renderPage(request, routeData, mod, status = 200) {
    const url = new URL(request.url);
    const pathname = "/" + this.removeBase(url.pathname);
    const info = this.#routeDataToRouteInfo.get(routeData);
    const links = createLinkStylesheetElementSet(info.links);
    let scripts = /* @__PURE__ */ new Set();
    for (const script of info.scripts) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    try {
      const ctx = createRenderContext({
        request,
        origin: url.origin,
        pathname,
        componentMetadata: this.#manifest.componentMetadata,
        scripts,
        links,
        route: routeData,
        status
      });
      const response = await renderPage(mod, ctx, this.#env);
      Reflect.set(request, responseSentSymbol, true);
      return response;
    } catch (err) {
      error(this.#logging, "ssr", err.stack || err.message || String(err));
      return new Response(null, {
        status: 500,
        statusText: "Internal server error"
      });
    }
  }
  async #callEndpoint(request, routeData, mod, status = 200) {
    const url = new URL(request.url);
    const pathname = "/" + this.removeBase(url.pathname);
    const handler = mod;
    const ctx = createRenderContext({
      request,
      origin: url.origin,
      pathname,
      route: routeData,
      status
    });
    const result = await callEndpoint(handler, this.#env, ctx, this.#logging);
    if (result.type === "response") {
      if (result.response.headers.get("X-Astro-Response") === "Not-Found") {
        const fourOhFourRequest = new Request(new URL("/404", request.url));
        const fourOhFourRouteData = this.match(fourOhFourRequest);
        if (fourOhFourRouteData) {
          return this.render(fourOhFourRequest, fourOhFourRouteData);
        }
      }
      return result.response;
    } else {
      const body = result.body;
      const headers = new Headers();
      const mimeType = mime.getType(url.pathname);
      if (mimeType) {
        headers.set("Content-Type", `${mimeType};charset=utf-8`);
      } else {
        headers.set("Content-Type", "text/plain;charset=utf-8");
      }
      const bytes = this.#encoder.encode(body);
      headers.set("Content-Length", bytes.byteLength.toString());
      const response = new Response(bytes, {
        status: 200,
        headers
      });
      attachToResponse(response, result.cookies);
      return response;
    }
  }
}
export {
  App,
  deserializeManifest,
  pagesVirtualModuleId,
  resolvedPagesVirtualModuleId
};
