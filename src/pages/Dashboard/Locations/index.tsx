import React, { useEffect, useState } from 'react';
import { AddCircleOutlined, ChevronRight, ExpandMore, KeyboardArrowDown, KeyboardArrowUp, UnfoldMore } from '@mui/icons-material';
import BellIcon from "../../../components/Icons/BellIcon";
import {  TableCell, tableCellClasses,  CircularProgress, InputLabel, Paper, Table, TableBody, TableContainer, TableHead } from '@mui/material';
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import TableRow from "@mui/material/TableRow";

import axios from 'axios';
import { useSelector, connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import AddTooltip from '../../../components/AddTooltip';
import ColGroup from '../../../components/Mui/ColGroup';
import SearchButton from '../../../components/Mui/SearchButton';
import SearchField from '../../../components/Mui/SearchField';
import { SortRows } from '../../../components/SetRows';
import { GET_LOCATIONS_BY_ORGANIZATION_ID } from '../../../networking/httpEndPoints';
import * as UserDetailsActions from "../../Login/authenticationActions";
import { RootState } from "../../../redux/rootReducer";
import {
  SystemAdministrator,
  DirectorOfCompliance,
} from '../../../utilities/constants';
import { roleValidator } from '../../../utilities/roleValidator';
import AssignLocationDialogBox from './AssignLocationDialogBox';
import LocationForm from './LocationForm';




const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMore{...rest} />;
};

interface LocationResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

