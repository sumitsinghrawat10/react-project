import React, { useState, useEffect, useCallback } from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  Select,
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Button from "../../../components/Button";
import InputBox from "../../../components/InputBox";
import SelectBox from "../../../components/SelectBox";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import axios from "axios";
import Swal from "sweetalert2";
import SuccessToaster from "../../../components/SuccessToaster";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  GET_ZIP_CODE,
  ADD_LOCATION,
  GET_LOCATION,
  UPDATE_LOCATION,
} from "../../../networking/httpEndPoints";
import { decodeToken } from "../../../utilities/decodeToken";
import dataMappingandCheckLocationForm from "../../../components/Location/dataMappingOfZipcode";

const useStyles = makeStyles({
  root: {
    "& .MuiFilledInput-root:before": {
      borderBottom: "none!important",
    },
  },
});

function CustomExpandMore({ ...rest }) {
  return <ExpandMoreIcon {...rest} />;
}

interface ZCodeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [
    { state: string; city: string; country: string; zipCodeCityMapId: number }
  ];
}
interface LocationResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface LocationType {
  organizationLocationId: number | null;
  updateLocation?: boolean;
  setUpdateLocation?: any;
  open: boolean;
  setOpen: any;
  getLocationData?: any;
  disabled?: boolean;
  setDisabled?: any;
}

type CityValueType = string | null | undefined;
interface CityType {
  city: CityValueType;
  state: CityValueType;
  country: CityValueType;
  zipCodeCityMapId: CityValueType;
  county: CityValueType;
  isCityRegulations: CityValueType;
  isCountyRegulations: CityValueType;
}

