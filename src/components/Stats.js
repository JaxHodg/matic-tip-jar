import React, { Component } from "react";

import Web3 from "web3";

import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";

class StatsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      currentBlock: 0,
      numTipJars: 0,
      numTransfers: 0,
      numDonations: 0,
      numWithdrawals: 0,
      sumDonations: Web3.utils.toBN(0),
      sumWithdrawals: Web3.utils.toBN(0),
    };

    this.getData();
  }

  async getData() {
    for (let i = 23199475; i < this.props.latestBlock; i += 9000) {
      this.setState({ currentBlock: i });
      try {
        const events = await this.props.tipjar.getPastEvents(
          "allEvents",
          { fromBlock: i - 9000, toBlock: i },
          console.log
        );

        events.forEach((e) => {
          if (e.event === "jarCreation") {
            this.setState({ numTipJars: this.state.numTipJars + 1 });
          } else if (e.event === "jarDeletion") {
            this.setState({
              numTipJars: this.state.numTipJars - 1,
            });
          } else if (e.event === "jarTransfer") {
            this.setState({
              numTransfers: this.state.numTransfers + 1,
            });
          } else if (e.event === "donation") {
            this.setState({
              numDonations: this.state.numDonations + 1,
              sumDonations: this.state.sumDonations.add(
                Web3.utils.toBN(e.returnValues.amount)
              ),
            });
          } else if (e.event === "withdrawal") {
            this.setState({
              numWithdrawals: this.state.numWithdrawals + 1,
              sumWithdrawals: this.state.sumWithdrawals.add(
                Web3.utils.toBN(e.returnValues.amount)
              ),
            });
          }
        });
      } catch (err) {
        console.log(err);
        //window.location.reload(false);
      }
    }

    this.setState({ loading: false });
  }

  render() {
    return (
      <Container>
        {this.state.loading ? (
          <div>
            <div>
              <Spinner
                className="mx-auto d-block"
                animation="border"
                role="status"
              />
              <h3 className="text-center">
                Querying Blockchain (Processing Block {this.state.currentBlock})
              </h3>
            </div>
          </div>
        ) : (
          <div>
            <Card>
              <Card.Body>
                <Card.Title>Total TipJars</Card.Title>
                <Card.Text>{this.state.numTipJars}</Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Total TipJar Transfers</Card.Title>
                <Card.Text>{this.state.numTransfers}</Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Total Donations</Card.Title>
                <Card.Text>{this.state.numDonations}</Card.Text>
                <Card.Text>
                  {Web3.utils.fromWei(this.state.sumDonations).toString()} MATIC
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <Card.Title>Total Withdrawals</Card.Title>
                <Card.Text>{this.state.numWithdrawals}</Card.Text>
                <Card.Text>
                  {Web3.utils.fromWei(this.state.sumWithdrawals).toString()}{" "}
                  MATIC
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    );
  }
}

export default StatsPage;
