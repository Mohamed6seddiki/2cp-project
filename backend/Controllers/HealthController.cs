using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
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
