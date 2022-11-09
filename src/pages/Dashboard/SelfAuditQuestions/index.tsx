import React, { useEffect, useState } from 'react';

import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import DehazeSharpIcon from '@mui/icons-material/DehazeSharp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Tooltip from '@mui/material/Tooltip';
import {
    CircularProgress,
    MenuItem,
    Select,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Paper,
    tableCellClasses,
} from '@mui/material';
import axios from 'axios';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
    DraggableProvided,
    DroppableProvided,
} from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import AddTooltip from '../../../components/AddTooltip';
import {
    GET_CATEGORY_STATE_COUNTY_CITY,
    UPDATE_CATEGORY_ORDER,
} from '../../../networking/httpEndPoints';
import { RegTechWriter } from '../../../utilities/constants';
import { roleValidator } from '../../../utilities/roleValidator';
import AddDialogBox from './AddDialogBox';
import SearchField from '../../../components/Mui/SearchField';
import SearchButton from '../../../components/Mui/SearchButton';

interface DashboardType {
    user: {
        user?: string;
        role?: string;
        userId?: number | null;
        initialSetup?: string;
        navVisible?: boolean;
    };
}

interface SelfAuditQuestionsResponse {
    isSuccess: boolean;
    responseMessage: string;
    result?: any;
}

enum categoryRegion {
    category = 1,
    state = 2,
    county = 3,
    city = 4,
}

