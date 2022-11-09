import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    FormControl,
    SelectChangeEvent,
    Backdrop,
    CircularProgress,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import Swal from 'sweetalert2';
import InputBox from "../../../components/InputBox";
import BadgeIssuedFrom from '../../../components/BadgeCard/BadgeIssuedFrom';
import DateSelector from '../../../components/DateSelector';
import handleDateFieldChange from '../../../components/Employee/handleDateFieldChange';
import { useStyles } from '../../../components/InputStyles';
import SuccessToaster from '../../../components/SuccessToaster';
import { Add_Badge } from '../../../networking/httpEndPoints';
import Button from '../../../components/Button';

const formUnderline = makeStyles({
    root: {
        '& .MuiFilledInput-root:before': {
            borderBottom: 'none !important',
        },
    },
});

interface GetResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
}

interface PopupState {
    openAddBadge: boolean;
    handleAddBadge: any;
    handleReloadBadges: any;
    employeeName: string;
    employeeId: number;
    disableUnderline?: boolean | true;
}

const AddBadge: React.FC<PopupState> = (props: PopupState) => {
    const token = localStorage.getItem('user');
    const [showLoader, setShowLoader] = useState(false);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
        useState(false);
    const classes = useStyles();
    const underLine = formUnderline();
    const [issuedFromError, setIssuedFromError] = useState(false);
    const [badgesNameErrorText, setBadgesNameErrorText] =
        useState('Error Happened');
    const [issueDateError, setIssueDateError] = useState(false);
    const [expirationDateError, setExpirationDateError] = useState(false);
    const [issuedFromErrorText, setIssuedFromErrorText] =
        useState('Error Happened');
    const [issueDateErrorText, setIssueDateErrorText] =
        useState('Error happened');
    const [expirationDateErrorText, setExpirationDateErrorText] =
        useState('Error happened');
    const [badgeFields, setBadgeFields] = React.useState<any | null>({
        badgesName: '',
        issueDate: '',
        expirationDate: '',
        issuedFrom: '',
        badgesNameError: false,
        issueDateIsBlank: true,
        expirationDateIsBlank: true,
    });

    const BadgeFieldChange = (e: React.ChangeEvent<any>) => {
        const newFormValues = Object.assign({}, badgeFields);
        newFormValues[e.target.name] = e.target.value;
        if (e.target.name === 'badgesName') {
            newFormValues['badgesNameError'] = false;
            setBadgeFields(newFormValues);
        }
    };

    const SelectIssuedFrom = (e: SelectChangeEvent<any>) => {
        if (e.target.name === 'issuedFrom') {
            const newFormValues = Object.assign({}, badgeFields);
            newFormValues[e.target.name] = parseInt(e.target.value);
            setBadgeFields(newFormValues);
            setIssuedFromError(false);
        }
    };

    useEffect(() => {
        if (props.openAddBadge) {
            resetFields();
        }
    }, [props.openAddBadge]);

    const resetFields = () => {
        badgeFields.badgesName = '';
        badgeFields.issueDate = '';
        badgeFields.expirationDate = '';
        badgeFields.issuedFrom = '';
        badgeFields.badgesNameError = false;
        badgeFields.issueDateIsBlank = true;
        badgeFields.expirationDateIsBlank = true;
        setIssueDateError(false);
        setExpirationDateError(false);
        setIssuedFromError(false);
    };

    const isValidFields = () => {
        let isValid = true;
        if (badgeFields.badgesName.trim().length === 0) {
            badgeFields.badgesNameError = true;
            setBadgesNameErrorText('Badge Id is required');
            isValid = false;
        }

        if (badgeFields.issuedFrom === '') {
            setIssuedFromError(true);
            setIssuedFromErrorText('Badge Issuing authority is required');
            isValid = false;
        }

        if (badgeFields.issueDateIsBlank) {
            setIssueDateError(true);
            setIssueDateErrorText('Issue date is required');
            isValid = false;
        }

        if (badgeFields.expirationDateIsBlank) {
            setExpirationDateError(true);
            setExpirationDateErrorText("Expiration date is required");
            isValid = false;
        }

        if (issueDateError || expirationDateError) {
            isValid = false;
        }

        return isValid;
    };

    const onSubmit = () => {
        if (!isValidFields()) {
            return false;
        }

        const badgeToAdd = {
            employeeId: props.employeeId,
            badgeId: badgeFields.badgesName.trim(),
            issueDate: badgeFields.issueDate,
            expirationDate: badgeFields.expirationDate,
            issuedFrom: badgeFields.issuedFrom,
        };

        if (token !== null) {
            setShowLoader(true);
            axios
                .post<GetResponse>(Add_Badge, badgeToAdd, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    const isBadgeIdExistInDB = "isBadgeIdExist" in res.data.result ? res.data.result.isBadgeIdExist : false;
                    if (res.status === 201 && res.data.isSuccess) {
                        props.handleReloadBadges();
                        props.handleAddBadge();
                        resetFields();
                        setConfirmationModalIsVisible(true);
                        setTimeout(() => {
                            setConfirmationModalIsVisible(false);
                        }, 3000);
                    } else if (res.status === 201 && !res.data.isSuccess && isBadgeIdExistInDB) {
                        badgeFields.badgesNameError = true;
                        setBadgesNameErrorText(res.data.responseMessage);
                    } else {
                        props.handleAddBadge();
                        resetFields();
                        Swal.fire({
                            text: 'Error occurred while submitting changes!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                    setShowLoader(false);
                })
                .catch(() => setShowLoader(false));
        }
    };

    return (
        <>
            <Dialog
                open={props.openAddBadge}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className="employee-dashboard-container">
                    <div className='popUpMargin popUpMargin-scroll'>
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={showLoader}
                        >
                            <CircularProgress />
                        </Backdrop>
                        <div className="CloseDialog">
                            <button
                                onClick={() => {
                                    resetFields();
                                    props.handleAddBadge();
                                }}
                                className="btn-close btn-sm btn-close-popup"
                            />
                        </div>
                        <DialogTitle>
                            <div className="dialog-title">
                                <b>{'Add a new badge'}</b>
                            </div>
                        </DialogTitle>
                        <DialogContent>                           
                            <div className='row center-addBadge-bottomLine'>
                                <div className='bottomLine-addBadge' style={{width: "29rem"}}>
                                <b>
                                    {'Employee: '} {props.employeeName}
                                </b>
                                </div>                            
                            </div>
                            <div className="row mb-3">
                                <div className="col-12 textColor">
                                    <InputBox
                                        name="badgesName"
                                        error={badgeFields.badgesNameError}
                                        helperText={
                                            badgeFields.badgesNameError ? badgesNameErrorText : ''
                                        }
                                        hiddenLabel
                                        variant="filled"
                                        className={`form-control form-field text-field ${classes.root} ${underLine.root} InputBox-badgeId`}
                                        placeholder="Enter badge ID"
                                        type="text"
                                        value={badgeFields.badgesName}
                                        onChange={(e: any) => {
                                            BadgeFieldChange(e);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3 mui-label-size dateSelectorProp">
                                <div className="col-sm-6 col-12">
                                    <DateSelector
                                        onChangeDateSelector={(newValue: any) => {
                                            if (newValue !== null) {
                                                badgeFields['issueDateIsBlank'] = false;
                                                setIssueDateError(false);
                                                handleDateFieldChange(
                                                    newValue,
                                                    'issueDate',
                                                    setIssueDateError,
                                                    setIssueDateErrorText,
                                                    setExpirationDateError,
                                                    setExpirationDateErrorText,
                                                    setBadgeFields,
                                                    badgeFields
                                                );
                                            }
                                        }}
                                        value={badgeFields.issueDate}
                                        label="Badge Issue Date"
                                        onChange={(e: any) => {
                                            if (e.target.value === '') {
                                                badgeFields['issueDateIsBlank'] = true;
                                                setIssueDateError(false);
                                            } else if (e.target.value !== '') {
                                                badgeFields['issueDateIsBlank'] = false;
                                            }
                                        }}
                                        maxDate={new Date()}
                                        error={issueDateError}
                                        helperText={issueDateErrorText}
                                        className={`form-control form-field text-field ${classes.root}`}
                                    />
                                </div>
                                <div className="col-sm-6 col-12">
                                    <DateSelector
                                        onChangeDateSelector={(newValue: any) => {
                                            if (newValue !== null) {
                                                badgeFields['expirationDateIsBlank'] = false;
                                                setExpirationDateError(false);
                                                handleDateFieldChange(
                                                    newValue,
                                                    'expirationDate',
                                                    setIssueDateError,
                                                    setIssueDateErrorText,
                                                    setExpirationDateError,
                                                    setExpirationDateErrorText,
                                                    setBadgeFields,
                                                    badgeFields
                                                );
                                            }
                                        }}
                                        value={badgeFields.expirationDate}
                                        label="Expiry Date"
                                        onChange={(e: any) => {
                                            if (e.target.value === '') {
                                                badgeFields['expirationDateIsBlank'] = true;
                                                setExpirationDateError(false);
                                            } else if (e.target.value !== '') {
                                                badgeFields['expirationDateIsBlank'] = false;
                                            }
                                        }}
                                        helperText={expirationDateErrorText}
                                        error={expirationDateError}
                                        minDate={new Date()}
                                        className={`text-field ${classes.root} badge-exp-date`}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-sm-12 col-12">
                                    <FormControl>
                                        <BadgeIssuedFrom
                                            value={badgeFields.issuedFrom}
                                            onChange={(e: any) => {
                                                SelectIssuedFrom(e);
                                            }}
                                            isError={issuedFromError}
                                            errorText={issuedFromErrorText}
                                            className="selector-width"
                                            disableUnderline={true}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                className="btn-submit"
                                type="contained"
                                intent="primary"
                                onClick={onSubmit}
                                onKeyPress={(e: any) => e.key === 'Enter' && props.openAddBadge === true}
                                text="Submit"
                                height={50}
                                width={120}
                            />
                        </DialogActions>
                    </div>
                </div>
            </Dialog>
            {confirmationModalIsVisible && (<SuccessToaster message="Badge added successfully" />)}
        </>
    );
};

export default AddBadge;
