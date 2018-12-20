pragma solidity ^0.4.24;
import "./ManagedWhitelist.sol";
import "./ERC1404/MessagesAndCodes.sol";

contract CivilTokenController is ManagedWhitelist {
    using MessagesAndCodes for MessagesAndCodes.Data;
    MessagesAndCodes.Data internal messagesAndCodes;
    bool public WHITELIST_ENABLED;
    uint8 public SEND_NOT_ALLOWED_CODE;
    uint8 public RECEIVE_NOT_ALLOWED_CODE;
    uint8 public constant SUCCESS_CODE = 0;
    string public constant SUCCESS_MESSAGE = "SUCCESS";
    string public constant SEND_NOT_ALLOWED_ERROR = "ILLEGAL_TRANSFER_SENDING_ACCOUNT_NOT_WHITELISTED";
    string public constant RECEIVE_NOT_ALLOWED_ERROR = "ILLEGAL_TRANSFER_RECEIVING_ACCOUNT_NOT_WHITELISTED";

    constructor () public {
        messagesAndCodes.addMessage(SUCCESS_CODE, SUCCESS_MESSAGE);
        SEND_NOT_ALLOWED_CODE = messagesAndCodes.autoAddMessage(SEND_NOT_ALLOWED_ERROR);
        RECEIVE_NOT_ALLOWED_CODE = messagesAndCodes.autoAddMessage(RECEIVE_NOT_ALLOWED_ERROR);
    }

    function notRestricted(address from, address to, uint value) public view returns (bool) {
        return detectTransferRestriction(from, to, value) == SUCCESS_CODE;
    }

    function enableWhitelist() public onlyOwner {
        WHITELIST_ENABLED = true;
    }

    function disableWhitelist() public onlyOwner {
        WHITELIST_ENABLED = false;
    }

    function detectTransferRestriction (address from, address to, uint value)
        public
        view
        returns (uint8 restrictionCode)
    {
        if(!WHITELIST_ENABLED) {
            restrictionCode = SUCCESS_CODE; // don't check the whitelist if restrictions are disabled
        }
        else if (!sendAllowed[from]) {
            restrictionCode = SEND_NOT_ALLOWED_CODE; // sender address not whitelisted
        } else if (!receiveAllowed[to]) {
            restrictionCode = RECEIVE_NOT_ALLOWED_CODE; // receiver address not whitelisted
        } else {
            restrictionCode = SUCCESS_CODE; // successful transfer (required)
        }
    }

    function messageForTransferRestriction (uint8 restrictionCode)
        public
        view
        returns (string message)
    {
        message = messagesAndCodes.messages[restrictionCode];
    }
}