export interface OrganizationDetailsInput {
  clientName: any | null;
  contactPhone: any | null;
  clientAddress: any | null;
  memberSince: any | null;
  accountType: any | null;
  accountNumber: any | null;
  addressid: any | null;
  isActive: any | null;
  role: any | null;
  contactEmail: any | null;
  membershipStatus: any | null;
  contactName: any | null;
  orgId: any | 0;
  zipCode: any | 0;
}

export interface ZCodeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: [
    { state: string; city: string; country: string; zipCodeCityMapId: number }
  ];
}

export interface UpdateCompanyResponse {
  status: number;
  message: string;
  data: {
    isSuccess: boolean;
    responseMessage: string;
    result: [{ accountNumber: number; organizationId: number }];
  };
}

export interface EmployeeResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

export interface OrganizationDetailsInputs {
  clientName: any | null;
  contactPhone: any | null;
  clientAddress: any | null;
  memberSince: any | null;
  accountType: any | null;
  accountNumber: any | null;
  addressid: any | null;
  isActive: any | null;
  role: any | null;
  contactEmail: any | null;
  membershipStatus: any | null;
  contactName: any | null;
  exportCompanyData: any | false;
  orgId: any | 0;
  token: any;
  setExportDataVisible: any | false;
  exportDataVisible: boolean | false;
  zipCode: any | 0;
}

export interface ContactType {
  open: boolean;
  setOpen: any;
  handleUpdateContact?: any;
  currentUserId: number;
  organzationId: number;
}
