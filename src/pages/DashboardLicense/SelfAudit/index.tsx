import React, { useEffect, useState, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from "@mui/icons-material/Info";
import { Backdrop, CircularProgress, InputLabel } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { styled as muiStyled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import axios from "axios";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";
import InputBox from "../../../components/InputBox";
import Button from "../../../components/Button";

import {
  GET_SELF_AUDIT_QUESTIONS,
  SAVE_SELF_AUDIT_QUESTIONS,
  CANCEL_AUDIT,
} from "../../../networking/httpEndPoints";
import { decodeToken } from "../../../utilities/decodeToken";
import CancelAuditAlertDialog from "./CancelAuditAlertDialog";
import Pagination from "./pagination";
import ProgressBar from "./progressBar";
import SelfAuditCompleted from "./SelfAuditCompleted";
import ViewMoreWrapper from "./ViewMoreWrapper";

const useStyles = makeStyles(() => ({
  notesText: {
    height: "6.25rem !important",
    border: "none",
  },
}));

interface Response {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
const CustomTooltip = muiStyled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#001e46",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#001e46",
    color: "#FFFFFF",
    fontSize: theme.typography.pxToRem(12),
    marginTop: "0.5rem !important",
  },
}));
const SelfAudit: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const myRef = useRef(null);
  const scrollToRef = (ref: any) => {
    ref.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const executeScroll = () => scrollToRef(myRef);
  const [licenseId] = useState(
    history.location.state ? history.location.state.licenseId : null
  );
  const [licenseNumber] = useState(
    history.location.state ? history.location.state.licenseNumber : null
  );
  const [auditType] = useState(
    history.location.state ? history.location.state.type : null
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [, setAllQuestions] = useState<any[]>([]);
  const [categoryWiseQues, setCategoryWiseQues] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [perPageProgress, setPerPageProgress] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalClose, setModalClose] = useState(false);
  const [cancelAuditAlert, setCancelAuditAlert] = useState(false);
  const [modalData, setModalData] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [notAnsweredModal, setNotAnsweredModal] = useState(false);
  const [oneAnswered, setOneAnswered] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const token = localStorage.getItem("user");
  const userData = decodeToken(token);
  const [counter, setCounter] = useState(1);
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPerPageProgress(progressCount * (counter + 1));
      setCurrentCategory(currentCategory + 1);
      setCounter(counter + 1);
    }
  };
  const handlePagination = (page: number) => {
    setCurrentPage(page);
    setCurrentCategory(page);
    if (page !== 0) {
      setPerPageProgress(progressCount * (page+1));
    } else {
      setPerPageProgress(progressCount);
    }
    setCounter(page + 1);
  };
  const getSelfAuditQuestions = () => {
    setLoading(true);
    axios
      .get<GetResponse>(`${GET_SELF_AUDIT_QUESTIONS}?licenseId=${licenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          const dataPacket: any = [];
          new Promise((resolve: any) => {
            setCategories(res.data.result.categories);
            setTotalRecords(res.data.result.questions.length);
            const categoryData = res.data.result.categories;
            const questionData = res.data.result.questions;
            const newQuestionData = questionData.map((v: any) => ({
              ...v,
              isAnswered: false,
              selectedAnswer: "",
              notesEntered: "",
              isSubQuestion: false,
              showSubQuestion: false,
              showAction: false,
              subQuestion: "",
              subQuestionComplianceId: 0,
              subQuestionAction: "",
              showSubAction: false,
              subNonCompliant: false,
              isSubQuestionAnswered: false,
              selectedSubAnswer: "",
              subAssementResponseId: 0,
            }));

            categoryData.map((cat: any) => {
              const questionsbyCategory = newQuestionData.filter(
                (ques: any) => {
                  return ques.category.trim() === cat.category.trim();
                }
              );
              return dataPacket.push(questionsbyCategory);
            });

            setCategoryWiseQues(dataPacket);

            setTotalPages(dataPacket.length);
            const perPage = 100 / (dataPacket.length);
            setProgressCount(perPage);
            setPerPageProgress(perPage);
            setAllQuestions(res.data.result.questions);
            setCurrentCategory(0);
            resolve(dataPacket);
          })
            .then(() => {
              handleParentChildRelation(dataPacket);
            })
            .then(() => {
              if (auditType === "resume") {
                handleResume(dataPacket);
              }
            });
          setLoading(false);
        } else if (res.status === 200 && res.data.isSuccess === false) {
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
      .catch(() => {
        setLoading(false);
      });
  };
  const handleParentChildRelation = (result: any) => {
    const newData = [...result];
    result.forEach((item: any, catIndex: number) => {
      item
        .filter((val: any) => val.level === "2")
        .forEach((ques: any) => {
          const index = result[catIndex].findIndex(
            (i: any) => i.policyComplianceId === ques.policyComplianceId
          );
          const parentIndex = result[catIndex].findIndex(
            (i: any) =>
              i.policyRequirementId === ques.policyRequirementId &&
              i.level === "1"
          );

          if (parentIndex !== -1) {
            newData[catIndex][parentIndex]["subQuestion"] =
              result[catIndex][index].question;
            newData[catIndex][parentIndex]["isSubQuestion"] = true;
            newData[catIndex][parentIndex]["subQuestionComplianceId"] =
              result[catIndex][index].policyComplianceId;
            newData[catIndex][parentIndex]["subQuestionAction"] =
              result[catIndex][index].action;
            newData[catIndex][parentIndex]["subNonCompliant"] =
              result[catIndex][index].nonCompliant;
            newData[catIndex][parentIndex]["subAssementResponseId"] =
              result[catIndex][index].assessmentResponseId;
            newData[catIndex][parentIndex]["subTriggerResponse"] =
              result[catIndex][index].triggerResponse;
          }
        });
    });
    return setCategoryWiseQues(newData);
  };
  useEffect(() => {
    if (licenseId !== null) {
      getSelfAuditQuestions();
    }
  }, []);

  const LoadingShow = (): JSX.Element => {
    if (!loading && totalRecords === 0) {
      return (
        <div className="NoQuestionsWrapper">
          <div className="row">
            <h3>
              Self-Audit questions are not yet available for this license.
            </h3>
          </div>
          <div className="row mt-5">
            <Button
              type="contained"
              intent="primary"
              onClick={() => {
                pushToLicenseDetails();
              }}
              className="NextButton"
              text="Go Back"
            />
          </div>
        </div>
      );
    }
    return <></>;
  };

  const showInfoModal = (dataShow: string) => {
    setModalClose(true);
    setModalData("");
    return setModalData(dataShow);
  };
  const hideInfoModal = () => {
    setModalClose(false);
  };
  const handleNotAnsweredModal = () => {
    setNotAnsweredModal(false);
  };
  const handleAnswerClicked = (
    e: any,
    policyComplianceId: number,
    policyRequirementId: number
  ) => {
    setOneAnswered(false);
    const newData = [...categoryWiseQues];
    const index = categoryWiseQues[currentCategory].findIndex(
      (i: any) => i.policyComplianceId === policyComplianceId
    );
    const subQuestionIndex = categoryWiseQues[currentCategory].findIndex(
      (i: any) =>
        i.policyRequirementId === policyRequirementId && i.level === "2"
    );
    newData[currentCategory][index]["isAnswered"] = true;
    newData[currentCategory][index]["selectedAnswer"] = e.target.value;
    if (subQuestionIndex !== -1) {
      newData[currentCategory][index]["subQuestion"] =
        categoryWiseQues[currentCategory][subQuestionIndex].question;
      newData[currentCategory][index]["isSubQuestion"] = true;
      newData[currentCategory][index]["subQuestionComplianceId"] =
        categoryWiseQues[currentCategory][subQuestionIndex].policyComplianceId;
      newData[currentCategory][index]["subQuestionAction"] =
        categoryWiseQues[currentCategory][subQuestionIndex].action;
      newData[currentCategory][index]["subNonCompliant"] =
        categoryWiseQues[currentCategory][subQuestionIndex].nonCompliant;
      newData[currentCategory][index]["subAssementResponseId"] =
        categoryWiseQues[currentCategory][subQuestionIndex].assessmentResponseId;
    }

    if (
      categoryWiseQues[currentCategory][index].subTriggerResponse ===
      e.target.value
    ) {
      newData[currentCategory][index]["showSubQuestion"] = true;
    } else {
      newData[currentCategory][index]["showSubQuestion"] = false;
      newData[currentCategory][index]["selectedSubAnswer"] = "";
      newData[currentCategory][index]["showSubAction"] = false;
    }
    if (
      categoryWiseQues[currentCategory][index].nonCompliant === e.target.value
    ) {
      newData[currentCategory][index]["showAction"] = true;
    } else {
      newData[currentCategory][index]["showAction"] = false;
    }

    setCategoryWiseQues(newData);
  };

  const handleSubAnswerClicked = (e: any, policyComplianceId: number) => {
    setOneAnswered(false);
    const newData = [...categoryWiseQues];
    const index = categoryWiseQues[currentCategory].findIndex(
      (i: any) => i.policyComplianceId === policyComplianceId
    );
    newData[currentCategory][index]["isSubQuestionAnswered"] = true;
    newData[currentCategory][index]["selectedSubAnswer"] = e.target.value;
    if (
      categoryWiseQues[currentCategory][index].subNonCompliant ===
      e.target.value
    ) {
      newData[currentCategory][index]["showSubAction"] = true;
    } else {
      newData[currentCategory][index]["showSubAction"] = false;
    }
    setCategoryWiseQues(newData);
  };

  const findUnAnsweredQues = () => {
    let findUnAnswered = false;
    categoryWiseQues.forEach((ques: any) => {
      if (
        ques.filter((e: any) => e.isAnswered === false && e.level === "1")
          .length > 0
      ) {
        findUnAnswered = true;
      }
      if (
        ques.filter(
          (e: any) =>
            e.showSubQuestion === true &&
            e.selectedSubAnswer === "" &&
            e.isSubQuestion === true
        ).length > 0
      ) {
        findUnAnswered = true;
      }
    });
    return findUnAnswered;
  };
  const createRequiredData = (isSave: boolean) => {
    const payloadData: any | null = [];
    categoryWiseQues.forEach((ques: any) => {
      ques
        .filter((val: any) => val.level === "1")
        .map((ans: any) => {
          return payloadData.push({
            response: ans.selectedAnswer,
            policyComplianceId: ans.policyComplianceId,
            status: "active",
            userNotes: ans.notesEntered,
            assessmentResponseId: ans.assessmentResponseId,
          });
        });

      let subQuestionData;
      if (isSave === true) {
        subQuestionData = ques.filter((val: any) => val.isSubQuestion === true);
      } else {
        subQuestionData = ques.filter(
          (val: any) =>
            val.showSubQuestion === true &&
            val.selectedSubAnswer !== "" &&
            val.isSubQuestion === true
        );
      }
      subQuestionData.map((ansSub: any) => {
        return payloadData.push({
          response: ansSub.selectedSubAnswer,
          policyComplianceId: ansSub.subQuestionComplianceId,
          status: "active",
          userNotes: "",
          assessmentResponseId: ansSub.subAssementResponseId,
        });
      });
    });

    return payloadData;
  };
  const handleSubmit = () => {
    const unAns = findUnAnsweredQues();
    if (unAns) {
      setNotAnsweredModal(true);
    } else {
      const payloadQuesData = createRequiredData(false);
      const payloadData = {
        type: "submit",
        licenseId: licenseId,
        selfAuditResponses: payloadQuesData,
      };
      setLoading(true);
      axios
        .post<Response>(SAVE_SELF_AUDIT_QUESTIONS, payloadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 201 && res.data.isSuccess) {
            setIsSubmitted(true);
            setLoading(false);
          } else {
            Swal.fire({
              text: res.data.responseMessage,
              confirmButtonText: "OK",
              icon: "info",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              pushToLicenseDetails();
            });
          }
        })
        .catch(() => setLoading(false));
    }
  };
  const pushToLicenseDetails = () => {
    return history.push("/license-details", {
      licenseId: licenseId,
      licenseNumber: licenseNumber,
    });
  };

  const handleNotesChange = (e: any, complianceId: number) => {
    const newData = [...categoryWiseQues];
    const indexNotes = categoryWiseQues[currentCategory].findIndex(
      (i: any) => i.policyComplianceId === complianceId
    );
    newData[currentCategory][indexNotes]["notesEntered"] = e.target.value;
    setCategoryWiseQues(newData);
  };
  const checkOneAnswered = () => {
    let findAnswered = false;
    categoryWiseQues.forEach((ques: any) => {
      if (
        ques.filter((e: any) => e.isAnswered === true && e.level === "1")
          .length > 0
      ) {
        findAnswered = true;
      }
      if (
        ques.filter(
          (e: any) =>
            e.showSubQuestion === true &&
            e.selectedSubAnswer !== "" &&
            e.isSubQuestion === true
        ).length > 0
      ) {
        findAnswered = true;
      }
    });
    return findAnswered;
  };
  const handleSave = () => {
    const unAns = checkOneAnswered();
    if (unAns) {
      const payloadQuesData = createRequiredData(true);
      const payloadData = {
        type: "save",
        licenseId: licenseId,
        selfAuditResponses: payloadQuesData,
      };
      setIsEmpty(true);
      axios
        .post<Response>(SAVE_SELF_AUDIT_QUESTIONS, payloadData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setIsEmpty(false);
          Swal.close();
          if (res.status === 201 && res.data.isSuccess) {
            history.push("/license-details", {
              licenseId: licenseId,
              licenseNumber: licenseNumber,
            });
          } else if (
            res.status === 201 &&
            !res.data.isSuccess &&
            res.data.result === "Cancelled"
          ) {
            Swal.fire({
              text: res.data.responseMessage,
              confirmButtonText: "OK",
              icon: "info",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              pushToLicenseDetails();
            });
          } else {
            Swal.fire({
              text: res.data.responseMessage,
              confirmButtonText: "OK",
              icon: "error",
            });
          }
        })
        .catch(() => {
          Swal.close();
          setIsEmpty(false);
        });
    } else {
      setOneAnswered(true);
    }
  };

  const handleCancelAudit = () => {
    if (token !== null) {
      const params = {
        licenseId: licenseId,
      };
      setIsEmpty(true);
      axios
        .post<GetResponse>(`${CANCEL_AUDIT}`, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setIsEmpty(false);
          Swal.close();
          setCancelAuditAlert(false);
          if (res.status === 201 && res.data.isSuccess === true) {
            history.push("/license-details", {
              licenseId: licenseId,
              licenseNumber: licenseNumber,
            });
          } else {
            Swal.close();
            Swal.fire({
              text: res.data.responseMessage,
              confirmButtonText: "OK",
              icon: "info",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(() => {
              pushToLicenseDetails();
            });
          }
        })
        .catch(() => {
          Swal.close();
          setIsEmpty(false);
          Swal.fire({
            text: "Something went wrong!",
            confirmButtonText: "OK",
            icon: "error",
          });
        });
    }
  };
  const resumeParent = (catData: any, tData: any, index: number) => {
    const tempData = tData;

    const answeredParent = catData.filter(
      (e: any) => e.userResponse !== "" && e.level === "1"
    );

    if (answeredParent.length > 0) {
      answeredParent.forEach((parentAns: any) => {
        const ansParentIndex = catData.findIndex(
          (i: any) => i.policyComplianceId === parentAns.policyComplianceId
        );

        if (ansParentIndex !== -1) {
          tempData[index][ansParentIndex]["isAnswered"] = true;
          tempData[index][ansParentIndex]["selectedAnswer"] =
            parentAns.userResponse;
          tempData[index][ansParentIndex]["notesEntered"] = parentAns.userNotes;

          if (parentAns.userResponse === parentAns.subTriggerResponse) {
            tempData[index][ansParentIndex]["showAction"] = true;
            tempData[index][ansParentIndex]["showSubQuestion"] = true;
          }
        }
      });
    }
    return tempData;
  };
  const resumeChild = (catData: any, tData: any, index: number, dataP: any) => {
    const tempData = tData;
    const dataPacket = dataP;
    const answeredChild = catData.filter(
      (e: any) => e.userResponse !== "" && e.level === "2"
    );

    if (answeredChild.length > 0) {
      answeredChild.forEach((childAns: any) => {
        const ansChildIndex = catData.findIndex(
          (i: any) => i.policyComplianceId === childAns.policyComplianceId
        );
        if (ansChildIndex !== -1) {
          const parentChildQuesIndex = catData.findIndex(
            (i: any) =>
              i.policyRequirementId === childAns.policyRequirementId &&
              i.level === "1"
          );

          tempData[index][parentChildQuesIndex]["isSubQuestion"] = true;
          tempData[index][parentChildQuesIndex]["subQuestion"] =
            dataPacket[index][ansChildIndex].question;
          tempData[index][parentChildQuesIndex]["subQuestionComplianceId"] =
            dataPacket[index][ansChildIndex].policyComplianceId;
          tempData[index][parentChildQuesIndex]["subQuestionAction"] =
            dataPacket[index][ansChildIndex].action;
          tempData[index][parentChildQuesIndex]["selectedSubAnswer"] =
            dataPacket[index][ansChildIndex].userResponse;
          tempData[index][parentChildQuesIndex]["subAssementResponseId"] =
            dataPacket[index][ansChildIndex].assessmentResponseId;
          if (childAns.userResponse === childAns.nonCompliant) {
            tempData[index][parentChildQuesIndex]["showSubAction"] = true;
          }
        }
      });
    }
    return tempData;
  };

  const handleResume = (dataPacket: any) => {
    let tempData = dataPacket;
    if (dataPacket.length > 0) {
      dataPacket.forEach((catData: any, index: number) => {
        catData
          .filter((filterData: any) => filterData.level === "1")
          .map((eachQuest: any, ind: number) => {
            tempData[index][ind]["notesEntered"] = eachQuest.userNotes;
          });
        new Promise((resolve: any) => {
          tempData = resumeParent(catData, tempData, index);
          resolve(tempData);
        }).then(() => {
          const answeredChild = catData.filter(
            (e: any) => e.userResponse !== "" && e.level === "2"
          );

          if (answeredChild.length > 0) {
            tempData = resumeChild(catData, tempData, index, dataPacket);
          }
        });
      });

      setTimeout(setCategoryWiseQues, 100, [...tempData]);
    }
  };

  const OneAnswerComponent = (): JSX.Element => {
    if (oneAnswered) {
      return (
        <>
          <div className="row pr4-ms-5 ErrorWrapper">
            Please answer at least one question.
          </div>
        </>
      );
    } else {
      return <></>;
    }
  };

  const LoadingComponent = (): JSX.Element => {
    if (totalRecords === 0) {
      return (
        <>
          <LoadingShow />
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="container dashboard-license-container form-container">
      {!isSubmitted && (
        <>
          <div className="d-flex">
            <div className="page-title">
              {String(licenseNumber).length > 30 && (
                <Tooltip title={licenseNumber} placement="top" arrow>
                  <div className="selfaudit-title-wrap TitleWrapWithTooltip-lic">
                    Self Audit: {licenseNumber}
                  </div>
                </Tooltip>
              )}
              {String(licenseNumber).length <= 30 && (
                <div className="TitleWrap">
                  Self Audit: {licenseNumber}
                </div>
              )}
            </div>
          </div>
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={isEmpty}
          >
            <CircularProgress />
          </Backdrop>
          <LoadingComponent />
          {(totalRecords !== 0 || loading) && (
            <>
              {loading && (
                <Backdrop
                  sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                  }}
                  open={loading}
                >
                  <CircularProgress />
                </Backdrop>
              )}
              {!loading && (
                <>
                  <ProgressBar
                    perPageProgress={perPageProgress}
                    categories={categories}
                    currentCategory={currentCategory}
                  />
                  <Dialog
                    open={modalClose}
                    keepMounted
                    className="p-4 dashboard-license-container"
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    PaperProps={{
                      sx: {
                        maxHeight: 450,
                        overflowX: "hidden",
                        overflowY: "auto",
                      },
                    }}
                  >
                    <div className="CloseDialog">
                      <button
                        onClick={() => {
                          hideInfoModal();
                        }}
                        className="btn-close btn-sm close-info-modal"
                      ></button>
                    </div>
                    <DialogContent>{modalData}</DialogContent>
                  </Dialog>
                  <Dialog
                    open={notAnsweredModal}
                    keepMounted
                    className="p-4 dashboard-license-container"
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    PaperProps={{
                      sx: {
                        minHeight: "250px",
                        minWidth: "350px",
                      },
                    }}
                  >
                     <DialogContent className="answer-allques-dialog">
                      <h2 className="answer-allques-dialog-title">Please answer all the questions</h2>
                      <div className="d-flex justify-content-center WrapperForDialogButton">
                        <DialogActions>
                          <Button
                            type="contained"
                            intent="primary"
                            onClick={() => {
                              handleNotAnsweredModal();
                            }}
                            className="NextButton"
                            text="OK"
                          />
                        </DialogActions>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="QuestionsWrapper" ref={myRef}>
                    {categoryWiseQues[currentCategory]?.length > 0 &&
                      categoryWiseQues[currentCategory]
                        .filter((filt: any) => {
                          return filt.level === "1";
                        })
                        .map((questionData: any, index: number) => (
                          <div className="PerQuestionBlock">
                            <div
                              className="d-flex QuestionBlock"
                              key={`question-${index}`}
                            >
                              {questionData.question.length > 300 ? (
                                <span>
                                  {`${index + 1}. `}
                                  {questionData.question.substring(0, 300)}{" "}
                                  <span
                                    className="SeeMoreWrapper"
                                    onClick={() => {
                                      showInfoModal(questionData.question);
                                    }}
                                  >
                                    <strong>
                                      <u>View More</u>
                                    </strong>
                                  </span>
                                </span>
                              ) : (
                                <span>
                                  {`${index + 1}. `} {questionData.question}
                                </span>
                              )}
                            </div>
                            <div className="row mb-4" key={`row-${index}`}>
                              <div className="col-xl-8">
                                <div className="d-flex QuestionLabelBlock">
                                  <div className="InfoIconWrapper">
                                    <InfoIcon sx={{ fontSize: 16 }} />
                                  </div>
                                  <div className="d-flex justify-content-between InfoIconWrapper LabelsWrapper">
                                    <CustomTooltip
                                      title={
                                        questionData.code?.length > 200 ? (
                                          <React.Fragment>
                                            {questionData.code.substring(
                                              0,
                                              200
                                            )}{" "}
                                            <span
                                              className="SeeMoreWrapper"
                                              onClick={() => {
                                                showInfoModal(
                                                  questionData.code
                                                );
                                              }}
                                            >
                                              <strong>
                                                <u>View More</u>
                                              </strong>
                                            </span>
                                          </React.Fragment>
                                        ) : (
                                          questionData.code
                                        )
                                      }
                                      arrow
                                    >
                                      <InputLabel className="LabelButton">
                                        Ordinance/Code
                                      </InputLabel>
                                    </CustomTooltip>

                                    <CustomTooltip
                                      title={
                                        questionData.chapter?.length > 200 ? (
                                          <React.Fragment>
                                            {questionData.chapter.substring(
                                              0,
                                              200
                                            )}{" "}
                                            <span
                                              className="SeeMoreWrapper"
                                              onClick={() => {
                                                showInfoModal(
                                                  questionData.chapter
                                                );
                                              }}
                                            >
                                              <strong>
                                                <u>View More</u>
                                              </strong>
                                            </span>
                                          </React.Fragment>
                                        ) : (
                                          questionData.chapter
                                        )
                                      }
                                      arrow
                                    >
                                      <InputLabel className="LabelButton">
                                        Chapter/Part
                                      </InputLabel>
                                    </CustomTooltip>

                                    <CustomTooltip
                                      title={
                                        questionData.section?.length > 200 ? (
                                          <React.Fragment>
                                            {questionData.section.substring(
                                              0,
                                              200
                                            )}{" "}
                                            <span
                                              className="SeeMoreWrapper"
                                              onClick={() => {
                                                showInfoModal(
                                                  questionData.section
                                                );
                                              }}
                                            >
                                              <strong>
                                                <u>View More</u>
                                              </strong>
                                            </span>
                                          </React.Fragment>
                                        ) : (
                                          questionData.section
                                        )
                                      }
                                      arrow
                                    >
                                      <InputLabel className="LabelButton">
                                        Section
                                      </InputLabel>
                                    </CustomTooltip>

                                    <CustomTooltip
                                      title={
                                        questionData.regulation?.length >
                                        200 ? (
                                          <React.Fragment>
                                            {questionData.regulation.substring(
                                              0,
                                              200
                                            )}{" "}
                                            <span
                                              className="SeeMoreWrapper"
                                              onClick={() => {
                                                showInfoModal(
                                                  questionData.regulation
                                                );
                                              }}
                                            >
                                              <strong>
                                                <u>View More</u>
                                              </strong>
                                            </span>
                                          </React.Fragment>
                                        ) : (
                                          questionData.regulation
                                        )
                                      }
                                      arrow
                                    >
                                      <InputLabel className="LabelButton">
                                        Regulation
                                      </InputLabel>
                                    </CustomTooltip>

                                    <CustomTooltip
                                      title={
                                        questionData.userFacingNote?.length >
                                        200 ? (
                                          <React.Fragment>
                                            {questionData.userFacingNote.substring(
                                              0,
                                              200
                                            )}{" "}
                                            <span
                                              className="SeeMoreWrapper"
                                              onClick={() => {
                                                showInfoModal(
                                                  questionData.userFacingNote
                                                );
                                              }}
                                            >
                                              <strong>
                                                <u>View More</u>
                                              </strong>
                                            </span>
                                          </React.Fragment>
                                        ) : (
                                          questionData.userFacingNote
                                        )
                                      }
                                      arrow
                                    >
                                      <InputLabel className="LabelButton">
                                        Additional Info
                                      </InputLabel>
                                    </CustomTooltip>
                                  </div>
                                </div>
                                <div className="d-flex mt-2 AnswerBlock">
                                  <div className="d-flex pt-1 RadioButtonWrapper">
                                    <div className="AnswerWrapper">
                                      <RadioGroup
                                        name="radio-buttons-answers"
                                        value={questionData.selectedAnswer}
                                        onChange={(e) => {
                                          handleAnswerClicked(
                                            e,
                                            questionData.policyComplianceId,
                                            questionData.policyRequirementId
                                          );
                                        }}
                                        row
                                      >
                                        <FormControlLabel
                                          value="Yes"
                                          control={<Radio />}
                                          label="Yes"
                                          sx={{
                                            "& .MuiSvgIcon-root": {
                                              fontSize: 15,
                                            },
                                            fontWeight: 0,
                                          }}
                                        />
                                        <FormControlLabel
                                          value="No"
                                          control={<Radio />}
                                          label="No"
                                          sx={{
                                            "& .MuiSvgIcon-root": {
                                              fontSize: 15,
                                            },
                                          }}
                                        />
                                      </RadioGroup>
                                    </div>

                                    {questionData.showAction === true && (
                                      <div className="ActionWrapper">
                                        <ViewMoreWrapper
                                          data={questionData.action}
                                          dLength={300}
                                          showInfoModal={showInfoModal}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="col-xl-4 align-items-center">
                                <div className="d-flex flex-row-reverse TextBoxWrapper">
                                  <InputBox
                                    type="text"
                                    onChange={(e: any) => {
                                      handleNotesChange(
                                        e,
                                        questionData.policyComplianceId
                                      );
                                    }}
                                    variant="filled"
                                    placeholder="Enter notes"
                                    disableUnderline={false}
                                    multiline={true}
                                    maxRows={1}
                                    value={questionData.notesEntered}
                                    maxLength={255}
                                    className={`CustomTextField input-form form-field form-control enter-note`}
                                    InputPropsClasses={`${classes.notesText}`}                                    
                                  />
                                </div>
                              </div>
                            </div>
                            {questionData.showSubQuestion &&
                              questionData.subQuestion.length > 0 && (
                                <div className="mt-3 SubQuestionWrapper">
                                  {questionData.subQuestion.length > 300 ? (
                                    <span>
                                      A.{" "}
                                      {questionData.subQuestion.substring(
                                        0,
                                        300
                                      )}{" "}
                                      <span
                                        onClick={() => {
                                          showInfoModal(
                                            questionData.subQuestion
                                          );
                                        }}
                                        className="SeeMoreWrapper"
                                      >
                                        <strong>
                                          <u>View More</u>
                                        </strong>
                                      </span>
                                    </span>
                                  ) : (
                                    <span>A. {questionData.subQuestion}</span>
                                  )}
                                  <div className="d-flex pt-2 RadioButtonWrapper">
                                    <div className="SubAnswerWrapper">
                                      <RadioGroup
                                        name="radio-buttons-answers"
                                        value={questionData.selectedSubAnswer}
                                        onChange={(e: any) => {
                                          handleSubAnswerClicked(
                                            e,
                                            questionData.policyComplianceId
                                          );
                                        }}
                                        row
                                      >
                                        <FormControlLabel
                                          value="Yes"
                                          control={<Radio />}
                                          label="Yes"
                                          sx={{
                                            "& .MuiSvgIcon-root": {
                                              fontSize: 15,
                                            },
                                            fontWeight: 0,
                                          }}
                                        />
                                        <FormControlLabel
                                          value="No"
                                          control={<Radio />}
                                          label="No"
                                          sx={{
                                            "& .MuiSvgIcon-root": {
                                              fontSize: 15,
                                            },
                                          }}
                                        />
                                      </RadioGroup>
                                    </div>

                                    {questionData.showSubAction === true && (
                                      <div className="ActionWrapper">
                                        <ViewMoreWrapper
                                          data={questionData.subQuestionAction}
                                          dLength={300}
                                          showInfoModal={showInfoModal}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                  </div>
                  <OneAnswerComponent />
                  <div className="d-flex mb-5 pt-4 justify-content-between BottomButtonsWrapper">
                    <div className="pt-4">
                      <div
                        className="CancelAuditButton"
                        onClick={() => {
                          setCancelAuditAlert(true);
                        }}
                      >
                        CANCEL
                      </div>

                      <CancelAuditAlertDialog
                        cancelAuditAlert={cancelAuditAlert}
                        handleAlertYes={() => {
                          setCancelAuditAlert(false);
                          handleCancelAudit();
                        }}
                        handleAlertNo={() => {
                          setCancelAuditAlert(false);
                        }}
                      />
                    </div>
                    <div>
                      <Pagination
                        categoryWiseQues={categoryWiseQues}
                        currentPage={currentPage}
                        handlePagination={handlePagination}
                        executeScroll={executeScroll}
                      />
                    </div>
                    <div className="d-flex">
                      <div>
                        <Button
                          type="outlined"
                          intent="secondary"
                          onClick={() => {
                            handleSave();
                          }}
                          className="SaveExitButton"
                          text="Save and Exit"
                        />
                      </div>

                      <div className="ms-5">
                        {currentPage === totalPages && (
                          <Button
                            type="contained"
                            intent="primary"
                            onClick={() => {
                              handleSubmit();
                            }}
                            className="SubmitButton"
                            text="Submit"
                          />
                        )}
                        {currentPage !== totalPages && (
                          <Button
                            type="contained"
                            intent="primary"
                            onClick={() => {
                              handleNext();
                              executeScroll();
                            }}
                            className="NextButton"
                            text="Next"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
      {isSubmitted && (
        <SelfAuditCompleted
          licenseId={licenseId}
          licenseNumber={licenseNumber}
        />
      )}
    </div>
  );
};
export default SelfAudit;
