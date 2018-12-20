import { configureChai } from "@joincivil/dev-utils";
import * as chai from "chai";
import { configureProviders, setUpUserGroups } from "../utils/contractutils";

configureChai(chai);
const expect = chai.expect;

const CivilTokenController = artifacts.require("CivilTokenController");

/*
MANAGERS - addresses that are allowed to add and remove addresses from lists
CORE - addresses that are controller by Civil Foundation, Civil Media, or Civil Newsrooms
CIVILIAN - addresses that have completed the tutorial
CONTRIBUTOR - addresses that have completed "proof of use" requirements
VERIFIED - addresses that have completed KYC verification
STOREFRONT - addresses that will sell tokens on behalf of the Civil Foundation. these addresses can only transfer to VERIFIED users
*/
contract("CivilTokenController", accounts => {
  describe("Managers", () => {
    it("should allow Managers to ADD or REMOVE addresses from lists");
    it("should not allow Others to ADD or REMOVE addresses from lists");
  });

  describe("Non-Civilians", () => {
    it("should prevent SEND to anyone");
    it("should allow RECEIVE from anyone");
  });

  describe("Civilians", () => {
    it("should allow SEND to CORE list");
    it("should prevent SEND to anyone else");
  });

  describe("Contributing Civilians", () => {
    it("should allow CIVILIANS to add themselves to the CONTRIBUTOR list");
    it("should allow SEND to CIVILIANS or CORE");
  });

  describe("Storefront", () => {
    it("should allow SEND to VERIFIED list");
    it("should prevent SEND to anyone else");
  });
});
