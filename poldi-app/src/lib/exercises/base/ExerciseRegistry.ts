/**
 * ExerciseRegistry - Plugin registration and factory system
 *
 * Manages registration of exercise plugins and creates instances
 */

import type {
  ExerciseType,
  ExerciseConfig,
  IExercisePlugin,
  ExercisePluginConstructor
} from './types';

export class ExerciseRegistry {
  private static plugins = new Map<ExerciseType, ExercisePluginConstructor>();

  /**
   * Register an exercise plugin
   * @param type Exercise type identifier
   * @param pluginClass Plugin constructor
   */
  static register(type: ExerciseType, pluginClass: ExercisePluginConstructor): void {
    if (this.plugins.has(type)) {
      console.warn(`Exercise type "${type}" is already registered. Overwriting.`);
    }
    this.plugins.set(type, pluginClass);
  }

  /**
   * Create an exercise instance from configuration
   * @param config Exercise configuration
   * @returns Exercise plugin instance
   * @throws Error if exercise type is not registered
   */
  static create(config: ExerciseConfig): IExercisePlugin {
    const PluginClass = this.plugins.get(config.type);

    if (!PluginClass) {
      throw new Error(
        `Exercise type "${config.type}" is not registered. ` +
        `Available types: ${Array.from(this.plugins.keys()).join(', ')}`
      );
    }

    const instance = new PluginClass(config);
    instance.initialize(config);
    return instance;
  }

  /**
   * Check if an exercise type is registered
   * @param type Exercise type
   * @returns True if registered
   */
  static supports(type: ExerciseType): boolean {
    return this.plugins.has(type);
  }

  /**
   * Get all registered exercise types
   * @returns Array of exercise types
   */
  static getAll(): ExerciseType[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get the number of registered plugins
   */
  static count(): number {
    return this.plugins.size;
  }

  /**
   * Clear all registrations (useful for testing)
   */
  static clear(): void {
    this.plugins.clear();
  }

  /**
   * Get plugin class for a type (for advanced use cases)
   */
  static getPluginClass(type: ExerciseType): ExercisePluginConstructor | undefined {
    return this.plugins.get(type);
  }
}
