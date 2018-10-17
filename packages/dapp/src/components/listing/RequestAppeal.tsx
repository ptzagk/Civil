import * as React from "react";
import { connect } from "react-redux";
import { EthAddress, TwoStepEthTransaction, TxHash } from "@joincivil/core";
import {
  Button,
  buttonSizes,
  MetaMaskModal,
  Modal,
  ModalHeading,
  ModalContent,
  ModalStepLabel,
  ProgressModalContentInProgress,
  RequestAppealStatement as RequestAppealStatementComponent,
  RequestAppealStatementProps,
} from "@joincivil/components";
import { getFormattedParameterValue, GovernmentParameters } from "@joincivil/utils";
import { getCivil } from "../../helpers/civilInstance";
import { approveForAppeal, appealChallenge } from "../../apis/civilTCR";
import { State } from "../../reducers";

export interface RequestAppealPageProps {
  match: any;
  history?: any;
}

interface RequestAppealProps {
  listingAddress: EthAddress;
  listingURI: string;
  governanceGuideURI: string;
  history?: any;
}

interface RequestAppealReduxProps {
  newsroomName: string;
  constitutionURI: string;
  appealFee: string;
  judgeAppealLen: string;
}

interface ProgressModalPropsState {
  isWaitingTransactionModalOpen?: boolean;
  isTransactionProgressModalOpen?: boolean;
  isTransactionSuccessModalOpen?: boolean;
  isTransactionRejectionModalOpen?: boolean;
  transactionIndex?: number;
  transactions?: any[];
  cancelTransaction?(): void;
}

interface ProgressModalActionProps {
  handleSuccessClose(): void;
}

interface AppealParamsDisplayProps {
  judgeAppealLen: string;
}

interface RequestAppealState {
  appealStatementSummaryValue?: string;
  appealStatementCiteConstitutionValue?: any;
  appealStatementDetailsValue?: any;
}

class RequestAppealComponent extends React.Component<
  RequestAppealProps & RequestAppealReduxProps,
  RequestAppealState & ProgressModalPropsState
