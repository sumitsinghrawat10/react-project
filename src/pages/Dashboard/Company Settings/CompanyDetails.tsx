import { useEffect, useState } from 'react';

import BellIcon from "../../../components/Icons/BellIcon";
import { CircularProgress } from '@mui/material';
import Button from '../../../components/Button';
import axios from 'axios';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import { GET_ZIP_CODE } from '../../../networking/httpEndPoints';
import {
    nameFormatter,
    contactPhoneFormatter,
} from '../../../utilities/formatter';
import { OrganizationDetailsInputs, ZCodeResponse } from './CompanyInterfaces';
import AddTooltip from '../../../components/AddTooltip';


const formatNames = (name: string) => {
    return name ? nameFormatter(name) : '-';
};

const CompanyDetails = (props: OrganizationDetailsInputs) => {
    const [clientCity, setClientCity] = useState('' || null);
    const [clientState, setClientState] = useState('' || null);
    const token = localStorage.getItem('user');

    useEffect(() => {
        GetCityState(props.zipCode);
    }, [props.zipCode]);

    const history = useHistory();
    const {
        clientName,
        contactPhone,
        clientAddress,
        memberSince,
        accountType,
        accountNumber,
        addressid,
        isActive,
        role,
        contactEmail,
        membershipStatus,
        contactName,
        orgId,
        zipCode,
    } = hisoryDataFun(props, history);

    const GetCityState = (zCode: string) => {
        if (zCode != null && zCode !== '') {
            axios
                .get<ZCodeResponse>(`${GET_ZIP_CODE}${zCode}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (res.data.result.length > 0) {
                        const respData: any = res.data.result[0];
                        setClientCity(respData.city);
                        setClientState(respData.state);
                    }
                });
        }
    };

    return (
        <div className="container company-setting-dashboard">
            <div>
                <div className="d-flex flex-row">
                    <div className="page-title">Company Settings</div>
                    <div className="mt-0 ms-5 me-2 ms-auto">
                            <BellIcon />
                        </div>
                </div>
                {!props.clientName && (
                    <div className="LoaderWrapper">
                        <CircularProgress />
                    </div>
                )}
                {props.clientName && (
                    <>
                        <p className="FieldHeading">Client Name</p>
                        <p className="RowWrapperComp">
  {formatNames(props.clientName)} </p>
                        <p className="FieldHeading">Account Number</p>
                        <p className="RowWrapperComp">{props.accountNumber || '-'}</p>
                        <div className="d-flex flex-row">
                            <div className="InnerWrap">
                                <p className="FieldHeading">Contact Name</p>
                                <p className="RowWrapperComp"><AddTooltip value={formatNames(props.contactName)} len={25} /></p>
                            </div>
                            <div>
                                <p className="FieldHeading">Role</p>
                                <p className="RowWrapperComp">{formatNames(props.role)}</p>
                            </div>
                        </div>
                        <p className="FieldHeading">Contact Email</p>
                        <p className="RowWrapperComp"><AddTooltip value={props.contactEmail || '-'} len={25} /></p>
                        <p className="FieldHeading">Contact Phone</p>
                        <p className="RowWrapperComp">
                            {props.contactPhone
                                ? contactPhoneFormatter(props.contactPhone)
                                : '-'}
                        </p>
                        <p className="FieldHeading">Client Address</p>
                        <p className="RowWrapperComp">
                            {props.clientAddress
                                ? `${nameFormatter(
                                    props.clientAddress
                                )}, ${clientCity}, ${clientState}, ${zipCode} `
                                : ''}
                        </p>
                        <div className="d-flex flex-row">
                            <div className="InnerWrap">
                                <p className="FieldHeading">Member Since</p>
                                <p className="RowWrapperComp">
                                    {moment(props.memberSince).format('MM/DD/YYYY') || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="FieldHeading">Account Type</p>
                                <p className="RowWrapperComp">{props.accountType || '-'} </p>
                            </div>
                        </div>
                        <div className="d-flex flex-row">
                            <div className="InnerWrap">
                                <p className="FieldHeading">Membership Status</p>
                                <p className="RowWrapperComp" style={{ color: '#233ce6' }}>
                                    {props.membershipStatus ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                        <hr className="HrLine"></hr>
                        <div className="d-flex flex-row">
                            <div>
                                <p>Account Options</p>

                                <div className="EditBackContainer">
                                    <span className="EditBackWrapper"
                                        onClick={() => {
                                            history.push('/CompanyDetailEdit', {
                                                clientName,
                                                contactPhone,
                                                clientAddress,
                                                memberSince,
                                                accountType,
                                                accountNumber,
                                                addressid,
                                                isActive,
                                                role,
                                                contactEmail,
                                                membershipStatus,
                                                contactName,
                                                orgId,
                                                zipCode,
                                            });
                                        }}
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
                                        props.exportCompanyData(
                                            props.orgId,
                                            props.token,
                                            props.setExportDataVisible
                                        );
                                    }}
                                />
                            </div>
                        </div>
                        {props.exportDataVisible && (
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

export default CompanyDetails;
function hisoryDataFun(props: OrganizationDetailsInputs, history: any) {
    const clientName = history.location.state?.clientName ?? props.clientName;

    const contactPhone =
    history.location.state?.contactPhone ?? props.contactPhone;

    const clientAddress =
    history.location.state?.clientAddress ?? props.clientAddress;

    const memberSince = history.location.state?.memberSince ?? props.memberSince;

    const accountType = history.location.state?.accountType ?? props.accountType;

    const accountNumber =
    history.location.state?.accountNumber ?? props.accountNumber;

    const addressid = history.location.state?.addressid ?? props.addressid;

    const isActive = history.location.state?.isActive ?? props.isActive;

    const role = history.location.state?.role ?? props.role;

    const contactEmail =
    history.location.state?.contactEmail ?? props.contactEmail;

    const membershipStatus =
    history.location.state?.membershipStatus ?? props.membershipStatus;

    const contactName = history.location.state?.contactName ?? props.contactName;

    const orgId = history.location.state?.orgId ?? props.orgId;

    const zipCode = history.location.state
        ? history.location.state.zipCode
        : props.zipCode;
    return {
        history,
        clientName,
        contactPhone,
        clientAddress,
        memberSince,
        accountType,
        accountNumber,
        addressid,
        isActive,
        role,
        contactEmail,
        membershipStatus,
        contactName,
        orgId,
        zipCode,
    };
}
