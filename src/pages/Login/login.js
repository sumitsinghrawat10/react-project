import axios from "axios";
import { encode as base64_encode } from "base-64";
import { LOGIN } from "../../networking/httpEndPoints";

export const login = (payload) => {
  return axios
    .post(LOGIN, {
      emailId: payload.payload.email,
      password: base64_encode(payload.payload.password),
    })
    .then((response) => {
      return response;
    });
};
