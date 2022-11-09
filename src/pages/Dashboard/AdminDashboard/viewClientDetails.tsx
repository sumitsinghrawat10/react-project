import { useState, useEffect } from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Button from '../../../components/Button';
import Loader from "../../../components/Loader";
import { exportCompanyData } from '../../../components/ReusableAxiosCalls';
import {
    GET_ORGANIZATION_DETAILS,
    UPDATE_MEMBERSHIP,
} from '../../../networking/httpEndPoints';
import {
    nameFormatter,
    contactPhoneFormatter,
} from '../../../utilities/formatter';
import AlertBox from '../AdminDashboard/AlertBox';
import ResetLinkForm from '../AdminDashboard/ResetLinkForm';
import AddTooltip from '../../../components/AddTooltip';
import historyVaribaleChecker from '../../../utilities/historyVariableChecker';
import SuccessToaster from '../../../components/SuccessToaster';

const LinkWrapper = styled.a<ContainerType>`
  font-weight: 600;
  color: ${(props) => (!props.activeLink ? '#b1b1b1' : '#001e46')};
  text-decoration: none;
  cursor: pointer;
  pointer-events: ${(props) => (!props.activeLink ? 'none' : 'all')};
  :hover {
    color: #233ce6 !important;
  }
`;

type ContainerType = {
  activeLink?: boolean;
};

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface OrganizationDetailsResponse {
  status: number;
  data: {
    clientName: string | null;
    accountNumber: string | null;
    contactName: string | null;
    role: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    clientAddress: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    memberSince: string | null;
    accountType: string | null;
  };
}

