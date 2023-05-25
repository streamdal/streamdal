import React from "react";

export const Rule = () => {
  return (
    <div
      className="flex justify-center bg-purple-light border-purple-accent w-40 border rounded"
      onClick={async () => {
        const result = await fetch("/v1/ruleset");
        console.info("rules", result);
      }}
    >
      <h1 className="my-2 cursor-pointer">Get Rules</h1>
    </div>
  );
};
