import io from "socket.io-client";
import { socketEvents } from "./events";
export const socket = io(`${process.env.REACT_APP_BACKEND}/map`);
export const initSockets = ({ setValue }) => {
  socketEvents({ setValue });
};
