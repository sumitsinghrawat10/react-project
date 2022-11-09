import React, { useEffect, useState } from "react";

import {
  MenuItem,
  Select,
  Checkbox,
  Backdrop,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import Swal from "sweetalert2";
import Button from '../../../components/Button';
import SuccessToaster from "../../../components/SuccessToaster";
import SwalBox from "../../../components/SwalBox";
import {
  GET_ENPLOYEES_LOCATION,
  ADD_ASSIGN_LOCATION_TO_EMPLOYEE,
} from "../../../networking/httpEndPoints";

const errorText = { color: "#d32f2f" };
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface PopupState {
  openAssignLocation: boolean;
  handleAssignLocation: any;
  employeeName: string;
  employeeId: number;
  userId: number;
  setReloadLocationData: any;
  reloadLocationData: boolean;
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

const AssignLocation: React.FC<PopupState> = (props: PopupState) => {
  const token = localStorage.getItem("user");
  const [showLoader, setShowLoader] = useState(false);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [initialCheckedLocIds, setInitialCheckedLocIds] = React.useState<
    number[]
  >([]);
  const [selectedLocationIds, setSelectedLocationIds] = React.useState<
    number[]
  >([]);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Array<string>>([]);
  const [isLocationLabel, setIsLocationLabel] = React.useState(false);
  const [locationNameError, setLocationNameError] = useState(false);
  const [locationNameErrorText, setLocationNameErrorText] =
    useState("Error happened");
  useEffect(() => {
    if (props.openAssignLocation) {
      resetFields();
      GetLocation(props.employeeId);
    }
  }, [props.openAssignLocation]);

  useEffect(() => {
    const locIds: string[] = [];
    selectedLocationIds.forEach(function (selectedLocId) {
      locations.forEach(function (loc) {
        if (loc.locationId === selectedLocId) {
          locIds.push(loc.locationNickName);
        }
      });
    });
    setSelectedLocation(locIds);
  }, [selectedLocationIds]);

  const GetLocation = (empId: number) => {
    if (token != null) {
      setShowLoader(true);
      axios
        .get<GetResponse>(GET_ENPLOYEES_LOCATION + empId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res: any) => {
          setShowLoader(false);
          parseLocationResponse(res);
        })
        .catch(() => {
          Swal.close();
          setShowLoader(false);
        });
    }
  };

  const parseLocationResponse = (res: any) => {
    Swal.close();
    if (res.status === 200 && res.data.responseMessage === "Success") {
      const data = res.data.result;
      setLocations(data);
      assignLocationId(data);
      assignLocationName(data);
    }
  };

  const assignLocationId = (data: any) => {
    const assignedLocationIds: any = [];
    data.forEach((element: any) => {
      if (element.isLocationAssigned) {
        assignedLocationIds.push(element.locationId);
      }
    });
    if (assignedLocationIds.length > 0) setIsLocationLabel(true);
    setInitialCheckedLocIds(assignedLocationIds);
    setSelectedLocationIds(assignedLocationIds);
  };

  const assignLocationName = (data: any) => {
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
  };

  const handleChangeLocation = (event: any) => {
    const {
      target: { value },
    } = event;

    setSelectedLocation(typeof value === "string" ? value.split(",") : value);
    const flag = event.target.value.length > 0 ? true : false;
    setIsLocationLabel(flag);
  };

  const handleChangeLocationId = (Id: number) => {
    const locationIdArray: any = [...selectedLocationIds];
    if (selectedLocationIds.includes(Id) === false) {
      locationIdArray.push(Id);
      setSelectedLocationIds(locationIdArray);
    } else if (selectedLocationIds.includes(Id) === true) {
      const index = locationIdArray.indexOf(Id);
      locationIdArray.splice(index, 1);
      setSelectedLocationIds(locationIdArray);
    }
  };

  const handleDisable = () => {
    return isEqual(selectedLocationIds, initialCheckedLocIds);
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

  const resetFields = () => {
    setIsLocationLabel(false);
    setSelectedLocation(Array<string>());
    setLocations([]);
    setInitialCheckedLocIds([]);
    setSelectedLocationIds([]);
    setLocationNameError(false);
  };

  const onSubmit = () => {
    const getPostParameters = validateSubmit();
    if (getPostParameters) {
      axios
        .post<GetResponse>(ADD_ASSIGN_LOCATION_TO_EMPLOYEE, getPostParameters, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => handlePostResponse(res))
        .catch(() => setShowLoader(false));
    }
  };

  const validateSubmit: any = () => {
    if (token == null) return false;
    setShowLoader(true);
    return {
      employeeId: props.employeeId,
      locationIds: selectedLocationIds,
    };
  };

  const handlePostResponse = (res: any) => {
    setShowLoader(false);

    if (res.status === 201 && res.data.isSuccess) {
      props.handleAssignLocation();
      if (res.data.result === true) {
        SwalBox(res.data.responseMessage, "info");
      } else {
        props.setReloadLocationData(!props.reloadLocationData);
        setConfirmationModalIsVisible(true);
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

  return (
    <>
      <Dialog
        open={props.openAssignLocation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="employee-dashboard-container form-container"
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
              className="btn-close btn-sm btn-close-popup"
            >
              {" "}
            </button>
          </div>
          <DialogTitle className="dialog-title">
            <b>{"Add employee to a location"}</b>
          </DialogTitle>

          <DialogContent className="dialog-content-location">
            <div className="row ms-1 mb-2 employeeNameLocationWrapper">
              <b>
                {"Employee: "} {props.employeeName}
              </b>
              <div className="bottomLine-location"></div>
            </div>

            <span className="licenseWrapper">
              Select the location you would like to assign?
            </span>
            <FormControl
              variant="standard"
              error={locationNameError}
              sx={{ width: 530 }}
            >
              <InputLabel hidden={isLocationLabel} id="user-label" className="locationInputLabel">
                Select one or more location
              </InputLabel>
              <Select variant="filled"
                className="licenseSelect"
                disableUnderline
                labelId="user-label"
                multiple
                value={selectedLocation}
                onChange={handleChangeLocation}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {locations.map((item, index) => (
                  <MenuItem
                    key={index}
                    value={item.locationNickName}
                    onClick={() => {
                      handleChangeLocationId(item.locationId);
                      setLocationNameError(false);
                    }}
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
                        selectedLocationIds.indexOf(item.locationId) > -1
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
              className="btn-submit"
              type="contained"
              intent="primary"
              onClick={onSubmit}
              onKeyPress={(e: any) =>
                e.key === "Enter" && props.openAssignLocation === true
              }
              disabled={handleDisable()}
              text="Submit"
              height={40}
              width={100}
            />
          </DialogActions>
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Changes saved successfully" />
      )}
    </>
  );
};

export default AssignLocation;
