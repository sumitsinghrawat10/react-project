import Button from '../../../../components/Button';
import {Dialog,DialogActions,DialogContent,DialogContentText} from '@mui/material';
interface ImportDataType {
  Title?: string;
  Message: string;
  ConfirmationBtnText: string;
  CancelBtnText?: string;
  onConfirm: any;
  onCancel?: any;
}

const DialogConfirmationBox = (props: ImportDataType) => {
    return (
        <Dialog
            className="p-4 file-manager-dashboard-container"
            open={true}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            disableEscapeKeyDown
        >
            <DialogContent>
                <DialogContentText className="dialog-top">{props.Message}</DialogContentText>
            </DialogContent>
            <DialogActions className="dialog-bottom">
                <Button
									className="DialogBtn"
									type="outlined"
									onClick={props.onConfirm}
									text={props.ConfirmationBtnText || 'Yes'}
									intent="secondary"
                />

                {props.CancelBtnText && props.CancelBtnText.trim() !== '' ? (
                    <Button
											className="DialogBtn"
											type="contained"
											onClick={props.onCancel}
											text={props.CancelBtnText || 'No'}
											intent="primary"
                    />
                ) : null}
            </DialogActions>
        </Dialog>
    );
};

export default DialogConfirmationBox;
