FROM denoland/deno

ARG DEPLOY_VERSION
ENV DENO_DEPLOYMENT_ID=${DEPLOY_VERSION}

WORKDIR /app

ADD . /app

RUN deno cache main.ts

EXPOSE 8080

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--allow-run", "main.ts"]

