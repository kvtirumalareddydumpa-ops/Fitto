using Microsoft.EntityFrameworkCore;

namespace Fitto.Api.Data;

public class FittoDbContext(DbContextOptions<FittoDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<BodyMeasurement> BodyMeasurements => Set<BodyMeasurement>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<PersonalRecord> PersonalRecords => Set<PersonalRecord>();
    public DbSet<TrainingProgram> TrainingPrograms => Set<TrainingProgram>();
    public DbSet<WorkoutDay> WorkoutDays => Set<WorkoutDay>();
    public DbSet<PlannedExercise> PlannedExercises => Set<PlannedExercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<LoggedSet> LoggedSets => Set<LoggedSet>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // store enums as readable text in the database
        b.Entity<Exercise>().Property(e => e.TrackingType).HasConversion<string>();
        b.Entity<PersonalRecord>().Property(p => p.RecordType).HasConversion<string>();

        b.Entity<Exercise>().HasIndex(e => e.Name).IsUnique();
        b.Entity<PersonalRecord>()
            .HasIndex(p => new { p.UserId, p.ExerciseId, p.RecordType }).IsUnique();

        // foreign keys (no navigation properties needed)
        b.Entity<PersonalRecord>().HasOne<User>().WithMany().HasForeignKey(p => p.UserId);
        b.Entity<TrainingProgram>().HasOne<User>().WithMany().HasForeignKey(p => p.UserId);
        b.Entity<WorkoutSession>().HasOne<User>().WithMany().HasForeignKey(s => s.UserId);
        b.Entity<WorkoutSession>().HasOne<WorkoutDay>().WithMany().HasForeignKey(s => s.WorkoutDayId);

        // don't allow deleting an exercise that has history
        b.Entity<PersonalRecord>().HasOne<Exercise>().WithMany()
            .HasForeignKey(p => p.ExerciseId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<PlannedExercise>().HasOne<Exercise>().WithMany()
            .HasForeignKey(p => p.ExerciseId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<LoggedSet>().HasOne<Exercise>().WithMany()
            .HasForeignKey(s => s.ExerciseId).OnDelete(DeleteBehavior.Restrict);
    }
}