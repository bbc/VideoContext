set -o monitor

echo "Generating API docs from code"
./node_modules/.bin/typedoc --out docs/api src/videocontext.ts

echo "Making fresh build to use in examples"
yarn build
echo "Copying build into docs dist"
mkdir -p docs/dist
cp dist/videocontext.* docs/dist/

echo "Docs now ready for github pages deploy"
