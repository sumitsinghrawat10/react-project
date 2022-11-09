import React, { useState, useEffect } from "react";

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import BellIcon from "../../../components/Icons/BellIcon";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {Paper} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Button from "../../../components/Button";
import SearchButton from "../../../components/Mui/SearchButton";
import SearchField from "../../../components/Mui/SearchField";
import SuccessToaster from "../../../components/SuccessToaster";
import { ActionType } from "../../../model/model";
import { GET_ALL_VEHICLE_OF_USER_LOCATION } from "../../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  Active,
  ExpiringSoon,
  Expired,
} from "../../../utilities/constants";
import { roleValidator } from "../../../utilities/roleValidator";
import { VehicleDefaultImage } from "../../../utilities/VehicleDefaultImage";
import AddVehicleForm from "./AddVehicleForm";
import AddTooltip from "../../../components/AddTooltip";
import ImportVehicleRespModal from "./ImportVehicleRespModal";

interface VehicleData {
  vehicleId: number;
  vehicleImage: string;
  vehicleImageName: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  driverName: string;
  vin: string;
  driverLocation: string;
  vehicleRegistrationStatus: string;
  vehicleInsuranceStatus: string;
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
const Vehicles = () => {
  const history = useHistory();
  const [allVehicles, setAllVehicles] = useState<VehicleData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [SearchText, setSearchText] = useState("");
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const dispatch = useDispatch();
  const userState = useSelector((state: DashboardType) => state.user);

  //import vehicle variables
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResponseData, setImportResponseData] = useState([]);
  const [successRecords, setSuccessRecords] = useState([]);
  const [failedRecords, setFailedRecords] = useState([]);
  const [HandleBtnDisable, setHandleBtnDisable] = React.useState(false);
  const [ManualEmpBtn, setManualEmpBtn] = React.useState(false);
  const EmpResModalCancel = () => {
    setImportDialogOpen(false);
    setManualEmpBtn(false);
  };
  //import vehicle variables
  useEffect(() => {
    if (userState["navVisible"] === false) {
      dispatch({ type: ActionType.NAV_VISIBLE, payload: true });
    }
  }, [userState["navVisible"]]);
  const handleAddVehicle = () => {
    setOpen(true);
  };

  const searchFilterText = history.location.state
    ? history.location.state.searchFilterText
    : null;

  useEffect(() => {
    GetAllVehicleDetials();
  }, []);

  const GetAllVehicleDetials = () => {
    const token = localStorage.getItem("user");
    setLoading(true);
    axios
      .get(GET_ALL_VEHICLE_OF_USER_LOCATION, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response: any) => {
        if (
          response.status === 200 &&
          response.data.isSuccess === true &&
          response.data.result.length !== 0
        ) {
          setAllVehicles(response.data.result);
          setLoading(false);
          setOriginalData(response.data.result);
        } else {
          setMessage(response.data.responseMessage);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });

    if (searchFilterText !== null) {
      setSearchText(searchFilterText);
    }
  };

  const resetSearchData = (searchText: string) => {
    if (!searchText) {
      const filterResults = originalData;
      setAllVehicles(filterResults);
      setIsSearchEmpty(false);
    }
  };

  useEffect(() => {
    if (searchFilterText !== null && originalData.length !== 0) {
      SearchButtonHandler();
    }
  }, [originalData]);

