import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TipJar from "../abis/TipJar.json";
import Web3 from "web3";

import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

import makeBlockie from "ethereum-blockies-base64";

import "./App.css";
import logo from "../logo.png";
import JarPage from "./JarPage.js";
import CreateJar from "./CreateJar.js";
import Stats from "./Stats.js";

class App extends Component {
  constructor(props) {
    super(props);

    const path = window.location.pathname.replaceAll("/", "");

    const pathHex = Web3.utils.padRight(Web3.utils.utf8ToHex(path), 34);

    this.state = {
      loading: true,
      path,
      pathHex,
    };

    this.loadThings();
  }

  async loadThings() {
    await this.initWeb3();

    this.setState({ loading: false });
  }

  async initWeb3() {
    //Ensures user has an Ethereum wallet on their website
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else {
      window.alert("No wallet detected");
    }

    const web3 = window.web3;
    this.setState({ web3 });

    window.ethereum.on("chainChanged", (_chainId) =>
      window.location.reload(false)
    );
    window.ethereum.on("accountsChanged", (_accountId) =>
      window.location.reload(false)
    );

    // Adds the user's address to the state
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const latestBlock = await web3.eth.getBlockNumber();
    this.setState({ latestBlock });

    // Ensures the contract was published to the current network
    const networkId = await web3.eth.net.getId();
    const networkData = TipJar.networks[networkId];
    if (networkData) {
      const tipjar = new web3.eth.Contract(TipJar.abi, networkData.address);
      this.setState({ tipjar });
    } else {
      // If contract is not on current network, then request switch to Polygon
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x89" }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x89",
                  chainName: "Polygon Mainnet",
                  nativeCurrency: {
                    name: "Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  rpcUrls: ["https://polygon-rpc.com/"],
                  blockExplorerUrls: ["https://polygonscan.com/"],
                },
              ],
            });
          } catch (addError) {}
        }
      }
      window.location.reload(false);
    }
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <img
            className="rounded mx-auto d-block"
            alt={"Rally logo"}
            src={logo}
          />

          {this.state.loading ? (
            <div className="text-center mt-5">
              <Spinner
                className="mx-auto d-block"
                animation="border"
                role="status"
              />
              <p>Waiting for Wallet</p>
            </div>
          ) : (
            <div className="text-center mt-5">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(this.state.account);
                }}
              >
                <img
                  height={30}
                  width={30}
                  alt="Unique generated icon for Ethereum account"
                  src={makeBlockie(this.state.account)}
                />
                {" " +
                  this.state.account.slice(0, 8) +
                  "..." +
                  this.state.account.slice(-8) +
                  " 📋"}
              </Button>
              <br /> <br />
            </div>
          )}
        </div>

        <Routes>
          <Route path="/" element={<CreateJar {...this.state} />} />
          <Route
            path="a"
            element={this.state.loading ? null : <Stats {...this.state} />}
          />
          <Route
            path=":jarId"
            element={this.state.loading ? null : <JarPage {...this.state} />}
          />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
