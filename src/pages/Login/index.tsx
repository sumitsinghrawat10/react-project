import { History } from 'history';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import Left from '../../components/Signup/left';
import Right from './loginFields';

const Login = (history: History) => {
    const hist = useHistory();
    const IsInitialSetup = hist.location.state
        ? hist.location.state.IsInitialSetup
        : null;  
    return (
        <div  className='LoginContainer'>
            <div className="row">
                <div className="col-sm-4 col-12 p-0">
                    {IsInitialSetup ? (
                        <Left
                            heading="Hello, Welcome!"
                            title="Login to start initial setup"
                        />
                    ) : (
                        <Left
                            heading="Hello, Welcome!"
                            title="Login with your user name"
                        />
                    )}   
                </div>
                <div className="col-sm-8 col-12 p-0">
                <Right history={history} />
                </div>
            </div>
        </div>
    );
};

export default Login;