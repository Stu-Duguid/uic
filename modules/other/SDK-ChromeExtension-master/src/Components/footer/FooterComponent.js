/*global chrome*/
import React from "react";
import { Row } from "simple-flexbox";
import { StyleSheet, css } from "aphrodite";
import { Button } from "react-bootstrap";
import { FaSyncAlt } from "react-icons/fa";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 60,
    margin: "4px",
    backgroundColor: "#12143E"
  },
  information: {
    fontFamily: "Muli",
    fontStyle: "normal",
    fontWeight: "normal",
    color: "#1BF5AB",
    fontSize: 16,
    lineHeight: "26px"
  },
  button: {
    width: 100,
    height: 45,
    color: "#1BF5AB",
    fontSize: 10,
    lineHeight: "12px",
    margin: 4
  }
});

const FooterComponent = props => {
  const downloadConfigurationFile = configuration => {
    var blob = new Blob([JSON.stringify(configuration)], {
      type: "application/json"
    });
    var url = URL.createObjectURL(blob, "sdk-configuration.json");
    chrome.downloads.download({
      url: url
    });
  };

  return (
    <Row
      className={css(styles.container)}
      vertical="center"
      horizontal="space-between"
    >
      <span className={css(styles.information)} style={{ marginLeft: "16px" }}>
        Built by Acoustic Co
      </span>
      <Button onClick={() => props.clickHandler()}>
        <FaSyncAlt />
      </Button>
      <Button
        id="downloadButton"
        variant="outline-success"
        className={css(styles.button)}
        onClick={() => downloadConfigurationFile(props.rawConfiguration)}
      >
        Download Configuration
      </Button>
    </Row>
    /*<Card>
      <Card.Body>
        <Button id="replayButton" variant="outline-primary" className="buttons">
          View Replay
        </Button>
        
      </Card.Body>
    </Card>*/
  );
};

export default FooterComponent;
