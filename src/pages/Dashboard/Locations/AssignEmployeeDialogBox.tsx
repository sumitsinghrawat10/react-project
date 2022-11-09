import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import {
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  Backdrop,
  CircularProgress,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import Swal from "sweetalert2";
import AddTooltip from "../../../components/AddTooltip";
import SuccessToaster from "../../../components/SuccessToaster";
import SwalBox from "../../../components/SwalBox";
import {
  GET_ALLEMPLOYEES_ASSIGNED_BY_LOCATIONID,
  ADD_EMPLOYEE_LOCATION,
} from "../../../networking/httpEndPoints";

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface PopupState {
  openAssignEmployee: boolean;
  handleAssignEmployee: any;
  organizationLocationId: number;
  locationName: string;
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

const AssignEmployeeDialogBox: React.FC<PopupState> = (props: PopupState) => {
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<
    number[]
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Array<string>>([]);
  const [isEmployeeLabel, setIsEmployeeLabel] = React.useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [locationNameError, setLocationNameError] = useState(false);
  const [locationNameErrorText, setLocationNameErrorText] =
    useState("Error happened");
  useEffect(() => {
    if (props.openAssignEmployee) {
      resetFields();
      GetEmployee(props.organizationLocationId);
    }
  }, [props.openAssignEmployee]);

  const token = localStorage.getItem("user");

  const GetEmployee = (id: number) => {
    if (token != null) {
      setShowLoader(true);
      axios
        .get<GetResponse>(GET_ALLEMPLOYEES_ASSIGNED_BY_LOCATIONID + id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.status === 200 && res.data.isSuccess) {
            GetEmployeeResponse(res);
          }
        })
        .catch(() => setShowLoader(false));
    }
  };

  const GetEmployeeResponse = (res: any) => {
    const data = res.data.result;
    const emp: any = [];
    const check: any = [];
    data.forEach((element: any) => {
      if (element.isLocationAssigned) {
        emp.push(element);
        check.push(element.employeeId);
      }
    });
    setSelectedEmployeeIds(check);
    data.forEach((element: any) => {
      if (!element.isLocationAssigned) {
        emp.push(element);
      }
    });
    setEmployees(emp);
    SetSelectedEmployees(res);
  };

  const SetSelectedEmployees = (res: any) => {
    const data = res.data.result;
    let tempName = "";

    data.forEach((element: any) => {
      if (element.isLocationAssigned) {
        tempName += element.employeeName + ",";
      }
    });
    if (tempName !== "") {
      tempName = tempName.slice(0, tempName.length - 1);
      setSelectedEmployee(tempName.split(","));
    }
  };

  useEffect(() => {
    const empIds: string[] = [];
    selectedEmployeeIds.forEach(function (selectedEmpId) {
      employees.forEach(function (emp) {
        if (emp.employeeId === selectedEmpId) {
          empIds.push(emp.employeeName);
        }
      });
    });
    setSelectedEmployee(empIds);
  }, [selectedEmployeeIds]);

  const handleChangeEmpId = (Id: number) => {
    const employeeIdArray: any = [...selectedEmployeeIds];
    if (selectedEmployeeIds.includes(Id) === false) {
      employeeIdArray.push(Id);
      setSelectedEmployeeIds(employeeIdArray);
    } else if (selectedEmployeeIds.includes(Id) === true) {
      const index = employeeIdArray.indexOf(Id);
      employeeIdArray.splice(index, 1);
      setSelectedEmployeeIds(employeeIdArray);
    }
  };

  const handleChangeEmployee = (event: any) => {
    const {
      target: { value },
    } = event;

    setSelectedEmployee(typeof value === "string" ? value.split(",") : value);
    const flag = event.target.value.length > 0 ? true : false;
    setIsEmployeeLabel(flag);
    setLocationNameError(false);
  };

  const resetFields = () => {
    setIsEmployeeLabel(false);
    setSelectedEmployee(Array<string>());
    setEmployees([]);
    setSelectedEmployeeIds([]);
    setLocationNameError(false);
  };

  const onSubmit = () => {
    const params = {
      locationId: props.organizationLocationId,
      employeeId: selectedEmployeeIds,
    };
    if (token !== null) {
      setShowLoader(true);
      axios
        .post<GetResponse>(ADD_EMPLOYEE_LOCATION, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          OnsubmitPostResponse(res);
        })
        .catch(() => setShowLoader(false));
    }
  };

  const OnsubmitPostResponse = (res: any) => {
    setShowLoader(false);
    if (res.status === 201 && res.data.isSuccess) {
      props.handleAssignEmployee();
      if (res.data.result === true) {
        SwalBox(res.data.responseMessage, "info");
      } else if (
        res.data.result === null &&
        res.data.responseMessage.includes("other")
      ) {
        SwalBox(res.data.responseMessage, "info");
      } else {
        setConfirmationModalIsVisible(true);
        setTimeout(() => {
          setConfirmationModalIsVisible(false);
        }, 3000);
      }
    } else if (res.status === 201 && !res.data.isSuccess) {
      setLocationNameError(true);
      setLocationNameErrorText(res.data.responseMessage);
    } else {
      props.handleAssignEmployee();
      Swal.fire({
        text: "Something went wrong!",
        confirmButtonText: "OK",
        icon: "error",
      });
    }
  };

  return (
    <div>
      <Dialog
        className="dashboard-license-container"
        open={props.openAssignEmployee}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>

        <div className="CloseDialog">
          <button
            onClick={() => props.handleAssignEmployee()}
            className="btn-close btn-sm close-assign-license"
          >
            <div style={{ display: "none" }}>Close</div>
          </button>
        </div>

        <DialogTitle className="dialog-title mt-0">
          Assign an employee to this location
        </DialogTitle>
        <DialogContent>
          <span className="row ms-1 mb-2">
            <b>  <AddTooltip  value={props.locationName}  len={70}/> </b>
          </span>
          <div className="BottomLine-AssignLicense-DialogBox"></div>
          <span>
            <b> Who are you assigning to this location?</b>
          </span>
          <FormControl
            variant="standard"
            sx={{ width: 530 }}
            error={locationNameError}
          >
            <InputLabel hidden={isEmployeeLabel} id="user-label">
              Select one or more employees
            </InputLabel>
            <Select
              disableUnderline
              labelId="user-label"
              multiple
              value={selectedEmployee}
              onChange={handleChangeEmployee}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {employees.map((item, index) => (
                <MenuItem
                  key={index}
                  value={item.employeeName}
                  onClick={() => {
                    handleChangeEmpId(item.employeeId);
                  }}
                >
                  <ListItemText
                    primary={item.employeeName}
                    style={{
                      width: "280px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                      display: "-webkit-box",
                    }}
                  />
                  <Checkbox
                    checked={selectedEmployeeIds.indexOf(item.employeeId) > -1}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="BottomLine-AssignLicense-DialogBox"></div>
          {locationNameError === true ? (
            <FormHelperText className="ErrorText">
              {locationNameErrorText}
            </FormHelperText>
          ) : (
            ""
          )}
        </DialogContent>
        <DialogActions>
          <Button
            intent="primary"
            className="btn-submit-license"
            type="contained"
            text="Submit"
            onClick={onSubmit}
          />
        </DialogActions>
      </Dialog>
      {confirmationModalIsVisible && <SuccessToaster message="Changes Saved" />}
    </div>
  );
};

export default AssignEmployeeDialogBox;
