import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BellIcon from "../../components/Icons/BellIcon";
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import AddTooltip from '../../components/AddTooltip';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ImportEmployeeRespModal from '../../components/Employee/ImportEmployeeRespModal';
import ColGroup from '../../components/Mui/ColGroup';
import SearchButton from '../../components/Mui/SearchButton';
import SearchField from '../../components/Mui/SearchField';
import { SortRows } from '../../components/SetRows';
import { GET_ALL_EMPLOYEES, GET_LOCATIONS_BY_ORGANIZATION_ID } from '../../networking/httpEndPoints';
import {
    SystemAdministrator,
    DirectorOfCompliance,
} from '../../utilities/constants';
import { roleFormatter } from '../../utilities/formatter';
import { roleValidator } from '../../utilities/roleValidator';
import AddEmployeeDialogBox from '../DashboardEmployee/AddEmployeeDialogBox';
import AssignLocationDialogBox from '../Dashboard/Locations/AssignLocationDialogBox';

const useStyles = makeStyles({
    container: {
        '&::-webkit-scrollbar': {
            width: '10px',
        } /* Chrome */,
        '&::-webkit-scrollbar-thumb': {
            background: 'grey !important',
            borderRadius: '5px',
            height: '62px',
        },
    },
});

type RowType = {
    name: string | null | undefined;
    role: string | null | undefined;
    otherRoleDescription: string | null;
    email: string | null | undefined;
    badgeID: any;
    badges: Badgetype;
    employeeId: string | null | undefined;
};

interface BadgeObj {
    name: string | null | undefined;
    status: string | null | undefined;
}
type Badgetype = BadgeObj[];
interface LoginTokenType {
    user: {
        organizationId?: number | null;
        role: string;
    };
}
interface EmployeeResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
}
interface LocationResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
}

