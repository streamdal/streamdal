#/bin/sh

mkdir -p ./build
cp README.md ./build/
cp package.json ./build/package.json

echo '{ "type": "commonjs" }' >> ./build/cjs/package.json
