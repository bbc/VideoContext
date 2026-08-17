# TypeScript & Toolchain Migration — Design

Date: 2026-08-14
Status: Approved (in-chat) by Em

## Goal

Modernize VideoContext's language, toolchain, and packaging without changing its
public API or runtime behavior:

1. Convert `src/` (20 modules, ~4,100 lines) to TypeScript.
2. Replace the Babel 6 / ESLint 4 / Prettier 1 / mixed-Jest toolchain with a
   coherent modern stack.
3. Publish UMD + ESM + type declarations from one package.
4. Sweep the long-standing JSDoc typos while carrying comments over.

Out of scope (explicitly deferred): Cypress 4 → 13 migration and its
image-snapshot plugin replacement; git hooks (husky is removed, CI is the gate).

## Decisions (user-approved)

- **Full TypeScript** for `src/`; tests remain JavaScript.
- **Core toolchain only**; Cypress untouched; husky removed entirely.
- **Packaging: UMD + ESM + types**; `main` keeps pointing at the existing UMD
  bundle path so no consumer breaks.
- **Browser targets: `defaults`** browserslist (drops IE11). Consequence:
  `@babel/preset-env` no longer transpiles classes, so `class extends Error`
  is safe and `src/exceptions.js`'s manual prototype wiring can become real
  `Error` subclasses.

## Architecture

### Language & type layer

- `tsconfig.json`: `strict: true`, `lib: ["dom", "es2019"]`,
  `moduleResolution: "bundler"`, `noEmit` (type-check only).
- `tsconfig.build.json`: `emitDeclarationOnly` → `dist/types`.
- Transpilation stays with Babel (`@babel/preset-env` +
  `@babel/preset-typescript`); `tsc` never emits JS.
- Dynamic patterns get narrow escapes, not redesigns:
  `ProcessingNode`'s `defineProperty`-generated shader properties use
  `(this as any)[propertyName]` at the access sites; the `_isTextureCleared`
  expando on `WebGLTexture` gets a small declared interface extension.
- Shared types in `src/types.ts`: `IDefinition` (vertex/fragment shader
  sources, `properties` record, `inputs`), property value unions
  (`number | number[] | HTMLImageElement`).
- Internal import specifiers are normalized to explicit `./name.js`
  (TS resolves them to `.ts` sources; Node ESM and bundlers resolve them in
  the compiled output).

### Shaders

All 44 `.frag`/`.vert` files are inlined into their owning modules as
template-literal string constants during conversion (byte-identical content).
Each `src/Definitions/<name>/` directory collapses from
`{name.js, name.frag, name.vert, package.json}` to a single `<name>/index.ts`.
`raw-loader`, the per-directory stub `package.json` files, and the Jest glsl
`moduleNameMapper` mock are deleted once the last shader import is gone.

### Build & packaging

Three outputs from `yarn build`:

| Output | Tool | Path | package.json field |
|---|---|---|---|
| UMD bundle | webpack 5 + babel-loader 9 | `dist/videocontext.js` (unchanged) | `main` |
| Per-module ESM | `babel src --extensions .ts` (`BABEL_ENV=esm`, `modules: false`) | `dist/esm/` | `module`, `exports.import` |
| Declarations | `tsc -p tsconfig.build.json` | `dist/types/` | `types` |

- webpack `output.library` gains `export: "default"` to preserve
  `window.VideoContext` being the class itself (this replaces the Babel 6
  `add-module-exports` plugin's job).
- `package.json` adds `exports` (with `types`/`import`/`require` conditions),
  `sideEffects: false`, and `browserslist: ["defaults"]`.
- The `regenerator-runtime` runtime dependency is removed (no async/generator
  code exists in `src/`); the package ends with zero runtime dependencies.

### Lint / format / test stack

- **ESLint 8**, classic `.eslintrc`: `eslint:recommended` + `prettier`
  (via `eslint-config-prettier`), with a TS override block using
  `@typescript-eslint` parser + recommended rules for `src/**/*.ts`.
  `eslint-loader` is removed from webpack (linting runs standalone).
- **Prettier 3**, configured to preserve the current style (4-space indent,
  printWidth 100, double quotes, `trailingComma: "none"`,
  `arrowParens: "avoid"`) to keep the reformat diff minimal. The dead
  `parser: "babylon"` option is dropped.
- **Jest 29** aligned: `jest-cli@23` and `babel-jest@23` removed;
  `babel-jest@29` + `jest-environment-jsdom` added with
  `testEnvironment: "jsdom"` declared explicitly (today jsdom only works
  because the v23 binary happens to win `.bin` resolution).
- `webgl-mock` and `sinon` unchanged. Tests stay `.js`.
- `husky` and the `precommit` script are removed.

### Docs & CI

- `jsdoc` → **TypeDoc** (JSDoc cannot parse TS). `build-docs.sh` and the
  `docs` script updated; same `docs/` output location.
- JSDoc typos ("dosen't", "attmept", "spearte", "curernt", "transistion",
  "seqeuncing", …) are fixed as each file's comments are carried into TS.
- CI `build.yaml`: Node 18 → 20; new `yarn typecheck` step before tests.
  The Cypress matrix entry is untouched.

## Migration order & safety

1. **Toolchain first, source still JS**: land Babel 7 / Jest 29 / ESLint 8 /
   Prettier 3 / webpack changes with all 95 existing tests green. This
   isolates toolchain risk from conversion risk.
2. **Convert bottom-up** along the dependency graph:
   `exceptions` → `graphnode` → `rendergraph` → `sourcenode` → media/video/
   audio/image/canvas nodes → `videoelementcache(item)` → `processingnode` →
   effect/transition/compositing/destination nodes (+ shader inlining) →
   `Definitions/*` (scripted) → `utils` → `videocontext`.
   Full test suite runs after each conversion step.
3. **Gates**: `eslint` clean, `tsc --noEmit` clean, 95/95 Jest tests, all
   three build outputs produced, plus smoke checks — `require()` of the UMD
   bundle returns the VideoContext class; `import` of `dist/esm/videocontext.js`
   parses under Node.

## Error handling & compatibility notes

- Public API surface is unchanged; the existing 95-test suite is the
  behavioral contract.
- `exceptions.ts` becomes `class … extends Error` (safe under `defaults`
  targets); `instanceof` behavior is already locked by unit tests.
- Dropping IE11 via browserslist is the only intentional support change.
