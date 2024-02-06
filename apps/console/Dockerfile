FROM denoland/deno

EXPOSE 8080

WORKDIR /app

ADD . /app

RUN deno cache main.ts
RUN deno task build

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--allow-run", "main.ts"]

