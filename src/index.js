import { credentials } from "@grpc/grpc-js";
import { ExternalClient, } from "@streamdal/snitch-protos/protos/external_api.grpc-client.js";
export const hello = () => "Hello World!";
var Mode;
(function (Mode) {
    Mode[Mode["Consume"] = 0] = "Consume";
    Mode[Mode["Publish"] = 1] = "Publish";
})(Mode || (Mode = {}));
export const getConfigs = () => ({
    dataSource: "",
    plumberUrl: process.env.PLUMBER_URL || "",
    plumberToken: process.env.PLUMBER_TOKEN || "",
    dryRun: !process.env.DATAQUAL_DRY_RUN,
    wasmTimeout: `${process.env.DATAQUAL_WASM_TIMEOUT || 1}s`,
});
const client = new ExternalClient("http://localhost:9091", credentials.createInsecure(), {}, {});
const start = () => {
    const call = client.test({ input: "hello world" }, (err, value) => {
        if (err) {
            console.log("got err: ", err);
        }
        if (value) {
            console.log("got response message: ", value);
        }
    });
    call.on("metadata", (arg1) => {
        console.log("got response headers: ", arg1);
    });
    call.on("status", (arg1) => {
        console.log("got status: ", arg1);
    });
    call.on("status", (status) => console.log("status", status));
};
start();
