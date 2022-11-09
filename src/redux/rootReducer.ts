import { History } from "history";
import { combineReducers } from "redux";
import { routerReducer, RouterState } from "react-router-redux";
import {
  AuthenticationReducer,
} from "../pages/Login/authenticationReducer";
import { AuthenticationReducerType } from "../model/model";

export interface RootState {
  user: AuthenticationReducerType;
  routerReducer: RouterState;
  token: string;
}

const rootReducer = (history: History) =>
  combineReducers({
    user: AuthenticationReducer,
    routerReducer,
  });

export default rootReducer;
