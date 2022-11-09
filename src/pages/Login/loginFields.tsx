import React, { MouseEvent, useEffect } from 'react';

import axios from 'axios';
import { History } from 'history';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import Button from '../../components/Button';
import InputBox from '../../components/InputBox';
import { ChorusLogo } from "../../utilities/ChorusLogo";
import { ActionType } from '../../model/model';
import { BLOCK_USER } from '../../networking/httpEndPoints';
import { RootState } from '../../redux/rootReducer';
import * as LoginActions from './authenticationActions';
import Loader from "../../components/Loader";

interface HistoryType {
    history: History;
    actions: typeof LoginActions;
    user: {
        user: string | null;
        error?: boolean;
        loginAttempt: number;
        status: number;
    };
}

const Right: React.FC<HistoryType> = (props: HistoryType) => {
    const historyCheck = useHistory();
    const [errorEmail, setErrorEmail] = React.useState('');
    const [errorPassword, setErrorPassword] = React.useState('');
    const [visible, setVisible] = React.useState(false);
    const [showAlert, setShowAlert] = React.useState(true);
    const [loader, setLoader] = React.useState(false);
    const [values, setValues] = React.useState({
        email: '',
        password: '',
        showPassword: false,
    });

    const emailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrorEmail('');
        setValues({ ...values, email: (event.target as HTMLInputElement).value });
    };

    const dispatch = useDispatch();

    const passwordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrorPassword('');
        setValues({
            ...values,
            password: (event.target as HTMLInputElement).value,
        });
    };
    const onSubmit = () => {
        props.user.status = 0;
        if (values.email.trim() === '') {
            setErrorEmail('*Please fill out username');
        }
        if (values.password.trim() === '') {
            return setErrorPassword('*Please fill out password');
        }
        setLoader(true);
        setVisible(false);
        setShowAlert(true);
        props.actions.loginUserAction({
            email: values.email,
            password: values.password,
            loginAttempt: props.user.loginAttempt,
        });
    };

    const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        props.actions.changeLoginError(false);
        setVisible(!visible);
    };

    const handleCancel = () => {
        setShowAlert(false);
    };

    useEffect(() => {
        props.actions.changeLoginError(false);
        setVisible(false);
        if (props.user.user) {
            if (
                historyCheck.location.state &&
                historyCheck.location.state.IsInitialSetup
            ) {
                historyCheck.push('/initial-setup');
                dispatch({ type: ActionType.NAV_VISIBLE, payload: false });
            } else {
                historyCheck.push('/');
                dispatch({ type: ActionType.NAV_VISIBLE, payload: true });
            }
            setLoader(false);
        }
    }, [props.user.user, historyCheck]);

    useEffect(() => {
        props.actions.ResetLoginAttemptAction();
    }, []);

    useEffect(() => {
        setLoader(false);
        if (props.user.loginAttempt === 6) {
            BlockUser();
        }
    }, [props.user.loginAttempt]);

    const handleClickShowPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    };
    const CheckError = (condition: string ) => {
        if (condition) {
        return true;
        } else {
        return false;
        }
    };
    interface ResponseType {
        isSuccess: boolean;
        responseMessage: string;
    }
    const BlockUser = () => {

        setShowAlert(true);
        const blockUserParams = {
            status: 2,
            userEmail: values.email
        };
        axios
            .put<ResponseType>(BLOCK_USER, blockUserParams)
            .then((res) => {
                if (res.data.isSuccess) {
                    //props.user.loginAttempt = 7;
                } else {
                    //Do Nothing
                }
            });
    };
    const LoginErrorSection = (): JSX.Element => {
        if (props.user.status !== 422 && props.user.error) {
            return (<>
                <div className="heading CancelHeading">
                    <span className="btn-name">Invalid Email or Password</span>
                    <i className="bi bi-x-circle" onClick={handleRemove} />
                </div>
            </>);
        } else if (props.user.status === 422 && props.user.error) {
            return (<>
                <div className="heading CancelHeading">

                    <span className="btn-name">Account suspended, contact RegTech Admin</span>
                    <i className="bi bi-x-circle" onClick={handleRemove} />
                </div>
            </>);
        }
        else {
            return <></>;
        }

    };
    return (
        <div className="right-container d-flex justify-content-center flex-column LoginContainer">
            <img src={ChorusLogo} alt="Chorus" className="chorus-logo" />
            <div className="card mb-4 shadow CardLoginField">
                {loader && <Loader />}
                {!visible && (
                     <LoginErrorSection/>
                )}

                {(props.user.loginAttempt < 1 ||
                    (!showAlert && props.user.loginAttempt >= 4)) && (
                        <div className="heading HeadingLoginField">Please login</div>
                    )}
                {showAlert && props.user.loginAttempt >= 4 && (
                    <div className="heading AlertHeading">
                        Trouble logging in?{' '}
                        <span className="ClickHereWrapper"
                            onClick={() =>
                                historyCheck.push('/forgot-password', { data: values.email })
                            }
                        >
                            Click here
                        </span>
                        <span className="IconWrapper" onClick={handleCancel}>
                            <i className="bi bi-x-circle"></i>
                        </span>
                    </div>
                )}
                {showAlert && props.user.loginAttempt >= 6 && (
                    <div className="heading AlertHeading">
                        Too many incorrect password attempts. Please try again after some time{' '}
                    </div>
                )}
                <InputBox
                    hiddenLabel={true} 
                    error={CheckError(errorEmail)}
                    className={"input-form"}
                    placeholder={"Enter username*"}
                    onChange={emailChange}
                    value={values.email}
                    style={{ fontSize: 16, background: '#f4f5f8' }}
                />
                <div className="error">{errorEmail}</div>
                <InputBox
                    hiddenLabel={true}
                    error={CheckError(errorPassword)}
                    className={"input-form"}
                    style={{ fontSize: 16, background: '#f4f5f8' }}
                    placeholder="Enter password*"
                    value={values.password}
                    onChange={passwordChange}
                    isPasswordField={true}
                    type={values.showPassword ? 'text' : 'password'}
                    onShowPasswordClick={handleClickShowPassword}
                    passwordArealable={"toggle password Visibility"}
                    onKeyDown={(e: any) => {
                        if (
                            e.key === 'Enter' &&
                            values.email.trim().length > 0 &&
                            values.password.trim().length > 0
                        ) {
                            onSubmit();
                        }
                    }}
                />
                <div className="error">{errorPassword}</div>
                <Button
                    className="mb-3"
                    type={"contained"}
                    intent="primary"
                    disabled={values.email && values.password ? false : true}
                    onClick={() => onSubmit()}
                    text={"Submit"}
                />
                <div className="d-flex justify-content-between align-items-center">
                    <div className="required">*Required</div>
                    <div className="ClickHereWrap">
                        Can't access your account?
                        <div
                            className="forgot ButtonClick"
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                                historyCheck.push('/forgot-password', { data: values.email })
                            }
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    historyCheck.push('/forgot-password', { data: values.email });
                                }
                            }}
                        >
                            &nbsp; Click here
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state: RootState) => ({
    user: state.user,
});

function mapDispatchToProps(dispatch: any) {
    return {
        actions: bindActionCreators(LoginActions as any, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Right);
