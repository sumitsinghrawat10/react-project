import React from "react";

import Button from "../../components/Button";
import axios from "axios";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { UPDATE_SIGNUP_STATUS } from "../../networking/httpEndPoints";
import * as UserDetailsActions from "../../pages/Login/authenticationActions";
import { RootState } from "../../redux/rootReducer";
import { decodeToken } from "../../utilities/decodeToken";

interface HistoryType {
  setActiveWizard: any;
  setActiveStep: any;
  setWizardStepCounter: any;
  organizationLocationId: number;
  setOrganizationLocationId: any;
  wizardStepCounter: number;
  activeStep: number;
  actions: typeof UserDetailsActions;
  user: {
    initialSetup?: string;
  };
  cleanInputs: boolean;
  setCleanInputs: any;
  resetLicenseInputs: any;
  setLicenseIds: any;
}

interface UpdateSignupStatusResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const AddLocationDialogBox: React.FC<HistoryType> = (props: HistoryType) => {
  const handleYes = () => {
    props.setWizardStepCounter(
      (prevWizardStepCounter: number) => prevWizardStepCounter + 1
    );
    props.setActiveWizard("location");
    props.setActiveStep(0);
    props.setCleanInputs(true);
    props.setOrganizationLocationId(0);
    props.resetLicenseInputs();
    props.setLicenseIds([]);
  };

  const handleNo = () => {
    updateSignupStatus();
  };

  const updateSignupStatus = () => {
    const token = localStorage.getItem("user");
    const userData = decodeToken(token);
    const params = {
      userEmail: userData["Email"],
      statusFlag: 2,
    };
    axios
      .put<UpdateSignupStatusResponse>(UPDATE_SIGNUP_STATUS, params, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          props.setActiveStep(props.activeStep + 1);
          props.setActiveStep(4);
          // Need this code in future
          // props.actions.updateInitialSetup("complete");
          // props.setActiveStep(props.activeStep + 1);
          // history.push("/initial-setup-complete");
        }
      });
  };

  return (
    <div className="initial-setup-wrapper ">
      <div className="Card">
        <div className="row">
          <span className="spanBox">
            <b>Would you like to add another location?</b>
          </span>
          <div className="d-flex justify-content-center ButtonWrapper">
            <div>
              <Button
                type="outlined"
                className="mb-3 next-btn me-2"
                onClick={handleYes}
                intent="primary"
                text="Yes"
              />
            </div>
            <Button
              className="mb-3 next-btn"
              type="contained"
              intent="primary"
              onClick={handleNo}
              text="No"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

function mapDispatchToProps(dispatch: any) {
  return {
    actions: bindActionCreators(UserDetailsActions as any, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddLocationDialogBox);
