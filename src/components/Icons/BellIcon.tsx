import React, { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { GET_UNREAD_NOTIFICATION_COUNT } from "../../networking/httpEndPoints";

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

interface NotificationsProbs {
  notificationCount?: number;
}
const BellIcon = (_props: NotificationsProbs) => {
  const token = localStorage.getItem("user");
  const [notfiCount, setNotfiCount] = useState(null);
  const [enablePageLink, setEnablePageLink] = useState(false);
  const history = useHistory();

  const handlePageLink = () => {
    if (enablePageLink === true) {
      history.push("/notifications");
      setEnablePageLink(false);
    }
  };

  const getNotificationCount = () => {
    axios
      .get<GetResponse>(`${GET_UNREAD_NOTIFICATION_COUNT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.status === 200 && response.data.isSuccess === true) {
          if(response.data.result.split(":")[1] > 0){
          setNotfiCount(response.data.result.split(":")[1]);
          }
          setEnablePageLink(true);
        } else {
          console.warn("Zero Notification Found");
        }
      });
  };

  useEffect(() => {
    getNotificationCount();
  }, []);

  return (
    <div className="icon-container">
      <Badge badgeContent={notfiCount} color="primary">
        <NotificationsIcon
          className="bellicon-style"
          onClick={handlePageLink}
        />
      </Badge>
    </div>
  );
};
export default BellIcon;
