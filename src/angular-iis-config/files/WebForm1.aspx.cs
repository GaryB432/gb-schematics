using System;
using System.Security.Principal;
using System.Web;
using System.Web.UI;

namespace <%= classify(project) %>
{
  public partial class WebForm1 : Page
  {

    private const string _demandedRole = "TUPL";
    protected void Page_Load(object sender, EventArgs e)
    {
      var mc = new CustomPrincipal(WindowsIdentity.GetCurrent());
      // Label1.Text = mc.Identity.AuthenticationType.ToString();

      if (!mc.IsInRole(_demandedRole))
      {
        throw new HttpException(403, "Forbidden");
      }
      const string scriptContent = "var _appSession = new Session(new User('{0}')); console.log(_appSession.user.fullname);";
      ClientScript.RegisterStartupScript(
        GetType(),
        "auth", string.Format(scriptContent, mc.Identity.Name.Replace("\\", "\\\\")),
        true);
    }
  }

  public class CustomPrincipal : IPrincipal
  {
    private readonly IIdentity _identity;
    public CustomPrincipal(IIdentity identity)
    {
      _identity = identity;
    }

    public IIdentity Identity => _identity;

    public bool IsInRole(string role)
    {
      return Identity.IsAuthenticated && Identity.Name.Equals("GARY-INSPIRON\\Gary");
    }
  }
}
