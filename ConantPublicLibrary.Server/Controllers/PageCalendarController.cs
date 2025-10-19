using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace ConantPublicLibrary.Server.Controllers
{
    [Route("api/calendar")]
    [ApiController]
    public class CalendarController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly SqlConnection _connection;

        public CalendarController(IConfiguration configuration)
        {
            _configuration = configuration;
            _connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetEvents([FromQuery] int subcategoryId, [FromQuery] int? eventTypeId = null)
        {
            try
            {
                await _connection.OpenAsync();

                string query = @"
                SELECT e.id, e.title, e.eventdate, e.starttime, e.endtime,
                       e.eventtypeid, et.name AS eventtypename,
                       e.description, e.image
                FROM events e
                LEFT JOIN EventType et ON e.eventtypeid = et.id
                WHERE e.subcategoryid = @subcategoryid";

                if (eventTypeId.HasValue)
                {
                    query += " AND e.eventtypeid = @eventtypeid";
                }

                query += " ORDER BY e.eventdate, e.starttime";

                var cmd = new SqlCommand(query, _connection);
                cmd.Parameters.AddWithValue("@subcategoryid", subcategoryId);

                if (eventTypeId.HasValue)
                    cmd.Parameters.AddWithValue("@eventtypeid", eventTypeId.Value);

                var reader = await cmd.ExecuteReaderAsync();

                var events = new List<object>();
                while (await reader.ReadAsync())
                {
                    events.Add(new
                    {
                        Id = (int)reader["id"],
                        Title = reader["title"].ToString(),
                        Date = ((DateTime)reader["eventdate"]).ToString("yyyy-MM-dd"),
                        StartTime = reader["starttime"]?.ToString(),
                        EndTime = reader["endtime"]?.ToString(),
                        EventTypeId = reader["eventtypeid"] as int?,
                        EventTypeName = reader["eventtypename"]?.ToString(),
                        Description = reader["description"]?.ToString(),
                        Image = reader["image"]?.ToString()
                    });
                }

                await _connection.CloseAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                await _connection.CloseAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

}
