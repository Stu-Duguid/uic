import React from "react";
import { Row } from "simple-flexbox";
import { ListGroup } from "react-bootstrap";
import { StyleSheet, css } from "aphrodite";

const DomComponent = props => {
  return (
    <ListGroup>
      <ListGroup.Item variant="primary">
        Shadow DOMs: {props.domdata.shadowdom}
      </ListGroup.Item>
      <ListGroup.Item variant="primary">
        Dynamic CSS: {props.domdata.dynamicCSS}
      </ListGroup.Item>
    </ListGroup>
  );
};

export default DomComponent;