const LocationForm: React.FC<LocationType> = (props: LocationType) => {
  const classes = useStyles();
  const [zipCode, setZipCode] = useState("");
  const [locationNickName, setLocationNickName] = useState("");
  const [entityLegalName, setEntityLegalName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [county, setCounty] = useState("");
  const [selectedCityZipMapId, setselectedCityZipMapId] = useState(0);
  const [countyData, setCountyData] = useState<any | null>([]);
  const [cityData, setCityData] = useState<any | null>([]);
  const [citySourceData, setCitySourceData] = useState<[] | null>([]);
  const [checkboxDisable, setCheckboxDisable] = useState(true);
  const [checked, setChecked] = useState(false);

  const [locationNickNameError, setLocationNickNameError] = useState(false);
  const [entityLegalNameError, setEntityLegalNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [zipCodeError, setZipCodeError] = useState(false);
  const [zipCodeErrorText, setZipCodeErrorText] = useState(
    "Zip code is required"
  );
  const [locationNickNameErrorText, setLocationNickNameErrorText] = useState(
    "Location name is required"
  );
  const [addressErrorText, setAddressErrorText] = useState(
    "Address is required"
  );
  const [entityLegalNameErrorText, setEntityLegalNameErrorText] = useState(
    "Legal entity name is required"
  );
  const [isEdit, setIsEdit] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [countyError, setcountyError] = useState(false);
  const [editChecked, setEditChecked] = useState(false);
  const [editCity, setEditCity] = useState("");
  const [editCounty, setEditCounty] = useState("");
  const [editZipCodeCityMapId, SetEditCityZipCodeMapId] = useState(0);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [confirmationEditModalIsVisible, setConfirmationEditModalIsVisible] =
    useState(false);
  const [isDisabledCityCounty, setIsDisabledCityCounty] = useState(true);

  const handleCancel = () => {
    if (isEdit) {
      SetError();
    } else {
      // Reset the location form and hide the error lines upon clicking of add location button
      props.setOpen(false);
      setLocationNickName("");
      setLocationNickNameError(false);
      setEntityLegalName("");
      setEntityLegalNameError(false);
      setAddress("");
      setAddressError(false);
      setState("");
      setCity("");
      setCountry("");
      setcountyError(false);
      setZipCode("");
      setZipCodeError(false);
      setCounty("");
      setCityError(false);
      setCountyData([]);
      setCityData([]);
      setChecked(false);
    }
    setIsDisabledCityCounty(true);
  };

  const SetError = () => {
    props.setOpen(false);
    setLocationNickName("");
    setLocationNickNameError(false);
    setEntityLegalName("");
    setEntityLegalNameError(false);
    setAddress("");
    setAddressError(false);
    setState("");
    setCity("");
    setCountry("");
    setcountyError(false);
    setZipCode("");
    setZipCodeError(false);
    setCounty("");
    setCityError(false);
    setCountyData([]);
    setCityData([]);
    setChecked(false);
  };

  const token = localStorage.getItem("user");

  const dataMappingandCheck = (res: any) => {
    const cityArData: any = [];
    const countyArData: any = [];
    CheckingResLength(res);
    res.map((object: any) => {
      cityArData.push({
        ...cityData,
        city: object.city,
        zipCodeCityMapId: object.zipCodeCityMapId,
        isCityRegulations: object.isCityRegulations,
        isCountyRegulations: object.isCountyRegulations,
        county: object.county,
      });
      countyArData.push({
        ...countyData,
        county: object.county,
        zipCodeCityMapId: object.zipCodeCityMapId,
        isCityRegulations: object.isCityRegulations,
        isCountyRegulations: object.isCountyRegulations,
        city: object.city,
      });
    });
    SetCountryCityStateData(res, cityArData, countyArData);
  };

  const CheckingResLength = (res: any) => {
    dataMappingandCheckLocationForm(
      res,
      setselectedCityZipMapId,
      setChecked,
      setCheckboxDisable
    );
  };

  const SetCountryCityStateData = (
    res: any,
    cityArData: any,
    countyArData: any
  ) => {
    const uniqueCities = cityArData.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => ["city"].every((k) => t[k] === v[k])) === i
    );
    const uniqueCounties = countyArData.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => ["county"].every((k) => t[k] === v[k])) === i
    );
    setCitySourceData(uniqueCities);
    setCountyData(uniqueCounties);
    if (uniqueCounties.length === 1) {
      setCounty(uniqueCounties[0].county);
      setCityData(uniqueCities);
    }
    if (uniqueCities.length === 1) {
      setCity(uniqueCities[0].city);
      setCityData(uniqueCities);
    }
    setState(res[0].state);
    if (isEdit) {
      SetCityDetail();
    }
    setIsDisabledCityCounty(false);
  };

  const SetCityDetail = () => {
    setCityCountyCheckedZipId();
    setCityData([
      {
        city: city,
        zipCodeCityMapId: selectedCityZipMapId,
        county: county,
      },
    ]);
    setCountyData([
      {
        city: county,
        zipCodeCityMapId: selectedCityZipMapId,
        county: county,
      },
    ]);
    setCheckboxDisable(true);
  };

  const setCityCountyCheckedZipId = () => {
    const editedCity = editCity;
    const editedCounty = editCounty;
    setChecked(editChecked);
    setCity(editedCity);
    setCounty(editedCounty);
    setselectedCityZipMapId(editZipCodeCityMapId);
  };

  const clearCountyCityData = () => {
    setCityData([]);
    setCountyData([]);
    setCity("");
    setCounty("");
    setChecked(false);
    setState("");
    setCityError(false);
    setcountyError(false);
    setCheckboxDisable(true);
  };

  const onZipCodeChange = useCallback(
    (zCode: string) => {
      setZipCodeError(false);
      setZipCode(zCode);
      clearCountyCityData();
      setCheckboxDisable(true);
      if (zCode.length === 5) {
        axios
          .get<ZCodeResponse>(`${GET_ZIP_CODE}${zCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setShowLoader(false);
            GetZipCodeResponse(res);
          })
          .catch(() => {
            setShowLoader(false);
            setZipCodeError(true);
            setZipCodeErrorText("Something went wrong while fetching a record");
          });
      } else {
        setCityCityZipMapIdStateData();
      }
    },
    [token]
  );

  const GetZipCodeResponse = (res: any) => {
    if (res.data.result.length > 0) {
      dataMappingandCheck(res.data.result);
    } else {
      setZipCodeError(true);
      setZipCodeErrorText(res.data.responseMessage || "Invalid ZipCode");
    }
  };

  const setCityCityZipMapIdStateData = () => {
    setCity("");
    setState("");
    setselectedCityZipMapId(0);
    setIsDisabledCityCounty(true);
  };

  useEffect(() => {
    if (
      props.organizationLocationId === null ||
      props.organizationLocationId === 0
    )
      return;
    if (props.open === true) {
      setIsEdit(true);
      setShowLoader(true);
      axios
        .get(`${GET_LOCATION}/${props.organizationLocationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res: any) => {
          LocationGetResponse(res);
        });
    }
  }, [props.open]);

  const LocationGetResponse = (res: any) => {
    const data = res.data.result;
    props.setDisabled(true);
    if (res.status === 200) {
      SetLocationData(res);
      setCountyData([
        {
          city: data.city,
          zipCodeCityMapId: data.zipCodeCityMapId,
          county: data.county,
        },
      ]);
      setCheckboxDisable(true);
    } else {
      Swal.fire({
        text: "Something went wrong while fetching details",
        confirmButtonText: "OK",
        icon: "error",
      });
    }
  };

  const SetLocationData = (res: any) => {
    const data = res.data.result;
    setLocationNickName(data.locationNickName);
    setZipCode(data.zipCode);
    setAddress(data.address);
    setEntityLegalName(data.legalEntityName);
    onZipCodeChange(data.zipCode);
    setChecked(data.isUnincorporatedArea);
    setCity(data.city);
    setCounty(data.countyName);
    setEditChecked(data.isUnincorporatedArea);
    setChecked(data.isUnincorporatedArea);
    setselectedCityZipMapId(data.zipCodeCityMapId);
    setEditCity(data.city);
    setEditCounty(data.countyName);
    SetEditCityZipCodeMapId(data.zipCodeCityMapId);
    setCityData([
      {
        city: data.city,
        zipCodeCityMapId: data.zipCodeCityMapId,
        county: data.county,
      },
    ]);
  };

  const validateFields = () => {
    let validate = true;
    validate = validateName(validate);
    validate = validateAddress(validate);
    validate = validateZipCode(validate);
    if (city.trim().length === 0) {
      setCityError(true);
      validate = false;
    }
    if (county.trim().length === 0) {
      setcountyError(true);
      validate = false;
    }
    return validate;
  };

  const validateZipCode = (validateZ: boolean) => {
    let validate = validateZ;
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
    return validate;
  };

  const validateAddress = (validateAdd: boolean) => {
    let validate = validateAdd;
    if (address.trim().length === 0) {
      setAddressError(true);
      setAddressErrorText("Address is required");
      validate = false;
    }
    if (address.trim().length > 500) {
      setAddressError(true);
      setAddressErrorText("Address should be under 500 characters");
      validate = false;
    }
    return validate;
  };

  const validateName = (validateN: boolean) => {
    let validate = validateN;
    if (locationNickName.trim().length === 0) {
      setLocationNickNameError(true);
      setLocationNickNameErrorText("Location name is required");
      validate = false;
    }
    if (locationNickName.trim().length > 150) {
      setLocationNickNameError(true);
      setLocationNickNameErrorText(
        "Location name should be under 100 characters"
      );
      validate = false;
    }
    validate = validateEntityName(validate);
    return validate;
  };

  const validateEntityName = (validate: boolean) => {
    if (entityLegalName.trim().length === 0) {
      setEntityLegalNameError(true);
      setEntityLegalNameErrorText("Legal entity name is required");
      validate = false;
    }
    if (entityLegalName.trim().length > 150) {
      setEntityLegalNameError(true);
      setEntityLegalNameErrorText(
        "Legal entity name should be under 100 characters"
      );
      validate = false;
    }
    return validate;
  };

  const submitLocationForm = () => {
    if (validateFields()) {
      const params = {
        locationNickName: locationNickName.trim(),
        legalEntityName: entityLegalName.trim(),
        address: address.trim(),
        zipCode: zipCode.trim(),
        zipCodeCityMapId: selectedCityZipMapId,
        isUnincorporatedArea: checked,
      };
      setShowLoader(true);
      axios
        .post<LocationResponse>(ADD_LOCATION, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          PostLocationResponse(res);
          return true;
        });
    }
  };

  const PostLocationResponse = (res: any) => {
    setShowLoader(false);
    if (
      res.data.isSuccess === false &&
      res.data.responseMessage ===
      "This location name is already present for this organization. Please provide another unique location name."
    ) {
      setLocationNickNameError(true);
      setLocationNickNameErrorText(res.data.responseMessage);
    } else if (res.data.isSuccess === false) {
      Swal.fire({
        text: "Something went wrong!",
        confirmButtonText: "OK",
        icon: "error",
      });
      handleCancel();
      props.getLocationData();
    } else {
      setConfirmationModalIsVisible(true);
      setTimeout(() => {
        setConfirmationModalIsVisible(false);
      }, 3000);
      handleCancel();
      props.getLocationData();
    }
  };

  const updateLocationForm = () => {
    if (validateFields()) {
      const userData = decodeToken(token);
      const params = {
        locationNickName: locationNickName,
        legalEntityName: entityLegalName,
        address: address,
        organizationLocationID: props.organizationLocationId,
        userID: userData.UserId,
        zipCode: zipCode,
        zipCodeCityMapId: selectedCityZipMapId,
        isUnincorporatedArea: checked,
      };
      setShowLoader(true);
      axios
        .put<LocationResponse>(UPDATE_LOCATION, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          HandlePullLocationResponse(res);
          return true;
        })
        .catch(() => setShowLoader(false));
    }
  };

  const HandlePullLocationResponse = (res: any) => {
    setShowLoader(false);
    if (res.data.isSuccess === false) {
      setLocationNickNameError(true);
      setLocationNickNameErrorText(
        "This location name is already present for this organization. Please provide another unique location name"
      );
    } else {
      setConfirmationEditModalIsVisible(true);
      setTimeout(() => {
        setConfirmationEditModalIsVisible(false);
      }, 3000);
      handleCancel();
      props.setUpdateLocation(!props.updateLocation);
    }
  };

  const handleCitySelectFieldChange = (e: any) => {
    setCity(e.target.value);
    const cityObj = cityData.find((o: any) => o.city === e.target.value);
    setselectedCityZipMapId(cityObj.zipCodeCityMapId);
    setCityError(false);
    if (
      cityObj.isCountyRegulations === true &&
      cityObj.isCityRegulations === false
    ) {
      setChecked(true);
      setCheckboxDisable(true);
    } else if (
      cityObj.isCountyRegulations === true &&
      cityObj.isCityRegulations === true
    ) {
      setChecked(false);
      setCheckboxDisable(false);
    } else if (
      cityObj.isCountyRegulations === false &&
      cityObj.isCityRegulations === true
    ) {
      setCheckboxDisable(true);
      setChecked(false);
    } else {
      setCheckboxDisable(true);
      setChecked(true);
    }
  };

  const handleCountySelectFieldChange = (e: any) => {
    setCounty(e.target.value);
    const countyObj = citySourceData?.filter((o: CityType) => o.county === e.target.value);
    if (countyObj) {
      setCity(countyObj[0]["city"]);
      setCityData(countyObj);
      setcountyError(false);
      setCityError(false);
      setselectedCityZipMapId(countyObj[0]["zipCodeCityMapId"]);
      if (
        countyObj[0]["isCountyRegulations"] === true &&
        countyObj[0]["isCityRegulations"] === false
      ) {
        setChecked(true);
        setCheckboxDisable(true);
      } else if (
        countyObj[0]["isCountyRegulations"] === true &&
        countyObj[0]["isCityRegulations"] === true
      ) {
        setChecked(false);
        setCheckboxDisable(false);
      } else if (
        countyObj[0]["isCountyRegulations"] === false &&
        countyObj[0]["isCityRegulations"] === true
      ) {
        setCheckboxDisable(true);
        setChecked(false);
      } else {
        setCheckboxDisable(true);
        setChecked(true);
      }
    } else {
      setcountyError(true);
      setCityError(true);
      setCity("");
    }
  };

  const handleCheckboxChange = (e: any) => {
    const value = e.target.checked;
    setChecked(value);
  };
  const handleLocationNameChange = (e: any) => {
    setLocationNickNameError(false);
    setLocationNickName(e.target.value);
    props.setDisabled(false);
  };
  const handleEntityNameChange = (e: any) => {
    setEntityLegalNameError(false);
    setEntityLegalName(e.target.value);
    props.setDisabled(false);
  };
  const handleAddressChange = (e: any) => {
    setAddressError(false);
    setAddress(e.target.value);
    props.setDisabled(false);
  };
  const handleZipCodeChange = (e: any) => {
    onZipCodeChange(e.target.value);
  };

  return (
    <>
      <Dialog
        open={props.open}
        keepMounted
        className="p-4 location-container form-container"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            maxHeight: 800,
          },
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>

        <div className="CloseDialog">
          <button
            onClick={handleCancel}
            className="btn-close btn-sm close-assign-license float-right"
          ></button>
        </div>
        <DialogContent id="alert-dialog-description">
          <DialogContentText id="alert-dialog-title" className="DialogTopTitle">
            {isEdit ? "Edit location" : "Add a Location "}
          </DialogContentText>
          <div className="row">
            <div className="col-12 col-sm-12 mt-2">
              <InputBox
                error={locationNickNameError}
                helperText={
                  locationNickNameError ? locationNickNameErrorText : ""
                }
                hiddenLabel
                variant="filled"
                className={`input-form form-control form-field ${classes.root}`}
                placeholder="Enter location name"
                ariaLabel="Location name"
                value={locationNickName}
                onChange={handleLocationNameChange}
                maxLength={150}
              />
            </div>

            <div className="col-12 mt-4">
              <InputBox
                error={entityLegalNameError}
                helperText={
                  entityLegalNameError ? entityLegalNameErrorText : ""
                }
                hiddenLabel
                variant="filled"
                className={`input-form form-control form-field ${classes.root}`}
                placeholder="Legal entity name"
                type="text"
                value={entityLegalName}
                onChange={handleEntityNameChange}
                maxLength={150}
                ariaLabel="Legal entity name"
              />
            </div>

            <div className="col-8 my-4">
              <InputBox
                error={addressError}
                helperText={addressError ? addressErrorText : ""}
                hiddenLabel
                variant="filled"
                className={`input-form form-field form-control ${classes.root}`}
                placeholder="Location address"
                type="text"
                value={address}
                onChange={handleAddressChange}
                maxLength={500}
                ariaLabel="Location address"
              />
            </div>
            <div className="col-4 my-4">
              <InputBox
                error={zipCodeError}
                helperText={zipCodeError ? zipCodeErrorText : ""}
                hiddenLabel
                variant="filled"
                className={`input-form form-field form-control ${classes.root}`}
                placeholder="Zip Code"
                type="text"
                value={zipCode}
                onChange={handleZipCodeChange}
                maxLength={5}
                disabled={isEdit}
                ariaLabel="Zip Code"
              />
            </div>
            <div className="col-sm-4">
              <Select
                style={{
                  fontSize: 16,
                  backgroundColor: "#f4f5f8",
                  width: "100%",
                }}
                defaultValue=""
                name="organizationLocationId"
                disabled
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                variant="filled"
                value={state}
                className={`input-form select-field disabled-select-state ${classes.root}`}
                IconComponent={CustomExpandMore}
              >
                {state.length > 0 ? (
                  <MenuItem value={state} selected>
                    {state}
                  </MenuItem>
                ) : (
                  <MenuItem disabled value="">
                    State
                  </MenuItem>
                )}
              </Select>
            </div>
            <div className="col-sm-4 ">
              <SelectBox
                name="county"
                displayEmpty
                disabled={isEdit || isDisabledCityCounty}
                value={county}
                onChange={handleCountySelectFieldChange}
                className={`input-form select-field  ${classes.root}`}
                ListData={countyData}
                placeHolder="County"
                itemName="county"
                error={countyError}
                errorText="County is required"
              />
            </div>

            <div className="col-sm-4 ">
              <SelectBox
                name="city"
                displayEmpty
                disabled={isEdit || isDisabledCityCounty}
                value={city}
                onChange={handleCitySelectFieldChange}
                className={`input-form select-field ${classes.root}`}
                ListData={cityData}
                placeHolder="City"
                itemName="city"
                error={cityError}
                errorText="City is required"
              />
            </div>
            <div className="row">
              <div className="col-sm-12 col-12">
                <div className="UnincoratedText">
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={isEdit || checkboxDisable}
                        checked={checked || editChecked}
                        onChange={(e) => {
                          handleCheckboxChange(e);
                        }}
                        name="unincorporated"
                        aria-label="unincorporated"
                      />
                    }
                    label={
                      <span
                        style={{
                          fontSize: "16px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Reside within an Unincorporated part of County?
                      </span>
                    }
                    labelPlacement="start"
                  />
                </div>
              </div>
            </div>
            <div
              className="text-right col-sm-12 d-flex"
              style={{ justifyContent: "right" }}
            >
              {isEdit ? (
                <Button
                  intent="primary"
                  className="mb-3 mt-5 next-btn EditLocation"
                  type="contained"
                  text="Save"
                  onClick={() => {
                    updateLocationForm();
                  }}
                  disabled={props.disabled}
                />
              ) : (
                <Button
                  intent="primary"
                  className="btn-submit-location"
                  type="contained"
                  text="Submit"
                  onClick={() => {
                    submitLocationForm();
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Location Successfully Added" />
      )}
      {confirmationEditModalIsVisible && (
        <SuccessToaster message="Location Edited Successfully" />
      )}
    </>
  );
};

export default LocationForm;
