import AddClient from "../pages/Client";
import Dashboard from "../pages/Dashboard";
import EditClientDetails from "../pages/Dashboard/AdminDashboard/editClientDetails";
import ViewClientDetails from "../pages/Dashboard/AdminDashboard/viewClientDetails";
import CompanySettings from "../pages/Dashboard/Company Settings";
import CompanyDetailEdit from "../pages/Dashboard/Company Settings/CompanyDetailEdit";
import EmployeeDetails from "../pages/Dashboard/Employee/EmployeeDetails";
import ManageEmployeeDetails from "../pages/Dashboard/Employee/ManageEmployeeDetails";
import FileManager from "../pages/Dashboard/File Manager";
import Locations from "../pages/Dashboard/Locations";
import ViewLocationDetails from "../pages/Dashboard/Locations/ViewLocationDetails";
import Notifications from "../pages/Dashboard/Notification/Notifications";
import SelfAuditQuestions from "../pages/Dashboard/SelfAuditQuestions";
import AddQuestion from "../pages/Dashboard/SelfAuditQuestions/AddQuestion";
import SelfAuditStateCountyOrCity from "../pages/Dashboard/SelfAuditQuestions/AddStateCountyOrCity";
import ViewQuestions from "../pages/Dashboard/SelfAuditQuestions/ViewQuestions";
import SopDashboard from "../pages/Dashboard/SOP";
import CreateNewSOP from "../pages/Dashboard/SOP/createNewSOP";
import SopDetails from "../pages/Dashboard/SOP/SopDetails";
import SopEmployeeBadging from "../pages/Dashboard/SOP/SopEmployeeBadging";
import Tasks from "../pages/Dashboard/Tasks";
import ViewTaskDetails from "../pages/Dashboard/Tasks/ViewTaskDetails";
import Vehicles from "../pages/Dashboard/Vehicles";
import VehicleDetails from "../pages/Dashboard/Vehicles/VehicleDetails";
import DashboardEmployee from "../pages/DashboardEmployee";
import DashboardLicense from "../pages/DashboardLicense";
//import SelfAudit from '../pages/DashboardLicense/SelfAudit';
import ViewLicenseDetails from "../pages/DashboardLicense/ViewLicenseDetails";
import InitialSetup from "../pages/InitialSetup";
import UserProfile from "../pages/UserProfile";
import SelfAudit from "../pages/DashboardLicense/SelfAuditNew";

export const routes = [
  {
    link: "/",
    component: Dashboard,
  },
  {
    link: "/initial-setup",
    component: InitialSetup,
  },
  {
    link: "/add-client",
    component: AddClient,
  },
  {
    link: "/dashboard-license",
    component: DashboardLicense,
  },
  {
    link: "/employees",
    component: DashboardEmployee,
  },
  {
    link: "/view-client",
    component: ViewClientDetails,
  },
  {
    link: "/edit-client",
    component: EditClientDetails,
  },
  {
    link: "/locations",
    component: Locations,
  },
  {
    link: "/location-details",
    component: ViewLocationDetails,
  },
  {
    link: "/my-profile",
    component: UserProfile,
  },
  {
    link: "/license-details",
    component: ViewLicenseDetails,
  },
  {
    link: "/employee-details",
    component: EmployeeDetails,
  },
  {
    link: "/manage-employee-details",
    component: ManageEmployeeDetails,
  },
  {
    link: "/tasks",
    component: Tasks,
  },
  {
    link: "/task-details",
    component: ViewTaskDetails,
  },
  {
    link: "/self-audit",
    component: SelfAudit,
  },
  {
    link: "/file-manager",
    component: FileManager,
  },
  {
    link: "/self-audit-questions",
    component: SelfAuditQuestions,
  },
  {
    link: "/sop-details",
    component: SopDetails,
  },
  {
    link: "/create-sop",
    component: CreateNewSOP,
  },
  {
    link: "/question-details",
    component: ViewQuestions,
  },
  {
    link: "/self-audit-state-county-city",
    component: SelfAuditStateCountyOrCity,
  },
  {
    link: "/sop",
    component: SopDashboard,
  },
  {
    link: "/chorus-sop",
    component: SopEmployeeBadging,
  },
  {
    link: "/edit-sop",
    component: CreateNewSOP,
  },
  {
    link: "/company-settings",
    component: CompanySettings,
  },
  {
    link: "/edit-question",
    component: AddQuestion,
  },
  {
    link: "/add-question",
    component: AddQuestion,
  },
  {
    link: "/vehicles",
    component: Vehicles,
  },
  {
    link: "/vehicle-details",
    component: VehicleDetails,
  },
  {
    link: "/CompanyDetailEdit",
    component: CompanyDetailEdit,
  },
  {
    link: "/notifications",
    component: Notifications,
  },
];
