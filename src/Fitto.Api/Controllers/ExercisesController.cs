using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fitto.Api.Data;

namespace Fitto.Api.Controllers;


[ApiController]
[Route("[controller]")]
public class ExercisesController : ControllerBase
{
    private readonly FittoDbContext _db;
    public ExercisesController(FittoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var exercises = await _db.Exercises.OrderBy(e => e.Name).ToListAsync();
        return Ok(exercises);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var exercise = await _db.Exercises.FindAsync(id);
        if (exercise is null)
        {
            return NotFound($"No Exercise found for this {id}");            
        }
        return Ok(exercise);
    }


    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Exercise exercise)
    {
        var exists = await _db.Exercises.AnyAsync(e => e.Name == exercise.Name);
        if(exists)
        {
            return BadRequest("An Exercise already exists with this name");
        }

        _db.Exercises.Add(exercise);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new {id = exercise.Id}, exercise);
    }

    [HttpPut("{id:int}")]    
    public async Task<IActionResult> Update(int id, [FromBody] Exercise updatedExercise)
    {
        var exercise = await _db.Exercises.FindAsync(id);
        if (exercise is null)
        {
            return NotFound($"No exercise found with ID {id}"); // 404 Error
        }

        if (exercise.Name != updatedExercise.Name)
        {
            var nameExists = await _db.Exercises.AnyAsync(e => e.Name == updatedExercise.Name);
            if (nameExists)
            {
                return BadRequest("Another exercise with this name already exists."); // 400 Error
            }
        }

        exercise.Name = updatedExercise.Name;
        exercise.TrackingType = updatedExercise.TrackingType;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exercise = await _db.Exercises.FindAsync(id);
        if (exercise is null) 
        {
            return NotFound($"There is no record with this id {id}");
        }

        try
        {
            _db.Exercises.Remove(exercise);
            await _db.SaveChangesAsync();
            return NoContent();
        } catch (DbUpdateException)
        {
            return BadRequest("Cannot delete this exercise because it is linked to historical workout records.");
        }        
    }
}