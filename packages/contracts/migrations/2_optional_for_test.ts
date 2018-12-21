/* global artifacts */

import BN from "bignumber.js";
import { config } from "./utils";
import { MAIN_NETWORK, RINKEBY } from "./utils/consts";

const MessagesAndCodes = artifacts.require("MessagesAndCodes");
const CivilTokenController = artifacts.require("CivilTokenController");
const NoOpTokenController = artifacts.require("NoOpTokenController");
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
  deployer.link(MessagesAndCodes, CivilTokenController);

  deployer.then(async () => {
    if (network === RINKEBY) {
      const controller = await deployer.deploy(NoOpTokenController);
      await deployer.deploy(Token, totalSupply, "TestCvl", decimals, "TESTCVL", controller.address);
      const allAccounts = teammatesSplit.concat(config.nets[network].tokenHolders);
      if (teammatesSplit) {
        return giveTokensTo(allAccounts, allAccounts.length);
      }
    } else if (network !== MAIN_NETWORK) {
      const controller = await deployer.deploy(NoOpTokenController);
      await deployer.deploy(Token, totalSupply, "TestCvl", decimals, "TESTCVL", controller.address);
      const allAccounts = accounts.concat(config.nets[network].tokenHolders);
      return giveTokensTo(allAccounts, allAccounts.length);
    }
  });
};
