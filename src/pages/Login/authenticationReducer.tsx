import { Action, ActionType, LoginData, AuthenticationReducerType, defaultState } from '../../model/model';
import createReducer from '../../redux/createReducer';


export const AuthenticationReducer = createReducer<AuthenticationReducerType>(
    defaultState,
    {
        [ActionType.LOGIN_USER](
            state: AuthenticationReducerType,
            action: Action<LoginData>
        ) {
            return {
                ...state,
                loading: true,
            };
        },

        [ActionType.LOGIN_USER_ERROR](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        },

        [ActionType.LOGIN_USER_SUCCESS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: false,
                user: action.payload,
            };
        },

        [ActionType.LOGIN_ROLE_ERROR](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        },

        [ActionType.LOGIN_ROLE_SUCCESS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: false,
                role: action.payload,
            };
        },

        [ActionType.LOGIN_ROLE_DESCRIPTION_SUCCESS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: false,
                roleDescription: action.payload,
            };
        },

        [ActionType.LOGIN_USERID_ERROR](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        },

        [ActionType.LOGIN_USERID_SUCCESS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: false,
                userId: action.payload,
            };
        },

        [ActionType.LOGIN_ORGANIZATIONID_SUCCESS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: false,
                organizationId: action.payload,
            };
        },

        [ActionType.LOGOUT_USER](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                user: '',
                role: '',
                roleDescription: '',
                userId: null,
                error:false,
                organizationId: null,
            };
        },

        [ActionType.LOGIN_ATTEMPTS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                loginAttempt: action.payload,
            };
        },

        [ActionType.LOGIN_INITIALSETUP_SUCCESS](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false,
                error: null,
                initialSetup: action.payload, 
            };
        },
        [ActionType.LOGIN_USER_SUSPENDED](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                loading: false, 
                error: null,   
                status: action.payload, 
            };
        },

        [ActionType.NAV_VISIBLE](
            state: AuthenticationReducerType,
            action: Action<boolean>
        ) {
            return {
                ...state,
                navVisible: action.payload,
            };
        },

        [ActionType.UPDATE_FULL_NAME](
            state: AuthenticationReducerType,
            action: Action<number>
        ) {
            return {
                ...state,
                fullName: action.payload,
            };
        },
    }
);
