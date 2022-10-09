import React from "react";
import { Row, Column } from "simple-flexbox";
import ConfigCard from "./ConfigCard";
import { StyleSheet, css } from "aphrodite";

const styles = StyleSheet.create({
  container: {
    height: "80%"
  }
});

const ConfigurationComponent = props => {
  console.log(
    "There are " + props.configurations.length + " configurations recieved!!"
  );
  console.log(
    "The overstat configuration is: " + JSON.stringify(props.configurations[0])
  );
  return (
    <Column className={css(styles.container)}>
      {props.configurations.map((configjson, index) =>
        configjson ? (
          <ConfigCard configJSON={configjson} key={index} />
        ) : (
          <span></span>
        )
      )}
    </Column>
  );
};

export default ConfigurationComponent;
