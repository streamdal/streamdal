import { parseUrl } from "./utils/parse-url.js";
const STATUS_CODE_PAGE_REGEXP = /\/[0-9]{3}\/?$/;
function generateSitemap(pages, finalSiteUrl, opts) {
  const { changefreq, priority, lastmod: lastmodSrc, i18n } = opts;
  const urls = [...pages].filter((url) => !STATUS_CODE_PAGE_REGEXP.test(url));
  urls.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const lastmod = lastmodSrc == null ? void 0 : lastmodSrc.toISOString();
  const { locales, defaultLocale } = i18n || {};
  const localeCodes = Object.keys(locales || {});
  const getPath = (url) => {
    const result = parseUrl(url, (i18n == null ? void 0 : i18n.defaultLocale) || "", localeCodes, finalSiteUrl);
    return result == null ? void 0 : result.path;
  };
  const getLocale = (url) => {
    const result = parseUrl(url, (i18n == null ? void 0 : i18n.defaultLocale) || "", localeCodes, finalSiteUrl);
    return result == null ? void 0 : result.locale;
  };
  const urlData = urls.map((url) => {
    let links;
    if (defaultLocale && locales) {
      const currentPath = getPath(url);
      if (currentPath) {
        const filtered = urls.filter((subUrl) => getPath(subUrl) === currentPath);
        if (filtered.length > 1) {
          links = filtered.map((subUrl) => ({
            url: subUrl,
            lang: locales[getLocale(subUrl)]
          }));
        }
      }
    }
    return {
      url,
      links,
      lastmod,
      priority,
      changefreq
    };
  });
  return urlData;
}
export {
  generateSitemap
};
