import React from 'react';
import { Button, Card, CardFooter,
          CardBody, CardGroup, Col, Container, Form, Input, InputGroup,
            InputGroupAddon, InputGroupText, Row } from 'reactstrap';

export default class Reg extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      email: '',
      devices: [],
    }
  }

}
