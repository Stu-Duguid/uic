/*global chrome*/
import React, { useState, useEffect } from "react";
import "./App.css";
import HeaderComponent from "./Components/header/HeaderComponent";
import FooterComponent from "./Components/footer/FooterComponent";
import NavigationComponent from "./Components/navigation/NavigationComponent";
import PostsComponent from "./Components/content/posts/PostsComponent";
import ConfigurationComponent from "./Components/content/configuration/ConfigurationComponent";
import DomComponent from "./Components/content/dom/DomComponent";
import { StyleSheet, css } from "aphrodite";
import { Row, Column } from "simple-flexbox";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styles/index.css";
import { Alert, Badge, Card } from "react-bootstrap";

const styles = StyleSheet.create({
  content: {
    flex: "1 0 auto",
    padding: "var(--space) var(--space) 0",
    width: "100%",
    height: "100%",
    marginBottom: -60
  },
  push: {
    height: 40
  }
});

const App = () => {
  const [rawConfiguration, setRawConfiguration] = useState();
  const [overstatConfiguration, setOverstatConfiguration] = useState();
  const [performanceConfiguration, setPerformanceConfiguration] = useState();
  const [replayConfiguration, setReplayConfiguration] = useState();
  const [endPoint, setEndPoint] = useState();
  const [numberOfPosts, setNumberOfPosts] = useState(0);
  const [posts, setPosts] = useState([]);
  const [sdkVersion, setSDKVersion] = useState();
  const [competitorList, setCompetitorList] = useState([]);
  const [tabSelected, setTabSelected] = useState("nav-config");
  const [domdata, setDomData] = useState({});

  const getOverstatConfiguration = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getOverstatConfig" },
        function(overstat) {
          console.log(overstat);
          if (overstat) setOverstatConfiguration(overstat);
        }
      );
    });
  };

  const getPerformanceConfiguration = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getPerformanceConfig" },
        function(performance) {
          console.log(performance);
          if (performance) setPerformanceConfiguration(performance);
        }
      );
    });
  };

  const getReplayConfiguration = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "getReplayConfig" }, function(
        replay
      ) {
        console.log(replay);
        if (replay) setReplayConfiguration(replay);
      });
    });
  };

  const getEndPointData = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "getEndPoint" }, function(
        endpointData
      ) {
        console.log(endpointData);
        if (endpointData) setEndPoint(endpointData.location.split(",")[0]);
      });
    });
  };

  const getSDKVersion = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "getSDKVersion" }, function(
        sdkVersionNumber
      ) {
        console.log(sdkVersionNumber);
        if (sdkVersionNumber) setSDKVersion(sdkVersionNumber);
      });
    });
  };

  const getPostCount = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "getPostCount" }, function(
        postCount
      ) {
        console.log(
          "Recieved Post Count data in Extension: " + postCount.numberOfPosts
        );
        if (postCount) setNumberOfPosts(postCount.numberOfPosts);
      });
    });
  };

  const getCompetitorListObject = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getCompetitorList" },
        function(competitors) {
          console.log("The competitors are: " + competitors);
          let competitorArray = Object.keys(JSON.parse(competitors));
          setCompetitorList(competitorArray);
        }
      );
    });
  };

  const getRawConfiguration = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getRawConfiguration" },
        function(rawConfig) {
          if (rawConfig) setRawConfiguration(rawConfiguration);
        }
      );
    });
  };

  const getJSONPostDataQueue = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getPostDataQueue" },
        function(postQueue) {
          if (postQueue) {
            const newPostsList = posts.concat(postQueue);
            setPosts(newPostsList);
            console.log(
              "The state object POSTS has been Changed!!" +
                JSON.stringify(posts)
            );
          }
        }
      );
    });
  };

  const getShadowDOMList = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      console.log("Requesting for Shadow DOM!");
      chrome.tabs.sendMessage(tabs[0].id, { type: "getShadowDOM" }, function(
        shadowDOMList
      ) {
        if (shadowDOMList.length > 0) {
          setDomData({ shadowdom: "TRUE", dynamicCSS: domdata.dynamicCSS });
          console.log(
            "The page has " + shadowDOMList.length + " shadow DOM nodes."
          );
        } else {
          setDomData({ shadowdom: "FALSE", dynamicCSS: domdata.dynamicCSS });
          console.log("The page doesn't contain any Shadow Dom Nodes.");
        }
      });
    });
  };

  const getDynamicCSS = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      console.log("Requesting for presence of Dynamic CSS.");
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "containsDynamicCSS" },
        function(containsDynamicStyleSheet) {
          if (containsDynamicStyleSheet) {
            let newDomData = domdata;
            newDomData.dynamicCSS = "TRUE";
            newDomData.shadowdom = domdata.shadowdom;
            setDomData(newDomData);
            console.log("The page contains dynamic CSS.");
          } else {
            let newDomData = domdata;
            newDomData.dynamicCSS = "FALSE";
            newDomData.shadowdom = domdata.shadowdom;
            setDomData(newDomData);
            console.log("The page doesn't contain dynamic CSS.");
          }
        }
      );
    });
  };

  const toggleTab = selectedTabId => {
    setTabSelected(selectedTabId);
  };

  useEffect(() => {
    getRawConfiguration();
    getOverstatConfiguration();
    getPerformanceConfiguration();
    getReplayConfiguration();
    getEndPointData();
    getSDKVersion();
    getPostCount();
    getJSONPostDataQueue();
    getCompetitorListObject();
    getShadowDOMList();
    getDynamicCSS();
  }, []);

  return (
    <div className="App Site">
      <div className={css(styles.content)}>
        {sdkVersion && endPoint ? (
          //<NavigationBar versionNumber={sdkVersion} dc={endPoint} />
          <Row horizontal="center">
            <HeaderComponent version={sdkVersion} dataCenter={endPoint} />
          </Row>
        ) : (
          <span />
        )}
        <Row>
          <NavigationComponent toggleTab={toggleTab} />
        </Row>
        {tabSelected === "nav-posts" ? (
          <PostsComponent postlist={posts} />
        ) : tabSelected === "nav-config" ? (
          <ConfigurationComponent
            configurations={[
              overstatConfiguration,
              replayConfiguration,
              performanceConfiguration
            ]}
          />
        ) : (
          <DomComponent domdata={domdata} />
        )}
        <div className={css(styles.push)}></div>
      </div>

      {/* { {overstatConfiguration &&
      replayConfiguration &&
      performanceConfiguration ? (
        <ConfigurationCard
          overstatConfiguration={
            overstatConfiguration ? overstatConfiguration : null
          }
          replayConfiguration={replayConfiguration ? replayConfiguration : null}
          performanceConfiguration={
            performanceConfiguration ? performanceConfiguration : null
          }
          postCount={numberOfPosts}
        />
      ) : (
        <Alert variant="warning">
          <Alert.Heading>TL SDK Missing!</Alert.Heading>
          <p>
            The Experience Analytics SDK is either missing or hasn't been
            initialized yet! It is possible that the customer has killed the SDK
            after initialization or they are sampling the SDK.
          </p>
        </Alert>
      )}

      {!competitorList.length ? (
        ""
      ) : (
        <Alert variant="secondary">
          <Alert.Heading>Competitor SDK Detected</Alert.Heading>
          {competitorList.map((competitor, key) => (
            <Badge pill variant="warning">
              {competitor}
            </Badge>
          ))}
        </Alert>
      )} } */}

      <Row horizontal="center">
        <FooterComponent
          rawConfiguration={rawConfiguration}
          clickHandler={getJSONPostDataQueue}
        />
      </Row>
    </div>
  );
};

//<Footer rawconfiguration={rawConfiguration} />
export default App;
