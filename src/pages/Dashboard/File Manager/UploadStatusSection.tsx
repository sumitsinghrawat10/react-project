import React from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import { Tooltip, IconButton, CircularProgress } from "@mui/material";

interface UploadStatusState {
  files: any[];
  uploadAgain: any;
  addToDeleteQueue: any;
  enable: boolean;
  setEnable: any;
}

type SelectedFileType = {
  name: string;
  flag: number;
  fileStatus: string;
  id: number;
  uid: string;
};

const UploadStatusSection: React.FC<UploadStatusState> = (
  props: UploadStatusState
) => {
  const messageSwitch = (flag: number) => {
    switch (flag) {
      case 0:
        return "Uploading file";
      case 1:
        return "File successfully uploaded";
      case 2:
        return "Unable to upload. try again";
      case 3:
        return "File already exists";
      case 4:
        return "Incorrect file format";
      case 5:
        return "File exceeds 25 MB";
      case 6:
        return "Unable to delete";
      case 7:
        return "File name should not be more than 75 characters";
      default:
        return "Uploading file";
    }
  };

  const iconSwicth = (flag: number, fileName: string, uid: string) => {
    if (flag === 0) {
      return (
        <CircularProgress
          size="1rem"
          sx={{
            alignSelf: "center",
            marginLeft: "10px",
            "&:hover": { cursor: "pointer" },
            color: "#707070",
          }}
        />
      );
    } else if (flag === 2) {
      return (
        <RefreshOutlinedIcon
          onClick={() => props.uploadAgain(fileName, uid)}
          sx={{
            fontSize: "20px",
            marginLeft: "10px",
            "&:hover": { cursor: "pointer" },
          }}
        />
      );
    } else {
      return (
        <IconButton
          disabled={props.enable}
          disableRipple={true}
          sx={{
            "&:hover": { cursor: "pointer", background: "transparent" },
          }}
          onClick={() => {
            props.addToDeleteQueue(fileName, uid);
            props.setEnable(false);
          }}
        >
          <CancelOutlinedIcon
            sx={{
              fontSize: "20px",
            }}
          />
        </IconButton>
      );
    }
  };

  return (
    <div className="file-manager-dashboard-container">
      <div className="row status-section-wrapper">
        {props.files?.map((file: SelectedFileType) => (
          <div
            className="file-name-icon-wrapper"
            key={`${file.name}-${Math.floor(Math.random() * 100)}`}
          >
            <TaskOutlinedIcon sx={{ fontSize: "25px" }}></TaskOutlinedIcon>
            <Tooltip
              title={file.name.length > 8 ? file.name : ""}
              placement="top"
              arrow
            >
              <div className="file-name-wrapper">
                {file.name.length > 8
                  ? file.name.slice(0, 8) + "..."
                  : file.name}
              </div>
            </Tooltip>
            <div
              className={`${
                file.flag === 1
                  ? "upload-message-wrapper-blue"
                  : "upload-message-wrapper"
              }`}
            >
              {messageSwitch(file.flag)}
            </div>
            {iconSwicth(file.flag, file.name, file.uid)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadStatusSection;
