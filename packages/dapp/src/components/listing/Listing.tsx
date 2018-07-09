import * as React from "react";

import ListingDiscourse from "./ListingDiscourse";
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
import {
  makeGetListingPhaseState,
  makeGetListing,
  makeGetListingExpiry,
  makeGetListingWhitelistedTimestamp,
  makeGetListingRemovedTimestamp,
} from "../../selectors";

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

export interface ListingPageComponentProps {
  listingAddress: EthAddress;
}

export interface ListingReduxProps {
  newsroom: NewsroomState | undefined;
  listing: ListingWrapper | undefined;
  expiry?: number;
  whitelistedTimestamp?: number;
  removedTimestamp?: number;
  userAccount?: EthAddress;
  listingDataRequestStatus?: any;
  listingPhaseState?: any;
  parameters: any;
  govtParameters: any;
}

class ListingPageComponent extends React.Component<ListingReduxProps & DispatchProp<any> & ListingPageComponentProps> {
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
      this.props.dispatch!(fetchAndAddListingData(this.props.listingAddress));
    } else if (listing && isNotActiveRequest && needWhitelistedTimestamp) {
      this.props.dispatch!(fetchListingWhitelistedTimestamp(this.props.listingAddress));
    } else if (listing && isNotActiveRequest && needRemovedTimestamp) {
      this.props.dispatch!(fetchListingRemovedTimestamp(this.props.listingAddress));
    }
  }

  public render(): JSX.Element {
    const listing = this.props.listing;
    const newsroom = this.props.newsroom;
    const listingExistsAsNewsroom = listing && newsroom;
    return (
      <>
        {listingExistsAsNewsroom && (
          <ListingDetail
            userAccount={this.props.userAccount}
            listing={listing!}
            newsroom={newsroom!.wrapper}
            listingPhaseState={this.props.listingPhaseState}
          />
        )}

        <GridRow>
          <LeftShark>
            {!listingExistsAsNewsroom && this.renderListingNotFound()}
            <ListingHistory listing={this.props.listingAddress} />
            <ListingDiscourse />
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

const makeMapStateToProps = () => {
  const getListingPhaseState = makeGetListingPhaseState();
  const getListing = makeGetListing();
  const getListingExpiry = makeGetListingExpiry();
  const getListingWhitelistedTimestamp = makeGetListingWhitelistedTimestamp();
  const getListingRemovedTimestamp = makeGetListingRemovedTimestamp();
  const mapStateToProps = (state: State, ownProps: ListingPageComponentProps): ListingReduxProps => {
    const { newsrooms } = state;
    const { listingsFetching, user, parameters, govtParameters } = state.networkDependent;

    let listingDataRequestStatus;
    if (ownProps.listingAddress) {
      listingDataRequestStatus = listingsFetching.get(ownProps.listingAddress.toString());
    }

    return {
      newsroom: newsrooms.get(ownProps.listingAddress),
      listing: getListing(state, ownProps),
      expiry: getListingExpiry(state, ownProps),
      whitelistedTimestamp: getListingWhitelistedTimestamp(state, ownProps),
      removedTimestamp: getListingRemovedTimestamp(state, ownProps),
      listingDataRequestStatus,
      listingPhaseState: getListingPhaseState(state, ownProps),
      userAccount: user.account,
      parameters,
      govtParameters,
    };
  };
  return mapStateToProps;
};

export const ListingPage = connect(makeMapStateToProps)(ListingPageComponent);

export default class ListingPageContainer extends React.Component<ListingPageProps> {
  public render(): JSX.Element {
    const listingAddress = this.props.match.params.listing;
    return <ListingPage listingAddress={listingAddress} />;
  }
}
