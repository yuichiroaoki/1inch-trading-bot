FROM node:14.18

WORKDIR /app

ENV NODE_ENV production

COPY package.json .
RUN yarn set version berry

COPY yarn.lock .yarn tsconfig.json .yarnrc.yml ./
RUN yarn install
COPY . ./
RUN yarn build

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node