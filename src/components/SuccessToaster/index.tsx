import React from "react";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import styled from "styled-components";
const TextPinWrapper = styled.div`
  display: flex;
  z-index: 100;
  width: 100%;
  height: 14%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #233ce6;
`;
const TextPin = styled.div`
  font-weight: $font-weight-normal;
  font-size: 1rem;
  font-family: $default-font-name;
  text-align: left;
  letter-spacing: 0px;
  color: #ffffff;
  opacity: 1;
  margin: auto;
`;
interface PropTypes {
  message: string;
}
const SuccessToaster = (props: PropTypes) => {
  return (
    <TextPinWrapper>
      <TextPin>
        <CheckCircleOutlineIcon></CheckCircleOutlineIcon>
        <span className="ms-2">{props.message}</span>
      </TextPin>
    </TextPinWrapper>
  );
};
export default SuccessToaster;
