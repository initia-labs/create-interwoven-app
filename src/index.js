/**
 * Main exports for create-interwoven-app
 * Provides clean API access to all modules
 */

// Core functionality
import TemplateProcessor from './template-processor.js';
// Utilities
import * as validators from './validators.js';
import * as utils from './utils.js';
import logger from './logger.js';
import * as constants from './constants.js';

// Main exports
export {
  // Core classes
  TemplateProcessor,

  // Utility modules
  validators,
  utils,
  logger,
  constants,
};

// Named exports for convenience
export const { validateProjectName, validateTargetDirectory, validateTemplate } = validators;

export const {
  kebabCase,
  pascalCase,
  camelCase,
  fetchJson,
  fetchAllChains,
  filterChains,
  shouldProcessFile,
  shouldProcessDirectory,
  createReplacements,
  delay,
  safeAsync,
} = utils;

export const {
  TEMPLATE_CONFIG,
  NPM_CONFIG,
  BINARY_EXTENSIONS,
  SKIP_DIRECTORIES,
  VALIDATION_RULES,
  CHAIN_REGISTRY,
} = constants;
