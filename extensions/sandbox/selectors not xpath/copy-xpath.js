
    /**
     * Generates an XPath for a given node
     * @function
     */
     getXPathListFromNode = (function () {

      var specialChildNodes = {
              "nobr": true
          };

      /**
       * Returns Xpath array for a node
       * @private
       * @param {Element} node DOM element
       * @param {Boolean} wantFullPath Return full xpath or truncate at parent with HTML ID.
       * @param {Boolean} notInDocument Indicates if the node is part of a cloned subtree not attached to the document.
       * @param {String} [oldId] Optional id value to be used instead of elements current id.
       * @return {Array} xpath array
       */
      return function (node, wantFullPath, notInDocument, oldId) {
          var j,
              documentElement = document.documentElement,
              nodeId,
              tmpChild = null,
              parentWindow = null,
              parentNode = null,
              xpath = [],
              xpathComponent,
              loop = true,
              localTop = window,
              tagName = "",
              setHost = false,
              shadowRoot;

          // Sanity check
          if (!node || !node.nodeType) {
              return xpath;
          }

          // Calculate xpath of the host element for document-fragment nodes.
          if (node.nodeType === 11) {
              node = node.host;
              if (node) {
                  setHost = true;
              } else {
                  return xpath;
              }
          }

          while (loop) {
              // Need to continue the loop incase of elements in frame/iframe and shadow trees.
              loop = false;

              tagName = utils.getTagName(node);
              if (tagName === "window") {
                  continue;
              }

              if (tagName && !setHost) {
                  // Fix to handle tags that are not normally visual elements
                  if (specialChildNodes[tagName]) {
                      node = node.parentNode;
                      loop = true;
                      continue;
                  }
              }

              // Get xpath for node or iframe
              for (nodeId = checkId(node, oldId);
                      node && (node.nodeType === 1 || node.nodeType === 9) && node !== document && (wantFullPath || !nodeId);
                      nodeId = checkId(node)) {
                  parentNode = node.parentNode;

                  // If the node has no parent, check if it is a frame element
                  if (!parentNode) {
                      parentWindow = utils.getWindow(node);
                      if (!parentWindow || notInDocument) {
                          // node is not attached to any window
                          xpathComponent = [tagName, 0];
                          xpath[xpath.length] = xpathComponent;
                          return xpath.reverse();
                      }
                      if (parentWindow === localTop) {
                          // node is attached to top window but doesn't have a parent.
                          return xpath.reverse();
                      }
                      // node is a frame/iframe
                      node = parentWindow.frameElement;
                      tagName = utils.getTagName(node);
                      parentNode = node.parentNode;
                      continue;
                  }

                  tmpChild = parentNode.firstChild;
                  // Sanity check: Parent has no children?
                  if (!tmpChild) {
                      xpath.push(["XPath Error(1)"]);
                      node = null;
                      break;
                  }

                  // Calculate the index of the node amongst its siblings
                  for (j = 0; tmpChild; tmpChild = tmpChild.nextSibling) {
                      if (tmpChild.nodeType === 1 && utils.getTagName(tmpChild) === tagName) {
                          if (tmpChild === node) {
                              xpathComponent = [tagName, j];
                              if (setHost) {
                                  xpathComponent.push("h");
                                  setHost = false;
                              }
                              xpath[xpath.length] = xpathComponent;
                              break;
                          }
                          j += 1;
                      }
                  }

                  if (parentNode.nodeType === 11) {
                      node = parentNode.host;
                      setHost = true;
                  } else {
                      node = parentNode;
                  }

                  tagName = utils.getTagName(node);
              }

              if (nodeId && !wantFullPath) {
                  xpathComponent = [nodeId];
                  if (setHost) {
                      xpathComponent.push("h");
                      setHost = false;
                  }
                  xpath[xpath.length] = xpathComponent;
                  // For elements within a frame/iframe continue the loop after resetting node to the frame element in the parent DOM
                  if (utils.isIFrameDescendant(node)) {
                      loop = true;
                      node = utils.getWindow(node).frameElement;
                  } else if (!notInDocument && !documentElement.contains(node)) {
                      // The node is not inside the document, check if it could be in Shadow DOM
                      if (node.getRootNode) {
                          shadowRoot = node.getRootNode();
                          if (shadowRoot) {
                              // For elements within a Shadow DOM tree, continue the loop after resetting node to the shadow host element.
                              node = shadowRoot.host;
                              setHost = true;
                              loop = true;
                          }
                      }
                  }
              }
              oldId = undefined;
          }

          return xpath.reverse();
      };
  }());
