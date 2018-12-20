import { configureChai } from "@joincivil/dev-utils";
import * as chai from "chai";
import { configureProviders, setUpUserGroups } from "../utils/contractutils";

configureChai(chai);
const expect = chai.expect;

const CivilTokenController = artifacts.require("CivilTokenController");
const Token = artifacts.require("CVLToken");

contract("CVLToken", accounts => {
  it("should allow Owner to upgrade CVLToken with a new controller");
});
