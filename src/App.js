import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { Container, Nav, Table, Row, Col,Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { TxTypeSplit, TxTypeMerge, TxTypeFund, Block } from '@thematter_io/plasma.js';
import Web3 from 'web3';
import ethUtil from 'ethereumjs-util';
import logo from './logo.svg';
import Blocks from './Blocks';
import './App.css';

library.add(faArrowRight, faSitemap);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_PROVIDER_ADDRESS)),
    };

    const plasmaContractAddress = process.env.REACT_APP_PLASMA_CONTRACT_ADDRESS;
    const plasmaContractAbi = JSON.parse(process.env.REACT_APP_PLASMA_CONTRACT_ABI);
    this.state.plasmaContract = new this.state.web3.eth.Contract(plasmaContractAbi, plasmaContractAddress, { gas: 1000000 });
  }

  render() {
    return (
      <div className="App">
        <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
          <h5 className="my-0 mr-md-auto font-weight-normal"><a href="/" className="mr-3"><img src={logo} className="logo" alt="logo" /></a> Matter Plasma | <span className="text-muted">Blockchain Scanner</span></h5>
          <Nav className="my-2 my-md-0 mr-md-3">
            <Link className="p-2 text-dark active" to={'/blocks'}>Home</Link>
          </Nav>
        </div>
        <Route exact path="/" render={() => (
          <Redirect to="/blocks" />
        )}/>
        <Route path='/blocks' render={(props) => (
          <Blocks {...props} web3={this.state.web3} plasmaContract={this.state.plasmaContract}/>
        )}/>
      </div>
    );
  }
}

export default App;