import { LoginData, ActionType } from '../../model/model';

export const loginUserAction = (payload: LoginData) => {
    return {
        type: ActionType.LOGIN_USER,
        payload,
    };
};

export const logoutUserAction = () => {
    return {
        type: ActionType.LOGOUT_USER,
        payload: '',
    };
};

export const changeLoginError = (payload:boolean) => {
    return {
        type: ActionType.LOGIN_USER_ERROR,
        payload,
    };
};

export const ResetLoginAttemptAction = () => {
    return {
        type: ActionType.LOGIN_ATTEMPTS,
        payload: 0,
    };
};

export const LoginUerSuspended = (payload:number) => {
    return {
        type: ActionType.LOGIN_USER_SUSPENDED,
        payload,
    };
};
export const updateInitialSetup = (payload:string) => {
    return {
        type: ActionType.LOGIN_INITIALSETUP_SUCCESS,
        payload,
    };
};
export const ChangeFullName = (payload:string) => {
    return {
        type: ActionType.UPDATE_FULL_NAME,
        payload,
    };
};

