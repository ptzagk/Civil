import * as React from "react";
// import { compose } from "redux";
import { connect, DispatchProp } from "react-redux";
import BigNumber from "bignumber.js";
import { WrappedChallengeData } from "@joincivil/core";
import { ChallengePhaseProps, ChallengeResultsProps } from "@joincivil/components";
import { fetchAndAddChallengeData } from "../../actionCreators/challenges";
import { State } from "../../reducers";
import { getFormattedTokenBalance } from "@joincivil/utils";

export interface ChallengeContainerProps {
  challengeID: BigNumber;
}

export interface ChallengeContainerReduxProps {
  challengeData?: WrappedChallengeData | undefined;
  challengeDataRequestStatus?: any;
}

/*
class ChallengeResultsContainer extends React.Component<
  ChallengeResultsContainerProps & ChallengeResultsContainerReduxProps & DispatchProp<any>
> {
  public componentDidUpdate(): void {
    if (!this.props.challengeData && !this.props.challengeDataRequestStatus) {
      this.props.dispatch!(fetchAndAddChallengeData(this.props.challengeID.toString()));
    }
  }

  public render(): JSX.Element | null {
    const challenge = this.props.challengeData && this.props.challengeData.challenge;
    return (
      <ChallengeDetail
          totalVotes={getFormattedTokenBalance(totalVotes)}
          votesFor={votesFor.toString()}
          votesAgainst={votesAgainst.toString()}
          percentFor={percentFor.toString()}
          percentAgainst={percentAgainst.toString()}
      />
    );
  }
}
*/

export const connectChallengeResults = <TChallengeContainerProps extends ChallengeContainerProps>(
  PhaseCardComponent:
    | React.ComponentClass<TChallengeContainerProps & ChallengeResultsProps>
    | React.StatelessComponent<TChallengeContainerProps & ChallengeResultsProps>,
) => {
  const mapStateToProps = (
    state: State,
    ownProps: ChallengeContainerProps,
  ): ChallengeContainerReduxProps & ChallengeContainerProps => {
    const { challenges, challengesFetching } = state.networkDependent;
    let challengeData;
    const challengeID = ownProps.challengeID;
    if (challengeID) {
      challengeData = challenges.get(challengeID.toString());
    }
    let challengeDataRequestStatus;
    if (challengeID) {
      challengeDataRequestStatus = challengesFetching.get(challengeID.toString());
    }
    return {
      challengeData,
      challengeDataRequestStatus,
      ...ownProps,
    };
  };

  class HOChallengeResultsContainer extends React.Component<
    TChallengeContainerProps & ChallengeContainerReduxProps & DispatchProp<any>
  > {
    public componentDidUpdate(): void {
      if (!this.props.challengeData && !this.props.challengeDataRequestStatus) {
        this.props.dispatch!(fetchAndAddChallengeData(this.props.challengeID.toString()));
      }
    }

    public render(): JSX.Element | undefined {
      if (!this.props.challengeData) {
        return;
      }

      const challenge = this.props.challengeData.challenge;
      const totalVotes = challenge.poll.votesAgainst.add(challenge.poll.votesFor);
      const votesFor = getFormattedTokenBalance(challenge.poll.votesFor);
      const votesAgainst = getFormattedTokenBalance(challenge.poll.votesAgainst);
      const percentFor = challenge.poll.votesFor
        .div(totalVotes)
        .mul(100)
        .toFixed(0);
      const percentAgainst = challenge.poll.votesAgainst
        .div(totalVotes)
        .mul(100)
        .toFixed(0);
      return (
        <PhaseCardComponent
          totalVotes={getFormattedTokenBalance(totalVotes)}
          votesFor={votesFor.toString()}
          votesAgainst={votesAgainst.toString()}
          percentFor={percentFor.toString()}
          percentAgainst={percentAgainst.toString()}
          {...this.props}
        />
      );
    }
  }

  return connect(mapStateToProps)(HOChallengeResultsContainer);
};

export const connectChallengePhase = <TChallengeContainerProps extends ChallengeContainerProps>(
  PhaseCardComponent:
    | React.ComponentClass<TChallengeContainerProps & ChallengePhaseProps>
    | React.StatelessComponent<TChallengeContainerProps & ChallengePhaseProps>,
) => {
  const mapStateToProps = (
    state: State,
    ownProps: ChallengeContainerProps,
  ): ChallengeContainerReduxProps & ChallengeContainerProps => {
    const { challenges, challengesFetching } = state.networkDependent;
    let challengeData;
    const challengeID = ownProps.challengeID;
    if (challengeID) {
      challengeData = challenges.get(challengeID.toString());
    }
    let challengeDataRequestStatus;
    if (challengeID) {
      challengeDataRequestStatus = challengesFetching.get(challengeID.toString());
    }
    return {
      challengeData,
      challengeDataRequestStatus,
      ...ownProps,
    };
  };

  class HOChallengePhaseContainer extends React.Component<
    TChallengeContainerProps & ChallengeContainerReduxProps & DispatchProp<any>
  > {
    public componentDidUpdate(): void {
      if (!this.props.challengeData && !this.props.challengeDataRequestStatus) {
        this.props.dispatch!(fetchAndAddChallengeData(this.props.challengeID.toString()));
      }
    }

    public render(): JSX.Element | undefined {
      if (!this.props.challengeData) {
        return;
      }

      const challenge = this.props.challengeData.challenge;
      return (
        <PhaseCardComponent
          challenger={challenge!.challenger.toString()}
          rewardPool={getFormattedTokenBalance(challenge!.rewardPool)}
          stake={getFormattedTokenBalance(challenge!.stake)}
          {...this.props}
        />
      );
    }
  }

  return connect(mapStateToProps)(HOChallengePhaseContainer);
};
