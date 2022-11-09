import React, { useEffect, useState } from "react";

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Button, Paper } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import AddTooltip from "../../../components/AddTooltip";
import { GET_ALL_ORGANIZATION } from "../../../networking/httpEndPoints";
import SearchField from "../../../components/Mui/SearchField";

import Loader from "../../../components/Loader";
import Tooltip from "@mui/material/Tooltip";

interface CrossIconProps {
  SearchText: string;
}

const FieldIcon = styled(ClearOutlinedIcon)<CrossIconProps>`
  :hover {
    cursor: pointer;
  }
  display: ${(props) =>
    props.SearchText.length > 0 ? "block" : "none"} !important;
`;

interface CompanyResponse {
  status: number;
  data: {
    clientName: string;
    contactPhone: string;
    organizationId: number;
    contactEmail: string;
    accountNumber: string;
  };
}

type RowType = {
  clientName: string | null | undefined;
  contactPhone: string | null | undefined;
  organizationId: number;
  contactEmail: string | null | undefined;
  accountNumber: string | null | undefined;
};

const AdminDashboard: React.FC = () => {
  let ascRows: any;
  const [SearchText, setSearchText] = useState("");
  const [rows, setRows] = useState<any | null>(null);
  const [originalData, setOriginalData] = useState<any | null>(null);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);
  const [isClientSorted, setIsClientSorted] = useState<boolean>(false);
  const [isClientSortedDsc, setIsClientSortedDsc] = useState<boolean>(false);
  const [isAccountSorted, setIsAccountSorted] = useState<boolean>(false);
  const [isAccountSortedDsc, setIsAccountSortedDsc] = useState<boolean>(false);
  const [isEmailSorted, setIsEmailSorted] = useState<boolean>(false);
  const [isEmailSortedDsc, setIsEmailSortedDsc] = useState<boolean>(false);
  const [isPhoneSorted, setIsPhoneSorted] = useState<boolean>(false);
  const [isPhoneSortedDsc, setIsPhoneSortedDsc] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const getClientCompanyData = () => {
    const token = localStorage.getItem("user");
    setLoading(true);
    axios
      .get<CompanyResponse>(`${GET_ALL_ORGANIZATION}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.status === 200) {
          setRows(res.data.data);
          setOriginalData(res.data.data);
        } else {
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  };

  const SearchButtonHandler = () => {
    if (SearchText.trim() !== "") {
      setIsClientSorted(false);
      setIsClientSortedDsc(false);
      setIsAccountSorted(false);
      setIsAccountSortedDsc(false);
      setIsEmailSorted(false);
      setIsEmailSortedDsc(false);
      setIsPhoneSorted(false);
      setIsPhoneSortedDsc(false);
      const filterResults = searchByTextFilter();
      if (filterResults.length === 0) {
        setIsSearchEmpty(true);
      }
      setRows(filterResults);
    } else {
      setRows(originalData);
    }
  };

  useEffect(() => {
    if (rows == null) {
      getClientCompanyData();
    }
  }, [rows]);

  const searchByTextFilter = () => {
    // eslint-disable-next-line
    return rows.filter(
      (obj: {
        clientName: string;
        accountNumber: string;
        contactEmail: string;
        contactPhone: string;
      }) => {
        if (
          obj.clientName
            .toUpperCase()
            .includes(SearchText.toUpperCase().trim()) ||
          (obj.accountNumber != null &&
            obj.accountNumber
              .toUpperCase()
              .includes(SearchText.toUpperCase().trim())) ||
          (obj.contactEmail != null &&
            obj.contactEmail
              .toUpperCase()
              .includes(SearchText.toUpperCase().trim())) ||
          obj.contactPhone
            .toUpperCase()
            .includes(SearchText.toUpperCase().trim())
        ) {
          return true;
        }
      }
    );
  };

  const resetSearchData = (searchText: any) => {
    if (searchText === undefined || searchText.length === 0) {
      setIsSearchEmpty(false);
      setRows(originalData);
    }
  };

  const CompareOrder = (orderBy: string) => {
    ascRows = ascRows.sort((a: any, b: any) => {
      if (a[orderBy] !== null && b[orderBy] !== null) {
        const textA = a[orderBy].toUpperCase();
        const textB = b[orderBy].toUpperCase();
        if (textA < textB) {
          return -1;
        } else if (textA > textB) {
          return 1;
        }
        return 0;
      } else {
        if (a[orderBy] === null) {
          return 1;
        }
        if (b[orderBy] === null) {
          return -1;
        }
      }
    });
  };

  const SortRows = (orderBy: string, orderType: string) => {
    if (rows !== null) {
      ascRows = [...rows];
      CompareOrder(orderBy);
      switch (orderType) {
        case "asc":
          setRows(ascRows);
          break;
        case "dsc":
          setRows(ascRows.reverse());
          break;
        default:
          return;
      }
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

  const HndleClientNameSorting = () => {
    if (isPhoneSorted) {
      setIsPhoneSorted((prevIsPhoneSorted) => !prevIsPhoneSorted);
      setIsPhoneSortedDsc(false);
    }
    if (isAccountSorted) {
      setIsAccountSorted((prevIsAccountSorted) => !prevIsAccountSorted);
      setIsAccountSortedDsc(false);
    }
    if (isEmailSorted) {
      setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
      setIsEmailSortedDsc(false);
    }
    if (isClientSorted === false) {
      setIsClientSorted((prevIsClientSorted) => !prevIsClientSorted);
      SortRows("clientName", "asc");
    } else if (isClientSorted === true && isClientSortedDsc === false) {
      setIsClientSortedDsc((prevIsClientSortedDsc) => !prevIsClientSortedDsc);
      SortRows("clientName", "dsc");
    } else if (isClientSorted === true && isClientSortedDsc === true) {
      setIsClientSorted((prevIsClientSorted) => !prevIsClientSorted);
      setIsClientSortedDsc((prevIsClientSortedDsc) => !prevIsClientSortedDsc);
      handleSortData();
    }
  };

  const HndleClientAccountSorting = () => {
    if (isClientSorted) {
      setIsClientSorted((prevIsClientSorted) => !prevIsClientSorted);
      setIsClientSorted(false);
    }
    if (isPhoneSorted) {
      setIsPhoneSorted((prevIsPhoneSorted) => !prevIsPhoneSorted);
      setIsPhoneSortedDsc(false);
    }
    if (isEmailSorted) {
      setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
      setIsEmailSortedDsc(false);
    }
    if (isAccountSorted === false) {
      setIsAccountSorted((prevIsAccountSorted) => !prevIsAccountSorted);
      SortRows("accountNumber", "asc");
    } else if (isAccountSorted === true && isAccountSortedDsc === false) {
      setIsAccountSortedDsc(
        (prevIsAccountSortedDsc) => !prevIsAccountSortedDsc
      );
      SortRows("accountNumber", "dsc");
    } else if (isAccountSorted === true && isAccountSortedDsc === true) {
      setIsAccountSorted((prevIsAccountSorted) => !prevIsAccountSorted);
      setIsAccountSortedDsc(
        (prevIsAccountSortedDsc) => !prevIsAccountSortedDsc
      );
      handleSortData();
    }
  };

  const HndleClientEmailSorting = () => {
    if (isClientSorted) {
      setIsClientSorted((prevIsClientSorted) => !prevIsClientSorted);
      setIsClientSorted(false);
    }
    if (isAccountSorted) {
      setIsAccountSorted((prevIsAccountSorted) => !prevIsAccountSorted);
      setIsAccountSortedDsc(false);
    }
    if (isPhoneSorted) {
      setIsPhoneSorted((prevIsPhoneSorted) => !prevIsPhoneSorted);
      setIsPhoneSortedDsc(false);
    }
    if (isEmailSorted === false) {
      setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
      SortRows("contactEmail", "asc");
    } else if (isEmailSorted === true && isEmailSortedDsc === false) {
      setIsEmailSortedDsc((prevIsEmailSortedDsc) => !prevIsEmailSortedDsc);
      SortRows("contactEmail", "dsc");
    } else if (isEmailSorted === true && isEmailSortedDsc === true) {
      setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
      setIsEmailSortedDsc((prevIsEmailSortedDsc) => !prevIsEmailSortedDsc);
      handleSortData();
    }
  };
  const HndleClientPhoneSorting = () => {
    if (isClientSorted) {
      setIsClientSorted((prevIsClientSorted) => !prevIsClientSorted);
      setIsClientSorted(false);
    }
    if (isAccountSorted) {
      setIsAccountSorted((prevIsAccountSorted) => !prevIsAccountSorted);
      setIsAccountSortedDsc(false);
    }
    if (isEmailSorted) {
      setIsEmailSorted((prevIsEmailSorted) => !prevIsEmailSorted);
      setIsEmailSortedDsc(false);
    }
    if (isPhoneSorted === false) {
      setIsPhoneSorted((prevIsPhoneSorted) => !prevIsPhoneSorted);
      SortRows("contactPhone", "asc");
    } else if (isPhoneSorted === true && isPhoneSortedDsc === false) {
      setIsPhoneSortedDsc((prevIsPhoneSortedDsc) => !prevIsPhoneSortedDsc);
      SortRows("contactPhone", "dsc");
    } else if (isPhoneSorted === true && isPhoneSortedDsc === true) {
      setIsPhoneSorted((prevIsPhoneSorted) => !prevIsPhoneSorted);
      setIsPhoneSortedDsc((prevIsPhoneSortedDsc) => !prevIsPhoneSortedDsc);
      handleSortData();
    }
  };

  const history = useHistory();

  const onCrossIconClick = () => {
    setIsSearchEmpty(false);
  };
  const DisplayClientNameSortIcons = (): JSX.Element => {
    if (!isClientSorted) {
      return (
        <>
          <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
        </>
      );
    } else if (isClientSorted && isClientSortedDsc) {
      return (
        <>
          <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
        </>
      );
    } else if (isClientSorted && !isClientSortedDsc) {
      return (
        <>
          <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
        </>
      );
    } else {
      return <></>;
    }
  };

  const DisplayAccountNumberSortIcons = (): JSX.Element => {
    if (!isAccountSorted) {
      return (
        <>
          <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
        </>
      );
    } else if (isAccountSorted && isAccountSortedDsc) {
      return (
        <>
          <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
        </>
      );
    } else if (isAccountSorted && !isAccountSortedDsc) {
      return (
        <>
          <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
        </>
      );
    } else {
      return <></>;
    }
  };

  const DisplayContactEmailSortIcons = (): JSX.Element => {
    if (!isEmailSorted) {
      return (
        <>
          <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
        </>
      );
    } else if (isEmailSorted && isEmailSortedDsc) {
      return (
        <>
          <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
        </>
      );
    } else if (isEmailSorted && !isEmailSortedDsc) {
      return (
        <>
          <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="container admin-dashboard-container form-container">
      <div className="d-flex">
        <div className="page-title">Admin Dashboard</div>
        <Tooltip title="Add a New Client">
          <AddCircleOutlinedIcon
            className="mt-1 ms-auto add-circle-outline-icon-wrapper"
            onClick={() => history.push("/add-client")}
          />
        </Tooltip>
      </div>
      {loading && <Loader />}
      {rows && (
        <>
          <div className="d-flex search-container px-4 pb-3">
            <div className="me-2 col-sm-10">
              <SearchField
                SearchText={SearchText}
                Placeholder="Enter client name or account number"
                SearchButtonHandler={SearchButtonHandler}
                setSearchText={setSearchText}
                resetSearchData={resetSearchData}
                originalData={originalData}
                setRows={setRows}
                onCrossIconClick={onCrossIconClick}
              />
            </div>
            <div className="col-sm-2">
              <Button
                variant="contained"
                className="searh-button"
                onClick={() => {
                  if (SearchText.trim().length > 0) {
                    SearchButtonHandler();
                  }
                }}
              >
                Search
              </Button>
            </div>
          </div>
          <div className="d-none">
            <span className="ActionWrapper">Actions:</span>
            <Button
              color="inherit"
              variant="outlined"
              sx={{ height: 50, width: 100 }}
            >
              Delete
            </Button>
          </div>
          <div className="mt-4 mb-4">
            <TableContainer
              component={Paper}
              className="category-table-container"
            >
              <Table className="min-width-650" aria-label="simple table">
                <colgroup>
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "23%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "5%" }} />
                </colgroup>
                <TableHead className="category-table-header">
                  <TableRow>
                    <TableCell className="TableHeaderWrapper d-none"></TableCell>
                    <TableCell className="TableHeaderWrapper">
                      Client Name
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          HndleClientNameSorting();
                        }}
                      >
                        <DisplayClientNameSortIcons />
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper">
                      Account Number
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          HndleClientAccountSorting();
                        }}
                      >
                        <DisplayAccountNumberSortIcons />
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper">
                      Contact Email
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          HndleClientEmailSorting();
                        }}
                      >
                        <DisplayContactEmailSortIcons />
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper">
                      Contact Phone
                      <div
                        className="SortingIcon"
                        onClick={() => {
                          HndleClientPhoneSorting();
                        }}
                      >
                        {!isPhoneSorted && (
                          <UnfoldMoreIcon fontSize="small"></UnfoldMoreIcon>
                        )}
                        {isPhoneSorted && isPhoneSortedDsc && (
                          <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
                        )}
                        {isPhoneSorted && !isPhoneSortedDsc && (
                          <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="TableHeaderWrapper"></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row: RowType) => (
                    <TableRow
                      key={row.organizationId}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell
                        className="TableRowsWrapper d-none"
                        padding="checkbox"
                      >
                        <Checkbox
                          color="primary"
                          inputProps={{
                            "aria-label": "select all",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        className="TableRowsWrapper"
                        component="th"
                        scope="row"
                      >
                        <span className="ClientNameWrap">
                          <AddTooltip value={row.clientName} len={30} />{" "}
                        </span>
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        <span className="ClientNameWrap">
                          {row.accountNumber}
                        </span>
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        <span className="ClientNameWrap">
                          <AddTooltip value={row.contactEmail} len={20} />
                        </span>
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        <span className="ClientNameWrap">
                          {row.contactPhone}
                        </span>
                      </TableCell>
                      <TableCell className="TableRowsWrapper">
                        <div
                          className="LicenseDetailWrapper"
                          onClick={() =>
                            history.push("/view-client", {
                              organizationId: row.organizationId,
                            })
                          }
                        >
                          <ChevronRightIcon className="chevron-icon-style" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div style={{ textAlign: "center" }}>
                {isSearchEmpty
                  ? "No data is found matching the text you have entered."
                  : ""}
              </div>
            </TableContainer>
          </div>
        </>
      )}
    </div>
  );
};
export default AdminDashboard;
