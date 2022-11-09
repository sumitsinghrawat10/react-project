import React, { useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Tooltip, CircularProgress } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import Swal from 'sweetalert2';

import {
    GET_SELF_AUDIT_REPORT,
    GET_SELF_AUDIT_REPORT_LINK,
} from '../../../networking/httpEndPoints';
import { roleValidator } from '../../../utilities/roleValidator';
import GetDownloadSelfAuditReport from '../Modal/DownloadAuditReport';

const useStyles = makeStyles({
    dialogPaper: {
        height: '90%',
    },
});

const tHeaders = [
    'Report I.D.',
    'License number',
    'Completed by',
    'Date',
    'Time',
    'Status',
];

interface AuditReportState {
  openReport: boolean;
  handleCancel: any;
  licenseId: number;
}
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const AuditReportDialogBox: React.FC<AuditReportState> = (
    props: AuditReportState
) => {
    const classes = useStyles();
    const [auditReportDetails, setAuditReportDetails] = React.useState<
    any | null
  >(null);
    const [categoryWiseQues, setCategoryWiseQues] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    const token = localStorage.getItem('user');
    const GetAuditReport = () => {
        if (token != null) {
            setLoading(true);
            axios
                .get<GetResponse>(GET_SELF_AUDIT_REPORT + props.licenseId, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res: any) => {
                    if (res.status === 200 && res.data.isSuccess === true) {
                        setAuditReportDetails({
                            reportID: res.data.result.reportID,
                            licenseNumber: res.data.result.licenseNumber,
                            completedBy: res.data.result.completedBy,
                            dateOfCompletion: res.data.result.dateOfCompletion,
                            timeOfCompletion: res.data.result.timeOfCompletion,
                            status: res.data.result.status,
                            versionId: res.data.result.versionId,
                        });

                        const auditQuestions = res.data.result.categoryDetails;
                        const categories = res.data.result.categoryList;
                        const dataPacket: any = [];
                        const ProcessedData: any = [];
                        const subQuestions = auditQuestions.filter((ques: any) => {
                            return ques.categoryQuestionsAnswers[0]['level'] === '2';
                        });

                        new Promise((resolve: any) => {
                            auditQuestions.map((ques: any) => {
                                if (ques.categoryQuestionsAnswers[0]['level'] === '1') {
                                    const questions = subQuestions.find((subQues: any) => {
                                        return (
                                            subQues.categoryQuestionsAnswers[0][
                                                'policyRequirementId'
                                            ] ===
										ques.categoryQuestionsAnswers[0]['policyRequirementId']
                                        );
                                    });

                                    if (questions) {
                                        ques.categoryQuestionsAnswers[0][
                                            'childQuestionsWithTheirAnswers'
                                        ] = questions.categoryQuestionsAnswers[0];
                                    } else {
                                        ques.categoryQuestionsAnswers[0][
                                            'childQuestionsWithTheirAnswers'
                                        ] = null;
                                    }
                                    return dataPacket.push(ques.categoryQuestionsAnswers[0]);
                                }
                                return false;
                            });
                            resolve(dataPacket);
                        }).then((result: any) => {
                            categories.forEach((category: any) => {
                                const questionsbyCategory = result.filter((ques: any) => {
                                    return ques.categoryName === category;
                                });
                                return ProcessedData.push(questionsbyCategory);
                            });
                            setCategoryWiseQues(ProcessedData);
                            setLoading(false);
                        });
                    } else if (res.status === 200 && res.data.isSuccess === false) {
                        setLoading(false);
                        Swal.fire({
                            text: res.data.responseMessage,
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    } else {
                        setLoading(false);
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        if (props.openReport) {
            GetAuditReport();
        }
    }, [props.openReport]);

    return (
        <div className="dashboard-license-container form-container">
            {
                <Dialog
                    open={props.openReport}
                    fullWidth
                    maxWidth="lg"
                    classes={{ paper: classes.dialogPaper }}
                    className="DialogWrapper-auditReport dashboard-license-container form-container"
                >
                    <div className="mt-2 mb-4 mx-2">
                        <div className="d-flex justify-content-between mx-3 mt-3">
                            <p className="ReportTitle">Self Audit Results</p>

                            <div className="d-flex">
                                <DownloadForOfflineRoundedIcon 
                                    cursor="pointer"
                                    className="me-3 iconStyle-auditReport DownloadIconWrapper"
                                    onClick={() =>
                                        GetDownloadSelfAuditReport(
                                            GET_SELF_AUDIT_REPORT_LINK,
                                            props.licenseId,
                                            auditReportDetails.versionId,
                                            document
                                        )
                                    }
                                />
                                <CloseIcon
                                    className="iconStyle-auditReport"
                                    onClick={props.handleCancel}
                                    cursor="pointer"
                                />
                            </div>
                        </div>
                        {loading && (<div className="LoaderWrapper"><CircularProgress /></div>)}
                        {auditReportDetails && (
                            <TableContainer>
                                <Table stickyHeader>
                                    <colgroup>
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '20%' }} />
                                    </colgroup>
                                    <TableHead>
                                        <TableRow className="TableRowWrapper">
                                            {tHeaders.map((elm, index) => {
                                                return (
                                                    <TableCell
                                                        key={`tablecell-${index}`}
                                                        align="left"
                                                        className="textStyle"
                                                    >
                                                        {elm}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow className="TableRowWrapper">
                                            <Tooltip
                                                title={
                                                    auditReportDetails.reportID.length > 20
                                                        ? auditReportDetails.reportID
                                                        : ''
                                                }
                                                placement="top"
                                                arrow
                                            >
                                                <TableCell>
                                                    {auditReportDetails.reportID.length > 20
                                                        ? auditReportDetails.reportID.substring(0, 20) +
								'...'
                                                        : auditReportDetails.reportID}
                                                </TableCell>
                                            </Tooltip>
                                            <TableCell>
                                                {auditReportDetails.licenseNumber}
                                            </TableCell>
                                            <TableCell align="left">
                                                {auditReportDetails.completedBy}
                                            </TableCell>
                                            <TableCell>
                                                {auditReportDetails.dateOfCompletion}
                                            </TableCell>
                                            <TableCell align="left">
                                                {auditReportDetails.timeOfCompletion}
                                            </TableCell>
                                            <TableCell align="left">
                                                {auditReportDetails.status}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </div>
                    <div className="mx-2 mb-4 AuditQuestions">
                        {categoryWiseQues?.length > 0 &&
							categoryWiseQues.map((category) => {
							    return (
							        <>
							            <div className="CategoryNameWrapper">
							                {category[0]['categoryName']}
							            </div>
							            <>
							                {category.map((question: any, index: number) => {
							                    return (
							                        <>
							                            <div key={`question-${index}`} className="my-3">
							                                <div className="row">
							                                    <div className="col-xl-12">
							                                        <div className="QuestionAnswersWrapper">
							                                            {index + 1}. {question['parentQuestion']}
							                                        </div>
							                                    </div>
							                                </div>
							                                <div className="row">
							                                    <div className="col-xl-2">
							                                        <div className="QuestionAnswersWrapper">
																			Answer: {question['parentAnswer']}
							                                        </div>
							                                    </div>
							                                    <div className="col-xl-3">
							                                        {roleValidator(question['parentAnswer']) !==
																				roleValidator(question['nonCompliant']) && (
							                                            <div className="d-flex marked-green">
							                                                <CheckCircleOutlineIcon className="icon" />
							                                                <div className="ms-1 marked-green QuestionAnswersWrapper">
																							No Action Required
							                                                </div>
							                                            </div>
							                                        )}
							                                        {roleValidator(question['parentAnswer']) ===
																				roleValidator(question['nonCompliant']) && (
							                                            <div
							                                                className="d-flex marked-red"
							                                                style={{ color: '#ff6d6d' }}
							                                            >
							                                                <ErrorOutlineIcon className="icon" />
							                                                <div className="ms-1 marked-red QuestionAnswersWrapper">
																						Action Required
							                                                </div>
							                                            </div>
							                                        )}
							                                    </div>
							                                </div>
							                                <div className="row">
							                                    <div className="col-xl-2">
							                                        <div className="QuestionAnswersWrapper">
																			Notes:
							                                        </div>
							                                    </div>
							                                    <div className="col-xl-8 ms-1">
							                                        <div className="QuestionAnswersWrapper">
							                                            {question['userNotes'] ||
																					'No Note Available'}
							                                        </div>
							                                    </div>
							                                </div>
							                            </div>
							                            <div>
							                                {question['childQuestionsWithTheirAnswers'] && (
							                                    <div
							                                        key={`subquestion-${index}`}
							                                        className="my-3 ms-4"
							                                    >
							                                        <div className="row">
							                                            <div className="col-xl-12">
							                                                <div className="QuestionAnswersWrapper">
																						A.{' '}
							                                                    {
							                                                        question[
							                                                            'childQuestionsWithTheirAnswers'
							                                                        ]['childQuestion']
							                                                    }
							                                                </div>
							                                            </div>
							                                        </div>
							                                        <div className="row">
							                                            <div className="col-xl-2">
							                                                <div className="QuestionAnswersWrapper">
																								Answer:{' '}
							                                                    {
							                                                        question[
							                                                            'childQuestionsWithTheirAnswers'
							                                                        ]['childAnswer']
							                                                    }
							                                                </div>
							                                            </div>
							                                            <div className="col-xl-3">
							                                                {roleValidator(
							                                                    question[
							                                                        'childQuestionsWithTheirAnswers'
							                                                    ]['childAnswer']
							                                                ) !==
																						roleValidator(
																						    question[
																						        'childQuestionsWithTheirAnswers'
																						    ]['nonCompliant']
																						) && (
							                                                    <div className="d-flex marked-green">
							                                                        <CheckCircleOutlineIcon className="icon" />
							                                                        <div className="ms-1 marked-green QuestionAnswersWrapper">
																										No Action Required
							                                                        </div>
							                                                    </div>
							                                                )}
							                                                {roleValidator(
							                                                    question[
							                                                        'childQuestionsWithTheirAnswers'
							                                                    ]['childAnswer']
							                                                ) ===
																						roleValidator(
																						    question[
																						        'childQuestionsWithTheirAnswers'
																						    ]['nonCompliant']
																						) && (
							                                                    <div
							                                                        className="d-flex marked-red"
							                                                        style={{ color: '#ff6d6d' }}
							                                                    >
							                                                        <ErrorOutlineIcon className="icon" />
							                                                        <div className="ms-1 marked-red QuestionAnswersWrapper">
																										Action Required
							                                                        </div>
							                                                    </div>
							                                                )}
							                                            </div>
							                                        </div>
							                                    </div>
							                                )}
							                            </div>
							                        </>
							                    );
							                })}
							            </>
							        </>
							    );
							})}
                    </div>
                </Dialog>
            }
        </div>
    );
};

export default AuditReportDialogBox;