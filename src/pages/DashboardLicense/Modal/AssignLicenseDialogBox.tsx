import React, { useEffect, useState } from 'react';

import {
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    Backdrop,
    CircularProgress,
    InputLabel,
} from '@mui/material';
import Button from '../../../components/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';

import { GetEmployee } from '../../../components/Employee/EmployeeImportMethods';
import SuccessToaster from '../../../components/SuccessToaster';
import SwalBox from '../../../components/SwalBox';
import {
    GET_EMPLOYEE_LICENSES_OF_LOCATIONS,
    ASSIGN_EMPLOYEE_TO_LICENSES,
} from '../../../networking/httpEndPoints';
interface PopupState {
  openAssignLicense: boolean;
  handleAssignLicense: any;
  GetLicensesData: any;
}
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
const ITEM_HEIGHT = 60;
const ITEM_PADDING_TOP = 2;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 3 + ITEM_PADDING_TOP,
            maxWidth: 300,
        },
        className:"custom-vertical-scroll",        
    },
    MenuListProps: { disablePadding: true },
};

const AssignLicenseDialogBox: React.FC<PopupState> = (props: PopupState) => {
    const token = localStorage.getItem('user');
    const [showLoader, setShowLoader] = useState(false);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
    const [licenseAssignedIsDisabled, setLicenseAssignedIsDisabled] = useState(true);
    
    useEffect(() => {
        if (props.openAssignLicense) {
            resetFields();
            GetEmployee({ setEmployees });
        }
    }, [props.openAssignLicense]);
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [isEmployeeLabel, setIsEmployeeLabel] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Array<string>>([]);
    const [employees, setEmployees] = React.useState<any[]>([
        { name: '', id: 0 },
    ]);

    const handleChangeEmployee = (event: any) => {
        setSelectedEmployee(event.target.value);
        setIsEmployeeLabel(true);
        GetEmployeesLicense(event.target.value);
    };

    const [isLicenseLabel, setIsLicenseLabel] = React.useState(false);
    const [selectedLicense, setSelectedLicense] = useState<Array<string>>([]);
    const [Licenses, setLicenses] = React.useState<any[]>([]);
    const [finalCheckedLicenseIds, setFinalCheckedLicenseIds] = React.useState<
    number[]
  >([]);
    const [InitialCheckedLicenseIds, setInitialCheckedLicenseIds] =
    React.useState<number[]>([]);

    function handleChangeLicense(event: any) {
        const {
            target: { value },
        } = event;

        setSelectedLicense(typeof value === 'string' ? value.split(',') : value);
        const flag = event.target.value.length > 0 ? true : false;
        setIsLicenseLabel(flag);
    }

    const resetFields = () => {
        setIsEmployeeLabel(false);
        setSelectedEmployee(Array<string>());
        setEmployees([]);
        setIsLicenseLabel(false);
        setSelectedLicense(Array<string>());
        setLicenses([]);
        setFinalCheckedLicenseIds([]);
        handleDisable();
    };

    const handleDisable = () => {
        const condition1 = employees.length === 0 || employees.length > 0;
        const condition2 = isEqual(
            finalCheckedLicenseIds,
            InitialCheckedLicenseIds
        );
        return condition1 && condition2;
    };

    const isEqual = (array1: number[], array2: number[]) => {
        if (array1.length === array2.length) {
            return array1.every((element, index) => {
                if (element === array2[index]) {
                    return true;
                }
                return false;
            });
        }

        return false;
    };

    const onSubmit = () => {
        const params = {
            employeeId: selectedEmployee,
            licenseIds: finalCheckedLicenseIds,
        };

        if (token !== null) {
            setShowLoader(true);
            axios
                .post<GetResponse>(ASSIGN_EMPLOYEE_TO_LICENSES, params, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    onSubmitResponse(res);
                })
                .catch(() => setShowLoader(false));
        }
    };

    const onSubmitResponse = (res: any) => {
        setShowLoader(false);
        props.handleAssignLicense();
        if (res.status === 201 && res.data.isSuccess) {
            if (res.data.result === true) {
                SwalBox(res.data.responseMessage,'info');
            } else {
                setConfirmationModalIsVisible(true);
                setTimeout(() => {
                    setConfirmationModalIsVisible(false);
                }, 3000);
                props.GetLicensesData();
                props.openAssignLicense = false;
            }
        } else if (res.status === 201 && !res.data.isSuccess) {
            if (res.data.result === true) {
                SwalBox(res.data.responseMessage,'info');
            } else {
                SwalBox(res.data.responseMessage,'error');
            }
        } else {
            SwalBox('Error occurred while submitting changes!','error');
        }
    };

    const GetEmployeesLicense = (id: number) => {
        if (token != null) {
            setShowLoader(false);
            axios
                .get<GetResponse>(GET_EMPLOYEE_LICENSES_OF_LOCATIONS + id, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    setShowLoader(false);
                    if (res.status === 200 && res.data.isSuccess) {
                        const data = res.data.result;
                        const check: any = [];
                        const loc: any = [];
                        data.forEach((element: any) => {
                            if (element.isAssigned) {
                                loc.push(element);
                                check.push(element.licenseId);
                            }
                        });
                        setFinalCheckedLicenseIds(check);
                        setInitialCheckedLicenseIds(check);
                        data.forEach((element: any) => {
                            if (!element.isAssigned) {
                                loc.push(element);
                            }
                        });
                        setLicenses(loc);

                        let tempName = '';

                        data.forEach((element: any) => {
                            if (element.isAssigned) {
                                tempName += element.licenseNumber + ',';
                            }
                        });
                        if (tempName !== '') {
                            tempName = tempName.slice(0, tempName.length - 1);
                            setSelectedLicense(tempName.split(','));
                        }
                        setLicenseAssignedIsDisabled(false);
                    }
                })
                .catch(() => setShowLoader(false));
        }
    };

    useEffect(() => {
        const LicenseIds: string[] = [];
        finalCheckedLicenseIds.forEach(function (selectedLocId) {
            Licenses.forEach(function (loc) {
                if (loc.licenseId === selectedLocId) {
                    LicenseIds.push(loc.licenseNumber);
                }
            });
        });
        setSelectedLicense(LicenseIds);
    }, [finalCheckedLicenseIds]);

    const changeLicenseId = (Id: number) => {
        const licenseIdArray: any = [...finalCheckedLicenseIds];
        if (finalCheckedLicenseIds.includes(Id) === false) {
            licenseIdArray.push(Id);
            setFinalCheckedLicenseIds(licenseIdArray);
        } else if (finalCheckedLicenseIds.includes(Id) === true) {
            const index = licenseIdArray.indexOf(Id);
            licenseIdArray.splice(index, 1);
            setFinalCheckedLicenseIds(licenseIdArray);
        }
    };

    const handleClose = () => {
        setAlertOpen(false);
        props.handleAssignLicense();
    };
    return (
        <div className="dashboard-license-container form-container">
            <Dialog
                open={props.openAssignLicense}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                className="dashboard-license-container form-container"
            >
                <div className="dashboard-license-container">
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={showLoader}
                    >
                        <CircularProgress />
                    </Backdrop>

                    <div className="CloseDialog">
                        <button
                            onClick={handleClose}
                            className="btn-close btn-sm close-assign-license"
                        ></button>
                    </div>
                    <DialogTitle className="dialog-title mb-3">
						Assign a license
                    </DialogTitle>
                    <DialogContent>
                        <span style={{ marginLeft: '8px' }}>
                            <b>Who are you assigning to?</b>
                        </span>
                        <FormControl variant="standard" sx={{ m: 1, width: 520 }}>
                            <InputLabel hidden={isEmployeeLabel} id="employee-label">
															Select an employee
                            </InputLabel>
                            <Select
                                disableUnderline
                                value={selectedEmployee}
                                onChange={handleChangeEmployee}
                                MenuProps={MenuProps}
                                inputProps={{
                                    "aria-label": "First select an employee, you would like to assign a license to, from the dropdown list"
                                }}
                            >
                                {employees.map((item) => (
                                    <MenuItem
                                        key={`${item.name}-${item.employeeId}`}
                                        value={item.employeeId}
                                    >
                                        <Tooltip
                                            title={item.name.length > 40 ? item.name : ''}
                                            placement="top"
                                            arrow
                                        >
                                            <div
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    width: '420px',
                                                }}
                                            >
                                                {item.name.length > 40 ? item.name + '...' : item.name}
                                            </div>
                                        </Tooltip>
                                    </MenuItem>
                                ))}
                            </Select>
                            <div className="BottomLine-AssignLicense-DialogBox"></div>
                        </FormControl>
                        <span style={{ marginLeft: '8px' }}>
                            <b>Select license(s) to be assigned</b>
                        </span>
                        <FormControl variant="standard" sx={{ m: 1, width: 520 }}>
                            <InputLabel hidden={isLicenseLabel} id="location-label">
				Select one or more licenses
                            </InputLabel>
                            <Select
                                disableUnderline
                                multiple
                                value={selectedLicense}
                                onChange={handleChangeLicense}
                                disabled={licenseAssignedIsDisabled}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
																inputProps={{
																	"aria-label": "Next, select one or more license(s) from the dropdown"
																}}
                            >
                                {Licenses.map((item: any) => (
                                    <MenuItem
                                        key={item.licenseId}
                                        value={item.licenseNumber}
                                        onClick={() => changeLicenseId(item.licenseId)}
                                    >
                                        <Tooltip
                                            title={
                                                item.licenseNumber.length > 44 ? item.licenseNumber : ''
                                            }
                                            placement="top"
                                            arrow
                                        >
                                            <div
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    width: '420px',
                                                }}
                                            >
                                                {item.licenseNumber.length > 44
                                                    ? item.licenseNumber + '...'
                                                    : item.licenseNumber}
                                            </div>
                                        </Tooltip>
                                        <Checkbox
                                            checked={
                                                finalCheckedLicenseIds.indexOf(item.licenseId) > -1
                                            }
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                            <div className="BottomLine-AssignLicense-DialogBox"></div>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            className="btn-submit-license"
                            type="contained"
                            intent="primary"
                            text="Submit"
                            onClick={onSubmit}
                            disabled={handleDisable()}
                            onKeyPress={(e:KeyboardEvent) =>
                                e.key === 'Enter' && props.openAssignLicense === true
                            }
                            ariaLabelText="Select the submit button or Press enter to complete the license assignment"
                        />
                    </DialogActions>
                </div>
            </Dialog>
            {confirmationModalIsVisible && (
                <SuccessToaster message="Changes saved successfully"/>             
            )}
        </div>
    );
};

export default AssignLicenseDialogBox;