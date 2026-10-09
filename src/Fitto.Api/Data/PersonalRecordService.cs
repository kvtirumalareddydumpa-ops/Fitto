using Microsoft.EntityFrameworkCore;

namespace Fitto.Api.Data;

public class PersonalRecordService(FittoDbContext db)
{
    public async Task<List<PersonalRecord>> CheckAndUpdateAsync(int userId, LoggedSet set, TrackingType type)
    {
        var candidates = new List<(RecordType Type, decimal Value)>();

        switch (type)
        {
            case TrackingType.WeightReps when set.WeightKg > 0 && set.Reps > 0:
                var w = set.WeightKg!.Value;
                var r = set.Reps!.Value;
                // Epley formula: estimated 1RM = weight * (1 + reps / 30)
                var oneRm = r == 1 ? w : Math.Round(w * (1 + r / 30m), 1);
                candidates.Add((RecordType.EstimatedOneRepMax, oneRm));
                candidates.Add((RecordType.MaxSetVolume, w * r));
                break;
            case TrackingType.BodyweightReps when set.Reps > 0:
                candidates.Add((RecordType.MaxReps, set.Reps!.Value));
                break;
            case TrackingType.TimeHold when set.DurationSeconds > 0:
                candidates.Add((RecordType.LongestDuration, set.DurationSeconds!.Value));
                break;
            case TrackingType.DistanceTime when set.DistanceMeters > 0:
                candidates.Add((RecordType.LongestDistance, set.DistanceMeters!.Value));
                break;
        }

        var newRecords = new List<PersonalRecord>();
        foreach (var (recordType, value) in candidates)
        {
            var existing = await db.PersonalRecords.SingleOrDefaultAsync(p =>
                p.UserId == userId && p.ExerciseId == set.ExerciseId && p.RecordType == recordType);

            if (existing is null)
            {
                existing = new PersonalRecord { UserId = userId, ExerciseId = set.ExerciseId, RecordType = recordType };
                db.PersonalRecords.Add(existing);
            }
            else if (value <= existing.Value)
            {
                continue; // not a new record
            }

            existing.Value = value;
            existing.AchievedOn = DateTime.UtcNow;
            newRecords.Add(existing);
        }
        return newRecords; // caller calls SaveChangesAsync
    }
}