import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faSitemap } from '@fortawesome/free-solid-svg-icons'
import { Container, Nav, Table, Row, Col,Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { TxTypeSplit, TxTypeMerge, TxTypeFund, Block as PlasmaBlock } from '@thematter_io/plasma.js';
import Web3 from 'web3';
import ethUtil from 'ethereumjs-util';
import logo from './logo.svg';
import Block from './Block';
import './App.css';

library.add(faArrowRight, faSitemap);

class Blocks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastBlockNumber: 0,
      blockNumbers: [],
    };

    this.getBlocks();
  }

  async getBlocks() {
    const lastBlockNumber = parseInt(await this.props.plasmaContract.methods.lastBlockNumber().call());

    let blockNumbers = [];
    for (let blockNumber = lastBlockNumber, count = 0; blockNumber > 0 && count < 19; blockNumber--, count++)
      blockNumbers.push(blockNumber);

    this.setState({ lastBlockNumber: lastBlockNumber, blockNumbers: blockNumbers });
    // this.props.history.push(`/blocks/${lastBlockNumber}`);
  }

  render() {
    return <Container>
      <h2 className="display-4">Blocks</h2>
      <Pagination aria-label="Page navigation example" className="mb-5">
        <PaginationItem disabled>
          <PaginationLink previous href="#" />
        </PaginationItem>
        {this.state.blockNumbers.map(function (blockNumber) {
          return <PaginationItem active={blockNumber === this.state.blockNumber}>
            <PaginationLink tag={Link} to={`/blocks/${blockNumber}`}>
              {blockNumber}
            </PaginationLink>
          </PaginationItem>
        }, this)}
        <PaginationItem disabled>
          <PaginationLink next href="#" />
        </PaginationItem>
      </Pagination>
      <Route path='/blocks/:blockNumber' render={(props) => (
        <Block {...props} web3={this.props.web3} plasmaContract={this.props.plasmaContract}/>
      )}/>
    </Container>
  }
}

export default Blocks;