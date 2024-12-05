import React, { useContext, useState } from 'react';
import LeafletMap from 'react-leaflet/es/Map';
import TileLayer from 'react-leaflet/es/TileLayer';
import AttributionControl from 'react-leaflet/es/AttributionControl';
import 'leaflet/dist/leaflet.css';
import GenericMarker from './GenericMarker';
import FrontPagePanel from './FrontPagePanel';
import SocketContext from './socket_context/context';
import ImageOverlayRotated from "./ImageOverlayRotated";
import L from "leaflet";
import { Marker, Popup } from 'react-leaflet';


function Map (props) {

  const { featureList, floorplanList } = useContext(SocketContext);
  const mapUrl = "https://{s}.tile.osm.org/";
  //'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVuZ3Z1b25nIiwiYSI6ImNrNzUxNjM4cTBkbG0zbHBhNTE3bGVsbTkifQ.BPHxRqQ3fuugsJULhncCAQ'
  const colors = ["green","pink","orange"];
  const handleClick = (e) => {
    console.log([e.latlng.lng, e.latlng.lat])
  }
  return (
    <div aria-hidden="true">
      <LeafletMap
        className="mapStyle"
        keyboard={false}
        zoom={20}
        minZoom={0}
        maxZoom={22}
        onClick={handleClick}
      >
        {floorplanList? floorplanList.map((floorplan, index) => {
          let topLeftCorner    = new L.latLng(floorplan.geometry.coordinates[0][1][1], floorplan.geometry.coordinates[0][1][0]);
          let topRightCorner   = new L.latLng(floorplan.geometry.coordinates[0][2][1], floorplan.geometry.coordinates[0][2][0]);
          let bottomLeftCorner = new L.latLng(floorplan.geometry.coordinates[0][0][1], floorplan.geometry.coordinates[0][0][0]);
           return (
             <ImageOverlayRotated
                url={require(`../../assets/${floorplan.properties.url}`)}
                corners={[
                  topLeftCorner,
                  topRightCorner,
                  bottomLeftCorner
                ]}
                opacity={floorplan.properties.opacity}
              />
           );
         }) : ''}
        <TileLayer
          url={`${mapUrl}{z}/{x}/{y}.png`}
          updateWhenIdle={false}
          maxNativeZoom={19}
          minZoom={0}
          maxZoom={22}
        />
        <AttributionControl
          position="bottomright"
          prefix="&copy; <a tabindex=&quot;-1&quot; href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a>"
        />
        {featureList ? featureList.map((feature, index) => {
           let post = [feature.geometry.coordinates[1],feature.geometry.coordinates[0]];
           return (
             <GenericMarker key={feature.properties.device_holder} opacity={feature.properties.opacity} position={post} value={colors[index]}
             />
           );
         }) : ''}
      </LeafletMap>
      <FrontPagePanel />
    </div>
  );
}
export default Map;
