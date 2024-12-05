import { createContext } from "react";
const SocketContext = createContext({
  floorplanList: false,
  markerList: false,
  featureList: false,
  tabs: false,
  selectedtab: false,
});
export default SocketContext;
