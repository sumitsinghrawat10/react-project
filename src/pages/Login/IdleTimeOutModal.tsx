import React, { useState, useEffect, useRef } from 'react';

import Divider from '@material-ui/core/Divider';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

export const IdleTimeOutModal = ({
    showModal,
    handleContinue,
    handleModalLogout,
    handleModalAutomaticLogout,
}: any) => {
    const [showContinue, setShowContinue] = useState('');
    const [showExpired, setShowExpired] = useState('none');
    const [showButton, setShowButton] = useState('');
    const [showLogin, setShowLogin] = useState('none');
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (showModal) {
            timeout.current = setTimeout(() => {
                setShowContinue('none');
                setShowButton('none');
                setShowExpired('');
                setShowLogin('');
                setTimeout(() => {
                    showModal = false;
                    handleModalAutomaticLogout();
                }, 3000);
            }, 300000);
        } else {
            clearTimeout(Number(timeout.current));
        }
        return () => clearTimeout(Number(timeout.current));
    }, [showModal]);

    return (
        <>
            <Dialog open={showModal}>
                <DialogTitle className="FontWeightBold">
                    <span
                        style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: showContinue,
                        }}
                    >
                        Your session is about to expire. Would you like to continue?
                    </span>
                    <span
                        style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: showExpired,
                        }}
                    >
                        Your Session is expired.Click the button to login again or you
                        <p className="d-flex justify-content-center">  will be redirected to login page automatically.</p>
                    </span>
                </DialogTitle>
                <Divider style={{ background: 'grey' }} />
                <div className="ButtonWrapper">
                    <DialogActions className="d-flex justify-content-center dialogActions">
                        <Button
                            variant="outlined"
                            onClick={handleModalLogout}
                            style={{
                                height: '40px',
                            }}
                            sx={{
                                display: showButton,
                                border: '1px solid #233ce6',
                                color: '#233ce6',
                            }}
                        >
                            Logout
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleModalLogout}
                            style={{
                                height: '40px',
                            }}
                            sx={{
                                display: showLogin,
                                backgroundColor: '#233ce6 !important',
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            className="FontWeightBold"
                            onClick={handleContinue}
                            style={{
                                height: '40px',
                            }}
                            sx={{
                                display: showButton,
                                backgroundColor: '#233ce6 !important',
                            }}
                        >
                            Continue Session
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </>
    );
};
