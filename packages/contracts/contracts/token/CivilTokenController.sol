pragma solidity ^0.4.24;
import "./ManagedWhitelist.sol";
import "./ERC1404/ERC1404.sol";
import "./ERC1404/MessagesAndCodes.sol";

contract CivilTokenController is ManagedWhitelist, ERC1404 {
    using MessagesAndCodes for MessagesAndCodes.Data;
    MessagesAndCodes.Data internal messagesAndCodes;

    uint8 public constant SUCCESS_CODE = 0;
    string public constant SUCCESS_MESSAGE = "SUCCESS";

    uint8 public MUST_BE_A_CIVILIAN_CODE;
    string public constant MUST_BE_A_CIVILIAN_ERROR = "MUST_BE_A_CIVILIAN";

    uint8 public MUST_BE_UNLOCKED_CODE;
    string public constant MUST_BE_UNLOCKED_ERROR = "MUST_BE_UNLOCKED";

    uint8 public MUST_BE_VERIFIED_CODE;
    string public constant MUST_BE_VERIFIED_ERROR = "MUST_BE_VERIFIED";

    constructor () public {
        messagesAndCodes.addMessage(SUCCESS_CODE, SUCCESS_MESSAGE);
        MUST_BE_A_CIVILIAN_CODE = messagesAndCodes.autoAddMessage(MUST_BE_A_CIVILIAN_ERROR);
        MUST_BE_UNLOCKED_CODE = messagesAndCodes.autoAddMessage(MUST_BE_UNLOCKED_ERROR);
        MUST_BE_VERIFIED_CODE = messagesAndCodes.autoAddMessage(MUST_BE_VERIFIED_ERROR);
    }

    function detectTransferRestriction (address from, address to, uint value)
        public
        view
        returns (uint8)
    {
        // allow if FROM core or users that have proved use
        if(coreList[from] || unlockedList[from]){
            return SUCCESS_CODE;
        }
        // FROM is a storefront wallet
        else if(storefrontList[from]){
            // allow if this is going to a verified user or a core address
            if(verifiedList[to] || coreList[to]){
                return SUCCESS_CODE;
            }
            // Storefront cannot transfer to wallets that have not been KYCed
            else {
                return MUST_BE_VERIFIED_CODE;
            }
        }
        // reject if FROM is not a civilian
        else if(civilianList[from] == false){
            return MUST_BE_A_CIVILIAN_CODE;
        }
        // FROM is a civilian
        else if(civilianList[from]){
            // FROM is sending TO a core address
            if(coreList[to]){
                return SUCCESS_CODE;
            }
            // 
            else {
                return MUST_BE_UNLOCKED_CODE;
            }
        }
        else {
            return 100;
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