import React from "react";
import brace from "brace";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/theme/github";

const CodeEditor = props => {
  const onChange = newValue => {
    console.log("change: " + newValue);
  };

  return (
    <AceEditor
      mode="javascript"
      theme="github"
      onChange={onChange}
      name={props.configuration.name + "-editor"}
      editorProps={{ $blockScrolling: true }}
      value={JSON.stringify(props.configuration, null, " ")}
      readOnly="true"
      fontSize="6"
      width="90%"
      height="100px"
      wrapEnabled="true"
    />
  );
};

export default CodeEditor;
