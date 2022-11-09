import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
    TextField,
    FormControl,
    Select,
    MenuItem,
    Button,
    FormHelperText,
    Checkbox,
    SelectChangeEvent,
    Backdrop,
    CircularProgress,
    Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';

import AddEmployeeAlertBox from '../../components/AddEmployeeAlertBox';
import BadgeIssuedFrom from '../../components/BadgeCard/BadgeIssuedFrom';
import DateSelector from '../../components/DateSelector';
import {
    getDownloadTemplate,
    getExcelErrors,
    AlertMsgForInvalidExlTemplate,
} from '../../components/Employee/EmployeeImportMethods';
import handleDateFieldChange from '../../components/Employee/handleDateFieldChange';
import { useStyles } from '../../components/InputStyles';
import SuccessToaster from '../../components/SuccessToaster';
import {
    GET_IS_EMAIL_EXIST,
    GET_ROLES,
    ADD_EMPLOYEE,
    GET_ALL_LICENSES_BY_LOCATION_IDS,
    UPLOAD_EMPLOYEES_EXCELFILE,
    DELETE_EXCELFILE,
    MOVE_EXCELDATA_TO_DB,
    GET_ALL_ORGANIZATION_LOCATIONS,
} from '../../networking/httpEndPoints';
import { decodeToken } from '../../utilities/decodeToken';

const formUnderline = makeStyles({
    root: {
        '& .MuiFilledInput-root:before': {
            borderBottom: 'none !important',
        },
       "& .MuiInputBase-root":{
height:'60%',
        },
        },
});

const CustomExpandMore = ({ ...rest }) => {
    return <ExpandMoreIcon {...rest} />;
};

interface PopupState {
  openAddEmployee: boolean;
  setOpenAddEmployee: any;
  getEmployeeData: any;
  open: boolean;
  setOpen: any;
  cleanInputs: boolean;
  setCleanInputs: any;
  HandleBtnDisable: boolean;
  setHandleBtnDisable: any;
  successRecords: any;
  setSuccessRecords: any;
  failedRecords: any;
  setFailedRecords: any;
  importResponseData: any;
  setImportResponseData: any;
  ManualEmpBtn: boolean;
  setManualEmpBtn: any;
}
interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}
interface EmailCodeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [];
}

interface AddEmployeeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

let licenses: any | null = [];
let locations: any | null = [];

type SelectedFileType = {
  name: string;
};

