import React, { useState } from 'react';
import axios from 'axios';
import { setUserSession } from './Utils/Common';
import './Utils/css/vendor/bootstrap/css/bootstrap.min.css'
import './Utils/css/fonts/font-awesome-4.7.0/css/font-awesome.min.css'
import './Utils/css/fonts/iconic/css/material-design-iconic-font.min.css'
import './Utils/css/vendor/animate/animate.css'
import './Utils/css/vendor/css-hamburgers/hamburgers.min.css'
import './Utils/css/vendor/animsition/css/animsition.min.css'
import './Utils/css/vendor/select2/select2.min.css'
import './Utils/css/vendor/daterangepicker/daterangepicker.css'
import './Utils/css/css/main.css'
import './Utils/css/css/util.css'

function Login(props) {
  const [loading, setLoading] = useState(false);
  const username = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);
  const [userClass, setUserClass] = useState('input100');
  const [passwordClass, setPasswordClass] = useState('input100');
  // handle button click of login form
  const handleLogin = () => {
    setError(null);
    setLoading(true);
    axios.post(`${process.env.REACT_APP_BACKEND}/api/v1/users/login`, { email: username.value, password: password.value }).then(response => {
      setLoading(false);
      setUserSession(response.data.token, {name:username, id:response.data.user_id});
      props.history.push('/dashboard');
    }).catch(error => {
      setLoading(false);
      if (error.response.status === 401 || error.response.status === 400) setError(error.response.data.message);
      else setError("Something went wrong. Please try again later.");
    });
  }

  const onKeyPress = (e) => {
    if(e.which === 13) {
      setError(null);
      setLoading(true);
      axios.post(`${process.env.REACT_APP_BACKEND}/api/v1/users/login`, { email: username.value, password: password.value }).then(response => {
        setLoading(false);
        setUserSession(response.data.token, {name:username, id:response.data.user_id});
        props.history.push('/dashboard');
      }).catch(error => {
        setLoading(false);
        if (error.response.status === 401 || error.response.status === 400) setError(error.response.data.message);
        else setError("Something went wrong. Please try again later.");
      });
    }
  }

  const addUserClass = (e) => {
    if (e.target.value !== '' )
      setUserClass('input100 has-val');
    if (e.target.value === '' && e.target.className==='input100 has-val')
      setUserClass('input100');
  }
  const addPasswordClass = (e) => {
    if (e.target.value !== '')
      setPasswordClass('input100 has-val');
    if (e.target.value === '' && e.target.className==='input100 has-val')
      setPasswordClass('input100');
  }

  return (
	  <div className="limiter">
  		<div className="container-login100">
        <div className="wrap-login100 p-t-85 p-b-20" >
          <span className="login100-form-title p-b-70">
            Xin Chào
          </span>
          <span className="login100-form-avatar">
						<img src={require('./Utils/css/images/avatar-01.jpg')} alt="AVATAR"/>
					</span>
          <div className="wrap-input100 validate-input m-t-85 m-b-35">
            <input className={userClass} type="text" {...username} autoComplete="new-password" onBlur={addUserClass}/>
						<span className="focus-input100" data-placeholder="Tên Đăng Nhập"></span>
          </div>
          <div className="wrap-input100 validate-input m-b-50" >
            <input className={passwordClass} type="password" {...password} autoComplete="new-password" onKeyPress={onKeyPress} onBlur={addPasswordClass}/>
						<span className="focus-input100" data-placeholder="Mật Khẩu"></span>
          </div>
          {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
          <input className="login100-form-btn" type="button" value={loading ? 'Đang load...' : 'Đăng nhập'} onClick={handleLogin} disabled={loading} /><br />
        </div>
      </div>
    </div>
  );
}

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}

export default Login;
