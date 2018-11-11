import React, { Component } from 'react';
import { Container, Nav, Table, Row, Col } from 'reactstrap';
import { TxTypeSplit, TxTypeMerge, TxTypeFund, Block } from '@thematter_io/plasma.js';
import Web3 from 'web3';
import ethUtil from 'ethereumjs-util';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastBlockNumber: 0,
      blockNumber: 0,
      blockInfo: {},
      block: { transactions: [] },
      blockNumbers: [],
      web3: new Web3(/*new Web3(window.ethereum ||*/ new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_PROVIDER_ADDRESS)),
    };

    const plasmaContractAddress = process.env.REACT_APP_PLASMA_CONTRACT_ADDRESS;
    const plasmaContractAbi = JSON.parse(process.env.REACT_APP_PLASMA_CONTRACT_ABI);
    this.state.plasmaContract = new this.state.web3.eth.Contract(plasmaContractAbi, plasmaContractAddress, { gas: 1000000 });

    this.getBlocks();
  }

  async getBlocks() {
    const lastBlockNumber = parseInt(await this.state.plasmaContract.methods.lastBlockNumber().call());

    let blockNumbers = [];
    for (let blockNumber = lastBlockNumber, count = 0; blockNumber >= 0 && count < 15; blockNumber--, count++)
      blockNumbers.push(blockNumber);

    this.setState({ lastBlockNumber: lastBlockNumber, blockNumbers: blockNumbers });
    this.setBlockNumber(lastBlockNumber);
  }

  formatTransactionType(txType) {
    switch (txType) {
      case TxTypeSplit:
        return 'Split';
      case TxTypeMerge:
        return 'Merge';
      case TxTypeFund:
        return 'Fund';
      default:
        return '';
    }
  }

  formatPrice(weiPriceString) {
    let price = this.state.web3.utils.fromWei(weiPriceString);
    if (price >= '0.0001') {
      return `${price} ETH`;
    } else {
      return `${weiPriceString} Wei`
    }
  }

  async setBlockNumber(blockNumber) {
    const self = this;

    if (blockNumber === 0)
      throw new Error("Wrong block number");

    const url = `${process.env.REACT_APP_BLOCK_STORAGE_PREFIX}/${blockNumber}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        },
        mode: 'cors',
      });

      const blockBlob = await response.blob();

      const reader = new FileReader();
      reader.addEventListener("loadend", async function () {
        const blockArrayBuffer = this.result;
        const blockBuffer = new Buffer(blockArrayBuffer);
        const block = new Block(blockBuffer);
        const blockObject = block.toFullJSON(true);
        console.log(blockObject);

        const blockInfo = {
          parentHash: ethUtil.bufferToHex(blockObject.header.parentHash),
          merkleRootHash: ethUtil.bufferToHex(blockObject.header.merkleRootHash),
          hash: ethUtil.bufferToHex(block.header.hash()),
          from: self.state.web3.utils.toChecksumAddress(ethUtil.bufferToHex(block.header.getSenderAddress())),
          txCount: block.transactions.length
        };

        self.setState({ blockNumber: blockNumber, blockInfo: blockInfo, block: blockObject });
      });
      reader.readAsArrayBuffer(blockBlob);
    } 
    catch (err) {  
      console.log('Request error:', err);
    }
  }

  render() {
    return (
      <div className="App">
        <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
          <h5 className="my-0 mr-md-auto font-weight-normal"><a href="/" className="mr-3"><img src={logo} className="logo" alt="logo" /></a> Matter Plasma | <span className="text-muted">Blockchain Scanner</span></h5>
          <Nav className="my-2 my-md-0 mr-md-3">
            <a className="p-2 text-dark active" href="/">Home</a>
          </Nav>
        </div>
        <Container>
          <h2 className="display-4">Blocks</h2>
          <Row>
            <Col sm={2}>
              {this.state.blockNumbers.map(function (blockNumber) {
                return <Container className={"block-number p-2 shadow-sm" + (blockNumber === this.state.blockNumber ? " active" : "")} onClick={() => this.setBlockNumber(blockNumber)}>
                  Block {blockNumber}
                </Container>
              }, this)}
            </Col>
            <Col hidden={this.state.blockNumber === 0}>
              <h3>Block {this.state.blockNumber}</h3>
              <h4>Information</h4>
              <Table striped className="info">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Merkle Root Hash</th>
                    <td>{this.state.blockInfo.merkleRootHash}</td>
                  </tr>
                  <tr>
                    <th scope="row">Parent Hash</th>
                    <td onClick={() => this.setBlockNumber(this.state.blockNumber - 1)} className="cursor-pointer">{this.state.blockInfo.parentHash}</td>
                  </tr>
                  <tr>
                    <th scope="row">Hash</th>
                    <td>{this.state.blockInfo.hash}</td>
                  </tr>
                  <tr>
                    <th scope="row">Creator</th>
                    <td>{this.state.blockInfo.from}</td>
                  </tr>
                  <tr>
                    <th scope="row">Transaction Count</th>
                    <td>{this.state.blockInfo.txCount}</td>
                  </tr>
                </tbody>
              </Table>
              <h4>Transactions</h4>
              <Table striped className="transactions">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Inputs</th>
                    <th>Outputs</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.block.transactions.map(function (transaction, transactionIndex) {
                    return <tr>
                      <th scope="row">{transactionIndex}</th>
                      <td>{this.formatTransactionType(transaction.transaction.transactionType)}</td>
                      <td>
                        {transaction.transaction.inputs.map(function (input, inputIndex) {
                          return <Row>
                            <Col className="tx-input px-3 py-2 mx-3 mb-1">
                              Input Number: <strong>{inputIndex}</strong><br />
                              Block Number: <strong onClick={() => this.setBlockNumber(input.blockNumber)} className="cursor-pointer">{input.blockNumber}</strong><br />
                              Output Number in Transaction: <strong>{input.outputNumberInTransaction}</strong><br />
                              Transaction Number in Block: <strong>{input.txNumberInBlock}</strong><br />
                              Value: <strong>{this.formatPrice(input.value)}</strong>
                            </Col>
                          </Row>
                        }, this)}
                      </td>
                      <td>
                        {transaction.transaction.outputs.map(function (output, outputIndex) {
                          return <Row>
                            <Col className="tx-input px-3 py-2 mx-3 mb-1">
                              Output Number in Transaction: <strong>{output.outputNumberInTransaction}</strong><br />
                              To: <strong>{output.to}</strong><br />
                              Value: <strong>{this.formatPrice(output.value)}</strong>
                            </Col>
                          </Row>
                        }, this)}
                      </td>
                    </tr>
                  }, this)}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
