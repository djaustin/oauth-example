FROM alpine

WORKDIR /web

RUN apk update \
  && apk add nodejs nodejs-npm git \
  && git clone https://github.com/djaustin/oauth-example.git . \
  && apk del git \
  && npm install

EXPOSE 80

ENV PORT=80

CMD ["node" , "server.js"]
