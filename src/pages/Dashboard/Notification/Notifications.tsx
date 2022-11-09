import React, { useEffect, useState } from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {
  Container,
  CircularProgress,
  Button,
  Select,
  Checkbox,
  Tooltip,
} from "@mui/material";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
  GeneralManager,
  TeamLead,
} from "../../../utilities/constants";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DialogConfirmationBox from "../File Manager/ConfirmationDialogBox/dialogConfirmationBox";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { ValidateRole } from "../../../utilities/ValidateRole";
import { useHistory } from "react-router-dom";
import AuditReportDialogBox from "../../DashboardLicense/Modal/AuditReportDialogBox";
import {
  EMPLOYEE_BADGE_DETAILS,
  GET_USER_DASHBOARD_SOP_LIST,
  GET_ALL_NOTIFICATIONS,
  GET_NOTIFICATION_BY_ID,
  UPDATE_READ_UNREAD_NOTIFICATION,
  UPDATE_NOTIFICATION_REMINDER,
  DELETE_NOTIFICATION,
} from "../../../networking/httpEndPoints";

import { decodeToken } from "../../../utilities/decodeToken";

import SuccessToaster from "../../../components/SuccessToaster";
import TaskForm from "../Tasks/TaskForm";
import useWindowDimensions from "../../../components/useWindowDimensions";

export interface BadgeResult {
  isSuccess: boolean;
  responseMessage: null;
  result: BadgeDtl;
}
export interface BadgeDtl {
  employeeId: number;
  employeeName: string;
  role: string;
}
export interface SopResult {
  isSuccess: boolean;
  responseMessage: null;
  result: SopRevIdNStatus[];
}

export interface SopRevIdNStatus {
  sopId: number;
  sopRevisionId: number;
  status: string;
}
export interface ResponseNotification {
  isSuccess: boolean;
  responseMessage: null;
  result: ResultNotification[];
}

export interface ResultNotification {
  notificationId: number;
  notificationTitle: string;
  notificationFrequency: string;
  notificationStatus: string;
  notificationDescription: null;
  isRead: number;
  notificationCreatedDate: Date;
  notificationType: string;
  IsCurrentSelected: boolean;
}

export interface ResponseNotificationDetailsById {
  isSuccess: boolean;
  responseMessage: string;
  result: ResultNotificationDetailById;
}

export interface ResultNotificationDetailById {
  notificationDetail: NotificationDetailById[];
  reminderDetail: ReminderDetail[];
}

export interface ReminderDetail {
  remindersId: number;
  frequency: string;
  turnOff: number;
}

export interface NotificationDetailById {
  notificationsId: number;
  notificationTitle: string;
  reminderId: number;
  isRead: number;
  status: string;
  notificationType: string;
  subject: string;
  body: string;
  taskId: number;
  referenceId: number;
  templateId: number;
}

export interface NotificationUpdateObj {
  notificationId: number;
  isRead: boolean;
}

export interface NotificationUpdateLocalObj {
  notificationId: number;
  isRead: boolean;
  FrequencyId: number;
  IsDelete: boolean;
  flag: string;
}

export interface NotificationReminderUpdateObj {
  notificationId: number;
  userId: number;
  reminderId: number;
}

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

