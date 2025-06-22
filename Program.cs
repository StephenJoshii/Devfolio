using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Security.Claims;

// Setting up all my services.
var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ProjectDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ProjectDbContext>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("cookieAuth", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        Name = ".AspNetCore.Identity.Application",
        In = ParameterLocation.Cookie
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "cookieAuth"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the request pipeline. Order matters here.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- THIS IS THE FIX for redirecting to the login page ---
// I removed app.UseDefaultFiles() and am adding a specific redirect.
app.MapGet("/", () => Results.Redirect("/auth.html"));

// This still serves all my other files like style.css, admin.html, etc.
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapIdentityApi<IdentityUser>();

// --- My API Endpoints ---

// A special endpoint to get the current logged-in user's info.
app.MapGet("/api/me", (ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var userEmail = user.FindFirstValue(ClaimTypes.Email);
    return Results.Ok(new { userId, email = userEmail });
}).RequireAuthorization();

// --- THIS IS THE FIX for getting the username ---
// GET a user's public info (their username). This is public.
app.MapGet("/api/users/{userId}/info", async (string userId, UserManager<IdentityUser> userManager) =>
{
    var user = await userManager.FindByIdAsync(userId);
    if (user is null)
    {
        return Results.NotFound();
    }
    // Only return public info.
    return Results.Ok(new { username = user.UserName });
});


// GET projects for a specific user.
app.MapGet("/api/users/{userId}/projects", async (string userId, ProjectDbContext db) =>
{
    var projects = await db.Projects
        .Where(p => p.UserId == userId)
        .ToListAsync();
        
    return Results.Ok(projects);
});

// POST a new project, assigned to the logged-in user.
app.MapPost("/api/projects", async (Project newProject, ProjectDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Results.Unauthorized();
    
    newProject.UserId = userId;
    db.Projects.Add(newProject);
    await db.SaveChangesAsync();
    return Results.Created($"/api/projects/{newProject.Id}", newProject);
}).RequireAuthorization();

// PUT to update a project, only if the user owns it.
app.MapPut("/api/projects/{id}", async (int id, Project updatedProject, ProjectDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var projectToUpdate = await db.Projects.FindAsync(id);

    if (projectToUpdate is null) return Results.NotFound();
    if (projectToUpdate.UserId != userId) return Results.Forbid();

    projectToUpdate.Title = updatedProject.Title;
    projectToUpdate.Description = updatedProject.Description;
    projectToUpdate.Technologies = updatedProject.Technologies;
    projectToUpdate.GitHubUrl = updatedProject.GitHubUrl;
    projectToUpdate.LiveUrl = updatedProject.LiveUrl;

    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// DELETE a project, only if the user owns it.
app.MapDelete("/api/projects/{id}", async (int id, ProjectDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var projectToDelete = await db.Projects.FindAsync(id);

    if (projectToDelete is null) return Results.NotFound();
    if (projectToDelete.UserId != userId) return Results.Forbid();

    db.Projects.Remove(projectToDelete);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();


// Run the app.
app.Run();


// --- My Data Models ---
public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Technologies { get; set; } = string.Empty; 
    public string GitHubUrl { get; set; } = string.Empty;
    public string LiveUrl { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public IdentityUser? User { get; set; }
}

public class ProjectDbContext : IdentityDbContext
{
    public ProjectDbContext(DbContextOptions<ProjectDbContext> options) : base(options) { }
    public DbSet<Project> Projects { get; set; }
}

public partial class Program { }
// end of project