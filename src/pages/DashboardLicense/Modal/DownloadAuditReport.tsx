import axios from 'axios';
import Swal from 'sweetalert2';
interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result: any;
}

const GetDownloadSelfAuditReport = (
    AUDIT_REPORT_LINK: any,
    licenseId: any,
    versionId: any,
    document: any
) => {
 
    const token = localStorage.getItem('user');
    if (token != null) {
        axios
            .get<GetResponse>(
                `${AUDIT_REPORT_LINK}?LicenseId=${licenseId}&VersionId=${versionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((res: any) => {
                if (res.status === 200 && res.data.responseMessage === 'Success') {
                    const link: any = document.createElement('a');
                    link.href = res.data.result;
                    link.setAttribute('download', 'file.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                }
                Swal.close();
            })
            .catch();
    }
};

export default GetDownloadSelfAuditReport;
