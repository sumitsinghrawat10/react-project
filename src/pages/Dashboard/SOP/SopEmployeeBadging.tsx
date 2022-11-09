import React, { useState, useRef, useEffect } from "react";

import BellIcon from "../../../components/Icons/BellIcon";
import { Button, Tooltip } from "@mui/material";
import axios from "axios";
import JoditEditor from "jodit-react";
import moment from "moment";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import AddTooltip from "../../../components/AddTooltip";
import Loader from "../../../components/Loader";
import SuccessToaster from "../../../components/SuccessToaster";
import {
  UPDATE_SOP_DEFINITION,
  GET_SOP_DETAILS,
  GET_USER_SOP_DETAILS,
  RESET_EDITED_SOP,
} from "../../../networking/httpEndPoints";
import historyVaribaleChecker from "../../../utilities/historyVariableChecker";
import SwalBox from "../../../components/SwalBox";
import { useSelector } from "react-redux";
import { roleValidator } from "../../../utilities/roleValidator";
import {
  DirectorOfCompliance,
  RegTechWriter,
  sopLengthExceed,
  SystemAdministrator,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
} from "../../../utilities/constants";
import DialogWithTwoBtn from "../../../components/DialogWithTwoBtn";

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
const config = {
  readonly: false,
  minHeight: 500,
  limitChars: 200000,
  limitHTML: true,
  removeButtons: ['fullsize'],
  events: {
    afterInit: (instance: any) => {
      instance.toggleFullSize = (e: any) => {
        instance.e.fire("toggleFullSize", e);
        const joditFullsizeBoxTrueCss = "jodit_fullsize-box_true";
        const leftNavDivContainer = document.querySelector(
          "div.left-nav-container"
        );

        if (!instance.mods.fullsize) {
          instance.__isFullSize = false;
          if (leftNavDivContainer !== null)
            leftNavDivContainer.classList.remove(joditFullsizeBoxTrueCss);
        } else {
          instance.__isFullSize = true;
          if (leftNavDivContainer !== null)
            leftNavDivContainer.classList.add(joditFullsizeBoxTrueCss);
        }
      };
    },
  },
};

interface AuthRoleType {
  user: {
    role?: string;
  };
}
interface SelectorType {
  role?: string;
}

