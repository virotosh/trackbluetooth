import React from 'react';
import { getUser } from './Utils/Common';
import Map from './component/Map'
import SocketProvider from './component/socket_context';
import {socket} from './sockets'

class Dashboard extends React.Component {
  constructor(props){
    super(props);
  }

  componentDidMount(){
    const user = getUser();
    socket.emit('whoiam', user.id);
  }

  componentWillUnmount(){

  }

  // handle click event of logout button
  // const handleLogout = () => {
  //   removeUserSession();
  //   props.history.push('/login');
  //   // memory leak temporary fix, check later !!!
  //   window.location.reload(false);
  // }

  render(){
    // memory leak when putting SocketProvider here, need to fix
    return (
      <div>
        <SocketProvider>
          <Map />
        </SocketProvider>
      </div>
    );
  }
}

export default Dashboard;
