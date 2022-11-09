import React, { useEffect, useRef, useState } from "react";

import axios from "axios";
import moment from "moment";
import { useSelector, connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import eventBus from "../../hoc/eventBus";
import {
  GET_PROFILE_PICTURE,
  GET_MENU_ITEMS,
} from "../../networking/httpEndPoints";
import DownloadDocuments from "../../pages/Dashboard/File Manager/DownloadDocuments";
import * as LogoutActions from "../../pages/Login/authenticationActions";
import { IdleTimeOutModal } from "../../pages/Login/IdleTimeOutModal";
import { RootState } from "../../redux/rootReducer";
import { UserProfilePicture } from "../../store/profilePictureStore";
import { UserProfilePictureName } from "../../store/profilePictureNameStore";
import {
  RegTechAdmin,
  RegTechWriter,
  SystemAdministrator,
} from "../../utilities/constants";
import { ChorusStackedLogo } from "../../utilities/ChorusStackedLogo";
import { roleValidator } from "../../utilities/roleValidator";
import UserMenu from "./UserMenu";

//Expandable Menu
import { Drawer, DrawerHeader } from "./tabletMenu";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import Loader from "../Loader";
import SwalBox from "../SwalBox";

interface ComponentProps {
  active?: boolean;
}

const borderColor = "#233ce6";
const bgWhite = "#E2E7F0";

const NavButton = styled.div<ComponentProps>`
  border-right: ${(props) =>
    props.active ? `7px solid ${borderColor}` : "none"};
  background: ${(props) => (props.active ? `${bgWhite}` : "transparent")};
  .bi {
    font-size: 20px;
  }
`;

interface MenuResponseType {
  status: number;
  message: string;
  data?: any;
}
interface ProfilePicResponseType {
  isSuccess: boolean;
  responseMessage: string;
  result?: any;
}
interface DashboardType {
  user: {
    token?: string;
    role?: string;
    roleDescription?: string;
    userId?: number | null;
    user?: string;
    fullName: string;
  };
}
interface HistoryType {
  actions: typeof LogoutActions;
  user: {
    user: string | null;
  };
  timeOutInterval: any;
}

interface MenuType {
  menuName: string;
}

const LeftNav: React.FC<HistoryType> = (props: HistoryType) => {
  const [name, setName] = React.useState("");
  const { profilePicture, addProfilePicture } = UserProfilePicture();
  const { profilePictureName, addProfilePictureName } =
    UserProfilePictureName();
  const [imageName, setImageName] = React.useState("");
  const [rerender, setRerender] = React.useState(false);
  const [writerMenuActive, setWriterMenuActive] = React.useState(false);
  const userState = useSelector((state: DashboardType) => state.user);
  const [menu, setMenu] = React.useState<string[]>([]);
  const [currentMenu, setCurrentMenu] = React.useState("Licenses");
  const [menusesStatus, setMenuesStatus] = React.useState([
    { index: 0, active: false },
  ]);
  const [profileMenuActive, setProfileMenuActive] = React.useState(false);
  const [renderProfilePicture, setRenderProfilePicture] = React.useState(false);
  const [adminMenuActive, setAdminMenuActive] = React.useState(false);
  const leftMenuPanelRef = useRef<any>();

  //Tablet view
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [leftToRight, setLeftToRight] = React.useState("right-arrow");
  const [rightToLeft, setRightToLeft] = React.useState("hide-left-arrow");
  const [userNameDisplay, setUserNameDisplay] = React.useState("user-display");
  const [backdropExpand, setBackdropExpand] =
    React.useState("backdrop-collapsed");

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
    setLeftToRight("hide-right-arrow");
    setRightToLeft("left-arrow");
    setUserNameDisplay(" ");
    setBackdropExpand("backdrop-expand");
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setLeftToRight("right-arrow");
    setRightToLeft("hide-left-arrow");
    setUserNameDisplay("user-display");
    setBackdropExpand("backdrop-collapsed");
  };

  //Idle Logout
  const [showModal, setShowModal] = useState(false);
  const [isLogout, setLogout] = useState(false);
  let timer: any = undefined;
  const events = ["click", "load", "keydown"];
  const eventHandler = () => {
    if (!isLogout) {
      localStorage.setItem("lastInteractionTime", moment().format());
      if (timer) {
        startTimer();
      }
    }
  };

  const history = useHistory();
  const userData = localStorage.getItem("user");

  useEffect(() => {
    if (profilePicture === "") {
      axios
        .get<ProfilePicResponseType>(`${GET_PROFILE_PICTURE}`, {
          headers: {
            Authorization: `Bearer ${userState["user"]}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.data.isSuccess) {
            setRenderProfilePicture(true);
            addProfilePicture(response.data.result.imageData);
            addProfilePictureName(response.data.result.profileImageName);
          }
        })
        .catch((exception) => {
          if (exception.response.status === 401) {
            loggingUserOut();
          }
        });
    }
  }, []);

  useEffect(() => {
    if (profilePictureName) {
      setImageName(profilePictureName);
    }
  }, [profilePictureName]);

  const handleLogout = (e: any) => {
    eventBus.dispatch("stopDownload", { downloadFiles: [{ documentId: 0 }] });
    e.preventDefault();
    setMenu([]);
    props.actions.logoutUserAction();
    localStorage.removeItem("user");
    localStorage.removeItem("ActiveIndex");
    addProfilePicture("");
    setRenderProfilePicture(false);
  };
  useEffect(() => {
    if (!userData) {
      setMenu([]);
      props.actions.logoutUserAction();
    }
  }, [userData, props.actions.logoutUserAction]);

  useEffect(() => {
    setMenu([]);
    if (
      roleValidator(userState["role"]) !== RegTechWriter &&
      roleValidator(userState["role"]) !== RegTechAdmin
    ) {
      axios
        .get<MenuResponseType>(`${GET_MENU_ITEMS}`, {
          headers: {
            Authorization: `Bearer ${userState["user"]}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.status === 200 && response.data.message) {
            const data = response.data.data;

            const menuArray: string[] = [];
            let menuIndex = 0;
            data.forEach((element: MenuType) => {
              menuArray.push(element.menuName);
              menusesStatus.push({
                index: menuIndex,
                active: false,
              });
              menuIndex += 1;
            });
            updateMenuStatus(menuArray);
          }
        })
        .catch((exp) => {
          if (exp.response.status === 401) {
            loggingUserOut();
          }
        });
    }
  }, []);

  const updateMenuStatus = (menuArray: string[]) => {
    if (menuArray[menuArray.length - 2] === "Company Settings") {
      [menuArray[menuArray.length - 2], menuArray[menuArray.length - 1]] = [
        menuArray[menuArray.length - 1],
        menuArray[menuArray.length - 2],
      ];
    }
    setMenu(menuArray);
    if (Number(localStorage.getItem("ActiveIndex")) > 0) {
      menusesStatus[Number(localStorage.getItem("ActiveIndex"))].active = true;
      menusesStatus[0].active = false;
    } else {
      menusesStatus[0].active = true;
    }
    menusesStatus[0].active = true;
    setMenuesStatus(menusesStatus);
  };
  const loggingUserOut = () => {
    setMenu([]);
    localStorage.removeItem("user");
    localStorage.removeItem("ActiveIndex");
    localStorage.setItem("user", "");
    localStorage.setItem("ActiveIndex", "0");
    props.actions.logoutUserAction();
  };
  const writerMenuOptions: string[] = ["SOP", "Self Audit Questions", "Profile Settings"];
  const adminMenuOptions: string[] = ["Admin Dashboard", "Profile Settings"];
  useEffect(() => {
    if (
      roleValidator(userState["role"]) === RegTechWriter || roleValidator(userState["role"]) === RegTechAdmin
    ) {
      setMenu([]);
      menusesStatus.pop();
      if (roleValidator(userState["role"]) === RegTechWriter) {
        loadMenuItems(writerMenuOptions);
      }
      else {
        loadMenuItems(adminMenuOptions);

      }

      if (Number(localStorage.getItem("ActiveIndex")) > 0) {
        menusesStatus[Number(localStorage.getItem("ActiveIndex"))].active =
          true;
      } else {
        menusesStatus[0].active = true;
      }
      setMenuesStatus(menusesStatus);
    }
  }, []);

  const loadMenuItems = (menuOption: string[]) => {
    const menuArray: string[] = [];
    let menuIndex = 0;
    menuOption.forEach((element: string) => {
      menuArray.push(element);
      menusesStatus.push({
        index: menuIndex,
        active: false,
      });
      menuIndex += 1;
    });
    setMenu(menuArray);
  };

  useEffect(() => {
    addEvents();
    return () => {
      removeEvents();
      clearTimeout(timer);
    };
  }, []);

  const startTimer = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () => {
        const lastInteractionTime = localStorage.getItem("lastInteractionTime");
        const diff = moment.duration(
          moment().diff(moment(lastInteractionTime))
        );
        const timeOutInterval = props.timeOutInterval
          ? props.timeOutInterval
          : 1500000;
        if (isLogout) {
          clearTimeout(timer);
        } else {
          if (diff.milliseconds < timeOutInterval) {
            startTimer();
          } else {
            setShowModal(true);
          }
        }
      },
      props.timeOutInterval ? props.timeOutInterval : 1500000
    );
  };

  const addEvents = () => {
    events.forEach((eventName) => {
      window.addEventListener(eventName, eventHandler);
    });
    startTimer();
  };

  const removeEvents = () => {
    events.forEach((eventName) => {
      window.removeEventListener(eventName, eventHandler);
    });
  };

  const handleContinueSession = () => {
    setShowModal(false);
    setLogout(false);
  };

  const handleModalLogout = (e: any) => {
    removeEvents();
    clearTimeout(timer);
    setLogout(true);
    setShowModal(false);
    e.preventDefault();
    setMenu([]);
    props.actions.logoutUserAction();
    localStorage.setItem("user", "");
    localStorage.setItem("ActiveIndex", "0");
    addProfilePicture("");
    setRenderProfilePicture(false);
  };

  const handleModalAutomaticLogout = () => {
    removeEvents();
    clearTimeout(timer);
    setLogout(true);
    setShowModal(false);
    setMenu([]);
    props.actions.logoutUserAction();
    localStorage.setItem("user", "");
    localStorage.setItem("ActiveIndex", "0");
    addProfilePicture("");
    setRenderProfilePicture(false);
    SwalBox("Your session is expired. Please login again.", "info");
  };

  useEffect(() => {
    if (userState["userId"]) {
      setName(userState["fullName"]);
    }
  }, [userState]);

  useEffect(() => {
    if (leftMenuPanelRef.current) leftMenuPanelRef.current.focus();
  }, [leftMenuPanelRef]);

  const writerPathSwitch = (param: string) => {
    switch (param) {
      case "SOP":
        return "/";

      case "Self Audit Questions":
        return "/self-audit-questions";

      case "Profile Settings":
        return "/my-profile";

      default:
        return "";
    }
  };

  const pathSwitch = (param: string) => {
    switch (param) {
      case "Licenses":
        return "/";

      case "Locations":
        return "/locations" || "/location-details";

      case "Tasks":
        return "/tasks" || "/task-details";

      case "Notifications":
        return "/notifications";

      case "Employees":
        return "/employees";

      case "Vehicles":
        return "/vehicles" || "/vehicle-details";

      case "SOP":
        return "/sop";

      case "Company Settings":
        return "/company-settings";

      case "File Manager":
        return "/file-manager";

      default:
        return "";
    }
  };

  const classSwitch = (param: string) => {
    switch (param) {
      case "Licenses":
        return "bi bi-card-text";

      case "Locations":
        return "bi bi-geo-alt";

      case "Tasks":
        return "bi bi-clipboard-check";

      case "Notifications":
        return "bi bi-bell";

      case "Employees":
        return "bi bi-people";

      case "Vehicles":
        return "bi bi-speedometer";

      case "SOP":
        return "bi bi-stopwatch";

      case "Company Settings":
        return "bi bi-gear";

      case "File Manager":
        return "bi bi-folder";

      case "Self Audit Questions":
        return "bi bi-card-text";

      case "Profile Settings":
        return "bi bi-gear";

      case "Admin Dashboard":
        return "bi bi-card-text";

      default:
        return "";
    }
  };

  const handleMenuClick = (el: any, menuIndex: number) => {
    history.push(pathSwitch(el));
    setRerender(!rerender);
    setCurrentMenu(el);
    menusesStatus.forEach((element) => (element.active = false));
    localStorage.setItem("ActiveIndex", menuIndex.toString());
    menusesStatus[menuIndex].active = true;
    handleDrawerClose();
  };

  const handleWriterMenuClick = (el: string, menuIndex: number) => {
    history.push(writerPathSwitch(el));
    setRerender(!rerender);
    menusesStatus.forEach((element) => (element.active = false));
    localStorage.setItem("ActiveIndex", menuIndex.toString());
    menusesStatus[menuIndex].active = true;
    handleDrawerClose();
  };

  const handleMenuKeyPress = (
    e: React.KeyboardEvent<HTMLDivElement>,
    el: any
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      history.push(pathSwitch(el));
      setRerender(!rerender);
      setCurrentMenu(el);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let isMenuChange = false;
    let nextIndex = 0;
    const currentIndex = menu.indexOf(
      menu.filter((element) => element === currentMenu)[0]
    );
    if (e.shiftKey === true) {
      if (e.key === "ArrowDown") {
        nextIndex = currentIndex + 1;
        if (currentIndex === menu.length - 1) {
          nextIndex = currentIndex;
        }
        isMenuChange = true;
      }
      if (e.key === "ArrowUp") {
        nextIndex = currentIndex - 1;
        if (currentIndex === 0) {
          nextIndex = currentIndex;
        }
        isMenuChange = true;
      }
      if (isMenuChange === true) {
        const nextMenu = menu[nextIndex];
        menusesStatus[currentIndex].active = false;
        menusesStatus[nextIndex].active = true;
        setMenuesStatus(menusesStatus);
        setCurrentMenu(nextMenu);
      }
      if (e.key === "Tab") {
        e.preventDefault();
      }
    }
  };

  const leftNavData = (
    <>
      <div className="logo logo-padding">
        <img src={ChorusStackedLogo} alt="Chorus" className="chorus-logo" />
      </div>
      <div className="welcome">Welcome</div>
      {renderProfilePicture && (
        <>
          <map name="edit-profile-map">
            <area
              shape="rect"
              coords="3,3,46,46"
              alt="Edit Profile"
              onClick={() => {
                history.push("/my-profile");
                setRerender(!rerender);
              }}
            />
          </map>
          <div className="AvatarBox">
            {imageName.length === 0 && (
              <img
                className="Avatar"
                src={`data:image/png;base64,${profilePicture}`}
                alt="Profile Picture"
                useMap="#edit-profile-map"
              />
            )}
            {imageName.length !== 0 && (
              <>
                {imageName.split(".")?.pop()?.toLowerCase() === "svg" ? (
                  <img
                    className="Avatar"
                    src={`data:image/svg+xml;base64,${profilePicture}`}
                    alt="Profile Picture"
                    useMap="#edit-profile-map"
                  />
                ) : (
                  <img
                    className="Avatar"
                    src={`data:image/png;base64,${profilePicture}`}
                    alt="Profile Picture"
                    useMap="#edit-profile-map"
                  />
                )}
              </>
            )}
            <button
              className="AvatarEditProfileBtn AvatarEditProfileBtnHover edit-profile-button"
              onClick={() => {
                history.push("/my-profile");
                setRerender(!rerender);
              }}
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
      <div className={userNameDisplay}>
        <div className="user-name">{name}</div>
        <div className="user-role">{userState["roleDescription"]}</div>
      </div>
      {(roleValidator(userState["role"]) === RegTechWriter || roleValidator(userState["role"]) === RegTechAdmin) && (
        <>
          {menu.map((el: string, index: number) => {
            return el === "Profile Settings" ? (
              <>
                <hr className="hr-line logout-margin mt-0" />
                <NavButton
                  className="nav-button"
                  active={menusesStatus[index].active}
                  onClick={() => {
                    handleWriterMenuClick(el, index);
                  }}
                >
                  <i className={classSwitch(el)} />
                  <span className="btn-name">{el}</span>
                </NavButton>
              </>
            ) : (
              <>
                <NavButton
                  className="nav-button"
                  active={menusesStatus[index].active}
                  onClick={() => {
                    handleWriterMenuClick(el, index);
                  }}
                >
                  <i className={classSwitch(el)} />
                  <span className="btn-name">{el}</span>
                </NavButton>
                {(el === "Self Audit Questions" || el === "Admin Dashboard") && (
                  <div className="AlignNav"></div>
                )}
              </>
            );
          })}
        </>
      )}

      {roleValidator(userState["role"]) !== RegTechAdmin &&
        roleValidator(userState["role"]) !== RegTechWriter && (
          <>
            {menu.map((el: string, index: number) => {
              return el === "Company Settings" ? (
                <>
                  <div className="AlignNav"></div>
                  <hr className="hr-line logout-margin mt-0" />

                  <NavButton
                    className="nav-button"
                    active={menusesStatus[index].active}
                    onClick={() => handleMenuClick(el, index)}
                  >
                    <i className={classSwitch(el)} />
                    <span className="btn-name">{el}</span>
                  </NavButton>
                </>
              ) : (
                <UserMenu
                  el={el}
                  index={index}
                  menus={menusesStatus}
                  handleMenuClick={handleMenuClick}
                  classSwitch={classSwitch}
                />
              );
            })}
          </>
        )}
      {roleValidator(userState["role"]) !== SystemAdministrator &&
        roleValidator(userState["role"]) !== RegTechWriter && roleValidator(userState["role"]) !== RegTechAdmin && (
          <hr className="hr-line logout-margin mt-0" />
        )}

      <NavButton className="nav-button logout-margin" onClick={(e) => handleLogout(e)}>
        <i className="bi bi-box-arrow-left" />
        <span className="btn-name">
          Logout
        </span>
      </NavButton>
      <IdleTimeOutModal
        showModal={showModal}
        handleContinue={handleContinueSession}
        handleModalLogout={handleModalLogout}
        handleModalAutomaticLogout={handleModalAutomaticLogout}
      />
    </>
  );

  return (
    <>
      <DownloadDocuments />
      <div
        className="left-nav-container"
        ref={leftMenuPanelRef}
        tabIndex={0}
        onKeyDown={handleMenuKeyDown}
        onKeyPress={(e) => handleMenuKeyPress(e, currentMenu)}
      >
        <ChevronRightIcon className={leftToRight} onClick={handleDrawerOpen} />
        <ChevronLeftIcon className={rightToLeft} onClick={handleDrawerClose} />
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Drawer
            variant="permanent"
            open={drawerOpen}
            className="tablet-drawer"
          >
            {leftNavData}
          </Drawer>
          <Drawer variant="permanent" open={true} className="desktop-drawer">
            {leftNavData}
          </Drawer>
          <div className={backdropExpand} onClick={handleDrawerClose}>
            <Loader />
          </div>
        </Box>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

function mapDispatchToProps(dispatch: any) {
  return {
    actions: bindActionCreators(LogoutActions as any, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftNav);
