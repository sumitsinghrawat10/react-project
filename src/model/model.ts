export enum ActionType {
  // login
  LOGIN_USER = "action/LOGIN_USER",
  LOGIN_USER_SUCCESS = "action/LOGIN_USER_SUCCESS",
  LOGIN_USER_ERROR = "action/LOGIN_USER_ERROR",
  LOGIN_ROLE_SUCCESS = "action/LOGIN_ROLE_SUCCESS",
  LOGIN_ROLE_ERROR = "action/LOGIN_ROLE_ERROR",
  LOGIN_ROLE_DESCRIPTION_SUCCESS = "action/LOGIN_ROLE_DESCRIPTION_SUCCESS",
  LOGIN_USERID_SUCCESS = "action/LOGIN_USERID_SUCCESS",
  LOGIN_USERID_ERROR = "action/LOGIN_USERID_ERROR",
  LOGIN_ORGANIZATIONID_SUCCESS = "action/LOGIN_ORGANIZATIONID_SUCCESS",
  LOGOUT_USER = "action/LOGOUT_USER",
  LOGIN_ATTEMPTS = "action/LOGIN_ATTEMPTS",
  LOGIN_INITIALSETUP_SUCCESS = "action/LOGIN_INITIALSETUP_SUCCESS",
  NAV_VISIBLE = "action/NAV_VISIBLE",
  LOGIN_USER_SUSPENDED = "action/LOGIN_USER_SUSPENDED",
  UPDATE_FULL_NAME = "action/UPDATE_FULL_NAME",
}

export interface Action<T> {
  type: ActionType;
  payload: T;
}

export interface LoginData {
  email: string | null;
  password: string | null;
  loginAttempt: number;
}

export interface LoginPayload {
  username: string;
  password: string;
  payload: {
    loginAttempt: number;
  };
}
export interface LoginReponsepayloadType {
  data: {
    data: {
      token: string;
    };
    status: number;
    token: string;
  };
  status: number;
}

export interface AuthenticationReducerType {
  email: string;
  password: string;
  loading: boolean;
  error?: boolean;
  user: string;
  token: string;
  role: string;
  roleDescription: string;
  userId: number | null;
  loginAttempt: number;
  initialSetup: string;
  navVisible: boolean;
  organizationId: number | null;
  status: number;
  fullName: string;
}
export const defaultState: AuthenticationReducerType = {
  email: "",
  password: "",
  loading: false,
  error: false,
  user: "",
  token: "",
  role: "",
  roleDescription: "",
  userId: null,
  loginAttempt: 0,
  initialSetup: "",
  navVisible: true,
  organizationId: null,
  status: 0,
  fullName: "",
};
export interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

export interface IBadges
{
    badgeId: number;
    badgesName: string;
    issueDate: string;
    expirationDate: string;
    issuedFrom: number;
    issuedFromValue: string;
    status: string;
}