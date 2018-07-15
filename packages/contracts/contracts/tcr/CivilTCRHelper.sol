pragma solidity ^0.4.23;

import "./CivilTCR.sol";
import "../interfaces/ICivilPLCRVoting.sol";
import "../interfaces/ICivilTCRHelper.sol";
import "../installed_contracts/PLCRVoting.sol";

/**
@title CivilTCR - Token Curated Registry with Appeallate Functionality and Restrictions on Application
@author Nick Reynolds - nick@civil.co / engineering@civil.co
@notice The CivilTCR is a TCR with restrictions (address applied for must be a contract with Owned
implementated, and only the owner of a contract can apply on behalf of that contract), an appeallate entity that can
overturn challenges if someone requests an appeal, and a process by which granted appeals can be vetoed by a supermajority vote.
A Granted Appeal reverses the result of the challenge vote (including which parties are considered the winners & receive rewards).
A successful Appeal Challenge reverses the result of the Granted Appeal (again, including the winners).
*/
contract CivilTCRHelper is ICivilTCRHelper {
  struct Appeal {
    address requester;
    uint appealFeePaid;
    uint appealPhaseExpiry;
    bool appealGranted;
    uint appealOpenToChallengeExpiry;
    uint appealChallengeID;
    bool overturned;
  }    
  struct Listing {
    uint applicationExpiry; // Expiration date of apply stage
    bool whitelisted;       // Indicates registry status
    address owner;          // Owner of Listing
    uint unstakedDeposit;   // Number of tokens in the listing not locked in a challenge
    uint challengeID;       // Corresponds to a PollID in PLCRVoting
  }

  struct Challenge {
    uint rewardPool;        // (remaining) Pool of tokens to be distributed to winning voters
    address challenger;     // Owner of Challenge
    bool resolved;          // Indication of if challenge is resolved
    uint stake;             // Number of tokens at stake for either party during challenge
    uint totalTokens;       // (remaining) Number of tokens used in voting by the winning side
    mapping(address => bool) tokenClaims; // Indicates whether a voter has claimed a reward yet
  }

  CivilTCR public tcr;
  ICivilPLCRVoting public civilVoting;
  PLCRVoting public voting;

  function init(address _tcr, address _voting) external {
    tcr = CivilTCR(_tcr);
    civilVoting = ICivilPLCRVoting(_voting);
    voting = PLCRVoting(_voting);
  }

  /**
  @notice Calculates the provided voter's token reward for the given poll.
  @dev differs from implementation in `AddressRegistry` in that it takes into consideration whether an
  appeal was granted and possible overturned via appeal challenge.
  @param voter The address of the voter whose reward balance is to be returned
  @param challengeID The pollID of the challenge a reward balance is being queried for
  @param salt The salt of the voter's commit hash in the given poll
  @return The uint indicating the voter's reward
  */
  function voterReward(
    address voter,
    uint challengeID,
    uint salt
  ) public view returns (uint)
  {
    var (rewardPool,,,, totalTokens) = tcr.challenges(challengeID);
    var (,,, appealGranted,,, appealOverturned) = tcr.appeals(challengeID);
    bool overturnOriginalResult = appealGranted && !appealOverturned;
    uint voterTokens = 0;
    if (overturnOriginalResult) {
      voterTokens = civilVoting.getNumLosingTokens(voter, challengeID, salt);
    } else {
      voterTokens = voting.getNumPassingTokens(voter, challengeID, salt);
    }
    return (voterTokens * rewardPool) / totalTokens;
  }

  /**
  @notice Determines whether a challenge can be resolved for a listing at given address. Throws if no challenge exists.
  @param listingAddress An address for a listing to check
  @return True if challenge exists, has not already been resolved, has not had appeal requested, and has passed the request
  appeal expiry time. False otherwise.
  */
  function challengeCanBeResolved(bytes32 listingAddress) view public returns (bool canBeResolved) {
    var (,,,, challengeID) = tcr.listings(listingAddress);
    require(tcr.challengeExists(listingAddress));
    if (tcr.challengeRequestAppealExpiries(challengeID) > now) {
      return false;
    }
    var (,, appealPhaseExpiry,,,,) = tcr.appeals(challengeID);
    return appealPhaseExpiry == 0;
  }

  /**
  @notice Determines whether an appeal can be resolved for a listing at given address. Throws if no challenge exists.
  @param listingAddress An address for a listing to check
  @return True if challenge exists, has not already been resolved, has had appeal requested, and has either
  (1) had an appeal granted and passed the appeal opten to challenge expiry OR (2) has not had an appeal granted and
  has passed the appeal phase expiry. False otherwise.
  */
  function appealCanBeResolved(bytes32 listingAddress) view public returns (bool canBeResolved) {
    var (,,,, challengeID) = tcr.listings(listingAddress);
    var (,, appealPhaseExpiry, appealGranted, appealOpenToChallengeExpiry, appealChallengeID,) = tcr.appeals(challengeID);
    require(tcr.challengeExists(listingAddress));
    if (appealPhaseExpiry == 0) {
      return false;
    }
    if (!appealGranted) {
      return appealPhaseExpiry < now;
    } else {
      return appealOpenToChallengeExpiry < now && appealChallengeID == 0;
    }
  }

  /**
  @notice Determines whether an appeal challenge can be resolved for a listing at given address. Throws if no challenge exists.
  @param listingAddress An address for a listing to check
  @return True if appeal challenge exists, has not already been resolved, and the voting phase for the appeal challenge is ended. False otherwise.
  */
  function appealChallengeCanBeResolved(bytes32 listingAddress) view public returns (bool canBeResolved) {
    var (,,,, challengeID) = tcr.listings(listingAddress);
    var (,,,,, appealChallengeID,) = tcr.appeals(challengeID);
    if (appealChallengeID == 0) {
      return false;
    }
    return voting.pollEnded(appealChallengeID);
  }

  function canRequestAppeal(bytes32 listingAddress) view public returns (bool canRequestAppeal) {
    var (,,,, challengeID) = tcr.listings(listingAddress);
    if(!voting.pollEnded(challengeID)) {
      return false;
    }
    if(tcr.challengeRequestAppealExpiries(challengeID) <= now){
      return false;
    }
    var (requester,,,,,,) = tcr.appeals(challengeID);
    if(requester != 0) {
      return false;
    }
    return true;
  }
}
