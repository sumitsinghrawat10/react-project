import React, { Dispatch, FC } from 'react';

import { TextField } from '@mui/material';

import { useStyles } from '../../components/InputStyles';

interface ImportDataType {
    clientBAddressError: boolean,
    clientState: string,
    clientCity: string,
    zipCodeErrorText: string,
    zipCodeError: boolean,
    clientBAddress: string,
    zipCode: string,
    onZipCodeChange: Dispatch<React.SetStateAction<any>>,
    changeClientBAddress: Dispatch<React.SetStateAction<string>>,
    changeClientBAddressError: Dispatch<React.SetStateAction<boolean>>
  }
const ClientAddressComponent: FC<ImportDataType> = (props: ImportDataType) => {
    const classes = useStyles();
    return (
        <div className="d-flex">
            <div className="row">
                <div className='ClientSubTitle'>
                Client Address
                </div>
                <TextField
                    className={`TextFieldWrapper ClinetAdressFont ${classes.root}`}
                    error={props.clientBAddressError}
                    helperText={props.clientBAddressError ? 'Address is required' : ''}
                    hiddenLabel
                    placeholder="Enter client business address"
                    type="text"
                    onChange={(e) => {
                        props.changeClientBAddressError(false);
                        props.changeClientBAddress(e.target.value);
                    }}
                    value={props.clientBAddress}
                    inputProps={{ maxLength: 500 }}
                />
                <TextField
                    className={`TextFieldWrapper ZipcodeTextFieldWrapper ClinetAdressFont ${classes.root}`}
                    error={props.zipCodeError}
                    helperText={props.zipCodeError ? props.zipCodeErrorText : ''}
                    hiddenLabel
                    placeholder="Enter zip code"
                    type="text"
                    onChange={(e) => props.onZipCodeChange(e.target.value)}
                    value={props.zipCode}
                    inputProps={{ maxLength: 5 }}
                />
                <TextField
                    className={`TextFieldWrapper ClinetAdressFont ${classes.root}`}
                    disabled
                    hiddenLabel
                    placeholder="Enter city"
                    type="text"
                    value={props.clientCity}
                />
                <TextField
                    className={`TextFieldWrapper ClinetAdressFont ${classes.root}`}
                    disabled
                    hiddenLabel
                    id="select-state"
                    placeholder="Select state"
                    type="text"
                    value={props.clientState}
                ></TextField>
            </div>
        </div>
    );
};

export default ClientAddressComponent;