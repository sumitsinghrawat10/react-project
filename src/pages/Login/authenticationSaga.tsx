import { put, takeLatest, fork, call, all } from 'typed-redux-saga';

import {
    LoginReponsepayloadType,
    ActionType,
    LoginPayload,
} from '../../model/model';
import { decodeToken } from '../../utilities/decodeToken';
import { login } from '../Login/login';

interface ILoginError
{
    data: {
        status: number,
        message: string,
        data: {
            token: string;
        };
    };
    response: {
        data:{
            status: number,
            message: string,
            data: {
                token: string;
            };
        };
    };
}
// login
function* loginSaga(payload: LoginPayload) {
    try {
        const response: LoginReponsepayloadType = yield call(login, payload);
        if(loginResponseDataStatus(response))
        {
            throw response;
        }
        if (response.data.status === 200 || response.data.status === 201) {
            const token = response.data.data ? response.data.data.token : '';
            localStorage.setItem('user', token);
            const decodedToken = decodeToken(token);
            const roleType =
        'Role';

            yield all([
                put({
                    type: ActionType.LOGIN_ROLE_SUCCESS,
                    payload: decodedToken[`${roleType}`],
                }),
                put({
                    type: ActionType.LOGIN_ROLE_DESCRIPTION_SUCCESS,
                    payload: decodedToken.RoleDescription,
                }),
                put({
                    type: ActionType.LOGIN_USERID_SUCCESS,
                    payload: parseInt(decodedToken.UserId),
                }),
                put({
                    type: ActionType.LOGIN_ATTEMPTS,
                    payload: 0,
                }),
                put({
                    type: ActionType.LOGIN_INITIALSETUP_SUCCESS,
                    payload: decodedToken.Signup,
                }),
                put({
                    type: ActionType.LOGIN_ORGANIZATIONID_SUCCESS,
                    payload: parseInt(decodedToken.OrgId),
                }),
                put({
                    type: ActionType.LOGIN_USER_SUCCESS,
                    payload: response.data.data.token,
                }),
                put({
                    type: ActionType.UPDATE_FULL_NAME,
                    payload: `${decodedToken.UserFirstName} ${decodedToken.UserLastName}`,
                }),
            ]);
        } else if (
            response.data.status === 400 ||
            response.data.status === 401 ||
            response.data.status === 500
        ) {
            yield all([
                put({ type: ActionType.LOGIN_USER_ERROR, payload: true }),
                put({ type: ActionType.LOGIN_ROLE_ERROR, payload: true }),
            ]);
        }
    } catch (error:any) {
        const errorResponse = loginResponseException(error);
        if (errorResponse?.data.status === 422) {
            yield all([
                put({ type: ActionType.LOGIN_USER_SUSPENDED, payload: error.response.data.status }),
            ]);
        }
        yield all([
            put({ type: ActionType.LOGIN_USER_ERROR, payload: true }),
            put({ type: ActionType.LOGIN_ROLE_ERROR, payload: true }),
        ]);  
        if (errorResponse?.data.status === 419) {
            yield all([
                put({ type: ActionType.LOGIN_ATTEMPTS, payload: 7 }),
            ]);
        }   
        else {
            yield all([
                put({ type: ActionType.LOGIN_ATTEMPTS, payload: payload.payload.loginAttempt + 1 }),
            ]);
        }
    }
}


function loginResponseException(errorData:ILoginError){
    let errorResponse = null;
        if(errorData.response!== undefined)
        {
            errorResponse = errorData.response;
        }
        if(errorData.data !== undefined)
        {
            errorResponse = errorData;
        }
    return errorResponse;
}

const loginResponseDataStatus=(responseData: LoginReponsepayloadType)=>{
    if(responseData.data.status === 417 || responseData.data.status === 422 || responseData.data.status === 419)
    {
        return true;
    }
    return false;
};

function* onLoginSubmitWatcher() {
    yield takeLatest(ActionType.LOGIN_USER as any, loginSaga);
}
const loginSubmitWatcher = [fork(onLoginSubmitWatcher)];
export default loginSubmitWatcher;
