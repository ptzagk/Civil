import * as React from "react";
import { ListingDetailPhaseCardComponentProps, ChallengeResultsProps } from "./types";
import {
  StyledListingDetailPhaseCardContainer,
  StyledListingDetailPhaseCardSection,
  StyledPhaseDisplayName,
  MetaItemValue,
  MetaItemLabel,
} from "./styledComponents";
import { ChallengeResults } from "./ChallengeResults";
import { getLocalDateTimeStrings } from "@joincivil/utils";

export interface RejectedCardProps {
  removedTimestamp: number;
}

export class RejectedCard extends React.Component<
  ListingDetailPhaseCardComponentProps & ChallengeResultsProps & RejectedCardProps
> {
  public render(): JSX.Element {
    let displayDateTime;

    if (this.props.removedTimestamp) {
      const removedDateTime = getLocalDateTimeStrings(this.props.removedTimestamp);
      displayDateTime = `${removedDateTime[0]} ${removedDateTime[1]}`;
    }
    return (
      <StyledListingDetailPhaseCardContainer>
        <StyledListingDetailPhaseCardSection>
          <StyledPhaseDisplayName>Rejected Newsroom</StyledPhaseDisplayName>
          <MetaItemValue>{displayDateTime}</MetaItemValue>
          <MetaItemLabel>Rejected date</MetaItemLabel>
        </StyledListingDetailPhaseCardSection>
        <StyledListingDetailPhaseCardSection>
          <MetaItemValue>1,000 CVL</MetaItemValue>
          <MetaItemLabel>Amount of tokens deposited</MetaItemLabel>
        </StyledListingDetailPhaseCardSection>
        <StyledListingDetailPhaseCardSection>
          <ChallengeResults
            totalVotes={this.props.totalVotes}
            votesFor={this.props.votesFor}
            votesAgainst={this.props.votesAgainst}
            percentFor={this.props.percentFor}
            percentAgainst={this.props.percentAgainst}
          />
        </StyledListingDetailPhaseCardSection>
      </StyledListingDetailPhaseCardContainer>
    );
  }
}
