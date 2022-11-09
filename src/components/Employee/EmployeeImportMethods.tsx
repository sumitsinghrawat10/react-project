import axios from 'axios';
import Swal from 'sweetalert2';

import {
    DOWNLOAD_TEMPLATE,
    GET_DOWNLOAD_EXCELFILE,
    GET_ALL_EMPLOYEES,
    GET_EXCEL_ERRORS,
} from '../../networking/httpEndPoints';

const DownloadReusableCode = (resp: any) => {
    Swal.close();
    if (resp.status === 200) {
        const url = [resp.data.result];
        const link: any = document.createElement('a');
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }
};

export const getDownloadTemplate = (token: any) => {
    Swal.showLoading();
    axios
        .get(DOWNLOAD_TEMPLATE, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then((resp: any) => {
            DownloadReusableCode(resp);
        });
};

export const getDownloadReport = (token: any) => {
    Swal.showLoading();
    axios
        .get(GET_DOWNLOAD_EXCELFILE, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then((resp: any) => {
            DownloadReusableCode(resp);
        });
};

export const GetEmployee = (props: any) => {
    const token = localStorage.getItem('user');
    if (token !== null) {
        Swal.showLoading();
        axios
            .get(GET_ALL_EMPLOYEES, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res: any) => {
                Swal.close();
                if (res.status === 200 && res.data.isSuccess === true) {
                    const data = res.data.result;
                    props.setEmployees(data);
                }
            })
            .catch(() => Swal.close());
    }
};

export const getExcelErrors = (setExcelError: any,setDeleteBtnDisable: any,setOpen: any,setHandleBtnDisable: any, token: any) => {
    if (token !== null) {
        Swal.showLoading();
        axios
            .get(GET_EXCEL_ERRORS, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    setExcelError(res.data);
                    setDeleteBtnDisable(false);
                    setOpen(true);
                    setHandleBtnDisable(true);
                } else {
                    Swal.fire({
                        text: 'Something went wrong!',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    });
                }
                Swal.close();
            })
            .catch(() => Swal.close());
    }
};

export const AlertMsgForInvalidExlTemplate = (error: any, isConfirmFunction: any) => {
    if (error.response.status === 400) {
        Swal.fire({
            text: error.response.data.title,
            confirmButtonText: 'OK',
            icon: 'error',
            allowOutsideClick: false,
            customClass: { container: 'DashboardEmpSwal' },
        }).then((isConfirm) => {
            isConfirmFunction(isConfirm);
        });
    }  
};
