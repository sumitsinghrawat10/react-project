import React, { useEffect, useState } from 'react';

import { MenuItem, Select, Checkbox,Backdrop,CircularProgress } from '@mui/material';
import Button from '../../../components/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import SuccessToaster from '../../../components/SuccessToaster';
import SwalBox from '../../../components/SwalBox';
import {
    GET_ALLEMPLOYEES_BY_LICENSEID,
    ADD_ASSIGN_LICENSE,
} from '../../../networking/httpEndPoints';
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface PopupState {
  openAssignEmployee: boolean;
  handleAssignEmployee: any;
  licenseId: number;
  licenseNumber: number;
  userEmployeeId: number;
}

const ITEM_HEIGHT = 60;
const ITEM_PADDING_TOP = 2;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4 + ITEM_PADDING_TOP,
            maxWidth: 300,
        },
    },
};

const AssignEmployeeDialogBox: React.FC<PopupState> = (props: PopupState) => {
    useEffect(() => {
        if (props.openAssignEmployee) {
            resetFields();
            GetEmployee(props.licenseId);
        }
    }, [props.openAssignEmployee]);

    const token = localStorage.getItem('user');
    const GetEmployee = (id: number) => {
        if (token != null) {
     
            axios
                .get<GetResponse>(GET_ALLEMPLOYEES_BY_LICENSEID + id, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    Swal.close();
                    if (res.status === 200 && res.data.isSuccess) {
                        const data = res.data.result;
                        const check: any = [];
                        const emp: any = [];
                        data.forEach((element: any) => {
                            if (element.isAssigned) {
                                emp.push(element);
                                check.push(element);
                            }
                        });
                        setCheckedEmployees(check);
                        data.forEach((element: any) => {
                            if (!element.isAssigned) {
                                emp.push(element);
                            }
                        });
                        setEmployees(emp);

                        let tempName = '';

                        data.forEach((element: any) => {
                            if (element.isAssigned) {
                                tempName += element.userName + ',';
                            }
                        });
                        if (tempName !== '') {
                            tempName = tempName.slice(0, tempName.length - 1);
                            setSelectedEmployee(tempName.split(','));
                        }
                    }
                })
                .catch(() => Swal.close());
        }
    };

    const [showLoader, setShowLoader] = useState(false);
    const [employees, setEmployees] = React.useState<any[]>([]);
    const [checkedEmployees, setCheckedEmployees] = React.useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Array<string>>([]);
    const [isEmployeeLabel, setIsEmployeeLabel] = React.useState(false);
    const history = useHistory();

    const handleChangeEmployee = (event: any) => {
        const {
            target: { value },
        } = event;

        setSelectedEmployee(typeof value === 'string' ? value.split(',') : value);
        const flag = event.target.value.length > 0 ? true : false;
        setIsEmployeeLabel(flag);
    };

    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);

    const resetFields = () => {
        setIsEmployeeLabel(false);
        setSelectedEmployee(Array<string>());
        setEmployees([]);
    };

    const handleDisable = () => {
        const result =
      checkedEmployees.length === selectedEmployee.length &&
      checkedEmployees.every(function (element: any) {
          return selectedEmployee.includes(element.userName);
      });
        return result;
    };

    const onSubmit = () => {
        const empIds = Array<number>();
        selectedEmployee.forEach(function (selectedEmp) {
            employees.forEach(function (emp) {
                if (emp.userName === selectedEmp) {
                    empIds.push(parseInt(emp.employeeId));
                }
            });
        });

        const params = {
            licenseId: props.licenseId,
            employeeId: empIds,
        };

        if (token !== null) {
     
            setShowLoader(true);
            axios
                .post<GetResponse>(ADD_ASSIGN_LICENSE, params, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    OnSubmitResponse(res,empIds);
                })
                .catch(() => {
                    Swal.close();
                    setShowLoader(false);
                });
        }
    };

    const OnSubmitResponse = (res: any, empIds: any) => {
        setShowLoader(false);
        Swal.close();
        props.handleAssignEmployee();
        if (res.status === 201 && res.data.isSuccess) {
            if (res.data.result === true) {
                SwalBox(res.data.responseMessage,'info');
            } else {
                if(!(empIds.includes(props.userEmployeeId))){
                    setConfirmationModalIsVisible(true);
                    setTimeout(() => {
                        history.push('/');},
                    10);
                }else{
                    setConfirmationModalIsVisible(true);
                    setTimeout(() => {
                        setConfirmationModalIsVisible(false);
                    }, 3000);
                }
            }
        } else if (res.status === 201 && !res.data.isSuccess) {
            Swal.fire({
                text: res.data.responseMessage,
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
    };
  
    return (
      <div
        className="dashboard-license-container form-container">
        <Dialog
          open={props.openAssignEmployee}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="dashboard-license-container form-container"
        >
          <div className="dashboard-license-container">
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={showLoader}
            >
              <CircularProgress />
            </Backdrop>
            <div className="CloseDialog">
              <button
                onClick={() => props.handleAssignEmployee()}
                className="btn-close btn-sm close-assign-license"
              ></button>
            </div>
            <DialogTitle className="dialog-title-license">
              <b>{"Assign an employee to this license"}</b>
            </DialogTitle>
            <DialogContent>
              <span className="select-align">
                <b>License No. : {props.licenseNumber}</b>
              </span>
              <div className="BottomLine-AssignEmp-DialogBox"></div>
              <span className="select-width">
                <b> Who are you assigning this license to?</b>
              </span>
              <FormControl variant="standard" sx={{ width: 530 }}>
                <InputLabel hidden={isEmployeeLabel} id="user-label" className="select-align">
                  Select one or more employees
                </InputLabel>
                <Select
                  labelId="user-label"
                  className="select-align"
                  multiple
                  value={selectedEmployee}
                  onChange={handleChangeEmployee}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {employees.map((item) => (
                    <MenuItem
                      key={`${item.userName}-${item.employeeId}`}
                      value={item.userName}
                    >
                      <ListItemText primary={item.userName} />
                      <Checkbox
                        checked={selectedEmployee.indexOf(item.userName) > -1}
                      />
                    </MenuItem>
                  ))}
                </Select>
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
                onKeyPress={(e: KeyboardEvent) =>
                  e.key === "Enter" && props.openAssignEmployee === true
                }
              />
            </DialogActions>
          </div>
        </Dialog>
        {confirmationModalIsVisible && (
          <SuccessToaster message="Changes saved successfully" />
        )}
      </div>
    );
};

export default AssignEmployeeDialogBox;
