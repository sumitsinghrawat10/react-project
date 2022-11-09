import React, { useEffect } from 'react';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Tooltip from '@mui/material/Tooltip';
import styled from 'styled-components';

import {getDownloadReport} from './EmployeeImportMethods';

const CloseDialog = styled.div`
  .close-assign-license {
    float: right;
    margin-top: 10px;
    margin-right: 15px;
  }
`;

const DialogTop = styled(DialogContentText)`
  text-align: center;
  font-weight: bold !important;
  font-size: 30px !important;
  color: #001e46 !important;
`;

const ResultRow = styled.div`
  min-width: 550px !important;
  margin-top: 15px;
`;
const FailedRow = styled.div`
  min-width: 550px !important;
  margin-top: 5px;
`;

const ErrorMsgDiv = styled.div`
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 26px;
  max-width: 564px;
`;

const HeadingDownloadWrapper = styled.div`
  display: flex;
  padding: 0 0;
`;

const DownloadText = styled.div`
  color: #233ce6 !important;
  &:hover {
    cursor: pointer;
  }
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 22px;
`;

const DownloadButton = styled.a`
  text-decoration: none;
  margin-left: auto;
  margin-right: 0;
  color: #001e46 !important;
  &:hover {
    text-decoration: none;
    color: #233ce6 !important;
    cursor: pointer;
  }
  font-style: normal;
  font-weight: 800;
  font-size: 14px;
  line-height: 22px;
`;

interface ImportDataType {
  open: boolean;
  setOpen: any;
  importResponseData: any;
  setImportResponseData: any;
  setCleanInputs: any;
  setHandleBtnDisable: any;
  successRecords: any;
  setSuccessRecords: any;
  failedRecords: any;
  setFailedRecords: any;
  ManualEmpBtn: boolean;
  setManualEmpBtn: any;
  EmpResModalCancel: any;
}

const ImportEmployeeRespModal: React.FC<ImportDataType> = (
    props: ImportDataType
) => {
  
    const token = localStorage.getItem('user');

    useEffect(() => {
        let succRecords = [];
        let failRecords = [];

        succRecords = props.importResponseData.filter((d: any) => {
            return d.isSuccess === true;
        });
        failRecords = props.importResponseData.filter((d: any) => {
            return d.isSuccess === false;
        });
        props.setSuccessRecords(succRecords);
        props.setFailedRecords(failRecords);
    }, [props.importResponseData]);

    useEffect(() => {
        if (props.successRecords.length > 0 && props.failedRecords.length === 0) {
            props.setHandleBtnDisable(false);
        }
        if (props.failedRecords.length > 0) {
            props.setHandleBtnDisable(true);
        }
    }, [props, props.successRecords, props.failedRecords]);

    return (
        <>
            <Dialog
                open={props.open}
                keepMounted
                className="p-4"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: {
                        maxHeight: 800,
                    },
                }}
            >
        
                <CloseDialog>
                    <button
                        onClick={() => {
                            props.EmpResModalCancel();
                        }}
                        className="btn-close btn-sm close-assign-license"
                    ></button>
                </CloseDialog>
                <DialogContent>
                    <DialogTop>Employee import report</DialogTop>
                    {props.failedRecords.length === 0 && (
                        <ResultRow className="row">
                            <Box
                                sx={{
                                    bgcolor: 'info.main',
                                    color: 'secondary.contrastText',
                                    p: 2,
                                }}
                            >
                                <CheckCircleOutlinedIcon style={{ marginRight: '10px' }} />
                                {`${props.successRecords.length} employee(s) uploaded successfully and ready for import`}
                            </Box>
                        </ResultRow>
                    )}

                    {props.failedRecords.length !== 0 && (
                        <ResultRow className="row">
                            <Box
                                sx={{
                                    bgcolor: 'rgba(255, 49, 49, 0.8)',
                                    color: '#fff',
                                    p: 2,
                                }}
                            >
                                <DoNotDisturbOnOutlinedIcon style={{ marginRight: '10px' }} />
                                {`${props.failedRecords.length} employee(s) have errors in records`}
                            </Box>
                            <FailedRow className="row">
                                {props.failedRecords.slice(0, 10).map((record: any) => (
                                    <Box>
                                        <Tooltip
                                            title={
                                                record.responseMessage.length +
                          record.employeeId.length >
                        60
                                                    ? `${record.employeeId} ${record.responseMessage}`
                                                    : ''
                                            }
                                            placement="top"
                                            arrow
                                        >
                                            <ErrorMsgDiv>
                                                {record.responseMessage.length +
                          record.employeeId.length >
                        60
                                                    ? `${record.employeeId} ${record.responseMessage} ...`
                                                    : `${record.employeeId} ${record.responseMessage}`}
                                            </ErrorMsgDiv>
                                        </Tooltip>
                                    </Box>
                                ))}
                            </FailedRow>
                        </ResultRow>
                    )}

                    <div className="row mt-3">
                        <HeadingDownloadWrapper>
                            <DownloadText>
                                {props.failedRecords.length > 0 && (
                                    <span>
                                        <ErrorOutlineIcon
                                            sx={{
                                                fontSize: '15px',
                                                marginRight: '5px',
                                                marginTop: '-2px',
                                            }}
                                        />
                    Please correct errors and re-upload file to continue
                                    </span>
                                )}
                            </DownloadText>
                            <DownloadButton 
                                onClick={() => {
                                    getDownloadReport(token);
                                }}
                            >
                                <FileDownloadOutlinedIcon
                                    sx={{ '&:hover': { color: '#233ce6' } }}
                                />
                Download report
                            </DownloadButton>
                        </HeadingDownloadWrapper>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImportEmployeeRespModal;
