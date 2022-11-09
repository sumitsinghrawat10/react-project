import React from "react";

import { Button as MuiButton } from "@mui/material";
import styled from "styled-components";

enum VariantTypes {
  text = "text",
  outLined = "outlined",
  contained = "contained",
}
const CustomButton = styled(MuiButton)``;
interface ButtonProps {
  onClick: any;
  text: string;
  intent: string;
  disabled?: boolean;
  variant?: VariantTypes;
  type: string;
  onKeyPress?: any;
  onKeyDown?: any;
  className?: any;
  height?: number;
  width?: number;
  autoFocus?: boolean | false;
  iconWithButton?: string;
  ariaLabelText?: string;
}
const Button = (props: ButtonProps) => {
  const variantValue: VariantTypes = GetVariantValue(props);
  let keyPressValue = props.onKeyPress ? props.onKeyPress : null;

  if (props.intent === "primary") {
    return (
      <CustomButton
        aria-label={props.ariaLabelText}
        className={props.className ? props.className : ""}
        variant={variantValue}
        sx={{
          backgroundColor: "$bg-light-blue",
          width: props.width,
          height: props.height,
          "&:hover": {
            backgroundColor: "$primaryDark",
            color: "$white",
            width: props.width,
            height: props.height,
          },
        }}
        onClick={props.onClick}
        disabled={props.disabled ? true : false}
        onKeyPress={keyPressValue}
        autoFocus={props.autoFocus === true ? true : false}
      >
        {props.iconWithButton && <i className={props.iconWithButton}></i>}
        {props.text}
      </CustomButton>
    );
  } else {
    return (
      <CustomButton
        className={props.className ? props.className : ""}
        variant={variantValue ? variantValue : "contained"}
        sx={{
          backgroundColor: "#FFFFFF",
          color: "#001e46",
          width: props.width,
          height: props.height,
          "&:hover": {
            backgroundColor: "#ffffff",
          },
        }}
        onClick={props.onClick}
        disabled={props.disabled ? true : false}
        onKeyPress={keyPressValue}
      >
        {props.iconWithButton && <i className={props.iconWithButton}></i>}
        {props.text}
      </CustomButton>
    );
  }
};

const GetVariantValue = (props: ButtonProps) => {
  let variantValue: VariantTypes;
  if (props.type === VariantTypes.contained) {
    variantValue = VariantTypes.contained;
  } else if (props.type === VariantTypes.outLined) {
    variantValue = VariantTypes.outLined;
  } else if (props.type === VariantTypes.text) {
    variantValue = VariantTypes.text;
  } else {
    variantValue = VariantTypes.contained;
  }
  return variantValue;
};

export default Button;
