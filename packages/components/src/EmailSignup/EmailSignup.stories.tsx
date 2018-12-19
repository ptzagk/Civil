import { storiesOf } from "@storybook/react";
import * as React from "react";
import styled from "styled-components";
import { EmailSignup } from "./EmailSignup";
import { TCR_SENDGRID_LIST_ID, addToMailingList } from "@joincivil/utils";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
`;

const Container: React.StatelessComponent = ({ children }) => <StyledDiv>{children}</StyledDiv>;

let email: string;

function onChange(name: string, value: string): void {
  if (name === "EmailSignupTextInput") {
    email = value;
  }
}

async function onSubmit(): Promise<void> {
  console.log("On Submit", email);

  try {
    await addToMailingList(email, TCR_SENDGRID_LIST_ID);
  } catch (err) {
    console.error("Error adding to mailing list:", { err });
  }
}

storiesOf("Email Signup Component", module).add("Email Signup", () => {
  return (
    <Container>
      <EmailSignup onChange={onChange} onSubmit={onSubmit} />
    </Container>
  );
});