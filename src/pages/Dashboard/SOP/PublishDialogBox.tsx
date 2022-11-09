import React, { useState } from "react";

import { TextField } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import moment from "moment";

import Button from "../../../components/Button";
import DateSelector from "../../../components/DateSelector";
import { useStyles } from "../../../components/InputStyles";
interface AlertState {
  alertOpen: boolean;
  handleAlertSave: any;
  handleAlertCancel: any;
  description: string;
  setDescription: any;
  effectiveDate?: any | null;
  setEffectiveDate?: any;
}

const PublishAlertDialog: React.FC<AlertState> = (props: AlertState) => {
  const classes = useStyles();
  const [textError, setTextError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [dateErrorFormat, setDateErrorFormat] = useState(false);
  const validateData = () => {
    setDateError(false);
    setTextError(false);
    setDateErrorFormat(false);
    let validate = true;
   if (props.description.trim().length === 0) {
      setTextError(true);
      validate = false;
    }
   if (props.effectiveDate === null) {
      setDateError(true);
      validate = false;
    }
   else if ( !moment(props.effectiveDate, "MM/DD/YYYY", true).isValid()) {
      setDateErrorFormat(true);
      validate = false;
    }
  else if (props.description.trim().length !== 0 &&
    props.effectiveDate !== null &&
    moment(props.effectiveDate, "MM/DD/YYYY", true).isValid() !== false && validate === true) {
       props.handleAlertSave();
    }
  else
   {
     setDateError(false);
     setDateErrorFormat(false);
   }
  };
  const closeDialog = () => {
    setDateError(false);
    setTextError(false);
    setDateErrorFormat(false);
    props.setDescription("");
    props.setEffectiveDate(null);
    props.handleAlertCancel();
  };

  return (
    <div>
      <Dialog
        open={props.alertOpen}
        className=" sop-dashboard-container PublishDialogContentWrapper DialogWrapper form-container DialogWidth"
      >
        <div>
          <button
            onClick={() => {
              closeDialog();
            }}
            className="btn-close btn-sm close-dialog-btn"
          ></button>
        </div>

        <DialogContent className="publish-dialog-content ">
          <DialogContentText className="dialogTop">
            Enter description changes if any
          </DialogContentText>
          <div className="col-sm-12 mt-4">
            <div className="mt-3">
              <TextField
                inputProps={{ maxLength: 1000 }}
                hiddenLabel
                value={props.description}
                onChange={(e: any) => {
                  setTextError(false);
                  props.setDescription(e.target.value);
                }}
                multiline
                rows={8}
                variant="filled"
                className={"input-form form-control descriptionBox"}
                placeholder="Enter details(maximum limit, 1000 characters)"
                type="text"
              />
            </div>
            <div>
              {textError && (
                <span className="PublishError d-block text-left">
                  Description is required
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="col-sm-12 col-12 mui-label-styling">
                <DateSelector
                  value={props.effectiveDate}
                  allowSameDateSelection={true}
                  label="Enter effective date"
                  onChangeDateSelector={(newValue: any) => {
                    setDateError(false);
                    setDateErrorFormat(false);
                    if (moment(newValue, "MM/DD/YYYY", true).isValid() === false) {
                       setDateErrorFormat(true);
                     }
                    props.setEffectiveDate(newValue);
                  }}
                  className={`${classes.root} dateclasses`}
                  onChange={(e: any) => {
                    setDateError(false);
                    setDateErrorFormat(false);
                    if (e.target.value === "" || e.target.value === null) {
                      props.setEffectiveDate(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              {dateError && (
                <span className="PublishError d-block text-left">
                   Effective date is required
                </span>
              )}
              {dateErrorFormat && (
                <span className="PublishError d-block text-left">
                   Please enter date in MM/DD/YYYY.
                </span>
              )}
            </div>
          </div>
        </DialogContent>
        <div className="d-flex dialogActions mb-4 ButtonWrapper">
          <div className="ButtonCancle">
            <Button
            className="ButtonSizeCancle"
              type="outlined"
              intent="secondary"
              onClick={() => {
                closeDialog();
              }}
              text="Cancel"
            />
          </div>
          <div className="ms-auto mr-2">
            <Button
            className="ButtonSizeSave"
              type="contained"
              intent="primary"
              onClick={() => {
                validateData();
              }}
              text="Save"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PublishAlertDialog;
