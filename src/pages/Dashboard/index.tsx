import { useState, useEffect } from "react";

import { Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { ActionType } from "../../model/model";
import {
  RegTechAdmin,
  RegTechWriter,
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
  GeneralManager,
  TeamLead,
} from "../../utilities/constants";
import { roleValidator } from "../../utilities/roleValidator";
import DashboardLicense from "../DashboardLicense";
import AdminDashboard from "./AdminDashboard";
import SopDashboard from "./SOP";

const DashboardContainer = styled.div`
  padding-top: 0px;
`;
interface DashboardType {
  user: {
    user?: string;
    role?: string;
    userId?: number | null;
    initialSetup?: string;
    navVisible?: boolean;
  };
}

const Dashboard = () => {
  const userState = useSelector((state: DashboardType) => state.user);
  const history = useHistory();
  const [hover, sethover] = useState(false);
  const dispatch = useDispatch();

  const handleInitialSetupClick = () => {
    history.push("/initial-setup");
    dispatch({ type: ActionType.NAV_VISIBLE, payload: false });
  };
  useEffect(() => {
    if (userState["navVisible"] === false) {
      dispatch({ type: ActionType.NAV_VISIBLE, payload: true });
    }
  }, [userState["navVisible"]]);
  const RoleValidatorForInitialSetup =
    roleValidator(userState["role"]) === ComplianceAnalyst ||
    roleValidator(userState["role"]) === DirectorOfRetailOperations ||
    roleValidator(userState["role"]) === GeneralManager ||
    roleValidator(userState["role"]) === TeamLead;

  return (
    <DashboardContainer >
      {roleValidator(userState["role"]) === RegTechAdmin && <AdminDashboard />}
      {roleValidator(userState["role"]) === RegTechWriter && <SopDashboard />}
      {userState["initialSetup"] === "complete" &&
        roleValidator(userState["role"]) !== "" &&
        roleValidator(userState["role"]) !== RegTechAdmin &&
        roleValidator(userState["role"]) !== RegTechWriter && (
          <DashboardLicense />
        )}
      {userState["initialSetup"] !== "complete" &&
        RoleValidatorForInitialSetup && <DashboardLicense />}
      {userState["initialSetup"] !== "complete" &&
        (roleValidator(userState["role"]) === SystemAdministrator ||
          roleValidator(userState["role"]) === DirectorOfCompliance) && (
          <div className=" initial-setup-wrapper">
            <div className="page-title">Licenses</div>
            <div className="text-center mt-5">
              <div className="dashboard-initital-title">
                A location is required before adding a license. You can add a
                location by starting the initial setup or by adding a location
                from the location dashboard.
              </div>
              <Button
                onMouseOver={() => sethover(true)}
                onMouseOut={() => sethover(false)}
                className="my-3 ButtonWrap"
                variant="contained"
                onClick={handleInitialSetupClick}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    userState["initialSetup"] !== "complete"
                  ) {
                    handleInitialSetupClick();
                  }
                }}
              >
                {hover ? "Start Here" : "Start initial Setup"}
              </Button>
            </div>
          </div>
        )}
    </DashboardContainer>
  );
};

export default Dashboard;
