import React from "react";
import { Navbar, Nav, Badge } from "react-bootstrap";
import { FaQuestionCircle } from "react-icons/fa";

export default class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.UISDKVersionNumber = props.versionNumber;
    this.dc = props.dc;
  }

  render() {
    return (
      <Navbar type="dark" theme="primary" expand="sm">
        <Navbar.Brand href="#">Tealeaf SDK</Navbar.Brand>
        <Nav className="justify-content-end">
          <Nav.Item>
            <Badge variant="light">{this.dc ? this.dc : null}</Badge>
          </Nav.Item>
          <Nav.Item>
            <Badge variant="primary">
              {this.UISDKVersionNumber ? this.UISDKVersionNumber : null}
            </Badge>
          </Nav.Item>
          <Nav.Item>
            <a href="http://bit.ly/sdkext-feedback" target="_blank">
              <Badge variant="info">
                <FaQuestionCircle />
              </Badge>
            </a>
          </Nav.Item>
        </Nav>
      </Navbar>
    );
  }
}
