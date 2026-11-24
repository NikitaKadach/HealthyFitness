using Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Authorize]
public abstract class ApiControllerBase : ControllerBase
{
    // Идентификатор и роль берутся только из проверенного JWT
    protected string CurrentUserId => User.FindFirst("sub")?.Value ?? "";
    protected string CurrentRole => User.FindFirst("role")?.Value ?? "";

    protected ObjectResult Error(int status, string message) => StatusCode(status, new ErrorDto(message));
}
