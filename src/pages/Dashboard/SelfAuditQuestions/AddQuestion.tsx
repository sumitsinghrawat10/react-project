import React, { ChangeEvent, useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    MenuItem,
    Select,
    Button,
    Box,
    FormHelperText,
    Radio,
    RadioGroup,
    CircularProgress,
    Backdrop,
    SelectChangeEvent,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import SuccessToaster from '../../../components/SuccessToaster';
import TextBox from '../../../components/TextBox';
import { GetResponse } from '../../../model/model';
import {
    ADD_QUESTION,
    GET_CATEGORY_STATE_COUNTY_CITY,
    SEARCHBY_COUNTY_STATE_CITY,
    REMOVE_QUESTION,
    GET_QUESTION,
    EDIT_QUESTION,
} from '../../../networking/httpEndPoints';
import { RegTechWriter } from '../../../utilities/constants';
import { roleValidator } from '../../../utilities/roleValidator';
import NotifyUserDialogBox from '../SelfAuditQuestions/NotifyUserDialogBox';
import historyVaribaleChecker from '../../../utilities/historyVariableChecker';
import SwalBox from '../../../components/SwalBox';

interface DashboardType {
    user: {
        user?: string;
        role?: string;
        userId?: number | null;
        initialSetup?: string;
        navVisible?: boolean;
    };
}

const CustomExpandMore = ({ ...rest }) => {
    return <ExpandMoreIcon {...rest} />;
};

const useStyles = makeStyles({
    root: {
        '& .MuiFilledInput-root:before': {
            borderBottom: 'none!important',
        },
        '&.MuiFilledInput-input:focus': {
            borderBottom: '1rem solid #233ce6 !important'
        }
    },
    menuUl: {
        backgroundColor: '#fff',
        padding: '0',
    },
    menuBoxSx: {
        opacity: '1',
        position: 'absolute',
        width: '12.5%',
        borderRadius: '4px',
        boxShadow:
            '0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%) !important',
        overflowX: 'hidden',
        overflowY: 'auto',
        maxWidth: 'calc(100% - 32px)',
        maxHeight: 'calc(100% - 32px)',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    helperText: {
        marginLeft: '0px!important',
    },
    questionText: {
        '&.MuiFilledInput-root': {
            width: '312.5rem !important',
            backgroundColor: '#f9f9f9 !important',
        }
    },
    ordinanceCode: {
        '&.MuiFilledInput-root': {
            width: '31.25rem !important',
            backgroundColor: '#f9f9f9 !important',
        }
    },
    chapterPart: {
        '&.MuiFilledInput-root': {
            width: '18.75rem !important',
            backgroundColor: '#f9f9f9 !important',
        }
    },
    styledDialogWrapper: {
        '&.MuiDialog-root': {
            height: '100% !important',
            width: '100% !important',
        }
    },
    spanBox: {
        '&.MuiDialogContent-root span': {
            margin: '1.875rem !important',
            fontSize: '1.625rem !important',
            textAlign: 'center',
            overFlowWrap: 'break-word',
        }
    },
    dialogContent: {
        '&.MuiDialogContent-root': {
            marginTop: '3.75rem',
            marginLeft: '1.875rem',
            marginRight: '1.875rem',
            justifyContent: 'center !important',
            overFlowWrap: 'break-word',
            fontSize: '1.875rem',
            textAlign: 'center',
        }
    },
    dialogActions: {
        '&.MuiDialogActions-root': {
            marginBottom: '0rem'
        },
        '&.MuiDialogActions-root button': {
            width: ' 9.375rem',
            marginBottom: '6.25rem'
        }
    }
});

type RowType = {
    categoryId: number;
    categoryName: any;
};

enum AddQuestionText {
    additionalInfoValidation = 'Additional Info should be under 3000 Characters',
    regulationValidation = 'Regulation is required',
    regulationMaxValidation = 'Regulation should be under 3000 Characters',
    actionValidation = 'Action for non-compliance should be under 1500 Characters',
    ordinanceValidation = 'Ordinance/Code is required',
    ordinanceMaxValidation = 'Ordinance/Code should be under 300 Characters',
    chapterValidation = 'Chapter/Part is required',
    chapterMaxValidation = 'Chapter should be under 300 Characters',
    sectionValidation = 'Section is required',
    sectionMaxValidation = 'Section should be under 300 Characters',
    questionValidation = 'New question is required',
    questionMaxValidation = 'Question should be under 1500 Characters',
    compliantAnswerValidation = 'Compliant answer is required',
    nonCompliantAnswerValidation = 'Non-compliant answer is required',
    categoryListingItemValidation = 'Category is required',
    questionTypeValidation = 'Question type is required',
    followupTriggerAnswerValidation = 'Trigger answer is required',
    followupCompliantAnswerValidation = 'Compliant answer is required',
    followupNonCompliantAnswerValidation = 'Non-compliant answer is required',
    followupActionValidation = 'Action for non-compliance should be under 1500 Characters',
    followupQuestionValidation = 'Follow up question is required',
    followupQuestionMaxValidation = 'Question should be under 1500 Characters',
    regionValidation = 'Question level is required',
    radioValidation = 'Question level is required',
}

const AddQuestion: React.FC = () => {
    const ITEM_HEIGHT = 60;

    const [questionTypeList, setQuestionTypeList] = React.useState<any[]>([]);
    const [compliantAnswerList, setCompliantAnswerList] = React.useState<any[]>(
        []
    );
    const [nonCompliantAnswerList, setNonCompliantAnswerList] = React.useState<
        any[]
    >([]);
    const [followupTriggerAnswerList, setFollowupTriggerAnswerList] =
        React.useState<any[]>([]);
    const [followupCompliantAnswerList, setFollowupCompliantAnswerList] =
        React.useState<any[]>([]);
    const [followupNonCompliantAnswerList, setFollowupNonCompliantAnswerList] =
        React.useState<any[]>([]);
    const [followupTriggerAnswer, setFollowupTriggerAnswer] = useState('');
    const [followupCompliantAnswer, setFollowupCompliantAnswer] = useState('');
    const [followupNonCompliantAnswer, setFollowupNonCompliantAnswer] =
        useState('');
    const [followupAction, setFollowupAction] = useState('');
    const [followupQuestion, setFollowupQuestion] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [regulation, setRegulation] = useState('');
    const [action, setAction] = useState('');
    const [ordinance, setOrdinance] = useState('');
    const [chapter, setChapter] = useState('');
    const [section, setSection] = useState('');
    const [question, setQuestion] = useState('');
    const [questionVersion, setQuestionVersion] = useState('1');
    const [compliantAnswer, setCompliantAnswer] = useState('');
    const [nonCompliantAnswer, setNonCompliantAnswer] = useState('');
    const [categoryListingItem, setCategoryListingItem] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [rows, setRows] = useState<any | null>(null);
    const [showFollowup, setShowFollowup] = useState(false);
    const token = localStorage.getItem('user');
    const userState = useSelector((state: DashboardType) => state.user);
    const history = useHistory();
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
        useState(false);
    const [
        removeConfirmationModalIsVisible,
        setRemoveConfirmationModalIsVisible,
    ] = useState(false);
    const [additionalInfoError, setAdditionalInfoError] = useState(false);
    const [regulationError, setRegulationError] = useState(false);
    const [actionError, setActionError] = useState(false);
    const [ordinanceError, setOrdinanceError] = useState(false);
    const [chapterError, setChapterError] = useState(false);
    const [sectionError, setSectionError] = useState(false);
    const [questionError, setQuestionError] = useState(false);
    const [compliantAnswerError, setCompliantAnswerError] = useState(false);
    const [nonCompliantAnswerError, setNonCompliantAnswerError] = useState(false);
    const [categoryListingItemError, setCategoryListingItemError] =
        useState(false);
    const [questionTypeError, setQuestionTypeError] = useState(false);
    const [followupTriggerAnswerError, setFollowupTriggerAnswerError] =
        useState(false);
    const [followupCompliantAnswerError, setFollowupCompliantAnswerError] =
        useState(false);
    const [followupNonCompliantAnswerError, setFollowupNonCompliantAnswerError] =
        useState(false);
    const [followupActionError, setFollowupActionError] = useState(false);
    const [followupQuestionError, setFollowupQuestionError] = useState(false);
    const [radioHelperText, setRadioHelperText] = React.useState('');
    const [additionalInfoErrorText, setAdditionalInfoErrorText] = useState('');
    const [regulationErrorText, setRegulationErrorText] = useState('');
    const [actionErrorText, setActionErrorText] = useState('');
    const [ordinanceErrorText, setOrdinanceErrorText] = useState('');
    const [chapterErrorText, setChapterErrorText] = useState('');
    const [sectionErrorText, setSectionErrorText] = useState('');
    const [questionErrorText, setQuestionErrorText] = useState('');
    const [compliantAnswerErrorText, setCompliantAnswerErrorText] = useState('');
    const [nonCompliantAnswerErrorText, setNonCompliantAnswerErrorText] =
        useState('');
    const [categoryListingItemErrorText, setCategoryListingItemErrorText] =
        useState('');
    const [questionTypeErrorText, setQuestionTypeErrorText] = useState('');
    const [followupTriggerAnswerErrorText, setFollowupTriggerAnswerErrorText] =
        useState('');
    const [
        followupCompliantAnswerErrorText,
        setFollowupCompliantAnswerErrorText,
    ] = useState('');
    const [
        followupNonCompliantAnswerErrorText,
        setFollowupNonCompliantAnswerErrorText,
    ] = useState('');
    const [followupActionErrorText, setFollowupActionErrorText] = useState('');
    const [followupQuestionErrorText, setFollowupQuestionErrorText] =
        useState('');
    const [showLoader, setShowLoader] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [editQuesId, setEditQuesId] = useState<any>(0);
    const [addQuestionThrowState, setAddQuestionThrowState] = useState(false);
    const [addQuestionAnother, setAddQuestionAnother] = useState(false);
    const [hideButton, setHideButton] = useState(false);
    const [sopLevel, setSopLevel] = useState('');
    const [CityOrCountyStates, setCityOrCountyStates] = useState<any[]>([]);
    const [cityOrCountyStateDetails, setCityOrCountyStatesDetails] = useState<
        any[]
    >([]);
    const [SelectedState, setSelectedState] = useState('');
    const [cityAndCounty, setCityAndCounty] = useState<any[]>([]);
    const [cityORCountyName, setCityORCountyName] = useState('');
    const [cityOrCountyNameError, setCityOrCountyNameError] = useState(false);
    const [cityOrCountyNameErrorText, setCityOrCountyNameErrorText] =
        useState(' ');
    const [selectedStateError, setSelectedStateError] = useState(false);
    const [selectedStateErrorText, setSelectedStateErrorText] = useState(' ');
    const [isOpen, setIsOpen] = useState(false);
    const questionLevelNumberFromAddRegion = historyVaribaleChecker('questionLevelNumber', history);
    const addQuestionToState = historyVaribaleChecker('cityORCountyName', history);
    const addToState = historyVaribaleChecker('selectedState', history);
    const editQuestionId = historyVaribaleChecker('editQuestionId', history);
    const versionId = historyVaribaleChecker('versionId', history);
    const SaqCategory = historyVaribaleChecker('SaqCategory', history);
    const [notificationAlertOpen, setNotificationAlertOpen] = useState(false);
    const [notifyUserChanges, setNotifyUserChanges] = useState('');
    const [summaryChanges, setSummaryChanges] = React.useState('');
    const [selfAuditNeeded, setSelfAuditNeeded] = React.useState('');
    const [isButtonDisabelOnEditMode, setIsButtonDisabelOnEditMode] = React.useState(false);
    const [questionOrder, setQuestionOrder] = React.useState<number>();

    
    useEffect(() => {
        resetFields();
        resetFollowupQuestion();
        if (editQuestionId) {
            getQuestion();
        }
        if (rows == null) {
            getCategoryListing();
            setAddQuestionThrowState(false);
            setHideButton(true);
        }
        getFollowupTriggerAnswerList();
        getFollowupCompliantAnswerList();
        getFollowupNonCompliantAnswerList();
        getCompliantAnswerList();
        getNonCompliantAnswerList();
        getQuestionTypeList();
    }, []);

    useEffect(() => {
        if (addQuestionToState) {
            setEditQuesId(0);
            setAddQuestionThrowState(true);
            setHideButton(false);
        }
    }, [addQuestionToState]);

    useEffect(() => {
        resetFields();
        resetFollowupQuestion();
        getFollowupTriggerAnswerList();
        getFollowupCompliantAnswerList();
        getFollowupNonCompliantAnswerList();
        getCompliantAnswerList();
        getNonCompliantAnswerList();
        getQuestionTypeList();
    }, [addQuestionAnother]);

    useEffect(() => {
        if (editQuestionId) {
            setEditQuesId(editQuestionId);
        }
    }, [editQuesId]);

    const getFollowupTriggerAnswerList = () => {
        const followTriggerAnswerList: Array<string> = ['Yes', 'No'];
        setFollowupTriggerAnswerList(followTriggerAnswerList);
    };

    const getFollowupCompliantAnswerList = () => {
        const followCompliantAnswerList: Array<string> = ['Yes', 'No'];
        setFollowupCompliantAnswerList(followCompliantAnswerList);
    };

    const getFollowupNonCompliantAnswerList = () => {
        const followNonCompliantAnswerList: Array<string> = ['Yes', 'No'];
        setFollowupNonCompliantAnswerList(followNonCompliantAnswerList);
    };

    const getCompliantAnswerList = () => {
        const quesCompliantAnswerList: Array<string> = ['Yes', 'No'];
        setCompliantAnswerList(quesCompliantAnswerList);
    };

    const getNonCompliantAnswerList = () => {
        const quesNonCompliantAnswerList: Array<string> = ['Yes', 'No'];
        setNonCompliantAnswerList(quesNonCompliantAnswerList);
    };

    const getQuestionTypeList = () => {
        const quesTypeList: Array<string> = [
            'Retail & Delivery',
            'Delivery only',
            'Retail only',
        ];
        setQuestionTypeList(quesTypeList);
    };
    const ConfirmationMessageToaster = (): JSX.Element => {
        if (confirmationModalIsVisible) {
            return (<SuccessToaster
                message={
                    editQuesId !== 0
                        ? 'Changes Saved Successfully'
                        : 'Question Added'
                }
            />);
        }
        else {
            return (<></>);
        }
    };
    const RemoveConfirmationModalIsVisible = (): JSX.Element => {
        if (removeConfirmationModalIsVisible) {
            return (<SuccessToaster message="Question archived successfully" />);
        }
        else {
            return (<></>);
        }
    };
    const AddQuestionFromCityCountyPage = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<>{addQuestionThrowState && (
                <div className="page-title">
                    <h1 className="bold font">Add Question to {SaqCategory}</h1>
                </div>
            )}
            </>);
        }
        else {
            return (<></>);
        }
    };
    const QuestionDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="col">
                <FormLabel
                    id="question-1"
                    className="form-label font-16"
                >
                    New question
                </FormLabel>
                <div className="mt-3">
                    <TextBox
                        error={questionError}
                        helperText={questionError ? questionErrorText : ''}
                        hiddenLabel
                        id="question"
                        aria-labelledby="question-1"
                        variant="filled"
                        className={`input-form form-control ${classes.root} ${classes.questionText}`}
                        value={question}
                        placeholder={'Enter text'}
                        multiline
                        rows={5}
                        disableUnderline={false}
                        fullWidth
                        width={1502}
                        maxLength={1500}
                        height={150}
                        style={{
                            fontSize: '16px',
                            color: '#001e46',
                            fontWeight: 'normal',
                            backgroundColor: '#F9F9F9',
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setQuestion(e.target.value);
                            setQuestionError(false);
                        }}
                    />
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const AdditionalInfoDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="col">
                <FormLabel
                    id="AdditionalInfo"
                    className="form-label font-16"
                >
                    Additional Info
                </FormLabel>
                <div className="mt-3">
                    <TextBox
                        error={additionalInfoError}
                        helperText={
                            additionalInfoError ? additionalInfoErrorText : ''
                        }
                        id="AdditionalInfo-1"
                        aria-labelledby="AdditionalInfo"
                        variant="filled"
                        className={`input-form form-control ${classes.root} ${classes.questionText}`}
                        value={additionalInfo}
                        placeholder={'Enter text'}
                        multiline
                        rows={5}
                        disableUnderline={false}
                        fullWidth
                        width={5000}
                        maxLength={3000}
                        height={150}
                        style={{
                            fontSize: '16px',
                            color: '#001e46',
                            fontWeight: 'normal',
                            backgroundColor: '#F9F9F9',
                        }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setAdditionalInfo(e.target.value);
                            setAdditionalInfoError(false);
                        }}
                    />
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const OrdinanceChapterSectionDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="row sm-3">
                <div className="col-sm-4">
                    <FormLabel
                        id="Ordinance/Code"
                        className="form-label font-16"
                    >
                        Ordinance/Code
                    </FormLabel>
                    <div className="mt-3">
                        <TextBox
                            error={ordinanceError}
                            helperText={ordinanceError ? ordinanceErrorText : ''}
                            id="Ordinance/Code - 1"
                            aria-labelledby="Ordinance/Code"
                            variant="filled"
                            className={`input-form form-control ${classes.root} ${classes.ordinanceCode}`}
                            placeholder={'Enter text'}
                            value={ordinance}
                            rows={5}
                            disableUnderline={false}
                            multiline
                            width={500}
                            maxLength={300}
                            height={150}
                            style={{
                                fontSize: '16px',
                                color: '#001e46',
                                fontWeight: 500,
                                backgroundColor: '#F9F9F9',
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setOrdinance(e.target.value);
                                setOrdinanceError(false);
                            }}
                        />
                    </div>
                </div>

                <div className="col-sm-4">
                    <FormLabel
                        id="Chapter/Part"
                        className="form-label font-16"
                    >
                        Chapter/Part
                    </FormLabel>
                    <div className="mt-3">
                        <TextBox
                            error={chapterError}
                            helperText={chapterError ? chapterErrorText : ''}
                            id="Chapter/Part-1"
                            aria-labelledby="Chapter/Part"
                            variant="filled"
                            className={`input-form form-control ${classes.root} ${classes.chapterPart}`}
                            value={chapter}
                            placeholder={'Enter text'}
                            rows={5}
                            disableUnderline={false}
                            multiline
                            width={300}
                            maxLength={300}
                            height={150}
                            style={{
                                fontSize: '16px',
                                color: '#001e46',
                                fontWeight: 'normal',
                                backgroundColor: '#F9F9F9',
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setChapter(e.target.value);
                                setChapterError(false);
                            }}
                        />
                    </div>
                </div>
                <div className="col-sm-4">
                    <FormLabel
                        id="Section"
                        className="form-label font-16"
                    >
                        Section
                    </FormLabel>
                    <div className="mt-3">
                        <TextBox
                            error={sectionError}
                            helperText={sectionError ? sectionErrorText : ''}
                            id="Section-1"
                            aria-labelledby="Section"
                            variant="filled"
                            className={`input-form form-control ${classes.root} ${classes.chapterPart}`}
                            value={section}
                            rows={5}
                            disableUnderline={false}
                            placeholder={'Enter text'}
                            multiline
                            width={300}
                            maxLength={300}
                            height={150}
                            style={{
                                fontSize: '16px',
                                color: '#001e46',
                                fontWeight: 'normal',
                                backgroundColor: '#F9F9F9',
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setSection(e.target.value);
                                setSectionError(false);
                            }}
                        />
                    </div>
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const CategoryQuestionTypeQuestionVersionDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="row mt-3">
                <div className="col-sm-3">
                    <FormLabel
                        id="SelectACategory-1"
                        className="form-label font-16"
                    >
                        Category </FormLabel>
                    <div className="mt-3">
                        <Select
                            name="SelectACategory"
                            labelId="SelectACategory-1"
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            variant="filled"
                            className="input-form select-field"
                            IconComponent={CustomExpandMore}
                            value={categoryListingItem}
                            onChange={(e: SelectChangeEvent) => { handleCategoryListingItem(e); }}
                            label="Select ACategory"
                            aria-label="Select ACategory"                        >
                            <MenuItem disabled value={''}>
                                <span className="input-placeholder">Select one</span>
                            </MenuItem>
                            {rows.map((row: RowType) => (
                                <MenuItem
                                    key={row.categoryName}
                                    value={`${row.categoryId}`}
                                >
                                    <Tooltip
                                        title={
                                            row.categoryName.length > 20
                                                ? row.categoryName
                                                : ''
                                        }
                                        placement="top"
                                        arrow
                                    >
                                        <div
                                            className="tooltip-content"
                                        >
                                            {row.categoryName.length > 20
                                                ? row.categoryName.slice(0, 20) + '...'
                                                : row.categoryName}
                                        </div>
                                    </Tooltip>
                                </MenuItem>
                            ))}
                        </Select>
                        <div className="error">
                            {categoryListingItemError
                                ? categoryListingItemErrorText
                                : ''}
                        </div>
                    </div>
                </div>
                <div className="col-sm-3">
                    <FormLabel
                        id="QuestionType-1"
                        className="form-label font-16"
                    >
                        Question type
                    </FormLabel>
                    <div className="mt-3">
                        <Select
                            name="QuestionType"
                            labelId="QuestionType-1"
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            variant="filled"
                            className="input-form select-field"
                            IconComponent={CustomExpandMore}
                            value={questionType}
                            onChange={(e: SelectChangeEvent) => { handleQuestionType(e); }}
                            label="Question Type"
                            aria-label="Question Type">
                            <MenuItem disabled value={''}>
                                <span className="input-placeholder">Select one</span>
                            </MenuItem>
                            {questionTypeList.map((item, index) => (
                                <MenuItem key={item} value={index}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                        <div className="error">
                            {questionTypeError ? questionTypeErrorText : ''}
                        </div>
                    </div>
                </div>

                <div className="col-sm-3">
                    <FormLabel
                        id="SopCounty-1"
                        className="form-label font-16"
                    >
                        Question version
                    </FormLabel>
                    <div className="mt-3">
                        <TextBox
                            id="county-1"
                            aria-labelledby="SopCounty-1"
                            variant="standard"
                            value={questionVersion}
                            rows={1}
                            placeholder="1.0"
                            disabled
                            width={80}
                            height={55}
                            textAlign="center"
                            maxLength={20}
                            style={{
                                fontSize: 16, background: '#F9F9F9', padding: 10
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setQuestionVersion(e.target.value);
                            }}
                        />
                    </div>
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const CompliantAndNonCompliantDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<>
                <div className="col-sm-3">
                    <FormLabel
                        id="CompliantAnswer-1"
                        className="form-label font-16"
                    >
                        Compliant answer
                    </FormLabel>
                    <div className="mt-3">
                        <Select
                            name="CompliantAnswer"
                            labelId="CompliantAnswer-1"
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            variant="filled"
                            className="input-form select-field"
                            IconComponent={CustomExpandMore}
                            value={compliantAnswer}
                            onChange={(e: SelectChangeEvent) => { handleCompliantAnswerSwap(e); }}
                            label="CompliantAnswer"
                            aria-label="CompliantAnswer"
                        >
                            <MenuItem disabled value={''}>
                                <span className="input-placeholder">Select one</span>
                            </MenuItem>
                            {compliantAnswerList.map((item, index) => (
                                <MenuItem key={`${item}-${index}`} value={index}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                        <div className="error">
                            {compliantAnswerError ? compliantAnswerErrorText : ''}
                        </div>
                    </div>
                </div>
                <div className="col-sm-3">
                    <FormLabel
                        id="NonCompliantAnswer-1"
                        className="form-label font-16"
                    >
                        Non-compliant answer
                    </FormLabel>
                    <div className="mt-3">
                        <Select
                            name="NonCompliantAnswer"
                            labelId="NonCompliantAnswer-1"
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            variant="filled"
                            className="input-form select-field"
                            IconComponent={CustomExpandMore}
                            value={nonCompliantAnswer}
                            onChange={(e: SelectChangeEvent) => {
                                handleNonCompliantAnswerSwap(e);
                            }}
                            label="Non-compliant answer"
                            aria-label="Non-compliant answer"
                        >
                            <MenuItem disabled value={''}>
                                <span className="input-placeholder">Select one</span>
                            </MenuItem>
                            {nonCompliantAnswerList.map((item, index) => (
                                <MenuItem key={`${item}`} value={index}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                        <div className="error">
                            {nonCompliantAnswerError
                                ? nonCompliantAnswerErrorText
                                : ''}
                        </div>
                    </div>
                </div>
            </>);
        }
        else {
            return (<></>);
        }
    };
    const CityCountyStateCompliantAndNonCompliantDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="row mt-2">
                <CompliantAndNonCompliantDiv />
                {hideButton && (
                    <div className="col-sm-3">
                        <FormLabel
                            id="sopLevel-label"
                            className="form-label font-16"
                        >
                            Question level
                        </FormLabel>

                        <RadioGroup
                            name="radio-buttons-answers"
                            aria-labelledby="sopLevel-label"
                            value={sopLevel}
                            onChange={(e) => {
                                resetFieldsForStateCityCounty();
                                setSopLevel(e.target.value);
                                setRadioHelperText('');
                            }}
                            row
                        >
                            <FormControlLabel
                                value="2"
                                control={<Radio />}
                                label={
                                    <span
                                        className="city-county-state-label"
                                    >
                                        State
                                    </span>
                                }
                                style={{ fontWeight: 5 }}
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                            <FormControlLabel
                                value="1"
                                control={<Radio />}
                                label={
                                    <span
                                        className="city-county-state-label"
                                    >
                                        County
                                    </span>
                                }
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                            <FormControlLabel
                                value="0"
                                control={<Radio />}
                                label={
                                    <span
                                        className="city-county-state-label"
                                    >
                                        City
                                    </span>
                                }
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                        </RadioGroup>
                        <FormHelperText className="form-helper-text-color">
                            {radioHelperText}
                        </FormHelperText>

                        {(parseInt(sopLevel) === 2 ||
                            parseInt(sopLevel) === 1 ||
                            parseInt(sopLevel) === 0) && (
                                <div className="col-sm-12">
                                    <TextBox
                                        error={cityOrCountyNameError}
                                        helperText={
                                            cityOrCountyNameError
                                                ? cityOrCountyNameErrorText
                                                : ''
                                        }
                                        hiddenLabel
                                        value={cityORCountyName}
                                        placeholder={'Start Typing Region Name..'}
                                        id="txt-cityOrCounty"
                                        variant="filled"
                                    className={'input-form add-question-text-feild-wrapper width-webkit-fill-available'}
                                        width={400}
                                        disableUnderline={false}
                                        style={{
                                            fontSize: '16px',
                                            color: '#001e46',
                                            fontWeight: 'normal',
                                            backgroundColor: '#F9F9F9',
                                        }}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                            setCityORCountyName(event.target.value);
                                            searchStateCountyOrCityData(event);
                                            setCityOrCountyNameError(false);
                                        }}
                                        autoComplete="off"
                                        height={55}
                                    />
                                    {isOpen && (
                                        <Box className={classes.menuBoxSx}>
                                            <ul className={classes.menuUl}>
                                                {cityAndCounty.length !== 0 &&
                                                    cityAndCounty.map((item) => (
                                                        <MenuItem
                                                            className="form-label font-16"
                                                            onClick={() => {
                                                                selectStatesOfCountyOrCity(
                                                                    item.name.trim()
                                                                );
                                                                setIsOpen(false);
                                                            }}
                                                            key={item.id}
                                                            value={item.name}
                                                        >
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                {cityAndCounty.length === 0 && (
                                                    <MenuItem
                                                        className="form-label font-16"
                                                    >
                                                        <span>No Region Found</span>
                                                    </MenuItem>
                                                )}
                                            </ul>
                                        </Box>
                                    )}
                                </div>
                            )}
                    </div>
                )}
                <div className="col-sm-3">
                    {HandleCityORCountyName()}
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const RegulationActionDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="row mt-2">
                <div className="col-sm-6">
                    <FormLabel
                        id="Regulation"
                        className="form-label font-16"
                    >
                        Regulation
                    </FormLabel>
                    <div className="mt-3">
                        <TextBox
                            error={regulationError}
                            id="Regulation-1"
                            aria-labelledby="Regulation"
                            variant="filled"
                            className={`form-control ${classes.root} ${classes.ordinanceCode}`}
                            value={regulation}
                            rows={5}
                            disableUnderline={false}
                            placeholder={'Enter text'}
                            multiline
                            width={500}
                            maxLength={3000}
                            height={202}
                            style={{
                                fontSize: '16px',
                                color: '#001e46',
                                fontWeight: 'normal',
                                backgroundColor: '#F9F9F9',
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setRegulation(e.target.value);
                                setRegulationError(false);
                            }}
                        />
                        {regulationError && <div className="error">{regulationErrorText}</div>}
                    </div>
                </div>
                <div className="col-sm-6">
                    <FormLabel
                        id="Action"
                        className="form-label font-16"
                    >
                        Action for non-compliance (if applicable)
                    </FormLabel>
                    <div className="mt-3">
                        <TextBox
                            error={actionError}
                            helperText={actionError ? actionErrorText : ''}
                            id="Action-1"
                            aria-labelledby="Action"
                            variant="filled"
                            className={`input-form form-control ${classes.root} ${classes.chapterPart}`}
                            value={action}
                            rows={5}
                            disableUnderline={false}
                            placeholder={'Enter text'}
                            multiline
                            width={500}
                            maxLength={1500}
                            height={202}
                            style={{
                                fontSize: '16px',
                                color: '#001e46',
                                fontWeight: 'normal',
                                backgroundColor: '#F9F9F9',
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setAction(e.target.value);
                                setActionError(false);
                            }}
                        />
                    </div>
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const BottomButtonDiv = (): JSX.Element => {
        if (roleValidator(userState['role']) === RegTechWriter) {
            return (<div className="d-flex mb-5 justify-content-between ms-0">
                <div className="d-flex">
                    <div className="pt-3">
                        {hideButton && (
                            <Button
                                disabled={isButtonDisabelOnEditMode}
                                variant="outlined"
                                className="cancel-audit-button"
                                onClick={() => history.go(-1)}
                            >
                                Cancel
                            </Button>
                        )}

                        {addQuestionThrowState && (
                            <Button
                                variant="outlined"
                                className="cancel-audit-button"
                                onClick={() => history.push('/self-audit-questions')}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                    <div className=" pt-4 ms-4">
                        {editQuesId !== 0 && (
                            <div
                                className="delete-audit-question-button"
                                onClick={() =>
                                    !isButtonDisabelOnEditMode
                                        ? setAlertOpen(true)
                                        : false
                                }
                            >
                                Archive Question
                            </div>
                        )}
                    </div>
                </div>
                <div className="ms-auto pt-4">
                    {hideButton && editQuesId !== 0 && (
                        <Button
                            disabled={isButtonDisabelOnEditMode}
                            variant="contained"
                            className="save-exit-button"
                            onClick={() => onsubmit()}
                        >
                            {'Next'}
                        </Button>
                    )}

                    {(addQuestionThrowState || editQuesId === 0) && (
                        <Button
                            variant="contained"
                            className="publish-button"
                            onClick={() => checkFromWhichroute()}
                        >
                            Submit
                        </Button>
                    )}
                    {(addQuestionThrowState || editQuesId === 0) && (
                        <Button
                            variant="contained"
                            className="add-another-question-button"
                            onClick={() => {
                                addQuestionCheck();
                            }}
                        >
                            Add Another Question
                        </Button>
                    )}
                </div>
            </div>);
        }
        else {
            return (<></>);
        }
    };
    const NoFollowupSection = (): JSX.Element => {
        if (!showFollowup) {
            return (
                <Button
                    className="follow-up-button"
                    onClick={() => {
                        setShowFollowup(true);
                    }}
                >
                    {editQuesId !== 0 && 'Edit follow-up question'}
                    {editQuesId === 0 && '+ Add Follow Up Question'}
                </Button>
            );
        }
        else {
            return (<></>);
        }
    };
    const ShowFollowupSection = (): JSX.Element => {
        if (showFollowup) {
            return (
                <>
                    <div className="d-flex justify-content-between">
                        <FormLabel
                            id="followUpQuestion-1"
                            className="font-16 form-label">
                            Follow up question
                        </FormLabel>
                        <div className="mr-4">
                            {' '}
                            <Button
                                className="follow-up-button"
                                onClick={() => { resetFollowupQuestion(); }}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                    <div className="mt-3">
                        <TextBox
                            error={followupQuestionError}
                            helperText={
                                followupQuestionError ? followupQuestionErrorText : ''
                            }
                            id="followUpQuestion"
                            aria-labelledby="followUpQuestion-1"
                            variant="filled"
                            className={`input-form form-control ${classes.root} ${classes.questionText}`}
                            value={followupQuestion}
                            placeholder={'Enter text'}
                            multiline
                            rows={5}
                            disableUnderline={false}
                            fullWidth
                            width={5000}
                            maxLength={1500}
                            height={150}
                            key={`${Math.random}`}
                            style={{
                                fontSize: '16px', color: '#001e46',
                                fontWeight: 'normal', backgroundColor: '#F9F9F9',
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setFollowupQuestion(e.target.value);
                                setFollowupQuestionError(false);
                            }}
                        />
                    </div>
                    <div className="row mt-4">
                        <div className="col-sm-3">
                            <FormLabel
                                id="TriggerAnswer-1"
                                className="font-16 form-label">
                                Trigger answer
                            </FormLabel>
                            <div className="mt-3">
                                <Select
                                    name="TriggerAnswer"
                                    labelId="TriggerAnswer-1"
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    variant="filled"
                                    className={`input-form select-field ${classes.root} width-webkit-fill-available`}
                                    IconComponent={CustomExpandMore}
                                    value={followupTriggerAnswer}
                                    onChange={(e: SelectChangeEvent) => { handleFollowupTriggerAnswer(e); }}
                                    label="Trigger Answer"
                                    aria-label="Trigger Answer"
                                    displayEmpty>
                                    <MenuItem disabled value={''}>
                                        <span className="input-placeholder">
                                            Select one
                                        </span>
                                    </MenuItem>
                                    {followupTriggerAnswerList.map((item, index) => (
                                        <MenuItem key={item} value={index}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <div className="error">
                                    {followupTriggerAnswerError ? followupTriggerAnswerErrorText : ''}
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <FormLabel
                                id="FollowCompliantAnswer-1"
                                className="font-16 form-label">
                                Compliant answer
                            </FormLabel>
                            <div className="mt-3">
                                <Select
                                    name="FollowCompliantAnswer"
                                    labelId="FollowCompliantAnswer-1"
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    variant="filled"
                                    className="input-form select-field width-webkit-fill-available"
                                    IconComponent={CustomExpandMore}
                                    value={followupCompliantAnswer}
                                    onChange={(e: SelectChangeEvent) => { handleFollowupCompliantAnswerSwap(e); }}
                                    label="FollowCompliantAnswer"
                                    aria-label="FollowCompliantAnswer">
                                    <MenuItem disabled value={''}>
                                        <span className="input-placeholder">
                                            Select one
                                        </span>
                                    </MenuItem>
                                    {followupCompliantAnswerList.map((item, index) => (
                                        <MenuItem key={`${item}-${index}`} value={index}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <div className="error">
                                    {followupCompliantAnswerError ? followupCompliantAnswerErrorText : ''}
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-3">
                            <FormLabel
                                id="FollowNonCompliantAnswer-1"
                                className="font-16 form-label">
                                Non-compliant answer
                            </FormLabel>
                            <div className="mt-3">
                                <Select
                                    name="FollowNonCompliantAnswer"
                                    labelId="FollowNonCompliantAnswer-1"
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Without label' }}
                                    variant="filled"
                                    className="input-form select-field width-webkit-fill-available"
                                    IconComponent={CustomExpandMore}
                                    value={followupNonCompliantAnswer}
                                    onChange={(e: SelectChangeEvent) => { handleFollowupNonCompliantAnswerSwap(e); }}
                                    label="FollowNonCompliantAnswer"
                                    aria-label="FollowNonCompliantAnswer">
                                    <MenuItem disabled value={''}>
                                        <span className="input-placeholder">
                                            Select one
                                        </span>
                                    </MenuItem>
                                    {followupNonCompliantAnswerList.map((item, index) => (
                                        <MenuItem key={`${item}--${index}`} value={index}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <div className="error">
                                    {followupNonCompliantAnswerError ? followupNonCompliantAnswerErrorText : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <FormLabel
                            id="FollowAction-1"
                            className="font-16 form-label">
                            Action for non-compliance (if applicable)
                        </FormLabel>
                        <div className="mt-3">
                            <TextBox
                                error={followupActionError}
                                helperText={
                                    followupActionError ? followupActionErrorText : ''
                                }
                                id="FollowAction"
                                aria-labelledby="FollowAction-1"
                                variant="filled"
                                className={`input-form form-control ${classes.root} ${classes.questionText}`}
                                value={followupAction}
                                placeholder={'Enter text'}
                                multiline
                                rows={5}
                                disableUnderline={false}
                                fullWidth
                                width={5000}
                                maxLength={1500}
                                height={150}
                                style={{ fontSize: '16px', color: '#001e46', fontWeight: 'normal', backgroundColor: '#F9F9F9', }}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setFollowupAction(e.target.value);
                                    setFollowupActionError(false);
                                }}
                            />
                        </div>
                    </div>
                </>
            );
        }
        else
            return (<></>);
    };
    const HandleCityORCountyName = (): JSX.Element => {
        if (cityORCountyName !== '' && SelectedState) {
            if (parseInt(sopLevel) === 1 || parseInt(sopLevel) === 0) {
                return (<div className="">
                    <>
                        <FormLabel
                            id="State Pick"
                            className="font-16 form-label"
                        >
                            Choose a State
                        </FormLabel>
                        <Select
                            error={selectedStateError}
                            defaultValue=""
                            name="ddl-State"
                            displayEmpty
                            value={SelectedState}
                            inputProps={{ 'aria-label': 'Without label' }}
                            variant="filled"
                            className={`input-form select-field ${classes.root} width-webkit-fill-available`}
                            IconComponent={KeyboardArrowDownIcon}
                            onChange={(e) => {
                                handleCityOrCountyChange(e);
                            }}
                            label="All States"
                            sx={{
                                marginTop: '10px !important',
                                marginRight: '0px',
                            }}
                            aria-label="All States"
                        >
                            {CityOrCountyStates.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {selectedStateError && (
                            <FormHelperText className="form-helper-text-color ms-2">
                                {selectedStateErrorText}
                            </FormHelperText>
                        )}
                    </>
                </div>);
            }
            else {
                return (<></>);
            }
        }
        else {
            return (<></>);
        }
    };
    const resetFields = () => {
        setCategoryListingItem('');
        setNonCompliantAnswerList([]);
        setCompliantAnswerList([]);
        setFollowupCompliantAnswer('');
        setEditQuesId(0);
        setQuestionVersion('');
        resetFieldsForStateCityCounty();
        setAdditionalInfo('');
        setRegulation('');
        setAction('');
        setOrdinance('');
        setChapter('');
        setSection('');
        setQuestion('');
        setCompliantAnswer('');
        setNonCompliantAnswer('');
        setQuestionType('');
    };

    const resetFollowupQuestion = () => {
        setShowFollowup(false);
        setFollowupTriggerAnswerList([]);
        setFollowupCompliantAnswerList([]);
        setFollowupNonCompliantAnswerList([]);
        setFollowupTriggerAnswer('');
        setFollowupCompliantAnswer('');
        setFollowupNonCompliantAnswer('');
        setFollowupAction('');
        setFollowupQuestion('');
        setFollowupNonCompliantAnswerError(false);
        setFollowupCompliantAnswerError(false);
        setFollowupTriggerAnswerError(false);
        setFollowupActionError(false);
        setFollowupQuestionError(false);
        getFollowupTriggerAnswerList();
        getFollowupCompliantAnswerList();
        getFollowupNonCompliantAnswerList();
    };

    //validation of entire form
    const validateFields = () => {
        let validate = true;
        if (additionalInfo.trim().length > 3000) {
            setAdditionalInfoError(true);
            setAdditionalInfoErrorText(AddQuestionText.additionalInfoValidation);
            validate = false;
        }
        if (regulation.trim().length === 0) {
            setRegulationError(true);
            setRegulationErrorText(AddQuestionText.regulationValidation);
            validate = false;
        }
        if (regulation.trim().length > 3000) {
            setRegulationError(true);
            setRegulationErrorText(AddQuestionText.regulationMaxValidation);
            validate = false;
        }
        if (action.trim().length > 1500) {
            setActionError(true);
            setActionErrorText(AddQuestionText.actionValidation);
            validate = false;
        }
        if (section.trim().length === 0) {
            setSectionError(true);
            setSectionErrorText(AddQuestionText.sectionValidation);
            validate = false;
        }
        if (section.trim().length > 3000) {
            setSectionError(true);
            setSectionErrorText(AddQuestionText.sectionMaxValidation);
            validate = false;
        }
        if (chapter.trim().length === 0) {
            setChapterError(true);
            setChapterErrorText(AddQuestionText.chapterValidation);
            validate = false;
        }
        if (chapter.trim().length > 3000) {
            setChapterError(true);
            setChapterErrorText(AddQuestionText.chapterMaxValidation);
            validate = false;
        }
        if (ordinance.trim().length === 0) {
            setOrdinanceError(true);
            setOrdinanceErrorText(AddQuestionText.ordinanceValidation);
            validate = false;
        }
        if (ordinance.trim().length > 3000) {
            setOrdinanceError(true);
            setOrdinanceErrorText(AddQuestionText.ordinanceMaxValidation);
            validate = false;
        }
        if (question.trim().length === 0) {
            setQuestionError(true);
            setQuestionErrorText(AddQuestionText.questionValidation);
            validate = false;
        }
        if (question.trim().length > 3000) {
            setQuestionError(true);
            setQuestionErrorText(AddQuestionText.questionMaxValidation);
            validate = false;
        }
        validate = validateAddQuestionFirst(validate);
        return validate;
    };

    const validateAddQuestionFirst = (validate: boolean) => {
        if (categoryListingItem === '') {
            setCategoryListingItemError(true);
            setCategoryListingItemErrorText(
                AddQuestionText.categoryListingItemValidation
            );
            validate = false;
        }
        if (questionType.length === 0) {
            setQuestionTypeError(true);
            setQuestionTypeErrorText(AddQuestionText.questionTypeValidation);
            validate = false;
        }
        if (compliantAnswer === '') {
            setCompliantAnswerError(true);
            setCompliantAnswerErrorText(AddQuestionText.compliantAnswerValidation);
            validate = false;
        }
        if (nonCompliantAnswer === '') {
            setNonCompliantAnswerError(true);
            setNonCompliantAnswerErrorText(
                AddQuestionText.nonCompliantAnswerValidation
            );
            validate = false;
        }
        if (cityORCountyName.trim().length === 0 && hideButton === true) {
            setCityOrCountyNameError(true);
            setCityOrCountyNameErrorText(AddQuestionText.regionValidation);
            validate = false;
        }
        validate = validateAddQuestionSecond(validate);
        return validate;
    };

    const validateAddQuestionSecond = (validate: boolean) => {
        if (sopLevel.trim().length === 0 && hideButton === true) {
            setRadioHelperText(AddQuestionText.radioValidation);
            validate = false;
        }
        if (showFollowup) {
            if (followupQuestion.trim().length > 1500) {
                setFollowupQuestionError(true);
                setFollowupQuestionErrorText(
                    AddQuestionText.followupQuestionMaxValidation
                );
                validate = false;
            }
            if (followupQuestion.trim().length === 0) {
                setFollowupQuestionError(true);
                setFollowupQuestionErrorText(
                    AddQuestionText.followupQuestionValidation
                );
                validate = false;
            }
            if (followupCompliantAnswer === '') {
                setFollowupCompliantAnswerError(true);
                setFollowupCompliantAnswerErrorText(
                    AddQuestionText.followupCompliantAnswerValidation
                );
                validate = false;
            }
            if (followupNonCompliantAnswer === '') {
                setFollowupNonCompliantAnswerError(true);
                setFollowupNonCompliantAnswerErrorText(
                    AddQuestionText.followupNonCompliantAnswerValidation
                );
                validate = false;
            }
            if (followupTriggerAnswer.length === 0) {
                setFollowupTriggerAnswerError(true);
                setFollowupTriggerAnswerErrorText(
                    AddQuestionText.followupTriggerAnswerValidation
                );
                validate = false;
            }
            if (followupAction.trim().length > 3000) {
                setFollowupActionError(true);
                setFollowupActionErrorText(AddQuestionText.followupActionValidation);
                validate = false;
            }
        }
        return validate;
    };

    const compliantAnswerSwap = (event: any) => {
        setNonCompliantAnswerError(false);
        if (event === 0) {
            setCompliantAnswer('0');
            setNonCompliantAnswer('1');
        } else {
            setNonCompliantAnswer('0');
            setCompliantAnswer('1');
        }
    };

    const nonCompliantAnswerSwap = (event: any) => {
        setCompliantAnswerError(false);
        if (event === 0) {
            setCompliantAnswer('1');
            setNonCompliantAnswer('0');
        } else {
            setNonCompliantAnswer('1');
            setCompliantAnswer('0');
        }
    };

    const followupCompliantAnswerSwap = (event: any) => {
        setFollowupNonCompliantAnswerError(false);
        if (event === 0) {
            setFollowupCompliantAnswer('0');
            setFollowupNonCompliantAnswer('1');
        } else {
            setFollowupNonCompliantAnswer('0');
            setFollowupCompliantAnswer('1');
        }
    };

    const followupNonCompliantAnswerSwap = (event: any) => {
        setFollowupCompliantAnswerError(false);
        if (event === 0) {
            setFollowupCompliantAnswer('1');
            setFollowupNonCompliantAnswer('0');
        } else {
            setFollowupNonCompliantAnswer('1');
            setFollowupCompliantAnswer('0');
        }
    };

    // To get list of category.
    const getCategoryListing = () => {
        let saqData: any;
        setLoading(true);
        axios
            .get<GetResponse>(`${GET_CATEGORY_STATE_COUNTY_CITY}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setLoading(false);
                if (editQuestionId === null) {
                    setLoading(false);
                }
                if (res.status === 200 && res.data.isSuccess === true) {
                    saqData = res.data.result === null ? [] : res.data.result;
                    const AssignedCategory = Object.keys(saqData);
                    for (let index = 0; index < AssignedCategory.length; index++) {
                        const CategoryKey = AssignedCategory[index];
                        if (index === 0) {
                            const catrgorySortedData = SortRows('categoryName', saqData[CategoryKey]);
                            setRows(catrgorySortedData);
                        }
                    }
                }
            })
            .catch(() => {
                setShowLoader(false);
                SwalBox("Something went wrong!", "error");
            });
    };

    let questionData: any;
    let followUpData: any;

    const getQuestion = () => {
        const paramValue = editQuestionId;
        axios
            .get<GetResponse>(`${GET_QUESTION}${paramValue}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.status === 200 && res.data.isSuccess === true) {
                    questionData = res.data.result === null ? [] : res.data.result;
                    setCategoryListingItem(questionData.categoryId);
                    setQuestion(questionData.questionText);
                    setOrdinance(questionData.ordinanceCode);
                    setAction(questionData.actionForNonCompliant);
                    setRegulation(questionData.regulation);
                    setAdditionalInfo(questionData.additionInfo);
                    setSection(questionData.section);
                    setChapter(questionData.chapter);
                    setQuestionOrder(questionData.questionOrder);
                    if (versionId !== null) {
                        setQuestionVersion(versionId);
                    }
                    if (questionData !== null) {
                        checkForEditValues();
                    }
                } else {
                    SwalBox("Something went wrong!", "error");
                }
            })
            .catch(() => {
                SwalBox("Something went wrong!", "error");
            });
    };

    const checkForEditValues = () => {
        switch (true) {
            case questionData.questionType.toLowerCase() === 'retaildelivery':
                setQuestionType('0');
                break;
            case questionData.questionType.toLowerCase() === 'deliveryonly':
                setQuestionType('1');
                break;

            case questionData.questionType.toLowerCase() === 'retailonly':
                setQuestionType('2');
                break;
        }
        switch (true) {
            case questionData.compliantAnswer.toLowerCase() === 'yes':
                setCompliantAnswer('0');
                break;

            case questionData.compliantAnswer.toLowerCase() === 'no':
                setCompliantAnswer('1');
                break;
        }
        switch (true) {
            case questionData.nonCompliantAnswer.toLowerCase() === 'yes':
                setNonCompliantAnswer('0');
                break;

            case questionData.nonCompliantAnswer.toLowerCase() === 'no':
                setNonCompliantAnswer('1');
                break;
        }
        switch (true) {
            case questionData.questionLevel.toLowerCase() === 'state':
                setSopLevel('2');
                setCityORCountyName(questionData.state);
                break;

            case questionData.questionLevel.toLowerCase() === 'city':
                setSopLevel('0');
                setCityORCountyName(questionData.regionName);
                const cityArray: string[] = [];
                cityArray.push(questionData.state);
                CityOrCountyStates.push({
                    name: cityArray[0],
                    id: 1,
                });
                setCityOrCountyStates(CityOrCountyStates);
                setSelectedState(cityArray[0]);
                break;

            case questionData.questionLevel.toLowerCase() === 'county':
                setSopLevel('1');
                setCityORCountyName(questionData.regionName);
                const countyArray: string[] = [];
                countyArray.push(questionData.state);
                CityOrCountyStates.push({
                    name: countyArray[0],
                    id: 1,
                });
                setCityOrCountyStates(CityOrCountyStates);
                setSelectedState(countyArray[0]);
                break;
        }
        if (questionData.followUpQuestion !== null) {
            checkForFollowUpQuestions();
        }
    };

    const checkForFollowUpQuestions = () => {
        followUpData = questionData.followUpQuestion;
        switch (true) {
            case followUpData.compliantAnswer.toLowerCase() === 'yes':
                setFollowupCompliantAnswer('0');
                break;
            case followUpData.compliantAnswer.toLowerCase() === 'no':
                setFollowupCompliantAnswer('1');
                break;
        }
        switch (true) {
            case followUpData.nonCompliantAnswer.toLowerCase() === 'yes':
                setFollowupNonCompliantAnswer('0');
                break;

            case followUpData.nonCompliantAnswer.toLowerCase() === 'no':
                setFollowupNonCompliantAnswer('1');
                break;
        }
        switch (true) {
            case followUpData.triggerAnswer.toLowerCase() === 'yes':
                setFollowupTriggerAnswer('0');
                break;

            case followUpData.triggerAnswer.toLowerCase() === 'no':
                setFollowupTriggerAnswer('1');
                break;
        }
        setFollowupQuestion(followUpData.questionText);
        setFollowupAction(followUpData.actionForNonCompliant);
        setLoading(false);
    };

    const paramFromDatabase = {
        categoryId: parseInt(categoryListingItem),
        questionText: question.trim(),
        questionType: parseInt(questionType),
        compliantAnswer: parseInt(compliantAnswer),
        nonCompliantAnswer: parseInt(nonCompliantAnswer),
        regionName: addQuestionToState,
        state:
            questionLevelNumberFromAddRegion === 2 ? addQuestionToState : addToState,
        questionLevel: questionLevelNumberFromAddRegion,
        chapter: chapter.trim(),
        ordinanceCode: ordinance.trim(),
        regulation: regulation.trim(),
        section: section.trim(),
        additionInfo: additionalInfo.trim(),
        actionForNonCompliant: action.trim(),
        followUpQuestion:
            followupQuestion.trim().length === 0
                ? null
                : {
                    triggerAnswer: parseInt(followupTriggerAnswer),
                    questionText: followupQuestion.trim(),
                    nonCompliantAnswer: parseInt(followupNonCompliantAnswer),
                    compliantAnswer: parseInt(followupCompliantAnswer),
                    actionForNonCompliant: followupAction.trim(),
                },
    };

    const params = {
        categoryId: parseInt(categoryListingItem),
        questionText: question.trim(),
        questionType: parseInt(questionType),
        compliantAnswer: parseInt(compliantAnswer),
        nonCompliantAnswer: parseInt(nonCompliantAnswer),
        questionLevel: parseInt(sopLevel),
        regionName: parseInt(sopLevel) === 2 ? '' : cityORCountyName,
        state: parseInt(sopLevel) === 2 ? cityORCountyName : SelectedState,
        ordinanceCode: ordinance.trim(),
        chapter: chapter.trim(),
        section: section.trim(),
        regulation: regulation.trim(),
        actionForNonCompliant: action.trim(),
        additionInfo: additionalInfo.trim(),
        followUpQuestion:
            followupQuestion.trim().length === 0
                ? null
                : {
                    questionText: followupQuestion.trim(),
                    triggerAnswer: parseInt(followupTriggerAnswer),
                    compliantAnswer: parseInt(followupCompliantAnswer),
                    nonCompliantAnswer: parseInt(followupNonCompliantAnswer),
                    actionForNonCompliant: followupAction.trim(),
                },
    };

    const editParams = {
        categoryId: parseInt(categoryListingItem),
        questionText: question.trim(),
        questionType: parseInt(questionType),
        compliantAnswer: parseInt(compliantAnswer),
        nonCompliantAnswer: parseInt(nonCompliantAnswer),
        questionLevel: parseInt(sopLevel),
        regionName: parseInt(sopLevel) === 2 ? '' : cityORCountyName,
        state: parseInt(sopLevel) === 2 ? cityORCountyName : SelectedState,
        ordinanceCode: ordinance.trim(),
        questionId: editQuesId,
        chapter: chapter.trim(),
        section: section.trim(),
        regulation: regulation.trim(),
        actionForNonCompliant: action.trim(),
        additionInfo: additionalInfo.trim(),
        followUpQuestion:
            followupQuestion.trim().length === 0
                ? null
                : {
                    questionText: followupQuestion.trim(),
                    triggerAnswer: parseInt(followupTriggerAnswer),
                    compliantAnswer: parseInt(followupCompliantAnswer),
                    nonCompliantAnswer: parseInt(followupNonCompliantAnswer),
                    actionForNonCompliant: followupAction.trim(),
                },

        summaryOfChanges: summaryChanges,
        isSelfauditNeeded: notifyUserChanges === '0' ? '0' : selfAuditNeeded,
        questionOrder: questionOrder,
    };

    let validateForAnotherQuestion: boolean;
    const publish = () => {
        if (validateFields()) {
            setShowLoader(true);
            if (token != null) {
                axios
                    .post<GetResponse>(ADD_QUESTION, paramFromDatabase, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        setShowLoader(false);
                        if (res.status === 201 && res.data.isSuccess === true) {
                            setShowLoader(false);
                            checkForAddAnotherQuestion();
                        } else {
                            Swal.fire({
                                text: 'Something went wrong!',
                                confirmButtonText: 'OK',
                                icon: 'error',
                            });
                        }
                    })
                    .catch(() => setShowLoader(false));
            }
        }
    };

    const checkForAddAnotherQuestion = () => {
        if (validateForAnotherQuestion) {
            setConfirmationModalIsVisible(true);
            stateChangeforAnotherQuestion();
            window.scrollTo(0, 0);
        } else {
            setConfirmationModalIsVisible(true);
            setTimeout(() => {
                setConfirmationModalIsVisible(false);
                history.push('/self-audit-questions');
            }, 1000);
        }
    };

    const closeNotificationDialog = () => {
        setNotificationAlertOpen(false);
        setNotifyUserChanges('');
        setSummaryChanges('');
        setSelfAuditNeeded('');
        setIsButtonDisabelOnEditMode(false);
    };

    const checkFromWhichroute = () => {
        if (addQuestionThrowState) {
            publish();
        }
        else {
            onsubmit();
        }
    };

    const saveUpdateQuestion = () => {
        setShowLoader(true);
        if (token != null) {
            axios
                .post<GetResponse>(
                    editQuesId !== 0 ? EDIT_QUESTION : ADD_QUESTION,
                    editQuesId !== 0 ? editParams : params,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                .then((res) => {
                    if (res.status === 201 && res.data.isSuccess === true) {
                        setConfirmationModalIsVisible(true);
                        setShowLoader(false);
                        checkForAddAnotherQuestionOnAddQuestion();
                    } else {
                        setIsButtonDisabelOnEditMode(false);
                        setShowLoader(false);
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                .catch((error) => console.log(error));
        }
    };

    const checkForAddAnotherQuestionOnAddQuestion = () => {
        if (validateForAnotherQuestion) {
            setConfirmationModalIsVisible(true);
            stateChangeforAnotherQuestion();
            window.scrollTo(0, 0);
        } else {
            setConfirmationModalIsVisible(true);
            setTimeout(() => {
                setConfirmationModalIsVisible(false);
                history.go(-1);
            }, 3000);
        }
    };

    const stateChangeforAnotherQuestion = () => {
        setTimeout(() => {
            setConfirmationModalIsVisible(false);
            if (addQuestionAnother) {
                setAddQuestionAnother(false);
            } else {
                setAddQuestionAnother(true);
            }
        }, 1000);
    };

    //To submit the form
    const onsubmit = () => {
        if (validateFields()) {
            if (editQuesId !== 0) {
                setNotificationAlertOpen(true);
                setIsButtonDisabelOnEditMode(true);
            } else {
                setSummaryChanges('1');
                saveUpdateQuestion();
            }
        }
    };
    //This part handels sop level and their behaviour.
    const searchStateCountyOrCityData = (item: any) => {
        setCityOrCountyNameError(false);
        setIsOpen(false);
        if (item.target.value === '') {
            setIsOpen(false);
            handleCityOrCountyTextFieldBlank();
        }
        if (item.target.value.trim().length < 3) {
            setIsOpen(false);
            return;
        }
        const searchParams = {
            inputValue: item.target.value.trim(),
            type: parseInt(sopLevel),
        };
        axios
            .post<GetResponse>(`${SEARCHBY_COUNTY_STATE_CITY}`, searchParams, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => {
                if (res.status === 201 && res.data.isSuccess === true) {
                    const apiData: any[] = res.data.result === null ? [] : res.data.result;
                    setCityOrCountyStatesDetails(apiData);
                    filterUniqueStateForCityOrCounty(apiData);
                    if (cityAndCounty.length === 0) {
                        setTimer();
                    }
                }
            })
            .catch((error) => console.log(error));
    };

    const removequestion = () => {
        if (token != null) {
            setShowLoader(true);
            axios
                .post<GetResponse>(REMOVE_QUESTION, editQuestionId, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    setShowLoader(false);
                    if (res.status === 201 && res.data.isSuccess === true) {
                        setAlertOpen(false);
                        setRemoveConfirmationModalIsVisible(true);
                        setTimeout(() => {
                            setConfirmationModalIsVisible(false);
                            history.go(-1);
                        }, 3000);
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                .catch(() => setShowLoader(false));
        }
    };
    const cancleDialogBox = () => {
        setAlertOpen(false);
    };
    const setTimer = () => {
        setTimeout(() => {
            setIsOpen(false);
        }, 2000);
    };

    const addQuestionCheck = () => {
        validateForAnotherQuestion = true;
        if (addQuestionThrowState) {
            publish();
        }
        else {
            onsubmit();
        }
    };

    const filterUniqueStateForCityOrCounty = (item: any) => {
        const selectedcityOrCountyItem: string[] = [];
        for (const selectedCC of item) {
            if (parseInt(sopLevel) === 0) {
                selectedcityOrCountyItem.push(selectedCC.city.trim());
            } else if (parseInt(sopLevel) === 1) {
                selectedcityOrCountyItem.push(selectedCC.county.trim());
            } else if (parseInt(sopLevel) === 2) {
                selectedcityOrCountyItem.push(selectedCC.state.trim());
            }
        }
        loopProcess(cityAndCounty, 'popCityOrCounty');

        const uniqueCityOrCountyOrState = selectedcityOrCountyItem.filter(
            (previous, index, actual) => actual.indexOf(previous) === index
        );

        for (let index = 0; index < uniqueCityOrCountyOrState.length; index++) {
            cityAndCounty.push({ name: uniqueCityOrCountyOrState[index], id: index });
        }
        setCityAndCounty(cityAndCounty);
        setIsOpen(true);
    };

    const loopProcess = (item: any, infoType: string) => {
        const count = item.length;
        for (let index = 0; index < count; index++) {
            if (infoType === 'popState') {
                CityOrCountyStates.pop();
            } else if (infoType === 'pushState') {
                CityOrCountyStates.push({
                    name: item[index],
                    id: index,
                });
            }
            if (infoType === 'popCityOrCounty') {
                cityAndCounty.pop();
            }
        }
    };

    const handleCityOrCountyTextFieldBlank = () => {
        setCityOrCountyStates([]);
        setSelectedState('');
        setCityOrCountyNameErrorText('');
        setSelectedStateError(false);
        setSelectedStateErrorText('');
        setCityORCountyName('');
        setIsOpen(false);
    };

    const resetFieldsForStateCityCounty = () => {
        setSopLevel('');
        setSelectedState('');
        setCityOrCountyStates([]);
        setCityAndCounty([]);
        setCityORCountyName('');
        setCityOrCountyNameError(false);
        setSelectedStateError(false);
        setIsOpen(false);
        setCityOrCountyStatesDetails([]);
    };

    const handleCityOrCountyChange = (event: any) => {
        setSelectedState(event.target.value.trim());
        setSelectedStateError(false);
    };
    const handleFollowupTriggerAnswer = (event: SelectChangeEvent) => {
        setFollowupTriggerAnswer(event.target.value as string);
        setFollowupTriggerAnswerError(false);
    };
    const handleCategoryListingItem = (event: SelectChangeEvent) => {
        setCategoryListingItem(event.target.value);
        setCategoryListingItemError(false);
    };
    const handleQuestionType = (event: SelectChangeEvent) => {
        setQuestionType(event.target.value);
        setQuestionTypeError(false);
    };
    const handleCompliantAnswerSwap = (event: SelectChangeEvent) => {
        compliantAnswerSwap(event.target.value);
        setCompliantAnswerError(false);
    };
    const handleNonCompliantAnswerSwap = (event: SelectChangeEvent) => {
        nonCompliantAnswerSwap(event.target.value);
        setNonCompliantAnswerError(false);
    };
    const handleFollowupCompliantAnswerSwap = (event: SelectChangeEvent) => {
        followupCompliantAnswerSwap(event.target.value);
        setFollowupCompliantAnswerError(false);
    };
    const handleFollowupNonCompliantAnswerSwap = (event: SelectChangeEvent) => {
        followupNonCompliantAnswerSwap(event.target.value);
        setFollowupNonCompliantAnswerError(false);
    };
    const selectStatesOfCountyOrCity = (item: any) => {
        setCityORCountyName(item);
        const selectedItem: string[] = [];
        const defaultStateOfCityAndCounty = 'All States';
        if (CityOrCountyStates.length > 0) {
            loopProcess(CityOrCountyStates, 'popState');
            loopProcess(item, 'popState');
        }
        for (const ccsItem of cityOrCountyStateDetails) {
            let ccsName = '';
            if (parseInt(sopLevel) === 0) {
                ccsName = ccsItem.city.toLowerCase().trim();
            }
            if (parseInt(sopLevel) === 1) {
                ccsName = ccsItem.county.toLowerCase().trim();
            }
            if (ccsName === item.toLowerCase().trim()) {
                selectedItem.push(ccsItem.state.trim());
            }
        }
        const uniqueStates = selectedItem.filter(
            (previous, index, actual) => actual.indexOf(previous) === index
        );

        CityOrCountyStates.pop();
        if (uniqueStates.length > 1) {
            CityOrCountyStates.push({
                name: defaultStateOfCityAndCounty,
                id: -1,
            });
        }
        loopProcess(uniqueStates, 'pushState');
        setCityOrCountyStates(CityOrCountyStates);
        if (uniqueStates.length > 1) {
            setSelectedState(defaultStateOfCityAndCounty);
        } else {
            setSelectedState(uniqueStates[0]);
        }
    };

    const SortRows = (orderBy: string, data: any) => {
        return data.sort((a: any, b: any) => {
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
    };
    return (
        <div className="self-audit">
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showLoader}
            >
                <CircularProgress />
            </Backdrop>

            <div className="pt-2">
                <NotifyUserDialogBox
                    notificationAlertOpen={notificationAlertOpen}
                    dialogTitle={'Confirm changes'}
                    notifyUserChanges={notifyUserChanges}
                    summaryChanges={summaryChanges}
                    selfAuditNeeded={selfAuditNeeded}
                    setNotifyUserChanges={setNotifyUserChanges}
                    setSelfAuditNeeded={setSelfAuditNeeded}
                    setSummaryChanges={setSummaryChanges}
                    handleNotificationSave={() => {
                        setNotificationAlertOpen(false);
                        saveUpdateQuestion();
                    }}
                    handleCancel={() => {
                        closeNotificationDialog();
                    }}
                ></NotifyUserDialogBox>
            </div>

            <Dialog
                open={alertOpen}
                className={`${classes.styledDialogWrapper} d-flex justify-content-center flex-column`}
            >
                <DialogContent className={`${classes.dialogContent} ${classes.spanBox}`}>
                    <span>
                        <b>Are you sure you want to delete this question?</b>
                    </span>
                </DialogContent>
                <div className="d-flex styled-button-wrapper justify-content-center">
                    <DialogActions className={`${classes.dialogActions}`}>
                        <Button
                            className="alert-dialog-button me-1"
                            variant="outlined"
                            onClick={removequestion}
                            autoFocus
                        >
                            YES
                        </Button>
                        <Button
                            className="alert-dialog-button me-1"
                            variant="contained"
                            onClick={cancleDialogBox}
                            autoFocus
                        >
                            NO{' '}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
            {roleValidator(userState['role']) === RegTechWriter && (
                <div className="container form-container pt-26">
                    {hideButton &&
                        (editQuesId !== 0 ? (
                            <div className="page-title">
                                <h1>Edit Question</h1>
                            </div>
                        ) : (
                            <div className="page-title">
                                <h1>Add a Question</h1>
                            </div>
                        ))}
                    <AddQuestionFromCityCountyPage />
                    {loading && (
                        <div className="loader-wrapper">
                            <CircularProgress />
                        </div>
                    )}
                    {rows && !loading && (
                        <>
                            {CategoryQuestionTypeQuestionVersionDiv()}
                            {QuestionDiv()}
                            {CityCountyStateCompliantAndNonCompliantDiv()}
                            {OrdinanceChapterSectionDiv()}
                            {RegulationActionDiv()}
                            {AdditionalInfoDiv()}
                            <NoFollowupSection />
                            {ShowFollowupSection()}
                            <ConfirmationMessageToaster />
                            <RemoveConfirmationModalIsVisible />
                            <BottomButtonDiv />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddQuestion;
