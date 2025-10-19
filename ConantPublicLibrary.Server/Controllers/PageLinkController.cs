using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Text.Json.Serialization;

namespace ConantPublicLibrary.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PageLinkController : ControllerBase
    {
        private readonly IConfiguration _config;

        public PageLinkController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("{subcategoryId}")]
        public async Task<IActionResult> Get(int subcategoryId)
        {
            var result = new PageLinkModel();

            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            string query = @"SELECT TOP 1 * FROM PageLink WHERE subcategoryid = @subcategoryid";
            using var cmd = new SqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@subcategoryid", subcategoryId);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                result.CategoryId = reader["categoryid"] as int? ?? 0;
                result.Url = reader["url"].ToString();
                result.IsOpenNewWindow = Convert.ToInt32(reader["isopennewwindow"]);

                return Ok(result);
            }

            return NotFound();
        }

        [HttpPost("{subcategoryId}")]
        public async Task<IActionResult> Save(int subcategoryId, [FromBody] PageLinkModel model)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            string checkQuery = "SELECT COUNT(*) FROM PageLink WHERE subcategoryid = @subcategoryid";
            using var checkCmd = new SqlCommand(checkQuery, connection);
            checkCmd.Parameters.AddWithValue("@subcategoryid", subcategoryId);

            int count = (int)await checkCmd.ExecuteScalarAsync();

            string query;
            if (count > 0)
            {
                query = @"UPDATE PageLink 
                          SET url = @url, isopennewwindow = @isopennewwindow, modifiedon = GETDATE() 
                          WHERE subcategoryid = @subcategoryid";
            }
            else
            {
                query = @"INSERT INTO PageLink (categoryid, subcategoryid, url, isopennewwindow, createdon)
                          VALUES (@categoryid, @subcategoryid, @url, @isopennewwindow, GETDATE())";
            }

            using var cmd = new SqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@subcategoryid", subcategoryId);
            cmd.Parameters.AddWithValue("@categoryid", model.CategoryId ?? 0);
            cmd.Parameters.AddWithValue("@url", model.Url ?? "");
            cmd.Parameters.AddWithValue("@isopennewwindow", model.IsOpenNewWindow);

            await cmd.ExecuteNonQueryAsync();
            return Ok();
        }
    }

    public class PageLinkModel
    {
        [JsonPropertyName("categoryId")]
        public int? CategoryId { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }

        [JsonPropertyName("isOpenNewWindow")]
        public int IsOpenNewWindow { get; set; }
    }
}
