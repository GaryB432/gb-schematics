git clean -fdx
pnpm store prune && pnpm clean --lockfile && pnpm install
pnpm run build
pnpm --filter=@gb-schematics/cli build --listEmittedFiles
pnpm --filter=@gb-schematics/schematics build --listEmittedFiles
node ./tools/generate-schema-types.ts
rm **/*.generated.ts
pnpm run build
