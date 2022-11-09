import React, { useState, useEffect } from 'react';
import BellIcon from "../../../components/Icons/BellIcon";
import { CircularProgress } from '@mui/material';
import Button from '../../../components/Button';
import axios from 'axios';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { exportCompanyData } from '../../../components/ReusableAxiosCalls';
import {
    GET_ORGANIZATION_DETAILS,
    GET_ORGANIZATION_DETAILS_BY_USER_ID,
} from '../../../networking/httpEndPoints';
import { SystemAdministrator } from '../../../utilities/constants';
import { decodeToken } from '../../../utilities/decodeToken';
import {
    nameFormatter,
    contactPhoneFormatter,
} from '../../../utilities/formatter';
import { roleValidator } from '../../../utilities/roleValidator';
import CompanyDetails from './CompanyDetails';
import AddTooltip from '../../../components/AddTooltip';
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

export interface OrganizationDetailsByUserIdResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: Result;
}

export interface Result {
  isSuccess: boolean;
  responseMessage: any;
  result: Result2;
}

export interface Result2 {
  clientName: any | null;
  contactPhone: any | null;
  clientAddress: any | null;
  memberSince: any | null;
  accountTypeId: number | 0;
  accountType: any | null;
  accountNumber: any | null;
  organizationId: number | 0;
  addressid: any | null;
  isActive: any | null;
  role: any | null;
  contactEmail: any | null;
  membershipStatus: any | null;
  contactName: any | null;
  zipCode: any | 0;
}

interface UserType {
  user: {
    user?: string;
    role?: string;
    userId?: number | null;
    initialSetup?: string;
    navVisible?: boolean;
  };
}

