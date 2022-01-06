import React, { Component } from "react";

import Web3 from "web3";

import Spinner from "react-bootstrap/Spinner";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import "./App.css";

class DonationField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donationAmount: Web3.utils.toBN(0),
      validDonationAmount: true,

      totalGasEstimate: Web3.utils.toBN(0),
      total: Web3.utils.toBN(0),

      loadingTransaction: false,
    };
  }

  handleChange = async (event) => {
    let donationAmount = null;
    try {
      donationAmount = Web3.utils.toWei(event.target.value);
      donationAmount = Web3.utils.toBN(donationAmount);

      this.setState({
        validDonationAmount: donationAmount.gt(0),
      });
    } catch (err) {
      this.setState({ validDonationAmount: false });
      return;
    }

    this.setState({ donationAmount });

    let gasEstimate = await this.props.tipjar.methods // Total gas used for transaction
      .donate(this.props.pathHex)
      .estimateGas({
        from: this.state.account,
        amount: this.state.donationAmount,
      });
    gasEstimate = Web3.utils.toBN(gasEstimate);

    let gasPrice = await this.props.web3.eth.getGasPrice(); // Current gas price in Wei
    gasPrice = Web3.utils.toBN(gasPrice);

    const totalGasEstimate = gasEstimate.mul(gasPrice);

    this.setState({ totalGasEstimate });

    this.setState({ total: donationAmount.add(totalGasEstimate) });
  };

  handleSubmit = async () => {
    this.setState({ loadingTransaction: true });
    try {
      await this.props.tipjar.methods.donate(this.props.pathHex).send({
        from: this.props.account,
        value: this.state.donationAmount,
      });

      window.location.reload(false);
    } catch {
      this.setState({ loadingTransaction: false });
    }
  };

  render() {
    return (
      <div>
        <Button
          className="mx-auto d-block"
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(
              "https://matic-tip-jar.pages.dev/" + this.props.path + "/"
            );
          }}
        >
          {"https://matic-tip-jar.pages.dev/" + this.props.path + " 📋"}
        </Button>
        <br /> <br />
        <Toast
          show={this.state.loadingTransaction}
          style={{
            textAlign: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Toast.Body>
            <strong>Loading Transaction</strong>
          </Toast.Body>
        </Toast>
        <InputGroup className="mb-3">
          <InputGroup.Text>Donation</InputGroup.Text>
          <FormControl
            type="number"
            placeholder="Amount to donate"
            isInvalid={!this.state.validDonationAmount}
            onChange={this.handleChange}
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Estimated Gas</InputGroup.Text>
          <FormControl
            value={Web3.utils.fromWei(this.state.totalGasEstimate)}
            readOnly
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Total</InputGroup.Text>
          <FormControl value={Web3.utils.fromWei(this.state.total)} readOnly />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>
        <Button
          className="mx-auto d-block"
          variant="primary"
          onClick={this.handleSubmit}
          disabled={
            !this.state.validDonationAmount ||
            this.state.donationAmount.isZero()
          }
        >
          Donate
        </Button>
        {}
      </div>
    );
  }
}

