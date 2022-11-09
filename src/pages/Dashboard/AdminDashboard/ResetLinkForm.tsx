import React, { useState } from "react";

import { TextField, Backdrop, CircularProgress } from "@mui/material";
import Button from "../../../components/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import axios from "axios";
import Swal from "sweetalert2";

import { RESEND_ACTIVATION_LINK } from "../../../networking/httpEndPoints";

interface ResetLinkType {
  open: boolean;
  setOpen: any;
  resendLinkData?: any;
  emailId: any;
}

interface ResponseType {
  isSuccess: boolean;
  responseMessage: string;
}
const ResetLinkForm: React.FC<ResetLinkType> = (props: ResetLinkType) => {
  const [showLoader, setShowLoader] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorText, setEmailErrorText] = useState("");
  const [resendButtonState, setResendButtonState] = useState(false);
  const handleCancel = () => {
    props.setOpen(false);
  };
  const token = localStorage.getItem("user");
  const email = props.emailId;
  const onSubmit = () => {
    if (email.trim() === "") {
      setEmailError(true);
      setEmailErrorText("Fill the required field");
      return;
    }
    if (
      !new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(email.trim())
    ) {
      setEmailError(true);
      setEmailErrorText("Invalid email, please enter a valid email");
      return;
    }
    Swal.showLoading();
    const resendLinkParams = {
      userEmail: email.trim(),
    };
    axios
      .post<ResponseType>(RESEND_ACTIVATION_LINK, resendLinkParams, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        Swal.close();
        if (res.status === 201 && res.data.isSuccess) {
          handleCancel();
          props.resendLinkData();
          setResendButtonState(false);
        } else if (res.status === 201 && !res.data.isSuccess) {
          handleCancel();
          setResendButtonState(false);
          Swal.fire({
            text: res.data.responseMessage,
            confirmButtonText: "OK",
            icon: "info",
          });
        } else {
          setResendButtonState(false);
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      });
    Swal.close();
  };

  return (
    <>
      <Dialog
        open={props.open}
        keepMounted
        className="p-4 admin-dashboard-container"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            maxHeight: 800,
            width: 500,
            height: 400,
          },
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>
        <DialogContent>
          <div className="content-wrapper admin-dashboard-container form-container">
            <div className="row">
              <div className="formDarkHeader">
                Enter email associated with the account
              </div>

              <TextField
                error={emailError}
                helperText={emailError ? emailErrorText : ""}
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="email*"
                type="text"
                value={email}
                disabled
                InputProps={{ style: { fontSize: 14 } }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && email.trim().length > 0) {
                    onSubmit();
                  }
                }}
              />
              <Button
                className="mb-3 mt-2"
                intent="primary"
                type="contained"
                text=" Resend Link"
                onClick={() => {
                  setResendButtonState(true);
                  onSubmit();
                }}
                disabled= {email.length === 0 ? true : resendButtonState}
              />
              <div className="d-flex justify-content-between">
                <div className="required-wrapper">
                  <div>* Required</div>
                </div>
                <div className="cancel-wrapper">
                  <div className="forgot" onClick={handleCancel}>
                    Cancel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetLinkForm;
