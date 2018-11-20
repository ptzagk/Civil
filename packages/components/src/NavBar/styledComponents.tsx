import * as React from "react";
import styled, { StyledComponentClass } from "styled-components";
import { colors, fonts, mediaQueries } from "../styleConstants";
import { Button, ButtonProps } from "../Button";

import { NavArrowProps } from "./types";

export const NavContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999999;
`;

export const NavOuter = styled.div`
  align-items: center;
  background-color: ${colors.primary.BLACK};
  border-bottom: 1px solid ${colors.accent.CIVIL_GRAY_1};
  display: flex;
  justify-content: space-between;
  padding: 15px 25px;
  position: relative;
  * {
    box-sizing: border-box;
  }

  ${mediaQueries.MOBILE} {
    display: block;
    background-color: ${colors.accent.CIVIL_BLUE_FADED};
  }
`;

export const NavLogo = styled.div`
  height: 21px;
  width: 72px;
`;

export const NavInner = styled.div`
  align-items: center;
  color: ${colors.basic.WHITE};
  display: flex;
  font-family: ${fonts.SANS_SERIF};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  & a {
    color: ${colors.basic.WHITE};
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: ${colors.accent.CIVIL_GRAY_2};
    }
  }
  & > a {
    margin: 0 15px;
  }
`;

export const NavAccent = styled.span`
  margin: 0 15px;
  &,
  & a {
    color: ${colors.accent.CIVIL_TEAL};
  }
`;

export const NavUser = styled.div`
  align-items: center;
  border-left: 1px solid ${colors.accent.CIVIL_GRAY_1};
  cursor: pointer;
  display: flex;
  font-family: ${fonts.SERIF};
  height: 30px;
  justify-content: space-between;
  margin-left: 15px;
  padding-left: 15px
  width: 250px;
`;

export const CvlContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const UserCvlBalance = styled.span`
  display: block;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  margin-left: 10px;
`;

export const UserCvlVotingBalance = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
`;

export const AvatarContainer = styled.div`
  align-items: center;
  display: flex;
  width: 60px;
`;

export const UserAvatar = styled.figure`
  background-color: ${colors.accent.CIVIL_TEAL};
  border: 2px solid ${colors.basic.WHITE};
  border-radius: 50%;
  height: 36px;
  margin: 0 8px 0 0;
  width: 36px;
`;

export const Arrow: StyledComponentClass<NavArrowProps, "div"> = styled<NavArrowProps, "div">("div")`
  border-bottom: 2px solid ${colors.basic.WHITE};
  border-left: 2px solid ${colors.basic.WHITE};
  height: 8px;
  transform: ${props => (props.isOpen ? "rotate(135deg)" : "rotate(-45deg)")};
  transition: transform 0.25s;
  width: 8px;
`;

export const LogInButton = styled(Button)`
  margin-left: 10px;
`;
