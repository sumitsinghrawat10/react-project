import * as React from 'react';

import Button from '../../../components/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

interface AlertState {
    alertOpen: boolean;
    handleAlertYes: any;
    handleAlertNo: any;
    isEnabledPopUp: boolean;
    handleAlertContinue: any;
}

const ArchiveAlertBox: React.FC<AlertState> = (props: AlertState) => {
    return (
        <div className="self-audit">
            <Dialog
                open={props.alertOpen}
                className="d-flex justify-content-center flex-column styled-dailouge-wrapper"
            >
                <DialogContent className="dialogContent">
                    <span className="spanBox">
                        <b>
                            All associated questions will be deleted too, Are you sure you
                            want to continue?
                        </b>
                    </span>
                </DialogContent>
                <div className="d-flex justify-content-center styled-button-wrapper">
                    <span>
                        <DialogActions className="dialogActions">
                            <Button
                                className="ButtonSize"
                                type="contained"
                                intent="primary"
                                onClick={props.handleAlertYes}
                                text="Yes"
                                height={60}
                                width={20}
                            />
                            <Button
                                className="ButtonSize"
                                type="outlined"
                                intent="secondary"
                                onClick={props.handleAlertNo}
                                text="No "
                                height={60}
                                width={20}
                            />
                        </DialogActions>
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default ArchiveAlertBox;
