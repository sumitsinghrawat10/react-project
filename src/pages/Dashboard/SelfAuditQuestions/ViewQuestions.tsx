import React, { useEffect, useState } from 'react';

import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DehazeSharpIcon from '@mui/icons-material/DehazeSharp';
import InfoIcon from '@mui/icons-material/Info';
import SearchField from '../../../components/Mui/SearchField';
import SearchButton from '../../../components/Mui/SearchButton';
import {
    Divider,
    CircularProgress,
    Stack,
    Box,
    DialogContent,
    Dialog,
    Button,
    Typography,
} from '@mui/material';
import { styled as muiStyled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import axios from 'axios';
import {
    DragDropContext,
    Droppable,
    DropResult,
    Draggable,
} from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    ARCHIEVE_QUESTIONS_BY_CATEGORY_STATE_COUNTY_CITY,
    GET_QUESTIONS,
    UPDATE_QUESTION_ORDER,
} from '../../../networking/httpEndPoints';
import { RegTechWriter } from '../../../utilities/constants';
import { roleValidator } from '../../../utilities/roleValidator';
import ArchiveAlertBox from '../SelfAuditQuestions/ArchiveAlertBox';

interface GetResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
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

const ModifiedTooltip = muiStyled(({ className, ...props }: TooltipProps) => (

    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
        color: '#001e46',
    },
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#001e46',
        color: '#FFFFFF',
        fontSize: theme.typography.pxToRem(12),
    },
}));

const getQuestionValue = (state: any) => {
    if (state) {
        return state.questionHeader === 'category'
            ? state.valueType.categoryName
            : state.valueType.value;
    } else {
        return;
    }
};