  const searchByTextFilter = () => {
    return originalData.filter((obj: any) => {
      if (
        (obj.driverName !== null &&
          obj.driverName
            .toUpperCase()
            .includes(SearchText.toUpperCase().trim()) &&
          String(obj.driverName.toUpperCase()).includes(
            SearchText.trim().toUpperCase()
          )) ||
        (obj.model !== null &&
          obj.model.toUpperCase().includes(SearchText.toUpperCase().trim()) &&
          String(obj.model.toUpperCase()).includes(
            SearchText.trim().toUpperCase()
          )) ||
        (obj.year !== null &&
          obj.year.toUpperCase().includes(SearchText.toUpperCase().trim()) &&
          String(obj.year.toUpperCase()).includes(
            SearchText.trim().toUpperCase()
          )) ||
        (obj.make !== null &&
          obj.make.toUpperCase().includes(SearchText.toUpperCase().trim()) &&
          String(obj.make.toUpperCase()).includes(
            SearchText.trim().toUpperCase()
          ))
      ) {
        return true;
      }
    });
  };
  const SearchButtonHandler = () => {
    if (SearchText.trim() !== "") {
      const filterResults = searchByTextFilter();
      if (filterResults.length === 0) {
        setIsSearchEmpty(true);
      } else {
        setIsSearchEmpty(false);
      }
      setAllVehicles(filterResults);
    } else {
      setAllVehicles(originalData);
    }
  };

  const onCrossIconClick = () => {
    setIsSearchEmpty(false);
  };

  const SearchEmptyMsz = (): JSX.Element => {
    if (isSearchEmpty) {
      return (
        <div  className="data-empty-text" >
            <p>
              No data is found matching the text you have provided.
              </p>
        </div>

      );
    } else {
      return <></>;
    }
  };
  const getTooltipText = (
    vehicleRegistrationStatus: string,
    vehicleInsuranceStatus: string
  ) => {
    let tooltipText = "";
    if (
      roleValidator(vehicleRegistrationStatus) === Active &&
      roleValidator(vehicleInsuranceStatus) === Active
    ) {
      tooltipText = ``;
    } else if (
      roleValidator(vehicleRegistrationStatus) !== Active &&
      roleValidator(vehicleInsuranceStatus) === Active
    ) {
      tooltipText = `Registration ${vehicleRegistrationStatus.toLowerCase()}`;
    } else if (
      roleValidator(vehicleRegistrationStatus) === Active &&
      roleValidator(vehicleInsuranceStatus) !== Active
    ) {
      tooltipText = `Insurance ${vehicleInsuranceStatus.toLowerCase()}`;
    } else if (
      roleValidator(vehicleRegistrationStatus) !== Active &&
      roleValidator(vehicleInsuranceStatus) !== Active
    ) {
      if (
        roleValidator(vehicleRegistrationStatus) ===
        roleValidator(vehicleInsuranceStatus)
      ) {
        tooltipText = `Registration and Insurance ${vehicleInsuranceStatus.toLowerCase()}`;
      } else if (
        roleValidator(vehicleRegistrationStatus) === ExpiringSoon &&
        roleValidator(vehicleInsuranceStatus) === Expired
      ) {
        tooltipText = `Insurance expired, Registration expiring soon`;
      } else if (
        roleValidator(vehicleRegistrationStatus) === Expired &&
        roleValidator(vehicleInsuranceStatus) === ExpiringSoon
      ) {
        tooltipText = `Registration expired, Insurance expiring soon`;
      }
    }
    return tooltipText;
  };

