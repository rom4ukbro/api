FROM node:14-alpine

WORKDIR /data/app
ADD . /data/app

RUN \
    apk add --no-cache --virtual=build-dependencies git && \
    npm install && \
    npm run build && \
    npm cache clean --force && \
    rm -rf .npmrc && \
    apk del --no-cache build-dependencies

EXPOSE 3000

ENTRYPOINT ["npm"]
CMD ["start"]
