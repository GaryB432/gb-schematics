X%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="<%= classify(project) %>.WebForm1" %>

<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
  <base href="/">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <title></title>
  <script type="text/javascript">
    var Session = /** @class */ (function () {
      function Session(user) {
        this.user = user;
      }
      return Session;
    }());
    var User = /** @class */ (function () {
      function User(fullname) {
        this.fullname = fullname;
        this.name = this.fullname;
        var ap = fullname.split('@');
        if (ap.length === 2) {
          this.name = ap[0];
          this.domain = ap[1];
        }
        else {
          var bsp = fullname.split('\\');
          if (bsp.length === 2) {
            this.name = bsp[1];
            this.domain = bsp[0];
          }
        }
      }
      return User;
    }());
  </script>
</head>

<body>
  <form id="form1" runat="server"></form>
  <app-root></app-root>
  <script type="text/javascript" src="runtime.js"></script>
  <script type="text/javascript" src="polyfills.js"></script>
  <script type="text/javascript" src="styles.js"></script>
  <script type="text/javascript" src="vendor.js"></script>
  <script type="text/javascript" src="main.js"></script>
</body>

</html>