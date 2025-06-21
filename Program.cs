using Microsoft.EntityFrameworkCore;


// All the code that runs goes here, at the top.

var builder = WebApplication.CreateBuilder(args);

// This tells the app where to find my database file (info is in appsettings.json).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Connects our app to the SQLite database.
builder.Services.AddDbContext<ProjectDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// A simple test page to make sure the server is running.
app.MapGet("/", () => "Welcome to DevFolio API!");
// It will listen for GET requests at "/api/projects".
app.MapGet("/api/projects", async (ProjectDbContext db) =>
{
    // go into the database, find the Projects table, and get all of them as a list.
    var projects = await db.Projects.ToListAsync();
    // send back the list of projects with a 200 OK success status.
    return Results.Ok(projects);
});

// A POST request is used when you want to create a new item.
app.MapPost("/api/projects", async (Project newProject, ProjectDbContext db) =>
{
    // 'newProject' is the project data that gets sent to us.
    // We just add it to our database context.
    db.Projects.Add(newProject);

    // This saves all the pending changes to the actual database file.
    await db.SaveChangesAsync();

    // We send back the project that was just created, along with a "201 Created" status.
    return Results.Created($"/api/projects/{newProject.Id}", newProject);
});

// This endpoint listens for PUT requests to update an existing project.
// The "{id}" part means the ID of the project to update will be in the URL.
app.MapPut("/api/projects/{id}", async (int id, Project updatedProject, ProjectDbContext db) =>
{
    // First, find the original project in the database using the ID from the URL.
    var projectToUpdate = await db.Projects.FindAsync(id);

    // If we can't find a project with that ID, send back a "Not Found" error.
    if (projectToUpdate is null)
    {
        return Results.NotFound();
    }

    // Now, update the properties of the project we found with the new data.
    projectToUpdate.Title = updatedProject.Title;
    projectToUpdate.Description = updatedProject.Description;
    projectToUpdate.Technologies = updatedProject.Technologies;
    projectToUpdate.GitHubUrl = updatedProject.GitHubUrl;
    projectToUpdate.LiveUrl = updatedProject.LiveUrl;

    // Save the changes to the database.
    await db.SaveChangesAsync();

    // Send back a "No Content" response, which is standard for a successful update.
    return Results.NoContent();
});


app.Run();


// --- "DEFINITION" SECTION ---
// All class definitions are moved to the bottom of the file.

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

// This empty class definition is the hint for our 'dotnet ef' tool.
// By placing it here, it doesn't break the action code above.
public partial class Program { }