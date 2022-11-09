import * as React from 'react';

import Button from "../../../components/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import styled from 'styled-components';

interface AlertState {
    cancelAuditAlert: boolean;
    handleAlertYes: any;
    handleAlertNo: any;
}

const CancelAuditAlertDialog: React.FC<AlertState> = (props: AlertState) => {
    return (
            <Dialog open={props.cancelAuditAlert} className="dashboard-license-container d-flex justify-content-center flex-column DialogWrapper">
                <div className="DialogWrapper">
                <DialogContent className="dialogContent">
                    <span className="spanBox">
                        <b>
                            Are you sure you want to cancel the audit ?{' '}
                        </b>
                    </span>
                </DialogContent>
                <div className="ButtonWrapper d-flex justify-content-center dialogActions">
                    <DialogActions>
                        <Button
                            className="Button-Progress-Size"
                            type="outlined"
                            intent="secondary"
                            onClick={props.handleAlertYes}
                            autoFocus
                            text="Yes"
                        />
                        <Button
                            className="Button-Progress-Size"
                            type="contained"
                            intent="primary"
                            onClick={props.handleAlertNo}
                            text="No"
                        />
                    </DialogActions>
                    </div>
                </div>
            </Dialog>
    );
};

export default CancelAuditAlertDialog;
