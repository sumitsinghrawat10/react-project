let BASE_URL = "";
if (process.env.REACT_APP_ENV === "qa") {
  BASE_URL = "https://api.qa.agricor-regtech.de";
} else if (process.env.REACT_APP_ENV === "stage") {
  BASE_URL = "https://api.staging.agricor-regtech.de";
} else if (process.env.REACT_APP_ENV === "prod") {
  BASE_URL = "https://api.prod.agricor-regtech.de";
} else if (process.env.REACT_APP_ENV === "preprod") {
  BASE_URL = "https://api.preprod.agricor-regtech.de";
} else if (process.env.REACT_APP_ENV === "content") {
  BASE_URL = "https://api.content.agricor-regtech.de";
} else {
  BASE_URL = "https://api.dev.agricor-regtech.de";
}

export const LOGIN = `${BASE_URL}/gateway/identity/token`;
export const USERDETAILS = `${BASE_URL}/gateway/identity/users/`;
export const FORGOT_PASSWORD = `${BASE_URL}/gateway/identity/login/forget-password`;
export const RESEND_ACTIVATION_LINK = `${BASE_URL}/gateway/identity/login/resend-activation-link`;
export const VALIDATE_EMAIL = `${BASE_URL}/gateway/email/validate-email`;

export const UPDATE_PASSWORD = `${BASE_URL}/gateway/identity/login/update-password`;
export const CHANGE_PASSWORD = `${BASE_URL}/gateway/identity/login/change-password`;

export const GET_ZIP_CODE = `${BASE_URL}/gateway/location/region-by-zipcode/`;
export const ADD_CLIENT = `${BASE_URL}/gateway/organization/add`;
export const UPDATE_CLIENT = `${BASE_URL}/gateway/organization/edit`;
export const ADD_LOCATION = `${BASE_URL}/gateway/organization/locations/add`;
export const GET_LOCATION = `${BASE_URL}/gateway/organization/locations/by-id`;
export const UPDATE_LOCATION = `${BASE_URL}/gateway/organization/locations/initial-registration`;
export const GET_IS_EMAIL_EXIST = `${BASE_URL}/gateway/identity/user/is-email-exists`;
export const DELETE_LOCATION = `${BASE_URL}/gateway/organization/locations/id`;

export const UPDATE_SIGNUP_STATUS = `${BASE_URL}/gateway/identity/login/update-sign-up-status`;
export const ADD_EMPLOYEE = `${BASE_URL}/gateway/organization/employee/add`;

export const GET_ALL_ORGANIZATION = `${BASE_URL}/gateway/organization/all`;
export const GET_ORGANIZATION_DETAILS = `${BASE_URL}/gateway/organization/details/`;
export const GET_LICENSE_TYPE = `${BASE_URL}/gateway/license/get-license-type`;
export const GET_LICENSE_LEVEL = `${BASE_URL}/gateway/license/get-license-level`;
export const GET_LICENSE_USAGE = `${BASE_URL}/gateway/license/get-license-usage`;
export const ADD_INITIAL_LICENSE = `${BASE_URL}/gateway/license/add-licenses`;
export const GET_LICENSE = `${BASE_URL}/gateway/organization/license/by-locationId/`;
export const GET_LOCATIONS_BY_ORGANIZATION_ID = `${BASE_URL}/gateway/organization/locations/all`;
export const GET_ALL_ASSIGNED_LICENSES = `${BASE_URL}/gateway/organization/employee/all-licenses-of-user`;
export const UPDATE_LICENSE = `${BASE_URL}/gateway/license/update-licenses`;
export const DELETE_LICENSE = `${BASE_URL}/gateway/organization/license/id`;
export const GET_All_LICENSE = `${BASE_URL}/gateway/license/get-organization-licenses`;
export const GET_EMPLOYEE_BY_LICENSEID = `${BASE_URL}/gateway/organization/employee/all-employees-by-location/`;
export const GET_ALLEMPLOYEES_BY_LICENSEID = `${BASE_URL}/gateway/organization/employee/all-by-license/`;
export const ADD_ASSIGN_LICENSE = `${BASE_URL}/gateway/organization/license/assign`;
export const DOWNLOAD_TEMPLATE = `${BASE_URL}/api/organization/employee/download-template`;
export const GET_LOCATION_DETAILS = `${BASE_URL}/gateway/license/locations/location-by-id/`;
export const GET_ALL_EMPLOYEES = `${BASE_URL}/gateway/organization/employee/all`;
export const GET_MENU_ITEMS = `${BASE_URL}/gateway/identity/user/get-menu-items`;
export const IMPORT_EMPLOYEE_DATA = `${BASE_URL}/gateway/organization/employee/import-data`;
export const GET_LICENSE_DETAILS = `${BASE_URL}/gateway/organization/license/details/`;
export const EDIT_LICENSE = `${BASE_URL}/gateway/organization/license/edit`;

