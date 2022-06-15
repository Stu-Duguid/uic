<%-- NOTE:  This is a sample page.  Please review and modify it to avoid any security threats as per your organization --%>
<%-- specific policies.  The Target Page needs to receive the full POST content from the UI SDK client before writing  --%>
<%-- the response.  As long as it is configured to do so without dropping any packets, you may modify this page.       --%>
<% String TLT_TARGET_VERSION = "1.7"; %>
<%-- NOTE: Update the TLT_MAX_REQ_LENGTH setting to reflect the typical POST data size specific to your deployment. --%>
<% long TLT_MAX_REQ_LENGTH = 20000; %>
<%@page contentType="text/plain" %>

<html>
  <head><title>TealeafTarget.jsp</title></head>
  <body>
    <p>Tealeaf Target Version <% out.print(TLT_TARGET_VERSION); %></p>
    <%
        long ts1 = System.currentTimeMillis();
        long totalLength = 0L;
        java.io.BufferedReader rdr = request.getReader();
        String str1 = null, str2 = null;

        try {
            totalLength = rdr.skip(TLT_MAX_REQ_LENGTH);
        } catch (Exception e) {
            out.print("<br>Exception when reading request data!" + e.toString());
        }

        long ts2 = System.currentTimeMillis();
    %>
    <p>Read <% out.print(totalLength); %> bytes.</p>
  </body>
</html>