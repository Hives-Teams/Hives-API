FROM node:20-alpine as base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

FROM base as dev
ARG CACHEBUST=1
WORKDIR /workspace
RUN apk update && apk --no-cache add git zsh libuser \
  && touch /etc/login.defs \
  && mkdir /etc/default \
  && touch /etc/default/useradd \
  # change the password of teh current user to ''
  && passwd `whoami` -d \
  # change the default shell to zsh for the current user
  && echo '/bin/zsh' | lchsh `whoami` \
  # install oh-my-zsh git prompt
  && sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
RUN npm i -g @nestjs/cli
RUN npm i -g npm-check-updates
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
COPY --from=build /build/prod.sh /app
RUN npm ci
USER node
EXPOSE 3000
CMD [ "/bin/sh", "prod.sh" ]

FROM base as test
WORKDIR /test
COPY . .
RUN npm ci
CMD [ "npm", "run", "test:cov" ]