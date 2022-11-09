import React, { useEffect } from 'react';

import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useSelector, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Swal from 'sweetalert2';

import BadgeBoxCard from '../../components/BadgeCard/BadgeBoxCard';
import { useStyles } from '../../components/InputStyles';
import {
    GET_PROFILE_PICTURE,
    DELETE_PROFILE_PICTURE,
    GET_PROFILE_DETAILS,
    UPDATE_PROFILE,
} from '../../networking/httpEndPoints';
import * as UpdateUserInfo from '../../pages/Login/authenticationActions';
import { RootState } from '../../redux/rootReducer';
import { UserProfilePicture } from '../../store/profilePictureStore';
import { UserProfilePictureName } from '../../store/profilePictureNameStore';
import {
    SystemAdministrator,
    DirectorOfCompliance,
    ComplianceAnalyst,
    DirectorOfRetailOperations,
    GeneralManager,
    TeamLead,
} from '../../utilities/constants';
import { ProfilePic } from '../../utilities/ProfilePic';
import { ValidateRole } from "../../utilities/ValidateRole";
import ChangePasswordDailog from './ChangePasswordDailog';
import ChangeProfileDialog from './ChangeProfileDialog';

interface ComponentProps {
    border?: boolean;
}

const BasicInformationBoxRow = styled.div<ComponentProps>`
  margin-left: 20px;
  margin-right: 20px;
  border-bottom: ${(props) => (props.border ? ' 2px solid #233ce6' : 'none')};
  display: flex;
  padding: 15px 0 8px 0;
  p {
    margin-bottom: 0;
    font: normal normal normal 16px Urbanist;
  }
`;
const BasicInfoIcon = styled(PersonOutlineOutlinedIcon)`
  margin-right: 10px;
`;

interface DashboardType {
    user: {
        user?: string;
        role?: string;
        userId?: number | null;
        initialSetup?: string;
        navVisible?: boolean;
        fullName: string;
    };
}
interface ResponseType {
    isSuccess: number;
    responseMessage: string;
    result?: any;
}
interface ProfilePicResponseType {
    isSuccess: boolean;
    responseMessage: string;
    result?: any;
}

interface HistoryType {
    actions: typeof UpdateUserInfo;
    user: {
        user: string | null;
    };
    timeOutInterval: any;
}