> {
  constructor(props: RequestAppealProps & RequestAppealReduxProps) {
    super(props);

    this.state = {
      isWaitingTransactionModalOpen: false,
      isTransactionProgressModalOpen: false,
      isTransactionSuccessModalOpen: false,
      isTransactionRejectionModalOpen: false,
      transactionIndex: -1,
    };
  }

  public render(): JSX.Element {
    const transactions = [
      {
        transaction: async () => {
          this.setState({
            isWaitingTransactionModalOpen: true,
            isTransactionProgressModalOpen: false,
            isTransactionSuccessModalOpen: false,
            isTransactionRejectionModalOpen: false,
            transactionIndex: 0,
          });
          return approveForAppeal();
        },
        handleTransactionHash: (txHash: TxHash) => {
          this.setState({
            isWaitingTransactionModalOpen: false,
            isTransactionProgressModalOpen: true,
          });
        },
        handleTransactionError: this.handleTransactionError,
      },
      {
        transaction: async () => {
          this.setState({
            isWaitingTransactionModalOpen: true,
            isTransactionProgressModalOpen: false,
            isTransactionSuccessModalOpen: false,
            transactionIndex: 1,
          });
          return this.appeal();
        },
        handleTransactionHash: (txHash: TxHash) => {
          this.setState({
            isWaitingTransactionModalOpen: true,
            isTransactionProgressModalOpen: false,
          });
        },
        handleTransactionError: this.handleTransactionError,
      },
    ];

    const { listingURI, newsroomName, constitutionURI, governanceGuideURI, appealFee, judgeAppealLen } = this.props;

    const props: RequestAppealStatementProps = {
      listingURI,
      newsroomName,
      constitutionURI,
      governanceGuideURI,
      appealFee,
      judgeAppealLen,
      updateStatementValue: this.updateStatement,
      transactions,
      postExecuteTransactions: this.onRequestAppealSuccess,
    };

    const {
      isWaitingTransactionModalOpen,
      isTransactionProgressModalOpen,
      isTransactionSuccessModalOpen,
      transactionIndex,
    } = this.state;

    const modalProps = {
      isWaitingTransactionModalOpen,
      isTransactionProgressModalOpen,
      isTransactionSuccessModalOpen,
      transactionIndex,
    };

    return (
      <>
        <RequestAppealStatementComponent {...props} />
        <AwaitingTransactionModal {...modalProps} />
        <TransactionProgressModal {...modalProps} />
        <TransactionSuccessModal
          {...modalProps}
          handleSuccessClose={this.redirectToListingPage}
          judgeAppealLen={judgeAppealLen}
        />
        <TransactionRejectionModal
          transactions={transactions}
          cancelTransaction={this.closeAllModals}
          {...modalProps}
        />
      </>
    );
  }

  private updateStatement = (key: string, value: any): void => {
    const stateKey = `appealStatement${key.charAt(0).toUpperCase()}${key.substring(1)}Value`;
    this.setState(() => ({ [stateKey]: value }));
  };

  private handleTransactionError = (err: Error) => {
    const isErrorUserRejection = err.message === "Error: MetaMask Tx Signature: User denied transaction signature.";
    this.setState(() => ({
      isWaitingTransactionModalOpen: false,
      isTransactionProgressModalOpen: false,
      isTransactionSuccessModalOpen: false,
      isTransactionRejectionModalOpen: isErrorUserRejection,
    }));
  };

  private closeAllModals = (): void => {
    this.setState({
      isWaitingTransactionModalOpen: false,
      isTransactionProgressModalOpen: false,
      isTransactionSuccessModalOpen: false,
      isTransactionRejectionModalOpen: false,
      transactionIndex: -1,
    });
  };

  private onRequestAppealSuccess = (): void => {
    this.setState({
      isWaitingTransactionModalOpen: false,
      isTransactionProgressModalOpen: false,
      isTransactionSuccessModalOpen: true,
    });
  };

  private redirectToListingPage = (): void => {
    this.closeAllModals();
    this.props.history.push("/listing/" + this.props.listingAddress);
  };

  // Transactions
  private appeal = async (): Promise<TwoStepEthTransaction<any>> => {
    const {
      appealStatementSummaryValue,
      appealStatementCiteConstitutionValue,
      appealStatementDetailsValue,
    } = this.state;
    const jsonToSave = {
      summary: appealStatementSummaryValue,
      citeConstitution: appealStatementCiteConstitutionValue.toString("html"),
      details: appealStatementDetailsValue.toString("html"),
    };
    return appealChallenge(this.props.listingAddress, JSON.stringify(jsonToSave));
  };
}

const AwaitingTransactionModal: React.SFC<ProgressModalPropsState> = props => {
  if (!props.isWaitingTransactionModalOpen) {
    return null;
  }
  const { transactionIndex } = props;
  let transactionLabel = "";
  let stepLabelText = "";
  if (transactionIndex === 0) {
    transactionLabel = "Approve For Request Appeal";
    stepLabelText = `Step 1 of 2 - ${transactionLabel}`;
  } else if (transactionIndex === 1) {
    transactionLabel = "Request Appeal";
    stepLabelText = `Step 2 of 2 - ${transactionLabel}`;
  }
  return (
    <MetaMaskModal waiting={true}>
      <ModalStepLabel>{stepLabelText}</ModalStepLabel>
      <ModalHeading>Waiting for you to confirm in MetaMask</ModalHeading>
    </MetaMaskModal>
  );
};

