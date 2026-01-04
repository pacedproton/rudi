/**
 * Exercise Loader - Server-side service to load exercises from YAML files
 * 
 * Loads exercise modules from YAML files with i18n support.
 * Can be used server-side in SvelteKit API routes.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import yaml from 'js-yaml';
import type { Module } from '$lib/core/StateManager';

// ===== TYPES =====

interface YamlModule {
  id: string;
  title: Record<string, string> | string;
  intro: Record<string, string> | string;
  category?: string;
  icon?: string;
  tasks: YamlTask[];
}

interface YamlTask {
  type: string;
  [key: string]: unknown;
}

interface ExerciseLoaderOptions {
  language?: string;
  contentDir?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Extract localized string from i18n object or plain string
 */
function getLocalizedString(
  value: Record<string, string> | string | undefined,
  language: string
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value['de'] || value['en'] || Object.values(value)[0] || '';
}

/**
 * Recursively localize task properties
 */
function localizeTask(task: YamlTask, language: string): Record<string, unknown> {
  const localized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(task)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's an i18n object (has language codes as keys)
      const valueObj = value as Record<string, unknown>;
      if (valueObj['de'] || valueObj['en']) {
        localized[key] = getLocalizedString(valueObj as Record<string, string>, language);
      } else {
        // Recursively localize nested objects
        localized[key] = localizeTask(valueObj as YamlTask, language);
      }
    } else {
      localized[key] = value;
    }
  }

  return localized;
}

// ===== EXERCISE LOADER =====

export class ExerciseLoader {
  private contentDir: string;
  private language: string;
  private cache: Map<string, Module[]> = new Map();

  constructor(options: ExerciseLoaderOptions = {}) {
    this.language = options.language || 'de';
    // Default to the content directory in the source tree
    this.contentDir = options.contentDir ||
      join(process.cwd(), 'src/lib/exercises/content');
  }

  /**
   * Set the current language
   */
  setLanguage(language: string): void {
    if (this.language !== language) {
      this.language = language;
      this.cache.clear(); // Clear cache when language changes
    }
  }

  /**
   * Get the current language
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Load a single module by ID
   */
  loadModule(moduleId: string): Module | null {
    const langDir = join(this.contentDir, this.language);
    const filePath = join(langDir, `${moduleId}.yaml`);

    if (!existsSync(filePath)) {
      // Try fallback to 'de' directory
      const fallbackPath = join(this.contentDir, 'de', `${moduleId}.yaml`);
      if (existsSync(fallbackPath)) {
        return this.parseModuleFile(fallbackPath);
      }
      console.error(`Module not found: ${moduleId}`);
      return null;
    }

    return this.parseModuleFile(filePath);
  }

  /**
   * Load all modules from the content directory
   */
  loadAllModules(): Module[] {
    const cacheKey = this.language;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try language-specific directory first, fall back to 'de'
    let langDir = join(this.contentDir, this.language);
    if (!existsSync(langDir)) {
      langDir = join(this.contentDir, 'de');
    }

    if (!existsSync(langDir)) {
      console.error(`Content directory not found: ${langDir}`);
      return [];
    }

    const files = readdirSync(langDir).filter(f => f.endsWith('.yaml'));
    const modules: Module[] = [];

    // Define preferred order for modules
    const moduleOrder = [
      'phonology',
      'lettersounds',
      'quantities',
      'counting',
      'memory',
      'visual',
      'motor',
      'spatial',
      'drawing',
      'storytelling',
      'syllables'
    ];

    // Sort files by module order
    files.sort((a, b) => {
      const idA = basename(a, '.yaml');
      const idB = basename(b, '.yaml');
      const indexA = moduleOrder.indexOf(idA);
      const indexB = moduleOrder.indexOf(idB);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    for (const file of files) {
      const filePath = join(langDir, file);
      const module = this.parseModuleFile(filePath);
      if (module) {
        modules.push(module);
      }
    }

    this.cache.set(cacheKey, modules);
    return modules;
  }

  /**
   * Parse a single YAML module file
   */
  private parseModuleFile(filePath: string): Module | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const yamlData = yaml.load(content) as YamlModule;

      if (!yamlData || !yamlData.id) {
        console.error(`Invalid module file: ${filePath}`);
        return null;
      }

      // Localize module properties
      const module: Module = {
        id: yamlData.id,
        title: getLocalizedString(yamlData.title, this.language),
        intro: getLocalizedString(yamlData.intro, this.language),
        category: yamlData.category as Module['category'],
        icon: yamlData.icon,
        tasks: yamlData.tasks.map(task => localizeTask(task, this.language)) as Module['tasks']
      };

      return module;
    } catch (error) {
      console.error(`Failed to parse module file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Clear the module cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get available languages based on content directories
   */
  getAvailableLanguages(): string[] {
    if (!existsSync(this.contentDir)) {
      return ['de'];
    }

    return readdirSync(this.contentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  }
}

// ===== SINGLETON INSTANCE =====

let loaderInstance: ExerciseLoader | null = null;

export function getExerciseLoader(options?: ExerciseLoaderOptions): ExerciseLoader {
  if (!loaderInstance) {
    loaderInstance = new ExerciseLoader(options);
  } else if (options?.language) {
    loaderInstance.setLanguage(options.language);
  }
  return loaderInstance;
}

export function resetExerciseLoader(): void {
  loaderInstance = null;
}

// ===== DEMO AND TEST MODULES =====

/**
 * Create a demo module with 3 exercises
 */
export function createDemoModule(language: string = 'de'): Module {
  const loader = getExerciseLoader({ language });
  const phonology = loader.loadModule('phonology');
  const memory = loader.loadModule('memory');
  const motor = loader.loadModule('motor');

  return {
    id: 'demo',
    title: language === 'de' ? 'Lern-Rudi Demo' : 'Learn-Rudi Demo',
    intro: language === 'de'
      ? 'Willkommen! Lass uns ein paar Übungen machen.'
      : 'Welcome! Let\'s do some exercises.',
    tasks: [
      phonology?.tasks[0], // rhyme
      memory?.tasks[0],    // memory
      motor?.tasks[0]      // trace
    ].filter(Boolean) as Module['tasks']
  };
}

/**
 * Create a short test module (8 exercises - one from each category)
 */
export function createShortTestModule(language: string = 'de'): Module {
  const loader = getExerciseLoader({ language });
  const modules = loader.loadAllModules();

  // Take first exercise from up to 8 modules
  const tasks = modules
    .slice(0, 8)
    .map(m => m.tasks[0])
    .filter(Boolean);

  return {
    id: 'short_test',
    title: language === 'de' ? 'Kurzer Test' : 'Short Test',
    intro: language === 'de'
      ? 'Ein kurzer Test mit 8 Aufgaben.'
      : 'A short test with 8 tasks.',
    tasks: tasks as Module['tasks']
  };
}
