import React from "react";

export const Rule = () => {
  return (
    <input type="button"
      className="flex justify-center bg-purple-light border-purple-accent w-40 border rounded py-2 cursor-pointer"
      onClick={async () => {
        const result = await fetch("/v1/ruleset");
        console.info("rules", result);
      }}
      value="Get Rules"
    />

  );
};
