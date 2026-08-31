using Microsoft.AspNetCore.Mvc;
using PropertyOwnerLookup.Api.Models;
namespace PropertyOwnerLookup.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Returns the current health status of the API.
    /// </summary>
    /// <returns>The health status of the Property Owner Lookup API.</returns>
    [HttpGet]
    [ProducesResponseType<HealthResponse>(StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(new HealthResponse(
            Status: "Healthy",
            Service: "PropertyOwnerLookup.Api"
        ));
    }
}