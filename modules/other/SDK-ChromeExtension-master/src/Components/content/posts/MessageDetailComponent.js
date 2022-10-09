import React from "react";
import { Row } from "simple-flexbox";
import { Card, Badge } from "react-bootstrap";
import { StyleSheet, css } from "aphrodite";
import { GoCloudDownload } from "react-icons/go";
import {
  MdNetworkCheck,
  MdError,
  MdTimer,
  MdMouse,
  MdWarning
} from "react-icons/md";
import { FaMousePointer, FaBolt, FaGlobeAmericas } from "react-icons/fa";
import { AiFillLayout, AiOutlineForm } from "react-icons/ai";
import { GiClick, GiCookie } from "react-icons/gi";
import { TiDocumentText } from "react-icons/ti";

const styles = StyleSheet.create({
  seperator: {
    borderLeft: "1px solid black",
    marginLeft: 1,
    marginRight: 1,
    height: 10,
    width: 1
  },
  messageTitle: {
    fontFamily: "Muli",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 10,
    color: "black",
    lineHeight: "12px",
    letterSpacing: 0.3
  },
  messageDetail: {
    fontFamily: "Muli",
    fontStyle: "normal",
    fontWeight: "normal",
    color: "black",
    fontSize: 8,
    lineHeight: "12px"
  }
});

const MessageDetailComponent = props => {
  const message = props.message;
  const type = message.type;

  switch (type) {
    case 1:
      return <Row></Row>;
    case 2:
      return (
        <Row horizontal="space-evenly">
          <GoCloudDownload />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Screenview</span>
          <div className={css(styles.seperator)}></div>
          {message.screenview.type === "LOAD" ? (
            <span className={css(styles.messageDetail)}>LOAD</span>
          ) : (
            <span className={css(styles.messageDetail)}>UNLOAD</span>
          )}
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Name: {message.screenview.name}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            URL: {message.screenview.url}
          </span>
        </Row>
      );
    case 3:
      return (
        <Row horizontal="space-evenly">
          <MdNetworkCheck />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Connections Message</span>
        </Row>
      );
    case 4:
      return (
        <Row horizontal="space-evenly">
          <FaMousePointer />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>User Interaction</span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Event: {message.event.type}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Target: {message.target.id}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            ID Type:{" "}
            {message.target.idType === -1
              ? "HTMLid"
              : message.target.idType === -2
              ? "Xpath"
              : "Custom"}
          </span>
        </Row>
      );
    case 5:
      return (
        <Row horizontal="space-evenly">
          <FaBolt />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Custom Event</span>
        </Row>
      );
    case 6:
      return (
        <Row horizontal="space-evenly">
          <MdError />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Exception</span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Description: {message.exception.description}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            URL {message.exception.url}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Line: {message.exception.line}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Repeats: {message.exception.repeats}
          </span>
        </Row>
      );
    case 7:
      return (
        <Row horizontal="space-evenly">
          <MdTimer />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Performance</span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Navigation: {message.performance.navigation.type}
          </span>
        </Row>
      );
    case 10:
      return (
        <Row horizontal="space-evenly">
          <AiFillLayout />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Layout Message</span>
        </Row>
      );
    case 11:
      return (
        <Row horizontal="space-evenly">
          <GiClick />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Gestures</span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Type: {message.event.type}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Number of Touches: {message.touches.length}
          </span>
        </Row>
      );
    case 12:
      return (
        <Row horizontal="space-evenly">
          <TiDocumentText />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>DOM Capture</span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            DCID: {message.domCapture.dcid}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Full DOM: {message.domCapture.fullDOM}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Has Frames: {message.domCapture.frames ? "True" : "False"}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Shadows: {message.domCapture.shadows ? "True" : "False"}
          </span>
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageDetail)}>
            Diff: {message.domCapture.diffs ? "True" : "False"}
          </span>
        </Row>
      );
    case 13:
      return (
        <Row horizontal="space-evenly">
          <FaGlobeAmericas />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>GeoLocation</span>
        </Row>
      );
    case 14:
      return (
        <Row horizontal="space-evenly">
          <GiCookie />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Cookie</span>
        </Row>
      );
    case 15:
      return (
        <Row horizontal="space-evenly">
          <AiOutlineForm />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Form Completion</span>
        </Row>
      );
    case 16:
    case 17:
      return (
        <Row horizontal="space-evenly">
          <MdWarning />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Alerts</span>
        </Row>
      );
    case 18:
      return (
        <Row horizontal="space-evenly">
          <MdMouse />
          <div className={css(styles.seperator)}></div>
          <span className={css(styles.messageTitle)}>Mouse Movement</span>
        </Row>
      );
    default:
      return <Row></Row>;
  }
};

export default MessageDetailComponent;
