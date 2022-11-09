import React, { useRef, useEffect, useState, useCallback } from "react";

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BellIcon from "../../../components/Icons/BellIcon";
import Button from "../../../components/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import BackButton from '../../../components/Icons/BackButtonIcon';

import { GET_LOCATION_DETAILS } from "../../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
} from "../../../utilities/constants";
import { roleValidator } from "../../../utilities/roleValidator";
import LicenseForm from "../../DashboardLicense/licenseForm";
import AssignEmployeeDialogBox from "./AssignEmployeeDialogBox";
import LocationForm from "./LocationForm";
import AddTooltip from "../../../components/AddTooltip";

interface LocationDetailsResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

type RowType = {
  licenseId: number;
  licenseLevel: string;
  licenseNumber: string;
  licenseStatus: string;
  location: string;
  self_Audit_Status: string;
};

interface AuthRoleType {
  user: {
    role?: string;
    organizationId?: number | null;
  };
}

function ViewLocationDetails() {
  const history = useHistory();
  const organizationLocationId = history.location.state
    ? history.location.state.organizationLocationId
    : null;

  const [data, setData] = useState<any | null>(null);
  const scrollRef = useHorizontalScroll(data);
  const userState = useSelector((state: AuthRoleType) => state.user);
  const [open, setOpen] = React.useState(false);
  const [updateLocation, setUpdateLocation] = useState<boolean>(false);
  const [openLicenseDailog, setOpenLicenseDailog] = React.useState(false);
  const handleEditLocation = () => {
    setOpen(true);
  };
  const [openAssignEmployee, setOpenAssignEmployee] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const getLocationDetails = useCallback(() => {
    const token = localStorage.getItem("user");
    axios
      .get<LocationDetailsResponse>(
        `${GET_LOCATION_DETAILS}${organizationLocationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          setData(res.data.result[0]);
        } else if (res.status === 200 && res.data.isSuccess === false) {
          setData(null);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      });
  }, [organizationLocationId]);

  useEffect(() => {
    getLocationDetails();
  }, [getLocationDetails, updateLocation]);

  const handleAddLicense = () => {
    setOpenLicenseDailog(true);
  };

  const handleAssignEmployee = () => {
    setOpenAssignEmployee(false);
    getLocationDetails();
  };

  const [licenseFormFields, setLicenseFormFields] = React.useState<any | null>({
    licenseTypeId: "",
    licenseUsageId: [],
    licenseLevelId: "",
    licenseNumber: "",
    issueDate: null,
    expirationDate: null,
    issuingAuthority: "",
    organizationId: userState["organizationId"],
    organizationLocationId: organizationLocationId,
    status: "active",
    createdBy: 1,
    licenseUsageError: false,
    licenseNumberError: false,
    licenseIssueDateError: false,
    licenseExpirationDateError: false,
    issuingAuthorityError: false,
    licenseTypeError: false,
    licenseLevelError: false,
    locationError: false,
    issueDateIsBlank: true,
    expirationDateIsBlank: true,
  });

  const handleLicenseCancel = () => {
    setOpenLicenseDailog(false);
    setLicenseFormFields({
      ...licenseFormFields,
      issueDate: new Date(),
      expirationDate: new Date(),
    });
     setTimeout(() => {
      setLicenseFormFields({
        licenseTypeId: "",
        licenseUsageId: [],
        licenseLevelId: "",
        licenseNumber: "",
        issueDate: null,
        expirationDate: null,
        issuingAuthority: "",
        organizationId: userState["organizationId"],
        organizationLocationId: organizationLocationId,
        licenseUsageError: false,
        licenseNumberError: false,
        licenseIssueDateError: false,
        licenseExpirationDateError: false,
        issuingAuthorityError: false,
        licenseTypeError: false,
        licenseLevelError: false,
        locationError: false,
        issueDateIsBlank: true,
        expirationDateIsBlank: true,
      });
    }, 0);
  };

  const AsssignEmployeeRender=(): JSX.Element =>{
    if (roleValidator(userState['role']) === SystemAdministrator ||
    roleValidator(userState['role']) === DirectorOfCompliance)
    {
      return (
        <div className="ms-5 pt-2">
                <div
                  className="AssignEmployee"
                  onClick={() => setOpenAssignEmployee(true)}
                >
                  Assign Employee
                </div>
              </div>
      );
    }else {
      return (<></>);
  }
  };
  return (
    <div className="container form-container location-container">
      {!data && (
        <>
          <div className="LoaderWrapper">
            <CircularProgress />
          </div>
        </>
      )}
      {data && (
        <>
          <Dialog
            open={openLicenseDailog}
            keepMounted
            className="p-4 location-container"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              sx: {
                maxHeight: 800,
                maxWidth: 600,
              },
            }}
          >
            <div className="CloseDialog">
              <button
                onClick={handleLicenseCancel}
                className="btn-close btn-sm close-assign-license"
              ></button>
            </div>
            <DialogContent className="DialogContentWrapper">
              <DialogContentText className="DialogTitle ">
                Add a license to this location
              </DialogContentText>
              <LicenseForm
                licenseFormFields={licenseFormFields}
                setLicenseFormFields={setLicenseFormFields}
                setOpen={setOpenLicenseDailog}
                open={openLicenseDailog}
                handleCancel={handleLicenseCancel}
                organizationLocationId={organizationLocationId}
                addSpecificLocationLicense={true}
                locationName={data["locationNickName"]}
                updateLocation={updateLocation}
                setUpdateLocation={setUpdateLocation}
                disabled={disabled}
                setDisabled={setDisabled}
              />
            </DialogContent>
          </Dialog>

          <LocationForm
            setOpen={setOpen}
            open={open}
            organizationLocationId={organizationLocationId}
            updateLocation={updateLocation}
            setUpdateLocation={setUpdateLocation}
            disabled={disabled}
            setDisabled={setDisabled}
          />

          <div className="d-flex HeadWrap-loc">
            {String(data["locationNickName"]).length > 30 && (
              <div className="page-title TitleWrapWithTooltip">
                <div className="flex-container">
                  <BackButton onClick={() => history.push("/locations")}/>
                  <Tooltip title={data["locationNickName"]} placement="top" arrow>
                  <div className="long-license-div">
                  Location: {data["locationNickName"]}
                  </div>
              </Tooltip>
              </div>
              </div>
            )}
            {String(data["locationNickName"]).length <= 30 && (
              <div className="page-title">
                <div className="flex-container">
                  <BackButton onClick={() => history.push("/locations")}/>
                    Location: {data["locationNickName"]}
              </div>
              </div>
            )}
            <div className="ms-3 pt-4">{AsssignEmployeeRender()}</div>
            <div className="ms-3 pt-2">
              <BellIcon />
            </div>
          </div>
          <div className="mt-4">
            <div className="d-flex mb-4">
            <div className="me-auto d-flex">
                <i className="bi bi-geo-alt icon-size"></i>
                <span className="UnderReviewWrapper">
                  Location details
                </span>
              </div>
              {(roleValidator(userState["role"]) === SystemAdministrator ||
                roleValidator(userState["role"]) === DirectorOfCompliance) && (
                <Button
                  intent="primary"
                  className="EditLocationButton"
                  type="contained"
                  text="Edit Location"
                  onClick={handleEditLocation}
                />
              )}
            </div>
            <div className="row LocationDetailsWrapper">
              <div className="col-sm-2">
                <p className="TopTitle">Location Name</p>
                <AddTooltip value={data["locationNickName"]} len={15} />
              </div>
              <div className="col-sm-2">
                <p className="TopTitle">Legal Entity Name</p>
                <AddTooltip value={data["legalEntityName"]} len={15} />
              </div>
              <div className="col-sm-2 AddressRowWrapper">
                <p className="TopTitle">Address</p>
                <AddTooltip value={data["address"]} len={12} />
              </div>
              <div className="col-sm-2">
                <p className="TopTitle">City</p>
                <Tooltip
                  title={data["city"].length > 30 ? data["city"] : ""}
                  placement="top"
                  arrow
                >
                  <p className="RowBox">
                    {data["city"].length > 30
                      ? data["city"] + "..."
                      : data["city"]}
                  </p>
                </Tooltip>
              </div>
              <div className="col-sm-2">
                <p className="TopTitle">State</p>
                <Tooltip
                  title={data["state"].length > 30 ? data["state"] : ""}
                  placement="top"
                  arrow
                >
                  <p className="RowBox">
                    {data["state"].length > 30
                      ? data["state"] + "..."
                      : data["state"]}
                  </p>
                </Tooltip>
              </div>
              <div className="col-sm-2">
              <p className="TopTitle tablet-emp-number">N. of Employees</p>
              <p className="TopTitle desktop-emp-number">Number of Employees</p>
                <Tooltip
                  title={
                    data["numberOfEmployees"].toString().length > 30
                      ? data["numberOfEmployees"]
                      : ""
                  }
                  placement="top"
                  arrow
                >
                  <p className="RowBox">{data["numberOfEmployees"]}</p>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="mt-4 mb-5">
          <div className="mb-4 UnderReviewWrapper">
              <i className="bi bi-card-text" ></i>
              <span className="ms-2">Licenses assigned</span>
            </div>

            <div className="position-relative">
              <div className="d-flex p-5 AllLicenseContainer" ref={scrollRef}>
                {data["licenseAssigned"] === null && (
                  <h4 className="NoLicenseText">No License Assigned</h4>
                )}
                {data["licenseAssigned"] !== null &&
                  data["licenseAssigned"].map((row: RowType) => (
                    <div className="me-5" key={row.licenseId}>
                      <TableContainer
                        component={Paper}
                        style={{ maxWidth: "480px" }}
                      >
                        <Table sx={{ width: 480 }} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell className="AllLicenseTableHeaderWrapper">
                                {" "}
                                <i className="bi bi-card-text p-2"></i>
                                License Number:
                              </TableCell>
                              {String(row.licenseNumber).length > 30 && (
                                <Tooltip
                                  title={row.licenseNumber}
                                  placement="top"
                                  arrow
                                >
                                  <TableCell className="AllLicenseTableHeaderWrapperWithTooltip">
                                    {String(row.licenseNumber).length > 30
                                      ? String(row.licenseNumber) + "..."
                                      : String(row.licenseNumber)}
                                  </TableCell>
                                </Tooltip>
                              )}
                              {String(row.licenseNumber).length <= 30 && (
                                <TableCell className="AllLicenseTableHeaderWrapperWithTooltip">
                                  {row.licenseNumber}
                                </TableCell>
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell className="TableRowsWrapperBold">
                              <i className="p-2"><DotIcon  /></i> Self Audit Status
                              </TableCell>
                              <TableCell className="TableRowsWrapper">
                                {row.self_Audit_Status}
                              </TableCell>
                            </TableRow>
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell className="TableRowsWrapperBold">
                              <i className="p-2"><DotIcon  /></i>
                                Location
                              </TableCell>
                              {String(row.location).length > 30 && (
                                <Tooltip
                                  title={row.location}
                                  placement="top"
                                  arrow
                                >
                                  <TableCell className="TableRowsWrapperToolTip">
                                    {String(row.location).length > 30
                                      ? String(row.location) + "..."
                                      : String(row.location)}
                                  </TableCell>
                                </Tooltip>
                              )}
                              {String(row.location).length <= 30 && (
                                <TableCell className="TableRowsWrapperToolTip">
                                  {row.location}
                                </TableCell>
                              )}
                            </TableRow>
                            <TableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell className="TableRowsWrapperBold">
                              <i className="p-2"><DotIcon  /></i>
                                Level
                              </TableCell>
                              <TableCell className="TableRowsWrapper">
                                {row.licenseLevel}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Button
                        intent="secondary"
                        className="mt-3 ArchiveLicenseButton hide-link"
                        type="outlined"
                        text="Archive License"
                        onClick={() => {
                          //this functionality will be added later
                        }}
                      />
                    </div>
                  ))}
              </div>
              <div className="d-flex AddLicenseWrapper">
                <div>
                  {(roleValidator(userState["role"]) === SystemAdministrator ||
                    roleValidator(userState["role"]) ===
                      DirectorOfCompliance) && (
                    <Tooltip title="Add a New License to this Location">
                      <AddCircleOutlinedIcon
                        className="AddCircleOutlinedIconWrapper"
                        onClick={handleAddLicense}
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
          <hr className="HrLine" />
          <div className="pb-4">

            <div className="d-flex">
              <div className="ms-4 pt-4">
                <div className="AssignEmployee hide-link">Archive Location</div>
              </div>
              {(roleValidator(userState["role"]) === SystemAdministrator ||
                roleValidator(userState["role"]) === DirectorOfCompliance) && (
                <AssignEmployeeDialogBox
                  openAssignEmployee={openAssignEmployee}
                  handleAssignEmployee={handleAssignEmployee}
                  organizationLocationId={organizationLocationId}
                  locationName={data["locationNickName"]}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewLocationDetails;
export const useHorizontalScroll = (data: any | null) => {
  const elRef = useRef<any>();
  useEffect(() => {
    if (data !== null) {
      const el = elRef.current;
      if (el) {
        const onWheel = (e: WheelEvent) => {
          if (e.deltaY === 0) return;
          e.preventDefault();
          el.scrollTo({
            left: el.scrollLeft + e.deltaY,
            behavior: "smooth",
          });
        };
        el.addEventListener("wheel", onWheel);
        return () => el.removeEventListener("wheel", onWheel);
      }
    }
  }, [data]);
  return elRef;
};

const DotIcon = () => {
  return (
    <FiberManualRecordIcon style={{ fontSize: "10px", marginRight: "10px" }} />
  );
};
