FROM node:lts-alpine as dev
WORKDIR /develop
RUN npm i -g @nestjs/cli
EXPOSE 3000

FROM node:lts-alpine as build
WORKDIR /build
COPY . .
RUN npm ci
RUN npm run build

FROM node:lts-alpine as prod
WORKDIR /app
COPY --from=build /build/package.json /app
COPY --from=build /build/package-lock.json /app
COPY --from=build /build/dist /app/dist
COPY --from=build /build/prisma /app/prisma
RUN npm ci
EXPOSE 3000
CMD [ "npm", "run", "start:migrate:prod" ]