import { Map, Set, List } from "immutable";
import { AnyAction } from "redux";
import {
  ListingWrapper,
  isInApplicationPhase,
  isWhitelisted,
  canBeWhitelisted,
  getNextTimerExpiry,
  isInChallengedCommitVotePhase,
  isInChallengedRevealVotePhase,
  isAwaitingAppealRequest,
  isAwaitingAppealJudgment,
  isListingAwaitingAppealChallenge,
  isInAppealChallengeCommitPhase,
  isInAppealChallengeRevealPhase,
  canChallengeBeResolved,
  canListingAppealBeResolved,
  TimestampedEvent,
} from "@joincivil/core";
import { listingActions } from "../actionCreators/listings";
import BigNumber from "bignumber.js";

export interface ExtendedListingWrapper {
  listing: ListingWrapper;
  expiry: number;
  whitelistedTimestamp?: number;
  removedTimestamp?: number;
  challengeSucceededChallengeID?: BigNumber;
}

export function listings(
  state: Map<string, ExtendedListingWrapper> = Map<string, ExtendedListingWrapper>(),
  action: AnyAction,
): Map<string, ExtendedListingWrapper> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      const getNextExpiry = getNextTimerExpiry(action.data.listing.data);
      const listingData = state.get(action.data.listing.address) || {};
      if (action.data.listing) {
        listingData.listing = action.data.listing;
        listingData.expiry = getNextExpiry;
      }
      if (action.data.whitelistedTimestamp) {
        listingData.whitelistedTimestamp = action.data.whitelistedTimestamp;
      }
      if (action.data.removedTimestamp) {
        listingData.removedTimestamp = action.data.removedTimestamp;
      }
      if (action.data.challengeSucceededChallengeID) {
        listingData.challengeSucceededChallengeID = action.data.challengeSucceededChallengeID;
      }
      return state.set(action.data.listing.address, listingData);
    default:
      return state;
  }
}

export function listingsFetching(state: Map<string, any> = Map<string, any>(), action: AnyAction): Map<string, any> {
  switch (action.type) {
    case listingActions.FETCH_LISTING_DATA:
    case listingActions.FETCH_LISTING_DATA_COMPLETE:
    case listingActions.FETCH_LISTING_DATA_IN_PROGRESS:
      return state.set(action.data.listingID, action.data);
    default:
      return state;
  }
}

export function histories(
  state: Map<string, List<TimestampedEvent<any>>> = Map<string, List<TimestampedEvent<any>>>(),
  action: AnyAction,
): Map<string, List<TimestampedEvent<any>>> {
  switch (action.type) {
    case listingActions.ADD_HISTORY_EVENT:
      const list = state.get(action.data.address) || List();
      return state.set(
        action.data.address,
        list
          .push(action.data.event)
          .sort((a, b) => a.blockNumber! - b.blockNumber!)
          .toList(),
      );
    default:
      return state;
  }
}

export function applications(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isInApplicationPhase(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function whitelistedListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isWhitelisted(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function readyToWhitelistListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (canBeWhitelisted(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function inChallengeCommitListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isInChallengedCommitVotePhase(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function inChallengeRevealListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isInChallengedRevealVotePhase(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function awaitingAppealRequestListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isAwaitingAppealRequest(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function awaitingAppealJudgmentListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isAwaitingAppealJudgment(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function awaitingAppealChallengeListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isListingAwaitingAppealChallenge(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function appealChallengeCommitPhaseListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isInAppealChallengeCommitPhase(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function appealChallengeRevealPhaseListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (isInAppealChallengeRevealPhase(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function resolveChallengeListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (canChallengeBeResolved(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function resolveAppealListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (canListingAppealBeResolved(action.data.listing.data)) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}

export function rejectedListings(state: Set<string> = Set<string>(), action: AnyAction): Set<string> {
  switch (action.type) {
    case listingActions.ADD_OR_UPDATE_LISTING:
      if (action.data.listing.data.appExpiry.isZero()) {
        return state.add(action.data.listing.address);
      } else {
        return state.remove(action.data.listing.address);
      }
    default:
      return state;
  }
}
