namespace ConantPublicLibrary.Server.Models;
using System;

public class EventType
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? OrderNo { get; set; }
    public DateTime CreatedOn { get; set; }
}
