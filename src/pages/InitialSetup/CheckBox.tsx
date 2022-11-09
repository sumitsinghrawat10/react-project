import React from 'react';
import {
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {licenseFields} from "../../components/Employee/handleDateFieldChange";

type usageType = {
  id: string;
  name: string;
};

const CheckBox = (
  licenseId: number,
  handleCheckboxChange: (licenseId: number,e:React.ChangeEvent<HTMLInputElement>) => void,
  licenseData: licenseFields[],
  usage: usageType,
  ) => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={
              licenseData[licenseId].licenseUsageId?.includes(parseInt(usage.id))
                ? true
                : false
            }
            value={usage.id}
            onChange={(e) => {
              handleCheckboxChange(licenseId, e);
            }}
            name={`${usage.name}-${licenseId}`}
          />
        }
        label={
          <span
            style={{
              fontSize: "16px",
              whiteSpace: "nowrap",
            }}
          >
            {usage.name}
          </span>
        }
        key={`${usage.name}-${licenseId}`}
      />
    );
};

export default CheckBox;