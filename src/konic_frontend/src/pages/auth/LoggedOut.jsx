import React from "react";
import { useAuth } from "./useAuthClient";


function LoggedOut() {
  const { login } = useAuth();

  return (
    <div className="container">
      <div className="LoginContainer">
      <div className="loginCard">
        <h2 className="login-text">Login to Your Account</h2>
        <button type="button" className="login-button" onClick={login}>
          Log In
        </button>
      </div>
      </div>
    </div>
  );
}

export default LoggedOut;
