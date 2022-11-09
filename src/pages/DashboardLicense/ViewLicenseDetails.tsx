import React, { useState, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BellIcon from "../../components/Icons/BellIcon";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  Button,
  Tooltip,
  Checkbox,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Grid from '@mui/material/Grid';
import lod from "lodash";
import SuccessToaster from "../../components/SuccessToaster";
import historyVaribaleChecker from "../../utilities/historyVariableChecker";
import {
  GET_LICENSE_DETAILS,
  GET_ALL_TASKS_BY_LICENSESID,
  GET_SELF_AUDIT_STATUS,
  START_SELF_AUDIT_LICENSE,
  CANCEL_AUDIT,
  GET_LICENSE_NOTIFICATIONS,
  GET_NOTIFICATION_BY_ID,
  DELETE_NOTIFICATIONS,
  UPDATE_NOTIFICATION_REMINDER,
  UPDATE_READ_UNREAD_NOTIFICATION,
} from "../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  DirectorOfRetailOperations,
  TeamLead,
  ComplianceAnalyst,
  GeneralManager,
  OutstandingIssues,
  GoodStanding,
} from "../../utilities/constants";
import { decodeToken } from "../../utilities/decodeToken";
import { roleValidator } from "../../utilities/roleValidator";
import AuditAlreadyInProgressAlertDialog from "./AuditAlreadyInProgressAlertDialog";
import LicenseForm from "./licenseForm";
import AssignEmployeeDialogBox from "./Modal/AssignEmployeeDialogBox";
import AuditReportDialogBox from "./Modal/AuditReportDialogBox";
import PreviousAuditDialogBox from "./Modal/PreviousAuditDialogBox";
import CancelAuditAlertDialog from "./SelfAudit/CancelAuditAlertDialog";
import BackButton from '../../components/Icons/BackButtonIcon';
import useWindowDimensions from "../../components/useWindowDimensions";

const resetFormHeight = makeStyles({
  root: {
    "& .MuiTextField-root": {
      height: "4.375rem",
    },
  },
});

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
    backgroundColor: "#ffffff",
    maxWidth: "100%",
    maxHeight: "45vh",
    borderBottomStyle: "inset",
    borderBottomWidth: "1px",
    borderTopStyle: "inset",
    borderTopWidth: "1px",
    borderTopColor: "#ffffff75",
  },
  iconStyle: {
    float: "right",
    marginRight: "15px",
    marginTop: "-12px",
  },
});

const hoverStyle = {
  "&:hover": {
    backgroundColor: "#233ce6",
    color: "#fff!important",
    cursor: "pointer",
  },
  borderBottom: "1px solid #233ce6",
  "&:last-child": { borderBottom: "0px !important" },
};

interface LicenseDetailsResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface LicensNotificationsResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface NotificationDetailById {
  notificationsId: number;
  notificationTitle: string;
  reminderId: number;
  isRead: number;
  status: string;
  notificationType: string;
  subject: string;
  body: string;
}
interface ReminderTypes {
  remindersId:number;
  frequency:string;
  turnOff:number;
}
interface ResultNotificationDetailById {
  notificationDetail: NotificationDetailById[];
  reminderDetail: ReminderTypes[];
}
interface ResponseNotificationDetailsById {
  isSuccess: boolean;
  responseMessage: string;
  result: ResultNotificationDetailById;
}
interface NotificationUpdateObj {
  notificationId: number;
  isRead: boolean;
}
interface AuthRoleType {
  user: {
    role?: string;
  };
}
interface TaskDetailsResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
type TaskRowType = {
  taskId: number;
  title: string;
  status: string | null | undefined;
};
//Customized hook to get the current state from useState
const useSetState = <T extends object>(
  initialState: T = {} as any
): [T, (patch: Function | Partial<T>) => void] => {
  const [tick, setTick] = useState(true);

  const [state, set] = useState<T>(initialState);
  const setState = (patch: any) => {
    if (patch instanceof Function)
      set((prevState) => Object.assign(prevState, patch(prevState)));
    else set(Object.assign(state, patch));
    setTick(!tick);
  };
  return [state, setState];
};

interface NotificationsTypes {
  notificationId: number;
  notificationTitle: string;
  notificationFrequency: string;
  notificationDescription: null;
  isRead: number;
  notificationCreatedDate: string;
  notificationType: string;
}

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

