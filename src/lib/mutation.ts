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

  let errorMessage = "Operation failed: ";

  try {
    const errorBody = await response.json();
    errorMessage += errorBody?.message
      ? errorBody.message
      : "with unknown error";
  } catch (e) {
    errorMessage += "with unknown error";
  }

  console.error(`API mutation error for ${apiPath}`, errorMessage);

  throw Error(errorMessage);
};
