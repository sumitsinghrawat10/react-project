import React, { ChangeEvent, useEffect, useState, useRef } from "react";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import Swal from "sweetalert2";
import { ValidateRole } from "../../../utilities/ValidateRole";
import AddTooltip from "../../../components/AddTooltip";
import DialogWithTwoBtn from "../../../components/DialogWithTwoBtn";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
} from "../../../utilities/constants";
import SuccessToaster from "../../../components/SuccessToaster";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Backdrop,
  FormControl,
  DialogTitle,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import axios from "axios";
import moment from "moment";
import SwalBox from "../../../components/SwalBox";
import Button from "../../../components/Button";
import TextBox from "../../../components/TextBox";
import DateSelector from "../../../components/DateSelector";
import { useStyles } from "../../../components/InputStyles";
import SelectBox from "../../../components/SelectBox";
import InputBox from "../../../components/InputBox";

import {
  ADD_VEHICLE,
  DOWNLOAD_VEHICLE_TEMPLATE,
  GET_DRIVER_DETAILS,
  UPLOAD_VEHICLES_EXCELFILE,
  GET_VEHICLES_EXCEL_ERRORS,
  MOVE_VEHICLES_EXCELFILE_DB,
  DELETE_VEHICLES_EXCELFILE,
  UPDATE_VEHICLE,
} from "../../../networking/httpEndPoints";
import AddVehicleImage from "./AddVehicleImage";

