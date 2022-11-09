import React, { ChangeEvent, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    InputLabel, 
    MenuItem, 
    Select,
    Box,
    FormHelperText } from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';

import { SEARCHBY_COUNTY_STATE_CITY, ADD_CITY_COUNTY_STATE } from '../../../networking/httpEndPoints';
import { RegTechWriter } from '../../../utilities/constants';
import { roleValidator } from '../../../utilities/roleValidator';
import AddAlertDialog from '../SelfAuditQuestions/AddAlertDialog';
import Button from '../../../components/Button';
import TextBox from '../../../components/TextBox';

const useStyles = makeStyles({
    menuUl: {
        backgroundColor:'#fff',
        padding:'0'
    },
    menuBoxSx: {
        opacity:'1', 
        position:'absolute',  
        width: '29%',
        borderRadius:'4px',
        boxShadow: '0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%) !important',
        overflowX:'hidden',
        overflowY:'auto',
        maxWidth: 'calc(100% - 32px)',
        maxHeight: 'calc(100% - 32px)',
        backgroundColor:'#fff',
        zIndex: 1
    },
    button: {
        width:'7.5rem',
        height: '3.175rem'
    }
    }
);

interface DashboardType {
  user: {
    user?: string;
    role?: string;
    userId?: number | null;
    initialSetup?: string;
    navVisible?: boolean;
  };
}

interface GetResponse {
  isSuccess: boolean;
  responseMessage: string;
  result?: any;
}

