import React, { useState, useEffect } from "react";

import { Backdrop, CircularProgress, SelectChangeEvent } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import Button from "../../../components/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

import SingleSelectMenu from "../../../components/Admin/SingleSelectMenu";
import { getAdminsByOrgID } from "../../../components/ReusableAxiosCalls";

interface ContactType {
  open: boolean;
  setOpen: any;
  handleUpdateContact?: any;
  currentUserId: number;
  organzationId: number;
  setPrimaryUserId?: any;
}
enum StaticText {
  apiResponseError = "Something went wrong!",
  dialogTitle = "Change Primary System Administrator",
  employeeValidation = "Contact not selected",
  employeePlaceHolder = "Select new contact",
}
const UpdateContactForm: React.FC<ContactType> = (props: ContactType) => {
  const [userList, setUserList] = React.useState<any[]>([
    { firstName: "", userId: 0, lastName: "", middleName: "", email: "" },
  ]);

  const [userId, setUserId] = useState("");
  const [employeeError, setEmployeeError] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleCancel = () => {
    props.setOpen(false);
    props.setPrimaryUserId(userId);
    setEmployeeError(false);
  };

  const token = localStorage.getItem("user");
  useEffect(() => {
    setShowLoader(true);
    getAdminsByOrgID(
      props.organzationId,
      token,
      setUserList,
      setUserId,
      props.currentUserId,
      props.setPrimaryUserId,
      true
    );
    setShowLoader(false);
  }, [token]);

  const validateFields = () => {
    let validate = true;
    if (props.currentUserId.toString().length === 0) {
      setEmployeeError(true);
      validate = false;
    }
    return validate;
  };

  const handleOk = () => {
    if (validateFields()) {
      props.handleUpdateContact(
        userList.filter((user) => user.userId === userId)
      );
      props.setPrimaryUserId(userId);
      props.setOpen(false);
    }
  };

  const handleSelectMenuChange = (e: SelectChangeEvent) => {
    setEmployeeError(false);
    if (e.target.value !== "") {
      setUserId(e.target.value);
    }
    props.setPrimaryUserId(e.target.value);
  };

  return (
    <>
      <Dialog
        open={props.open}
        keepMounted
        className="p-4 admin-dashboard-container form-container"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            maxHeight: 800,
          },
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>
        <div>
          <button
            onClick={handleCancel}
            className="btn-close btn-sm close-assign-task"
          ></button>
        </div>
        <DialogContent>
          <DialogContentText className="Dialog-top-text">
            {StaticText.dialogTitle}
          </DialogContentText>

          <div className="row select-row-wrapper">
            <div className="col-12 col-sm-12 mt-2">
              <SingleSelectMenu
                userId={props.currentUserId.toString()}
                handleSelectChange={handleSelectMenuChange}
                userList={userList}
                placeHolder={StaticText.employeePlaceHolder}
              />
              <div className="select-menu-error">
                {employeeError ? StaticText.employeeValidation : ""}
              </div>
            </div>
            <div className="text-right col-sm-12 d-flex button-wrapper">
              {
                <Button
                  intent="primary"
                  className="mb-2 next-btn button mr-0 mt-5"
                  type="contained"
                  onClick={() => {
                    handleOk();
                  }}
                  text="Ok"
                />
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateContactForm;
