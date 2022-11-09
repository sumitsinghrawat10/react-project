import React, { useEffect, useState } from "react";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import BellIcon from "../../../components/Icons/BellIcon";
import {
  Checkbox,
  Typography,
  Tooltip,
  TextField,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import Button from "../../../components/Button";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Swal from "sweetalert2";
import eventBus from "../../../hoc/eventBus";
import {
  DELETE_DOCUMENTS,
  GET_LIST_OF_DOCS,
} from "../../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
  GeneralManager,
  TeamLead,
} from "../../../utilities/constants";
import { roleValidator } from "../../../utilities/roleValidator";
import DialogConfirmationBox from "./ConfirmationDialogBox/dialogConfirmationBox";
import IconButtonMenu from "./IconButtonMenu/IconButtonMenu";
import UploadFiles from "./UploadFiles";
import SuccessToaster from "../../../components/SuccessToaster";
import SearchIcon from "@mui/icons-material/Search";

const FieldIcon = styled(ClearOutlinedIcon)<CrossIconProps>`
  :hover {
    cursor: pointer;
  }
  display: ${(props) =>
    props.SearchText.length > 0 ? "block" : "none"} !important;
`;

interface CrossIconProps {
  SearchText: string;
}

interface FileResponse {
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

interface FileDataType {
  organizationId: number;
  documentId: number;
  createdAt: Date;
  documentName: string;
  s3FileName: string;
  isSelected: boolean;
}

interface FileResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface SelectedFile {
  documentId: number;
}

const FileManager: React.FC = () => {
  const userState = useSelector((state: DashboardType) => state.user);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [originalData, setOriginalData] = useState<any>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const token = localStorage.getItem("user");
  const [messageToUser, setMessageToUser] = useState("");
  const [showMessageToUser, setShowMessageToUser] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  let messageTimer: any = undefined;
  const [eventInitiated, setEventInitiated] = useState(false);
  const [checkboxClicked, setCheckboxClicked] = useState(false);
  const [clickedDocumentId, setClickedDocumentId] = useState(0);
  const [openUploadFiles, setOpenUploadFiles] = React.useState(false);
  const [ArrDocumentIds, setArrDocumentIds] = useState<any[]>([]);
  const [isConfirmationDialog, setIsConfirmationDialog] =
    useState<boolean>(false);
  const [selectedFileCount, setSelectedFileCount] = useState(0);

  const getFileList = () => {
    setOriginalData([]);
    setFiles([]);
    axios
      .get<FileResponse>(GET_LIST_OF_DOCS, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          setIsEmpty(false);
          const fileData = res.data.result;
          if (fileData) {
            const newFiles = fileData.map((file: FileDataType) => {
              file.isSelected = false;
              return file;
            });
            const sortbyLatesFiles = newFiles.reverse();
            setOriginalData(sortbyLatesFiles);
            setFiles(sortbyLatesFiles);
          }
        } else if (res.status === 200 && res.data.isSuccess === false) {
          setIsEmpty(true);
          setFiles([]);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      });
  };

  useEffect(() => {
    setMessageToUser("");
    setShowMessageToUser(false);
    if (files.length === 0) {
      getFileList();
    }
    return () => {
      removeEvents();
    };
  }, []);

  useEffect(() => {
    if (!eventInitiated) {
      setEventInitiated(true);
      addEvents();
      return () => {
        removeEvents();
      };
    }
  }, [eventInitiated]);

  useEffect(() => {
    if (checkboxClicked) {
      const row = files.filter((f) => f.documentId === clickedDocumentId)[0];
      if (row) {
        const rowIndex = files.indexOf(row);
        if (rowIndex > -1) {
          const curretStatus = !files[rowIndex].isSelected;
          files[rowIndex].isSelected = curretStatus;
          setFiles(files);
        }
      }
      setCheckboxClicked(false);
    }
  }, [checkboxClicked]);

