import React, { useState, useRef } from "react";

import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import {
  GET_PROFILE_PICTURE,
  ADD_PROFILE_PICTURE,
} from "../../networking/httpEndPoints";
import { UserProfilePicture } from "../../store/profilePictureStore";
import { UserProfilePictureName } from "../../store/profilePictureNameStore";
import { decodeToken } from "../../utilities/decodeToken";

interface PropsType {
  setOpen: any;
  open: boolean;
  userId?: string;
  setEmployeePicture?: any;
  setEmployeePictureName?: any;
}
interface ProfilePicResponseType {
  isSuccess: boolean;
  responseMessage: string;
  result?: any;
}
interface DashboardType {
  user: {
    user?: string;
    role?: string;
    userId?: number | null;
    initialSetup?: string;
    navVisible?: boolean;
  };
}
const ChangeProfileDialog: React.FC<PropsType> = (props: PropsType) => {
  const { addProfilePicture } = UserProfilePicture();
  const { addProfilePictureName } = UserProfilePictureName();
  const token = localStorage.getItem("user");
  const userData = decodeToken(token);
  const tokenUserId = userData.UserId;
  const inputFileRef = useRef<any | null>(null);
  const handleCancel = () => {
    inputFileRef.current.value = null;
    setisDisabled(true);
    props.setOpen(false);
    setImageError("");
  };
  const userState = useSelector((state: DashboardType) => state.user);
  const [ImageError, setImageError] = useState("");
  const [isValidate, setisValidate] = useState(false);
  const [isDisabled, setisDisabled] = useState(true);
  const image = new Image();
  const validateImage = (e: any) => {
    const FileName = e.target.files[0].name;
    const ExtensionName = FileName.split(".").pop().toLowerCase();
    const ImageSize = e.target.files[0].size;
    const totalSizeKB = (ImageSize / Math.pow(1024, 1)).toFixed(2);
    const uploadedImage = e.target.files[0];

    image.src = window.URL.createObjectURL(uploadedImage);

    if (
      ExtensionName === "png" ||
      ExtensionName === "jpeg" ||
      ExtensionName === "jpg" ||
      ExtensionName === "svg"
    ) {
      setisValidate(true);
      setisDisabled(false);

      image.onload = () => {
        if (ImageSize > 200000) {
          setImageError(
            `Sorry, this image doesn't look like the size we wanted. It's ${totalSizeKB} KB but the maximum size allowed is 200 KB.`
          );
          setisValidate(false);
          setisDisabled(true);
        } else if (
          image.width >= 200 &&
          image.width <= 400 &&
          image.height >= 200 &&
          image.height <= 400
        ) {
          setImageError("");
          setisValidate(true);
          setisDisabled(false);
        } else {
          setImageError(`Sorry, this image doesn't look like the size we wanted. It's
            ${image.width} x ${image.height}px but we  Recommended 200x200px, maximum allowed 400x400px.`);
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

  const swalAlert = () => {
    return Swal.fire({
      text: "Something went wrong!",
      confirmButtonText: "OK",
      icon: "error",
    });
  };

  const handleSubmitBtn = () => {
    if (isValidate === true) {
      props.setOpen(false);

      const bodyFormData = new FormData();
      bodyFormData.append("ImgProfile", inputFileRef.current.files[0]);
      if (props.userId) {
        bodyFormData.append("UserId", props.userId);
      }
      const uid = props.userId ? `?userId=${props.userId}` : "";

      addPictureAxiosCall(bodyFormData, uid);
    }
  };

  const addPictureAxiosCall = (bodyFormData: any, uid: string) => {
    axios
      .post<ProfilePicResponseType>(ADD_PROFILE_PICTURE, bodyFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((resp) => {
        if (resp.data.isSuccess) {
          getPictureAxiosCall(uid);
        } else {
          swalAlert();
        }
      })
      .catch(() => swalAlert());
  };

  const getPictureAxiosCall = (uid: string) => {
    axios
      .get<ProfilePicResponseType>(`${GET_PROFILE_PICTURE}${uid}`, {
        headers: {
          Authorization: `Bearer ${userState["user"]}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        inputFileRef.current.value = null;
        setImageError("");
        setisDisabled(true);
        if (response.status === 200 && response.data.isSuccess) {
          if (props.userId) {
            props.setEmployeePictureName(response.data.result.profileImageName);
            props.setEmployeePicture(response.data.result.imageData);
            if (parseInt(tokenUserId) === parseInt(props.userId)) {
              addProfilePicture(response.data.result.imageData);
              addProfilePictureName(response.data.result.profileImageName);
            }
          } else {
            addProfilePicture(response.data.result.imageData);
            addProfilePictureName(response.data.result.profileImageName);
          }
        } else {
          swalAlert();
        }
      })
      .catch(() => swalAlert());
  };

  const onProfileImageInputClick = () => {
    inputFileRef.current.value = "";
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
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          maxHeight: 800,
        },
      }}
    >
      <div className="userprofile-container">
        <div className="CloseDialog">
          <button
            onClick={handleCancel}
            className="btn-close btn-sm close-assign-license"
          ></button>
        </div>
        <DialogContent className="DialogContentWrap">
          <div className="DialogTop">Upload Profile Picture</div>

          <div className="row mt-2">
            <div className="col-12 col-sm-12 mt-2">
              <input
                type="file"
                className="form-control"
                accept="image/png, image/jpeg,  image/jpg,  image/svg"
                onChange={validateImage}
                onClick={onProfileImageInputClick}
                ref={inputFileRef}
              />

              <p className="text-danger mt-2 text-center"> {ImageError}</p>
            </div>

            <div
              className="text-right col-sm-12 d-flex"
              style={{ justifyContent: "right" }}
            >
              <Button
                className="mb-3 next-btn"
                variant="contained"
                sx={{ mr: 1, mt: 5 }}
                onClick={handleSubmitBtn}
                disabled={isDisabled}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default ChangeProfileDialog;
