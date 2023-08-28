import { AstroError, AstroErrorData } from "../core/errors/index.js";
import { getErrorDataByCode } from "../core/errors/utils.js";
const EVENT_ERROR = "ASTRO_CLI_ERROR";
const ANONYMIZE_MESSAGE_REGEX = /^(\w| )+/;
function anonymizeErrorMessage(msg) {
  const matchedMessage = msg.match(ANONYMIZE_MESSAGE_REGEX);
  if (!matchedMessage || !matchedMessage[0]) {
    return void 0;
  }
  return matchedMessage[0].trim().substring(0, 20);
}
function eventConfigError({
  err,
  cmd,
  isFatal
}) {
  const payload = {
    code: AstroErrorData.UnknownConfigError.code,
    name: "ZodError",
    isFatal,
    isConfig: true,
    cliCommand: cmd,
    configErrorPaths: err.issues.map((issue) => issue.path.join("."))
  };
  return [{ eventName: EVENT_ERROR, payload }];
}
function eventError({
  cmd,
  err,
  isFatal
}) {
  var _a;
  const errorData = AstroError.is(err) && err.errorCode ? (_a = getErrorDataByCode(err.errorCode)) == null ? void 0 : _a.data : void 0;
  const payload = {
    code: err.code || err.errorCode || AstroErrorData.UnknownError.code,
    name: err.name,
    plugin: err.plugin,
    cliCommand: cmd,
    isFatal,
    anonymousMessageHint: errorData && errorData.message ? getSafeErrorMessage(errorData.message) : anonymizeErrorMessage(err.message)
  };
  return [{ eventName: EVENT_ERROR, payload }];
}
function getSafeErrorMessage(message) {
  if (typeof message === "string") {
    return message;
  } else {
    return String.raw({
      raw: extractStringFromFunction(message.toString())
    });
  }
  function extractStringFromFunction(func) {
    const arrowIndex = func.indexOf("=>") + "=>".length;
    return func.slice(arrowIndex).trim().slice(1, -1).replace(
      /\${([^}]+)}/gm,
      (str, match1) => `${match1.split(/\.?(?=[A-Z])/).join("_").toUpperCase()}`
    ).replace(/\\`/g, "`");
  }
}
export {
  eventConfigError,
  eventError
};
