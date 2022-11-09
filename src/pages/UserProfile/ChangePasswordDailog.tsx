import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
    TextField,
    DialogActions,
    Button,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import { encode as base64_encode } from 'base-64';
import moment from 'moment';
import styled from 'styled-components';

import {
    CHANGE_PASSWORD,
    GET_PROFILE_DETAILS,
} from '../../networking/httpEndPoints';
import SuccessToaster from '../../components/SuccessToaster';

const useStyles = makeStyles({
    root: {
        '& .MuiTypography-root .MuiDialogTitle-root': {
            fontWeight: () => 'bold',
        },
    },
});

interface StyleProps {
    error: boolean;
}

const PasswordCondition = styled.p<StyleProps>`
  color: ${(props) => (props.error ? '#d32f2f' : 'lightgrey')};
  font-size: 12px;
  margin-bottom: 0px;
`;

interface PropsType {
    setPassOpen: any;
    passOpen: boolean;
    newPassDate?: any;
}

interface ChangePasswordResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
}

interface ResponseType {
    isSuccess: number;
    responseMessage: string;
    result?: any;
}

const ChangePasswordDailog: React.FC<PropsType> = (props: PropsType) => {
    const classes = useStyles();
    let messageTimer: any = undefined;

    const [showLoader, setShowLoader] = useState(false);
    const [existingPassword, setExistingPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const token = localStorage.getItem('user');
    const [showPasswordMismatchError, setShowPasswordMismatchError] =
        useState(false);

    const [showResponseErrorMessage, setShowResponseErrorMessage] = useState('');
    const [showExistingPassword, setShowExistingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [messageToUser, setMessageToUser] = useState('');
    const [showMessageToUser, setShowMessageToUser] = useState(false);
    const [errorPreviouslyPassword, setErrorPreviouslyPassword] = useState(false);
    const [existingPasswordError, setExistingPasswordError] = useState(false);
    const [existingPasswordErrorText, setExistingPasswordErrorText] =
        useState('');
    const [errorCharacter, setErrorCharacter] = useState(false);
    const [errorSpecial, setErrorSpecial] = useState(false);
    const [errorNumber, setErrorNumber] = useState(false);
    const [errorLowerLetter, setErrorLowerLetter] = useState(false);
    const [errorNewPasswordValidationMessage, setErrorNewPasswordValidationMessage] = useState('');
    const [errorNewPasswordValidation, setErrorNewPasswordValidation] = useState(false);
    const handleClose = () => {
        props.setPassOpen(false);
        setExistingPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrorCharacter(false);
        setErrorSpecial(false);
        setErrorNumber(false);
        setErrorLowerLetter(false);
        setShowPasswordMismatchError(false);
        setExistingPasswordError(false);
        setExistingPasswordErrorText('');
        setShowResponseErrorMessage('');
        setErrorNewPasswordValidationMessage('');
        setErrorNewPasswordValidation(false);
        setShowExistingPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setErrorPreviouslyPassword(false);
    };

    const handleShowExistingPassword = () => {
        setShowExistingPassword(!showExistingPassword);
    };
    const handleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const newPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrorCharacter(false);
        setErrorSpecial(false);
        setErrorNumber(false);
        setShowPasswordMismatchError(false);
        setShowResponseErrorMessage('');
        setErrorLowerLetter(false);
        setErrorNewPasswordValidationMessage('');
        setErrorNewPasswordValidation(false);
        setNewPassword((event.target as HTMLInputElement).value);
    };

    const existingPasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setExistingPasswordError(false);
        setExistingPasswordErrorText('');
        setShowResponseErrorMessage('');
        setExistingPassword((event.target as HTMLInputElement).value);
    };
    const confirmPasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setShowPasswordMismatchError(false);
        setShowResponseErrorMessage('');
        setConfirmPassword((event.target as HTMLInputElement).value);
    };

    const validate = () => {
        let error = false;
        if (existingPassword.trim().length === 0) {
            setExistingPasswordError(true);
            setExistingPasswordErrorText('Please enter current password');
            error = true;
        }
        if (newPassword.length < 8) {
            setErrorCharacter(true);
            error = true;
        }
        if (newPassword.search(/[!@#$%^&*]/i) < 0) {
            setErrorSpecial(true);
            error = true;
        }
        if (newPassword.search(/[0123456789]/) < 0) {
            setErrorNumber(true);
            error = true;
        }
        if (newPassword.search(/[a-zA-Z]/) < 0) {
            setErrorLowerLetter(true);
            error = true;
        }
        if (newPassword.length > 0 && newPassword.charAt(0).toUpperCase() === newPassword.charAt(0).toLowerCase()) {
            setErrorNewPasswordValidationMessage("Password must not start with a number or special character.");
            setErrorNewPasswordValidation(true);
            error = true;
        }
        if (newPassword.length > 0 && newPassword.match("([a-zA-Z])\\1{2}")) {
            setErrorNewPasswordValidationMessage("More than 2 consecutive repetitions of an alphabet is not allowed.");
            setErrorNewPasswordValidation(true);
            error = true;
        }
        if (newPassword.length > 0 && newPassword.search(/\s/g) > 0) {
            setErrorNewPasswordValidationMessage("Password should not allowed spaces.");
            setErrorNewPasswordValidation(true);
            error = true;
        }
        if (newPassword !== confirmPassword) {
            setShowPasswordMismatchError(true);
            error = true;
        }
        return error;
    };

    const handleNewDate = () => {
        axios
            .get<ResponseType>(`${GET_PROFILE_DETAILS}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                const dateString = `${moment(
                    response.data.result[0]['updatedAt']
                ).format('MMM')} ${moment(response.data.result[0]['updatedAt']).format(
                    'D'
                )} ${moment(response.data.result[0]['updatedAt']).format('YYYY')}`;
                props.newPassDate(dateString);
            });
    };

    const handleSubmitBtn = () => {
        const params = {
            existingPassword: base64_encode(existingPassword),
            newPassword: base64_encode(newPassword),
        };
        setErrorPreviouslyPassword(false);
        if (!validate()) {
            setShowLoader(true);
            axios
                .put<ChangePasswordResponse>(CHANGE_PASSWORD, params, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    setShowLoader(false);
                    if (res.status === 200 && res.data.isSuccess) {
                        handleNewDate();
                        setExistingPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        props.setPassOpen(false);
                        setMessageToUser('Password Updated Successfully');
                        setShowMessageToUser(true);
                    } else if (
                        res.status === 200 &&
                        res.data.isSuccess === false &&
                        res.data.responseMessage === 'Unsuccessful'
                    ) {
                        if (res.data.result.indexOf('5') !== -1) {
                            setErrorPreviouslyPassword(true);
                        }
                        else {
                            setShowResponseErrorMessage(res.data.result);
                        }
                    } else if (res.status === 200 && res.data.isSuccess === false) {
                        setShowResponseErrorMessage(res.data.responseMessage);
                    }
                })
                .catch(() => {
                    setShowResponseErrorMessage(
                        'Entered existing password doesn\'t match with password'
                    );

                    setShowLoader(false);
                });
        }
    };

    useEffect(() => {
        if (showMessageToUser) {
            setTimer();
        } else {
            if (messageTimer) clearTimeout(messageTimer);
        }
    }, [showMessageToUser]);

    const setTimer = () => {
        messageTimer = setTimeout(() => {
            setMessageToUser('');
            setShowMessageToUser(false);
        }, 5000);
    };

    return (
        <>
            {showMessageToUser && (
                <SuccessToaster message={messageToUser} />
            )}

            <Dialog
                open={props.passOpen}
                maxWidth="xs"
                className="userprofile-container change-password-dialog-width"
            >
                <Backdrop
                    sx={{
                        color: '#233ce6',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={showLoader}
                >
                    <CircularProgress />
                </Backdrop>
                <div className="CloseDialog">
                    <button
                        onClick={handleClose}
                        className="btn-close btn-sm close-assign-license"
                    >
                        <div style={{ display: 'none' }}>Close</div>
                    </button>
                </div>

                <DialogTitle
                    className={`d-flex justify-content-center flex-column DialogTitle-Resize ${classes.root}`}
                >
                    <span className="heading">Create a new Password</span>
                </DialogTitle>
                <div className="ResponseErrorMessage">{showResponseErrorMessage}</div>
                <DialogContent className='content-margin'>
                    <TextField
                        hiddenLabel
                        variant="filled"
                        error={existingPasswordError}
                        helperText={existingPasswordErrorText}
                        className={'input-form form-control'}
                        placeholder="Enter current password*"
                        value={existingPassword}
                        type={showExistingPassword ? 'text' : 'password'}
                        onChange={existingPasswordChange}
                        inputProps={{ maxLength: 50, minLength: 1 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password Visibility"
                                        onClick={handleShowExistingPassword}
                                    >
                                        {showExistingPassword ? (
                                            <Visibility className='EyeIcon-resize' />
                                        ) : (
                                            <VisibilityOff className='EyeIcon-resize' />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            style: { fontSize: 16, background: '#f4f5f8' },
                        }}
                    />

                    <TextField
                        hiddenLabel
                        variant="filled"
                        error={errorNewPasswordValidation}
                        helperText={errorNewPasswordValidation ? errorNewPasswordValidationMessage : ''}
                        className={'input-form form-control'}
                        placeholder="Enter new password*"
                        value={newPassword}
                        type={showNewPassword ? 'text' : 'password'}
                        onChange={newPasswordChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password Visibility"
                                        onClick={handleShowNewPassword}
                                    >
                                        {showNewPassword ? <Visibility className='EyeIcon-resize' /> : <VisibilityOff className='EyeIcon-resize' />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            style: {
                                fontSize: 16,
                                background: '#f4f5f8',
                                marginBottom: '4px',
                            },
                        }}
                        inputProps={{ maxLength: 50, minLength: 1 }}
                    />
                    <div className="PasswordConditionHead">
                        New password must contain:
                    </div>
                    <PasswordCondition error={errorCharacter}>
                        Atleast 8 characters
                    </PasswordCondition>
                    <PasswordCondition error={errorSpecial}>
                        A letter
                    </PasswordCondition>
                    <PasswordCondition error={errorLowerLetter}>
                        A number
                    </PasswordCondition>
                    <PasswordCondition error={errorNumber}>A special character</PasswordCondition>

                    <PasswordCondition error={errorPreviouslyPassword}>Don't use 5 previously used password</PasswordCondition>
                    <TextField
                        error={showPasswordMismatchError}
                        helperText={
                            showPasswordMismatchError ? 'Password is not matched' : ''
                        }
                        hiddenLabel
                        variant="filled"
                        className={'input-form form-control password-content-align'}
                        placeholder="Confirm new password*"
                        value={confirmPassword}
                        type={showConfirmPassword ? 'text' : 'password'}
                        onChange={confirmPasswordChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password Visibility"
                                        onClick={handleShowConfirmPassword}
                                    >
                                        {showConfirmPassword ? <Visibility className='EyeIcon-resize' /> : <VisibilityOff className='EyeIcon-resize' />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            style: {
                                fontSize: 16,
                                background: '#f4f5f8',
                                marginTop: '4px',
                            },
                        }}
                        inputProps={{ maxLength: 50, minLength: 1 }}

                    />
                    <p className="required">*Required</p>
                    <Button className='ButtonWidth'
                        onClick={handleSubmitBtn}
                        variant="contained"
                        type="submit"
                        form="myform"
                    >
                        Submit
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ChangePasswordDailog;
