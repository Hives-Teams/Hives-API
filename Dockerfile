FROM node:20-alpine3.20 AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

FROM mcr.microsoft.com/devcontainers/base:alpine-3.20 AS dev
COPY --from=base /usr/lib /usr/lib
COPY --from=base /usr/local/lib /usr/local/lib
COPY --from=base /usr/local/include /usr/local/include
COPY --from=base /usr/local/bin /usr/local/bin

FROM base AS build
WORKDIR /build
COPY . .
RUN npm ci
RUN npm run build

FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /build/package.json /app
COPY --from=build /build/package-lock.json /app
COPY --from=build /build/dist /app/dist
COPY --from=build /build/prisma/ /app/prisma/
COPY --from=build /build/prod.sh /app
RUN npm ci
USER node
CMD [ "/bin/sh", "prod.sh" ]

FROM base AS test
WORKDIR /test
COPY . .
RUN npm ci
CMD [ "npm", "run", "test:cov" ]