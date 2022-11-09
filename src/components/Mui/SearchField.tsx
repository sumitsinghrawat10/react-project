import React from 'react';

import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { TextField, InputAdornment } from '@mui/material';
import styled from 'styled-components';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from "@material-ui/core/IconButton";

interface CrossIconProps {
    SearchText: string;
}
interface PropType {
    SearchText: string;
    Placeholder: string;
    SearchButtonHandler: any;
    setSearchText: any;
    resetSearchData: any;
    originalData: any;
    setRows: any;
    isSearchIconVisible?: boolean | false;
    onCrossIconClick: any;
}

const TextFieldWrapper = styled(TextField)`
    width: -webkit-fill-available !important;
}`;
const FieldIcon = styled(ClearOutlinedIcon) <CrossIconProps>`
  :hover {
    cursor: pointer;
  }
  display: ${(props) =>
        props.SearchText.length > 0 ? 'block' : 'none'} !important;
`;

const SearchField: React.FC<PropType> = (props: PropType) => {
    return (
        <TextFieldWrapper
            hiddenLabel
            placeholder={props.Placeholder}
            type="text"
            value={props.SearchText}
            onChange={(e) => {
                props.setSearchText(e.target.value);
                props.resetSearchData(e.target.value);
            }}
            onKeyPress={(e) => {
                if (e.key === 'Enter' && props.SearchText.trim().length > 0) {
                    props.SearchButtonHandler();
                }
            }}
            InputProps={{
                style: {
                    fontSize: 16,
                },
                startAdornment:(
                    <InputAdornment position="start">
                        <IconButton>
                            <SearchIcon className="search-icon"/>
                        </IconButton>

                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <FieldIcon
                            onClick={() => {
                               props.onCrossIconClick();
                                props.setSearchText('');
                              props.resetSearchData();
                            }}
                            SearchText={props.SearchText}
                        />
                    </InputAdornment>
                ),
            }}
            inputProps={{ maxLength: 100 }}
            className="input-form search-placeHolder"
        />
    );
};

export default SearchField;
