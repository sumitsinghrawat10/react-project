import React, {Dispatch} from 'react';

type commonKeysZipCodeData = {
    zipCodeCityMapId: number;
    isCountyRegulations: boolean;
    isCityRegulations: boolean;
};

const dataMappingandCheckLocationForm = (
  res: commonKeysZipCodeData[],
  setselectedCityZipMapId: React.Dispatch<React.SetStateAction<number>>,
  setChecked: Dispatch<React.SetStateAction<boolean>>,
  setCheckboxDisable: Dispatch<React.SetStateAction<boolean>>,
  ) => {
  if (res.length === 1) {
    setselectedCityZipMapId(res[0].zipCodeCityMapId);
    const rspData = res[0];
    if (
        rspData.isCountyRegulations === true &&
        rspData.isCityRegulations === true
    ) {
        setChecked(false);
        setCheckboxDisable(false);
    } else if (
        rspData.isCountyRegulations === true &&
        rspData.isCityRegulations === false
    ) {
        setChecked(true);
        setCheckboxDisable(true);
    } else if (
        rspData.isCountyRegulations === false &&
        rspData.isCityRegulations === true
    ) {
        setChecked(false);
        setCheckboxDisable(true);
    }
    else {
        return;
    }
  }
};

export default dataMappingandCheckLocationForm;