import React, { useState, useEffect } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Select,
  FormControlLabel,
  Checkbox,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import InputBox from "../../components/InputBox";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import {
  GET_ZIP_CODE,
  ADD_LOCATION,
  GET_LOCATION,
  UPDATE_LOCATION,
} from "../../networking/httpEndPoints";
import { decodeToken } from "../../utilities/decodeToken";
import dataMappingandCheckLocationForm from "../../components/Location/dataMappingOfZipcode";

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface ZCodeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [
    {
      state: string;
      city: string;
      country: string;
      zipCodeCityMapId: number;
      county: string;
      isCityRegulations: boolean;
      isCountyRegulations: boolean;
    }
  ];
}

interface LocationType {
  activeWizard: string;
  setActiveWizard: any;
  activeStep: number;
  setActiveStep: any;
  setClientName: any;
  organizationLocationId: number;
  setOrganizationLocationId: any;
  setWizardStepCounter: any;
  wizardStepCounter: number;
  cleanInputs: boolean;
  setCleanInputs: any;
  isEditLocation: boolean;
}

interface AddLocationResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface LoginTokenType {
  user: {
    organizationId?: number | null;
  };
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

const Location: React.FC<LocationType> = (props: LocationType) => {
  const userState = useSelector((state: LoginTokenType) => state.user);
  const [locationNickName, setLocationNickName] = useState("");
  const [entityLegalName, setEntityLegalName] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [selectedCityZipMapId, setselectedCityZipMapId] = useState(0);
  const [countyData, setCountyData] = useState<any | null>([]);
  const [cityData, setCityData] = useState<any | null>([]);
  const [citySourceData, setCitySourceData] = useState<[] | null>([]);
  const [state, setState] = useState("");
  const [checkboxDisable, setCheckboxDisable] = useState(true);
  const [checked, setChecked] = useState(false);

  const [locationNickNameError, setLocationNickNameError] = useState(false);
  const [entityLegalNameError, setEntityLegalNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [zipCodeError, setZipCodeError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [countyError, setcountyError] = useState(false);
  const [editChecked, setEditChecked] = useState(false);
  const [editCity, setEditCity] = useState("");
  const [editCounty, setEditCounty] = useState("");
  const [editZipCodeCityMapId, SetEditCityZipCodeMapId] = useState(0);

  const [isEdit, setIsEdit] = useState(false);
  const [editChange, setEditChange] = useState(false);
  const [isCitySingle, setIsCitySingle] = useState(false);
  const [isCountySingle, setIsCountySingle] = useState(false);

  const [locationNickNameErrorText, setLocationNickNameErrorText] = useState(
    "Location name is required"
  );
  const [entityLegalNameErrorText, setEntityLegalNameErrorText] = useState(
    "Legal entity name is required"
  );
  const [addressErrorText, setAddressErrorText] = useState(
    "Address is required"
  );
  const [zipCodeErrorText, setZipCodeErrorText] = useState(
    "Zip code is required"
  );

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (
      props.organizationLocationId === 0 &&
      props.isEditLocation === false
    )
      return;

    const token = localStorage.getItem("user");
    axios
      .get(`${GET_LOCATION}/${props.organizationLocationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res: any) => {
        if (res.status === 200) {
          const data = res.data.result;
          setLocationNickName(data.locationNickName);
          setZipCode(data.zipCode);
          setAddress(data.address);
          setEntityLegalName(data.legalEntityName);
          onZipCodeChange(data.zipCode);
          props.setClientName(data.clientName);
          setCity(data.city);
          setCounty(data.countyName);
          setEditChecked(data.isUnincorporatedArea);
          setChecked(data.isUnincorporatedArea);
          setselectedCityZipMapId(data.zipCodeCityMapId);
          setEditCity(data.city);
          setEditCounty(data.countyName);
          SetEditCityZipCodeMapId(data.zipCodeCityMapId);
          setIsEdit(true);
        }
      });
  }, [isEdit]);

  useEffect(() => {
    if (props.activeWizard === "license") {
      onSubmit();
    }
  }, [props.activeWizard]);

  const validateFields = () => {
    let validate = true;
    if (locationNickName.trim().length === 0) {
      setLocationNickNameError(true);
      setLocationNickNameErrorText("Location name is required");
      validate = false;
    }
    if (locationNickName.trim().length > 150) {
      setLocationNickNameError(true);
      setLocationNickNameErrorText(
        "Location name should be under 100 characters."
      );
      validate = false;
    }
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

  const updateLocation = (token: string) => {
    const userData = decodeToken(token);
    const params = {
      locationNickName: locationNickName.trim(),
      legalEntityName: entityLegalName.trim(),
      address: address.trim(),
      organizationLocationID: props.organizationLocationId,
      userID: userData.UserId,
      zipCode: zipCode.trim(),
      zipCodeCityMapId: selectedCityZipMapId,
      isUnincorporatedArea: checked,
    };
    setShowLoader(true);
    axios
      .put<AddLocationResponse>(UPDATE_LOCATION, params, {
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
          res.status === 200 &&
          !res.data.isSuccess &&
          res.data.result == null
        ) {
          props.setActiveWizard("");
          Swal.fire({
            text:
              res.data.responseMessage || "Please enter a valid location name",
            confirmButtonText: "OK",
            icon: "error",
          });
        } else if (res.data.isSuccess) {
          props.setActiveStep(props.activeStep + 1);
        } else {
          props.setActiveWizard("");
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
  };

  const onSubmit = () => {
    if (validateFields()) {
      const token = localStorage.getItem("user");
      const userData = decodeToken(token);
      const params = {
        locationNickName: locationNickName.trim(),
        legalEntityName: entityLegalName.trim(),
        address: address.trim(),
        zipCode: zipCode.trim(),
        createdBy: userData.UserId,
        zipCodeCityMapId: selectedCityZipMapId,
        isUnincorporatedArea: checked,
      };
      if (token !== null) {
        if (isEdit) {
          updateLocation(token);
          return;
        }
        setShowLoader(true);
        axios
          .post<AddLocationResponse>(ADD_LOCATION, params, {
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
              (res.status === 201 &&
                !res.data.isSuccess &&
                res.data.result == null) ||
              res.data.result === 0
            ) {
              props.setActiveWizard("");
              if (res.data.result === 0) {
                Swal.fire({
                  text: "This location nickname is already present for organization. Please provide another unique location nickname.",
                  confirmButtonText: "OK",
                  icon: "error",
                });
              } else {
                Swal.fire({
                  text:
                    res.data.responseMessage ||
                    "Please enter a valid location name",
                  confirmButtonText: "OK",
                  icon: "error",
                });
              }
            } else if (
              res.status === 201 &&
              res.data.isSuccess &&
              res.data.result != null
            ) {
              props.setOrganizationLocationId(res.data.result);
              props.setActiveStep(props.activeStep + 1);
            } else {
              props.setActiveWizard("");
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
    } else {
      props.setActiveWizard("");
    }
  };

  const dataMappingandCheck = (res: any) => {
    const cityArData: any = [];
    const countyArData: any = [];
    dataMappingandCheckLocationForm(
      res,
      setselectedCityZipMapId,
      setChecked,
      setCheckboxDisable
    );
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
    const uniqueCities = cityArData.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => ["city"].every((k) => t[k] === v[k])) === i
    );
    const uniqueCounties = countyArData.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => ["county"].every((k) => t[k] === v[k])) === i
    );

    setCountyData(uniqueCounties);
    setCitySourceData(uniqueCities);
    if (uniqueCities.length === 1) {
      setCity(uniqueCities[0].city);
      setCityData(uniqueCities);
      setIsCitySingle(true);
    }
    if (uniqueCounties.length === 1) {
      setCounty(uniqueCounties[0].county);
      setCityData(uniqueCities);
      setIsCountySingle(true);
    }
    setState(res[0].state);
    if (isEdit === true && editChange === false) {
      const editedCity = editCity;
      const editedCounty = editCounty;
      setChecked(editChecked);
      setCity(editedCity);
      setCounty(editedCounty);
      setselectedCityZipMapId(editZipCodeCityMapId);
      if (uniqueCities.lenth === 1) {
        setCityData([
          {
            city: city,
            zipCodeCityMapId: selectedCityZipMapId,
            county: county,
          },
        ]);
        setIsCitySingle(true);
      } else {
        const editedCityArray = uniqueCities.find(
          (o: any) => o.city === editedCity
        );
        if (
          editedCityArray.isCityRegulations === true &&
          editedCityArray.isCountyRegulations === true
        ) {
          setCheckboxDisable(false);
        }
        setCityData(uniqueCities);
      }
    }
  };

  const clearCountyCityData = () => {
    setCityData([]);
    setCountyData([]);
    setCity("");
    setCounty("");
    setChecked(false);
    setCityError(false);
    setcountyError(false);
    setEditChecked(false);
    setEditCity("");
    setEditCounty("");
    SetEditCityZipCodeMapId(0);
    setCheckboxDisable(true);
    setIsCitySingle(false);
    setIsCountySingle(false);
  };

  const onZipCodeChange = (zCode: string) => {
    setZipCodeError(false);
    setZipCode(zCode);
    clearCountyCityData();
    setCheckboxDisable(true);

    const token = localStorage.getItem("user");
    if (zCode.length === 5) {
      axios
        .get<ZCodeResponse>(`${GET_ZIP_CODE}${zCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.result.length > 0) {
            dataMappingandCheck(res.data.result);
          } else {
            setZipCodeError(true);
            setZipCodeErrorText(res.data.responseMessage || "Invalid ZipCode");
          }
        })
        .catch(() => {
          setZipCodeError(true);
          setZipCodeErrorText("Something went wrong while fetching a record");
        });
    } else {
      setCity("");
      setState("");
      setselectedCityZipMapId(0);
    }
  };

