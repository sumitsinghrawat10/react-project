import React from 'react';
import styled from 'styled-components';
import { ChorusStackedLogo } from "../../utilities/ChorusStackedLogo";


const SubHeading = styled.div`
  margin-top: 20px;
`;

const Heading = styled.div`
  font-size: 48px;
`;

interface LeftProps{
  heading: string,
  title?: string,
  isLogo?: boolean,
}

const Left: React.FC<LeftProps> = ({heading, title, isLogo}) => {
    return (
        <div className={isLogo ? `left-container d-flex flex-column` : `left-container d-flex flex-column justify-content-center`} >
            {isLogo && (
              <div className="logo-wrapper">
              <img src={ChorusStackedLogo} alt="Chorus" className="chorus-logo" />
            </div>
            )}
            <Heading className="heading">{heading}</Heading>
            <SubHeading className="sub-heading">{title}</SubHeading>
        </div>
    );
};

export default Left;
