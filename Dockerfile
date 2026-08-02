FROM node:22-alpine AS base
WORKDIR /repo
RUN apk add --no-cache sqlite

FROM base AS deps
COPY package.json package-lock.json ./
COPY back/package.json back/
COPY front/package.json front/
COPY spec/package.json spec/package-lock.json spec/
RUN npm ci --workspaces --include-workspace-root --ignore-scripts

FROM deps AS contract
COPY spec/ spec/
RUN npm run spec:compile

FROM contract AS types
COPY back/ back/
COPY front/ front/
RUN npm run back:api:gen && npm run front:api:gen && npm run prisma:generate -w back

FROM types AS back-build
WORKDIR /repo/back
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --target ES2023 --esModuleInterop --skipLibCheck --rootDir prisma --listEmittedFiles 2>&1 | tail -20

FROM types AS front-build
RUN npm run front:build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache sqlite

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=back-build /repo/node_modules/.prisma ./node_modules/.prisma
COPY --from=back-build /repo/back/dist ./dist
COPY --from=back-build /repo/back/prisma ./prisma
COPY --from=back-build /repo/back/tsconfig.json ./
COPY back/.env ./
COPY --from=front-build /repo/front/dist ./public
COPY back/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
