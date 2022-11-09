import { Dispatch, useState, useEffect } from 'react';

import { Backdrop, CircularProgress } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useStyles } from '../../../components/InputStyles';
import {
    UPDATE_COMPANY_SETTINGS,
    GET_ZIP_CODE,
} from '../../../networking/httpEndPoints';
import {
    OrganizationDetailsInput,
    UpdateCompanyResponse,
    ZCodeResponse,
    EmployeeResponse,
} from './CompanyInterfaces';
import PopUPWindowSystemAdmins from './PopUPWindowSystemAdmins';
import SuccessToaster from "../../../components/SuccessToaster";

const GetDataFromHistory: any = () => {
    const history = useHistory();
    const dataHistory = JSON.stringify(history.location.state);
    const objCompanyData: OrganizationDetailsInput = JSON.parse(dataHistory);

    return objCompanyData;
};

const CompanyDetailEdit = () => {
    const token = localStorage.getItem('user');

    const props = GetDataFromHistory();
    const [open, setOpen] = useState(false);
    const [organzationId] = useState(props.orgId);
    const [clientName] = useState(props.clientName);
    const [contactFName, setContactFName] = useState('');
    const [contactLName, setContactLName] = useState('');
    const [contactMI, setContactMI] = useState('');
    const [contactEmail, setContactEmail] = useState(props.contactEmail);
    const [contactPhone, setContactPhone] = useState(props.contactPhone);
    const [clientBAddress, setClientBAddress] = useState(props.clientAddress);
    const [primaryUserId, setPrimaryUserId] = useState(0);
    const [clientCity, setClientCity] = useState('' || null);
    const [clientState, setClientState] = useState('' || null);
    const [zipCode, setZipCode] = useState(props.zipCode);
    const [zipCodeCityMapId, setzipCodeCityMapId] = useState(null || 0);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);

    const [contactFNameError, setContactFNameError] = useState(false);
    const [contactLNameError, setContactLNameError] = useState(false);
    const [contactPhoneError, setContactPhoneError] = useState(false);
    const [zipCodeError, setZipCodeError] = useState(false);
    const [clientBAddressError, setClientBAddressError] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const [contactPhoneErrorText, setContactPhoneErrorText] = useState(
        'Contact phone is required'
    );
    const [zipCodeErrorText, setZipCodeErrorText] = useState(
        'Zip code is required'
    );

    const classes = useStyles();

    const history = useHistory();

    function reUseComponent({
        titleName,
        placeHolder,
        isErrorExist,
        errorText,
        disabled,
        changeEventName,
        maxLength,
        value,
        changeErrorText,
    }: {
    titleName: string;
    placeHolder: string;
    isErrorExist: boolean;
    errorText: string;
    disabled: boolean;
    changeEventName: Dispatch<React.SetStateAction<string>>;
    maxLength: number;
    value: string;
    changeErrorText: Dispatch<React.SetStateAction<string>>;
  }) {
        return (
            <>
                <p className="details-edit-fieldname">{titleName}</p>
                <TextField
                    className={`${classes.root} details-edit-textfield`}
                    error={isErrorExist}
                    helperText={isErrorExist ? errorText : ''}
                    hiddenLabel
                    disabled={disabled}
                    placeholder={placeHolder}
                    type="text"
                    onChange={(e) => {
                        changeErrorText('');
                        changeEventName(e.target.value);
                    }}
                    value={value}
                    InputProps={{ style: { fontSize: 16, color: 'black' } }}
                    inputProps={{ maxLength: maxLength }}
                />
            </>
        );
    }

    const contactComponent = () => {
        return (
            <div className="d-flex">
                <div>
                    <p className="details-edit-fieldname">Contact Name</p>
                    <TextField
                        error={contactLNameError}
                        hiddenLabel
                        className={`${classes.root} details-edit-contact-textfield`}
                        helperText={contactLNameError ? 'Last name is required' : ''}
                        disabled
                        placeholder="Enter contact last name*"
                        type="text"
                        value={contactLName}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 50 }}
                        onChange={(e) => {
                            setContactLNameError(false);
                            setContactLName(e.target.value);
                        }}
                    />
                    <TextField
                        hiddenLabel
                        error={contactFNameError}
                        className={`${classes.root} details-edit-contact-textfield`}
                        type="text"
                        helperText={contactFNameError ? 'First name is required' : ''}
                        placeholder="Enter contact first name*"
                        onChange={(e) => {
                            setContactFNameError(false);
                            setContactFName(e.target.value);
                        }}
                        value={contactFName}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 50 }}
                        disabled
                    />
                    <TextField
                        hiddenLabel
                        style={{ width: '68px', maxWidth: '68px' }}
                        placeholder="M.I."
                        disabled
                        type="text"
                        value={contactMI}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 1 }}
                        className={`${classes.root} details-edit-contact-textfield`}
                    />
                </div>
                <div>
                    <p className="details-edit-fieldname ms-2 MarginTop">Role</p>
                    <p className='details-edit-row-wrapper role-text-align'>{props.role || ''}</p>
                </div>
            </div>
        );
    };

    const openUpdateContact = () => {
        return setOpen(true);
    };

    const AddClientComponent = () => {
        return (
            <div className="d-flex">
                <div className="row">
                    <p className="details-edit-fieldname">Client Address</p>
                    <TextField
                        error={clientBAddressError}
                        className={`${classes.root} details-edit-textfield`}
                        hiddenLabel
                        helperText={clientBAddressError ? 'Address is required' : ''}
                        type="text"
                        placeholder="Enter client business address"
                        value={clientBAddress}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 500 }}
                        onChange={(e) => {
                            setClientBAddressError(false);
                            setClientBAddress(e.target.value);
                        }}
                    />
                    <TextField
                        type="text"
                        className={`${classes.root} details-edit-zipcode-textfield`}
                        placeholder="Enter zip code"
                        helperText={zipCodeError ? zipCodeErrorText : ''}
                        hiddenLabel
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 5 }}
                        onChange={(e) => onZipCodeChange(e.target.value)}
                        error={zipCodeError}
                        value={zipCode}
                    />
                    <TextField
                        className={`${classes.root} details-edit-textfield`}
                        disabled
                        hiddenLabel
                        placeholder="City name"
                        type="text"
                        value={clientCity}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                    />
                    <TextField
                        className={`${classes.root} details-edit-textfield`}
                        placeholder="State name"
                        disabled
                        style={{ maxWidth: '197px' }}
                        value={clientState}
                        id="select-state"
                    />
                </div>
            </div>
        );
    };

    useEffect(() => {
        onZipCodeChange(zipCode);
    }, [zipCode]);

    const onZipCodeChange = (zCode: string) => {
        setZipCodeError(false);
        setZipCode(zCode);

        if (zCode.length === 5) {
            axios
                .get<ZCodeResponse>(`${GET_ZIP_CODE}${zCode}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.data.result.length > 0) {
                        setShowLoader(false);
                        const respData: any = res.data.result[0];
                        setClientCity(respData.city);
                        setClientState(respData.state);
                        setzipCodeCityMapId(respData.zipCodeCityMapId);
                    } else {
                        setZipCodeError(true);
                        setZipCodeErrorText(res.data.responseMessage);
                    }
                });
        }
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

    const isInputDataValid = () => {
        let valid = true;
        if (clientBAddress.trim().length < 1) {
            setClientBAddressError(true);
            valid = false;
        }

        if (zipCode.trim().length < 1) {
            setZipCodeError(true);
            setZipCodeErrorText('Zip code is required');
            valid = false;
        } else if (zipCode.trim().length < 5) {
            setZipCodeError(true);
            setZipCodeErrorText('Zip code length should be 5');
            valid = false;
        } else if (zipCodeError) {
            valid = false;
        }

        if (contactPhone.trim().length === 0) {
            setContactPhoneError(true);
            setContactPhoneErrorText('Contact phone is required');
            valid = false;
        } else if (contactPhone.trim().length < 10) {
            setContactPhoneError(true);
            setContactPhoneErrorText('Contact phone must be of exact 10 digits');
            valid = false;
        }

        return valid;
    };

    const params = {
        primaryUserId: primaryUserId,
        contactPhone: contactPhone.trim(),
        address: clientBAddress,
        zipCode: zipCode,
        zipCodeCityMapId: zipCodeCityMapId,
    };

    function SaveCompanySettings() {
        if (isInputDataValid()) {
            if (token !== null) {
                setShowLoader(true);
                axios
                    .put<UpdateCompanyResponse>(UPDATE_COMPANY_SETTINGS, params, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })
                    .then((res: any) => {
                        setShowLoader(false);

                        if (res.data.data.isSuccess === true) {
                            setConfirmationModalIsVisible(true);
                            setTimeout(() => {
                                history.push('/company-settings');
                            }, 3000);
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
        }
    }

    return (
      <>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showLoader}
        >
          <CircularProgress />
        </Backdrop>

        <div className="container company-setting-dashboard">
          <div className="MainContainer">
            <PopUPWindowSystemAdmins
              setOpen={setOpen}
              open={open}
              handleUpdateContact={handleUpdateContact}
              currentUserId={primaryUserId}
              organzationId={organzationId}
            />
            <div className="d-flex justify-content-between">
              <p className="page-title">Company Settings</p>
              <p className="cancel-btn" onClick={() => history.push("/company-settings")}>
                Cancel
              </p>
            </div>
            <div className="row">
              <p className="details-edit-fieldname">Client Name </p>
              <TextField
                style={{ width: "350", maxWidth: "350px" }}
                className={`${classes.root} details-edit-contact-textfield`}
                placeholder="Enter Client Name"
                disabled
                type="text"
                value={clientName}
                InputProps={{ style: { fontSize: 16, color: "black" } }}
                inputProps={{ maxLength: 1 }}
              />

              <p className="details-edit-fieldname">Account Number</p>
              <p className='details-edit-row-wrapper'>{props.accountNumber || "-"}</p>
              {contactComponent()}

              <div className="d-flex">
                <p className="details-edit-fieldname">Contact Email</p>
                <p className="link-wrapper" onClick={openUpdateContact}>
                  Change Contact Person
                </p>
              </div>
              <p className='details-edit-row-wrapper'>{contactEmail || "-"}</p>

              {reUseComponent({
                titleName: "Contact Phone",
                placeHolder: "Enter Contact Phone",
                isErrorExist: contactPhoneError,
                errorText: contactPhoneErrorText,
                disabled: false,
                changeEventName: setContactPhone,
                maxLength: 10,
                value: contactPhone,
                changeErrorText: setContactPhoneErrorText,
              })}
              {AddClientComponent()}
              <div className="d-flex">
                <div className="me-5">
                  <p className="details-edit-fieldname">Member Since</p>
                  <p className='details-edit-row-wrapper'>
                    {moment(props.memberSince).format("MM/DD/YYYY") || "-"}
                  </p>
                </div>
                <div className="ms-5">
                  <p className="details-edit-fieldname ms-2">Account Type</p>

                  <TextField
                    style={{ width: "135px", maxWidth: "140px" }}
                    className={`${classes.root} details-edit-contact-textfield`}
                    disabled
                    type="text"
                    value={props.accountType}
                    InputProps={{ style: { fontSize: 16, color: "black" } }}
                    inputProps={{ maxLength: 16 }}
                  />
                </div>
              </div>
              <div className="d-flex flex-row">
                <div className="me-5">
                  <p className="details-edit-fieldname">Membership Status</p>
                  <p className='details-edit-row-wrapper' style={{ color: "#233ce6" }}>
                    {props.membershipStatus ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
            <div className='details-edit-footer-wrapper'>
              <hr className='details-edit-hr-wrapper'></hr>
              <div>
                <Button
                  className="mb-3 details-edit-save-button-wrapper"
                  variant="contained"
                  onClick={SaveCompanySettings}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
        {confirmationModalIsVisible && (
          <SuccessToaster message='Changes Saved'/>
        )}
      </>
    );
};

export default CompanyDetailEdit;
