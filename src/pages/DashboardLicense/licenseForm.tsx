import React, { ChangeEvent, useState, useEffect,useRef, useCallback, useLayoutEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";

import { useStyles } from "../../components/InputStyles";
import {
  GET_LICENSE_TYPE,
  GET_LICENSE_LEVEL,
  GET_LICENSE_USAGE,
  GET_LOCATIONS_BY_ORGANIZATION_ID,
  ADD_INITIAL_LICENSE,
  EDIT_LICENSE,
} from "../../networking/httpEndPoints";
import { decodeToken } from "../../utilities/decodeToken";
import Button from "../../components/Button";
import TextBox from "../../components/TextBox";
import DateSelector from "../../components/DateSelector";

const selectHeight = makeStyles({
  paper: {
    "& .MuiPopover-paper": {
      maxWidth: "15rem",
      maxHeight: "22% !important"
    },
  }
});

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface LicenseFormType { 
  addLicenseData?: Function;
  licenseFormFields: any | null;
  setLicenseFormFields: any;
  setOpen: any;
  open?: boolean;
  handleCancel: any;
  organizationLocationId?: number;
  setOrganizationLocationId?: any;
  addSpecificLocationLicense?: boolean;
  locationName?: string | null;
  updateLocation?: boolean;
  setUpdateLocation?: any;
  editLicense?: boolean;
  updateLicenseData?: any;
  GetLicensesData?: any;
  disabled?: boolean;
  setDisabled?: any;
}

interface AddLicenseResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const LicenseForm: React.FC<LicenseFormType> = (props: LicenseFormType) => {
  const classes = useStyles();
  const selectclasses = selectHeight();
  const licenseTypeRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  const [licenseTypeIds, setlicenseTypeIds] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);
  const [licenseLevelIds, setlicenseLevelIds] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);
  const [licenseUsageIds, setlicenseUsageIds] = React.useState<any[]>([
    { name: "", id: 0, isChecked: false },
  ]);
  let [organizationLocationIds, setOrganizationLocationIds] = React.useState<
    any[]
  >([]);
  const token = localStorage.getItem("user");
  const userData = decodeToken(token);

  const [licenseNumberErrorText, setLicenseNumberErrorText] =
    useState("Error happened");
  const [licenseUsageErrorText, setLicenseUsageErrorText] =
    useState("Error happened");
  const [issuingAuthorityErrorText, setIssuingAuthorityErrorText] =
    useState("Error happened");
  const [licenseIssueDateErrorText, setLicenseIssueDateErrorText] =
    useState("Error happened");
  const [licenseExpirationDateErrorText, setLicenseExpirationDateErrorText] =
    useState("Error happened");
  const [showLoader, setShowLoader] = useState(false);
  const [duplicateErrorText, setDuplicateErrorText] = useState("");
  const duplicateLicenseError =
    "A License with same Level, Type and Location already exists.";
  const licenseExpDateError =
    "Expiration Date cannot be equal or prior to Issue Date";

  const [loader, setLoader] = useState(true);
  const [loadLicenseTypes, setLoadLicenseTypes] = useState(false);
  const [loadLicenseLevels, setLoadLicenseLevels] = useState(false);
  const [loadLicenseUsages, setLoadLicenseUsages] = useState(false);
  const [loadOrganizationLocations, setLoadOrganizationLocations] = useState(false);

  const handleLicenseSelectFieldChange = (e: SelectChangeEvent<any>) => {
    const newFormValues = Object.assign({}, props.licenseFormFields);
    newFormValues[e.target.name] = parseInt(e.target.value);
    if (e.target.name === "licenseTypeId" && e.target.value !== "") {
      newFormValues["licenseTypeError"] = false;
    } else if (e.target.name === "licenseTypeId" && e.target.value === "") {
      newFormValues["licenseTypeError"] = true;
    } else if (e.target.name === "licenseLevelId" && e.target.value !== "") {
      newFormValues["licenseLevelError"] = false;
    } else if (e.target.name === "licenseLevelId" && e.target.value === "") {
      newFormValues["licenseLevelError"] = true;
    } else if (
      e.target.name === "organizationLocationId" &&
      e.target.value !== ""
    ) {
      newFormValues["locationError"] = false;
    } else if (
      e.target.name === "organizationLocationId" &&
      e.target.value === ""
    ) {
      newFormValues["locationError"] = true;
    }
    props.setLicenseFormFields(newFormValues);
    props.setDisabled(false);
  };

  const handleFieldChange = (e: React.ChangeEvent<any>) => {
    const newFormValues = Object.assign({}, props.licenseFormFields);
    newFormValues[e.target.id] = e.target.value;
    if (e.target.id === "licenseNumber") {
      newFormValues["licenseNumberError"] = false;
    }
    if (e.target.id === "issuingAuthority") {
      newFormValues["issuingAuthorityError"] = false;
    }
    props.setLicenseFormFields(newFormValues);
    props.setDisabled(false);
  };

  const handleLicenseDateFieldChange = (value: any, name: string) => {
    const newFormValues = Object.assign({}, props.licenseFormFields);
    newFormValues[name] = String(moment(value).format("MM/DD/YYYY"));
    if (name === 'issueDate') {
      if (
          new Date(newFormValues[name]).setHours(0, 0, 0, 0) >
      new Date().setHours(0, 0, 0, 0)
      ) {
        newFormValues["licenseIssueDateError"] = true;
        setLicenseIssueDateErrorText("Issue date cannot be a future date");
      } else if (
          moment(newFormValues[name], 'MM/DD/YYYY', true).isValid() === false
      ) {
        newFormValues["licenseIssueDateError"] = true;
        setLicenseIssueDateErrorText('Please enter date in MM/DD/YYYY');
      } else{
        newFormValues["licenseIssueDateError"] = false;
        setLicenseIssueDateErrorText('');
      }
    }
    if (name === 'expirationDate') {
      if (
          new Date(newFormValues[name]).setHours(0, 0, 0, 0) <=
      new Date(newFormValues['issueDate']).setHours(0, 0, 0, 0)
      ) {
        newFormValues["licenseExpirationDateError"] = true;
        setLicenseExpirationDateErrorText(licenseExpDateError);
      } else if (
          moment(newFormValues[name], 'MM/DD/YYYY', true).isValid() === false
      ) {
        newFormValues["licenseExpirationDateError"] = true;
        setLicenseExpirationDateErrorText('Please enter date in MM/DD/YYYY');
      } else{
        newFormValues["licenseExpirationDateError"] = false;
        setLicenseExpirationDateErrorText('');
      }
    }
    props.setLicenseFormFields(newFormValues);
    props.setDisabled(false);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<any>) => {
    const selectedId = parseInt(event.target.value);
    const newFormValues = Object.assign({}, props.licenseFormFields);
    if (newFormValues.licenseUsageId.includes(selectedId)) {
      const newIds = newFormValues.licenseUsageId.filter(
        (id: number) => id !== selectedId
      );
      newFormValues.licenseUsageId = newIds;
      newFormValues.licenseUsageError = false;
      props.setLicenseFormFields(newFormValues);
    } else {
      const newIds = newFormValues.licenseUsageId;
      newIds.push(selectedId);
      newFormValues.licenseUsageId = newIds;
      newFormValues.licenseUsageError = false;
      props.setLicenseFormFields(newFormValues);
    }
    props.setDisabled(false);
  };

  const keyValueMapper = (data: any) => {
    return Object.entries(data).map(([key, value]) => {
      return {
        name: value,
        id: key,
      };
    });
  };

  const getLicenseTypes = useCallback(() => {
    axios.get(GET_LICENSE_TYPE, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res: any) => {
      Swal.close();
      if (res.status === 200) {
        setLoadLicenseTypes(true);
        const tdata = res.data.data;
        const data = keyValueMapper(tdata);
        setlicenseTypeIds(data);
      }
    }).catch((error) => console.log(error));
  }, [token]);

  const getLicenseLevels = useCallback(() => {
    axios.get(GET_LICENSE_LEVEL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res: any) => {
      Swal.close();
      if (res.status === 200) {
        setLoadLicenseLevels(true);
        const tdata = res.data.data;
        const data = keyValueMapper(tdata);
        setlicenseLevelIds(data);
      }
    }).catch((error) => console.log(error));
  },[token]);

  const getLicenseUsages = useCallback(() => {
    axios.get(GET_LICENSE_USAGE, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res: any) => {
      if (res.status === 200) {
        setLoadLicenseUsages(true);
        const tdata = res.data.data;
        const setupCheckboxes = (function () {
          return Object.entries(tdata).map(([key, value]) => {
            return {
              name: value,
              id: key,
              isChecked: false,
            };
          });
        })();
        setlicenseUsageIds(setupCheckboxes);
      }
    }).catch((error) => console.log(error));
  },[token]);

  const getOrganizationLocations = useCallback(() => {
    axios.get(GET_LOCATIONS_BY_ORGANIZATION_ID, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res: any) => {
      if (
        res.status === 200 &&
        !res.data.isSuccess
      ) {
        organizationLocationIds = [];
      } else if (
        res.status === 200 &&
        res.data.isSuccess &&
        res.data.result != null
      ) {
        setLoadOrganizationLocations(true);
        const data = res.data.result;
        data.forEach(function (element: any) {
          organizationLocationIds.push({
            organizationLocationId: element.organizationLocationId,
            locationNickName: element.locationNickName,
          });
        });
        setOrganizationLocationIds(data);
      }
    }).catch((error) => console.log(error));
  },[token]);

  useEffect(() => {
    if(props.open){
      if(loadLicenseTypes && loadLicenseLevels && loadLicenseUsages && loadOrganizationLocations){
        setLoader(false);
      } else{
        setLoader(true);
      }
    }
  }, [props.open, loadLicenseTypes, loadLicenseLevels, loadLicenseUsages, loadOrganizationLocations]);

  useEffect(() => {
    if(props.open){
      setShowLoader(true);
      getLicenseTypes();
      getLicenseLevels();
      getLicenseUsages();
      getOrganizationLocations();
      setShowLoader(false);
    }
  }, [props.open, getLicenseLevels, getLicenseTypes, getLicenseUsages, getOrganizationLocations]);

  useEffect(() => {
    licenseTypeRef.current && licenseTypeRef.current.focus();
   }, [licenseTypeIds]);

  useLayoutEffect(() => {
    if (locationRef.current && locationRef.current.value !== "") {
      locationRef.current && locationRef.current.focus();
    }
  }, [props.licenseFormFields.organizationLocationId]);

  const validateLicence = () => {
    let validate = true;
    const newFormValues = Object.assign({}, props.licenseFormFields);
    if (props.licenseFormFields.licenseTypeId === "") {
      props.licenseFormFields.licenseTypeError = true;
      newFormValues["licenseTypeError"] = true;
      validate = false;
      props.setDisabled(false);
    }
    if (props.licenseFormFields.licenseLevelId === "") {
      props.licenseFormFields.licenseLevelError = true;
      newFormValues["licenseLevelError"] = true;
      validate = false;
      props.setDisabled(false);
    }
    if (props.licenseFormFields.organizationLocationId === "") {
      props.licenseFormFields.locationError = true;
      newFormValues["locationError"] = true;
      validate = false;
      props.setDisabled(false);
    }
    if (props.licenseFormFields.licenseUsageId.length === 0) {
      props.licenseFormFields.licenseUsageError = true;
      newFormValues.licenseUsageError = true;
      setLicenseUsageErrorText("License Designation is required");
      validate = false;
      props.setDisabled(false);
    }
    if (props.licenseFormFields.licenseNumber.trim().length === 0) {
      props.licenseFormFields.licenseNumberError = true;
      newFormValues["licenseNumberError"] = true;
      setLicenseNumberErrorText("License Number is required");
      validate = false;
      props.setDisabled(false);
    }
    if (props.licenseFormFields.issuingAuthority.trim().length === 0) {
      props.licenseFormFields.issuingAuthorityError = true;
      newFormValues["issuingAuthorityError"] = true;
      setIssuingAuthorityErrorText("Issuing Authority is required");
      validate = false;
      props.setDisabled(false);
    }
    // ============== Issue Date ============================
    if (props.licenseFormFields.issueDateIsBlank === true) {
      props.licenseFormFields.licenseIssueDateError = true;
      newFormValues["licenseIssueDateError"] = true;
      setLicenseIssueDateErrorText("Issue date is required");
      validate = false;
      props.setDisabled(false);
    } else if (
      !moment(props.licenseFormFields.issueDate, "MM/DD/YYYY", true).isValid()
    ) {
      props.licenseFormFields.licenseIssueDateError = true;
      setLicenseIssueDateErrorText("Please enter date in MM/DD/YYYY.");
      validate = false;
      props.setDisabled(false);
    } else if (
      new Date(props.licenseFormFields.issueDate).setHours(0, 0, 0, 0) >
      new Date().setHours(0, 0, 0, 0)
    ) {
      props.licenseFormFields.licenseIssueDateError = true;
      setLicenseIssueDateErrorText("Issue date cannot be a future date");
      validate = false;
      props.setDisabled(false);
    }
    // ======================= Expiration Date	=======================
    if (props.licenseFormFields.expirationDateIsBlank === true) {
      props.licenseFormFields.licenseExpirationDateError = true;
      newFormValues["licenseExpirationDateError"] = true;
      setLicenseExpirationDateErrorText("Expiry date is required");
      validate = false;
      props.setDisabled(false);
    } else if (
      props.licenseFormFields.expirationDate !==
      moment(props.licenseFormFields.expirationDate).format("MM/DD/YYYY")
    ) {
      props.licenseFormFields.expirationDate = null;
    } else if (
      !moment(
        props.licenseFormFields.expirationDate,
        "MM/DD/YYYY",
        true
      ).isValid()
    ) {
      props.licenseFormFields.licenseExpirationDateError = true;
      setLicenseExpirationDateErrorText("Please enter date in MM/DD/YYYY.");
      validate = false;
      props.setDisabled(false);
    } else if (
      new Date(props.licenseFormFields.expirationDate).setHours(0, 0, 0, 0) <=
      new Date(props.licenseFormFields.issueDate).setHours(0, 0, 0, 0)
    ) {
      props.licenseFormFields.licenseExpirationDateError = true;
      setLicenseExpirationDateErrorText(licenseExpDateError);
      validate = false;
      props.setDisabled(false);
    }
    props.setLicenseFormFields(newFormValues);
    return validate;
  };

  const submitLicenseForm = () => {
    props.setDisabled(true);
    if (validateLicence()) {
      const licenseData = {
        licenseTypeId: props.licenseFormFields.licenseTypeId,
        licenseNumber: props.licenseFormFields.licenseNumber.trim(),
        licenseUsageId: props.licenseFormFields.licenseUsageId,
        licenseLevelId: props.licenseFormFields.licenseLevelId,
        issueDate: props.licenseFormFields.issueDate,
        expirationDate: props.licenseFormFields.expirationDate,
        issuingAuthority: props.licenseFormFields.issuingAuthority.trim(),
      };
      const params = {
        licenses: [licenseData],
        organizationLocationId: props.licenseFormFields.organizationLocationId,
      };

      setShowLoader(true);
      axios
        .post<AddLicenseResponse>(ADD_INITIAL_LICENSE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          const ResCondition1 = res.status === 201 && !res.data.isSuccess;
          const ResCondition2 = res.status === 201 && res.data.isSuccess && res.data.result != null;
          if (ResCondition1 ) {
            resMessage(res.data.responseMessage);
          }
           else if (
            ResCondition2 &&
            props.addSpecificLocationLicense
          ) {
            Swal.fire({
              title: "License successfully added!",
              confirmButtonColor: "#233ce6",
              confirmButtonText: "Continue",
            }).then(function () {
              props.setUpdateLocation(!props.updateLocation);
            });
            props.handleCancel();
            props.GetLicensesData();
          } else if (
            ResCondition2 &&
            !props.addSpecificLocationLicense
          ) {
            props.addLicenseData && props.addLicenseData();
            props.handleCancel();
            props.GetLicensesData();
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => setShowLoader(false));
    }
  };
  function resMessage(message:string) {
    if (message === duplicateLicenseError) {
      setDuplicateErrorText(message);
    } else {
      const newFormValues = Object.assign({}, props.licenseFormFields);
      newFormValues["licenseNumberError"] = true;
      props.setLicenseFormFields(newFormValues);
      setLicenseNumberErrorText(
        message || "Please enter valid License data"
      );
    }
  }
  const updateLicenseForm = () => {
    props.setDisabled(true);
    if (validateLicence()) {
      const licenseData = {
        licenseId: props.licenseFormFields.licenseId,
        licenseTypeId: props.licenseFormFields.licenseTypeId,
        licenseUsageId: props.licenseFormFields.licenseUsageId,
        licenseLevelId: props.licenseFormFields.licenseLevelId,
        licenseNumber: props.licenseFormFields.licenseNumber.trim(),
        issueDate: props.licenseFormFields.issueDate,
        expirationDate: props.licenseFormFields.expirationDate,
        issuingAuthority: props.licenseFormFields.issuingAuthority.trim(),
        updatedBy: userData.UserId,
      };

      setShowLoader(true);
      axios
        .put<AddLicenseResponse>(EDIT_LICENSE, licenseData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setShowLoader(false);
          if (res.status === 200 && !res.data.isSuccess) {
            const newFormValues = Object.assign({}, props.licenseFormFields);
            newFormValues["licenseNumberError"] = true;
            props.setLicenseFormFields(newFormValues);
            setLicenseNumberErrorText(
              res.data.responseMessage || "Please enter valid License data"
            );
          } else if (res.status === 200 && res.data.isSuccess) {
            props.handleCancel();
            props.updateLicenseData();
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => setShowLoader(false));
    }
  };

  const handleLicenseIssueFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value === "" || e.target.value === null) {
      props.licenseFormFields["issueDateIsBlank"] = true;
      props.licenseFormFields.licenseIssueDateError = false;
      setLicenseIssueDateErrorText("");
    } else {
      props.licenseFormFields["issueDateIsBlank"] = false;
    }
  };
  const handleLicenseExpirationFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value === "" || e.target.value === null) {
      props.licenseFormFields["expirationDateIsBlank"] = true;
      props.licenseFormFields.licenseExpirationDateError = false;
      setLicenseExpirationDateErrorText("");
    } else {
      props.licenseFormFields["expirationDateIsBlank"] = false;
      handleLicenseDateFieldChange(new Date(e.target.value), "expirationDate");
    }
  };
  const ShowSpecificLocationLicense = (): JSX.Element => {
    if (props.addSpecificLocationLicense) {
      return (
        <div className="row">
          <div className="col-sm-12 col-12">
            {props.locationName && props.locationName.trim().length > 40 ? (
              <Tooltip
                title={props.locationName.trim()}
                placement="top"
                arrow
              >
                <p className="LocationNameWrapper-lic">
                  {props.locationName}
                </p>
              </Tooltip>
            ) : (
              <p className="LocationNameWrapper-lic">{props.locationName}</p> 
            )}
            <hr className="HrLine-lic"></hr>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };
  const ShowSpecificEditLocationLicense = (): JSX.Element => {
    if (!props.addSpecificLocationLicense && !props.editLicense) {
      return (
        <div className="col-sm-6 col-12">
          <Select
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: 16,
              backgroundColor: "#f4f5f8",
              width: "100%",
              opacity: "0.8",
              height: "60px",
            }}
            defaultValue=""
            name="organizationLocationId"
            displayEmpty
            value={props.licenseFormFields.organizationLocationId}
            onChange={(e) => {
              handleLicenseSelectFieldChange(e);
              setDuplicateErrorText("");
            }}
            inputProps={{ "aria-label": "Without label" }}
            MenuProps={{
              className: selectclasses.paper,
            }}
            variant="filled"
            className="input-form select-field"
            IconComponent={CustomExpandMore}
            inputRef={locationRef}
          >
            <MenuItem disabled value="">
              <span className="input-placeholder">Select a location</span>
            </MenuItem>
            {organizationLocationIds.map((type) => (
              <MenuItem
                key={type.locationNickName}
                value={type.organizationLocationId}
              >
                <Tooltip
                  title={
                    type.locationNickName.length > 23
                      ? type.locationNickName
                      : ""
                  }
                  placement="top"
                  arrow
                >
                  <div className="dashboard-license-container">
                  <div
                   className="organizationLocationNickName"
                  >
                    {type.locationNickName.length > 23
                      ? type.locationNickName + "..."
                      : type.locationNickName}
                  </div>
                  </div>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
          {checkError(props.licenseFormFields.locationError, "Location is required")}
        </div>
      );
    } else {
      return <></>;
    }
  };
  const checkError = (param: boolean, ErrorMessage: string) => {
    if (param === true) {
      return (
        <span className="form-field-error">{ErrorMessage}</span>
      );
    }
  };
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showLoader}
      >
        <CircularProgress />
      </Backdrop>
      {loader && (<div className="LoaderWrapper"><CircularProgress /></div>)}
      {!loader && (
      <div className="dashboard-license-container MainContainer-License form-container p-4">
        <ShowSpecificLocationLicense />

        {props.editLicense && (
          <div className="row">
              <div className="col-sm-12 col-12">
                <div className="form-field-wrapper">
              <TextBox
                id="licenseNumber"
                value={props.licenseFormFields.licenseNumber}
                hiddenLabel
                disableUnderline={false}
                variant="filled"
                className="form-control text-box text-box-align"
                placeholder="Enter License #"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange(e);
                }}
                maxLength={50}
                height={60}
                minLength={1}
                />
                {checkError(props.licenseFormFields.licenseNumberError, licenseNumberErrorText)}
                </div>
                </div>
          </div>
        )}
        <div className="row">
            <div className="col-sm-12 col-12">
              <div className="form-field-wrapper">
            <Select
              style={{
                fontSize: 16,
                height: 60,
              }}
              name="licenseTypeId"
              displayEmpty
              value={props.licenseFormFields.licenseTypeId}
              onChange={(e) => {
                handleLicenseSelectFieldChange(e);
                setDuplicateErrorText("");
              }}
              inputProps={{ "aria-label": "Without label" }}
              variant="filled"
              className="input-form select-field"
              IconComponent={CustomExpandMore}
              inputRef={licenseTypeRef}
            >
              <MenuItem disabled value="">
                <span className="input-placeholder">Select license type</span>
              </MenuItem>
              {licenseTypeIds.map((type) => (
                <MenuItem key={type.name} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
              </Select>
              {checkError(props.licenseFormFields.licenseTypeError,"License Type is required")}
              </div>
            </div>
        </div>
        {!props.editLicense && (
          <div className="row">
              <div className="col-sm-12 col-12">
                <div className="form-field-wrapper">
              <TextBox
                id="licenseNumber"
                value={props.licenseFormFields.licenseNumber}
                hiddenLabel
                variant="filled"
                className="form-control"
                placeholder="Enter License #"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleFieldChange(e);
                  setDuplicateErrorText("");
                }}
                maxLength={50}
                height={60}
                minLength={1}
                style={{ fontSize: 16, background: "#f9f9f9" }}
                />
                {checkError(props.licenseFormFields.licenseNumberError,licenseNumberErrorText)}
                </div>
                </div>
          </div>
        )}
        <div className="row">
            <div className="col-sm-6 col-12">
              <div className="form-field-wrapper">
            <div className="CheckBoxWrapper-license">
              {licenseUsageIds.map((usage) => (
                <FormControlLabel
                  key={usage.id}
                  control={
                    <Checkbox
                      checked={
                        props.licenseFormFields.licenseUsageId.includes(
                          parseInt(usage.id)
                        )
                          ? true
                          : false
                      }
                      value={usage.id}
                      onChange={(e) => {
                        handleCheckboxChange(e);
                      }}
                      name={usage.name}
                    />
                  }
                  label={
                    <span
                      style={{
                        fontSize: "16px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {usage.name}
                    </span>
                  }
                />
              ))} 
              {checkError(props.licenseFormFields.licenseUsageError,licenseUsageErrorText)}
            </div>
            </div>
          </div>
            <div className="col-sm-6">
              <div className="form-field-wrapper">
            <Select
              style={{
                fontSize: 16,
                height: 60,
                marginTop:12
              }}
              name="licenseLevelId"
              displayEmpty
              value={props.licenseFormFields.licenseLevelId}
              onChange={(e) => {
                handleLicenseSelectFieldChange(e);
                setDuplicateErrorText("");
              }}
              inputProps={{ "aria-label": "Without label" }}
              variant="filled"
              className="input-form select-field"
              IconComponent={CustomExpandMore}
            >
              <MenuItem disabled value="">
                <span className="input-placeholder">Select license level</span>
              </MenuItem>
              {licenseLevelIds.map((type) => (
                <MenuItem key={type.name} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select> 
            {checkError(props.licenseFormFields.licenseLevelError,"License level is required")}
          </div>
          </div>
        </div>
        <div className="row mui-label-styling">
            <div className="col-sm-6 col-12">
              <div className="form-field-wrapper">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateSelector
                value={props.licenseFormFields.issueDate}
                label="Issue Date"
                allowSameDateSelection={true}
                onChangeDateSelector={(
                  newValue: ChangeEvent<HTMLInputElement>
                ) => {
                  if (newValue !== null) {
                    props.licenseFormFields["issueDateIsBlank"] = false;
                    props.licenseFormFields["licenseIssueDateError"] = false;
                    handleLicenseDateFieldChange(newValue, "issueDate");
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleLicenseIssueFieldChange(e);
                }}
                className={`${classes.root} dateclasses`}
                maxDate={new Date()}
              />
              </LocalizationProvider>
              {checkError(props.licenseFormFields.licenseIssueDateError,licenseIssueDateErrorText)}
          </div>
          </div>
            <div className="col-sm-6 col-12">
              <div className="form-field-wrapper">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateSelector
                value={props.licenseFormFields.expirationDate}
                label="Expiry Date"
                allowSameDateSelection={true}
                onChangeDateSelector={(
                  newValue: ChangeEvent<HTMLInputElement>
                ) => {
                  if (newValue !== null) {
                    props.licenseFormFields["expirationDateIsBlank"] = false;
                    props.licenseFormFields["licenseExpirationDateError"] =
                      false;
                    handleLicenseDateFieldChange(newValue, "expirationDate");
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleLicenseExpirationFieldChange(e);
                }}
                className={`${classes.root} dateclasses`}
              />
              </LocalizationProvider>
              {checkError(props.licenseFormFields.licenseExpirationDateError,licenseExpirationDateErrorText)}
          </div>
          </div>
          {props.licenseFormFields.licenseExpirationDateError ? (
            <div className="row "></div>
          ) : (
            ""
          )}
        </div>
        <div className="row">
          <ShowSpecificEditLocationLicense />
          <div
            className={
              !props.addSpecificLocationLicense && !props.editLicense
                ? "col-sm-6 col-12"
                : "col-sm-12 col-12"
            }
            >
              <div className="form-field-wrapper">
            <TextBox
              id="issuingAuthority"
              className="text-box-align"
              value={props.licenseFormFields.issuingAuthority}
              hiddenLabel
              disableUnderline={false}
              variant="filled"
              placeholder="Issuing authority"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleFieldChange(e);
              }}
              maxLength={100}
              height={60}
              minLength={1}
              />
              {checkError(props.licenseFormFields.issuingAuthorityError,issuingAuthorityErrorText)}
          </div>
          </div>
        </div>
        <div className="CheckBoxError-lic">{duplicateErrorText}</div>
        <div className="d-flex ButtonWrapper-license">
          <div>
            <Button
              type="contained"
              intent="primary"
              onClick={
                props.editLicense ? updateLicenseForm : submitLicenseForm
              }
              text="Submit"    
              disabled={props.disabled}
              className="next-btn SubmitButton-lic"
            />
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default LicenseForm;
