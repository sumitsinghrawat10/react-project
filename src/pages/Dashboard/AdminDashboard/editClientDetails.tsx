import { Dispatch, useState, useEffect , ChangeEvent} from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { TextField, MenuItem, Backdrop, CircularProgress, Tooltip } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import AlertBox from '../AdminDashboard/AlertBox';
import { useStyles } from '../../../components/InputStyles';
import {
    UPDATE_CLIENT,
    GET_ZIP_CODE,
    UPDATE_MEMBERSHIP,
    GET_IS_EMAIL_EXIST
} from '../../../networking/httpEndPoints';
import UpdateContactForm from './UpdateContactForm';
import historyVaribaleChecker from '../../../utilities/historyVariableChecker';
import InputBox from "../../../components/InputBox";
import Button from '../../../components/Button';

const LinkWrapper = styled.a<ContainerType>`
  font-weight: 600;
  color: ${(props) => (!props.activeLink ? '#b1b1b1' : '#001e46')};
  text-decoration: none;
  cursor: pointer;
  pointer-events: ${(props) => (!props.activeLink ? 'none' : 'all')};
  :hover {
    color: #233ce6 !important;
  }
  margin-left: 20px;
  margin-top: 10px;
`;

interface ZCodeResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: [
        { state: string; city: string; country: string; zipCodeCityMapId: number }
    ];
}

interface UpdateClientResponse {
    status: number;
    message: string;
    data: {
        isSuccess: boolean;
        responseMessage: string;
        result: [{ accountNumber: number; organizationId: number }];
    };
}

type ContainerType = {
    activeLink?: boolean;
};
interface GetResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: string;
  }

