export const mutate = async ({
  method,
  apiPath,
  body,
}: {
  method: "PUT" | "POST" | "DELETE";
  apiPath: string;
  body?: any;
}) => {
  const response = await fetch(
    `${import.meta.env.PUBLIC_API_URL || ""}${apiPath}`,
    {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
  );

  if (response.ok || response.redirected) {
    return response.json();
  }

  throw Error("operation failed");
};
