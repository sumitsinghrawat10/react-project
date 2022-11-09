import React, { useEffect, useState } from "react";

import {
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Checkbox,
  Backdrop,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import { isEqual } from "lodash";

import SuccessToaster from "../../../components/SuccessToaster";
import SwalBox from "../../../components/SwalBox";
import { ASSIGN_EMPLOYEE_TO_LICENSES } from "../../../networking/httpEndPoints";
import Button from '../../../components/Button';
interface ResponseType {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface PopupState {
  openLicenseDialog: boolean;
  handleLicenseDialog: any;
  employeeId: any;
  employeeName: string;
  licenseData: any;
  reloadLicenseData: boolean;
  setReloadLicenseData: any;
}

const ITEM_HEIGHT = 60;
const ITEM_PADDING_TOP = 2;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4 + ITEM_PADDING_TOP,
      maxWidth: 300,
    },
  },
};

const AssignLicenseDialogBox: React.FC<PopupState> = (props: PopupState) => {
  const [showLoader, setShowLoader] = useState(false);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [isLicenseLabel, setIsLicenseLabel] = React.useState(false);
  const [selectedLicenseIds, setSelectedLicenseIds] = React.useState<number[]>(
    []
  );
  const [selectedLicense, setSelectedLicense] = useState<Array<string>>([]);
  const [initialCheckedLicenseIds, setInitialCheckedLicenseIds] = useState<
    Array<string>
  >([]);

  const token = localStorage.getItem("user");

  useEffect(() => {
    if (props.openLicenseDialog) {
      resetFields();
      handleLicenseData();
    }
  }, [props.openLicenseDialog]);

  const resetFields = () => {
    setIsLicenseLabel(false);
    setSelectedLicense(Array<string>());
    setSelectedLicenseIds([]);
    setInitialCheckedLicenseIds([]);
  };

  const handleLicenseData = () => {
    if (props.licenseData.length > 0) {
      let selectedLicensesString = "";
      const checkedItems: any = [];
      props.licenseData.forEach((element: any) => {
        if (element.isAssigned) {
          selectedLicensesString += element.licenseNumber + ",";
          checkedItems.push(element.licenseId);
        }
      });
      setSelectedLicenseIds(checkedItems);
      setInitialCheckedLicenseIds(checkedItems);
      if (selectedLicensesString !== "") {
        selectedLicensesString = selectedLicensesString.slice(
          0,
          selectedLicensesString.length - 1
        );
        setSelectedLicense(selectedLicensesString.split(","));
        setIsLicenseLabel(true);
      }
    }
  };

  const handleLicenseIdChange = (licenseId: number) => {
    const licenseIdArray: any = [...selectedLicenseIds];
    if (selectedLicenseIds.includes(licenseId) === false) {
      licenseIdArray.push(licenseId);
    } else {
      const index = licenseIdArray.indexOf(licenseId);
      licenseIdArray.splice(index, 1);
    }
    handleSubmitDisable();
    setSelectedLicenseIds(licenseIdArray);
  };

  const handleLicenseChange = (event: any) => {
    const {
      target: { value },
    } = event;

    setSelectedLicense(typeof value === "string" ? value.split(",") : value);
    const flag = event.target.value.length > 0 ? true : false;
    setIsLicenseLabel(flag);
  };

  const onSubmit = () => {
    const params = {
      employeeId: props.employeeId,
      licenseIds: selectedLicenseIds,
    };
    if (token !== null) {
      setShowLoader(true);
      axios
        .post<ResponseType>(ASSIGN_EMPLOYEE_TO_LICENSES, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          props.handleLicenseDialog();
          if (res.status === 201 && res.data.isSuccess) {
            if (res.data.result === true) {
              SwalBox(res.data.responseMessage, "info");
            } else {
              props.setReloadLicenseData(!props.reloadLicenseData);
              setConfirmationModalIsVisible(true);
              setTimeout(() => {
                setConfirmationModalIsVisible(false);
              }, 3000);
            }
          } else if (
            res.status === 201 &&
            !res.data.isSuccess &&
            res.data.result === true
          ) {
            SwalBox(res.data.responseMessage, "info");
          } else {
            SwalBox("Error occurred while submitting changes", "error");
          }
        })
        .catch(() => setShowLoader(false));
    }
  };

  const handleSubmitDisable = () => {
    return isEqual(selectedLicenseIds, initialCheckedLicenseIds);
  };

  return (
    <>
      <Dialog
        open={props.openLicenseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="employee-dashboard-container">
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={showLoader}
          >
            <CircularProgress />
          </Backdrop>
          <div className="CloseDialog">
            <button
              onClick={() => props.handleLicenseDialog()}
              className="btn-close btn-sm btn-close-popup"
            >
              <div style={{ display: "none" }}>Close</div>
            </button>
          </div>
          <DialogTitle className="dialog-title-location">
            Assign a license to this employee
          </DialogTitle>
          <DialogContent className="dialog-content-location">
            <span className="row ms-1 mb-2 employeeNameWrapper">
              {`Employee: ${props.employeeName}`}
            </span>
            <div className="bottomLine-license"></div>
            <span className="licenseWrapper">
              Select the license you would like to assign?
            </span>
            <FormControl variant="standard" sx={{ width: 530 }}>
              <InputLabel
                hidden={isLicenseLabel}
                id="user-label"
                className="licenseInputLabel"
              >
                Select one or more licenses
              </InputLabel>
              <Select variant="filled"
                className="licenseSelect"
                disableUnderline
                labelId="user-label"
                multiple
                value={selectedLicense}
                onChange={handleLicenseChange}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {props.licenseData &&
                  props.licenseData.map((item: any, index: any) => (
                    <MenuItem
                      key={index}
                      value={item.licenseNumber}
                      onClick={() => {
                        handleLicenseIdChange(item.licenseId);
                      }}
                    >
                      <Tooltip
                        title={
                          item.licenseNumber.length > 38
                            ? item.licenseNumber
                            : ""
                        }
                        placement="top"
                        arrow
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "420px",
                          }}
                        >
                          {item.licenseNumber.length > 38
                            ? item.licenseNumber + "..."
                            : item.licenseNumber}
                        </div>
                      </Tooltip>
                      <Checkbox
                        checked={
                          selectedLicenseIds.indexOf(item.licenseId) > -1
                        }
                      />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              className="btn-submit"
              type="contained"
              intent="primary"
              onClick={onSubmit}
              onKeyPress={(e: any) =>
                e.key === "Enter" && props.openLicenseDialog === true
              }
              disabled={handleSubmitDisable()}
              text="Submit"
              height={40}
              width={100}
            />
          </DialogActions>
        </div>
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Changes saved successfully" />
      )}
    </>
  );
};

export default AssignLicenseDialogBox;
