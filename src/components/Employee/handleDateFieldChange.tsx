import React , {Dispatch} from 'react';

import moment, { MomentInput } from 'moment';

export type BadgeType = {
    badgesName: string | null;
    issueDate: string | null;
    expirationDate: string | null;
    issuedFrom: string;
    badgesNameError: boolean;
    issueDateError: boolean;
    expirationDateError: boolean;
    issuedFromError: boolean;
    issueDateIsBlank: boolean;
    expirationDateIsBlank: boolean;
};
export type licenseFields = {
    licenseId: number | null;
    licenseTypeId: number | null;
    licenseUsageId: number[] | null;
    licenseLevelId: number | null;
    licenseNumber: string | null;
    issueDate: string | undefined;
    expirationDate: string | undefined;
    issuingAuthority: string | null;
    organizationId: number | null;
    organizationLocationId: number | null;
    status: string | null;
    createdBy: number | null;
    licenseUsageError: boolean;
    licenseNumberError: boolean;
    issueDateError: boolean;
    expirationDateError: boolean;
    issuingAuthorityError: boolean;
    licenseTypeError: boolean;
    licenseLevelError: boolean;
    issueDateIsBlank: boolean;
    expirationDateIsBlank: boolean;
    showWarning: boolean;
};

type commonKeysInBadgeLicense = {
    issueDateError: boolean;
    expirationDateError: boolean;
};

type commonKeysInBadgeLicenseTwo = {
    issueDate: string | Date;
    expirationDate: string | Date;
};
const handleDateFieldChange = (value: any,name: string,setIssueDateError:any,
    setIssueDateErrorText:any,setExpirationDateError:any,setExpirationDateErrorText:any,
    setBadgeFields:any,badgeFields:any) => {

    const newFormValues = Object.assign({}, badgeFields);
    newFormValues[name] = String(moment(value).format('MM/DD/YYYY'));
    if (name === 'issueDate') {
        if (
            new Date(newFormValues[name]).setHours(0, 0, 0, 0) >
        new Date().setHours(0, 0, 0, 0)
        ) {
            setIssueDateError(true);
            setIssueDateErrorText('Issue date cannot be a future date');
        } else if (
            moment(newFormValues[name], 'MM/DD/YYYY', true).isValid() === false
        ) {
            setIssueDateError(true);
            setIssueDateErrorText('Please enter date in MM/DD/YYYY');
        }
    }
    if (name === 'expirationDate') {
        if (
            new Date(newFormValues[name]).setHours(0, 0, 0, 0) <=
        new Date(newFormValues['issueDate']).setHours(0, 0, 0, 0)
        ) {
            setExpirationDateError(true);
            setExpirationDateErrorText(
                'Expiration Date cannot be equal or prior to Issue date'
            );
        } else if (
            moment(newFormValues[name], 'MM/DD/YYYY', true).isValid() === false
        ) {
            setExpirationDateError(true);
            setExpirationDateErrorText('Please enter date in MM/DD/YYYY');
        }
    }
    setBadgeFields(newFormValues);
};

export const handleInitalSetupBadgeDateFieldChange = (badgeFieldsForm: BadgeType[],
                                                      i: number, value: Date, name: string,
                                                      formName: string,
                                                      setIssueDateErrorText: Dispatch<React.SetStateAction<string>>,
                                                      setExpirationDateErrorText: Dispatch<React.SetStateAction<string>>,
                                                 ) => {
    badgeFieldsForm[i][name as keyof commonKeysInBadgeLicenseTwo] = String(moment(value).format("MM/DD/YYYY"));
    checkDateFieldChange(name, i, badgeFieldsForm, formName ,setIssueDateErrorText, setExpirationDateErrorText);
};

export const handleInitalSetupLicenseDateFieldChange = (licenseFieldForm: licenseFields[],
                                                        i: number, value: Date, name: string,
                                                        formName: string,
                                                        setIssueDateErrorText: Dispatch<React.SetStateAction<string>>,
                                                        setExpirationDateErrorText: Dispatch<React.SetStateAction<string>>,
                                                       ) => {
    licenseFieldForm[i][name as keyof commonKeysInBadgeLicenseTwo] = String(moment(value).format("MM/DD/YYYY"));
    checkDateFieldChange(name, i, licenseFieldForm, formName ,setIssueDateErrorText, setExpirationDateErrorText);
};


const assignDateErrorText = (dateError: string, message: string,
                             setIssueDateErrorText: Dispatch<React.SetStateAction<string>>,
                             setExpirationDateErrorText: Dispatch<React.SetStateAction<string>>) => {
    if(dateError === "issueDateError"){
      setIssueDateErrorText(message);
    } else {
      setExpirationDateErrorText(message);
    }
};

const checkDateFieldChange = (name: string, i: number, fieldsForm: BadgeType[] | licenseFields[],
                              formName: string,
                              setIssueDateErrorText: Dispatch<React.SetStateAction<string>>,
                              setExpirationDateErrorText: Dispatch<React.SetStateAction<string>>) => {
    if (name === "issueDate") {
        if (
        new Date(String(fieldsForm[i][name as keyof commonKeysInBadgeLicenseTwo])).setHours(0, 0, 0, 0) >
        new Date().setHours(0, 0, 0, 0)
        ) {
            fieldsForm[i]["issueDateError"] = true;
            setIssueDateErrorText(
            formName==="employeeForm" ? "Badge Issue date cannot be a future date" : "Issue date cannot be a future date"
            );
        } else {
            handleInitialSetupDateFieldChangeSub(fieldsForm, name, i, "issueDateError", setIssueDateErrorText,setExpirationDateErrorText);
        }
    }  else if (name === "expirationDate") {
        if (
            new Date(String(fieldsForm[i][name as keyof commonKeysInBadgeLicenseTwo])).setHours(0, 0, 0, 0) <=
            new Date(String(fieldsForm[i]["issueDate" as keyof commonKeysInBadgeLicenseTwo])).setHours(0, 0, 0, 0)
        ) {
            fieldsForm[i]["expirationDateError"] = true;
            setExpirationDateErrorText(
            "Expiration Date cannot be equal or prior to Issue date."
            );
        } else {
            handleInitialSetupDateFieldChangeSub(fieldsForm, name, i, "expirationDateError",setIssueDateErrorText,setExpirationDateErrorText);
        }
    } else {
        return;
    }
};

const handleInitialSetupDateFieldChangeSub = (fieldsFormSub: BadgeType[] | licenseFields[] , name: string, i: number,
                                              Error: string,
                                              setIssueDateErrorText: Dispatch<React.SetStateAction<string>>,
                                              setExpirationDateErrorText: Dispatch<React.SetStateAction<string>>) => {
    const temp = fieldsFormSub[i][name as keyof commonKeysInBadgeLicenseTwo];
    if (
    moment(temp as MomentInput, 'MM/DD/YYYY', true).isValid() === false
    ) {
        fieldsFormSub[i][Error as keyof commonKeysInBadgeLicense] = true;
        assignDateErrorText(Error, "Please enter date in MM/DD/YYYY",setIssueDateErrorText, setExpirationDateErrorText);
    } else {
        fieldsFormSub[i][Error as keyof commonKeysInBadgeLicense] = false;
        assignDateErrorText(Error, "", setIssueDateErrorText, setExpirationDateErrorText);
    }
};

export default handleDateFieldChange;
