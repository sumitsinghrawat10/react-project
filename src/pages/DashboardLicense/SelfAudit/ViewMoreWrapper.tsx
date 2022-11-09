import React from 'react';

import styled from 'styled-components';

const SeeMoreWrapper = styled.span`
  cursor: pointer;
`;
interface ViewMoreProps {
  data: string;
  showInfoModal: any;
  dLength: number;
}
const ViewMoreWrapper = (props: ViewMoreProps) => {
    return (
        <React.Fragment>
            {props.data.length > props.dLength ? (
                <span>
                    {props.data.substring(0, props.dLength)}{' '}
                    <SeeMoreWrapper
                        onClick={() => {
                            props.showInfoModal(props.data);
                        }}
                    >
                        <strong>
                            <u>View More</u>
                        </strong>
                    </SeeMoreWrapper>
                </span>
            ) : (
                <span>{props.data}</span>
            )}
        </React.Fragment>
    );
};

export default ViewMoreWrapper;
