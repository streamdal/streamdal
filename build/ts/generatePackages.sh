#/bin/sh

mkdir -p /node/esm && mkdir -p /node/cjs

echo '{ "type": "module" }' >> ./node/esm/package.json
echo '{ "type": "commonjs" }' >> ./node/cjs/package.json

