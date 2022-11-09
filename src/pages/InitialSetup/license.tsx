import React, { useEffect } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import InputBox from "../../components/InputBox";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Swal from "sweetalert2";

import { dateFieldStyle } from "../../components/InputStyles";
import {
  GET_LICENSE_TYPE,
  GET_LICENSE_LEVEL,
  GET_LICENSE_USAGE,
  GET_LICENSE,
  DELETE_LICENSE,
} from "../../networking/httpEndPoints";
import { decodeToken } from "../../utilities/decodeToken";
import { handleInitalSetupLicenseDateFieldChange, licenseFields } from "../../components/Employee/handleDateFieldChange";
import CheckBox from "../InitialSetup/CheckBox";
interface ComponentProps {
  expand?: string | boolean;
}

const AccordionWrapper = styled(Accordion)<ComponentProps>`
  &.license-accordion {
    box-shadow: none !important;
    border-bottom: ${(props) =>
      props.expand ? "2px solid #233ce6 !important" : "none"};
    border-radius: 0px !important;
  }
`;
const Heading = styled.div<ComponentProps>`
  font-size: 20px;
  color: ${(props) => (props.expand ? "#233ce6 !important" : "#001e46")};
  line-height: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-left: 15px;
`;

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface LocationType {
  activeWizard: string;
  setActiveWizard: any;
  activeStep: number;
  setActiveStep: any;
  setValue: any;
  value: boolean;
  licenseFields: any | null;
  setLicenseFields: any;
  organizationLocationId: number;
  licenseNumberErrorText: string;
  setLicenseNumberErrorText: any;
  licenseUsageErrorText: string;
  setLicenseUsageErrorText: any;
  issuingAuthorityErrorText: string;
  setIssuingAuthorityErrorText: any;
  issueDateErrorText: string;
  setIssueDateErrorText: any;
  expirationDateErrorText: string;
  setExpirationDateErrorText: any;
  setCleanInputs: any;
  cleanInputs: boolean;
  licenseIds: any;
  resetLicenseInputs: any;
}

type deleteLicenseResp = {
  isSuccess: boolean;
  responseMessage: string | null;
  result: any;
};

interface LoginTokenType {
  user: {
    organizationId?: number | null;
  };
}