  return (
    <div className="container vehicles-index-container form-container">
      <div className="d-flex header-align">
        <div className="page-title">Vehicles List</div>
        <div className="ms-auto pt-4">
          {(roleValidator(userState["role"]) === SystemAdministrator ||
            roleValidator(userState["role"]) === ComplianceAnalyst ||
            roleValidator(userState["role"]) === DirectorOfCompliance) && (
            <Tooltip title="Add a New Vehicle">
              <AddCircleOutlinedIcon
                className="AddCircleOutlineIconWrapper"
                onClick={handleAddVehicle}
              />
            </Tooltip>
          )}
        </div>
        <div className="ms-3">
          <BellIcon />
        </div>
      </div>
      <AddVehicleForm
        handleYes={() => {
          setOpen(false);
        }}
        open={open}
        setConfirmationModalIsVisible={setConfirmationModalIsVisible}
        GetAllVehicleDetials={GetAllVehicleDetials}
        //new props
        HandleBtnDisable={HandleBtnDisable}
        setHandleBtnDisable={setHandleBtnDisable}
        setImportDialogOpen={setImportDialogOpen}
        importDialogOpen={importDialogOpen}
        setOpen={setOpen}
        successRecords={successRecords}
        setSuccessRecords={setSuccessRecords}
        failedRecords={failedRecords}
        setFailedRecords={setFailedRecords}
        importResponseData={importResponseData}
        setImportResponseData={setImportResponseData}
      />
      <ImportVehicleRespModal
        open={importDialogOpen}
        setOpen={setImportDialogOpen}
        importResponseData={importResponseData}
        setImportResponseData={setImportResponseData}
        setHandleBtnDisable={setHandleBtnDisable}
        successRecords={successRecords}
        setSuccessRecords={setSuccessRecords}
        failedRecords={failedRecords}
        setFailedRecords={setFailedRecords}
        ManualEmpBtn={ManualEmpBtn}
        setManualEmpBtn={setManualEmpBtn}
        EmpResModalCancel={EmpResModalCancel}
      />

      <div>
        {allVehicles && !loading && (
          <div className="d-flex Vehicle-Search-Container">
            <div style={{ width: "100%" }} className="mx-3">
              <SearchField
                SearchText={SearchText}
                Placeholder="Search Vehicles and Drivers"
                SearchButtonHandler={SearchButtonHandler}
                setSearchText={setSearchText}
                resetSearchData={resetSearchData}
                originalData={originalData}
                setRows={setAllVehicles}
                onCrossIconClick={onCrossIconClick}
              />
            </div>
            <div className="me-3">
              <SearchButton
                SearchText={SearchText}
                SearchButtonHandler={SearchButtonHandler}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        {loading && (
          <div className="LoaderWrapper">
            <CircularProgress />
          </div>
        )}
        {allVehicles && allVehicles.length !== 0 && !loading && (
          <div className="mt-4 mb-5">
            <div className="d-flex p-1 AllVehicleContainer">
              {allVehicles.map((row: VehicleData) => (
                <div className="me-5 VehicleContainer" key={row.vin}>
                  <div className="VehicleImageContainer">
                    {row.vehicleImage.length !== 0 &&
                      row.vehicleImageName.split(".")?.pop()?.toLowerCase() ===
                        "svg" && (
                        <img
                          className="VehicleImage"
                          src={`data:image/svg+xml;base64,${row.vehicleImage}`}
                          alt="Vehicle"
                        />
                      )}
                    {row.vehicleImage.length !== 0 &&
                      row.vehicleImageName.split(".")?.pop()?.toLowerCase() !==
                        "svg" && (
                        <img
                          className="VehicleImage"
                          src={`data:image/jpeg;base64,${row.vehicleImage}`}
                          alt="Vehicle"
                        />
                      )}
                    {row.vehicleImage.length === 0 && (
                      <img
                        className="VehicleImage"
                        src={`data:image/jpeg;base64,${VehicleDefaultImage}`}
                        alt="Vehicle"
                      />
                    )}
                  </div>
                  <TableContainer
                    component={Paper}
                    style={{
                      backgroundColor: "#ffffff",
                      maxWidth: "420px",
                      maxHeight: "427px",
                      boxShadow: "0px 0px 10px #0000001A",
                    }}
                  >
                    <Table className="VehicleTable">
                      <TableHead>
                        <TableCell
                          className="VehicleTitle"
                          align="center"
                          colSpan={10}
                        >
                          {`${row.year.trim()} ${row.make.trim()} ${row.model.trim()}`
                            .length >= 5 ? (
                            <div className="VehicleCardHeading">
                              {getTooltipText(
                                row.vehicleRegistrationStatus,
                                row.vehicleInsuranceStatus
                              ) !== "" && (
                                <div className="vehicleheading">
                                  <Tooltip
                                    title={getTooltipText(
                                      row.vehicleRegistrationStatus,
                                      row.vehicleInsuranceStatus
                                    )}
                                    placement="top"
                                    arrow
                                  >
                                    <WarningAmberIcon className="me-2 WarningAmberIconWrap ClientNameWrap" />
                                  </Tooltip>
                                </div>
                              )}
                              <div className="vehicleheading">
                                <AddTooltip
                                  value={`${row.year.trim()} ${row.make.trim()} ${row.model.trim()}`}
                                  len={20}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="VehicleCardHeading">
                              {getTooltipText(
                                row.vehicleRegistrationStatus,
                                row.vehicleInsuranceStatus
                              ) !== "" && (
                                <Tooltip
                                  title={getTooltipText(
                                    row.vehicleRegistrationStatus,
                                    row.vehicleInsuranceStatus
                                  )}
                                  placement="top"
                                  arrow
                                >
                                  <WarningAmberIcon className="me-2 WarningAmberIconWrap" />
                                </Tooltip>
                              )}
                              {`${row.year.trim()} ${row.make.trim()} ${row.model.trim()}`}
                            </div>
                          )}
                          <hr className="Separator"></hr>
                        </TableCell>
                      </TableHead>
                      <TableBody>
                        <TableRow className="VehicleTableRow">
                          <TableCell className="LeftCell">VIN:</TableCell>
                          {row.vin.length >= 21 ? (
                            <Tooltip title={row.vin.trim()} placement="top">
                              <TableCell className="RightCell">
                                {" "}
                                {`${row.vin.trim().slice(0, 19)}...`}
                              </TableCell>
                            </Tooltip>
                          ) : (
                            <TableCell className="RightCell">
                              {row.vin.trim()}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow className="VehicleTableRow">
                          <TableCell className="LeftCell">
                            License Plate:
                          </TableCell>

                          {row.licensePlate.length >= 21 ? (
                            <Tooltip
                              title={row.licensePlate.trim()}
                              placement="top"
                            >
                              <TableCell className="RightCell">
                                {`${row.licensePlate.trim().slice(0, 19)}...`}
                              </TableCell>
                            </Tooltip>
                          ) : (
                            <TableCell className="RightCell">
                              {row.licensePlate.trim()}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow className="VehicleTableRow">
                          <TableCell className="LeftCell">Location:</TableCell>
                          {row.driverLocation.length >= 21 ? (
                            <Tooltip
                              title={row.driverLocation.trim()}
                              placement="top"
                            >
                              <TableCell className="RightCell">
                                {`${row.driverLocation.trim().slice(0, 19)}...`}
                              </TableCell>
                            </Tooltip>
                          ) : (
                            <TableCell className="RightCell">
                              {row.driverLocation.trim()}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow className="VehicleTableRow">
                          <TableCell className="LeftCell">
                            Driver Name:
                          </TableCell>
                          {row.driverName.length >= 21 ? (
                            <Tooltip
                              title={row.driverName.trim()}
                              placement="top"
                            >
                              <TableCell className="RightCell">
                                {`${row.driverName.trim().slice(0, 19)}...`}
                              </TableCell>
                            </Tooltip>
                          ) : (
                            <TableCell className="RightCell">
                              {row.driverName.trim()}
                            </TableCell>
                          )}
                        </TableRow>
                        <TableRow>
                          <TableCell align="center" colSpan={6}>
                            <Button
                              className="SeeMoreButton"
                              text="See More"
                              intent="primary"
                              type="contained"
                              onClick={() =>
                                history.push("/vehicle-details", {
                                  vehicleId: row.vehicleId,
                                })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              ))}
            </div>

          </div>

        )}
{!loading && <SearchEmptyMsz/>}
              {allVehicles === null && !loading && (
          <h4 className="NoLicensessText">{message}</h4>
        )}
        {confirmationModalIsVisible && (
          <SuccessToaster message="Vehicle Added Successfully" />
        )}
      </div>

    </div>
  );
};

export default Vehicles;
