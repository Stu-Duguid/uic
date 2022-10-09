privacy: [
  {
    targets: [ "#userID" ], // selector for user ID input
    maskType: 4,
    maskFunction: forge_sha256;
    }
  }
],
privacyPatterns: [
  // replace content inside tag with class pii-x with an X for each character
  {
    pattern: { regex: /<span id="userID">(.*?)</, flags: "g" },
    replacement: function(match, p1) { return "<span id=\"userID\">"+forge_sha256(p1)+"<"; }
  }
]
