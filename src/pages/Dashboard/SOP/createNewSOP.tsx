import React, { useState, useEffect } from "react";
import AddTooltip from "../../../components/AddTooltip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TextField, MenuItem, Select } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import RadioGroup from "@mui/material/RadioGroup";
import axios from "axios";
import lodsh from "lodash";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

import Button from "../../../components/Button";
import Loader from "../../../components/Loader";
import TextBox from "../../../components/TextBox";
import { GetResponse } from "../../../model/model";
import {
  GET_LICENSE_TYPE,
  GET_ALL_CATEGORIES,
  GET_ALL_LOCATIONS,
  CREATE_METADATA,
  UPDATE_SOP_METADATA,
  GET_SOP_METADATA,
} from "../../../networking/httpEndPoints";
import historyVaribaleChecker from "../../../utilities/historyVariableChecker";
import keyValueMapper from "../../../utilities/keyValueMapper";
const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

const CreateNewSOP: React.FC = () => {
  const history = useHistory();
  const [sopLevel, setSopLevel] = useState("");
  const [sopTitle, setSopTitle] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [category, setCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [licenseTypeIds, setlicenseTypeIds] = React.useState<any[]>([
    { name: "", id: 0 },
  ]);
  const [locationData, setLocationData] = useState([
    { state: "", counties: [{ cities: [] }] },
  ]);
  const [categories, setCategories] = useState([]);
  const [categoriesToShow, setCategoriesToShow] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [countyData, setCountyData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [cityValue, setCityValue] = useState("");
  const [countyValue, setCountyValue] = useState("");
  const [stateKey, setStateKey] = useState(lodsh.uniqueId("state"));
  const [countyKey, setCountyKey] = useState(lodsh.uniqueId("county"));
  const [cityKey, setCityKey] = useState(lodsh.uniqueId("city"));
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [licenseName, setLicenseName] = useState("");

  const isBack = history.location.state ? history.location.state.isBack : false;
  const sopId = historyVaribaleChecker("sopId", history);
  const [sopLevelError, setSopLevelError] = useState(false);
  const [sopTitleError, setSopTitleError] = useState(false);
  const [sopStateError, setSopStateError] = useState(false);
  const [sopCountyError, setSopCountyError] = useState(false);
  const [sopCityError, setSopCityError] = useState(false);
  const [licenseTypeError, setLicenseTypeError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [CategoryCheckBox, setCategoryCheckBox] = useState(false);
  const [SopTitleDisable, setSopTitleDisable] = useState(false);
  const token = localStorage.getItem("user");
  
  useEffect(() => {
    if (!isBack) {
      setLoading(true);
      axios
        .all([
          axios.get(GET_LICENSE_TYPE, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get(GET_ALL_CATEGORIES, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get(GET_ALL_LOCATIONS, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
        ])
        .then(
          axios.spread(
            (
              licenseTypeIdResp: any,
              sopCategoriesResp: any,
              allLocationResp: any
            ) => {
              setLoading(false);
              if (licenseTypeIdResp.status === 200) {
                const tdata = licenseTypeIdResp.data.data;
                const data = keyValueMapper(tdata);
                setlicenseTypeIds(data);
              }
              if (sopCategoriesResp.status === 200) {
                setCategories(sopCategoriesResp.data.result);
              }
              if (allLocationResp.status === 200) {
                setLocationData(allLocationResp.data.result);
              }
            }
          )
        )
        .catch(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (isBack) {
      let tempLicenseType: any;
      let tempCategories: any;
      let tempLocations: any;
      setLoading(true);
      axios
        .all([
          axios.get(GET_LICENSE_TYPE, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get(GET_ALL_CATEGORIES, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get(GET_ALL_LOCATIONS, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get(`${GET_SOP_METADATA}?SopId=${sopId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
        ])
        .then(
          axios.spread(
            (
              licenseTypeIdResp: any,
              sopCategoriesResp: any,
              allLocationResp: any,
              metaDataResp: any
            ) => {
              setLoading(false);
              if (licenseTypeIdResp.status === 200) {
                const tdata = licenseTypeIdResp.data.data;
                const data = keyValueMapper(tdata);
                setlicenseTypeIds(data);
                tempLicenseType = data;
              }
              if (sopCategoriesResp.status === 200) {
                setCategories(sopCategoriesResp.data.result);
                tempCategories = sopCategoriesResp.data.result;
              }
              if (allLocationResp.status === 200) {
                setLocationData(allLocationResp.data.result);
                tempLocations = allLocationResp.data.result;
              }
              if (metaDataResp.status === 200) {
                const respData = metaDataResp.data.result;
                setSopTitle(respData.sopTitle);
                setSopLevel(respData.sopLevel);
                setSelectedState(respData.sopState);
                setCounty(respData.sopCounty);
                setCity(respData.sopCity);
                setLicenseType(respData.sopLicenceTypeId);

                const licenseFiltered: any = tempLicenseType.filter(
                  (licenc: any) =>
                    licenc.id === String(respData.sopLicenceTypeId)
                );

                setLicenseName(licenseFiltered[0].name);

                const filteredCategories = tempCategories.filter(
                  (categry: any) =>
                    categry.licenseTypeId === respData.sopLicenceTypeId
                );
                setCategoriesToShow(filteredCategories);

                handleStateData(respData.sopState);

                setCategory(respData.sopCategoryId);
                const filteredCategoryOnBack = tempCategories.filter(
                  (categry: any) =>
                    categry.categoryId === respData.sopCategoryId
                );
                setSelectedCategoryName(filteredCategoryOnBack[0].categoryName);

                const tempStateData = tempLocations.filter((obj: any) => {
                  if (
                    obj.state != null &&
                    obj.state
                      .toUpperCase()
                      .includes(respData.sopState.toUpperCase().trim()) &&
                    String(obj.state.toUpperCase()).startsWith(
                      respData.sopState.trim().toUpperCase()
                    )
                  ) {
                    return true;
                  }
                });
                const statesTemp: any = tempStateData.map(
                  (val: any) => val.state
                );

                setStateData(statesTemp);

                const stateIndex = tempLocations.findIndex(
                  (x: any) => x.state === respData.sopState
                );

                const countLocationIndex: any =
                  tempLocations[stateIndex].counties;

                const tempCountyData = countLocationIndex.filter((obj: any) => {
                  if (
                    obj.county != null &&
                    obj.county
                      .toUpperCase()
                      .includes(respData.sopCounty.toUpperCase().trim()) &&
                    String(obj.county.toUpperCase()).startsWith(
                      respData.sopCounty.trim().toUpperCase()
                    )
                  ) {
                    return true;
                  }
                });
                const countyTemp: any = tempCountyData.map(
                  (val: any) => val.county
                );

                setCountyData(countyTemp);
                setCountyValue(respData.sopCounty);
                setCityValue(respData.sopCity);

                handleChangeCity(respData.sopCity);
              }
            }
          )
        )
        .catch(() => setLoading(false));
    }
  }, []);

  const errorChecker = (param: boolean, ErrorMessage: string) => {
    if (param === true) {
      return (
        <span className="ErrorWrapper">{`${ErrorMessage} is required`}</span>
      );
    }
  };
  const handleChangeState = (value: any) => {
    if (value.length > 2) {
      handleStateData(value);
    } else if (value.length === 0) {
      setSelectedState("");
      setStateKey(lodsh.uniqueId("state"));
      setCountyKey(lodsh.uniqueId("county"));
      setCityKey(lodsh.uniqueId("city"));
    }
  };
  const handleStateData = (data: string) => {
    const tempStateData = locationData.filter((obj: any) => {
      if (
        obj.state != null &&
        obj.state.toUpperCase().includes(data.toUpperCase().trim()) &&
        String(obj.state.toUpperCase()).startsWith(data.trim().toUpperCase())
      ) {
        return true;
      }
    });
    const statesTemp: any = tempStateData.map((val: any) => val.state);

    setStateData(statesTemp);
  };

  const handleStateChange = (_e: React.SyntheticEvent, value: string) => {
    setSelectedState(value);
  };

  const handleChangeCounty = (value: any) => {
    if (selectedState.length > 0 && value.length > 2) {
      const stateIndex = locationData.findIndex(
        (x: any) => x.state === selectedState
      );

      const countLocationIndex: any = locationData[stateIndex].counties;

      const tempCountyData = countLocationIndex.filter((obj: any) => {
        if (
          obj.county != null &&
          obj.county.toUpperCase().includes(value.toUpperCase().trim()) &&
          String(obj.county.toUpperCase()).startsWith(
            value.trim().toUpperCase()
          )
        ) {
          return true;
        }
      });
      const countyTemp: any = tempCountyData.map((val: any) => val.county);

      setCountyData(countyTemp);
    } else if (value.length === 0) {
      setCity("");
      setCounty("");
      setCountyKey(lodsh.uniqueId("county"));
      setCityKey(lodsh.uniqueId("city"));
    }
  };

  const handleCountyChange = (_e: React.SyntheticEvent, value: string) => {
    setCounty(value);
    setCountyValue(value);
  };
  const handleChangeCity = (value: any) => {
    if (selectedState.length > 0 && county.length > 0 && value.length > 2) {
      const stateIndex = locationData.findIndex(
        (x: any) => x.state === selectedState
      );
      const countyIndex = locationData[stateIndex].counties.findIndex(
        (x: any) => x.county === county
      );
      const countyIndexData: any =
        locationData[stateIndex].counties[countyIndex].cities;
      const tempCityData = countyIndexData.filter((obj: any) => {
        if (
          obj.city != null &&
          obj.city.toUpperCase().includes(value.toUpperCase().trim()) &&
          String(obj.city.toUpperCase()).startsWith(value.trim().toUpperCase())
        ) {
          return true;
        }
      });
      const cityTemp: any = tempCityData.map((val: any) => val.city);
      setCityData(cityTemp);
    } else if (value.length === 0) {
      setCity("");
      setCityKey(lodsh.uniqueId("city"));
    }
  };

  const handleCityChange = (_e: React.SyntheticEvent, value: string) => {
    setCity(value);
    setCityValue(value);
  };
  const handleLicenseChange = (val: any) => {
    setSopTitle("");
    setNewCategory("");
    setCategoryCheckBox(false);
    setShowAddCategory(false);
    setCategory("");
    setLicenseType(val);
    const licenseId = val;

    const licenseFiltered: any = licenseTypeIds.filter(
      (licenc: any) => licenc.id === String(val)
    );

    setLicenseName(licenseFiltered[0].name);

    const filteredCategories = categories.filter(
      (categry: any) => categry.licenseTypeId === parseInt(licenseId)
    );

    setCategoriesToShow(filteredCategories);
  };
  const handleCategoryChange = (e: any) => {
    const categoryId = parseInt(e.target.value);
    setCategory(e.target.value);
    const filteredCategory: any = categories.filter(
      (categry: any) => categry.categoryId === categoryId
    );

    setSelectedCategoryName(filteredCategory[0].categoryName);
    setCategoryCheckBox(true);
    setSopTitleDisable(true);
    setSopTitleError(false);
    setSopTitle(filteredCategory[0].categoryName);
  };
  const handleTitleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryCheckBox(event.target.checked);
    if (event.target.checked === true && !showAddCategory) {
      setSopTitleDisable(true);
      setSopTitleError(false);
      setSopTitle(selectedCategoryName);
    } else if (showAddCategory && event.target.checked === true) {
      setSopTitle(newCategory);
      setSopTitleDisable(true);
      setSopTitleError(false);
    } else {
      setSopTitleDisable(false);
    }
  };

  const validateFields = () => {
    let error = false;
    if (showAddCategory && newCategory.length === 0) {
      setNewCategoryError(true);
      error = true;
    } else if (!showAddCategory && category.length === 0) {
      setCategoryError(true);
    }
    if (sopLevel.length === 0) {
      setSopLevelError(true);
      error = true;
    }
    if (sopTitle.length === 0) {
      setSopTitleError(true);
      error = true;
    }
    if (selectedState.length === 0) {
      setSopStateError(true);
      error = true;
    }
    if (city.length === 0) {
      setSopCityError(true);
      error = true;
    }
    if (county.length === 0) {
      setSopCountyError(true);
      error = true;
    }
    if (licenseType.length === 0) {
      setLicenseTypeError(true);
      error = true;
    }
    if (error) {
      return false;
    } else {
      return true;
    }
  };

  const moveToSopBadging = (res: any) => {
    if (isBack) {
      history.push("/chorus-sop", {
        sopId: sopId,
        sopLevel: sopLevel,
        sopTitle: sopTitle,
        state: selectedState,
        county: county,
        city: city,
        licenseTypeId: licenseType,
        categoryId: category,
        category: selectedCategoryName,
        licenseName: licenseName,
        newCategory: newCategory,
      });
    } else {
      history.push("/chorus-sop", {
        sopId: res.data.result.sopId,
        sopLevel: sopLevel,
        sopTitle: sopTitle,
        state: selectedState,
        county: county,
        city: city,
        licenseTypeId: licenseType,
        categoryId: category,
        category: selectedCategoryName,
        licenseName: licenseName,
        newCategory: newCategory,
        revisionId: res.data.result.revisionId,
      });
    }
  };
  const submitCreteSOP = () => {
    const validationResp = validateFields();

    if (token !== null && validationResp) {
      let submitUrl = CREATE_METADATA;
      let params;
      if (isBack) {
        submitUrl = UPDATE_SOP_METADATA;
        params = {
          sopId: sopId,
          SopLevel: sopLevel,
          SopTitle: sopTitle.trim(),
          State: selectedState,
          County: county,
          City: city,
          LicenseTypeId: licenseType,
          CategoryId: category || 0,
          Category: newCategory,
        };
      } else {
        params = {
          SopLevel: sopLevel,
          SopTitle: sopTitle.trim(),
          State: selectedState,
          County: county,
          City: city,
          LicenseTypeId: licenseType,
          CategoryId: category || 0,
          Category: newCategory,
        };
      }
      setLoading(true);

      axios
        .post<GetResponse>(submitUrl, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setLoading(false);
          if (res.status === 201 && res.data.isSuccess) {
            moveToSopBadging(res);
          } else if (res.status === 201 && !res.data.isSuccess) {
            Swal.fire({
              text: res.data.responseMessage,
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
        .catch(() => setLoading(false));
    }
  };

  return (
    <div className="container sop-dashboard-container form-container">
      <div className="d-flex">
        <div className="page-title">Create New SOP</div>
      </div>
      {loading && <Loader />}

      <>
        <h4 className="SubHeading">Add new SOP details</h4>
        <div className="row  mt-4">
          <div className="col-sm-3">
            <FormLabel
              id="sopLevel-label"
              sx={{
                color: "#001e46",
                fontSize: "16px",
              }}
            >
              Select SOP level
            </FormLabel>

            <RadioGroup
              name="radio-buttons-answers"
              aria-labelledby="sopLevel-label"
              value={sopLevel}
              onChange={(e) => {
                setSopLevelError(false);
                setSopLevel(e.target.value);
              }}
              row
            >
              <FormControlLabel
                value="county"
                control={<Radio />}
                label="County"
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 15,
                  },
                  fontWeight: 0,
                }}
              />
              <FormControlLabel
                value="city"
                control={<Radio />}
                label="City"
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 15,
                  },
                }}
              />
            </RadioGroup>
            {errorChecker(sopLevelError, "SOP Level")}
          </div>
          <div className="col-sm-3">
            <FormLabel
              id="SopState-1"
              sx={{
                color: "#001e46",
                fontSize: "16px",
              }}
            >
              Enter State
            </FormLabel>
            <div className="mt-3">
              <Autocomplete
                freeSolo
                id="SopState"
                key={stateKey}
                disableClearable
                options={stateData}
                onChange={handleStateChange}
                value={selectedState}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      width: 600,
                      height: 50,
                      backgroundColor: "#F9F9F9",
                    }}                    
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      style: {
                        fontSize: 16,
                      },
                    }}
                    variant="standard"
                    className="input-form"
                    onChange={(e: any) => {
                      handleChangeState(e.target.value);
                      setSopStateError(false);
                      if (e.target.value.length < 3) {
                        setCity("");
                        setCounty("");
                        setStateData([]);
                        setCountyData([]);
                        setCityData([]);
                        setCountyValue("");
                        setCityValue("");
                      }
                    }}
                  />
                )}
              />
            </div>
            {errorChecker(sopStateError, "State")}
          </div>
          <div className="col-sm-3">
            <FormLabel
              id="SopCounty-1"
              sx={{
                color: "#001e46",
                fontSize: "16px",
              }}
            >
              Enter County
            </FormLabel>
            <div className="mt-3">
              <Autocomplete
                freeSolo
                id="sopCounty"
                key={countyKey}
                inputValue={countyValue}
                disableClearable
                options={countyData}
                onChange={handleCountyChange}
                value={county}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      width: 300,
                      height: 50,
                      backgroundColor: "#F9F9F9",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      style: {
                        fontSize: 16,
                      },
                    }}
                    variant="standard"
                    className="input-form"
                    onChange={(e: any) => {
                      handleChangeCounty(e.target.value);
                      setSopCountyError(false);
                      setCountyValue(e.target.value);
                      if (e.target.value.length < 3) {
                        setCountyData([]);
                        setCityData([]);
                        setCityValue("");
                        setCounty("");
                      } else if (e.target.value.length === 0) {
                        setCounty("");
                        setCity("");
                        setCityValue("");
                      }
                    }}
                  />
                )}
              />
            </div>
            {errorChecker(sopCountyError, "County")}
          </div>
          <div className="col-sm-3">
            <FormLabel
              id="SopCity-1"
              sx={{
                color: "#001e46",
                fontSize: "16px",
              }}
            >
              Enter City
            </FormLabel>
            <div className="mt-3">
              <Autocomplete
                inputValue={cityValue}
                key={cityKey}
                freeSolo
                id="sopCity"
                disableClearable
                options={cityData}
                onChange={handleCityChange}
                value={city}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      width: 300,
                      height: 50,
                      backgroundColor: "#F9F9F9",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      style: {
                        fontSize: 16,
                      },
                    }}
                    variant="standard"
                    className="input-form"
                    onChange={(e: any) => {
                      handleChangeCity(e.target.value);
                      setCityValue(e.target.value);
                      setSopCityError(false);
                      if (e.target.value.length < 3) {
                        setCityData([]);
                      } else if (e.target.value.length === 0) {
                        setCity("");
                        setCityValue("");
                      }
                    }}
                  />
                )}
              />
            </div>
            {errorChecker(sopCityError, "City")}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6 mt-4"></div>
          <div className="col-sm-6 mt-4"></div>
        </div>
        <div className="row mt-4"></div>
        <div className="row mt-4">
          <div className="col-sm-6"></div>
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-6"></div>
              <div className="col-sm-6"></div>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-sm-3">
            <FormLabel
              id="LicenseType-1"
              sx={{
                color: "#001e46",
                fontSize: "16px",
              }}
            >
              License Type
            </FormLabel>
            <div className="mt-3">
              <Select
                name="licenseTypeId"
                labelId="LicenseType-1"
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                variant="filled"
                className="input-form select-field select-field-height"
                IconComponent={CustomExpandMore}
                value={licenseType}
                onChange={(e: any) => {
                  setLicenseTypeError(false);
                  handleLicenseChange(e.target.value);
                }}
                label="License type"
                aria-label="License Type"
              >
                <MenuItem disabled value="">
                  <span className="input-placeholder">Select a type</span>
                </MenuItem>
                {licenseTypeIds.map((licType) => (
                  <MenuItem key={`${licType.name}`} value={licType.id}>
                    {licType.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            {errorChecker(licenseTypeError, "License Type")}
          </div>

          <div className="col-sm-3">
            {showAddCategory && (
              <>
                <FormLabel></FormLabel>
                <div className="mt-3">
                  <TextBox
                    id="addNewCategory-1"
                    ariaLabel="AddNewCategory-1"
                    value={newCategory}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewCategoryError(false);
                      setNewCategory(e.target.value);
                      setCategoryCheckBox(true);
                      setSopTitle(e.target.value);
                      if (CategoryCheckBox === true) {
                        setSopTitle(e.target.value);
                      }
                    }}
                    maxLength={45}
                    height={50}
                    placeholder="This is a category name"
                  />
                </div>
                <div className="mr-4">
                  {" "}
                  <Button
                    type="text"
                    intent="secondary"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory("");
                      setCategoryCheckBox(false);
                      setSopTitle("");
                      setCategory("");
                    }}
                    text="Cancel"
                    className="CardSeeDetails"
                  />
                </div>
              </>
            )}
            {!showAddCategory && (
              <>
                <FormLabel
                  id="CategoryType-1"
                  sx={{
                    color: "#001e46",
                    fontSize: "16px",
                  }}
                >
                  Category
                </FormLabel>
                <div className="mt-3">
                  <Select
                    name="CategoryType"
                    labelId="CategoryType-1"
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    variant="filled"
                    className="input-form select-field select-field-height"
                    IconComponent={CustomExpandMore}
                    value={category}
                    onChange={(e: any) => {
                      setCategoryError(false);
                      handleCategoryChange(e);
                    }}
                  >
                    <MenuItem disabled value="">
                      <span className="input-placeholder">
                        Select a category
                      </span>
                    </MenuItem>
                    {categoriesToShow.map((cat: any, index: number) => (
                      <MenuItem
                        key={`${cat.categoryName}-${index}`}
                        value={cat.categoryId}
                      >
                        <AddTooltip value={cat.categoryName} len={30} />
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div className="d-flex mt-1">
                  {!showAddCategory && (
                    <Button
                      type="text"
                      intent="secondary"
                      onClick={() => {
                        setShowAddCategory(true);
                        setSopTitle("");
                        setCategoryCheckBox(false);
                        setSopTitleDisable(true);
                      }}
                      text="+ Add Category"
                      className="CardSeeDetails"
                    />
                  )}
                </div>
                {newCategoryError && showAddCategory && (
                  <span className="ErrorWrapper"> Category is required</span>
                )}
                {categoryError && !showAddCategory && (
                  <span className="ErrorWrapper"> Category is required</span>
                )}
              </>
            )}
          </div>

          <div className="col-sm-3">
            <FormLabel></FormLabel>
            <FormControlLabel
              className="mt-3 d-block"
              control={
                <Checkbox
                  checked={CategoryCheckBox}
                  onChange={handleTitleCheckbox}
                />
              }
              label="SOP Title Same as Category"
            ></FormControlLabel>
          </div>
          <div className="col-sm-3">
            <FormLabel
              id="SopTitle-1"
              sx={{
                color: "#001e46",
                fontSize: "16px",
              }}
            >
              Enter SOP Title
            </FormLabel>
            <div className="mt-3">
              <TextBox
                id="SopTitle-1"
                disabled={SopTitleDisable}
                ariaLabel="SopTitle-1"
                value={sopTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSopTitleError(false);
                  setSopTitle(e.target.value);
                }}
                className="form-control"
                maxLength={50}
                height={50}
              />
            </div>
            {errorChecker(sopTitleError, "SOP Title")}
          </div>
        </div>

        <div className="BottomButtonWrapper">
          <div className="row d-flex justify-content-between">
            <div className="col-sm-6">
              {!isBack && (
                <Button
                  type="outlined"
                  intent="secondary"
                  onClick={() => {
                    history.push("sop");
                  }}
                  text="Cancel"
                  className="sop-cancel-Button"
                />
              )}
            </div>
            <div className="col-sm-6 d-flex justify-content-end">
              <Button
                type="contained"
                intent="primary"
                onClick={submitCreteSOP}
                text="Save and Continue"
                height={67}
                width={198}
              />
            </div>
          </div>
        </div>
      </>
    </div>
  );
};
export default CreateNewSOP;
