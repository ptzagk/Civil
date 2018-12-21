/* global artifacts */

import BN from "bignumber.js";
import { config } from "./utils";
import { MAIN_NETWORK, RINKEBY } from "./utils/consts";

const MessagesAndCodes = artifacts.require("MessagesAndCodes");
const Token = artifacts.require("CVLToken");

const BASE_10 = 10;

const teammates = process.env.TEAMMATES;
let teammatesSplit: any;
if (teammates) {
  teammatesSplit = teammates!.split(",");
}
module.exports = (deployer: any, network: string, accounts: string[]) => {
  const totalSupply = new BN("100000000000000000000000000", BASE_10);
  const decimals = "18";

  async function giveTokensTo(addresses: string[], originalCount: number): Promise<boolean> {
    const user = addresses[0];
    let allocation;
    allocation = 50000000000000000000000;
    console.log("give " + allocation + " tokens to: " + user);
    const token = await Token.deployed();
    await token.addToBothSendAndReceiveAllowed(user);
    await token.transfer(user, allocation);
    if (network === "ganache" && !accounts.includes(user)) {
      web3.eth.sendTransaction({ from: accounts[0], to: user, value: web3.toWei(1, "ether") });
    }

    if (addresses.length === 1) {
      return true;
    }
    return giveTokensTo(addresses.slice(1), originalCount);
  }
  deployer.deploy(MessagesAndCodes);
  deployer.link(MessagesAndCodes, Token);

  deployer.then(async () => {
    if (network === RINKEBY) {
      await deployer.deploy(Token, totalSupply, "TestCvl", decimals, "TESTCVL");
      const allAccounts = teammatesSplit.concat(config.nets[network].tokenHolders);
      if (teammatesSplit) {
        return giveTokensTo(allAccounts, allAccounts.length);
      }
    } else if (network !== MAIN_NETWORK) {
      await deployer.deploy(Token, totalSupply, "TestCvl", decimals, "TESTCVL");
      const allAccounts = accounts.concat(config.nets[network].tokenHolders);
      return giveTokensTo(allAccounts, allAccounts.length);
    }
  });
};
