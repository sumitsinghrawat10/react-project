import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '../../../components/Button';


interface AlertState {
  alertOpen: boolean;
  handleAlertNo: any;
  hansleAlertYes : any;
  alertMessage: string;
}

const useStyles = makeStyles({
  root: {
      '& .MuiFilledInput-root:before': {
          borderBottom: 'none!important',
      },
  },
  spanBox: {
    '&.MuiDialogContent-root span': {
        margin: '1.875rem !important',
        fontSize: '1.625rem !important',
        textAlign: 'center',
        overFlowWrap: 'break-word',
    }
  },
  styledDialogWrapper: {
    '&.MuiDialog-root' : {
        height: '100% !important',
        width: '100% !important',
    }
  },
  dialogContent: {
    '&.MuiDialogContent-root' : {
        marginTop: '3.75rem',
        marginLeft: '1.875rem',
        marginRight: '1.875rem',
        justifyContent: 'center !important',
        overFlowWrap: 'break-word',
        fontSize: '1.875rem',
        textAlign: 'center',
    }
  },
  dialogActions: {
    '&.MuiDialogActions-root': {
        marginBottom: '0rem'
    },
    '&.MuiDialogActions-root button': {
        width:' 9.375rem',
        marginBottom: '6.25rem'
    }
  }
});

const AlertDialog: React.FC<AlertState> = (props: AlertState)  => {
    const classes = useStyles();
    return (
        <div className="self-audit">
            <Dialog
                open={props.alertOpen}
                className={`d-flex justify-content-center flex-column ${classes.styledDialogWrapper}`}
            >
                <DialogContent className={`${classes.dialogContent} ${classes.spanBox}`}>
                    <span>
                        <b>{props.alertMessage}</b>
                    </span>
                </DialogContent>
                <div className="d-flex justify-content-center styled-button-wrapper">
                    <DialogActions className={`${classes.dialogActions}`}>
                        <Button type="outlined"
                            text="No"
                            intent="seconday"
                            onClick={props.handleAlertNo}
                        />
                        <Button type="contained"
                          text="Yes"
                          intent="primary"
                          onClick={props.hansleAlertYes}
                        />
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    );
    };

export default AlertDialog;
