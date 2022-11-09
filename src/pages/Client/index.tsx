import React, { useEffect, Dispatch, useState } from "react";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { TextField, Button, MenuItem, Backdrop } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import axios from "axios";
import { useHistory } from "react-router-dom";

import Swal from "sweetalert2";

import { useStyles } from "../../components/InputStyles";
import {
  ADD_CLIENT,
  GET_IS_EMAIL_EXIST,
  GET_ZIP_CODE,
} from "../../networking/httpEndPoints";

import { decodeToken } from "../../utilities/decodeToken";

import moment from "moment";

import handleDateFieldChange from "../../components/Employee/handleDateFieldChange";
import DateSelector from "../../components/DateSelector";
import ClientAddressComponent from "./ClientAddressComponent";
import ContactNameComponent from "./ContactNameComponent";
import IdComponent from "./IdComponent";
import BadgeIssuedFrom from "../../components/BadgeCard/BadgeIssuedFrom";

interface ZCodeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [
    { state: string; city: string; country: string; zipCodeCityMapId: number }
  ];
}

interface AddClientResponse {
  status: number;
  message: string;
  data: {
    isSuccess: boolean;
    responseMessage: string;
    result: [{ accountNumber: number; organizationId: number }];
  };
}

export default function AddClient() {
  const history = useHistory();
  const classes = useStyles();
  const [clientName, setClientName] = useState("");
  const [contactFName, changeContactFName] = useState("");
  const [contactLName, changeContactLName] = useState("");
  const [contactMI, changeContactMI] = useState("");
  const userRole = "System Administrator";
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [clientBAddress, changeClientBAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [zipCodeCityMapId, setzipCodeCityMapId] = useState(0);
  const [memberSince, setMemberSince] = useState(new Date());
  const [accountType, setAccountType] = useState(2);
  const [employeeId, setEmployeeId] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [badgeFields, setBadgeFields] = React.useState<any | null>({
    issueDate: "",
    expirationDate: "",
    issuedFrom: "",
    issueDateIsBlank: true,
    expirationDateIsBlank: true,
  });
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);

  const [clientNameError, setClientNameError] = useState(false);
  const [contactFNameError, changeContactFNameError] = useState(false);
  const [contactLNameError, changeContactLNameError] = useState(false);
  const [contactEmailError, setContactEmailError] = useState(false);
  const [contactPhoneError, setContactPhoneError] = useState(false);
  const [zipCodeError, setZipCodeError] = useState(false);
  const [clientBAddressError, changeClientBAddressError] = useState(false);
  const [memberSinceError, setMemberSinceError] = useState(false);
  const [employeeIdError, setEmployeeIdError] = useState(false);
  const [badgeIdError, setBadgeIdError] = useState(false);
  const [issueDateError, setIssueDateError] = useState(false);
  const [expirationDateError, setExpirationDateError] = useState(false);
  const [issuedFromError, setIssuedFromError] = useState(false);

  const [clientNameErrorText, setClientNameErrorText] = useState(
    "Client name is required"
  );
  const [contactEmailErrorText, setContactEmailErrorText] = useState(
    "Contact email is required"
  );
  const [contactPhoneErrorText, setContactPhoneErrorText] = useState(
    "Contact phone is required"
  );
  const [memberSinceErrorText, setMemberSinceErrorText] = useState(
    "Member since date is required"
  );
  const [zipCodeErrorText, setZipCodeErrorText] = useState(
    "Zip code is required"
  );
  const [issueDateErrorText, setIssueDateErrorText] = useState(
    "Issue date is required"
  );
  const [expirationDateErrorText, setExpirationDateErrorText] = useState(
    "Expiration date is required"
  );

  const [issuedFromErrorText, setIssuedFromErrorText] = useState(
    "Badge Issuing authority is required"
  );

  const [employeeIdErrorText, setEmployeeIdErrorText] = useState(
    "Employee Id is required"
  );
  const [badgeIdErrorText, setBadgeIdErrorText] = useState(
    "Badge Id is required"
  );
  const [expirationDateMinValue, setExpirationDateMinValue] = useState<
    any | null
  >(null);

  const [dateFieldIsBlank, setDateFieldIsBlank] = useState(false);

  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    const listener = (event: any) => {
      if (event.key === "Enter") {
        return onSubmit();
      }
    };
    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  const reUseComponent = (
    titleName: string,
    placeHolder: string,
    isErrorExist: boolean,
    errorText: string,
    changeEventName: Dispatch<React.SetStateAction<string>>,
    maxLength: number,
    value: string,
    changeErrorText: Dispatch<React.SetStateAction<string>>
  ) => {
    return (
      <>
        <p className="ClientSubTitle">{titleName}</p>
        <TextField
          className={`TextFieldWrapper ${classes.root}`}
          error={isErrorExist}
          helperText={isErrorExist ? errorText : ""}
          hiddenLabel
          placeholder={placeHolder}
          type="text"
          onChange={(e) => {
            changeErrorText("");
            changeEventName(e.target.value);
          }}
          value={value}
          InputProps={{ style: { fontSize: 16, color: "black" } }}
          inputProps={{ maxLength: maxLength }}
        />
      </>
    );
  };

  const onZipCodeChange = (zCode: string) => {
    setZipCodeError(false);
    setZipCode(zCode);
    const token = localStorage.getItem("user");
    if (zCode.length === 5) {
      axios
        .get<ZCodeResponse>(`${GET_ZIP_CODE}${zCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.result.length > 0) {
            const data = res.data.result[0];
            setClientCity(data.city);
            setClientState(data.state);
            setzipCodeCityMapId(data.zipCodeCityMapId);
          } else {
            setZipCodeError(true);
            setZipCodeErrorText(res.data.responseMessage);
          }
        });
    } else {
      setClientCity("");
      setClientState("");
      setzipCodeCityMapId(0);
    }
  };

  const handleSelectIssuedFrom = (e: any) => {
    const newFormValues = Object.assign({}, badgeFields);
    newFormValues["issuedFrom"] = e.target.value;
    setBadgeFields(newFormValues);
    setIssuedFromError(false);
  };
  const isValidatePhoneFields = () => {
    let validatePhoneFields = true;
    if (!new RegExp(/\d{10}/g).test(contactPhone.trim())) {
      setContactPhoneError(true);
      setContactPhoneErrorText("Only numbers are allowed");
      validatePhoneFields = false;
  }
    if (contactPhone.trim().length === 0) {
        setContactPhoneError(true);
        setContactPhoneErrorText("Contact phone is required");
        validatePhoneFields = false;
    }
    if (contactPhone.trim().length > 0 && contactPhone.trim().length < 10) {
        setContactPhoneError(true);
        setContactPhoneErrorText("Contact phone must be of exact 10 digits");
        validatePhoneFields = false;
      }

    return validatePhoneFields;
};
  
  const isValidateBadgeFields = () => {
    let validateBadgeFields = true;
    if (employeeId.trim().length === 0) {
      setEmployeeIdError(true);
      setEmployeeIdErrorText("Employee id is required");
      validateBadgeFields = false;
    }
    if (badgeId.trim().length === 0) {
      setBadgeIdError(true);
      setBadgeIdErrorText("Badge id is required");
      validateBadgeFields = false;
    }

    if (badgeFields.issueDateIsBlank === true) {
      setIssueDateError(true);
      setIssueDateErrorText("Issue date is required");
      validateBadgeFields = false;
    } else if (
      new Date(badgeFields.issueDate).setHours(0, 0, 0, 0) >
      new Date().setHours(0, 0, 0, 0)
    ) {
      setIssueDateError(true);
      setIssueDateErrorText("Issue date cannot be a future date");
      validateBadgeFields = false;
    } else if (
      moment(badgeFields.issueDate, "MM/DD/YYYY", true).isValid() === false
    ) {
      setIssueDateError(true);
      setIssueDateErrorText("Please enter date in MM/DD/YYYY");
      validateBadgeFields = false;
    }

    if (badgeFields.expirationDateIsBlank === true) {
      setExpirationDateError(true);
      setExpirationDateErrorText("Expiration date is required");
      validateBadgeFields = false;
    } else if (
      new Date(badgeFields.expirationDate).setHours(0, 0, 0, 0) <=
      new Date(badgeFields.issueDate).setHours(0, 0, 0, 0)
    ) {
      setExpirationDateError(true);
      setExpirationDateErrorText(
        "Expiration Date cannot be equal or prior to Issue date"
      );
      validateBadgeFields = false;
    } else if (
      moment(badgeFields.expirationDate, "MM/DD/YYYY", true).isValid() === false
    ) {
      setExpirationDateError(true);
      setExpirationDateErrorText("Please enter date in MM/DD/YYYY");
      validateBadgeFields = false;
    }

    if (badgeFields.issuedFrom === "") {
      setIssuedFromError(true);
      setIssuedFromErrorText("Badge Issuing authority is required");
      validateBadgeFields = false;
    }   

    return validateBadgeFields;
  };

  const isValidate = () => {
    let validate = true;

    if (clientName.trim().length === 0) {
      setClientNameError(true);
      setClientNameErrorText("Client name is required");
      validate = false;
    }
    if (contactFName.trim().length === 0) {
      changeContactFNameError(true);
      validate = false;
    }
    if (contactLName.trim().length === 0) {
      changeContactLNameError(true);
      validate = false;
    }
    if (
      !new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(
        contactEmail.trim()
      )
    ) {
      setContactEmailError(true);
      setContactEmailErrorText("Please enter a valid email");
      validate = false;
    }
    if (contactEmail.trim().length === 0) {
      setContactEmailError(true);
      setContactEmailErrorText("Contact email is required");
      validate = false;
    }
    if (clientBAddress.trim().length < 1) {
      changeClientBAddressError(true);
      validate = false;
    }
    if (zipCode.trim().length < 1) {
      setZipCodeError(true);
      setZipCodeErrorText("Zip code is required");
      validate = false;
    } else if (zipCode.trim().length < 5) {
      setZipCodeError(true);
      setZipCodeErrorText("Zip code length should be 5");
      validate = false;
    } else if (zipCodeError) {
      validate = false;
    }
    if (dateFieldIsBlank) {
      setMemberSinceError(true);
      setMemberSinceErrorText("Member since date is required");
      validate = false;
    } else if (!moment(memberSince, "MM/DD/YYYY", true).isValid()) {
      setMemberSinceError(true);
      setMemberSinceErrorText("Please enter date in MM/DD/YYYY");
      validate = false;
    } else if (
      new Date(memberSince).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0)
    ) {
      setMemberSinceError(true);
      setMemberSinceErrorText("Member Since cannot be old date");
      validate = false;
    }    
    if(!isValidatePhoneFields())
    {
      validate = false;
    }
      validate = isValidateBadgeFields();

    return validate;
  };

  const addClient = () => {
    const token = localStorage.getItem("user");
    const userData = decodeToken(token);
    const params = {
      firstName: contactFName.trim(),
      clientName: clientName.trim(),
      lastName: contactLName.trim(),
      middleName: contactMI,
      userRole: userRole,
      email: contactEmail,
      contactPhone: contactPhone.trim(),
      address: clientBAddress.trim(),
      memberSince: moment(memberSince).format("MM/DD/YYYY"),
      accountType: accountType,
      createdBy: userData.UserId,
      zipCode: zipCode,
      zipCodeCityMapId: zipCodeCityMapId,
      employeeId: employeeId,
      badgeId: badgeId,
      badgeIssueDate: moment(badgeFields["issueDate"]).format("MM/DD/YYYY"),
      badgeExpirationDate: moment(badgeFields["expirationDate"]).format(
        "MM/DD/YYYY"
      ),
      issuedFrom: badgeFields["issuedFrom"],
    };

    const BadgeIdExist = "This badge Id is already present in the system.";

    if (token !== null) {
      setShowLoader(true);
      axios
        .post<AddClientResponse>(ADD_CLIENT, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.status === 417 && res.data.message === BadgeIdExist) {
            setBadgeIdError(true);
            setBadgeIdErrorText(res.data.message);
          } else if (res.data.status === 201) {
            setConfirmationModalIsVisible(true);
          } else if (res.data.status === 417) {
            setClientNameError(true);
            setClientNameErrorText(res.data.message);
          }

          setShowLoader(false);
        })
        .catch(() => {
          Swal.close();
          setShowLoader(false);
        });
    }
  };
  const onSubmit = () => {
    if (isValidate()) {
      const token = localStorage.getItem("user");
      setShowLoader(true);

      axios
        .get<ZCodeResponse>(`${GET_IS_EMAIL_EXIST}?email=${encodeURIComponent(contactEmail.trim())}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.data.isSuccess) {
            setContactEmailErrorText(res.data.responseMessage);
            setContactEmailError(true);
            return false;
          } else {
            addClient();
          }
        });
    }
  };

  const checkMinDate = (newValue: any) => {
    if (newValue !== "") {
      const previous = new Date(newValue.getTime());
      previous.setDate(newValue.getDate() + 1);
      setExpirationDateMinValue(previous);
    }
  };

  return (
    <div className="container client-dashboard-container form-container p-4">
      <div className="d-flex justify-content-between">
        <p className="Title page-title">Add New Client</p>
        <p className="ButtonCancelClient" onClick={() => history.push("/")}>
          Cancel
        </p>
      </div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showLoader}
      >
        <CircularProgress />
      </Backdrop>
      <div className="row">
        {reUseComponent(
          "Client Name",
          "Enter Client Name",
          clientNameError,
          clientNameErrorText,
          setClientName,
          150,
          clientName,
          setClientNameErrorText
        )}

        <ContactNameComponent
          contactLNameError={contactLNameError}
          contactFNameError={contactFNameError}
          contactLName={contactLName}
          contactFName={contactFName}
          contactMI={contactMI}
          changeContactLNameError={changeContactLNameError}
          changeContactLName={changeContactLName}
          changeContactFNameError={changeContactFNameError}
          changeContactFName={changeContactFName}
          changeContactMI={changeContactMI}
          userRole={userRole}
        />

        <IdComponent
          employeeIdError={employeeIdError}
          employeeIdErrorText={employeeIdErrorText}
          setEmployeeIdError={setEmployeeIdError}
          setEmployeeId={setEmployeeId}
          employeeId={employeeId}
          badgeIdError={badgeIdError}
          badgeIdErrorText={badgeIdErrorText}
          setBadgeIdError={setBadgeIdError}
          setBadgeId={setBadgeId}
          badgeId={badgeId}
        />
        <div className="d-flex">
          <div>
            <div className="ClientSubTitle">Badge Issue Date</div>
            <DateSelector
              value={badgeFields.issueDate}
              onChangeDateSelector={(newValue: any) => {
                if (newValue !== null) {
                  badgeFields["issueDateIsBlank"] = false;
                  setIssueDateError(false);
                  checkMinDate(newValue);
                  handleDateFieldChange(
                    newValue,
                    "issueDate",
                    setIssueDateError,
                    setIssueDateErrorText,
                    setExpirationDateError,
                    setExpirationDateErrorText,
                    setBadgeFields,
                    badgeFields
                  );
                }
              }}
              onChange={(e: any) => {
                if (e.target.value === "") {
                  badgeFields["issueDateIsBlank"] = true;
                } else if (e.target.value !== "") {
                  badgeFields["issueDateIsBlank"] = false;
                }
              }}
              className={`text-field ${classes.root}`}
              maxDate={new Date()}
            />
            <div className="client-error-msz">
              { issueDateError === true &&
                  issueDateErrorText
                  }
              </div>
          </div>
          <div className="ms-3">
            <div className="ClientSubTitle">Badge Expiration Date</div>
            <DateSelector
              value={badgeFields.expirationDate}
              onChangeDateSelector={(newValue: any) => {
                if (newValue !== null) {
                  badgeFields["expirationDateIsBlank"] = false;
                  setExpirationDateError(false);
                  handleDateFieldChange(
                    newValue,
                    "expirationDate",
                    setIssueDateError,
                    setIssueDateErrorText,
                    setExpirationDateError,
                    setExpirationDateErrorText,
                    setBadgeFields,
                    badgeFields
                  );
                }
              }}
              onChange={(e: any) => {
                if (e.target.value === "") {
                  badgeFields["expirationDateIsBlank"] = true;
                } else if (e.target.value !== "") {
                  badgeFields["expirationDateIsBlank"] = false;
                }
              }}
              className={`text-field ${classes.root}`}
              minDate={expirationDateMinValue}
            />
             <div className="client-error-msz">
              { expirationDateError === true &&
                  expirationDateErrorText
                  }
              </div>
          </div>
          <div className="ms-3 ErroMsgreposition">
            <div className="ClientSubTitle">Badge Issued from</div>
            <BadgeIssuedFrom
              value={badgeFields.issuedFrom}
              onChange={(e: any) => {
                handleSelectIssuedFrom(e);
              }}
              stateIssuedOnly={true}
            />
            <div className="client-error-msz">
              { issuedFromError === true &&
                  issuedFromErrorText
                  }
              </div>
          </div>
        </div>
        {reUseComponent(
          "Contact Email",
          "Enter Contact Email",
          contactEmailError,
          contactEmailErrorText,
          setContactEmail,
          100,
          contactEmail,
          setContactEmailErrorText
        )}
        {reUseComponent(
          "Contact Phone",
          "Enter Contact Phone",
          contactPhoneError,
          contactPhoneErrorText,
          setContactPhone,
          10,
          contactPhone,
          setContactPhoneErrorText
        )}
        <ClientAddressComponent
          clientBAddressError={clientBAddressError}
          clientState={clientState}
          clientCity={clientCity}
          zipCodeErrorText={zipCodeErrorText}
          zipCodeError={zipCodeError}
          clientBAddress={clientBAddress}
          zipCode={zipCode}
          onZipCodeChange={onZipCodeChange}
          changeClientBAddressError={changeClientBAddressError}
          changeClientBAddress={changeClientBAddress}
        />
        <div className="d-flex">
          <div>
            <div className="ClientSubTitle">Member Since</div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={memberSince}
                onChange={(newValue) => {
                  setMemberSinceError(false);
                  if (newValue !== null) {
                    setMemberSince(new Date(newValue));
                    setDateFieldIsBlank(false);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={(e) => {
                      if (e.target.value === "") setDateFieldIsBlank(true);
                    }}
                    style={{ backgroundColor: "#f4f5f8", width: "230px" }}
                    className={classes.root}
                    error={memberSinceError}
                    helperText={memberSinceError ? setMemberSinceErrorText : ""}
                  />
                )}
                minDate={new Date()}
              />
            </LocalizationProvider>
            {memberSinceError && (
              <p className="DateError">{memberSinceErrorText}</p>
            )}
          </div>
          <div className="ms-2">
            <div className="ClientSubTitle ms-2">Account Type</div>
            <TextField
              className={`TextFieldWrapper ${classes.root}`}
              select
              style={{ maxWidth: "197px", backgroundColor: "#f4f5f8" }}
              id="select-state"
              value={accountType}
              onChange={(e) => setAccountType(parseInt(e.target.value))}
            >
              <MenuItem value={2}>Bronze</MenuItem>
              <MenuItem value={1}>Silver</MenuItem>
              <MenuItem value={6}>Gold</MenuItem>
              <MenuItem value={7}>Platinum</MenuItem>
            </TextField>
          </div>
        </div>
      </div>
      <div className="FooterWrapper">
        <hr className="HrWrapper"></hr>
        <Button
          className="ButtonAddWrapper pt-1 ButtonResize"
          variant="contained"
          onClick={onSubmit}
        >
          Add Client
        </Button>
      </div>
      <Dialog
        className="p-4 client-dashboard-container"
        open={confirmationModalIsVisible}
        onClose={() => {
          setConfirmationModalIsVisible(false);
          history.push("/login");
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        disableEscapeKeyDown
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogContent className="client-dashboard-container">
          <DialogContentText className="DialogTop">
            Client Successfully Added!
          </DialogContentText>
        </DialogContent>
        <DialogActions className="DialogBottom">
          <Button
            style={{ width: "198px" }}
            variant="contained"
            onClick={() => {
              setConfirmationModalIsVisible(false);
              history.push("/");
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