  const handleCitySelectFieldChange = (e: any) => {
    setCity(e.target.value);
    const cityObj = cityData.find((o: any) => o.city === e.target.value);
    setselectedCityZipMapId(cityObj.zipCodeCityMapId);
    setCityError(false);
    if (
      cityObj.isCountyRegulations === true &&
      cityObj.isCityRegulations === true
    ) {
      setChecked(false);
      setCheckboxDisable(false);
    } else if (
      cityObj.isCountyRegulations === true &&
      cityObj.isCityRegulations === false
    ) {
      setChecked(true);
      setCheckboxDisable(true);
    } else if (
      cityObj.isCountyRegulations === false &&
      cityObj.isCityRegulations === true
    ) {
      setChecked(false);
      setCheckboxDisable(true);
    }
    setCityError(false);
  };

  const handleCountySelectFieldChange = (e: any) => {
    setCounty(e.target.value);
    const countyObj = citySourceData?.filter((o: CityType) => o.county === e.target.value);
    if(countyObj){
      setCity(countyObj[0]["city"]);
      setCityData(countyObj);
      setselectedCityZipMapId(countyObj[0]["zipCodeCityMapId"]);
      setcountyError(false);
      setCityError(false);
      if (
        countyObj[0]["isCountyRegulations"] === true &&
        countyObj[0]["isCityRegulations"] === true
      ) {
        setChecked(false);
        setCheckboxDisable(false);
      } else if (
        countyObj[0]["isCountyRegulations"] === true &&
        countyObj[0]["isCityRegulations"] === false
      ) {
        setChecked(true);
        setCheckboxDisable(true);
      } else if (
        countyObj[0]["isCountyRegulations"] === false &&
        countyObj[0]["isCityRegulations"] === true
      ) {
        setChecked(false);
        setCheckboxDisable(true);
      }
    } else {
      setCity("");
      setcountyError(true);
      setCityError(true);
    }
  };

