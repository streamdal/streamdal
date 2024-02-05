import { signal } from "@preact/signals";

//
// signal to track problems with the server, updated when
// our streaming clients lose connection.
export const SERVER_ERROR =
  "Unable to fetch data from the Streamdal Server. Is it up and running?";
export const serverErrorSignal = signal<string>("");
