import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  FormControl,
  Select,
  MenuItem,
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
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import Swal from "sweetalert2";
import SuccessToaster from "../../../components/SuccessToaster";

import { GetEmployee } from "../../../components/Employee/EmployeeImportMethods";
import SwalBox from "../../../components/SwalBox";
import {
  GET_ENPLOYEES_LOCATION,
  ADD_ASSIGN_LOCATION_TO_EMPLOYEE,
} from "../../../networking/httpEndPoints";

const errorText = { color: "#d32f2f", marginLeft: "8px" };
interface PopupState {
  openAssignLocation: boolean;
  handleAssignLocation: any;
  getLocationData: any;
}
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const ITEM_HEIGHT = 60;
const ITEM_PADDING_TOP = 2;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 3 + ITEM_PADDING_TOP,
      maxWidth: 300,
    },
  },
};
const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};
const AssignLocationDialogBox: React.FC<PopupState> = (props: PopupState) => {
  const token = localStorage.getItem("user");
  const [showLoader, setShowLoader] = useState(false);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [locationAssignedIsDisabled, setLocationAssignedIsDisabled] = useState(true);

  useEffect(() => {
    if (props.openAssignLocation) {
      resetFields();
      GetEmployee({ setEmployees });
      setLocationAssignedIsDisabled(true);
    }
  }, [props.openAssignLocation]);

  const [isEmployeeLabel, setIsEmployeeLabel] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Array<string>>([]);
  const [employees, setEmployees] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);

  const handleChangeEmployee = (event: any) => {
    setSelectedEmployee(event.target.value);
    setIsEmployeeLabel(true);
    GetEmployeesLocation(event.target.value);
    setLocationNameError(false);
  };

  const [isLocationLabel, setIsLocationLabel] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Array<string>>([]);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [finalCheckedLocationIds, setFinalCheckedLocationIds] = React.useState<
    number[]
  >([]);
  const [initialCheckedLocIds, setInitialCheckedLocIds] = React.useState<
    number[]
  >([]);
  const [locationNameError, setLocationNameError] = useState(false);
  const [locationNameErrorText, setLocationNameErrorText] =
    useState("Error happened");
  const handleChangeLocation = (event: any) => {
    const {
      target: { value },
    } = event;

    setSelectedLocation(typeof value === "string" ? value.split(",") : value);
    const flag = event.target.value.length > 0 ? true : false;
    setIsLocationLabel(flag);
  };

  const resetFields = () => {
    setIsEmployeeLabel(false);
    setSelectedEmployee(Array<string>());
    setEmployees([]);

    setIsLocationLabel(false);
    setSelectedLocation(Array<string>());
    setLocations([]);
    setFinalCheckedLocationIds([]);
    setLocationNameError(false);
    handleDisable();
  };

  const handleDisable = () => {
    const condition1 = employees.length >= 0;
    const condition2 = isEqual(finalCheckedLocationIds, initialCheckedLocIds);
    return condition1 && condition2;
  };

  const isEqual = (array1: number[], array2: number[]) => {
    if (array1.length === array2.length) {
      return array1.every((element, index) => {
        if (element === array2[index]) {
          return true;
        }
        return false;
      });
    }
    return false;
  };

  const onSubmit = () => {
    const params = {
      employeeId: selectedEmployee,
      locationIds: finalCheckedLocationIds,
    };

    if (token !== null) {
      setShowLoader(true);
      axios
        .post<GetResponse>(ADD_ASSIGN_LOCATION_TO_EMPLOYEE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);

          HandleOnSubmitResponse(res);
        })
        .catch(() => setShowLoader(false));
    }
  };

  const HandleOnSubmitResponse = (res: any) => {
    if (res.status === 201 && res.data.isSuccess) {
      props.handleAssignLocation();
      if (res.data.result === true) {
        SwalBox(res.data.responseMessage, "info");
      } else {
        setConfirmationModalIsVisible(true);
        props.getLocationData();
        setTimeout(() => {
          setConfirmationModalIsVisible(false);
        }, 3000);
      }
    } else if (res.status === 201 && !res.data.isSuccess) {
      setLocationNameError(true);
      setLocationNameErrorText(res.data.responseMessage);
    } else {
      props.handleAssignLocation();
      Swal.fire({
        text: "Error occurred while submitting changes!",
        confirmButtonText: "OK",
        icon: "error",
      });
    }
  };

  const GetEmployeesLocation = (id: number) => {
    if (token != null) {
      setShowLoader(true);
      axios
        .get<GetResponse>(GET_ENPLOYEES_LOCATION + id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.status === 200 && res.data.isSuccess) {
            const data = res.data.result;
            HandleLocationDetail(res);

            let tempName = "";

            data.forEach((element: any) => {
              if (element.isLocationAssigned) {
                tempName += element.locationNickName + ",";
              }
            });
            if (tempName !== "") {
              tempName = tempName.slice(0, tempName.length - 1);
              setSelectedLocation(tempName.split(","));
            }
            setLocationAssignedIsDisabled(false);
          }
        })
        .catch(() => setShowLoader(false));
    }
  };

  const HandleLocationDetail = (res: any) => {
    const data = res.data.result;
    const check: any = [];
    const loc: any = [];
    data.forEach((element: any) => {
      if (element.isLocationAssigned) {
        loc.push(element);
        check.push(element.locationId);
      }
    });
    setFinalCheckedLocationIds(check);
    setInitialCheckedLocIds(check);
    data.forEach((element: any) => {
      if (!element.isLocationAssigned) {
        loc.push(element);
      }
    });
    setLocations(loc);
  };

  useEffect(() => {
    const locIds: string[] = [];
    finalCheckedLocationIds.forEach(function (selectedLocId) {
      locations.forEach(function (loc) {
        if (loc.locationId === selectedLocId) {
          locIds.push(loc.locationNickName);
        }
      });
    });
    setSelectedLocation(locIds);
  }, [finalCheckedLocationIds]);

  const changeLocationId = (Id: number) => {
    setLocationNameError(false);
    const locationIdArray: any = [...finalCheckedLocationIds];
    if (finalCheckedLocationIds.includes(Id) === false) {
      locationIdArray.push(Id);
      setFinalCheckedLocationIds(locationIdArray);
    } else if (finalCheckedLocationIds.includes(Id) === true) {
      const index = locationIdArray.indexOf(Id);
      locationIdArray.splice(index, 1);
      setFinalCheckedLocationIds(locationIdArray);
    }
  };

  return (
    <>
      <Dialog
        className="AssignLocationDialog form-container dashboard-license-container"
        open={props.openAssignLocation}
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
            onClick={() => props.handleAssignLocation()}
            className="btn-close btn-sm close-assign-license float-right"
          ></button>
        </div>
        <DialogTitle className="dialog-title mt-0">
          Add employee to a location
        </DialogTitle>
        <DialogContent>
        <p  className="fw-bold ps-2 mb-0 mt-3">
        Who are you assigning to?
        </p>
          <FormControl variant="standard" sx={{ m: 1, width: 520 }}>
            <InputLabel hidden={isEmployeeLabel} id="employee-label">
              Select an employee
            </InputLabel>
            <Select
            className='select-drop'
            IconComponent={CustomExpandMore}
              disableUnderline
              labelId="employee-label"
              value={selectedEmployee}
              onChange={handleChangeEmployee}
              MenuProps={MenuProps}
            >
              {employees.map((item) => (
                <MenuItem
                  key={`${item.name}-${item.employeeId}`}
                  value={item.employeeId}
                >
                  <Tooltip
                    title={item.name.length > 52 ? item.name : ""}
                    placement="top"
                    arrow
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "456px",
                      }}
                    >
                      {item.name.length > 52 ? item.name + "..." : item.name}
                    </div>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
            <div className="BottomLine-AssignLicense-DialogBox"></div>
          </FormControl>

          <p  className="fw-bold ps-2 mb-0">
          Select the location you would like to assign?
          </p>
          <FormControl
            variant="standard"
            error={locationNameError}
            sx={{ m: 1, width: 520 }}
          >
            <InputLabel hidden={isLocationLabel} id="location-label">
              Select one or more locations
            </InputLabel>
            <Select
            IconComponent={CustomExpandMore}
            className='select-drop'
              labelId="location-label"
              multiple
              value={selectedLocation}
              onChange={handleChangeLocation}
              disabled={locationAssignedIsDisabled}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {locations.map((item: any) => (
                <MenuItem
                  key={item.locationId}
                  value={item.locationNickName}
                  onClick={() => changeLocationId(item.locationId)}
                >
                  <Tooltip
                    title={
                      item.locationNickName.length > 52
                        ? item.locationNickName
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
                      {item.locationNickName.length > 52
                        ? item.locationNickName + "..."
                        : item.locationNickName}
                    </div>
                  </Tooltip>
                  <Checkbox
                    checked={
                      finalCheckedLocationIds.indexOf(item.locationId) > -1
                    }
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {locationNameError === true ? (
            <FormHelperText sx={errorText}>
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
            disabled={handleDisable()}
          />
        </DialogActions>
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Changes saved successfully" />
      )}
    </>
  );
};

export default AssignLocationDialogBox;
