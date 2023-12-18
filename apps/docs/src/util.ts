import type { AstroGlobal } from "astro";
import { SIDEBAR, MenuItem } from "./config";

export type Links = { text: string; slug: string; link: string }[];

export function getLanguageFromURL(pathname: string) {
  const langCodeMatch = pathname.match(/\/([a-z]{2}-?[a-z]{0,2})\//);
  return langCodeMatch ? langCodeMatch[1] : "en";
}

/** Get the navigation sidebar content for the current language. */
export function getNav(Astro: AstroGlobal): Links {
  const langCode = getLanguageFromURL(Astro.url.pathname) || "en";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sidebar = SIDEBAR[langCode];
  const nav = [];

  for (const k in sidebar) {
    for (const entry of sidebar[k]) {
      nav.push(entry);
    }
  }
  return nav;
}

/** Remove the subpage segment of a URL string */
export function removeSubpageSegment(path: string) {
  // Include new pages with subpages as part of this if statement.
  if (/(?:install|deploy|integrations-guide)\//.test(path)) {
    return path.slice(0, path.lastIndexOf("/"));
  }
  return path;
}

const getLinks = (data: any) =>
  data.reduce(
    (acc: string[], item: MenuItem) => [
      ...acc,
      ...("link" in item
        ? [`https://docs.streamdal.com/${item.link}`]
        : getLinks(item.children)),
    ],
    []
  );

const parseLinks = () => {
  const sidebar = SIDEBAR["en"];
  const nav = Object.values(sidebar)
    .map((v) => v)
    .flat();
  return getLinks(nav);
};

export const links = parseLinks();
