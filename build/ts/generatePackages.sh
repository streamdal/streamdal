#/bin/sh

echo '{ "type": "module" }' >> ./node/esm/package.json
echo '{ "type": "commonjs" }' >> ./node/cjs/package.json

