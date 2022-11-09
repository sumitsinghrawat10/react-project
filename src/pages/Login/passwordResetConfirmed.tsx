import React, { useEffect } from 'react';

import Button from '../../components/Button';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ChorusLogo } from "../../utilities/ChorusLogo";
import Left from '../../components/Signup/left';

const PasswordResetConfirmed = () => {
    const history = useHistory();
    const emailTypeId = history.location.state
        ? history.location.state.emailTypeId
        : null;

    useEffect(() => {
        const listener = (event: any) => {
            if (event.key === 'Enter') {
                history.replace('/login', { IsInitialSetup: false });
            }
        };
        document.addEventListener('keydown', listener);

        return () => {
            document.removeEventListener('keydown', listener);
        };
    }, []);

    return (
        <>
            <div className="row m-0 LoginContainer">
                <div className="col-sm-4 col-12 p-0">
                    {emailTypeId === 2 ? (
                        <Left
                            heading="Hello, Welcome!"
                        />
                    ) : (
                        emailTypeId === 4 ? (
                            <Left
                                heading="Hello, Welcome!"
                            />
                        ) : (
                            <Left
                                heading="Welcome Back!"
                            />
                        )
                    )}
                </div>
                <div className="col-sm-8 col-12 p-0">
                    <div className="right-container d-flex justify-content-center flex-column align-items-center">
                        <img src={ChorusLogo} alt="Chorus" className="chorus-logo" />
                        <div
                            style={{
                                width: '120px',
                                height: '2px',
                                marginTop: '60px',
                                backgroundColor: '#233ce6',
                            }}
                        ></div>
                        {(emailTypeId === 2) || (emailTypeId === 4) ? (
                            <div>
                            <div className="HeadingResetConfirmed">Password successfully created!</div>
                                <div className="h2 fw-bold HeadingResetConfirmed py-2">Password successfully created!</div>
                                {emailTypeId === 2 && (
                                    <div className="h2 fw-bold NormalResetMessage py-2">You can now proceed to login to start the initial setup</div>
                                )}
                                {emailTypeId === 4 && (
                                    <div className="h2 fw-bold NormalResetMessage py-2">You can now proceed to login</div>
                                )}
                                <div className="d-flex justify-content-center py-4">
                                    {emailTypeId !== 4 && (
                                        <Button
                                            className="d-md-block mx-auto ButtonWrapperResetConfirmed"
                                            type={"outlined"}
                                            intent="primary"
                                            onClick={() =>
                                                history.replace('/login', { IsInitialSetup: true })
                                            }
                                            text={"Start intial setup"}
                                        />
                                    )}
                                    <Button
                                        className="d-md-block mx-auto ButtonWrapperResetConfirmed"
                                        type={"contained"}
                                        intent="primary"
                                        onClick={() =>
                                            history.replace('/login', { IsInitialSetup: false })
                                        }
                                        text={"Continue to dashboard"}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className='text-center mt-4'>
                                <div className="h2 fw-bold HeadingResetConfirmed py-2">Password successfully changed!</div>
                                <div className="h2 fw-bold NormalResetMessage py-2">You can now proceed to login</div>
                                <div className="d-flex justify-content-center py-4">
                                    <Button
                                        className="d-md-block mx-auto ButtonWrapperResetConfirmed"
                                        type={"contained"}
                                        intent="primary"
                                        onClick={() => history.replace('/login')}
                                        text={"Continue to dashboard"}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
export default PasswordResetConfirmed;
