import React, { Component } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faSitemap } from '@fortawesome/free-solid-svg-icons'
import { Container, Nav, Table, Row, Col,Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { TxTypeSplit, TxTypeMerge, TxTypeFund, Block as PlasmaBlock } from '@thematter_io/plasma.js';
import Web3 from 'web3';
import ethUtil from 'ethereumjs-util';
import logo from './logo.svg';
import './App.css';

library.add(faArrowRight, faSitemap);

class Block extends Component {
  constructor(props) {
    super(props);

    let blockNumber = parseInt(this.props.match.params.blockNumber, 10);

    this.state = {
      blockNumber: blockNumber,
      blockInfo: {},
      block: { transactions: [] }
    };

    if (this.state.blockNumber) {
      this.setBlockNumber(this.state.blockNumber);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let blockNumber = parseInt(this.props.match.params.blockNumber, 10);
    if (blockNumber !== this.state.blockNumber) {
      this.setBlockNumber(blockNumber);
    }
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
    let price = this.props.web3.utils.fromWei(weiPriceString);
    if (price >= '0.00001') {
      return `${price} ETH`;
    } else {
      return `${weiPriceString} Wei`;
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
        try {
          const blockArrayBuffer = this.result;
          const blockBuffer = new Buffer(blockArrayBuffer);
          const block = new PlasmaBlock(blockBuffer);
          const blockObject = block.toFullJSON(true);
          const blockInfo = {
            parentHash: ethUtil.bufferToHex(blockObject.header.parentHash),
            merkleRootHash: ethUtil.bufferToHex(blockObject.header.merkleRootHash),
            hash: ethUtil.bufferToHex(block.header.hash()),
            from: self.props.web3.utils.toChecksumAddress(ethUtil.bufferToHex(block.header.getSenderAddress())),
            txCount: block.transactions.length
          };
          self.setState({ blockNumber: blockNumber, blockInfo: blockInfo, block: blockObject });
        } catch (e) {
          console.log(e);
        }
      });
      reader.readAsArrayBuffer(blockBlob);
    } 
    catch (err) {  
      console.log('Request error:', err);
    }
  }

  render() {
    return <Container>
      <div hidden={this.state.blockNumber === 0}>
        <h3>Block {this.state.blockNumber} Information</h3>
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
              <th></th>
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
                      <Col className="tx-input shadow-sm px-3 py-2 mx-3 mb-1">
                        <div hidden={transaction.transaction.transactionType === TxTypeFund}>
                          Input Number: <strong>{inputIndex}</strong><br />
                          Block Number: <strong onClick={() => this.setBlockNumber(input.blockNumber)} className="cursor-pointer">{input.blockNumber}</strong><br />
                          Output Number in Transaction: <strong>{input.outputNumberInTransaction}</strong><br />
                          Transaction Number in Block: <strong>{input.txNumberInBlock}</strong><br />
                          Value: <strong>{this.formatPrice(input.value)}</strong>
                        </div>
                        <div hidden={transaction.transaction.transactionType !== TxTypeFund}>
                          Deposit Index: <strong>{input.value}</strong>
                        </div>
                      </Col>
                    </Row>
                  }, this)}
                </td>
                <td>
                  <FontAwesomeIcon icon="sitemap" rotation={270} size="2x" hidden={transaction.transaction.transactionType !== TxTypeSplit}/>
                  <FontAwesomeIcon icon="sitemap" rotation={90} size="2x" hidden={transaction.transaction.transactionType !== TxTypeMerge}/>
                  <FontAwesomeIcon icon="arrow-right" size="2x" hidden={transaction.transaction.transactionType !== TxTypeFund}/>
                </td>
                <td>
                  {transaction.transaction.outputs.map(function (output, outputIndex) {
                    return <Row>
                      <Col className="tx-output shadow-sm px-3 py-2 mx-3 mb-1">
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
      </div>
    </Container>
  }
}

export default Block;