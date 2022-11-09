import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import BellIcon from "../../components/Icons/BellIcon";
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
import AddTooltip from "../../components/AddTooltip";
import { GET_ALL_ASSIGNED_LICENSES } from "../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  DirectorOfRetailOperations,
} from "../../utilities/constants";
import { roleValidator } from "../../utilities/roleValidator";
import TaskForm from "../Dashboard/Tasks/TaskForm";
import AssignLicenseDialogBox from "../DashboardLicense/Modal/AssignLicenseDialogBox";
import LicenseForm from "./licenseForm";
import SuccessToaster from "../../components/SuccessToaster";

const useStyles = makeStyles({
  container: {
    "&::-webkit-scrollbar": {
      width: "10px",
    } /* Chrome */,
    "&::-webkit-scrollbar-thumb": {
      background: "grey !important",
      borderRadius: "5px",
      height: "62px",
    },
  },
});

const hoverStyle = {
  "&:hover": {
    backgroundColor: "#001e46",
    cursor: "pointer",
  },
};

interface LoginTokenType {
  user: {
    organizationId?: number | null;
    role: string;
  };
}

export default function DashboardLicense() {
  const [open, setOpen] = React.useState(false);
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [organizationLocationId, setOrganizationLocationId] = React.useState(0);
  const userState = useSelector((state: LoginTokenType) => state.user);
  const [isEmpty, setIsEmpty] = useState(true);
  const [ToastMessage, setToastMessage] = useState("");
  const [noLicensesFound, setNoLicensesFound] = useState(true);

  const handleAddLicense = () => {
    setOpen(true);
  };

  const [licenseFormFields, setLicenseFormFields] = React.useState<any | null>({
    licenseTypeId: "",
    licenseUsageId: [],
    licenseLevelId: "",
    licenseNumber: "",
    issueDate: "",
    expirationDate: "",
    issuingAuthority: "",
    organizationId: userState["organizationId"],
    organizationLocationId: "",
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
  const [disabled, setDisabled] = useState(false);

  const handleCancel = () => {
    setOpen(false);
    setDisabled(false);
    setLicenseFormFields({
      licenseTypeId: "",
      licenseUsageId: [],
      licenseLevelId: "",
      licenseNumber: "",
      issueDate: null,
      expirationDate: null,
      issuingAuthority: "",
      organizationId: userState["organizationId"],
      organizationLocationId: "",
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
    createLicenseRef.current?.focus();
  };
  const classes = useStyles();
  const [allLicenses, setAllLicenses] = useState<any | null>([]);
  const [licensesUnderReview, setLicensesUnderReview] = useState<any | null>(
    []
  );
  const token = localStorage.getItem("user");
  const GetLicensesData = () => {
    axios
      .get(GET_ALL_ASSIGNED_LICENSES, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res: any) => {
        setIsEmpty(false);
        if (res.status === 200 && !res.data.isSuccess) {
          setAllLicenses([]);
        } else if (
          res.status === 200 &&
          res.data.isSuccess &&
          res.data.result != null
        ) {
          const data = res.data.result;
          setAllLicenses(data);
          setNoLicensesFound(false);
        }
      })
      .catch(() => {
        setIsEmpty(false);
      });
  };

  const assignLicenseRef = useRef<any>();
  const createLicenseRef = useRef<SVGSVGElement>(null);
  const createTaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    GetLicensesData();
    if (allLicenses.length > 0) assignLicenseRef.current.focus();
  }, []);

  useEffect(() => {
    if (assignLicenseRef.current) assignLicenseRef.current.focus();
  }, [assignLicenseRef]);

  interface LicenseUnderReview {
    licenseStatus: string;
    self_Audit_Status: string;
  }

  useEffect(() => {
    const filteredArray = allLicenses.filter(function (
      license: LicenseUnderReview
    ) {
      return (
        license.licenseStatus === "Expiring Soon" ||
        license.licenseStatus === "Expired" ||
        (license.self_Audit_Status === "Outstanding Issues" &&
          license.licenseStatus === "Active") ||
        (license.self_Audit_Status === "Audit Not Started" &&
          license.licenseStatus === "Active") ||
        (license.self_Audit_Status.toLowerCase().trim() ===
          "audit in progress" &&
          license.licenseStatus === "Active")
      );
    });
    setLicensesUnderReview(filteredArray);
  }, [allLicenses]);

  const handleAddTask = () => {
    return setTaskOpen(true);
  };

  const [openAssignLicense, setOpenAssignLicense] = React.useState(false);
  const history = useHistory();
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const addTaskData = () => {
    setToastMessage("Task Added");
    setConfirmationModalIsVisible(true);
    setTimeout(() => {
      setConfirmationModalIsVisible(false);
      createTaskRef.current?.focus();
    }, 4000);
  };
  const addLicenseData = () => {
    setToastMessage("License Added");
    setConfirmationModalIsVisible(true);
    setTimeout(() => {  
      setConfirmationModalIsVisible(false);   
      createLicenseRef.current?.focus();
    }, 4000);
  };
  
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    targetName: string,
    rowItem: any
  ) => {
    if (targetName === "see_license_detail") {
      const keyCondition = !e.shiftKey && e.key === "Tab";
      const condition = allLicenses.length - 1 === allLicenses.indexOf(rowItem);
      if (keyCondition && condition) {
        e.preventDefault();
        assignLicenseRef.current.focus();
      }
    }
  };

  function handleClose() {
    handleCancel();
  }
  const LicenseStatus = (licenseStatus: any) => {
    if (licenseStatus !== "Active") {
      return (
        <>
          <Tooltip title={`License ${licenseStatus}`} arrow>
            <i
              className="bi bi-exclamation-triangle"
              style={{ color: "red", marginRight: 10 }}
            ></i>
          </Tooltip>
          {licenseStatus}
        </>
      );
    } else {
      return (
        <>
          {licenseStatus}
        </>
      );
    }
  };

  const NoTableData = (): JSX.Element => {
    if (!isEmpty && noLicensesFound) {
      return <h4 className="NoLicensessText">No Licenses Assigned</h4>;
    } else if (isEmpty) {
      return (
        <div className="LoaderWrapper">
          <CircularProgress />
        </div>
      );
    } else return <></>;
  };

  const LicenseUnderReviewTable = (): JSX.Element => {
    const tableAriaLabel = "The table contains information about each license. The first of five columns is the license number.";
    if (licensesUnderReview) {
      return (
        <>
          <TableContainer
            component={Paper}
            className={classes.container}
            style={{ backgroundColor: "#f4f5f8", maxHeight: "500px" }}
          >
            <Table sx={{ minWidth: 650 }}  >
              <TableHead
                style={{
                  backgroundColor: "#fff",
                  position: "sticky",
                  top: 0,
                }}
              >
                <TableRow style={{ backgroundColor: "#f4f5f8" }}>
                  <TableCell className="TableHeaderWrapper" aria-label={tableAriaLabel}  style={{ width: "186px" }}>
                    License Number
                  </TableCell>
                  <TableCell className="TableHeaderWrapper" >Location Assigned</TableCell>
                  <TableCell className="TableHeaderWrapper" >License Level</TableCell>
                  <TableCell className="TableHeaderWrapper" >License Status</TableCell>
                  <TableCell className="TableHeaderWrapper" >Self Audit Status</TableCell>
                  <TableCell className="TableHeaderWrapper" component="td"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {licensesUnderReview.map((row: any) => (
                  <TableRow
                    key={row.licenseId}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell className="TableRowsWrapper"
                      sx={{ wordBreak: "break-all" }}
                      component="th"
                      scope="row"
                    >
                      <AddTooltip value={row.licenseNumber} len={20} />

                    </TableCell>
                    <TableCell className="TableRowsWrapper" sx={{ wordBreak: "break-all" }}>
                    <AddTooltip value={row.location} len={20} />

                    </TableCell>
                    <TableCell className="TableRowsWrapper">{row.licenseLevel}</TableCell>
                    <TableCell className="TableRowsWrapper">
                      {LicenseStatus(row.licenseStatus)}
                    </TableCell>
                    <TableCell className="TableRowsWrapper">{row.self_Audit_Status}</TableCell>
                    <TableCell className="TableRowsWrapper">
                      <div
                        className="SeeLicenseDetailWrap"
                        aria-label="The sixth column that is See License Details is the link to check more details for each license."
                        onClick={() => {
                          Push(row.licenseId, row.licenseNumber);
                        }}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          handleEnter(e.key, row.licenseId, row.licenseNumber);
                        }}
                      >
                        <span className="detail-page-text">See License Details&nbsp;&nbsp;</span>
                        <ChevronRightIcon />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    } else
      return (
        <div>
          <TableContainer
            component={Paper}
            style={{ backgroundColor: "#f4f5f8", maxHeight: "500px" }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="Licenses Table">
              <TableHead
                style={{
                  backgroundColor: "#fff",
                  position: "sticky",
                  top: 0,
                }}
              >
                <TableRow style={{ backgroundColor: "#f4f5f8" }}>
                  <TableCell className="TableHeaderWrapper">License Number</TableCell>
                  <TableCell className="TableHeaderWrapper">Location Assigned</TableCell>
                  <TableCell className="TableHeaderWrapper">License Level</TableCell>
                  <TableCell className="TableHeaderWrapper">License Status</TableCell>
                  <TableCell className="TableHeaderWrapper">Self Audit Status</TableCell>
                  <TableCell className="TableHeaderWrapper"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>{/*  */}</TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <h4 className="NoLicensessText">There is no license to review</h4>
        </div>
      );
  };

  const Push = (licenseId: any, licenseNumber: any) => {
    history.push("/license-details", {
      licenseId: licenseId,
      licenseNumber: licenseNumber,
    });
  };

  const handleEnter = (key: any, licenseId: any, licenseNumber: any) => {
    if (key === "Enter" || key === " ") {
      Push(licenseId, licenseNumber);
    }
  };

  const AllLicenseStatus = (licenseNumber:any,licenseStatus: any) => {
    if (licenseStatus !== "Active" && licenseNumber.length > 12) {
      return (
        <>
          <Tooltip title={`License ${licenseStatus} ${licenseNumber} `} arrow placement="top">
          <div>
            <i
              className="bi bi-exclamation-triangle"
              style={{ color: "#ff6d6d", marginRight: 10 }}
            ></i>
            {`${licenseNumber.trim()}`.slice(0, 12) + "..."}
            </div>
          </Tooltip>
        </>
      );
    }else if (licenseStatus !== "Active") {
      return (
        <>
            <div>
              <i
                className="bi bi-exclamation-triangle"
                style={{ color: "#ff6d6d", marginRight: 10 }}
              ></i>
              {`${licenseNumber.trim()}`}
            </div>
        </>
      );
    }
    else if(licenseNumber.length > 15){
      return (
        <>
<Tooltip title={`${licenseNumber} `} arrow placement="top">
        <div>{`${licenseNumber.trim()}`.slice(0, 15) + "..."}</div>
        </Tooltip>

        </>
      );
    }
    else {
      return (
        <>
           <div>{`${licenseNumber.trim()}`}</div>
        </>
      );
    }
  };

  const TableData = (): JSX.Element => {

    if (allLicenses.length === 0) {
      return (
        <>
          {confirmationModalIsVisible && (
            <SuccessToaster message="Task Created" />
          )}
        </>
      );
    } else {
      return (
        <>
          <div className="mt-4">
          <div className="UnderReviewWrapper">Under review</div>
            <LicenseUnderReviewTable />
          </div>
          <div className="mt-4 mb-5">
            <div className="UnderReviewWrapper" aria-label="In this section you can see all the licenses.">All licenses </div>
            <div className="d-flex p-2 AllLicenseContainer">
              {allLicenses.map((row: any) => (
                <div className="me-5" key={row.licenseId}>
                  <TableContainer
                    component={Paper}
                    className="TableContainerWrap"
                  >
                    <Table sx={{ width: 480 }} aria-label="simple table">
                      <TableHead>
                        <TableRow sx={hoverStyle}>
                          <TableCell className="AllLicenseTableHeaderWrapper">
                          <i className="bi bi-card-text p-2"></i>
                            License Number
                          </TableCell>
                          <TableCell className="AllLicenseTableHeaderWrapper" sx={{ maxWidth: 45 }}>
                            {AllLicenseStatus(
                              row.licenseNumber,
                              row.licenseStatus
                            )}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
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
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell className="TableRowsWrapperBold">
                          <i className="p-2"><DotIcon  /></i>
                            Location
                          </TableCell>
                          <TableCell className="TableRowsWrapper"
                            sx={{
                              maxWidth: 45,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row.location}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell  className="TableRowsWrapperBold">
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
                  <div
                    aria-label="Click on “See License Details“ for any specific license to see the license details."
                    className="BottomDivWrapper hoverStyle"
                    onClick={() => {
                      Push(row.licenseId, row.licenseNumber);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      handleKeyDown(e, "see_license_detail", row)
                    }
                    onKeyPress={(e) => {
                      handleEnter(e.key, row.licenseId, row.licenseNumber);
                    }}
                  >
                  See License Details&nbsp;&nbsp; <ChevronRightIcon />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {confirmationModalIsVisible && (
            <SuccessToaster message={ToastMessage} />
          )}
        </>
      );
    }
  };

  return (
    <div className="container dashboard-license-container form-container">
      {(roleValidator(userState["role"]) === SystemAdministrator ||
        roleValidator(userState["role"]) === DirectorOfCompliance) && (
        <Dialog       
          open={open}
          className="dashboard-license-container p-4"
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              maxHeight: 800,
            },
          }}
        onClose={handleClose}
        >
          <div>
            <button
              title="Close button"
              onClick={handleCancel}
              className="btn-close btn-sm close-assign-license"
            ></button>
          </div>
          <DialogContent className="DialogContentWrapper">
            <DialogContentText className="TitleWrap-lic">
              Add a license
            </DialogContentText>
            <LicenseForm
              addLicenseData={addLicenseData}
              GetLicensesData={GetLicensesData}
              licenseFormFields={licenseFormFields}
              setLicenseFormFields={setLicenseFormFields}
              setOpen={setOpen}
              open={open}
              handleCancel={handleCancel}
              organizationLocationId={organizationLocationId}
              setOrganizationLocationId={setOrganizationLocationId}
              disabled={disabled}
              setDisabled={setDisabled}            
            />
          </DialogContent>
        </Dialog>
      )}
      <div className="d-flex">
        <div className="page-title" aria-label="You are on the License page, where you can view all the license assigned to you.">Licenses</div>

        <div className="ms-auto pt-4">
          {(roleValidator(userState["role"]) === SystemAdministrator ||
            roleValidator(userState["role"]) === DirectorOfCompliance ||
            roleValidator(userState["role"]) ===
              DirectorOfRetailOperations) && (
            <div
              className="AssignLicense"
              onClick={() => setOpenAssignLicense(true)}
              tabIndex={0}
              aria-label="Select the assign license link or Press Enter on assign license link to assign a license to an employee."
              ref={assignLicenseRef}
              onKeyPress={(e) => {
                e.key === "Enter" || e.key === " "
                  ? setOpenAssignLicense(true)
                  : setOpenAssignLicense(false);
              }}
            >
              Assign License(s)
            </div>
          )}
          {openAssignLicense && (
            <AssignLicenseDialogBox
              openAssignLicense={openAssignLicense}
              GetLicensesData={GetLicensesData}
              handleAssignLicense={() => setOpenAssignLicense(false)}
            />
          )}
        </div>
        <div
          className="pt-4 ms-3 CreateTask"
          onClick={handleAddTask}
          tabIndex={0}
          ref={createTaskRef}
          onKeyPress={(e) => {
            e.key === "Enter" || e.key === " "
              ? setTaskOpen(true)
              : setTaskOpen(false);
          }}
          aria-label="Select the create a task link or press enter on the create a task link to create a new task for an employee."
        >
          Create a Task
        </div>
        <TaskForm
          setOpen={setTaskOpen}
          open={taskOpen}
          addTaskData={addTaskData}
          fromLicense={true}
          fromNotification={false}
        />
        {(roleValidator(userState["role"]) === SystemAdministrator ||
          roleValidator(userState["role"]) === DirectorOfCompliance) && (
          <Tooltip title="Add a New License">
            <AddCircleOutlinedIcon
              aria-label="Select the plus icon or Press Enter on the plus icon to add a new license"
              className="mt-3 ms-3 AddCircleOutlineIconWrapper"
              onClick={handleAddLicense}
              tabIndex={0}
              ref={createLicenseRef}
              onKeyPress={(e) => {
                e.key === "Enter" || e.key === " "  ? setOpen(true) : setOpen(false);
              }}
            />
          </Tooltip>
        )}
        <div
          className="ms-3"
          tabIndex={0}
          aria-label="Notification (Bell Icon)"
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " "){
              history.push("/notifications");
            }
          }}
        >
          <BellIcon />
        </div>
      </div>
      {allLicenses && (
        <>
          <NoTableData />
          <TableData />
        </>
      )}
    </div>
  );
}
const DotIcon = () => {
  return (
    <FiberManualRecordIcon style={{ fontSize: "10px", marginRight: "10px" }} />
  );
};
