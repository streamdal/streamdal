#/bin/sh

cp README.md ./build/
mkdir -p ./build
cp package.json ./build/package.json

echo '{ "type": "module" }' >> ./build/esm/package.json
echo '{ "type": "commonjs" }' >> ./build/cjs/package.json

