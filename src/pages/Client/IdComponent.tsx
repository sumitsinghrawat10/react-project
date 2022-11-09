import React, { Dispatch, FC } from 'react';

import { TextField } from '@mui/material';

import { useStyles } from '../../components/InputStyles';

interface ImportDataType {
  employeeIdError: boolean;
  employeeIdErrorText: string;
  employeeId: string;
  badgeIdError: boolean;
  setEmployeeIdError: Dispatch<React.SetStateAction<boolean>>;
  setBadgeIdError: Dispatch<React.SetStateAction<boolean>>;
  setBadgeId: Dispatch<React.SetStateAction<string>>;
  setEmployeeId: Dispatch<React.SetStateAction<string>>;
  badgeIdErrorText: string;
  badgeId: string;
}

const IdComponent: FC<ImportDataType> = (props: ImportDataType) => {
    const classes = useStyles();
    return (
        <>
            <div className="d-flex ">
                <div>
                    <div className='ClientSubTitle'>
                        Employee Id
                    </div>
                    <TextField
                        className={`TextFieldWrapper IdTextFieldWrapper ${classes.root}`}
                        error={props.employeeIdError}
                        helperText={props.employeeIdError ? props.employeeIdErrorText : ''}
                        hiddenLabel
                        placeholder="Enter Employee ID*"
                        type="text"
                        onChange={(e) => {
                            props.setEmployeeIdError(false);
                            props.setEmployeeId(e.target.value);
                        }}
                        value={props.employeeId}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 50 }}
                    />
                </div>
                <div className= 'IdBox'>
                    <div className= 'ClientSubTitle'>
                        Badge ID
                    </div>
                    <TextField
                        className={`TextFieldWrapper IdTextFieldWrapper ${classes.root}`}
                        error={props.badgeIdError}
                        helperText={props.badgeIdError ? props.badgeIdErrorText : ''}
                        hiddenLabel
                        placeholder="Enter Badge ID*"
                        type="text"
                        onChange={(e) => {
                            props.setBadgeIdError(false);
                            props.setBadgeId(e.target.value);
                        }}
                        value={props.badgeId}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 100 }}
                    />
                </div>
            </div>
        </>
    );
};

export default IdComponent;
