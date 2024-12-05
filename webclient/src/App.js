import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './common/Login';
import Dashboard from './common/Dashboard';
import Home from './common/Home';

import PrivateRoute from './common/Utils/PrivateRoute';
import PublicRoute from './common/Utils/PublicRoute';
import { getToken, removeUserSession, setUserSession } from './common/Utils/Common';

function App() {
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    axios.get(`${process.env.REACT_APP_BACKEND}/verifyToken`, {headers: {'x-access-token':token}}).then(response => {
      setUserSession(response.data.token, response.data.user);
      setAuthLoading(false);
    }).catch(error => {
      removeUserSession();
      setAuthLoading(false);
    });
  }, []);

  if (authLoading && getToken()) {
    return <div className="content">Checking Authentication...</div>
  }

  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <div className="content">
            <Switch>
              <Route exact path="/" component={Home} />
              <PublicRoute path="/login" component={Login} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;

// <div className="header">
//   <NavLink exact activeClassName="active" to="/">Home</NavLink>
//   <NavLink activeClassName="active" to="/login">Login</NavLink><small>(Access without token only)</small>
//   <NavLink activeClassName="active" to="/dashboard">Dashboard</NavLink><small>(Access with token only)</small>
// </div>