const getRegulationId = (state: any) => {
    if (state) {
        return state.questionHeader === 'category'
            ? state.valueType.categoryId
            : state.valueType.key;
    } else {
        return;
    }
};
const ViewQuestions = () => {
    const history = useHistory();
    const valueTypeQuestion = history.location.state
        ? history.location.state.value
        : null;

    const valueQuestion = getQuestionValue(history.location.state);
    const questionHeader = history.location.state
        ? history.location.state.questionHeader
        : null;
    const regulationId = getRegulationId(history.location.state);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState<any[]>([]);
    const [modalClose, setModalClose] = useState(false);
    const [SearchText, setSearchText] = useState('');
    const [modalData, setModalData] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const userState = useSelector((state: DashboardType) => state.user);
    const [enablePopUp, setEnablePopUp] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const [isNoQuestionAvailble, setIsNoQuestionAvailble] = useState(false);
    useEffect(() => {
        if (valueTypeQuestion !== null && valueQuestion !== null) {
            resetFields();
            getQuestions();
        }
    }, []);

    const resetFields = () => {
        setIsEmpty(false);
        setQuestion([]);
    };

    const showInfoModal = (dataShow: string) => {
        setModalClose(true);
        return setModalData(dataShow);
    };
    const hideInfoModal = () => {
        setModalClose(false);
        return setModalData('');
    };

    const token = localStorage.getItem('user');

    const archiveQuestions = () => {
        const params = {
            valueType: valueTypeQuestion,
            value: regulationId,
        };
        if (token != null) {
            setLoading(true);
            axios
                .put<GetResponse>(
                    ARCHIEVE_QUESTIONS_BY_CATEGORY_STATE_COUNTY_CITY,
                    params,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                .then((res) => {
                    if (res.status === 200 && res.data.isSuccess === true) {
                        setLoading(false);
                        setEnablePopUp(true);
                        setIsEmpty(false);
                        setTimeout(() => {
                            setEnablePopUp(false);
                            history.push('/self-audit-questions', {
                                valueType: valueTypeQuestion,
                                value: questionHeader,
                            });
                        }, 2000);
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                .catch((ex) => {
                    console.log(ex);
                    setLoading(false);
                });
        }
    };

    const getQuestionOrderWise = () => {
        const regionCategory: string = valueQuestion.trim();
        const params = {
            valueType: valueTypeQuestion,
            value: regionCategory,
        };
        if (token != null) {
            axios
                .post<GetResponse>(GET_QUESTIONS, params, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.status === 201 && res.data.isSuccess === true) {
                        setOriginalData(res.data.result);
                        setQuestion(res.data.result);
                    }
                });
        }
    };
    const getQuestions = () => {
        const regionCategory: string = valueQuestion.trim();
        const params = {
            valueType: valueTypeQuestion,
            value: regionCategory,
        };
        if (token != null) {
            setLoading(true);
            axios
                .post<GetResponse>(GET_QUESTIONS, params, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.status === 201 && res.data.isSuccess === true) {
                        setQuestion(res.data.result);
                        setOriginalData(res.data.result);
                        setIsEmpty(false);
                        setLoading(false);
                    } else if (res.status === 201 && res.data.isSuccess === false) {
                        setLoading(false);
                        setIsNoQuestionAvailble(true);
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    };

    const Capitalize = (str: string) => {
        str = str.charAt(0).toUpperCase() + str.slice(1);
        return str;
    };

    const SearchButtonHandler = () => {
        if (SearchText.trim() !== '') {
            const filterResults = searchByTextFilter(SearchText.trim());
            if (filterResults.length === 0) {
                setIsEmpty(true);
            } else {
                setIsEmpty(false);
            }
            setQuestion(filterResults);
        } else {
            setIsEmpty(false);
            setQuestion(originalData);
        }
    };

    const searchByTextFilter = (item: any) => {
        return originalData.filter((obj: any) => {
            if (
                obj.question != null &&
                obj.question.toUpperCase().includes(item.toUpperCase()) &&
                String(obj.question.toUpperCase()).includes(item.toUpperCase())
            ) {
                return true;
            } else {
                return false;
            }
        });
    };

    const resetSearchData = () => {
        if (SearchText.length === 0) {
            setQuestion(originalData);
            setIsEmpty(false);
        }
    };

    const onCrossIconClick = () => {
        setIsEmpty(false);
        setQuestion(originalData);
    };


    const handleDragEnd = ({ destination, source }: DropResult) => {
        if (!destination) return;
        const updatedList = [...question];
        const newOrder = updatedList[destination.index];
        // Remove dragged item
        const [reorderedItem] = updatedList.splice(source.index, 1);
        // Add dropped item
        updatedList.splice(destination.index, 0, reorderedItem);
        // Update State
        setQuestion(updatedList);
        const params = {
            oldOrder: reorderedItem.questionOrder,
            newOrder: newOrder.questionOrder,
            questionId: reorderedItem.questionId,
        };
        if (token != null) {
            axios
                .put<any>(UPDATE_QUESTION_ORDER, params, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.status === 200 && res.data.isSuccess === true) {
                        getQuestionOrderWise();
                    }
                });
        }
    };

    return (
        <>
            {roleValidator(userState['role']) === RegTechWriter && (
                <div className="container form-container self-audit-question-container self-audit">
                    {enablePopUp && (
                        <div className="text-pin-wrapper">
                            <div className="text-pin">
                                <CheckCircleOutlineIcon></CheckCircleOutlineIcon>
                                <span className="ms-2">
                                    {Capitalize(questionHeader)} Archived Successfully
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="d-flex">
                        <div className="page-title">
                            <h1 className="title-wrapper">
                                {Capitalize(valueQuestion.trim())} Questions
                            </h1>
                        </div>
                        <Tooltip title="Add a Question">
                            <AddCircleOutlinedIcon
                                className="mt-3 ms-auto add-circle-outline-icon-wrapper"
                                onClick={() => history.push('/add-question')}
                            />
                        </Tooltip>
                    </div>
                    {loading && (
                        <div className="loader-wrapper">
                            <CircularProgress />
                        </div>
                    )}
                    <>
                        {question.length === 0 && isNoQuestionAvailble  && (
                            <h4 className="no-sa-text">No questions available.</h4>
                        )}
                        {!loading && (question.length >0 || isEmpty) && (
                            <>
                                <div className="d-flex question-search-container">
                                    <div className="mx-3 width-100">
                                        <SearchField
                                            SearchText={SearchText}
                                            Placeholder="Search Question"
                                            SearchButtonHandler={SearchButtonHandler}
                                            setSearchText={setSearchText}
                                            resetSearchData={resetSearchData}
                                            originalData={originalData}
                                            setRows={setQuestion}
                                            isSearchIconVisible={true}
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
                                <Dialog
                                    open={modalClose}
                                    keepMounted
                                    className="p-4 self-audit"
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                    PaperProps={{
                                        sx: {
                                            maxHeight: 450,
                                            overflowX: 'hidden',
                                            overflowY: 'auto',
                                        },
                                    }}
                                >
                                    <div className="close-dialog">
                                        <button
                                            onClick={() => {
                                                hideInfoModal();
                                            }}
                                            className="btn-close btn-sm close-info-modal"
                                        ></button>
                                    </div>
                                    <DialogContent>{modalData}</DialogContent>
                                </Dialog>
                                <Stack className="question-wrapper" gap={1}>
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="droppable-list">
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                >
                                                    {question.length > 0 &&
                                                        question.map((data: any, index: number) => (
                                                            <Draggable
                                                                key={`${data.questionId}`}
                                                                draggableId={`${data.questionId}`}
                                                                index={index}
                                                            >
                                                                {(providedDrag) => (
                                                                    <div
                                                                        className="item-container"
                                                                        ref={providedDrag.innerRef}
                                                                        {...providedDrag.draggableProps}
                                                                    >
                                                                        <div className="question-block">
                                                                            <>
                                                                                <div
                                                                                    className="d-flex justify-content-between pb-20"
                                                                                >
                                                                                    {data.question.length <= 150 && (
                                                                                        <>
                                                                                            <Typography
                                                                                                className="self-audit-question-color font-16 light-font ml-50 pb-0 text-align-left mt-15"
                                                                                            >
                                                                                                {data.question}
                                                                                            </Typography>
                                                                                        </>
                                                                                    )}
                                                                                    {data.question.length > 150 && (
                                                                                        <>
                                                                                            <Box
                                                                                                key={`question-${data.questionId}`}
                                                                                            >
                                                                                                <ModifiedTooltip
                                                                                                    PopperProps={{
                                                                                                        modifiers: [
                                                                                                            {
                                                                                                                name: "offset",
                                                                                                                options: {
                                                                                                                    offset: [5, -20],
                                                                                                                },
                                                                                                            },
                                                                                                        ],
                                                                                                    }}
                                                                                                    title={
                                                                                                        data.question?.length >
                                                                                                            250 ? (
                                                                                                            <React.Fragment>
                                                                                                                {data.question.substring(
                                                                                                                    0,
                                                                                                                    250
                                                                                                                )}{' '}
                                                                                                                <span
                                                                                                                    className="view-more-wrapper"
                                                                                                                    onClick={() => {
                                                                                                                        showInfoModal(
                                                                                                                            data.question
                                                                                                                        );
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <strong>
                                                                                                                        <u>View More</u>
                                                                                                                    </strong>
                                                                                                                </span>
                                                                                                            </React.Fragment>
                                                                                                        ) : (
                                                                                                            data.question
                                                                                                        )
                                                                                                    }
                                                                                                    arrow
                                                                                                >
                                                                                                    <Button
                                                                                                        className="self-audit-question-color font-16 light-font ml-40 pb-0 text-align-left"
                                                                                                    >
                                                                                                        {data.question.length >
                                                                                                            150 &&
                                                                                                            data.question.slice(
                                                                                                                0,
                                                                                                                150
                                                                                                            ) + '...'}
                                                                                                    </Button>
                                                                                                </ModifiedTooltip>
                                                                                            </Box>
                                                                                        </>
                                                                                    )}
                                                                                    <div
                                                                                        className="d-flex justify-content-between pr-15"
                                                                                    >
                                                                                        <Typography
                                                                                            className="question-version pr-15"
                                                                                        >
                                                                                            V :{' '}
                                                                                            {data.versionNumber.length > 9
                                                                                                ? data.versionNumber.slice(
                                                                                                    2,
                                                                                                    5
                                                                                                ) + '...'
                                                                                                : data.versionNumber.slice(
                                                                                                    2,
                                                                                                    6
                                                                                                )}
                                                                                        </Typography>
                                                                                        <Button
                                                                                            className="self-audit-question-color self-audit-question-hover"
                                                                                            onClick={() =>
                                                                                                history.push('/edit-question', {
                                                                                                    editQuestionId:
                                                                                                        data.questionId,
                                                                                                    versionId:
                                                                                                        data.versionNumber.slice(2),
                                                                                                })
                                                                                            }
                                                                                        >
                                                                                            Edit
                                                                                            <ChevronRightIcon />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                                <div
                                                                                    className=" d-flex align-item-center ml-10"
                                                                                >
                                                                                    {questionHeader.toLowerCase() ===
                                                                                        'category' && (
                                                                                            <div>
                                                                                                <span
                                                                                                    className="icon-wrapper"
                                                                                                    {...providedDrag.dragHandleProps}
                                                                                                >
                                                                                                    <DehazeSharpIcon fontSize="small" />
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    <Divider
                                                                                        variant="middle"
                                                                                        className="custom-divider"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="d-flex question-label-block">
                                                                                        <div className="labels-wrapper"
                                                                                        >
                                                                                            <div
                                                                                                className="d-flex"
                                                                                            >
                                                                                                <div className="info-icon-wrapper">
                                                                                                    <InfoIcon
                                                                                                        className="font-16"
                                                                                                    />
                                                                                                </div>
                                                                                                <ModifiedTooltip
                                                                                                    PopperProps={{
                                                                                                        modifiers: [
                                                                                                            {
                                                                                                                name: "offset",
                                                                                                                options: {
                                                                                                                    offset: [5, -20],
                                                                                                                },
                                                                                                            },
                                                                                                        ],
                                                                                                    }}
                                                                                                    title={
                                                                                                        data.ordinanceCode?.length >
                                                                                                            200 ? (
                                                                                                            <React.Fragment>
                                                                                                                {data.ordinanceCode.substring(
                                                                                                                    0,
                                                                                                                    200
                                                                                                                )}{' '}
                                                                                                                <span
                                                                                                                    className="view-more-wrapper"
                                                                                                                    onClick={() => {
                                                                                                                        showInfoModal(
                                                                                                                            data.ordinanceCode
                                                                                                                        );
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <strong>
                                                                                                                        <u>View More</u>
                                                                                                                    </strong>
                                                                                                                </span>
                                                                                                            </React.Fragment>
                                                                                                        ) : (
                                                                                                            data.ordinanceCode
                                                                                                        )
                                                                                                    }
                                                                                                    arrow
                                                                                                >
                                                                                                    <Button
                                                                                                        className="self-audit-question-color self-audit-question-hover pl-18"
                                                                                                    >
                                                                                                        Ordinance/Code
                                                                                                    </Button>
                                                                                                </ModifiedTooltip>
                                                                                            </div>
                                                                                            <ModifiedTooltip
                                                                                                PopperProps={{
                                                                                                    modifiers: [
                                                                                                        {
                                                                                                            name: "offset",
                                                                                                            options: {
                                                                                                                offset: [5, -20],
                                                                                                            },
                                                                                                        },
                                                                                                    ],
                                                                                                }}
                                                                                                title={
                                                                                                    data.chapterPart?.length >
                                                                                                        200 ? (
                                                                                                        <React.Fragment>
                                                                                                            {data.chapterPart.substring(
                                                                                                                0,
                                                                                                                200
                                                                                                            )}{' '}
                                                                                                            <span
                                                                                                                className="view-more-wrapper"
                                                                                                                onClick={() => {
                                                                                                                    showInfoModal(
                                                                                                                        data.chapterPart
                                                                                                                    );
                                                                                                                }}
                                                                                                            >
                                                                                                                <strong>
                                                                                                                    <u>View More</u>
                                                                                                                </strong>
                                                                                                            </span>
                                                                                                        </React.Fragment>
                                                                                                    ) : (
                                                                                                        data.chapterPart
                                                                                                    )
                                                                                                }
                                                                                                arrow
                                                                                            >
                                                                                                <Button
                                                                                                    className="self-audit-question-color self-audit-question-hover"
                                                                                                >
                                                                                                    Chapter/Part
                                                                                                </Button>
                                                                                            </ModifiedTooltip>
                                                                                            <ModifiedTooltip
                                                                                                PopperProps={{
                                                                                                    modifiers: [
                                                                                                        {
                                                                                                            name: "offset",
                                                                                                            options: {
                                                                                                                offset: [5, -20],
                                                                                                            },
                                                                                                        },
                                                                                                    ],
                                                                                                }}
                                                                                                title={
                                                                                                    data.section?.length > 200 ? (
                                                                                                        <React.Fragment>
                                                                                                            {data.section.substring(
                                                                                                                0,
                                                                                                                200
                                                                                                            )}{' '}
                                                                                                            <span
                                                                                                                className="view-more-wrapper"
                                                                                                                onClick={() => {
                                                                                                                    showInfoModal(
                                                                                                                        data.section
                                                                                                                    );
                                                                                                                }}
                                                                                                            >
                                                                                                                <strong>
                                                                                                                    <u>View More</u>
                                                                                                                </strong>
                                                                                                            </span>
                                                                                                        </React.Fragment>
                                                                                                    ) : (
                                                                                                        data.section
                                                                                                    )
                                                                                                }
                                                                                                arrow
                                                                                            >
                                                                                                <Button
                                                                                                    className="self-audit-question-color self-audit-question-hover"
                                                                                                >
                                                                                                    Section
                                                                                                </Button>
                                                                                            </ModifiedTooltip>
                                                                                            <ModifiedTooltip
                                                                                                PopperProps={{
                                                                                                    modifiers: [
                                                                                                        {
                                                                                                            name: "offset",
                                                                                                            options: {
                                                                                                                offset: [5, -20],
                                                                                                            },
                                                                                                        },
                                                                                                    ],
                                                                                                }}
                                                                                                title={
                                                                                                    data.regulation?.length >
                                                                                                        200 ? (
                                                                                                        <React.Fragment>
                                                                                                            {data.regulation.substring(
                                                                                                                0,
                                                                                                                200
                                                                                                            )}{' '}
                                                                                                            <span
                                                                                                                className="view-more-wrapper"
                                                                                                                onClick={() => {
                                                                                                                    showInfoModal(
                                                                                                                        data.regulation
                                                                                                                    );
                                                                                                                }}
                                                                                                            >
                                                                                                                <strong>
                                                                                                                    <u>View More</u>
                                                                                                                </strong>
                                                                                                            </span>
                                                                                                        </React.Fragment>
                                                                                                    ) : (
                                                                                                        data.regulation
                                                                                                    )
                                                                                                }
                                                                                                arrow
                                                                                            >
                                                                                                <Button
                                                                                                    className="self-audit-question-color self-audit-question-hover"
                                                                                                >
                                                                                                    Regulation
                                                                                                </Button>
                                                                                            </ModifiedTooltip>
                                                                                            <ModifiedTooltip
                                                                                                PopperProps={{
                                                                                                    modifiers: [
                                                                                                        {
                                                                                                            name: "offset",
                                                                                                            options: {
                                                                                                                offset: [5, -20],
                                                                                                            },
                                                                                                        },
                                                                                                    ],
                                                                                                }}
                                                                                                title={
                                                                                                    data.additionalInfo?.length >
                                                                                                        200 ? (
                                                                                                        <React.Fragment>
                                                                                                            {data.additionalInfo.substring(
                                                                                                                2,
                                                                                                                200
                                                                                                            )}{' '}
                                                                                                            <span
                                                                                                                className="view-more-wrapper"
                                                                                                                onClick={() => {
                                                                                                                    showInfoModal(
                                                                                                                        data.additionalInfo
                                                                                                                    );
                                                                                                                }}
                                                                                                            >
                                                                                                                <strong>
                                                                                                                    <u>View More</u>
                                                                                                                </strong>
                                                                                                            </span>
                                                                                                        </React.Fragment>
                                                                                                    ) : (
                                                                                                        data.additionalInfo
                                                                                                    )
                                                                                                }
                                                                                                arrow
                                                                                            >
                                                                                                <Button
                                                                                                    className="self-audit-question-color self-audit-question-hover mr-20"
                                                                                                >
                                                                                                    Additional Info
                                                                                                </Button>
                                                                                            </ModifiedTooltip>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                    <div className="text-align-center">
                                        {isEmpty
                                            ? 'No data is found matching the text you have provided.'
                                            : ''}
                                    </div>
                                </Stack>
                                <div className="pt-2">
                                    <ArchiveAlertBox
                                        alertOpen={alertOpen}
                                        isEnabledPopUp={true}
                                        handleAlertYes={() => {
                                            setAlertOpen(false);
                                            archiveQuestions();
                                        }}
                                        handleAlertNo={() => {
                                            setAlertOpen(false);
                                        }}
                                        handleAlertContinue={() => {
                                            setAlertOpen(false);
                                        }}
                                    />
                                    <Button className="archive-button">
                                        Archive {Capitalize(questionHeader)}
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                </div>
            )}
        </>
    );
};
export default ViewQuestions;
