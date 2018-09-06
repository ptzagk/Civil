import { storiesOf } from "@storybook/react";
import StoryRouter from "storybook-react-router";
import * as React from "react";
// @ts-ignore
import { withApolloProvider } from "storybook-addon-apollo-graphql"
import { RegisterAccount } from "./RegisterAccount";
import { BuyCVL } from "./BuyCVL";

const typeDefs = `
  type Query {
    helloWorld: String
  }

  type Mutation {
    registerAccount: RegisterAccountReceipt
  }

  type RegisterAccountReceipt {
    signature: String
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

const mocks = {
  Query: () => {
    return {
      helloWorld: () => {
        return "hello, world";
      },
    };
  },
  Mutation: () => {
    return {
      registerAccount: (input: any) => {
        console.log("registerAccount input:", input)
      }
    }
  }
};

storiesOf("Buy, Sell, Transfer", module)
  .addDecorator(StoryRouter())
  .addDecorator(withApolloProvider({ typeDefs, mocks }))
  .add("RegisterAccount", () => {
    return (
      <div>

        <RegisterAccount button="Register"></RegisterAccount>
      </div>
    );
  })
  .add("BuyCVL", () => {
    return (
      <div>

        <BuyCVL></BuyCVL>
      </div>
    );
  });