const TransactionProgressModal: React.SFC<ProgressModalPropsState> = props => {
  if (!props.isTransactionProgressModalOpen) {
    return null;
  }
  const { transactionIndex } = props;
  let transactionLabel = "";
  let stepLabelText = "";
  if (transactionIndex === 0) {
    transactionLabel = "Approve For Request Appeal";
    stepLabelText = `Step 1 of 2 - ${transactionLabel}`;
  } else if (transactionIndex === 1) {
    transactionLabel = "Request Appeal";
    stepLabelText = `Step 2 of 2 - ${transactionLabel}`;
  }
  return (
    <Modal>
      <ProgressModalContentInProgress>
        <ModalStepLabel>{stepLabelText}</ModalStepLabel>
        <ModalHeading>{transactionLabel}</ModalHeading>
      </ProgressModalContentInProgress>
    </Modal>
  );
};

const TransactionSuccessModal: React.SFC<
  ProgressModalPropsState & ProgressModalActionProps & AppealParamsDisplayProps
> = props => {
  if (!props.isTransactionSuccessModalOpen) {
    return null;
  }
  return (
    <Modal>
      <ModalHeading>
        <strong>Request to Appeal Submitted!</strong>
      </ModalHeading>
      <ModalContent>
        The Civil Council has {props.judgeAppealLen} to review the vote. They will publish at least one public document
        outlining the Constitutional rationale for their decision. Please check back for their decision.
      </ModalContent>
      <Button size={buttonSizes.MEDIUM} onClick={() => props.handleSuccessClose()}>
        Ok, got it
      </Button>
    </Modal>
  );
};

const TransactionRejectionModal: React.SFC<ProgressModalPropsState> = props => {
  if (!props.isTransactionRejectionModalOpen) {
    return null;
  }

  const { transactionIndex } = props;
  const message = "Your appeal request was not submitted";
  let denialMessage = "";

  if (transactionIndex === 0) {
    denialMessage =
      "Before requesting an appeal, you need to confirm the approval of your appeal deposit in your MetaMask wallet.";
  } else if (transactionIndex === 1) {
    denialMessage = "To request an appeal, you need to confirm the transaction in your MetaMask wallet.";
  }

  return (
    <MetaMaskModal
      waiting={false}
      denied={true}
      denialText={denialMessage}
      cancelTransaction={() => props.cancelTransaction!()}
      denialRestartTransactions={props.transactions}
    >
      <ModalHeading>{message}</ModalHeading>
    </MetaMaskModal>
  );
};

const mapStateToProps = (state: State, ownProps: RequestAppealProps): RequestAppealProps & RequestAppealReduxProps => {
  const { newsrooms } = state;
  const newsroom = newsrooms.get(ownProps.listingAddress);

  let newsroomName = "";
  if (newsroom) {
    newsroomName = newsroom.wrapper.data.name;
  }

  const { govtParameters, constitution } = state.networkDependent;
  const constitutionURI = constitution.get("uri") || "#";

  let appealFee = "";
  let judgeAppealLen = "";
  if (govtParameters && Object.keys(govtParameters).length) {
    const civil = getCivil();
    appealFee = getFormattedParameterValue(
      GovernmentParameters.appealFee,
      civil.toBigNumber(govtParameters[GovernmentParameters.appealFee]),
    );
    judgeAppealLen = getFormattedParameterValue(
      GovernmentParameters.judgeAppealLen,
      civil.toBigNumber(govtParameters[GovernmentParameters.judgeAppealLen]),
    );
  }

  return {
    newsroomName,
    constitutionURI,
    appealFee,
    judgeAppealLen,
    ...ownProps,
  };
};

const RequestAppeal = connect(mapStateToProps)(RequestAppealComponent);

const RequestAppealPage: React.SFC<RequestAppealPageProps> = props => {
  const listingAddress = props.match.params.listing;
  const listingURI = `/listing/${listingAddress}`;
  const governanceGuideURI = "https://civil.co";
  return (
    <RequestAppeal
      listingAddress={listingAddress}
      listingURI={listingURI}
      governanceGuideURI={governanceGuideURI}
      history={props.history}
    />
  );
};

export default RequestAppealPage;