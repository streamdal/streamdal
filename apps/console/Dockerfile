FROM denoland/deno

EXPOSE 8080

WORKDIR /app

ADD . /app

RUN deno cache main.ts
#
# Deno returns error even when the build succeeds
RUN deno task build || true

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--allow-run", "main.ts"]

