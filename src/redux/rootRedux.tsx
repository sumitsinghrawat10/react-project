import React from 'react';

import { Typography } from '@material-ui/core';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import App from '../App';
import configureStore from './configureStore';


const { persistor, store } = configureStore();

function ReduxRoot() {
    return (
        <Provider store={store}>
            <PersistGate
                loading={<Typography>Loading...</Typography>}
                persistor={persistor}
            >
                <App />
            </PersistGate>

        </Provider>
    );
}

export { store };

export default ReduxRoot;
