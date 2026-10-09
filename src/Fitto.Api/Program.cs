using System.Text.Json.Serialization;
using Fitto.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<FittoDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Fitto")));
builder.Services.AddScoped<PersonalRecordService>();
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var app = builder.Build();

if (app.Environment.IsDevelopment()) app.MapOpenApi();

// seed a demo user and some exercises on first run
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FittoDbContext>();
    if (!db.Exercises.Any())
    {
        db.Users.Add(new User { Name = "Demo", Email = "demo@fitto.app" });
        db.Exercises.AddRange(
            new Exercise { Name = "Bench Press", TrackingType = TrackingType.WeightReps },
            new Exercise { Name = "Running", TrackingType = TrackingType.DistanceTime },
            new Exercise { Name = "Pull-up", TrackingType = TrackingType.BodyweightReps },
            new Exercise { Name = "Plank", TrackingType = TrackingType.TimeHold });
        db.SaveChanges();
    }
}

app.MapGet("/exercises", (FittoDbContext db) => db.Exercises.ToListAsync());

// start a workout
app.MapPost("/users/{userId:int}/sessions", async (int userId, FittoDbContext db) =>
{
    var session = new WorkoutSession { UserId = userId, StartedAt = DateTime.UtcNow };
    db.WorkoutSessions.Add(session);
    await db.SaveChangesAsync();
    return Results.Ok(new { session.Id });
});

// log a set and check for new PRs
app.MapPost("/sessions/{sessionId:int}/sets",
    async (int sessionId, LoggedSet set, FittoDbContext db, PersonalRecordService prs) =>
{
    var session = await db.WorkoutSessions.FindAsync(sessionId);
    if (session is null) return Results.NotFound("Session not found");

    var exercise = await db.Exercises.FindAsync(set.ExerciseId);
    if (exercise is null) return Results.BadRequest("Unknown exercise");

    set.WorkoutSessionId = sessionId;
    db.LoggedSets.Add(set);
    var newPrs = await prs.CheckAndUpdateAsync(session.UserId, set, exercise.TrackingType);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        set.Id,
        NewPersonalRecords = newPrs.Select(p => new { p.RecordType, p.Value })
    });
});

app.MapGet("/users/{userId:int}/records", (int userId, FittoDbContext db) =>
    db.PersonalRecords.Where(p => p.UserId == userId).ToListAsync());

app.Run();