import { EthAddress } from "@joincivil/core";
import { Dispatch } from "react-redux";
import { Subscription } from "rxjs";
import { updateUserTokenBalance, updateUserVotingBalance } from "../redux/actionCreators/userAccount";
import { getTCR } from "./civilInstance";

let tokenBalanceSubscriptions: Subscription;
let votingBalanceSubscriptions: Subscription;
export async function initializeTokenSubscriptions(dispatch: Dispatch<any>, user: EthAddress): Promise<void> {
  if (tokenBalanceSubscriptions) {
    tokenBalanceSubscriptions.unsubscribe();
  }
  if (votingBalanceSubscriptions) {
    votingBalanceSubscriptions.unsubscribe();
  }

  const tcr = await getTCR();
  const token = await tcr.getToken();
  tokenBalanceSubscriptions = token.balanceUpdate("latest", user).subscribe(balance => {
    dispatch(updateUserTokenBalance(user, balance));
  });

  votingBalanceSubscriptions = tcr
    .getVoting()
    .balanceUpdate("latest", user)
    .subscribe(balance => {
      dispatch(updateUserVotingBalance(user, balance));
    });
}
