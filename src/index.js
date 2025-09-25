/**
 * Main exports for create-interwoven-app
 * Provides clean API access to all modules
 */

// Core functionality
const TemplateProcessor = require('./template-processor');
const { createProject } = require('./create-project'); // Legacy support

// Utilities
const validators = require('./validators');
const utils = require('./utils');
const logger = require('./logger');
const constants = require('./constants');

// Main exports
module.exports = {
  // Core classes
  TemplateProcessor,
  
  // Legacy function (deprecated)
  createProject,
  
  // Utility modules
  validators,
  utils,
  logger,
  constants,
  
  // Quick access to commonly used functions
  validateProjectName: validators.validateProjectName,
  validateTargetDirectory: validators.validateTargetDirectory,
  validateTemplate: validators.validateTemplate,
  
  // String utilities
  kebabCase: utils.kebabCase,
  pascalCase: utils.pascalCase,
  camelCase: utils.camelCase,
  
  // Constants
  TEMPLATE_CONFIG: constants.TEMPLATE_CONFIG,
  NPM_CONFIG: constants.NPM_CONFIG
};
