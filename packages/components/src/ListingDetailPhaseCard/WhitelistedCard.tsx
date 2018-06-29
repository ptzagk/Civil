import * as React from "react";
import { ListingDetailPhaseCardComponentProps } from "./types";
import {
  StyledListingDetailPhaseCardContainer,
  StyledListingDetailPhaseCardSection,
  StyledPhaseDisplayName,
  MetaItemValue,
  MetaItemLabel,
  CTACopy,
} from "./styledComponents";
import { buttonSizes } from "../Button";
import { TransactionInvertedButton } from "../TransactionButton";
import { getLocalDateTimeStrings } from "@joincivil/utils";

export interface WhitelistedCardProps {
  whitelistedTimestamp: number;
}

export class WhitelistedCard extends React.Component<ListingDetailPhaseCardComponentProps & WhitelistedCardProps> {
  public render(): JSX.Element {
    let displayDateTime;

    if (this.props.whitelistedTimestamp) {
      const whitelistedDateTime = getLocalDateTimeStrings(this.props.whitelistedTimestamp);
      displayDateTime = `${whitelistedDateTime[0]} ${whitelistedDateTime[1]}`;
    }
    return (
      <StyledListingDetailPhaseCardContainer>
        <StyledListingDetailPhaseCardSection>
          <StyledPhaseDisplayName>Approved Newsroom</StyledPhaseDisplayName>
          <MetaItemValue>{displayDateTime}</MetaItemValue>
          <MetaItemLabel>Approved date</MetaItemLabel>
        </StyledListingDetailPhaseCardSection>
        <StyledListingDetailPhaseCardSection>
          <MetaItemValue>1,000 CVL</MetaItemValue>
          <MetaItemLabel>Amount of tokens deposited</MetaItemLabel>
        </StyledListingDetailPhaseCardSection>
        <StyledListingDetailPhaseCardSection>
          <CTACopy>
            If you believe this newsroom does not align with the <a href="#">Civil Constitution</a>, you may{" "}
            <a href="#">submit a challenge</a>.
          </CTACopy>
          <TransactionInvertedButton
            size={buttonSizes.MEDIUM}
            transactions={this.props.transactions!}
            modalContentComponents={this.props.modalContentComponents}
          >
            Submit a Challenge
          </TransactionInvertedButton>
        </StyledListingDetailPhaseCardSection>
      </StyledListingDetailPhaseCardContainer>
    );
  }
}
