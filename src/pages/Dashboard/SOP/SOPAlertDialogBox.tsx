import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

interface AlertState {
  sopAlertOpen: boolean;
  handleAlertYes: any;
  handleAlertNo: any;
  alertMessage: any;
}

const SOPAlertDialog: React.FC<AlertState> = (props: AlertState) => {
  return (
    <div className="SopDialogAlert">
      <Dialog
        open={props.sopAlertOpen}
        className="d-flex justify-content-center flex-column sop-dashboard-container DialogWrapper sop-alert-dialog "
      >
        <DialogContent className="d-flex justify-content-center ">
          <span className="spanBox alert-message">
            <b>{props.alertMessage}</b>
          </span>
        </DialogContent>
        <div className="ButtonWrapper d-flex justify-content-center dialogActions ">
          <span>
            <DialogActions>
              <Button
                className="ButtonSize"
                sx={{ mr: 1 }}
                variant="outlined"
                onClick={props.handleAlertYes}
                autoFocus
              >
                Yes
              </Button>
              <Button
                className="ButtonSize"
                variant="contained"
                onClick={props.handleAlertNo}
              >
                No
              </Button>
            </DialogActions>
          </span>
        </div>
      </Dialog>
    </div>
  );
};

export default SOPAlertDialog;