export default function DashboardEmployee() {
    const history = useHistory();
    const classes = useStyles();
    const [rows, setRows] = useState<any | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [openAddEmployee, setOpenAddEmployee] = React.useState(false);
    const userState = useSelector((state: LoginTokenType) => state.user);
    const [SearchText, setSearchText] = useState('');

    let ascRows: any;
    const [isNameSorted, setIsNameSorted] = useState<boolean>(false);
    const [isNameSortedDsc, setIsNameSortedDsc] = useState<boolean>(false);
    const [isRoleSorted, setIsRoleSorted] = useState<boolean>(false);
    const [isRoleSortedDsc, setIsRoleSortedDsc] = useState<boolean>(false);
    const [isEmailSorted, setIsEmailSorted] = useState<boolean>(false);
    const [isEmailSortedDsc, setIsEmailSortedDsc] = useState<boolean>(false);
    const [isBadgeSorted, setIsBadgeSorted] = useState<boolean>(false);
    const [isBadgeSortedDsc, setIsBadgeSortedDsc] = useState<boolean>(false);
    const [originalData, setOriginalData] = useState([]);
    const [isSearchEmpty, setIsSearchEmpty] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importResponseData, setImportResponseData] = useState([]);
    const [successRecords, setSuccessRecords] = useState([]);
    const [failedRecords, setFailedRecords] = useState([]);
    const [HandleBtnDisable, setHandleBtnDisable] = React.useState(false);
    const [cleanInputs, setCleanInputs] = React.useState(false);
    const [ManualEmpBtn, setManualEmpBtn] = React.useState(false);
    const [openAssignLocation, setOpenAssignLocation] = useState(false);

    const handleAddEmployee = () => {
        setOpenAddEmployee(true);
    };

    const EmpResModalCancel = () => {
        setImportDialogOpen(false);
        setManualEmpBtn(false);
    };

    const getLocationData = () => {
        setOriginalData([]);
        const token = localStorage.getItem('user');
        axios
            .get<LocationResponse>(`${GET_LOCATIONS_BY_ORGANIZATION_ID}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.status === 200 && res.data.isSuccess === true) {
                    setIsEmpty(false);
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
    const getEmployeeData = () => {
        setOriginalData([]);
        const token = localStorage.getItem('user');
        axios
            .get<EmployeeResponse>(`${GET_ALL_EMPLOYEES}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => {
                if (res.status === 200 && res.data.isSuccess === true) {
                    setIsEmpty(false);
                    setRows(res.data.result);
                    setOriginalData(res.data.result);
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

    useEffect(() => {
        if (rows == null) {
            getEmployeeData();
        }
    }, []);

    const handleSortData = () => {
        if (SearchText.trim() !== '') {
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

    const HndleEmployeeNameSorting = () => {
        if (isRoleSorted) {
            setIsRoleSorted((prevIsRoleSorted) => !prevIsRoleSorted);
            setIsRoleSortedDsc(false);
        }
        if (isEmailSorted) {
            setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
            setIsEmailSortedDsc(false);
        }
        if (isBadgeSorted) {
            setIsBadgeSorted((prevIsBadgeSorted) => !prevIsBadgeSorted);
            setIsBadgeSortedDsc(false);
        }
        if (isNameSorted === false) {
            setIsNameSorted((prevIsNameSorted) => !prevIsNameSorted);
            SortRows('name', 'asc', { ascRows, rows, setRows });
        } else if (isNameSorted === true && isNameSortedDsc === false) {
            setIsNameSortedDsc((prevIsNameSortedDsc) => !prevIsNameSortedDsc);
            SortRows('name', 'dsc', { ascRows, rows, setRows });
        } else if (isNameSorted === true && isNameSortedDsc === true) {
            setIsNameSorted((prevIsNameSorted) => !prevIsNameSorted);
            setIsNameSortedDsc((prevIsNameSortedDsc) => !prevIsNameSortedDsc);
            handleSortData();
        }
    };

    const HndleEmployeeRoleSorting = () => {
        if (isNameSorted) {
            setIsNameSorted((prevIsNameSorted) => !prevIsNameSorted);
            setIsNameSorted(false);
        }
        if (isEmailSorted) {
            setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
            setIsEmailSortedDsc(false);
        }
        if (isBadgeSorted) {
            setIsBadgeSorted((prevIsBadgeSorted) => !prevIsBadgeSorted);
            setIsBadgeSortedDsc(false);
        }
        if (isRoleSorted === false) {
            setIsRoleSorted((prevIsRoleSorted) => !prevIsRoleSorted);
            SortRows('role', 'asc', { ascRows, rows, setRows });
        } else if (isRoleSorted === true && isRoleSortedDsc === false) {
            setIsRoleSortedDsc((prevIsRoleSortedDsc) => !prevIsRoleSortedDsc);
            SortRows('role', 'dsc', { ascRows, rows, setRows });
        } else if (isRoleSorted === true && isRoleSortedDsc === true) {
            setIsRoleSorted((prevIsRoleSorted) => !prevIsRoleSorted);
            setIsRoleSortedDsc((prevIsRoleSortedDsc) => !prevIsRoleSortedDsc);
            handleSortData();
        }
    };

    const HndleEmployeeEmailSorting = () => {
        if (isNameSorted) {
            setIsNameSorted((prevIsNameSorted) => !prevIsNameSorted);
            setIsNameSorted(false);
        }
        if (isRoleSorted) {
            setIsRoleSorted((prevIsRoleSorted) => !prevIsRoleSorted);
            setIsRoleSortedDsc(false);
        }
        if (isBadgeSorted) {
            setIsBadgeSorted((prevIsBadgeSorted) => !prevIsBadgeSorted);
            setIsBadgeSortedDsc(false);
        }
        if (isEmailSorted === false) {
            setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
            SortRows('email', 'asc', { ascRows, rows, setRows });
        } else if (isEmailSorted === true && isEmailSortedDsc === false) {
            setIsEmailSortedDsc((prevIsEmailSortedDsc) => !prevIsEmailSortedDsc);
            SortRows('email', 'dsc', { ascRows, rows, setRows });
        } else if (isEmailSorted === true && isEmailSortedDsc === true) {
            setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
            setIsEmailSortedDsc((prevIsEmailSortedDsc) => !prevIsEmailSortedDsc);
            handleSortData();
        }
    };
    const HndleEmployeeBadgeSorting = () => {
        if (isNameSorted) {
            setIsNameSorted((prevIsNameSorted) => !prevIsNameSorted);
            setIsNameSorted(false);
        }
        if (isRoleSorted) {
            setIsRoleSorted((prevIsRoleSorted) => !prevIsRoleSorted);
            setIsRoleSortedDsc(false);
        }
        if (isEmailSorted) {
            setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
            setIsEmailSortedDsc(false);
        }
        if (isBadgeSorted === false) {
            setIsBadgeSorted((prevIsBadgeSorted) => !prevIsBadgeSorted);
            SortRows('badgeID', 'asc', { ascRows, rows, setRows });
        } else if (isBadgeSorted === true && isBadgeSortedDsc === false) {
            setIsBadgeSortedDsc((prevIsBadgeSortedDsc) => !prevIsBadgeSortedDsc);
            SortRows('badgeID', 'dsc', { ascRows, rows, setRows });
        } else if (isBadgeSorted === true && isBadgeSortedDsc === true) {
            setIsBadgeSorted((prevIsBadgeSorted) => !prevIsBadgeSorted);
            setIsBadgeSortedDsc((prevIsBadgeSortedDsc) => !prevIsBadgeSortedDsc);
            handleSortData();
        }
    };

    const SearchButtonHandler = () => {
        if (SearchText.trim() !== '') {
            setIsNameSorted(false);
            setIsNameSortedDsc(false);
            setIsRoleSorted(false);
            setIsRoleSortedDsc(false);
            setIsEmailSorted(false);
            setIsEmailSortedDsc(false);
            setIsBadgeSorted(false);
            setIsBadgeSortedDsc(false);

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

    const searchByTextFilter = () => {
        return originalData.filter((obj: any) => {
            if (
                obj.name != null &&
                obj.name.toUpperCase().includes(SearchText.toUpperCase().trim()) &&
                String(obj.name.toUpperCase()).includes(SearchText.trim().toUpperCase())
            ) {
                return true;
            }
        });
    };

    const onCrossIconClick = () => {
        setIsSearchEmpty(false);
    };
    const resetSearchData = (searchText: string) => {
        if (!searchText) {
            setIsSearchEmpty(false);
            setRows(originalData);
        }
    };
    const AsssignLocationRender=(): JSX.Element =>{
        if (roleValidator(userState['role']) === SystemAdministrator ||
        roleValidator(userState['role']) === DirectorOfCompliance)
        {
          return (
            <div className="ms-3 pt-4 ArchiveLink" onClick={() => setOpenAssignLocation(true)}>Assign Location </div>
          );
        }else {
          return (<></>);
      }
      };
      const AddNewEmployeeRender=(): JSX.Element =>{
        if (roleValidator(userState['role']) === SystemAdministrator ||
        roleValidator(userState['role']) === DirectorOfCompliance)
        {
          return (
            <Tooltip title="Add a New Employee">
            <AddCircleOutlinedIcon
                className="mt-3 ms-3 AddCircleOutlineIconWrapper"
                onClick={handleAddEmployee}
            />
        </Tooltip>
          );
        }else {
          return (<></>);
      }
      };
      const EmployeeNameSortingRender=(): JSX.Element =>{
        if (!isNameSorted)
        {
          return (
            <UnfoldMoreIcon fontSize="small"/>
          );
        }
        if (isNameSorted && isNameSortedDsc)
        {
          return (
            <KeyboardArrowDownIcon fontSize="small"/>
          );
        }
        if (isNameSorted && !isNameSortedDsc)
        {
          return (
            <KeyboardArrowUpIcon fontSize="small"/>
          );
        }else {
          return (<></>);
      }
      };
      const EmployeeRoleSortingRender=(): JSX.Element =>{
        if (!isRoleSorted)
        {
          return (
            <UnfoldMoreIcon fontSize="small"/>
          );
        }
        if (isRoleSorted && isRoleSortedDsc)
        {
          return (
            <KeyboardArrowDownIcon fontSize="small"/>
          );
        }
        if (isRoleSorted && !isRoleSortedDsc)
        {
          return (
            <KeyboardArrowUpIcon fontSize="small"/>
          );
        }else {
          return (<></>);
      }
      };
      const EmailSortingRender=(): JSX.Element =>{
        if (!isEmailSorted)
        {
          return (
            <UnfoldMoreIcon fontSize="small"/>
          );
        }
        if (isEmailSorted && isEmailSortedDsc)
        {
          return (
            <KeyboardArrowDownIcon fontSize="small"/>
          );
        }
        if (isEmailSorted && !isEmailSortedDsc)
        {
          return (
            <KeyboardArrowUpIcon fontSize="small"/>
          );
        }
        else {
            return (<></>);
        }
      };
      const BadgeSortingRender=(): JSX.Element =>{
        if (!isBadgeSorted)
        {
          return (
            <UnfoldMoreIcon fontSize="small"/>
          );
        }
        if (isBadgeSorted && isBadgeSortedDsc)
        {
          return (
            <KeyboardArrowDownIcon fontSize="small"/>
          );
        }
        if (isBadgeSorted && !isBadgeSortedDsc)
        {
          return (
            <KeyboardArrowUpIcon fontSize="small"/>
          );
        }else {
            return (<></>);
        }
      };

    return (
        <div className="container employee-dashboard-container form-container">
            <div className="d-flex" style={{ justifyContent: 'space-between' }}>
                <div className="page-title">Employees</div>
                <div className="d-flex">
                    <div className="ms-4 pt-4 ArchiveLink hide-link">My Profile</div>
                 {AsssignLocationRender()}
                    <div className="ms-4 pt-4 ArchiveLink hide-link">Add a Badge</div>
                    <div className="ms-4 pt-4 ArchiveLink hide-link">Add a Role</div>
                    {openAssignLocation&&(
                    <AssignLocationDialogBox
                        openAssignLocation={openAssignLocation}
                        handleAssignLocation={() => setOpenAssignLocation(false)}
                        getLocationData={getLocationData}
                    />
                    )}
                    <AddEmployeeDialogBox
                        openAddEmployee={openAddEmployee}
                        setOpenAddEmployee={setOpenAddEmployee}
                        getEmployeeData={getEmployeeData}
                        open={importDialogOpen}
                        setOpen={setImportDialogOpen}
                        cleanInputs={cleanInputs}
                        setCleanInputs={setCleanInputs}
                        HandleBtnDisable={HandleBtnDisable}
                        setHandleBtnDisable={setHandleBtnDisable}
                        successRecords={successRecords}
                        setSuccessRecords={setSuccessRecords}
                        failedRecords={failedRecords}
                        setFailedRecords={setFailedRecords}
                        importResponseData={importResponseData}
                        setImportResponseData={setImportResponseData}
                        ManualEmpBtn={ManualEmpBtn}
                        setManualEmpBtn={setManualEmpBtn}
                    />
                      {AddNewEmployeeRender()}
                    <div className="ms-3">
                        <BellIcon />
                    </div>
                    <ImportEmployeeRespModal
                        open={importDialogOpen}
                        setOpen={setImportDialogOpen}
                        importResponseData={importResponseData}
                        setImportResponseData={setImportResponseData}
                        setCleanInputs={setCleanInputs}
                        setHandleBtnDisable={setHandleBtnDisable}
                        successRecords={successRecords}
                        setSuccessRecords={setSuccessRecords}
                        failedRecords={failedRecords}
                        setFailedRecords={setFailedRecords}
                        ManualEmpBtn={ManualEmpBtn}
                        setManualEmpBtn={setManualEmpBtn}
                        EmpResModalCancel={EmpResModalCancel}
                    />
                </div>
            </div>
            {!rows && isEmpty && (
                <h4 className="NoLocationsText">No Employees Found</h4>
            )}
            {!rows && !isEmpty && (
                <div className="LoaderWrapper">
                    <CircularProgress />
                </div>
            )}

            {rows && (
                <>
                    <div className="d-flex SearchContainer">
                        <div style={{ width: '100%' }} className="mx-3">
                            <SearchField
                                setSearchText={setSearchText}
                                resetSearchData={resetSearchData}
                                originalData={originalData}
                                setRows={setRows}
                                SearchText={SearchText}
                                Placeholder="Search employee by name"
                                SearchButtonHandler={SearchButtonHandler}
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
                                backgroundColor: '#f4f5f8',
                                paddingLeft: '5px',
                                paddingRight: '5px',
                                maxHeight: '80vh',
                            }}
                        >
                            <Table sx={{ minWidth: 650 }} aria-label="simple table employee">
                                <ColGroup />
                                <TableHead
                                    sx={{
                                        [`& .${tableCellClasses.root}`]: {
                                            borderBottom: 'none !important',
                                        },
                                        backgroundColor: '#f4f5f8',
                                        position: 'sticky',
                                        top: 0,
                                    }}
                                >
                                    <TableRow>
                                        <TableCell className="TableHeaderWrapper">
                                            Name
                                            <div className="SortingIcon"
                                                onClick={() => {
                                                    HndleEmployeeNameSorting();
                                                }}
                                            >
                                            {EmployeeNameSortingRender()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="TableHeaderWrapper">
                                            Role
                                            <div className="SortingIcon"
                                                onClick={() => {
                                                    HndleEmployeeRoleSorting();
                                                }}
                                            >
                                            {EmployeeRoleSortingRender()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="TableHeaderWrapper">
                                            Email
                                            <div className="SortingIcon"
                                                onClick={() => {
                                                    HndleEmployeeEmailSorting();
                                                }}
                                            >
                                             {EmailSortingRender()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="TableHeaderWrapper" align="left">
                                            <WarningAmberIcon className="warning-icon-style" />
                                            Badge I.D
                                            <div className="SortingIcon"
                                                onClick={() => {
                                                    HndleEmployeeBadgeSorting();
                                                }}
                                            >
                                              {BadgeSortingRender()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="TableHeaderWrapper"></TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {rows.map((row: RowType, index: number) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                            }}
                                        >
                                            <TableCell className="TableRowsWrapper" component="th" scope="row">
                                                <span className="ClientNameWrap"> <AddTooltip value={row.name} len={15} /></span>
                                            </TableCell>
                                            <TableCell className="TableRowsWrapper">
                                                <span className="ClientNameWrap">
                                                    {roleFormatter(row.role)}
                                                    {row.otherRoleDescription &&
                                                        ` (${row.otherRoleDescription})`}
                                                </span>
                                            </TableCell>
                                            <TableCell className="TableRowsWrapper">
                                                <span className="ClientNameWrap"> <AddTooltip value={row.email} len={20} /></span>
                                            </TableCell>
                                            <TableCell className="TableRowsWrapper" align="left">
                                                {row.badges.some((item: BadgeObj) => item.status === "Expiring Soon" || item.status === "Expired") && (
                                                    <Tooltip title="Badge needs attention" arrow>
                                                        <WarningAmberIcon className="warning-style" />
                                                    </Tooltip>
                                                )}
                                                {row.badges.every((item: BadgeObj) => item.status === "Active") && (
                                                    <WarningAmberIcon className="warning-active-style" />
                                                )}
                                                <Tooltip
                                                    title={row.badgeID.length > 11 ? row.badgeID : ''}
                                                    placement="top"
                                                    arrow
                                                >
                                                    <span className="ClientNameWrap">
                                                        {row.badgeID.length > 11
                                                            ? row.badgeID.slice(0, 11) + '...'
                                                            : row.badgeID}
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="TableRowsWrapper">
                                                <div className="EmployeeDetailWrapper"
                                                    onClick={() =>
                                                        history.push('/employee-details', {
                                                            employeeName: row.name,
                                                            employeeEmail: row.email,
                                                            employeeBadgeId: row.badgeID,
                                                            employeeRole: row.role,
                                                            employeeId: row.employeeId,
                                                            employeeOtherRoleDescription:
                                                                row.otherRoleDescription,
                                                        })
                                                    }
                                                >
                                                    <span className="detail-page-text">See Employee Details</span>
                                                    <ChevronRightIcon />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div style={{ textAlign: 'center' }}>
                                {isSearchEmpty
                                    ? 'No data is found matching the text you have provided.'
                                    : ''}
                            </div>
                        </TableContainer>
                    </div>
                </>
            )}
        </div>
    );
}
