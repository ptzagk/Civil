pragma solidity^0.4.23;
contract ICivilTCRHelper {
    function voterReward(address voter, uint challengeID, uint salt) public view returns (uint);
    function challengeCanBeResolved(bytes32 listingAddress) view public returns (bool canBeResolved);
    function appealCanBeResolved(bytes32 listingAddress) view public returns (bool canBeResolved);
    function appealChallengeCanBeResolved(bytes32 listingAddress) view public returns (bool canBeResolved);
    function canRequestAppeal(bytes32 listingAddress) view public returns (bool canRequestAppeal);
}
