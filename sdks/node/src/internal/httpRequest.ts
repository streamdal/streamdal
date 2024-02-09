import { PipelineStep } from "@streamdal/protos/protos/sp_pipeline";
import { WASMExitCode } from "@streamdal/protos/protos/sp_wsm";
import { HttpRequestMethod } from "@streamdal/protos/protos/steps/sp_steps_httprequest";

export const httpRequest = async ({ step }: { step: PipelineStep }) => {
  if (step.step.oneofKind !== "httpRequest" || !step.step.httpRequest.request) {
    throw new Error("not a valid httpRequest");
  }

  const response = await fetch(step.step.httpRequest.request.url, {
    method: HttpRequestMethod[step.step.httpRequest.request.method],
    body: new TextDecoder().decode(step.step.httpRequest.request.body),
    headers: step.step.httpRequest.request.headers,
  });

  let body;
  try {
    body = await response.json();
  } catch {
    console.debug("could not parse http request response body");
  }

  return {
    outputStep: null,
    outputPayload: new Uint8Array(),
    exitCode: response.ok
      ? WASMExitCode.WASM_EXIT_CODE_TRUE
      : WASMExitCode.WASM_EXIT_CODE_ERROR,
    ...(body ? { exitMsg: JSON.stringify(body) } : {}),
    interStepResult: undefined,
  };
};