const SelfAuditStateCountyOrCity: React.FC = () =>{
  
    const UserState = useSelector((state: DashboardType) => state.user);
    const [SaqCategory, setSaqCategory] = useState('');
    const [CityOrCountyStates, setCityOrCountyStates] = useState<any[]>([]);
    const [cityOrCountyStateDetails, setCityOrCountyStatesDetails] = useState<any[]>([]);
    const [SelectedState, setSelectedState] = useState('');
    const history = useHistory();
    const [inputType, setInputType] = useState(0); 
    const [cityAndCounty, setCityAndCounty] = useState<any[]>([]);
    const [cityORCountyName, setCityORCountyName] = useState('');
    const [cityOrCountyNameError, setCityOrCountyNameError] = useState(false);
    const [cityOrCountyNameErrorText, setCityOrCountyNameErrorText] = useState(' ');
    const [selectedStateError, setSelectedStateError] = useState(false);
    const [selectedStateErrorText, setSelectedStateErrorText] = useState(' ');
    const [buttonDisabled, setButtonDisabled]= useState(false);
    const [alertOpen, setAlertOpen] = React.useState(false);
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if(roleValidator(UserState['role']) === RegTechWriter){
            resetFields();
            setSaqCategory(history.location.state.Category);
            if(history.location.state.Category.toLowerCase() === 'city'){
                setInputType(0);
            }
            else if(history.location.state.Category.toLowerCase() === 'county'){
                setInputType(1);
            }
            else if(history.location.state.Category.toLowerCase() === 'state'){
                setInputType(2);
            }
        }
    }, []);

    const questionLevelNumber =   history.location.state ? history.location.state.questionLevelNumber : null;
    const searchStateCountyOrCityData = (item: any) => {
        setCityOrCountyNameError(false);
        setIsOpen(false);
        setCityORCountyName(item.target.value);
        if(item.target.value ==='')
        {
            handleCityOrCountyTextFieldBlank();
        }
        if(item.target.value.length <3){
            return;
        }
        const token = localStorage.getItem('user');
        const params = {
            inputValue: item.target.value,
            type: inputType
        };
        axios
            .post<GetResponse>(`${SEARCHBY_COUNTY_STATE_CITY}`,params, {
                headers: { Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => {
                if ((res.status === 200 || res.status === 201) && res.data.isSuccess === true) {
                    const SccData = res.data.result === null ? [] : res.data.result;
                    if(SccData.length>0)
                    {
                        setCityOrCountyStatesDetails(SccData);
                        filterUniqueStateForCityOrCounty(SccData);
                    }                    
                }
            }).catch((exception) => 
                errorMassage(exception.message)
            );
    };
  
    const filterUniqueStateForCityOrCounty =(item :any) =>{
        const selectedcityOrCountyItem=[];
        for (const selectedCC of item) {
            if(inputType === 0)
            {
                selectedcityOrCountyItem.push(selectedCC.city.trim());
            }
            else if(inputType === 1)
            {
                selectedcityOrCountyItem.push(selectedCC.county.trim());
            }
            else if(inputType === 2)
            {
                selectedcityOrCountyItem.push(selectedCC.state.trim());
            }
        }
        loopProcess(cityAndCounty,'popCityOrCounty');

        const uniqueCityOrCountyOrState = selectedcityOrCountyItem.
            filter((previous, index, actual) =>
                actual.indexOf(previous) === index);

        for (let index = 0; index < uniqueCityOrCountyOrState.length; index++) {
            cityAndCounty.push(
                { name: uniqueCityOrCountyOrState[index], id: index  });
        }
        setCityAndCounty(cityAndCounty);
        setIsOpen(true);
    };
  
    const loopProcess=(item: any, infoType: string)=>{
        const count = item.length;
        for (let index = 0; index < count; index++) {
            if(infoType === 'popState')
            {
                CityOrCountyStates.pop();
            }
            else if(infoType === 'pushState')
            {
                CityOrCountyStates.push({
                    name: item[index],
                    id: index
                });
            }
            if(infoType === 'popCityOrCounty')
            {
                cityAndCounty.pop();
            }
        }
    };
  
    const handleCityOrCountyTextFieldBlank= () =>{
        setCityOrCountyStates([]);
        setSelectedState('');
        setCityOrCountyNameErrorText('');
        setSelectedStateError(false);
        setSelectedStateErrorText('');
        setCityORCountyName('');
        setButtonDisabled(false);
        setIsOpen(false);
    };

    const resetFields = () => {
        setInputType(0);
        setSaqCategory('');
        setSelectedState('');
        setCityOrCountyStates([]);
        setCityAndCounty([]);
        setCityORCountyName('');
        setCityOrCountyNameError(false);
        setSelectedStateError(false);
        setIsOpen(false);
        setCityOrCountyStatesDetails([]);
    };

    const handleCityOrCountyChange = (event: any) => {
        setSelectedState(event.target.value.trim());
        setSelectedStateError(false);
        if(inputType!==2 && event.target.value === 'All States')
        {
            setButtonDisabled(false);
        }
        else
        {
            setButtonDisabled(true); 
        }
    };


    const validateFields = () => {
        let validate = true;
        setButtonDisabled(false);
        if (cityORCountyName.trim().length === 0) {
            setCityOrCountyNameError(true);
            setCityOrCountyNameErrorText('Please provide a '+SaqCategory.toLowerCase()+' name.');
            validate = false;
            setButtonDisabled(true);
            return validate;
        }
        if (inputType!==2 && (SelectedState.trim() === 'All States' || SelectedState.trim() ==='')) {
            setSelectedStateError(true);
            setSelectedStateErrorText('Please provide a state name.');
            setButtonDisabled(true);
            validate = false;
            return validate;
        }    
        return validate;
    };

    const addCityCountyState= () =>{
        if (validateFields()) {
            const token = localStorage.getItem('user');
            const params ={
                type: inputType,
                regionName: inputType!==2? cityORCountyName.trim():'',
                state: inputType!==2? SelectedState.trim(): cityORCountyName.trim()
            };
            if (token !== null) {
                axios
                    .post<GetResponse>(ADD_CITY_COUNTY_STATE, params, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })
                    .then((res) => {
                        if (res.status === 201 && res.data.isSuccess) {
                            setAlertOpen(true);
                        } 
                        else if (res.status === 201 && !res.data.isSuccess) {
                            setCityOrCountyNameError(true);
                            setCityOrCountyNameErrorText(res.data.responseMessage);
                        }
                        else {
                            errorMassage('Something went wrong!');
                        }
                    }).catch((exception)=> 
                        errorMassage(exception.message)
                    );
            }
        }
    };

    const selectStatesOfCountyOrCity =(item: any) => {
        setCityORCountyName(item);
        if(inputType === 2)
        {
            setButtonDisabled(true);
            return;
        }
        const selectedItem=[];
        const defaultStateOfCityAndCounty='All States';
        if(CityOrCountyStates.length>0)
        {
            loopProcess(CityOrCountyStates,'popState');
            loopProcess(item,'popState');
        }
        for (const ccsItem of cityOrCountyStateDetails) {
            let ccsName = '';
            if(inputType === 0)
            {
                ccsName = ccsItem.city.toLowerCase().trim();
            }
            if(inputType === 1)
            {
                ccsName = ccsItem.county.toLowerCase().trim();
            }
            if(ccsName === item.toLowerCase().trim())
            {
                selectedItem.push(ccsItem.state.trim());
            }
        }
        const uniqueStates = selectedItem.
            filter((previous, index, actual) => 
                actual.indexOf(previous) === index);
    
        CityOrCountyStates.pop();
        if(uniqueStates.length>1){
            CityOrCountyStates.push({
                name: defaultStateOfCityAndCounty,
                id: -1
            });
        }
        loopProcess(uniqueStates,'pushState');
        setCityOrCountyStates(CityOrCountyStates);
        if(uniqueStates.length>1){
            setSelectedState(defaultStateOfCityAndCounty);
        }
        else{
            setSelectedState(uniqueStates[0]);
            setButtonDisabled(true);
        }
    };

    const handleAlertNo = () => {
        setAlertOpen(false);
        setCityORCountyName('');
        loopProcess(CityOrCountyStates,'popState');
        handleCityOrCountyTextFieldBlank();
        renderSelfAuditQuestionDashboard();
    };

    const handleAlertYes=()=>{
        history.push('/add-question',{
            cityORCountyName:cityORCountyName, 
            selectedState:SelectedState,
            inputType :inputType,
            questionLevelNumber: questionLevelNumber,
            SaqCategory:SaqCategory
        });
    };
    const renderSelfAuditQuestionDashboard =()=>  {
        history.push('/self-audit-questions');
    };

    const handleCancelClick = ()=>{
        setCityORCountyName('');
        loopProcess(CityOrCountyStates,'popState');
        handleCityOrCountyTextFieldBlank();
        renderSelfAuditQuestionDashboard();
    };

    const errorMassage = (message: string) =>{
        Swal.fire({
            text: message,
            confirmButtonText: 'OK',
            icon: 'error',
        });
    };
    return (
        <div className="self-audit">
            {roleValidator(UserState['role']) === RegTechWriter && (
                <div className="container form-container pt-26">
                    <div className="d-flex">
                        <div className="page-title">
                            <h1 className="bold-font">Add a {SaqCategory}</h1>
                        </div>
                    </div>
                    {SaqCategory && (
                        <div className="container-fluid h-100">
                            <div className="row align-items-center justify-content-center self-audit-question-category">
                                <div className="col col-sm-8 col-md-6 col-lg-4 col-xl-5">
                                    <div className="form-group">
                                        <InputLabel
                                            className="input-label-wrapper"
                                            id="SAQ-label"
                                        >
                    Start typing the name of {SaqCategory.toLowerCase()}  
                                        </InputLabel>
                                        <TextBox
                                            error={cityOrCountyNameError}
                                            helperText={cityOrCountyNameError ? cityOrCountyNameErrorText : ''}
                                            hiddenLabel
                                            value={cityORCountyName}
                                            placeholder={'Enter ' + SaqCategory.toLowerCase()}
                                            id="txt-cityOrCounty"
                                            className={`input-form text-feild-add-city-county-state ps-3 pt-2`}
                                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                                setCityORCountyName(event.target.value);
                                                searchStateCountyOrCityData(event);
                                            }
                                            }
                                            autoComplete="off"
                                            autoFocus={true}
                                            height={50}
                                        />
                                        {isOpen && (<Box className={classes.menuBoxSx}>
                                            <ul className={classes.menuUl}>
                                                {cityAndCounty.map((item) => (
                                                    <MenuItem                                                     
                                                        onClick={()=>{
                                                            selectStatesOfCountyOrCity(item.name.trim());
                                                            setIsOpen(false);
                                                        }}
                                                        key={item.id}
                                                        value={item.name}
                                                    >
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </ul>
                                        </Box>
                                        )}
                                    </div>
                                    {cityORCountyName!=='' && SelectedState && (SaqCategory.toLowerCase() === 'city' || SaqCategory.toLowerCase() === 'county') && (
                                        <div className="form-group mt-3">
                                            <Select
                                                error={selectedStateError}
                                                defaultValue=""
                                                name="ddl-State"
                                                displayEmpty
                                                value={SelectedState}
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                variant="filled"
                                                className="input-form select-field width-webkit-fill-available"
                                                IconComponent={KeyboardArrowDownIcon}
                                                onChange={(event) => {
                                                    handleCityOrCountyChange(event);
                                                }}
                                                label="All States"
                                                aria-label="All States">
                                                {CityOrCountyStates.map((item) => (      
                                                    <MenuItem
                                                        key={item.id}
                                                        value={item.name}
                                                    >
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {selectedStateError && (
                                                <FormHelperText className="form-helper-text">{selectedStateErrorText}</FormHelperText>)
                                            }
                                        </div>
                                    )}
                                    <div className="row mt-3">
                                        <div className="col-6">
                                            <Button type="outlined"
                                                text="Cancel"
                                                intent="seconday"
                                                onClick={handleCancelClick}
                                                className={`${classes.button}`}
                                            />
                                        </div>
                                        <div className="col-6 text-align-right">
                                            <Button className={`${classes.button} btn-submit`}
                                                type="contained"
                                                text="Save"
                                                intent="primary"
                                                onClick={
                                                    addCityCountyState
                                                }
                                                disabled={!buttonDisabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <AddAlertDialog
                alertOpen={alertOpen}
                handleAlertNo={handleAlertNo}
                hansleAlertYes={handleAlertYes}
                alertMessage={'Would you like to add questions to this '+SaqCategory.toLowerCase()+'?'}/>
        </div>
    );
};
export default SelfAuditStateCountyOrCity;