const SopEmployeeBadging: React.FC = () => {
  const introduction = useRef(null);
  const [introContent, setIntroContent] = useState("");

  const scope = useRef(null);
  const [scopeContent, setScopeContent] = useState("");

  const procedure = useRef(null);
  const [procedureContent, setProcedureContent] = useState("");

  const references = useRef(null);

  const [referencesContent, setReferencesContent] = useState("");
  const [showToaster, setShowToaster] = useState(false);
  const [sopStatus, setSopStatus] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [sopVersionData, setSopVersionData] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [revisedDate, setRevisedDate] = useState("");
  const [, setIsSaved] = useState(false);
  const [categoryNameToShow, setCategoryNameToShow] = useState("");

  const [introContentInitial, setIntroContentInitial] = useState("");
  const [scopeContentInitial, setScopeContentInitial] = useState("");
  const [procedureContentInitial, setProcedureContentInitial] = useState("");
  const [referencesContentInitial, setReferencesContentInitial] = useState("");
  const [blankInPublishedState, setBlankInPublishedState] = useState("");
  const history = useHistory();
  const userState: SelectorType = useSelector(
    (roleState: AuthRoleType) => roleState.user
  );

  const sopId: number = historyVaribaleChecker("sopId", history);
  const isEdit = historyVaribaleChecker("isEdit", history);
  const city = historyVaribaleChecker("city", history);
  const county = historyVaribaleChecker("county", history);
  const state = historyVaribaleChecker("state", history);
  const licenseTypeName = historyVaribaleChecker("licenseName", history);
  const categoryName = historyVaribaleChecker("category", history);
  const newCategoryName = historyVaribaleChecker("newCategory", history);
  const sopTitle = historyVaribaleChecker("sopTitle", history);
  const revisionId = historyVaribaleChecker("revisionId", history);
  const isUserDashboard: boolean = historyVaribaleChecker(
    "isUserDashboard",
    history
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const token = localStorage.getItem("user");
  const RoleValidatorForCancelEmployeeBadging =
    roleValidator(userState["role"]) === DirectorOfCompliance ||
    roleValidator(userState["role"]) === DirectorOfRetailOperations ||
    roleValidator(userState["role"]) === SystemAdministrator ||
    roleValidator(userState["role"]) === ComplianceAnalyst;
  useEffect(() => {
    if (isEdit) {
      const apiUrl: string = isUserDashboard
        ? GET_USER_SOP_DETAILS
        : GET_SOP_DETAILS;

      setIsLoading(true);
      axios
        .get<GetResponse>(`${apiUrl}${sopId}/${revisionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res: any) => {
          setIsLoading(false);

          if (
            res.status === 200 &&
            res.data.responseMessage.toString().toLowerCase() === "successful"
          ) {
            setJurisdiction(res.data.result.jurisdiction);
            setSopVersionData(res.data.result.sopVersion);
            setSopStatus(res.data.result.sopStatus);
            setBlankInPublishedState(
              res.data.result.sopStatus.toLowerCase().trim() === "published"
                ? ""
                : res.data.result.sopStatus
            );
            setEffectiveDate(res.data.result.effectiveDate);
            setRevisedDate(res.data.result.publishedDate);
            setIntroContent(res.data.result.introduction);
            setScopeContent(res.data.result.scope);
            setProcedureContent(res.data.result.procedure);
            setReferencesContent(res.data.result.references);
            setCategoryNameToShow(res.data.result.category);
            setIntroContentInitial(res.data.result.introduction);
            setScopeContentInitial(res.data.result.scope);
            setProcedureContentInitial(res.data.result.procedure);
            setReferencesContentInitial(res.data.result.references);
          }
        })
        .catch(() => setIsLoading(false));
    }
    return () => {
      setIntroContent("");
      setIntroContentInitial("");
    };
  }, []);

  const validateFields = () => {
    if (
      introContent.trim().length === 0 &&
      procedureContent.trim().length === 0 &&
      scopeContent.trim().length === 0 &&
      referencesContent.trim().length === 0
    ) {
      return false;
    }
    return true;
  };
  const gotoSopDetails = (revisionIdParam: any) => {
    return history.push("/sop-details", {
      sopId: sopId,
      status: sopStatus === "Draft" ? "Saved" : sopStatus,
      isUser: isUserDashboard,
      revisionId: revisionIdParam,
      filterText: historyVaribaleChecker("filterText", history),
      searchTextItem: historyVaribaleChecker("searchFilterText", history),
      licenseFilter: historyVaribaleChecker("licenseFilterNumber", history),
      categoryFilter: historyVaribaleChecker("categoryFilterNumber", history),
    });
  };

  const verifyNoChanges = () => {
    if (
      introContentInitial === introContent &&
      procedureContentInitial === procedureContent &&
      scopeContent === scopeContentInitial &&
      referencesContent === referencesContentInitial
    ) {
      setDialogOpen(true);
    } else {
      updateSOP();
    }
  };
  const callUpdateSop = () => {
    const payload = {
      sopID: sopId,
      introduction: introContent.trim(),
      procedure: procedureContent.trim(),
      scope: scopeContent.trim(),
      references: referencesContent.trim(),
    };

    if (token !== null) {
      setIsLoading(true);
      axios
        .put<GetResponse>(UPDATE_SOP_DEFINITION, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setIsLoading(false);
          if (res.status === 200 && res.data.isSuccess) {
            setShowToaster(true);
            setSopStatus("Draft");
            setIsSaved(true);
            setTimeout(() => {
              setShowToaster(false);
              ResetEditedSops(false);
              gotoSopDetails(res.data.result);
            }, 3000);
          } else if (res.status === 200 && !res.data.isSuccess) {
            Swal.fire({
              text: res.data.responseMessage,
              confirmButtonText: "OK",
              icon: "error",
            });
          } else if (res.status === 400) {
            Swal.fire({
              text: sopLengthExceed,
              confirmButtonText: "OK",
              icon: "error",
            });
          } else {
            Swal.fire({
              text: "Something went wrong, please try again later",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch((axiosError) => {
          setIsLoading(false);
          if (axiosError.response && axiosError.response.status === 400) {
            Swal.fire({
              text: sopLengthExceed,
              confirmButtonText: "OK",
              icon: "error",
            });
          } else {
            Swal.fire({
              text: "Something went wrong, please try again later",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        });
    }
  };
  const updateSOP = () => {
    if (validateFields() === true) {
      callUpdateSop();
    } else {
      Swal.fire({
        text: "Enter data at least in one section",
        confirmButtonText: "OK",
        icon: "error",
      });
    }
  };

  const handleBack = () => {
    if (roleValidator(userState["role"]) === RegTechWriter) {
      if ((sopStatus === "" || sopStatus === "Draft" || sopStatus === "Saved") && (sopVersionData === "" || sopVersionData === "1.0")) {
        history.push("create-sop", { sopId: sopId, isBack: true });
      }
      else if (sopStatus === "Saved" && sopVersionData !== "1.0") {
        gotoSopDetails(revisionId);
      }
      else if (sopStatus === "Published") {
        history.push("sop", { sopId: sopId, isBack: true });
      }
      else {
        gotoSopDetails(revisionId);
      }
    } else {
      gotoSopDetails(revisionId);
    }
  };

  const checkCategoryNameToShow = () => {
    let categoryBadge: string;
    if (isEdit) {
      categoryBadge = categoryNameToShow;
    } else {
      if (newCategoryName !== "") {
        categoryBadge = newCategoryName;
      } else {
        categoryBadge = categoryName;
      }
    }
    return categoryBadge;
  };

  const ResetEditedSops = (isEditReset: boolean) => {
    if (
      roleValidator(userState["role"]) === RegTechWriter &&
      token !== null &&
      isEdit === true
    ) {
      setIsLoading(true);
      const url = RESET_EDITED_SOP + sopId + "/" + revisionId;
      axios
        .put<GetResponse>(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (
            res.status === 200 &&
            res.data.isSuccess &&
            res.data.result != null &&
            !res.data.result.sopEdited
          ) {
            if (isEditReset === true) {
              gotoSopDetails(revisionId);
            }
          } else if (res.status === 200 && !res.data.isSuccess) {
            SwalBox(res.data.responseMessage, "error");
          } else {
            SwalBox("Something went wrong!", "error");
          }
        })
        .catch((exception) => {
          SwalBox(exception.message, "error");
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (RoleValidatorForCancelEmployeeBadging) {
      gotoSopDetails(revisionId);
    }
  };

  const DeleteButton = (): JSX.Element => {
    if (roleValidator(userState["role"]) !== RegTechWriter) {
      return <div className="ms-3 pt-4 CancelButton">Delete</div>;
    } else {
      return <></>;
    }
  };

  const BackIconButton = (): JSX.Element => {
    return (
      <Tooltip
        title={"Back"}
        placement="top"
        arrow>
        <i
          className="bi bi-arrow-left-short sop-iconBack"
          onClick={() => {
            handleBack();
          }}
        ></i>
      </Tooltip>
    );
  };
  const tooltipStyleClass =
    sopTitle.trim().length > 15
      ? "TitleWrapWithTooltipForSop"
      : "TitleWrapForSop";
  return (
    <div className="sop-dashboard-container">
      <div className="PageWrapper SopDetailsWrapper">
        <div className="container sopWrapText">
          <div className="d-flex row">
            <div className="d-flex col-6">
              <div className="titleBox1">
                <BackIconButton />
                <AddTooltip
                  styleclass={`${tooltipStyleClass} page-title-sop`}
                  value={String(sopTitle).trim()}
                  len={15}
                />
              </div>
              <div className="statusName mt-3">{blankInPublishedState}</div>
            </div>
            <div className="d-flex col-6 action-alginment">
              {isLoading && <Loader />}

              <DeleteButton />
              {isUserDashboard && (
                <div className="ms-3">
                  <BellIcon />
                </div>
              )}
            </div>
          </div>
          <div className="bottom-line"></div>
          <div className="d-flex">
            <div className="pt-4 dates-wrapper">
              <h6>
                Effective date:{" "}
                {sopStatus === "Published"
                  ? moment(effectiveDate).format("MM/DD/YYYY")
                  : "-"}
              </h6>
            </div>
            <div className="pt-4 ms-5 dates-wrapper">
              <h6>
                Last published on:{" "}
                {sopStatus === "Published"
                  ? moment(revisedDate).format("MM/DD/YYYY")
                  : "-"}
              </h6>
            </div>

            <div className="ms-auto pt-2 ms-5">
              <Button
                className="SaveDraftButton"
                variant="contained"
                onClick={() => {
                  if (
                    sopStatus === "Published" &&
                    roleValidator(userState["role"]) !== RegTechWriter
                  ) {
                    verifyNoChanges();
                  } else {
                    updateSOP();
                  }
                }}
              >
                Save
              </Button>
            </div>
            {isEdit && (<div
              className="ms-4 pt-4 CancelButton"
              onClick={() => {
                ResetEditedSops(true);
              }}
            >
              Cancel
            </div>)}
          </div>
          <div className="TableBox d-flex mt-5">
            <div className="col-sm-2">
              <div className="LeftGreyBox">
                <h5>Jurisdiction</h5>
                <h5>License Type</h5>
                <h5>SOP version</h5>
                <h5 className="no-border">Category</h5>
              </div>
            </div>
            <div className="col-sm-10">
              <div className="RightWhiteBox">
                <h5>
                  {isEdit ? jurisdiction : `${city}, ${county}, ${state}`}
                </h5>
                <h5>{licenseTypeName}</h5>
                <h5>{isEdit ? sopVersionData : "1.0"}</h5>
                <h5 className="no-border">{checkCategoryNameToShow()}</h5>
              </div>
            </div>
          </div>
          <h4 className="title55 mt-5">Introduction</h4>
          <div className="row">
            <JoditEditor
              ref={introduction}
              value={introContent}
              config={config}
              onBlur={(newContent) => setIntroContent(newContent)}
            />
          </div>
          <h4 className="title55 mt-5">Scope</h4>
          <div className="row">
            <JoditEditor
              ref={scope}
              value={scopeContent}
              config={config}
              onBlur={(newScopeContent) => setScopeContent(newScopeContent)}
            />
          </div>
          <h4 className="title55 mt-5">Procedure</h4>
          <div className="row">
            <JoditEditor
              ref={procedure}
              value={procedureContent}
              config={config}
              onBlur={(newProcedureContent) =>
                setProcedureContent(newProcedureContent)
              }
            />
          </div>
          <h4 className="title55 mt-5">References</h4>
          <div className="row">
            <JoditEditor
              ref={references}
              value={referencesContent}
              config={config}
              onBlur={(newReferencesContent) =>
                setReferencesContent(newReferencesContent)
              }
            />
          </div>
          {showToaster && <SuccessToaster message="SOP Saved" />}
          <DialogWithTwoBtn
            dialogOpen={dialogOpen}
            dialogSetOpen={setDialogOpen}
            message={
              "There are no changes made to the SOP. Do you still want to continue?"
            }
            yesBtnClick={() => {
              setDialogOpen(false);
              updateSOP();
            }}
            noBtnClick={() => {
              setDialogOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default SopEmployeeBadging;