export default function EditClientDetails() {
    const history = useHistory();
    const classes = useStyles();
    const token = localStorage.getItem('user');
    const data = history.location.state ? history.location.state.data : null;
    const organizationId: number = historyVaribaleChecker('organizationId', history);
    const [open, setOpen] = useState(false);
    const [disable, setDisable] = useState(false);
    const [clientName, setClientName] = useState(data.clientName);
    const [contactFName, setContactFName] = useState(data.firstName);
    const [contactLName, setContactLName] = useState(data.lastName);
    const [contactMI, setContactMI] = useState(data.middleName);
    const [contactEmail, setContactEmail] = useState(data.contactEmail);
    const [changeActiveStatus, setChangeActiveStatus] = useState(data.membershipStatus);
    const [contactPhone, setContactPhone] = useState(data.contactPhone);
    const [clientBAddress, setClientBAddress] = useState(data.clientAddress);
    const [primaryUserId, setPrimaryUserId] = useState(data.userId || 0);
    const [clientCity, setClientCity] = useState(data.city || null);
    const [clientState, setClientState] = useState(data.state || null);
    const [zipCode, setZipCode] = useState(data.zip || null);
    const [zipCodeCityMapId, setzipCodeCityMapId] = useState(
        data.zipCodeCityMapId || 0
    );
    const [accountType, setAccountType] = useState(0);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
        useState(false);

    const [clientNameError, setClientNameError] = useState(false);
    const [contactFNameError, setContactFNameError] = useState(false);
    const [contactLNameError, setContactLNameError] = useState(false);
    const [contactEmailError, setContactEmailError] = useState(false);
    const [contactPhoneError, setContactPhoneError] = useState(false);
    const [zipCodeError, setZipCodeError] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [finalMessage, setFinalMessage] = useState('');
    const [enablePopUp, setEnablePopUp] = useState(false);
    const [clientBAddressError, setClientBAddressError] = useState(false);

    const [clientNameErrorText, setClientNameErrorText] = useState(
        'Client name is required'
    );
    const [contactEmailErrorText, setContactEmailErrorText] = useState(
        'Contact email is required'
    );
    const [contactPhoneErrorText, setContactPhoneErrorText] = useState(
        'Contact phone is required'
    );
    const [zipCodeErrorText, setZipCodeErrorText] = useState(
        'Zip code is required'
    );

    const [showLoader, setShowLoader] = useState(false);
    useEffect(() => {
        mapAccountType();
    }, []);

    const handleDisableAlert = () => {
        setEnablePopUp(!changeActiveStatus);
        setFinalMessage('');
        return setAlertOpen(true);
    };

    const changeStatus = () => {
        if (finalMessage.length !== 0 && finalMessage === 'enabled') {
        return setChangeActiveStatus(true);
        }
        if (finalMessage.length !== 0 && finalMessage === 'disabled') {
        return setChangeActiveStatus(false);
        }
    };
    const openUpdateContact = () => {
        setDisable(true);
        return setOpen(true);
    };
    const handleUpdateContact = (response: any) => {
        if (response.length > 0) {
            setContactEmail(response[0].email);
            setPrimaryUserId(response[0].userId);
            setContactFName(response[0].firstName);
            setContactLName(response[0].lastName);
            setContactMI(response[0].middleName);
        }
    };

    const mapAccountType = () => {
        const accTypeVal: { [key: string]: number } = {
            Bronze: 2,
            Silver: 1,
            Gold: 6,
            Platinum: 7,
        };
        setAccountType(accTypeVal[data.accountType]);
    };

    const reUseComponent = (
        titleName: string,
        placeHolder: string,
        isErrorExist: boolean,
        errorText: string,
        disabled: boolean,
        changeEventName: Dispatch<React.SetStateAction<string>>,
        maxLength: number,
        value: string,
        changeErrorText: Dispatch<React.SetStateAction<string>>
    ) => {
        return (
            <>
                <div className="admin-dashboard-container">
                    <p className="SubTitleEdit">{titleName}</p>
                    <InputBox
                        error={isErrorExist}
                        helperText={isErrorExist ? errorText : ''}
                        hiddenLabel
                        className={`ContactTextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                        type="text"
                        value={value}
                        onChange={(e: any) => {
                            changeErrorText('');
                            changeEventName(e.target.value);
                            setDisable(true);
                        }}
                        maxLength={maxLength}
                        disabled={disabled}
                        placeholder={placeHolder}
                    />
                </div>
            </>
        );
    };

    const contactLNameErrorMessage = () => {
        return contactLNameError ? "Last name is required" : "";
    };
    const contactFNameErrorMessage = () => {
        return contactFNameError ? "First name is required" : "";
    };

    const contactComponent = () => {
        return (
          <div className="d-flex admin-dashboard-container">
            <div>
              <p className="SubTitleEdit">Contact Name</p>
{contactLName.length > 38 ? (
                        <Tooltip title={contactLName} placement="top-start" arrow>
                            <span>
                                <InputBox
                                    error={contactLNameError}
                                    helperText={contactLNameErrorMessage()}
                                    hiddenLabel
                                    className={`ContactTextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                                    type="text"
                                    value={contactLName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setContactLNameError(false);
                                        setContactLName(e.target.value);
                                    }}
                                    maxLength={50}
                                    disabled
                                    placeholder="Enter contact last name"
                                />
                            </span>
                        </Tooltip>
                    ) : (
                        <InputBox
                            error={contactLNameError}
                            helperText={contactLNameErrorMessage()}
                            hiddenLabel
                            className={`ContactTextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                            type="text"
                            value={contactLName}
                            onChange={(e: any) => {
                                setContactLNameError(false);
                                setContactLName(e.target.value);
                            }}
                            maxLength={50}
                            disabled
                            placeholder="Enter contact last name"
                        />
                    )}
                    {contactFName.length > 38 ? (
                        <Tooltip title={contactFName} placement="top-start" arrow>
                            <span>
                                <InputBox
                                    error={contactFNameError}
                                    helperText={contactFNameErrorMessage()}
                                    hiddenLabel
                                    placeholder="Enter contact first name*"
                                    type="text"
                                    disabled
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setContactFNameError(false);
                                        setContactFName(e.target.value);
                                    }}
                                    value={contactFName}
                                    className={`TextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                                    maxLength={50}
                                />
                            </span>
                        </Tooltip>) : (

                        <InputBox
                            error={contactFNameError}
                            helperText={contactFNameErrorMessage()}
                            hiddenLabel
                            placeholder="Enter contact first name*"
                            type="text"
                            disabled
                            onChange={(e: any) => {
                                setContactFNameError(false);
                                setContactFName(e.target.value);
                            }}
                            value={contactFName}
                            className={`TextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                            maxLength={50}
                        />
                    )}
              <InputBox
                hiddenLabel
                placeholder="M.I."
                disabled
                type="text"
                onChange={(e: any) => setContactMI(e.target.value)}
                value={contactMI}
                className={`ZipcodeTextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                maxLength={1}
                style={{ width: "68px", maxWidth: "68px", marginLeft: "0rem" }}
              />
            </div>
            <div>
              <p className="ms-2 SubTitleEdit">Role</p>
              <p className="RowWrapperEdit">{data.role || ""}</p>
            </div>
          </div>
        );
    };

    const contactEmailComponent = (): JSX.Element => {
        return (
            <InputBox
                error={contactEmailError}
                hiddenLabel
                disabled
                placeholder="Enter Contact Email"
                type="text"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setContactEmail(e.target.value);
                    setContactEmailErrorText('');
                }}
                value={contactEmail}
                maxLength={100}
                className={`TextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
            />
        );
    };

    const clientContactEmailComponent = (): JSX.Element => {
        if (contactEmail.length > 38) {
            return (<>
                <Tooltip title={contactEmail} placement="top-start" arrow>
                    <span>
                        {contactEmailComponent()}
                    </span>
                </Tooltip>
            </>);
        }
        else {
            return (<>
                {contactEmailComponent()}
            </>);
        }
    };

    const clientAddressComponent = () => {
        return (
            <div className="d-flex admin-dashboard-container">
                <div className="row">
                    <p className="SubTitleEdit">Client Address</p>
                    <InputBox
                        error={clientBAddressError}
                        helperText={clientBAddressError ? 'Address is required' : ''}
                        hiddenLabel
                        placeholder="Enter client business address"
                        type="text"
                        onChange={(e: any) => {
                            setClientBAddressError(false);
                            setClientBAddress(e.target.value);
                            setDisable(true);
                        }}
                        value={clientBAddress}
                        className={`TextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                        maxLength={500}
                    />

                    <InputBox
                        error={zipCodeError}
                        helperText={zipCodeError ? zipCodeErrorText : ''}
                        hiddenLabel
                        placeholder="Enter zip code"
                        type="text"
                        onChange={(e: any) => {
                            onZipCodeChange(e.target.value);
                            setDisable(true);
                        }}
                        value={zipCode}
                        className={`ZipcodeTextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                        maxLength={5}
                    />

                    <InputBox
                        disabled
                        hiddenLabel
                        placeholder="City name"
                        type="text"
                        value={clientCity}
                        className={`ContactTextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                    />

                    <InputBox
                        disabled
                        hiddenLabel
                        placeholder="State name"
                        type="text"
                        value={clientState}
                        className={`TextFieldWrapperEdit input-form form-field form-control ${classes.root}`}
                        style={{ maxWidth: '12.313rem' }}
                    />
                </div>
            </div>
        );
    };

    const onZipCodeChange = (zCode: string) => {
        setZipCodeError(false);
        setZipCode(zCode);
        const token = localStorage.getItem('user');
        if (zCode.length === 5) {
            axios
                .get<ZCodeResponse>(`${GET_ZIP_CODE}${zCode}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.data.result.length > 0) {
                        const respData = res.data.result[0];
                        setClientCity(respData.city);
                        setClientState(respData.state);
                        setzipCodeCityMapId(respData.zipCodeCityMapId);
                    } else {
                        setZipCodeError(true);
                        setZipCodeErrorText(res.data.responseMessage);
                    }
                });
        } else {
            setClientCity('');
            setClientState('');
            setzipCodeCityMapId(0);
        }
    };

    const isValidate = () => {
        let validate = true;
        if (clientName.trim().length === 0) {
            setClientNameError(true);
            setClientNameErrorText('Client name is required');
            validate = false;
        }
        if (contactFName.trim().length === 0) {
            setContactFNameError(true);
            validate = false;
        }
        if (contactLName.trim().length === 0) {
            setContactLNameError(true);
            validate = false;
        }
        if (
            !new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(
                contactEmail.trim()
            )
        ) {
            setContactEmailError(true);
            setContactEmailErrorText('Please enter a valid email');
            validate = false;
        }
        if (contactEmail.trim().length === 0) {
            setContactEmailError(true);
            setContactEmailErrorText('Contact email is required');
            validate = false;
        }
        if (contactPhone.trim().length === 0) {
            setContactPhoneError(true);
            setContactPhoneErrorText('Contact phone is required');
            validate = false;
        } else if (contactPhone.trim().length < 10) {
            setContactPhoneError(true);
            setContactPhoneErrorText('Contact phone must be of exact 10 digits');
            validate = false;
        }
        if (clientBAddress.trim().length < 1) {
            setClientBAddressError(true);
            validate = false;
        }
        if (zipCode.trim().length < 1) {
            setZipCodeError(true);
            setZipCodeErrorText('Zip code is required');
            validate = false;
        } else if (zipCode.trim().length < 5) {
            setZipCodeError(true);
            setZipCodeErrorText('Zip code length should be 5');
            validate = false;
        } else if (zipCodeError) {
            validate = false;
        }

        return validate;
    };

    const updateClient = () => {
        const token = localStorage.getItem('user');
        const params = {
            organizationId: organizationId,
            clientName: clientName.trim(),
            primaryUserId: primaryUserId,
            contactPhone: contactPhone.trim(),
            address: clientBAddress,
            addressId: data.addressId,
            accountType: accountType,
            zipCode: zipCode,
            zipCodeCityMapId: zipCodeCityMapId,
        };
        if (token !== null) {
            setShowLoader(true);
            axios
                .put<UpdateClientResponse>(UPDATE_CLIENT, params, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    setShowLoader(false);
                    if (res.data.status === 201) {
                        setConfirmationModalIsVisible(true);
                        setDisable(false);
                        setTimeout(() => {
                            history.push('/view-client', {
                                organizationId,
                            });
                        }, 3000);
                    } else if (res.data.status === 417) {
                        setClientNameError(true);
                        setDisable(false);
                        setClientNameErrorText(res.data.message);
                    } else {
                        Swal.fire({
                            text: 'Something went wrong while updating details',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                    Swal.close();
                })
                .catch(() => {
                    setShowLoader(false);
                    Swal.close();
                    Swal.fire({
                        text: 'Something went wrong while updating details',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    });
                });
        }
    };
    const onSubmit = () => {
        if (isValidate()) {
            if (data.contactEmail !== contactEmail) {
                axios
                    .get<ZCodeResponse>(`${GET_IS_EMAIL_EXIST}?email=${encodeURIComponent(contactEmail.trim())}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => {
                        if (!res.data.isSuccess) {
                            setContactEmailErrorText(res.data.responseMessage);
                            setContactEmailError(true);
                            return false;
                        } else {
                            updateClient();
                        }
                    });
            } else {
                updateClient();
            }
        }
    };

    const updateMembership = () => {
        setShowLoader(true);
        const param = {
            organizationId: organizationId,
        };
        if (token !== null) {
            axios
                .put<GetResponse>(UPDATE_MEMBERSHIP, param, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    Swal.close();
                    setShowLoader(false);
                    if (
                        (res.status === 200 || res.status === 201) &&
            res.data.isSuccess
                    ) {
                        setFinalMessage(() => {
                            return res.data.result === 'Active' ? 'enabled' : 'disabled';
                        });
                        setAlertOpen(true);
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                    .catch(() => {Swal.close();
                        setShowLoader(false);});
        }
    };

    return (
        <>
            <div className="admin-dashboard-container form-container">
                <div className="p-4 container DashboardContainer">
                    <UpdateContactForm
                        setOpen={setOpen}
                        open={open}
                        handleUpdateContact={handleUpdateContact}
                        currentUserId={primaryUserId}
                        organzationId={organizationId}
                        setPrimaryUserId={setPrimaryUserId}
                    />
                    <AlertBox
                    alertOpen={alertOpen}
                    isEnabledPopUp={enablePopUp}
                    isAnswerEnabled={finalMessage}
                    handleAlertYes={() => {
                        setAlertOpen(false);
                        updateMembership();
                    }}
                    handleAlertNo={() => {
                        setAlertOpen(false);
                    }}
                    handleAlertContinue={() => {
                        setAlertOpen(false);
                        changeStatus();
                    }}
                />
                    <div className="d-flex justify-content-between">
                        <p className="page-title Title">Edit Client</p>
                        <p className="ButtonCancelEdit"
                            onClick={() =>
                                history.push('/view-client', {
                                    organizationId,
                                })
                            }
                        >
                            Cancel
                        </p>

                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={showLoader}
                        >
                            <CircularProgress />
                        </Backdrop>
                    </div>
                    <div className="row">
                        {reUseComponent(
                            'Client Name',
                            'Enter Client Name',
                            clientNameError,
                            clientNameErrorText,
                            false,
                            setClientName,
                            150,
                            clientName,
                            setClientNameErrorText
                        )}
                        <p className="SubTitleEdit">Account Number</p>
                        <p className="RowWrapperEdit">{data.accountNumber || '-'}</p>
                        {contactComponent()}
                        {data.isVerified && (
                            <>
                                <div className="d-flex admin-dashboard-container">
                                    <p className="SubTitleEdit">Contact Email</p>
                                    <LinkWrapper activeLink={true} onClick={openUpdateContact}>
                                        Change Contact Person
                                    </LinkWrapper>
                                </div>
                                <p className="RowWrapperEdit">{contactEmail || '-'}</p>
                            </>
                        )}

                        {!data.isVerified && (
                            <>
                                <div className="d-flex admin-dashboard-container">
                                    <p className="SubTitleEdit">Contact Email</p>
                                    <LinkWrapper activeLink={true} onClick={openUpdateContact}>
                                        Change Contact Person
                                    </LinkWrapper>
                                </div>
                                {clientContactEmailComponent()}
                            </>
                        )}
                        {reUseComponent(
                            'Contact Phone',
                            'Enter Contact Phone',
                            contactPhoneError,
                            contactPhoneErrorText,
                            false,
                            setContactPhone,
                            10,
                            contactPhone,
                            setContactPhoneErrorText
                        )}
                        {clientAddressComponent()}
                        <div className="d-flex admin-dashboard-container">
                            <div className="me-5">
                                <p className="SubTitleEdit">Member Since</p>
                                <p className="RowWrapperEdit">
                                    {moment(data.memberSince).format('MM/DD/YYYY') || '-'}
                                </p>
                            </div>
                            <div className="ms-5">
                                <p className="ms-2 SubTitleEdit">Account Type</p>
                                <TextField
                                    select
                                    style={{ maxWidth: '197px', backgroundColor: '#f4f5f8' }}
                                    id="select-state"
                                    value={accountType}
                                    className={`TextFieldWrapperEdit ${classes.root}`}
                                    onChange={(e) => {
                                        setAccountType(parseInt(e.target.value));
                                        setDisable(true);
                                    }}
                                >
                                    <MenuItem value={2}>Bronze</MenuItem>
                                    <MenuItem value={1}>Silver</MenuItem>
                                    <MenuItem value={6}>Gold</MenuItem>
                                    <MenuItem value={7}>Platinum</MenuItem>
                                </TextField>
                            </div>
                        </div>
                        <div className="d-flex flex-row admin-dashboard-container">
                            <div className="me-5">
                                <p className="SubTitleEdit">Membership Status</p>
                                <p className="RowWrapperEdit" style={{ color: '#233ce6' }}>
                                    {changeActiveStatus === true ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div className="ms-3">
                                <p className="SubTitleEdit">Account Options</p>
                                <LinkWrapper
                                    style={{ marginRight: '65px' }}
                                    activeLink={!changeActiveStatus}
                                    onClick={handleDisableAlert}
                                    >
                                    Enable Account{' '}
                                </LinkWrapper>
                                <LinkWrapper activeLink={changeActiveStatus}
                                onClick={handleDisableAlert}
                                >
                                    Disable Account{' '}
                                </LinkWrapper>
                            </div>
                        </div>
                    </div>
                    <div className="FooterWrapperEdit">
                    <div className="HrWrapperEdit"></div>
                        <div>
                            <Button
                                intent="primary"
                                className="mb-3 mt-5 ButtonAddWrapperEdit"
                                type="contained"
                                text="Save"
                                onClick={onSubmit}
                                disabled={disable === true ? false : true}
                            />
                        </div>
                    </div>
                </div>
                {confirmationModalIsVisible && (
                    <div className="TextPinWrapperEdit">
                        <div className="TextPinEdit">
                            <CheckCircleOutlineIcon></CheckCircleOutlineIcon>
                            <span className="ms-2">Changes Saved</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}