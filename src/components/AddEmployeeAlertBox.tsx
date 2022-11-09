import * as React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import styled from 'styled-components';

const DialogWrapper = styled(Dialog)`
  height: 100%;
  width: 100%;
  .dialogContent {
    margin: 30px !important;
    justify-content: center;
    overflow-wrap: break-word;
    font-size: 24px !important;
    text-align: center;
  }
`;

const ButtonWrapper = styled.div`
  margin: 0 auto;
  @media only screen and (min-width: 1280px) and (max-width: 1499px) {
    max-width: 550px;
  }
  @media (min-width: 1500px) {
    max-width: 977px;
  }
  .dialogActions {
    margin-bottom: 30px;
  }
`;

interface AlertState {
  alertOpen: boolean;
  handleAlertYes: any;
  handleAlertNo: any;
  alertMessage: string;
}

const AddEmployeeAlertBox: React.FC<AlertState> = (props: AlertState) => {
    return (
        <div>
            <DialogWrapper
                open={props.alertOpen}
                className="d-flex justify-content-center flex-column"
            >
                <DialogContent className="dialogContent">
                    <span className="spanBox">
                        <b> {props.alertMessage} </b>
                    </span>
                </DialogContent>
                <ButtonWrapper className="d-flex justify-content-center dialogActions">
                    <DialogActions>
                        <Button
                            sx={{ mr: 1 }}
                            variant="outlined"
                            onClick={props.handleAlertYes}
                            autoFocus
                        >
              YES
                        </Button>
                        <Button variant="contained" onClick={props.handleAlertNo}>
              NO
                        </Button>
                    </DialogActions>
                </ButtonWrapper>
            </DialogWrapper>
        </div>
    );
};

export default AddEmployeeAlertBox;
