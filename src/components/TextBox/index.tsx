import React from "react";
import { TextField as MuiTextField } from "@mui/material";

interface TextFieledProps {
  id?: string;
  ariaLabel?: string;
  value: string;
  onChange: any;
  maxLength?: number;
  minLength?: number;
  height?: number;
  width?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: any;
  className?: string;
  hiddenLabel?: boolean;
  autoFocus?: boolean;
  onKeyDown?: any;
  formHelperTextclassName?: string;
  style?: React.CSSProperties;
  rows?: number | 0;
  textAlign?: AlignSetting | "left";
  multiline?: boolean | false;
  fullWidth?: boolean | false;
  autoComplete?: string | "";
  name?: string;
  disableUnderline?: boolean | true;
}

const TextBox = (props: TextFieledProps) => {
  const getDisableUnderlineValue = () => {
    if (props.disableUnderline != null) {
      return props.disableUnderline;
    } else {
      return true;
    }
  };

  return (
    <MuiTextField
      id={props.id}
      aria-labelledby={props.ariaLabel}
      error={props.error ? true : false}
      helperText={props.error ? props.helperText : ""}
      variant={props.variant ? props.variant : "standard"}
      className={
        props.className ? "input-form " + props.className : "input-form"
      }
      hiddenLabel={props.hiddenLabel ? true : false}
      autoFocus={props.autoFocus ? true : false}
      onKeyDown={props.onKeyDown ? props.onKeyDown : null}
      value={props.value}
      FormHelperTextProps={{
        className: props.formHelperTextclassName
          ? props.formHelperTextclassName
          : "",
      }}
      sx={{
        width: props.width ? props.width : 400,
        height: props.height ? props.height : 40,
        backgroundColor: "#F9F9F9",
        textAlign: props.textAlign,
      }}
      InputProps={{
        disableUnderline: getDisableUnderlineValue(),
        style: props.style,
      }}
      inputProps={{
        maxLength: props.maxLength ? props.maxLength : "",
        minLength: props.minLength ? props.minLength : "",
      }}
      onChange={props.onChange}
      placeholder={props.placeholder}
      disabled={props.disabled ? true : false}
      rows={props.rows}
      multiline={props.multiline}
      fullWidth={props.fullWidth}
      autoComplete={props.autoComplete}
      name={props.name ? props.name : ""}
    />
  );
};

export default TextBox;