  useEffect(() => {
    if (!isActionInProgress) {
      const newFiles = files.map((row) => {
        row.isSelected = false;
        return row;
      });
      setFiles(newFiles);
    }
  }, [isActionInProgress]);

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

  const SearchButtonHandler: any = (searchData: any) => {
    setIsSearch(true);
    const result = originalData;

    const textFilterData: any = result.filter((obj: any) => {
      if (
        obj.documentName != null &&
        obj.documentName.toUpperCase().includes(searchData.toUpperCase().trim())
      ) {
        return true;
      }
    });
    textFilterData.sort((a: any, b: any) => {
      if (
        a.documentName.toLowerCase().indexOf(searchData.toLowerCase()) >
        b.documentName.toLowerCase().indexOf(searchData.toLowerCase())
      ) {
        return 1;
      } else if (
        a.documentName.toLowerCase().indexOf(searchData.toLowerCase()) <
        b.documentName.toLowerCase().indexOf(searchData.toLowerCase())
      ) {
        return -1;
      } else {
        if (a.documentName > b.documentName) return 1;
        else return -1;
      }
    });
    setFiles(textFilterData);
    if (textFilterData.length === 0) {
      setIsSearchEmpty(true);
    } else {
      setIsSearchEmpty(false);
    }
  };

    const addEvents = () => {
        setIsActionInProgress(true);
        eventBus.on('donwloadCompleted', handleDownloadCompleted);
    };

  const removeEvents = () => {
    eventBus.remove("donwloadCompleted");
  };

  const handleFileCheckBoxChange = (documentId: number) => {
    setClickedDocumentId(documentId);
    setCheckboxClicked(true);
  };

  function getSelectedFiles(): SelectedFile[] {
    let selectedFiles: SelectedFile[] = [{ documentId: 0 }];
    files.forEach((row) => {
      if (row.isSelected) selectedFiles.push({ documentId: row.documentId });
    });
    selectedFiles = selectedFiles.filter((row) => row.documentId != 0);
    return selectedFiles;
  }

  const handleDownloadFile = () => {
    if (validateDownloadSelection() === true) {
      const selectedFiles = getSelectedFiles();
      eventBus.dispatch("initiateDownload", { downloadFiles: selectedFiles });
      setIsActionInProgress(true);
    }
  };

  function validateDownloadSelection(): boolean {
    if (!isActionInProgress) {
      const selectedFiles = files.filter((row) => row.isSelected === true);
      if (selectedFiles.length > 0) {
        setMessageToUser("Files download in progress.");
        setShowMessageToUser(true);
      }
      if (selectedFiles.length === 0) {
        setMessageToUser("Please select the files for download.");
        setShowMessageToUser(true);
        return false;
      }
      if (selectedFiles.length > 10) {
        setMessageToUser(
          "Max 10 files can be selected at a time for download."
        );
        setShowMessageToUser(true);
        return false;
      }
    }
    return true;
  }

  const handleDownloadCompleted = (data: any) => {
    setIsActionInProgress(false);
  };

  const handleUploadFiles = () => {
    setOpenUploadFiles(true);
  };

