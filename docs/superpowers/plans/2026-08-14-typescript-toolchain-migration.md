# TypeScript & Toolchain Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `src/` to strict TypeScript on a modern Babel 7 / Jest 29 / ESLint 8 / Prettier 3 toolchain, shipping UMD + ESM + `.d.ts` outputs with zero public-API change.

**Architecture:** Toolchain lands first with source still JS (isolating toolchain risk); files then convert bottom-up along the dependency graph with the 95-test suite as the behavioral contract after every step. Babel transpiles; `tsc` only type-checks and emits declarations. Shaders inline as template literals during conversion, which is what makes the plain-Babel ESM build possible.

**Tech Stack:** TypeScript ~5.x, @babel/preset-{env,typescript}, webpack 5 (UMD), Jest 29 + jest-environment-jsdom, ESLint 8 + @typescript-eslint v8, Prettier 3, TypeDoc.

**Spec:** `docs/superpowers/specs/2026-08-14-typescript-toolchain-migration-design.md`

## Global Constraints

- Public API unchanged; all 95 existing Jest tests must pass after every task.
- Tests remain JavaScript; only `src/` converts.
- Browser targets: `browserslist: ["defaults"]` (IE11 dropped) — classes are NOT transpiled, so `class extends Error` is safe.
- Prettier style preserved: 4-space indent, printWidth 100, double quotes, `trailingComma: "none"`, `arrowParens: "avoid"`.
- Internal import specifiers: explicit `./name.js` (or `./dir/index.js`) everywhere in `src/`.
- Cypress stack untouched. No git commits (user has not requested them); the gate after each task is the full verification command set.
- Verification command per task (referred to below as **GATE**):
  `npx jest test/unit/*.js test/integration/*.js && npx eslint 'src/**/*.{js,ts}' 'test/**/*.js' && npx tsc --noEmit` (tsc from Task 2 onward) — expect 95 passed, 0 lint errors, 0 type errors.

---

### Task 1: Toolchain swap (source stays JS)

**Files:**
- Modify: `package.json` (devDependencies, scripts, jest config)
- Create: `babel.config.js`; Delete: `.babelrc`
- Modify: `.eslintrc`, `.prettierrc`, `webpack.config.js`, `webpack.commonjs2.config.js`

**Interfaces:** Produces a working Babel 7 pipeline consumed by every later task (babel-jest via `babel.config.js`, babel-loader via webpack).

- [ ] Remove devDeps: `babel-cli babel-core babel-jest babel-loader babel-plugin-add-module-exports babel-preset-env eslint eslint-loader husky jest-cli jsdoc prettier`; remove dependency `regenerator-runtime` (grep-verified unused). Add devDeps: `@babel/core @babel/cli @babel/preset-env @babel/preset-typescript babel-loader@^9 babel-jest@^29 jest@^29 jest-environment-jsdom@^29 eslint@^8 @typescript-eslint/parser@^8 @typescript-eslint/eslint-plugin@^8 eslint-config-prettier prettier@^3 typescript typedoc`. Keep `eslint-plugin-cypress`, `webpack`, `webpack-cli`, `raw-loader` (until Task 5), `sinon`, `webgl-mock`, cypress stack.
- [ ] `babel.config.js`:
```js
/* eslint-env node */
module.exports = {
    presets: ["@babel/preset-env", "@babel/preset-typescript"],
    env: {
        esm: {
            presets: [["@babel/preset-env", { modules: false }], "@babel/preset-typescript"]
        }
    }
};
```
- [ ] package.json jest block: add `"testEnvironment": "jsdom"`, `"moduleFileExtensions": ["ts", "js"]`; keep glsl moduleNameMapper (until Task 5) and testMatch.
- [ ] `.eslintrc`: `extends: ["eslint:recommended", "prettier"]`, env `es2021`, `parserOptions.ecmaVersion: 2021`, keep `no-console: 0` and cypress plugin/globals; add TS override:
```json
{
    "files": ["src/**/*.ts"],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    "rules": { "no-console": 0, "@typescript-eslint/no-explicit-any": "off" }
}
```
- [ ] `.prettierrc`: drop `"parser": "babylon"`, add `"arrowParens": "avoid"`; rest unchanged.
- [ ] `webpack.config.js`: drop `eslint-loader` and the dead `style!css` rule; `resolve: { extensions: [".ts", ".js"] }`; `.ts` added to the babel-loader test; `output.library: { name: "VideoContext", type: "umd", export: "default" }` (replaces add-module-exports behavior). Mirror in `webpack.commonjs2.config.js`.
- [ ] Scripts: remove `precommit`; add `"typecheck": "tsc --noEmit"` (activates Task 2); `"browserslist": ["defaults"]` in package.json.
- [ ] Reinstall (`yarn install`), run **GATE** (minus tsc), run `npx webpack`, then smoke: `node -e "const VC=require('./dist/videocontext.js'); if(typeof VC!=='function') throw new Error('not a class')"`.

### Task 2: tsconfig + shared types + leaf conversions

**Files:**
- Create: `tsconfig.json`, `tsconfig.build.json`, `src/types.ts`
- Rename+convert: `src/exceptions.js→.ts`, `src/graphnode.js→.ts`, `src/rendergraph.js→.ts`

**Interfaces:** Produces `IDefinition`, `IDefinitionProperty`, `PropertyValue` (types.ts) consumed by all processing-node tasks; `ConnectException`/`RenderException` become `class … extends Error` (unit tests already lock `instanceof Error`, `.name`, `.message`, `.stack`).

