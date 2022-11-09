import React, { ChangeEvent, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { MenuItem, Select, Backdrop, CircularProgress } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ListItemText from "@mui/material/ListItemText";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

import { Add_Category } from "../../../networking/httpEndPoints";
import Button from "../../../components/Button";
import SuccessToaster from "../../../components/SuccessToaster";
import InputBox from "../../../components/InputBox";

const useStyles = makeStyles({
  root: {
    "& .MuiFilledInput-root:before": {
      borderBottom: "none!important",
    },
  },
  addDialog: {
    "&.MuiDialog-root": {
      height: "100% !important",
      minWidth: "550px",
      width: "100% !important",
    },
  },
  helperText: {
    marginLeft: "0px!important",
  },
  addDialogHeading: {
    "&.MuiTypography-root": {
      display: "flex !important",
      justifyContent: "center !important",
    },
  },
  closeButton: {
    "&.MuiDialog-root button": {
      float: "right !important",
      marginTop: "0.625rem !important",
      marginRight: "0.938rem !important",
    },
  },
  dialogContent: {
    "&.MuiDialogContent-root": {
      marginTop: "0.625rem",
      width: "37.5rem !important",
    },
    "&.MuiDialogContent-root b": {
      color: "#707070",
      marginLeft: "0rem",
    },
  },
  submitButton: {
    "&.MuiDialogActions-root button": {
      height: "2.5rem !important",
      width: "6.25rem !important",
      marginBottom: "1.25rem !important",
    },
  },
});

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface PopupState {
  openCategory: boolean;
  handleCategory: any;
  getSelfAuditQuestionData: any;
}

const ITEM_HEIGHT = 60;
const ITEM_PADDING_TOP = 2;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4 + ITEM_PADDING_TOP,
      maxWidth: 300,
    },
  },
};

