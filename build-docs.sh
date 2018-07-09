set -o monitor

echo "Generating API docs from code"
./node_modules/.bin/jsdoc -c jsdoc.json

echo "Making fresh build to use in examples"
npm run build
echo "Copying build into docs dist"
cp dist/videocontext.* docs/dist/

echo "Docs now ready for github pages deploy"
