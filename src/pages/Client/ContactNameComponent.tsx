import React, { Dispatch, FC } from 'react';

import { TextField } from '@mui/material';

import { useStyles } from '../../components/InputStyles';

interface ImportDataType {
  contactLNameError: boolean;
  contactFNameError: boolean;
  changeContactLName: Dispatch<React.SetStateAction<string>>;
  changeContactFName: Dispatch<React.SetStateAction<string>>;
  changeContactMI: Dispatch<React.SetStateAction<string>>;
  contactLName: string;
  contactFName: string;
  contactMI: string;
  changeContactLNameError: Dispatch<React.SetStateAction<boolean>>;
  changeContactFNameError: Dispatch<React.SetStateAction<boolean>>;
  userRole: any;
}

const ContactNameComponent: FC<ImportDataType> = (props: ImportDataType) => {
    const classes = useStyles();
    return (
        <>
            <div className="d-flex ">
                <div>
                    <div className='ClientSubTitle'>
                        Contact Name
                    </div>
                    <TextField
                        className={`TextFieldWrapper ContactTextFieldWrapper ${classes.root}`}
                        error={props.contactLNameError}
                        helperText={props.contactLNameError ? 'Last name is required' : ''}
                        hiddenLabel
                        placeholder="Enter contact last name"
                        type="text"
                        onChange={(e) => {
                            props.changeContactLNameError(false);
                            props.changeContactLName(e.target.value);
                        }}
                        value={props.contactLName}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 50 }}
                    />
                    <TextField
                        className={`TextFieldWrapper ContactTextFieldWrapper ${classes.root}`}
                        error={props.contactFNameError}
                        helperText={
                            props.contactFNameError ? 'First name is required' : ''
                        }
                        hiddenLabel
                        placeholder="Enter contact first name"
                        type="text"
                        onChange={(e) => {
                            props.changeContactFNameError(false);
                            props.changeContactFName(e.target.value);
                        }}
                        value={props.contactFName}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 50 }}
                    />
                    <TextField
                        className={`TextFieldWrapper ContactTextFieldWrapper ${classes.root}`}
                        style={{ width: '68px', maxWidth: '68px' }}
                        hiddenLabel
                        placeholder="M.I."
                        type="text"
                        onChange={(e) => props.changeContactMI(e.target.value)}
                        value={props.contactMI}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                        inputProps={{ maxLength: 1 }}
                    />
                </div>
                <div>
                    <div className='ms-2 ClientSubTitle'>
                        Role
                    </div>
                    <TextField
                        className={`TextFieldWrapper ${classes.root}`}
                        hiddenLabel
                        placeholder="Role"
                        type="text"
                        disabled
                        value={props.userRole}
                        InputProps={{ style: { fontSize: 16, color: 'black' } }}
                    />
                </div>
            </div>
        </>
    );
};

export default ContactNameComponent;
