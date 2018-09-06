import * as React from "react";
import styled, { StyledComponentClass } from "styled-components";
import { fonts } from "../styleConstants";

import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";

const QUERY = gql`
{
    helloWorld
}
`;

const REGISTER_ACCOUNT = gql`
mutation RegisterAccount($account: String!) {
    registerAccount(account: $account) {
        signature
    }
}
`;

export interface RegisterAccountProps {
    button: string | JSX.Element;
    onClick?(index: number): void;
  }

export class RegisterAccount extends React.Component<RegisterAccountProps> {
    public render(): JSX.Element {

      return (
        <div>
            <Query query={QUERY} >
                {({ loading, error, data }) => {
                if (loading) {
                    return <p>Loading...</p>;
                }
                if (error) {
                    return <p>Error :(</p>;
                }

                return <div>
                    <Mutation mutation={REGISTER_ACCOUNT}>
                        {(registerAccount, regData) => (
                            <div>
                                <button onClick={ () => registerAccount({variables: { account: "test"}}) }>Register Account</button>
                            </div>
                        )}
                    </Mutation>
                </div>
                }}
            </Query>
        </div>
      );
    }
  }
