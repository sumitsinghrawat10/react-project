import React from 'react';

import ReactDOM from 'react-dom';

import './assets/index.scss';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
import { createTheme, ThemeProvider } from '@mui/material';

import ReduxRoot from './redux/rootRedux';

//Customized Theme styles according to Our Requirements.
const theme = createTheme({
    palette: {
        primary: {
            // main: '#0070a2',
            main: '#233ce6',
            light: '#757ce8',
            // dark: '#000',
            dark: '#001e46',
            contrastText: '#fff',
        },
    },
    typography: {
        fontSize: 16,
        fontFamily: 'Urbanist',
        body1: {
            fontWeight: 800,
        },
        button: {
            textTransform: 'none',
            height: '60px',
            fontSize: '16px',
            fontWeight: 600,
        },
    },
});

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <ReduxRoot />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
