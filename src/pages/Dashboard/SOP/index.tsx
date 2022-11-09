import React, { useEffect, useState } from "react";

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BellIcon from "../../../components/Icons/BellIcon";
import {
    MenuItem,
    Select,
    Paper,
    TextField,
    InputAdornment,
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import { styled as muiStyled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import axios from "axios";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import AddTooltip from "../../../components/AddTooltip";
import Loader from "../../../components/Loader";
import SearchButton from "../../../components/Mui/SearchButton";
import {
    GET_DASHBOARD_SOP_LIST,
    GET_USER_DASHBOARD_SOP_LIST,
    GET_ALL_CATEGORIES,
    GET_LICENSE_TYPE,
} from "../../../networking/httpEndPoints";
import { decodeToken } from "../../../utilities/decodeToken.js";
import historyVaribaleChecker from "../../../utilities/historyVariableChecker";
import keyValueMapper from "../../../utilities/keyValueMapper";
import SearchIcon from '@mui/icons-material/Search';

const FieldIcon = styled(ClearOutlinedIcon) <CrossIconProps>`
  :hover {
    cursor: pointer;
  }
  display: ${(props) =>
        props.SearchText.length > 0 ? "block" : "none"} !important;
`;
const StatusDiv = styled.div`
  margin-left: 8px;
 
`;

const PublishStatusDiv = styled.div`
  text-align: left;
  color: #ffffff;
  display: none;
  margin-left: 8px;
`;

const SopStatus = styled.div`
  text-align: left;
  font: normal normal normal 14px / 25px Urbanist;
  letter-spacing: 0.35px;
  color: #707070;
  opacity: 1;
  margin-right: 8px;
  .hover-heading: {
    color: #ffffff !important;
  }
`;
const SopCardHoverWrapper = styled.div`
text - align: left;
font: normal normal normal 14px / 25px Urbanist;
letter - spacing: 0.35px;
color: #000000;
opacity: 1;
position: relative;
display: block;
margin - left: 8px;
margin - top: 12px;
&: hover {
${StatusDiv} {
    display: none;
    opacity: 0;
};
${PublishStatusDiv} {
    display: block;
    opacity: 1;
};
${SopStatus} {
    color: #FFFFFF;
};
background-color: #233ce6;
};
`;

const LinkWrapper = styled.a<ContainerType>`
  font-weight: 600;
  color: ${(props) => (!props.activeLink ? "#001e46" : "#233ce6")};
  text-decoration: none;
  cursor: pointer;
  :hover {
    color: #233ce6 !important;
  }
`;
const ITEM_HEIGHT = 60;
const ITEM_PADDING_TOP = 2;
const MenuPropsSelection = { 
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4 + ITEM_PADDING_TOP,
      maxWidth: 300,
    },
  },
  MenuListProps: { disablePadding: true },
};

const CustomExpandMore = ({ ...rest }) => {
    return <ExpandMoreIcon {...rest} />;
};

type ContainerType = {
    activeLink?: boolean;
};
interface CrossIconProps {
    SearchText: string;
}
interface GetResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
}
interface DashboardObject {
    sopId: number;
    title: string;
    version: string;
    state: string;
    county: string;
    city: string;
    sopCategoryId: number;
    sopLicenseTypeId: number;
    status: string;
    sopRevisionId: number;
    isRead: boolean;
    userId: number;
}
const CustomizedTooltip = muiStyled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: "#001e46",
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#001e46",
        color: "#FFFFFF",
        fontSize: theme.typography.pxToRem(12),
    },
}));

