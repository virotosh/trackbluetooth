import React, { useState, useEffect } from "react";
import SocketContext from "./context";
import { initSockets } from "../../sockets";
//       ^ initSockets is shown later on
const SocketProvider = (props) => {
  const [value, setValue] = useState({
    floorplanList: false,
    markerList: false,
    featureList: false,
    tabs: false,
    selectedtab: false,
  });

  useEffect(() => {
    initSockets({ setValue });
  }, []);
  //}, [initSockets]);
  // Note, we are passing setValue ^ to initSockets
  return(
      <SocketContext.Provider value={ value } >
        { props.children }
      </SocketContext.Provider>
    )
};
export default SocketProvider;
