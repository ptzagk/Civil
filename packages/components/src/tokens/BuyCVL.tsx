import * as React from "react";
import styled, { StyledComponentClass } from "styled-components";
import { fonts } from "../styleConstants";
import makeAsyncScriptLoader from "react-async-script";

const AIRSWAP_URL = "https://cdn.airswap.io/gallery/airswap-trader.js"

export interface BuyCVLProps {
    onClick?(index: number): void;
  }

class BuyCVLBase extends React.Component<BuyCVLProps> {
    public render(): JSX.Element {

      return (
        <div>
            <button onClick={() => this.displayAirswap()}>BUY BUY BUY</button>
        </div>
      );
    }

    private displayAirswap(): void {

        // @ts-ignore
        window.AirSwap.Trader.render({
            mode: "buy",
            env: "sandbox",
            token: "0x0e69a144b6145e0534c461c49d28ae27481acdb2",
            onComplete: (transactionId: string) => {
                console.info("Trade complete. Thank you, come again.", transactionId);
            },
            onCancel: () => {
                console.info("Trade cancelled");
            }
        }, "body");
    }
}

export const BuyCVL = makeAsyncScriptLoader(AIRSWAP_URL)(BuyCVLBase);
