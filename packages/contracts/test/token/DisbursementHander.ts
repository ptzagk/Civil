import { configureChai } from "@joincivil/dev-utils";
import * as chai from "chai";
import { configureProviders, setUpUserGroups } from "../utils/contractutils";

configureChai(chai);
const expect = chai.expect;

const CivilTokenController = artifacts.require("CivilTokenController");

contract("DisbursementHandler", accounts => {
  it("should write tests for this");
});
