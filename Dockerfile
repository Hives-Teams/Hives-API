FROM node:20-alpine as base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

FROM base as dev
ARG CACHEBUST=1
RUN apk add --no-cache libc6-compat
RUN apk --no-cache add git
RUN npm i -g @nestjs/cli
RUN npm i -g npm-check-updates
USER node
WORKDIR /develop
EXPOSE 3000
EXPOSE 9229

FROM base as build
WORKDIR /build
COPY . .
RUN npm ci
RUN npm run build

FROM base as prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /build/package.json /app
COPY --from=build /build/package-lock.json /app
COPY --from=build /build/dist /app/dist
COPY --from=build /build/prisma/ /app/prisma/
RUN npm ci
USER node
EXPOSE 3000
CMD [ "node", "dist/main" ]

FROM base as test
WORKDIR /test
COPY . .
RUN npm ci
CMD [ "npm", "run", "test:cov" ]

FROM base as migration
WORKDIR /build
COPY . .
RUN npm ci
CMD [ "npm", "run", "migration" ]