"use strict";

const path = require('path');

const fs = require('fs');

const JSON5 = require('json5');

const pathExists = require('path-exists');

const INFINITY = 1 / 0;
const BABELRC_FILENAME = '.babelrc';
const BABELRC_JS_FILENAME = '.babelrc.js';
const BABEL_CONFIG_JS_FILENAME = 'babel.config.js';
const BABEL_CONFIG_JSON_FILENAME = 'babel.config.json';
const PACKAGE_FILENAME = 'package.json';
const nullConf = {
  file: null,
  config: null
};

function getBabelJsConfig(file) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const configModule = require(file);

  if (typeof configModule === 'function') {
    return configModule();
  } // eslint-disable-next-line no-underscore-dangle


  return configModule && configModule.__esModule ? configModule.default : configModule;
}

function asyncFind(resolve, dir, depth) {
  if (depth < 0) {
    return resolve(nullConf);
  }

  const babelrc = path.join(dir, BABELRC_FILENAME);
  return pathExists(babelrc).then(exists => {
    if (exists) {
      fs.readFile(babelrc, 'utf8', (err, data) => {
        if (!err) {
          resolve({
            file: babelrc,
            config: JSON5.parse(data)
          });
        }
      });
    }

    return exists;
  }).then(exists => {
    if (!exists) {
      const babelJSrc = path.join(dir, BABELRC_JS_FILENAME);
      return pathExists(babelJSrc).then(ex => {
        if (ex) {
          const config = getBabelJsConfig(babelJSrc);
          resolve({
            file: babelJSrc,
            config
          });
        }
      });
    }

    return exists;
  }).then(exists => {
    if (!exists) {
      const babelConfigJSrc = path.join(dir, BABEL_CONFIG_JS_FILENAME);
      return pathExists(babelConfigJSrc).then(ex => {
        if (ex) {
          const config = getBabelJsConfig(babelConfigJSrc);
          resolve({
            file: babelConfigJSrc,
            config
          });
        }
      });
    }

    return exists;
  }).then(exists => {
    if (!exists) {
      const babelConfigJsonSrc = path.join(dir, BABEL_CONFIG_JSON_FILENAME);
      return pathExists(babelConfigJsonSrc).then(ex => {
        if (ex) {
          fs.readFile(babelConfigJsonSrc, 'utf8', (err, data) => {
            if (!err) {
              resolve({
                file: babelConfigJsonSrc,
                config: JSON5.parse(data)
              });
            }
          });
        }
      });
    }

    return exists;
  }).then(exists => {
    if (!exists) {
      const packageFile = path.join(dir, PACKAGE_FILENAME);
      return pathExists(packageFile).then(ex => {
        if (ex) {
          fs.readFile(packageFile, 'utf8', (err, data) => {
            const packageJson = JSON.parse(data);

            if (packageJson.babel) {
              resolve({
                file: packageFile,
                config: packageJson.babel
              });
            }
          });
        }
      });
    }

    return exists;
  }).then(exists => {
    if (!exists) {
      const nextDir = path.dirname(dir);

      if (nextDir === dir) {
        resolve(nullConf);
      } else {
        asyncFind(resolve, nextDir, depth - 1);
      }
    }
  });
}

module.exports = function findBabelConfig(start, depth = INFINITY) {
  if (!start) {
    return new Promise(resolve => resolve(nullConf));
  }

  const dir = path.isAbsolute(start) ? start : path.join(process.cwd(), start);
  return new Promise(resolve => {
    asyncFind(resolve, dir, depth);
  });
};

module.exports.sync = function findBabelConfigSync(start, depth = INFINITY) {
  if (!start) {
    return nullConf;
  }

  let dir = path.isAbsolute(start) ? start : path.join(process.cwd(), start);
  let loopLeft = depth;

  do {
    const babelrc = path.join(dir, BABELRC_FILENAME);

    if (pathExists.sync(babelrc)) {
      const babelrcContent = fs.readFileSync(babelrc, 'utf8');
      return {
        file: babelrc,
        config: JSON5.parse(babelrcContent)
      };
    }

    const babelJSrc = path.join(dir, BABELRC_JS_FILENAME);

    if (pathExists.sync(babelJSrc)) {
      const config = getBabelJsConfig(babelJSrc);
      return {
        file: babelJSrc,
        config
      };
    }

    const babelConfigJSrc = path.join(dir, BABEL_CONFIG_JS_FILENAME);

    if (pathExists.sync(babelConfigJSrc)) {
      const config = getBabelJsConfig(babelConfigJSrc);
      return {
        file: babelConfigJSrc,
        config
      };
    }

    const babelConfigJsonSrc = path.join(dir, BABEL_CONFIG_JSON_FILENAME);

    if (pathExists.sync(babelConfigJsonSrc)) {
      const babelConfigContent = fs.readFileSync(babelConfigJsonSrc, 'utf8');
      return {
        file: babelConfigJsonSrc,
        config: JSON5.parse(babelConfigContent)
      };
    }

    const packageFile = path.join(dir, PACKAGE_FILENAME);

    if (pathExists.sync(packageFile)) {
      const packageContent = fs.readFileSync(packageFile, 'utf8');
      const packageJson = JSON.parse(packageContent);

      if (packageJson.babel) {
        return {
          file: packageFile,
          config: packageJson.babel
        };
      }
    }

    if (loopLeft === 0) {
      return nullConf;
    }

    loopLeft -= 1; // eslint-disable-next-line no-cond-assign
  } while (dir !== (dir = path.dirname(dir)));

  return nullConf;
};