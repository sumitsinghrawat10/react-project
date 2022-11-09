import React from 'react';

import styled from 'styled-components';
interface MenuItems {
  el: any;
  index: number;
  menus: any;
  handleMenuClick: any;
  classSwitch: any;
}

interface ComponentProps {
  active?: boolean;
}

const borderColor = "#233ce6";
const bgWhite = "#E2E7F0";

const NavButton = styled.div<ComponentProps>`
  border-right: ${(props) => (props.active ? `7px solid ${borderColor}` : "none")};
  background: ${(props) => (props.active ? `${bgWhite}` : "transparent")};
  .bi {
    font-size: 20px;
  }
`;
const UserMenu = (props: MenuItems) => {
    return props.el === 'Licenses' ||
    props.el === 'Locations' ||
    props.el === 'Tasks' ||
    props.el === 'Notifications' ||
    props.el === 'Employees' ||
    props.el === 'File Manager' ||
    props.el === 'SOP' ||
    props.el === 'Vehicles' ? (
            <>
                <NavButton
                    className="nav-button"
                    active={props.menus[props.index].active}
                    onClick={() => props.handleMenuClick(props.el, props.index)}
                >
                    <i className={props.classSwitch(props.el)} />
                    <span className="btn-name">{props.el}</span>
                </NavButton>
            </>
        ) : (
            <NavButton className="nav-button" active={props.menus[props.index].active}>
                <i className={props.classSwitch(props.el)} />
                <span className="btn-name">{props.el}</span>
            </NavButton>
        );
};

export default UserMenu;
