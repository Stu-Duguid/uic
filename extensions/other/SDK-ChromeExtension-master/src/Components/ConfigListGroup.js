import React from "react";
import { ListGroup } from "react-bootstrap";

const ConfigListGroup = props => {
  let listGroup = null;
  //console.log("From Config List Group: " + props.con)
  if (props.type === 3) {
    listGroup = (
      <ListGroup horizontal>
        {props.configuration.core.events.map((event, index) => (
          <ListGroup.Item key={index}>{event.name}</ListGroup.Item>
        ))}
      </ListGroup>
    );
  }
  return <div>{listGroup}</div>;
};

export default ConfigListGroup;
