import React, { useEffect, useState } from "react";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import BellIcon from "../../../components/Icons/BellIcon";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { Tooltip, CircularProgress } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import SuccessToaster from "../../../components/SuccessToaster";
import SwalBox from "../../../components/SwalBox";
import {
  GET_EMPLOYEE_LICENSES_OF_LOCATIONS,
  GET_ENPLOYEES_LOCATION,
  GET_EMPLOYEE_DETAILS,
  ASSIGN_EMPLOYEE_TO_LICENSES,
  ADD_ASSIGN_LOCATION_TO_EMPLOYEE,
  GET_BADGES_DETAILS,
  REMOVE_BADGES,
  GET_PROFILE_PICTURE,
  DELETE_PROFILE_PICTURE,
  UPDATE_EMPLOYEE_PROFILE,
  USERDETAILS,
} from "../../../networking/httpEndPoints";
import { UserProfilePicture } from "../../../store/profilePictureStore";
import { UserProfilePictureName } from "../../../store/profilePictureNameStore";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  DirectorOfRetailOperations,
} from "../../../utilities/constants";
import { decodeToken } from "../../../utilities/decodeToken";
import { roleFormatter } from "../../../utilities/formatter";
import { ProfilePic } from "../../../utilities/ProfilePic";
import { roleValidator } from "../../../utilities/roleValidator";
import ChangeProfileDialog from "../../UserProfile/ChangeProfileDialog";
import DialogBox from "../Employee/DialogBox";
import AddBadge from "./AddBadge";
import AssignLicenseDialogBox from "./AssignLicenseDialogBox";
import AssignLocation from "./AssignLocation";
import TextBox from "../../../components/TextBox";
import AddTooltip from "../../../components/AddTooltip";
import BackButton from '../../../components/Icons/BackButtonIcon';

interface AuthRoleType {
  user: {
    role?: string;
  };
}

interface ResponseType {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const ManageEmployeeDetails = () => {
  const history = useHistory();
  const employeeName = history.location.state
    ? history.location.state.employeeName
    : null;
  const employeeEmail = history.location.state
    ? history.location.state.employeeEmail
    : null;
  const EmployeeOrganizationId = history.location.state
    ? history.location.state.EmployeeOrganizationId
    : null;
  const employeeRole = history.location.state
    ? history.location.state.employeeRole
    : null;
  const employeeId = history.location.state
    ? history.location.state.employeeId
    : null;
  const employeeOtherRoleDescription = history.location.state
    ? history.location.state.employeeOtherRoleDescription
    : null;
  const userId = history.location.state ? history.location.state.userId : 0;
  const Badges = history.location.state ? history.location.state.Badges : null;

  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [openLicenseDialog, setOpenLicenseDialog] = useState(false);
  const userState = useSelector((state: AuthRoleType) => state.user);
  const [openAssignLocation, setOpenAssignLocation] = useState(false);
  const [licenseData, setLicenseData] = useState<any[]>([]);
  const [reloadLicenseData, setReloadLicenseData] = useState(false);
  const [checkedLicenseData, setCheckedLicenseData] = useState<any[]>([]);
  const [checkedLocationData, setCheckedLocationData] = useState<any[]>([]);
  const [reloadLocationData, setReloadLocationData] = useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [removeId, setRemoveId] = React.useState<number>();
  const [cardName, setCardName] = useState("");
  const [singleBadge, setSingleBadge] = useState(false);
  const [badgesData, setBadgesData] = useState<any[]>(Badges);
  const [openAddBadge, setOpenAddBadge] = useState(false);
  const [loader, setLoader] = useState(true);
  const [reloadBadges, setReloadBadges] = useState(false);
  const [openPic, setOpenPic] = useState(false);
  const [employeePicture, setEmployeePicture] = useState(ProfilePic);
  const { addProfilePicture } = UserProfilePicture();
  const { profilePictureName, addProfilePictureName } = UserProfilePictureName();
  const [employeePictureName, setEmployeePictureName] = React.useState("");

