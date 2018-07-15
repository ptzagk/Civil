/* global artifacts */

import { approveEverything, config, inTesting } from "./utils";
import { RINKEBY } from "./utils/consts";

const Token = artifacts.require("EIP20");
const DLL = artifacts.require("DLL");
const AttributeStore = artifacts.require("AttributeStore");

const CivilTCR = artifacts.require("CivilTCR");
const CivilTCRHelper = artifacts.require("CivilTCRHelper");
const Parameterizer = artifacts.require("Parameterizer");
const PLCRVoting = artifacts.require("CivilPLCRVoting");
const Government = artifacts.require("Government");

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer.then(async () => {
    await deployer.link(DLL, CivilTCR);
    await deployer.link(AttributeStore, CivilTCR);

    let tokenAddress;
    if (network === RINKEBY) {
      tokenAddress = config.nets[network].TokenAddress;
    } else {
      tokenAddress = Token.address;
    }

    // console.log("about to estimate.");
    const estimate = web3.eth.estimateGas({ data: CivilTCRHelper.bytecode });
    console.log("CivilTCRHelper gas cost estimate: " + estimate);
    const estimate2 = web3.eth.estimateGas({ data: CivilTCR.bytecode });
    console.log("CivilTCR gas cost estimate: " + estimate2);
    console.log("deploy helper");
    await deployer.deploy(CivilTCRHelper);
    console.log("deploy tcr");
    await deployer.deploy(CivilTCR);
    const helper = await CivilTCRHelper.at(CivilTCRHelper.address);
    await helper.init(CivilTCR.address, PLCRVoting.address);
    const registry = await CivilTCR.at(CivilTCR.address);
    console.log("init at: " + registry);
    await registry.init2(
      tokenAddress,
      PLCRVoting.address,
      Parameterizer.address,
      Government.address,
      CivilTCRHelper.address,
      "Civil TCR",
    );
    console.log("initied");
    if (inTesting(network)) {
      await approveEverything(accounts, Token.at(tokenAddress), CivilTCR.address);
    }
  });
};
