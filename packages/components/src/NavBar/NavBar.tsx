import * as React from "react";
import { colors } from "../styleConstants";
import { NavLink } from "./NavLink";
import { NavDropDown } from "./NavDropDown";
import { NavDrawer } from "./NavDrawer";
import { CivilLogo } from "../CivilLogo";
import { CvlToken } from "../icons/CvlToken";
import { buttonSizes } from "../Button";

import { NavProps, NavState } from "./types";
import {
  NavContainer,
  NavOuter,
  NavLogo,
  NavInner,
  NavAccent,
  NavUser,
  CvlContainer,
  UserCvlBalance,
  UserCvlVotingBalance,
  AvatarContainer,
  UserAvatar,
  Arrow,
  LogInButton,
} from "./styledComponents";
import {
  NavLinkRegistryText,
  NavLinkParameterizerText,
  NavLinkCreateNewsroomText,
  NavLinkConstitutionText,
  NavLinkAboutText,
  NavLinkLaunchNewsroomText,
  NavLinkWhitePaperText,
  NavLinkDashboardText,
} from "./textComponents";

export class NavBar extends React.Component<NavProps, NavState> {
  constructor(props: NavProps) {
    super(props);

    this.state = { isOpen: false };
  }

  public render(): JSX.Element {
    let accountInfo = (
      <span>
        <UserCvlBalance>{this.props.balance}</UserCvlBalance>
        <UserCvlVotingBalance>{this.props.votingBalance}</UserCvlVotingBalance>
      </span>
    );
    if (!this.props.userAccount) {
      accountInfo = (
        <>
          <LogInButton onClick={this.props.onLogin} size={buttonSizes.SMALL}>
            Log In
          </LogInButton>
        </>
      );
    }
    return (
      <NavContainer>
        <NavOuter>
          <NavLogo>
            <NavLink to="/">
              <CivilLogo color={colors.basic.WHITE} />
            </NavLink>
          </NavLogo>
          <NavInner>
            <NavLink to="/registry">
              <NavLinkRegistryText />
            </NavLink>
            <NavLink to="/parameterizer">
              <NavLinkParameterizerText />
            </NavLink>
            <NavLink to="/createNewsroom">
              <NavLinkCreateNewsroomText />
            </NavLink>
            <NavDropDown label="How Civil works">
              <NavLink href="https://civil.co/constitution/" target="_blank">
                <NavLinkConstitutionText />
              </NavLink>
              <NavLink href="https://civil.co/about/" target="_blank">
                <NavLinkAboutText />
              </NavLink>
              <NavLink href="https://civil.co/how-to-launch-newsroom/" target="_blank">
                <NavLinkLaunchNewsroomText />
              </NavLink>
              <NavLink href="https://civil.co/white-paper/" target="_blank">
                <NavLinkWhitePaperText />
              </NavLink>
            </NavDropDown>
            <NavAccent>
              <NavLink to="/dashboard">
                <NavLinkDashboardText />
              </NavLink>
            </NavAccent>
            <NavUser onClick={ev => this.toggle()}>
              <CvlContainer>
                <CvlToken />
                {accountInfo}
              </CvlContainer>
              <AvatarContainer>
                <UserAvatar />
                <Arrow isOpen={this.state.isOpen} />
              </AvatarContainer>
            </NavUser>
          </NavInner>
          {this.props.userAccount &&
            this.state.isOpen && (
              <NavDrawer
                balance={this.props.balance}
                votingBalance={this.props.votingBalance}
                userAccount={this.props.userAccount}
                userRevealVotesCount={this.props.userRevealVotesCount}
                userClaimRewardsCount={this.props.userClaimRewardsCount}
                userChallengesStartedCount={this.props.userChallengesStartedCount}
                userChallengesVotedOnCount={this.props.userChallengesVotedOnCount}
                buyCvlUrl={this.props.buyCvlUrl}
                useGraphQL={this.props.useGraphQL}
                onLoadingPrefToggled={this.props.onLoadingPrefToggled}
              />
            )}
        </NavOuter>
      </NavContainer>
    );
  }

  private toggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
}
