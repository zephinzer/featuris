FROM zephinzer/janus:latest
ENV NODE_ENV="production" \
    LOGS_FORMAT="json" \
    PORT=3000
COPY ./path/to/data/features /app/data/features
VOLUME ["/app/data/features"]
ENTRYPOINT ["npm", "start"]