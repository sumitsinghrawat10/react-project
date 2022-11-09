import React, { useState, useEffect } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Select, MenuItem, FormHelperText } from '@mui/material';
import axios from 'axios';

import { GET_ISSUED_FROM } from '../../networking/httpEndPoints';

const CustomExpandMore = ({ ...rest }) => {
    return <ExpandMoreIcon {...rest} />;
};

interface DataResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface IssuedFromPropTypes {
  stateIssuedOnly?: boolean;
  value: string;
  onChange: any;
  className?: string;
  isError?: boolean;
  errorText?: string;
  disableUnderline?: boolean;
}

const BadgeIssuedFrom = (props: IssuedFromPropTypes) => {
    const [issuedFromList, setIssuedFromList] = useState<any | null>([]);
    const token = localStorage.getItem('user');
    const getIssuedFrom = () => {
        if (token != null) {
            axios
                .get<DataResponse>(`${GET_ISSUED_FROM}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    if (res.status === 200 && res.data.isSuccess) {
                        if (props.stateIssuedOnly) {
                            setIssuedFromList(
                                res.data.result.filter((val: any) => {
                                    return val.issuedFromId === 1;
                                })
                            );
                        } else {
                            setIssuedFromList(res.data.result);
                        }
                    }
                });
        }
    };

    useEffect(() => {
        getIssuedFrom();
    }, []);

    return (
        <>
            <Select
                name="issuedFrom"
                displayEmpty
                value={props.value}
                onChange={props.onChange}
                inputProps={{ 'aria-label': 'Without label' }}
                variant="filled"
                className={props.className || 'input-form select-field'}
                IconComponent={CustomExpandMore}               
                disableUnderline= {props.disableUnderline}
                MenuProps={{ MenuListProps: { disablePadding: true } }}
            >
                <MenuItem disabled value="">
                    <span className="input-placeholder">Issued from</span>
                </MenuItem>
                {issuedFromList.map((value: any) => (
                    <MenuItem
                        key={`issued-from-${value.issuedFromId}`}
                        value={value.issuedFromId}
                    >
                        {value.issuedFromName}
                    </MenuItem>
                ))}
            </Select>
            {props.isError === true && (
                <FormHelperText sx={{ color: '#d32f2f', ml: 2 }}>
                    {props.errorText}
                </FormHelperText>
            )}
            {props.isError === false && ''}
        </>
    );
};

export default BadgeIssuedFrom;
