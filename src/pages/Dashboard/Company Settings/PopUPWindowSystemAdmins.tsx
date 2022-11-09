import React, { useState, useEffect } from "react";

import { Backdrop, CircularProgress, SelectChangeEvent } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import styled from "styled-components";

import SingleSelectMenu from "../../../components/Admin/SingleSelectMenu";
import { getAdminsByOrgID } from "../../../components/ReusableAxiosCalls";
import { ContactType } from "./CompanyInterfaces";
import { decodeToken } from '../../../utilities/decodeToken';

export const ButtonWrapper = styled.div`
  justify-content: right !important;
`;

enum StaticText {
  apiResponseError = "Something went wrong!",
  dialogTitle = "Change Primary System Administrator",
  employeeValidation = "Contact not selected",
  employeePlaceHolder = "Select new contact",
}
const PopUPWindowSystemAdmins: React.FC<ContactType> = (props: ContactType) => {
  const [userList, setUserList] = React.useState<any[]>([
    { firstName: "", userId: 0, lastName: "", middleName: "", email: "" },
  ]);

  const [userId, setUserId] = useState("");
  const [newPrimaryUserId, setNewPrimaryUserId] = useState(0);
  const [employeeError, setEmployeeError] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleCancel = () => {
    props.setOpen(false);
    setEmployeeError(false);
  };

  const token = localStorage.getItem("user");
  const userData = decodeToken(token);
  useEffect(() => {
    setShowLoader(true);
    getAdminsByOrgID(
      props.organzationId,
      token,
      setUserList,
      setUserId,
      props.currentUserId
    );
    setShowLoader(false);
  }, [token]);
useEffect(() => {
        if(userList.length > 0 && userList[0].firstName !== ""){
                props.handleUpdateContact(
                userList.filter((user) => user.userId.toString() === userData.UserId)
            );
         }
    }, [userList]);
  const validateFields = () => {
    let validate = true;
    if (newPrimaryUserId === 0) {
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

      props.setOpen(false);
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setEmployeeError(false);
    if (e.target.value !== "") {
      setUserId(e.target.value);
      setNewPrimaryUserId(parseInt(e.target.value, 10));
    }
  };

  return (
    <>
      <Dialog
        className="company-setting-dashboard p-4"
        keepMounted
        aria-describedby="alert-dialog-description"
        aria-labelledby="alert-dialog-title"
        PaperProps={{
          sx: {
            maxHeight: 800,
          },
        }}
        open={props.open}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>
        <div className="CloseDialog">
          <button
            onClick={handleCancel}
            className="btn-close btn-sm close-assign-task"
          ></button>
        </div>
        <DialogContent>
          <DialogContentText className="modal-title">
            {StaticText.dialogTitle}
          </DialogContentText>

          <div className="row DivRowWrapper">
            <div className="col-12 col-sm-12 mt-2">
              <SingleSelectMenu
                userId={userId}
                handleSelectChange={handleSelectChange}
                userList={userList}
                placeHolder={StaticText.employeePlaceHolder}
              />
              <div className="Error">
                {employeeError ? StaticText.employeeValidation : ""}
              </div>
            </div>
            <div className="text-right col-sm-12 d-flex modal-button-wrapper">
              {
                <Button
                  sx={{ mr: 0, mt: 5 }}
                  className="mb-2 next-btn ButtonSize"
                  variant="contained"
                  onClick={handleOk}
                >
                  Ok
                </Button>
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PopUPWindowSystemAdmins;
