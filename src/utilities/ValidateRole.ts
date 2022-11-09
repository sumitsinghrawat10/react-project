import { useSelector } from "react-redux";
import { roleValidator } from "./roleValidator";

interface RoleType {
  user: {
    role?: string;
  };
}
export const ValidateRole = (roleList: any) => {
  const userState = useSelector((state: RoleType) => state.user);
  if(roleList && roleList.includes(roleValidator(userState["role"]))){
    return true;
  } else {
    return false;
  }
};