const AddDialogBox: React.FC<PopupState> = (props: PopupState) => {
  const history = useHistory();
  useEffect(() => {
    if (props.openCategory) resetFields();
    GetCategory();
  }, [props.handleCategory]);

  const token = localStorage.getItem("user");
  const classes = useStyles();

  const GetCategory = () => {
    const categories: Array<string> = ["Category", "State", "County", "City"];

    setCategory(categories);
  };
  const validateFields = () => {
    let validate = true;
    if (addCategoryName.trim().length === 0) {
      setCategoryNameError(true);
      setCategoryNameErrorText("Please provide a category name");
      validate = false;
      return validate;
    }
    if (addCategoryName.trim().length < 2) {
      setCategoryNameError(true);
      setCategoryNameErrorText(
        "Please provide a category name of at least two characters"
      );
      validate = false;
      return validate;
    }
    if (addCategoryName.trim().length > 50) {
      setCategoryNameError(true);
      setCategoryNameErrorText(
        "Only 50 characters are allowed in a category name"
      );
      validate = false;
      return validate;
    }
    return validate;
  };
  const [category, setCategory] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Array<string>>([]);
  const [renderValue, setRenderValue] = useState<Array<string>>([]);
  const [isLabel, setIsLabel] = React.useState(false);
  const [categoryNameErrorText, setCategoryNameErrorText] = useState(" ");
  const [showLoader, setShowLoader] = useState(false);
  const [categoryNameError, setCategoryNameError] = React.useState(false);
  const [addCategoryName, setAddCategoryName] = React.useState("");
  const [pathName, setPathName] = useState("");
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
  const [questionLevelNumber, setQuestionLevelNumber] = useState<
    number | undefined
  >(0);

  const handleChange = (event: any) => {
    const {
      target: { value },
    } = event;

    setSelectedCategory(typeof value === "string" ? value.split(",") : value);
    const flag = event.target.value.length > 0 ? true : false;
    setIsLabel(flag);
    const varCat = levelSwitch(value);
    setQuestionLevelNumber(varCat);
  };
  const levelSwitch = (categoryName: any) => {
    switch (categoryName) {
      case "Category":
        break;
      case "City":
        return 0;
      case "County":
        return 1;
      case "State":
        return 2;
      default:
        break;
    }
  };
  const resetFields = () => {
    setIsLabel(false);
    setSelectedCategory(Array<string>());
    setCategory([]);
    setRenderValue(Array<string>());
    setAddCategoryName("");
    setCategoryNameError(false);
  };

  const updatePath = () => {
    switch (pathName) {
      case "Category":
        onSubmit();
        break;
      case "City":
        return "";
      case "County":
        return "";
      case "State":
        return "";
      default:
        break;
    }
  };

  const inputValue = () => {
    const valueName = selectedCategory.toString();
    setRenderValue(selectedCategory);
    setPathName(valueName);
    if (valueName.toLowerCase() !== "category") {
      renderStateCountyOrCity(valueName);
    }
  };

  const onSubmit = () => {
    if (validateFields()) {
      const trimmedCategory = addCategoryName.trim();
      const params = {
        categoryName: trimmedCategory,
      };
      if (token !== null) {
        setShowLoader(true);
        axios
          .post<GetResponse>(Add_Category, params, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            setShowLoader(false);
            if (res.status === 201 && res.data.isSuccess) {
              props.handleCategory();
              setConfirmationModalIsVisible(true);
              setTimeout(() => {
                setConfirmationModalIsVisible(false);
              }, 3000);
              props.getSelfAuditQuestionData();
            } else if (res.status === 201 && !res.data.isSuccess) {
              setCategoryNameError(true);
              setCategoryNameErrorText(
                "A category with this name is already present"
              );
            } else {
              Swal.fire({
                text: "Something went wrong!",
                confirmButtonText: "OK",
                icon: "error",
              });
            }
          })
          .catch(() => setShowLoader(false));
      }
    }
  };

  const renderStateCountyOrCity = (Category: string) => {
    history.push("/self-audit-state-county-city", {
      Category,
      questionLevelNumber: questionLevelNumber,
    });
  };

  return (
    <div className="self-audit">
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={showLoader}
      >
        <CircularProgress />
      </Backdrop>
      <Dialog
        className={` form-container ${classes.addDialog} ${classes.closeButton}`}
        open={props.openCategory}
      >
        {renderValue.length === 0 && (
          <>
            <div>
              <button
                onClick={props.handleCategory}
                className="btn-close close-box"
              ></button>
            </div>
            <DialogTitle className={`${classes.addDialogHeading}`}>
              <b>Add a category or jurisdiction</b>
            </DialogTitle>
            <DialogContent className={`${classes.dialogContent} `}>
              <FormControl sx={{ width: "100%" }}>
                <b>Select an option to continue</b>
                <br></br>
                <Select
                  displayEmpty
                  disableUnderline
                  value={selectedCategory}
                  onChange={handleChange}
                  MenuProps={MenuProps}
                  inputProps={{ "aria-label": "Without label" }}
                  variant="filled"
                  IconComponent={KeyboardArrowDownIcon}
                  className="input-form select-field"
                  style={{
                    fontSize: 16,
                    minWidth: 500,
                    height: 60,
                    overflow:"Hidden",
                  }}
                >
                  <MenuItem disabled value="">
                    <span className="input-placeholder">Select one</span>
                  </MenuItem>
                  {category.map((item, index) => (
                    <MenuItem key={index} value={item}>
                      <ListItemText primary={item} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions className={`${classes.submitButton}`}>
              <Button
                type="contained"
                text="Continue"
                intent="primary"
                onClick={() => inputValue()}
                disabled={selectedCategory.length > 0 ? false : true}
                onKeyPress={(e: KeyboardEvent) =>
                  e.key === "Enter" && props.handleCategory === true
                }
              />
            </DialogActions>
          </>
        )}
        {renderValue.length === 1 && (
          <>
            <div>
              <button
                onClick={props.handleCategory}
                className="btn-close"
              ></button>
            </div>
            <DialogTitle className={`${classes.addDialogHeading}`}>
              <b>Add question category</b>
            </DialogTitle>
            <DialogContent className={`${classes.dialogContent}`}>
              <p>
                <b style={{ marginLeft: 10, color: "#707070" }}>
                  {" "}
                  Enter a name for this category
                </b>
              </p>
              <InputBox
                error={categoryNameError}
                helperText={categoryNameError ? categoryNameErrorText : ""}
                hiddenLabel
                variant="filled"
                className="form-field form-control"
                placeholder={"Enter text"}
                value={addCategoryName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setCategoryNameError(false);
                  setAddCategoryName(e.target.value);
                }}
                maxLength={150}
                minLength={1}
                style={{ fontSize: 16, background: "#f4f5f8" }}
              />
            </DialogContent>
            <DialogActions className={`mb-2 ${classes.submitButton}`}>
              <Button
                type="contained"
                intent="primary"
                text="Submit"
                onClick={() => updatePath()}
                onKeyPress={(e: KeyboardEvent) =>
                  e.key === "Enter" && props.handleCategory === true
                }
              />
            </DialogActions>
          </>
        )}
      </Dialog>
      {confirmationModalIsVisible && (
        <SuccessToaster message="Category Added" />
      )}
    </div>
  );
};

export default AddDialogBox;
