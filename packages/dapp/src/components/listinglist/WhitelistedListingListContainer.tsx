import * as React from "react";
import { connect } from "react-redux";
import { Set } from "immutable";
import { ListingSummaryApprovedComponent } from "@joincivil/components";
import ListingList from "./ListingList";
import { State } from "../../redux/reducers";
import WhitelistedListingListRedux from "./WhitelistedListingListRedux";
import { EmptyRegistryTabContentComponent, REGISTRY_PHASE_TAB_TYPES } from "./EmptyRegistryTabContent";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { NewsroomListing } from "@joincivil/core";
import {
  LISTING_FRAGMENT,
  transformGraphQLDataIntoListing,
  transformGraphQLDataIntoNewsroom,
} from "../../helpers/queryTransformations";

export interface WhitelistedListingsListContainerReduxProps {
  useGraphQL: boolean;
}
const LISTINGS_QUERY = gql`
  query($whitelistedOnly: Boolean!) {
    listings(whitelistedOnly: $whitelistedOnly) {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;
class WhitelistedListingListContainer extends React.Component<WhitelistedListingsListContainerReduxProps> {
  public render(): JSX.Element {
    if (this.props.useGraphQL) {
      return (
        <Query query={LISTINGS_QUERY} variables={{ whitelistedOnly: true }} pollInterval={10000}>
          {({ loading, error, data }: any): JSX.Element => {
            if (loading) {
              return <></>;
            }
            if (error) {
              return <p>Error :</p>;
            }
            const map = Set<NewsroomListing>(
              data.listings.map((listing: any) => {
                return {
                  listing: transformGraphQLDataIntoListing(listing, listing.contractAddress),
                  newsroom: transformGraphQLDataIntoNewsroom(listing, listing.contractAddress),
                };
              }),
            );

            if (!map.count()) {
              return <EmptyRegistryTabContentComponent phaseTabType={REGISTRY_PHASE_TAB_TYPES.APPROVED} />;
            }

            const predicate = (newsroomListing?: NewsroomListing) => {
              const listing = newsroomListing && newsroomListing.listing;
              return !!listing && !!listing.data && !!listing.data.challenge && !listing.data.challengeID.isZero();
            };

            const challengedListings = map.filter(predicate).toSet();
            const unchallengedListings = map.filterNot(predicate).toSet();
            const groupedListings = challengedListings.concat(unchallengedListings).toSet();

            return (
              <>
                <ListingList ListingItemComponent={ListingSummaryApprovedComponent} listings={groupedListings} />
              </>
            );
          }}
        </Query>
      );
    } else {
      return <WhitelistedListingListRedux />;
    }
  }
}

const mapStateToProps = (state: State): WhitelistedListingsListContainerReduxProps => {
  const useGraphQL = state.useGraphQL;

  return {
    useGraphQL,
  };
};

export default connect(mapStateToProps)(WhitelistedListingListContainer);