export const GET_EMPLOYEE_DETAILS = `${BASE_URL}/gateway/organization/employee/details/`;
export const GET_LICENSES_DETAILS = `${BASE_URL}/gateway/organization/employee/licenses-by-id/`;
export const GET_BADGES_DETAILS = `${BASE_URL}/gateway/organization/employee/badge-details/`;
export const GET_ALLEMPLOYEES_ASSIGNED_BY_LOCATIONID = `${BASE_URL}/gateway/organization/employee/all-by-assigned-location/`;
export const ADD_EMPLOYEE_LOCATION = `${BASE_URL}/gateway/organization/employee/add-location`;

export const BLOCK_USER = `${BASE_URL}/gateway/identity/login/update-user-status`;
export const Add_Category = `${BASE_URL}/gateway/selfaudit/admin/add-category`;

export const ASSIGN_EMPLOYEE_TO_LICENSES = `${BASE_URL}/gateway/organization/license/assign-employee`;
export const ASSIGN_LICENSES_TO_EMPLOYEE = `${BASE_URL}/gateway/organization/employee/assign-licenses`;
export const GET_TASK_DETAILS = `${BASE_URL}/gateway/organization/task/details/`;
export const GET_ENPLOYEES_LOCATION = `${BASE_URL}/gateway/organization/locations/employees/`;
export const ADD_ASSIGN_LOCATION_TO_EMPLOYEE = `${BASE_URL}/gateway/organization/employee/assign-locations`;
export const EMPLOYEE_BADGE_DETAILS = `${BASE_URL}/gateway/organization/employee/id/`;
export const GET_ALL_LICENSES_BY_LOCATION_IDS = `${BASE_URL}/gateway/license/get-licenses-by-locationids/`;
export const GET_EMPLOYEE_LICENSES_OF_LOCATIONS = `${BASE_URL}/gateway/organization/employee/licenses-of-locations/`;
export const UPDATE_MEMBERSHIP = `${BASE_URL}/gateway/organization/membership-status`;
export const REMOVE_BADGES = `${BASE_URL}/gateway/organization/employee/remove-badges`;
export const UPLOAD_DOCUMENTS = `${BASE_URL}/gateway/organization/upload-documents`;
export const GET_LIST_OF_DOCS = `${BASE_URL}/gateway/organization/documents`;
export const Add_Badge = `${BASE_URL}/gateway/organization/employee/add-badge-details`;
export const DELETE_DOCUMENTS = `${BASE_URL}/gateway/organization/delete-documents`;
export const GET_TASK_DETAILS_BY_EMPLOYEE_ID = `${BASE_URL}/gateway/communication/get-task-details-by-employeeId/`;
export const GET_EXPORT_CLIENT_ORGANIZATIONID = `${BASE_URL}/gateway/organization/export-client/`;
export const GET_ADMINS_BY_ORGANIZATIONID = `${BASE_URL}/gateway/identity/user/get-all-systemadmin-by-organizationid/`;
export const UPDATE_PROFILE = `${BASE_URL}/gateway/identity/user/update-user-profile`;

export const UPDATE_EMPLOYEE_PROFILE = `${BASE_URL}/gateway/identity/user/update-employee-profile`;
export const GET_ALL_ORGANIZATION_LOCATIONS = `${BASE_URL}/gateway/organization/locations/view-all`;
export const GET_ISSUED_FROM = `${BASE_URL}/gateway/organization/issued-from`;