const ViewClientDetails = () => {
    const history = useHistory();
    const [data, setData] = useState<any | null>(null);
    const organizationId = historyVaribaleChecker('organizationId', history);
    const [confirmationModalIsVisible, setConfirmationModalIsVisible] =
    useState(false);
    const [open, setOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [finalMessage, setFinalMessage] = useState('');
    const [enablePopUp, setEnablePopUp] = useState(false);
    const [contactEmail, setcontactEmail] = useState('');
    const [exportDataVisible, setExportDataVisible] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const token = localStorage.getItem('user');

    const exportData = () =>{
        setShowLoader(true);
        exportCompanyData(
            organizationId,
            token,
            setExportDataVisible
        );
    };

    const handleResetLink = () => {
        return setOpen(true);
    };

    const checkNull= (value: any) =>{
        if(value) return nameFormatter(value);
        else return '-';
    };

    const handleDisableAlert = () => {
        setEnablePopUp(!data.membershipStatus);
        setFinalMessage('');
        return setAlertOpen(true);
    };
    const resendLinkData = () => {
        setConfirmationModalIsVisible(true);
        setTimeout(() => {
            setConfirmationModalIsVisible(false);
        }, 4000);
    };

    const getOrganizationDetails = () => {
        axios
            .get<OrganizationDetailsResponse>(
                `${GET_ORGANIZATION_DETAILS}${organizationId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => {
                if (res.data.status === 200) {
                    setData(res.data.data);
                    if (
                        res.data.data !== null &&
            res.data.data !== undefined &&
            res.data.data.contactEmail != null
                    ) {
                        setcontactEmail(res.data.data.contactEmail);
                    }
                } else {
                    Swal.fire({
                        text: 'Something went wrong while fetching organization details',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    }).then(function () {
                        history.replace('/');
                    });
                }
            });
    };
    const onSubmit = () => {
        setShowLoader(true);
        const params = {
            organizationId: organizationId,
        };

        if (token !== null) {
            axios
                .put<GetResponse>(UPDATE_MEMBERSHIP, params, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {
                    Swal.close();
                    setShowLoader(false);
                    if (
                        (res.status === 200 || res.status === 201) &&
            res.data.isSuccess
                    ) {
                        setFinalMessage((prevState) => {
                            return res.data.result === 'Active' ? 'enabled' : 'disabled';
                        });

                        setAlertOpen(true);
                    } else if (res.status === 201 && !res.data.isSuccess) {
                        Swal.fire({
                            text: 'Something went wrong.',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    } else {
                        Swal.fire({
                            text: 'Something went wrong!',
                            confirmButtonText: 'OK',
                            icon: 'error',
                        });
                    }
                })
                    .catch(() => {Swal.close();
                        setShowLoader(false);});
        }
    };
    useEffect(() => {
        getOrganizationDetails();
    }, []);
    useEffect(() => {
        if(exportDataVisible === true){
        setShowLoader(false);
        }
    }, [exportDataVisible]);
    const LinkSentToaster = (): JSX.Element => {
        if (confirmationModalIsVisible) {
            return (<SuccessToaster message="Link Sent" />);
        }
        else {
            return (<></>);
        }
    };

    const LoaderElement = (): JSX.Element => {
        if(showLoader || !data)
        {
            return <Loader/>;
        }
        else {
            return <></>;
        }
    };
    return (
        <div className="admin-dashboard-container">
            <div className="container dashboard-container DashboardContainer">
                <ResetLinkForm
                    setOpen={setOpen}
                    open={open}
                    resendLinkData={resendLinkData}
                    emailId={contactEmail}
                />
                <AlertBox
                    alertOpen={alertOpen}
                    isEnabledPopUp={enablePopUp}
                    isAnswerEnabled={finalMessage}
                    handleAlertYes={() => {
                        setAlertOpen(false);
                        onSubmit();
                    }}
                    handleAlertNo={() => {
                        setAlertOpen(false);
                    }}
                    handleAlertContinue={() => {
                        setAlertOpen(false);

                        getOrganizationDetails();
                    }}
                />
                <div className="d-flex flex-row">
                    <div className="page-title">Client Details</div>
                    <div className="EditBackContainer">
                        <span className="EditBackWrapper"
                            onClick={() =>
                                history.push('/edit-client', { data, organizationId })
                            }
                        >
            Edit
                        </span>
          &nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="EditBackWrapper" onClick={() => history.push('/')}>
            Back
                        </span>
                    </div>
                </div>
								<LoaderElement/>
                {data && (
                    <>
                        <p className="SubTitleView">Client Name</p>
                        <p className="RowWrapperView">
                         <AddTooltip value={checkNull(data.clientName)} len={80} />
                        </p>
                        <p className="SubTitleView">Account Number</p>
                        <p className="RowWrapperView">{(data.accountNumber) || '-'}</p>
                        <div className="d-flex flex-row">
                            <div className="InnerWrap">
                                <p className="SubTitleView">Contact Name</p>
                                <p className="RowWrapperView">
                                    <AddTooltip value={checkNull(data.contactName)} len={40} />
                                </p>
                            </div>
                            <div>
                                <p className="SubTitleView">Role</p>
                                <p className="RowWrapperView">
                                    {checkNull(data.role)}
                                </p>
                            </div>
                        </div>
                        <p className="SubTitleView">Contact Email</p>
                        <p className="RowWrapperView"><AddTooltip value={data.contactEmail || '-'} len={30} /></p>
                        <p className="SubTitleView">Contact Phone</p>
                        <p className="RowWrapperView">
                            {data.contactPhone ? contactPhoneFormatter(data.contactPhone) : '-'}
                        </p>
                        <p className="SubTitleView">Client Address</p>
                        <p className="RowWrapperView">
                            <AddTooltip value={data.clientAddress ? `${nameFormatter(data.clientAddress)}, ` : ''} len={120} />
                            {data.city ? `${nameFormatter(data.city)}, ` : ''}
                            {data.state ? `${nameFormatter(data.state)}, ` : ''}
                            {data.zip ? `${nameFormatter(data.zip)}` : ''}
                        </p>
                        <div className="d-flex flex-row">
                            <div className="InnerWrap">
                                <p className="SubTitleView">Member Since</p>
                                <p className="RowWrapperView">
                                    {moment(data.memberSince).format('MM/DD/YYYY') || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="SubTitleView">Account Type</p>
                                <p className="RowWrapperView">{data.accountType || '-'} </p>
                            </div>
                        </div>
                        <div className="d-flex flex-row">
                            <div className="InnerWrap">
                                <p className="SubTitleView">Membership Status</p>
                                <p className={`RowWrapperView
																	${data.membershipStatus ? 'StatusColorBlue' : 'StatusColorRed'}`}
																>
																	{data.membershipStatus ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div>
                                <p className="SubTitleView">Account Options</p>
                                <LinkWrapper
                                    style={{ marginRight: '65px'}}
                                    activeLink={!data.membershipStatus}
                                    onClick={handleDisableAlert}
                                >
                Enable Account{' '}
                                </LinkWrapper>
                                <LinkWrapper
                                    activeLink={data.membershipStatus}
                                    onClick={handleDisableAlert}
                                >
                Disable Account{' '}
                                </LinkWrapper>
                            </div>
                        </div>
                        <hr className="HrLine"></hr>
                        <div className="d-flex flex-row">
                            <div>
                                <p className="SubTitleView">Account Options</p>
                                <LinkWrapper activeLink={true} onClick={handleResetLink}>
                Resend Activation Link
                                </LinkWrapper>
                                <LinkWrapper className="AnchorWrapper" activeLink={true}>
                  Delete Client Account
                                </LinkWrapper>
                            </div>
                            <div className="ButtonWrapperView">
                                <Button
                                    intent="primary"
                                    className="mb-3 ExportButtonView"
                                    type="contained"
                                    onClick={()=>{
                                        exportData();
                                    }}
                                    text="Export Data"
                                />
                            </div>
                        </div>
                        <LinkSentToaster/>
                        {exportDataVisible && (
                            <div className="TextPinWrapperView">
                                <div className="TextPinView">
                                    <span className="ms-2">
                                        {' '}
                  Data has been downloaded successfully
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewClientDetails;
