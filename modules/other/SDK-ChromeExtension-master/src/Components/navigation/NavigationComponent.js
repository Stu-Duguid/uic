import React, { useState } from "react";
import { Row } from "simple-flexbox";
import { StyleSheet, css } from "aphrodite";
import { Nav } from "react-bootstrap";

const styles = StyleSheet.create({
  navigationText: {
    fontFamily: "Muli",
    color: "#1BF5AB"
  },
  activeNavigationText: {
    fontFamily: "Muli",
    color: "#20A892"
  },
  navItem: {
    color: "rgba(18,20,62,1)"
  },
  activeNavItem: {
    color: "rgba(18,20,62, 0.5)"
  }
});

const NavigationComponent = props => {
  const [activeTab, setActiveTab] = useState("nav-config");

  const toggleTab = tabId => {
    setActiveTab(tabId);
    props.toggleTab(tabId);
  };

  return (
    <Nav
      fill
      variant="tabs"
      className="justify-content-center"
      justify
      style={{ width: "100%" }}
    >
      <Nav.Item
        className={css(
          styles.navItem,
          activeTab === "nav-config" && styles.activeNavItem
        )}
      >
        <Nav.Link
          id="nav-config"
          active={activeTab === "nav-config"}
          onClick={() => toggleTab("nav-config")}
        >
          <span
            className={css(
              styles.navigationText,
              activeTab === "nav-config" && styles.activeNavigationText
            )}
          >
            Configuration
          </span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item
        className={css(
          styles.navItem,
          activeTab === "nav-posts" && styles.activeNavItem
        )}
      >
        <Nav.Link
          id="nav-posts"
          active={activeTab === "nav-posts"}
          onClick={() => toggleTab("nav-posts")}
        >
          <span
            className={css(
              styles.navigationText,
              activeTab === "nav-posts" && styles.activeNavigationText
            )}
          >
            Posts
          </span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item
        className={css(
          styles.navItem,
          activeTab === "nav-dom" && styles.activeNavItem
        )}
      >
        <Nav.Link
          id="nav-dom"
          active={activeTab === "nav-dom"}
          onClick={() => toggleTab("nav-dom")}
        >
          <span
            className={css(
              styles.navigationText,
              activeTab === "nav-dom" && styles.activeNavigationText
            )}
          >
            DOM
          </span>
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default NavigationComponent;