export const CS_GET_ALL_ASSIGNED_LICENSES = `${BASE_URL}/gateway/organization/employee/all-licenses-of-user`;
export const GET_PROFILE_PICTURE = `${BASE_URL}/gateway/organization/profile-picture`;
export const ADD_PROFILE_PICTURE = `${BASE_URL}/gateway/organization/add-profile-picture`;
export const DELETE_PROFILE_PICTURE = `${BASE_URL}/gateway/organization/remove-profile-picture`;
export const GET_ALL_TASK = `${BASE_URL}/gateway/communication/get-dashboard-tasks`;
export const ADD_TASK_NOTE = `${BASE_URL}/gateway/communication/task-createnote`;
export const ADD_TASK = `${BASE_URL}/gateway/communication/license-createdashboardtask`;
export const GET_All_TYPE_LICENSES = `${BASE_URL}/gateway/license/get-type-licenses`;
export const GET_ALL_TASKS_BY_LICENSESID = `${BASE_URL}/gateway/communication/get-task-details-by-license-id/`;
export const EDIT_TASK_DETAILS = `${BASE_URL}/gateway/organization/task/details`;
export const UPLOAD_EMPLOYEES_EXCELFILE = `${BASE_URL}/gateway/organization/employee/upload-excelfile`;
export const GET_DOWNLOAD_EXCELFILE = `${BASE_URL}/gateway/organization/employee/download-excelfile`;
export const DELETE_EXCELFILE = `${BASE_URL}/gateway/organization/employee/excelfile`;
export const MOVE_EXCELDATA_TO_DB = `${BASE_URL}/gateway/organization/employee/move-exceldata-to-db`;
export const GET_EXCEL_ERRORS = `${BASE_URL}/gateway/organization/employee/excel-errors`;
export const GET_DOWNLOAD_DOCUMENT = `${BASE_URL}/gateway/organization/download-document/`;
export const GET_SELF_AUDIT_QUESTIONS = `${BASE_URL}/gateway/selfaudit/questions`;
export const GET_PROFILE_DETAILS = `${BASE_URL}/gateway/organization/employee/myprofile`;
export const GET_UNREAD_NOTIFICATION_COUNT = `${BASE_URL}/gateway/communication/notification/get-unread-notifications-count`;
export const GET_LICENSE_NOTIFICATIONS = `${BASE_URL}/gateway/communication/notification/get-notifications/`;

// get-prev-self-audit-reports Api

export const GET_ROLES = `${BASE_URL}/gateway/identity/user/roles`;
export const GET_PREV_SELF_AUDIT_REPORTS = `${BASE_URL}/gateway/license/selfaudit/get-prev-self-audit-reports/`;
export const GET_SELF_AUDIT_REPORT = `${BASE_URL}/gateway/license/selfaudit/get-self-audit-report-by-licenseid?LicenseId=`;

export const Delete_organization_Documents = `${BASE_URL}/gateway/organization/delete-organization-documents`;
export const GET_SELF_AUDIT_STATUS = `${BASE_URL}/gateway/organization/license/self-audit-button-label/`;
export const START_SELF_AUDIT_LICENSE = `${BASE_URL}/gateway/selfaudit/start-process-for-license`;
export const SAVE_SELF_AUDIT_QUESTIONS = `${BASE_URL}/gateway/selfaudit/save-response`;
export const GET_SELF_AUDIT_REPORT_LINK = `${BASE_URL}/gateway/selfaudit/report-link`;
export const CANCEL_AUDIT = `${BASE_URL}/gateway/selfaudit/cancel`;
export const GET_CATEGORY_STATE_COUNTY_CITY = `${BASE_URL}/gateway/selfaudit/admin/category-state-county-city`;
export const GET_QUESTIONS = `${BASE_URL}/gateway/selfaudit/admin/questions-by-viewtype`;

export const GET_DASHBOARD_SOP_LIST = `${BASE_URL}/gateway/sop/dashboard-data`;
export const GET_USER_SOP_DETAILS = `${BASE_URL}/gateway/sop/usersop/`;
export const GET_USER_DASHBOARD_SOP_LIST = `${BASE_URL}/gateway/sop/dashboard`;
export const ARCHIEVE_QUESTIONS_BY_CATEGORY_STATE_COUNTY_CITY = `${BASE_URL}/gateway/selfaudit/admin/remove-city-state-county-category`;

export const SEARCHBY_COUNTY_STATE_CITY = `${BASE_URL}/gateway/location/search-by-state-county-city`;
export const ADD_CITY_COUNTY_STATE = `${BASE_URL}/gateway/selfaudit/admin/add-city-county-state`;
export const ADD_QUESTION = `${BASE_URL}/gateway/selfaudit/admin/add-question`;
export const REMOVE_QUESTION = `${BASE_URL}/gateway/selfaudit/admin/remove-question`;
export const GET_QUESTION = `${BASE_URL}/gateway/selfaudit/admin/fetch-question/`;
export const EDIT_QUESTION = `${BASE_URL}/gateway/selfaudit/admin/update-question`;

export const UPDATE_CATEGORY_ORDER = `${BASE_URL}/gateway/selfaudit/admin/update-category-order`;
export const UPDATE_QUESTION_ORDER = `${BASE_URL}/gateway/selfaudit/admin/update-question-order`;

