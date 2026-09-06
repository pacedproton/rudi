import { describe, it, expect } from 'vitest';
import { poldiModules, demoModule, shortTestModule, getShuffledModules } from '$lib/data/modules';

describe('Poldi Modules', () => {
  describe('Module Structure', () => {
    it('should have 9 modules', () => {
      expect(poldiModules).toHaveLength(9);
    });

    it('should have correct module IDs', () => {
      const expectedIds = [
        'phonology',
        'lettersounds',
        'quantities',
        'counting',
        'memory',
        'visual',
        'motor',
        'spatial',
        'drawing'
      ];

      poldiModules.forEach((module, index) => {
        expect(module.id).toBe(expectedIds[index]);
      });
    });

    it('should have titles for all modules', () => {
      poldiModules.forEach((module) => {
        expect(module.title).toBeDefined();
        expect(module.title.length).toBeGreaterThan(0);
      });
    });

    it('should have intro text for all modules', () => {
      poldiModules.forEach((module) => {
        expect(module.intro).toBeDefined();
        expect(module.intro.length).toBeGreaterThan(0);
      });
    });

    it('should have 36 tasks per module', () => {
      poldiModules.forEach((module) => {
        expect(module.tasks).toHaveLength(36);
      });
    });

    it('should have 324 total exercises', () => {
      const totalExercises = poldiModules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      expect(totalExercises).toBe(324);
    });
  });

  describe('Exercise Types', () => {
    it('should have valid exercise types in phonology module', () => {
      const phonologyModule = poldiModules[0];
      const types = new Set(phonologyModule.tasks.map(t => t.type));

      expect(types.has('rhyme')).toBe(true);
      expect(types.has('syllables')).toBe(true);
    });

    it('should have valid exercise types in letter sounds module', () => {
      const letterSoundsModule = poldiModules[1];
      const types = new Set(letterSoundsModule.tasks.map(t => t.type));

      expect(types.has('initial')).toBe(true);
    });

    it('should have valid exercise types in quantities module', () => {
      const quantitiesModule = poldiModules[2];
      const types = new Set(quantitiesModule.tasks.map(t => t.type));

      expect(types.has('quantity')).toBe(true);
      expect(types.has('dice')).toBe(true);
    });

    it('should have valid exercise types in counting module', () => {
      const countingModule = poldiModules[3];
      const types = new Set(countingModule.tasks.map(t => t.type));

      expect(types.has('counting')).toBe(true);
      expect(types.has('missing')).toBe(true);
    });

    it('should have valid exercise types in memory module', () => {
      const memoryModule = poldiModules[4];
      const types = new Set(memoryModule.tasks.map(t => t.type));

      expect(types.has('memory')).toBe(true);
    });

    it('should have valid exercise types in visual module', () => {
      const visualModule = poldiModules[5];
      const types = new Set(visualModule.tasks.map(t => t.type));

      expect(types.has('discrimination')).toBe(true);
      expect(types.has('pattern')).toBe(true);
    });

    it('should have valid exercise types in motor module', () => {
      const motorModule = poldiModules[6];
      const types = new Set(motorModule.tasks.map(t => t.type));

      expect(types.has('trace')).toBe(true);
      expect(types.has('trace_path')).toBe(true);
    });

    it('should have valid exercise types in spatial module', () => {
      const spatialModule = poldiModules[7];
      const types = new Set(spatialModule.tasks.map(t => t.type));

      expect(types.has('preposition')).toBe(true);
    });

    it('should have valid exercise types in drawing module', () => {
      const drawingModule = poldiModules[8];
      const types = new Set(drawingModule.tasks.map(t => t.type));

      expect(types.has('drawing')).toBe(true);
      expect(types.has('handwriting')).toBe(true);
      expect(types.has('connect_dots')).toBe(true);
    });
  });

  describe('Demo Module', () => {
    it('should have demo module with 3 tasks', () => {
      expect(demoModule.tasks).toHaveLength(3);
    });

    it('should have correct id and title', () => {
      expect(demoModule.id).toBe('demo');
      expect(demoModule.title).toBe('Poldi Demo');
    });

    it('should have diverse exercise types', () => {
      const types = demoModule.tasks.map(t => t.type);
      expect(new Set(types).size).toBe(3); // All different types
    });
  });

  describe('Short Test Module', () => {
    it('should have short test module with 8 tasks', () => {
      expect(shortTestModule.tasks).toHaveLength(8);
    });

    it('should have correct id and title', () => {
      expect(shortTestModule.id).toBe('short_test');
      expect(shortTestModule.title).toBe('Kurzer Test');
    });

    it('should cover all major exercise categories', () => {
      const types = new Set(shortTestModule.tasks.map(t => t.type));
      expect(types.size).toBe(8); // One from each major category
    });
  });

  describe('Shuffle Functionality', () => {
    it('should return shuffled modules', () => {
      const shuffled = getShuffledModules();

      expect(shuffled).toHaveLength(9);
      expect(shuffled[0].tasks).toHaveLength(36);
    });

    it('should not modify original modules', () => {
      const originalFirst = poldiModules[0].tasks[0];
      getShuffledModules();

      expect(poldiModules[0].tasks[0]).toEqual(originalFirst);
    });

    it('should preserve all tasks in each module', () => {
      const shuffled = getShuffledModules();

      shuffled.forEach((module, index) => {
        expect(module.tasks).toHaveLength(poldiModules[index].tasks.length);
      });
    });

    it('should shuffle tasks differently on multiple calls', () => {
      const shuffle1 = getShuffledModules();
      const shuffle2 = getShuffledModules();

      // At least one module should have different order
      let foundDifference = false;
      for (let i = 0; i < 9; i++) {
        const tasks1 = shuffle1[i].tasks.map(t => t.type).join(',');
        const tasks2 = shuffle2[i].tasks.map(t => t.type).join(',');
        if (tasks1 !== tasks2) {
          foundDifference = true;
          break;
        }
      }

      // This could theoretically fail, but probability is extremely low
      expect(foundDifference).toBe(true);
    });
  });

  describe('Exercise Configuration Validation', () => {
    it('should have valid rhyme exercise configurations', () => {
      const phonologyModule = poldiModules[0];
      const rhymeExercises = phonologyModule.tasks.filter(t => t.type === 'rhyme');

      rhymeExercises.forEach(exercise => {
        expect(exercise.word).toBeDefined();
        expect(exercise.target).toBeDefined();
        expect(exercise.distractors).toBeDefined();
        expect(Array.isArray(exercise.distractors)).toBe(true);
      });
    });

    it('should have valid syllable exercise configurations', () => {
      const phonologyModule = poldiModules[0];
      const syllableExercises = phonologyModule.tasks.filter(t => t.type === 'syllables');

      syllableExercises.forEach(exercise => {
        expect(exercise.word).toBeDefined();
        expect(exercise.icon).toBeDefined();
        expect(exercise.count).toBeDefined();
        expect(exercise.count).toBeGreaterThan(0);
        expect(exercise.count).toBeLessThanOrEqual(5);
      });
    });

    it('should have valid memory exercise configurations', () => {
      const memoryModule = poldiModules[4];

      memoryModule.tasks.forEach(exercise => {
        expect(exercise.seq).toBeDefined();
        expect(Array.isArray(exercise.seq)).toBe(true);
        expect(exercise.seq.length).toBeGreaterThan(0);
        expect(exercise.seq.length).toBeLessThanOrEqual(5);
      });
    });

    it('should have valid quantity exercise configurations', () => {
      const quantitiesModule = poldiModules[2];
      const quantityExercises = quantitiesModule.tasks.filter(t => t.type === 'quantity');

      quantityExercises.forEach(exercise => {
        expect(exercise.l).toBeDefined();
        expect(exercise.r).toBeDefined();
        expect(exercise.l).toBeGreaterThanOrEqual(1);
        expect(exercise.r).toBeGreaterThanOrEqual(1);
        expect(exercise.l).toBeLessThanOrEqual(6);
        expect(exercise.r).toBeLessThanOrEqual(6);
      });
    });

    it('should have progressive difficulty in memory exercises', () => {
      const memoryModule = poldiModules[4];

      // First exercises should be shorter sequences
      expect(memoryModule.tasks[0].seq.length).toBe(2);
      expect(memoryModule.tasks[1].seq.length).toBe(2);

      // Later exercises should be longer sequences
      const lastTask = memoryModule.tasks[memoryModule.tasks.length - 1];
      expect(lastTask.seq.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Data Integrity', () => {
    it('should not have duplicate module IDs', () => {
      const ids = poldiModules.map(m => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have consistent data structure across all modules', () => {
      poldiModules.forEach(module => {
        expect(module).toHaveProperty('id');
        expect(module).toHaveProperty('title');
        expect(module).toHaveProperty('intro');
        expect(module).toHaveProperty('tasks');
        expect(Array.isArray(module.tasks)).toBe(true);
      });
    });

    it('should have all tasks with type property', () => {
      poldiModules.forEach(module => {
        module.tasks.forEach(task => {
          expect(task.type).toBeDefined();
          expect(typeof task.type).toBe('string');
        });
      });
    });
  });
});
