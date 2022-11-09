import React, { useEffect, useRef, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BellIcon from "../../../components/Icons/BellIcon";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import axios from "axios";
import parse from "html-react-parser";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import moment from "moment";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";

import Loader from "../../../components/Loader";
import SuccessToaster from "../../../components/SuccessToaster";
import SwalBox from "../../../components/SwalBox";
import { GetResponse } from "../../../model/model";
import { ValidateRole } from "../../../utilities/ValidateRole";
import {
  GET_SOP_DETAILS,
  GET_USER_SOP_DETAILS,
  PUBLISH_WRITER_SOP,
  CANCEL_DRAFT_SOP,
  UPDATE_SOP_STATUS_INREVIEW,
  PUBLISH_APPROVE_SOP,
  UPDATE_SOP_NEEDS_REVISE,
  SOP_EDITEDBY,
} from "../../../networking/httpEndPoints";
import {
  RegTechWriter,
  SystemAdministrator,
  DirectorOfCompliance,
  ComplianceAnalyst,
  DirectorOfRetailOperations,
  RegTechAdmin,
} from "../../../utilities/constants";
import { decodeToken } from "../../../utilities/decodeToken";
import historyVaribaleChecker from "../../../utilities/historyVariableChecker";
import { roleValidator } from "../../../utilities/roleValidator";
import ReviseAlertDialog from "../SOP/ReviseAlertDialogBox";
import SOPAlertDialog from "../SOP/SOPAlertDialogBox";
import PublishAlertDialog from "./PublishDialogBox";

type ContainerType = {
  activeLink?: boolean;
};
const LinkWrapper = styled.a<ContainerType>`
  font-weight: 600;
  color: ${(props) => (!props.activeLink ? "#001e46" : "#233ce6")};
  text-decoration: none;
  margin-left: 20px;
  align-self: center;
  cursor: pointer;
  :hover {
    color: #233ce6 !important;
  }
`;
interface SopDetailsResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface AuthRoleType {
  user: {
    role?: string;
    organizationId?: number | null;
  };
}

const SopDetails: React.FC = () => {
  const userState: any = useSelector((state: AuthRoleType) => state.user);
  const accordionRef = useRef<React.ElementRef<typeof AccordionSummary>>(null);
  const introRef = useRef(null);
  const scopeRef = useRef(null);
  const procedureRef = useRef(null);
  const scrollToRef = (ref: any) => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const executeIntroScroll = () => scrollToRef(introRef);
  const executeScopeRef = () => scrollToRef(scopeRef);
  const executeProcedureRef = () => scrollToRef(procedureRef);
  const history = useHistory();

  let sopId = historyVaribaleChecker("sopId", history);
  let statusName = historyVaribaleChecker("status", history);
  const isUserDashboard = historyVaribaleChecker("isUser", history);
  const revisionId = historyVaribaleChecker("revisionId", history);

  const isRoleCheckForCompliance = () => {
    if (
      (roleValidator(userState["role"]) === ComplianceAnalyst ||
        roleValidator(userState["role"]) === DirectorOfRetailOperations) &&
      (sopStatus === "Saved" || sopStatus === "saved")
    ) {
      return true;
    }
    return false;
  };

  const [data, setData] = React.useState<any>({
    sopId: 0,
    jurisdiction: "",
    licenseType: "",
    sopVersion: "",
    category: "",
    introduction: "",
    scope: "",
    procedure: "",
    references: "",
    label: "",
    revisionHistory: [
      {
        revisionId: "",
        documentRevision: "",
        authorName: "",
        publishedDate: "",
        effectiveDate: "",
        description: "",
      },
    ],
    effectiveDate: new Date(),
    publishedDate: new Date(),
  });

  const [StatusCode, setStatusCode] = React.useState(1);
  const token = localStorage.getItem("user");
  const [description, setDescription] = React.useState("");
  const [reviseDescription, setReviseDescription] = React.useState("");
  const [reviseAlertOpen, setReviseAlertOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [confirmationAlertOpen, setConfirmationAlertOpen] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    React.useState(false);
  const [downlodModalIsVisible, setDownloadModalIsVisible] =
    React.useState(false);
  const [
    confirmationReviseModalIsVisible,
    setConfirmationReviseModalIsVisible,
  ] = React.useState(false);

  const [sopStatus, setSopStatus] = React.useState(statusName);
  const [showToaster, setShowToaster] = useState(false);
  const [showApprovalToaster, setShowApprovalToaster] = useState(false);
  const [serverResponseMessage, setServerResponseMessage] = useState("");
  const [showCancelToaster, setShowCancelToaster] = useState(false);
  const userData = decodeToken(token);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [changesText, setChangesText] = useState("");
  const [isTextEmpty, setIsTextEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const roleCheck = ValidateRole([
    SystemAdministrator,
    DirectorOfCompliance,
    ComplianceAnalyst,
    DirectorOfRetailOperations,
  ]);
  const roleCheckForCompliance = isRoleCheckForCompliance();

  useEffect(() => {
    setServerResponseMessage("");
    setData({
      sopId: 0,
      jurisdiction: "",
      licenseType: "",
      sopVersion: "",
      category: "",
      introduction: "",
      scope: "",
      procedure: "",
      references: "",
      label: "",
      revisionHistory: [
        {
          revisionId: "",
          documentRevision: "",
          authorName: "",
          publishedDate: "",
          effectiveDate: "",
          description: "",
        },
      ],
      effectiveDate: new Date(),
      publishedDate: new Date(),
    });
    if (statusName === "Saved") {
      setStatusCode(1);
    } else if (statusName === "Published") {
      setStatusCode(2);
    } else if (statusName === "Review") {
      setStatusCode(3);
    } else if (statusName === "Cancelled") {
      setStatusCode(4);
    } else {
      setStatusCode(1);
    }
  }, [sopId, StatusCode]);
  useEffect(() => {
    fetchSopData();
  }, []);
  const fetchSopData = () => {
    const apiUrl = isUserDashboard ? GET_USER_SOP_DETAILS : GET_SOP_DETAILS;
    setIsLoading(true);
    const revId = historyVaribaleChecker("revisionId", history);
    axios
      .get<SopDetailsResponse>(`${apiUrl}${sopId}/${revId}`, {
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
          setData(res.data.result);
          const responseSopStatus = res.data.result.sopStatus;
          const displaySopStatus =
            responseSopStatus && responseSopStatus.toUpperCase() === "IN-REVIEW"
              ? "Review"
              : responseSopStatus;
          setSopStatus(displaySopStatus);
          statusName = displaySopStatus;
        }
      })
      .catch(() => setIsLoading(false));
  };
  const handleSubmitApproval = () => {
    const payload = {
      sopID: sopId,
      descriptionChanges: changesText.trim(),
    };
    if (changesText.trim().length === 0) {
      setIsTextEmpty(true);
    } else {
      if (token !== null) {
        setShowApproveDialog(false);
        setIsLoading(true);
        axios
          .put<GetResponse>(UPDATE_SOP_STATUS_INREVIEW, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            setIsLoading(false);
            if (res.status === 200 && res.data.isSuccess) {
              setShowApproveDialog(false);
              setShowApprovalToaster(true);
              setSopStatus("review");
              sopId = res.data.result.sopId;
              statusName = "review";
              setChangesText("");
              setTimeout(() => {
                setShowApprovalToaster(false);
              }, 3000);
            } else if (res.status === 200 && !res.data.isSuccess) {
              SwalBox(res.data.responseMessage, "error");
            } else {
              SwalBox("Something went wrong, please try again later", "error");
            }
          })
          .catch(() => {
            setIsLoading(false);
            SwalBox("Something went wrong, please try again later", "error");
          });
      }
    }
  };

  const handleDownloadPdf = async () => {
    const revisionDetail = document.getElementById("revisionAccordionDetail")!;

    let wasAccordianHidden: boolean;

    if (
      accordionRef != null &&
      accordionRef.current != null &&
      window.getComputedStyle(revisionDetail).visibility === "hidden"
    ) {
      wasAccordianHidden = true;
      accordionRef.current.click();
    }

    setTimeout(function () {
      getPDF(wasAccordianHidden);
      setDownloadModalIsVisible(true);
    }, 500);

    setTimeout(() => {
      setDownloadModalIsVisible(false);
    }, 3000);
  };

  const correctBlackPixels = (imgData: Uint8ClampedArray) => {
    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] < 255) {
        imgData[i] = 255;
        imgData[i + 1] = 255;
        imgData[i + 2] = 255;
        imgData[i + 3] = 255;
      }
    }
  };

  const getPDF = (wasAccordianHidden: boolean) => {
    const HTML_Width = document.getElementById("container")!.offsetWidth;
    const HTML_Height = document.getElementById("container")!.offsetHeight;
    const top_left_margin = 15;
    const PDF_Width = HTML_Width + top_left_margin * 2;
    const PDF_Height = PDF_Width * 1.5 + top_left_margin * 2;

    const footerHeight = 40;
    const h = PDF_Width * 1.5 - footerHeight;
    const ratio = HTML_Height / h;
    const roundedRatio = ratio.toPrecision(2);
    const ceiledRatio = Math.round(Number.parseFloat(roundedRatio));
    const totalPDFPages = ceiledRatio;

    html2canvas(document.getElementById("container")!, {
      allowTaint: true,
    }).then(function (canvas) {
      const ctx = canvas.getContext("2d")!;
      const userGuid = userData.UserGuid;
      const disclaimerFirst =
        "©Copyright " +
        new Date().getFullYear() +
        ", Chorus Cannabis Compliance and property of Chorus Cannabis Compliance. ";
      const disclaimerSecond =
        "You may not alter or remove any copyright notice. Use of this document is restricted to use of Chorus Cannabis Compliance’s current customers.";
      const footerText = userGuid + "\n" + disclaimerFirst + disclaimerSecond;
      const pdf = new jsPDF("p", "pt", [canvas.width, PDF_Height]);
      const footer = pdf.splitTextToSize(footerText, canvas.width - 20);

      const firstPageImage = ctx.getImageData(
        top_left_margin,
        top_left_margin,
        canvas.width,
        PDF_Height
      );
      correctBlackPixels(firstPageImage.data);
      pdf.addImage(
        firstPageImage,
        "JPG",
        top_left_margin,
        top_left_margin,
        canvas.width,
        PDF_Height - 70
      );
      pdf.setFontSize(15);
      pdf.text(footer, 20, PDF_Height - 40);
      let nextPageMargin = PDF_Height;
      for (let i = 1; i <= totalPDFPages; i++) {
        const pageImage = ctx.getImageData(
          top_left_margin,
          nextPageMargin,
          canvas.width,
          PDF_Height
        );
        if (pageImage.data.some((channel) => channel !== 0) === false) {
          break;
        }

        pdf.addPage();
        correctBlackPixels(pageImage.data);
        pdf.addImage(
          pageImage,
          "JPG",
          top_left_margin,
          -top_left_margin,
          canvas.width,
          PDF_Height - 70
        );
        pdf.text(footer, 20, PDF_Height - 40);
        nextPageMargin += PDF_Height;
      }

      const loc = data.jurisdiction.split(",").join("_");
      const title = data.sopTitle.split(" ").join("_");
      const intialLicenses =
        data.licenseType.substring(0, 1) +
        data.licenseType.substring(8, 10).replace(/ /g, "");
      const category = data.category.split(" ").join("_");
      const fileName = [
        title,
        loc,
        intialLicenses,
        category,
        data.sopVersion,
      ].join("_");
      pdf.save(fileName + ".pdf");
    });

    if (
      accordionRef != null &&
      accordionRef.current != null &&
      wasAccordianHidden === true
    ) {
      accordionRef.current.click();
    }
  };

  const RevisionDateRender = (): JSX.Element => {
    if (!data.isUserSop) {
      return (
        <span>
          Published on:{" "}
          <span className="datename">
            {data.publishedDate !== null
              ? moment(data.publishedDate).format("MM/DD/YYYY")
              : "-"}
          </span>
        </span>
      );
    } else {
      return (
        <span>
          Revision approval date:{" "}
          <span className="datename">
            {data.approvalDate !== null
              ? moment(data.approvalDate).format("MM/DD/YYYY")
              : "-"}
          </span>
        </span>
      );
    }
  };
  const submitPublishSOP = () => {
    if (effectiveDate !== null) {
      const date = new Date(effectiveDate).toDateString();
      const params = {
        sopId: sopId,
        descriptionChanges: description,
        effectiveDate: moment(date).format("MM/DD/YYYY"),
      };
      if (token !== null) {
        setIsLoading(true);
        axios
          .post<GetResponse>(PUBLISH_WRITER_SOP, params, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            setIsLoading(false);
            if (
              (res.status === 200 || res.status === 201) &&
              res.data.isSuccess
            ) {
              setConfirmationModalIsVisible(true);
              setSopStatus("Published");
              fetchSopData();
              statusName = "Published";
              setTimeout(() => {
                setConfirmationModalIsVisible(false);
              }, 3000);
            } else if (res.status === 201 && !res.data.isSuccess) {
              setIsLoading(false);
              SwalBox(res.data.responseMessage, "error");
              setDescription("");
              setEffectiveDate(null);
            } else {
              setIsLoading(false);
              SwalBox("Something went wrong!", "error");
            }
          })
          .catch(() => {
            setIsLoading(true);
            SwalBox("Something went wrong!", "error");
          });
      }
    }
  };

  const approveAndPublishSOP = () => {
    if (token !== null) {
      setIsLoading(true);
      const url = PUBLISH_APPROVE_SOP + sopId;
      axios
        .put<GetResponse>(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setIsLoading(false);
          if (res.status === 200 && res.data.isSuccess) {
            setServerResponseMessage(res.data.responseMessage);
            setConfirmationAlertOpen(false);
            setShowToaster(true);
            fetchSopData();
            setTimeout(() => {
              setShowToaster(false);
            }, 3000);
          } else if (res.status === 200 && !res.data.isSuccess) {
            errorMassage(res.data.responseMessage);
          } else {
            errorMassage("Something went wrong!");
          }
        })
        .catch((exception) => {
          errorMassage(exception.message);
          setConfirmationAlertOpen(false);
        })
        .finally(() => {
          setConfirmationAlertOpen(false);
          setIsLoading(false);
        });
    }
  };

  const submitReviseRequest = () => {
    const params = {
      sopID: sopId,
      revisionNotes: reviseDescription,
    };

    if (token !== null) {
      setIsLoading(true);
      axios
        .put<GetResponse>(UPDATE_SOP_NEEDS_REVISE, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setIsLoading(false);
          if (
            (res.status === 200 || res.status === 201) &&
            res.data.isSuccess
          ) {
            setConfirmationReviseModalIsVisible(true);
            setSopStatus("Draft");
            fetchSopData();
            setTimeout(() => {
              setConfirmationReviseModalIsVisible(false);
            }, 3000);
          } else if (res.status === 201 && !res.data.isSuccess) {
            Swal.fire({
              text: res.data.responseMessage,
              confirmButtonText: "OK",
              icon: "error",
            });
          } else {
            Swal.fire({
              text: "Something went wrong!",
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => setIsLoading(false));
    }
  };

  const handleCancelSOPClick = () => {
    setConfirmationAlertOpen(true);
  };

  const handleAlertYes = async () => {
    if (token !== null) {
      setIsLoading(true);
      const url = CANCEL_DRAFT_SOP + sopId;
      axios
        .put<GetResponse>(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setIsLoading(false);
          if (res.status === 200 && res.data.isSuccess) {
            setServerResponseMessage(res.data.responseMessage);
            setConfirmationAlertOpen(false);
            setShowCancelToaster(true);
            setTimeout(() => {
              setShowCancelToaster(false);
              history.push("/sop");
            }, 3000);
          } else if (res.status === 200 && !res.data.isSuccess) {
            errorMassage(res.data.responseMessage);
          } else {
            errorMassage("Something went wrong!");
          }
        })
        .catch((exception) => {
          errorMassage(exception.message);
          setConfirmationAlertOpen(false);
        })
        .finally(() => {
          setConfirmationAlertOpen(false);

          setIsLoading(false);
        });
    }
  };

  const errorMassage = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      icon: "error",
    });
  };

  const handleAlertNo = () => {
    setConfirmationAlertOpen(false);
  };

  const CancelSOPButton = () => {
    if (
      roleCheck &&
      sopStatus.toString().toLowerCase() === "saved" &&
      data.sopVersion !== "" &&
      data.sopVersion.split(".")[1].trim() !== "0"
    )
      return (
        <LinkWrapper onClick={() => handleCancelSOPClick()}>
          Cancel SOP
        </LinkWrapper>
      );
  };
  const gotoSopEdit = () => {
    return history.push("/chorus-sop", {
      sopId: sopId,
      sopTitle: data.sopTitle,
      jurisdiction: data.jurisdiction,
      licenseName: data.licenseType,
      category: data.category,
      sopVersion: data.sopVersion,
      isEdit: true,
      isUserDashboard: isUserDashboard,
      revisionId: revisionId,
      filterText: history.location.state
        ? history.location.state.filterText
        : null,
      licenseFilterNumber: history.location.state
        ? history.location.state.licenseFilter
        : null,
      categoryFilterNumber: history.location.state
        ? history.location.state.categoryFilter
        : null,
      searchFilterText: history.location.state
        ? history.location.state.searchTextItem
        : null,
    });
  };

  const ViewEditButton = (): JSX.Element => {
    if (
      (roleCheck && data.sopVersion != null && data.sopVersion % 1 === 0) ||
      roleValidator(userState["role"]) === RegTechWriter ||
      (roleCheckForCompliance && data.sopVersion % 1 !== 0) ||
      (roleCheck &&
        (sopStatus === "Saved" || sopStatus === "saved") &&
        data.sopVersion % 1 !== 0 &&
        data.createdBy === parseInt(userData.UserId)) ||
      (roleCheck &&
        (sopStatus === "published" || sopStatus === "Published") &&
        data.sopVersion != null &&
        data.sopVersion % 1 !== 0)
    ) {
      return (
        <>
          <Button
            variant="outlined"
            className="float-right edit-btn-sop-details"
            onClick={() => {
              SopIsEditable();
            }}
          >
            Edit
          </Button>
        </>
      );
    } else {
      return <></>;
    }
  };

  const SysAdmin = () => {
    if (
      (roleValidator(userState["role"]) === SystemAdministrator ||
        roleValidator(userState["role"]) === DirectorOfCompliance) &&
      (sopStatus === "review" || sopStatus === "Review")
    ) {
      approveAndPublishSOP();
    } else if (roleValidator(userState["role"]) === RegTechWriter) {
      setAlertOpen(true);
    } else {
      setAlertOpen(false);
    }
  };

  const ShowPublishButton = (): JSX.Element => {
    let isDisabled = true;
    if (
      (roleValidator(userState["role"]) === RegTechWriter &&
        sopStatus === "Saved") ||
      ((roleValidator(userState["role"]) === SystemAdministrator ||
        roleValidator(userState["role"]) === DirectorOfCompliance) &&
        (sopStatus === "review" || sopStatus === "Review"))
    ) {
      isDisabled = false;
    }
    if (
      roleValidator(userState["role"]) === RegTechWriter ||
      ((roleValidator(userState["role"]) === SystemAdministrator ||
        roleValidator(userState["role"]) === DirectorOfCompliance) &&
        (sopStatus === "review" || sopStatus === "Review"))
    ) {
      return (
        <>
          <Button
            variant="contained"
            className="float-right"
            style={{
              height: "50px",
              width: "120px",
              fontSize: "14px",
            }}
            disabled={isDisabled}
            onClick={() => {
              SysAdmin();
            }}
          >
            Publish
          </Button>
        </>
      );
    } else {
      return <></>;
    }
  };

  const ShowCancelApproveCancelButton = (): JSX.Element => {
    if (
      roleCheck &&
      sopStatus === "Saved" &&
      data.sopVersion % 1 !== 0 &&
      data.createdBy === parseInt(userData.UserId)
    ) {
      return (
        <>
          <Button
            variant="contained"
            className="float-right SaveButton"
            onClick={() => {
              setShowApproveDialog(true);
            }}
          >
            Submit For Approval
          </Button>
        </>
      );
    } else {
      return <></>;
    }
  };

  const NeedRevisePublishButton = (): JSX.Element => {
    if (
      (roleValidator(userState["role"]) === SystemAdministrator ||
        roleValidator(userState["role"]) === DirectorOfCompliance) &&
      (sopStatus === "review" || sopStatus === "Review")
    ) {
      return (
        <>
          <Button
            variant="outlined"
            className="float-right EditButton"
            onClick={() => {
              setReviseAlertOpen(true);
            }}
            style={{
              height: "50px",
              width: "112px",
              marginRight: "20px",
              marginLeft: "20px",
            }}
          >
            Needs Revise
          </Button>
        </>
      );
    } else {
      return <></>;
    }
  };

  const DownloadSopButton = (): JSX.Element => {
    if (roleValidator(userState["role"]) !== RegTechAdmin) {
      return (
        <>
          <div data-html2canvas-ignore className="pt-4 ms-3">
            <DownloadForOfflineIcon
              className="downloadIcon"
              onClick={handleDownloadPdf}
            />
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };

  const SopIsEditable = () => {
    if (roleValidator(userState["role"]) === RegTechWriter && token !== null) {
      setIsLoading(true);
      const url = SOP_EDITEDBY + sopId + "/" + revisionId;
      axios
        .put<GetResponse>(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data.isSuccess) {
            const resultResponse = res.data.result;
            if (resultResponse != null && resultResponse.sopEdited) {
              gotoSopEdit();
            }
          } else if (res.status === 200 && !res.data.isSuccess) {
            SwalBox(res.data.responseMessage, "info");
          } else {
            SwalBox("Something went wrong!", "error");
          }
        })
        .catch((exception) => {
          SwalBox(exception.message, "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      gotoSopEdit();
    }
  };

  const DeleteButton = (): JSX.Element => {
    if (roleValidator(userState["role"]) !== RegTechWriter) {
      return <strong className="headingTitle">Delete</strong>;
    } else {
      return <></>;
    }
  };

    const JuridictiondataElement = (): JSX.Element => {
        const juridictionData = data.jurisdiction.split(',');
        if (data.sopLevel === "county") {
            return <h5>{juridictionData[0]},<span className="text-blue">{juridictionData[1]}</span>,{juridictionData[2]}</h5>;

        } else {
            return <h5><span className="text-blue">{juridictionData[0]}</span>,{juridictionData[1]},{juridictionData[2]}</h5>;

        }
    };
  const ModalToasterControls = (): JSX.Element => {
    if (confirmationModalIsVisible) {
      return <SuccessToaster message="SOP Published Succesfully" />;
    }
    if (downlodModalIsVisible) {
      return <SuccessToaster message="SOP Download Initiated" />;
    }
    return <></>;
  };

  const ToasterControls = (): JSX.Element => {
    if (confirmationModalIsVisible) {
      return <SuccessToaster message="SOP Published" />;
    }
    if (showToaster) {
      return <SuccessToaster message="SOP Published" />;
    }
    if (showApprovalToaster) {
      return <SuccessToaster message="SOP Submitted for Approval" />;
    }
    if (confirmationReviseModalIsVisible) {
      return <SuccessToaster message="Notification to revise sent" />;
    }
    if (showCancelToaster)
      return <SuccessToaster message={serverResponseMessage} />;
    return <></>;
  };

  return (
    <div className="sop-dashboard-container">
      <div className="SopDetailsWrapper">
        <div className="container sopWrapText" id="container">
          <div className="d-flex row">
            <div className="d-flex col-6">
              <div className="titleBox1">
                <i
                  className="bi bi-arrow-left-short sop-iconBack"
                  data-html2canvas-ignore
                  onClick={() =>
                    history.push("/sop", {
                      filterText: historyVaribaleChecker("filterText", history),
                      licenseFilterNumber: historyVaribaleChecker(
                        "licenseFilter",
                        history
                      ),
                      categoryFilterNumber: historyVaribaleChecker(
                        "categoryFilter",
                        history
                      ),
                      searchFilterText: historyVaribaleChecker(
                        "searchTextItem",
                        history
                      ),
                    })
                  }
                ></i>
                {String(data.sopTitle).length > 15 && (
                  <Tooltip title={data.sopTitle} placement="top" arrow>
                    <div
                      className="TitleWrapWithTooltipForSop page-title-sop"
                      id="sop-detail-page-title-tooltip"
                    >
                      {`${data.sopTitle.trim().slice(0, 15)}...`}
                    </div>
                  </Tooltip>
                )}
                {String(data.sopTitle).length <= 15 && (
                  <div
                    className="TitleWrapForSop page-title-sop"
                    id="sop-detail-page-title"
                  >
                    {data.sopTitle}
                  </div>
                )}
              </div>
              <div className="pt-4 statusName">{sopStatus}</div>
            </div>
            <div className="d-flex col-6 justify-content-between">
              {isLoading && <Loader />}
              <div className="ms-auto pt-4" data-html2canvas-ignore>
                <strong onClick={executeIntroScroll} className="headingTitle">
                  Introduction
                </strong>
              </div>
              <div className="pt-4 ms-3" data-html2canvas-ignore>
                <strong onClick={executeScopeRef} className="headingTitle">
                  Scope
                </strong>
              </div>
              <div className="pt-4 ms-3" data-html2canvas-ignore>
                <strong onClick={executeProcedureRef} className="headingTitle">
                  Procedure
                </strong>
              </div>
              <DownloadSopButton />

              {isUserDashboard && (
                <div className="ms-3" data-html2canvas-ignore>
                  <BellIcon />
                </div>
              )}
            </div>
          </div>
          <div className="sopdetail-bottom-line"></div>
          <div className="d-flex mt-5 align-items-center">
            <div className="d-flex datesBox">
              <h6>
                Effective date:{" "}
                {data.effectiveDate != null
                  ? moment(data.effectiveDate).format("MM/DD/YYYY") || "-"
                  : ""}
              </h6>
              <h6>
                Last published on:{" "}
                {data.publishedDate != null
                  ? moment(data.publishedDate).format("MM/DD/YYYY") || "-"
                  : ""}
              </h6>
            </div>

            <div data-html2canvas-ignore className="d-flex ms-auto">
              <ViewEditButton />
              <NeedRevisePublishButton />
              <ShowPublishButton />

              <ShowCancelApproveCancelButton />
              {CancelSOPButton()}
            </div>
          </div>

          <div className="TableBox d-flex mt-4">
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
                <JuridictiondataElement/>
                <h5>{data.licenseType}</h5>
                <h5>{data.sopVersion}</h5>
                <h5 className="no-border">{data.category}</h5>
              </div>
            </div>
          </div>

          <div className="ContentBoxx mt-5">
            <h4 className="title55" ref={introRef}>
              Introduction
            </h4>
            {data.introduction != null ? (
              <div>{parse(String(data.introduction))}</div>
            ) : (
              ""
            )}
          </div>
          <div className="ContentBoxx">
            <h4 className="title55" ref={scopeRef}>
              Scope
            </h4>
            {data.introduction != null ? (
              <div>{parse(String(data.scope))}</div>
            ) : (
              ""
            )}
          </div>
          <div className="ContentBoxx">
            <h4 className="title55" ref={procedureRef}>
              Procedure
            </h4>

            {data.procedure != null ? (
              <div>{parse(String(data.procedure))}</div>
            ) : (
              ""
            )}
          </div>
          <div className="ContentBoxx borderBlue mt-5">
            <h4 className="title55">References</h4>
            <div>
              {data.references != null ? (
                <div>{parse(String(data.references))}</div>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="ContentBoxx mt-5">
            <Accordion>
              <div className="border-gray">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon data-html2canvas-ignore />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  ref={accordionRef}
                >
                  <h4 className="title55">Revision History</h4>
                </AccordionSummary>
              </div>
              <AccordionDetails id="revisionAccordionDetail">
                <div className="AccordionDetailsBox">
                  {data.revisionHistory.map((item: any) => {
                    return (
                      <>
                        <div className="AccordionDetailsBoxHeading mb-3">
                          <span className="text-blue">
                            Document #: {item.documentRevision}
                          </span>
                          <span>{item.authorName}</span>
                          <RevisionDateRender />
                        </div>
                        <p className="border-gray">{item.description}</p>
                      </>
                    );
                  })}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
        <br />
        <br />
        <br />
        <PublishAlertDialog
          alertOpen={alertOpen}
          description={description}
          setDescription={setDescription}
          effectiveDate={effectiveDate}
          setEffectiveDate={setEffectiveDate}
          handleAlertSave={() => {
            setAlertOpen(false);
            submitPublishSOP();
          }}
          handleAlertCancel={() => {
            setAlertOpen(false);
          }}
        />
        <ModalToasterControls />
        <SOPAlertDialog
          sopAlertOpen={confirmationAlertOpen}
          handleAlertYes={handleAlertYes}
          handleAlertNo={handleAlertNo}
          alertMessage={
            <div className="d-flex justify-content-center">
              <p>Are you sure you want to cancel this SOP?</p>
            </div>
          }
        />
        <Dialog
          open={showApproveDialog}
          className="d-flex justify-content-center flex-column sop-dashboard-container form-container"
        >
          <DialogTitle>
            <div className="my-3 d-flex justify-content-center dialogTop">
              Enter description changes
            </div>
          </DialogTitle>
          <DialogContent className="dialogContent DialogContentWrapper description-changes-dialog">
            <TextField
              hiddenLabel
              multiline
              rows={8}
              variant="filled"
              className={"input-form form-control"}
              placeholder="Enter changes(maximum limit, 1000 characters)"
              type="text"
              onChange={(e: any) => {
                setIsTextEmpty(false);
                setChangesText(e.target.value);
              }}
              InputProps={{
                style: { fontSize: 16, background: "#f9f9f9" },
              }}
              inputProps={{ maxLength: 1000 }}
            />
          </DialogContent>
          <DialogActions>
            <div className="d-flex justify-content-between align-items-center ButtonsWrapper">
              <Button
                variant="outlined"
                className="PopupCancelButton"
                onClick={() => {
                  setIsTextEmpty(false);
                  setChangesText("");
                  setShowApproveDialog(false);
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                className="ApprovalSubmitButton"
                onClick={() => {
                  handleSubmitApproval();
                }}
              >
                Submit
              </Button>
            </div>
          </DialogActions>
          <div>
            {isTextEmpty && <div className="ErrorBox">Text is required</div>}
          </div>
        </Dialog>
        <ToasterControls />
        <ReviseAlertDialog
          alertOpen={reviseAlertOpen}
          description={description}
          setDescription={setReviseDescription}
          handleAlertSave={() => {
            setReviseAlertOpen(false);
            submitReviseRequest();
          }}
          handleAlertCancel={() => {
            setReviseAlertOpen(false);
          }}
        />
        <ToasterControls />
      </div>
    </div>
  );
};

export default SopDetails;
