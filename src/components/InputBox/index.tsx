import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { isNull, isUndefined } from "lodash";

interface InputBoxProps {
    name?: string;
    error?: boolean;
    disabled?: boolean;
    placeholder?: string;
    helperText?: string;
    className?: string;
    hiddenLabel?: boolean;
    variant?: any;
    type?: string;
    value: string | null;
    onChange?: any;
    minLength?: number;
    maxLength?: number;
    ariaLabel?: string;
    textBold?: boolean | true;
    style?: React.CSSProperties;
    autoComplete?: string | "";
    isPasswordField?: boolean | false
    handleClickShowPassword?: any;
    onShowPasswordClick?: any;
    onKeyDown?: any;
    passwordArealable?: string;
    maxRows?: number;
    multiline?: boolean;
    InputPropsClasses?: any;
    disableUnderline?: boolean;
    label?: string;
    width?: number;
}

const InputBox = (props: InputBoxProps) => {

    const toggleVisiblity = () => {
        if (!isUndefined(props.type) && !isNull(props.type)) {
            if (props.type.toLocaleLowerCase() === "text") {
                return <Visibility fontSize="small" />;
            }
            else {
                return <VisibilityOff fontSize="small" />;
            }
        }
    };
    return (
        <>
            <TextField
                aria-labelledby={props.ariaLabel}
                error={props.error ? true : false}
                helperText={props.helperText ? props.helperText : ""}
                variant={props.variant ? props.variant : "filled"}
                className={props.className ? props.className : ""}
                hiddenLabel={props.hiddenLabel ? true : false}
                value={props.value}
                name={props.name}
                onChange={props.onChange}
                placeholder={props.placeholder}
                disabled={props.disabled ? true : false}
                type={props.type != null ? props.type : "text"}
                inputProps={{
                    maxLength: props.maxLength ? props.maxLength : "",
                    minLength: props.minLength ? props.minLength : "",

                }}
                onKeyDown={props.onKeyDown ? props.onKeyDown : null}
                InputProps={{
                    disableUnderline: props.disableUnderline,
                    style: props.style,
                    classes: {
                        input: props.InputPropsClasses
                    },
                    endAdornment: props.isPasswordField === true ? (

                        <InputAdornment position="end">
                            <IconButton
                                aria-label={props.passwordArealable}
                                onClick={props.onShowPasswordClick}
                            >
                                {toggleVisiblity()}
                            </IconButton>
                        </InputAdornment>
                    ) : "",

                }}
                maxRows={props.maxRows}
                multiline={props.multiline}
                label={props.label}
                sx={{
                width: props.width,
                }}
                autoComplete={props.autoComplete}
            />
        </>
    );
};

export default InputBox;