interface VehicleType {
  vehicleId?: number;
  open: boolean;
  importDialogOpen?: any;
  setImportDialogOpen?: any;
  setOpen?: any;
  successRecords?: any;
  setSuccessRecords?: any;
  failedRecords?: any;
  setFailedRecords?: any;
  importResponseData?: any;
  setImportResponseData?: any;
  setHandleBtnDisable?: any;
  HandleBtnDisable?: any;
  handleYes: any;
  setConfirmationModalIsVisible: any;
  GetAllVehicleDetials?: any;
  vehicleData?: {
    [key: string]: any;
  };
  isEdit?: boolean | false;
  setEditConfirmationModalIsVisible?: any;
  getVehicleDetails?: any;
}
interface VehicleResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}
interface IDriver {
key: string;
value: string;
}
type SelectedFileType = {
  name: string;
};
const useMakeStyles = makeStyles({
  root: {
    "& .MuiFilledInput-root:before": {
      borderBottom: "none!important",
    },
  }
});
const AddVehicleForm: React.FC<VehicleType> = (props: VehicleType) => {
  const formclasses = useStyles();
  const classes = useMakeStyles();
  const [disabled, setDisabled] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const form = new FormData();
  const [updateVehicle, setUpdateVehicle] = useState(false);

  //=============== State variables for Vehicle ===========
  const [year, setYear] = useState("");
  const [yearError, setYearError] = useState(false);
  const [yearErrorText, setYearErrorText] = useState("Year is required");
  const [make, setMake] = useState("");
  const [makeError, setMakeError] = useState(false);
  const [makeErrorText, setMakeErrorText] = useState("Make is required");
  const [model, setModel] = useState("");
  const [modelError, setModelError] = useState(false);
  const [modelErrorText, setModelErrorText] = useState("Model is required");
  const [licensePlate, setLicensePlate] = useState("");
  const [licensePlateError, setLicensePlateError] = useState(false);
  const [licensePlateErrorText, setLicensePlateErrorText] = useState(
    "License Plate is required"
  );
  const [color, setColor] = useState("");
  const [colorError, setColorError] = useState(false);
  const [colorErrorText, setColorErrorText] = useState("Color is required");
  const [vinNumber, setVinNumber] = useState("");
  const [vinNumberError, setVinNumberError] = useState(false);
  const [vinNumberErrorText, setVinNumberErrorText] = useState(
    "VIN Number is required"
  );
  const [insuranceName, setInsuranceName] = useState("");
  const [insuranceNameError, setInsuranceNameError] = useState(false);
  const [insuranceNameErrorText, setInsuranceNameErrorText] = useState(
    "Insurance Name is required"
  );
  const [registrationDate, setRegistrationDate] = useState<any>(null);
  const [registrationDateError, setRegistrationDateError] = useState(false);
  const [registrationDateErrorText, setRegistrationDateErrorText] = useState(
    "Registration Date is required"
  );
  const [insuranceDate, setInsuranceDate] = useState<any>(null);
  const [dateFieldIsBlank, setDateFieldIsBlank] = useState(false);
  const [insuranceDateError, setInsuranceDateError] = useState(false);
  const [insuranceDateErrorText, setInsuranceDateErrorText] = useState(
    "Insurance Date is required"
  );
  const [vinDuplicate, setVinDuplicate] = useState("");

  const [driverDetails, setDriverDetails] = useState([]);
  const [alarmSystem, setAlarmSystem] = useState("");
  const [alarmSystemError, setAlarmSystemError] = useState(false);
  const [driver, setDriver] = useState<string>("");
  const [open, setOpen] = useState(false);

  const [errorDriver, setErrorDriver] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [ImportSelected, setImportSelected] = useState(false);

  const inputFileRef = useRef<any | null>(null);
  const minDate = new Date(new Date().getTime() + 86400000);
  const token = localStorage.getItem("user");
  let validate = true;

  //EXCEL VARIABLES
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileImportError, setFileImportError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFileType | null>(
    null
  );
  const [excelError, setExcelError] = React.useState<any>([]);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [handleInputDisable, setHandleInputDisable] = useState(false);
  const [DeleteBtnDisable, setDeleteBtnDisable] = React.useState(false);
  const [isCancel, setIsCancel] = React.useState(false);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [afterLoading, setAfterLoading] = useState(false);
  const [heading, setHeading] = useState("Add a New Vehicle");
  const [selectedFileName, setSelectedFileName] = useState("");

  //EXCEL VARIABLES end

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const reg = /^\d*(\.\d+)?$/;
    if (
      e.target.name === "year" &&
      e.target.value.length <= 4 &&
      reg.test(e.target.value)
    ) {
      setYear(e.target.value);
      setYearErrorText("Year ");
    }
    if (e.target.name === "make") {
      setMake(e.target.value);
    }
    if (e.target.name === "model") {
      setModel(e.target.value);
    }
    if (e.target.name === "license plate") {
      setLicensePlate(e.target.value);
    }
    if (e.target.name === "color") {
      setColor(e.target.value);
    }
    if (e.target.name === "vin value") {
      setVinNumber(e.target.value);
      setVinDuplicate("");
    }
    if (e.target.name === "insurance name") {
      setInsuranceName(e.target.value);
    }
    if (e.target.name === "insurance expiration date") {
      setInsuranceDate(e.target.value);
    }
    const date_regex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    if (
      e.target.name === "registration date" &&
      date_regex.test(e.target.value)
    ) {
      setRegistrationDate(e.target.value);
    }
    if (e.target.name === "driver") {
      setDriver(e.target.value);
    }
    setDisabled(false);
  };

  const validateAddVehicle = () => {
    if (!registrationDate || dateFieldIsBlank) {
      setRegistrationDateError(true);
      setRegistrationDateErrorText("Registration exp date is required");
      validate = false;
      setDisabled(false);
    }
    if (
      new Date(String(moment(registrationDate).format("MM/DD/YYYY"))) <
      new Date(new Date().getTime() + 1)
    ) {
      setRegistrationDateError(true);
      setRegistrationDateErrorText("Only future date is accepted");
      validate = false;
      setDisabled(false);
    }
    if (!insuranceDate || dateFieldIsBlank) {
      setInsuranceDateError(true);
      setInsuranceDateErrorText("Insurance exp date  is required");
      validate = false;
      setDisabled(false);
    }
    if (
      new Date(String(moment(insuranceDate).format("MM/DD/YYYY"))) <
      new Date(new Date().getTime() + 1)
    ) {
      setInsuranceDateError(true);
      setInsuranceDateErrorText("Only future date is accepted");
      validate = false;
      setDisabled(false);
    }

    if (insuranceDateError || registrationDateError) {
      validate = false;
      setDisabled(false);
    }
    if (
      (!props.isEdit || props.isEdit === undefined) &&
      driver.trim().length === 0
    ) {
      setErrorDriver(true);
      validate = false;
      setDisabled(false);
    }
    if (!alarmSystem) {
      setAlarmSystemError(true);
      validate = false;
      setDisabled(false);
    }
    return validate;
  };

  const validateFields = () => {
    if (!year || year.length < 4) {
      setYearError(true);
      setYearErrorText("YYYY Required");
      validate = false;
      setDisabled(false);
    }
    if (make.trim().length === 0) {
      setMakeError(true);
      setMakeErrorText("Required");
      validate = false;
      setDisabled(false);
    }
    if (model.trim().length === 0) {
      setModelError(true);
      setModelErrorText("Model is required");
      validate = false;
      setDisabled(false);
    }
    if (licensePlate.trim().length === 0) {
      setLicensePlateError(true);
      setLicensePlateErrorText("License plate # is required");
      validate = false;
      setDisabled(false);
    }
    if (licensePlate.trim().length > 10) {
      setLicensePlateError(true);
      setLicensePlateErrorText(
        "License Plate # cannot be more than 10 characters"
      );
      validate = false;
      setDisabled(false);
    }
    if (color.trim().length === 0) {
      setColorError(true);
      setColorErrorText("Color is required");
      validate = false;
      setDisabled(false);
    }
    if (vinNumber.trim().length === 0) {
      setVinNumberError(true);
      setVinNumberErrorText("VIN is required");
      validate = false;
      setDisabled(false);
    }
    if (vinNumber.trim().length > 20) {
      setVinNumberError(true);
      setVinNumberErrorText("VIN cannot be more than 20 characters");
      validate = false;
      setDisabled(false);
    }
    if (insuranceName.trim().length === 0) {
      setInsuranceNameError(true);
      setInsuranceNameErrorText("Insurance Name is required");
      validate = false;
      setDisabled(false);
    }
    validateAddVehicle();
    return validate;
  };

  const commonFormData = () => {
    if (props.isEdit) {
      const employeeId =
        driver.length !== 0 ? driverId : props?.vehicleData?.employeeId;
      form.append("EmployeeID", employeeId);
      form.append("VehicleId", String(props?.vehicleId));
    } else {
      form.append("EmployeeID", driverId);
    }
    form.append("Year", year.trim());
    form.append("Make", make.trim());
    form.append("Model", model.trim());
    form.append("Color", color.trim());
    form.append("LicensePlate", licensePlate.trim());
    form.append("HasAlarm", alarmSystem);
    form.append("VIN", vinNumber.trim());
    form.append(
      "RegistrationExpirationDate",
      moment(registrationDate).format("MM/DD/YYYY")
    );
    form.append(
      "InsuranceExpirationDate",
      moment(insuranceDate).format("MM/DD/YYYY")
    );
    form.append("VehicleImage", inputFileRef.current.files[0]);
    form.append("InsuranceName", insuranceName.trim());
  };

  const submitVehicleForm = () => {
    if (validateFields()) {
      commonFormData();
      if (token !== null) {
        setShowLoader(true);
        axios
          .post<VehicleResponse>(ADD_VEHICLE, form, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            setShowLoader(false);

            if (res.status === 201 && res.data.isSuccess) {
              props.setConfirmationModalIsVisible(true);
              props.GetAllVehicleDetials();
              handleCancel();
              setUpdateVehicle(true);
              setTimeout(() => {
                props.setConfirmationModalIsVisible(false);
              }, 3000);
            } else if (
              res.status === 201 &&
              !res.data.isSuccess &&
              res.data.responseMessage ===
                "This VIN already exists in the system. Please provide another unique VIN."
            ) {
              setVinDuplicate("This VIN is already present in the application");
            } else {
              props.handleYes(false);
            }
          })
          .catch(() => setShowLoader(false));
      }
    }
  };

  const updateVehicleForm = () => {
    if (validateFields()) {
      commonFormData();
      setShowLoader(true);
      axios
        .post<VehicleResponse>(UPDATE_VEHICLE, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.status === 201 && res.data.isSuccess) {
            props.setEditConfirmationModalIsVisible(true);
            setTimeout(() => {
              props.setEditConfirmationModalIsVisible(false);
            }, 3000);
            setUpdateVehicle(true);
            handleCancel();
            props.getVehicleDetails();
          } else if (
            res.status === 201 &&
            !res.data.isSuccess &&
            res.data.responseMessage ===
              "Please provide valid Employee Id associated with user organization."
          ) {
            SwalBox(res.data.responseMessage, "error");
          } else {
            props.handleYes(false);
          }
        })
        .catch(() => setShowLoader(false));
    }
  };

  const handleChangeDriver = (event: SelectChangeEvent) => {
    driverDetails.map((x:IDriver)=>{
      if(x.value === event.target.value)
      {
         setDriverId(x.key);
      }
    });
    if (event.target.value === "") {
      setErrorDriver(true);
    } else {
      setErrorDriver(false);
      setDriver(event.target.value);
    }
    setDisabled(false);
  };

  useEffect(() => {
    if (props.isEdit) {
      setDisabled(true);
      setYear(props?.vehicleData?.year);
      setMake(props?.vehicleData?.make);
      setModel(props?.vehicleData?.model);
      setLicensePlate(props?.vehicleData?.licensePlate);
      setColor(props?.vehicleData?.color);
      setVinNumber(props?.vehicleData?.vin);
      setRegistrationDate(props?.vehicleData?.registrationExpirationDate);
      setAlarmSystem(props?.vehicleData?.hasAlarm.toString().toLowerCase());
      setInsuranceName(props?.vehicleData?.insuranceName);
      setInsuranceDate(props?.vehicleData?.insuranceExpirationDate);
    }
    if (props.open) {
      GetDriverDetials();
    }
  }, [props.isEdit, props?.vehicleData, props.open]);

  // Getting Driver Detials
  const GetDriverDetials = () => {
    axios
      .get<VehicleResponse>(`${GET_DRIVER_DETAILS}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.isSuccess && res.data.result !== null) {
          setDriverDetails(res.data.result);
        } else if (
          !res.data.isSuccess &&
          res.data.result === "No data found."
        ) {
          setDriverDetails([]);
        }
      });
  };

  const handleChangeVehiclePic = () => {
    setOpen(true);
    setDisabled(false);
  };

  const ErrorState = () => {
    setDisabled(true);
    props.handleYes(false);
    setYearError(false);
    setMakeError(false);
    setModelError(false);
    setInsuranceDateError(false);
    setRegistrationDateError(false);
    setLicensePlateError(false);
    setColorError(false);
    setVinNumberError(false);
    setInsuranceNameError(false);
    setAlarmSystemError(false);
    setErrorDriver(false);
  };
  const clearAllInputs = () => {
    setYear("");
    setMake("");
    setModel("");
    setLicensePlate("");
    setColor("");
    setVinDuplicate("");
    setVinNumber("");
    setInsuranceName("");
    setDriver("");
    setAlarmSystem("");
    setErrorMessage("");
    setRegistrationDate(null);
    setInsuranceDate(null);
  };
  const handleCancel = () => {
    if (!props.isEdit || updateVehicle) {
      props.setOpen(false);
      clearAllInputs();
      if (inputFileRef && inputFileRef.current) {
        inputFileRef.current.value = "";
      }

      setSelectedFile(null);
      setSelectedExcelFile(null);
      setHandleInputDisable(false);
      if (hiddenFileInput && hiddenFileInput.current) {
        hiddenFileInput.current.value = "";
      }
      setRegistrationDate(new Date());
      setInsuranceDate(new Date());
      setTimeout(() => {
        setHeading("Add a New Vehicle");
        setRegistrationDate(null);
        setInsuranceDate(null);
      }, 0);
    } else {
      setYear(props?.vehicleData?.year);
      setMake(props?.vehicleData?.make);
      setModel(props?.vehicleData?.model);
      setLicensePlate(props?.vehicleData?.licensePlate);
      setColor(props?.vehicleData?.color);
      setVinNumber(props?.vehicleData?.vin);
      setRegistrationDate(props?.vehicleData?.registrationExpirationDate);
      setAlarmSystem(props?.vehicleData?.hasAlarm.toString().toLowerCase());
      setInsuranceName(props?.vehicleData?.insuranceName);
      setInsuranceDate(props?.vehicleData?.insuranceExpirationDate);
      setDriver("");
      inputFileRef.current.value = null;
    }
    ErrorState();
    setTimeout(() => {
      setImportSelected(false);
    }, 1000);
  };
  const ErrorVehicleText = (condition: boolean, text: string) => {
    if (condition) {
      return text;
    } else {
      return "";
    }
  };
  const handleLicenseDateFieldChange = (
    value: any,
    setError: any,
    setErrorText: any
  ) => {
    const newFormValues = String(moment(value).format("MM/DD/YYYY"));
    if (new Date(newFormValues) < new Date(new Date().getTime() + 1)) {
      setError(true);
      setErrorText("Only future date is accepted*");
    } else if (moment(newFormValues, "MM/DD/YYYY", true).isValid() === false) {
      setError(true);
      setErrorText("Please enter date in MM/DD/YYYY.");
    }
    setDisabled(false);
  };
  const RoleValidatorForDownloadTemplate = ValidateRole([
    SystemAdministrator,
    DirectorOfCompliance,
    ComplianceAnalyst,
  ]);
  const handleDownloadTemplate = () => {
    axios
      .get(DOWNLOAD_VEHICLE_TEMPLATE, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((resp: any) => {
        if (resp.status === 200) {
          const url = [resp.data.result];
          const downloadLink: any = document.createElement("a");
          downloadLink.href = url;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          downloadLink.parentNode.removeChild(downloadLink);
        }
      });
  };

  //upload excel code

  const onExcelUpload = (fileDataSent: any) => {
    const excelData = new FormData();
    excelData.append("ExcelFile", fileDataSent);

    if (token !== null) {
      setShowLoader(true);
      axios
        .post<VehicleResponse>(UPLOAD_VEHICLES_EXCELFILE, excelData, {
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
              props.setImportDialogOpen,
              props.setHandleBtnDisable,
              token
            );
            setDeleteBtnDisable(true);
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
          Swal.close();
        })
        .catch((error) => {
          setShowLoader(false);
          AlertMsgForInvalidExlTemplate(error, isConfirmFunction);
        });
    }
  };

  const fileValidator = (file: any) => {
    let error;
    if (file.length > 1) {
      setErrorMessage("Please upload one file at a time.");
      setFileImportError(true);
      error = true;
    } else if (file[0].name.split(".").pop() !== "xlsx") {
      setErrorMessage("Only Excel file (xlsx) is accepted.");
      error = true;
      setFileImportError(true);
    } else if (file[0].size > 5120000) {
      setErrorMessage(
        "File you are trying to upload must be equal or less than 5 MB."
      );
      error = true;
      setFileImportError(true);
    } else {
      error = false;
    }

    if (!error) {
      setErrorMessage("");
      setFileImportError(false);
      return true;
    } else {
      return false;
    }
  };

  const handleClick = () => {
    hiddenFileInput.current?.click();
    setIsCancel(true);
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
      setFileImportError(false);
      const { files } = e.dataTransfer;
      let validatorResponse = false;
      validatorResponse = fileValidator(files);

      if (validatorResponse) {
        setSelectedFile(files[0]);
        setSelectedFileName(files[0].name);
        setSelectedExcelFile(files[0]);
        setErrorMessage("");
        onExcelUpload(files[0]);
      }
    } else {
      e.preventDefault();
    }
  };

  const uploadImageSection =
    inputFileRef.current && inputFileRef.current.files[0] ? (
      <span className="upload-image">{inputFileRef.current.files[0].name}</span>
    ) : (
      <span>Upload an image</span>
    );

  const updateVehicleTitle = () => {
    if (props.isEdit) {
      return "Edit Vehicle";
    } else {
      return heading;
    }
  };
  const updateImageTitle = () => {
    if (props.isEdit) {
      return "Change vehicle image";
    } else {
      return "Vehicle image";
    }
  };

  const getExcelErrors = (
    setExcelError1: any,
    setDeleteBtnDisable1: any,
    setOpen1: any,
    setHandleBtnDisable1: any,
    token1: any
  ) => {
    if (token1 !== null) {
      Swal.showLoading();
      axios
        .get(GET_VEHICLES_EXCEL_ERRORS, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200) {
            setExcelError1(res.data);
            setDeleteBtnDisable1(false);
            setOpen1(true);
            setHandleBtnDisable1(true);
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
          Swal.close();
        })
        .catch(() => Swal.close());
    }
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
  const AlertMsgForInvalidExlTemplate = (
    error: any,
    _isConfirmFunction: any
  ) => {
    if (error.response.status === 400) {
      if (
        error.response.data.title ===
        "The uploaded file does not match the template. Please download and use the template from the link provided."
      ) {
        Swal.fire({
          text: "The uploaded file does not match the template. Please download and use the template from the link provided.",
          confirmButtonText: "OK",
          icon: "error",
          allowOutsideClick: false,
          customClass: { container: "DashboardEmpSwal" },
        }).then((isConfirm) => {
          _isConfirmFunction(isConfirm);
        });
      } else if (
        error.response.data.title ===
        "The file you are trying upload does not have any data"
      ) {
        Swal.fire({
          text: "The file you are trying to upload does not have any data.",
          confirmButtonText: "OK",
          icon: "error",
          allowOutsideClick: false,
          customClass: { container: "DashboardEmpSwal" },
        }).then((isConfirm) => {
          _isConfirmFunction(isConfirm);
        });
      } else {
        Swal.fire({
          text: "Something went wrong, Please check your excel file",
          confirmButtonText: "OK",
          icon: "error",
          allowOutsideClick: false,
          customClass: { container: "DashboardEmpSwal" },
        }).then((isConfirm) => {
          _isConfirmFunction(isConfirm);
        });
      }
    }
  };
  const handleExcelFileChange = (event: any) => {
    let validatorResponse = false;
    setErrorMessage("");
    setFileImportError(false);
    validatorResponse = fileValidator(event.target.files);
    if (validatorResponse) {
      setSelectedFile(event.target.files[0]);
      setSelectedFileName(event.target.files[0].name);
      setSelectedExcelFile(event.target.files[0]);
      setErrorMessage("");
      setHandleInputDisable(true);
      onExcelUpload(event.target.files[0]);
    }
  };

  useEffect(() => {
    if (selectedFile && !showLoader) {
      setAfterLoading(true);
    } else {
      setAfterLoading(false);
    }
  }, [selectedFile, showLoader]);
  const saveExlData = () => {
    if (selectedExcelFile !== null && fileImportError === false) {
      onExcelSubmit(selectedExcelFile);
    }
  };
  const onExcelSubmit = (fileDataSent: any) => {
    const excelData = new FormData();
    excelData.append("employeeList", fileDataSent);

    if (token !== null) {
      setShowLoader(true);
      axios
        .post<DataResponse>(MOVE_VEHICLES_EXCELFILE_DB, excelData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (
            res.status === 201 &&
            res.data.isSuccess &&
            res.data.result != null
          ) {
            setConfirmationModalIsVisible(true);
            setTimeout(() => {
              setConfirmationModalIsVisible(false);
            }, 3000);
            handleCancel();
            props.GetAllVehicleDetials();
          } else if (res.status === 400) {
            Swal.fire({
              text: "Error in file!",
              confirmButtonText: "OK",
              icon: "error",
            });
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
          Swal.close();
        })
        .catch(() => {
          setShowLoader(false);
        });
    }
  };
  const seeAllDetails = () => {
    getExcelErrors(
      setExcelError,
      setDeleteBtnDisable,
      props.setImportDialogOpen,
      props.setHandleBtnDisable,
      token
    );
  };

  const deleteExcelFile = () => {
    setShowLoader(true);
    axios
      .delete<DataResponse>(DELETE_VEHICLES_EXCELFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json-patch+json",
          "Content-Type": "application/json-patch+json",
        },
      })
      .then((res) => {
        setShowLoader(false);
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
          setSelectedExcelFile(null);
          if (hiddenFileInput && hiddenFileInput.current) {
            hiddenFileInput.current.value = "";
          }
          props.setSuccessRecords([]);
          props.setFailedRecords([]);
          props.setHandleBtnDisable(false);
          if (!isCancel) {
            swalAlertFunction(isCancelFunctionB);
          } else {
            swalAlertFunction(isCancelFunctionA);
          }
        } else {
          Swal.fire({
            text: "Something went wrong While Deleting File !",
            confirmButtonText: "OK",
            icon: "error",
            customClass: { container: "DashboardEmpSwal" },
          });
        }
      })
      .catch(() => {
        setShowLoader(false);
        Swal.fire({
          text: "Something went wrong!",
          confirmButtonText: "OK",
          icon: "error",
        });
      });
  };
  const swalAlertFunction = (isCancelFunction: any) => {
    return Swal.fire({
      text: "File deleted successfully!",
      confirmButtonColor: "#233ce6",
      icon: "success",
      allowOutsideClick: false,
      customClass: { container: "DashboardEmpSwal" },
    }).then((result) => {
      if (result.isConfirmed) {
        isCancelFunction();
      }
    });
  };
  const isCancelFunctionA = () => {
    setHandleInputDisable(false);
    setDeleteBtnDisable(false);
  };
  const isCancelFunctionB = () => {
    setHandleInputDisable(false);
    setDeleteBtnDisable(false);
    setHeading("Add a New Vehicle");
  };
  //end upload excel code
  const handleVehicleImport = () => {
    setHeading("Import Vehicle Data");
    setImportSelected(true);
    clearAllInputs();
  };
  const [DialogOpen, setDialogOpen] = useState(false);
  const handleVehicleManually = () => {
    setIsCancel(false);
    if (selectedExcelFile && selectedFile) {
      setDeleteBtnDisable(true);
      setDialogOpen(true);
    } else {
      setHeading("Add a New Vehicle");
      setImportSelected(false);
    }
  };
  const handleAlertYes = () => {
    deleteExcelFile();
    setHeading("Add a New Vehicle");
    handleVehicleManually();
    setImportSelected(false);
    setDialogOpen(false);
  };
  const handleAlertNo = () => {
    setDialogOpen(false);
  };

  const MuiltlineError = (): JSX.Element => {
    if (licensePlate.trim().length > 10) {
      return (
        <>
          <div className="row mt-4"></div>
        </>
      );
    } else {
       return (
        <>
          <p></p>
        </>
       );
    }
  };
  return (
    <>
      <Dialog
        className="vehicles-index-container dialog-title dialog-box submit-wrapper"
        open={props.open}
        keepMounted
        aria-labelledby="alert-dialog-title"
        PaperProps={{
          sx: {
            maxHeight: "90vh",
          },
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>
        <div>
          <button onClick={handleCancel} className="btn-close  close-dialog">
            <div style={{ display: "none" }}>Close</div>
          </button>
        </div>
        <DialogTitle id="alert-dialog-title" className="dialog-title">
          {updateVehicleTitle()}
        </DialogTitle>
        <DialogContent
          id="alert-dialog-description"
          className="dialog-box vehicles-index-container"
        >
          {ImportSelected && (
            <div className="col-md-12 vehicle-import-form">
              <div className="vehicle-form-alignment">
                <div className="row">
                  <div
                    className="DropZone"
                    onDragOver={dragOver}
                    onDragEnter={dragEnter}
                    onDragLeave={dragLeave}
                    onDrop={fileDrop}
                  >
                    <input
                      type="file"
                      ref={hiddenFileInput}
                      style={{ display: "none" }}
                      onChange={(e: any) => {
                        handleExcelFileChange(e);
                      }}
                      disabled={handleInputDisable}
                    />
                    <h1 className="Title">
                      <div className="ImportButton">
                        <UploadFileOutlinedIcon />
                        <span
                          className="primary-blue me-1"
                          onClick={handleClick}
                        >
                          Click here to add a file
                        </span>
                        or drag drop here
                      </div>
                    </h1>
                  </div>
                </div>

                {afterLoading && (
                  <>
                    <div className="upload-successfully">
                      <span className="FileSuccessMessage">
                        File successfully uploaded!
                      </span>
                    </div>
                    <div className="FileNameIconWrapper">
                      <div className="d-flex">
                        <TaskOutlinedIcon
                          sx={{ fontSize: "20px" }}
                        ></TaskOutlinedIcon>
                        <AddTooltip
                          value={selectedFileName}
                          len={40}
                          styleclass="vehicle-file-wrapper"
                        />
                      </div>
                      <div className="d-flex" style={{ marginLeft: "52px" }}>
                        <button
                          className="SeeDetailsLink"
                          onClick={seeAllDetails}
                        >
                          See details
                        </button>
                        <button
                          className="CrossIconBtn"
                          disabled={DeleteBtnDisable}
                          onClick={() => {
                            deleteExcelFile();
                          }}
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
                  </>
                )}
                <span className="FileErrorMessage">{errorMessage}</span>
                <hr className="HorizontalRule" />
                <div className="btn-outer-box">
                  <div className="vehicle-btns-wrapper">
                    {RoleValidatorForDownloadTemplate && (
                      <p
                        className="image-curosr"
                        onClick={handleDownloadTemplate}
                      >
                        <FileDownloadOutlinedIcon />
                        Download Template
                      </p>
                    )}
                    <p className="image-curosr" onClick={handleVehicleManually}>
                      <AddCircleOutlineIcon />
                      Enter vehicle manually
                    </p>
                  </div>
                  <Button
                    type="contained"
                    intent="primary"
                    disabled={props.HandleBtnDisable}
                    onClick={saveExlData}
                    text="Submit"
                  />
                </div>
              </div>
            </div>
          )}
          {!ImportSelected && (
            <div className="row vehicle-manual-form">
              <div className="col-12 mt-4 mb-2">
                <div className="flex-container">
                  <div className="flex-child-year">
                    <InputBox
                        error={yearError}
                        name="year"
                        helperText={ErrorVehicleText(yearError, yearErrorText)}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={year}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setYearError(false);
                        handleInputChange(e);
                      }}
                        maxLength={4}
                        width={80}
                        placeholder="Year"
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "10px",
                      }}
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex-child-make">
                    <InputBox
                        error={makeError}
                        name="make"
                        helperText={ErrorVehicleText(makeError, makeErrorText)}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={make}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setMakeError(false);
                        handleInputChange(e);
                      }}
                        minLength={1}
                        maxLength={50}
                        width={140}
                        placeholder="Make"
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "20px",
                      }}
                      autoComplete="off"
                      ariaLabel="Make"
                    />
                  </div>
                  <div className="flex-child-model">
                    <InputBox
                        error={modelError}
                        name="model"
                        helperText={ErrorVehicleText(modelError, modelErrorText)}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={model}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setModelError(false);
                        handleInputChange(e);
                      }}
                        placeholder="Model"
                        minLength={1}
                        maxLength={50}
                        width={230}
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "10px",
                      }}
                      autoComplete="off"
                      ariaLabel="Model"
                    />
                    </div>
                </div>
              </div>

              <div className="col-12 mt-2 mb-1">
                <div className="flex-container">
                  <div className="flex-child-license">
                    <InputBox
                        error={licensePlateError}
                        name="license plate"
                        helperText={ErrorVehicleText(
                        licensePlateError,
                        licensePlateErrorText
                      )}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={licensePlate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setLicensePlateError(false);
                        handleInputChange(e);
                      }}
                        placeholder="License plate #"
                        minLength={1}
                        maxLength={50}
                        width={230}
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "10px",
                      }}
                      autoComplete="off"
                      ariaLabel="license plate"
                    />
                    </div>
                  <div className="flex-child-model">
                    <InputBox
                        error={colorError}
                        name="color"
                        helperText={ErrorVehicleText(colorError, colorErrorText)}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={color}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setColorError(false);
                        handleInputChange(e);
                      }}
                        placeholder="Color"
                        minLength={1}
                        maxLength={50}
                        width={230}
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "10px",
                      }}
                      autoComplete="off"
                      ariaLabel="color"
                    />
                    </div>
                </div>
              </div>
              <div className="col-12 mt-2 mb-0">
                <div className="flex-container">
                  <div className="flex-child-license">
                    <InputBox
                        error={vinNumberError}
                        name="vin value"
                        helperText={ErrorVehicleText(
                        vinNumberError,
                        vinNumberErrorText
                      )}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={vinNumber}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setVinNumberError(false);
                        handleInputChange(e);
                      }}
                        placeholder="VIN"
                        minLength={1}
                        maxLength={50}
                        width={230}
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "10px",
                      }}
                      autoComplete="off"
                      ariaLabel="VIN"
                    />
                  </div>
                  <div className="flex-child-license mui-label-styling">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateSelector
                        value={registrationDate}
                        label="Registration Expiry"
                        allowSameDateSelection={true}
                        onChangeDateSelector={(
                          newValue: ChangeEvent<HTMLInputElement>
                        ) => {
                          setRegistrationDateError(false);
                          if (newValue !== null) {
                            setRegistrationDate(newValue);
                            setDateFieldIsBlank(false);
                            handleLicenseDateFieldChange(
                              newValue,
                              setRegistrationDateError,
                              setRegistrationDateErrorText
                            );
                          }
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (e.target.value === "") setDateFieldIsBlank(true);
                        }}
                        className={formclasses.root}
                        error={registrationDateError}
                        helperText={ErrorVehicleText(
                          registrationDateError,
                          registrationDateErrorText
                        )}
                        minDate={minDate}
                        autoComplete="off"
                        fontSize={16}
                        width="230px"
                        labelColor="#9D9D9"
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>
              {vinDuplicate && <p className="text-danger"> {vinDuplicate} </p>}
              <div className="col-12 mt-4 mb-1">
                <div className="flex-container">
                  <div className="vehicle-upload-image">
                    <div className="flex-child-license">
                      <FormControl>
                        <span className="vehicle-label-span">
                          {" "}
                          Is there an alarm system ?{" "}
                        </span>
                        <RadioGroup
                          row
                          aria-labelledby="demo-controlled-radio-buttons-group"
                          name="controlled-radio-buttons-group"
                          value={alarmSystem}
                          onChange={(e) => {
                            setAlarmSystemError(false);
                            setAlarmSystem(e.target.value);
                            setDisabled(false);
                          }}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                        {alarmSystemError && (
                          <span className="error-alarm-system">
                            Please select an option
                          </span>
                        )}
                      </FormControl>
                    </div>
                    <div className="flex-child-model">
                      <div>
                        <p>
                          <span className="vehicle-label-span">
                            {updateImageTitle()}
                          </span>{" "}
                          (Optional)
                        </p>
                        <span onClick={handleChangeVehiclePic}>
                          <UploadFileOutlinedIcon className="image-curosr" />
                          <span className="mr-4 image-area image-curosr">
                            {uploadImageSection}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <AddVehicleImage
                setOpen={setOpen}
                open={open}
                setInputFileRef={inputFileRef}
              />
              <div className="col-12 mt-2 mb-1">
                <div className="flex-container">
                  <div className="flex-child-license">
                    <InputBox
                        error={insuranceNameError}
                        name="insurance name"
                        helperText={ErrorVehicleText(
                        insuranceNameError,
                        insuranceNameErrorText
                      )}
                        hiddenLabel
                        variant="filled"
                        className={`input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={insuranceName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setInsuranceNameError(false);
                        handleInputChange(e);
                      }}
                        placeholder="Insurance Name"
                        minLength={1}
                        maxLength={50}
                        width={230}
                        style={{
                        fontSize: 16,
                        background: "#f4f5f8",
                        paddingRight: "10px",
                      }}
                      autoComplete="off"
                      ariaLabel="Insurance Name"
                    />
                  </div>
                  <div className="flex-child-license mui-label-styling">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateSelector
                        value={insuranceDate}
                        label="Insurance Expiry"
                        allowSameDateSelection={true}
                        onChangeDateSelector={(
                          newValue: ChangeEvent<HTMLInputElement>
                        ) => {
                          setInsuranceDateError(false);
                          if (newValue !== null) {
                            setInsuranceDate(newValue);
                            setDateFieldIsBlank(false);
                            handleLicenseDateFieldChange(
                              newValue,
                              setInsuranceDateError,
                              setInsuranceDateErrorText
                            );
                          }
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (e.target.value === "") setDateFieldIsBlank(true);
                        }}
                        className={formclasses.root}
                        error={insuranceDateError}
                        helperText={ErrorVehicleText(
                          insuranceDateError,
                          insuranceDateErrorText
                        )}
                        minDate={minDate}
                        autoComplete="off"
                        fontSize={16}
                        width="230px"
                        labelColor="#9D9D9"
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>
              <div className="col-12 mt-2">
                <FormControl
                  sx={{ width: "470px" }}
                  error={errorDriver}
                  className="form-container"
                >
                  <span>
                    {!props.isEdit ? (
                      <p>
                        <span className="vehicle-label-span">
                          Assign a driver
                        </span>
                      </p>
                    ) : (
                      <div>
                        <span className="vehicle-label-span">
                          Change driver
                        </span>{" "}
                        (current driver: {props?.vehicleData?.firstName}{" "}
                        {props?.vehicleData?.lastName})
                      </div>
                    )}
                  </span>

                  <SelectBox
                    id="vehicledriverid"
                    name="driver"
                    displayEmpty
                    disabled={false}
                    value={driver}
                    onChange={handleChangeDriver}
                    className={`select-wrap select-driver-padding`}
                    ListData={driverDetails}
                    placeHolder="Select Driver"
                    itemName="value"
                    error={errorDriver}
                    errorText="Driver is required"
                    height="50px"
                    disableUnderLine={true}
                    placeholdercolor="input-placeholder-color"
                  />
                </FormControl>
              </div>
              <div className="col-12 addvehicle-submit-div">
                <span className="vehicle-submit-wrapper">
                  {!props.isEdit && (
                    <>
                      <div className="vehicle-import-download-wrapper">
                        <p
                          className="image-curosr"
                          onClick={handleVehicleImport}
                        >
                          Import Data
                        </p>
                      </div>
                      <div className="vehicle-import-download-wrapper">
                        {RoleValidatorForDownloadTemplate && (
                          <span
                            className="image-curosr"
                            onClick={handleDownloadTemplate}
                          >
                            <FileDownloadOutlinedIcon />
                            Download Template
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  <div className="add-vehcile-submit-button">
                    {!props.isEdit && (
                      <Button
                        type="contained"
                        intent="primary"
                        onClick={submitVehicleForm}
                        text="Submit"
                        height={50}
                        width={120}
                      />
                    )}
                  </div>
                </span>
              </div>
              <div className="vehicle-save-button">
                {props.isEdit && (
                  <Button
                    type="contained"
                    intent="primary"
                    onClick={updateVehicleForm}
                    disabled={disabled}
                    text="Save"
                    height={50}
                    width={120}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogWithTwoBtn
          noBtnClass="popup-btn"
          dialogOpen={DialogOpen}
          dialogSetOpen={setDialogOpen}
          message="If you want to add vehicle manually, you will lose the file you have uploaded. Do you want to continue?"
          yesBtnClick={handleAlertYes}
          noBtnClick={handleAlertNo}
        />
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Vehicle(s) Added successfully" />
      )}
    </>
  );
};

export default AddVehicleForm;