  const DeleteDocument = (DocumentIds: any) => {
    if (DocumentIds === null) {
      return;
    }
    const ReqObject: { [key: string]: any } = {};
    ReqObject["documentIds"] = DocumentIds;
    const param = JSON.stringify(ReqObject);

    if (token !== null) {
      axios
        .put<any>(DELETE_DOCUMENTS, param, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data.isSuccess === true) {
            setArrDocumentIds([]);
            getFileList();
          }
        });
    }
  };

  const handleSingleFileDelete = (documentId: any) => {
    const Arr_SelectedDocumentIdsNew: number[] = [];
    Arr_SelectedDocumentIdsNew.push(documentId);
    DeleteDocument(Arr_SelectedDocumentIdsNew);
    setMessageToUser("1 File Deleted Successfully");
    setShowMessageToUser(true);
  };

  const handleDeleteMultipleFiles = () => {
    if (selectedFileCount > 0) {
      setIsConfirmationDialog(true);

      DeleteDocument(
        ArrDocumentIds.filter(
          (element, i) => i === ArrDocumentIds.indexOf(element)
        )
      );
      const messageText = `${selectedFileCount === 0 ? 1 : selectedFileCount}
      ${
        ArrDocumentIds.length === 0 || ArrDocumentIds.length === 1
          ? "File"
          : "Files"
      }
      Deleted Successfully
      `;
      setMessageToUser(messageText);
      setShowMessageToUser(true);
    }
  };

  const handleConfirmationBox = () => {
    const Arr_SelectedDocumentIds = getSelectedFiles();
    if (isActionInProgress) {
      setMessageToUser("Files download in progress");
      setShowMessageToUser(true);
    } else {
      if (Arr_SelectedDocumentIds.length > 0) {
        setSelectedFileCount(Arr_SelectedDocumentIds.length);
        setArrDocumentIds([]);
        Arr_SelectedDocumentIds.forEach((row) => {
          ArrDocumentIds.push(row.documentId);
        });
        setArrDocumentIds(ArrDocumentIds);
        setIsConfirmationDialog(true);
      } else {
        setMessageToUser("Please Select the files for delete.");
        setShowMessageToUser(true);
      }
    }
  };

  const validateUserRole = () => {
    if (
      roleValidator(userState["role"]) === SystemAdministrator ||
      roleValidator(userState["role"]) === DirectorOfCompliance ||
      roleValidator(userState["role"]) === ComplianceAnalyst ||
      roleValidator(userState["role"]) === DirectorOfRetailOperations ||
      roleValidator(userState["role"]) === GeneralManager ||
      roleValidator(userState["role"]) === TeamLead
    ) {
      return true;
    } else {
      return false;
    }
  };

  const checkFileNotFound = () => {
    if (files.length === 0 && isEmpty) {
      return (
        <>
          <h4 className="No-files-text">No files found</h4>
        </>
      );
    } else {
      return <></>;
    }
  };

  const checkLoader = () => {
    if (files.length === 0 && isSearch === false && !isEmpty) {
      return (
        <>
          <div className="loader-wrapper">
            <CircularProgress />
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="file-manager-dashboard-container">
      <div className="files-container container form-container">
        <div className="d-flex">
          <div className="page-title-file-manager">File Manager</div>
          <UploadFiles
            openUploadFiles={openUploadFiles}
            setOpenUploadFiles={setOpenUploadFiles}
            getFileList={getFileList}
          />
          {validateUserRole() && (
            <Tooltip title="Upload File(s)">
              <button
                title="upload"
                className="mt-3 ms-auto upload-button"
                onClick={handleUploadFiles}
              >
                <FileUploadOutlinedIcon sx={{ fontSize: 24 }} />
              </button>
            </Tooltip>
          )}
          <div className="ms-3">
            <BellIcon />
          </div>
        </div>
        {checkFileNotFound()}
        {checkLoader()}
        {(files.length > 0 || isSearchEmpty) && (
          <>
            <div className="search-container d-flex">
              <div style={{ width: "100%" }} className="mx-2">
                <TextField
                  hiddenLabel
                  placeholder="Search Files"
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    if (e.target.value.length <= 0) {
                      setSearchText("");
                      setFiles(originalData);
                      setIsSearchEmpty(false);
                    } else {
                      setSearchText(e.target.value);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchText.trim().length > 0) {
                      SearchButtonHandler(searchText.trim());
                    }
                  }}
                  InputProps={{
                    style: {
                      fontSize: 16,
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="search-icon" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <FieldIcon
                          onClick={() => {
                            setSearchText("");
                            setFiles(originalData);
                            setIsSearchEmpty(false);
                          }}
                          SearchText={searchText}
                          fontSize="small"
                        ></FieldIcon>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ maxLength: 100 }}
                  className="textField-wrapper input-form"
                />
              </div>
              <div className="me-3">
                <Button
                  className="mb-5 search-button"
                  onClick={() => {
                    if (searchText.trim().length > 0) {
                      SearchButtonHandler(searchText.trim());
                    }
                  }}
                  type="contained"
                  text="Search"
                  intent="primary"
                />
              </div>
            </div>
          </>
        )}

        {files.length > 0 && (
          <>
            <div className="d-flex col-sm-3 file-actions">
              <div className="d-flex action-text-title-wrapper">
                <h1 className="action-text-title">Actions:</h1>
              </div>
              <div className="d-flex Action-Text-wrapper">
                <h1 className="Action-Text ms-3" onClick={handleDownloadFile}>
                  Download
                </h1>
                {(roleValidator(userState["role"]) === SystemAdministrator ||
                  roleValidator(userState["role"]) ===
                    DirectorOfCompliance) && (
                  <h1
                    style={{ cursor: "pointer" }}
                    className="Action-Text ms-3"
                    onClick={() => handleConfirmationBox()}
                  >
                    Delete
                  </h1>
                )}
              </div>
            </div>
            <div className="file-manager-dashboard-container">
              {files.length !== 0 && (
                <div className="files-gallery-container files-gallery-container-size custom-vertical-scroll">
                  <div className="mb-5 " style={{ padding: "0px" }}>
                    <div className="file-card-wrraper ">
                      {files.map((file: FileDataType) => (
                        <div
                          key={file.documentId}
                          className="mx-2 mb-3 file-card"
                        >
                          <div className="d-flex file-card-header">
                            <Checkbox
                              className="file-selection"
                              onChange={() =>
                                handleFileCheckBoxChange(file.documentId)
                              }
                              checked={file.isSelected}
                              value={file.documentId}
                            />
                            <IconButtonMenu
                              id={file.documentId}
                              CreatedAt={`${moment(file.createdAt).format(
                                "MM/DD/YYYY "
                              )}`}
                              handleSingleFileDelete={handleSingleFileDelete}
                              isDownloadActive={isActionInProgress}
                              setIsDownloadActive={setIsActionInProgress}
                            />
                          </div>
                          <div className="file-icon-container">
                            <i
                              className="bi bi-file-earmark-pdf mx-5"
                              style={{ fontSize: 60 }}
                            />
                          </div>
                          <div className="d-flex mt-2 file-card-footer">
                            <i className="bi bi-file-earmark-pdf default-file-icon" />
                            <Tooltip
                              title={
                                file.documentName.length > 12
                                  ? file.documentName
                                  : ""
                              }
                              placement="top"
                              arrow
                            >
                              <Typography
                                variant="body1"
                                className="ms-3"
                                noWrap
                                sx={{
                                  fontSize: 16,
                                  fontWeight: "bold",
                                  alignSelf: "center",
                                  paddingLeft: "0px",
                                }}
                              >
                                {file.documentName}
                              </Typography>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {isSearchEmpty && (
          <>
            <p className="search-empty-error">
              No data is found matching the text you have provided
            </p>
          </>
        )}

        {showMessageToUser && <SuccessToaster message={messageToUser} />}

        {isConfirmationDialog && (
          <DialogConfirmationBox
            Message={`${
              selectedFileCount === 1
                ? "Are you sure you want to delete this file?"
                : "Are you sure you want to delete multiple files?"
            } `}
            onConfirm={() => {
              handleDeleteMultipleFiles();
              setIsConfirmationDialog(false);
            }}
            onCancel={() => setIsConfirmationDialog(false)}
            ConfirmationBtnText="Yes"
            CancelBtnText="No"
          ></DialogConfirmationBox>
        )}
      </div>
    </div>
  );
};

export default FileManager;