  const handleCheckboxChange = (e: any) => {
    const value = e.target.checked;
    setChecked(value);
  };
  const handleOnKeyDown = (e: any) => {
    if (e.key === "Enter") {
      return onSubmit();
    }
  };

  const converter = require("number-to-words");
  const counter = props.wizardStepCounter;
  const numValue = converter.toWords(counter);
  const num = numValue.charAt(0).toUpperCase() + numValue.slice(1);
  return (
    <>
      <div className="initial-setup-wrapper form-container">
        <div className="Card">
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={showLoader}
          >
            <CircularProgress />
          </Backdrop>
          <div className="Heading"> Location {num} </div>
          <div className="row">
            <div className="col-sm-6 col-12">
              <InputBox
                error={locationNickNameError}
                helperText={
                  locationNickNameError ? locationNickNameErrorText : ""
                }
                hiddenLabel
                variant="filled"
                className="input-form input-text-overide-width"
                placeholder="Enter location name"
                value={locationNickName}
                onChange={(e: any) => {
                  setLocationNickNameError(false);
                  setLocationNickName(e.target.value);
                }}
                onKeyDown={handleOnKeyDown}
                maxLength={50}
              />
            </div>
            <div className="col-sm-6 col-12">
              <InputBox
                error={entityLegalNameError}
                helperText={
                  entityLegalNameError ? entityLegalNameErrorText : ""
                }
                hiddenLabel
                variant="filled"
                className="input-form input-text-overide-width"
                placeholder="Legal entity name"
                value={entityLegalName}
                onChange={(e: any) => {
                  setEntityLegalNameError(false);
                  setEntityLegalName(e.target.value);
                }}
                onKeyDown={handleOnKeyDown}
                maxLength={150}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6 col-12">
              <InputBox
                error={addressError}
                helperText={addressError ? addressErrorText : ""}
                hiddenLabel
                variant="filled"
                className="input-form input-text-overide-width"
                placeholder="Business address"
                value={address}
                onChange={(e: any) => {
                  setAddressError(false);
                  setAddress(e.target.value);
                }}
                onKeyDown={handleOnKeyDown}
                maxLength={500}
              />
            </div>
            <div className="col-sm-6 col-12">
              <InputBox
                error={zipCodeError}
                helperText={zipCodeError ? zipCodeErrorText : ""}
                hiddenLabel
                variant="filled"
                className="input-form"
                placeholder="Zip"
                value={zipCode}
                onChange={(e: any) => {
                  onZipCodeChange(e.target.value);
                  setEditChange(true);
                }}
                onKeyDown={handleOnKeyDown}
                maxLength={5}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 col-12">
              <InputBox
                hiddenLabel
                disabled
                onChange={() => {
                  //blank function because it is disabled
                }}
                variant="filled"
                className="input-form"
                placeholder="State"
                value={state}
              />
            </div>
            <div className="col-sm-4 col-12">
              <Select
                name="county"
                displayEmpty
                value={county}
                disabled={isCountySingle || false}
                onChange={(e) => {
                  handleCountySelectFieldChange(e);
                }}
                inputProps={{ "aria-label": "Without label" }}
                variant="filled"
                className="input-form select-field"
                IconComponent={CustomExpandMore}
              >
                <MenuItem disabled value="" className="abcdef">
                  <span className="input-placeholder">County</span>
                </MenuItem>
                {countyData.map((type: any) => (
                  <MenuItem key={type.county} value={type.county}>
                    {type.county}
                  </MenuItem>
                ))}
              </Select>
              <div className="ErrorLocation">
                {countyError ? "County is required" : ""}
              </div>
            </div>
            <div className="col-sm-4 col-12">
              <Select
                name="city"
                displayEmpty
                value={city}
                disabled={isCitySingle || false}
                onChange={(e) => {
                  handleCitySelectFieldChange(e);
                }}
                inputProps={{ "aria-label": "Without label" }}
                variant="filled"
                className="input-form select-field"
                IconComponent={CustomExpandMore}
              >
                <MenuItem disabled value="" className="abcdef">
                  <span className="input-placeholder">City</span>
                </MenuItem>
                {cityData.map((type: any) => (
                  <MenuItem key={type.city} value={type.city}>
                    {type.city}
                  </MenuItem>
                ))}
              </Select>
              <div className="ErrorLocation">{cityError ? "City is required" : ""}</div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12 col-12">
              <div className="UnincoratedText">
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={checkboxDisable}
                      checked={checked}
                      onChange={(e) => {
                        handleCheckboxChange(e);
                      }}
                      name="unincorporated"
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
        </div>
      </div>
    </>
  );
};
export default Location;
