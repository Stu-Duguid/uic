let config = {
  ajaxListener: {
    // Initialise Ajax Listener even if another tool is overriding XHR and/or Fetch
    skipSafetyCheck: false,
    // Block the contents of the response if it is not of content-type "application/json"
    blockNonJSONResponse: true,
    // List of JSON fields for which values will be blocked. These will be blocked in
    // requestHeaders, responseHeaders, requestData, and responseData. All instances of
    // fields with these names will be blocked, anywhere in the payload.
    // Exact match or regex object.
    fieldBlocklist: [
      "html",
      "script",
      "idKey",
      "project_id",
      { regex: "company_|sdk_", flags: "i" },
      { regex: "banner_" }
    ],
    urlBlocklist: [
      { regex: "brilliantcollector\\.com|bing\\.com|pinterest\\.com|spotify\\.com|onetrust\\.com|paypal|google-analytics\\.com", flags: "i" }
    ],
    filters: [
      {
        log: {
          requestHeaders: true,
          requestData: true,
          responseHeaders: true,
          responseData: true
        }
      }
    ]
  }
}