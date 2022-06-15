<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
    /*
     * NOTE:  This is a sample page.  Please review and modify it to avoid any security threats as per your organization
     * specific policies.  The Target Page needs to receive the full POST content from the UI SDK client before writing
     * the response.  As long as it is configured to do so without dropping any packets, you may modify this page.
     */
    $TLT_TARGET_VERSION = "1.8";
    $TLT_TARGET_RESP_CONTENT_TYPE = "text/plain";
    /*
     * NOTE: Update the TLT_MAX_REQ_LENGTH setting to reflect the typical POST data size specific to your deployment.
     */
    $TLT_MAX_REQ_LENGTH = 20000;

    header("Content-Type: ".$TLT_TARGET_RESP_CONTENT_TYPE);

    /*
     * Utility function to return the timestamp in milliseconds.
     */
    function MSTimestamp()
    {
      $ms = microtime(true) * 1000;
      return $ms;
    }

    /*
     * Read the raw POST data to ensure the request is read before the response is generated.
     */
    function ProcessPost()
    {
      if (!strcasecmp($_SERVER['REQUEST_METHOD'], "POST")) {
        $start = MSTimestamp();
        $actualReadLength = 0;
        $maxReadLength = 0;
        $html = "";

        try {
          // Limit the read size to at most TLT_MAX_REQ_LENGTH bytes.
          global $TLT_MAX_REQ_LENGTH;
          $reqLength = isset($_SERVER['CONTENT_LENGTH']) ? $_SERVER['CONTENT_LENGTH'] : 0;
          $maxReadLength = (!$reqLength || $reqLength > $TLT_MAX_REQ_LENGTH) ? $TLT_MAX_REQ_LENGTH : $reqLength;

          $html .= "<br>Request length: $reqLength";
          $html .= "<br>Max. read length: $maxReadLength";

          // Open the input stream for access to raw POST data
          $postFileHandle = fopen("php://input", 'rb');
          if ($postFileHandle) {
            while ($actualReadLength < $maxReadLength) {
              $postData = fread($postFileHandle, $maxReadLength);
              if ($postData) {
                $actualReadLength += strlen($postData);
              }
              else {
                $html .= "<br>Failed to read the raw POST data. Read of the input stream failed.";
                break;
              }
              $postData = null;
            }
            fclose($postFileHandle);
          }
          else {
            $html .= "<br>Failed to read the raw POST data. Open of the input stream failed.";
          }
        }
        catch (Exception $e) {
          $html .= "<br>Exception when reading request data!".$e->getMessage();
        }

        $end = MSTimestamp();

        $html .= "<p>Read $actualReadLength bytes.</p>";
        return $html;
      }

      return "";
    }

?>

<html>
<head><title>TealeafTarget.php</title></head>
<body>
<?php
      echo "<p>Tealeaf Target Version $TLT_TARGET_VERSION</p>";
      echo ProcessPost();
?>
</body>
</html>