import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import Left from '../../components/Signup/left';
import { FORGOT_PASSWORD, GET_IS_EMAIL_EXIST } from '../../networking/httpEndPoints';
import Button from '../../components/Button';
import InputBox from '../../components/InputBox';
import { ChorusLogo } from "../../utilities/ChorusLogo";

interface ResponseType {
    isSuccess: boolean;
    responseMessage: string;
}

const ForgotPassword: React.FC = () => {
    const history = useHistory();
    const [email, setEmail] = useState(
        history.location.state ? history.location.state.data : ''
    );
    const [emailError, setEmailError] = useState(false);
    const [emailErrorText, setEmailErrorText] = useState('');
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
        useState(false);

    const onSubmit = () => {
        if (email.trim() === '') {
            setEmailError(true);
            setEmailErrorText('Fill the required field');
            return;
        }
        if (
            !new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(email.trim())
        ) {
            setEmailError(true);
            setEmailErrorText('Invalid email, please enter a valid email');
            return;
        }

        Swal.showLoading();       
        const forgetPasswordParams = {            
            userEmail: email.trim(),
            userID: 1,
            emailHTML:
                '<p>Hello,</p><p>We received a request to reset the password for the RegTech account associated with test@gmail.com.You can reset your password by clicking here.& nbsp;</ p > < p > If you did not request a new password, please let us know immediately by replying to this email.& nbsp;</ p > < p > You can find answers to common questions and get in touch with us at support.regtech.com.We & apos; re here to help you every step of the way.&nbsp;</ p > < p > Sincerely,&nbsp;</ p > < p > The RegTech Support Team </ p > ',
            email_Type_Id: 1,
            email_Subject: 'Forget Password',
        };      

        axios
            .get<ResponseType>(`${GET_IS_EMAIL_EXIST}?email=${encodeURIComponent(email.trim())}`)
            .then((res) => {
                Swal.close();               
                if (res.data.isSuccess) {
                    setEmailError(false);
                    axios
                        .post<ResponseType>(FORGOT_PASSWORD, forgetPasswordParams)
                        .then((res) => {
                            Swal.close();
                            if (res.data.isSuccess) {
                                setConfirmationModalIsVisible(true);
                            } else {
                                setConfirmationModalIsVisible(false);
                                setEmailError(true);
                                setEmailErrorText(res.data.responseMessage);
                            }
                        });
                }
                else {
                    setEmailError(true);
                    setEmailErrorText('This email does not exist in our system.');
                }
            });

        Swal.close();
    };

    const emailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailError(false);
        setEmail((event.target as HTMLInputElement).value.trim());
    };

    return (
        <>
           <div className="row m-0 LoginContainer">
                <div className="col-sm-4 col-12 p-0">
                    <Left
                        heading="Forgot Password"
                        title="Enter your email and we will send you instructions to reset your password"
                    />
                </div>
                <div className="col-sm-8 col-12 p-0">
                    <div className="right-container d-flex justify-content-center flex-column">
                        <img src={ChorusLogo} alt="Chorus" className="chorus-logo" />
                        <div className="card mb-4 shadow CardLoginField error-bgwhite">
                            <div className="reset-password-heading heading HeadingForgetPwd">Reset your password</div>

                            <InputBox
                                error={emailError}
                                helperText={emailError ? emailErrorText : ''}
                                hiddenLabel
                                variant="filled"
                                className="input-form"
                                placeholder="Email*"
                                type="text"
                                onChange={emailChange}
                                value={email}
                                style={{ fontSize: 14 }}
                                onKeyDown={(e: any) => {
                                    if (e.key === 'Enter' && email.trim().length > 0) {
                                        onSubmit();
                                    }
                                }}
                            />
                            <Button
                                className="mb-3"
                                type={"contained"}
                                intent="primary"
                                onClick={onSubmit}
                                text={"Submit"}                               
                                disabled={email.length === 0}
                            />
                            <div className="d-flex justify-content-between">
                            <div className="required"> *Required</div>
                                <div className="forgot" onClick={() => history.push('/login')}>
                                    Cancel
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                className="p-4 LoginContainer"
                open={confirmationModalIsVisible}
                onClose={() => {
                    setConfirmationModalIsVisible(false);
                    history.push('/login');
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                disableEscapeKeyDown
            >
                <DialogContent className="ForgetDailogBottomPadding ">
                    <DialogContentText className="ForgetPasswordHeading paddleftright-forgot">
                        Instructions to reset your password <br /> have been sent to the
                        email provided
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="DialogBottom">
                    <Button
                        type={"contained"}
                        intent="primary"
                        width={100}
                        height={40}
                        onClick={() => {
                            setConfirmationModalIsVisible(false);
                            history.push('/login');
                        }}
                        text={"Continue"}
                    />
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ForgotPassword;
