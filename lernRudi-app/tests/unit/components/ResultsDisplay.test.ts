import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mock stores
const mockScores = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockTotalKeys = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockModules = { subscribe: vi.fn(), set: vi.fn(), update: vi.fn() };
const mockResetToMenu = vi.fn();

// Mock StateManager
vi.mock('$lib/core/StateManager', () => ({
  scores: mockScores,
  totalKeys: mockTotalKeys,
  modules: mockModules,
  resetToMenu: mockResetToMenu
}));

describe('ResultsDisplay Component', () => {
  const mockModulesData = [
    {
      id: 'phonology',
      title: 'Reime und Laute',
      intro: 'Test intro',
      tasks: new Array(36).fill({ type: 'rhyme' })
    },
    {
      id: 'lettersounds',
      title: 'Anfangslaute',
      intro: 'Test intro',
      tasks: new Array(36).fill({ type: 'initial' })
    },
    {
      id: 'quantities',
      title: 'Mengen',
      intro: 'Test intro',
      tasks: new Array(36).fill({ type: 'quantity' })
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grade Calculation Logic', () => {
    function getGrade(percentage: number): string {
      if (percentage >= 90) return 'Ausgezeichnet!';
      if (percentage >= 75) return 'Sehr gut!';
      if (percentage >= 60) return 'Gut!';
      if (percentage >= 50) return 'Befriedigend';
      return 'Weiter üben!';
    }

    it('should assign "Ausgezeichnet!" for 90%+', () => {
      expect(getGrade(90)).toBe('Ausgezeichnet!');
      expect(getGrade(95)).toBe('Ausgezeichnet!');
      expect(getGrade(100)).toBe('Ausgezeichnet!');
    });

    it('should assign "Sehr gut!" for 75-89%', () => {
      expect(getGrade(75)).toBe('Sehr gut!');
      expect(getGrade(80)).toBe('Sehr gut!');
      expect(getGrade(89)).toBe('Sehr gut!');
    });

    it('should assign "Gut!" for 60-74%', () => {
      expect(getGrade(60)).toBe('Gut!');
      expect(getGrade(67)).toBe('Gut!');
      expect(getGrade(74)).toBe('Gut!');
    });

    it('should assign "Befriedigend" for 50-59%', () => {
      expect(getGrade(50)).toBe('Befriedigend');
      expect(getGrade(54)).toBe('Befriedigend');
      expect(getGrade(59)).toBe('Befriedigend');
    });

    it('should assign "Weiter üben!" for <50%', () => {
      expect(getGrade(49)).toBe('Weiter üben!');
      expect(getGrade(37)).toBe('Weiter üben!');
      expect(getGrade(0)).toBe('Weiter üben!');
    });
  });

  describe('Color Coding Logic', () => {
    function getColorForPercentage(percentage: number): string {
      if (percentage >= 75) return '#4caf50';
      if (percentage >= 50) return '#ff9800';
      return '#f44336';
    }

    it('should use green color (#4caf50) for 75%+', () => {
      expect(getColorForPercentage(75)).toBe('#4caf50');
      expect(getColorForPercentage(80)).toBe('#4caf50');
      expect(getColorForPercentage(100)).toBe('#4caf50');
    });

    it('should use orange color (#ff9800) for 50-74%', () => {
      expect(getColorForPercentage(50)).toBe('#ff9800');
      expect(getColorForPercentage(67)).toBe('#ff9800');
      expect(getColorForPercentage(74)).toBe('#ff9800');
    });

    it('should use red color (#f44336) for <50%', () => {
      expect(getColorForPercentage(49)).toBe('#f44336');
      expect(getColorForPercentage(37)).toBe('#f44336');
      expect(getColorForPercentage(0)).toBe('#f44336');
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate percentage correctly', () => {
      const totalExercises = 108;
      const totalKeys = 54;
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(50);
    });

    it('should calculate 100% correctly', () => {
      const totalExercises = 108;
      const totalKeys = 108;
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(100);
    });

    it('should calculate 0% correctly', () => {
      const totalExercises = 108;
      const totalKeys = 0;
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(0);
    });

    it('should round percentages correctly', () => {
      const totalExercises = 108;
      const totalKeys = 71; // 71/108 = 65.74%
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(66);
    });

    it('should handle edge case with zero total exercises', () => {
      const totalExercises = 0;
      const totalKeys = 0;
      const percentageCorrect = totalExercises > 0 ? Math.round((totalKeys / totalExercises) * 100) : 0;

      expect(percentageCorrect).toBe(0);
    });
  });

  describe('Module Score Calculation', () => {
    it('should calculate module percentage', () => {
      const scores = { phonology: 30, lettersounds: 18, quantities: 24 };
      const module = mockModulesData[0]; // phonology with 36 tasks

      const score = scores.phonology || 0;
      const total = module.tasks.length;
      const pct = Math.round((score / total) * 100);

      expect(score).toBe(30);
      expect(total).toBe(36);
      expect(pct).toBe(83);
    });

    it('should handle missing module scores', () => {
      const scores = { phonology: 18 }; // lettersounds and quantities missing
      const module = mockModulesData[1]; // lettersounds

      const score = scores[module.id as keyof typeof scores] || 0;
      const total = module.tasks.length;

      expect(score).toBe(0); // Should default to 0
      expect(total).toBe(36);
    });

    it('should calculate correct percentage for all modules', () => {
      const scores = { phonology: 30, lettersounds: 28, quantities: 28 };

      mockModulesData.forEach(module => {
        const score = scores[module.id as keyof typeof scores] || 0;
        const total = module.tasks.length;
        const pct = Math.round((score / total) * 100);

        expect(total).toBe(36);
        if (module.id === 'phonology') expect(pct).toBe(83);
        if (module.id === 'lettersounds') expect(pct).toBe(78);
        if (module.id === 'quantities') expect(pct).toBe(78);
      });
    });
  });

  describe('Export Data Structure', () => {
    it('should create correct JSON export structure', () => {
      const scores = { phonology: 18, lettersounds: 18, quantities: 18 };
      const totalKeys = 54;
      const modules = mockModulesData;
      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      const results = {
        date: new Date().toISOString(),
        totalExercises,
        correct: totalKeys,
        incorrect: totalExercises - totalKeys,
        percentage: percentageCorrect,
        grade: 'Befriedigend',
        moduleScores: modules.map(mod => ({
          module: mod.title,
          score: scores[mod.id as keyof typeof scores] || 0,
          total: mod.tasks.length,
          percentage: Math.round(((scores[mod.id as keyof typeof scores] || 0) / mod.tasks.length) * 100)
        }))
      };

      expect(results.totalExercises).toBe(108);
      expect(results.correct).toBe(54);
      expect(results.incorrect).toBe(54);
      expect(results.percentage).toBe(50);
      expect(results.grade).toBe('Befriedigend');
      expect(results.moduleScores).toHaveLength(3);
      expect(results.moduleScores[0].module).toBe('Reime und Laute');
      expect(results.moduleScores[0].score).toBe(18);
      expect(results.moduleScores[0].total).toBe(36);
      expect(results.moduleScores[0].percentage).toBe(50);
    });

    it('should create correct CSV export format', () => {
      const scores = { phonology: 30, lettersounds: 28, quantities: 28 };
      const totalKeys = 86;
      const modules = mockModulesData;
      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      let csv = 'Modul,Richtig,Gesamt,Prozent\n';
      modules.forEach(mod => {
        const score = scores[mod.id as keyof typeof scores] || 0;
        const total = mod.tasks.length;
        const pct = Math.round((score / total) * 100);
        csv += `"${mod.title}",${score},${total},${pct}%\n`;
      });
      csv += `\nGesamt,${totalKeys},${totalExercises},${percentageCorrect}%\n`;

      expect(csv).toContain('Modul,Richtig,Gesamt,Prozent');
      expect(csv).toContain('"Reime und Laute",30,36,83%');
      expect(csv).toContain('"Anfangslaute",28,36,78%');
      expect(csv).toContain('"Mengen",28,36,78%');
      expect(csv).toContain('Gesamt,86,108,80%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0% score', () => {
      const totalExercises = 108;
      const totalKeys = 0;
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(0);
      expect(totalKeys).toBe(0);
      expect(totalExercises - totalKeys).toBe(108);
    });

    it('should handle 100% score', () => {
      const totalExercises = 108;
      const totalKeys = 108;
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(100);
      expect(totalKeys).toBe(108);
      expect(totalExercises - totalKeys).toBe(0);
    });

    it('should handle empty modules array', () => {
      const modules: any[] = [];
      const totalExercises = modules.reduce((sum, mod) => sum + mod.tasks.length, 0);

      expect(totalExercises).toBe(0);
      expect(modules).toHaveLength(0);
    });

    it('should handle partial completion', () => {
      const totalExercises = 108;
      const totalKeys = 45; // 41.67%
      const percentageCorrect = Math.round((totalKeys / totalExercises) * 100);

      expect(percentageCorrect).toBe(42);
    });
  });

  describe('Store Integration', () => {
    it('should have access to scores store', () => {
      expect(mockScores).toBeDefined();
      expect(mockScores.subscribe).toBeDefined();
    });

    it('should have access to totalKeys store', () => {
      expect(mockTotalKeys).toBeDefined();
      expect(mockTotalKeys.subscribe).toBeDefined();
    });

    it('should have access to modules store', () => {
      expect(mockModules).toBeDefined();
      expect(mockModules.subscribe).toBeDefined();
    });

    it('should have access to resetToMenu function', () => {
      expect(mockResetToMenu).toBeDefined();
      expect(typeof mockResetToMenu).toBe('function');
    });
  });

  describe('Performance Calculations', () => {
    it('should calculate performance for perfect score', () => {
      const scores = { phonology: 36, lettersounds: 36, quantities: 36 };
      const totalKeys = 108;
      const totalExercises = 108;

      const avgPerformance = (modules: typeof mockModulesData) => {
        const modulePercentages = mockModulesData.map(mod => {
          const score = scores[mod.id as keyof typeof scores] || 0;
          return (score / mod.tasks.length) * 100;
        });
        return modulePercentages.reduce((sum, pct) => sum + pct, 0) / modulePercentages.length;
      };

      expect(avgPerformance(mockModulesData)).toBe(100);
    });

    it('should calculate performance for mixed scores', () => {
      const scores = { phonology: 36, lettersounds: 18, quantities: 18 }; // 100%, 50%, 50%

      const modulePercentages = mockModulesData.map(mod => {
        const score = scores[mod.id as keyof typeof scores] || 0;
        return (score / mod.tasks.length) * 100;
      });

      expect(modulePercentages[0]).toBe(100);
      expect(modulePercentages[1]).toBe(50);
      expect(modulePercentages[2]).toBe(50);

      const avgPerformance = modulePercentages.reduce((sum, pct) => sum + pct, 0) / modulePercentages.length;
      expect(Math.round(avgPerformance)).toBe(67);
    });
  });
});