const CompanySettings = () => {
    const token = localStorage.getItem('user');
    const [data, setData] = useState<any | null>(null);
    const [dataByUserId, setDataByUserId] = useState<Result2 | null>(null);
    const userData = decodeToken(token);
    const tokenUserId = userData.UserId;
    const [exportDataVisible, setExportDataVisible] = useState(false);
    const userState = useSelector((state: UserType) => state.user);

    const getClientDetails = () => {
        axios
            .get<OrganizationDetailsResponse>(
                `${GET_ORGANIZATION_DETAILS}${userData.OrgId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => {
                if (res.data.status === 200) {
                    setData(res.data.data);
                } else {
                    Swal.fire({
                        text: 'Something went wrong while fetching organization details',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    });
                }
            });
    };

    const GetCompanyDataByUserId = async (UserId: number) => {
        axios
            .get<OrganizationDetailsByUserIdResponse>(
                `${GET_ORGANIZATION_DETAILS_BY_USER_ID}${UserId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((responseData) => {
                if (responseData.data.isSuccess) {
                    setDataByUserId(responseData.data.result.result);
                } else {
                    Swal.fire({
                        text: 'Something went wrong while fetching Company details',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    });
                }
            });
    };

    const GetOtherRoleContent = () => {
        getClientDetails();
        return (

            <div className="company-setting-dashboard">
                <div className="DashboardContainer container dashboard-container">
                    <div className="d-flex flex-row">
                        <div className="page-title">Company Settings</div>
                        <div className="mt-4 ms-5 me-2 ms-auto">
                            <BellIcon />
                        </div>
                    </div>
                    {!data && (
                        <div className="LoaderWrapper">
                            <CircularProgress />
                        </div>
                    )}
                    {data && (
                        <>
                            <p className="FieldHeading">Client Name</p>
                            <p className="RowWrapperComp">{formatNames(data.clientName)}</p>
                            <p className="FieldHeading">Account Number</p>
                            <p className="RowWrapperComp">{data.accountNumber || '-'}</p>
                            <div className="d-flex flex-row">
                                <div className="InnerWrap">
                                    <p className="FieldHeading">Contact Name</p>
                                    <p className="RowWrapperComp"><AddTooltip value={formatNames(data.contactName)} len={25} /></p>
                                </div>
                                <div>
                                    <p className="FieldHeading">Role</p>
                                    <p className="RowWrapperComp">{formatNames(data.role)}</p>
                                </div>
                            </div>
                            <p className="FieldHeading">Contact Email</p>
                            <p className="RowWrapperComp"><AddTooltip value={data.contactEmail || '-'} len={25} /></p>
                            <p className="FieldHeading">Contact Phone</p>
                            <p className="RowWrapperComp">
                                {data.contactPhone
                                    ? contactPhoneFormatter(data.contactPhone)
                                    : '-'}
                            </p>
                            <p className="FieldHeading">Client Address</p>
                            <p className="RowWrapperComp">
                                {data.clientAddress
                                    ? `${nameFormatter(data.clientAddress)}, `
                                    : ''}
                                {data.city ? `${nameFormatter(data.city)}, ` : ''}
                                {data.state ? `${nameFormatter(data.state)}, ` : ''}
                                {data.zip ? `${nameFormatter(data.zip)}` : ''}
                            </p>
                            <div className="d-flex flex-row">
                                <div className="InnerWrap">
                                    <p className="FieldHeading">Member Since</p>
                                    <p className="RowWrapperComp">
                                        {moment(data.memberSince).format('MM/DD/YYYY') || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="FieldHeading">Account Type</p>
                                    <p className="RowWrapperComp">{data.accountType || '-'} </p>
                                </div>
                            </div>
                            <div className="d-flex flex-row">
                                <div className="InnerWrap">
                                    <p className="FieldHeading">Membership Status</p>
                                    <p className="RowWrapperComp" style={{ color: '#233ce6' }}>
                                        {data.membershipStatus ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                            <hr className="HrLine"></hr>
                            <div className="d-flex flex-row">
                                <div>
                                    <p className="FieldHeading">Account Options</p>

                                    <div className="EditBackContainer">
                                        <span className="EditBackWrapper"
                                        >
                      Edit Contact Info
                                        </span>
                                    </div>
                                </div>
                                <div className="ButtonWrappercomp">
                                <Button
                                        className="ExportButton mb-3"
                                        intent="primary"
                                        type="contained"
                                        text="Export Data"
                                        onClick={() => {
                                            exportCompanyData(
                                                userData.orgId,
                                                token,
                                                setExportDataVisible
                                            );
                                        }}

                                    />
                                </div>
                            </div>
                            {data.exportDataVisible && (
                                <div className="TextPinWrapper">
                                    <div className="TextPin">
                                        <span className="ms-2"> Data Successfully Exported</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const RoleBaseRendering = () => {
        return roleValidator(userState['role']?.toLowerCase()) !== SystemAdministrator
            ? GetOtherRoleContent()
            : GetSystemAdminRoleContent();
    };

     useEffect(() => {
        if(userState['role']?.toLowerCase() !== SystemAdministrator.toLowerCase())
        {
            getClientDetails();
        }
    }, [userState['role']]);

    const GetSystemAdminRoleContent = () => {
        useEffect(() => {
            GetCompanyDataByUserId(tokenUserId);
        }, []);

        return (
            <CompanyDetails
                clientName={dataByUserId?.clientName}
                contactPhone={dataByUserId?.contactPhone}
                clientAddress={dataByUserId?.clientAddress}
                memberSince={dataByUserId?.memberSince}
                accountType={dataByUserId?.accountType}
                accountNumber={dataByUserId?.accountNumber}
                role="System Administrator"
                contactEmail={dataByUserId?.contactEmail}
                membershipStatus={dataByUserId?.membershipStatus}
                contactName={dataByUserId?.contactName}
                addressid={dataByUserId?.addressid}
                isActive={dataByUserId?.isActive}
                exportCompanyData={exportCompanyData}
                orgId={userData.OrgId}
                token={token}
                setExportDataVisible={setExportDataVisible}
                exportDataVisible={exportDataVisible}
                zipCode={dataByUserId?.zipCode}
            ></CompanyDetails>
        );
    };

    const formatNames = (name: string) => {
        return name ? nameFormatter(name) : '-';
    };

    return RoleBaseRendering();
};

export default CompanySettings;