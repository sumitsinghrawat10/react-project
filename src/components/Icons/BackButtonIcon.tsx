import { Tooltip } from "@mui/material";
import React from "react";

interface BackButtonProps {
  onClick: React.MouseEventHandler<HTMLElement>;
}
const BackButton = (props: BackButtonProps) => {
      return (
        <>
          <div className="iconBack-container">
                    <Tooltip
                    title={"Back"}
                    placement="top"
                    arrow>
                    <i
                    className="bi bi-arrow-left-short iconBack"
                    onClick={props.onClick}>
                    </i>
                    </Tooltip>
                    </div>
        </>
      );
  };
  export default BackButton;