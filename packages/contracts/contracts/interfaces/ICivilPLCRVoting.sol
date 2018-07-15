pragma solidity^0.4.23;
contract ICivilPLCRVoting {
    function getNumLosingTokens(address _voter, uint _pollID, uint _salt) public view returns (uint correctVotes);
    function getTotalNumberOfTokensForLosingOption(uint _pollID) public view returns (uint numTokens);
}
