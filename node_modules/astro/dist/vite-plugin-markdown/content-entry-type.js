import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../content/utils.js";
const markdownContentEntryType = {
  extensions: [".md"],
  async getEntryInfo({ fileUrl, contents }) {
    const parsed = parseFrontmatter(contents, fileURLToPath(fileUrl));
    return {
      data: parsed.data,
      body: parsed.content,
      slug: parsed.data.slug,
      rawData: parsed.matter
    };
  }
};
const mdxContentEntryType = {
  extensions: [".mdx"],
  async getEntryInfo({ fileUrl, contents }) {
    const parsed = parseFrontmatter(contents, fileURLToPath(fileUrl));
    return {
      data: parsed.data,
      body: parsed.content,
      slug: parsed.data.slug,
      rawData: parsed.matter
    };
  },
  contentModuleTypes: `declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}`
};
export {
  markdownContentEntryType,
  mdxContentEntryType
};
