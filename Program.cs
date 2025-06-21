using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// This tells the app where to find my database file (info is in appsettings.json).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Connects our app to the SQLite database.
builder.Services.AddDbContext<ProjectDbContext>(options =>
    options.UseSqlite(connectionString));

var app = builder.Build();

// A simple test page to make sure the server is running.
app.MapGet("/", () => "Welcome to DevFolio API!");

app.Run();

// This is what a single "Project" will look like in the database.
public class Project
{
    public int Id { get; set; } // a simple ID for each project
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    // just gonna store the tech stack as a string like "C#, .NET, HTML"
    public string Technologies { get; set; } = string.Empty; 
    public string GitHubUrl { get; set; } = string.Empty;
    public string LiveUrl { get; set; } = string.Empty;
}

// This is how my app talks to the database.
public class ProjectDbContext(DbContextOptions<ProjectDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects { get; set; }
}