import React from 'react';

function Home(props) {
  // handle click event of logout button
  const toLogin = () => {
    props.history.push('/login');
  }
  return (
    <div>
      Welcome to the Home Page! <br /> Please 
      <input type="button" onClick={toLogin} value="Log In" />
    </div>
  );
}

export default Home;
