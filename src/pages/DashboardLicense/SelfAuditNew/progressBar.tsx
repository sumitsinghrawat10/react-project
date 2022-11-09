import React from 'react';

import Box from '@mui/material/Box';
import LinearProgress, {
    linearProgressClasses,
} from '@mui/material/LinearProgress';
import { styled as muiStyle } from '@mui/material/styles';



const BorderLinearProgress = muiStyle(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'light' ? '#233ce6' : '#308fe8',
    },
}));

interface ProgressProps {
  categories: any;
  perPageProgress: number;
  currentCategory: number;
}
const ProgressBar = (props: ProgressProps) => {
    return (
      <div className='dashboard-license-container dashboardLicense-SelfAudit-ProgressBar-container form-container'>
        <div className="d-flex ProgressBarWrapper">
            <Box className='ProgressBarBox'>
                <BorderLinearProgress
                    variant="determinate"
                    value={props.perPageProgress}
                />
            </Box>
            <div className="d-flex justify-content-between ProgressValuesWrapper">
                <div className='CategoryNameExitText'>
                    {props.categories[props.currentCategory]?.category}
                </div>
                <div className='AllQuestionsText'>
          All questions must be completed to submit self audit
                </div>
                <div className='CategoryNameExitText'>Finish</div>
            </div>
        </div>
        </div>
    );
};
export default ProgressBar;
