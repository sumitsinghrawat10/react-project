import React, { useEffect, useState, Dispatch} from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
import moment from 'moment';
import eventBus from '../../../../hoc/eventBus';
import {
    DirectorOfCompliance,
    SystemAdministrator,
} from '../../../../utilities/constants';
import { roleValidator } from '../../../../utilities/roleValidator';
import DialogConfirmationBox from '../ConfirmationDialogBox/dialogConfirmationBox';
import SuccessToaster from '../../../../components/SuccessToaster';

interface ImportDataType {
    id: number;
    CreatedAt: string;
    handleSingleFileDelete: any;
    isDownloadActive: boolean;
    setIsDownloadActive: Dispatch<React.SetStateAction<boolean>>;
}
interface DashboardType {
    user: {
        user?: string;
        role?: string;
        userId?: number | null;
        initialSetup?: string;
        navVisible?: boolean;
    };
}

const IconButtonMenu: React.FC<ImportDataType> = (props: ImportDataType) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const ITEM_HEIGHT = 48;
    const [downloadAlert, setDownloadAlert] = useState(false);
    const [singleDownloadActive, setSingleDownloadActive] = useState(false);
    const userState = useSelector((state: DashboardType) => state.user);

    useEffect(() => {
        if (props.isDownloadActive) setIsConfirmationDialog(false);
    }, [props.isDownloadActive]);

    const eventInitiatedFun = () =>{
        addEvents();
            return () => {
                removeEvents();
            };
        }

    const addEvents = () => {
        setSingleDownloadActive(true);
        eventBus.on('donwloadCompleted', handleDownloadCompleted);
    };

    const removeEvents = () => {
        eventBus.remove('donwloadCompleted');
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSingleDownloadFile = (e: any, documentId: number) => {
        setSingleDownloadActive(true);
        setDownloadAlert(true);
        eventInitiatedFun();
        props.setIsDownloadActive(true);
        const singleFile = [{ documentId: documentId }];
        eventBus.dispatch('initiateDownload', { downloadFiles: singleFile });
        setTimeout(() => {
            setDownloadAlert(false);
        }, 4000);
        handleClose();
    };

    const [isConfirmationDialog, setIsConfirmationDialog] =
        useState<boolean>(false);

    const handleDownloadCompleted = (data: any) => {
        setSingleDownloadActive(false);
        props.setIsDownloadActive(false);
    };

    return (
        <>
            <div className='file-manager-dashboard-container'>
                <IconButton color="primary"
                    aria-label="File-Menu"
                    id={`File-Menu-Button-${props.id}`}
                    aria-controls={open ? `file-menu-${props.id}` : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <MoreHorizIcon className="file-menu-icon" />
                </IconButton>
                <Menu
                    id={`file-menu-${props.id}`}
                    MenuListProps={{
                        'aria-labelledby': `File-Menu-Button-${props.id}`,
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    onClose={handleClose}
                    PaperProps={{
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '22ch',
                        },
                    }}
                >
                    <MenuItem onClick={handleClose} disabled >
                        {`Uploaded ${moment(props.CreatedAt).format("MM/DD/YY")}`}
                    </MenuItem>
                    <MenuItem onClick={(e) => handleSingleDownloadFile(e, props.id)}
                        sx={{
                            '&:hover': {
                                color: '#233ce6',
                            }
                        }}
                    >
                        Download
                    </MenuItem>
                    {(roleValidator(userState['role']) === SystemAdministrator ||
                        roleValidator(userState['role']) === DirectorOfCompliance) && (
                            <MenuItem
                                sx={{
                                    '&:hover': {
                                        color: '#233ce6',
                                    }
                                }}
                                key={props.id}
                                value={`${props.id}`}
                                onClick={() => {
                                    if (props.isDownloadActive || singleDownloadActive) {
                                        setDownloadAlert(true);
                                        setTimeout(() => {
                                            setDownloadAlert(false);
                                        }, 4000);
                                        handleClose();
                                    } else {
                                        setDownloadAlert(false);
                                        setIsConfirmationDialog(true);
                                        handleClose();
                                    }
                                }}
                            >
                                Delete
                            </MenuItem>
                        )}
                </Menu>
                {isConfirmationDialog ? (
                    <DialogConfirmationBox
                        Message="Are you sure you want to delete this file?"
                        onConfirm={() => {
                            props.handleSingleFileDelete(`${props.id}`);
                            setIsConfirmationDialog(false);
                            handleClose();
                        }}
                        onCancel={() => setIsConfirmationDialog(false)}
                        ConfirmationBtnText="Yes"
                        CancelBtnText="No"
                    ></DialogConfirmationBox>
                ) : null}
                {downloadAlert && (
                    <SuccessToaster message="Files download in progress" />
                )}
            </div>
        </>
    );
};

export default IconButtonMenu;