import React, { useRef, useEffect, useState, useCallback } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BellIcon from "../../../components/Icons/BellIcon";
import {
  Button,
  Select,
  SelectChangeEvent,
  MenuItem,
  CardContent,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";

import {
  GET_TASK_DETAILS,
  ADD_TASK_NOTE,
  EDIT_TASK_DETAILS,
} from "../../../networking/httpEndPoints";
import { ComplianceAnalyst, TeamLead } from "../../../utilities/constants";
import { roleValidator } from "../../../utilities/roleValidator";
import AddTooltip from "../../../components/AddTooltip";
import BackButton from "../../../components/Icons/BackButtonIcon";

const selectHeight = makeStyles({
  paper: {
    "& .MuiPopover-paper": {
      maxHeight: "calc(50% - 17px) !important",
    },
  },
});

const useStyles = makeStyles({
  root: {
    "& .MuiFilledInput-root:before": {
      borderBottom: "none!important",
    },
  },
  helperText: {
    marginLeft: "0px!important",
  },

  container: {
    "&::-webkit-scrollbar": {
      width: "10px",
    } /* Chrome */,
    "&::-webkit-scrollbar-thumb": {
      background: "#B1B1B1",
      borderRadius: "5px",
      height: "62px",
    },
  },
});

interface ComponentProps {
  active?: boolean;
}

const EditTitleIcon = styled.i<ComponentProps>`
  display: ${(props) => (props.active ? "block" : "none")};
  font-size: 14px;
  color: ${(props) => (props.active ? "#233ce6" : "#001e46")};
  margin-left: 12px;
  cursor: pointer;
`;

const HeadingText = styled.span<ComponentProps>`
  font: normal normal 600 25px/30px Urbanist;
  letter-spacing: 0px;
  color: ${(props) => (props.active ? "#233ce6" : "#001e46")};
  opacity: 1;
  cursor: pointer;
  margin-left: 20px;
`;

enum StaticText {
  noteLengthValidation = "Note cannot be more than 1500 characters",
}

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface TaskDetailsResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface AuthRoleType {
  user: {
    role?: string;
    organizationId?: number | null;
  };
}

interface IOrganizationEmployeesDetails {
  name: string;
  role: string;
  email: string;
  badgeId: string;
  employeeId: number;
  userId: number;
  otherRoleDescription?: string;
  badges: [
    {
      name: string;
      status: string;
    }
  ];
}

interface INoteData {
  createdbyName: string;
  createdAt: string;
  note?: string;
}

export default function ViewTaskDetails() {
  const CheckNull = () => {
    if (history.location.state)
      return history.location.state.organizationTaskId;
    else return null;
  };
  const selectclasses = selectHeight();
  const classes = useStyles();
  const history = useHistory();
  const organizationTaskId = CheckNull();
  const [data, setData] = useState<any | null>(null);
  const userState = useSelector((state: AuthRoleType) => state.user);
  const [updateTaskDetail, setUpdateTaskDetail] = useState<boolean>(false);
  const [updateNoteDetail, setUpdateNoteDetail] = useState<boolean>(false);
  const [taskCreatedBys, setTaskCreatedBys] = useState<any | null>(null);
  const [taskAssignedTos, setTaskAssignedTos] = useState<any[]>([
    { name: "NA", employeeId: 0 },
  ]);
  const [taskStatuses, setTaskStatuses] = useState<any[]>([
    { taskStatusId: 0, taskStatus: "" },
  ]);
  const [disableFlag, setDisableFlag] = React.useState(true);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);

  const [userDefinedError, setUserDefinedError] = React.useState(false);
  const [notesData, setnotesData] = useState<any | null>(null);
  const [noteErrorText, setNoteErrorText] = useState<any | null>(null);
  const [noteError, setNoteError] = useState(false);
  const [isClickedOnNote, setisClickedOnNote] = useState<boolean>(false);
  const noteTextBoxValRef = useRef<HTMLInputElement>(null);

  const [assignedFlag, setAssignedFlag] = useState<boolean>(false);
  const [editButton, setEditButton] = React.useState("Edit");
  const [taskDescriptionErrorText, setTaskDescriptionErrorText] = useState("");
  const [taskDescriptionError, setTaskDescriptionError] = useState(false);
  const [prevDescription, setPrevDescription] = React.useState("");
  const refTaskDescription = useRef<any>();
  const [taskDescriptionNotEditable, setTaskDescriptionNotEditable] =
    React.useState(true);
  const [noteconfirmationModalIsVisible, setNoteConfirmationModalIsVisible] =
    useState(false);
  const [disableStatusFlag, setDisableStatusFlag] = React.useState(false);
  const [disableEditButton, setDisableEditButton] = useState<any | null>(null);
  const [disableAssignFlag, setDisableAssignFlag] = React.useState(false);
  const [previousTaskStatusId, setPreviousTaskStatusId] = useState<any | null>(
    null
  );
  const [enableCompleteFlag, setEnableCompleteFlag] = React.useState(false);
  const [over, setOver] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loader, setLoader] = React.useState(false);
  const [taskTitleError, setTaskTitleError] = useState(false);
  const [titleErrorText, setTitleErrorText] = useState("");
  const [prevTaskAssignedTo, setPrevTaskAssignedTo] = React.useState("");
  const refNoteScroll = React.useRef<HTMLDivElement>(null);
  const refChildDiv = React.useRef<HTMLDivElement>(null);
  const [scrollBottom, setScrollBottom] = useState(false);

  const getTaskDetails = useCallback(() => {
    getTask();
  }, [organizationTaskId]);

  const getTask = () => {
    setLoader(true);
    const token = localStorage.getItem("user");
    axios
      .get<TaskDetailsResponse>(`${GET_TASK_DETAILS}${organizationTaskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          res.data.result.organizationEmployeesDetails =
            filterEmployeesWithoutOther(
              res.data.result.organizationEmployeesDetails
            );
          getTasksDetailsResponse(res);

          setTimeout(() => {
            setLoader(false);
          }, 2000);
        } else if (res.status === 200 && res.data.isSuccess === false) {
          handleFalseSuccess(res);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      });
  };

  const filterEmployeesWithoutOther = (
    employees: Array<IOrganizationEmployeesDetails>
  ) => {
    return employees.filter(
      (filterData: IOrganizationEmployeesDetails) =>
        filterData.role?.toLowerCase() !== "other"
    );
  };

  const handleFalseSuccess = (res: any) => {
    setData(null);
    setTaskCreatedBys(null);
    setTaskAssignedTos([]);
    setUserDefinedError(true);
    Swal.fire({
      text: res.data.responseMessage,
      confirmButtonText: "OK",
      icon: "error",
    });
  };

  const getTasksDetailsResponse = (res: any) => {
    const taskDetails = res.data.result["taskDetailsModel"];
    setData(taskDetails);
    setPrevDescription(taskDetails.taskDescription);
    setPreviousTaskStatusId(taskDetails.taskStatusID);
    setPrevTaskAssignedTo(taskDetails.taskAssignedTo);
    const oraganizationUsers = res.data.result["organizationEmployeesDetails"];
    const filteredUsers = oraganizationUsers.filter(
      (element: IOrganizationEmployeesDetails) =>
        element.userId === taskDetails["createdBy"]
    )[0];
    setTaskCreatedBys(filteredUsers.name);
    setTaskAssign(res);
    setTaskStatuses(taskStatuses);
    setData(res.data.result["taskDetailsModel"]);
    const sortedResult = res.data.result["notesModelslist"].sort(
      (first: any, second: any) =>
        0 - (first.createdAt > second.createdAt ? -1 : 1)
    );
    setnotesData(sortedResult);
    setTaskStatusIDCond(taskDetails);
  };

  const setTaskAssign = (res: any) => {
    const oraganizationEmployees =
      res.data.result["organizationEmployeesDetails"];
    oraganizationEmployees.forEach(function (element: any) {
      taskAssignedTos.push({
        employeeId: element.employeeId,
        name: element.name,
        userid: element.userId,
      });
    });
    setTaskAssignedTos(oraganizationEmployees);
    const organizationTaskStatus = res.data.result["taskStatuses"];
    taskStatuses.splice(0, taskStatuses.length);
    organizationTaskStatus.forEach(function (element: any) {
      taskStatuses.push({
        taskStatusId: element.taskStatusId,
        taskStatus: element.taskStatus,
      });
    });
  };

  const setTaskStatusIDCond = (taskDetails: any) => {
    if (taskDetails.taskStatusID === 3) {
      setDisableAssignFlag(true);
      setDisableStatusFlag(true);
      setDisableFlag(true);
      setDisableEditButton("none");
    }
    if (taskDetails.taskStatusID === 2) {
      (roleValidator(userState["role"]) === ComplianceAnalyst ||
        roleValidator(userState["role"]) === TeamLead) &&
        setEnableCompleteFlag(true);
    }
  };

  useEffect(() => {
    getTaskDetails();
  }, [getTaskDetails, updateTaskDetail, updateNoteDetail]);

  const handleAssignedToSelectFieldChange = (e: SelectChangeEvent<any>) => {
    setDisableFlag(false);
    setAssignedFlag(true);
    const newFormValues = Object.assign({}, data);
    const targetKey = taskAssignedTos.filter(
      (element: any) => element.name === String(e.target.value)
    )[0].userId;
    newFormValues[e.target.name] = String(e.target.value);
    newFormValues["taskAssignedTo"] = targetKey;
    if (e.target.name === "assignedTo" && e.target.value !== "") {
      newFormValues["assignedToTypeError"] = false;
    }
    if (e.target.name === "assignedTo" && e.target.value === "") {
      newFormValues["assignedToTypeError"] = true;
    }
    setData(newFormValues);
  };

  const handleTaskStatusSelectFieldChange = (e: SelectChangeEvent<any>) => {
    setDisableFlag(false);
    setAssignedFlag(true);
    const newFormValues = Object.assign({}, data);
    const targetKey = taskStatuses.filter(
      (element: any) => element.taskStatus === String(e.target.value)
    )[0].taskStatusId;
    newFormValues[e.target.name] = String(e.target.value);
    newFormValues["taskStatusID"] = targetKey;
    if (e.target.name === "taskStatus" && e.target.value !== "") {
      newFormValues["taskStatusTypeError"] = false;
    }
    if (e.target.name === "taskStatus" && e.target.value === "") {
      newFormValues["taskStatusTypeError"] = true;
    }
    setData(newFormValues);
  };

  const handleTaskDescriptionFieldChange = (e: {
    target: { name: string; value: string };
  }) => {
    setTaskDescriptionError(false);
    const newFormValues = Object.assign({}, data);
    newFormValues[e.target.name] = String(e.target.value);
    if (e.target.name === "taskDescription" && e.target.value !== "") {
      newFormValues["taskStatusTypeError"] = false;
    }
    if (e.target.name === "taskDescription" && e.target.value === "") {
      newFormValues["taskStatusTypeError"] = true;
    }
    setData(newFormValues);
  };

  const handleSaveTaskDetail = () => {
    if (validateSaveFields()) {
      setDisableFlag(true);
      setAssignedFlag(false);
      setTaskDescriptionNotEditable(true);
      NotificationType();
      updateTaskDetails();
    }
  };

  const handleSaveEditTitle = () => {
    if (editTitle && newTitle.trim().length === 0) {
      setTaskTitleError(true);
      setTitleErrorText("Title left blank");
    } else {
      handleSaveTaskDetail();
    }
  };

  const handleEditTaskDetail = () => {
    if (editButton === "Cancel") {
      data["taskDescription"] = prevDescription;
      if (assignedFlag === false) {
        setDisableFlag(true);
      }
      setTaskDescriptionNotEditable(true);
      setEditButton("Edit");
      setTaskDescriptionErrorText("");
    } else {
      setDisableFlag(false);
      setEditButton("Cancel");
      setTaskDescriptionNotEditable(false);
      refTaskDescription.current.focus();
    }
  };

  const clickedOnNoteField = (isclicked: boolean) => {
    setisClickedOnNote(isclicked);
  };

  const handleNoteCancel = () => {
    setNoteErrorText("");
    noteTextBoxValRef.current!.value = "";

    setNoteError(false);
    setisClickedOnNote(false);
    clickedOnNoteField(false);
  };

  const handleNoteSave = () => {
    const Result = validateFields();
    if (Result) saveNote();
  };

  const validateFields = (): boolean => {
    let res = true;
    const noteTextBoxval = noteTextBoxValRef.current?.value.toString().trim();

    if (noteTextBoxval?.length === 0) {
      res = false;
      setNoteError(true);
    }
    if (
      noteTextBoxval !== undefined &&
      noteTextBoxval.toString().trim().length > 1500
    ) {
      setNoteError(true);
      setNoteErrorText(StaticText.noteLengthValidation);
      res = false;
    }
    return res;
  };

  const saveNote = () => {
    let params;
    const noteData = noteTextBoxValRef.current?.value.trim();
    const token = localStorage.getItem("user");
    if (noteData && noteData.length !== 0) {
      params = {
        taskId: organizationTaskId,
        notes: noteData,
        TaskName: data.taskName,
        TaskAssignedTo: data.taskAssignedTo,
        CreatedBy: data.createdBy,
      };
    }
    if (token !== null) {
      axios
        .post<any>(ADD_TASK_NOTE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 201 && res.data.isSuccess === true) {
            SaveNoteResponse();
          }
        });
    }
  };

  const SaveNoteResponse = () => {
    getTask();
    if (noteTextBoxValRef.current !== null) {
      noteTextBoxValRef.current.value = "";
    }
    setNoteError(false);
    setUpdateNoteDetail(!updateNoteDetail);
    setisClickedOnNote(false);
    clickedOnNoteField(false);
    setNoteConfirmationModalIsVisible(true);
    setScrollBottom(true);
    setTimeout(() => {
      setNoteConfirmationModalIsVisible(false);
    }, 4000);
  };

  const handleNoteTextboxClick = () => {
    setisClickedOnNote(true);
    clickedOnNoteField(true);
  };

  const validateSaveFields = () => {
    let validate = true;
    if (data["taskDescription"].trim().length === 0) {
      validate = false;
      setTaskDescriptionErrorText("Description cannot be blank.");
    }
    if (data["taskDescription"].trim().length > 1000) {
      validate = false;
      setTaskDescriptionErrorText(
        "Description cannot be more than 1000 characters."
      );
    }
    CheckValidation(validate);
    return validate;
  };

  const CheckValidation = (validate: boolean) => {
    if (validate === false) {
      setTaskDescriptionError(true);
      setDisableFlag(false);
      setEditButton("Cancel");
      refTaskDescription.current.focus();
    } else {
      setDisableFlag(true);
      setEditButton("Edit");
    }
  };

  const TaskStatusnotificationTypes = (taskStatusID: number): string => {
    switch (taskStatusID) {
      case 3:
        return "TASK_DONE";
      case 2:
        return "TASK_COMPLETE";
      case 1:
        return "TASK_REOPEN";
      default:
        return "";
    }
  };

  const NotificationType = (): string => {
    let ruleCodes = "";
    if (prevDescription.trim() !== data["taskDescription"].trim()) {
      ruleCodes =
        ruleCodes === "" ? "TASK_DESC_UPDATE" : ruleCodes + ",TASK_DESC_UPDATE";
    }
    if (previousTaskStatusId !== data["taskStatusID"]) {
      const ruleCode = TaskStatusnotificationTypes(data["taskStatusID"]);
      ruleCodes = ruleCodes === "" ? ruleCode : ruleCodes + "," + ruleCode;
    }
    if (prevTaskAssignedTo !== data["taskAssignedTo"]) {
      ruleCodes =
        ruleCodes === "" ? "TASK_REASSIGNED" : ruleCodes + ",TASK_REASSIGNED";
    }
    return ruleCodes;
  };

  const updateTaskDetails = () => {
    const token = localStorage.getItem("user");
    const taskDetailData = {
      taskId: data.taskId,
      taskAssignedTo: data.taskAssignedTo,
      taskStatusId: data.taskStatusID,
      taskDescription: data.taskDescription,
      taskName:
        newTitle.length !== 0
          ? newTitle.trim().split(/ +/).join(" ")
          : data.taskName,
      notificationType: NotificationType(),
      taskUnAssignedTo: prevTaskAssignedTo,
    };

    axios
      .put<TaskDetailsResponse>(EDIT_TASK_DETAILS, taskDetailData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && !res.data.isSuccess) {
          Swal.fire({
            text: res.data.responseMessage,
            confirmButtonText: "OK",
            icon: "error",
          });
        } else if (res.status === 200 && res.data.isSuccess) {
          setPrevDescription(data.taskDescription);
          setConfirmationModalIsVisible(true);
          setTimeout(() => {
            setConfirmationModalIsVisible(false);
          }, 4000);
          setUpdateTaskDetail(!updateTaskDetail);
          setEditTitle(false);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      });
  };

  const displayTaskStatus = (taskStatusId: any): string => {
    switch (previousTaskStatusId) {
      case 3:
        return "none";
      case 2:
        if (enableCompleteFlag) {
          if (taskStatusId !== 2) {
            return "none";
          }
        } else {
          if (taskStatusId === 2) {
            return "none";
          }
        }
        return "Visible";
      case 1:
        return taskStatusId !== 2 ? "none" : "Visible";
      default:
        return "Visible";
    }
  };

  const fillTitleEditField = () => {
    setNewTitle(data["taskName"]);
  };
  const CheckNullData = () => {
    if (!data) {
      return (
        <>
          {!userDefinedError && (
            <div className="LoaderWrapper">
              <CircularProgress />
            </div>
          )}
        </>
      );
    }
  };

  const checkLength = () => {
    if (data["taskName"].length > 25) return data["taskName"];
    else return "";
  };

  const handleVerticalScroll = () => {
    const divElement = refNoteScroll.current;
    if (divElement) {
      const childDiv = refChildDiv.current?.clientHeight;
      const offsetBottom = childDiv;
      divElement.scrollTo({ top: offsetBottom });
      setScrollBottom(false);
    }
  };

  useEffect(() => {
    if (scrollBottom) {
      setTimeout(() => {
        handleVerticalScroll();
      }, 10);
    }
  });

  const LicenseNumberSubComponent = (): JSX.Element => {
    if (data["licenseNumber"] === null) {
      return <p className="RowWrapper">N/A</p>;
    } else if (data["licenseNumber"] != null) {
      return (
        <AddTooltip
          styleclass="RowWrapper"
          value={data["licenseNumber"]}
          len={12}
        />
      );
    } else {
      return <></>;
    }
  };

  const LicenseLevelSubComponent = (): JSX.Element => {
    if (data["licenseLevel"] === null) {
      return <p className="RowWrapper">N/A</p>;
    } else if (data["licenseLevel"] !== null) {
      return <p className="RowWrapper">{data["licenseLevel"]}</p>;
    } else {
      return <></>;
    }
  };
  return (
    <>
      <div className="container ViewTaskDetailContainer task-page-wrapper form-container">
        {CheckNullData()}
        {data && (
          <>
            {loader && (
              <div className="LoaderWrapper">
                <CircularProgress />
              </div>
            )}
            {!loader && (
              <>
                <div className="d-flex">
                  <div className="page-title TaskDetails">
                    <div className="flex-container">
                      <BackButton onClick={() => history.go(-1)} />
                      Task Details
                    </div>
                  </div>
                  <div className="ms-4 ms-auto">
                    <BellIcon />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="d-flex mb-4" style={{ alignItems: "center" }}>
                    <div className="me-auto">
                      <span
                        className="d-flex ms-2 p-1 UnderReviewWrapper"
                        style={{ alignItems: "center" }}
                      >
                        <i className="bi bi-list-task"></i>
                        {!editTitle && (
                          <div
                            className="d-flex"
                            onMouseOver={() => setOver(true)}
                            onMouseOut={() => setOver(false)}
                            onClick={() => {
                              fillTitleEditField();
                              setEditTitle(true);
                            }}
                          >
                            <AddTooltip value={data["taskName"]} len={25} />
                            <EditTitleIcon
                              active={over}
                              className="bi bi-pencil-square"
                            />
                          </div>
                        )}
                        {editTitle && (
                          <>
                            <div className="ms-2 TitleTextFieldWrapper">
                              <TextField
                                variant="filled"
                                error={taskTitleError}
                                helperText={
                                  taskTitleError ? titleErrorText : ""
                                }
                                hiddenLabel
                                placeholder="Enter task title"
                                type="text"
                                value={newTitle}
                                onChange={(e) => {
                                  setTaskTitleError(false);
                                  setNewTitle(e.target.value);
                                }}
                                InputProps={{
                                  style: {
                                    fontSize: 16,
                                    background: "#f4f5f8",
                                  },
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <ClearOutlinedIcon
                                        className="cursor-pointer"
                                        onClick={() => {
                                          setTaskTitleError(false);
                                          setNewTitle("");
                                          setEditTitle(false);
                                        }}
                                        fontSize="small"
                                      />
                                    </InputAdornment>
                                  ),
                                }}
                                inputProps={{ maxLength: 255 }}
                                className={`input-form form-control ${classes.root}`}
                              />
                            </div>
                            <div
                              className="ms-3 EditTitleSaveBtn"
                              onClick={() => {
                                handleSaveEditTitle();
                              }}
                            >
                              Save
                            </div>
                          </>
                        )}
                      </span>
                    </div>
                    {
                      <Button
                        className="SaveTaskDetailButton"
                        variant="contained"
                        onClick={handleSaveTaskDetail}
                        disabled={disableFlag}
                      >
                        Save
                      </Button>
                    }
                  </div>
                  <div className="row TaskDetailsWrapper">
                    <div className="col-sm-2">
                      <p className="SubTitle">License for this Task</p>
                      <LicenseNumberSubComponent />
                    </div>
                    <div className="col-sm-2">
                      <p className="SubTitle">License Level</p>
                      <LicenseLevelSubComponent />
                    </div>
                    <div className="col-sm-2">
                      <p className="SubTitle">Created By</p>
                      <div className="RowWrapper">
                        <AddTooltip value={taskCreatedBys} len={12} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <p className="SubTitle">Assigned to</p>
                      <div className="RowWrapperNew">
                        <Select
                          defaultValue=""
                          name="taskAssignedToName"
                          disabled={disableAssignFlag}
                          displayEmpty
                          value={data["taskAssignedToName"]}
                          onChange={(e) => {
                            handleAssignedToSelectFieldChange(e);
                          }}
                          inputProps={{ "aria-label": "Without label" }}
                          MenuProps={{
                            className: selectclasses.paper,
                          }}
                          variant="filled"
                          className="input-form select-field"
                          IconComponent={CustomExpandMore}
                          sx={{ background: "#f4f5f8" }}
                        >
                          <MenuItem disabled value="">
                            <span className="input-placeholder">
                              Select a Assigned to
                            </span>
                          </MenuItem>
                          {taskAssignedTos
                            .filter((_data) => _data.name !== "")
                            .map((type: any) => (
                              <MenuItem key={type.employeeId} value={type.name}>
                                <Tooltip
                                  title={type.name.length > 15 ? type.name : ""}
                                  placement="top"
                                  arrow
                                >
                                  <div className="AssignedToDiv">
                                    {type.name.length > 15
                                      ? type.name.substring(0, 14) + "..."
                                      : type.name}
                                  </div>
                                </Tooltip>
                              </MenuItem>
                            ))}
                        </Select>
                      </div>
                    </div>
                    <div className="col-sm-2 TaskStatus ">
                      <p className="SubTitle">Task Status</p>

                      <div className="RowWrapperNew">
                        <Select
                          defaultValue="Open"
                          name="taskStatus"
                          disabled={disableStatusFlag}
                          displayEmpty
                          value={data["taskStatus"]}
                          onChange={(e) => {
                            handleTaskStatusSelectFieldChange(e);
                          }}
                          inputProps={{ "aria-label": "Without label" }}
                          MenuProps={{
                            className: selectclasses.paper,
                          }}
                          variant="filled"
                          className="input-form select-field"
                          IconComponent={CustomExpandMore}
                          sx={{ background: "#f4f5f8" }}
                        >
                          <MenuItem disabled value="">
                            <span className="input-placeholder">
                              Select One
                            </span>
                          </MenuItem>
                          {taskStatuses.map((type: any) => (
                            <MenuItem
                              key={type.taskStatusId}
                              value={type.taskStatus}
                              style={{
                                display: displayTaskStatus(type.taskStatusId),
                              }}
                            >
                              <Tooltip
                                title={
                                  type.taskStatus.length > 5
                                    ? type.taskStatus
                                    : ""
                                }
                                placement="top"
                                arrow
                              >
                                <div className="AssignedToDiv">
                                  {type.taskStatus}
                                </div>
                              </Tooltip>
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 mb-2">
                  <div className="mb-2">
                    <i className="bi bi-clipboard-check"></i>
                    <span className="ms-2 p-1 ms-2 p-1 UnderReviewWrapper">
                      Task description
                    </span>
                    <div
                      className="EditLink LinkBold"
                      style={{ pointerEvents: disableEditButton }}
                      onClick={handleEditTaskDetail}
                    >
                      {editButton}{" "}
                      {editButton === "Edit" && (
                        <span className="EditLinkImg">
                          <i className="bi bi-pencil-square"></i>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="position-relative TaskDescriptionWrapperDiv">
                    <span className="TaskDescriptionWrapper">
                      <TextField
                        sx={{ marginLeft: "1%" }}
                        error={taskDescriptionError}
                        helperText={
                          taskDescriptionError ? taskDescriptionErrorText : ""
                        }
                        ref={refTaskDescription}
                        variant="standard"
                        multiline
                        maxRows={3}
                        fullWidth
                        disabled={taskDescriptionNotEditable}
                        name="taskDescription"
                        value={data["taskDescription"]}
                        onChange={handleTaskDescriptionFieldChange}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        FormHelperTextProps={{
                          className: classes.helperText,
                        }}
                      ></TextField>
                    </span>
                  </div>
                </div>

                <div className="mt-4 mb-5" style={{ width: "100%" }}>
                  <div className="mb-4">
                    <i className="bi bi-journal-text"></i>
                    <span className="ms-2 p-1 ms-2 p-1 UnderReviewWrapper">
                      Notes
                    </span>
                    <div>
                      <div
                        ref={refNoteScroll}
                        className={classes.container}
                        style={{ height: 150, overflowY: "scroll" }}
                      >
                        <div
                          ref={refChildDiv}
                          className="comment-widgets scrollable ps ps--active-y"
                        >
                          {notesData != null
                            ? notesData.map(
                                (noteData: INoteData, index: number) => {
                                  return (
                                    <Box
                                      sx={{ minWidth: 275, border: 0 }}
                                      key={index}
                                    >
                                      <React.Fragment>
                                        <CardContent>
                                          <Typography style={{ fontSize: 14 }}>
                                            <span className="NoteCreatedBy">
                                              {noteData.createdbyName === ""
                                                ? "NA"
                                                : noteData.createdbyName}
                                            </span>
                                            &nbsp; &nbsp;
                                            {new Date(
                                              noteData.createdAt
                                            ).toLocaleString("en-us", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </Typography>

                                          <p>{noteData["note"]}</p>
                                        </CardContent>
                                      </React.Fragment>
                                    </Box>
                                  );
                                }
                              )
                            : ""}
                        </div>
                      </div>
                    </div>
                    <hr className="HrLine"></hr>

                    <TextField
                      id="filled-textarea"
                      name="NoteName"
                      placeholder="Add a Note"
                      fullWidth
                      multiline
                      autoComplete="off"
                      error={noteError}
                      helperText={noteError ? noteErrorText : ""}
                      inputProps={{ maxLength: 1510 }}
                      variant="filled"
                      inputRef={noteTextBoxValRef}
                      onKeyPress={(ev) => {
                        setNoteErrorText("");
                        if (ev.key === "Enter") {
                          ev.preventDefault();
                          handleNoteSave();
                        }
                      }}
                      onClick={handleNoteTextboxClick}
                    />
                  </div>
                  <div>
                    {isClickedOnNote === true ? (
                      <Stack
                        spacing={1}
                        direction="row"
                        style={{ alignItems: "baseline" }}
                      >
                        <Button
                          className="SaveNoteButton"
                          variant="contained"
                          onClick={handleNoteSave}
                        >
                          Save
                        </Button>
                        <Button
                          className="ButtonCancel"
                          variant="text"
                          onClick={handleNoteCancel}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    ) : (
                      <div></div>
                    )}
                  </div>
                  <div className="position-relative"></div>
                </div>
              </>
            )}
          </>
        )}
        {noteconfirmationModalIsVisible && (
          <div className="TextPinWrapper">
            <div className="TextPin">
              <CheckCircleOutlineIcon></CheckCircleOutlineIcon>
              <span className="ms-2">Note Added</span>
            </div>
          </div>
        )}
        {confirmationModalIsVisible && (
          <div className="TextPinWrapper">
            <div className="TextPin">
              <CheckCircleOutlineIcon></CheckCircleOutlineIcon>
              <span className="ms-2">Changes Saved</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

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
