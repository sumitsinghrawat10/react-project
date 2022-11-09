import React, { useState, useEffect } from "react";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Button from "../../../components/Button";
import axios, { AxiosResponse } from "axios";
import lod from "lodash";

import {
  UPLOAD_DOCUMENTS,
  DELETE_DOCUMENTS,
} from "../../../networking/httpEndPoints";
import UploadStatusSection from "./UploadStatusSection";
import SuccessToaster from "../../../components/SuccessToaster";

enum StaticText {
  wrongFileType = "Only pdf file is allowed.",
  fileSizeExceded = "Selected file size exceeds 25 MB.",
  filesLimitExceded = "Only 10 files can be uploaded at a time.",
  title = "Upload File(s)",
  text1 = "Click here to add files",
  text2 = "or drag and drop",
  text3 = ".PDF files only",
  buttonText = "Finish",
  responseMessage = "This document name is already exists. Please try with a different name.",
}

interface PopupState {
  openUploadFiles: boolean;
  setOpenUploadFiles: any;
  getFileList: any;
}

interface PdfFileResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

type SelectedFileType = {
  name: string;
  flag: number;
  fileStatus: string;
  id: number;
  uid: string;
};

const MAX_NUMBER_OF_FILES_ALLOWED = 10;

const UploadFiles: React.FC<PopupState> = (props: PopupState) => {
  const token = localStorage.getItem("user");
  const [showLoader, setShowLoader] = useState(false);
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<any>([]);
  const [fileImportError, setFileImportError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [btnDisable, setBtnDisable] = useState<boolean>(true);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [successRecords, setSuccessRecords] = useState([]);
  const [failedRecords, setFailedRecords] = useState([]);
  const [allFiles, setAllFiles] = useState<any>([]);
  const [deleteQueue, setDeleteQueue] = useState<any>([]);
  const [enable, setEnable] = useState(false);
  let uploadTimer: any;
  let filesAdded: any[] = [];
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let succRecords = [];
    let failRecords = [];
    succRecords = selectedFile.filter((file: SelectedFileType) => {
      return file.fileStatus === "success";
    });

    failRecords = selectedFile.filter((file: SelectedFileType) => {
      return file.fileStatus === "failed";
    });

    setSuccessRecords(succRecords);
    setFailedRecords(failRecords);
  }, [selectedFile]);

  useEffect(() => {
    const noOfSuccessFiles = successRecords.length;
    const noOfFailededFiles = failedRecords.length;
    const noOfSelectedFiles = selectedFile.length;

    const filesUploading =
      noOfSuccessFiles + noOfFailededFiles !== noOfSelectedFiles;
    const FilesUploaded =
      noOfSuccessFiles + noOfFailededFiles === noOfSelectedFiles;

    if (noOfSelectedFiles === 0) {
      setBtnDisable(true);
    } else if (filesUploading) {
      setBtnDisable(true);
    } else if (FilesUploaded) {
      setBtnDisable(false);
    }
  }, [successRecords, failedRecords, selectedFile]);

  const uploadSuccessResponse = (
    res: AxiosResponse<PdfFileResponse, any>,
    uId: any
  ) => {
    filesAdded.forEach((file: SelectedFileType) => {
      if (file.uid === uId) {
        file.flag = 1;
        file.fileStatus = "success";
        file.id = res.data.result;
      }
    });
    setSelectedFile([...filesAdded]);
  };

  const uploadFailResponse = (flag: number, uId: any) => {
    filesAdded.forEach((file: any) => {
      if (file.uid === uId) {
        file.flag = flag;
        file.fileStatus = "failed";
      }
    });
    setSelectedFile([...filesAdded]);
  };

  const parseUploadResponse = (
    res: AxiosResponse<PdfFileResponse, any>,
    uId: any
  ) => {
    if (res.status === 201 && res.data.isSuccess === true) {
      uploadSuccessResponse(res, uId);
    } else if (
      res.status === 201 &&
      res.data.isSuccess === false &&
      res.data.responseMessage === StaticText.responseMessage
    ) {
      uploadFailResponse(3, uId);
    } else {
      uploadFailResponse(2, uId);
    }
  };

  const updateTrackingArrays = (
    index: number,
    uid: string,
    fileName: string
  ) => {
    if (selectedFile.length === 1) {
      setSelectedFile([]);
    } else {
      setSelectedFile((file: any) =>
        file.filter((_f: any, i: number) => i !== index)
      );
    }

    if (allFiles.length === 1) {
      setAllFiles([]);
    } else {
      setAllFiles((allFile: any) =>
        allFile.filter((f: any) => f.name !== fileName)
      );
    }
    setDeleteQueue(deleteQueue.filter((val: any) => val !== uid));
  };

  const onPdfFileUpload = (FileDataSent: any, uId: any) => {
    const pdfData = new FormData();
    pdfData.append("Documents", FileDataSent);

    if (token !== null) {
      localStorage.setItem("uploadinginprogress", "true");
      axios
        .post<PdfFileResponse>(UPLOAD_DOCUMENTS, pdfData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          const uploadingCancelled = localStorage.getItem("uploadingcancelled");
          if (uploadingCancelled === "false") {
            parseUploadResponse(res, uId);
          }
          localStorage.setItem("uploadinginprogress", "false");
        })
        .catch((_error) => {
          const uploadingCancelled = localStorage.getItem("uploadingcancelled");
          if (uploadingCancelled === "false") {
            uploadFailResponse(2, uId);
          }
          localStorage.setItem("uploadinginprogress", "false");
        });
    }
  };

  const deleteFailResponse = (uid: string) => {
    filesAdded.forEach((file: SelectedFileType) => {
      if (file.uid === uid) {
        file.flag = 6;
        file.fileStatus = "failure";
      }
    });
  };

  const parseDeleteResponse = (
    res: AxiosResponse<PdfFileResponse, any>,
    index: number,
    successFileIndex: number,
    uid: string,
    fileName: string
  ) => {
    if (res.status === 200 && res.data.isSuccess === true) {
      if (successRecords.length === 1) {
        setSuccessRecords([]);
      } else {
        setSuccessRecords((file: any) =>
          file.filter((_f: any, i: number) => i !== successFileIndex)
        );
      }
      updateTrackingArrays(index, uid, fileName);
    } else {
      deleteFailResponse(uid);
      setSelectedFile([...filesAdded]);
    }
  };

  const deleteUploadedFile = (
    fileId: number,
    index: number,
    successFileIndex: number,
    uid: string,
    fileName: string
  ) => {
    const params = {
      documentIds: [fileId],
    };

    if (token !== null) {
      axios
        .put<PdfFileResponse>(DELETE_DOCUMENTS, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          parseDeleteResponse(res, index, successFileIndex, uid, fileName);
        })
        .catch((error) => console.log(error));
    }
  };

  const handleCancel = () => {
    props.setOpenUploadFiles(false);
    setShowLoader(false);
    setSelectedFile([]);
    setFileImportError(false);
    setErrorMessage("");
    setBtnDisable(false);
    localStorage.setItem("uploadingcancelled", "true");
    if (successRecords.length > 0) {
      setSuccessRecords([]);
      setFailedRecords([]);
      setAllFiles([]);
      filesAdded = [];
      props.getFileList();
    } else {
      setSuccessRecords([]);
      setFailedRecords([]);
      setAllFiles([]);
      filesAdded = [];
    }
  };

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const checkLimitExceeded = (files: any) => {
    const numberOfFilesAdded = files.length;
    const numberOfFilesInQueue = selectedFile.length;

    if (
      numberOfFilesInQueue === 0 &&
      numberOfFilesAdded > MAX_NUMBER_OF_FILES_ALLOWED
    ) {
      setErrorMessage(StaticText.filesLimitExceded);
      setFileImportError(true);
      return true;
    }
    if (
      numberOfFilesInQueue !== 0 &&
      numberOfFilesAdded + numberOfFilesInQueue > MAX_NUMBER_OF_FILES_ALLOWED
    ) {
      setErrorMessage(StaticText.filesLimitExceded);
      setFileImportError(true);
      return true;
    }
    return false;
  };

  const startFileUploading = (filesList: any) => {
    localStorage.setItem("uploadinginprogress", "false");
    localStorage.setItem("uploadingcancelled", "false");
    if (uploadTimer) {
      clearInterval(uploadTimer);
    }

    let fileIndex = 0;
    setIsUploading(true);
    setEnable(true);

    uploadTimer = setInterval(() => {
      switch (fileIndex < filesList.length) {
        case true:
          const uploadingInProgress = localStorage.getItem(
            "uploadinginprogress"
          );
          if (uploadingInProgress === "false") {
            const fileAdded = filesList[fileIndex];
            const uploadingCancelled =
              localStorage.getItem("uploadingcancelled");
            if (uploadingCancelled === "false" && fileAdded.fileValidation) {
              onPdfFileUpload(fileAdded.fileContent, fileAdded.uid);
            }
            fileIndex += 1;
          }
          break;
        case false:
          clearUploadingTimer();
          break;
        default:
          break;
      }
    }, 2000);
  };

  const clearUploadingTimer = () => {
    clearInterval(uploadTimer);
    setIsUploading(false);
    setEnable(false);
    localStorage.setItem("uploadingcancelled", "false");
  };

  const handleChange = (event: any) => {
    let limitExceeded = false;
    setErrorMessage("");
    setFileImportError(false);
    const files = event.target.files;
    limitExceeded = checkLimitExceeded(files);
    if (!limitExceeded) {
      const allFilesArray = [...allFiles];
      filesAdded = [...selectedFile];

      for (const element of files) {
        allFilesArray.push(element);
        setAllFiles(allFilesArray);

        const uId = lod.uniqueId(`${element.name}`);
        const validationResult = fileValidator(element);
        filesAdded.push({
          name: element.name,
          flag: validationResult["errorCode"],
          fileStatus: validationResult["errorMsg"],
          id: 0,
          uid: uId,
          fileContent: element,
          fileValidation: validationResult["error"],
        });

        setSelectedFile([...filesAdded]);
      }
      startFileUploading(filesAdded);
      event.target.value = "";
    }
  };

  const uploadAgain = (fileName: string, uid: string) => {
    if (!isUploading) {
      const uploadingInProgress = localStorage.getItem("uploadinginprogress");
      if (uploadingInProgress === "false") {
        const file = getFile(fileName);
        onPdfFileUpload(file, uid);
      }
    }
  };

  const getFile = (fileName: string) => {
    let file: any[] = [];
    for (const element of allFiles) {
      if (element.name === fileName) {
        file = element;
      }
    }
    return file;
  };

  const fileValidator = (file: any) => {
    let error = false;
    let errorCode = 0;
    let errorMsg = "";

    if (file.name.split(".").pop() !== "pdf") {
      error = true;
      errorCode = 4;
      errorMsg = "failed";
    }
    if (file.size >= 26214400) {
      error = true;
      errorCode = 5;
      errorMsg = "failed";
    }
    if (file.name.length > 75) {
      error = true;
      errorCode = 7;
      errorMsg = "failed";
    }
    if (!error) {
      errorCode = 0;
      errorMsg = "uploading";
      return { error: true, errorCode: errorCode, errorMsg: errorMsg };
    }

    return { error: false, errorCode: errorCode, errorMsg: errorMsg };
  };

  const dragOver = (e: any) => {
    e.preventDefault();
  };

  const dragEnter = (e: any) => {
    e.preventDefault();
  };

  const dragLeave = (e: any) => {
    e.preventDefault();
  };

  const fileDrop = (e: any) => {
    e.preventDefault();
    let limitExceeded = false;
    setErrorMessage("");
    setFileImportError(false);
    const { files } = e.dataTransfer;
    limitExceeded = checkLimitExceeded(files);
    if (!limitExceeded) {
      const allFilesArray = [...allFiles];
      filesAdded = [...selectedFile];

      for (const file of files) {
        allFilesArray.push(file);
        setAllFiles(allFilesArray);

        const uId = lod.uniqueId(`${file.name}`);
        const validationResult = fileValidator(file);
        filesAdded.push({
          name: file.name,
          flag: validationResult["errorCode"],
          fileStatus: validationResult["errorMsg"],
          id: 0,
          uid: uId,
          fileContent: file,
          fileValidation: validationResult["error"],
        });

        setSelectedFile([...filesAdded]);
      }
      startFileUploading(filesAdded);
    }
  };

  const addToDeleteQueue = (fileName: string, uid: string) => {
    if (!isUploading) {
      const DQueue = [...deleteQueue];
      const isExist = DQueue.findIndex((q: any) => q === uid) > -1;
      if (DQueue.length === 0 && isExist === false) {
        DQueue.push(uid);
        setDeleteQueue([...DQueue]);
        removeSelectedFile(fileName, uid);
      }
    }
  };

  const removeSelectedFile = (fileName: string, uid: string) => {
    let docId = 0;
    let index = 0;

    filesAdded = [...selectedFile];
    filesAdded.forEach((fileAdded: SelectedFileType) => {
      if (fileAdded.uid === uid) {
        fileAdded.flag = 0;
        fileAdded.fileStatus = "uploading";
      }
    });
    setSelectedFile([...filesAdded]);

    const failFileIndex = failedRecords.findIndex(
      (failedRecord: SelectedFileType) => failedRecord.uid === uid
    );
    const successFileIndex = successRecords.findIndex(
      (successRecord: SelectedFileType) => successRecord.uid === uid
    );

    index = selectedFile.findIndex(
      (selfile: SelectedFileType) => selfile.uid === uid
    );

    const _file = selectedFile.filter((f: SelectedFileType) => {
      return f.uid === uid;
    });

    docId = _file[0].id;

    if (docId > 0) {
      deleteUploadedFile(docId, index, successFileIndex, uid, fileName);
    } else {
      if (failedRecords.length === 1) {
        setFailedRecords([]);
      } else {
        setFailedRecords((failRec: any) =>
          failRec.filter((_f: any, i: number) => i !== failFileIndex)
        );
      }

      updateTrackingArrays(index, uid, fileName);
    }
    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
  };

  const handleFinish = () => {
    if (successRecords.length > 0) {
      setConfirmationModalIsVisible(true);
      setTimeout(() => {
        setConfirmationModalIsVisible(false);
      }, 3000);
      handleCancel();
    } else {
      handleCancel();
    }
  };

  return (
    <div>
      <Dialog
        className="file-manager-dashboard-container"
        open={props.openUploadFiles}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        keepMounted
        PaperProps={{
          sx: {
            maxWidth: 550,
          },
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>
        <div className="close-dialog">
          <button
            title="Close"
            onClick={() => {
              handleCancel();
            }}
            className="btn-close btn-sm close-assign-license"
          ></button>
        </div>
        <DialogTitle className="dialog-title" style={{ paddingTop: 0 }}>
          <b>{StaticText.title}</b>
        </DialogTitle>
        {fileImportError && (
          <div className="import-error-wrapper">{errorMessage}</div>
        )}
        <DialogContent style={{ paddingTop: 0 }}>
          <div className="drop-zone-wrapper">
            <div className="row file-manager-dashboard-container">
              <div
                className="Drop-Zone"
                onClick={handleClick}
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
              >
                <input
                  aria-label="select files"
                  type="file"
                  accept="application/pdf"
                  ref={hiddenFileInput}
                  style={{ display: "none" }}
                  onChange={handleChange}
                  multiple
                />
                <h1 className="file-title">
                  <div className="import-button">
                    <UploadFileOutlinedIcon />
                    <span style={{ color: "#233ce6", marginLeft: "10px" }}>
                      {StaticText.text1}
                    </span>{" "}
                    {StaticText.text2}
                    <br />
                    <span
                      style={{
                        font: "normal normal normal 14px/25px Urbanist",
                        color: "#707070",
                        opacity: 1,
                      }}
                    >
                      {StaticText.text3}
                    </span>
                  </div>
                </h1>
              </div>
            </div>
            <div className="file-list-wrappper">
              {selectedFile && (
                <UploadStatusSection
                  files={selectedFile}
                  uploadAgain={uploadAgain}
                  addToDeleteQueue={addToDeleteQueue}
                  enable={enable}
                  setEnable={setEnable}
                />
              )}
            </div>
            <div className="finishBtn-wrapper">
              <DialogActions>
                <Button
                  onClick={() => {
                    handleFinish();
                  }}
                  className="btn-finish"
                  type="contained"
                  text="  Finish"
                  intent="primary"
                  disabled={btnDisable}
                />
              </DialogActions>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Files Uploaded Successfully" />
      )}
    </div>
  );
};

export default UploadFiles;
