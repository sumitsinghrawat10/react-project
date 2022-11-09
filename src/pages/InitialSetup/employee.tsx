import React, { useEffect, useState } from "react";

import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemText,
  Checkbox,
  FormControl,
  FormHelperText,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";
import Swal from "sweetalert2";

import AddEmployeeAlertBox from "../../components/AddEmployeeAlertBox";
import BadgeIssuedFrom from "../../components/BadgeCard/BadgeIssuedFrom";
import {
  getExcelErrors,
  AlertMsgForInvalidExlTemplate,
} from "../../components/Employee/EmployeeImportMethods";
import { dateFieldStyle } from "../../components/InputStyles";
import {
  GET_IS_EMAIL_EXIST,
  GET_LICENSE,
  GET_LOCATION,
  DELETE_EXCELFILE,
  UPLOAD_EMPLOYEES_EXCELFILE,
  GET_ROLES,
} from "../../networking/httpEndPoints";
import { handleInitalSetupBadgeDateFieldChange, BadgeType } from "../../components/Employee/handleDateFieldChange";
interface ComponentProps {
  expand?: boolean;
}
interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}

const AccordionWrapper = styled(Accordion)<ComponentProps>`
  &.employee-accordion {
    box-shadow: none !important;
    border-bottom: ${(props) =>
      props.expand ? "2px solid #233ce6 !important" : "none"};
    border-radius: 0px !important;
    display: block !important;
    width: 100% !important;
  }
`;
const Heading = styled.div<ComponentProps>`
  font-size: 20px;
  color: ${(props) => (props.expand ? "#233ce6 !important" : "#001e46")};
  line-height: 24px;
  font-weight: 600;
  margin-bottom: 20px;
`;
const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface EmployeeType {
  ManualEmpBtn: boolean;
  setManualEmpBtn: any;
  activeWizard: string;
  setActiveWizard: any;
  activeStep: number;
  setActiveStep: any;
  organizationLocationId: number;
  manual: boolean;
  setManual: any;
  setValue: any;
  value: boolean;
  lastName: string;
  firstName: string;
  middleInitial: string;
  employeeId: string;
  companyEmail: string;
  role: string;
  license: string[];
  setLastName: any;
  setFirstName: any;
  setMiddleInitial: any;
  setEmployeeId: any;
  setCompanyEmail: any;
  setRole: any;
  setLicense: any;
  lastNameError: boolean;
  setLastNameError: any;
  firstNameError: boolean;
  setFirstNameError: any;
  employeeIdError: boolean;
  setEmployeeIdError: any;
  roleError: boolean;
  setRoleError: any;
  companyEmaiError: boolean;
  setCompanyEmailError: any;
  lastNameErrorText: string;
  setLastNameErrorText: any;
  firstNameErrorText: string;
  setFirstNameErrorText: any;
  employeeIdErrorText: string;
  setEmployeeIdErrorText: any;
  roleErrorText: string;
  setRoleErrorText: any;
  companyEmaiErrorText: string;
  setCompanyEmailErrorText: any;
  badgeErrorText: string;
  setBadgeErrorText: any;
  issueDateErrorText: string;
  setIssueDateErrorText: any;
  expirationDateErrorText: string;
  setExpirationDateErrorText: any;
  issuedFromErrorText: string;
  setIssuedFromErrorText: any;
  badgeFields: any | null;
  setBadgeFields: any;
  cancelShow: boolean;
  setCancelShow: any;
  isImported: boolean;
  setIsImported: any;
  cleanInputs: boolean;
  setCleanInputs: any;
  licenseNumberIds: number[];
  setLicenseNumberIds: any;
  setSelectedExcelFile: any;
  selectedExcelFile: any;
  setFileImportError: any;
  fileImportError: boolean;
  locationLicenses: any;
  setLocationLicenses: any;
  open: boolean;
  setOpen: any;
  importResponseData: any;
  setImportResponseData: any;
  HandleBtnDisable: boolean;
  setHandleBtnDisable: any;
  OtherRoleDescription: string;
  setOtherRoleDescription: any;
  successRecords: any;
  setSuccessRecords: any;
  failedRecords: any;
  setFailedRecords: any;
  badgeCommonError: boolean;
  setBadgeCommonError: React.Dispatch<React.SetStateAction<boolean>>;
  badgeCommonErrorText: string;
}

