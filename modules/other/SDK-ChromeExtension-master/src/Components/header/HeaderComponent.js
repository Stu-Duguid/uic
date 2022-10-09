import React from "react";
import { Row } from "simple-flexbox";
import { StyleSheet, css } from "aphrodite";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    margin: "4px",
    backgroundColor: "#12143E",
    height: 40
  },
  seperator: {
    borderLeft: "1px solid #1BF5AB",
    marginLeft: 16,
    marginRight: 16,
    height: 32,
    width: 2
  },
  title: {
    fontFamily: "Muli",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 16,
    color: "#1BF5AB",
    lineHeight: "30px",
    letterSpacing: 0.3,
    marginLeft: "16px"
  },
  information: {
    fontFamily: "Muli",
    fontStyle: "normal",
    fontWeight: "normal",
    color: "#1BF5AB",
    fontSize: 10,
    lineHeight: "26px"
  }
});

const HeaderComponent = props => {
  const { version, dataCenter, ...otherProps } = props;

  return (
    <Row
      className={css(styles.container)}
      horizontal="space-between"
      vertical="center"
    >
      <span className={css(styles.title)}>Acoustic SDK</span>
      <Row vertical="center">
        <Row vertical="center">
          <span className={css(styles.information)}>v{version}</span>
          <div className={css(styles.seperator)}></div>
          <span
            className={css(styles.information)}
            style={{ marginRight: "16px" }}
          >
            {dataCenter}
          </span>
        </Row>
      </Row>
    </Row>
  );
};

export default HeaderComponent;
