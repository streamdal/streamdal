FROM denoland/deno

EXPOSE 8000
WORKDIR /app
ADD . /app
RUN deno cache main.ts
CMD ["run", "--allow-net", "--allow-read", "--allow-env", "main.ts"]