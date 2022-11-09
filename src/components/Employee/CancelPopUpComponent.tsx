import React, {Dispatch, FC } from 'react';

import DialogWithTwoBtn from '../../components/DialogWithTwoBtn';

interface ImportDataType {
  wizardStepCounter: number,
  activeStep: number,
  open: boolean,
  setOpen: Dispatch<React.SetStateAction<any>>,
  employeeClickYes: Dispatch<React.SetStateAction<any>>,
  employeeClickNo: Dispatch<React.SetStateAction<any>>,
  handleClick: Dispatch<React.SetStateAction<any>>,
  handleClickNo: Dispatch<React.SetStateAction<any>>,
  handleYes: Dispatch<React.SetStateAction<any>>,
  handleNo: Dispatch<React.SetStateAction<any>>
}

const CancelPopUpComponent: FC<ImportDataType> = (props: ImportDataType) => {
    if(props.wizardStepCounter>1 ) {
        if(props.activeStep === 2) {
            return (
                <DialogWithTwoBtn
                    dialogOpen = {props.open}
                    dialogSetOpen = {props.setOpen}
                    message = "Are you sure you want to cancel employee data entry?"
                    yesBtnClick = {props.employeeClickYes}
                    noBtnClick = {props.employeeClickNo}
                    className= "confirmation-dialog-initial-setup initial-setup-wrapper"
                />
            );
        } else {
            return (
                <DialogWithTwoBtn
                    dialogOpen = {props.open}
                    dialogSetOpen = {props.setOpen}
                    message = "Are you sure you want to cancel adding a location?"
                    yesBtnClick = {props.handleClick}
                    noBtnClick = {props.handleClickNo}
                    className= "confirmation-dialog-initial-setup initial-setup-wrapper"
                />
            );
        }
    }
    else {
        if(props.activeStep === 2){
            return (
                <DialogWithTwoBtn
                    dialogOpen = {props.open}
                    dialogSetOpen = {props.setOpen}
                    message = "Are you sure you want to cancel employee data entry?"
                    yesBtnClick = {props.employeeClickYes}
                    noBtnClick = {props.employeeClickNo}
                    className= "confirmation-dialog-initial-setup initial-setup-wrapper"
                />
            );
        } else {
            return (
                <DialogWithTwoBtn
                    dialogOpen = {props.open}
                    dialogSetOpen = {props.setOpen}
                    message = "Are you sure you want to cancel the initial setup?"
                    yesBtnClick = {props.handleYes}
                    noBtnClick = {props.handleNo}
                    className= "confirmation-dialog-initial-setup initial-setup-wrapper"
                />
            );
        }
    }
};

export default CancelPopUpComponent;