const SopDashboard: React.FC = () => {
    const history = useHistory();
    const [sopListLength, setSopListLength] = useState(0);
    const [licenseType, setLicenseType] = useState("");
    const [categoryType, setCategoryType] = useState("");
    const [SearchText, setSearchText] = useState("");
    const [originalData, setOriginalData] = useState<Array<DashboardObject>>([]);
    const [rows, setRows] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showCategoryDropDown, setShowCategoryDropDown] = useState(false);
    const [isPublishedFilterStatus, setIsPublishedFilterStatus] = useState(false);
    const [isDraftFilterStatus, setIsDraftFilterStatus] = useState(false);
    const [isNewFilterStatus, setIsNewFilterStatus] = useState(false);
    const [isInReviewFilterStatus, setIsInReviewFilterStatus] = useState(false);
    const [isAllFilterStatus, setIsAllFilterStatus] = useState(false);
    const [isFilteredListEmpty, setIsFilteredListEmpty] = useState(false);
    const [filteredListEmptyMsg, setFilteredListEmptyMsg] = useState("");
    const [filteredData, setFilteredData] = useState<Array<DashboardObject>>([]);
    const token = localStorage.getItem("user");
    const userData = decodeToken(token);
    const isUserDashboard = userData.RoleId !== "7" && userData.RoleId !== "8";
    const isLeadOrManager = userData.RoleId === "5" || userData.RoleId === "6";
    const [licenseTypeIds, setlicenseTypeIds] = React.useState<any[]>([
        { name: "", id: 0 },
    ]);
    const [categoriesToShow, setCategoriesToShow] = useState([]);
    const [originalCategories, setOriginalCategories] = useState([]);
    const [filterFirstRender, setFilterFirstRender] = useState("");
    const [renderFilteredData, setRenderFilteredData] = useState(false);

    const filterTextRender: string = historyVaribaleChecker(
        "filterText",
        history
    );
    const licenseFilterNumber = historyVaribaleChecker(
        "licenseFilterNumber",
        history
    );
    const searchFilterText = historyVaribaleChecker("searchFilterText", history);
    const categoryFilterNumber = historyVaribaleChecker(
        "categoryFilterNumber",
        history
    );

    useEffect(() => {
        resetFields();
        setLoading(true);
        setLoader(true);
        const apiUrl = isUserDashboard
            ? GET_USER_DASHBOARD_SOP_LIST
            : GET_DASHBOARD_SOP_LIST;
        axios
            .get<GetResponse>(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res: any) => {
                setTimeout(() => {
                    setLoader(false);
                }, 500);
                setLoading(false);
                if (
                    res.status === 200 &&
                    res.data.responseMessage.toString().toLowerCase() === "success"
                ) {
                    setOriginalData(getFilteredData(res.data.result));
                    setRows(getFilteredData(res.data.result));
                    setSopListLength(res.data.result.length);
                }
            })
            .catch(() => setLoader(false));
        setIsAllFilterStatus(true);
        bindLicenseTypeAndCategory();

        if (filterTextRender != null) {
            setFilterFirstRender(filterTextRender);
        }
        if (searchFilterText != null) {
            setSearchText(searchFilterText);
        }
        if (licenseFilterNumber != null) {
            setLicenseType(licenseFilterNumber);
        }
        if (categoryFilterNumber != null) {
            setCategoryType(categoryFilterNumber);
        }
    }, []);

    useEffect(() => {
        if (originalData.length !== 0) {
            if (licenseFilterNumber != null) {
                filterDataOnLicenseTypeOrCategoryChange(licenseFilterNumber, 0);
            }
            if (categoryFilterNumber != null && licenseFilterNumber != null) {
                filterDataOnLicenseTypeOrCategoryChange(
                    licenseFilterNumber,
                    categoryFilterNumber
                );
            }
            if (searchFilterText != null) {
                SearchButtonHandler();
            }
            setRenderFilteredData(true);
        }
    }, [originalData]);

    useEffect(() => {
        if (renderFilteredData) {
            newrender();
            setRenderFilteredData(false);
        }
    }, [renderFilteredData]);

    const newrender = () => {
        if (
            filterFirstRender !== null &&
            originalData.length !== 0 &&
            filterTextRender != null
        ) {
            statusBasedFilter(filterTextRender);
            setFilterFirstRender("");
        }
    };
    let filterText: string;

    const isFilterCheck = () => {
        if (isAllFilterStatus) {
            filterText = "All";
        } else if (isPublishedFilterStatus) {
            filterText = "Published";
        } else if (isDraftFilterStatus) {
            filterText = "Draft";
        } else if (isNewFilterStatus) {
            filterText = "New";
        } else if (isInReviewFilterStatus) {
            filterText = "in-review";
        }
    };

    const StatusNameCheck = (item: any) => {
        if (item.status.toString().toLowerCase() === "published") {
            return "Published";
        }
        else if (item.status === "in-review") {
            return "Review";
        }
        else {
            return item.status;
        }
    };
    const VersionCheck = (item: any) => {
        if (!isUserDashboard) {
            return item.version;
        } else if (item.minorVersion == null) {
            return item.majorVersion;
        } else {
            return item.minorVersion;
        }
    };

    const resetSearchData = (searchText: any) => {
        if (searchText.length === 0) {
            let filterResults: Array<DashboardObject> = originalData;
            filterResults = filterLicenseCtegory(filterResults);
            filterResults = checkFilterStatus(filterResults);
            setIsFilteredListEmpty(false);
            setRows(filterResults);
            resetSOPStatusFields();
            setIsAllFilterStatus(true);
        }
    };

    const filterLicenseCtegory = (filterResults: any) => {
        if (licenseType !== "") {
            if (categoryType !== "") {
                filterResults = filterResults.filter(
                    (item: any) =>
                        item.sopLicenseTypeId === parseInt(licenseType) &&
                        item.sopCategoryId === parseInt(categoryType)
                );
            }
            if (categoryType === "") {
                filterResults = filterResults.filter(
                    (item: any) => item.sopLicenseTypeId === parseInt(licenseType)
                );
            }
        }
        return filterResults;
    };

    const checkFilterStatus = (filterResults: Array<DashboardObject>) => {
        let filterForNew: Array<DashboardObject> = [];
        let filterFinalForSearch: Array<DashboardObject>;
        if (isAllFilterStatus) {
            return filterResults;
        } else {
            if (isPublishedFilterStatus) {
                filterForNew = filterResults.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterStatus.published.trim().toUpperCase() &&
                        item.isRead === false
                );
                filterResults = filterResults.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterStatus.published.trim().toUpperCase() &&
                        item.isRead === true
                );
            } else if (isDraftFilterStatus) {
                filterForNew = filterResults.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterStatus.draft.trim().toUpperCase() && item.isRead === false
                );
                filterResults = filterResults.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterStatus.draft.trim().toUpperCase() && item.isRead === true
                );
            } else if (isNewFilterStatus) {
                filterResults = filterResults.filter(
                    (item: DashboardObject) => item.isRead === false
                );
            } else if (isInReviewFilterStatus) {
                filterForNew = filterResults.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterStatus.inReview.trim().toUpperCase() &&
                        item.isRead === false
                );
                filterResults = filterResults.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterStatus.inReview.trim().toUpperCase() && item.isRead === true
                );
            }
            filterFinalForSearch = [...filterForNew, ...filterResults];
            return filterFinalForSearch;
        }
    };

    const CheckForCategoryChooseError = (): JSX.Element => {
        return (<>
            <div className="category-error">
                {showCategoryDropDown && licenseType === "" ? "Please select license type first." : ""}
            </div>
        </>);
    };

    const SearchButtonHandler = () => {
        setIsFilteredListEmpty(false);
        if (SearchText.trim() !== "") {
            let filterResults: Array<DashboardObject> = searchByTextFilter();
            filterResults = filterLicenseCtegory(filterResults);
            filterResults = checkFilterStatus(filterResults);
            if (filterResults.length === 0) {
                setIsFilteredListEmpty(true);
                setFilteredListEmptyMsg(setEmptyMessageForFilteredData(""));
            } else {
                setIsFilteredListEmpty(false);
            }
            filterResults.sort((a: any, b: any) => {
                if (a.title.length > b.title.length) {
                    return 1;
                } else {
                    return -1;
                }
            });
            setFilteredData(filterResults);
            setRows(filterResults);
        } else {
            setRows(originalData);
        }
    };
    const searchByTextFilter = () => {
        return originalData.filter((obj: any) => {
            if (
                obj.title != null &&
                obj.title.toUpperCase().includes(SearchText.toUpperCase().trim()) &&
                String(obj.title.toUpperCase()).includes(
                    SearchText.trim().toUpperCase()
                )
            ) {
                return true;
            }
        });
    };

    const filterStatus = {
        published: "Published",
        draft: "Draft",
        new: "New",
        all: "All",
        inReview: "in-review",
    };

    const filterDataOnLicenseTypeOrCategoryChange = (
        licenseTypeId: number,
        categoryId: number
    ) => {
        let filterInfo: any;
        if (filterFirstRender === null || filterFirstRender === "") {
            setSearchText("");
        }
        filterInfo = originalData;
        if (licenseTypeId === 0 && categoryId !== 0) {
            setShowCategoryDropDown(true);
            setCategoryType("");
        } else {
            if (licenseTypeId > 1) {
                filterInfo = filterInfo.filter(
                    (item: any) => item.sopLicenseTypeId === licenseTypeId
                );
            }
            if (categoryId > 0) {
                filterInfo = filterInfo.filter(
                    (item: any) => item.sopCategoryId === categoryId
                );
            }
        }
        setFilteredData(filterInfo);
        resetSOPStatusFields();
        setfilteredDataOnClickOfSOPStatus(filterInfo, "all");
    };

    const statusBasedFilter = (status: string) => {
        let filterInfo: Array<DashboardObject> = [];
        if (originalData !== null && originalData.length > 0) {
            filterInfo = checkIfFirstRender();
            if (status !== null && status.trim() !== "") {
                filterInfo = checkForUserOrWriter(status, filterInfo);
            }
        }
        resetSOPStatusFields();
        setfilteredDataOnClickOfSOPStatus(filterInfo, status);
    };

    const checkForUserOrWriter = (
        status: string,
        filterInfo: Array<DashboardObject>
    ) => {
        if (!isUserDashboard) {
            if (status.trim().toLowerCase() !== "all") {
                filterInfo = writerFilterStatus(filterInfo, status);
            }
        } else {
            filterInfo = userFilterStatus(filterInfo, status);
        }
        return filterInfo;
    };
    const userFilterStatus = (
        filterUser: Array<DashboardObject>,
        filterUserText: string
    ) => {
        let filterCheckWhenNotNew: Array<DashboardObject>;
        if (filterUserText.trim().toLowerCase() === "new") {
            filterUser = filterUser.filter(
                (item: DashboardObject) => item.isRead === false
            );
        } else {
            if (filterUserText.trim().toLowerCase() !== "all") {
                filterCheckWhenNotNew = filterUser.filter(
                    (item: DashboardObject) =>
                        item.isRead === false &&
                        item.status.toLowerCase() === filterUserText.toLowerCase()
                );
                filterUser = filterUser.filter(
                    (item: DashboardObject) =>
                        item.status.trim().toUpperCase() ===
                        filterUserText.trim().toUpperCase() && item.isRead === true
                );
                filterUser = [...filterUser, ...filterCheckWhenNotNew];
            }
        }
        return filterUser;
    };
    const writerFilterStatus = (
        filterWriter: Array<DashboardObject>,
        filterWriterText: string
    ) => {
        let filterNew: Array<DashboardObject> = [];
        if (filterWriterText.trim().toLowerCase() === "published") {
            filterNew = filterWriter.filter(
                (item: DashboardObject) =>
                    item.isRead === false && item.status.toLowerCase() === "published"
            );
        } else {
            if (filterWriterText.trim().toLowerCase() === "draft") {
                filterNew = filterWriter.filter(
                    (item: DashboardObject) =>
                        item.isRead === false && item.status.toLowerCase() === "draft"
                );
            }
        }
        filterWriter = filterWriter.filter(
            (item: DashboardObject) =>
                item.status.trim().toUpperCase() ===
                filterWriterText.trim().toUpperCase() && item.isRead === true
        );
        filterWriter = [...filterWriter, ...filterNew];
        return filterWriter;
    };

    const checkIfFirstRender = () => {
        let filteredDataFirstRender: Array<DashboardObject> = [];
        filteredDataFirstRender =
            Number(licenseType) === 0 && Number(categoryType) === 0
                ? originalData
                : filteredData;
        if (renderFilteredData && SearchText !== "") {
            filteredDataFirstRender = filteredData;
        }
        if (renderFilteredData === false) {
            setSearchText("");
            if (Number(licenseType) !== 0 && SearchText !== "") {
                filteredDataFirstRender = originalData;
                setCategoryType("");
                setLicenseType("");
            }
        }
        return filteredDataFirstRender;
    };

    const setfilteredDataOnClickOfSOPStatus = (
        filteringData: any,
        status: string
    ) => {
        if (status.trim().toLowerCase() === "all") {
            setIsAllFilterStatus(true);
        } else if (status.trim().toLowerCase() === "published") {
            setIsPublishedFilterStatus(true);
        } else if (status.trim().toLowerCase() === "draft") {
            setIsDraftFilterStatus(true);
        } else if (status.trim().toLowerCase() === "new") {
            setIsNewFilterStatus(true);
        } else if (status.trim().toLowerCase() === "in-review") {
            setIsInReviewFilterStatus(true);
        } else {
            setIsAllFilterStatus(true);
        }
        setRows(getFilteredData(filteringData));
        if (filteringData.length === 0) {
            setIsFilteredListEmpty(true);
            setFilteredListEmptyMsg(setEmptyMessageForFilteredData(status));
        } else {
            setIsFilteredListEmpty(false);
        }
    };

    const setEmptyMessageForFilteredData = (status: string) => {
        switch (status.trim().toLowerCase()) {
            case "all":
                return "There is no SOP to view.";
            case "published":
                return "There is no Published SOP.";
            case "draft":
                return "There is no SOP in Draft state.";
            case "new":
                return "There is no New SOP.";
            case "in-review":
                return "There is no SOP to review.";
            default:
                return "No data is found matching the text you have provided.";
        }
    };

    const resetFields = () => {
        resetSOPStatusFields();
        setCategoryType("");
        setLicenseType("");
        setIsFilteredListEmpty(false);
    };

    const resetSOPStatusFields = () => {
        setIsPublishedFilterStatus(false);
        setIsDraftFilterStatus(false);
        setIsNewFilterStatus(false);
        setIsInReviewFilterStatus(false);
        setIsAllFilterStatus(false);
    };

    const bindLicenseTypeAndCategory = () => {
        Promise.all([
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
        ])
            .then(
                axios.spread((licenseTypeIdResp: any, sopCategoriesResp: any) => {
                    if (licenseTypeIdResp.status === 200) {
                        const tdata = licenseTypeIdResp.data.data;
                        const data = keyValueMapper(tdata);
                        setlicenseTypeIds(data);
                    }
                    if (
                        sopCategoriesResp.status === 200 &&
                        sopCategoriesResp.data.isSuccess === true
                    ) {
                        const categoriesArray = sopCategoriesResp.data.result.sort(
                            (a: any, b: any) => a.categoryName.localeCompare(b.categoryName)
                        );
                        setCategoriesToShow(categoriesArray);
                        setOriginalCategories(categoriesArray);
                    }
                })
            )
            .catch((error) => console.error(error));
    };

    const handleLicenseChange = (e: any) => {
        setShowCategoryDropDown(false);
        setLicenseType(e.target.value);
        const licenseId = parseInt(e.target.value);
        setCategoryType("");
        setIsFilteredListEmpty(false);
        const filteredCategories = originalCategories.filter(
            (categry: any) => categry.licenseTypeId === licenseId
        );

        setCategoriesToShow(
            e.target.value.trim() === "" ? originalCategories : filteredCategories
        );

        filterDataOnLicenseTypeOrCategoryChange(
            e.target.value.trim() === "" ? 0 : licenseId,
            0
        );
    };

    const clearSearchText = () => {
        let filterResults = originalData;
        if (licenseType !== "") {
            if (categoryType !== "") {
                filterResults = filterResults.filter(
                    (item: any) =>
                        item.sopLicenseTypeId === parseInt(licenseType) &&
                        item.sopCategoryId === parseInt(categoryType)
                );
            }
            if (categoryType === "") {
                filterResults = filterResults.filter(
                    (item: any) => item.sopLicenseTypeId === parseInt(licenseType)
                );
            }
        }

        setSearchText("");
        setRows(filterResults);
        setFilteredData(filterResults);
        resetSOPStatusFields();
        setIsAllFilterStatus(true);
        setfilteredDataOnClickOfSOPStatus(filterResults, "All");
    };

    const getSopDisplayStatus = (originalStatus: string) => {
        let displaySopStatus = originalStatus;

        const upperCaseStatus = originalStatus.toUpperCase();
        if (upperCaseStatus === "DRAFT") {
            displaySopStatus = "Saved";
        }
        if (upperCaseStatus === "IN-REVIEW") {
            displaySopStatus = "Review";
        }
        return displaySopStatus;
    };


    const getFilteredData = (filterData: any) => {
        if (filterData.length > 0) {
            return filterData.sort((a: any, b: any) => a.isRead - b.isRead || a.title.localeCompare(b.title));
        }
        else {
            return filterData;
        }
    };

    const ApprovalFilter = (): JSX.Element => {
        if (isUserDashboard && !isLeadOrManager) {
            return (
                <div className="ms-4">
                    <LinkWrapper
                        activeLink={isInReviewFilterStatus}
                        onClick={() => statusBasedFilter(filterStatus.inReview)}
                    >
                        Waiting for Approval
                    </LinkWrapper>
                </div>
            );
        } else {
            return <></>;
        }
    };

  return (
    <>
    <div className="container sop-dashboard-container form-container">
      <div className="d-flex">
        <div className="page-title">SOP</div>
        {isUserDashboard ? (
          <div className="ms-4 ms-auto">
            <BellIcon />
          </div>
        ) : (
          <Tooltip title="Create a New SOP">
            <AddCircleOutlinedIcon
              className="ms-auto AddCircleOutlineIconWrapper"
              onClick={() => {
                history.push("create-sop");
              }}
            />
          </Tooltip>
        )}
      </div>
      {sopListLength === 0 && !loading && (
        <h4 className="NoSOPText">There is no SOP to view</h4>
      )}
      {loader && sopListLength === 0 && <Loader />}
      {!loader && sopListLength > 0 && (
        <>
          <div className="mt-4">
            <div className="SearchContainerForSOP row">
              <div className="col-sm-3">
                <Select
                  name="licenseTypeId"
                  labelId="licenseType-label"
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  variant="filled"
                  className="input-form select-field SelectWrapper"
                  MenuProps={MenuPropsSelection}
                  IconComponent={CustomExpandMore}
                  value={licenseType}
                  onChange={(e: any) => {
                    setLicenseType(e.target.value);
                    handleLicenseChange(e);
                  }}
                  label="License type"
                  aria-label="All License Type"
                >
                  <MenuItem value="" className="abcdef" selected>
                    <span className="input-placeholder">
                      License type : All
                    </span>
                  </MenuItem>
                  {licenseTypeIds.map((licType) => (
                    <MenuItem key={`${licType.name}`} value={licType.id}>
                      {licType.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="col-sm-3">
                <InputLabel
                  id="categoryId-label"
                  sx={{
                    display: "none",
                  }}
                >
                  All Category
                </InputLabel>
                <Select
                  name="categoryId"
                  labelId="categoryId-label"
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  variant="filled"
                  className="input-form select-field SelectWrapper"
                  MenuProps={MenuPropsSelection}
                  IconComponent={CustomExpandMore}
                  value={categoryType}
                  onChange={(e: any) => {
                    setCategoryType(e.target.value);
                    filterDataOnLicenseTypeOrCategoryChange(
                      Number(licenseType),
                      e.target.value
                    );
                  }}
                  label="All category"
                  aria-label="All category"
                >
                  <MenuItem value="" className="abcdef" selected>
                    <span className="input-placeholder">
                      Category : All
                    </span>
                  </MenuItem>
                  {categoriesToShow.map((cat: any, index: number) => (
                    <MenuItem
                      key={`${cat.categoryName}-${index}`}
                      value={cat.categoryId}
                    >
                     <AddTooltip value={cat.categoryName} len={20} />
                    </MenuItem>
                  ))}
                </Select>
                <CheckForCategoryChooseError />
              </div>
              <div className="col-sm-6">
                <div className="d-flex">
                  <div style={{ width: "100%" }} className="me-3">
                    <TextField 
                      placeholder="Search by title"
                      type="text"
                      hiddenLabel
                      value={SearchText}
                      InputProps={{
                        style: {
                          fontSize: 16,
                        },

                                                    startAdornment: (
                                                        <InputAdornment position="start" >
                                                            <SearchIcon className="search-icon" />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <FieldIcon
                                                                onClick={() => {
                                                                    clearSearchText();
                                                                }}
                                                                SearchText={SearchText}
                                                            />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && SearchText.trim().length > 0) {
                                                        SearchButtonHandler();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    setSearchText(e.target.value);
                                                    resetSearchData(e.target.value);
                                                }}
                                                className="input-form SelectWrapper"
                                                inputProps={{ maxLength: 100 }}
                                            />
                                        </div>
                                        <div>
                                            <SearchButton
                                                SearchText={SearchText}
                                                SearchButtonHandler={SearchButtonHandler}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex FilterRowWrapper">

                                <div className="FilterByTextWrapper">Filter By:</div>
                                <div className="ms-4">
                                    <LinkWrapper
                                        activeLink={isAllFilterStatus}
                                        onClick={() => statusBasedFilter(filterStatus.all)}
                                    >
                                        All
                                    </LinkWrapper>
                                </div>

                                <ApprovalFilter />
                                {isUserDashboard && (
                                    <div className="ms-4">
                                        <LinkWrapper
                                            activeLink={isNewFilterStatus}
                                            onClick={() => statusBasedFilter(filterStatus.new)}
                                        >
                                            New
                                        </LinkWrapper>
                                    </div>
                                )}

                                <div className="ms-4">
                                    <LinkWrapper
                                        activeLink={isPublishedFilterStatus}
                                        onClick={() => statusBasedFilter(filterStatus.published)}
                                    >
                                        Published
                                    </LinkWrapper>
                                </div>

                                <div className="ms-4">
                                    <LinkWrapper
                                        activeLink={isDraftFilterStatus}
                                        onClick={() => statusBasedFilter(filterStatus.draft)}
                                    >
                                        Draft
                                    </LinkWrapper>
                                </div>
                            </div>
                            {!isFilteredListEmpty ? <>

          <div className="row">
            <div className="col-12 d-flex SopCardWrapper">
              {rows.map((item: any, ind: number) => (
                <div className="SopCard" key={`${ind}`}>
                  {item.isRead ? (
                    <div className="sop-card-status">
                      <StatusDiv className="d-flex">
                        {StatusNameCheck(item)}
                      </StatusDiv>
                      <SopStatus className="ms-auto">
                        V {VersionCheck(item)}
                      </SopStatus>
                    </div>
                  ) : (
                    <SopCardHoverWrapper className="sop-card-status">
                      <StatusDiv className="status-new">New</StatusDiv>
                      <PublishStatusDiv>
                        {StatusNameCheck(item)}
                      </PublishStatusDiv>
                      <SopStatus className="ms-auto">
                        V {VersionCheck(item)}
                      </SopStatus>
                    </SopCardHoverWrapper>
                  )}
                  <div className="SopCardBody">
                    <AddTooltip value={item.title} len={30} />
                  </div>
                  <div className="BottomData">
                    <hr className="HorizonatalLine" />
                    <div className="d-flex m-2">
                      <div className="CardLocation">
                        {(item.city + item.state).length > 15 ? (
                          <CustomizedTooltip
                            title={item.city + ", " + item.state}
                            arrow
                          >
                            <InputLabel className="button-link">

                                                                        {(item.city + ", " + item.state).slice(0, 15) +
                                                                            "..."}
                                                                    </InputLabel>
                                                                </CustomizedTooltip>
                                                            ) : (
                                                                <InputLabel className="button-link">
                                                                    {item.city + ", " + item.state}
                                                                </InputLabel>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="ms-auto CardSeeDetails"
                                                            onClick={() => {
                                                                isFilterCheck();
                                                                history.push("/sop-details", {
                                                                    sopId: item.sopId,
                                                                    status: getSopDisplayStatus(item.status),
                                                                    isUser: isUserDashboard,
                                                                    revisionId: item.sopRevisionId,
                                                                    filterText: filterText,
                                                                    searchTextItem:
                                                                        SearchText === "" ? null : SearchText,
                                                                    licenseFilter:
                                                                        Number(licenseType) === 0
                                                                            ? null
                                                                            : Number(licenseType),
                                                                    categoryFilter:
                                                                        Number(categoryType) === 0
                                                                            ? null
                                                                            : Number(categoryType),
                                                                });
                                                            }}
                                                        >
                                                            See Details
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </> : ''}

                        </div>
                    </>
                )}

            </div>
            <div className=" data-empty-text ">
                <p >{isFilteredListEmpty ? filteredListEmptyMsg : ""}</p>
            </div>
        </>
    );
};
export default SopDashboard;
