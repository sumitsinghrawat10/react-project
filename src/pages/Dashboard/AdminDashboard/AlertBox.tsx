import React from "react";

import Button from "../../../components/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

interface AlertState {
  alertOpen: boolean;
  handleAlertYes: any;
  handleAlertNo: any;
  isEnabledPopUp: boolean;
  isAnswerEnabled: string;
  handleAlertContinue: any;
}

const AlertBox: React.FC<AlertState> = (props: AlertState) => {
  const EnabledPopUpTrue = () => {
    return (
      <DialogActions>
        <Button
          className="ButtonSizeAlert alert-button-effect"
          type="outlined"
          intent="secondary"
          onClick={props.handleAlertNo}
          text="No"
        />

        <Button
          className="ButtonSizeAlert"
          intent="primary"
          type="contained"
          onClick={props.handleAlertYes}
          autoFocus
          text="Yes"
        />
      </DialogActions>
    );
  };
  const EnabledPopupFalse = () => {
    return (
      <DialogActions>
        <Button
          className="ButtonSizeAlert alert-button-effect"
          type="outlined"
          intent="secondary"
          onClick={props.handleAlertYes}
          text="Yes"
        />

        <Button
          className="ButtonSizeAlert"
          intent="primary"
          type="contained"
          onClick={props.handleAlertNo}
          autoFocus
          text="No"
        />
      </DialogActions>
    );
  };
  const PopUpRes = (result: boolean) => {
    if (result) return EnabledPopUpTrue();
    else return EnabledPopupFalse();
  };

  const IsEnabledPopUpMessage = (): JSX.Element => {
    if(props.isEnabledPopUp){
      return(<>
        <b>Are you sure you want to <br/> enable this account? </b>
      </>);
    } else {
      return(<>
        <b>Are you sure you want to <br/> disable this account? </b>
      </>);
    }
  };

  return (
    <div className="d-flex justify-content-center flex-column">
      <Dialog
        className="admin-dashboard-container DialogWrapperAlert my-special-width"
        open={props.alertOpen}
      >
        <DialogContent className="DialogWrapperAlert">
        <div className="dialogContentAlert">
          {props.isAnswerEnabled === "" ? (
            <span className="spanBox">
              <IsEnabledPopUpMessage/>
            </span>
          ) : (
            <span className="spanBox">
              <b>The account has been <br/> successfully {props.isAnswerEnabled}.</b>
            </span>
          )}
          </div>
        </DialogContent>
        <div className="ButtonWrapperAlert d-flex justify-content-center dialogActionsAlert">
          {props.isAnswerEnabled === "" ? (
            <span>{PopUpRes(props.isEnabledPopUp)}</span>
          ) : (
            <span>
              <DialogActions>
                <Button
                  className="ButtonSizeAlert"
                  type="contained"
                  intent="primary"
                  onClick={props.handleAlertContinue}
                  autoFocus
                  text="Continue"
                />
              </DialogActions>
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default AlertBox;