  const [name, setName] = useState(employeeName);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [editName, setEditName] = useState(false);
  const [empOrgId, setEmpOrgId] = useState(EmployeeOrganizationId);
  const [editEmpOrgId, setEditEmpOrgId] = useState(false);
  const [editProfileInfo, setEditProfileInfo] = React.useState<boolean>(false);
  const [saveConfirm, setSaveConfirm] = useState<boolean>(false);
  const [lastNameError, setLastNameError] = useState<boolean>(false);
  const [firstNameError, setFirstNameError] = useState<boolean>(false);
  const [empOrgIdError, setEmpOrgIdError] = useState<boolean>(false);
  const token = localStorage.getItem("user");
  const userData = decodeToken(token);
  const tokenUserId = userData.UserId;

  const getBadges = () => {
    axios
      .get<DataResponse>(`${GET_BADGES_DETAILS}${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.result !== null) {
          setReloadBadges(false);
          setBadgesData(res.data.result);
        }
      });
  };

  const getLocationDetails = () => {
    axios
      .get<DataResponse>(`${GET_ENPLOYEES_LOCATION}${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setTimeout(() => {
          setLoader(false);
        }, 200);
        if (res.data.result !== null) {
          const locationDatail = res.data.result;
          const data = locationDatail.filter(
            (item: any) => item.isLocationAssigned
          );
          setCheckedLocationData(data.length > 0 ? data : []);
        }
      });
  };

  const getBadgesDetails = () => {
    setBadgesData(badgesData.filter((x) => x.badgeId !== removeId));
  };

  const swalAlerDialog = () => {
    return Swal.fire({
      text: "Error occurred while submitting changes",
      confirmButtonText: "OK",
      icon: "error",
    });
  };

