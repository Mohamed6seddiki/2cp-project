using Microsoft.AspNetCore.Mvc;
using backend.DTOs.Common;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous]
        [EndpointSummary("Health check endpoint")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorDto), StatusCodes.Status500InternalServerError)]
        public ActionResult<object> Get()
        {
            return Ok(new
            {
                service = "backend",
                status = "ok",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
