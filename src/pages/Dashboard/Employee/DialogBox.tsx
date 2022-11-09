import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '../../../components/Button';
interface AlertState {
    alertOpen: boolean;
    handleAlertYes: any;
    handleAlertNo: any;
    singleBadge: boolean;
}

const AlertDialog: React.FC<AlertState> = (props: AlertState) => {
    return (
        <>
            <Dialog
                open={props.alertOpen}
                className="employee-dashboard-container d-flex justify-content-center flex-column"
            >
                <div className='DialogWrapper'>
                <DialogContent className="dialogContent">
                    <span className="spanBox">
                        {!props.singleBadge ? (
                            <b>
                                Are you sure you want <br></br> to remove this item ?{' '}
                            </b>
                        ) : (
                            <b>At least one badge is required</b>
                        )}
                    </span>
                </DialogContent>

                <div className="d-flex justify-content-center dialogActions ButtonWrapper">
                    {!props.singleBadge ? (
                        <DialogActions>
                            <Button
                                className="ButtonSize"
                                type="outlined"
                                intent="secondary"
                                onClick={props.handleAlertNo}
                                text="NO "
                                height={60}
                                width={20}
                            />

                            <Button
                                className="ButtonSize"
                                type="contained"
                                intent="primary"
                                onClick={props.handleAlertYes}
                                text="YES"
                                height={60}
                                width={20}
                            />
                        </DialogActions>
                    ) : (
                        <DialogActions>
                            <Button
                                className="ButtonSize"
                                type="contained"
                                intent="primary"
                                onClick={props.handleAlertNo}
                                text="Ok"
                                height={60}
                                width={20}
                            />
                        </DialogActions>
                    )}
                </div>
                </div>
            </Dialog>
        </>
    );
};

export default AlertDialog;