- [ ] `tsconfig.json`: `target es2019`, `lib ["dom","es2019"]`, `module esnext`, `moduleResolution bundler`, `strict true`, `noEmit true`, `esModuleInterop true`, `skipLibCheck true`, include `src/**/*.ts`. `tsconfig.build.json` extends it with `noEmit false, emitDeclarationOnly true, declaration true, declarationDir "dist/types"`.
- [ ] `src/types.ts`:
```ts
export type PropertyValue = number | number[] | HTMLImageElement;
export interface IDefinitionProperty {
    type: string;
    value: PropertyValue;
}
export interface IDefinition {
    title?: string;
    description?: string;
    vertexShader: string;
    fragmentShader: string;
    properties: Record<string, IDefinitionProperty>;
    inputs: string[];
}
```
- [ ] Conversion recipe (applies to every file in Tasks 2–6): rename `.js→.ts`; type constructor params/fields; keep runtime behavior byte-identical; normalize internal imports to explicit `./x.js`; fix JSDoc typos in carried-over comments; run **GATE** after each file.
- [ ] Convert the three files; `exceptions.ts` uses real `class extends Error` with `this.name` set in constructor.

### Task 3: Source-node family

**Files:** Rename+convert `src/SourceNodes/{sourcenode,medianode,videonode,audionode,imagenode,canvasnode,nodes}.js→.ts`, `src/videoelementcacheitem.js→.ts`, `src/videoelementcache.js→.ts`

**Interfaces:** `SourceNode` exposes `_element?: HTMLVideoElement | HTMLAudioElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap`, `_state: number` (SOURCENODESTATE const object), `_startTime/_stopTime: number`. `MediaNode<T extends HTMLMediaElement>` generic optional — prefer simple union typing over redesign.

- [ ] Convert bottom-up: sourcenode → medianode → video/audio/canvas/image nodes → nodes.ts → cacheitem → cache. `SOURCENODESTATE` becomes `const STATE = {...} as const`. GATE after each.

### Task 4: Processing-node family

**Files:** Rename+convert `src/ProcessingNodes/{processingnode,effectnode,transitionnode,compositingnode}.js→.ts`, `src/DestinationNode/destinationnode.js→.ts`; Delete `src/DestinationNode/destinationnode.{frag,vert}` (inline as template literals).

**Interfaces:** `ProcessingNode` constructor takes `(gl: WebGLRenderingContext, renderGraph: RenderGraph, definition: IDefinition, inputNames: string[], limitConnections: boolean)`. Dynamic shader properties accessed via `(this as any)[propertyName]`; `_isTextureCleared` expando typed via `interface ManagedTexture extends WebGLTexture { _isTextureCleared?: boolean }` in utils.

- [ ] Convert processingnode first, then subclasses; inline destinationnode's two shaders as exported consts in the same file; GATE after each.

### Task 5: Definitions (scripted) + raw-loader removal

**Files:** For each of the 22 dirs in `src/Definitions/`: create `<dir>/index.ts` (typed `IDefinition`, shaders inlined byte-identical, backslash/backtick/`${` escaped), delete `<dir>/{*.js,*.frag,*.vert,package.json}`. Convert `src/Definitions/definitions.js→.ts` importing `./<dir>/index.js`. Delete `test/__mocks__/glsl.js`, the jest `moduleNameMapper`, and the `raw-loader` devDep + webpack rule.

- [ ] Write the conversion script in the scratchpad (not the repo), run it, eyeball two generated files against originals, GATE.

### Task 6: utils + videocontext

**Files:** Rename+convert `src/utils.js→.ts`, `src/videocontext.js→.ts`.

**Interfaces:** `VideoContext` default export unchanged; statics (`STATE`, `EVENTS`, `DEFINITIONS`, `NODES`, visualise helpers) preserved. This is the heavy JSDoc-typo file — sweep while carrying comments.

- [ ] Convert utils.ts then videocontext.ts; GATE.

### Task 7: Packaging

**Files:** Modify `package.json` (entry fields + build scripts).

- [ ] Add:
```json
"main": "dist/videocontext.js",
"module": "dist/esm/videocontext.js",
"types": "dist/types/videocontext.d.ts",
"exports": {
    ".": {
        "types": "./dist/types/videocontext.d.ts",
        "import": "./dist/esm/videocontext.js",
        "require": "./dist/videocontext.js",
        "default": "./dist/videocontext.js"
    }
},
"sideEffects": false
```
- [ ] Scripts: `"build": "yarn build:umd && yarn build:esm && yarn build:types"`, `"build:umd": "webpack --config webpack.config.js"`, `"build:esm": "BABEL_ENV=esm babel src --out-dir dist/esm --extensions \".ts\" --source-maps"`, `"build:types": "tsc -p tsconfig.build.json"`.
- [ ] Run all three builds. Smoke: UMD `require` returns a function; `node --input-type=module -e "import('./dist/esm/videocontext.js').then(m=>{if(typeof m.default!=='function')throw new Error('bad esm')})"` (import parse may touch DOM-free module scope only — expected to pass since module top-level has no DOM access).

### Task 8: Docs + CI

**Files:** Modify `build-docs.sh`, `package.json` docs script, `.github/workflows/build.yaml`.

- [ ] `"docs": "typedoc --out docs src/videocontext.ts"` (build-docs.sh reduced to that call or deleted with script updated); verify TypeDoc runs clean.
- [ ] CI: `node-version: '20.x'`; insert `- run: yarn typecheck` before the test step. Cypress matrix entry untouched.

### Task 9: Final verification

- [ ] `npx prettier --write 'src/**/*.ts' 'test/**/*.js'` then `--list-different` clean.
- [ ] Full **GATE** + all three builds + both smokes + `git status` review of the complete diff.
- [ ] Report: test count, type-check status, build outputs, and any behavior notes.
