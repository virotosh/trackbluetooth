import { socket } from './index';
import { getUser } from '../Utils/Common';
export const socketEvents = ({ setValue }) => {
  const user = getUser();
  socket.on((user)?`${user.id}_Login_Floorplan`:`Login_Floorplan`, (data) => {
    setValue(state => {
      let floorplanList = [];
      data.features.forEach( (floorplan, index) => {
        if(index === 0){
          floorplan.properties.opacity = process.env.REACT_APP_BLURRED_FLOOR;
        } else {
          floorplan.properties.opacity = process.env.REACT_APP_FOCUSED_FLOOR;
        }
        floorplanList.push(floorplan);
      });
      return { ...state, floorplanList }
    });
  });
  socket.on((user)?`${user.id}_Login_Marker`:`Login_Marker`, (data) => {
    setValue(state => {
      let markerList = [];
      let featureList = [];
      data.features.forEach( (feature) => {
        markerList.push(feature.properties.device_holder);
        feature.properties.opacity = process.env.REACT_APP_FOCUSED_HOLDER;
        featureList.push(feature);
      });
      return { ...state, featureList, markerList }
    });
  });
  socket.on((user)?`${user.id}_Login_Activity`:`Login_Activity`, (data) => {
    setValue(state => {
      let items = {};
      let tabs = [];
      let selectedtab = {selected:''};
      if (data){
        data.features.forEach( (feature, index) => {
          if (!(feature.properties.device_holder in items)){
            items[feature.properties.device_holder] = [feature]
          } else {
            items[feature.properties.device_holder].push(feature)
          }

          // make selected tab upon login/refresh
          if (index === data.features.length-1){
            selectedtab.selected = feature.properties.device_holder;
          }
        })
      }
      Object.keys(items).forEach(function(key) {
        tabs.push({device_holder:key,activity:items[key]});
      });
      return { ...state, tabs, selectedtab }
    });
  });
  socket.on((user)?`${user.id}_DB`:`DB`, (data) => {
    setValue(state => {
      if (state.markerList && state.featureList && state.tabs){
        let featureList = state.featureList.slice();
        let markerIndex = state.markerList.indexOf(data.features[0].properties.device_holder);
        data.features[0].opacity = process.env.REACT_APP_FOCUSED_HOLDER;
        featureList[markerIndex] = data.features[0];

        let new_act = data.features[0];
        let device_holder = new_act.properties.device_holder;
        let room_label = new_act.properties.room_label;
        let tabs = state.tabs.slice(0);
        tabs.forEach( (tab) => {
          if(tab.device_holder === device_holder){
            let latest_act = tab.activity[tab.activity.length-1];
            if (latest_act.properties.room_label !== room_label){
              tab.activity.push(new_act);
            }
            // else {
            //   tab.activity[tab.activity.length-1] = new_act;
            // }
          }
        });

        let floorplanList = state.floorplanList.slice();
        floorplanList.forEach( (floorplan) => {
          if (floorplan.properties.url === new_act.properties.floorplan_url){
            floorplan.properties.opacity = process.env.REACT_APP_FOCUSED_FLOOR;
          } else {
            floorplan.properties.opacity = process.env.REACT_APP_BLURRED_FLOOR;
          }
        });

        return { ...state, floorplanList, featureList ,tabs}
      } else {
        // let floorplanList = [];
        let featureList = [];
        let tabs = [];
        return { ...state, featureList ,tabs}
      }
    });
  });
};
