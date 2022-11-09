import { all } from 'redux-saga/effects';

import authenticationSagas from '../pages/Login/authenticationSaga';

export default function* rootSaga() {
    yield all([...authenticationSagas]);
}
