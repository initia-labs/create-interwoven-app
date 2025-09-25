/**
 * @deprecated This module is kept for backward compatibility
 * Use TemplateProcessor class from template-processor.js instead
 */

const TemplateProcessor = require('./template-processor');
const logger = require('./logger');

/**
 * Legacy createProject function for backward compatibility
 * @param {string} projectName - Name of the project
 * @param {string} targetDir - Target directory path
 * @param {string} templateName - Template name to use
 * @returns {Promise<void>}
 */
async function createProject(projectName, targetDir, templateName = 'default') {
  logger.debug('Using legacy createProject function. Consider using TemplateProcessor directly.');
  
  const processor = new TemplateProcessor(templateName);
  await processor.createProject(projectName, targetDir);
}

module.exports = { createProject };