import React from 'react';
import Button from '../../../components/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
interface AlertState {
  alertOpen: boolean;
  handleAlertYes: any;
  handleAlertNo: any;
  alertMessage: string;
}

const AlertDialog: React.FC<AlertState> = (props: AlertState)  => {
    return (
        <div className="dashboard-license-container">
            <Dialog
                open={props.alertOpen}
                className="d-flex justify-content-center flex-column DialogWrapper"
            >
                <DialogContent className="dialogContent">
                    <span className="spanBox">
                        <b>Are you sure you want to cancel {props.alertMessage}? </b>
                    </span>
                </DialogContent>
                <div className="d-flex justify-content-center dialogActions ButtonWrapper">
                    <DialogActions>
                        <Button type="outlined" intent="secondary"  onClick={props.handleAlertYes} text="YES"/>
                        <Button type="contained" intent="primary"  onClick={props.handleAlertNo} text="NO"/>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    );
};

export default AlertDialog;
