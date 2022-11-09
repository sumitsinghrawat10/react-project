import React, { useEffect } from 'react';
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import styled from 'styled-components';
import { IBadges } from "../../model/model";

import {
    GET_BADGES_DETAILS,
    GET_PROFILE_DETAILS,
} from '../../networking/httpEndPoints';



const GreyBox = styled.div`
  background: #f9f9f9;
  padding: 15px 15px;
  height: 305px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0px;
    height: 0.625rem;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #b1b1b1;;
    border-radius: 0.313rem;
  }

  ::-webkit-scrollbar-track {
    background-color: $white;
  }
  .table td {
    border-bottom-width: 0 !important;
    font-size: 15px;
  }
  .table th {
    border-bottom: 2px solid #233ce6
    ;
  }
  .BadgeBoxCard {
    width: 330px;
    display: inline-block;
    border: 1px solid #233ce6;
    border-radius: 5px;
    background-color: #ffffff;
    margin-right: 10px;
    padding: 15px 20px 0 20px;
    .blueBottomBorder {
      border-bottom: 1px solid #233ce6;
    }
    .BadgeBoxCardInner {
      margin-bottom: 10px;
      h6 {
        font-weight: 600;
        font-size: 16px;
      }
      p {
        font-size: 15px;
        font-weight: 400;
      }
    }
  }
`;

 const BadgeIdWrap = styled.p`
  width: 100%;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

  interface BadgeType {
    setBadgesChildState? :(object : IBadges) => void;
    employeeId : number | null;
    badges : Array<object> | null
  }

  interface DataResponse {
    isSuccess: boolean;
    responseMessage: string;
    result: any;
  }

const BadgeBoxCard = (props : BadgeType) => {
    const [Badges, setBadges] = React.useState<any[]>([]);
    const token = localStorage.getItem('user');


    const getBadges = () => {
        axios
            .get<DataResponse>(`${GET_BADGES_DETAILS}${props.employeeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (response.data.result !== null) {
                    setBadges(response.data.result);
                    if(props.setBadgesChildState!==undefined)
                    {
                        props.setBadgesChildState(response?.data.result);
                    }
                }
            });
    };

    const getMyProfile = () => {
        if(props.badges !== null){
            setBadges(props.badges);
        }
    };

    useEffect(() => {
        if(props.employeeId){
            getBadges();
        }
        else{
            getMyProfile();
        }
    }, []);

    return (
        <GreyBox>
            {Badges &&
                Badges.map((badge, index) => (
                    <div className="BadgeBoxCard" key={index}>
                        <div className="BadgeBoxCardInner blueBottomBorder">
                        <div className="badgeIdStatus">
                <h6>Badge Number</h6>

                {badge.status === "Expiring Soon" && (
                  <Tooltip title="Badge expiring soon" placement="bottom" arrow>
                     <WarningAmberIcon className="warning-style"/>
                  </Tooltip>
                )}
                {badge.status === "Expired" && (
                  <Tooltip title="Badge expired" placement="bottom" arrow>
                   <WarningAmberIcon className="warning-style"/>
                  </Tooltip>
                )}
              </div>
                            <Tooltip
                                title={
                                    badge.badgesName.length > 24 ? badge.badgesName : ''
                                }
                                placement="top"
                                arrow
                            >
                                <BadgeIdWrap>
                                    {badge.badgesName.length > 24
                                        ? badge.badgesName + '...'
                                        : badge.badgesName}
                                </BadgeIdWrap>
                            </Tooltip>
                        </div>
                        <div className="BadgeBoxCardInner blueBottomBorder d-flex justify-content-between">
                            <div>
                                <h6>Issued Date</h6>
                                <p>{new Date(badge.issueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h6>Expiration Date</h6>

                                <p>
                                    {badge.expirationDate === '' ? '' : new Date(badge.expirationDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="BadgeBoxCardInner d-flex justify-content-between align-item-center">
                            <div>
                                <h6>Issued From</h6>
                                {badge.issuedFromValue}
                            </div>
                        </div>
                    </div>
                ))}
        </GreyBox>
    );
};

export default BadgeBoxCard;