FROM node

WORKDIR /web

RUN git clone https://github.com/djaustin/oauth-example.git . \
  && npm install

EXPOSE 80

ENV PORT=80

CMD ["node" , "server.js"]
