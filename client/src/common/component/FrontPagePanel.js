import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar'
import Tab from './Tab'
import MarkerIcon from './MarkerIcon'
import { FiHome, FiChevronRight, FiSettings } from "react-icons/fi";
import './timeline.css';
import SocketContext from './socket_context/context'
import { removeUserSession } from '../Utils/Common';

export default class FrontPagePanel extends React.Component {
  static contextType =  SocketContext;
  constructor(props){
    super(props);
    this.state = {
      collapsed: false,
      colors: ["#79A39F","#F93B69","#EB8B6E"],
      classColors: ["bullet green","bullet pink","bullet orange"]
    };
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  onClose() {
    this.setState({collapsed: true});
  }
  onOpen(id) {
    var { featureList, floorplanList, selectedtab } = this.context;
    featureList.forEach( (feature) => {
      if(feature.properties.device_holder === id){
        feature.properties.opacity = process.env.REACT_APP_FOCUSED_HOLDER;
        floorplanList.forEach( (floorplan) => {
          if (floorplan.properties.url === feature.properties.floorplan_url){
            floorplan.properties.opacity = process.env.REACT_APP_FOCUSED_FLOOR;
          } else {
            floorplan.properties.opacity = process.env.REACT_APP_BLURRED_FLOOR;
          }
        });
      } else {
        feature.properties.opacity = process.env.REACT_APP_BLURRED_HOLDER;
      }
    });

    selectedtab.selected = id;
    this.setState({
      collapsed: false,
    })
  }

  handleLogout() {
    removeUserSession();
    // memory leak temporary fix, check later !!!
    window.location.reload(false);
  }
  render() {
    const { tabs, selectedtab } = this.context;

    return(
      <Sidebar
        id="sidebar"
        position="right"
        collapsed={this.state.collapsed}closeIcon={<FiChevronRight />}
        selected={selectedtab.selected}
        onOpen={this.onOpen.bind(this)}
        onClose={this.onClose.bind(this)}
      >
      {tabs ? tabs.map((tab, index) => {
        return (
          <Tab id={tab.device_holder} header={tab.device_holder} icon={<MarkerIcon value={this.state.colors[index]}/>} >
            <div className="timeline">
              <ul>
               {tab.activity.slice(0).reverse().map((feature, f_index) => {
                 let time = new Date(feature.properties.created_date);
                 return (<li>
                            <div className={(f_index===0)?this.state.classColors[index]:"bullet gray"}></div>
                            <div className="time">{time.getHours()}:{time.getMinutes()}</div>
                            <div className="desc">
                              <h3>{feature.properties.room_label}</h3>
                            </div>
                        </li>)
                })
               }
              </ul>
            </div>
          </Tab>
        )
        }
      ):<Tab id='home' header="Nhà" icon={<FiHome />} ><p>Không Đâu Bằng Nhà</p></Tab>}
      <Tab id='settings' header="Cài Đặt" anchor='bottom' icon={<FiSettings />} >
        <Link onClick={this.handleLogout.bind(this)} to='/login' > Logout </Link>
      </Tab>
      </Sidebar>
    )
  }
}
