import React from 'react';
import { FaChild } from "react-icons/fa";
// import { MdChildCare } from "react-icons/md";
import { IconContext } from "react-icons";

export default function MarkerIcon(props){
  return (
    <IconContext.Provider
      value={{ color: props.value}}
      >
      <div>
        <FaChild />
      </div>
    </IconContext.Provider>
  )
}
