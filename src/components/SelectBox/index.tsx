import React, { useEffect } from "react";
import { Select, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
interface SelectBoxProps {
  id?: string;
  name: string;
  displayEmpty: boolean;
  disabled: boolean;
  value: string;
  onChange: any;
  className: string;
  placeHolder: string;
  ListData: any;
  itemName?: string;
  error: boolean;
  errorText: string;
  height?: string;
  disableUnderLine?: boolean;
  placeholdercolor?: string;
}

const SelectBox: React.FC<any> = (props: SelectBoxProps) => {
  const [selectMenu, setSelectMenu] = React.useState([]);
  const ListDataItem: string = String(props.itemName);

  useEffect(() => {
    const selectedMenu: any = [];
    props.ListData.forEach((data: any) =>
      selectedMenu.push(data[ListDataItem])
    );
    setSelectMenu(selectedMenu);
  }, [props.ListData]);

  return (
    <>
      <Select
        id={props.id}
        name={props.name}
        displayEmpty={props.displayEmpty}
        disabled={props.disabled}
        disableUnderline={props.disableUnderLine}
        value={props.value}
        onChange={props.onChange}
        inputProps={{ "aria-label": "Without label" }}
        variant="filled"
        style={{
          fontSize: 16,
          backgroundColor: "#f9f9f9",
          width: "100%",
          color: "rgba(0, 0, 0, 0.38)",
          height: props.height,
        }}
        className={props.className}
        IconComponent={KeyboardArrowDownIcon}
      >
        <MenuItem disabled value="" className="abcdef">
          <span className={props.placeholdercolor?.length!==0 ?  props.placeholdercolor : "input-placeholder"}>{props.placeHolder}</span>
        </MenuItem>
        {selectMenu.map((type: any, index: number) => (
          <MenuItem key={index} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
      <div className="form-field-error">
        {props.error ? props.errorText : ""}
      </div>
    </>
  );
};

export default SelectBox;
