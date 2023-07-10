import { getEnv } from "./utils.ts";

export const getJson = async (apiPath: string) => {
  const response = await fetch(
    `${await getEnv("PUBLIC_API_URL") || "http://localhost:9191"}${apiPath}`,
  );

  if (response.ok || response.redirected) {
    return response.json();
  }

  throw Error("response not ok");
};

export const getText = async (apiPath: string) => {
  const response = await fetch(
    `${await getEnv("PUBLIC_API_URL") || "http://localhost:9191"}${apiPath}`,
  );

  if (response.ok || response.redirected) {
    return response.text();
  }

  throw Error("response not ok");
};