// SOP

export const GET_SOP_DETAILS = `${BASE_URL}/gateway/SOP/`;
export const GET_ALL_CATEGORIES = `${BASE_URL}/gateway/SOP/all-categories`;
export const GET_ALL_LOCATIONS = `${BASE_URL}/gateway/location/get-all-locations`;
export const CREATE_METADATA = `${BASE_URL}/gateway/sop/create-metadata`;
export const UPDATE_SOP_DEFINITION = `${BASE_URL}/gateway/sop/definition`;
export const PUBLISH_WRITER_SOP = `${BASE_URL}/gateway/sop/publish-metadata`;
export const UPDATE_SOP_NEEDS_REVISE = `${BASE_URL}/gateway/sop/needs-revise`;
export const UPDATE_SOP_METADATA = `${BASE_URL}/gateway/sop/update-metadata`;
export const GET_SOP_METADATA = `${BASE_URL}/gateway/sop/metadata`;
export const GET_ORGANIZATION_DETAILS_BY_USER_ID = `${BASE_URL}/gateway/organization/details-by-userId/`;
export const UPDATE_COMPANY_SETTINGS = `${BASE_URL}/gateway/organization/company-settings`;
export const CANCEL_DRAFT_SOP = `${BASE_URL}/gateway/sop/cancel-drafted/`;
export const PUBLISH_APPROVE_SOP = `${BASE_URL}/gateway/sop/publish-data/`;
export const GET_ALL_NOTIFICATIONS = `${BASE_URL}/gateway/communication/notification/get-notifications`;
export const DELETE_NOTIFICATIONS = `${BASE_URL}/gateway/communication/notification/delete-notification/`;
export const SOP_EDITEDBY = `${BASE_URL}/gateway/sop/editedby/`;
export const RESET_EDITED_SOP = `${BASE_URL}/gateway/sop/reset/`;
//Vehicle

export const ADD_VEHICLE = `${BASE_URL}/gateway/organization/add-vehicle`;
export const GET_DRIVER_DETAILS = `${BASE_URL}/gateway/organization/employee/driver-details`;
export const GET_ALL_VEHICLE_OF_USER_LOCATION = `${BASE_URL}/gateway/organization/vehicles`;
export const GET_VEHICLE_DETAILS = `${BASE_URL}/gateway/organization/vehicle/`;
export const UPDATE_SOP_STATUS_INREVIEW = `${BASE_URL}/gateway/sop/status-inreview`;
export const CHANGE_VEHICLE_IMAGE = `${BASE_URL}/gateway/organization/change-vehicle-image`;
export const DELETE_VEHICLE_IMAGE = `${BASE_URL}/gateway/organization/vehicle-image`;

export const UPDATE_VEHICLE = `${BASE_URL}/gateway/organization/edit-vehicle`;

export const GET_NOTIFICATION_BY_ID = `${BASE_URL}/gateway/communication/notification/get-notifications-by-id/`;
export const UPDATE_READ_UNREAD_NOTIFICATION = `${BASE_URL}/gateway/communication/notification/read-unread-notification`;
export const DELETE_NOTIFICATION = `${BASE_URL}/gateway/communication/notification/delete-notification/`;
export const UPDATE_NOTIFICATION_REMINDER = `${BASE_URL}/gateway/communication/notification/set-notification-reminder`;
export const UPDATE_NOTIFICATION_TASK = `${BASE_URL}/gateway/communication/notification/tasknotification`;
//vehicle excel file
export const DOWNLOAD_VEHICLE_TEMPLATE = `${BASE_URL}/gateway/organization/download-vehicle-import-template`;

export const GET_SELF_AUDIT_CATEGORIES = `${BASE_URL}/gateway/selfaudit/categories`;
export const GET_QUESTIONS_BY_CATEGORY = `${BASE_URL}/gateway/selfaudit/questions-by-category`;

export const UPLOAD_VEHICLES_EXCELFILE = `${BASE_URL}/gateway/organization/upload-vehicle-excelfile`;
export const DELETE_VEHICLES_EXCELFILE = `${BASE_URL}/gateway/organization/vehicle-excel`;
export const MOVE_VEHICLES_EXCELFILE_DB = `${BASE_URL}/gateway/organization/move-vehicledata-to-db`;
export const GET_VEHICLES_EXCEL_ERRORS = `${BASE_URL}/gateway/organization/vehicle-excel-errors`;
export const GET_DOWNLOAD_VEHICLE_EXCELFILE = `${BASE_URL}/gateway/organization/download-vehicle-excelfile`;
