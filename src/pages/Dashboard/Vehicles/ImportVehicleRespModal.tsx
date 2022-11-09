import React, { useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Tooltip from "@mui/material/Tooltip";

import { GET_DOWNLOAD_VEHICLE_EXCELFILE } from "../../../networking/httpEndPoints";

interface ImportDataType {
  open: boolean;
  setOpen: any;
  importResponseData: any;
  setImportResponseData: any;
  setHandleBtnDisable: any;
  successRecords: any;
  setSuccessRecords: any;
  failedRecords: any;
  setFailedRecords: any;
  ManualEmpBtn: boolean;
  setManualEmpBtn: any;
  EmpResModalCancel: any;
}
const DownloadReusableCode = (resp: any) => {
  Swal.close();
  if (resp.status === 200) {
    const url = [resp.data.result];
    const link: any = document.createElement("a");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }
};
const getDownloadVehicleReport = (token: any) => {
  Swal.showLoading();
  axios
    .get(GET_DOWNLOAD_VEHICLE_EXCELFILE, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((resp: any) => {
      DownloadReusableCode(resp);
    });
};
const ImportVehicleRespModal: React.FC<ImportDataType> = (
  props: ImportDataType
) => {
  const token = localStorage.getItem("user");

  useEffect(() => {
    let succRecords = [];
    let failRecords = [];

    succRecords = props.importResponseData.filter((d: any) => {
      return d.isSuccess === false;
    });
    failRecords = props.importResponseData.filter((d: any) => {
      return d.isSuccess === true;
    });
    props.setSuccessRecords(succRecords);
    props.setFailedRecords(failRecords);
  }, [props.importResponseData]);

  useEffect(() => {
    if (props.successRecords.length > 0 && props.failedRecords.length === 0) {
      props.setHandleBtnDisable(false);
    }
    if (props.failedRecords.length > 0) {
      props.setHandleBtnDisable(true);
    }
  }, [props, props.successRecords, props.failedRecords]);

  return (
    <>
      <Dialog
        open={props.open}
        keepMounted
        className="p-4 vehicles-index-container"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            maxHeight: 800,
          },
        }}
      >
        <div className="CloseDialog">
          <button
            onClick={() => {
              props.EmpResModalCancel();
            }}
            className="btn-close btn-sm close-assign-license"
          ></button>
        </div>
        <DialogContent>
          <DialogContentText className="DialogTop">
            Vehicle import report
          </DialogContentText>
          {props.failedRecords.length === 0 && (
            <div className="row ResultRow">
              <Box
                sx={{
                  bgcolor: "info.main",
                  color: "secondary.contrastText",
                  p: 2,
                }}
              >
                <CheckCircleOutlinedIcon style={{ marginRight: "10px" }} />
                {`${props.successRecords.length} vehicle(s) uploaded successfully and ready for import`}
              </Box>
            </div>
          )}

          {props.failedRecords.length !== 0 && (
            <div className="row ResultRow">
              <Box
                sx={{
                  bgcolor: "rgba(255, 49, 49, 0.8)",
                  color: "#fff",
                  p: 2,
                }}
              >
                <DoNotDisturbOnOutlinedIcon style={{ marginRight: "10px" }} />
                {`${props.failedRecords.length} vehicle(s) have errors in records`}
              </Box>
              <div className="row FailedRow">
                {props.failedRecords.slice(0, 10).map((record: any) => (
                  <Box>
                    <Tooltip
                      title={
                        record.responseMessage.length > 60
                          ? `${record.employeeId} ${record.responseMessage}`
                          : ""
                      }
                      placement="top"
                      arrow
                    >
                      <div className="ErrorMsgDiv">
                        {record.responseMessage.length > 60
                          ? `${record.employeeId} ${record.responseMessage} ...`
                          : `${record.employeeId} ${record.responseMessage}`}
                      </div>
                    </Tooltip>
                  </Box>
                ))}
              </div>
            </div>
          )}

          <div className="row mt-3">
            <div className="HeadingDownloadWrapper">
              <div className="DownloadText">
                {props.failedRecords.length > 0 && (
                  <span>
                    <ErrorOutlineIcon
                      sx={{
                        fontSize: "15px",
                        marginRight: "5px",
                        marginTop: "-2px",
                      }}
                    />
                    Please correct errors and re-upload file to continue.
                  </span>
                )}
              </div>
              <span
                className="DownloadButton"
                onClick={() => {
                  getDownloadVehicleReport(token);
                }}
              >
                <FileDownloadOutlinedIcon
                  sx={{ "&:hover": { color: "#233ce6" } }}
                />
                Download report
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportVehicleRespModal;
