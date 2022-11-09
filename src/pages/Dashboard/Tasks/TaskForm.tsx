import React, { useState, useEffect, useRef, useLayoutEffect} from "react";

import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  MenuItem,
  Select,
  TextField,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import Swal from "sweetalert2";

import {
  GET_All_TYPE_LICENSES,
  GET_ALL_EMPLOYEES,
  ADD_TASK,
  UPDATE_NOTIFICATION_TASK,
} from "../../../networking/httpEndPoints";
import { keyValueMapper } from "../../../utils/keyValueMapper";

const useStyles = makeStyles({
  root: {
    "& .MuiFilledInput-root:before": {
      borderBottom: "none!important",
    },
  },
  helperText: {
    marginLeft: "0px!important",
  },
});

const formUnderline = makeStyles({
  root: {
    "& .MuiFilledInput-root:before": {
      borderBottom: "none !important",
    },
  },
});

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface EmployeeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface TaskType {
  open: boolean;
  setOpen: any;
  getTaskData?: any | null;
  addTaskData?: any | null;
  fromLicense?: boolean;
  fromNotification:boolean;
  setTaskId?:React.Dispatch<React.SetStateAction<number>>;
  licenseNumber?:string;
  licId?:string;
  notId?:number;
}
enum StaticText {
  titleValidation = "Title left blank",
  titleLengthValidation = "Title should be under 255 characters",
  taskDescriptionValidation = "Task details left blank",
  taskDescriptionLengthValidation = "Task details should be under 1000 characters",
  apiResponseError = "Something went wrong!",
  apiCallSuccess = "Task successfully added",
  dialogTitle = "Create a task",
  titlePlaceHolder = "Enter task title",
  employeeValidation = "Employee not selected",
  licensePlaceHolder = "Assign task to license",
  labelTaskDetails = "Enter task details",
  taskDetailPlaceHolder = "Enter text",
  employeePlaceHolder = "Select employee",
}
const TaskForm: React.FC<TaskType> = (props: TaskType) => {
  const classes = useStyles();
  const formclasses = formUnderline();

  const [licenseIds, setLicenseIds] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);
  const [employeeIds, setEmployeeIds] = React.useState<any[]>([
    { name: "", employeeId: 0 },
  ]);

  const [title, setTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [taskDescriptionError, setTaskDescriptionError] = useState(false);
  const [employeeError, setEmployeeError] = useState(false);
  const [titleErrorText, setTitleErrorText] = useState(
    StaticText.titleValidation
  );
  const [taskDescriptionErrorText, setTaskDescriptionErrorText] = useState(
    StaticText.taskDescriptionValidation
  );
  const [showLoader, setShowLoader] = useState(false);

  const handleCancel = () => {
    props.setOpen(false);
    setTitle("");
    setTitleError(false);
    setTaskDescription("");
    setTaskDescriptionError(false);
    setLicenseId("");
    setEmployeeId("");
    setEmployeeError(false);
  };

  const token = localStorage.getItem("user");
  const assignTaskRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if(licenseId !== null){
      assignTaskRef.current && assignTaskRef.current.focus();
    }
   }, [licenseId]);

  useEffect(() => {
    if(props.open){
       setShowLoader(true);
      axios
        .all([
          axios.get(GET_All_TYPE_LICENSES, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get<EmployeeResponse>(GET_ALL_EMPLOYEES, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
        ])
        .then(
          axios.spread((licenseResp: any, employeeResp: any) => {
            setShowLoader(false);
            Swal.close();
            if (licenseResp.status === 200) {
              const tdata = licenseResp.data.result;
              const data = keyValueMapper(tdata);
              setLicenseIds(data);
            }
            if (
              employeeResp.status === 200 &&
              employeeResp.data.isSuccess === true
            ) {
              setEmployeeIds(employeeResp.data.result);
            }
          })
        )
        .catch((error) => console.log(error));
    }
  }, [token, props.open]);

  const validateFields = () => {
    let validate = true;
    if (title.trim().length === 0) {
      setTitleError(true);
      setTitleErrorText(StaticText.titleValidation);
      validate = false;
    }
    if (title.trim().length > 255) {
      setTitleError(true);
      setTitleErrorText(StaticText.titleLengthValidation);
      validate = false;
    }
    if (taskDescription.trim().length === 0) {
      setTaskDescriptionError(true);
      setTaskDescriptionErrorText(StaticText.taskDescriptionValidation);
      validate = false;
    }
    if (taskDescription.trim().length > 1000) {
      setTaskDescriptionError(true);
      setTaskDescriptionErrorText(StaticText.taskDescriptionLengthValidation);
      validate = false;
    }
    if (employeeId.length === 0) {
      setEmployeeError(true);
      validate = false;
    }
    return validate;
  };

  const checkFromNotification = () => {
    if (props.fromNotification) {
      return props.licId;
    } else {
      return licenseId;
    }
  };

  const submitTaskForm = () => {
    const licId = checkFromNotification();
    if (validateFields()) {
      const params = {
        licenseId: licId,
        title: title.trim(),
        employeeId: employeeId,
        taskDescription: taskDescription.trim(),
      };

      setShowLoader(true);
      axios
        .post<any>(ADD_TASK, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.data.isSuccess === false) {
            Swal.fire({
              text: StaticText.apiResponseError,
              confirmButtonText: "OK",
              icon: "error",
            });
            handleCancel();
            if (props.fromLicense === false) {
              props.getTaskData();
            }
          } else {
            handleCancel();
            if(props.fromLicense === false){
              afterSubmission(res.data.result);
            }
            props.addTaskData();
          }
          return true;
        })
        .catch((error) => {
          setShowLoader(false);

          if (error.response.data.errors.title) {
            setTitleError(true);
            setTitleErrorText(error.response.data.errors.title);
          }
          if (error.response.data.errors.taskDescription) {
            setTaskDescriptionError(true);
            setTaskDescriptionErrorText(
              error.response.data.errors.taskDescription
            );
          }
          if (props.getTaskData !== null) {
            props.getTaskData();
          }
          return false;
        });
    }
  };

  const afterSubmission = (id: number) => {
    if (props.fromNotification === true) {
      props.setTaskId?.(id);
      addTaskIdtoNotification(id);
    } else {
      props.getTaskData();
    }
  };

  const addTaskIdtoNotification = (taskId: number) => {
    const params = {
      notificationId: props.notId,
      taskId: taskId,
    };
    axios.put<EmployeeResponse>(`${UPDATE_NOTIFICATION_TASK}`, params, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  };

  const LicenseSelect = (): JSX.Element => {
    if (!props.fromNotification) {
      return (<>
        <Select
          style={{
            fontSize: 16,
            backgroundColor: "#f4f5f8",
            width: "100%",
            paddingLeft: 0,
          }}
          defaultValue=""
          name="licenseId"
          inputRef={assignTaskRef}
          displayEmpty
          value={licenseId}
          onChange={(e) => {
            setLicenseId(e.target.value);
          }}
          inputProps={{ "aria-label": "Without label" }}
          variant="filled"
          className={`input-form select-field ${formclasses.root}`}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            style: {
              maxHeight: 300,
              maxWidth: 400,
            },
          }}
          IconComponent={CustomExpandMore}
          sx={{
            ":before": { borderBottom: "none !important" },
          }}
        >
          <MenuItem disabled value="">
            <span className="input-placeholder">
              {StaticText.licensePlaceHolder}
            </span>
          </MenuItem>
          {licenseIds.map((type) => (
            <MenuItem key={type.name} value={type.id}>
              <Tooltip
                title={type.name.length > 45 ? type.name : ""}
                placement="top"
                arrow
              >
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "475px",
                  }}
                >
                  {type.name.length > 45 ? type.name + "..." : type.name}
                </div>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
        </>
      );
    } else {
      return (
        <Select
          style={{
            fontSize: 16,
            backgroundColor: "#f4f5f8",
            width: "100%",
            paddingLeft: 0,
          }}
          defaultValue=""
          name="licenseId"
          disabled
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          value={props.licId}
          variant="filled"
          className={`input-form select-field ${formclasses.root}`}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            style: {
              maxHeight: 300,
              maxWidth: 400,
            },
          }}
          IconComponent={CustomExpandMore}
          sx={{
            ":before": { borderBottom: "none !important" },
          }}
        >
          <MenuItem value={props.licId} selected>
              {props.licenseNumber}
          </MenuItem>
        </Select>
      );
    }
  };
   const checkErrorMessage = (param: boolean, ErrorMessage: string) => {
    if (param === true) {
      return (
        <span className="form-field-error">{ErrorMessage}</span>
      );
    }
  };
  return (
    <>
      <Dialog
        open={props.open}
        className="p-4 task-page-wrapper form-container"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={handleCancel}
        PaperProps={{
          sx: {
            maxHeight: 800,
          },
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>
        <div className="CloseDialog">
          <button
            title="Close assign task"
            onClick={handleCancel}
            className="btn-close btn-sm close-assign-task"
          ></button>
        </div>
        <DialogContent>
          <DialogContentText className="DialogTop ">
            {StaticText.dialogTitle}
          </DialogContentText>
          <div className="row" style={{ margin: 15 }}>
            <div className="col-12 col-sm-12 mt-2">
              <TextField
                hiddenLabel
                variant="filled"
                className={`input-form form-control ${classes.root}`}
                placeholder={StaticText.titlePlaceHolder}
                type="text"
                value={title}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    return submitTaskForm();
                  }
                }}
                onChange={(e) => {
                  setTitleError(false);
                  setTitle(e.target.value);
                }}
                InputProps={{
                  style: {
                    fontSize: 16,
                    background: "#f4f5f8",
                    paddingLeft: 0,
                  },
                }}
                inputProps={{ maxLength: 255 }}
                aria-label={StaticText.titlePlaceHolder}
                FormHelperTextProps={{
                  className: classes.helperText,
                }}
              />
              {checkErrorMessage(titleError, titleErrorText)}
            </div>

            <div className="col-12 col-sm-12 mt-2">
              <div className="form-field-wrapper">
              <Select
                style={{
                  fontSize: 16,
                  backgroundColor: "#f4f5f8",
                  width: "100%",
                  paddingLeft: 0,
                }}
                defaultValue=""
                name="employeeId"
                displayEmpty
                value={employeeId}
                onChange={(e) => {
                  setEmployeeError(false);
                  setEmployeeId(e.target.value);
                }}
                inputProps={{ "aria-label": "Without label" }}
                variant="filled"
                className={`input-form select-field ${formclasses.root}`}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  style: {
                    maxHeight: 350,
                    maxWidth: 400,
                  },
                }}
                IconComponent={CustomExpandMore}
                sx={{
                  ":before": { borderBottom: "none !important" },
                }}
              >
                <MenuItem disabled value="">
                  <span className="input-placeholder">
                    {StaticText.employeePlaceHolder}
                  </span>
                </MenuItem>
                {employeeIds.filter((filterData)=>filterData.role?.toLowerCase()!=='other').map((type) => (
                  <MenuItem key={type.name} value={type.employeeId}>
                    <Tooltip
                      title={type.name.length > 50 ? type.name : ""}
                      placement="top"
                      arrow
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "445px",
                        }}
                      >
                        {type.name.length > 50 ? type.name + "..." : type.name}
                      </div>
                    </Tooltip>
                  </MenuItem>
                ))}
              </Select>
                {checkErrorMessage(employeeError, StaticText.employeeValidation)}
                </div>
            </div>
            <div className="col-12 col-sm-12 mt-2">
              <LicenseSelect/>
            </div>

            <div className="col-12 mt-4">
              <span>
                <b>{StaticText.labelTaskDetails}</b>
              </span>
              <div className="form-field-wrapper">
              <TextField
                hiddenLabel
                variant="filled"
                className={`input-form form-control text-feild-scroll-bar ${classes.root}`}
                placeholder={StaticText.taskDetailPlaceHolder}
                type="text"
                multiline
                rows={3}
                value={taskDescription}
                onChange={(e) => {
                  setTaskDescriptionError(false);
                  setTaskDescription(e.target.value);
                }}
                InputProps={{
                  style: {
                    fontSize: 16,
                    background: "#f4f5f8",
                    paddingLeft: "0px!important",
                  },
                }}
                inputProps={{ maxLength: 1000 }}
                FormHelperTextProps={{
                  className: classes.helperText,
                }}
              />
              {checkErrorMessage(taskDescriptionError, taskDescriptionErrorText)}
            </div>
            </div>

            <div
              className="text-right col-sm-12 d-flex"
              style={{ justifyContent: "right" }}
            >
              {
                <Button
                  style={{
                    height: "50px",
                    width: "115px",
                  }}
                  className="mb-3 next-btn"
                  variant="contained"
                  sx={{ mr: 1, mt: 5 }}
                  onClick={submitTaskForm}
                >
                  Submit
                </Button>
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskForm;
