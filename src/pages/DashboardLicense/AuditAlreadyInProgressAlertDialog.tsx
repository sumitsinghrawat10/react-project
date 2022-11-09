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
    margin-top: 30px !important;
    justify-content: center;
    overflow-wrap: break-word;
    font-size: 24px !important;
    text-align: center;
  }
`;

const ButtonWrapper = styled.div`
  margin: 0 auto;
  margin-left: 70px !important;
  margin-right: 70px !important;
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

const ButtonSize = styled(Button)`
  width: 150px !important;
  margin-bottom: 50px !important;
`;

interface AlertState {
  auditAlreadyInProgressAlert: boolean;
  handleAlertOk: any;
  firstStatement: any;
  secondStatement: any;
}

const AuditAlreadyInProgressAlertDialog: React.FC<AlertState> = (props: AlertState) => {
  return (
    <div className="dashboard-license-container Button-Progress-Wrapper">
      <Dialog
        open={props.auditAlreadyInProgressAlert}
        className="d-flex justify-content-center flex-column dashboard-license-container Dialog-Progress-Wrapper form-container"
      >
        <DialogContent className="dialogContent">
          <span className="spanBox">
            <b>
              {props.firstStatement} <br /> {props.secondStatement}{' '}
            </b>
          </span>
        </DialogContent>
        <div className="d-flex justify-content-center dialogActions">
          <DialogActions>
            <Button className="Button-Progress-Size" variant="contained" onClick={props.handleAlertOk}>
              OK{' '}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default AuditAlreadyInProgressAlertDialog;