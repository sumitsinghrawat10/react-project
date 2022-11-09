import React, { useEffect, useState } from "react";
import { IBadges } from "../../../model/model";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BellIcon from "../../../components/Icons/BellIcon";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Button from "../../../components/Button";
import { default as MuiButton } from "@mui/material/Button";
import AddTooltip from "../../../components/AddTooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import BadgeBoxCard from "../../../components/BadgeCard/BadgeBoxCard";
import {
  GET_EMPLOYEE_DETAILS,
  GET_LICENSES_DETAILS,
  GET_TASK_DETAILS_BY_EMPLOYEE_ID,
} from "../../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
  GeneralManager,
  TeamLead,
} from "../../../utilities/constants";
import { ProfilePic } from "../../../utilities/ProfilePic";
import { roleValidator } from "../../../utilities/roleValidator";
import { ValidateRole } from "../../../utilities/ValidateRole";
import BackButton from '../../../components/Icons/BackButtonIcon';
interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface DashboardType {
  user: {
    user?: string;
    role?: string;
    userId?: number | null;
    initialSetup?: string;
    navVisible?: boolean;
  };
}

const EmployeeDetails = () => {
  const userState = useSelector((state: DashboardType) => state.user);

  const history = useHistory();
  const employeeName = getEmployeeName(history.location.state);
  const employeeEmail = getEmployeeEmail(history.location.state);
  const employeeRole = getEmployeeRole(history.location.state);
  const employeeId = getEmployeeId(history.location.state);
  const employeeOtherRoleDescription = getEmployeeOtherRoleDescription(
    history.location.state
  );
  function getEmployeeName(hist: any) {
    return hist ? hist.employeeName : null;
  }
  function getEmployeeEmail(hist: any) {
    return hist ? hist.employeeEmail : null;
  }
  function getEmployeeRole(hist: any) {
    return hist ? hist.employeeRole : null;
  }
  function getEmployeeId(hist: any) {
    return hist ? hist.employeeId : null;
  }
  function getEmployeeOtherRoleDescription(hist: any) {
    return hist ? hist.employeeOtherRoleDescription : null;
  }
  const [Locations, setLocations] = React.useState<any[]>([]);
  const [UserPicture, setUserPicture] = useState(ProfilePic);
  const [userPictureName, setUserPictureName] = useState<string>("");
  const [EmployeeOrganizationId, setEmployeeOrganizationId] = useState<any>();
  const [LicenseData, setLicenseData] = React.useState<any[]>([]);
  const [TasksData, setTasksData] = React.useState<any[]>([]);
  const [Badges, setBadges] = React.useState<IBadges>();
  const [userId, setUserId] = useState();
  const [isManageDisabled, setIsManageDisabled] = useState(true);
  const [manageButtonDisable, setManageButtonDisable] = useState(false);
  const token = localStorage.getItem("user");
  const [RoleWithDescription, setRoleWithDescription] =
    React.useState(employeeRole);
  
  const getEmployeeData = () => {
    if (employeeOtherRoleDescription) {
      const updateRoleWithDescription = `${employeeRole} (${employeeOtherRoleDescription})`;
      setRoleWithDescription(updateRoleWithDescription);
    }

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
          setLocations(res.data.result.locations);
          setUserId(res.data.result.userId);
          setUserPictureName(res.data.result.profileImageName);
          setUserPicture(res.data.result.profilePicture);
          setEmployeeOrganizationId(res.data.result.org_employee_id);
          setIsManageDisabled(false);
        } else {
          setManageButtonDisable(true);
          setIsManageDisabled(false);
        }
      });
  };
  const getLicensesData = () => {
    axios
      .get<DataResponse>(`${GET_LICENSES_DETAILS}${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.result !== null) {
          setLicenseData(res.data.result);
        }
      });
  };
  const getBadges = (data: IBadges) => {
    setBadges(data);
  };

  const getTasksData = () => {
    axios
      .get<DataResponse>(`${GET_TASK_DETAILS_BY_EMPLOYEE_ID}${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.result !== null) {
          setTasksData(res.data.result);
        }
      });
  };

  useEffect(() => {
    getEmployeeData();
    getLicensesData();
    getTasksData();
  }, []);

  const getBase64 = () => {
    let base64 = "data:image/png;base64,";
    const ExtensionName = userPictureName?.split(".")?.pop()?.toLowerCase();
    if(ExtensionName === "svg"){
      base64 = "data:image/svg+xml;base64,";
    }
    return `${base64}${UserPicture}`;
  };

  return (
    <div className="container form-container employee-dashboard-container">
      <div className="page-padding">
        <div className="d-flex justify-content-between">
          <div className="page-title">
            <div className="flex-container">
            <BackButton onClick={() => history.push("/employees")}/>
              Employee Details
            </div>
            </div>
          <div className="ms-auto pt-4 ArchiveLink hide-link">
            Archive Employee
          </div>
          <div className="ms-4">
            <BellIcon />
          </div>
        </div>
        <div className="row justify-space-between">
          <div className="col-sm-6">
            <div className=" mt-4">
              <PersonOutlineOutlinedIcon />
              <div className="NameTitle text-capitalize"> <AddTooltip value={employeeName} len={25} /> </div>
            </div>
          </div>
          <div className="col-sm-6 text-right"></div>
        </div>

        <div className="ProfileBox">
          <div className="row">
            <div className="col-sm-1">
              <img
                src={getBase64()}
                className="img-fluid"
                alt="Profile"
              />
            </div>
            <div className="col-sm-11 ProfileBoxInner">
              <div className="ProfileBoxInnerDiv">
                <h6>Role</h6>
                <Tooltip
                  title={
                    RoleWithDescription.length > 24 ? RoleWithDescription : ""
                  }
                  placement="top"
                  arrow
                >
                  <div className="RoleTag">
                    {RoleWithDescription.length > 24
                      ? RoleWithDescription + "..."
                      : RoleWithDescription}
                  </div>
                </Tooltip>
              </div>
              <div className="ProfileBoxInnerDiv">
                <h6>Location(s)</h6>
                <Tooltip title={Locations.join(", ")} placement="top" arrow>
                  <div className="EmailTag">
                    <p>
                      {
                        (Locations.join(", ")).length > 15 ?
                        Locations[0].slice(0, 15) + "...":Locations.join(", ")}{" "}
                    </p>
                  </div>
                </Tooltip>
              </div>
              <div className="ProfileBoxInnerDiv">
                <h6>Company Email</h6>
                <AddTooltip value={employeeEmail} len={20} />
              </div>
              <div className="ProfileBoxInnerDiv">
                <h6>I.D</h6>
                <Tooltip
                  title={
                    EmployeeOrganizationId && EmployeeOrganizationId.length > 24
                      ? EmployeeOrganizationId
                      : ""
                  }
                  placement="top"
                  arrow
                >
                  <div className="BadgeIdWrap">
                    {EmployeeOrganizationId &&
                    EmployeeOrganizationId.length > 24
                      ? EmployeeOrganizationId + "..."
                      : EmployeeOrganizationId}
                  </div>
                </Tooltip>
              </div>
              <div className="ProfileBoxInnerDiv">
                {ValidateRole([SystemAdministrator,DirectorOfCompliance]) && (
                  <>
                    {!isManageDisabled && (
                      <Button
                        type="outlined"
                        intent="secondary"
                        className="float-right manage-btn"
                        disabled={manageButtonDisable}
                        onClick={() =>
                          history.push("/manage-employee-details", {
                            employeeId,
                            UserPicture,
                            employeeName,
                            employeeEmail,
                            EmployeeOrganizationId,
                            employeeRole,
                            userId,
                            Badges,
                            employeeOtherRoleDescription,
                          })
                        }
                        text="Manage"
                      />
                    )}

                    {isManageDisabled && (
                      <MuiButton
                        variant="outlined"
                        className="float-right manage-btn"
                        style={{ height: "50px", width: "130px" }}
                      >
                        <CircularProgress className="manage-btn-loader"/>
                      </MuiButton>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-5">
            <div className="my-4">
              <AssignmentIndOutlinedIcon />
              <div className="NameTitle">Employee Badge(s)</div>
            </div>

                      <BadgeBoxCard employeeId={employeeId} badges={null} setBadgesChildState={(info:IBadges)=>getBadges(info)}/>
          </div>
          <div className="col-sm-7">
            <div className="my-4">
              <ArticleOutlinedIcon />
              <div className="NameTitle">License(s) Assigned</div>
            </div>
            <div className="GreyBox">
              <table className="table">
                <thead>
                  <tr>
                    <th>License Number</th>
                    <th>License Status</th>
                    <th>Self Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {LicenseData &&
                    LicenseData.map((item: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <Tooltip
                            title={
                              item.licenseNumber.length > 15
                                ? item.licenseNumber
                                : ""
                            }
                            placement="top"
                            arrow
                          >
                            <span>
                              {item.licenseNumber.length > 15
                                ? item.licenseNumber.slice(0, 15) + "..."
                                : item.licenseNumber}
                            </span>
                          </Tooltip>
                        </td>

                        <td>{item.licenseStatus}</td>
                        <td>{item.self_Audit_Status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 mb-4">
            <div className="my-4">
              <AssignmentTurnedInOutlinedIcon />
              <div className="NameTitle">Tasks assigned</div>
            </div>
            {TasksData.length === 0 && (
              <div>No tasks are assigned to this user.</div>
            )}
            <div className="d-flex AllTasksContainer">
              {TasksData &&
                TasksData.map((item: any, index: number) => (
                  <div className="me-5 mb-4" key={index}>
                    <TableContainer className="TableCointainerWrap">
                      <Table
                        sx={{ width: "255px", height: "198px" }}
                        aria-label="simple table"
                      >
                        <TableHead
                          sx={{
                            backgroundColor: "#233ce6",
                            width: "255px",
                            height: "46px",
                          }}
                        >
                          <Tooltip title={item.title} placement="top" arrow>
                            <div className="TasksTitle">
                              {item.title.length > 29
                                ? item.title.slice(0, 29) + "..."
                                : item.title}
                            </div>
                          </Tooltip>
                        </TableHead>
                        <TableBody>
                          <Tooltip
                            title={item.description}
                            placement="top"
                            arrow
                          >
                            <div className="TasksDescription">
                              {item.description.length > 57
                                ? item.description.slice(0, 57) + "..."
                                : item.description}
                            </div>
                          </Tooltip>
                          <div className="TasksStatus">Task Status</div>
                          <div className="BottomTasksDetail">
                            <div className="OpenSpan">{item.status}</div>
                            <div
                              className="ArrowSpan"
                              onClick={() =>
                                (roleValidator(userState["role"]) ===
                                  SystemAdministrator ||
                                  roleValidator(userState["role"]) ===
                                    DirectorOfCompliance ||
                                  roleValidator(userState["role"]) ===
                                    ComplianceAnalyst ||
                                  roleValidator(userState["role"]) ===
                                    DirectorOfRetailOperations ||
                                  roleValidator(userState["role"]) ===
                                    GeneralManager ||
                                  roleValidator(userState["role"]) ===
                                    TeamLead) &&
                                history.push("/task-details", {
                                  organizationTaskId: item.taskId,
                                })
                              }
                              style={{ float: "right" }}
                            >
                              <ChevronRightIcon />
                            </div>{" "}
                          </div>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