const SelfAuditQuestions: React.FC = () => {
    const userState = useSelector((state: DashboardType) => state.user);
    const [SaqCategory, setSaqCategory] = useState('');
    const [SelectedSaq, setSelectedSaq] = useState<any[]>([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const [rows, setRows] = useState<any | null>(null);
    const [openCategory, setOpenCategory] = useState(false);
    const [SearchText, setSearchText] = useState('');
    const history = useHistory();
    const [SaqCatedoryDetails, setSaqCatedoryDetails] = useState<any[]>([]);
    const viewType = history.location.state ? history.location.state.value : null;
    const [originalData, setOriginalData] = useState([]);
    const getSelfAuditQuestionData = () => {
        const token = localStorage.getItem('user');
        axios
            .get<SelfAuditQuestionsResponse>(`${GET_CATEGORY_STATE_COUNTY_CITY}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.status === 200 && res.data.isSuccess === true) {
                    const SaqData = res.data.result === null ? [] : res.data.result;
                    setSaqCatedoryDetails(SaqData);
                    const AssignedCategory = Object.keys(SaqData);
                    setIsEmpty(false);
                    for (let index = 0; index < AssignedCategory.length; index++) {
                        const CategoryKey = getSelectedType(
                            viewType,
                            AssignedCategory[index]
                        );

                        if (index === 0) {
                            setSaqCategory(Capitalize(CategoryKey));
                            setOriginalData(SaqData[CategoryKey]);
                            setRows(SaqData[CategoryKey]);
                        }
                        SelectedSaq.push({
                            name: AssignedCategory[index],
                            id: index,
                        });
                    }
                    setSelectedSaq(SelectedSaq);
                }
            });
    };

    useEffect(() => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            if (rows == null) {
                resetFields();
                getSelfAuditQuestionData();
            }
        }
    }, []);
    const SearchButtonHandler = () => {
        if (SearchText.trim() !== '') {
            const filterResults = searchByTextFilter(SaqCategory.trim().toLowerCase());
            if (filterResults.length === 0) {
                setIsEmpty(true);
            } else {
                setIsEmpty(false);
            }
            setRows(filterResults);
        } else {
            setIsEmpty(false);
            SaqCategoryDetails(SaqCategory.trim().toLowerCase());
        }
    };

    const onCrossIconClick = () => {
        SaqCategoryDetails(
            SaqCategory.trim().toLowerCase()
        );
        setIsEmpty(false);
    };
    const handleDragEnd = (
        droppedItem: DropResult

    ) => {
        // Ignore drop outside droppable container
        if (!droppedItem.destination) return;
        const updatedList = [...rows];

        const newOrder = updatedList[droppedItem.destination.index];
        // Remove dragged item
        const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
        // Add dropped item
        updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
        // Update State
        setRows(updatedList);
        const token = localStorage.getItem('user');
        const params = {
            oldOrder: reorderedItem.categoryOrder,
            newOrder: newOrder.categoryOrder,
            categoryId: reorderedItem.categoryId,
        };
        if (token != null) {
            axios
                .put<any>(UPDATE_CATEGORY_ORDER, params, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.status === 200 && res.data.isSuccess === true) {
                        getSelfAuditQuestionData();
                    }
                });
        }

    };

    const searchByTextFilter = (item: any) => {
        const result = SaqCatedoryDetails[item];
        return result.filter((obj: any) => {
            if (item === 'category') {
                if (
                    obj.categoryName != null &&
                    obj.categoryName
                        .toUpperCase()
                        .includes(SearchText.toUpperCase().trim())
                ) {
                    return true;
                }
            } else {
                if (
                    obj.value != null &&
                    obj.value.toUpperCase()
                    .includes(SearchText.toUpperCase().trim())
                ) {
                    return true;
                }
            }
        });
    };

    const resetSearchData = () => {
        if (SearchText.length === 0) {
            setIsEmpty(false);
            SaqCategoryDetails(SaqCategory.trim().toLowerCase());
        }
    };

    const getSelectedType = (viewTypeTxt: string, assignedCategory: string) => {
        return viewTypeTxt != null ? viewTypeTxt : assignedCategory;
    };
    const resetFields = () => {
        setIsEmpty(false);
        setSaqCategory('');
        setSelectedSaq([]);
        setSaqCatedoryDetails([]);
    };

    const regionCategoryValue = (e: any) => {
        const valueFinal = SaqCategory.trim().toLowerCase();
        switch (valueFinal) {
            case 'category':
                history.push('/question-details', {
                    valueType: e,
                    value: categoryRegion.category,
                    questionHeader: valueFinal,
                });
                break;
            case 'city':
                history.push('/question-details', {
                    valueType: e,
                    value: categoryRegion.city,
                    questionHeader: valueFinal,
                });
                break;
            case 'county':
                history.push('/question-details', {
                    valueType: e,
                    value: categoryRegion.county,
                    questionHeader: valueFinal,
                });
                break;
            case 'state':
                history.push('/question-details', {
                    valueType: e,
                    value: categoryRegion.state,
                    questionHeader: valueFinal,
                });
                break;
            default:
                break;
        }
    };
    interface CrossIconProps {
        SearchText: string;
    }
    const FieldIcon = styled(ClearOutlinedIcon) <CrossIconProps>`
    :hover {
      cursor: pointer;
    }
    display: ${(props) =>
            props.SearchText.length > 0 ? 'block' : 'none'} !important;
  `;
    const handleSaqCategoryChange = (e: any) => {
        setSaqCategory(Capitalize(e.target.value));
        SaqCategoryDetails(e.target.value.toLowerCase());
    };

    const SaqCategoryDetails = (item: any) => {
        const RowData = SaqCatedoryDetails[item];
        if (RowData == null || RowData.length === 0) {
            setIsEmpty(true);
        }
        setRows(RowData);
        setOriginalData(RowData);
    };

    const Capitalize = (str: string) => {
        str = str.charAt(0).toUpperCase() + str.slice(1);
        return str;
    };

    const categoryPrefix = 'View by: ';
    return (
        <>
            {roleValidator(userState['role']) === RegTechWriter && (
                <div className="container form-container self-audit">
                    <div className="d-flex pt-2">
                        <div className="page-title">
                            <h1 className="bold-font">Self Audit Questions</h1>
                        </div>
                        <AddDialogBox
                            openCategory={openCategory}
                            handleCategory={() => setOpenCategory(false)}
                            getSelfAuditQuestionData={getSelfAuditQuestionData}
                        ></AddDialogBox>
                        <Tooltip title="Add a Category or Jurisdiction">
                            <AddCircleOutlinedIcon
                                className="mt-3 ms-auto add-circle-outline-icon-wrapper"
                                onClick={() => setOpenCategory(true)}
                            />
                        </Tooltip>
                    </div>
                    {!rows && !isEmpty && (
                        <div className="loader-wrapper">
                            <CircularProgress />
                        </div>
                    )}
                    {SaqCategory && (
                        <div className="d-flex question-search-container">
                            <div className="me-2 width-50">
                                <Select
                                    defaultValue=""
                                    name="SaqCategory"
                                    displayEmpty
                                    value={SaqCategory}
                                    variant="filled"
                                    className="input-form select-field width-webkit-fill-available ml-10"
                                    renderValue={(value) =>
                                        value !== '' ? categoryPrefix + SaqCategory : categoryPrefix
                                    }
                                    IconComponent={KeyboardArrowDownIcon}
                                    onChange={(e) => {
                                        setIsEmpty(false);
                                        setSearchText('');
                                        handleSaqCategoryChange(e);
                                    }}
                                    label="All Category"
                                    aria-label="All Category"
                                >
                                    {SelectedSaq.slice(0, 4).map((item) => (
                                        <MenuItem key={item.id} value={Capitalize(item.name)}>
                                            {Capitalize(item.name)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
                            <div className="mx-2 width-100">
                                <SearchField
                                    SearchText={SearchText}
                                    Placeholder={'Search ' + SaqCategory}
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
                    )}
                    {!rows && isEmpty && (
                        <h4 className="align-center justify-center mt-20 d-flex">No Records Found</h4>
                    )}
                    {rows && (
                        <div className="mt-4 mb-4">
                            <TableContainer
                                component={Paper}
                                className="question-category-table-container"
                            >
                                <Table className="min-width-650" aria-label="locations list table">
                                    <colgroup>
                                        {SaqCategory.toLowerCase() === 'category' && (
                                            <col className="width-20" />
                                        )}
                                        <col className="width-50" />
                                        <col className="width-30" />
                                    </colgroup>
                                    <TableHead
                                        sx={{
                                            [`& .${tableCellClasses.root}`]: {
                                                borderBottom: 'none !important',
                                            }
                                        }}
                                        className="question-category-table-header"
                                    >
                                        <TableRow>
                                            {SaqCategory.toLowerCase() === 'category' && (
                                                <TableCell className="font-16 bold-font self-audit-question-color question-category-table-cell">Reorder</TableCell>
                                            )}
                                            <TableCell className="font-16 bold-font self-audit-question-color question-category-table-cell">
                                                {Capitalize(SaqCategory)}
                                            </TableCell>
                                            <TableCell className="font-16 bold-font self-audit-question-color question-category-table-cell">
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="list-container">
                                            {(droppableProvided: DroppableProvided) => (
                                                <TableBody
                                                    ref={droppableProvided.innerRef}
                                                    {...droppableProvided.droppableProps}
                                                >
                                                    {rows.map((item: any, index: number) => (
                                                        <Draggable
                                                            key={item.categoryName}
                                                            draggableId={item.categoryName}
                                                            index={index}
                                                        >
                                                            {(
                                                                draggableProvided: DraggableProvided
                                                            ) => {
                                                                return (
                                                                    <TableRow
                                                                        ref={draggableProvided.innerRef}
                                                                        {...draggableProvided.draggableProps}
                                                                        key={
                                                                            SaqCategory.toLowerCase() === 'category'
                                                                                ? item.categoryId
                                                                                : item.key
                                                                        }
                                                                        className="table-row-container"
                                                                    >
                                                                        {SaqCategory.toLowerCase() ===
                                                                            'category' && (
                                                                                <TableCell className="question-category-table-cell font-16 self-audit-question-color border-bottom-none width-20">
                                                                                    <div>
                                                                                        <span className="icon-wrapper"
                                                                                            {...draggableProvided.dragHandleProps}
                                                                                        >
                                                                                            <DehazeSharpIcon fontSize="small" />
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                            )}
                                                                        <TableCell className="question-category-table-cell font-16 border-bottom-none self-audit-question-color width-59" scope="row">
                                                                            <span className="word-break-all">
                                                                                <AddTooltip  value={`${SaqCategory.toLowerCase() ===
                                                                                    'category'
                                                                                    ? item.categoryName
                                                                                    : item.value}`} len={30} />

                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell
                                                                            className="question-category-table-cell font-16 fw-600 cursor-pointer self-audit-question-color text-align-right border-bottom-none"
                                                                            onClick={() => regionCategoryValue(item)}
                                                                        >
                                                                            See Questions <ChevronRightIcon />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }}
                                                        </Draggable>
                                                    ))}
                                                    {droppableProvided.placeholder}
                                                </TableBody>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Table>
                                <div className="text-align-center">
                                    {isEmpty
                                        ? 'No data is found matching the text you have provided.'
                                        : ''}
                                </div>
                            </TableContainer>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
export default SelfAuditQuestions;