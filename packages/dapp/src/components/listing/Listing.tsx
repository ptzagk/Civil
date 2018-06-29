import * as React from "react";

import ListingHistory from "./ListingHistory";
import ListingDetail from "./ListingDetail";
import ListingPhaseActions from "./ListingPhaseActions";
import { EthAddress, ListingWrapper, isInApplicationPhase } from "@joincivil/core";
import { State } from "../../reducers";
import { connect, DispatchProp } from "react-redux";
import {
  fetchAndAddListingData,
  fetchListingWhitelistedTimestamp,
  fetchListingRemovedTimestamp,
} from "../../actionCreators/listings";
import { NewsroomState } from "@joincivil/newsroom-manager";

import styled from "styled-components";
const GridRow = styled.div`
  display: flex;
  margin: 0 auto;
  padding: 0 0 200px;
  width: 1200px;
`;
const LeftShark = styled.div`
  width: 695px;
`;
const RightShark = styled.div`
  margin: -100px 0 0 15px;
  width: 485px;
`;

export interface ListingPageProps {
  match: any;
}

export interface ListingReduxProps {
  newsroom: NewsroomState | undefined;
  listing: ListingWrapper | undefined;
  expiry?: number;
  whitelistedTimestamp?: number;
  removedTimestamp?: number;
  userAccount?: EthAddress;
  listingDataRequestStatus?: any;
  parameters: any;
  govtParameters: any;
}

class ListingPage extends React.Component<ListingReduxProps & DispatchProp<any> & ListingPageProps> {
  public componentDidUpdate(): void {
    const isNotActiveRequest = !this.props.listingDataRequestStatus || !this.props.listingDataRequestStatus.isFetching;
    let needWhitelistedTimestamp = false;
    let needRemovedTimestamp = false;
    const listing = this.props.listing;

    if (listing) {
      const isWhitelisted = listing.data.isWhitelisted;
      needWhitelistedTimestamp = isWhitelisted && !listing.data.challenge && !this.props.whitelistedTimestamp;
      needRemovedTimestamp = !isWhitelisted && !isInApplicationPhase(listing.data) && !this.props.removedTimestamp;
    }

    console.log("fetch?", isNotActiveRequest, "(", !listing, needWhitelistedTimestamp, needRemovedTimestamp, ")");

    if (isNotActiveRequest && !listing) {
      this.props.dispatch!(fetchAndAddListingData(this.props.match.params.listing.toString()));
    } else if (listing && isNotActiveRequest && needWhitelistedTimestamp) {
      this.props.dispatch!(fetchListingWhitelistedTimestamp(this.props.match.params.listing.toString()));
    } else if (listing && isNotActiveRequest && needRemovedTimestamp) {
      this.props.dispatch!(fetchListingRemovedTimestamp(this.props.match.params.listing.toString()));
    }
  }

  public render(): JSX.Element {
    const listing = this.props.listing;
    const newsroom = this.props.newsroom;
    const listingExistsAsNewsroom = listing && newsroom;
    return (
      <>
        {listingExistsAsNewsroom && (
          <ListingDetail userAccount={this.props.userAccount} listing={listing!} newsroom={newsroom!.wrapper} />
        )}

        <GridRow>
          <LeftShark>
            {!listingExistsAsNewsroom && this.renderListingNotFound()}
            <ListingHistory listing={this.props.match.params.listing} />
          </LeftShark>

          <RightShark>
            {listingExistsAsNewsroom && (
              <ListingPhaseActions
                listing={this.props.listing!}
                expiry={this.props.expiry}
                whitelistedTimestamp={this.props.whitelistedTimestamp}
                removedTimestamp={this.props.removedTimestamp}
                parameters={this.props.parameters}
                govtParameters={this.props.govtParameters}
              />
            )}
          </RightShark>
        </GridRow>
      </>
    );
  }

  private renderListingNotFound(): JSX.Element {
    return <>NOT FOUND</>;
  }
}

const mapToStateToProps = (state: State, ownProps: ListingPageProps): ListingReduxProps => {
  const { newsrooms, listings, listingsFetching, user, parameters, govtParameters } = state.networkDependent;
  const listingAddress = ownProps.match.params.listing;

  let listingDataRequestStatus;
  if (listingAddress) {
    listingDataRequestStatus = listingsFetching.get(listingAddress.toString());
  }

  let listing;
  let expiry;
  let whitelistedTimestamp;
  let removedTimestamp;
  const l = listings.get(listingAddress);
  if (l) {
    listing = l.listing;
    expiry = l.expiry;
    whitelistedTimestamp = l.whitelistedTimestamp;
    removedTimestamp = l.removedTimestamp;
  }
  return {
    newsroom: newsrooms.get(listingAddress),
    listing,
    expiry,
    whitelistedTimestamp,
    removedTimestamp,
    userAccount: user.account,
    listingDataRequestStatus,
    parameters,
    govtParameters,
  };
};

export default connect(mapToStateToProps)(ListingPage);
