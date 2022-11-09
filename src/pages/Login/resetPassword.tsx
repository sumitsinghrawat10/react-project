import { useState, useEffect } from "react";

import axios from "axios";
import { encode as base64_encode } from "base-64";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import Button from '../../components/Button';
import InputBox from '../../components/InputBox';
import { ChorusLogo } from "../../utilities/ChorusLogo";
import Left from "../../components/Signup/left";
import { ActionType } from "../../model/model";
import {
  UPDATE_PASSWORD,
  VALIDATE_EMAIL,
} from "../../networking/httpEndPoints";
import {useDispatch } from "react-redux";

interface StyleProps {
  error: boolean;
}

const PasswordCondition = styled.p<StyleProps>`
  color: ${(props) => (props.error ? "red" : "lightgrey")};
  font-size: 0.75rem
  margin-bottom: 0.125rem;
  padding-left: 0.625rem;
  
`;

interface ResponseType {
  Result: { IsValid: boolean; Message: string };

  ResponseMessage: string;

  ResponseCode: number;
}

interface UpdateResponseType {
  result: { isSuccess: number; message: string; emailTypeId: number };
  isSuccess: boolean;
}

let emailTypeId: number;

const ResetPassword = () => {
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordMismatchError, setShowPasswordMismatchError] =
    useState(false);

  const [errorCharacter, setErrorCharacter] = useState(false);
  const [, setErrorUpper] = useState(false);
  const [, setErrorLower] = useState(false);
  const [errorSpecial, setErrorSpecial] = useState(false);
  const [errorNumber, setErrorNumber] = useState(false);
  const [data, setData] = useState({
    UpdatedBy: 0,
    UserEmail: "",
    EmailTrackId: 0,
    EmailTypeId: 0,
  });
  const [errorLowerLetter, setErrorLowerLetter] = useState(false);
  const [errorNewPasswordValidationMessage, setErrorNewPasswordValidationMessage] = useState('');
  const [errorNewPasswordValidation, setErrorNewPasswordValidation] = useState(false);
  const [errorPreviouslyUsedPassword, setErrorPreviouslyUsedPassword] = useState(false);
  useEffect(() => {
    const listener = (event: any) => {
      if (event.key === "Enter") {
        return onSubmit();
      }
    };
    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
      dispatch({ type: ActionType.NAV_VISIBLE, payload: false });
      dispatch({ type: ActionType.LOGOUT_USER, payload: false });
      localStorage.setItem("user", "");
  }, []);
  useEffect(() => {
    let tempData: any;
    try {
      const encryptedText = history.location.search.replace("?data=", "");
      const CryptoJS = require("crypto-js");
      const key = "A!9HHhi%XjjYY4YP2@Nob009X";
      let key1 = CryptoJS.enc.Utf16LE.parse(key);
      key1 = CryptoJS.MD5(key1);
      key1.words.push(key1.words[0], key1.words[1]);
      const options = { mode: CryptoJS.mode.ECB };
      const decrypted = CryptoJS.TripleDES.decrypt(
        {
          ciphertext: CryptoJS.enc.Base64.parse(encryptedText),
        },
        key1,
        options
      );
      setData(JSON.parse(decrypted.toString(CryptoJS.enc.Utf16LE)));
      tempData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf16LE));
    } catch {
      Swal.fire({
        text: "Reset password link is not correct",
        confirmButtonText: "OK",
        icon: "error",
      }).then(function () {
        history.replace("/login");
      });
      return;
    }

    emailTypeId = tempData.EmailTypeId;
    const params = {
      emailTrackId: tempData.EmailTrackId,
    };
    axios.post<ResponseType>(VALIDATE_EMAIL, params).then((res) => {
      if (res.data.Result.IsValid === false) {
        Swal.fire({
          text: "Reset password link is expired",
          confirmButtonText: "OK",
          icon: "error",
        }).then(function () {
          history.replace("/login");
        });
      }
    });
  }, []);

  const passwordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorCharacter(false);
    setErrorUpper(false);
    setErrorLower(false);
    setErrorSpecial(false);
    setErrorNumber(false);
    setShowPasswordMismatchError(false);
    setErrorLowerLetter(false);
    setErrorNewPasswordValidationMessage('');
    setErrorNewPasswordValidation(false);
    setPassword((event.target as HTMLInputElement).value);
  };

  const confirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword((event.target as HTMLInputElement).value);
  };

  const validate = () => {
    let error = false;
    if (password.length < 8) {
      setErrorCharacter(true);
      error = true;
    }
    if (password.search(/[!@#$%^&*]/i) < 0) {
      setErrorSpecial(true);
      error = true;
    }
    if (password.search(/[0-9]/) < 0) {
      setErrorNumber(true);
      error = true;
      }
      if (password.search(/[a-zA-Z]/) < 0) {
        setErrorLowerLetter(true);
        error = true;
      }
      if (password.length > 0 && password.charAt(0).toUpperCase() === password.charAt(0).toLowerCase()) {
        setErrorNewPasswordValidationMessage("Password must not start with a number or special character.");
        setErrorNewPasswordValidation(true);
        error = true;
      }
      if (password.length > 0 && password.match("([a-zA-Z])\\1{2}")) {
        setErrorNewPasswordValidationMessage("More than 2 consecutive repetitions of an alphabet is not allowed.");
        setErrorNewPasswordValidation(true);
        error = true;
      }
      if (password.length > 0 && password.search(/\s/g) > 0) {
        setErrorNewPasswordValidationMessage("Password should not allowed spaces.");
        setErrorNewPasswordValidation(true);
        error = true;
      }
    if (password !== confirmPassword) {
      setShowPasswordMismatchError(true);
      error = true;
    }
    return error;
  };
  const onSubmit = () => {
    setErrorPreviouslyUsedPassword(false);
    if (!validate()) {
      const params = {
        userEmail: data.UserEmail,
        password: base64_encode(password),
        emailTypeId: data.EmailTypeId,
        emailTrackId : data.EmailTrackId
      };
      axios
        .put<UpdateResponseType>(UPDATE_PASSWORD, params, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.result.isSuccess === 1) {
            history.push("/reset-confirmed", {
              emailTypeId: res.data.result.emailTypeId,
            });
          } else if (!res.data.isSuccess && res.status === 200) {
            setErrorPreviouslyUsedPassword(true);
          } else {
            Swal.fire({
              text: res.data.result.message,
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => {
          Swal.fire({
            text: "Something went wrong. Try again later.",
            confirmButtonText: "OK",
            icon: "error",
          });
        });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
     <div className="row m-0 LoginContainer">
        <div className="col-sm-4 col-12 p-0">
          {emailTypeId === 2 || emailTypeId === 4 ? (
            <Left
              heading="Hello, Welcome!"
              title="Please create a new password to start"
            />
          ) : (
            <Left
              heading="Hello!"
              title="Please create a new password to get back in"
            />
          )}
        </div>
        <div className="col-sm-8 col-12 p-0">
          <div className="right-container d-flex justify-content-center flex-column">
            <img src={ChorusLogo} alt="Chorus" className="chorus-logo" />
            <div className="card mb-4 shadow Card error-bgwhite">
              <div className=" reset-password-heading heading HeadingLoginField">Enter a new password</div>
              <InputBox
                hiddenLabel={true}
                error={errorNewPasswordValidation}
                helperText={errorNewPasswordValidation ? errorNewPasswordValidationMessage : ''}
                className="input-form"
                placeholder="Enter new password*"
                value={password}
                onChange={passwordChange}
                type={showPassword ? "text" : "password"}
                style={{ fontSize: 14 }}
                isPasswordField={true}
                passwordArealable={"toggle password visibility"}
                onShowPasswordClick={handleClickShowPassword}
              />
              <div className="begin-errorbox">
              <h5 className="PasswordConditionHead">
                New password must contain:
              </h5>
              <PasswordCondition error={errorCharacter}>
                Atleast 8 characters{" "}
              </PasswordCondition>
              <PasswordCondition error={errorSpecial}>
                {" "}
                A special character
              </PasswordCondition>
              <PasswordCondition error={errorLowerLetter}>
               A letter
              </PasswordCondition>
              <PasswordCondition error={errorNumber}>
                {" "}
                A number{" "}
              </PasswordCondition>
              <PasswordCondition error={errorPreviouslyUsedPassword}>Don't use 5 previously used password</PasswordCondition>
              </div>
              <InputBox
                error={showPasswordMismatchError}
                helperText={
                  showPasswordMismatchError ? "Password is not matched" : ""
                }
                isPasswordField={true}
                hiddenLabel={true}


                className="input-form"

                placeholder="Confirm new password*"
                value={confirmPassword}
                onChange={confirmPasswordChange}
                type={showConfirmPassword ? "text" : "password"}
                style={{ fontSize: 14 }}
                passwordArealable={"toggle password visibility"}
                onShowPasswordClick={handleClickShowConfirmPassword}
              />
              <Button
                className="mb-3"
                type={"contained"}
                intent="primary"
                onClick={onSubmit}
                text={"Submit"}
              />
              <div className="required">*Required</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
