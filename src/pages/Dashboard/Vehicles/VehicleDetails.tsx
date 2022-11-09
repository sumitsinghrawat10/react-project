import React, { useEffect, useState, useCallback, useRef } from "react";

import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import BellIcon from "../../../components/Icons/BellIcon";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import SwalBox from "../../../components/SwalBox";
import {
  GET_VEHICLE_DETAILS,
  CHANGE_VEHICLE_IMAGE,
  DELETE_VEHICLE_IMAGE,
} from "../../../networking/httpEndPoints";
import { roleValidator } from "../../../utilities/roleValidator";
import { VehicleDefaultImage } from "../../../utilities/VehicleDefaultImage";
import AddVehicleImage from "./AddVehicleImage";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  Active,
} from "../../../utilities/constants";
import AddVehicleForm from "./AddVehicleForm";
import SuccessToaster from "../../../components/SuccessToaster";
import historyVaribaleChecker from "../../../utilities/historyVariableChecker";
import BackButton from '../../../components/Icons/BackButtonIcon';

interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface AuthRoleType {
  user: {
    role?: string;
  };
}

interface AuthRoleType {
  user: {
    role?: string;
  };
}

const VehicleDetails = () => {
  const history = useHistory();
  const vehicleId = historyVaribaleChecker("vehicleId", history);
  const [vehicleData, setVehicleData] = useState<any>([]);
  const [vehicleImage, setVehicleImage] = useState(VehicleDefaultImage);
  const [vehicleImageName, setVehicleImageName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const inputFileRef = useRef<any | null>(null);
  const token = localStorage.getItem("user");

  const [openVehicleDailog, setOpenVehicleDailog] = useState(false);
  const userState = useSelector((state: AuthRoleType) => state.user);

  const [editConfirmationModalIsVisible, setEditConfirmationModalIsVisible] =
    useState(false);

  const getVehicleAxiosCall = useCallback(
    (getImageOnly: boolean) => {
      axios
        .get<DataResponse>(`${GET_VEHICLE_DETAILS}${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((response: any) => {
          setLoading(false);
          if (
            response.status === 200 &&
            response.data.isSuccess === true &&
            response.data.result.length !== 0
          ) {
            setVehicleImageName(response.data.result.vehicleImageName);
            setVehicleImage(
              response.data.result.vehicleImage || VehicleDefaultImage
            );

            if (!getImageOnly) {
              setVehicleData(response.data.result);
            } else {
              setOpen(false);
              setButtonLoader(false);
              inputFileRef.current.value = null;
            }
          } else {
            SwalBox(response.data.responseMessage, "error");
          }
        })
        .catch(() => {
          SwalBox("Error occurred while fetching details", "error");
          setLoading(false);
        });
    },
    [token, vehicleId]
  );

  const getVehicleDetails = useCallback(() => {
    setLoading(true);
    getVehicleAxiosCall(false);
  }, [getVehicleAxiosCall]);

  const getVehicleImage = useCallback(() => {
    getVehicleAxiosCall(true);
  }, [getVehicleAxiosCall]);

  const addTooltip = (value: any, len: number, cls?: string) => {
    if (value.trim().length >= len) {
      return (
        <Tooltip title={value} placement="top-start">
          <div className={cls || "col-sm-6 TitleDetails"}>
            {`${value.trim()}`.slice(0, len) + "..."}
          </div>
        </Tooltip>
      );
    } else {
      return (
        <div
          className={cls || "col-sm-6 TitleDetails"}
        >{`${value.trim()}`}</div>
      );
    }
  };

  const handleVehicleImage = () => {
    setOpen(true);
  };

  const changeVehicleImage = () => {
    const form = new FormData();
    form.append("VehicleId", vehicleId);
    form.append("VehicleImage", inputFileRef.current.files[0]);

    axios
      .put<DataResponse>(CHANGE_VEHICLE_IMAGE, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((resp) => {
        setLoading(false);
        if (
          resp.status === 200 &&
          resp.data.isSuccess === true &&
          resp.data.result.length !== 0
        ) {
          getVehicleImage();
        } else {
          SwalBox(resp.data.responseMessage, "error");
        }
      })
      .catch(() => {
        SwalBox("Error occurred while fetching details", "error");
      });
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure you want to delete this vehicle's picture?",
      confirmButtonColor: "#233ce6",
      confirmButtonText: "Delete",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete<DataResponse>(
            `${DELETE_VEHICLE_IMAGE}?vehicleId=${vehicleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          )
          .then((res) => {
            if (res.status === 200 && res.data.isSuccess) {
              setVehicleImageName("");
              setVehicleImage(VehicleDefaultImage);
            } else {
              SwalBox(res.data.responseMessage, "error");
            }
          })
          .catch(() => {
            SwalBox("Error occurred while deleting image", "error");
          });
      }
    });
  };

  useEffect(() => {
    getVehicleDetails();
  }, [getVehicleDetails]);

  const handleEditVehicle = () => {
    setOpenVehicleDailog(true);
  };

  const checkRole = () => {
    return (
      roleValidator(userState["role"]) === SystemAdministrator ||
      roleValidator(userState["role"]) === DirectorOfCompliance ||
      roleValidator(userState["role"]) === ComplianceAnalyst
    );
  };

  const getBase64 = () => {
    let base64 = "data:image/png;base64,";
    const ExtensionName = vehicleImageName?.split(".")?.pop()?.toLowerCase();
    if (ExtensionName === "svg") {
      base64 = "data:image/svg+xml;base64,";
    }
    return `${base64}${vehicleImage}`;
  };

  return (
    <div>
      <div className="container vehicle-details-container">
        {loading && (
          <div className="LoaderWrapper">
            <CircularProgress />
          </div>
        )}
        {vehicleData && vehicleData.length !== 0 && !loading && (
          <>
            <div className="d-flex justify-content-between">
          <div className="page-title">
            <div className="flex-container">
              <BackButton onClick={() => history.push("/vehicles")} />
              Vehicle Details
            </div>
          </div>
          {checkRole() && (
            <div
              className="ms-auto pt-4 LinkWrapper"
              onClick={handleEditVehicle}
            >
              Edit Vehicle
            </div>
          )}
          <div className="ms-4 pt-4 LinkWrapper hide-link">Archive Vehicle</div>
          <div className="ms-4">
            <BellIcon />
          </div>
          </div>
            <div className="row py-5">
              <div className="col-sm-6 pe-3">
                <div className="row">
                  <div className="col-sm-12 ps-0 pb-3">
                    <i className="bi bi-person IconWrap" />
                    <div className="NameTitle">Driver details</div>
                  </div>
                  <div className="DriverDetailBox ps-4 py-4 mb-4">
                    <div className="TitleWrapper">Name:</div>
                    {addTooltip(
                      `${vehicleData.firstName} ${vehicleData.lastName}`,
                      25,
                      "TitleValue"
                    )}
                    <div className="TitleWrapper pt-4">Driver's location</div>
                    {addTooltip(vehicleData.location, 25, "TitleValue")}
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12 ps-0 pb-4">
                    <i className="bi bi-speedometer IconWrap" />
                    {addTooltip(
                      `${vehicleData.year.trim()} ${vehicleData.make.trim()} ${vehicleData.model.trim()}`,
                      35,
                      "NameTitle"
                    )}
                  </div>
                  <div className="VehicleDetailBox p-4">
                    <div className="row pb-3">
                      <div className="col-sm-6 TitleWrapper">VIN:</div>
                      {addTooltip(vehicleData.vin, 25)}
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-6 TitleWrapper">
                        License Plate:
                      </div>
                      {addTooltip(vehicleData.licensePlate, 25)}
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-6 TitleWrapper">Color:</div>
                      {addTooltip(vehicleData.color, 25)}
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-5 TitleWrapper">
                        Registration Expiration:
                      </div>
                      <div className="col-sm-1 gx-0 text-sm-end">
                        {roleValidator(
                          vehicleData.vehicleRegistrationStatus
                        ) !== Active && (
                            <Tooltip
                              title={`Registration ${vehicleData.vehicleRegistrationStatus.toLowerCase()}`}
                              placement="bottom"
                              arrow
                            >
                              <WarningAmberIcon className="WarningIconWrap pb-1" />
                            </Tooltip>
                          )}
                      </div>
                      <div className="col-sm-6 TitleDetails">
                        {moment(vehicleData.registrationExpirationDate).format(
                          "MM/DD/YYYY"
                        )}
                      </div>
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-6 TitleWrapper">
                        Insurance Company:
                      </div>
                      {addTooltip(vehicleData.insuranceName, 25)}
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-5 TitleWrapper">
                        Insurance Expiration:
                      </div>
                      <div className="col-sm-1 gx-0 text-sm-end">
                        {roleValidator(vehicleData.vehicleInsuranceStatus) !==
                          Active && (
                            <Tooltip
                              title={`Insurance ${vehicleData.vehicleInsuranceStatus.toLowerCase()}`}
                              placement="bottom"
                              arrow
                            >
                              <WarningAmberIcon className="WarningIconWrap pb-1" />
                            </Tooltip>
                          )}
                      </div>
                      <div className="col-sm-6 TitleDetails">
                        {moment(vehicleData.insuranceExpirationDate).format(
                          "MM/DD/YYYY"
                        )}
                      </div>
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-6 TitleWrapper">Alarm System:</div>
                      <div className="col-sm-6 TitleDetails">
                        {vehicleData.hasAlarm}
                      </div>
                    </div>
                    <div className="row pb-3">
                      <div className="col-sm-6 TitleWrapper">
                        Assigned location:
                      </div>
                      {addTooltip(vehicleData.location, 25)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="ImageBox col-sm-6 pt-5">
                <img
                  src={getBase64()}
                  alt="Profile"
                  width="100%"
                  height="100%"
                />
                {checkRole() && (
                  <div className="dropdown">
                    <button
                      type="button"
                      className="EditImageBtn"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <MoreVertOutlinedIcon className="ThreeDotIcon" />
                    </button>
                    <ul
                      className="dropdown-menu dd-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      <li>
                        <button
                          className="dropdown-item MenuButton"
                          onClick={handleVehicleImage}
                        >
                          {VehicleDefaultImage === vehicleImage
                            ? "Upload"
                            : "Change"}
                        </button>
                        <AddVehicleImage
                          setOpen={setOpen}
                          open={open}
                          setInputFileRef={inputFileRef}
                          isSubmit={true}
                          changeVehicleImage={changeVehicleImage}
                          buttonLoader={buttonLoader}
                          setButtonLoader={setButtonLoader}
                        />
                      </li>
                      <li>
                        <button
                          className="dropdown-item MenuButton"
                          onClick={handleDelete}
                          disabled={
                            VehicleDefaultImage === vehicleImage ? true : false
                          }
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <AddVehicleForm
              vehicleId={vehicleId}
              handleYes={() => {
                setOpenVehicleDailog(false);
              }}
              open={openVehicleDailog}
              setConfirmationModalIsVisible={false}
              vehicleData={vehicleData}
              isEdit={true}
              setEditConfirmationModalIsVisible={
                setEditConfirmationModalIsVisible
              }
              getVehicleDetails={getVehicleDetails}
            />
          </>
        )}
        {editConfirmationModalIsVisible && (
          <SuccessToaster message="Changes saved successfully" />
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;
