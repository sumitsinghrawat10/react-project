import axios from 'axios';
import Swal from 'sweetalert2';

import {
    GET_EXPORT_CLIENT_ORGANIZATIONID,
    GET_ADMINS_BY_ORGANIZATIONID,
} from '../networking/httpEndPoints';

interface ExportResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const exportCompanyData = (
    orgId: any,
    token: any,
    setExportDataVisible: any
) => {
    axios
        .get<ExportResponse>(`${GET_EXPORT_CLIENT_ORGANIZATIONID}${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res: any) => {
            if (res.status === 200 && res.data.isSuccess) {
                setExportDataVisible(true);
                const link: any = document.createElement('a');
                link.href = res.data.result;
                link.setAttribute('download', 'file.xlsx');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setTimeout(() => {
                    setExportDataVisible(false);
                }, 1800);
            } else {
                Swal.fire({
                    text: 'Something went wrong!',
                    confirmButtonText: 'OK',
                    icon: 'error',
                });
            }
        })
        .catch(() => Swal.close());
};

const getAdminsByOrgID = (
    orgId: any,
    token: any,
    setUserList: any,
    setUserId: any,
    currentUserId: number,
    setPrimaryUserId?: any,
    primary = false
) => {
    axios
        .get<ExportResponse>(`${GET_ADMINS_BY_ORGANIZATIONID}${orgId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then((employeeResp: any) => {
            if (
                employeeResp.status === 200 &&
        employeeResp.data.isSuccess === true &&
        employeeResp.data.result !== null
            ) {
                setUserList(employeeResp.data.result);
            } else {
                primary && setPrimaryUserId('');
            }
            setUserId(currentUserId.toString());
        });
};

export { exportCompanyData, getAdminsByOrgID };
