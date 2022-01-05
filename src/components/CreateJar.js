import React, { Component } from "react";

import Web3 from "web3";

import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";

import "./App.css";

class CreateJar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validId: true,
      loadingTransaction: false,
      jarId: "",
    };
  }

  handleChange = async (event) => {
    try {
      const jarId = event.target.value;
      const hexId = Web3.utils.padRight(Web3.utils.utf8ToHex(jarId), 34);
      const usedId = await this.props.tipjar.methods.isJar(hexId).call();

      const validId = await this.props.tipjar.methods.isValidId(hexId).call();

      this.setState({ jarId });
      this.setState({ validId: validId && !usedId });
    } catch (err) {
      this.setState({ validId: false });
    }
  };

  handleSubmit = async () => {
    const hexId = Web3.utils.padRight(
      Web3.utils.utf8ToHex(this.state.jarId),
      34
    );

    this.setState({ loadingTransaction: true });

    try {
      await this.props.tipjar.methods
        .createTipJar(hexId)
        .send({ from: this.props.account, value: 0 });

      window.location.href = "/" + this.state.jarId;
    } catch {
      this.setState({ loadingTransaction: false });
    }
  };

  render() {
    return (
      <Container>
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
          <InputGroup.Text>Jar Id</InputGroup.Text>
          <FormControl
            type="text"
            placeholder="Enter a Jar Id"
            isInvalid={!this.state.validId}
            onChange={this.handleChange}
          />
          <FormControl.Feedback type="invalid">
            Please choose an id that has not been used, is between 3 and 32
            characters and only contains letters and numbers
          </FormControl.Feedback>
        </InputGroup>
        <Button
          className="mx-auto d-block"
          variant="primary"
          onClick={this.handleSubmit}
          disabled={
            !this.state.validId || this.state.jarId === "" || this.props.loading
          }
        >
          Create
        </Button>
        {}
      </Container>
    );
  }
}

export default CreateJar;
