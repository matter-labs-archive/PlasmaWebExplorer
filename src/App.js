import React, { Component } from 'react';
import { Container, Nav, Table } from 'reactstrap';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
          <h5 className="my-0 mr-md-auto font-weight-normal"><a href="/" className="mr-3"><img src={logo} className="logo" alt="logo" /></a> Matter Plasma | <span className="text-muted">Blockchain Scanner</span></h5>
          <Nav className="my-2 my-md-0 mr-md-3">
            <a className="p-2 text-dark active" href="#">Home</a>
          </Nav>
        </div>
        <Container>
          <h2>Blocks</h2>
          <Table striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Transactions</th>
                <th>UTXOs</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>0</td>
                <td>0</td>
                <td>0</td>
              </tr>
            </tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default App;
