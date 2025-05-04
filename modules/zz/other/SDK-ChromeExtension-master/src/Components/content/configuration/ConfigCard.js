import React from "react";
import { Card } from "react-bootstrap";
import { Row } from "simple-flexbox";
import CodeEditor from "./CodeEditor";
import { StyleSheet, css } from "aphrodite";

const styles = StyleSheet.create({
  container: {
    height: "33%"
  }
});

//overstat = {"name":"Overstat","core":{"enabled":true,"events":[{"name":"click","recurseFrames":true},
//{"name":"mousemove","recurseFrames":true},{"name":"mouseout","recurseFrames":true},{"name":"submit","recurseFrames":true}]}}

const ConfigCard = props => {
  console.log("Constructing a configuration card with ");
  console.log(props.configJSON.name);
  return (
    <Card className={css(styles.container)}>
      <Card.Header>{props.configJSON.name}</Card.Header>
      <Card.Body>
        <CodeEditor configuration={props.configJSON} />
      </Card.Body>
    </Card>
  );
};

export default ConfigCard;