const License: React.FC<LocationType> = (props: LocationType) => {
  const classes = dateFieldStyle();

  const checkDirty = {
    licenseTypeIdTouched: false,
    licenseLevelTouched: false,
    issueDateTouched: false,
    expDateTouched: false,
    issueAuthorityTouched: false,
    licenseNumberTouched: false,
    adultUseTouched: false,
    medicalUseTouched: false,
    licenseUsageIdTouched: false,
  };
  const [dirty, setDirty] = React.useState(checkDirty);
  const [expanded, setExpanded] = React.useState<string | false>("panel_0");
  const [licenseTypeIds, setlicenseTypeIds] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);
  const [licenseLevelIds, setlicenseLevelIds] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);
  const [licenseUsageIds, setlicenseUsageIds] = React.useState<any[]>([
    { name: "", id: 0, isChecked: false },
  ]);
  const userState = useSelector((state: LoginTokenType) => state.user);
  const token = localStorage.getItem("user");
  const userData = decodeToken(token);

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const LicenseUsageCheckbox = (id: number) => {
    return (<>
      {licenseUsageIds.map((usage) => (
        CheckBox(
          id,
          handleCheckboxChange,
          props.licenseFields,
          usage,
        )
      ))}
    </>);
  };

  useEffect(() => {
    props.setValue(true);
  }, [props.activeWizard]);

  useEffect(() => {
    if (
      props.activeWizard === "license" &&
      props.licenseIds &&
      props.licenseIds.length > 0
    ) {
      getLicenseData();
    }
  }, [props.activeWizard, props.licenseIds]);

  const getLicenseData = () => {
    axios
      .get(GET_LICENSE + props.organizationLocationId, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res: any) => {
        getLicenseDataResponse(res);
      });
  };
  const getLicenseDataResponse = (res: any) => {
    if (res.status === 200 && res.data.responseMessage === "Success") {
      props.resetLicenseInputs();
      const data = res.data.result;
      const licenseData: any | null = [];
      data.forEach(function (element: any) {
        licenseData.push({
          licenseId: element.licenseId,
          licenseTypeId: element.licenseTypeId,
          licenseUsageId: element.licenseDesignationId,
          licenseLevelId: element.licenseLevelId,
          licenseNumber: element.licenseNumber,
          issueDate: String(moment(element.issueDate).format("MM/DD/YYYY")),
          expirationDate: String(
            moment(element.expirationDate).format("MM/DD/YYYY")
          ),
          issuingAuthority: element.issuingAuthority,
          organizationId: userState["organizationId"],
          organizationLocationId: props.organizationLocationId,
          status: "active",
          createdBy: userData.UserId,
          licenseUsageError: false,
          licenseNumberError: false,
          issueDateError: false,
          expirationDateError: false,
          issuingAuthorityError: false,
        });
      });
      props.setLicenseFields(licenseData);
    }
  };
  useEffect(() => {
    if (props.activeWizard === "location") {
      props.setActiveStep(0);
    }

    checkDirtyForSkip();
  }, [props.activeWizard, dirty]);

  const keyValueMapper = (data: any) => {
    return Object.entries(data).map(([key, value]) => {
      return {
        name: value,
        id: key,
      };
    });
  };

  useEffect(() => {
    axios
      .all([
        axios.get(GET_LICENSE_LEVEL, {
          headers,
        }),
        axios.get(GET_LICENSE_TYPE, {
          headers,
        }),
        axios.get(GET_LICENSE_USAGE, {
          headers,
        }),
      ])
      .then(
        axios.spread(
          (
            licenseLevelResp: any,
            licenseTypeIdResp: any,
            licenseUsageResp: any
          ) => {
            Swal.close();
            if (licenseLevelResp.status === 200) {
              const tdata = licenseLevelResp.data.data;
              const data = keyValueMapper(tdata);
              setlicenseLevelIds(data);
            }
            if (licenseTypeIdResp.status === 200) {
              const tdata = licenseTypeIdResp.data.data;
              const data = keyValueMapper(tdata);
              setlicenseTypeIds(data);
            }
            if (licenseUsageResp.status === 200) {
              const tdata = licenseUsageResp.data.data;
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
          }
        )
      )
      .catch((error) => console.log(error));
  }, []);

  const handleRemoveLicense = (i: any) => {
    const values = [...props.licenseFields];
    const splicedData = values.splice(i, 1);

    values.forEach((element) => {
      if (
        element.expirationDate === "" &&
        element.issueDate === "" &&
        element.issuingAuthority === "" &&
        element.licenseLevelId === "" &&
        element.licenseNumber === "" &&
        element.licenseTypeId === "" &&
        element.licenseUsageId.length === 0
      )
        props.setValue(true);
    });
    if (splicedData[0].licenseId !== 0) {
      axios
        .delete<deleteLicenseResp>(DELETE_LICENSE, {
          data: { licenseId: splicedData[0].licenseId },
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
            Swal.fire({
              text: res.data.responseMessage || "Delete operation failed",
              confirmButtonText: "OK",
              icon: "error",
            });
          } else if (res.status === 200 && res.data.isSuccess) {
            props.setLicenseFields(values);
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
        });
    } else {
      props.setLicenseFields(values);
    }
  };

  const checkDirtyForSkip = () => {
    if (
      dirty.licenseLevelTouched ||
      dirty.expDateTouched ||
      dirty.issueDateTouched ||
      dirty.issueAuthorityTouched ||
      dirty.licenseTypeIdTouched ||
      dirty.licenseNumberTouched ||
      dirty.adultUseTouched ||
      dirty.medicalUseTouched ||
      dirty.licenseUsageIdTouched
    ) {
      props.setValue(false);
    } else {
      props.setValue(true);
    }
  };

  const handleCheckboxChange = (i: number, event: React.ChangeEvent<any>) => {
    const selectedId = parseInt(event.target.value);
    const newFormValues = [...props.licenseFields];
    newFormValues[i]["showWarning"] = false;

    if (newFormValues[i].licenseUsageId.includes(selectedId)) {
      const newIds = newFormValues[i].licenseUsageId.filter(
        (id: number) => id !== selectedId
      );
      newFormValues[i].licenseUsageId = newIds;
      newFormValues[i].licenseUsageError = false;
      props.setLicenseFields(newFormValues);
    } else {
      const newIds = newFormValues[i].licenseUsageId;
      newIds.push(selectedId);
      newFormValues[i].licenseUsageId = newIds;
      newFormValues[i].licenseUsageError = false;
      props.setLicenseFields(newFormValues);
    }
    let isTouched = false;
    if (newFormValues[i].licenseUsageId.length > 0) {
      isTouched = true;
    }
    setDirty({
      ...dirty,
      licenseUsageIdTouched: isTouched,
    });
  };
  const handleFieldChange = (i: number, e: React.ChangeEvent<any>) => {
    const newFormValues = [...props.licenseFields];
    newFormValues[i][e.target.name] = e.target.value;
    newFormValues[i]["showWarning"] = false;
    if (e.target.name === "licenseNumber") {
      newFormValues[i]["licenseNumberError"] = false;
      if (e.target.value.length >= 1) {
        setDirty({
          ...dirty,
          licenseNumberTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          licenseNumberTouched: false,
        });
      }
    }
    if (e.target.name === "issuingAuthority") {
      newFormValues[i]["issuingAuthorityError"] = false;
      if (e.target.value.length >= 1) {
        setDirty({
          ...dirty,
          issueAuthorityTouched: true,
        });
      } else {
        setDirty({
          ...dirty,
          issueAuthorityTouched: false,
        });
      }
    }
    props.setLicenseFields(newFormValues);
  };

  const handleLicenseSelectFieldChange = (
    i: number,
    e: SelectChangeEvent<any>
  ) => {
    const newFormValues: any[] = [...props.licenseFields];
    newFormValues[i][e.target.name] = parseInt(e.target.value);
    newFormValues[i]["showWarning"] = false;

    if (e.target.name === "licenseTypeId" && e.target.value !== "") {
      newFormValues[i]["licenseTypeError"] = false;
      setDirty({
        ...dirty,
        licenseTypeIdTouched: true,
      });
    } else if (e.target.name === "licenseTypeId" && e.target.value === "") {
      newFormValues[i]["licenseTypeError"] = true;
      setDirty({
        ...dirty,
        licenseTypeIdTouched: false,
      });
    } else if (e.target.name === "licenseLevelId" && e.target.value !== "") {
      newFormValues[i]["licenseLevelError"] = false;
      setDirty({
        ...dirty,
        licenseLevelTouched: true,
      });
    } else if (e.target.name === "licenseLevelId" && e.target.value === "") {
      newFormValues[i]["licenseLevelError"] = true;
      setDirty({
        ...dirty,
        licenseLevelTouched: false,
      });
    }
    props.setLicenseFields(newFormValues);
  };

  const addLicenseFormFields = () => {
    props.setLicenseFields([
      ...props.licenseFields,
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
        organizationLocationId: props.organizationLocationId,
        status: "active",
        createdBy: userData.UserId,
        licenseTypeError: false,
        licenseLevelError: false,
        licenseUsageError: false,
        licenseNumberError: false,
        issueDateError: false,
        expirationDateError: false,
        issuingAuthorityError: false,
        expirationDateIsBlank: true,
      },
    ]);
  };
  const onChangeLicenseIssueDate = (newValue: Date | null, id: number) => {
      const newLicenseValue: licenseFields[] = [...props.licenseFields];
      if (newValue !== null) {
        props.licenseFields[id]["issueDateIsBlank"] =
          false;
        props.licenseFields[id]["issueDateError"] =
          false;
        setDirty({
          ...dirty,
          issueDateTouched: true,
        });
        handleInitalSetupLicenseDateFieldChange(
          newLicenseValue,
          id,
          newValue,
          "issueDate",
          "licenseForm",
          props.setIssueDateErrorText,
          props.setExpirationDateErrorText
        );
        props.setLicenseFields(newLicenseValue);
      } else {
        setDirty({
          ...dirty,
          issueDateTouched: false,
        });
      }
  };
  const onChangeLicenseExpDate = (newValue: Date | null, id: number) => {
    const newLicenseValue: licenseFields[] = [...props.licenseFields];
    if (newValue !== null) {
      props.licenseFields[id][
        "expirationDateIsBlank"
      ] = false;
      props.licenseFields[id]["expirationDateError"] = false;
      setDirty({
        ...dirty,
        expDateTouched: true,
      });
      handleInitalSetupLicenseDateFieldChange(
        newLicenseValue,
        id,
        newValue,
        "expirationDate",
        "licenseForm",
        props.setIssueDateErrorText,
        props.setExpirationDateErrorText
      );
      props.setLicenseFields(newLicenseValue);
    } else {
      setDirty({
        ...dirty,
        expDateTouched: false,
      });
    }
  };
  const removeLicenseFormFields = (i: number) => {
    const newFormValues = [...props.licenseFields];
    newFormValues.splice(i, 1);
    props.setLicenseFields(newFormValues);
  };

  const accordianChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  let initailValue = 0;

  type menuArrayType = {
    id: string;
    name: string;
  };

  const SelectComponent = (id: number,field: number | null,
    message: string, placeholderText: string, menuArray: menuArrayType[], labelName: string
  ) => {
    return(<>
    <Select
      name={labelName}
      displayEmpty
      value={field}
      onChange={(e) => {
        handleLicenseSelectFieldChange(id, e);
      }}
      inputProps={{ "aria-label": "Without label" }}
      variant="filled"
      className="input-form select-field"
      IconComponent={CustomExpandMore}
    >
      <MenuItem disabled value="" className="abcdef">
        <span className="input-placeholder">
          {placeholderText}
        </span>
      </MenuItem>
      {menuArray.map((type) => (
        <MenuItem key={`${type.name}-${id}`} value={type.id}>
          {type.name}
        </MenuItem>
      ))}
    </Select>
    <div className="CheckBoxError">
      {message}
    </div>
    </>);
  };

  const ErrorMsg = (field: boolean,errorText: string) => {
    if(field === true) {
      return errorText;
    } else {
      return '';
    }
  };

  const LicenseFormAccordion = (id: number,field: licenseFields) => {
    return(<>
     <div className="row">
      <div className="col-sm-6 col-12">
        {SelectComponent(id, field.licenseTypeId,
          ErrorMsg(field.licenseTypeError,"License type is required"),
          "Select License Type", licenseTypeIds, "licenseTypeId"
        )}
      </div>
      <div className="col-sm-6 col-12">
        <div className="CheckBoxWrapper">
          {LicenseUsageCheckbox(id)}
        </div>
        <div className="CheckBoxError">
          {ErrorMsg(field.licenseUsageError,props.licenseUsageErrorText)}
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-6 col-12">
        {SelectComponent(id, field.licenseLevelId,
          ErrorMsg(field.licenseLevelError,"License level is required"),
          "Select License level",licenseLevelIds, "licenseLevelId"
        )}
      </div>
      <div className="col-sm-6 col-12">
        <InputBox
          name="licenseNumber"
          error={field.licenseNumberError}
          helperText={
            field.licenseNumberError
              ? props.licenseNumberErrorText
              : ""
          }
          value={field.licenseNumber}
          hiddenLabel
          variant="filled"
          className="input-form"
          placeholder="Enter License #"
          type="text"
          onChange={(e: any) => {
            handleFieldChange(id, e);
          }}
          maxLength={50}
          minLength={1}
        />
      </div>
    </div>
    <div className="row mui-label-styling">
      <div className="col-sm-6 col-12">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={field.issueDate}
            label="Issue Date"
            allowSameDateSelection={true}
            onChange={(newValue) => {
              onChangeLicenseIssueDate(newValue,id);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                onChange={(e) => {
                  if (e.target.value === "") {
                    props.licenseFields[id][
                      "issueDateIsBlank"
                    ] = true;
                    props.licenseFields[id]["issueDateError"] =
                    false;
                  } else if (e.target.value !== "") {
                    props.licenseFields[id][
                      "issueDateIsBlank"
                    ] = false;
                  }
                }}
                style={{
                  backgroundColor: "#f4f5f8",
                  width: "100%",
                  marginBottom: 20,
                }}
                className={classes.root}
                error={field.issueDateError}
                helperText={
                  field.issueDateError
                    ? props.issueDateErrorText
                    : ""
                }
              />
            )}
            maxDate={new Date()}
          />
        </LocalizationProvider>
      </div>
      <div className="col-sm-6 col-12">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={field.expirationDate}
            label="Expiry Date"
            allowSameDateSelection={true}
            onChange={(newValue) => {
              onChangeLicenseExpDate(newValue,id);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                onChange={(e) => {
                  if (e.target.value === "") {
                    props.licenseFields[id][
                      "expirationDateIsBlank"
                    ] = true;
                    props.licenseFields[id]["expirationDateError"] = false;
                  } else if (e.target.value !== "") {
                    props.licenseFields[id][
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
                helperText={
                  field.expirationDateError
                    ? props.expirationDateErrorText
                    : ""
                }
              />
            )}
            minDate={new Date()}
          />
        </LocalizationProvider>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-12 col-12">
        <InputBox
          name="issuingAuthority"
          error={field.issuingAuthorityError}
          helperText={
            field.issuingAuthorityError
              ? props.issuingAuthorityErrorText
              : ""
          }
          value={field.issuingAuthority}
          hiddenLabel
          variant="filled"
          className="input-form"
          placeholder="Issuing authority"
          onChange={(e: any) => {
            handleFieldChange(id, e);
          }}
          maxLength={100}
          minLength={1}
        />
      </div>
    </div>
    </>);
  };

  const checkExpanded = (id: number) => {
    if(expanded !== `panel_${id}`) {
      return "true";
    }
    else {
      return "false";
    }
  };

  return (
    <div className="initial-setup-wrapper form-container">
      <div className="Card">
        {props.licenseFields.map((field: licenseFields, id: number) => {
          const converter = require("number-to-words");
          initailValue = initailValue + 1;
          const numValue = converter.toWords(initailValue);

          return (
            <div key={`${field}-${id}`}>
              {props.licenseFields.length >= 2 ? (
                <AccordionWrapper
                  expanded={expanded === `panel_${id}`}
                  onChange={accordianChange(`panel_${id}`)}
                  className="license-accordion"
                  expand={checkExpanded(id)}
                >
                  <AccordionSummary
                    expandIcon={
                      props.licenseFields.length >= 2 && <ExpandMoreIcon />
                    }
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                    <Heading expand={expanded !== `panel_${id}`}>
                      {expanded !== `panel_${id}` && (
                        <i
                          className="bi bi-x-circle circle-icon-position"
                          onClick={() => removeLicenseFormFields(id)}
                        />
                      )}{" "}
                      License {numValue}
                      {field.showWarning && (
                        <Tooltip
                          placement="top-start"
                          arrow
                          title="Please review and make the corrections."
                        >
                          <WarningAmberOutlinedIcon className="WarningAmberOutlinedIconWrapper" />
                        </Tooltip>
                      )}
                    </Heading>
                  </AccordionSummary>
                  <AccordionDetails>
                    {LicenseFormAccordion(id, field)}
                    {props.licenseFields.length >= 2 && (
                      <div className="d-flex justify-content-end">
                        <div
                          className="CancelButton"
                          onClick={() => handleRemoveLicense(id)}
                        >
                          Cancel
                        </div>
                      </div>
                    )}
                  </AccordionDetails>
                </AccordionWrapper>
              ) : (
                <>
                  <Heading>
                    License {numValue}
                    {field.showWarning && (
                      <Tooltip
                        placement="top-start"
                        arrow
                        title="Please review and make the corrections."
                      >
                        <WarningAmberOutlinedIcon className="WarningAmberOutlinedIcon" />
                      </Tooltip>
                    )}
                  </Heading>
                    {LicenseFormAccordion(id, field)}
                </>
              )}
            </div>
          );
        })}
        <div
          className="AddLicenseButton"
          onClick={() => addLicenseFormFields()}
        >
          <i className="bi bi-plus-circle pe-2" />
          <span className="btn-name">Add License</span>
        </div>
      </div>
    </div>
  );
};
export default License;
