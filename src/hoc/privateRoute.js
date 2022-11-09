import React from "react";
import { Redirect, Route } from "react-router-dom";
import { checkAuth } from "../utils/checkauth";
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      checkAuth() !== null ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

export default PrivateRoute;
