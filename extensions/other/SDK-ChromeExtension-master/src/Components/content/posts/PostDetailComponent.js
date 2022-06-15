import React from "react";
import { Row } from "simple-flexbox";
import { Card } from "react-bootstrap";
import { StyleSheet, css } from "aphrodite";
import MessageDetailComponent from "./MessageDetailComponent";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    //height: "200px",
    margin: "1px"
  }
});

const PostDetailComponent = props => {
  return (
    <Card className={css(styles.container)}>
      <Card.Body>
        <Card.Subtitle>
          <span className="font-weight-bold">Messages</span>
        </Card.Subtitle>
        <Card.Text>
          {props.post.sessions[0].messages.map((message, index) => (
            <MessageDetailComponent message={message} />
          ))}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PostDetailComponent;
