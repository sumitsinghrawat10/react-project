import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem, Select } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

const formUnderline = makeStyles({
    root: {
        '& .MuiFilledInput-root:before': {
            borderBottom: 'none !important',
        },
    },
});

function CustomExpandMore({ ...rest }) {
    return <ExpandMoreIcon {...rest} />;
}

interface PropTypes {
  userId: string;
  handleSelectChange: any;
  userList: any[];
  placeHolder: string;
}

const SingleSelectMenu: React.FC<PropTypes> = (props: PropTypes) => {
    const formclasses = formUnderline();

    return (
        <Select
            style={{
                fontSize: 16,
                backgroundColor: '#f4f5f8',
                width: '100%',
                color: 'rgba(0, 0, 0, 0.38)',
                paddingLeft: 0,
            }}
            defaultValue=""
            name="userId"
            displayEmpty
            value={props.userId}
            onChange={(e) => {
                props.handleSelectChange(e);
            }}
            inputProps={{ 'aria-label': 'Without label' }}
            variant="filled"
            className={`input-form select-field singleselect-container ${formclasses.root}`}
            IconComponent={CustomExpandMore}
            sx={{
                ':before': { borderBottom: 'none !important' },
            }}
        >
            <MenuItem disabled value="">
                <span className="input-placeholder">{props.placeHolder}</span>
            </MenuItem>
            {props.userList.map((type) => (
                <MenuItem
                    key={
                        (type.firstName + ' ' + type.lastName).length > 30
                            ? (type.firstName + ' ' + type.lastName).substring(0, 30) + '...'
                            : type.firstName + ' ' + type.lastName
                    }
                    value={type.userId}
                >
                    <Tooltip
                        title={
                            (type.firstName + ' ' + type.lastName).length > 30
                                ? type.firstName + ' ' + type.lastName
                                : ''
                        }
                        placement="top"
                        arrow
                    >
                        <div className="tootltip-wrapper">
                            {(type.firstName + ' ' + type.lastName).length > 30
                                ? type.firstName + '...'
                                : type.firstName + ' ' + type.lastName}
                        </div>
                    </Tooltip>
                </MenuItem>
            ))}
        </Select>
    );
};

export default SingleSelectMenu;
