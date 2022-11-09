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
import Swal from "sweetalert2";
import InputBox from "../../../components/InputBox";
import Button from "../../../components/Button";
import {
  SAVE_SELF_AUDIT_QUESTIONS,
  CANCEL_AUDIT,
  GET_SELF_AUDIT_CATEGORIES,
  GET_QUESTIONS_BY_CATEGORY,
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
interface Categories {
  category: string;
}
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}
interface CategoryWiseType {
  categoryName: string;
  isQuestionFetched: boolean;
  questionsData: [
    {
      policyComplianceId: number;
      policyRequirementId: number;
      level: string;
      subQuestion: string;
      question: string;
      isSubQuestion: boolean;
      subQuestionComplianceId: number;
      subQuestionAction: string;
      subNonCompliant: boolean;
      action: string;
      nonCompliant: boolean;
      subAssementResponseId: number;
      assesmentResponseId: number;
      subTriggerResponse: string;
      triggerResponse: string;
      isAnswered: boolean;
      selectedAnswer: string;
      showSubQuestion: boolean;
      showSubAction: boolean;
      selectedSubAnswer: string;
      showAction: boolean;
      isSubQuestionAnswered: boolean;
      notesEntered: string;
    }
  ];
}
interface LicenseTypeData {
  category: string | null;
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
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryWiseQues, setCategoryWiseQues] = useState<CategoryWiseType[]>([
    {
      categoryName: "",
      isQuestionFetched: false,
      questionsData: [
        {
          policyComplianceId: 0,
          policyRequirementId: 0,
          level: "",
          subQuestion: "",
          question: "",
          isSubQuestion: false,
          subQuestionComplianceId: 0,
          subQuestionAction: "",
          subNonCompliant: false,
          action: "",
          nonCompliant: false,
          subAssementResponseId: 0,
          assesmentResponseId: 0,
          subTriggerResponse: "",
          triggerResponse: "",
          isAnswered: false,
          selectedAnswer: "",
          selectedSubAnswer: "",
          showSubAction: false,
          showSubQuestion: false,
          showAction: false,
          isSubQuestionAnswered: false,
          notesEntered: "",
        },
      ],
    },
  ]);
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
  const [fetchQuesData, setFetchQuesData] = useState<LicenseTypeData>({
    category: null,
  });

  let questionFetchData = {
    city: "",
    state: "",
    county: "",
    typeId: 0,
    levelId: 0,
    selfAuditStatus: "",
    updatedBy: 0,
    isUnincorporatedArea: false,
    licenseId: 0,
    category: null,
    deliveryAudit: null,
    policyRequirementIdList: [],
  };

  const token = localStorage.getItem("user");
  const userData = decodeToken(token);
  const [counter, setCounter] = useState(1);
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPerPageProgress(progressCount * (counter + 1));

      if (categoryWiseQues[currentCategory + 1].isQuestionFetched !== true) {
        getCategoryWiseQuestions(
          categoryWiseQues,
          currentCategory + 1,
          fetchQuesData
        );
      }
      setCurrentCategory(currentCategory + 1);
      setCounter(counter + 1);
    }
  };
  const handlePagination = (page: number) => {
    setCurrentPage(page);
    setCurrentCategory(page);
    if (page !== 0) {
      setPerPageProgress(progressCount * (page + 1));
    } else {
      setPerPageProgress(progressCount);
    }
    if (categoryWiseQues[page].isQuestionFetched !== true) {
      getCategoryWiseQuestions(categoryWiseQues, page, fetchQuesData);
    }
    setCounter(page + 1);
  };
  const handleParentChildRelation = (
    result: CategoryWiseType[],
    currentPagep: number
  ) => {
    const newData = [...result];
    result[currentPagep].questionsData
      .filter((val: { level: string }) => val.level === "2")
      .forEach(
        (ques: { policyComplianceId: number; policyRequirementId: number }) => {
          const index = result[currentPagep].questionsData.findIndex(
            (i: { policyComplianceId: number }) =>
              i.policyComplianceId === ques.policyComplianceId
          );
          const parentIndex = result[currentPagep].questionsData.findIndex(
            (i: { policyRequirementId: number; level: string }) =>
              i.policyRequirementId === ques.policyRequirementId &&
              i.level === "1"
          );

          if (parentIndex !== -1) {
            newData[currentPagep].questionsData[parentIndex]["subQuestion"] =
              result[currentPagep].questionsData[index].question;
            newData[currentPagep].questionsData[parentIndex]["isSubQuestion"] =
              true;
            newData[currentPagep].questionsData[parentIndex][
              "subQuestionComplianceId"
            ] = result[currentPagep].questionsData[index].policyComplianceId;
            newData[currentPagep].questionsData[parentIndex][
              "subQuestionAction"
            ] = result[currentPagep].questionsData[index].action;
            newData[currentPagep].questionsData[parentIndex][
              "subNonCompliant"
            ] = result[currentPagep].questionsData[index].nonCompliant;
            newData[currentPagep].questionsData[parentIndex][
              "subAssementResponseId"
            ] = result[currentPagep].questionsData[index].assesmentResponseId;
            newData[currentPagep].questionsData[parentIndex][
              "subTriggerResponse"
            ] = result[currentPagep].questionsData[index].triggerResponse;
          }
        }
      );
    return setCategoryWiseQues(newData);
  };
  useEffect(() => {
    if (licenseId !== null) {
      getSelfAuditCategories();
    }
  }, []);

  const getCategoryWiseQuestions = async (
    categoryWiseQuesp: CategoryWiseType[],
    currentPagep: number,
    questionFetchDatap: LicenseTypeData
  ) => {
    const payload: LicenseTypeData = questionFetchDatap;
    payload.category = categoryWiseQuesp[currentPagep].categoryName;

    setLoading(true);
    axios
      .post<GetResponse>(`${GET_QUESTIONS_BY_CATEGORY}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLoading(false);
        if (res.status === 201 && res.data.isSuccess === true) {
          new Promise((resolve: any) => {
            const ques = res.data.result.questions;
            const newQuestionData = ques.map((v: Object) => ({
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
            const tempCatwiseQues = categoryWiseQuesp;
            tempCatwiseQues[currentPagep]["questionsData"] = newQuestionData;
            tempCatwiseQues[currentPagep]["isQuestionFetched"] = true;
            setCategoryWiseQues([]);
            setCategoryWiseQues(tempCatwiseQues);
            setCurrentCategory(currentPagep);
            resolve(categoryWiseQuesp);
          })
            .then(() => {
              handleParentChildRelation(categoryWiseQuesp, currentPagep);
            })
            .then(() => {
              if (auditType === "resume") {
                handleResume(categoryWiseQuesp, currentPagep);
              }
            });
        }
      });
  };
  const getSelfAuditCategories = () => {
    setLoading(true);
    axios
      .get<GetResponse>(`${GET_SELF_AUDIT_CATEGORIES}?LicenseId=${licenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === 200 && res.data.isSuccess === true) {
          const tempCategoryData: any = [];
          new Promise((resolve: any) => {
            setCategories(res.data.result.categories);
            setTotalRecords(res.data.result.categories.length);
            setFetchQuesData(res.data.result.licenseData);
            questionFetchData = res.data.result.licenseData;
            const categoryData = res.data.result.categories;
            categoryData.forEach((item: { category: string }) => {
              const tempCategory = {
                categoryName: item.category,
                isQuestionFetched: false,
                questionsData: [],
                isAllAnswered: false,
              };
              tempCategoryData.push(tempCategory);
            });

            setCategoryWiseQues(tempCategoryData);
            setTotalPages(tempCategoryData.length - 1);
            const perPage = 100 / tempCategoryData.length;
            setProgressCount(perPage);
            setPerPageProgress(perPage);
            setCurrentCategory(0);
            setCurrentPage(0);
            resolve(tempCategoryData);
          }).then(() => {
            if (tempCategoryData.length > 0) {
              getCategoryWiseQuestions(tempCategoryData, 0, questionFetchData);
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
    e: React.ChangeEvent<HTMLInputElement>,
    policyComplianceId: number,
    policyRequirementId: number
  ) => {
    setOneAnswered(false);
    const newData = [...categoryWiseQues];
    const index = categoryWiseQues[currentCategory].questionsData.findIndex(
      (i: { policyComplianceId: number }) =>
        i.policyComplianceId === policyComplianceId
    );
    const subQuestionIndex = categoryWiseQues[
      currentCategory
    ].questionsData.findIndex(
      (i: { policyRequirementId: number; level: string }) =>
        i.policyRequirementId === policyRequirementId && i.level === "2"
    );
    newData[currentCategory].questionsData[index]["isAnswered"] = true;
    newData[currentCategory].questionsData[index]["selectedAnswer"] =
      e.target.value;
    if (subQuestionIndex !== -1) {
      newData[currentCategory].questionsData[index]["subQuestion"] =
        categoryWiseQues[currentCategory].questionsData[
          subQuestionIndex
        ].question;
      newData[currentCategory].questionsData[index]["isSubQuestion"] = true;
      newData[currentCategory].questionsData[index]["subQuestionComplianceId"] =
        categoryWiseQues[currentCategory].questionsData[
          subQuestionIndex
        ].policyComplianceId;
      newData[currentCategory].questionsData[index]["subQuestionAction"] =
        categoryWiseQues[currentCategory].questionsData[
          subQuestionIndex
        ].action;
      newData[currentCategory].questionsData[index]["subNonCompliant"] =
        categoryWiseQues[currentCategory].questionsData[
          subQuestionIndex
        ].nonCompliant;
      newData[currentCategory].questionsData[index]["subAssementResponseId"] =
        categoryWiseQues[currentCategory].questionsData[
          subQuestionIndex
        ].assesmentResponseId;
    }

    if (
      categoryWiseQues[currentCategory].questionsData[index]
        .subTriggerResponse === e.target.value
    ) {
      newData[currentCategory].questionsData[index]["showSubQuestion"] = true;
    } else {
      newData[currentCategory].questionsData[index]["showSubQuestion"] = false;
      newData[currentCategory].questionsData[index]["selectedSubAnswer"] = "";
      newData[currentCategory].questionsData[index]["showSubAction"] = false;
    }
    if (
      categoryWiseQues[currentCategory].questionsData[
        index
      ].nonCompliant.toString() === e.target.value
    ) {
      newData[currentCategory].questionsData[index]["showAction"] = true;
    } else {
      newData[currentCategory].questionsData[index]["showAction"] = false;
    }
    setCategoryWiseQues([]);
    setCategoryWiseQues(newData);
  };

  const handleSubAnswerClicked = (
    e: React.ChangeEvent<HTMLInputElement>,
    policyComplianceId: number
  ) => {
    setOneAnswered(false);
    const newData = [...categoryWiseQues];
    const index = categoryWiseQues[currentCategory].questionsData.findIndex(
      (i: { policyComplianceId: number }) =>
        i.policyComplianceId === policyComplianceId
    );
    newData[currentCategory].questionsData[index]["isSubQuestionAnswered"] =
      true;
    newData[currentCategory].questionsData[index]["selectedSubAnswer"] =
      e.target.value;
    if (
      categoryWiseQues[currentCategory].questionsData[
        index
      ].subNonCompliant.toString() === e.target.value
    ) {
      newData[currentCategory].questionsData[index]["showSubAction"] = true;
    } else {
      newData[currentCategory].questionsData[index]["showSubAction"] = false;
    }
    setCategoryWiseQues(newData);
  };

  const findUnAnsweredQues = () => {
    let findUnAnswered = false;
    if (
      categoryWiseQues.filter(
        (e: { isQuestionFetched: boolean }) => e.isQuestionFetched === false
      ).length > 0
    ) {
      findUnAnswered = true;
    }
    categoryWiseQues.forEach((ques: CategoryWiseType) => {
      if (
        ques.questionsData.filter(
          (e: { isAnswered: boolean; level: string }) =>
            e.isAnswered === false && e.level === "1"
        ).length > 0
      ) {
        findUnAnswered = true;
      }
      if (
        ques.questionsData.filter(
          (e: {
            showSubQuestion: boolean;
            selectedSubAnswer: string;
            isSubQuestion: boolean;
          }) =>
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
    categoryWiseQues.forEach((ques: CategoryWiseType) => {
      ques.questionsData
        .filter((val: { level: string }) => val.level === "1")
        .forEach(
          (ans: {
            selectedAnswer: string;
            policyComplianceId: number;
            notesEntered: string;
            assesmentResponseId: number;
          }) => {
            return payloadData.push({
              response: ans.selectedAnswer,
              policyComplianceId: ans.policyComplianceId,
              status: "active",
              userNotes: ans.notesEntered,
              assessmentResponseId: ans.assesmentResponseId,
            });
          }
        );

      let subQuestionData;
      if (isSave === true) {
        subQuestionData = ques.questionsData.filter(
          (val: { isSubQuestion: boolean }) => val.isSubQuestion === true
        );
      } else {
        subQuestionData = ques.questionsData.filter(
          (val: {
            showSubQuestion: boolean;
            selectedSubAnswer: string;
            isSubQuestion: boolean;
          }) =>
            val.showSubQuestion === true &&
            val.selectedSubAnswer !== "" &&
            val.isSubQuestion === true
        );
      }
      subQuestionData.forEach(
        (ansSub: {
          selectedSubAnswer: string;
          subQuestionComplianceId: number;
          subAssementResponseId: number;
        }) => {
          return payloadData.push({
            response: ansSub.selectedSubAnswer,
            policyComplianceId: ansSub.subQuestionComplianceId,
            status: "active",
            userNotes: "",
            assessmentResponseId: ansSub.subAssementResponseId,
          });
        }
      );
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
        userId: userData.UserId,
        licenseId: licenseId,
        organizationId: userData.OrgId,
        versionId: 0,
        selfAuditResponses: payloadQuesData,
      };
      setLoading(true);
      axios
        .post<GetResponse>(SAVE_SELF_AUDIT_QUESTIONS, payloadData, {
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

  const handleNotesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    complianceId: number
  ) => {
    const newData = [...categoryWiseQues];
    const indexNotes = categoryWiseQues[
      currentCategory
    ].questionsData.findIndex(
      (i: { policyComplianceId: number }) =>
        i.policyComplianceId === complianceId
    );
    newData[currentCategory].questionsData[indexNotes]["notesEntered"] =
      e.target.value;
    setCategoryWiseQues(newData);
  };
  const checkOneAnswered = () => {
    let findAnswered = false;
    categoryWiseQues.forEach((ques: CategoryWiseType) => {
      if (
        ques.questionsData.filter(
          (e: { isAnswered: boolean; level: string }) =>
            e.isAnswered === true && e.level === "1"
        ).length > 0
      ) {
        findAnswered = true;
      }
      if (
        ques.questionsData.filter(
          (e: {
            showSubQuestion: boolean;
            selectedSubAnswer: string;
            isSubQuestion: boolean;
          }) =>
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
        userId: userData.UserId,
        licenseId: licenseId,
        organizationId: userData.OrgId,
        versionId: 0,
        selfAuditResponses: payloadQuesData,
      };
      setIsEmpty(true);
      axios
        .post<GetResponse>(SAVE_SELF_AUDIT_QUESTIONS, payloadData, {
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

    const answeredParent = catData[index].questionsData.filter(
      (e: { userResponse: string; level: string }) =>
        e.userResponse !== "" && e.level === "1"
    );

    if (answeredParent.length > 0) {
      answeredParent.forEach(
        (parentAns: {
          policyComplianceId: number;
          userResponse: string;
          userNotes: string;
          subTriggerResponse: string;
        }) => {
          const ansParentIndex = catData[index].questionsData.findIndex(
            (i: { policyComplianceId: number }) =>
              i.policyComplianceId === parentAns.policyComplianceId
          );
          if (ansParentIndex !== -1) {
            tempData[index].questionsData[ansParentIndex]["isAnswered"] = true;
            tempData[index].questionsData[ansParentIndex]["selectedAnswer"] =
              parentAns.userResponse;
            tempData[index].questionsData[ansParentIndex]["notesEntered"] =
              parentAns.userNotes;

            if (parentAns.userResponse === parentAns.subTriggerResponse) {
              tempData[index].questionsData[ansParentIndex]["showAction"] =
                true;
              tempData[index].questionsData[ansParentIndex]["showSubQuestion"] =
                true;
            }
          }
        }
      );
    }
    return tempData;
  };
  const resumeChild = (catData: any, tData: any, index: number, dataP: any) => {
    const tempData = tData;
    const dataPacket = dataP;
    const answeredChild = catData[currentCategory].questionsData.filter(
      (e: { userResponse: string; level: string }) =>
        e.userResponse !== "" && e.level === "2"
    );

    if (answeredChild.length > 0) {
      answeredChild.forEach(
        (childAns: {
          policyComplianceId: number;
          policyRequirementId: number;
          userResponse: string;
          nonCompliant: string;
        }) => {
          const ansChildIndex = catData[
            currentCategory
          ].questionsData.findIndex(
            (i: { policyComplianceId: number }) =>
              i.policyComplianceId === childAns.policyComplianceId
          );
          if (ansChildIndex !== -1) {
            const parentChildQuesIndex = catData[
              currentCategory
            ].questionsData.findIndex(
              (i: { policyRequirementId: number; level: string }) =>
                i.policyRequirementId === childAns.policyRequirementId &&
                i.level === "1"
            );

            tempData[index].questionsData[parentChildQuesIndex][
              "isSubQuestion"
            ] = true;
            tempData[index].questionsData[parentChildQuesIndex]["subQuestion"] =
              dataPacket[index].questionsData[ansChildIndex].question;
            tempData[index].questionsData[parentChildQuesIndex][
              "subQuestionComplianceId"
            ] =
              dataPacket[index].questionsData[ansChildIndex].policyComplianceId;
            tempData[index].questionsData[parentChildQuesIndex][
              "subQuestionAction"
            ] = dataPacket[index].questionsData[ansChildIndex].action;
            tempData[index].questionsData[parentChildQuesIndex][
              "selectedSubAnswer"
            ] = dataPacket[index].questionsData[ansChildIndex].userResponse;
            tempData[index].questionsData[parentChildQuesIndex][
              "subAssementResponseId"
            ] =
              dataPacket[index].questionsData[
                ansChildIndex
              ].assesmentResponseId;
            if (childAns.userResponse === childAns.nonCompliant) {
              tempData[index].questionsData[parentChildQuesIndex][
                "showSubAction"
              ] = true;
            }
          }
        }
      );
    }
    return tempData;
  };

  const handleResume = (dataPacket: any, currentPagep: number) => {
    let tempData = dataPacket;
    if (dataPacket.length > 0) {
      dataPacket[currentPagep].questionsData
        .filter((filterData: { level: string }) => filterData.level === "1")
        .map((eachQuest: { userNotes: string }, ind: number) => {
          tempData[currentPagep].questionsData[ind]["notesEntered"] =
            eachQuest.userNotes;
        });
      new Promise((resolve: any) => {
        tempData = resumeParent(dataPacket, tempData, currentPagep);
        resolve(tempData);
      }).then(() => {
        const answeredChild = dataPacket[currentPagep].questionsData.filter(
          (e: { userResponse: string; level: string }) =>
            e.userResponse !== "" && e.level === "2"
        );

        if (answeredChild.length > 0) {
          tempData = resumeChild(
            dataPacket,
            tempData,
            currentPagep,
            dataPacket
          );
        }
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
                <div className="TitleWrap">Self Audit: {licenseNumber}</div>
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
                            intent="primary"
                            onClick={() => {
                              handleNotAnsweredModal();
                            }}
                            className="NextButton"
                            text="OK"
                            type="contained"
                          />
                        </DialogActions>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="QuestionsWrapper" ref={myRef}>
                    {categoryWiseQues[currentCategory]?.questionsData.length >
                      0 &&
                      categoryWiseQues[currentCategory].questionsData
                        .filter((filt: { level: string }) => {
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
                              <div className="col-xl-4 d-flex align-items-center">
                                <div className="d-flex flex-row-reverse TextBoxWrapper">
                                  <InputBox
                                    type="text"
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
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
                                    className={`CustomTextField input-form form-field form-control`}
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
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
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
