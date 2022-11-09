import { Tooltip } from "@mui/material";

interface TooltipProps {
  value: any;
  len: number;
  styleclass?: string;
}

const addTooltip = (props: TooltipProps) => {
  if (props.value !== null && props.value.length > props.len) {
    return (
      <Tooltip title={props.value} placement="top-start" arrow>
        <div className={props.styleclass}>
          {`${props.value}`.slice(0, props.len) + "..."}
        </div>
      </Tooltip>
    );
  } else {
    return <div className={props.styleclass}>{`${props.value}`}</div>;
  }
};
export default addTooltip;
