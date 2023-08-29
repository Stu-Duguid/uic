/*!
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 6.4.20
 */

/*!
 * README - DEPLOYMENT INSTRUCTIONS
 * ================================
 * 1. Copy the gzip encoder to the beginning of this file.
 * 2. Save this file to a directory serving JS in the SAME domain as the page/app.
 *    NOTE: DO NOT combine this JS with any other script. The mechanics of loading the WebWorker script
 *          are not the same as that of ordinary JS. Tag managers or dynamic loaders cannot load WebWorkers.
 * 3. Verify this file is accessible from the browser using it's URL.
 * 4. Configure the UIC to load this Worker by adding the "tltWorker" property to the queue configuration:
        queue: {
            // Only initialize on browsers supporting the fetch API
            tltWorker: window.fetch && window.Worker ? new Worker("/js/tltWorker.js") : null,
            xhrLogging: true,
            queues: [
                ...
 */

var gzipEncoder = pako.gzip;

/*! WARNING: DO NOT EDIT BELOW THIS LINE **/
this.onmessage = function (e) {
    var message = e.data,
        data = message.data,
        fetchOptions,
        url = message.url,
        headers = message.headers,
        msgId = message.id,
        serializedData,
        reqData;

    // Sanity check
    if (!data || !url) {
        return;
    }

    // 1. Serialize
    serializedData = JSON.stringify(data);
    // 2. Compress
    if (gzipEncoder) {
        reqData = gzipEncoder(serializedData);
        headers["Content-Encoding"] = "gzip";
    } else {
        reqData = "ERROR: Invalid gzip encoder or encoder not found. Check tltWorker deployment.";
    }
    // 3. Add request headers
    headers["X-Requested-With"] = "fetch";
    headers["X-Requested-From"] = "tltWorker";
    // 4. Transmit
    fetchOptions = {
        method: "POST",
        headers: headers,
        body: reqData,
        mode: message.isCrossOrigin ? "cors" : "same-origin",
        credentials: message.isCrossOrigin ? "omit" : "same-origin",
        keepalive: !message.isCrossOrigin && message.isUnloading,
        cache: "no-store"
    };
    fetch(url, fetchOptions).then(function (response) {
        var result = {
            success: response.ok,
            statusCode: response.status,
            statusText: response.statusText,
            id: msgId
        };

        if (result.success) {
            response.text().then(function (responseData) {
                try {
                    // Parse into JSON if possible.
                    result.data = JSON.parse(responseData);
                } catch (e1) {
                    // Else send raw text
                    result.data = responseData;
                }
                postMessage(result);
            }).catch(function (e2) {
                result.statusCode = 1;
                result.statusText = e2.message;
                postMessage(result);
            });
        }
    }).catch(function (e3) {
        var result = {
            success: false,
            statusCode: 2,
            statusText: e3.message,
            id: msgId
        };
        postMessage(result);
    });
};
