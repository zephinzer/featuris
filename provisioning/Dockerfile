FROM zephinzer/alpine-node:v8.9.1
LABEL APPLICATION="janus feature toggle server" \
      AUTHOR="zephinzer" \
      CONTACT="dev-at-joeir-dot-net"
ARG PORT=3000
ARG NODE_ENV=production
ARG DEFAULT_DATA_SOURCE=data/features
ENV PORT=${PORT} \
    NODE_ENV=${NODE_ENV} \
    DEFAULT_DATA_SOURCE=${DEFAULT_DATA_SOURCE}
VOLUME ["/data"]
EXPOSE ${PORT}
WORKDIR /app
COPY . /app
RUN yarn install \
  && yarn autoclean --init \
  && yarn autoclean --force
ENTRYPOINT ["npm", "start"]