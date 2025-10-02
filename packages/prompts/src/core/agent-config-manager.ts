import type { AgentCapabilities, AgentConfig } from "./agent";
import type { RetryConfig } from "./agent-error-handling";
import type { AIModel } from "./models";

/**
 * Configuration source types
 */
export enum ConfigSource {
  FILE = "file",
  ENVIRONMENT = "environment",
  DATABASE = "database",
  REMOTE = "remote",
  DEFAULT = "default",
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  type: "created" | "updated" | "deleted";
  agentKey: string;
  oldConfig?: AgentConfig;
  newConfig?: AgentConfig;
  source: ConfigSource;
  timestamp: Date;
  user?: string;
}

/**
 * Configuration template for agent types
 */
export interface AgentConfigTemplate {
  name: string;
  description: string;
  baseConfig: Partial<AgentConfig>;
  requiredFields: string[];
  optionalFields: string[];
  capabilities?: AgentCapabilities;
  validation?: ConfigValidationRule[];
}

/**
 * Configuration validation rule
 */
export interface ConfigValidationRule {
  field: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  allowedValues?: unknown[];
  customValidator?: (value: unknown) => string | null;
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  name: string;
  description?: string;
  configs: Record<string, AgentConfig>;
  metadata: {
    created: Date;
    modified: Date;
    version: string;
    active: boolean;
  };
}

/**
 * Configuration backup
 */
export interface ConfigBackup {
  id: string;
  environment: string;
  configs: Record<string, AgentConfig>;
  timestamp: Date;
  description?: string;
  createdBy?: string;
}

/**
 * Configuration change listener
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void;

/**
 * Configuration loader interface
 */
export interface ConfigLoader {
  name: string;
  priority: number;
  canLoad(source: string): boolean;
  load(source: string): Promise<Record<string, AgentConfig>>;
}

/**
 * Agent configuration manager
 */
export class AgentConfigManager {
  private configs = new Map<string, AgentConfig>();
  private templates = new Map<string, AgentConfigTemplate>();
  private environments = new Map<string, EnvironmentConfig>();
  private backups: ConfigBackup[] = [];
  private changeHistory: ConfigChangeEvent[] = [];
  private listeners: ConfigChangeListener[] = [];
  private loaders: ConfigLoader[] = [];
  private currentEnvironment = "development";
  private autoSave = true;
  private configPath = "./config";

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default configuration templates
   */
  private initializeDefaultTemplates(): void {
    // Router agent template
    this.registerTemplate({
      name: "router",
      description: "Router agent for request routing",
      baseConfig: {
        model: "gpt-5" as AIModel,
        temperature: 0.3,
        maxTokens: 1000,
        timeout: 10000,
        enabled: true,
      },
      requiredFields: ["key", "name", "model"],
      optionalFields: ["temperature", "maxTokens", "timeout", "labels"],
      capabilities: {
        canRoute: true,
        supportedLanguages: ["ru", "en"],
      },
      validation: [
        { field: "temperature", type: "number", min: 0, max: 1 },
        { field: "maxTokens", type: "number", min: 1, max: 10000 },
      ],
    });

    // Event processor template
    this.registerTemplate({
      name: "event-processor",
      description: "Event processing agent",
      baseConfig: {
        model: "gpt-5-nano" as AIModel,
        temperature: 0.7,
        maxTokens: 2000,
        timeout: 15000,
        enabled: true,
      },
      requiredFields: ["key", "name", "model"],
      optionalFields: [
        "temperature",
        "maxTokens",
        "timeout",
        "retryAttempts",
        "labels",
      ],
      capabilities: {
        canProcessEvents: true,
        supportedEventTypes: [
          "purchase",
          "maintenance",
          "health",
          "work",
          "personal",
        ],
        supportedLanguages: ["ru"],
      },
      validation: [
        { field: "temperature", type: "number", min: 0, max: 1 },
        { field: "timeout", type: "number", min: 1000, max: 60000 },
      ],
    });

    // Event analyzer template
    this.registerTemplate({
      name: "event-analyzer",
      description: "Event analysis agent",
      baseConfig: {
        model: "gpt-5-nano" as AIModel,
        temperature: 0.4,
        maxTokens: 3000,
        timeout: 20000,
        enabled: true,
      },
      requiredFields: ["key", "name", "model"],
      optionalFields: ["temperature", "maxTokens", "timeout", "labels"],
      capabilities: {
        canAnalyzeData: true,
        supportedEventTypes: ["расходы", "задачи", "ремонт", "встречи"],
        supportedLanguages: ["ru"],
      },
    });

    // General assistant template
    this.registerTemplate({
      name: "general-assistant",
      description: "General purpose assistant agent",
      baseConfig: {
        model: "gpt-5" as AIModel,
        temperature: 0.7,
        maxTokens: 2000,
        timeout: 15000,
        enabled: true,
      },
      requiredFields: ["key", "name", "model"],
      optionalFields: ["temperature", "maxTokens", "timeout", "labels"],
      capabilities: {
        canProvideHelp: true,
        canProcessEvents: true,
        supportedLanguages: ["ru"],
      },
    });
  }

