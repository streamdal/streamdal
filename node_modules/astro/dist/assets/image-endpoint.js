import mime from "mime/lite.js";
import { isRemotePath } from "../core/path.js";
import { getConfiguredImageService } from "./internal.js";
import { isLocalService } from "./services/service.js";
import { etag } from "./utils/etag.js";
async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    return void 0;
  }
}
const get = async ({ request }) => {
  try {
    const imageService = await getConfiguredImageService();
    if (!isLocalService(imageService)) {
      throw new Error("Configured image service is not a local service");
    }
    const url = new URL(request.url);
    const transform = await imageService.parseURL(url);
    if (!transform || !transform.src) {
      throw new Error("Incorrect transform returned by `parseURL`");
    }
    let inputBuffer = void 0;
    const sourceUrl = isRemotePath(transform.src) ? new URL(transform.src) : new URL(transform.src, url.origin);
    inputBuffer = await loadRemoteImage(sourceUrl);
    if (!inputBuffer) {
      return new Response("Not Found", { status: 404 });
    }
    const { data, format } = await imageService.transform(inputBuffer, transform);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": mime.getType(format) ?? `image/${format}`,
        "Cache-Control": "public, max-age=31536000",
        ETag: etag(data.toString()),
        Date: (/* @__PURE__ */ new Date()).toUTCString()
      }
    });
  } catch (err) {
    return new Response(`Server Error: ${err}`, { status: 500 });
  }
};
export {
  get
};