interface EmailCodeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}
interface UploadExcelFileResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

let licenses: any | null = [];

type SelectedFileType = {
  name: string;
};

const Employee: React.FC<EmployeeType> = (props: EmployeeType) => {
  const classes = dateFieldStyle();
  const [expanded, setExpanded] = React.useState<string | false>("panel_0");
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFileType | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [locationName, setLocationName] = React.useState<string>("");
  const token = localStorage.getItem("user");
  const [excelError, setExcelError] = React.useState<any>([]);

  const [EmployeeRoles, setEmployeeRoles] = useState([]);
  const [IsOtherSelected, setIsOtherSelected] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [handleInputDisable, setHandleInputDisable] = useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [DeleteBtnDisable, setDeleteBtnDisable] = React.useState(false);

  const checkDirty = {
    lastNameTouched: false,
    firstNameTouched: false,
    middleInitialTouched: false,
    employeeIdTouched: false,
    companyEmailTouched: false,
    roleTouched: false,
    licenseTouched: false,
    badgesNameTouched: false,
    issueDateTouched: false,
    expirationDateTouched: false,
    issuedFromTouched: false,
  };
  const [dirty, setDirty] = React.useState(checkDirty);

  const accordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleBadgeFieldChange = (i: number, e: React.ChangeEvent<any>) => {
    const newFormValues = [...props.badgeFields];
    newFormValues[i][e.target.name] = e.target.value;
    newFormValues[i]["badgesNameError"] = false;
    props.setBadgeFields(newFormValues);
    props.setBadgeCommonError(false);
  };

  const handleBadgeSelectFieldChange = (
    i: number,
    e: SelectChangeEvent<any>
  ) => {
    if (e.target.name === "issuedFrom") {
      setDirty({
        ...dirty,
        issuedFromTouched: true,
      });
      const newFormValues: any[] = [...props.badgeFields];
      newFormValues[i][e.target.name] = parseInt(e.target.value);
      newFormValues[i]["issuedFromError"] = false;
      props.setBadgeFields(newFormValues);
      props.setBadgeCommonError(false);
    }
  };


  const addBadgeFormFields = () => {
    if (props.badgeFields.length === 5) {
      Swal.fire({
        text: "The maximum number of badges have already been added for the user",
        confirmButtonText: "OK",
        icon: "info",
        confirmButtonColor: "#233ce6",
      });
    } else {
      props.setBadgeFields([
        ...props.badgeFields,
        {
          badgesName: "",
          issueDate: "",
          expirationDate: "",
          issuedFrom: "",
          badgesNameError: false,
          issueDateError: false,
          expirationDateError: false,
          issuedFromError: false,
          expirationDateIsBlank: true,
        },
      ]);
    }
  };

  const removeBadgeFormFields = (i: number) => {
    const newFormValues = [...props.badgeFields];
    if (i > 0) {
      newFormValues.splice(i, 1);
      props.setBadgeFields(newFormValues);
    }
  };

  const handleSelect = (event: SelectChangeEvent<any>) => {
    if (event.target.name === "license") {
      const {
        target: { value },
      } = event;
      const newArrayId: any = [...props.licenseNumberIds];
      const locLicenses: any = [...props.locationLicenses];
      props.setLicense(typeof value === "string" ? value.split(",") : value);
      for (let i = 0; i < licenses.length; i++) {
        if (value.includes(licenses[i]["licenseNumber"])) {
          if (newArrayId.includes(licenses[i]["id"]) === false) {
            newArrayId.push(licenses[i]["id"]);
            props.setLicenseNumberIds(newArrayId);
            locLicenses.push({
              location: locationName,
              license: licenses[i]["licenseNumber"],
            });
            props.setLocationLicenses(locLicenses);
          }
        } else if (!value.includes(licenses[i]["licenseNumber"])) {
          if (newArrayId.includes(licenses[i]["id"]) === true) {
            const index = newArrayId.indexOf(licenses[i]["id"]);
            newArrayId.splice(index, 1);
            props.setLicenseNumberIds(newArrayId);
            const index2 = locLicenses.indexOf(licenses[i]["licenseNumber"]);
            locLicenses.splice(index2, 1);
            props.setLocationLicenses(locLicenses);
          }
        }
      }
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          licenseTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          licenseTouched: false,
        });
      }
    } else if (event.target.name === "role") {
      props.setRoleError(false);
      props.setRole(event.target.value);
      if (event.target.value === "Other") {
        setIsOtherSelected(true);
      } else {
        setIsOtherSelected(false);
      }
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          roleTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          roleTouched: false,
        });
      }
    }
  };

  useEffect(() => {
    setSelectedFile(null);
    GetRoles();
    if (props.cleanInputs === true) {
      props.setLastName("");
      props.setFirstName("");
      props.setMiddleInitial("");
      props.setEmployeeId("");
      props.setCompanyEmail("");
      props.setRole("");
      props.setLicense([]);
      props.setManual(false);
      props.setBadgeFields([
        {
          badgesName: "",
          issueDate: null,
          expirationDate: null,
          issuedFrom: "",
          badgesNameError: false,
          issueDateError: false,
          expirationDateError: false,
          issuedFromError: false,
          expirationDateIsBlank: true,
        },
      ]);
      setSelectedFile(null);
      props.setSelectedExcelFile(null);
      props.setIsImported(false);
    }
    axios
      .get(GET_LICENSE + props.organizationLocationId, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res: any) => {
        if (res.status === 200 && !res.data.isSuccess) {
          licenses = [];
        } else if (
          res.status === 200 &&
          res.data.isSuccess &&
          res.data.result != null
        ) {
          const data = res.data.result;
          data.forEach(function (element: any) {
            licenses.push({
              id: element.licenseId,
              licenseNumber: element.licenseNumber,
            });
          });
        }
      });

    axios
      .get(GET_LOCATION + "/" + props.organizationLocationId, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res: any) => {
        if (
          res.status === 200 &&
          res.data.isSuccess &&
          res.data.result != null
        ) {
          const data = res.data.result;
          setLocationName(data.locationNickName);
        }
      });
  }, []);

  useEffect(
    () => () => {
      licenses = [];
    },
    []
  );

  useEffect(() => {
    checkDirtyForCancelEmployee();
  }, [dirty]);

  const onEmailChange = (email: string) => {
    props.setCompanyEmailError(false);
    props.setCompanyEmail(email);
    if (
      !new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g).test(
        email.trim()
      )
    ) {
      props.setCompanyEmailError(true);
      props.setCompanyEmailErrorText("Please enter a valid email");
    } else {
      axios
        .get<EmailCodeResponse>(
          `${GET_IS_EMAIL_EXIST}?email=${encodeURIComponent(email.toLowerCase().trim())}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          if (res.data.isSuccess) {
            props.setCompanyEmailErrorText(
              res.data.responseMessage || "This email already exists."
            );
            props.setCompanyEmailError(true);
          }
        })
        .catch(() => {
          props.setCompanyEmailError(true);
          props.setCompanyEmailErrorText(
            "Something went wrong while fetching a record"
          );
        });
    }
  };
  const GetRoles = () => {
    axios
      .get<DataResponse>(`${GET_ROLES}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.result !== null) {
          setEmployeeRoles(res.data.result);
        }
      });
  };
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleChange = (event: any) => {
    let validatorResponse = false;
    setErrorMessage("");
    props.setFileImportError(false);
    validatorResponse = fileValidator(event.target.files);

    if (validatorResponse) {
      setSelectedFile(event.target.files[0]);
      props.setSelectedExcelFile(event.target.files[0]);
      setErrorMessage("");
      setHandleInputDisable(true);
      props.setValue(false);
      props.setCancelShow(true);
      props.setIsImported(true);
      onExcelUpload(event.target.files[0]);
    }
  };

  const handleAlertYes = () => {
    deleteExcelFile();
    setAlertOpen(false);
    props.setManual(true);
  };

  useEffect(() => {
    if (excelError.length !== 0) {
      props.setImportResponseData(excelError);
    }
  }, [excelError]);

  const isConfirmFunction = (isConfirm: any) => {
    if (isConfirm) {
      deleteExcelFile();
    }
  };

  const ErrorText = (condition: boolean, text: string) => {
    if (condition) {
      return text;
    } else {
      return "";
    }
  };

  const onExcelUpload = (fileDataSent: any) => {
    const excelData = new FormData();
    excelData.append("ExcelFile", fileDataSent);

    if (token !== null) {
      setShowLoader(true);
      axios
        .post<UploadExcelFileResponse>(UPLOAD_EMPLOYEES_EXCELFILE, excelData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.status === 201) {
            getExcelErrors(
              setExcelError,
              setDeleteBtnDisable,
              props.setOpen,
              props.setHandleBtnDisable,
              token
            );
            setDeleteBtnDisable(true);
            props.setManualEmpBtn(true);
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch((error) => {
          setShowLoader(false);
          AlertMsgForInvalidExlTemplate(error, isConfirmFunction);
        });
    }
  };

  const fileValidator = (file: any) => {
    let error = false;
    if (file.length > 1) {
      setErrorMessage("Please upload one file at a time.");
      props.setFileImportError(true);
      error = true;
    } else if (file[0].name.split(".").pop() !== "xlsx") {
      setErrorMessage("Only Excel file (xlsx) is accepted.");
      error = true;
      props.setFileImportError(true);
    } else if (file[0].size > 5000000) {
      setErrorMessage(
        "File you are trying to upload must be equal or less than 5 MB."
      );
      error = true;
      props.setFileImportError(true);
    }
    if (!error) {
      setErrorMessage("");
      props.setFileImportError(false);
      return true;
    }
    return false;
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
    if (!selectedFile) {
      e.preventDefault();
      setHandleInputDisable(true);
      setErrorMessage("");
      props.setFileImportError(false);
      const { files } = e.dataTransfer;
      let validatorResponse = false;
      validatorResponse = fileValidator(files);

      if (validatorResponse) {
        setSelectedFile(files[0]);
        props.setSelectedExcelFile(files[0]);
        setErrorMessage("");
        props.setValue(false);
        props.setCancelShow(true);
        props.setIsImported(true);
        onExcelUpload(files[0]);
      }
    } else {
      e.preventDefault();
    }
  };

  const seeAllDetails = () => {
    getExcelErrors(
      setExcelError,
      setDeleteBtnDisable,
      props.setOpen,
      props.setHandleBtnDisable,
      token
    );
  };

  const deleteExcelFile = () => {
    setShowLoader(true);
    axios
      .delete<UploadExcelFileResponse>(DELETE_EXCELFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json-patch+json",
          "Content-Type": "application/json-patch+json",
        },
      })
      .then((res) => {
        setShowLoader(false);
        Swal.close();
        if (
          res.status === 200 &&
          !res.data.isSuccess &&
          res.data.result == null
        ) {
          Swal.fire({
            text: res.data.responseMessage || "Delete operation failed",
            confirmButtonText: "OK",
            icon: "error",
          });
        } else if (res.status === 200 && res.data.isSuccess) {
          setSelectedFile(null);
          props.setSelectedExcelFile(null);
          props.setValue(true);
          props.setCancelShow(false);
          props.setIsImported(false);
          if (hiddenFileInput && hiddenFileInput.current) {
            hiddenFileInput.current.value = "";
          }
          props.setSuccessRecords([]);
          props.setFailedRecords([]);
          props.setCleanInputs(true);
          props.setHandleBtnDisable(false);
          Swal.fire({
            text: "File deleted successfully!",
            confirmButtonColor: "#233ce6",
            icon: "success",
            allowOutsideClick: false,
          }).then(function (result) {
            if (result.isConfirmed) {
              setHandleInputDisable(false);
            }
          });
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      })
      .catch(() => {
        Swal.close();
        setShowLoader(false);
        Swal.fire({
          text: "Something went wrong!",
          confirmButtonText: "OK",
          icon: "error",
        });
      });
  };

  const onChangeIssueDateFun = (idx: number, newValue: any) => {
    if (newValue !== null) {
      const newFormValues: BadgeType[] = [...props.badgeFields];
      props.badgeFields[idx]["issueDateIsBlank"] = false;
      props.badgeFields[idx]["issueDateError"] = false;
      setDirty({
        ...dirty,
        issueDateTouched: true,
      });
      handleInitalSetupBadgeDateFieldChange
      (newFormValues,
       idx,
       newValue,
       "issueDate",
       "employeeForm",
       props.setIssueDateErrorText,
       props.setExpirationDateErrorText);
       props.setBadgeFields(newFormValues);
       props.setBadgeCommonError(false);
    } else {
      setDirty({
        ...dirty,
        issueDateTouched: false,
      });
    }
  };

  const onChangeExpirationDateFun = (idx: number, newValue: any) => {
    if (newValue !== null) {
      const newFormValues: BadgeType[] = [...props.badgeFields];
      props.badgeFields[idx]["expirationDateIsBlank"] = false;
      props.badgeFields[idx]["expirationDateError"] = false;
      setDirty({
        ...dirty,
        expirationDateTouched: true,
      });
      handleInitalSetupBadgeDateFieldChange
      (newFormValues,
       idx,
       newValue,
       "expirationDate",
       "employeeForm",
       props.setIssueDateErrorText,
       props.setExpirationDateErrorText);
       props.setBadgeFields(newFormValues);
       props.setBadgeCommonError(false);
    } else {
      setDirty({
        ...dirty,
        expirationDateTouched: false,
      });
    }
  };

  const badgeComponent = (field: BadgeType, idx: number) => {
    const converter = require("number-to-words");
    counter = counter + 1;
    const numValue = converter.toWords(counter);
    return (
      <div key={`${field}-${idx}`}>
        {props.badgeFields.length >= 1 && (
          <AccordionWrapper
            expanded={expanded === `panel_${idx}`}
            onChange={accordionChange(`panel_${idx}`)}
            className="employee-accordion"
            expand={expanded !== `panel_${idx}`}
          >
            <AccordionSummary
              expandIcon={props.badgeFields.length >= 1 && <ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Heading expand={expanded !== `panel_${idx}`}>
                {expanded !== `panel_${idx}` && (
                  <i
                    className="bi bi-x-circle"
                    onClick={() => removeBadgeFormFields(idx)}
                  />
                )}
                {"  "}
                Badge {numValue}
              </Heading>
            </AccordionSummary>
            <AccordionDetails style={{ padding: 0 }}>
              <div>
                <div className="row ">
                  <div className="col-sm-12 col-12">
                    <InputBox
                      name="badgesName"
                      error={field.badgesNameError}
                      helperText={ErrorText(
                        field.badgesNameError,
                        props.badgeErrorText
                      )}
                      hiddenLabel
                      variant="filled"
                      className="input-form"
                      placeholder="Badge I.D"
                      value={field.badgesName}
                      onChange={(e: any) => {
                        handleInputChange(e);
                        handleBadgeFieldChange(idx, e);
                      }}
                      maxLength={100}
                      minLength={1}
                    />
                  </div>
                  <div className="col-sm-6 col-12 mui-label-styling">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={field.issueDate}
                        allowSameDateSelection={true}
                        label="Issue Date"
                        onChange={(newValue) => {
                          onChangeIssueDateFun(idx, newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={(e) => {
                              if (e.target.value === "") {
                                props.badgeFields[idx]["issueDateIsBlank"] =
                                  true;
                                props.badgeFields[idx]["issueDateError"] = false;
                              } else if (e.target.value !== "") {
                                props.badgeFields[idx]["issueDateIsBlank"] =
                                  false;
                              }
                            }}
                            style={{
                              backgroundColor: "#f4f5f8",
                              width: "100%",
                              marginBottom: 20,
                            }}
                            className={classes.root}
                            error={field.issueDateError}
                            helperText={ErrorText(
                              field.issueDateError,
                              props.issueDateErrorText
                            )}
                          />
                        )}
                        maxDate={new Date()}
                      />
                    </LocalizationProvider>
                  </div>
                  <div className="col-sm-6 col-12 mui-label-styling">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={field.expirationDate}
                        allowSameDateSelection={true}
                        label="Expiry Date"
                        onChange={(newValue) => {
                          onChangeExpirationDateFun(idx, newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={(e) => {
                              if (e.target.value === "") {
                                props.badgeFields[idx][
                                  "expirationDateIsBlank"
                                ] = true;
                                props.badgeFields[idx]["expirationDateError"] = false;
                              } else if (e.target.value !== "") {
                                props.badgeFields[idx][
                                  "expirationDateIsBlank"
                                ] = false;
                              }
                            }}
                            style={{
                              backgroundColor: "#f4f5f8",
                              width: "100%",
                              marginBottom: 20,
                            }}
                            className={classes.root}
                            error={field.expirationDateError}
                            helperText={ErrorText(
                              field.expirationDateError,
                              props.expirationDateErrorText
                            )}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                  <div className="col-sm-12 col-12">
                    <BadgeIssuedFrom
                      value={field.issuedFrom}
                      onChange={(e: any) => {
                        handleBadgeSelectFieldChange(idx, e);
                      }}
                      isError={field.issuedFromError}
                      errorText={props.issuedFromErrorText}
                      stateIssuedOnly={false}
                    />
                  </div>
                </div>
                {idx !== 0 ? (
                  <div className="d-flex justify-content-end">
                    <div
                      className="CancelButton"
                      onClick={() => removeBadgeFormFields(idx)}
                    >
                      Cancel
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </AccordionDetails>
          </AccordionWrapper>
        )}
      </div>
    );
  };

  let counter = 0;

  const handleInputChange = (event: React.ChangeEvent<any>) => {
    if (event.target.name === "lastName") {
      props.setLastName(event.target.value);
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          lastNameTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          lastNameTouched: false,
        });
      }
    }
    if (event.target.name === "firstName") {
      props.setFirstName(event.target.value);
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          firstNameTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          firstNameTouched: false,
        });
      }
    }
    if (event.target.name === "middleInitial") {
      props.setMiddleInitial(event.target.value);
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          middleInitialTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          middleInitialTouched: false,
        });
      }
    }
    if (event.target.name === "employeeId") {
      props.setEmployeeId(event.target.value);
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          employeeIdTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          employeeIdTouched: false,
        });
      }
    }
    if (event.target.name === "companyEmail") {
      onEmailChange(event.target.value);
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          companyEmailTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          companyEmailTouched: false,
        });
      }
    }

    if (event.target.name === "badgesName") {
      if (event.target.value.length >= 1) {
        setDirty({
          ...dirty,
          badgesNameTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          badgesNameTouched: false,
        });
      }
    }
    if (event.target.name === "OtherRoleDescription") {
      props.setOtherRoleDescription(event.target.value);
    }
  };

  const handleAddEmployeeButton = () => {
    if (props.isImported === true && selectedFile) {
      props.setManual(false);
      setAlertOpen(true);
      props.setValue(false);
      props.setCancelShow(true);
    } else {
      props.setManual(true);
      props.setCancelShow(false);
      props.setValue(true);
    }
  };
  const checkDirtyForCancelEmployee = () => {
    if (
      dirty.lastNameTouched ||
      dirty.firstNameTouched ||
      dirty.middleInitialTouched ||
      dirty.employeeIdTouched ||
      dirty.companyEmailTouched ||
      dirty.roleTouched ||
      dirty.licenseTouched ||
      dirty.badgesNameTouched ||
      dirty.issueDateTouched ||
      dirty.expirationDateTouched ||
      dirty.issuedFromTouched
    ) {
      props.setCancelShow(true);
      props.setValue(false);
    } else {
      props.setCancelShow(false);
      props.setValue(true);
    }
  };

  const [afterLoading, setAfterLoading] = useState(false);

  useEffect(() => {
    if (selectedFile && !showLoader) {
      setAfterLoading(true);
    } else {
      setAfterLoading(false);
    }
  }, [selectedFile, showLoader]);

  return (
    <div className="initial-setup-wrapper form-container employee-dropzone-wrapper">
      {props.manual === false ? (
        <div
          className="col-md-12 dropZoneBox"
        >
          <div>
            <button
              className="DropZone"
              onClick={handleClick}
              onDragOver={dragOver}
              onDragEnter={dragEnter}
              onDragLeave={dragLeave}
              onDrop={fileDrop}
            >
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={showLoader}
              >
                <CircularProgress />
              </Backdrop>
              <input
                type="file"
                ref={hiddenFileInput}
                style={{ display: "none" }}
                onChange={(e: any) => {
                  handleChange(e);
                }}
                disabled={handleInputDisable}
              />
              <h1 className="Title">
                <div
                  className="ImportButton"
                  onClick={() => {
                    props.setValue(false);
                    props.setCancelShow(true);
                    props.setIsImported(true);
                  }}
                >
                  <UploadFileOutlinedIcon />
                  <span style={{ color: "#233ce6" }}>Add a file</span> or drag
                  drop here
                </div>
              </h1>
            </button>
          </div>

          {afterLoading && (
            <div className="FileNameIconWrapper">
              <div className="d-flex">
                <TaskOutlinedIcon sx={{ fontSize: "20px" }}></TaskOutlinedIcon>
                <div className="FileNameWrapper">{selectedFile?.name}</div>
              </div>
              <div className="d-flex">
                <div>
                  <span className="FileSuccessMessage">
                    File successfully uploaded!
                  </span>
                </div>
                <div className="d-flex">
                  <button className="ArchiveLink" onClick={seeAllDetails}>
                    See details
                  </button>
                  <button
                    className="CrossIconBtn"
                    disabled={DeleteBtnDisable}
                    onClick={deleteExcelFile}
                  >
                    <CancelOutlinedIcon
                      sx={{
                        fontSize: "20px",
                        marginLeft: "10px",
                        "&:hover": { cursor: "pointer" },
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
          <span className="FileErrorMessage">{errorMessage}</span>
          <hr className="HorizontalRule" />
          <Button
            type="text"
            intent="secondary"
            onClick={handleAddEmployeeButton}
            iconWithButton="bi bi-plus-circle me-2"
            disabled={props.ManualEmpBtn}
            className="add-employee-button-manually"
            text="Enter employee manually"
          />
        </div>
      ) : (
        <div className="Card">
          <div className="row">
            <div className="col-sm-4 col-12">
              <InputBox
                error={props.lastNameError}
                helperText={ErrorText(
                  props.lastNameError,
                  props.lastNameErrorText
                )}
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="Enter last name"
                value={props.lastName}
                name="lastName"
                onChange={(e: any) => {
                  props.setLastNameError(false);
                  handleInputChange(e);
                }}
                maxLength={50}
                minLength={1}
              />
            </div>
            <div className="col-sm-4 col-12">
              <InputBox
                error={props.firstNameError}
                helperText={ErrorText(
                  props.firstNameError,
                  props.firstNameErrorText
                )}
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="Enter first name"
                value={props.firstName}
                name="firstName"
                onChange={(e: any) => {
                  props.setFirstNameError(false);
                  handleInputChange(e);
                }}
                maxLength={50}
                minLength={1}
              />
            </div>
            <div className="col-sm-2 col-12">
              <InputBox
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="M.I"
                value={props.middleInitial}
                name="middleInitial"
                onChange={(e: any) => {
                  handleInputChange(e);
                }}
                maxLength={1}
                minLength={0}
              />
            </div>
            <div className="col-sm-2 col-12">
              <InputBox
                error={props.employeeIdError}
                helperText={ErrorText(
                  props.employeeIdError,
                  props.employeeIdErrorText
                )}
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="I.D"
                value={props.employeeId}
                name="employeeId"
                onChange={(e: any) => {
                  props.setEmployeeIdError(false);
                  handleInputChange(e);
                }}
                maxLength={50}
                minLength={1}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12 col-12">
              <InputBox
                error={props.companyEmaiError}
                helperText={ErrorText(
                  props.companyEmaiError,
                  props.companyEmaiErrorText
                )}
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="Company email"
                name="companyEmail"
                value={props.companyEmail}
                onChange={(e: any) => {
                  handleInputChange(e);
                }}
                maxLength={100}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6 col-12">
              <div>Role</div>
              <FormControl error={props.roleError} style={{ width: "100%" }}>
                <Select
                  inputProps={{ "aria-label": "Without label" }}
                  variant="filled"
                  className="input-form select-field"
                  displayEmpty
                  value={props.role}
                  name="role"
                  onChange={handleSelect}
                  placeholder="Select Role"
                  IconComponent={CustomExpandMore}
                >
                  <MenuItem disabled value="" className="abcdef">
                    <span className="input-placeholder">Select Role</span>
                  </MenuItem>

                  {EmployeeRoles.map((name: any) => (
                    <MenuItem key={name.roleId} value={name.description}>
                      {name.description}
                    </MenuItem>
                  ))}
                </Select>

                {props.roleError === true ? (
                  <FormHelperText>Role is required</FormHelperText>
                ) : (
                  ""
                )}
              </FormControl>
            </div>
            <div className="col-sm-6 col-12">
              {IsOtherSelected && (
                <InputBox
                  hiddenLabel
                  variant="filled"
                  className="input-form mt-25"
                  placeholder="Role Description (optional)"
                  value={props.OtherRoleDescription}
                  name="OtherRoleDescription"
                  onChange={(e: any) => {
                    handleInputChange(e);
                  }}
                  maxLength={50}
                  minLength={1}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12 col-12">
              <div>Assign License (Optional)</div>
              <Select
                displayEmpty
                multiple
                value={props.license}
                name="license"
                onChange={handleSelect}
                placeholder="Select one or more"
                inputProps={{ "aria-label": "Without label" }}
                renderValue={(selected) => selected.join(", ")}
                variant="filled"
                className={"input-form select-field form-control"}
                IconComponent={CustomExpandMore}
              >
                <MenuItem disabled value="" className="abcdef">
                  <span className="input-placeholder">Select one or more</span>
                </MenuItem>
                {licenses.map((li: any) => (
                  <MenuItem key={li.licenseNumber} value={li.licenseNumber}>
                    <ListItemText primary={li.licenseNumber} />
                    <Checkbox
                      checked={
                        props.licenseNumberIds.includes(li.id) ? true : false
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          {props.badgeFields.map((field: BadgeType, idx: number) =>
            badgeComponent(field, idx)
          )}
          <div
            className="AddEmployeeButton"
            onClick={() => addBadgeFormFields()}
          >
            <i className="bi bi-plus-circle" />
            <span className="btn-name">Add a new badge</span>
          </div>
          {props.badgeCommonError && (
            <p className="text-danger">
              {" "}
              {ErrorText(
                props.badgeCommonError,
                props.badgeCommonErrorText
              )}{" "}
            </p>
          )}
        </div>
      )}

      <AddEmployeeAlertBox
        alertOpen={alertOpen}
        handleAlertYes={handleAlertYes}
        handleAlertNo={() => setAlertOpen(false)}
        alertMessage="If you want to add employee manually, you will loose the file you have uploaded. Do you want to continue?"
      />
    </div>
  );
};

export default Employee;
