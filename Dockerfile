FROM oven/bun:latest AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

#dev
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]

#build
FROM base AS build
COPY . .
RUN bun run build

#prod
FROM oven/bun:latest AS prod
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
RUN bun install --production

EXPOSE 3000
CMD ["bun", "./build/index.js"]
