import type * as compiler from "@astrojs/compiler";

export function parse(
  ...args: Parameters<typeof compiler.parse>
): Awaited<ReturnType<typeof compiler.parse>>;
export function transform(
  ...args: Parameters<typeof compiler.transform>
): Awaited<ReturnType<typeof compiler.transform>>;
export function convertToTSX(
  ...args: Parameters<typeof compiler.convertToTSX>
): Awaited<ReturnType<typeof compiler.convertToTSX>>;
export function compile(
  ...args: Parameters<typeof compiler.compile>
): Awaited<ReturnType<typeof compiler.compile>>;
