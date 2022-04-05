import feathers from "@feathersjs/client";
import io from "socket.io-client";
import { API_URL, SSR_API_URL } from "../../api/Definitions";
import axios from "axios";

const socket = io(API_URL, { transports: ["websocket"], upgrade: false });
const client = feathers();

//rest client code
if (global.window) {
  client.configure(feathers.socketio(socket));
  client.configure(
    feathers.authentication({
      storage: window.localStorage
    })
  );
} else {
  const restClient = feathers.rest(SSR_API_URL);
  client.configure(restClient.axios(axios));
}

export default client;