  const getLicensesDetails = () => {
    axios
      .get<DataResponse>(`${GET_EMPLOYEE_LICENSES_OF_LOCATIONS}${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.result !== null) {
          setLicenseData(res.data.result);
          }
        else {
            setLicenseData([]);
        }
      });
  };

  const getCheckedLicenseData = () => {
    const data = licenseData.filter((item) => item.isAssigned);
    setCheckedLicenseData(data.length > 0 ? data : []);
  };

  const changeLicenseId = (Id: any) => {
    const filterLicenseId = checkedLicenseData.map((item: any) => item.licenseId);
    const updatedIds = filterLicenseId.filter((item) => item !== Id);
    const params = {
      employeeId: employeeId,
      licenseIds: updatedIds,
    };
    if (token !== null) {
      axios
        .post<ResponseType>(ASSIGN_EMPLOYEE_TO_LICENSES, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 201 && res.data.isSuccess) {
            if (res.data.result === true) {
              SwalBox(res.data.responseMessage, "info");
            } else {
              setAlertOpen(false);
              getLicensesDetails();
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
            swalAlerDialog();
          }
        })
        .catch(() => swalAlerDialog());
    }
  };

  const changeLocationId = (Id: any) => {
    let filterLocationId: any[];
    filterLocationId = checkedLocationData.map((item: any) => item.locationId);
    let updatedIds: any[];
    updatedIds = filterLocationId.filter((item) => item !== Id);
    const params = {
      employeeId: employeeId,
      locationIds: updatedIds,
    };
    if (token !== null) {
      axios
        .post<ResponseType>(ADD_ASSIGN_LOCATION_TO_EMPLOYEE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 201 && res.data.isSuccess) {
            if (res.data.result === true) {
              SwalBox(res.data.responseMessage, "info");
            } else {
              setAlertOpen(false);
              getLocationDetails();
              //in order to update the removed licenses also
              getLicensesDetails();
              setConfirmationModalIsVisible(true);
              setTimeout(() => {
                setConfirmationModalIsVisible(false);
              }, 3000);
            }
          } else {
            Swal.fire({
              text: "Error occurred while submitting changes",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => swalAlerDialog());
    }
  };

  const changeBadgeId = (Id: any) => {
    const params = {
      employeeId: employeeId,
      badgeId: Id,
    };
    if (token !== null) {
      axios
        .post<ResponseType>(REMOVE_BADGES, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 201 && res.data.isSuccess) {
            setAlertOpen(false);
            getBadgesDetails();
            setConfirmationModalIsVisible(true);
            setTimeout(() => {
              setConfirmationModalIsVisible(false);
            }, 3000);
          } else {
            SwalBox(res.data.responseMessage, "info");
          }
        })
        .catch(() => swalAlerDialog());
    }
  };

  const handleAddBadgeAction = () => {
    if (badgesData && badgesData.length >= 5) {
      Swal.fire({
        text: "The user has already been assigned the maximum number of badges allowed.",
        confirmButtonText: "OK",
        icon: "info",
        confirmButtonColor: "#233ce6",
      });
    } else {
      setOpenAddBadge(true);
    }
  };

  const badgeRemove = () => {
    setAlertOpen(true);
    setCardName("badge");
  };
  const updateCard = () => {
    switch (cardName) {
      case "location":
        changeLocationId(removeId);
        break;
      case "license":
        changeLicenseId(removeId);
        break;
      case "badge":
        changeBadgeId(removeId);
        break;
      default:
        break;
    }
  };

  const handleChangeProfilePicBtn = () => {
    setOpenPic(true);
  };

  const getProfilePicture = () => {
    axios
      .get<ResponseType>(`${GET_PROFILE_PICTURE}?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.isSuccess) {
          setEmployeePictureName(response.data.result.profileImageName);
          setEmployeePicture(response.data.result.imageData);
        }
      });
  };

  useEffect(() => {
    if(profilePictureName){
      setEmployeePictureName(profilePictureName);
    }
  }, [profilePictureName]);

  const UpdateEmployeeProfile = () => {
    if (validateFields()) {
      setLoader(true);
      const params = {
        EmployeeId: employeeId,
        FirstName: firstName,
        LastName: lastName,
        MiddleName: middleInitial,
        OrganizationEmployeeId: empOrgId,
      };

      axios
        .put<ResponseType>(UPDATE_EMPLOYEE_PROFILE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (
            res.status === 200 &&
            res.data.isSuccess &&
            res.data.result != null
          ) {
            setLoader(false);
            setName(firstName + " " + middleInitial + " " + lastName);
            setEditName(false);
            setEditEmpOrgId(false);
            setEditProfileInfo(false);
            setSaveConfirm(true);
            setConfirmationModalIsVisible(true);
            setTimeout(() => {
              setConfirmationModalIsVisible(false);
            }, 3000);
          } else {
            console.error(res.status);
          }
        });
    }
  };

  const validateFields = () => {
    let validate = true;

    if (lastName.trim().length === 0) {
      setLastNameError(true);
      validate = false;
    }
    if (firstName.trim().length === 0) {
      setFirstNameError(true);
      validate = false;
    }
    if (empOrgId.trim().length === 0) {
      setEmpOrgIdError(true);
      validate = false;
    }
    return validate;
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    if (e.target.name === "lastName") {
      setLastName(e.target.value);
    }
    if (e.target.name === "firstName") {
      setFirstName(e.target.value);
    }
    if (e.target.name === "middleInitial") {
      setMiddleInitial(e.target.value);
    }
    if (e.target.name === "empOrgId") {
      setEmpOrgId(e.target.value);
      console.log(firstName);
    }
  };
  const getUserDetail = () => {
    setLoader(true);
    axios
      .get<ResponseType>(`${USERDETAILS}${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.isSuccess) {
          setLoader(false);
          setFirstName(response.data.result[0].firstName);
          setLastName(response.data.result[0].lastName);
          setMiddleInitial(response.data.result[0].middleName);
          setName(`${response.data.result[0].firstName} ${response.data.result[0].middleName} ${response.data.result[0].lastName}`);
        }
      });
  };

  const getEmployeeOrgId = () => {
    axios
      .get<DataResponse>(`${GET_EMPLOYEE_DETAILS}${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.result !== null) {
          setEmpOrgId(res.data.result.org_employee_id);
        }
      });
  };

  const resetEditFields = () => {
    setLastNameError(false);
    setFirstNameError(false);
    setEditName(false);
    setEditProfileInfo(false);
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure you want to delete this profile picture ?",
      confirmButtonColor: "#233ce6",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete<ResponseType>(`${DELETE_PROFILE_PICTURE}?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            if (res.status === 200 && res.data.isSuccess) {
              setEmployeePicture(ProfilePic);
              setEmployeePictureName('profilePic.png');
              if (parseInt(tokenUserId) === parseInt(userId)) {
                addProfilePicture(ProfilePic);
                addProfilePictureName('profilePic.png');
              }
            }
          });
      }
    });
  };

  useEffect(() => {
    getProfilePicture();
    getUserDetail();
  }, []);

  useEffect(() => {
    getLicensesDetails();
  }, [reloadLicenseData]);

  useEffect(() => {
    getCheckedLicenseData();
  }, [licenseData]);

  useEffect(() => {
    getLocationDetails();
  }, [reloadLocationData]);

  useEffect(() => {
    getBadges();
  }, [reloadBadges]);

  return (
    <>
      <div className="container employee-dashboard-container form-container">
        <div className="page-padding">
          <DialogBox
            alertOpen={alertOpen}
            singleBadge={singleBadge}
            handleAlertYes={() => {
              setAlertOpen(false);
              updateCard();
            }}
            handleAlertNo={() => setAlertOpen(false)}
          />
          {!loader && (
          <div className="d-flex justify-content-between">
            <div className="col-md-6 page-title">
              <div className="flex-container">
              <BackButton onClick={() =>
                history.push("/employee-details", {
                  employeeId,
                  employeePicture,
                  employeeName: name,
                  employeeEmail,
                  EmployeeOrganizationId: empOrgId,
                  employeeRole,
                  userId,
                  Badges,
                  employeeOtherRoleDescription,
                })
              }/>
              Manage Employee Details
            </div>
            </div>
            {editProfileInfo && (
              <div className="col-md-5 SaveButton">
                <div onClick={() => UpdateEmployeeProfile()}>Save Changes</div>
              </div>
            )}
            <div className="ms-3 me-2">
              <BellIcon />
            </div>
          </div>)}
          {loader && (
            <div className="LoaderWrapper">
              <CircularProgress />
            </div>
          )}
          {!loader && (
            <div>
              <div className="row justify-space-between">
                <div className="col-sm-12">
                  <div className="my-4">
                    <PersonOutlineOutlinedIcon />
                    <div className="NameTitle">Basic information</div>
                  </div>
                </div>
                <ChangeProfileDialog
                  setOpen={setOpenPic}
                  open={openPic}
                  userId={userId}
                  setEmployeePicture={setEmployeePicture}
                  setEmployeePictureName={setEmployeePictureName}
                />

                <div className="OuterBox">
                  <div className="row badgeBoxInner blueBottomBorder d-flex justify-content-between">
                    <div className="col-sm-2 title">Profile Image</div>
                    <div className="col-sm-8">
                      Add a photo to personalize your profile. Click on the
                      thumbnail to Add, delete or change employee's photo.
                    </div>
                    <div className="col-sm-2" style={{ textAlign: "right" }}>
                      <div className="ProfileImageBox">
                        {(!employeePictureName || (employeePictureName && employeePictureName.length === 0)) && (
                          <img
                            src={`data:image/png;base64,${employeePicture}`}
                            alt="Profile"
                            width="70px"
                            className="img-fluid rounded-circle my-2 float-right"
                          />
                        )}
                        {employeePictureName && employeePictureName.length !== 0 && (
                          <>
                            {employeePictureName.split(".")?.pop()?.toLowerCase() === "svg" && (
                              <img
                                src={`data:image/svg+xml;base64,${employeePicture}`}
                                alt="Profile"
                                width="70px"
                                className="img-fluid rounded-circle my-2 float-right"
                              />
                            )}
                            {employeePictureName.split(".")?.pop()?.toLowerCase() !== "svg" && (
                              <img
                                src={`data:image/png;base64,${employeePicture}`}
                                alt="Profile"
                                width="70px"
                                className="img-fluid rounded-circle my-2 float-right"
                              />
                            )}
                          </>
                        )}

                        <div className="dropdown">
                          <button
                            type="button"
                            className=" EditProfileBtn"
                            id="dropdownMenuButton1"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <MoreVertOutlinedIcon className="ThreeDotIcon" />
                          </button>
                          <ul
                            className="dropdown-menu dd-menu"
                            aria-labelledby="dropdownMenuButton1"
                          >
                            <li>
                              <button
                                className="MenuButton dropdown-item"
                                onClick={handleChangeProfilePicBtn}
                              >
                                {ProfilePic === employeePicture
                                  ? "Upload"
                                  : "Change"}
                              </button>
                            </li>

                            <li>
                              <button
                                className="MenuButton dropdown-item"
                                onClick={handleDelete}
                                disabled={
                                  ProfilePic === employeePicture ? true : false
                                }
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row badgeBoxInner blueBottomBorder editRowAlign d-flex justify-content-between">
                    <div className="col-sm-2 title">Name</div>
                    {editName && (
                      <>
                        <div className="col-sm-8 ">
                          <div className="EditFullNameWrapper">
                            <div className="col-sm-5">
                              <TextBox
                                className={
                                  "input-form-margin input-form form-control"
                                }
                                error={lastNameError}
                                helperText={
                                  lastNameError ? "Last name is required" : ""
                                }
                                hiddenLabel={true}
                                disableUnderline={false}
                                placeholder="Enter last name"
                                value={lastName}
                                name="lastName"
                                onChange={(e: any) => {
                                  setLastNameError(false);
                                  handleInputChange(e);
                                }}
                                maxLength={50}
                                minLength={1}
                              />
                            </div>
                            <div className="col-sm-1">
                              <TextBox
                                className={
                                  "input-form-margin input-form form-control "
                                }
                                hiddenLabel={true}
                                placeholder="M.I."
                                value={middleInitial}
                                name="middleInitial"
                                onChange={(e: any) => {
                                  handleInputChange(e);
                                }}
                                disableUnderline={false}
                                maxLength={1}
                                minLength={0}
                              />
                            </div>
                            <div className="col-sm-5">
                              <TextBox
                                className={
                                  "input-form-margin input-form form-control"
                                }
                                error={firstNameError}
                                helperText={
                                  firstNameError
                                    ? "First name is required"
                                    : ""
                                }
                                hiddenLabel={true}
                                placeholder="Enter first name"
                                value={firstName}
                                name="firstName"
                                onChange={(e: any) => {
                                  setFirstNameError(false);
                                  handleInputChange(e);
                                }}
                                maxLength={50}
                                minLength={1}
                                disableUnderline={false}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-sm-2 ">
                          <div className="CancelButtonWrapper">
                            <CancelOutlinedIcon
                              onClick={() => {
                                resetEditFields();
                              }}
                              sx={{
                                fontSize: "20px",
                                "&:hover": { cursor: "pointer" },
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {!editName && (
                      <>
                        <div className="col-sm-7">
                          <div>{name}</div>
                        </div>
                        <div
                          className="col-sm-3 EditOption"
                          onClick={() => {
                            getUserDetail();
                            setEditName(true);
                            setEditProfileInfo(true);
                          }}
                        >
                          <div className="Link">Edit</div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="row badgeBoxInner blueBottomBorder d-flex justify-content-between">
                    <div className="col-sm-2 title">Email</div>
                    <div className="col-sm-9">{employeeEmail}</div>
                    <div className="col-sm-1 Link"></div>
                  </div>
                  <div className="row  badgeBoxInner blueBottomBorder editRowAlign d-flex justify-content-between">
                    <div className="col-sm-2 title">I.D</div>
                    {editEmpOrgId && (
                      <>
                        <div className="col-sm-7 ">
                          <div className="EditFullNameWrapper">
                            <TextBox
                              className={
                                "input-form-margin input-form form-control"
                              }
                              error={empOrgIdError}
                              helperText={
                                empOrgIdError
                                  ? "Employee Organization ID is required"
                                  : ""
                              }
                              hiddenLabel={true}
                              placeholder="Enter Employee Organization ID"
                              value={empOrgId}
                              name="empOrgId"
                              onChange={(e: any) => {
                                setEmpOrgIdError(false);
                                handleInputChange(e);
                              }}
                              disableUnderline={false}
                              maxLength={50}
                              minLength={1}
                            />
                          </div>
                        </div>
                        <div className="col-sm-3 ">
                          <div className="CancelButtonWrapper">
                            <CancelOutlinedIcon
                              onClick={() => {
                                setEmpOrgIdError(false);
                                setEditEmpOrgId(false);
                                setEditProfileInfo(false);
                              }}
                              sx={{
                                fontSize: "20px",
                                "&:hover": { cursor: "pointer" },
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {!editEmpOrgId && (
                      <>
                        <div className="col-sm-7">
                          {saveConfirm && (
                            <>
                              <div>{empOrgId}</div>
                            </>
                          )}
                          {!saveConfirm && (
                            <>
                              <div>{EmployeeOrganizationId}</div>
                            </>
                          )}
                        </div>
                        <div
                          className="col-sm-3 EditOption"
                          onClick={() => {
                            setEditEmpOrgId(true);
                            setEditProfileInfo(true);
                            getEmployeeOrgId();
                            getUserDetail();
                            setSaveConfirm(false);
                          }}
                        >
                          <div className="Link">Edit</div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="row badgeBoxInner d-flex justify-content-between">
                    <div className="col-sm-2 title">Role</div>
                    <div className="col-sm-10">
                      {roleFormatter(employeeRole)}
                      {employeeOtherRoleDescription &&
                        ` (${employeeOtherRoleDescription})`}
                    </div>
                    <div className="col-sm-2 roleaction Link hide-link">
                      Add/Remove
                    </div>
                  </div>
                </div>
              </div>

              <div className="row pb-5">
                <div className="col-sm-4">
                  <div className="my-4">
                    <LocationOnOutlinedIcon />
                    <div className="NameTitle">Locations assigned</div>
                  </div>
                  <div className="OuterBoxWrapper OuterBox">
                    {checkedLocationData.length === 0 && (
                      <div>No Location Assigned</div>
                    )}
                    {checkedLocationData &&
                      checkedLocationData.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="row badgeBoxInner blueBottomBorder d-flex justify-content-between"
                        >
                          <div className="col-sm-8 assignedWrapper">
                          <AddTooltip value={item.locationNickName} len={20} />
                          </div>
                          <div
                            className="col-sm-4 Link"
                            onClick={() => {
                              setAlertOpen(true);
                              setCardName("location");
                              setSingleBadge(false);
                              setRemoveId(item.locationId);
                            }}
                          >
                            Unassign
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="AddBox">
                    {(roleValidator(userState["role"]) ===
                      SystemAdministrator ||
                      roleValidator(userState["role"]) ===
                        DirectorOfCompliance) && (
                      <Tooltip title="Assign Location">
                        <AddCircleOutlinedIcon
                          className="AddCircleOutlinedIconWrapper"
                          onClick={() => setOpenAssignLocation(true)}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <AssignLocation
                    openAssignLocation={openAssignLocation}
                    handleAssignLocation={() => {
                      setOpenAssignLocation(false);
                      getLicensesDetails();
                    }}
                    employeeName={employeeName}
                    employeeId={employeeId}
                    userId={userId}
                    reloadLocationData={reloadLocationData}
                    setReloadLocationData={setReloadLocationData}
                  />
                </div>
                <div className="col-sm-4">
                  <div className="my-4">
                    <ArticleOutlinedIcon />
                    <div className="NameTitle">Licenses assigned</div>
                  </div>
                  <div className="OuterBoxWrapper OuterBox">
                    {checkedLicenseData.length === 0 && (
                      <div>No License Assigned</div>
                    )}
                    {checkedLicenseData &&
                      checkedLicenseData.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="row badgeBoxInner blueBottomBorder d-flex justify-content-between"
                        >
                          <Tooltip
                            title={
                              item.licenseNumber.length > 20
                                ? item.licenseNumber
                                : ""
                            }
                            placement="top"
                            arrow
                          >
                            <div className="col-sm-8 assignedWrapper">
                              {item.licenseNumber.length > 20
                                ? item.licenseNumber + "..."
                                : item.licenseNumber}
                            </div>
                          </Tooltip>
                          <div
                            className="col-sm-4 Link"
                            onClick={() => {
                              setAlertOpen(true);
                              setCardName("license");
                              setSingleBadge(false);
                              setRemoveId(item.licenseId);
                            }}
                          >
                            Unassign
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="AddBox">
                    {(roleValidator(userState["role"]) ===
                      SystemAdministrator ||
                      roleValidator(userState["role"]) ===
                        DirectorOfCompliance ||
                      roleValidator(userState["role"]) ===
                        DirectorOfRetailOperations) && (
                      <Tooltip title="Assign License">
                        <AddCircleOutlinedIcon
                          className="AddCircleOutlinedIconWrapper"
                          onClick={() => setOpenLicenseDialog(true)}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <AssignLicenseDialogBox
                    openLicenseDialog={openLicenseDialog}
                    handleLicenseDialog={() => {
                      setOpenLicenseDialog(false);
                      getLicensesDetails();
                    }}
                    employeeId={employeeId}
                    employeeName={employeeName}
                    licenseData={licenseData}
                    reloadLicenseData={reloadLicenseData}
                    setReloadLicenseData={setReloadLicenseData}
                  />
                </div>
                <div className="col-sm-4 pe-0">
                  <div className="my-4">
                    <AssignmentIndOutlinedIcon />
                    <div className="NameTitle">Employee badges</div>
                  </div>
                  <div className="OuterBoxWrapper OuterBox">
                    {badgesData &&
                      badgesData.map((badge: any, index: number) => (
                        <div
                          key={index}
                          className="row badgeBoxInner blueBottomBorder d-flex justify-content-between"
                        >
                          <Tooltip
                            title={
                              badge.badgesName.length > 20
                                ? badge.badgesName
                                : ""
                            }
                            placement="top"
                            arrow
                          >
                            <div className="col-sm-8 assignedWrapper">
                              {badge.badgesName.length > 20
                                ? badge.badgesName + "..."
                                : badge.badgesName}
                            </div>
                          </Tooltip>
                          <div
                            className="col-sm-4 Link"
                            onClick={() => {
                              badgeRemove();
                              setRemoveId(badge.badgeId);
                            }}
                          >
                            Archive
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="AddBox">
                    {(roleValidator(userState["role"]) ===
                      SystemAdministrator ||
                      roleValidator(userState["role"]) ===
                        DirectorOfCompliance) && (
                      <Tooltip title="Add a new Badge">
                        <AddCircleOutlinedIcon
                          className="AddCircleOutlinedIconWrapper"
                          onClick={handleAddBadgeAction}
                        />
                      </Tooltip>
                    )}
                  </div>

                  <AddBadge
                    openAddBadge={openAddBadge}
                    handleAddBadge={() => {
                      setOpenAddBadge(false);
                    }}
                    handleReloadBadges={() => {
                      setReloadBadges(true);
                    }}
                    employeeName={employeeName}
                    employeeId={employeeId}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmationModalIsVisible && <SuccessToaster message="Changes Saved" />}
    </>
  );
};

export default ManageEmployeeDetails;