const ViewLicenseDetails = () => {
  const classes = useStyles();
  const resetHeight = resetFormHeight();
  const [loading, setLoading] = useState(true);
  const [openAssignEmployee, setOpenAssignEmployee] = useState(false);
  const [openLicenseDailog, setOpenLicenseDailog] = useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [cancelAuditAlert, setCancelAuditAlert] = React.useState(false);
  const [auditStatus, setAuditStatus] = useState("");
  const [currentStatus, setResumeStatus] = useSetState([]);
  const [auditButtonStatus, setAuditButtonStatus] = React.useState(false);
  const [auditAlreadyInProgress, setAuditAlreadyInProgress] =
    React.useState(false);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [licenseDetails, setLicenseDetails] = useState<any | null>([]);
  const userState = useSelector((state: AuthRoleType) => state.user);
  const history = useHistory();
  const licenseId = historyVaribaleChecker("licenseId", history);
  const licenseNumber = historyVaribaleChecker("licenseNumber", history);
  const [btnDisable, setBtnDisable] = useState("enable-audit");
  const [licenseFormFields, setLicenseFormFields] = React.useState<any | null>({
    licenseId: null,
    licenseTypeId: "",
    licenseUsageId: [],
    licenseLevelId: "",
    licenseNumber: "",
    issueDate: null,
    expirationDate: null,
    issuingAuthority: "",
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
  const [rows, setRows] = useState<any | null>(null);
  const [openReport, setOpenReport] = useState(false);
  const [isNotificationDetailsVisible, setIsNotificationDetailsVisible] =
    useState<boolean | null>(false);
  const [licenseNotifications, setLicenseNotifications] = useState<any | null>(null);
  const [checked, setChecked] = useState(false);
  const [dataNotificationDetailById, setDataNotificationDetailById] =
    useState<ResponseNotificationDetailsById | null>(null);
  const [previous, setPrevious] = useState<number>(0);
  const [reminderValue, setReminderValue] = useState<number>(0);
  const [reminderVisible, setReminderVisible] = useState<boolean | null>(false);
  const [currentSelectedId, setCurrentSelectedId] = useState<number>(0);
  const { width } = useWindowDimensions();


  const handleLicenseCancel = () => {
    clearFormFields();
    setOpenLicenseDailog(false);
  };

  const clearFormFields = () => {
    setLicenseFormFields({
      licenseId: null,
      licenseTypeId: "",
      licenseUsageId: [],
      licenseLevelId: "",
      licenseNumber: "",
      issueDate: null,
      expirationDate: null,
      issuingAuthority: "",
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
  };

  const updateLicenseData = () => {
    setConfirmationModalIsVisible(true);
    setTimeout(() => {
      setConfirmationModalIsVisible(false);
    }, 4000);
    getLicenseDetails();
    getTaskDetails();
    getLicenseNotifications();
  };

  const handleEditLicense = () => {
    getLicenseDetails();
    setOpenLicenseDailog(true);
  };

  const getLicenseDetails = useCallback(() => {
    const token = localStorage.getItem("user");
    if (token !== null) {
      axios
        .get<LicenseDetailsResponse>(`${GET_LICENSE_DETAILS}${licenseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setDisabled(true);
          setLoading(false);
          if (
            res.data.result !== null &&
            res.status === 200 &&
            res.data.isSuccess === true
          ) {
            res.data.result.use = res.data.result.use.join(", ");
            setLicenseDetails(res.data.result);
            setLicenseFormFields({
              licenseId: res.data.result.licenseId,
              licenseTypeId: res.data.result.typeId,
              licenseUsageId: res.data.result.useId,
              licenseLevelId: res.data.result.levelId,
              licenseNumber: res.data.result.licenseNumber,
              issueDate: String(
                moment(res.data.result.issueDate).format("MM/DD/YYYY")
              ),
              expirationDate: String(
                moment(res.data.result.expirationDate).format("MM/DD/YYYY")
              ),
              issuingAuthority: res.data.result.issuingAuthority,
              licenseUsageError: false,
              licenseNumberError: false,
              licenseIssueDateError: false,
              licenseExpirationDateError: false,
              issuingAuthorityError: false,
              licenseTypeError: false,
              licenseLevelError: false,
              locationError: false,
              issueDateIsBlank: false,
              expirationDateIsBlank: false,
            });
          } else if (res.status === 200 && res.data.isSuccess === false) {
            setLicenseDetails(null);
            history.push("/");
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        });
    }
  }, [licenseId]);

  const getTaskDetails = useCallback(() => {
    const token = localStorage.getItem("user");
    if (token !== null) {
      axios
        .get<TaskDetailsResponse>(
          `${GET_ALL_TASKS_BY_LICENSESID}${licenseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          if (
            res.data.result !== null &&
            res.status === 200 &&
            res.data.isSuccess === true
          ) {
            setRows(res.data.result);
          } else if (res.status === 200 && res.data.isSuccess === false) {
            setRows(null);
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        });
    }
  }, [licenseId]);

  const getLicenseNotifications = useCallback(() => {
    const token = localStorage.getItem("user");
    if (token !== null) {
      axios
        .get<LicensNotificationsResponse>(
          `${GET_LICENSE_NOTIFICATIONS}${licenseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res: any) => {
          if (
            res.data.result !== null &&
            res.status === 200 &&
            res.data.isSuccess === true
          ) {
            setLicenseNotifications(res.data.result);
          } else if (res.status === 200 && res.data.isSuccess === false) {
            setLicenseNotifications(null);
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        });
    }
  }, [licenseId]);

  function getNotificationsById(NotificationId: number,NotificationFrequencyValue: string) {
    const token = localStorage.getItem("user");
    setPrevious(NotificationId);
    axios
      .get<ResponseNotificationDetailsById>(
        `${GET_NOTIFICATION_BY_ID}${NotificationId}?notificationFrequency=${NotificationFrequencyValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        if (res.data.isSuccess === true) {
          setDataNotificationDetailById(res.data);
          res.data?.result?.reminderDetail === null ||
          res.data?.result?.reminderDetail === undefined
            ? setReminderNotVisible()
            : CheckReminder(res.data?.result?.notificationDetail[0].reminderId);
          setIsNotificationDetailsVisible(true);
        }
      });
  }

  function CheckReminder(ReminderId: number) {
    setReminderVisible(true);
    setReminderValue(ReminderId);
  }

  function setReminderNotVisible() {
    setReminderValue(0);
    setReminderVisible(false);
  }

  const updateReminderNotificationAPICall = (
    NotificationId: number,
    reminderId: number,
    UserId: number
  ) => {
    const token = localStorage.getItem("user");

    const params = {
      notificationId: NotificationId,
      userId: UserId,
      reminderId: reminderId,
    };

    axios.put<LicensNotificationsResponse>(UPDATE_NOTIFICATION_REMINDER, params, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  function deleteNotification(id: number) {
    const token = localStorage.getItem("user");
    axios
      .delete<LicensNotificationsResponse>(`${DELETE_NOTIFICATIONS}${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res:any) => {
        if (res.data.isSuccess === true) {
          getLicenseNotifications();
          setPrevious(0);
        }
      });
  }

  function updateNotificationReadUnreadApi(RequestObj: NotificationUpdateObj) {
    const token = localStorage.getItem("user");
    axios.put<LicensNotificationsResponse>(
      UPDATE_READ_UNREAD_NOTIFICATION,
      RequestObj,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  const getAuditStatus = useCallback(() => {
    const token = localStorage.getItem("user");
    if (token !== null) {
      axios
        .get<TaskDetailsResponse>(`${GET_SELF_AUDIT_STATUS}${licenseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          Swal.close();
          if (res.status === 200 && res.data.isSuccess === true) {
            setAuditStatus(res.data.result.label);
            setAuditButtonStatus(res.data.result.disabled);
          } else if (res.status === 200 && res.data.isSuccess === false) {
            setAuditStatus("");
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        });
    }
  }, [licenseId]);
  const getResumeStatus = async () => {
    const token = localStorage.getItem("user");
    if (token !== null) {
      await axios
        .get<TaskDetailsResponse>(`${GET_SELF_AUDIT_STATUS}${licenseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          Swal.close();
          if (res.status === 200 && res.data.isSuccess === true) {
            setResumeStatus(res.data.result.label);
            setAuditButtonStatus(res.data.result.disabled);
            return res.data.result.label;
          } else if (res.status === 200 && res.data.isSuccess === false) {
            return "";
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        });
    }
  };
  useEffect(()=>{
    if(auditButtonStatus){
      setBtnDisable('disable-audit');
    }
  },[auditButtonStatus]);

   useEffect(() => {
    getLicenseDetails();
    getTaskDetails();
    getAuditStatus();
    getLicenseNotifications();
  }, [
    getLicenseDetails,
    getTaskDetails,
    getAuditStatus,
    getLicenseNotifications,
  ]);

  const onStartSelfAudit = () => {
    const params = {
      licenseId: licenseId,
    };
    const token = localStorage.getItem("user");

    axios
      .post<StartLoadAnswer>(START_SELF_AUDIT_LICENSE, params, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        Swal.close();
        if (res.status === 201 && res.data.isSuccess) {
          history.push("/self-audit", {
            licenseId: licenseId,
            licenseNumber: licenseNumber,
            type: "start",
          });
        } else if (
          res.status === 201 &&
          !res.data.isSuccess &&
          res.data.result === "Audit In Progress"
        ) {
          setAuditAlreadyInProgress(true);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      })
      .catch(() => Swal.close());
  };
  interface StartLoadAnswer {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
  }

  const selfAuditReportPage = () => {
    if (auditStatus === "Start Self Audit") {
      onStartSelfAudit();
    } else if (auditStatus === "Resume Self Audit") {
      onResumeSelfAudit();
    } else if (auditStatus === "Cancel Audit") {
      setCancelAuditAlert(true);
    }
  };
  const onResumeSelfAudit = () => {
    new Promise((resolve: any) => {
      const status = getResumeStatus();
      resolve(status);
    }).then((result: any) => {
      const newStatus = currentStatus.toString().replace(/,/g, "");
      if (newStatus !== "Resume Self Audit" && newStatus !== "") {
        Swal.fire({
          text: "This audit has been cancelled by another user, please start a new self-audit",
          confirmButtonText: "OK",
          icon: "info",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          getLicenseDetails();
          getAuditStatus();
        });
      } else {
        history.push("/self-audit", {
          licenseId: licenseId,
          licenseNumber: licenseNumber,
          type: "resume",
        });
      }
    });
  };
  const handleCancelAudit = () => {
    const token = localStorage.getItem("user");
    if (token !== null) {
      const params = {
        licenseId: licenseId,
      };

      axios
        .post<LicenseDetailsResponse>(`${CANCEL_AUDIT}`, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          Swal.close();
          setCancelAuditAlert(false);
          if (res.status === 201 && res.data.isSuccess === true) {
            getLicenseDetails();
            getAuditStatus();
          } else {
            Swal.close();
            Swal.fire({
              text: `${res.data.responseMessage}`,
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => {
          Swal.close();
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        });
    }
  };

  const markReadUnread = (id: number, checkMarked: boolean, condition: boolean) => {

    const index = licenseNotifications.findIndex(
      (obj:any) => Number(obj.notificationId) === Number(id)
    );
    if (checkMarked === false && condition === true) {
      const ReqNotification = {
        notificationId: id,
        isRead: true,
      };
      updateNotificationReadUnreadApi(ReqNotification);
      updateNotificationReadUnreadDataSet(1,index);
    } else if(checkMarked === true && condition === false){
      const ReqNotification = {
        notificationId: id,
        isRead: false,
      };
      updateNotificationReadUnreadApi(ReqNotification);
      updateNotificationReadUnreadDataSet(0,index);
    }
    else {
      return;
    }
  };

  const handleCheckboxChange: any = (e: any) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
  };

  const handleDropdownChange: any = (e: any, NotificationId: number) => {
    const token = localStorage.getItem("user");
    const reminderId = e.target.value;
    const userData = decodeToken(token);
    const tokenUserId = userData.UserId;
    updateReminderNotificationAPICall(NotificationId, reminderId, tokenUserId);
    setReminderValue(reminderId);
  };

  const closeNotificationDetail = (id: number) => {
    const readStatus = licenseNotifications.find(
      (x: NotificationsTypes) => x.notificationId === id
    ).isRead;
    const notificationFrequencyValue = licenseNotifications.find(
      (x: NotificationsTypes) => x.notificationId === id
    ).notificationFrequency;
    HandleNBarClick(id,readStatus,notificationFrequencyValue);
  };

  const toolTip = (value: string) => {
    const newLength = width <= 1024 ? 50 : 0;
    if (value !== null && newLength !== 0) {
      return (
        <Tooltip title={value} placement="top-start" arrow>
          <h4 className="notifications-details-title NotificationContentEllipsis">{value}</h4>
        </Tooltip>
      );
    } else {
      return <h4 className="notifications-details-title notifications-details-no-ellipsis">{value}</h4>;
    }
  };

  const NotificationsDetailDialog = ():JSX.Element => {
    const type:boolean = dataNotificationDetailById?.result.notificationDetail[0]["notificationType"] === "License";
    const text:string = dataNotificationDetailById?.result.notificationDetail[0]["body"]!;
    return (
      <div className="notifications-details-dialog">
        <div className="notifications-details-inner-wrapper">
          <div className="notifications-details-cross-btn-container">
            <CancelOutlinedIcon
              className="notifications-details-cross-btn"
              onClick={() => closeNotificationDetail(currentSelectedId)}
            />
          </div>
          <div>
            <ul className="notifications-details-list">
              <li className="notifications-details-desc">
                {toolTip(
                  dataNotificationDetailById?.result?.notificationDetail[0][
                    "notificationTitle"
                  ]!
                )}
                <Tooltip
                  title={text.length > 200 ? text : ""}
                  placement="top"
                  arrow
                >
                  <p className="notifications-details-description-text">
                    {
                      dataNotificationDetailById?.result.notificationDetail[0][
                        "body"
                      ]
                    }
                  </p>
                </Tooltip>
              </li>
            </ul>
          </div>
          <div className="notifications-details-checkmarker">
            <div className="notifications-details-checkmarker-container">
              <Checkbox
                name="notificationIsReadChkBox"
                checked={checked}
                sx={{ padding: 1 }}
                onChange={(e) => {
                  handleCheckboxChange(e);
                }}
                value={
                  dataNotificationDetailById?.result.notificationDetail[0][
                    "notificationsId"
                  ]
                }
              />
              <span>Mark as unread</span>
            </div>
          </div>
          <div className="notifications-details-bottom">
            {reminderVisible && (
              <div>
                <div className="notifications-details-actions">
                  <div className="col-sm-6 col-12 select-box-width">
                    <Select
                      size="small"
                      name="ReminderSelect"
                      displayEmpty
                      defaultValue={0}
                      value={reminderValue}
                      inputProps={{ "aria-label": "Without label" }}
                      variant="filled"
                      className="input-form select-field select-mobile-size"
                      IconComponent={CustomExpandMore}
                      onChange={(e) =>
                        handleDropdownChange(
                          e,
                          dataNotificationDetailById?.result
                            .notificationDetail[0]["notificationsId"]
                        )
                      }
                    >
                      <MenuItem disabled value="10" className="abcdef">
                        <span className="input-placeholder">Choose one</span>
                      </MenuItem>

                      <MenuItem value={1}>Every 24 hours</MenuItem>
                      <MenuItem value={2}>Every week</MenuItem>
                      <MenuItem value={3}>Once a month</MenuItem>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SuccessModal = ():JSX.Element=>{
    if(confirmationModalIsVisible){
      return (
        <>
          <SuccessToaster message="Changes saved" />
        </>
      );
    }else {
      return<></>;
    }
  };

  const updateNotificationReadUnreadDataSet = (isRead: number,index:number) => {
    let DataNotifications = licenseNotifications;
    let ReadRecords = [];
    let UnreadRecords = [];
    DataNotifications[index].isRead = isRead;
    lod.orderBy(DataNotifications, ["isRead"],["asc"]);

    ReadRecords = DataNotifications.filter((item:NotificationsTypes)=>{
      return item.isRead === 1;
    });
    UnreadRecords = DataNotifications.filter((item:NotificationsTypes)=>{
      return item.isRead === 0;
    });
    if(isRead === 0){
      UnreadRecords = lod.orderBy(UnreadRecords,function(uRecords:NotificationsTypes){
        return new Date(uRecords.notificationCreatedDate);
      });
      UnreadRecords.reverse();
    } else {
      ReadRecords = lod.orderBy(ReadRecords,function(rRecords:NotificationsTypes){
        return new Date(rRecords.notificationCreatedDate);
      });
      ReadRecords.reverse();
    }
    DataNotifications = UnreadRecords.concat(ReadRecords);
    setLicenseNotifications(DataNotifications);
  };

  const updateNotificationDelete = (index: number) => {
    const DataNotifications = licenseNotifications;
    DataNotifications.splice(index, 1);
    setLicenseNotifications(DataNotifications);
  };

  const HandleNBarClick = (id: number, isRead: number,NotificationFrequencyValue:string) => {
    setCurrentSelectedId(id);    
    if (isRead === 0) {
      if (previous === 0) {
        setIsNotificationDetailsVisible(false);
        setChecked(false);
        getNotificationsById(id,NotificationFrequencyValue);
      } else if (previous !== 0 && id === previous) {
        setIsNotificationDetailsVisible(false);
        setPrevious(0);
        const cond: boolean =
          dataNotificationDetailById?.result.notificationDetail[0]["isRead"] ===
          0;
        markReadUnread(id, checked, cond);
      } else {
        const cond: boolean =
          dataNotificationDetailById?.result.notificationDetail[0]["isRead"] ===
          0;
        setIsNotificationDetailsVisible(false);
        setChecked(false);
        getNotificationsById(id,NotificationFrequencyValue);
        markReadUnread(previous, checked, cond);
      }
    }
    else {
      if (previous === 0) {
        setIsNotificationDetailsVisible(false);
        setChecked(false);
        getNotificationsById(id,NotificationFrequencyValue);
      } else if (previous !== 0 && id === previous) {
        setIsNotificationDetailsVisible(false);
        setPrevious(0);
        checked && markReadUnread(id, checked, false);
      } else {
        const cond: boolean =
          dataNotificationDetailById?.result.notificationDetail[0]["isRead"] ===
          0;
        setIsNotificationDetailsVisible(false);
        setChecked(false);
        getNotificationsById(id,NotificationFrequencyValue);
        markReadUnread(previous, checked, cond);
      }
    }
  };

  const handleRemove = (e:any, id: number) => {
    e.stopPropagation();
    setIsNotificationDetailsVisible(false);
    const index = licenseNotifications.findIndex(
      (obj:any) => Number(obj.notificationId) === Number(id)
    );
    updateNotificationDelete(index);
    deleteNotification(id);
  };

  const LicenseNotifications = (): JSX.Element => {
    if(licenseNotifications) {
      return (
        <>
          <div className="license-notification-container">
            <div className="notification-table-container">
              {licenseNotifications?.map(
                (item: NotificationsTypes, index: number) => (
                  <div
                    className="bar"
                    key={index}
                    onClick={() =>
                      HandleNBarClick(item.notificationId, item.isRead,item.notificationFrequency)
                    }
                  >
                    <div className="license-notification-text">
                      {item.isRead === 0 ? (
                        <span className="notification-table-label-unread">
                          Unread
                        </span>
                      ) : (
                        <span className="notification-table-label-read">
                          Read
                        </span>
                      )}
                      <Tooltip
                        title={
                          item.notificationTitle.length > 50
                            ? item.notificationTitle
                            : ""
                        }
                        placement="top"
                        arrow
                      >
                        <div className="license-notification-text-Ellipsis">
                          {item.notificationTitle}
                        </div>
                      </Tooltip>
                    </div>
                    <div className="cancel-icon-container ">
                      <CancelOutlinedIcon
                        sx={{ fontSize: "medium" }}
                        onClick={(e: any) =>
                          handleRemove(e, item.notificationId)
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="NoTaskDetails-lic">No notifications Found</div>
        </>
      );
    }
  };

  const TaskDetails = ():JSX.Element =>{
    if(rows){
      return (
        <>
          <TableContainer component={Paper} className={classes.container}>
            <div>
              <Table aria-label="simple table">
                <TableBody>
                  {rows.map((row: TaskRowType) => (
                    <TableRow
                      sx={hoverStyle}
                      onClick={() => {
                        history.push("../task-details", {
                          organizationTaskId: row.taskId,
                        });
                      }}
                    >
                      <div className="TableDataRow-lic">
                        <div className="ToolTipDiv-lic">
                          <Tooltip
                            title={row.title.length > 45 ? row.title : ""}
                            placement="top"
                            arrow
                          >
                            <div className="TitleData-lic">
                              {row.title.length > 45
                                ? row.title.substring(0, 44) + "..."
                                : row.title}
                            </div>
                          </Tooltip>
                        </div>
                        <ChevronRightIcon className={classes.iconStyle} />
                        <div>Status: {row.status}</div>
                      </div>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableContainer>
        </>
      );
    } else {
      return (
        <>
          <div className="NoTaskDetails-lic">No Tasks Found</div>
        </>
      );
    }
  };

  const ToolTipText = (val: string,cls:string) => {
    const strLen: boolean = String(val).length > 30;
    if (!strLen) {
      return (
        <>
          <p className={`${cls}`}>{val}</p>
        </>
      );
    } else {
      return (
        <>
          <Tooltip title={val} placement="top" arrow>
            <p className={`${cls}`}>{`${val}`.slice(0, 7) + "..."}</p>
          </Tooltip>
        </>
      );
    }
  };

  const BottomSection = (): JSX.Element => {
    if (!loading) {
      return (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div className="Grid-wrapper">
                <AssignmentTurnedInOutlinedIcon />
                <div className="TaskDetails-lic">Tasks for this license</div>
                <div
                  className="d-flex AllTaskContainer-lic"
                  style={{ zIndex: 1, position: "relative" }}
                >
                  {isNotificationDetailsVisible && (
                    <NotificationsDetailDialog></NotificationsDetailDialog>
                  )}
                  <div
                    className="me-2 DivTaskContainer-lic"
                    style={{ width: "100%" }}
                    key={licenseId}
                  >
                    <TaskDetails />
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="Grid-wrapper">
                <NotificationsNoneOutlinedIcon />
                <div className="license-details-title">
                  Notifications for this license
                </div>
                <LicenseNotifications />
              </div>
            </Grid>
          </Grid>
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <div className="container pt-5px dashboard-license-container form-container">
        {licenseDetails && loading && (
          <>
            <div className="LoaderWrapper-lic">
              <CircularProgress />
            </div>
          </>
        )}

        {licenseDetails && !loading && (
          <>
            {(roleValidator(userState["role"]) === SystemAdministrator ||
              roleValidator(userState["role"]) === DirectorOfCompliance) && (
              <Dialog
                open={openLicenseDailog}
                keepMounted
                className="dashboard-license-container license-form-dialog"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <div>
                  <button
                    onClick={handleLicenseCancel}
                    className="btn-close btn-sm close-assign-license"
                  ></button>
                </div>
                <DialogContent className="DialogContentWrapper-lic">
                  <DialogContentText className="DialogTop-lic">
                    You are editing license {licenseDetails["licenseNumber"]}
                  </DialogContentText>
                  <LicenseForm
                    licenseFormFields={licenseFormFields}
                    setLicenseFormFields={setLicenseFormFields}
                    setOpen={setOpenLicenseDailog}
                    open={openLicenseDailog}
                    handleCancel={handleLicenseCancel}
                    editLicense={true}
                    updateLicenseData={updateLicenseData}
                    disabled={disabled}
                    setDisabled={setDisabled}
                  />
                </DialogContent>
              </Dialog>
            )}
            <div className="d-flex HeadWrap-lic">
              <div>
              {String(licenseDetails["licenseNumber"]).length > 30 && (
                <div className="TitleWrapWithTooltip-lic page-title">
                  <div className="flex-container">
                  <BackButton onClick={() => history.push("/")} />
                <Tooltip
                  title={licenseDetails["licenseNumber"]}
                  placement="top"
                  arrow
                >
                  <div className="long-license-div">
                    License:{licenseDetails["licenseNumber"]} 
                  </div>
                </Tooltip>
                </div>
                </div>
              )}
              {String(licenseDetails["licenseNumber"]).length <= 30 && (
                <div className="page-title TitleWrap-header-lic">
                  <div className="flex-container">
                  <BackButton onClick={() => history.push("/")} />
                  License: {licenseDetails["licenseNumber"]}
                </div>
                </div>
              )}
              </div>
              <div className="d-flex">
              {(roleValidator(userState["role"]) === SystemAdministrator ||
                roleValidator(userState["role"]) === DirectorOfCompliance) && (
                <div className="ms-3 pt-4">
                  {licenseDetails["selfAuditStatus"] !== "Audit In Progress" ? (
                    <div
                      className="EditLicenseButtonEnabled-lic"
                      onClick={handleEditLicense}
                    >
                      Edit License
                    </div>
                  ) : (
                    <Tooltip title="You cannot edit this license when its audit is in progress.">
                      <div className="EditLicenseButtonDisabled-lic">
                        Edit License
                      </div>
                    </Tooltip>
                  )}
                </div>
              )}
              {(roleValidator(userState["role"]) === SystemAdministrator ||
                roleValidator(userState["role"]) === DirectorOfCompliance ||
                roleValidator(userState["role"]) ===
                  DirectorOfRetailOperations) && (
                <div className="ms-3 pt-4">
                  <div
                    className="AssignLicense-lic"
                    onClick={() => setOpenAssignEmployee(true)}
                  >
                    Assign Employee
                  </div>
                </div>
              )}
              <div className="ms-3 pt-4 hide-link">Create a Task</div>
              <div className="ms-3">
                <BellIcon />
              </div>
              </div>
              <AssignEmployeeDialogBox
                openAssignEmployee={openAssignEmployee}
                handleAssignEmployee={() => setOpenAssignEmployee(false)}
                licenseId={licenseId}
                licenseNumber={licenseNumber}
                userEmployeeId={licenseDetails["userEmployeeId"]}
              />
            </div>

            <div className="LicenseDetailsWrapper">
              <ArticleOutlinedIcon />
              <div className="LicenseDetails-lic">License Details</div>
            </div>

            <div className="LicenseDetailsWrapper-lic">
              <div className="row abovePanel-lic">
                {(roleValidator(userState["role"]) === SystemAdministrator ||
                  roleValidator(userState["role"]) ===
                    DirectorOfCompliance) && (
                  <>
                    <div className="col-md-auto pt-5">
                      <p
                        className="LinkWrapper-lic"
                        onClick={() => setAlertOpen(true)}
                      >
                        Self Audit Report History
                      </p>
                      <PreviousAuditDialogBox
                        handleYes={() => {
                          setAlertOpen(false);
                        }}
                        alertOpen={alertOpen}
                        licenseId={licenseId}
                        licenseNumber={licenseNumber}
                      />
                    </div>
                  </>
                )}

                {(roleValidator(userState["role"]) === GeneralManager ||
                  roleValidator(userState["role"]) ===
                    DirectorOfRetailOperations ||
                  roleValidator(userState["role"]) === ComplianceAnalyst ||
                  roleValidator(userState["role"]) === TeamLead) && (
                  <div className="col-md-auto pt-5">
                    <p
                      className="LinkWrapper-lic"
                      onClick={() => setAlertOpen(true)}
                    >
                      Self Audit Report History
                    </p>
                    <PreviousAuditDialogBox
                      handleYes={() => {
                        setAlertOpen(false);
                      }}
                      alertOpen={alertOpen}
                      licenseId={licenseId}
                      licenseNumber={licenseNumber}
                    />
                  </div>
                )}
                {licenseDetails["selfAuditStatus"] &&
                  (roleValidator(licenseDetails["selfAuditStatus"]) ===
                    OutstandingIssues ||
                    roleValidator(licenseDetails["selfAuditStatus"]) ===
                      GoodStanding) && (
                    <div className="col-md-auto pt-5 me-5">
                      <p
                        className="LinkWrapper-lic"
                        onClick={() => setOpenReport(true)}
                      >
                        See Most Recent Audit Report
                      </p>
                      <AuditReportDialogBox
                        handleCancel={() => {
                          setOpenReport(false);
                        }}
                        openReport={openReport}
                        licenseId={licenseId}
                      />
                    </div>
                  )}
                <div className="col pt-5"></div>
                <div className="col-md-auto pt-5 me-5">
                  <b>Self Audit Status:</b>
                  <p className="text-end">{licenseDetails["selfAuditStatus"]}</p>
                </div>
                <div className="col-md-auto pt-3">
                  <Button
                    disabled={auditButtonStatus}
                    className={`start-self-audit ${btnDisable}`}
                    variant="contained"
                    onClick={selfAuditReportPage}
                  >
                    <i className="bi bi-card-checklist me-2"></i>
                    {auditStatus}
                  </Button>
                  <CancelAuditAlertDialog
                    cancelAuditAlert={cancelAuditAlert}
                    handleAlertYes={() => {
                      setCancelAuditAlert(false);
                      handleCancelAudit();
                    }}
                    handleAlertNo={() => setCancelAuditAlert(false)}
                  />
                  <AuditAlreadyInProgressAlertDialog
                    auditAlreadyInProgressAlert={auditAlreadyInProgress}
                    firstStatement="The self-audit for this license is already in"
                    secondStatement="progress by another user"
                    handleAlertOk={() => {
                      setAuditAlreadyInProgress(false);
                      getLicenseDetails();
                      getAuditStatus();
                    }}
                  />
                </div>
              </div>

              <div className="license-grid">
                <div className="row license-grid-row">
                  <div className="col s3">
                    <p className="SubTitle-lic mb-2">Location:</p>
                    {ToolTipText(licenseDetails["location"], "RowWrapper-lic")}
                  </div>
                  <div className="col s3">
                    <p className="SubTitle-lic mb-2">Level:</p>
                    <p className="RowWrapper-lic">{licenseDetails["level"]}</p>
                  </div>
                  <div className="col s3">
                    <p className="SubTitle-lic mb-2">Use:</p>
                    <p className="RowWrapper-lic">{licenseDetails["use"]}</p>
                  </div>
                  <div className="col s3">
                    <p className="SubTitle-lic mb-2">Type:</p>
                    <p className="RowWrapper-lic">{licenseDetails["type"]}</p>
                  </div>
                </div>
              </div>
              <div className="SectionWrapper-lic">
                <div className="row pb-4">
                  <div className="col s3">
                    <p className="SubTitle-lic">Issuing Authority:</p>
                    {ToolTipText(
                      licenseDetails["issuingAuthority"],
                      "RowWrap-lic"
                    )}
                  </div>
                  <div className="col s3">
                    <p className="SubTitle-lic">Issue Date:</p>
                    <p className="RowWrap-lic">{licenseDetails["issueDate"]}</p>
                  </div>
                  <div className="col s3">
                    <p className="SubTitle-lic">Expiration Date:</p>
                    <p className="RowWrap-lic">
                      {licenseDetails["expirationDate"]}
                    </p>
                  </div>
                  <div className="col s3">
                    <p className="SubTitle-lic">License Status:</p>
                    <p className="RowWrap-lic">
                      {licenseDetails["licenseStatus"]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <BottomSection />
      </div>

      <SuccessModal />
    </>
  );
};

export default ViewLicenseDetails;