const AddEmployeeDialogBox: React.FC<PopupState> = (props: PopupState) => {
    const classes = useStyles();
    const formclasses = formUnderline();
    const [manual, setManual] = useState(false);
    const [heading, setHeading] = useState('Import employee data');
    //=============== State variables for Employee ===========
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [role, setRole] = useState('');
    const [, setLocationName] = useState('');
    const [OtherRoleDescription, setOtherRoleDescription] = useState('');
    const [, setLicenseName] = useState([]);
    const [EmployeeRoles, setEmployeeRoles] = useState([]);
    const [IsOtherSelected, setIsOtherSelected] = useState(false);
    const [organizationLocationName, setOrganizationLocationName] =
    React.useState<string[]>([]);
    const [organizationLocations, setOrganizationLocations] = React.useState<
    any[]
  >([]);
    const [license, setLicense] = React.useState<string[]>([]);
    const [licenseNumberIds, setLicenseNumberIds] = React.useState<number[]>([]);

    const [lastNameError, setLastNameError] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [employeeIdError, setEmployeeIdError] = useState(false);
    const [companyEmailError, setCompanyEmailError] = useState(false);
    const [locationNameError, setLocationNameError] = useState(false);
    const [issuedFromError, setIssuedFromError] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [issueDateError, setIssueDateError] = useState(false);
    const [expirationDateError, setExpirationDateError] = useState(false);
    const [lastNameErrorText, setLastNameErrorText] = useState(
        'Last name is required'
    );
    const [firstNameErrorText, setFirstNameErrorText] = useState(
        'First name is required'
    );

    const [employeeIdErrorText, setEmployeeIdErrorText] =
    useState('Error happened');
    const [companyEmailErrorText, setCompanyEmailErrorText] =
    useState('Error happened');
    const [badgesNameErrorText, setBadgesNameErrorText] =
    useState('Error Happened');
    const [issueDateErrorText, setIssueDateErrorText] =
    useState('Error happened');
    const [expirationDateErrorText, setExpirationDateErrorText] =
    useState('Error happened');
    const [issuedFromErrorText, setIssuedFromErrorText] =
    useState('Error Happened');
    const [roleErrorText, setRoleErrorText] = useState('Error happened');
    const [otherRoleError, setOtherRoleError] = useState(false);
    const [otherRoleErrorText, setOtherRoleErrorText] =
    useState('Error happened');
    const [locationNameErrorText, setLocationNameErrorText] =
    useState('Error happened');
    const [, setLicenseByLocationId] = React.useState(0);
    const [organizationLocationIds, setOrganizationLocationIds] = React.useState<
    number[]
  >([]);
    const [showLoader, setShowLoader] = useState(false);
    const [isDisabledLicense, setIsDisabledLicense] = useState(true);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
    const token = localStorage.getItem('user');
    const [badgeFields, setBadgeFields] = React.useState<any | null>({
        badgesName: '',
        issueDate: '',
        expirationDate: '',
        issuedFrom: '',
        badgesNameError: false,
        issueDateIsBlank: true,
        expirationDateIsBlank: true,
        issuedFromError: false,
    });

    const [excelError, setExcelError] = React.useState<any>([]);
    const [selectedExcelFile, setSelectedExcelFile] = useState(null);
    const [handleInputDisable, setHandleInputDisable] = useState(false);
    const [DeleteBtnDisable, setDeleteBtnDisable] = React.useState(false);
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [isCancel, setIsCancel] = React.useState(false);
    const [downloadTempDisable, setDownloadTempDisable] = useState(false);
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fileImportError, setFileImportError] = useState(false);
    const [selectedFile, setSelectedFile] = useState<SelectedFileType | null>(
        null
    );

    const handleCancel = () => {
        props.setOpenAddEmployee(false);
        setIsDisabledLicense(true);
        setLastName('');
        setFirstName('');
        setMiddleInitial('');
        setEmployeeId('');
        setCompanyEmail('');
        setOrganizationLocationIds([]);
        setOrganizationLocations([]);
        setRole('');
        setLicense([]);
        setManual(false);
        setOtherRoleDescription('');
        setIssueDateError(false);
        setExpirationDateError(false);
        setBadgeFields({
            badgesName: '',
            issueDate: '',
            expirationDate: '',
            issuedFrom: '',
            badgesNameError: false,
            issueDateIsBlank: true,
            expirationDateIsBlank: true,
            issuedFromError: false,
        });
        setLastNameError(false);
        setFirstNameError(false);
        setEmployeeIdError(false);
        setCompanyEmailError(false);
        setLocationNameError(false);
        setIssuedFromError(false);
        setRoleError(false);
        setIssueDateError(false);
        setExpirationDateError(false);
        licenses = [];
        setLicense([]);
        setLicenseNumberIds([]);
        setOrganizationLocationName([]);

        setSelectedFile(null);
        setSelectedExcelFile(null);
        setHandleInputDisable(false);
        props.setSuccessRecords([]);
        props.setFailedRecords([]);
        props.setCleanInputs(true);
        props.setHandleBtnDisable(false);
        if (hiddenFileInput && hiddenFileInput.current) {
            hiddenFileInput.current.value = '';
        }
        setHeading('Import employee data');
        setDownloadTempDisable(false);
        setErrorMessage('');
        setOtherRoleErrorText('');
    };

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        if (e.target.name === 'lastName') {
            setLastName(e.target.value);
        }
        if (e.target.name === 'firstName') {
            setFirstName(e.target.value);
        }
        if (e.target.name === 'middleInitial') {
            setMiddleInitial(e.target.value);
        }
        if (e.target.name === 'employeeId') {
            setEmployeeId(e.target.value);
        }
        if (e.target.name === 'companyEmail') {
            onEmailChange(e.target.value);
        }
        if (e.target.name === 'OtherRoleDescription') {
            setOtherRoleDescription(e.target.value);
        }
    };

    const onEmailChange = (email: string) => {
        setCompanyEmailError(false);
        setCompanyEmail(email);
    };

    const doEmailValidation = (e: React.ChangeEvent<any>) => {
        const email = e.target.value;
        if (
            !new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g).test(
                email.trim()
            )
        ) {
            setCompanyEmailError(true);
            setCompanyEmailErrorText('Please enter a valid email');
        } else {
            axios
                .get<EmailCodeResponse>(
                    `${GET_IS_EMAIL_EXIST}?email=${encodeURIComponent(email.toLowerCase().trim())}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                .then((res) => {
                    if (res.data.isSuccess) {
                        setCompanyEmailErrorText('This email already exists.');
                        setCompanyEmailError(true);
                    }
                })
                .catch(() => {
                    setCompanyEmailError(true);
                    setCompanyEmailErrorText(
                        'Something went wrong while fetching a record'
                    );
                });
        }
    };

    const handleBadgeFieldChange = (e: React.ChangeEvent<any>) => {
        const newFormValues = Object.assign({}, badgeFields);
        newFormValues[e.target.name] = e.target.value;
        if (e.target.name === 'badgesName') {
            newFormValues['badgesNameError'] = false;
            setBadgeFields(newFormValues);
        }
    };

    const handleSelectIssuedFrom = (e: SelectChangeEvent<any>) => {
        setIssuedFromError(false);
        if (e.target.name === 'issuedFrom') {
            const newFormValues = Object.assign({}, badgeFields);
            newFormValues[e.target.name] = parseInt(e.target.value);
            newFormValues['issuedFromError'] = false;
            setBadgeFields(newFormValues);
        }
    };

    const updateLocationId = (Id: number) => {
        const locationIdArray: any = [...organizationLocationIds];
        if (organizationLocationIds.includes(Id) === false) {
            locationIdArray.push(Id);
            setOrganizationLocations(locationIdArray);
        } else if (organizationLocationIds.includes(Id) === true) {
            const index = locationIdArray.indexOf(Id);
            locationIdArray.splice(index, 1);
            setOrganizationLocations(locationIdArray);
        }
    };

    const handleSelect = (e: SelectChangeEvent<any>) => {
        setOtherRoleError(false);
        if (e.target.name === 'role') {
            setRoleError(false);
            setRole(e.target.value);
            if (e.target.value === 'Other') {
                setIsOtherSelected(true);
            } else {
                setIsOtherSelected(false);
            }
        } else if (e.target.name === 'organizationLocationId') {
            const {
                target: { value },
            } = e;
            setLocationNameError(false);
            const newArrayId: any = [...organizationLocationIds];
            setOrganizationLocationName(
                typeof value === 'string' ? value.split(',') : value
            );
            for (let i = 0; i < locations.length; i++) {
                if (value.includes(locations[i]['locationNickName'])) {
                    if (
                        newArrayId.includes(locations[i]['organizationLocationId']) ===
            false
                    ) {
                        newArrayId.push(locations[i]['organizationLocationId']);
                        setOrganizationLocationIds(newArrayId);
                    }
                } else if (!value.includes(locations[i]['locationNickName'])) {
                    if (
                        newArrayId.includes(locations[i]['organizationLocationId']) === true
                    ) {
                        const index = newArrayId.indexOf(
                            locations[i]['organizationLocationId']
                        );
                        newArrayId.splice(index, 1);
                        setOrganizationLocationIds(newArrayId);
                    }
                }
            }
        } else if (e.target.name === 'license') {
            const {
                target: { value },
            } = e;
            const newArrayId: any = [...licenseNumberIds];
            setLicense(typeof value === 'string' ? value.split(',') : value);
            for (let j = 0; j < licenses.length; j++) {
                if (value.includes(licenses[j]['licenseNumber'])) {
                    if (newArrayId.includes(licenses[j]['id']) === false) {
                        newArrayId.push(licenses[j]['id']);
                        setLicenseNumberIds(newArrayId);
                    }
                } else if (!value.includes(licenses[j]['licenseNumber'])) {
                    if (newArrayId.includes(licenses[j]['id']) === true) {
                        const index = newArrayId.indexOf(licenses[j]['id']);
                        newArrayId.splice(index, 1);
                        setLicenseNumberIds(newArrayId);
                    }
                }
            }
        } else if (e.target.value === 'Other') {
            setIsOtherSelected(true);
        }
    };

    useEffect(() => {
        if(manual){
            GetRoles();
            GetOrganizationLocation();
        }
    }, [manual]);

    const GetOrganizationLocation = () => {
        axios
            .get(GET_ALL_ORGANIZATION_LOCATIONS, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res: any) => {
                if (res.status === 200 && !res.data.isSuccess) {
                    locations = [];
                } else if (
                    res.status === 200 &&
          res.data.isSuccess &&
          res.data.result != null
                ) {
                    locations = [];
                    const data = res.data.result;
                    data.forEach(function (element: any) {
                        locations.push({
                            organizationLocationId: element.locationId,
                            locationNickName: element.locationNickName,
                        });
                    });
                }
            })
            .catch((error) => console.log(error));
    };

    const GetRoles = () => {
        axios
            .get<DataResponse>(`${GET_ROLES}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => {
                if (res.data.result !== null) {
                    setEmployeeRoles(res.data.result);
                }
            });
    };

    //calling get license on closing Select Locations
    const handleSelectClose = () => {
        if (organizationLocationIds.length !== 0) {
            setLicense([]);
            setLicenseNumberIds([]);
            setTimeout(() => {
                getLicenses(organizationLocations);
            }, 1500);
        }
    };

    // Getting Licenses
    const getLicenses = (locations: any[]) => {
        licenses.splice(0, licenses.length);
        const idsToString = locations.toString();
        axios
            .get(GET_ALL_LICENSES_BY_LOCATION_IDS + idsToString, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res: any) => {
                if (res.status === 200 && !res.data.isSuccess) {
                    licenses = [];
                } else if (
                    res.status === 200 &&
          res.data.isSuccess &&
          res.data.result != null
                ) {
                    setIsDisabledLicense(false);
                    const data = res.data.result;
                    data.forEach(function (element: any) {
                        locations.forEach((item: any) => {
                            if (item === element.locationId) {
                                licenses.push({
                                    id: element.licenseId,
                                    licenseNumber: element.licenseNumber,
                                    locationNickName: item.locationNickName,
                                });
                            }
                        });
                    });
                    setLicenseByLocationId(data);
                }
            })
            .catch((error) => console.log(error));
    };

    useEffect(() => {
        if (license.length !== 0) {
            //updating selected license number ids &  selected license number name in select textbox
            const ids: number[] = [...licenseNumberIds];
            const array: string[] = [...license];
            licenses.forEach((element: any) => {
                const idIndex: number = ids.findIndex((id: number) => id !== element.id);
                ids.splice(idIndex, 1);

                const licenseIndex: number = array.findIndex(
                    (el: string) => el !== element.licenseNumber
                );
                array.splice(licenseIndex, 1);
            });
            setLicenseNumberIds(ids);
            setLicense(array);
        }
    }, [licenses]);

    const validateFields = () => {
        let validate = true;
        if (lastName.trim().length === 0) {
            setLastNameError(true);
            setLastNameErrorText('Last name is required');
            validate = false;
        }
        if (firstName.trim().length === 0) {
            setFirstNameError(true);
            setFirstNameErrorText('First name is required');
            validate = false;
        }
        if (employeeId.trim().length === 0) {
            setEmployeeIdError(true);
            setEmployeeIdErrorText('Employee id is required');
            validate = false;
        }
        if (role === '') {
            setRoleError(true);
            setRoleErrorText('Role is required');
            validate = false;
        }
        if (organizationLocationIds.length === 0) {
            setLocationNameError(true);
            setLocationNameErrorText('Location is required');
            validate = false;
        }
        if (companyEmail.trim().length === 0) {
            setCompanyEmailError(true);
            setCompanyEmailErrorText('Contact email is required');
            validate = false;
        } else if (
            !new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}/g).test(
                companyEmail.trim()
            )
        ) {
            setCompanyEmailError(true);
            setCompanyEmailErrorText('Please enter a valid email');
            validate = false;
        }
        if (badgeFields.badgesName.trim().length === 0) {
            badgeFields.badgesNameError = true;
            setBadgesNameErrorText('Badge Id is required');
            validate = false;
        }
        // ============== Issue Date ==================
        if (badgeFields.issueDateIsBlank === true) {
            setIssueDateError(true);
            setIssueDateErrorText('Badge Issue date is required');
            validate = false;
        }
        // ============ Expiration Date	=================
        if (badgeFields.expirationDateIsBlank === true) {
            setExpirationDateError(true);
            setExpirationDateErrorText('Badge Expiration Date is required');
            validate = false;
        }
        if (
            badgeFields.expirationDate !==
      moment(badgeFields.expirationDate).format('MM/DD/YYYY')
        ) {
            badgeFields.expirationDate = '';
        }
        if (badgeFields.issuedFrom.length === 0) {
            setIssuedFromError(true);
            setIssuedFromErrorText('Badge Issuing authority is required');
            validate = false;
        }
        if (new Date(badgeFields.expirationDate).setHours(0, 0, 0, 0) <=
                new Date(badgeFields.issueDate).setHours(0, 0, 0, 0))
                {
            setExpirationDateError(true);
            validate = false;
                }
        return validate;
    };

    const getEmployeeFormData = () => {
      const userData = decodeToken(token);
      const badgesAdded: any | null = [];
      badgesAdded.push({
        badgesName: badgeFields.badgesName,
        issueDate: moment(badgeFields.issueDate).format("MM/DD/YYYY"),
        expirationDate: badgeFields.expirationDate,
        issuedFrom: badgeFields.issuedFrom,
      });
      const locationLicensesAdded: any | null = [];
      licenseNumberIds.forEach(function (element: any) {
        licenses.forEach(function (elementData: any) {
          if (element === elementData.id) {
            locationLicensesAdded.push(elementData.id);
          }
        });
      });
      const orglocationIds: any | null = [];
      organizationLocationIds.forEach((id: any) => {
        orglocationIds.push(parseInt(id));
      });

      const locationLicensesIds = {
        licenseId: locationLicensesAdded,
        locationId: orglocationIds
      };

      return {
        users: {
            organizationId: userData.OrgId,
            lastName: lastName.trim(),
            middleName: middleInitial.trim(),
            OtherRoleDescription: OtherRoleDescription.trim(),
            firstName: firstName.trim(),
            organizationEmployeeId: employeeId,
            email: companyEmail.toLowerCase().trim(),
            userRole: role,
            badges: badgesAdded,
            locationLicenses: locationLicensesIds
      }
    };
    };
    const submitEmployeeForm = () => {
      if (validateFields()) {
        const params = getEmployeeFormData();
        if (token !== null) {
          setShowLoader(true);
          axios
            .post<AddEmployeeResponse>(ADD_EMPLOYEE, params, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            })
            .then((response) => {
              if (response.status === 201) {
                submitEmployeeFormresponse(response);
              }

              setShowLoader(false);
            })
            .catch(() => setShowLoader(false));
        }
      }
    };

    const submitEmployeeFormresponse = (res: any) => {
      let isBadgeIdExistInDB;
      if (res.data.result !== null) {
        isBadgeIdExistInDB =
          "isBadgeIdExist" in res.data.result
            ? res.data.result.isBadgeIdExist
            : false;
      }
      if (!res.data.isSuccess && isBadgeIdExistInDB) {
        badgeFields.badgesNameError = true;
        setBadgesNameErrorText(res.data.responseMessage);
      }
      if (
        !res.data.isSuccess &&
        res.data.responseMessage === "Duplicate Organization Employee Id."
      ) {
        setEmployeeIdError(true);
        setEmployeeIdErrorText("Duplicate Organization Employee Id.");
      }
      if (
        !res.data.isSuccess &&
        res.data.result == null &&
        res.data.responseMessage ===
          "Only one location can be assigned to the user with role Other."
      ) {
        setOtherRoleError(true);
        setOtherRoleErrorText(
          "Only one location can be assigned to the user with role 'Other'."
        );
      }
      if (res.data.isSuccess && res.data.result != null) {
        setConfirmationModalIsVisible(true);
        setTimeout(() => {
          setConfirmationModalIsVisible(false);
        }, 3000);
        handleCancel();
        props.getEmployeeData();
      }
    };

    const swalAlertFunction = (isCancelFunction: any) => {
        return Swal.fire({
            text: 'File deleted successfully!',
            confirmButtonColor: '#233ce6',
            icon: 'success',
            allowOutsideClick: false,
            customClass: { container: 'DashboardEmpSwal' },
        }).then((result) => {
            if (result.isConfirmed) {
                isCancelFunction();
            }
        });
    };

    const isCancelFunctionA = () => {
        setHandleInputDisable(false);
        setDeleteBtnDisable(false);
        setDownloadTempDisable(false);
    };

    const isCancelFunctionB = () => {
        setHandleInputDisable(false);
        setDeleteBtnDisable(false);
        setManual(true);
        setHeading('Enter employee details');
        setDownloadTempDisable(false);
    };

    const deleteExcelFile = () => {
        setShowLoader(true);
        axios
            .delete<AddEmployeeResponse>(DELETE_EXCELFILE, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json-patch+json',
                    'Content-Type': 'application/json-patch+json',
                },
            })
            .then((res) => {
                setShowLoader(false);
                if (
                    res.status === 200 &&
                    !res.data.isSuccess &&
                    res.data.result == null
                ) {
                    Swal.fire({
                        text: res.data.responseMessage || 'Delete operation failed',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    });
                } else if (res.status === 200 && res.data.isSuccess) {
                    setSelectedFile(null);
                    setSelectedExcelFile(null);
                    if (hiddenFileInput && hiddenFileInput.current) {
                        hiddenFileInput.current.value = '';
                    }
                    props.setCleanInputs(true);
                    props.setHandleBtnDisable(false);
                    props.setSuccessRecords([]);
                    props.setFailedRecords([]);
                    if (!isCancel) {
                        swalAlertFunction(isCancelFunctionB);
                    } else {
                        swalAlertFunction(isCancelFunctionA);
                    }
                } else {
                    Swal.fire({
                        text: 'Something went wrong!',
                        confirmButtonText: 'OK',
                        icon: 'error',
                        customClass: { container: 'DashboardEmpSwal' },
                    });
                }
            })
            .catch(() => {
                setShowLoader(false);
                Swal.fire({
                    text: 'Something went wrong!',
                    confirmButtonText: 'OK',
                    icon: 'error',
                });
            });
    };

    const handleAlertYes = () => {
        deleteExcelFile();
        setAlertOpen(false);
    };

    useEffect(() => {
        if (excelError.length !== 0) {
            props.setImportResponseData(excelError);
        }
    }, [excelError]);

    const isConfirmFunction = (isConfirm: any) => {
        if (isConfirm) {
            deleteExcelFile();
        }
    };
    const fileValidator = (file: any) => {
        let fileValidateError;
        if (file.length > 1) {
        setErrorMessage("Please upload one file at a time.");
        setFileImportError(true);
        fileValidateError = true;
        } else if (file[0].name.split(".").pop() !== "xlsx") {
        setErrorMessage("Only Excel file (xlsx) is accepted.");
        fileValidateError = true;
        setFileImportError(true);
        } else if (file[0].size > 5120000) {
        setErrorMessage(
            "File you are trying to upload must be equal or less than 5 MB."
        );
        fileValidateError = true;
        setFileImportError(true);
        } else {
        fileValidateError = false;
        }

        if (!fileValidateError) {
        setErrorMessage("");
        setFileImportError(false);
        return true;
        } else {
        return false;
        }
    };
    const onExcelUpload = (fileDataSent: any) => {
        const excelData = new FormData();
        excelData.append('ExcelFile', fileDataSent);

        if (token !== null) {
            setShowLoader(true);
            axios
                .post<AddEmployeeResponse>(UPLOAD_EMPLOYEES_EXCELFILE, excelData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    setShowLoader(false);
                    if (res.status === 201) {
                        getExcelErrors(
                            setExcelError,
                            setDeleteBtnDisable,
                            props.setOpen,
                            props.setHandleBtnDisable,
                            token
                        );
                        setDeleteBtnDisable(true);
                        props.setManualEmpBtn(true);
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                    Swal.close();
                })
                .catch((error) => {
                    setShowLoader(false);
                    AlertMsgForInvalidExlTemplate(error, isConfirmFunction);
                });
        }
    };
    const handleClick = () => {
        hiddenFileInput.current?.click();
        setIsCancel(true);
    };

    const dragOver = (e: any) => {
        e.preventDefault();
    };

    const dragEnter = (e: any) => {
        e.preventDefault();
    };

    const dragLeave = (e: any) => {
        e.preventDefault();
    };

    const fileDrop = (e: any) => {
        if (!selectedFile) {
            e.preventDefault();
            setHandleInputDisable(true);
            setDownloadTempDisable(true);
            setErrorMessage('');
            setFileImportError(false);
            const { files } = e.dataTransfer;
            let validatorResponse = false;
            validatorResponse = fileValidator(files);

            if (validatorResponse) {
                setSelectedFile(files[0]);
                setSelectedExcelFile(files[0]);
                setErrorMessage('');
                onExcelUpload(files[0]);
            }
        } else {
            e.preventDefault();
        }
    };

    const handleChange = (event: any) => {
        let validatorResponse = false;
        setErrorMessage('');
        setFileImportError(false);
        validatorResponse = fileValidator(event.target.files);

        if (validatorResponse) {
            setSelectedFile(event.target.files[0]);
            setSelectedExcelFile(event.target.files[0]);
            setErrorMessage('');
            setHandleInputDisable(true);
            setDownloadTempDisable(true);
            onExcelUpload(event.target.files[0]);
        }
    };

    const seeAllDetails = () => {
        getExcelErrors(
            setExcelError,
            setDeleteBtnDisable,
            props.setOpen,
            props.setHandleBtnDisable,
            token
        );
    };

    const handleAddEmployeeButton = () => {
        setIsCancel(false);
        if (selectedExcelFile && selectedFile) {
            setDeleteBtnDisable(true);
            setAlertOpen(true);
            setManual(false);
            setHeading('Import employee data');
        } else {
            setManual(true);
            setHeading('Enter employee details');
        }
    };

    const [afterLoading, setAfterLoading] = useState(false);

    useEffect(() => {
        if (selectedFile && !showLoader) {
            setAfterLoading(true);
        } else {
            setAfterLoading(false);
        }
    }, [selectedFile, showLoader]);
    
    const onExcelFileSubmit = (fileDataSent: any) => {
        const excelData = new FormData();
        excelData.append('employeeList', fileDataSent);

        if (token !== null) {
            setShowLoader(true);
            axios
                .post<DataResponse>(MOVE_EXCELDATA_TO_DB, excelData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    setShowLoader(false);
                    if (
                        res.status === 201 &&
            res.data.isSuccess &&
            res.data.result != null
                    ) {
                        setConfirmationModalIsVisible(true);
                        setTimeout(() => {
                            setConfirmationModalIsVisible(false);
                        }, 3000);
                        handleCancel();
                        props.getEmployeeData();
                    } else if (res.status === 400) {
                        Swal.fire({
                            text: 'Error in file!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                    Swal.close();
                })
                .catch(() => {
                    setShowLoader(false);
                });
        }
    };

    const saveExcelData = () => {
        if (selectedExcelFile !== null && fileImportError === false) {
            onExcelFileSubmit(selectedExcelFile);
        }
    };

    const ErrorText = (condition: boolean, text: string) => {
        if (condition) {
            return text;
        } else {
            return '';
        }
    };

    return (
        <>
            <Dialog
                open={props.openAddEmployee}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                keepMounted
                className = "employee-dashboard-container form-container"
                PaperProps={{
                    sx: {
                        maxHeight: '90vh'
                    },
                }}
            >
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={showLoader}
                >
                    <CircularProgress />
                </Backdrop>
                <div className="CloseDialog">
                    <button
                        onClick={handleCancel}
                        className="btn-close btn-sm close-assign-license"
                    ></button>
                </div>
                <DialogTitle className="dialog-title">
                    <b>{heading}</b>
                </DialogTitle>
                <DialogContent>
                    {manual === false && (
                        <div
                            className="col-md-12"
                            style={{ marginTop: 20, paddingRight: 60, paddingLeft: 60 }}
                        >
                            <div className="row">
                                <div className="DropZone"
                                    onDragOver={dragOver}
                                    onDragEnter={dragEnter}
                                    onDragLeave={dragLeave}
                                    onDrop={fileDrop}
                                >
                                    <input
                                        type="file"
                                        ref={hiddenFileInput}
                                        style={{ display: 'none' }}
                                        onChange={(e: any) => {
                                            handleChange(e);
                                        }}
                                        disabled={handleInputDisable}
                                    />
                                    <h1 className="Title">
                                        <button className="DownloadButton"
                                            disabled={downloadTempDisable}
                                            onClick={() => {
                                                getDownloadTemplate(token);
                                            }}
                                        >
                                            <FileDownloadOutlinedIcon
                                                sx={{ '&:hover': { color: '#233ce6' } }}
                                            />
                      Download Template
                                        </button>
                                        <div className="ImportButton">
                                            <UploadFileOutlinedIcon />
                                            <span style={{ color: '#233ce6' }} onClick={handleClick}>
                        Click here to add a file
                                            </span>{' '}
                      or drag drop here
                                        </div>
                                    </h1>
                                </div>
                            </div>

                            {afterLoading && (
                                <>
                                    <div className="upload-successfully">
                                        <span className="FileSuccessMessage">
                      File successfully uploaded!
                                        </span>
                                    </div>
                                    <div className="FileNameIconWrapper">
                                        <div className="d-flex">
                                            <TaskOutlinedIcon
                                                sx={{ fontSize: '20px' }}
                                            ></TaskOutlinedIcon>
                                            <div className="FileNameWrapper">{selectedFile?.name}</div>
                                        </div>
                                        <div className="d-flex" style={{ marginLeft: '52px' }}>
                                            <button className="SeeDetailsLink" onClick={seeAllDetails}>
                        See details
                                            </button>
                                            <button className="CrossIconBtn"
                                                disabled={DeleteBtnDisable}
                                                onClick={() => {
                                                    deleteExcelFile();
                                                }}
                                            >
                                                <CancelOutlinedIcon
                                                    sx={{
                                                        fontSize: '20px',
                                                        marginLeft: '10px',
                                                        '&:hover': { cursor: 'pointer' },
                                                    }}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            <span className="FileErrorMessage">{errorMessage}</span>
                            <hr className="HorizontalRule"/>
                            <div
                                className="d-flex"
                                style={{
                                    justifyContent: 'space-between',
                                    marginLeft: '-10px',
                                    marginRight: '-20px',
                                }}
                            >
                                <button className="AddEmployeeButton"
                                    disabled={props.ManualEmpBtn}
                                    onClick={() => {
                                        handleAddEmployeeButton();
                                    }}
                                >
                                    <i className="bi bi-plus-circle pe-2" />
                                    Enter employee manually 
                                </button>
                                <DialogActions>
                                    <Button
                                        // sx={{ bgcolor: '#0070A2', color: '#fff' }}
                                        className="btn-submit-employee"
                                        variant="contained"
                                        disabled={props.HandleBtnDisable}
                                        onClick={saveExcelData}
                                    >
                    Submit
                                    </Button>
                                </DialogActions>
                            </div>
                        </div>
                    )}{' '}
                    {manual === true && (
                        <>
                            <div className="row">
                                <div className="col-sm-9 col-12">
                                    <TextField
                                        className={`input-form form-control ${formclasses.root}`}
                                        error={lastNameError}
                                        helperText={ErrorText(lastNameError, lastNameErrorText)}
                                        hiddenLabel
                                        variant="filled"
                                        placeholder="Enter last name"
                                        type="text"
                                        value={lastName}
                                        name="lastName"
                                        onChange={(e) => {
                                            setLastNameError(false);
                                            handleInputChange(e);
                                        }}
                                        InputProps={{
                                            style: { fontSize: 16, background: '#f9f9f9' },
                                        }}
                                        inputProps={{ maxLength: 50, minLength: 1 }}
                                    />
                                </div>
                                <div className="col-sm-3 col-12">
                                    <TextField
                                        className={`input-form form-control ${formclasses.root}`}
                                        hiddenLabel
                                        variant="filled"
                                        placeholder="M.I"
                                        type="text"
                                        value={middleInitial}
                                        name="middleInitial"
                                        onChange={(e) => {
                                            handleInputChange(e);
                                        }}
                                        InputProps={{
                                            style: { fontSize: 16, background: '#f9f9f9' },
                                        }}
                                        inputProps={{ maxLength: 1, minLength: 0 }}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-9 col-12">
                                    <TextField
                                        className={`input-form form-control ${formclasses.root}`}
                                        error={firstNameError}
                                        helperText={ErrorText(firstNameError, firstNameErrorText)}
                                        hiddenLabel
                                        variant="filled"
                                        placeholder="Enter first name"
                                        type="text"
                                        value={firstName}
                                        name="firstName"
                                        onChange={(e) => {
                                            setFirstNameError(false);
                                            handleInputChange(e);
                                        }}
                                        InputProps={{
                                            style: { fontSize: 16, background: '#f9f9f9' },
                                        }}
                                        inputProps={{ maxLength: 50, minLength: 1 }}
                                    />
                                </div>
                                <div className="col-sm-3 col-12">
                                    <TextField
                                        className={`input-form form-control ${formclasses.root}`}
                                        error={employeeIdError}
                                        helperText={ErrorText(employeeIdError, employeeIdErrorText)}
                                        hiddenLabel
                                        variant="filled"
                                        placeholder="I.D"
                                        type="text"
                                        value={employeeId}
                                        name="employeeId"
                                        onChange={(e) => {
                                            setEmployeeIdError(false);
                                            handleInputChange(e);
                                        }}
                                        InputProps={{
                                            style: { fontSize: 16, background: '#f9f9f9' },
                                        }}
                                        inputProps={{ maxLength: 50, minLength: 1 }}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12 col-12">
                                    <TextField
                                        className={`input-form form-control ${formclasses.root}`}
                                        error={companyEmailError}
                                        helperText={ErrorText(
                                            companyEmailError,
                                            companyEmailErrorText
                                        )}
                                        hiddenLabel
                                        variant="filled"
                                        placeholder="Company email"
                                        type="text"
                                        name="companyEmail"
                                        value={companyEmail}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                        }}
                                        onBlur={(e) => {
                                            doEmailValidation(e);
                                        }}
                                        InputProps={{
                                            style: {
                                                fontSize: 16,
                                                background: '#f9f9f9',
                                            },
                                        }}
                                        inputProps={{ maxLength: 100 }}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12 col-12">
                                    <FormControl error={locationNameError} sx={{ width: '100%' }}>
                                        <Select
                                            displayEmpty
                                            disableUnderline
                                            multiple
                                            placeholder="Select locations"
                                            value={organizationLocationName}
                                            name="organizationLocationId"
                                            onChange={handleSelect}
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            renderValue={(selected) => {
                                                if (selected.length === 0) {
                                                    return (
                                                        <p
                                                            style={{
                                                                fontSize: 16,
                                                                color: 'darkGrey',
                                                                fontWeight: 500,
                                                                marginBottom: 10,
                                                            }}
                                                        >
                              Assign one or more locations
                                                        </p>
                                                    );
                                                }
                                                return selected.join(', ');
                                            }}
                                            onClose={handleSelectClose}
                                            variant="filled"
                                            className={`select-wrap select-field ${formclasses.root}`}
                                            IconComponent={CustomExpandMore}
                                            style={{
                                                backgroundColor: '#f9f9f9',
                                                fontSize: 16,
                                            }}
                                            MenuProps={{
                                                style: {
                                                    maxHeight: 350,
                                                    maxWidth: 400,
                                                },
                                            }}
                                        >
                                            {locations.map((lo: any) => (
                                                <MenuItem
                                                    onClick={() => {
                                                        setLocationName(lo.locationNickName);
                                                        updateLocationId(lo.organizationLocationId);
                                                    }}
                                                    key={lo.organizationLocationId}
                                                    value={lo.locationNickName}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        noWrap
                                                        sx={{ width: 450 }}
                                                    >
                                                        {lo.locationNickName}
                                                    </Typography>
                                                    <Checkbox
                                                        checked={
                                                            organizationLocationName.includes(
                                                                lo.locationNickName
                                                            )
                                                                ? true
                                                                : false
                                                        }
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <div className="select-field-error">
                                            {locationNameError ? locationNameErrorText : ""}
                                        </div>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-12">
                                    <FormControl error={roleError} sx={{ width: '100%' }}>
                    Assign Role
                                        <Select
                                            displayEmpty
                                            disableUnderline
                                            value={role}
                                            name="role"
                                            onChange={handleSelect}
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            variant="filled"
                                            className={`select-wrap select-field ${formclasses.root}`}
                                            IconComponent={CustomExpandMore}
                                            style={{
                                                fontSize: 16,
                                                backgroundColor: '#f9f9f9',
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <span className="input-placeholder">Select a role</span>
                                            </MenuItem>
                                            {EmployeeRoles.map((name: any) => (
                                                <MenuItem key={name.roleId} value={name.description}>
                                                    {name.description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <div className="select-field-error">
                                            {roleError ? roleErrorText : ""}
                                        </div>
                                    </FormControl>
                                </div>
                                <div className="col-sm-6 col-12 pt-4 ">
                                    {IsOtherSelected && (
                                        <TextField
                                            className={`input-form  pb-0 form-control ${formclasses.root}`}
                                            hiddenLabel
                                            variant="filled"
                                            placeholder="Role Description (optional)"
                                            type="text"
                                            value={OtherRoleDescription}
                                            name="OtherRoleDescription"
                                            onChange={(e) => {
                                                handleInputChange(e);
                                            }}
                                            InputProps={{
                                                style: {
                                                    fontSize: 16,
                                                    background: '#f9f9f9',

                                                },
                                            }}
                                            inputProps={{ maxLength: 50, minLength: 1 }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-12">
                                    <FormControl sx={{ width: '100%' }}>
                    Assign License (Optional)
                                        <Select
                                            displayEmpty
                                            disableUnderline
                                            multiple
                                            placeholder="Select one or more"
                                            value={license}
                                            name="license"
                                            onChange={handleSelect}
                                            disabled={isDisabledLicense}
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            renderValue={(selected) => {
                                                if (selected.length === 0) {
                                                    return (
                                                        <p
                                                            style={{
                                                                fontSize: 16,
                                                                color: 'darkGrey',
                                                                fontWeight: 500,
                                                                marginBottom: 0,
                                                            }}
                                                        >
                              Select one or more
                                                        </p>
                                                    );
                                                }
                                                return selected.join(', ');
                                            }}
                                            variant="filled"
                                            className={`input-form select-field ${formclasses.root}`}
                                            IconComponent={CustomExpandMore}
                                            style={{
                                                backgroundColor: '#f9f9f9',
                                                fontSize: 16,
                                                width: '100%',
                                            }}
                                            MenuProps={{
                                                style: {
                                                    maxHeight: 350,
                                                    maxWidth: 200,
                                                },
                                            }}
                                        >
                                            {licenses.map((li: any) => (
                                                <MenuItem
                                                    onClick={() => {
                                                        setLicenseName(li.licenseNumber);
                                                    }}
                                                    key={li.id}
                                                    value={li.licenseNumber}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        noWrap
                                                        sx={{ width: 200 }}
                                                    >
                                                        {li.licenseNumber}
                                                    </Typography>
                                                    <Checkbox
                                                        checked={
                                                            licenseNumberIds.includes(li.id) ? true : false
                                                        }
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="col-sm-6 col-8 pt-4 ">
                                    <TextField
                                     name="badgesName"
                                        error={badgeFields.badgesNameError}
                                        helperText={ErrorText(
                                            badgeFields.badgesNameError,
                                            badgesNameErrorText
                                        )}
                                        hiddenLabel
                                        variant="filled"
                                        className={`input-form form-control ${formclasses.root}`}
                                        placeholder="Enter badge I.D"
                                        type="text"
                                        value={badgeFields.badgesName}
                                        onChange={(e) => {
                                            handleBadgeFieldChange(e);
                                        }}
                                        InputProps={{
                                            style: {
                                                fontSize: 16,
                                                background: '#f9f9f9',                                            },
                                        }}
                                        inputProps={{ maxLength: 50, minLength: 1 }}
                                    />
                                </div>
                            </div>
                            <div className="row mui-label-size">
                                <div className="col-sm-4 col-12">
                                    <DateSelector
                                        value={badgeFields.issueDate}
                                        label="Issue Date"
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
                                        helperText={issueDateErrorText}
                                        className={`text-field ${classes.root}`}
                                        error={issueDateError}
                                        maxDate={new Date()}
                                        onChange={(e: any) => {
                                            if (e.target.value === '') {
                                                badgeFields['issueDateIsBlank'] = true;
                                                setIssueDateError(false);
                                            } else if (e.target.value !== '') {
                                                badgeFields['issueDateIsBlank'] = false;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-sm-4 col-12">
                                    <DateSelector
                                        value={badgeFields.expirationDate}
                                        label="Expiry Date"
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
                                        onChange={(e: any) => {
                                            if (e.target.value === '') {
                                                badgeFields['expirationDateIsBlank'] = true;
                                                setExpirationDateError(false);
                                            } else if (e.target.value !== '') {
                                                badgeFields['expirationDateIsBlank'] = false;
                                            }
                                        }}
                                        className={`text-field ${classes.root} badge-exp-date`}
                                        error={expirationDateError}
                                        helperText={
                                            expirationDateError ? expirationDateErrorText : ''
                                        }
                                        minDate={new Date()}
                                    />
                                </div>
                                <div className="col-sm-4 col-12 pt-0 ">
                                    <FormControl sx={{ width: '100%'}}>
                                        <BadgeIssuedFrom
                                            value={badgeFields.issuedFrom}
                                            onChange={(e: any) => {
                                                handleSelectIssuedFrom(e);
                                            }}
                                            isError={issuedFromError}
                                            errorText={issuedFromErrorText}
                                            stateIssuedOnly={true}
                                            className={`select-wrap select-field ${formclasses.root}`}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    marginRight: '-8px',
                                }}
                            >
                                {otherRoleError && (
                                    <span className="FileErrorMessage" style={{ alignSelf: 'flex-end' }}>
                                        {otherRoleErrorText}
                                    </span>
                                )}
                                <DialogActions>
                                    <Button
                                        // sx={{ bgcolor: '#0070A2', color: '#fff' }}
                                        className="btn-submit-employee"
                                        variant="contained"
                                        onClick={submitEmployeeForm}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && props.openAddEmployee === true
                                        }
                                    >
                    Submit
                                    </Button>
                                </DialogActions>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            {confirmationModalIsVisible && (
                <SuccessToaster message="Employee(s) Added successfully"/>
            )}

            <AddEmployeeAlertBox
                alertOpen={alertOpen}
                handleAlertYes={handleAlertYes}
                handleAlertNo={() => setAlertOpen(false)}
                alertMessage="If you want to add employee manually, you will lose the file you have uploaded. Do you want to continue?"
            />
        </>
    );
};

export default AddEmployeeDialogBox;
