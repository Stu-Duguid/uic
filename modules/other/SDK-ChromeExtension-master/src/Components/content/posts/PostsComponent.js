import React from "react";
import { Row } from "simple-flexbox";
import { StyleSheet, css } from "aphrodite";
import { Accordion, Card, ListGroupItem } from "react-bootstrap";
import PostDetailComponent from "./PostDetailComponent";
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
  container: {
    width: "100%",
    height: "90%",
    marginTop: "10px",
    border: "1px solid #1BF5AB",
    flexFlow: "wrap"
  },
  seperator: {
    borderLeft: "1px solid white",
    marginLeft: 16,
    marginRight: 16,
    height: 32,
    width: 2
  }
});

const PostsComponent = props => {
  const getMessageIcon = (message, index) => {
    console.log("Returning icons for each message");
    switch (message.type) {
      case 1:
        return;
      case 2:
        return <GoCloudDownload key={index} />;
      case 3:
        return <MdNetworkCheck key={index} />;
      case 4:
        return <FaMousePointer key={index} />;
      case 5:
        return <FaBolt key={index} />;
      case 6:
        return <MdError key={index} />;
      case 7:
        return <MdTimer key={index} />;
      case 10:
        return <AiFillLayout key={index} />;
      case 11:
        return <GiClick key={index} />;
      case 12:
        return <TiDocumentText key={index} />;
      case 13:
        return <FaGlobeAmericas key={index} />;
      case 14:
        return <GiCookie key={index} />;
      case 15:
        return <AiOutlineForm key={index} />;
      case 16:
      case 17:
        return <MdWarning key={index} />;
      case 18:
        return <MdMouse key={index} />;
      default:
        return;
    }
  };

  return (
    <Row className={css(styles.container)}>
      <Accordion style={{ width: "100%" }}>
        {props.postlist.map((post, index) => (
          <Card key={index}>
            <Accordion.Toggle as="Card.Header" eventKey={index}>
              <Row horizontal="space-between">
                <ListGroupItem style={{ width: "100%" }} variant="primary">
                  <div>
                    <span>Post {post.serialNumber}</span>
                    <span>{post.sessions[0].messages.length}</span>
                  </div>
                  <div>
                    {post.sessions[0].messages.map((message, index) =>
                      getMessageIcon(message, index)
                    )}
                  </div>
                </ListGroupItem>
              </Row>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={index}>
              <Card.Body>
                <PostDetailComponent key={index} post={post} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        ))}
      </Accordion>
    </Row>
  );
};

export default PostsComponent;
