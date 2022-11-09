import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BellIcon from "../../../components/Icons/BellIcon";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { MenuItem, Select } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import AddTooltip from "../../../components/AddTooltip";
import SearchButton from "../../../components/Mui/SearchButton";
import SearchField from "../../../components/Mui/SearchField";
import SuccessToaster from "../../../components/SuccessToaster";
import { GET_ALL_TASK } from "../../../networking/httpEndPoints";
import {
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
  GeneralManager,
  TeamLead,
} from "../../../utilities/constants";
import { decodeToken } from "../../../utilities/decodeToken";
import { roleValidator } from "../../../utilities/roleValidator";
import TaskForm from "./TaskForm";

const useStyles = makeStyles({
  container: {
    "&::-webkit-scrollbar": {
      width: "10px",
    } /* Chrome */,
    "&::-webkit-scrollbar-thumb": {
      background: "grey !important",
      borderRadius: "5px",
      height: "62px",
    },
  },
});

const taskCreatedByData: any = [
  { Id: "1", TaskCreatedBy: "All" },
  { Id: "2", TaskCreatedBy: "Created by me" },
  { Id: "3", TaskCreatedBy: "Assigned to me" },
];

const CustomExpandMore = ({ ...rest }) => {
  return <ExpandMoreIcon {...rest} />;
};

interface TaskResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

type TaskStringType = string | null | undefined;

interface TaskObject {
  taskTitle: TaskStringType;
  taskStatus: TaskStringType;
  createdOn: TaskStringType;
  taskId: number;
  assignedToId: number;
  createdById: number;
  assignedTo: TaskStringType;
  createdBy: TaskStringType;
}

