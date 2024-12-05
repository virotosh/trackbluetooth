import React from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';


export default function GenericMarker(props) {
  const customMarker = new L.icon({
    iconUrl: require('../../assets/'+props.value+'.svg'),
    // iconUrl: require('../../assets/dot.svg'),
    // iconUrl: 'https://raw.githubusercontent.com/phatblat/BlueDot/0.1.1/bluedot.gif',
    iconSize: new L.Point(24, 24),
  });
  return (
    <Marker opacity={props.opacity} position={props.position} icon={customMarker}>
    </Marker>
  );
}
