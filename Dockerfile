FROM node:20-alpine as dev
ARG CACHEBUST=1
RUN apk --no-cache add git
RUN npm i -g @nestjs/cli
RUN npm i -g npm-check-updates
USER node
WORKDIR /develop
EXPOSE 3000
EXPOSE 9229

FROM node:20-alpine as build
WORKDIR /build
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm ci
RUN npm run build

FROM node:20-alpine as prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /build/package.json /app
COPY --from=build /build/package-lock.json /app
COPY --from=build /build/dist /app/dist
COPY --from=build /build/prisma /app/prisma
RUN npm ci
USER node
EXPOSE 3000
CMD [ "npm", "run", "start:prod:migration" ]