type RowType = {
  taskTitle: string | null | undefined;
  createdBy: string | null | undefined;
  taskId: number;
  createdOn: string | null | undefined;
  assignedTo: string | null | undefined;
  taskStatus: string | null | undefined;
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
const Tasks: React.FC = () => {
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const userState = useSelector((state: DashboardType) => state.user);
  const [open, setOpen] = React.useState(false);
  const handleAddTask = () => {
    return setOpen(true);
  };

  const classes = useStyles();
  const [rows, setRows] = useState<any | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [SearchText, setSearchText] = useState("");

  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  let ascRows: any;
  const [isTaskTitleSorted, setIsTaskTitleSorted] = useState<boolean>(false);
  const [isTaskTitleSortedDsc, setIsTaskTitleSortedDsc] =
    useState<boolean>(false);
  const [isCreatedBySorted, setIsCreatedBySorted] = useState<boolean>(false);
  const [isCreatedBySortedDsc, setIsCreatedBySortedDsc] =
    useState<boolean>(false);
  const [isCreatedOnSorted, setIsCreatedOnSorted] = useState<boolean>(false);
  const [isCreatedOnSortedDsc, setIsCreatedOnSortedDsc] =
    useState<boolean>(false);
  const [isAssignedToSorted, setIsAssignedToSorted] = useState<boolean>(false);
  const [isAssignedToSortedDsc, setIsAssignedToSortedDsc] =
    useState<boolean>(false);
  const [isTaskStatusSorted, setIsTaskStatusSorted] = useState<boolean>(false);
  const [isTaskStatusSortedDsc, setIsTaskStatusSortedDsc] =
    useState<boolean>(false);
  const [SelectedFilterBy, setSelectedFilterBy] = useState<string>("All");
  const [createdByMe, SetCreatedByMe] = useState([]);
  const [assignToMe, SetassignToMe] = useState([]);
  const [taskSearched, SetTaskSearched] = useState<boolean>(false);
  const [searchedRows, setSearchedRows] = useState([]);

  const getTaskData = () => {
    setOriginalData([]);
    axios
      .get<TaskResponse>(GET_ALL_TASK, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          setIsEmpty(false);
          setOriginalData(res.data.result);
          setRows(res.data.result);
        } else if (res.status === 200 && res.data.isSuccess === false) {
          setIsEmpty(true);
          setRows(null);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      });
  };

  useEffect(() => {
    if (rows == null) {
      getTaskData();
    }
  }, []);
  const SortRows = (orderBy: string, orderType: string) => {
    if (rows !== null) {
      ascRows = [...rows];
      ascRows = ascRows.sort((a: any, b: any) => {
        const textA = a[orderBy].toUpperCase();

        const textB = b[orderBy].toUpperCase();
        if (textA < textB) {
          return -1;
        } else if (textA > textB) {
          return 1;
        } else {
          return 0;
        }
      });
      if (orderType === "asc") {
        setRows(ascRows);
      } else if (orderType === "dsc") {
        setRows(ascRows.reverse());
      } else {
        return;
      }
    }
  };

  const SearchButtonHandler = () => {
    if (SearchText.trim() !== "") {
      setIsTaskTitleSorted(false);
      setIsTaskTitleSortedDsc(false);
      setIsCreatedBySorted(false);
      setIsCreatedBySortedDsc(false);
      setIsCreatedOnSorted(false);
      setIsCreatedOnSortedDsc(false);
      setIsAssignedToSorted(false);
      setIsAssignedToSortedDsc(false);
      setIsTaskStatusSorted(false);
      setIsTaskStatusSortedDsc(false);

      const filteredResults = searchByTextFilter();

      if (filteredResults.length === 0) {
        setIsSearchEmpty(true);
      } else {
        setIsSearchEmpty(false);
      }
      setRows(filteredResults);
      SetTaskSearched(true);
    } else {
      setRows(originalData);
    }
  };

  const searchByTextFilter: any = () => {
    let result = originalData;
    if (SelectedFilterBy === "Created by me") {
      result = createdByMe;
    } else if (SelectedFilterBy === "Assigned to me") {
      result = assignToMe;
    }

    const textFilterData: any = result.filter((obj: any) => {
      if (
        obj.taskTitle != null &&
        obj.taskTitle.toUpperCase().includes(SearchText.toUpperCase().trim()) &&
        String(obj.taskTitle.toUpperCase()).includes(
          SearchText.trim().toUpperCase()
        )
      ) {
        return true;
      }
    });

    textFilterData.sort((a: any, b: any) => {
      if (
        a.taskTitle.toLowerCase().indexOf(SearchText.toLowerCase()) >
        b.taskTitle.toLowerCase().indexOf(SearchText.toLowerCase())
      ) {
        return 1;
      } else if (
        a.taskTitle.toLowerCase().indexOf(SearchText.toLowerCase()) <
        b.taskTitle.toLowerCase().indexOf(SearchText.toLowerCase())
      ) {
        return -1;
      } else {
        if (a.taskTitle > b.taskTitle) return 1;
        else return -1;
      }
    });
    setSearchedRows(textFilterData);
    return textFilterData;
  };

  const resetSearchData = (searchText:string) => {
    if (!searchText) {
      setIsSearchEmpty(false);
      let result = originalData;
      if (SelectedFilterBy === "Created by me") {
        result = createdByMe;
      } else if (SelectedFilterBy === "Assigned to me") {
        result = assignToMe;
      }

      setRows(result);
    }
  };

  const handleSortData = () => {
    if (SearchText.trim() !== "") {
      const filterResults = searchByTextFilter();
      if (filterResults.length === 0) {
        setIsSearchEmpty(true);
      } else {
        setIsSearchEmpty(false);
      }
      setRows(filterResults);
    } else {
      setRows(originalData);
    }
  };
  const HndleTaskTitleSorting = () => {
    if (isCreatedBySorted) {
      setIsCreatedBySorted((prevIsCreatedBySorted) => !prevIsCreatedBySorted);
      setIsCreatedBySortedDsc(false);
    }
    if (isCreatedOnSorted) {
      setIsCreatedOnSorted((prevIsCreatedOnSorted) => !prevIsCreatedOnSorted);
      setIsCreatedOnSortedDsc(false);
    }
    if (isAssignedToSorted) {
      setIsAssignedToSorted(
        (prevIsAssignedToSorted) => !prevIsAssignedToSorted
      );
      setIsAssignedToSortedDsc(false);
    }
    if (isTaskStatusSorted) {
      setIsTaskStatusSorted(
        (prevIsTaskStatusSorted) => !prevIsTaskStatusSorted
      );
      setIsTaskStatusSortedDsc(false);
    }

    if (isTaskTitleSorted === false) {
      setIsTaskTitleSorted((prevIsTaskTitleSorted) => !prevIsTaskTitleSorted);
      SortRows("taskTitle", "asc");
    } else if (isTaskTitleSorted === true && isTaskTitleSortedDsc === false) {
      setIsTaskTitleSortedDsc(
        (prevIsTaskTitleSortedDsc) => !prevIsTaskTitleSortedDsc
      );
      SortRows("taskTitle", "dsc");
    } else if (isTaskTitleSorted === true && isTaskTitleSortedDsc === true) {
      setIsTaskTitleSorted((prevIsTaskTitleSorted) => !prevIsTaskTitleSorted);
      setIsTaskTitleSortedDsc(
        (prevIsTaskTitleSortedDsc) => !prevIsTaskTitleSortedDsc
      );
      handleSortData();
    }
  };

  const HndleCreatedBySortingCondition = () => {
    if (isCreatedOnSorted) {
      setIsCreatedOnSorted((prevIsCreatedOnSorted) => !prevIsCreatedOnSorted);
      setIsCreatedOnSortedDsc(false);
    }
    if (isAssignedToSorted) {
      setIsAssignedToSorted(
        (prevIsAssignedToSorted) => !prevIsAssignedToSorted
      );
      setIsAssignedToSortedDsc(false);
    }
    if (isTaskStatusSorted) {
      setIsTaskStatusSorted(
        (prevIsTaskStatusSorted) => !prevIsTaskStatusSorted
      );
      setIsTaskStatusSortedDsc(false);
    }

    if (isTaskTitleSorted) {
      setIsTaskTitleSorted((prevIsTaskTitleSorted) => !prevIsTaskTitleSorted);
      setIsTaskTitleSortedDsc(false);
    }
  };

  const HndleCreatedBySorting = () => {
    HndleCreatedBySortingCondition();
    if (isCreatedBySorted === false) {
      setIsCreatedBySorted((prevIsCreatedBySorted) => !prevIsCreatedBySorted);
      SortRows("createdBy", "asc");
    } else if (isCreatedBySorted === true && isCreatedBySortedDsc === false) {
      setIsCreatedBySortedDsc(
        (prevIsCreatedBySortedDsc) => !prevIsCreatedBySortedDsc
      );
      SortRows("createdBy", "dsc");
    } else if (isCreatedBySorted === true && isCreatedBySortedDsc === true) {
      setIsCreatedBySorted((prevIsCreatedBySorted) => !prevIsCreatedBySorted);
      setIsCreatedBySortedDsc(
        (prevIsCreatedBySortedDsc) => !prevIsCreatedBySortedDsc
      );
      handleSortData();
    }
  };
  const HndleCreatedOnSorting = () => {
    if (isCreatedBySorted) {
      setIsCreatedBySorted((prevIsCreatedBySorted) => !prevIsCreatedBySorted);
      setIsCreatedBySortedDsc(false);
    }

    if (isAssignedToSorted) {
      setIsAssignedToSorted(
        (prevIsAssignedToSorted) => !prevIsAssignedToSorted
      );
      setIsAssignedToSortedDsc(false);
    }
    if (isTaskStatusSorted) {
      setIsTaskStatusSorted(
        (prevIsTaskStatusSorted) => !prevIsTaskStatusSorted
      );
      setIsTaskStatusSortedDsc(false);
    }
    if (isTaskTitleSorted) {
      setIsTaskTitleSorted((prevIsTaskTitleSorted) => !prevIsTaskTitleSorted);
      setIsTaskTitleSortedDsc(false);
    }
    if (isCreatedOnSorted === false) {
      setIsCreatedOnSorted((prevIsCreatedOnSorted) => !prevIsCreatedOnSorted);
      SortRows("createdOn", "asc");
    } else if (isCreatedOnSorted === true && isCreatedOnSortedDsc === false) {
      setIsCreatedOnSortedDsc(
        (prevIsCreatedOnSortedDsc) => !prevIsCreatedOnSortedDsc
      );
      SortRows("createdOn", "dsc");
    } else if (isCreatedOnSorted === true && isCreatedOnSortedDsc === true) {
      setIsCreatedOnSorted((prevIsCreatedOnSorted) => !prevIsCreatedOnSorted);
      setIsCreatedOnSortedDsc(
        (prevIsCreatedOnSortedDsc) => !prevIsCreatedOnSortedDsc
      );
      handleSortData();
    }
  };
  const HndleAssignedToSorting = () => {
    if (isCreatedBySorted) {
      setIsCreatedBySorted((prevIsCreatedBySorted) => !prevIsCreatedBySorted);
      setIsCreatedBySortedDsc(false);
    }
    if (isCreatedOnSorted) {
      setIsCreatedOnSorted((prevIsCreatedOnSorted) => !prevIsCreatedOnSorted);
      setIsCreatedOnSortedDsc(false);
    }

    if (isTaskStatusSorted) {
      setIsTaskStatusSorted(
        (prevIsTaskStatusSorted) => !prevIsTaskStatusSorted
      );
      setIsTaskStatusSortedDsc(false);
    }
    if (isTaskTitleSorted) {
      setIsTaskTitleSorted((prevIsTaskTitleSorted) => !prevIsTaskTitleSorted);
      setIsTaskTitleSortedDsc(false);
    }
    if (isAssignedToSorted === false) {
      setIsAssignedToSorted(
        (prevIsAssignedToSorted) => !prevIsAssignedToSorted
      );
      SortRows("assignedTo", "asc");
    } else if (isAssignedToSorted === true && isAssignedToSortedDsc === false) {
      setIsAssignedToSortedDsc(
        (prevIsAssignedToSortedDsc) => !prevIsAssignedToSortedDsc
      );
      SortRows("assignedTo", "dsc");
    } else if (isAssignedToSorted === true && isAssignedToSortedDsc === true) {
      setIsAssignedToSorted(
        (prevIsAssignedToSorted) => !prevIsAssignedToSorted
      );
      setIsAssignedToSortedDsc(
        (prevIsAssignedToSortedDsc) => !prevIsAssignedToSortedDsc
      );
      handleSortData();
    }
  };
  const HndleTaskStatusSorting = () => {
    if (isCreatedBySorted) {
      setIsCreatedBySorted((prevIsCreatedBySorted) => !prevIsCreatedBySorted);
      setIsCreatedBySortedDsc(false);
    }
    if (isCreatedOnSorted) {
      setIsCreatedOnSorted((prevIsCreatedOnSorted) => !prevIsCreatedOnSorted);
      setIsCreatedOnSortedDsc(false);
    }
    if (isAssignedToSorted) {
      setIsAssignedToSorted(
        (prevIsAssignedToSorted) => !prevIsAssignedToSorted
      );
      setIsAssignedToSortedDsc(false);
    }

    if (isTaskTitleSorted) {
      setIsTaskTitleSorted((prevIsTaskTitleSorted) => !prevIsTaskTitleSorted);
      setIsTaskTitleSortedDsc(false);
    }
    if (isTaskStatusSorted === false) {
      setIsTaskStatusSorted(
        (prevIsTaskStatusSorted) => !prevIsTaskStatusSorted
      );
      SortRows("taskStatus", "asc");
    } else if (isTaskStatusSorted === true && isTaskStatusSortedDsc === false) {
      setIsTaskStatusSortedDsc(
        (prevIsTaskStatusSortedDsc) => !prevIsTaskStatusSortedDsc
      );
      SortRows("taskStatus", "dsc");
    } else if (isTaskStatusSorted === true && isTaskStatusSortedDsc === true) {
      setIsTaskStatusSorted(
        (prevIsTaskStatusSorted) => !prevIsTaskStatusSorted
      );
      setIsTaskStatusSortedDsc(
        (prevIsTaskStatusSortedDsc) => !prevIsTaskStatusSortedDsc
      );
      handleSortData();
    }
  };

  const addTaskData = () => {
    setConfirmationModalIsVisible(true);
    setTimeout(() => {
      setConfirmationModalIsVisible(false);
    }, 4000);
  };

  const AddTaskValidator = (): JSX.Element => {
    if (
      roleValidator(userState["role"]) === SystemAdministrator ||
      roleValidator(userState["role"]) === DirectorOfCompliance ||
      roleValidator(userState["role"]) === ComplianceAnalyst ||
      roleValidator(userState["role"]) === DirectorOfRetailOperations ||
      roleValidator(userState["role"]) === GeneralManager ||
      roleValidator(userState["role"]) === TeamLead
    ) {
      return (
        <Tooltip title="Add a New Task">
          <AddCircleOutlinedIcon
            className="mt-3 ms-auto AddCircleOutlineIconWrapper"
            onClick={handleAddTask}
          />
        </Tooltip>
      );
    } else {
      return <></>;
    }
  };

  const SuccessMessage = (): JSX.Element => {
    if (confirmationModalIsVisible) {
      return <SuccessToaster message="Task Created" />;
    } else {
      return <></>;
    }
  };

  const NoDataFoundMsz = (): JSX.Element => {
    if (rows.length === 0 && isSearchEmpty === false) {
      return <h4 className="NoTasksText">No Tasks Available</h4>;
    } else {
      return <></>;
    }
  };
  const SearchEmptyMsz = (): JSX.Element => {
    if (isSearchEmpty) {
      return (
        <p className="task-empty-text">
          No data is found matching the text you have provided.
        </p>
      );
    } else {
      return <></>;
    }
  };

  const StatusSortingIcon = (): JSX.Element => {
    if (!isTaskStatusSorted) {
      return <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>;
    } else {
      return <></>;
    }
  };
  const StatusSortingIconDown = (): JSX.Element => {
    if (isTaskStatusSorted && isTaskStatusSortedDsc) {
      return <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>;
    } else {
      return <></>;
    }
  };
  const StatusSortingIconUp = (): JSX.Element => {
    if (isTaskStatusSorted && !isTaskStatusSortedDsc) {
      return <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>;
    } else {
      return <></>;
    }
  };
  const CreatedSortingIcon = (): JSX.Element => {
    if (!isCreatedBySorted) {
      return <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>;
    } else {
      return <></>;
    }
  };
  const CreatedSortingIconDown = (): JSX.Element => {
    if (isCreatedBySorted && isCreatedBySortedDsc) {
      return <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>;
    } else {
      return <></>;
    }
  };
  const CreatedSortingIconUp = (): JSX.Element => {
    if (isCreatedBySorted && !isCreatedBySortedDsc) {
      return <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>;
    } else {
      return <></>;
    }
  };

  const token = localStorage.getItem("user");
  const GetLoggedInuser: any = () => {
    let userId = 0;
    if (token != null) {
      const userData = decodeToken(token);
      userId = userData.UserId;
    }
    return userId;
  };

  const checkIfTaskSearched = (id: number,searchFilter:string) => {
    let filterResults = [];
    if (taskSearched) {
      filterResults = searchedRows.filter((searchObj: TaskObject) => {
        if(searchFilter === "createdByMe"){
          return searchObj.createdById.toString() === id.toString();
        } else {
          return searchObj.assignedToId.toString() === id.toString();
        }
      });
    } else {
      filterResults = originalData.filter((originalObj: TaskObject) => {
        if(searchFilter === "createdByMe"){
          return originalObj.createdById.toString() === id.toString();
        } else {
          return originalObj.assignedToId.toString() === id.toString();
        }
      });
    }
    return filterResults;
  };

  const checkIfAllSearched = () => {
    if (taskSearched) {
      return searchedRows;
    } else {
      return originalData;
    }
  };

  const onCrossIconClick = () => {
    setIsSearchEmpty(false);
    SetTaskSearched(false);
  };
  const handleCreatedBySelectFieldChange = (e: any) => {
    setSelectedFilterBy(e.target.value);
    const loggedInUserId = GetLoggedInuser();
    if (e.target.value === "Created by me") {
      if (e.target.value !== "") {
        const filterResults = checkIfTaskSearched(loggedInUserId,"createdByMe");
        SetCreatedByMe(filterResults);
        setRows(filterResults);
      } else {
        setRows(originalData);
      }
    } else if (e.target.value === "All") {
      const result = checkIfAllSearched();
      setRows(result);
    } else if (e.target.value === "Assigned to me") {
      const filterResults = checkIfTaskSearched(loggedInUserId,"assignedToMe");
      SetassignToMe(filterResults);
      setRows(filterResults);
    }
  };

  const history = useHistory();
  return (
    <div className="container task-page-wrapper ">
      <div className="pt-16 form-container">
        <TaskForm
          setOpen={setOpen}
          open={open}
          getTaskData={getTaskData}
          addTaskData={addTaskData}
          fromLicense={false}
          fromNotification={false}
        />
        <div className="d-flex">
          <div className="page-title">Tasks</div>
          <AddTaskValidator />
          <div className="ms-3">
            <BellIcon />
          </div>
        </div>

        {!rows && isEmpty && <h4 className="NoTasksText">No Tasks Found</h4>}
        {!rows && !isEmpty && (
          <div className="LoaderWrapper">
            <CircularProgress />
          </div>
        )}
        {rows && (
          <>
            <div className=" SearchContainer">
              <div className="me-2 ms-3 select-container-width">
                <Select
                  name="TaskCreatdBySelectWrapper"
                  displayEmpty
                  value={SelectedFilterBy}
                  disabled={false}
                  inputProps={{ "aria-label": "Without label" }}
                  variant="filled"
                  className="input-form select-field SelectWrapper select-placeholder-text-color"
                  renderValue={(value)=> value !== "" ? `Filter By: ${SelectedFilterBy}`:"Filter By: "}
                  IconComponent={CustomExpandMore}
                  onChange={(e) => {
                    handleCreatedBySelectFieldChange(e);
                  }}
                  label="All CreatedByMe"
                  aria-label="All CreatedByMe"
                  MenuProps={{ MenuListProps: { disablePadding: true } }}
                >
                  {taskCreatedByData.map((type: any) => (
                    <MenuItem key={type.Id} value={type.TaskCreatedBy}>
                      {type.TaskCreatedBy}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              <div style={{ width: "100%" }} className="mx-2">
                <SearchField
                  SearchText={SearchText}
                  Placeholder="Search task"
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
                  className={classes.container}
                  style={{
                    backgroundColor: "#f4f5f8",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    maxHeight: "80vh",
                  }}
                >
                  <Table sx={{ minWidth: 650 }} aria-label="TaskTableDetails">
                    <colgroup>
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "17%" }} />
                      <col style={{ width: "17%" }} />
                      <col style={{ width: "16%" }} />
                    </colgroup>
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
                        <TableCell className="TableHeaderWrapper">
                          Task Title
                          <div
                            className="SortingIcon"
                            onClick={() => {
                              HndleTaskTitleSorting();
                            }}
                          >
                            {!isTaskTitleSorted && (
                              <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
                            )}
                            {isTaskTitleSorted && isTaskTitleSortedDsc && (
                              <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
                            )}
                            {isTaskTitleSorted && !isTaskTitleSortedDsc && (
                              <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="TableHeaderWrapper">
                          Created by
                          <div
                            className="SortingIcon"
                            onClick={() => {
                              HndleCreatedBySorting();
                            }}
                          >
                            <CreatedSortingIcon />
                            <CreatedSortingIconDown />
                            <CreatedSortingIconUp />
                          </div>
                        </TableCell>
                        <TableCell className="TableHeaderWrapper">
                          Created on
                          <div
                            className="SortingIcon"
                            onClick={() => {
                              HndleCreatedOnSorting();
                            }}
                          >
                            {!isCreatedOnSorted && (
                              <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
                            )}
                            {isCreatedOnSorted && isCreatedOnSortedDsc && (
                              <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
                            )}
                            {isCreatedOnSorted && !isCreatedOnSortedDsc && (
                              <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="TableHeaderWrapper">
                          Assigned to
                          <div
                            className="SortingIcon"
                            onClick={() => {
                              HndleAssignedToSorting();
                            }}
                          >
                            {!isAssignedToSorted && (
                              <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
                            )}
                            {isAssignedToSorted && isAssignedToSortedDsc && (
                              <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
                            )}
                            {isAssignedToSorted && !isAssignedToSortedDsc && (
                              <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="TableHeaderWrapper">
                          Task Status
                          <div
                            className="SortingIcon"
                            onClick={() => {
                              HndleTaskStatusSorting();
                            }}
                          >
                            <StatusSortingIcon />
                            <StatusSortingIconUp />
                            <StatusSortingIconDown />
                          </div>
                        </TableCell>
                        <TableCell className="TableHeaderWrapper"></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {rows.map((row: RowType) => (
                        <TableRow
                          key={row.taskId}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            className="TableRowsWrapper"
                            component="th"
                            scope="row"
                          >
                            <span className="ClientNameWrap">
                              <AddTooltip value={row.taskTitle} len={25} />
                            </span>
                          </TableCell>
                          <TableCell className="TableRowsWrapper">
                            <span className="ClientNameWrap">
                              {row.createdBy}
                            </span>
                          </TableCell>
                          <TableCell className="TableRowsWrapper">
                            {moment(row.createdOn).format("MM/DD/YYYY")}
                          </TableCell>
                          <TableCell className="TableRowsWrapper">
                            <span className="ClientNameWrap">
                              <AddTooltip value={row.assignedTo} len={25} />
                            </span>
                          </TableCell>
                          <TableCell className="TableRowsWrapper">
                            {row.taskStatus}
                          </TableCell>
                          <TableCell className="TableRowsWrapper">
                            <div
                              className="TaskDetailWrapper"
                              onClick={() =>
                                (roleValidator(userState["role"]) ===
                                  SystemAdministrator ||
                                  roleValidator(userState["role"]) ===
                                  DirectorOfCompliance ||
                                  roleValidator(userState["role"]) ===
                                  ComplianceAnalyst ||
                                  roleValidator(userState["role"]) ===
                                  DirectorOfRetailOperations ||
                                  roleValidator(userState["role"]) ===
                                  GeneralManager ||
                                  roleValidator(userState["role"]) ===
                                  TeamLead) &&
                                history.push("/task-details", {
                                  organizationTaskId: row.taskId,
                                })
                              }
                            >
                              <span className="detail-page-text">See Task Details</span>
                              <ChevronRightIcon />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <SearchEmptyMsz />
            <NoDataFoundMsz />
            <SuccessMessage />
                </TableContainer>
              </div>



          </>
        )}
      </div>
    </div>
  );
};

export default Tasks;
