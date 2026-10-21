using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace AureliaFc.Api.Controllers;

/// <summary>
/// Base controller adding a helper that turns a field->message dictionary into a
/// 400 ValidationProblemDetails response the React client can map to form fields.
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected ActionResult ValidationErrors(IDictionary<string, string> errors)
    {
        var modelState = new ModelStateDictionary();
        foreach (var (field, message) in errors)
            modelState.AddModelError(field, message);

        return ValidationProblem(modelState);
    }
}
