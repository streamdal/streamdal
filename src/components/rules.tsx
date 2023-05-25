import React from "react";

export const Rule = () => {
  return (
    <input
      type="button"
      className="flex justify-center btn-heimdal"
      onClick={async () => {
        const result = await fetch("/v1/ruleset");
        console.info("rules", result);
      }}
      value="Get Rules"
    />
  );
};
