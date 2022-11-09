import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "../Button";
interface DialogProps {
  dialogOpen: any;
  dialogSetOpen: any;
  message: string;
  yesBtnClick: any;
  noBtnClick: any;
  noBtnClass?: string;
  className?: string;
}

const DialogWithTwoBtn = (props: DialogProps) => {
  return (
    <Dialog
      open={props.dialogOpen}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      className={`dialog-button-container d-flex justify-content-center flex-column ${props.className}`}
    >
      <DialogContent className="dialogContent">
        <span className="spanBox">
          <b>{props.message}</b>
        </span>
      </DialogContent>
      <div className="ButtonWrapper d-flex justify-content-center">
        <div className="dialogActions">
          <Button
            onClick={props.yesBtnClick}
            className={props.noBtnClass}
            type="outlined"
            text="Yes"
            intent="primary"
          />
          <Button
            onClick={props.noBtnClick}
            type="contained"
            text="No"
            intent="primary"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogWithTwoBtn;
