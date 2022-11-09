import React, { useEffect } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { Typography, Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';

import {
    GET_PREV_SELF_AUDIT_REPORTS,
    GET_SELF_AUDIT_REPORT_LINK,
} from '../../../networking/httpEndPoints';
import GetDownloadSelfAuditReport from '../Modal/DownloadAuditReport';

const tHeaders = [
    'Report I.D.',
    'Completed by',
    'Date',
    'Time',
    'Status',
    'Link',
];

interface AlertState {
  alertOpen: boolean;
  handleYes: any;
  licenseId: number;
  licenseNumber: string;
}
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const PreviousAuditDialogBox: React.FC<AlertState> = (props: AlertState) => {
    const [auditReport, setAuditReport] = React.useState<any[]>([]);
    useEffect(() => {
        GetPreAuditReport();
    }, []);

    const token = localStorage.getItem('user');
    const GetPreAuditReport = () => {
        if (token != null) {
            axios
                .get<GetResponse>(`${GET_PREV_SELF_AUDIT_REPORTS}${props.licenseId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res: any) => {
                    if (res.status === 200 && res.data.responseMessage === 'Success') {
                        const data = res.data.result;
                        setAuditReport(data);
                    }
                });
        }
    };

    return (
        <>
            <div className="container dashboard-license-container MainDivWrapper">
                <Dialog open={props.alertOpen} fullWidth maxWidth="lg" className="dashboard-license-container PreviousAuditDialogWrapper form-container">
                    <div className="container-fluid">
                        <div className="row justify-content-between TextDiv">
                            <Typography className="TitleTypography titleStyle" variant="h5">
              Self Audit Reports:
                                <Tooltip title={props.licenseNumber} placement="top" arrow>
                                    <Typography className="titleStyle TitleWrapWithTooltip" variant="h5" overflow={"revert"} marginLeft={"5px"}>
                                        {props.licenseNumber.length > 30
                                            ? props.licenseNumber.substring(0, 30) + '...'
                                            : props.licenseNumber}
                                    </Typography>
                                </Tooltip>
                            </Typography>
                            <CloseIcon
                                className="iconStyle"
                                onClick={props.handleYes}
                                cursor="pointer"
                            />
                        </div>
                    </div>
                    {auditReport.length === 0 ? (
                        <div className="UnderAuditWrapper">
                            <Typography>
              No self-audit reports are available for this license.
                            </Typography>
                        </div>
                    ) : (
                        <div className="TableDiv">
                            <TableContainer className="TableContainerWrapper" sx={{ maxHeight: 100 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow className="TableRowWrapper">
                                            {tHeaders.map((elm) => {
                                                return (
                                                    <TableCell align="left" className="textStyle">
                                                        {elm}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {auditReport.map((row, index) => {
                                            return (
                                                <TableRow className="TableRowWrapper" key={index}>
                                                    <Tooltip title={row.reportID} placement="top" arrow>
                                                        <TableCell>
                                                            {row.reportID.length > 20
                                                                ? row.reportID.substring(0, 20) + '...'
                                                                : row.reportID}
                                                        </TableCell>
                                                    </Tooltip>
                                                    <TableCell align="left">
                                                        {row.completedBy}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.dateOfCompletion}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.timeOfCompletion}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.status}
                                                    </TableCell>
                                                    <TableCell
                                                        className="hoverStyle"
                                                        onClick={() =>
                                                            GetDownloadSelfAuditReport(
                                                                GET_SELF_AUDIT_REPORT_LINK,
                                                                props.licenseId,
                                                                row.versionId,
                                                                document
                                                            )
                                                        }
                                                    >
                                                        <DownloadIcon /> Download Report
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                </Dialog>
            </div>
        </>
    );
};

export default PreviousAuditDialogBox;