const Notifications: React.FC = () => {
  const token = localStorage.getItem("user");
  const [sopId, setSopId] = useState<number>(0);
  const [tempId, setTempId] = useState<number>(0);
  const [badgeId, setBadgeId] = useState<number>(0);
  const [openReport, setOpenReport] = useState(false);
  const [data, setData] = useState<ResultNotification | any>([]);
  const [dataNotificationsLocal, setDataNotificationsLocal] = useState<
    ResultNotification | any
  >([]);
  const [dataCount, setDataCount] = useState<boolean>(false);
  const [dataNotificationDetailById, setDataNotificationDetailById] =
    useState<ResponseNotificationDetailsById | null>(null);
  const [isNotificationDetailsVisible, setIsNotificationDetailsVisible] =
    useState<boolean | null>(false);
  const [loaderVisible, setLoaderVisible] = useState<boolean | null>(true);
  const [isRenderagain, setIsRenderagain] = useState<boolean | null>(false);

  const [selectedNotificationType, setSelectedNotificationType] = useState("");
  const [checked, setChecked] = useState(false);
  const [defaultReminderValue, setDefaultReminderValue] = useState<number>(0);
  const [reminderValue, setReminderValue] = useState<number>(0);
  const [prvNotificationId, setPrvNotificationId] = useState<number>(0);
  const [isPrvNotificationUnread, setIsPrvNotificationUnread] =
    useState<number>(0);
  const [selectedNotificationId, setSelectedNotificationId] = useState(Number);
  const [reminderVisible, setReminderVisible] = useState<boolean | null>(false);
  const [isReadFilterActive, setIsReadFilterActive] = useState<boolean>(false);
  const [isAllFilterActive, setIsAllFilterActive] = useState<boolean>(true);
  const [showMessageToUser, setShowMessageToUser] = useState(false);
  let messageTimer: any = null;
  const [messageToUser, setMessageToUser] = useState("");
  const [isLicenseFilterActive, setIsLicenseFilterActive] =
    useState<boolean>(false);
  const [isUnreadFilterActive, SetIsUnreadFilterActive] =
    useState<boolean>(false);

  const [isConfirmationDialog, setIsConfirmationDialog] =
    useState<boolean>(false);
  const [checkedNotificationId, setCheckedNotificationId] = useState<number>(0);
  const [isNotificationRead, setIsNotificationRead] = useState<boolean>(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>("All");
  const [createTask, setCreateTask] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<number>(0);
  const [licId, setLicId] = useState<number>(0);
  const [licenseNumber, setLicenseNumber] = useState<string | undefined>("");
  const refNoteScroll = React.useRef<HTMLDivElement>(null);
  const [scrollBottom, setScrollBottom] = useState(false);

  const history = useHistory();
  const { width } = useWindowDimensions();

  async function handleDelete(NotificationId: number) {
    setIsConfirmationDialog(true);
    await axios
      .delete<ResponseNotification>(`${DELETE_NOTIFICATION}${NotificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess) {
          updateNotificationDataSet(NotificationId, "Delete");
        }
      });
  }

  const getAllNotifications = () => {
    axios
      .get<ResponseNotification>(`${GET_ALL_NOTIFICATIONS}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.isSuccess === true) {
          /* Making each Object selected false*/
          const objNotificationDataWithSelection = res.data.result.map(
            (item: ResultNotification) => {
              return { ...item, IsCurrentSelected: false };
            }
          );
          setData(objNotificationDataWithSelection);
          setDataNotificationsLocal(objNotificationDataWithSelection);
          setDataCount(Number(res.data.result.length) === 0 ? true : false);
          setLoaderVisible(false);
        } else {
          setDataCount(true);
          setLoaderVisible(false);
        }
      });
  };

  const selfAuditbuttonAccTemptId = () => {
    if (tempId === 3) {
      return TaskButton(taskId);
    } else if (tempId === 4) {
      return (
        <div>
          <Button
            className="PrimaryButton"
            variant="contained"
            onClick={() => setOpenReport(true)}
          >
            View Report
          </Button>
          <AuditReportDialogBox
            handleCancel={() => {
              setOpenReport(false);
            }}
            openReport={openReport}
            licenseId={Number(
              dataNotificationDetailById?.result.notificationDetail[0][
                "referenceId"
              ]
            )}
          />
        </div>
      );
    } else {
      return <CommonLicenseButton></CommonLicenseButton>;
    }
  };

  async function getSopDetails() {
    axios
      .get<SopResult>(`${GET_USER_DASHBOARD_SOP_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.isSuccess === true) {
          const filterData = res.data.result.filter((el: SopRevIdNStatus) => {
            if (el.sopId === sopId) {
              return el;
            }
          });
          const filterDataLength = filterData.length;
          let revId = 0;
          let status ="";
          if(filterDataLength > 1){
            revId = filterData[filterDataLength-1].sopRevisionId;
            status = filterData[filterDataLength-1].status;
          }
          else{
            revId = filterData[0].sopRevisionId;
            status = filterData[0].status;
          }
          history.push("/sop-details", {
            sopId: sopId,
            status: status,
            isUser: true,
            revisionId: revId,
            filterText: "",
            searchTextItem: "",
            licenseFilter: "",
            categoryFilter: "",
          });
        }
      });
  }

  async function getEmpBadgeDtl(BadgeId: number) {
    axios
      .get<BadgeResult>(`${EMPLOYEE_BADGE_DETAILS}${BadgeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.isSuccess === true) {
          const result = res.data.result;
          history.push("/employee-details", {
            employeeName: result.employeeName,
            employeeEmail: "",
            employeeBadgeId: BadgeId,
            employeeRole: result.role,
            employeeId: result.employeeId,
            employeeOtherRoleDescription: "",
          });
        }
      });
  }

  const handleVerticalScroll = () => {
    const divElement = refNoteScroll.current;
    if (divElement) {
      divElement.scrollTo(0, 0);
      setScrollBottom(false);
    }
  };


  useEffect(() => {
    if (isRenderagain === false) {
      getAllNotifications();
      setIsRenderagain(true);
    }
  }, [dataNotificationsLocal]);

  useEffect(() => {
    if (showMessageToUser) {
      setTimer();
    } else {
      if (messageTimer) clearTimeout(messageTimer);
    }
  }, [showMessageToUser]);

  const setTimer = () => {
    messageTimer = setTimeout(() => {
      setMessageToUser("");
      setShowMessageToUser(false);
    }, 5000);
  };

  function CheckReminder(ReminderId: number) {
    setReminderVisible(true);
    setReminderValue(ReminderId);
  }

  function setReminderNotVisible() {
    setReminderValue(0);
    setReminderVisible(false);
  }

  async function getNotificationsById(NotificationId: number,NotificationFrequencyValue:string) {
      await axios
      .get<ResponseNotificationDetailsById>(
        `${GET_NOTIFICATION_BY_ID}${NotificationId}?notificationFrequency=${NotificationFrequencyValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        if (res.data.isSuccess === true) {
          setDataNotificationDetailById(res.data);   
          const templId = res.data?.result?.notificationDetail[0]["templateId"];       
          setTempId(templId);
          if (res.data?.result?.notificationDetail[0]["referenceId"] != null) {
            setBadgeId(res.data?.result?.notificationDetail[0]["referenceId"]);
            setSopId(res.data?.result?.notificationDetail[0]["referenceId"]);
          }
          extractReminderFunationality(res.data);
          const text = res.data?.result?.notificationDetail[0].subject;
          if (text.includes("License")) {
            setLicenseNumber(extractLicenseNumber(res.data?.result?.notificationDetail[0].templateId, text));
          }
          setLicId(res.data?.result?.notificationDetail[0].referenceId);
        }
      });
  }
const extractReminderFunationality =(res :ResponseNotificationDetailsById)=>{
  res.result?.reminderDetail === null ||
  res.result?.reminderDetail === undefined
    ? setReminderNotVisible()
    : CheckReminder(res.result?.notificationDetail[0].reminderId);
  res.result?.notificationDetail[0].taskId === null ||
  res.result?.notificationDetail[0].taskId === undefined
    ? setTaskId(0)
    : setTaskId(res.result?.notificationDetail[0].taskId);
};
  const extractLicenseNumber = (id: number, text: string) => {
    switch (id) {
      case 1:
        return text.split("License ")[1].split(" will")[0];
      case 2:
        return text.split("License ")[1].split(" has")[0];
      case 3:
        return text.split("License ")[1].split(" needs attention.")[0];
      case 14:
        return text.split("License ")[1].substring(0);
      case 15:
      case 19:
        return text.split("License ")[1].split(" has")[0];
      case 16:
        return text.split("License ")[1].substring(0);
      default:
        break;
    }
  };

  /*Method for Update read and Unread data for notification */
  const fnUpdateNotiFicationDataReadUnread = (
    IsRead: number,
    DataSetNotification: ResultNotification[],
    NotificationId: number
  ) => {
    return DataSetNotification.map((item: ResultNotification) => {
      if (Number(item.notificationId) === Number(NotificationId)) {
        return { ...item, isRead: IsRead };
      }

      return item;
    });
  };

  /* updating local and global dataset with Read value */
  const updateNotificationRead = (NotificationId: number) => {
    setData([]);

    setDataNotificationsLocal(
      fnUpdateNotiFicationDataReadUnread(
        1,
        dataNotificationsLocal,
        NotificationId
      )
    );

    /*Update in main data set  */

    setData(fnUpdateNotiFicationDataReadUnread(1, data, NotificationId));
  };

  /*Method for updating local and global dataset with Unread value */
  const updateNotificationUnread = () => {
    setDataNotificationsLocal(
      fnUpdateNotiFicationDataReadUnread(
        0,
        dataNotificationsLocal,
        checkedNotificationId
      )
    );

    /* Update in main data set */
    setData(fnUpdateNotiFicationDataReadUnread(0, data, checkedNotificationId));
  };

  const fnDeleteNotificationsFromDataset = (
    DataSetNotification: ResultNotification[],
    NotificationId: number
  ) => {
    return DataSetNotification.filter((el: ResultNotification) => {
      if (el.notificationId !== NotificationId) {
        return el;
      }
    });
  };

  const updateNotificationDelete = (NotificationId: number) => {
    /* Deleting from local DataSet */
    setDataNotificationsLocal(
      fnDeleteNotificationsFromDataset(dataNotificationsLocal, NotificationId)
    );
    /* Deleting from Main DataSet */
    setData(fnDeleteNotificationsFromDataset(data, NotificationId));
  };

  function updateNotificationDataSet(NotificationId: number, flag: string) {
    switch (flag) {
      case "Read":
        updateNotificationRead(NotificationId);
        break;
      case "Delete":
        updateNotificationDelete(NotificationId);
        break;
      case "Unread":
        updateNotificationUnread();
        break;

      default:
        return null;
    }
  }

  const CheckPreviousNotificationIsUnreadState = (NotificationId: number) => {
    if (
      prvNotificationId !== 0 &&
      NotificationId !== prvNotificationId &&
      isPrvNotificationUnread === 1 &&
      checkedNotificationId === 0
    ) {
      updateNotificationDataSet(prvNotificationId, "Read");

      setIsPrvNotificationUnread(0);
    }
  };

  function fnResetSelection(check: boolean) {
    dataNotificationsLocal.forEach((element: ResultNotification) => {
      element.IsCurrentSelected = check;
    });
    data.forEach((element: ResultNotification) => {
      element.IsCurrentSelected = check;
    });
  }

  const handleNotificationClick = (
    NotificationId: number,
    NotificationType: string,
    _isRead: number,
    NotificationFrequencyValue: string
  ) => {
    if (prvNotificationId === NotificationId) return;

    setIsNotificationDetailsVisible(false);
    setLoaderVisible(true);

    setChecked(false);
    setSelectedNotificationId(NotificationId);
    setSelectedNotificationType(NotificationType);

    getNotificationsById(NotificationId,NotificationFrequencyValue);

    setIsNotificationDetailsVisible(true);
    setLoaderVisible(false);
    dataNotificationsLocal.map((el: ResultNotification) => {
      if (el.notificationId === NotificationId) {
        el.IsCurrentSelected = true;
      } else {
        el.IsCurrentSelected = false;
      }
    });

    CheckPreviousNotificationIsUnreadState(NotificationId);

    if (_isRead === 0) {
      setIsNotificationRead(true);
      /*Api Call of Read */
      updateNotificationReadUnreadClicked(NotificationId, true);

      if (prvNotificationId !== 0 && NotificationId !== prvNotificationId) {
        updateNotificationDataSet(prvNotificationId, "Read");
      }
    } else {
      if (
        prvNotificationId !== 0 &&
        NotificationId !== prvNotificationId &&
        _isRead === 0
      ) {
        updateNotificationDataSet(prvNotificationId, "Unread");
      }
    }
    if (
      checkedNotificationId !== 0 &&
      prvNotificationId !== 0 &&
      prvNotificationId !== NotificationId
    ) {
      updateNotificationDataSet(checkedNotificationId, "Unread");

      setCheckedNotificationId(0);
    }

    setPrvNotificationId(NotificationId);

    setIsPrvNotificationUnread(_isRead === 0 ? 1 : 0);
  };

  const HandleNotificationCloseClick = () => {
    fnResetSelection(false);
    setIsNotificationDetailsVisible(false);
    setLoaderVisible(false);
    handleFilterData(selectedFilterValue);
    setPrvNotificationId(0);
    setIsPrvNotificationUnread(0);
    setIsNotificationRead(false);
  };

  const handleCheckboxChange: any = (e: any) => {
    const isChecked = e.target.checked;
    const NotificationId = e.target.value;
    setChecked(isChecked);
    if (isChecked === true) {
      setCheckedNotificationId(NotificationId);
    } else {
      setCheckedNotificationId(0);
    }
    /*api call */
    updateNotificationReadUnreadClicked(NotificationId, !isChecked);

    const DataNotifications = data;

    const UpdatedNotificationData = DataNotifications.map((item: any) => {
      if (Number(item.notificationId) === Number(NotificationId)) {
        return { ...item, isRead: !isChecked === true ? 1 : 0 };
      }

      return item;
    });

    setData([]);
    setData(UpdatedNotificationData);
  };

  const handleDropdownChange: any = (e: any) => {
    const NotificationId = selectedNotificationId;
    const reminderId = e.target.value;
    setReminderValue(0);
    const userData = decodeToken(token);
    const tokenUserId = userData.UserId;
    updateReminderNotificationAPICall(NotificationId, reminderId, tokenUserId);
    setReminderValue(reminderId);
  };

  const updateReadUnreadNotificationAPICall = (
    RequestObj: NotificationUpdateObj
  ) => {
    axios.put<ResponseNotification>(
      UPDATE_READ_UNREAD_NOTIFICATION,
      RequestObj,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const updateReminderNotificationAPICall = (
    NotificationId: number,
    reminderId: number,
    UserId: number
  ) => {
    const RequestObj = {
      notificationId: NotificationId,
      userId: UserId,
      reminderId: reminderId,
    };

    axios.put<ResponseNotification>(UPDATE_NOTIFICATION_REMINDER, RequestObj, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const updateNotificationReadUnreadClicked = (
    NotificationId: number,
    isRead: boolean
  ) => {
    const ReqNotification = {
      notificationId: NotificationId,
      isRead: isRead,
    };

    updateReadUnreadNotificationAPICall(ReqNotification);
  };
  const ResetFilter = () => {
    setIsReadFilterActive(false);
    setIsAllFilterActive(false);
    setIsLicenseFilterActive(false);
    SetIsUnreadFilterActive(false);

    setDataNotificationsLocal([]);

    setPrvNotificationId(0);
    setIsPrvNotificationUnread(0);
    setIsNotificationDetailsVisible(false);
  };
  const isSelectedNotificationRead = (DataSet: ResultNotification[]) => {
    const UpdatedDataSet = DataSet.map((item: any) => {
      if (Number(item.notificationId) === Number(selectedNotificationId)) {
        return { ...item, isRead: 1 };
      }

      return item;
    });
    setData(UpdatedDataSet);

    setDataNotificationsLocal(UpdatedDataSet);
    return UpdatedDataSet;
  };

  const isSelectedNotificationUnRead = (DataSet: ResultNotification[]) => {
    const UpdatedDataSet = DataSet.map((item: ResultNotification) => {
      if (Number(item.notificationId) === Number(selectedNotificationId)) {
        return { ...item, isRead: 0 };
      }

      return item;
    });

    if (isNotificationDetailsVisible) {
      UpdatedDataSet.forEach((element: ResultNotification) => {
        element.IsCurrentSelected = false;
      });
    }

    setDataNotificationsLocal(UpdatedDataSet);
    return UpdatedDataSet;
  };

  const ReadNotificationDataFilter = (DataSet: ResultNotification[]) => {
    setScrollBottom(true);
    handleVerticalScroll();
    const objFilterResult: any = DataSet?.filter(
      (readObj: any) => readObj.isRead === 1
    )
      .sort((a: ResultNotification, b: ResultNotification) =>
        a.isRead > b.isRead ? 1 : -1
      )
      .sort((b: ResultNotification, c: ResultNotification) =>
        b.notificationCreatedDate < c.notificationCreatedDate ? 1 : -1
      );
    setDataNotificationsLocal(objFilterResult);
    setIsReadFilterActive(true);
    setScrollBottom(false);
    return objFilterResult;
  };

  const LicenseOnlyDataFilter = (DataSet: ResultNotification[]) => {
    setScrollBottom(true);
    handleVerticalScroll();
    setIsLicenseFilterActive(true);
    const objFilterResult: ResultNotification[] = DataSet?.filter(
      (readObj: ResultNotification) =>
        readObj.notificationType === "License" ||
        readObj.notificationType === "Self-Audit"
    );
    objFilterResult.sort((a: ResultNotification, b: ResultNotification) =>
      a.isRead > b.isRead ? 1 : -1
    );

    setDataNotificationsLocal(objFilterResult);
    setScrollBottom(false);

    return objFilterResult;
  };

  const UnReadNotificationDataFilter = (DataSet: ResultNotification[]) => {
    setScrollBottom(true);
    handleVerticalScroll();
    const objFilterResult: any = DataSet?.filter(
      (readObj: any) => readObj.isRead === 0
    )
      .sort((a: ResultNotification, b: ResultNotification) =>
        a.isRead > b.isRead ? 1 : -1
      )
      .sort((b: ResultNotification, c: ResultNotification) =>
        b.notificationCreatedDate < c.notificationCreatedDate ? 1 : -1
      );

    setDataNotificationsLocal(objFilterResult);
    SetIsUnreadFilterActive(true);
    setScrollBottom(false);
    return objFilterResult;
  };

  const AllNotificationDataFilter = (DataSet: ResultNotification[]) => {
    setScrollBottom(true);
    handleVerticalScroll();
    setDataNotificationsLocal([]);
    setIsAllFilterActive(true);
    const dataMain = DataSet;
    DataSet.sort((a: ResultNotification, b: ResultNotification) =>
      a.isRead > b.isRead ? 1 : -1
    );

    setDataNotificationsLocal(dataMain);
    setScrollBottom(false);
  };

  function handleFilterData(FilterValue: string) {
    let objFilterData = data;
    ResetFilter();
    if (isNotificationRead && checkedNotificationId === 0) {
      objFilterData = isSelectedNotificationRead(objFilterData);

      setIsNotificationRead(false);
    }
    if (checkedNotificationId > 0) {
      objFilterData = isSelectedNotificationUnRead(objFilterData);

      setCheckedNotificationId(0);
    }

    switch (FilterValue) {
      case "Read": {
        ReadNotificationDataFilter(objFilterData);
        break;
      }
      case "UnRead": {
        UnReadNotificationDataFilter(objFilterData);
        break;
      }
      case "LicenseOnly": {
        LicenseOnlyDataFilter(objFilterData);
        break;
      }
      case "All": {
        AllNotificationDataFilter(objFilterData);
        break;
      }
      default: {
        return null;
        break;
      }
    }
  }

  const handleFilterClick = (FilterValue: string) => {
    if (selectedFilterValue === FilterValue) return;

    fnResetSelection(false);
    setSelectedFilterValue(FilterValue);
    handleFilterData(FilterValue);
  };

  const NotificationDetailsById = () => {
    return (
      <div className="NotificationsDetails">
        <div>
          <div className="notifyCancelIconContainer">
            <CancelOutlinedIcon
              onClick={HandleNotificationCloseClick}
            ></CancelOutlinedIcon>
          </div>
          <ul className="notificationUl">
            <li className="notificationDesc">
              <h4 className="notificationDetailsTitle">
                {dataNotificationDetailById?.result?.notificationDetail
                  .length !== 0
                  ? dataNotificationDetailById?.result.notificationDetail[0][
                      "notificationTitle"
                    ]
                  : ""}
              </h4>

              <p className="notificationDetailsDescription">
                {dataNotificationDetailById?.result?.notificationDetail
                  .length !== 0
                  ? dataNotificationDetailById?.result.notificationDetail[0][
                      "body"
                    ]
                  : ""}
              </p>
            </li>
          </ul>
        </div>
        <div className="notificationMarkDiv">
          <Checkbox
            name="notificationIsReadChkBox"
            checked={checked}
            sx={{ padding: 1 }}
            onChange={(e) => {
              handleCheckboxChange(e);
            }}
            value={
              dataNotificationDetailById?.result?.notificationDetail.length !==
              0
                ? dataNotificationDetailById?.result.notificationDetail[0][
                    "notificationsId"
                  ]
                : 0
            }
          />
          <span>Mark as unread</span>
        </div>

        <div className="margin-bottom">
          <div className="ReminderLabel">
            {reminderVisible && (
              <h6 className="ReminderTextLabel">Set a reminder</h6>
            )}
          </div>
          <div className="ActionControls">
            <div>
              {reminderVisible && (
                <div className="col-sm-6 col-12 paddingSelectBox NotificationFormConatainer">
                  <Select
                    size="small"
                    name="ReminderSelect"
                    displayEmpty
                    defaultValue={defaultReminderValue}
                    value={reminderValue}
                    inputProps={{ "aria-label": "Without label" }}
                    variant="filled"
                    className="input-form select-field"
                    IconComponent={CustomExpandMore}
                    onChange={handleDropdownChange}
                  >
                    <MenuItem disabled value="0">
                      <span className="input-placeholder">Choose one</span>
                    </MenuItem>
                    <MenuItem value={1}>Every 24 hours</MenuItem>
                    <MenuItem value={2}>Every week</MenuItem>
                    <MenuItem value={3}>Once a month</MenuItem>
                  </Select>
                </div>
              )}
            </div>
            {ValidateRole([
              SystemAdministrator,
              DirectorOfCompliance,
              ComplianceAnalyst,
              DirectorOfRetailOperations,
              GeneralManager,
              TeamLead,
            ]) && (
              <>
                <span>
                  {isNotificationDetailsVisible && (
                    <CommonButtonCompo></CommonButtonCompo>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CommonButtonCompo = () => {
    switch (selectedNotificationType) {
      case "Task":
        return (
          <Button
            className="PrimaryButton"
            variant="contained"
            onClick={() =>
              history.push("/task-details", {
                organizationTaskId:
                  dataNotificationDetailById?.result.notificationDetail[0][
                    "referenceId"
                  ],
              })
            }
          >
            See Task
          </Button>
        );
      case "License":
        return CommonLicenseButton();
      case "Self-Audit":
        return selfAuditbuttonAccTemptId();
      case "SOP":
        return (
          <Button
            className="PrimaryButton"
            variant="contained"
            onClick={() => {
              if (sopId != null) {
                getSopDetails();
              }
            }}
          >
            See SOP
          </Button>
        );
      case "Employee Badge":
        return (
          <Button
            className="PrimaryButton"
            variant="contained"
            onClick={() => {
              getEmpBadgeDtl(badgeId);
            }}
          >
            See Employee
          </Button>
        );
      case "Vehicle Insurance":
        return <CommonVehicleButton></CommonVehicleButton>;
      case "Vehicle License":
        return <CommonVehicleButton></CommonVehicleButton>;

      default:
        return null;
    }
  };

  const Push = () => {
    history.push("/license-details", {
      licenseId: licId,
      licenseNumber: licenseNumber,
    });
  };
  function CommonLicenseButton() {
    return (
      <Button
        className="PrimaryButton"
        variant="contained"
        onClick={() => {
          Push();
        }}
      >
        See License
      </Button>
    );
  }

  const SeeTaskButton = (organizationTaskId: number) => {
    return (
      <Button
        className="PrimaryButton"
        variant="contained"
        onClick={() =>
          history.push("/task-details", {
            organizationTaskId: organizationTaskId,
          })
        }
      >
        See Task
      </Button>
    );
  };

  const CreateTaskButton = () => {
    return (
      <Button
        className="PrimaryButton"
        variant="contained"
        sx={{ whiteSpace: "nowrap" }}
        onClick={() => setCreateTask(true)}
      >
        Create a Task
      </Button>
    );
  };

  const TaskButton = (id: number) => {
    if (id === 0) {
      return <CreateTaskButton />;
    } else {
      return SeeTaskButton(id);
    }
  };

  function CommonVehicleButton() {
    return (
      <Button
        className="PrimaryButton"
        variant="contained"
        onClick={() =>
          history.push("/vehicle-details", {
            vehicleId:
              dataNotificationDetailById?.result.notificationDetail[0][
                "referenceId"
              ],
          })
        }
      >
        See Vehicle
      </Button>
    );
  }
  function GetFilterClassName(Condition: boolean) {
    if (Condition) {
      return "LinkWrapperActive";
    } else {
      return "LinkWrapperInactive";
    }
  }

  function GetNotificationClassName(IsRead: number, IsSelected: boolean) {
    let ClassName = "";
    if (IsRead === 0) {
      ClassName = "NBar UnReadBackgroundColor";
    } else {
      ClassName = "NBar ReadBackgroundColor";
    }

    if (IsSelected) {
      ClassName += " selectionClass";
    }

    return ClassName;
  }

  function GetNotificationClassNameForSelection(
    IsRead: number,
    IsSelected: boolean
  ) {
    let ClassName = "divCancelIconContainer ";
    if (IsRead === 0 && IsSelected === false) {
      ClassName += " UnReadBackgroundColor";
    } else if (IsRead === 0 && IsSelected === true) {
      ClassName += "  selectionClass";
    } else if (IsRead === 1 && IsSelected === true) {
      ClassName += "  ReadBackgroundColor";
    } else {
      return ClassName;
    }
    return ClassName;
  }

  const addTaskData = () => {
    setMessageToUser("Task Created");
    setShowMessageToUser(true);
    setTimeout(() => {
      setShowMessageToUser(false);
    }, 4000);
  };

  const toolTip = (value: string, len: number) => {
    const newLength = width <= 1024 ? 30 : len;
    if (value !== null && value.length > newLength) {
      return (
        <Tooltip title={value} placement="top-start" arrow>
          <div className="NotificationContentEllipsis">{value}</div>
        </Tooltip>
      );
    } else {
      return <div className="NotificationContentNoEllipsis">{value}</div>;
    }
  };

  return (
    <div className="container notification-container">
      <div className="d-flex flex-row">
        <div className="page-title">Notifications</div>
      </div>
      {loaderVisible && (
        <div className="LoaderWrapper">
          <CircularProgress />
        </div>
      )}
      {createTask && (
        <TaskForm
          setOpen={setCreateTask}
          open={createTask}
          addTaskData={addTaskData}
          fromLicense={false}
          fromNotification={true}
          setTaskId={setTaskId}
          licenseNumber={licenseNumber}
          licId={licId.toString()}
          notId={
            dataNotificationDetailById?.result.notificationDetail[0][
              "notificationsId"
            ]
          }
        />
      )}

      {dataCount === false ? (
        <>
          {!loaderVisible && (
            <div className=" filter-row-wrapper d-flex">
              <div className="filter-by-text-wrapper bold-text">Filter By:</div>
              <div className="ms-4">
                <Container
                  className={GetFilterClassName(isAllFilterActive)}
                  onClick={() => {
                    handleFilterClick("All");
                  }}
                >
                  All
                </Container>
              </div>

              <div className="ms-4">
                <Container
                  onClick={() => {
                    handleFilterClick("UnRead");
                  }}
                  className={GetFilterClassName(isUnreadFilterActive)}
                >
                  Unread
                </Container>
              </div>

              <div className="ms-4">
                <Container
                  onClick={() => {
                    handleFilterClick("Read");
                  }}
                  className={GetFilterClassName(isReadFilterActive)}
                >
                  Read
                </Container>
              </div>

              <div className="ms-4">
                <Container
                  onClick={() => {
                    handleFilterClick("LicenseOnly");
                  }}
                  className={GetFilterClassName(isLicenseFilterActive)}
                >
                  License only
                </Container>
              </div>
            </div>
          )}

          <div className="notification-sub-class">
            <div ref={refNoteScroll} className="MainContainer">
              {dataNotificationsLocal?.map((item: any, index: number) => (
                <div
                  className={GetNotificationClassName(
                    Number(item.isRead),
                    item.IsCurrentSelected
                  )}
                >
                  <div
                    className="NotificationTextLabel"
                    onClick={() => {
                      handleNotificationClick(
                        item.notificationId,
                        item.notificationType,
                        item.isRead,
                        item.notificationFrequency
                      );
                    }}
                  >
                    {item.isRead === 0 ? (
                      <span
                        key={index}
                        className="notification-state-label-unread"
                      >
                        Unread
                      </span>
                    ) : (
                      <span
                        key={index}
                        className="notification-state-label-read"
                      >
                        Read
                      </span>
                    )}
                    <div className="notification-content-ellipsis-wrraper">
                      {toolTip(item.notificationTitle, 45)}
                    </div>
                  </div>
                  <div
                    className={GetNotificationClassNameForSelection(
                      item.isRead,
                      item.IsCurrentSelected
                    )}
                  >
                    <CancelOutlinedIcon
                      sx={{ fontSize: "medium" }}
                      onClick={() => {
                        setSelectedNotificationId(item.notificationId);
                        setIsConfirmationDialog(true);
                      }}
                    ></CancelOutlinedIcon>
                  </div>
                </div>
              ))}
            </div>
            {isNotificationDetailsVisible && (
              <NotificationDetailsById></NotificationDetailsById>
            )}
            {isConfirmationDialog && (
              <DialogConfirmationBox
                Message="Are you sure you want to delete this Notification?"
                onConfirm={() => {
                  handleDelete(selectedNotificationId);
                  setIsConfirmationDialog(false);
                  setMessageToUser("Notification Dismissed");
                  setShowMessageToUser(true);
                }}
                onCancel={() => setIsConfirmationDialog(false)}
                ConfirmationBtnText="Yes"
                CancelBtnText="No"
              ></DialogConfirmationBox>
            )}
            {showMessageToUser && <SuccessToaster message={messageToUser} />}
          </div>
        </>
      ) : (
        <div>
          <h4 className="TextCenter">No notifications found</h4>
        </div>
      )}
    </div>
  );
};

export default Notifications;
