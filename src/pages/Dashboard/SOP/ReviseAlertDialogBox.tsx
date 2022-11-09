import * as React from "react";

import { TextField } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Button from "../../../components/Button";

interface AlertState {
  alertOpen: boolean;
  handleAlertSave: any;
  handleAlertCancel: any;
  description: string;
  setDescription: any;
}

const ReviseAlertDialogBox: React.FC<AlertState> = (props: AlertState) => {
  const [isError, setIsError] = React.useState(false);
  const [revisionData, setRevisionData] = React.useState("");
  const validateFields = () => {
    if (revisionData.length === 0 || revisionData === null) {
      setIsError(true);
    } else {
      setIsError(false);
      setRevisionData("");
      props.handleAlertSave();
    }
  };

  return (
    <div>
      <Dialog
        open={props.alertOpen}
        className="d-flex justify-content-center flex-column sop-dashboard-container form-container"
      >
        <DialogContent className="dialogContent DialogContentWrapper revise-alert-dialog form-container">
          <div className="col-sm-12">
            <DialogTitle>
              <div className="d-flex justify-content-center dialogTop">
                Enter revision notes
              </div>
            </DialogTitle>
            <div className="mt-3">
              <TextField
                hiddenLabel
                multiline
                rows={8}
                variant="filled"
                className={"input-form form-control"}
                placeholder="Enter revisions needed(maximum limit, 1000 characters)"
                type="text"
                onChange={(e: any) => {
                  setIsError(false);
                  props.setDescription(e.target.value);
                  setRevisionData(e.target.value);
                }}
                InputProps={{
                  style: { fontSize: 16, background: "#f9f9f9" },
                }}
                inputProps={{ maxLength: 1000 }}
              />
            </div>
            {isError && (
              <div className="error">Revision Notes are required</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
            <div className="d-flex justify-content-between align-items-center ButtonsWrapper">
            <Button
              type="outlined"
              intent="secondary"
              className={"PopupCancelButton"}
              onClick={() => {
                setIsError(false);
                props.handleAlertCancel();
                setRevisionData("");
              }}
              text="Cancel"
            />

          <Button
              type="contained"
              intent="primary"
              className={"ApprovalSubmitButton"}
              onClick={() => {
                setIsError(false);
                validateFields();
              }}
              text="Submit"
            />
            </div>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default ReviseAlertDialogBox;
