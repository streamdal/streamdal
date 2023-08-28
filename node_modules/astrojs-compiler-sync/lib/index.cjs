"use strict";

const { resolve } = require("path");
const { createSyncFn } = require("synckit");

const compilerSync = createSyncFn(
  resolve(__dirname, "./astrojs-compiler-worker-service.mjs")
);

module.exports = {
  parse,
  transform,
  convertToTSX,
  compile,
};

function parse(...args) {
  return compilerSync("parse", ...args);
}

function transform(...args) {
  return compilerSync("transform", ...args);
}

function convertToTSX(...args) {
  return compilerSync("convertToTSX", ...args);
}

function compile(...args) {
  return compilerSync("compile", ...args);
}
