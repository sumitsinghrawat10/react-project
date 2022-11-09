import React, { useState, useEffect } from "react";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  Step,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  StepLabel,
  Stepper,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Button from "../../components/Button";
import axios from "axios";
import moment from "moment";
import { useSelector, connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import Swal from "sweetalert2";

import DialogWithTwoBtn from "../../components/DialogWithTwoBtn";
import CancelPopUpComponent from "../../components/Employee/CancelPopUpComponent";
import { getDownloadTemplate } from "../../components/Employee/EmployeeImportMethods";
import ImportEmployeeRespModal from "../../components/Employee/ImportEmployeeRespModal";
import Left from "../../components/Signup/left";
import {
  ADD_EMPLOYEE,
  ADD_INITIAL_LICENSE,
  DELETE_LOCATION,
  UPDATE_LICENSE,
  MOVE_EXCELDATA_TO_DB,
  UPDATE_SIGNUP_STATUS,
} from "../../networking/httpEndPoints";
import * as UserDetailsActions from "../../pages/Login/authenticationActions";
import { RootState } from "../../redux/rootReducer";
import {
  SystemAdministrator,
  DirectorOfCompliance,
} from "../../utilities/constants";
import { decodeToken } from "../../utilities/decodeToken";
import { roleValidator } from "../../utilities/roleValidator";
import AddLocationDialogBox from "./addLocationDialogBox";
import Employee from "./employee";
import License from "./license";
import Location from "./location";
import { licenseFields as licencseFieldTypes } from "../../components/Employee/handleDateFieldChange";
const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
    left: "calc(-50% + 15px)",
    right: "calc(50% + 15px)",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#233ce6",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ ownerState }) => ({
  backgroundColor: "#fff",
  zIndex: 1,
  color: "#001e46",
  width: 40,
  height: 40,
  display: "flex",
  border: "2px solid #233ce6",
  borderRadius: "5px",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "20px",
  ...(ownerState.active && {
    color: "#fff",
    background: "#233ce6",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <div>1</div>,
    2: <div>2</div>,
    3: <div>3</div>,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ["Location", "License", "Employee"];
interface InitialSetUpType {
  setActiveWizard: any;
  setActiveStep: any;
  setWizardStepCounter: any;
  setClientName: any;
  activeStep: number;
  organizationLocationId: number;
  setOrganizationLocationId: any;
  actions: typeof UserDetailsActions;
  value: boolean;
  setValue: any;
  cancelShow: boolean;
  setCancelShow: any;
  activeWizard: string;
  isImported: boolean;
  setIsImported: any;
}
interface AddEmployeeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface AddExcelFileResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}
interface UpdateSignupStatusResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}

const InitialSetup: React.FC<InitialSetUpType> = (props: InitialSetUpType) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [wizardStepCounter, setWizardStepCounter] = React.useState(1);
  const [activeWizard, setActiveWizard] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [licenseOpen, setLicenseOpen] = React.useState(false);
  const [value, setValue] = React.useState(true);
  const [cancelShow, setCancelShow] = React.useState(false);
  const history = useHistory();
  const [manual, setManual] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [fileImportError, setFileImportError] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResponseData, setImportResponseData] = useState([]);
  const [OtherRoleDescription, setOtherRoleDescription] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  // State variables for Employee
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [role, setRole] = useState("");
  const [license, setLicense] = React.useState<string[]>([]);
  const [licenseNumberIds, setLicenseNumberIds] = React.useState<number[]>([]);
  const [licenseIds, setLicenseIds] = useState<number[]>([]);
  const [organizationLocationId, setOrganizationLocationId] = React.useState(0);
  const [locationLicenses, setLocationLicenses] = useState([]);

  const [successRecords, setSuccessRecords] = useState([]);
  const [failedRecords, setFailedRecords] = useState([]);
  const [ManualEmpBtn, setManualEmpBtn] = React.useState(false);

  const [badgeFields, setBadgeFields] = React.useState<any | null>([
    {
      badgesName: "",
      issueDate: "",
      expirationDate: "",
      issuedFrom: "",
      badgesNameError: false,
      issueDateError: false,
      expirationDateError: false,
      issuedFromError: false,
      issueDateIsBlank: false,
      expirationDateIsBlank: true,
    },
  ]);
  interface LoginTokenType {
    user: {
      organizationId?: number | null;
      role?: string;
    };
  }

  interface Badgetype {
    badgesName: string;
    issuedFrom: number;
  }

  const [lastNameError, setLastNameError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [employeeIdError, setEmployeeIdError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [companyEmaiError, setCompanyEmailError] = useState(false);
  const [badgeCommonError, setBadgeCommonError] = useState(false);
  const [badgeCommonErrorText, setBadgeCommonErrorText] =
    useState("Error Happened");
  const [lastNameErrorText, setLastNameErrorText] = useState(
    "Last name is required"
  );
  const [firstNameErrorText, setFirstNameErrorText] = useState(
    "First name is required"
  );
  const [employeeIdErrorText, setEmployeeIdErrorText] =
    useState("Error happened");
  const [roleErrorText, setRoleErrorText] = useState("Error Happened");
  const [companyEmaiErrorText, setCompanyEmailErrorText] =
    useState("Error happened");
  const [badgeErrorText, setBadgeErrorText] = useState("Error Happened");
  const [issueDateErrorText, setIssueDateErrorText] =
    useState("Error happened");
  const [expirationDateErrorText, setExpirationDateErrorText] =
    useState("Error happened");
  const [issuingAuthorityErrorText, setIssuingAuthorityErrorText] =
    useState("Error happened");
  const [licenseNumberErrorText, setLicenseNumberErrorText] =
    useState("Error happened");
  const [licenseUsageErrorText, setLicenseUsageErrorText] =
    useState("Error happened");
  const [issuedFromErrorText, setIssuedFromErrorText] =
    useState("Error happened");
  const [licenseIssueDateErrorText, setLicenseIssueDateErrorText] =
    useState("Error happened");
  const [licenseExpirationDateErrorText, setLicenseExpirationDateErrorText] =
    useState("Error happened");
  const [isEditLocation, setIsEditLocation] = useState(false);
  const userState = useSelector((state: LoginTokenType) => state.user);
  const token = localStorage.getItem("user");
  const userData = decodeToken(token);
  const [licenseFields, setLicenseFields] = React.useState<any | null>([
    {
      licenseId: 0,
      licenseTypeId: "",
      licenseUsageId: [],
      licenseLevelId: "",
      licenseNumber: "",
      issueDate: "",
      expirationDate: "",
      issuingAuthority: "",
      organizationId: userState["organizationId"],
      organizationLocationId: organizationLocationId,
      status: "active",
      createdBy: userData.UserId,
      licenseUsageError: false,
      licenseNumberError: false,
      issueDateError: false,
      expirationDateError: false,
      issuingAuthorityError: false,
      licenseTypeError: false,
      licenseLevelError: false,
      issueDateIsBlank: true,
      expirationDateIsBlank: true,
      showWarning: false,
    },
  ]);

  useEffect(() => {
    if (
      roleValidator(userState["role"]) === SystemAdministrator ||
      roleValidator(userState["role"]) === DirectorOfCompliance
    ) {
      return;
    } else {
      history.push("/");
      window.location.reload();
    }
  }, []);

  const handleInitialSetupClick = () => {
    props.actions.updateInitialSetup("complete");
    history.push("/");
  };

  interface LocationResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
  }

  const validateFields = () => {
    let validate = true;
    if (lastName.trim().length === 0) {
      setLastNameError(true);
      setLastNameErrorText("Last name is required");
      validate = false;
    }
    if (firstName.trim().length === 0) {
      setFirstNameError(true);
      setFirstNameErrorText("First name is required");
      validate = false;
    }
    if (employeeId.trim().length === 0) {
      setEmployeeIdError(true);
      setEmployeeIdErrorText("Employee id is required");
      validate = false;
    }
    if (role.length === 0) {
      setRoleError(true);
      setRoleErrorText("Role is required");
      validate = false;
    }
    if (companyEmail.trim().length === 0) {
      setCompanyEmailError(true);
      setCompanyEmailErrorText("Contact email is required");
      validate = false;
    } else if (
      !new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g).test(
        companyEmail.trim()
      )
    ) {
      setCompanyEmailError(true);
      setCompanyEmailErrorText("Please enter a valid email");
      validate = false;
    }

    if (badgeFields.length !== 0) {
      validate = Boolean(validateBadges(badgeFields));
    }
    return validate;
  };

  const validateBadges = (badges: any) => {
    let validateBadge = true;
    let i, item;
    for (i = 0; i < badges.length; i++) {
      for (item in badges[i]) {
        if (item === "badgesName" && badges[i][item].trim().length === 0) {
          badges[i]["badgesNameError"] = true;
          setBadgeErrorText("Badge Id is required");
          validateBadge = false;
        } else if (item === "issueDate") {
          validateBadge = Boolean(validateIssueDate(badges, i, item));
        } else if (item === "issueDateIsBlank" && badges[i][item] === true) {
          badges[i]["issueDateError"] = true;
          setIssueDateErrorText("Badge Issue date is required");
          validateBadge = false;
        } else if (item === "expirationDate") {
          validateBadge = Boolean(validateExpirationDate(badges, i, item));
        } else if (item === "issuedFrom" && badges[i][item].length === 0) {
          badges[i]["issuedFromError"] = true;
          setIssuedFromErrorText("Badge Issuing authority is required");
          validateBadge = false;
        }
      }
    }
    validateBadge =
      Boolean(validateBadgeNameAndIssuedFrom(badges)) && validateBadge;
    return validateBadge;
  };

  const validateBadgeNameAndIssuedFrom = (badges: Badgetype[]) => {
    let isValid;
    const inputBadges = [];
    const uniqueBadgesName = new Set();
    const stateIssuedFrom = badges.filter((badge: Badgetype) => {
      return badge.issuedFrom === 1;
    });

    badges.forEach((element: Badgetype) => {
      if (element.badgesName.trim() !== "") {
        inputBadges.push(element.badgesName.trim().toLowerCase());
        uniqueBadgesName.add(element.badgesName.trim().toLowerCase());
      }
    });

    if (stateIssuedFrom.length === 0) {
      setBadgeCommonError(true);
      setBadgeCommonErrorText("At least one state-issued badge is required");
      isValid = false;
    } else if (uniqueBadgesName.size !== inputBadges.length) {
      setBadgeCommonError(true);
      setBadgeCommonErrorText("Badges should not be duplicate.");
      isValid = false;
    } else {
      isValid = true;
    }
    return isValid;
  };

  const validateIssueDate = (badges: any, i: number, item: any) => {
    if (badges[i][item].length === 0) {
      badges[i]["issueDateError"] = true;
      setIssueDateErrorText("Badge Issue date is required");
      return false;
    } else if (!moment(badges[i][item], "MM/DD/YYYY", true).isValid()) {
      badges[i]["issueDateError"] = true;
      setIssueDateErrorText("Please enter date in MM/DD/YYYY.");
      return false;
    } else if (
      new Date(badges[i][item]).setHours(0, 0, 0, 0) >
      new Date().setHours(0, 0, 0, 0)
    ) {
      return false;
    } else {
      return true;
    }
  };

  const validateExpirationDate = (badges: any, i: number, item: any) => {
    if (badges[i][item].length === 0) {
      badges[i]["expirationDateError"] = true;
      setExpirationDateErrorText("Badge Expiration date is required");
      return false;
    } else if (!moment(badges[i][item], "MM/DD/YYYY", true).isValid()) {
      badges[i]["expirationDateError"] = true;
      setExpirationDateErrorText("Please enter date in MM/DD/YYYY.");
      return false;
    } else if (
      new Date(badges[i][item]).setHours(0, 0, 0, 0) <=
      new Date(badges[i]["issueDate"]).setHours(0, 0, 0, 0)
    ) {
      return false;
    } else {
      return true;
    }
  };
  const validateLicExpDate = (i: number, item: string, validate:boolean, newValues: licencseFieldTypes[]):boolean => {
    if (
      item === "expirationDateIsBlank" &&
      newValues[i][item] === true
    ) {
      newValues[i]["expirationDateError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseExpirationDateErrorText("Expiry date is required");
      validate = false;
    } else if (
      item === "expirationDate" &&
      newValues[i][item] !==
        moment(newValues[i][item]).format("MM/DD/YYYY")
    ) {
      newValues[i][item] = "";
    } else if (
      item === "expirationDate" &&
      !moment(newValues[i][item], "MM/DD/YYYY", true).isValid()
    ) {
      newValues[i]["expirationDateError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseExpirationDateErrorText("Please enter date in MM/DD/YYYY.");
      validate = false;
    } else if (
      item === "expirationDate" &&
      new Date(String(newValues[i][item])).setHours(0, 0, 0, 0) <=
        new Date(String(newValues[i]["issueDate"])).setHours(0, 0, 0, 0)
    ) {
      newValues[i]["expirationDateError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseExpirationDateErrorText(
        "Expiration Date cannot be equal or prior to Issue Date."
      );
      validate = false;
    } else {
        return validate;
    }
    return validate;
  };
  const validateLicIssueDate = (i: number, item: string, validate:boolean, newValues: licencseFieldTypes[]):boolean => {
    if (item === "issueDateIsBlank" && newValues[i][item] === true) {
      newValues[i]["issueDateError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseIssueDateErrorText("Issue date is required");
      validate = false;
    } else if (
      item === "issueDate" &&
      !moment(newValues[i][item], "MM/DD/YYYY", true).isValid()
    ) {
      newValues[i]["issueDateError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseIssueDateErrorText("Please enter date in MM/DD/YYYY.");
      validate = false;
    } else if (
      item === "issueDate" &&
      new Date(String(newValues[i][item])).setHours(0, 0, 0, 0) >
        new Date().setHours(0, 0, 0, 0)
    ) {
      newValues[i]["issueDateError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseIssueDateErrorText("Issue date cannot be a future date");
      validate = false;
    } else {
      return validate;
    }
    return validate;
  };
  const validateLicOtherFields = (i: number, item: string, validate:boolean, newValues: licencseFieldTypes[]):boolean => {
    if (item === "licenseTypeId" && newValues[i].licenseTypeId?.toString() === "") {
      newValues[i]["licenseTypeError"] = true;
      newValues[i]["showWarning"] = true;
      validate = false;
    }
    if (item === "licenseLevelId" && newValues[i].licenseLevelId?.toString() === "") {
      newValues[i]["licenseLevelError"] = true;
      newValues[i]["showWarning"] = true;
      validate = false;
    }
    if (
      item === "licenseNumber" &&
      newValues[i].licenseNumber?.trim().length === 0
    ) {
      newValues[i]["licenseNumberError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseNumberErrorText("License Number is required");
      validate = false;
    }
    if (
      item === "issuingAuthority" &&
      newValues[i].issuingAuthority?.trim().length === 0
    ) {
      newValues[i]["issuingAuthorityError"] = true;
      newValues[i]["showWarning"] = true;
      setIssuingAuthorityErrorText("Issuing Authority is required");
      validate = false;
    }
    if (item === "licenseUsageId" && newValues[i].licenseUsageId?.length === 0) {
      newValues[i]["licenseUsageError"] = true;
      newValues[i]["showWarning"] = true;
      setLicenseUsageErrorText("License designation is required");
      validate = false;
    }
    return validate;
  };
  const validateLicence = () => {
    let validate = true;
    const newValues = [...licenseFields];
    const otherFieldss = ["licenseTypeId","licenseLevelId","licenseNumber","issuingAuthority","licenseUsageId"];
    const issueDateFields = ["issueDateIsBlank","issueDate"];
    let i, item;
    for (i = 0; i < newValues.length; i++) {
      for (item in newValues[i]) {
        if(otherFieldss.includes(item)){
          validate = validateLicOtherFields(i,item, validate, newValues);
        } else if (issueDateFields.includes(item)) {
          validate = validateLicIssueDate(i, item, validate ,newValues);
        } else {
          validate = validateLicExpDate(i, item, validate, newValues);
        }
      }
    }
    setLicenseFields(newValues);
    return validate;
  };
  const resetLicenseInputs = () => {
    setLicenseFields([
      {
        licenseId: 0,
        licenseTypeId: "",
        licenseUsageId: [],
        licenseLevelId: "",
        licenseNumber: "",
        issueDate: "",
        expirationDate: "",
        issuingAuthority: "",
        organizationId: userState["organizationId"],
        organizationLocationId: organizationLocationId,
        status: "active",
        createdBy: userData.UserId,
        licenseUsageError: false,
        licenseNumberError: false,
        issueDateError: false,
        expirationDateError: false,
        issuingAuthorityError: false,
        licenseTypeError: false,
        licenseLevelError: false,
        issueDateIsBlank: true,
        expirationDateIsBlank: true,
      },
    ]);
  };

  const onLicenseSubmit = () => {
    if (validateLicence()) {
      const licenseData: any | null = [];
      licenseFields.forEach(function (element: any) {
        licenseData.push({
          expirationDate: element.expirationDate,
          issueDate: element.issueDate,
          issuingAuthority: element.issuingAuthority.trim(),
          licenseLevelId: element.licenseLevelId,
          licenseNumber: element.licenseNumber.trim(),
          licenseTypeId: element.licenseTypeId,
          licenseUsageId: element.licenseUsageId,
        });
      });
      const params = {
        licenses: licenseData,
        organizationLocationId: organizationLocationId,
      };

      setShowLoader(true);
      axios
        .post<AddEmployeeResponse>(ADD_INITIAL_LICENSE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          Swal.close();
          if (res.status === 201 && !res.data.isSuccess) {
            Swal.fire({
              text:
                res.data.responseMessage || "Please enter valid License data",
              confirmButtonText: "OK",
              icon: "error",
            });
          } else if (
            res.status === 201 &&
            res.data.isSuccess &&
            res.data.result != null
          ) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setActiveWizard("employee");
            setLicenseIds(res.data.result);
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
        });
    }
  };

  const onLicenseUpdate = () => {
    if (validateLicence()) {
      const licenseData: any | null = [];
      licenseFields.forEach(function (element: any) {
        licenseData.push({
          licenseId: element.licenseId,
          licenseTypeId: element.licenseTypeId,
          licenseNumber: element.licenseNumber.trim(),
          licenseUsageId: element.licenseUsageId,
          licenseLevelId: element.licenseLevelId,
          issueDate: element.issueDate,
          expirationDate: element.expirationDate,
          issuingAuthority: element.issuingAuthority.trim(),
        });
      });
      const params = {
        licenses: licenseData,
        organizationLocationId: organizationLocationId,
      };

      setShowLoader(true);
      axios
        .put<AddEmployeeResponse>(UPDATE_LICENSE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          Swal.close();
          if (res.status === 200 && !res.data.isSuccess) {
            Swal.fire({
              text:
                res.data.responseMessage || "Please enter valid License data",
              confirmButtonText: "OK",
              icon: "error",
            });
          } else if (
            res.status === 200 &&
            res.data.isSuccess &&
            res.data.result != null
          ) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setActiveWizard("employee");
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
        });
    }
  };

  const onSubmit = () => {
    if (validateFields()) {
      const badgesAdded: any | null = [];
      badgeFields.forEach(function (element: any) {
        badgesAdded.push({
          badgesName: element.badgesName,
          issueDate: moment(element.issueDate).format("MM/DD/YYYY"),
          expirationDate: element.expirationDate,
          issuedFrom: element.issuedFrom,
        });
      });
      const orglocationIds: any | null = [];
      orglocationIds.push(organizationLocationId);

      const locationLicensesIds = {
        licenseId: licenseNumberIds,
        locationId: orglocationIds
      };

      const params = {
        users:  {
            organizationId: userData.OrgId,
            lastName: lastName.trim(),
            middleName: middleInitial.trim(),
            OtherRoleDescription: OtherRoleDescription.trim(),
            firstName: firstName.trim(),
            organizationEmployeeId: employeeId,
            email: companyEmail.toLowerCase().trim(),
            userRole: role,
            badges: badgesAdded,
            locationLicenses: locationLicensesIds,
      }
    };
      if (token !== null) {
        setShowLoader(true);
        axios
          .post<AddEmployeeResponse>(ADD_EMPLOYEE, params, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            setShowLoader(false);
            const statusCode: number = res.status;
            const isSuccess: boolean = res.data.isSuccess;
            const result: string = res.data.result;
            const responseMessage: string = res.data.responseMessage;
            const badgeIdExist: string =
              "isBadgeIdExist" in res.data.result
                ? res.data.result.isBadgeIdExist
                : "";
            submitResponse(
              statusCode,
              isSuccess,
              result,
              responseMessage,
              badgeIdExist
            );
          })
          .catch(() => {
            Swal.close();
            setShowLoader(false);
          });
      }
    } else {
      setActiveWizard("");
    }
  };

  const submitResponse = (
    statusCode: number,
    isSuccess: boolean,
    result: string,
    responseMessage: string,
    badgeIdExist: string
  ) => {
    if (statusCode === 201 && !isSuccess && result == null) {
      Swal.fire({
        text: responseMessage || "Please enter a valid email",
        confirmButtonText: "OK",
        icon: "error",
      });
    } else if (statusCode === 201 && isSuccess && result != null) {
      setCleanInputs(true);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setActiveWizard("addLocationDialogBox");
    } else if (
      statusCode === 201 &&
      !isSuccess &&
      responseMessage === "Duplicate Employee Id."
    ) {
      setEmployeeIdError(true);
      setEmployeeIdErrorText("Duplicate Employee Id.");
    } else if (statusCode === 201 && !isSuccess && badgeIdExist !== "") {
      setBadgeCommonError(true);
      setBadgeCommonErrorText(responseMessage);
    } else {
      Swal.fire({
        text: "Something went wrong!",
        confirmButtonText: "OK",
        icon: "error",
      });
    }
  };

  const onExcelSubmit = (fileDataSent: any) => {
    const excelData = new FormData();
    excelData.append("employeeList", fileDataSent);

    if (token !== null) {
      setShowLoader(true);
      axios
        .post<AddExcelFileResponse>(MOVE_EXCELDATA_TO_DB, excelData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          Swal.close();
          if (
            res.status === 201 &&
            res.data.isSuccess &&
            res.data.result != null
          ) {
            setActiveStep(3);
            setActiveWizard("addLocationDialogBox");
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
        })
        .catch(() => {
          Swal.close();
          setShowLoader(false);
        });
    }
  };

  const [, setClientName] = React.useState("");

  const [cleanInputs, setCleanInputs] = React.useState(false);
  const [HandleBtnDisable, setHandleBtnDisable] = React.useState(false);

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveWizard("license");
      setIsEditLocation(false);
    } else if (activeStep === 1) {
      if (licenseIds.length > 0) {
        onLicenseUpdate();
      } else {
        onLicenseSubmit();
      }
    } else if (activeStep === 2) {
      if (
        isImported &&
        selectedExcelFile !== null &&
        fileImportError === false
      ) {
        onExcelSubmit(selectedExcelFile);
      } else {
        onSubmit();
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setCancelShow(false);
      setValue(true);
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveWizard("location");
      setIsEditLocation(true);
    }
    if (activeStep === 2 && manual === true) {
      setManual(false);
      if (isImported === true) {
        setValue(false);
        setCancelShow(true);
      } else {
        setCancelShow(false);
        setValue(true);
      }
    } else if (activeStep === 2 && manual === false) {
      setImportResponseData([]);
      setSelectedExcelFile(null);
      setSuccessRecords([]);
      setFailedRecords([]);
      setCleanInputs(true);
      setHandleBtnDisable(false);
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
      setIsImported(false);
      setActiveWizard("license");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleYes = () => {
    setOpen(false);
    deleteLocation();
    history.push("/");
  };

  const handleNo = () => {
    setOpen(false);
    setActiveWizard("location");
  };

  const handleClick = () => {
    setOpen(false);
    deleteLocation();
    setActiveStep(4);
  };

  const handleClickNo = () => {
    setOpen(false);
    setActiveWizard("location");
  };

  const employeeClickYes = () => {
    setOpen(false);
    setActiveStep(3);
  };

  const employeeClickNo = () => {
    setOpen(false);
    setActiveWizard("employee");
  };

  const licenseClickYes = () => {
    setLicenseOpen(false);
    resetLicenseInputs();
    setActiveStep(2);
  };

  const licenseClickNo = () => {
    setLicenseOpen(false);
    setActiveWizard("license");
  };

  const handleCancel = () => {
    setOpen(true);
  };

  const EmpResModalCancel = () => {
    setManualEmpBtn(false);
    setImportDialogOpen(false);
    setActiveStep(2);
    setActiveWizard("employee");
  };

  const handleLicenseCancel = () => {
    setLicenseOpen(true);
  };

  const handleSkip = () => {
    if (activeStep === 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setActiveWizard("employee");
    } else if (activeStep === 2) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setActiveStep(3);
    }
  };

  const deleteLocation = () => {
    axios
      .delete<LocationResponse>(DELETE_LOCATION, {
        data: { locationId: organizationLocationId },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json-patch+json",
          "Content-Type": "application/json-patch+json",
        },
      })
      .then((res) => {
        Swal.close();
        if (
          res.status === 200 &&
          !res.data.isSuccess &&
          res.data.result == null
        ) {
          props.setActiveWizard("");
          Swal.fire({
            text: res.data.responseMessage || "Delete operation failed",
            confirmButtonText: "OK",
            icon: "error",
          });
        } else if (
          res.status === 200 &&
          res.data.isSuccess &&
          res.data.result != null
        ) {
          updateSignupStatus();
          // Need this code
          // if(activeStep > steps.length)
          // {
          //   setActiveStep(4);
          // } else {
          //   history.push('/');
          // }
        } else {
          props.setActiveWizard("");
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      })
      .catch(() => Swal.close());
  };

  const renderHeading = () => {
    switch (activeStep) {
      case 0:
        return "Location Details";
      case 1:
        return "License Details";
      case 2:
        return "Add Employee(s)";
      case 3:
        return "Add Locations";
      case 4:
        return "Finished!";
      default:
        return "Location Details";
    }
  };

  const renderTitle = () => {
    switch (activeStep) {
      case 0:
        return "Enter Location name and address to start";
      case 1:
        return "Enter License details associated with the location";
      case 2:
        return "Import employee data or enter manually";
      case 3:
        return "Select yes to add more loactions, Select no to continue";
      case 4:
        return "You can proceed to your dashboard";
      default:
        return "Enter Location name and address to start";
    }
  };

  const updateSignupStatus = () => {
    const params = {
      userEmail: userData["Email"],
      statusFlag: 0,
    };
    axios
      .put<UpdateSignupStatusResponse>(UPDATE_SIGNUP_STATUS, params, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          return res.data.isSuccess;
        }
      });
  };
  const CancelBtnShow = (): JSX.Element => {
    if (cancelShow === true || isImported === true) {
      return (
        <div className="CancelBtn" onClick={handleCancel}>
          Cancel
        </div>
      );
    }
    return <></>;
  };

  return (
    <div className="SetupContainer initial-setup-wrapper">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showLoader}
      >
        <CircularProgress />
      </Backdrop>
      <div className="row m-0">
        <div className="col-sm-4 col-12 p-0">
          <Left isLogo={true} heading={renderHeading()} title={renderTitle()} />
        </div>
        <div className="col-sm-8 col-12 p-0">
          <div className="container initial-container RightContainer">
            <div className="d-flex">
              <div className="page-title TitleWithMargin">
                {userData["ClientName"]}
              </div>
              {activeStep === 2 && (
                <span
                  className="DownloadButton"
                  onClick={() => {
                    getDownloadTemplate(token);
                  }}
                >
                  <FileDownloadOutlinedIcon
                    sx={{ "&:hover": { color: "blue" } }}
                  />
                  Download Template
                </span>
              )}
            </div>
            {activeStep === steps.length && (
              <React.Fragment>
                <AddLocationDialogBox
                  activeStep={activeStep}
                  setActiveWizard={setActiveWizard}
                  setActiveStep={setActiveStep}
                  wizardStepCounter={wizardStepCounter}
                  setWizardStepCounter={setWizardStepCounter}
                  cleanInputs={cleanInputs}
                  setCleanInputs={setCleanInputs}
                  organizationLocationId={organizationLocationId}
                  setOrganizationLocationId={setOrganizationLocationId}
                  resetLicenseInputs={resetLicenseInputs}
                  setLicenseIds={setLicenseIds}
                />
              </React.Fragment>
            )}{" "}
            {activeStep > steps.length && (
              <>
                <div className="container Pt26">
                  <div className="d-flex justify-content-center flex-column mt-5 InitialSetupWrapper">
                    <div className="complete-setup">
                      <div className="dashboard-initital-title">
                        Initial Setup is complete!
                      </div>
                      <p>
                        Employees can now login with their company email and use
                        RegTech to help manage their compliance needs
                      </p>
                    </div>
                    <Button
                      className="mb-3 mt-3 ButtonVariant5"
                      type="contained"
                      intent="primary"
                      text="Go to dashboard"
                      onClick={handleInitialSetupClick}
                    />
                  </div>
                </div>
              </>
            )}{" "}
            {activeStep < steps.length && (
              <React.Fragment>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  connector={<QontoConnector />}
                >
                  {steps.map((label, index) => {
                    return (
                      <Step key={label} completed={false}>
                        <StepLabel
                          className="StepLabelContainer"
                          StepIconComponent={ColorlibStepIcon}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>

                {activeStep === 0 && (
                  <Location
                    activeWizard={activeWizard}
                    setActiveWizard={setActiveWizard}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setClientName={setClientName}
                    organizationLocationId={organizationLocationId}
                    setOrganizationLocationId={setOrganizationLocationId}
                    setWizardStepCounter={setWizardStepCounter}
                    wizardStepCounter={wizardStepCounter}
                    cleanInputs={cleanInputs}
                    setCleanInputs={setCleanInputs}
                    isEditLocation={isEditLocation}
                  />
                )}
                {activeStep === 1 && (
                  <License
                    activeWizard={activeWizard}
                    setActiveWizard={setActiveWizard}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setValue={setValue}
                    value={value}
                    licenseFields={licenseFields}
                    setLicenseFields={setLicenseFields}
                    organizationLocationId={organizationLocationId}
                    licenseNumberErrorText={licenseNumberErrorText}
                    setLicenseNumberErrorText={setLicenseNumberErrorText}
                    licenseUsageErrorText={licenseUsageErrorText}
                    setLicenseUsageErrorText={setLicenseUsageErrorText}
                    issuingAuthorityErrorText={issuingAuthorityErrorText}
                    setIssuingAuthorityErrorText={setIssuingAuthorityErrorText}
                    issueDateErrorText={licenseIssueDateErrorText}
                    setIssueDateErrorText={setLicenseIssueDateErrorText}
                    expirationDateErrorText={licenseExpirationDateErrorText}
                    setExpirationDateErrorText={
                      setLicenseExpirationDateErrorText
                    }
                    cleanInputs={cleanInputs}
                    setCleanInputs={setCleanInputs}
                    licenseIds={licenseIds}
                    resetLicenseInputs={resetLicenseInputs}
                  />
                )}
                {activeStep === 2 && (
                  <>
                    <Employee
                      activeWizard={activeWizard}
                      activeStep={activeStep}
                      setActiveStep={setActiveStep}
                      setActiveWizard={setActiveWizard}
                      organizationLocationId={organizationLocationId}
                      manual={manual}
                      setManual={setManual}
                      setValue={setValue}
                      value={value}
                      lastName={lastName}
                      firstName={firstName}
                      middleInitial={middleInitial}
                      employeeId={employeeId}
                      companyEmail={companyEmail}
                      role={role}
                      license={license}
                      setLastName={setLastName}
                      setFirstName={setFirstName}
                      setMiddleInitial={setMiddleInitial}
                      setEmployeeId={setEmployeeId}
                      setCompanyEmail={setCompanyEmail}
                      setRole={setRole}
                      setLicense={setLicense}
                      lastNameError={lastNameError}
                      setLastNameError={setLastNameError}
                      firstNameError={firstNameError}
                      setFirstNameError={setFirstNameError}
                      employeeIdError={employeeIdError}
                      setEmployeeIdError={setEmployeeIdError}
                      roleError={roleError}
                      setRoleError={setRoleError}
                      companyEmaiError={companyEmaiError}
                      setCompanyEmailError={setCompanyEmailError}
                      lastNameErrorText={lastNameErrorText}
                      setLastNameErrorText={setLastNameErrorText}
                      firstNameErrorText={firstNameErrorText}
                      setFirstNameErrorText={setFirstNameErrorText}
                      employeeIdErrorText={employeeIdErrorText}
                      setEmployeeIdErrorText={setEmployeeIdErrorText}
                      roleErrorText={roleErrorText}
                      setRoleErrorText={setRoleErrorText}
                      companyEmaiErrorText={companyEmaiErrorText}
                      setCompanyEmailErrorText={setCompanyEmailErrorText}
                      badgeErrorText={badgeErrorText}
                      setBadgeErrorText={setBadgeErrorText}
                      issueDateErrorText={issueDateErrorText}
                      setIssueDateErrorText={setIssueDateErrorText}
                      expirationDateErrorText={expirationDateErrorText}
                      setExpirationDateErrorText={setExpirationDateErrorText}
                      badgeFields={badgeFields}
                      setBadgeFields={setBadgeFields}
                      setCancelShow={setCancelShow}
                      cancelShow={cancelShow}
                      isImported={isImported}
                      setIsImported={setIsImported}
                      cleanInputs={cleanInputs}
                      setCleanInputs={setCleanInputs}
                      licenseNumberIds={licenseNumberIds}
                      setLicenseNumberIds={setLicenseNumberIds}
                      locationLicenses={locationLicenses}
                      setLocationLicenses={setLocationLicenses}
                      selectedExcelFile={selectedExcelFile}
                      setSelectedExcelFile={setSelectedExcelFile}
                      fileImportError={fileImportError}
                      setFileImportError={setFileImportError}
                      open={importDialogOpen}
                      setOpen={setImportDialogOpen}
                      importResponseData={importResponseData}
                      setImportResponseData={setImportResponseData}
                      HandleBtnDisable={HandleBtnDisable}
                      setHandleBtnDisable={setHandleBtnDisable}
                      setOtherRoleDescription={setOtherRoleDescription}
                      OtherRoleDescription={OtherRoleDescription}
                      successRecords={successRecords}
                      setSuccessRecords={setSuccessRecords}
                      failedRecords={failedRecords}
                      setFailedRecords={setFailedRecords}
                      ManualEmpBtn={ManualEmpBtn}
                      setManualEmpBtn={setManualEmpBtn}
                      issuedFromErrorText={issuedFromErrorText}
                      setIssuedFromErrorText={setIssuedFromErrorText}
                      badgeCommonError={badgeCommonError}
                      setBadgeCommonError={setBadgeCommonError}
                      badgeCommonErrorText={badgeCommonErrorText}
                    />

                    <ImportEmployeeRespModal
                      open={importDialogOpen}
                      setOpen={setImportDialogOpen}
                      importResponseData={importResponseData}
                      setImportResponseData={setImportResponseData}
                      setCleanInputs={setCleanInputs}
                      setHandleBtnDisable={setHandleBtnDisable}
                      successRecords={successRecords}
                      setSuccessRecords={setSuccessRecords}
                      failedRecords={failedRecords}
                      setFailedRecords={setFailedRecords}
                      EmpResModalCancel={EmpResModalCancel}
                      ManualEmpBtn={ManualEmpBtn}
                      setManualEmpBtn={setManualEmpBtn}
                    />
                  </>
                )}
                <div className="d-flex justify-content-between ButtonVariant5per">
                  <div className="d-flex">
                    {activeStep !== 0 && (
                      <Button
                        type="outlined"
                        intent="primary"
                        className="mb-3 next-btn mr-1 back-btn"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        text="Back"
                      />
                    )}
                    {licenseFields.length === 1 && activeStep === 1 && !value && (
                      <div className="CancelBtn" onClick={handleLicenseCancel}>
                        Cancel
                      </div>
                    )}
                    {activeStep === 0 && (
                      <div className="CancelBtn" onClick={handleCancel}>
                        Cancel
                      </div>
                    )}
                    {activeStep === 2 && <CancelBtnShow />}
                    {activeStep === 1 && null}
                  </div>
                  <div className="d-flex">
                    {activeStep !== 0 && value && licenseFields.length === 1 && (
                      <div className="CancelBtn" onClick={handleSkip}>
                        Skip
                      </div>
                    )}
                    <Button
                      className="mb-3 next-btn"
                      type="contained"
                      intent="primary"
                      disabled={HandleBtnDisable}
                      onClick={handleNext}
                      onKeyDown={(e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                          return handleNext();
                        }
                      }}
                      text="Save & Continue"
                    />
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
      <CancelPopUpComponent
        wizardStepCounter={wizardStepCounter}
        activeStep={activeStep}
        open={open}
        setOpen={setOpen}
        employeeClickYes={employeeClickYes}
        employeeClickNo={employeeClickNo}
        handleClick={handleClick}
        handleClickNo={handleClickNo}
        handleYes={handleYes}
        handleNo={handleNo}
      />

      {activeStep === 1 && (
        <DialogWithTwoBtn
          dialogOpen={licenseOpen}
          dialogSetOpen={setLicenseOpen}
          message="Are you sure you want to cancel the license data entry?"
          yesBtnClick={licenseClickYes}
          noBtnClick={licenseClickNo}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

function mapDispatchToProps(dispatch: any) {
  return {
    actions: bindActionCreators(UserDetailsActions as any, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InitialSetup);
