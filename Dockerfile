FROM node:20-alpine as dev
ARG CACHEBUST=1
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk --no-cache add git
RUN npm i -g @nestjs/cli
RUN npm i -g npm-check-updates
USER node
WORKDIR /develop
EXPOSE 3000
EXPOSE 9229

FROM node:20-alpine as build
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /build
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm ci
RUN npm run build

FROM node:20-alpine as prod
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /build/package.json /app
COPY --from=build /build/package-lock.json /app
COPY --from=build /build/dist /app/dist
COPY --from=build /build/prisma/ /app/prisma/
RUN npm ci
USER node
EXPOSE 3000
CMD [ "npm", "run", "start:prod:migration" ]

FROM node:20-alpine as test
WORKDIR /test
COPY . .
RUN npm ci
CMD [ "npm", "run", "test:cov" ]