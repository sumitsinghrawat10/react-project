import React from 'react';

import Button from '../../../components/Button';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import AuditReportDialogBox from '../Modal/AuditReportDialogBox';


const HrLine = styled.hr`
  border: 2px solid #233ce6;
  width: 15%;
  align-self: center;
  height: 0px;
  opacity: 1;
`;

interface AuditProps {
    licenseId: number;
    licenseNumber: number;
}

const SelfAuditCompleted = (props: AuditProps) => {
    const [openReport, setOpenReport] = React.useState(false);
    const history = useHistory();

    return (
        <>
            <div className='dashboard-license-container dashboardLicense-SelfAudit-SelfAuditCompleted-container form-container'>
                <div className="page-title">Licenses</div>
                <div className="d-flex justify-content-center flex-column InitialSetupWrapper">
                    <div className="Heading">Self Audit is complete!</div>
                    <HrLine></HrLine>
                    <div className="complete-setup Subheading">
                        Please continue to the notification's<br/> dashboard to see new compliance
                        notifications
                    </div>
                    <div className='ButtonWrapper'>
                        <Button
                            type="outlined"
                            intent="sencondary"
                            className="my-3 action-btn report-btn"
                            onClick={() => setOpenReport(true)}
                            text="See Report"
                        />
                        <Button
                            type="contained"
                            intent="primary"
                            className="my-3 action-btn"
                            onClick={() => {
                                history.push('/license-details', {
                                    licenseId: props.licenseId,
                                    licenseNumber: props.licenseNumber,
                                });
                            }}
                            text="Finish"
                        />
                    </div>
                    <AuditReportDialogBox
                        handleCancel={() => {
                            setOpenReport(false);
                        }}
                        openReport={openReport}
                        licenseId={props.licenseId}
                    />
                </div>
            </div>
        </>
    );
};
export default SelfAuditCompleted;