const UserProfile: React.FC<HistoryType> = (props: HistoryType) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const userState = useSelector((state: DashboardType) => state.user);
    const [name, setName] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [middleInitial, setMiddleInitial] = React.useState('');
    const [Email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [lastPasswordUpdate, setLastPasswordUpdate] = React.useState('');
    const [editFullName, setEditFullName] = React.useState<boolean>(false);
    const [editProfileInfo, setEditProfileInfo] = React.useState<boolean>(false);
    const [lastNameError, setLastNameError] = React.useState<boolean>(false);
    const [firstNameError, setFirstNameError] = React.useState<boolean>(false);
    const [badges, setBadges] = React.useState<object[]>([]);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
        React.useState<boolean>(false);

    const handleChangeProfilePicBtn = () => {
        setOpen(true);
    };

    const [passOpen, setPassOpen] = React.useState(false);

    const { profilePicture, addProfilePicture } = UserProfilePicture();
    const { profilePictureName, addProfilePictureName } = UserProfilePictureName();
    const [imageName, setImageName] = React.useState("");
    const token = localStorage.getItem('user');

    const handleChangePasswordDailog = () => {
        setPassOpen(true);
    };
    const [loading, setLoading] = React.useState(false);

    const getProfilePicture = () => {
        axios
            .get<ProfilePicResponseType>(`${GET_PROFILE_PICTURE}`, {
                headers: {
                    Authorization: `Bearer ${userState['user']}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (response.data.isSuccess) {
                    addProfilePicture(response.data.result.imageData);
                    addProfilePictureName('profilePic.png');
                }
            });
    };
    const handleDelete = () => {
        Swal.fire({
            title: 'Are you sure you want to delete this profile picture?',
            confirmButtonColor: '#233ce6',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(DELETE_PROFILE_PICTURE, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })
                    .then(() => {
                        getProfilePicture();
                    });
            }
        });
    };

    const GetProfileData = () => {
        axios
            .get<ResponseType>(`${GET_PROFILE_DETAILS}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (response.data.isSuccess && response.data.result.length !== 0) {
                    const userMiddleName : string = response.data.result[0]['middleName'] === null ? "" : response.data.result[0]['middleName'];
                    setEmail(response.data.result[0]['email']);
                    setName(
                        `${response.data.result[0]['firstName']} ${userMiddleName} ${response.data.result[0]['lastName']}`
                    );
                    setFirstName(response.data.result[0]['firstName']);
                    setLastName(response.data.result[0]['lastName']);
                    setMiddleInitial(response.data.result[0]['middleName']);
                    setPassword(response.data.result[0]['password']);
                    const dateString = `${moment(
                        response.data.result[0]['lastPasswordChangeAt']
                    ).format('MMM')} ${moment(
                        response.data.result[0]['lastPasswordChangeAt']
                        ).format('D')} ${moment(response.data.result[0]['lastPasswordChangeAt']).format(
                        'YYYY'
                    )}`;
                    setLastPasswordUpdate(dateString);
                    setImageName(response.data.result[0]['profileImageName']);
                    setBadges(response.data.result[0].badges);
                }
            });
    };
    
    useEffect(() => {
        if(profilePictureName){
          setImageName(profilePictureName);
        }
    }, [profilePictureName]);

    const UpdateProfile = () => {
        if (validateFields()) {
            setLoading(true);
            const params = {
                firstName: firstName,
                lastName: lastName,
                middleName: middleInitial,
                phone: '',
            };

            axios
                .put<ResponseType>(UPDATE_PROFILE, params, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    if (
                        res.status === 200 &&
                        res.data.isSuccess &&
                        res.data.result != null
                    ) {
                        setConfirmationModalIsVisible(true);
                        setTimeout(() => {
                            setConfirmationModalIsVisible(false);
                            setEditFullName(false);
                            setName(`${firstName} ${middleInitial} ${lastName}`);
                            props.actions.ChangeFullName(
                                `${firstName} ${middleInitial} ${lastName}`
                            );
                            setLoading(false);
                        }, 3000);
                        setEditProfileInfo(false);
                        resetValidateFields();
                        resetEditFields();
                    }
                });
        }
    };

    useEffect(() => {
        GetProfileData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        if (e.target.name === 'lastName') {
            setLastName(e.target.value);
        }
        if (e.target.name === 'firstName') {
            setFirstName(e.target.value);
        }
        if (e.target.name === 'middleInitial') {
            setMiddleInitial(e.target.value);
        }
    };

    const validateFields = () => {
        let validate = true;

        if (lastName.trim().length === 0) {
            setLastNameError(true);
            validate = false;
        }
        if (firstName.trim().length === 0) {
            setFirstNameError(true);
            validate = false;
        }

        return validate;
    };
    const resetValidateFields = () => {
        setLastNameError(false);
        setFirstNameError(false);
    };

    const resetEditFields = () => {
        setMiddleInitial('');
        setFirstName('');
        setLastName('');
    };


    const getUpdatedDate = (changedDate: any) => {
        setLastPasswordUpdate(changedDate);
    };

    const BadgeCard = (): JSX.Element => {
        return (<>
          <div className="BadgeCard">
                    {ValidateRole([SystemAdministrator,DirectorOfCompliance,ComplianceAnalyst,DirectorOfRetailOperations,GeneralManager,TeamLead]) && (
                        <div>
                            <div className="mt-4 label-font">
                                <AssignmentIndOutlinedIcon />
                                <b className="badge-label">My Badges</b>
                            </div>
                            <div className="badge-card">
                              { (badges.length > 0) && <BadgeBoxCard employeeId={null} badges={badges}/>}
                            </div>
                        </div>
                    )}
                </div>
        </>);
    };

    return (
        <>
            <div className="container userprofile-container">
                <ChangePasswordDailog
                    setPassOpen={setPassOpen}
                    passOpen={passOpen}
                    newPassDate={getUpdatedDate}
                />
                <ChangeProfileDialog setOpen={setOpen} open={open} />

                <div className="d-flex justify-content-between">
                    <div className="page-title">Profile Settings</div>

                    {editProfileInfo && (
                        <div
                            className="ms-5 me-2 SaveButton"
                            onClick={() => UpdateProfile()}
                        >
                            Save Changes
                        </div>
                    )}
                </div>
                {loading && (
                    <div className="LoaderWrapper">
                        <CircularProgress />
                    </div>
                )}
                {!loading && (
                    <>
                        <div className="my-4 HeaderWrapper">
                            <BasicInfoIcon className='BasicInfoIcon-width' />
                            <b>Basic information</b>
                        </div>
                        <div className="BasicInformationBox">
                            <BasicInformationBoxRow border={true} className="align-row">
                                <div className="col-sm-2">
                                    <h5>
                                        <b>Profile Image</b>
                                    </h5>
                                </div>
                                <div className="col-sm-8">
                                    <p>
                                        Add a photo to personalize your profile. Click on the
                                        thumbnail to Add, delete or change your photo.
                                    </p>
                                </div>
                                <div className="col-sm-2 ProfileImageBoxWrapper">
                                    <div className="ProfileImageBox">
                                        {(!imageName || (imageName && imageName.length === 0)) && (
                                            <img
                                                src={`data:image/png;base64,${profilePicture}`}
                                                alt="Profile"
                                                width="70px"
                                                className="img-fluid rounded-circle my-2 float-right"
                                            />
                                        )}
                                        {imageName && imageName.length !== 0 && (
                                            <>
                                                {imageName.split(".")?.pop()?.toLowerCase() === "svg" && (
                                                    <img
                                                        src={`data:image/svg+xml;base64,${profilePicture}`}
                                                        alt="Profile"
                                                        width="70px"
                                                        className="img-fluid rounded-circle my-2 float-right"
                                                    />
                                                )}
                                                {imageName.split(".")?.pop()?.toLowerCase() !== "svg" && (
                                                    <img
                                                        src={`data:image/png;base64,${profilePicture}`}
                                                        alt="Profile"
                                                        width="70px"
                                                        className="img-fluid rounded-circle my-2 float-right"
                                                    />
                                                )}
                                            </>
                                        )}

                                        <div className="dropdown">
                                            <button
                                                type="button"
                                                className=" EditProfileBtn"
                                                id="dropdownMenuButton1"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                <i className="bi bi-three-dots-vertical MenuIcon" />
                                            </button>
                                            <ul
                                                className="dropdown-menu"
                                                aria-labelledby="dropdownMenuButton1"
                                            >
                                                <li>
                                                    <button
                                                        className="dropdown-item MenuButton"
                                                        onClick={handleChangeProfilePicBtn}
                                                    >
                                                        {ProfilePic === profilePicture
                                                            ? 'Upload'
                                                            : 'Change'}
                                                    </button>
                                                </li>

                                                <li>
                                                    <button
                                                        className="dropdown-item MenuButton"
                                                        onClick={handleDelete}
                                                        disabled={
                                                            ProfilePic === profilePicture ? true : false
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </BasicInformationBoxRow>
                            <BasicInformationBoxRow border={true} className="align-row">
                                <div className="col-sm-2">
                                    <h5>
                                        <b>Name</b>
                                    </h5>
                                </div>
                                {editFullName && (
                                    <>
                                        <div className="col-sm-7 EditFullNameWrapper">
                                            <div className="col-sm-5">
                                                <TextField
                                                    margin="none"
                                                    className={`input-form form-control input-form-margin ${classes.root}`}
                                                    error={lastNameError}
                                                    helperText={
                                                        lastNameError ? 'Last name is required' : ''
                                                    }
                                                    hiddenLabel
                                                    variant="filled"
                                                    placeholder="Enter last name"
                                                    type="text"
                                                    value={lastName}
                                                    name="lastName"
                                                    onChange={(e) => {
                                                        setLastNameError(false);
                                                        handleInputChange(e);
                                                    }}
                                                    InputProps={{
                                                        style: { fontSize: 16, background: '#f4f5f8' },
                                                    }}
                                                    inputProps={{ maxLength: 50, minLength: 1 }}
                                                />
                                            </div>
                                            <div className="col-sm-1">
                                                <TextField
                                                    margin="none"
                                                    className={`input-form form-control input-form-margin ${classes.root}`}
                                                    hiddenLabel
                                                    variant="filled"
                                                    placeholder="M.I."
                                                    type="text"
                                                    value={middleInitial}
                                                    name="middleInitial"
                                                    onChange={(e) => {
                                                        handleInputChange(e);
                                                    }}
                                                    InputProps={{
                                                        style: { fontSize: 16, background: '#f4f5f8' },
                                                    }}
                                                    inputProps={{ maxLength: 1, minLength: 0 }}
                                                />
                                            </div>
                                            <div className="col-sm-5">
                                                <TextField
                                                    margin="none"
                                                    className={`input-form form-control input-form-margin ${classes.root}`}
                                                    error={firstNameError}
                                                    helperText={
                                                        firstNameError ? 'First name is required' : ''
                                                    }
                                                    hiddenLabel
                                                    variant="filled"
                                                    placeholder="Enter first name"
                                                    type="text"
                                                    value={firstName}
                                                    name="firstName"
                                                    onChange={(e) => {
                                                        setFirstNameError(false);
                                                        handleInputChange(e);
                                                    }}
                                                    InputProps={{
                                                        style: { fontSize: 16, background: '#f4f5f8' },
                                                    }}
                                                    inputProps={{ maxLength: 50, minLength: 1 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-3 CancelButtonWrapper">
                                            <CancelOutlinedIcon
                                                onClick={() => {
                                                    setEditFullName(false);
                                                    setEditProfileInfo(false);
                                                    resetValidateFields();
                                                }}
                                                sx={{
                                                    fontSize: '20px',
                                                    '&:hover': { cursor: 'pointer' },
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                                {!editFullName && (
                                    <>
                                        <div className="col-sm-7">
                                            <p>{name}</p>
                                        </div>
                                        <div
                                            className="col-sm-3 EditOption"
                                            onClick={() => {
                                                setEditFullName(true);
                                                setEditProfileInfo(true);
                                            }}
                                        >
                                            <p>Edit</p>
                                        </div>
                                    </>
                                )}
                            </BasicInformationBoxRow>
                            <BasicInformationBoxRow border={false}>
                                <div className="col-sm-2">
                                    <h5>
                                        <b>Password</b>
                                    </h5>
                                </div>
                                <div className="col-sm-7">
                                    <p>
                                        {password}
                                        <br />
                                        {`Last Changed ${lastPasswordUpdate}`}
                                    </p>
                                </div>
                                <div
                                    onClick={handleChangePasswordDailog}
                                    className="col-sm-3 EditOption"
                                >
                                    <p>Change/Update</p>
                                </div>
                            </BasicInformationBoxRow>
                        </div>

                        <div className="my-4 HeaderWrapper">
                            <i className="bi bi-person-lines-fill ContactInfoIcon" />
                            <b> Contact information </b>
                        </div>
                        <div className="BasicInformationBox">
                            <BasicInformationBoxRow border={true} className="border-0">
                                <div className="col-sm-2">
                                    <h5>
                                        <b>Email</b>
                                    </h5>
                                </div>
                                <div className="col-sm-8">
                                    <p>{Email}</p>
                                </div>
                                <div className="col-sm-2 EditOption">

                                </div>
                            </BasicInformationBoxRow>
                        </div>
                    </>
                )}
                <BadgeCard/>
                {confirmationModalIsVisible && (
                    <div className="TextPinWrapper">
                        <div className="TextPin">
                            <CheckCircleOutlineOutlinedIcon></CheckCircleOutlineOutlinedIcon>
                            <span className="ms-2">Changes saved</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state: RootState) => ({
    user: state.user,
});

function mapDispatchToProps(dispatch: any) {
    return {
        actions: bindActionCreators(UpdateUserInfo as any, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
