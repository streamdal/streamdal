import { credentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadFileDescriptorSetFromBuffer } from "@grpc/proto-loader";
import { ProtoGrpcType } from "@streamdal/plumber-schemas/types/ps_base";
import { readFileSync } from "fs";

export const hello = () => "Hello World!";

enum Mode {
  Consume,
  Publish,
}

interface Config {
  dataSource: string;
  plumberUrl: string;
  plumberToken: string;
  dryRun: boolean;
  wasmTimeout: string; // seconds
}

export const getConfigs = (): Config => ({
  dataSource: "",
  plumberUrl: process.env.PLUMBER_URL || "",
  plumberToken: process.env.PLUMBER_TOKEN || "",
  dryRun: !process.env.DATAQUAL_DRY_RUN,
  wasmTimeout: `${process.env.DATAQUAL_WASM_TIMEOUT || 1}s`,
});

const buffer = readFileSync(
  require.resolve("@streamdal/plumber-schemas/descriptor-sets/protos.fds")
);
const definition = loadFileDescriptorSetFromBuffer(buffer);

const proto: ProtoGrpcType = loadPackageDefinition(
  definition
) as unknown as ProtoGrpcType;

const plumberClient = new proto.protos.PlumberServer(
  "0.0.0.0:9090",
  credentials.createInsecure()
);

const start = () => {
  plumberClient.GetAllRelays(
    {
      auth: {
        token: "streamdal",
      },
    },
    (error, response) => {
      error && console.info("relay errors", error);
      console.log("relays", response);
    }
  );
};

start();
