namespace Fitto.Api.Data;

public enum TrackingType { WeightReps, BodyweightReps, DistanceTime, TimeHold }
public enum RecordType { EstimatedOneRepMax, MaxSetVolume, MaxReps, LongestDuration, LongestDistance }

// ---------- User profiling ----------
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public List<BodyMeasurement> Measurements { get; set; } = [];
}

public class BodyMeasurement // one row per check-in = history over time
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly MeasuredOn { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? BodyFatPercent { get; set; }
    public decimal? HeightCm { get; set; }
}

// ---------- Exercises & records ----------
public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public TrackingType TrackingType { get; set; }
}

public class PersonalRecord // one row per user + exercise + record type
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ExerciseId { get; set; }
    public RecordType RecordType { get; set; }
    public decimal Value { get; set; }
    public DateTime AchievedOn { get; set; }
}

// ---------- Plan (template) ----------
public class TrainingProgram // e.g. "Hypertrophy Phase 1", 8 weeks
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public int DurationWeeks { get; set; }
    public List<WorkoutDay> Days { get; set; } = [];
}

public class WorkoutDay // one day in the repeating cycle, e.g. Day 1 "Push"
{
    public int Id { get; set; }
    public int TrainingProgramId { get; set; }
    public int DayNumber { get; set; }
    public string Name { get; set; } = "";
    public List<PlannedExercise> Exercises { get; set; } = [];
}

public class PlannedExercise // targets can be ranges or relative to 1RM / RPE
{
    public int Id { get; set; }
    public int WorkoutDayId { get; set; }
    public int ExerciseId { get; set; }
    public int Order { get; set; }
    public int Sets { get; set; }
    public int? RepsMin { get; set; }               // 8
    public int? RepsMax { get; set; }               // 10
    public decimal? PercentOfOneRepMax { get; set; } // 75
    public decimal? TargetRpe { get; set; }          // 8
    public int? TargetDurationSeconds { get; set; }
    public decimal? TargetDistanceMeters { get; set; }
}

// ---------- Actual event (log) ----------
public class WorkoutSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? WorkoutDayId { get; set; } // null = freestyle workout
    public DateTime StartedAt { get; set; }
    public List<LoggedSet> Sets { get; set; } = [];
}

public class LoggedSet // only the fields that fit the exercise type are filled
{
    public int Id { get; set; }
    public int WorkoutSessionId { get; set; }
    public int ExerciseId { get; set; }
    public int SetNumber { get; set; }
    public decimal? WeightKg { get; set; }
    public int? Reps { get; set; }
    public int? DurationSeconds { get; set; }
    public decimal? DistanceMeters { get; set; }
    public decimal? Rpe { get; set; }
}