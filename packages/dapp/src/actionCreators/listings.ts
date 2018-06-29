import { AnyAction } from "redux";
import { Dispatch } from "react-redux";
import { ListingWrapper, TimestampedEvent } from "@joincivil/core";
import { getTCR } from "../helpers/civilInstance";
import { getNewsroom } from "../helpers/listingEvents";
import { addChallenge } from "./challenges";
import BigNumber from "bignumber.js";

export enum listingActions {
  ADD_OR_UPDATE_LISTING = "ADD_OR_UPDATE_LISTING",
  ADD_HISTORY_EVENT = "ADD_HISTORY_EVENT",
  FETCH_LISTING_DATA = "FETCH_LISTING_DATA",
  FETCH_LISTING_DATA_COMPLETE = "FETCH_LISTING_DATA_COMPLETE",
  FETCH_LISTING_DATA_IN_PROGRESS = "FETCH_LISTING_DATA_IN_PROGRESS",
}

export const addListing = (listing: ListingWrapper, whitelistedTimestamp?: number, removedTimestamp?: number, challengeSucceededChallengeID?: BigNumber): any => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    if (!listing.data.challengeID.isZero()) {
      const wrappedChallenge = {
        listingAddress: listing.address,
        challengeID: listing.data.challengeID,
        challenge: listing.data.challenge!,
      };
      dispatch(addChallenge(wrappedChallenge));
    }
    return dispatch(addListingBasic(listing, whitelistedTimestamp, removedTimestamp, challengeSucceededChallengeID));
  };
};

const addListingBasic = (
  listing: ListingWrapper,
  whitelistedTimestamp?: number,
  removedTimestamp?: number,
  challengeSucceededChallengeID?: BigNumber,
): AnyAction => {
  return {
    type: listingActions.ADD_OR_UPDATE_LISTING,
    data: {
      listing,
      whitelistedTimestamp,
      removedTimestamp,
      challengeSucceededChallengeID,
    },
  };
};

export const addHistoryEvent = (address: string, event: TimestampedEvent<any>): AnyAction => {
  return {
    type: listingActions.ADD_HISTORY_EVENT,
    data: {
      address,
      event,
    },
  };
};

export const fetchListing = (listingID: string): AnyAction => {
  return {
    type: listingActions.FETCH_LISTING_DATA,
    data: {
      listingID,
      isFetching: true,
    },
  };
};

export const fetchListingInProgress = (listingID: string): AnyAction => {
  return {
    type: listingActions.FETCH_LISTING_DATA_IN_PROGRESS,
    data: {
      listingID,
      isFetching: true,
    },
  };
};

export const fetchListingComplete = (listingID: string): AnyAction => {
  return {
    type: listingActions.FETCH_LISTING_DATA_COMPLETE,
    data: {
      listingID,
      isFetching: false,
    },
  };
};

export const fetchAndAddListingData = (listingID: string): any => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    const { listingsFetching } = getState().networkDependent;
    const challengeRequest = listingsFetching.get(listingID);

    // Never fetched this before or we need to update and request isn't in
    // progress, so let's fetch it
    if (challengeRequest === undefined || !challengeRequest.isFetching) {
      dispatch(fetchListing(listingID));

      const tcr = getTCR();
      const listing = tcr.getListing(listingID);
      const wrappedListing = await listing.getListingWrapper();
      await getNewsroom(dispatch, listingID);
      dispatch(addListing(wrappedListing));

      return dispatch(fetchListingComplete(listingID));

      // We think it's still fetching, so fire an action in case we want to capture this
      // state for a progress indicator
    } else if (challengeRequest.isFetching) {
      return dispatch(fetchListingInProgress(listingID));

      // This was an additional request for a challenge that was already fetched
    } else {
      return dispatch(fetchListingComplete(listingID));
    }
  };
};

export const fetchListingWhitelistedTimestamp = (listingID: string): any => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    const { listingsFetching } = getState().networkDependent;
    const challengeRequest = listingsFetching.get(listingID);

    // Never fetched this before or we need to update and request isn't in
    // progress, so let's fetch it
    if (challengeRequest === undefined || !challengeRequest.isFetching) {
      dispatch(fetchListing(listingID));

      const tcr = getTCR();
      const listing = tcr.getListing(listingID);
      const wrappedListing = await listing.getListingWrapper();
      const listingWhitelistedTimestamp = await listing.getWhitelistedTimestamp();
      dispatch(addListing(wrappedListing, listingWhitelistedTimestamp));

      return dispatch(fetchListingComplete(listingID));

      // We think it's still fetching, so fire an action in case we want to capture this
      // state for a progress indicator
    } else if (challengeRequest.isFetching) {
      return dispatch(fetchListingInProgress(listingID));

      // This was an additional request for a challenge that was already fetched
    } else {
      return dispatch(fetchListingComplete(listingID));
    }
  };
}

export const fetchListingRemovedTimestamp = (listingID: string): any => {
  return async (dispatch: Dispatch<any>, getState: any): Promise<AnyAction> => {
    const { listingsFetching } = getState().networkDependent;
    const challengeRequest = listingsFetching.get(listingID);

    // Never fetched this before or we need to update and request isn't in
    // progress, so let's fetch it
    if (challengeRequest === undefined || !challengeRequest.isFetching) {
      dispatch(fetchListing(listingID));

      const tcr = getTCR();
      const listing = tcr.getListing(listingID);
      const wrappedListing = await listing.getListingWrapper();
      const listingRemovedTimestamp = await listing.getListingRemovedTimestamp();
      const challengeSucceededChallengeID = await listing.getChallengeSucceededChallengeID()
      dispatch(addListing(wrappedListing, undefined, listingRemovedTimestamp, challengeSucceededChallengeID));

      return dispatch(fetchListingComplete(listingID));

      // We think it's still fetching, so fire an action in case we want to capture this
      // state for a progress indicator
    } else if (challengeRequest.isFetching) {
      return dispatch(fetchListingInProgress(listingID));

      // This was an additional request for a challenge that was already fetched
    } else {
      return dispatch(fetchListingComplete(listingID));
    }
  };
}