  /**
   * Get configuration for an agent
   */
  getConfig(agentKey: string): AgentConfig | null {
    return this.configs.get(agentKey) || null;
  }

  /**
   * Set configuration for an agent
   */
  async setConfig(
    agentKey: string,
    config: AgentConfig,
    source: ConfigSource = ConfigSource.DEFAULT,
  ): Promise<boolean> {
    // Validate configuration
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(", ")}`);
    }

    const oldConfig = this.configs.get(agentKey);
    this.configs.set(agentKey, config);

    // Create change event
    const event: ConfigChangeEvent = {
      type: oldConfig ? "updated" : "created",
      agentKey,
      oldConfig,
      newConfig: config,
      source,
      timestamp: new Date(),
    };

    this.changeHistory.push(event);
    this.notifyListeners(event);

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveEnvironment(this.currentEnvironment);
    }

    return true;
  }

  /**
   * Remove configuration for an agent
   */
  async removeConfig(
    agentKey: string,
    source: ConfigSource = ConfigSource.DEFAULT,
  ): Promise<boolean> {
    const oldConfig = this.configs.get(agentKey);
    if (!oldConfig) {
      return false;
    }

    this.configs.delete(agentKey);

    // Create change event
    const event: ConfigChangeEvent = {
      type: "deleted",
      agentKey,
      oldConfig,
      source,
      timestamp: new Date(),
    };

    this.changeHistory.push(event);
    this.notifyListeners(event);

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveEnvironment(this.currentEnvironment);
    }

    return true;
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): Record<string, AgentConfig> {
    return Object.fromEntries(this.configs);
  }

  /**
   * Load configurations from source
   */
  async loadConfigs(source: string): Promise<void> {
    const loader = this.findLoader(source);
    if (!loader) {
      throw new Error(`No loader found for source: ${source}`);
    }

    const configs = await loader.load(source);

    // Validate all loaded configs
    for (const [key, config] of Object.entries(configs)) {
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        console.warn(`Invalid config for agent ${key}:`, validation.errors);
        continue;
      }

      this.configs.set(key, config);
    }
  }

  /**
   * Save current configurations
   */
  async saveConfigs(destination: string): Promise<void> {
    const configs = this.getAllConfigs();
    // Implementation would depend on the destination type
    console.log(
      `Saving ${Object.keys(configs).length} configs to ${destination}`,
    );
  }

  /**
   * Register a configuration template
   */
  registerTemplate(template: AgentConfigTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get configuration template
   */
  getTemplate(name: string): AgentConfigTemplate | null {
    return this.templates.get(name) || null;
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Record<string, AgentConfigTemplate> {
    return Object.fromEntries(this.templates);
  }

  /**
   * Create configuration from template
   */
  createFromTemplate(
    templateName: string,
    agentKey: string,
    overrides: Partial<AgentConfig> = {},
  ): AgentConfig {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const config: AgentConfig = {
      key: agentKey,
      name: agentKey,
      model: "gpt-5-nano" as AIModel, // Default model
      ...template.baseConfig,
      ...overrides,
    };

    // Validate the created configuration
    const validation = this.validateConfigWithTemplate(config, template);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(", ")}`);
    }

    return config;
  }

  /**
   * Validate configuration
   */
  validateConfig(config: AgentConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!config.key || typeof config.key !== "string") {
      errors.push("Configuration key is required and must be a string");
    }

    if (!config.name || typeof config.name !== "string") {
      errors.push("Configuration name is required and must be a string");
    }

    if (!config.model || typeof config.model !== "string") {
      errors.push("Model is required and must be a string");
    }

    if (config.temperature !== undefined) {
      if (
        typeof config.temperature !== "number" ||
        config.temperature < 0 ||
        config.temperature > 1
      ) {
        errors.push("Temperature must be a number between 0 and 1");
      }
    }

    if (config.maxTokens !== undefined) {
      if (typeof config.maxTokens !== "number" || config.maxTokens < 1) {
        errors.push("Max tokens must be a positive number");
      }
    }

    if (config.timeout !== undefined) {
      if (typeof config.timeout !== "number" || config.timeout < 1000) {
        warnings.push(
          "Timeout should be at least 1000ms for reliable operation",
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate configuration with template
   */
  private validateConfigWithTemplate(
    config: AgentConfig,
    template: AgentConfigTemplate,
  ): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of template.requiredFields) {
      if (
        !(field in config) ||
        config[field as keyof AgentConfig] === undefined
      ) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    // Apply custom validation rules
    if (template.validation) {
      for (const rule of template.validation) {
        const value = config[rule.field as keyof AgentConfig];
        const error = this.validateField(value, rule);
        if (error) {
          errors.push(error);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate individual field with rule
   */
  private validateField(
    value: unknown,
    rule: ConfigValidationRule,
  ): string | null {
    if (rule.required && (value === undefined || value === null)) {
      return `Field '${rule.field}' is required`;
    }

    if (value === undefined || value === null) {
      return null;
    }

    // Type validation
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== rule.type) {
      return `Field '${rule.field}' must be of type ${rule.type}, got ${actualType}`;
    }

    // Range validation for numbers
    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) {
        return `Field '${rule.field}' must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `Field '${rule.field}' must be at most ${rule.max}`;
      }
    }

    // Pattern validation for strings
    if (rule.type === "string" && typeof value === "string" && rule.pattern) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        return `Field '${rule.field}' does not match required pattern`;
      }
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      return `Field '${rule.field}' must be one of: ${rule.allowedValues.join(", ")}`;
    }

    // Custom validation
    if (rule.customValidator) {
      return rule.customValidator(value);
    }

    return null;
  }

  /**
   * Create environment configuration
   */
  createEnvironment(name: string, description?: string): void {
    const environment: EnvironmentConfig = {
      name,
      description,
      configs: {},
      metadata: {
        created: new Date(),
        modified: new Date(),
        version: "1.0.0",
        active: false,
      },
    };

    this.environments.set(name, environment);
  }

  /**
   * Switch to environment
   */
  async switchEnvironment(name: string): Promise<void> {
    const environment = this.environments.get(name);
    if (!environment) {
      throw new Error(`Environment '${name}' not found`);
    }

    // Save current environment if auto-save is enabled
    if (this.autoSave && this.currentEnvironment !== name) {
      await this.saveEnvironment(this.currentEnvironment);
    }

    // Load new environment configs
    this.configs.clear();
    for (const [key, config] of Object.entries(environment.configs)) {
      this.configs.set(key, config);
    }

    // Update current environment
    const oldEnv = this.environments.get(this.currentEnvironment);
    if (oldEnv) {
      oldEnv.metadata.active = false;
    }

    environment.metadata.active = true;
    this.currentEnvironment = name;
  }

  /**
   * Save environment configuration
   */
  async saveEnvironment(name: string): Promise<void> {
    const environment = this.environments.get(name);
    if (!environment) {
      throw new Error(`Environment '${name}' not found`);
    }

    environment.configs = this.getAllConfigs();
    environment.metadata.modified = new Date();
  }

  /**
   * Create configuration backup
   */
  createBackup(description?: string): string {
    const backup: ConfigBackup = {
      id: this.generateBackupId(),
      environment: this.currentEnvironment,
      configs: this.getAllConfigs(),
      timestamp: new Date(),
      description,
    };

    this.backups.push(backup);

    // Keep only the last 10 backups
    if (this.backups.length > 10) {
      this.backups.shift();
    }

    return backup.id;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<void> {
    const backup = this.backups.find((b) => b.id === backupId);
    if (!backup) {
      throw new Error(`Backup '${backupId}' not found`);
    }

    // Clear current configs
    this.configs.clear();

    // Load backup configs
    for (const [key, config] of Object.entries(backup.configs)) {
      this.configs.set(key, config);
    }

    // Auto-save if enabled
    if (this.autoSave) {
      await this.saveEnvironment(this.currentEnvironment);
    }
  }

  /**
   * Get all backups
   */
  getBackups(): ConfigBackup[] {
    return [...this.backups].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  /**
   * Register configuration change listener
   */
  addChangeListener(listener: ConfigChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove configuration change listener
   */
  removeChangeListener(listener: ConfigChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get configuration change history
   */
  getChangeHistory(agentKey?: string): ConfigChangeEvent[] {
    if (agentKey) {
      return this.changeHistory.filter((event) => event.agentKey === agentKey);
    }
    return [...this.changeHistory];
  }

  /**
   * Register configuration loader
   */
  registerLoader(loader: ConfigLoader): void {
    this.loaders.push(loader);
    this.loaders.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Find appropriate loader for source
   */
  private findLoader(source: string): ConfigLoader | null {
    return this.loaders.find((loader) => loader.canLoad(source)) || null;
  }

  /**
   * Notify change listeners
   */
  private notifyListeners(event: ConfigChangeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in config change listener:", error);
      }
    }
  }

  /**
   * Generate backup ID
   */
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set auto-save behavior
   */
  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
  }

  /**
   * Get current environment name
   */
  getCurrentEnvironment(): string {
    return this.currentEnvironment;
  }

  /**
   * Get environment information
   */
  getEnvironment(name: string): EnvironmentConfig | null {
    return this.environments.get(name) || null;
  }

  /**
   * Get all environments
   */
  getAllEnvironments(): Record<string, EnvironmentConfig> {
    return Object.fromEntries(this.environments);
  }
}

/**
 * File-based configuration loader
 */
export class FileConfigLoader implements ConfigLoader {
  name = "file";
  priority = 10;

  canLoad(source: string): boolean {
    return (
      source.endsWith(".json") ||
      source.endsWith(".yaml") ||
      source.endsWith(".yml")
    );
  }

  async load(source: string): Promise<Record<string, AgentConfig>> {
    // This would normally read from filesystem
    console.log(`Loading configs from file: ${source}`);
    return {};
  }
}

/**
 * Environment variables configuration loader
 */
export class EnvironmentConfigLoader implements ConfigLoader {
  name = "environment";
  priority = 5;

  canLoad(source: string): boolean {
    return source === "env" || source.startsWith("env:");
  }

  async load(source: string): Promise<Record<string, AgentConfig>> {
    const configs: Record<string, AgentConfig> = {};

    // Look for environment variables with pattern AGENT_CONFIG_*
    const prefix = "AGENT_CONFIG_";

    if (typeof process !== "undefined" && process.env) {
      for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith(prefix) && value) {
          try {
            const agentKey = key.substring(prefix.length).toLowerCase();
            const config = JSON.parse(value) as AgentConfig;
            configs[agentKey] = config;
          } catch (error) {
            console.warn(`Failed to parse config from env var ${key}:`, error);
          }
        }
      }
    }

    return configs;
  }
}

/**
 * Global configuration manager instance
 */
export const globalConfigManager = new AgentConfigManager();

// Register default loaders
globalConfigManager.registerLoader(new FileConfigLoader());
globalConfigManager.registerLoader(new EnvironmentConfigLoader());
