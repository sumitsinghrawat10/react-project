import * as React from 'react';

import DialogTitle from '@material-ui/core/DialogTitle';
import {
    TextField,
    Button,
    Radio,
    RadioGroup,
    Box
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import styled from 'styled-components';

const DialogWrapper = styled(Dialog)`
  height: 100%;
  width: 100%;
  .dialogContent {
    margin: 30px !important;
    justify-content: left;
    overflow-wrap: break-word;
    font-size: 24px !important;
    text-align: left;
  }
`;
const DivWrapper = styled.div`
width:210px;
`;
const ButtonWrapper = styled.div`
  margin: 0 auto;
  margin-left: 70px !important;
  margin-right: 70px !important;
  @media only screen and (min-width: 1280px) and (max-width: 1499px) {
    max-width: 750px;
  }
  @media (min-width: 1500px) {
    max-width: 977px;
  }
  .dialogActions {
    margin-bottom: 30px;
  }`;

const CloseDialog = styled.div`
  .close-assign-license {
    float: right;
    margin-top: 10px;
    margin-right: 15px;
  }`;

const SaveExitButton = styled(Button)`
  width: 150px;
  height: 50px !important;
`;

interface NotificationState {
    notificationAlertOpen: boolean;
    dialogTitle: string;
    notifyUserChanges: string;
    summaryChanges: string;
    selfAuditNeeded: string;
    setNotifyUserChanges: any;
    setSelfAuditNeeded: any;
    setSummaryChanges: any;
    handleNotificationSave: any;
    handleCancel: any;
}

const NotifyUserDialogBox: React.FC<NotificationState> = (props: NotificationState) => {
    const [summaryTxtLeft, setSummaryTxtLeft] = React.useState<number>(500);
    const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = React.useState(true);
    const [summaryBlank, setSummaryBlank] = React.useState(false);
    
    const enableDisableSubmitButton = (flag: string) => {
        props.setNotifyUserChanges(flag);
        if (flag == '0') {
            props.setSummaryChanges('');
            props.setSelfAuditNeeded('');
            setSummaryTxtLeft(500);
            setIsSubmitButtonDisabled(false);
        }
        else {
            setIsSubmitButtonDisabled(true);
        }
    };

    const onSelfAuditNeedChanges = (selectedValue: string) => {
        if (summaryTxtLeft !== 500 && selectedValue != '') {
            setIsSubmitButtonDisabled(false);
        }
        else {
            setIsSubmitButtonDisabled(true);
        }
    };

    const onSummaryChanges = (summaryValue: string) => {
        if (summaryValue.length > 0 && props.selfAuditNeeded != '') {
            setIsSubmitButtonDisabled(false);
        }
        else {
            setIsSubmitButtonDisabled(true);
        }
    };
    const getSummaryValue = (summarytext: string) => {
        setSummaryTxtLeft((500 - summarytext.length));
        onSummaryChanges(summarytext);
    };

    React.useEffect(() => {
        if(props.summaryChanges.trim().length!==0){
            setSummaryBlank(false);
        }
        return ()=>{
            setSummaryBlank(false);
        };
    },[props.summaryChanges]);
    enum ReqiurdNotificationField {
        SumaryErrorText="don't enter blank value."
    }
    return (
        <DialogWrapper
            open={props.notificationAlertOpen}
            className="d-flex justify-content-center flex-column notify-urer-diaglog-wrapper">
            <CloseDialog>
                <button
                    onClick={() => {

                        setIsSubmitButtonDisabled(true);
                        props.handleCancel();
                    }}
                    className="btn-close btn-sm close-assign-license"
                ></button>
            </CloseDialog>
            <DialogTitle className="dialog-title"    >
                <Box flexGrow={1} textAlign={'center'} ><b>{props.dialogTitle}</b></Box>
            </DialogTitle>
            <DialogContent className="dialogContent">
                <div className='d-flex'>
                    <DivWrapper>
                        <div><FormLabel> Notify users of changes?</FormLabel></div>
                    </DivWrapper>
                    <div className='ms-4'>
                        <RadioGroup
                            name="radio-buttons-answers"
                            aria-labelledby="notifyUserChanges-label"
                            value={props.notifyUserChanges}
                            onChange={(e) => {
                                enableDisableSubmitButton(e.target.value);
                            }}
                            row
                        >
                            <FormControlLabel
                                value="1"
                                control={<Radio />}
                                label={
                                    <span
                                        style={{
                                            fontSize: '16px',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 400,
                                        }}
                                    >
                                        Yes
                                    </span>
                                }
                                style={{ fontWeight: 5 }}
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                            <FormControlLabel
                                value="0"
                                control={<Radio />}
                                label={
                                    <span
                                        style={{
                                            fontSize: '16px',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 400,
                                        }}
                                    >
                                        No
                                    </span>
                                }
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                        </RadioGroup>
                    </div>
                </div>
                <div className='d-flex'>
                    <div  >
                        <TextField
                            sx={{
                                paddingTop: 2,
                                paddingBottom: 2,
                                width: 340,
                                backgroundColor: '#f4f5f8',
                            }}
                            InputProps={{
                                style: {
                                    fontSize: '16px',
                                    color: '#001e46',
                                    fontWeight: 'normal',
                                    backgroundColor: '#f4f5f8',
                                },
                            }}
                            inputProps={{ maxLength: 500 }}
                            multiline
                            rows={3}
                            value={props.summaryChanges}
                            onChange={(e: any) => {
                                props.setSummaryChanges(e.target.value);
                                getSummaryValue(e.target.value);
                                setSummaryBlank(false);
                            }}
                            placeholder="Enter Summary of Changes"
                            disabled={props.notifyUserChanges === '1' ? false : true}
                            variant="filled"
                            type="text"
                            helperText={summaryBlank ? ReqiurdNotificationField.SumaryErrorText : ''}
                            error={summaryBlank}
                            className={`input-form form-control`}
                        />
                    </div>
                </div>
                <div className='d-flex'>
                    <div className="col-sm-7" >
                    </div >
                    <div style={{
                        fontSize: '12px',
                    }}>
                        {summaryTxtLeft} characters remaining
                    </div>
                </div>
                <div className='d-flex'  >
                    <DivWrapper>
                        <div ><FormLabel disabled={props.notifyUserChanges === '1' ? false : true}>Self-Audit needed?</FormLabel></div>
                    </DivWrapper>
                    <div className='ms-4'>
                        <RadioGroup
                            name="radio-buttons-answers"
                            aria-labelledby="selfAuditNeeded-label"
                            value={props.selfAuditNeeded}
                            onChange={(e) => {
                                props.setSelfAuditNeeded(e.target.value);
                                onSelfAuditNeedChanges(e.target.value);
                            }}
                            row
                        >
                            <FormControlLabel
                                disabled={props.notifyUserChanges === '1' ? false : true}
                                value={'1'}
                                control={<Radio />}
                                label={
                                    <span
                                        style={{
                                            fontSize: '16px',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 400,
                                        }}
                                    >
                                        Yes
                                    </span>
                                }
                                style={{ fontWeight: 5 }}
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                            <FormControlLabel
                                disabled={props.notifyUserChanges === '1' ? false : true}
                                value={'0'}
                                control={<Radio />}
                                label={
                                    <span style={{
                                        fontSize: '16px', whiteSpace: 'nowrap', fontWeight: 400,
                                    }}
                                    >
                                        No
                                    </span>
                                }
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 15,
                                    },
                                }}
                            />
                        </RadioGroup>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <ButtonWrapper className="d-flex dialogActions mb-4">
                    <div className="ms-auto mr-2">
                        <SaveExitButton
                            variant="contained"
                            sx={{ backgroundColor: '#233ce6' }}
                            disabled={isSubmitButtonDisabled}
                            onClick={()=>{
                                if((props.notifyUserChanges === "0") ||
                                (props.summaryChanges.trim().length > 0 && props.notifyUserChanges === "1")){
                                setSummaryBlank(false);
                                props.handleNotificationSave();
                            }else{
                                setSummaryBlank(true);
                            }}}>
                            Submit
                        </SaveExitButton>
                    </div>
                </ButtonWrapper>
            </DialogActions>
        </DialogWrapper>
    );
};
export default NotifyUserDialogBox;