class EditJar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      withdrawAddress: "",
      withdrawAmount: Web3.utils.toBN(0),

      validWithdrawAddress: true,
      validWithdrawAmount: true,

      transferAddress: "",

      validTransferAddress: true,

      loadingTransaction: false,
    };
  }

  handleWithdrawAddressChange = async (event) => {
    const withdrawAddress = event.target.value;

    this.setState({ withdrawAddress });
    this.setState({
      validWithdrawAddress: Web3.utils.isAddress(withdrawAddress),
    });
  };

  handleWithdrawAmountChange = async (event) => {
    let withdrawAmount = null;
    try {
      withdrawAmount = Web3.utils.toWei(event.target.value);
      withdrawAmount = Web3.utils.toBN(withdrawAmount);
      this.setState({
        validWithdrawAmount:
          withdrawAmount.lte(this.props.balance) && withdrawAmount.gt(0),
      });
    } catch (err) {
      this.setState({ validWithdrawAmount: false });
      return;
    }

    this.setState({ withdrawAmount });
  };

  handleWithdrawSubmit = async () => {
    this.setState({ loadingTransaction: true });
    try {
      await this.props.tipjar.methods
        .withdraw(
          this.props.pathHex,
          this.state.withdrawAddress,
          this.state.withdrawAmount
        )
        .send({ from: this.props.account, value: 0 });
      window.location.reload(false);
    } catch {
      this.setState({ loadingTransaction: false });
    }
  };

  handleTransferAddressChange = async (event) => {
    const transferAddress = event.target.value;

    this.setState({ transferAddress });
    this.setState({
      validTransferAddress: Web3.utils.isAddress(transferAddress),
    });
  };

  handleTransferSubmit = async () => {
    this.setState({ loadingTransaction: true });
    try {
      await this.props.tipjar.methods
        .transferTipJar(this.props.pathHex, this.state.transferAddress)
        .send({ from: this.props.account, value: 0 });
      window.location.reload(false);
    } catch {
      this.setState({ loadingTransaction: false });
    }
  };

  render() {
    return (
      <div>
        <hr />
        <div className="text-center">
          <p>Current Balance: {Web3.utils.fromWei(this.props.balance)}</p>
        </div>

        <Toast
          show={this.state.loadingTransaction}
          style={{
            textAlign: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Toast.Body>
            <strong>Loading Transaction</strong>
          </Toast.Body>
        </Toast>

        <InputGroup className="mb-3">
          <InputGroup.Text>Withdraw</InputGroup.Text>

          <FormControl
            type="text"
            placeholder="Address"
            isInvalid={!this.state.validWithdrawAddress}
            onChange={this.handleWithdrawAddressChange}
          />

          <InputGroup.Text>Amount</InputGroup.Text>

          <FormControl
            type="number"
            placeholder="Amount"
            isInvalid={!this.state.validWithdrawAmount}
            onChange={this.handleWithdrawAmountChange}
          />

          <Button
            onClick={this.handleWithdrawSubmit}
            disabled={
              !this.state.validWithdrawAddress ||
              this.state.withdrawAddress === "" ||
              !this.state.validWithdrawAmount ||
              this.state.withdrawAmount.isZero()
            }
          >
            Withdraw
          </Button>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>New Owner</InputGroup.Text>

          <FormControl
            type="text"
            placeholder="Address"
            isInvalid={!this.state.validTransferAddress}
            onChange={this.handleTransferAddressChange}
          />

          <Button
            onClick={this.handleTransferSubmit}
            disabled={
              !this.state.validTransferAddress ||
              this.state.transferAddress === ""
            }
          >
            Transfer Jar
          </Button>
        </InputGroup>

        <Button
          className="mx-auto d-block"
          variant="danger"
          onClick={async () => {
            this.setState({ loadingTransaction: true });
            try {
              await this.props.tipjar.methods
                .deleteTipJar(this.props.pathHex)
                .send({ from: this.props.account, value: 0 });

              window.location.href = "/";
            } catch {
              this.setState({ loadingTransaction: false });
            }
          }}
          disabled={this.props.balance > 0}
        >
          Delete Tip Jar
        </Button>
      </div>
    );
  }
}

class JarPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };

    this.getData();
  }

  async getData() {
    try {
      const isJar = await this.props.tipjar.methods
        .isJar(this.props.pathHex)
        .call();
      this.setState({ isJar });
      if (!isJar) {
        window.location.href = "/";
      }
    } catch {
      window.location.reload(false);
    }

    const jar = await this.props.tipjar.methods.jar(this.props.pathHex).call();
    const isOwner = this.props.account === jar.owner;

    this.setState({ isOwner });
    this.setState({ balance: Web3.utils.toBN(jar.balance) });
    this.setState({ loading: false });
  }

  render() {
    return !this.state.loading ? (
      <Container>
        <DonationField {...this.state} {...this.props} />

        {this.state.isOwner ? (
          <EditJar {...this.state} {...this.props} />
        ) : null}
      </Container>
    ) : (
      <Container>
        <Spinner className="mx-auto d-block" animation="border" role="status" />
      </Container>
    );
  }
}

export default JarPage;