type RowType = {
  locationNickName: string | null | undefined;
  legalEntityName: string | null | undefined;
  organizationLocationId: number;
  state: string | null | undefined;
};
interface DashboardType {
  user: {
    user?: string;
    role?: string;
    userId?: number | null;
    initialSetup?: string;
    navVisible?: boolean;
  };
}
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
const Locations: React.FC<InitialSetUpType> = (props: InitialSetUpType)=> {
  const history = useHistory();
  const userState = useSelector((state: DashboardType) => state.user);
  const [open, setOpen] = React.useState(false);
  const handleAddLocation = () => {
    setOpen(true);
  };
  const [openAssignLocation, setOpenAssignLocation] = useState(false);

  let ascRows: any;
  const [isLocNameSorted, setIsLocNameSorted] = useState<boolean>(false);
  const [isLocNameSortedDsc, setIsLocNameSortedDsc] = useState<boolean>(false);
  const [isLegEntSorted, setIsLegEntSorted] = useState<boolean>(false);
  const [isLegEntSortedDsc, setIsLegEntSortedDsc] = useState<boolean>(false);
  const [isStateSorted, setIsStateSorted] = useState<boolean>(false);
  const [isStateSortedDsc, setIsStateSortedDsc] = useState<boolean>(false);

  const [rows, setRows] = useState<any | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [uniqueStates, setUniqueStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [originalData, setOriginalData] = useState([]);
  const [isStateSingle, setIsStateSingle] = useState(false);
  const [SearchText, setSearchText] = useState('');
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const getLocationData = () => {
    setIsStateSingle(false);
    setSelectedState('');
    setUniqueStates([]);
    setOriginalData([]);
    const token = localStorage.getItem('user');
    axios
      .get<LocationResponse>(`${GET_LOCATIONS_BY_ORGANIZATION_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          HandleLocationResponse(res);
        } else if (res.status === 200 && res.data.isSuccess === false) {
          setIsEmpty(true);
          setRows(null);
        } else {
          Swal.fire({
            text: 'Something went wrong!',
            confirmButtonText: 'OK',
            icon: 'error',
          });
        }
      });
  };

  const HandleLocationResponse = (res: any) => {
    const locationData = res.data.result === null ? [] : res.data.result;
    if (locationData.length >= 0 && userState["initialSetup"]!=="complete") {
      props.actions.updateInitialSetup("complete");
    }
    const assignedLocation = locationData.filter(
      (item: any) => item.isLocationAssigned);
    SetIsEmptyRowsOriginaldata(res);
    const rawData = assignedLocation;
    const uniqueStatesData = rawData.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => ['state'].every((k) => t[k] === v[k])) === i);
    const sortedStatesData = uniqueStatesData.sort((a: any, b: any) =>
      a.state.localeCompare(b.state)
    );
    if (sortedStatesData.length === 1) {
      setIsStateSingle(true);
      setSelectedState(sortedStatesData[0].state);
    }
    setUniqueStates(sortedStatesData);
  };

  const SetIsEmptyRowsOriginaldata = (res: any) => {
    const locationData = res.data.result === null ? [] : res.data.result;
    const assignedLocation = locationData.filter(
      (item: any) => item.isLocationAssigned);
    setIsEmpty(false);
    setRows(assignedLocation);
    setOriginalData(assignedLocation);
  };

  useEffect(() => {
    if (rows == null) {
      getLocationData();
    }
  }, []);

  const handleStateSelectFieldChange = (e: any) => {
    setSelectedState(e.target.value);
    IsLocNameLegEntStateSorted(isLocNameSorted, isLegEntSorted, isStateSorted);
    setSearchText('');
    if (e.target.value !== '') {
      const filterResults = originalData.filter((obj: any) => {
        return obj.state === e.target.value;
      });
      setRows(filterResults);
      setIsSearchEmpty(false);
    } else {
      setRows(originalData);
      setIsSearchEmpty(false);
    }
  };

  const IsLocNameLegEntStateSorted = (isLocNameSortedChk: boolean, isLegEntSortedChk: boolean, isStateSortedChk: boolean) => {
    if (isLocNameSortedChk) {
      setIsLocNameSorted((prevIsLocNameSorted) => !prevIsLocNameSorted);
      setIsLocNameSortedDsc(false);
    }
    if (isLegEntSortedChk) {
      setIsLegEntSorted((prevIsLegEntSorted) => !prevIsLegEntSorted);
      setIsLegEntSortedDsc(false);
    }
    if (isStateSortedChk) {
      setIsStateSorted((prevIsStateSorted) => !prevIsStateSorted);
      setIsStateSortedDsc(false);
    }
  };

  const resetSearchData = (searchText: string) => {
    if (!searchText) {
      setIsSearchEmpty(false);
      if (selectedState !== '') {
        const filterResults = originalData.filter((obj: any) => {
          return obj.state === selectedState;
        });
        setRows(filterResults);
        if (filterResults.length === 0) {
          setIsSearchEmpty(true);
        }
      } else {
        setRows(originalData);
      }
    }
  };

  const searchByTextFilter = () => {
    return originalData.filter((obj: any) => {
      if (
        obj.locationNickName != null &&
        obj.locationNickName
          .toUpperCase()
          .includes(SearchText.toUpperCase().trim()) &&
        String(obj.locationNickName.toUpperCase()).includes(
          SearchText.trim().toUpperCase()
        )
      ) {
        return true;
      }
    });
  };

  const LocNameSortingHandler = () => {
    IsLegEntStateSorted();
    if (isLocNameSorted === true && isLocNameSortedDsc === false) {
      setIsLocNameSortedDsc(
        (prevIsLocNameSortedDsc) => !prevIsLocNameSortedDsc
      );
      SortRows('locationNickName', 'dsc', { ascRows, rows, setRows });
    } else if (isLocNameSorted === true && isLocNameSortedDsc === true) {
      setIsLocNameSorted((prevIsLocNameSorted) => !prevIsLocNameSorted);
      setIsLocNameSortedDsc(
        (prevIsLocNameSortedDsc) => !prevIsLocNameSortedDsc
      );
      fillSearchAndFilterData();
    } else {
      setIsLocNameSorted((prevIsLocNameSorted) => !prevIsLocNameSorted);
      SortRows('locationNickName', 'asc', { ascRows, rows, setRows });
    }
  };

  const IsLegEntStateSorted = () => {
    if (isLegEntSorted) {
      setIsLegEntSorted((prevIsLegEntSorted) => !prevIsLegEntSorted);
      setIsLegEntSortedDsc(false);
    }
    if (isStateSorted) {
      setIsStateSorted((prevIsStateSorted) => !prevIsStateSorted);
      setIsStateSortedDsc(false);
    }
  };

  const LegEntSortingHandler = () => {
    if (isLocNameSorted) {
      setIsLocNameSorted((prevIsLocNameSorted) => !prevIsLocNameSorted);
      setIsLocNameSortedDsc(false);
    }
    if (isStateSorted) {
      setIsStateSorted((prevIsStateSorted) => !prevIsStateSorted);
      setIsStateSortedDsc(false);
    }
    if (isLegEntSorted === false) {
      setIsLegEntSorted((prevIsLegEntSorted) => !prevIsLegEntSorted);
      SortRows('legalEntityName', 'asc', { ascRows, rows, setRows });
    } else if (isLegEntSorted === true && isLegEntSortedDsc === false) {
      setIsLegEntSortedDsc((prevIsLegEntSortedDsc) => !prevIsLegEntSortedDsc);
      SortRows('legalEntityName', 'dsc', { ascRows, rows, setRows });
    } else if (isLegEntSorted === true && isLegEntSortedDsc === true) {
      setIsLegEntSorted((prevIsLegEntSorted) => !prevIsLegEntSorted);
      setIsLegEntSortedDsc((prevIsLegEntSortedDsc) => !prevIsLegEntSortedDsc);
      fillSearchAndFilterData();
    }
  };

  const fillSearchAndFilterData = () => {
    if (selectedState !== '' && SearchText === '') {
      SetRowsIsEmpty();
    } else if (selectedState !== '' && SearchText !== '') {
      SetIsSearchEmptyNRows();
    } else if (selectedState === '' && SearchText !== '') {
      const filterResults = searchByTextFilter();
      if (filterResults.length === 0) {
        setIsSearchEmpty(true);
      }
      setRows(filterResults);
    } else {
      setRows(originalData);
    }
  };

  const SetRowsIsEmpty = () => {
    const filterResults = originalData.filter((obj: any) => {
      return obj.state === selectedState;
    });
    if (filterResults.length === 0) {
      setIsEmpty(true);
    }
    setRows(filterResults);
  };

  const SetIsSearchEmptyNRows = () => {
    const filterResults = searchByTextFilter();

    const filterState = filterResults.filter((obj: any) => {
      return obj.state === selectedState;
    });
    if (filterState.length === 0) {
      setIsSearchEmpty(true);
    }
    setRows(filterState);
  };

  const StateSortingHandler = () => {
    SetIsLocNameLegEntSorted();
    if (isStateSorted === false) {
      setIsStateSorted((prevIsStateSorted) => !prevIsStateSorted);
      SortRows('state', 'asc', { ascRows, rows, setRows });
    } else if (isStateSorted === true && isStateSortedDsc === false) {
      setIsStateSortedDsc((prevIsStateSortedDsc) => !prevIsStateSortedDsc);
      SortRows('state', 'dsc', { ascRows, rows, setRows });
    } else if (isStateSorted === true && isStateSortedDsc === true) {
      setIsStateSorted((prevIsStateSorted) => !prevIsStateSorted);
      setIsStateSortedDsc((prevIsStateSortedDsc) => !prevIsStateSortedDsc);
      fillSearchAndFilterData();
    }
  };

  const SetIsLocNameLegEntSorted = () => {
    if (isLocNameSorted) {
      setIsLocNameSorted((prevIsLocNameSorted) => !prevIsLocNameSorted);
      setIsLocNameSortedDsc(false);
    }
    if (isLegEntSorted) {
      setIsLegEntSorted((prevIsLegEntSorted) => !prevIsLegEntSorted);
      setIsLegEntSortedDsc(false);
    }
  };

  const SearchButtonHandler = () => {
    if (SearchText.trim() !== '') {
      SetIsShorted();
      const filterResults = searchByTextFilter();
      if (selectedState !== '') {
        SetRowsAndIsSearchEmpty();
      } else {
        if (filterResults.length === 0) {
          setIsSearchEmpty(true);
        } else {
          setIsSearchEmpty(false);
        }
        setRows(filterResults);
      }
    } else {
      setRows(originalData);
    }
  };

  const SetRowsAndIsSearchEmpty = () => {
    const filterResults = searchByTextFilter();
    const filterState = filterResults.filter((obj: any) => {
      return obj.state === selectedState;
    });
    setRows(filterState);
    if (filterState.length === 0) {
      setIsSearchEmpty(true);
    } else {
      setIsSearchEmpty(false);
    }
  };

  const onCrossIconClick = () => {
    setIsSearchEmpty(false);
  };

  const SetIsShorted = () => {
    setIsLocNameSorted(false);
    setIsLocNameSortedDsc(false);
    setIsLegEntSorted(false);
    setIsLegEntSortedDsc(false);
    setIsStateSorted(false);
    setIsStateSortedDsc(false);
  };
  const AsssignLocationRender=(): JSX.Element =>{
    if (roleValidator(userState['role']) === SystemAdministrator ||
    roleValidator(userState['role']) === DirectorOfCompliance)
    {
       return (
        <div className="LinkBold" onClick={() => setOpenAssignLocation(true)}>
          Assign Location</div>
           );
    }else {
            return (<></>);
          }
 };
 const AddNewLocationLocationRender=(): JSX.Element =>{
  if (roleValidator(userState['role']) === SystemAdministrator ||
  roleValidator(userState['role']) === DirectorOfCompliance)
  {
     return (
      <Tooltip title="Add a New Location">
              <AddCircleOutlined
                className="mt-3 ms-3 AddCircleOutlineIconWrapper"
                onClick={handleAddLocation}
              />
            </Tooltip>
         );
  }else {
          return (<></>);
        }
};
const LocationRender=(): JSX.Element =>{
  if (!rows && isEmpty )
  {
     return (
      <h4 className="NoDataFoundText">No Locations Found</h4>
         );
  }else {
          return (<></>);
        }
};
const CircularRender=(): JSX.Element =>{
  if (!rows&& !isEmpty )
  {
     return (
      <div className="LoaderWrapper">
          <CircularProgress />
        </div>
         );
  }else {
          return (<></>);
        }
};
const SortLocationRender=(): JSX.Element =>{
  if (!isLocNameSorted)
  {
     return (
      <UnfoldMore fontSize="small" />
         );
  }
  if (isLocNameSorted&& isLocNameSortedDsc)
  {
     return (
      <KeyboardArrowDown fontSize="small"></KeyboardArrowDown>
         );
  }
  if (isLocNameSorted&& !isLocNameSortedDsc)
  {
     return (
      <KeyboardArrowUp fontSize="small" />
         );
  }
  else {
          return (<></>);
        }
};
const LegEntSortRender=(): JSX.Element =>{
  if (!isLegEntSorted)
  {
     return (
      <UnfoldMore fontSize="small" />
         );
  }
  if (isLegEntSorted&& isLegEntSortedDsc)
  {
     return (
      <KeyboardArrowDown fontSize="small" />
         );
  }
  if (isLegEntSorted&& !isLegEntSortedDsc)
  {
     return (
      <KeyboardArrowUp fontSize="small" />
         );
  }
  else {
          return (<></>);
        }
};
const StateSortingRender=(): JSX.Element =>{
  if (!isStateSorted)
  {
     return (
      <UnfoldMore fontSize="small" />
         );
  }
  if (isStateSorted&& isStateSortedDsc)
  {
     return (
      <KeyboardArrowDown fontSize="small" />
         );
  }
  if (isStateSorted&& !isStateSortedDsc)
  {
     return (
      <KeyboardArrowUp fontSize="small" />
         );
  }
  else {
          return (<></>);
        }
};
  return (
    <div className="container form-container location-container">
      <LocationForm
        setOpen={setOpen}
        open={open}
        getLocationData={getLocationData}
        organizationLocationId={null}
        disabled={disabled}
        setDisabled={setDisabled}
      />

      <div className="d-flex">
        <div className="page-title">Locations</div>
        <div className="ms-auto pt-4">
        {AsssignLocationRender()}
        </div>
        {openAssignLocation&&(
        <AssignLocationDialogBox
          openAssignLocation={openAssignLocation}
          handleAssignLocation={() => setOpenAssignLocation(false)}
          getLocationData={getLocationData}
        />
        )}
        <div className="LinkBold hide-link pt-4 ms-3">Archive Location</div>
        <div className="LinkBold hide-link pt-4 ms-3">Go to Archive</div>
       {AddNewLocationLocationRender()}
        <div className="ms-3"><BellIcon /></div>
      </div>
      {LocationRender()}
      {CircularRender()}
      {rows&&(
        <>
          <div className="d-flex SearchContainer">
            <div className="me-2 ms-3 select-container-width">
              <InputLabel
                id="stateId-label"
                sx={{
                  display: "none",
                }}
              >
                All States
              </InputLabel>
              <Select
                name="stateId"
                labelId="stateId-label"
                displayEmpty
                value={selectedState}
                disabled={isStateSingle|| false}
                inputProps={{ "aria-label": "Without label" }}
                variant="filled"
                className="input-form select-field SelectWrapper select-placeholder-text-color"
                IconComponent={CustomExpandMore}
                onChange={(e) => {
                  handleStateSelectFieldChange(e);
                }}
                renderValue={(value)=> value !== "" ? `Filter By: ${selectedState}`:"Filter By: All States"}
                label="All States"
                aria-label="All States"
                MenuProps={{ MenuListProps: { disablePadding: true } }}
              >
                {!isStateSingle&&(
                  <MenuItem value="" className="abcdef" selected>
                    <span className="input-placeholder">All States</span>
                  </MenuItem>
                )}
                {uniqueStates.map((type: any) => (
                  <MenuItem
                    key={type.state}
                    value={type.state}
                    selected={isStateSingle || false}
                  >
                    {type.state}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div style={{ width: "100%" }} className="mx-2">
              <SearchField
                SearchText={SearchText}
                Placeholder="Search location"
                SearchButtonHandler={SearchButtonHandler}
                setSearchText={setSearchText}
                resetSearchData={resetSearchData}
                originalData={originalData}
                setRows={setRows}
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

          <div className="mt-4 mb-4">
            <TableContainer
              component={Paper}
              className="ScrollContainer"
              style={{
                backgroundColor: "#f4f5f8",
                paddingLeft: "5px",
                paddingRight: "5px",
                maxHeight: "80vh",
              }}
            >
              <Table sx={{ minWidth: 650 }} aria-label="locations list table">
                <ColGroup />
                <TableHead
                  sx={{
                    [`& .${tableCellClasses.root}`]: {
                      borderBottom: "none !important",
                    },
                    backgroundColor: "#f4f5f8",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <TableRow>
                     {/* This cell is required but it will be used after MVP. */}
                    {/* <TableCell className="TableHeaderWrapper">Select</TableCell> */}
                    <TableCell className="TableHeaderWrapper">
                      Location Name
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          LocNameSortingHandler();
                        }}
                      >
                       {SortLocationRender()}
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper">
                      Legal Entity
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          LegEntSortingHandler();
                        }}
                      >
                        {LegEntSortRender()}
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper">
                      State
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          StateSortingHandler();
                        }}
                      >
                        {StateSortingRender()}
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper">
                      <div style={{ display: "none" }}>Details</div>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row: RowType) => (
                    <TableRow
                      key={row.organizationLocationId}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      {/* This checkbox is required but it will be used after MVP. */}
                      {/* <TableCell
                        className="TableRowsWrapper"
                        padding="none"
                         >
                        <Checkbox
                          color="primary"
                          inputProps={{
                            "aria-label": "select Location",
                          }}
                        />
                      </TableCell> */}
                      <TableCell
                        className="TableRowsWrapper"
                        component="th"
                        scope="row"
                      >
                        <span className="ClientNameWrap">

                  <AddTooltip  value={row.locationNickName} len={30} />
                        </span>
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        <span className="ClientNameWrap">

                  <AddTooltip  value={row.legalEntityName} len={30} />
                        </span>
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        {row.state}
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        <div
                          className="SeeLocationDetailWrap"
                          onClick={() =>
                            history.push("/location-details", {
                              organizationLocationId:
                                row.organizationLocationId,
                            })
                          }
                        >
                          <span className="detail-page-text">See Location Details</span>
                          <ChevronRight />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {isSearchEmpty&& (
                <div className="NoDataFoundText">
                  No data is found matching the text you have provided.
                </div>
              )}
            </TableContainer>
          </div>
        </>
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

export default connect(mapStateToProps, mapDispatchToProps)(Locations);