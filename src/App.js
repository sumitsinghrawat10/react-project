import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import { routes } from "./routes";
import "bootstrap";
import LeftNav from "./components/LeftNav";
import ForgotPassword from "./pages/Login/forgotPassword";
import ResetPassword from "./pages/Login/resetPassword";
import PasswordResetConfirmed from "./pages/Login/passwordResetConfirmed";
import styled from "styled-components";
import { useSelector, connect } from "react-redux";
// config
import { history } from "./redux/configureStore";
// hoc
import PrivateRoute from "../src/hoc/privateRoute";
import Login from "./pages/Login";

const AppWrapper = styled.div`
  padding-left: ${props =>
    props.user && props.loc !== "/initial-setup" ? "306px" : "0px"};

  @media (min-width: 0px) and (max-width: 1366px) {
    padding-left: ${props =>
      props.user && props.loc !== "/initial-setup" ? "4rem" : "0px"};
  }
`;

function Routes() {
  return (
    <div>
      <Switch>
        <Route exact={true} path="/login" component={Login} />
        <Route
          exact={true}
          path="/forgot-password"
          component={ForgotPassword}
        />
        <Route exact={true} path="/reset-password" component={ResetPassword} />
        <Route
          exact={true}
          path="/reset-confirmed"
          component={PasswordResetConfirmed}
        />
        {routes.map((item, index) => (
          <PrivateRoute
            key={index}
            path={item.link}
            component={(props) => (
              <item.component {...props} history={history} />
            )}
            exact
          />
        ))}
      </Switch>
    </div>
  );
}

const App = () => {
  const userState = useSelector((state) => state.user);

  return (
    <Router>
      <div className="App">
        {userState.user && userState["navVisible"] && <LeftNav />}
        <AppWrapper user={userState.user} loc={window.location.pathname}>
          <Routes />
        </AppWrapper>
      </div>
    </Router>
  );
};

function mapStateToProps(RootState) {
  return {};
}

export default connect(mapStateToProps)(App);
