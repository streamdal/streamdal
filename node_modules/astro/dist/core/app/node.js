import * as fs from "fs";
import { IncomingMessage } from "http";
import { TLSSocket } from "tls";
import { deserializeManifest } from "./common.js";
import { App } from "./index.js";
const clientAddressSymbol = Symbol.for("astro.clientAddress");
function createRequestFromNodeRequest(req, body) {
  var _a;
  const protocol = req.socket instanceof TLSSocket || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  let url = `${protocol}://${req.headers.host}${req.url}`;
  let rawHeaders = req.headers;
  const entries = Object.entries(rawHeaders);
  const method = req.method || "GET";
  let request = new Request(url, {
    method,
    headers: new Headers(entries),
    body: ["HEAD", "GET"].includes(method) ? null : body
  });
  if ((_a = req.socket) == null ? void 0 : _a.remoteAddress) {
    Reflect.set(request, clientAddressSymbol, req.socket.remoteAddress);
  }
  return request;
}
class NodeIncomingMessage extends IncomingMessage {
}
class NodeApp extends App {
  match(req, opts = {}) {
    return super.match(req instanceof Request ? req : createRequestFromNodeRequest(req), opts);
  }
  render(req, routeData) {
    if (typeof req.body === "string" && req.body.length > 0) {
      return super.render(
        req instanceof Request ? req : createRequestFromNodeRequest(req, Buffer.from(req.body)),
        routeData
      );
    }
    if (typeof req.body === "object" && req.body !== null && Object.keys(req.body).length > 0) {
      return super.render(
        req instanceof Request ? req : createRequestFromNodeRequest(req, Buffer.from(JSON.stringify(req.body))),
        routeData
      );
    }
    if ("on" in req) {
      let body = Buffer.from([]);
      let reqBodyComplete = new Promise((resolve, reject) => {
        req.on("data", (d) => {
          body = Buffer.concat([body, d]);
        });
        req.on("end", () => {
          resolve(body);
        });
        req.on("error", (err) => {
          reject(err);
        });
      });
      return reqBodyComplete.then(() => {
        return super.render(
          req instanceof Request ? req : createRequestFromNodeRequest(req, body),
          routeData
        );
      });
    }
    return super.render(
      req instanceof Request ? req : createRequestFromNodeRequest(req),
      routeData
    );
  }
}
async function loadManifest(rootFolder) {
  const manifestFile = new URL("./manifest.json", rootFolder);
  const rawManifest = await fs.promises.readFile(manifestFile, "utf-8");
  const serializedManifest = JSON.parse(rawManifest);
  return deserializeManifest(serializedManifest);
}
async function loadApp(rootFolder) {
  const manifest = await loadManifest(rootFolder);
  return new NodeApp(manifest);
}
export {
  NodeApp,
  loadApp,
  loadManifest
};
