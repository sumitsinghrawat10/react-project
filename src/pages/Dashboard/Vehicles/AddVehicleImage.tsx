import React, { useState } from "react";

import { Dialog, Button, DialogContent, CircularProgress } from "@mui/material";
interface ImgPropsType {
  setOpen: any;
  open: boolean;
  setInputFileRef: any;
  isSubmit?: boolean;
  changeVehicleImage?(): void;
  buttonLoader?: boolean;
  setButtonLoader?: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddVehicleImage: React.FC<ImgPropsType> = (props: ImgPropsType) => {
  const handleClose = () => {
    props.setOpen(false);
    setImageError("");
    props.setInputFileRef.current.value = "";
    setImageError("");
    setisDisabled(true);
  };

  const image = new Image();
  const [ImageError, setImageError] = useState("");
  const [isDisabled, setisDisabled] = useState(true);
  const [isValidate, setisValidate] = useState(false);
  const validatePicture = (e: any) => {
    const PictureName = e.target?.files?.[0]?.name;
    const ExtensionName = PictureName?.split(".")?.pop().toLowerCase();
    const PictureSize = e.target.files[0]?.size;
    const totalSizeKB = (PictureSize / Math.pow(1024, 1)).toFixed(2);
    const uploadPicture = e.target?.files?.[0];
    image.src = window?.URL?.createObjectURL(uploadPicture);

    if (
      ExtensionName === "png" ||
      ExtensionName === "jpeg" ||
      ExtensionName === "jpg" ||
      ExtensionName === "svg"
    ) {
      setisValidate(true);
      setisDisabled(false);

      image.onload = () => {
        if (PictureSize > 400000) {
          setImageError(
            `Sorry, this image doesn't look like the size we wanted. It's ${totalSizeKB} KB but the maximum size allowed is 400 KB.`
          );
          setisValidate(false);
          setisDisabled(true);
        } else if (
          image.width >= 400 &&
          image.width <= 800 &&
          image.height >= 400 &&
          image.height <= 800
        ) {
          setImageError("");
          setisValidate(true);
          setisDisabled(false);
        } else {
          setImageError(`Sorry, this image doesn't look like the size we wanted. It's
            ${image.width} x ${image.height}px but we Recommended 400 x 400px, maximum allowed 800 x 800px.`);
          setisValidate(false);
          setisDisabled(true);
        }
      };
    } else {
      setisValidate(false);
      setisDisabled(true);
      setImageError("File Should be (jpg/png/jpeg/svg)");
    }
  };

  const handleSubmit = () => {
    if(props.isSubmit && isValidate === true){
      props.setButtonLoader?.(true);
      props.changeVehicleImage?.();
      setisDisabled(true);
    } else if (isValidate === true) {
      props.setOpen(false);
    } else{
      return false;
    }
  };

  const onInputClick = () => {
    props.setInputFileRef.current.value = "";
    setImageError("");
    setisDisabled(true);
  };

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={(_event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          props.setOpen(false);
        }
      }}
      className="p-4"
      aria-labelledby="alert-dialog-title"
      PaperProps={{
        sx: {
          maxHeight: 800,
        },
      }}
    >
      <div className="userprofile-container">
        <div className="CloseDialog">
          <button
            onClick={handleClose}
            className="btn-close btn-sm close-assign-license"
          ></button>
        </div>
        <DialogContent>
          <div className="DialogTop">Upload Vehicle Picture</div>

          <div className="row mt-2 ml-2 vehicle-picture">
            <div className="col-12 col-sm-12 mt-1">
              <input
                type="file"
                className="form-control"
                accept="image/png, image/jpeg,  image/jpg,  image/svg"
                onChange={validatePicture}
                onClick={onInputClick}
                ref={props.setInputFileRef}
              />
              <p className="text-danger mt-2 "> {ImageError}</p>
            </div>

            <div
              className="text-right col-sm-12 d-flex"
              style={{ justifyContent: "right" }}
            >
              {!props.buttonLoader && (
                <Button
                  className="mb-3"
                  variant="contained"
                  sx={{ ml: 2, mt: 5 }}
                  onClick={handleSubmit}
                  disabled={isDisabled}
                >
                  Submit
                </Button>
              )}
              {props.buttonLoader && (
                <Button
                  className="px-4 mb-3"
                  variant="outlined"
                  sx={{ ml: 2, mt: 5 }}
                >
                  <CircularProgress size={30} />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default AddVehicleImage;
