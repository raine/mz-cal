FROM mhart/alpine-node:12
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY src ./src
RUN yarn build
RUN npm prune --production

FROM mhart/alpine-node:slim-12
WORKDIR /app
ENV NODE_ENV=production
COPY --from=0 /app .
RUN apk --no-cache add curl
CMD ["node", "dist/index.js"]
