import path from 'path';

import fs from 'fs-extra';

import { VALIDATION_RULES } from './constants.js';

/**
 * Validates a project name according to npm naming conventions
 * @param {string} projectName - The project name to validate
 * @returns {Object} - Validation result with isValid and error properties
 */
function validateProjectName(projectName) {
  const { minLength, maxLength, allowedChars, reservedNames } = VALIDATION_RULES.projectName;

  // Check for null/undefined/empty
  if (!projectName || typeof projectName !== 'string') {
    return {
      isValid: false,
      error: 'Project name is required',
    };
  }

  const trimmedName = projectName.trim();

  // Check length
  if (trimmedName.length < minLength) {
    return {
      isValid: false,
      error: 'Project name cannot be empty',
    };
  }

  if (trimmedName.length > maxLength) {
    return {
      isValid: false,
      error: `Project name cannot exceed ${maxLength} characters`,
    };
  }

  // Check for allowed characters
  if (!allowedChars.test(trimmedName)) {
    return {
      isValid: false,
      error:
        'Project name can only contain letters, numbers, hyphens, underscores, dots, and forward slashes',
    };
  }

  // Check for reserved names (case insensitive)
  const lowerName = trimmedName.toLowerCase();
  if (
    reservedNames.some((reserved) => lowerName === reserved || lowerName.startsWith(reserved + '.'))
  ) {
    return {
      isValid: false,
      error: `"${trimmedName}" is a reserved name and cannot be used as a project name`,
    };
  }

  // Check for npm scoped packages format
  if (trimmedName.startsWith('@')) {
    const scopedMatch = trimmedName.match(/^@([a-z0-9-_]+)\/([a-z0-9-_.]+)$/);
    if (!scopedMatch) {
      return {
        isValid: false,
        error: 'Scoped package names must be in format @scope/package-name',
      };
    }
  }

  // Check for leading/trailing periods or hyphens
  if (
    trimmedName.startsWith('.') ||
    trimmedName.startsWith('-') ||
    trimmedName.endsWith('.') ||
    trimmedName.endsWith('-')
  ) {
    return {
      isValid: false,
      error: 'Project name cannot start or end with a period or hyphen',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates if a directory can be used for project creation
 * @param {string} targetDir - The target directory path
 * @param {Function} fs - File system module (for testing)
 * @returns {Promise<Object>} - Validation result
 */
async function validateTargetDirectory(targetDir, fsModule = fs) {
  try {
    const exists = await fsModule.pathExists(targetDir);

    if (!exists) {
      return { isValid: true, error: null };
    }

    const files = await fsModule.readdir(targetDir);

    if (files.length === 0) {
      return { isValid: true, error: null };
    }

    return {
      isValid: false,
      error: `Directory "${path.basename(targetDir)}" is not empty. Please choose a different name or remove the existing directory.`,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Unable to access directory: ${error.message}`,
    };
  }
}

/**
 * Validates template name and existence
 * @param {string} templateName - The template name to validate
 * @param {string} templatesDir - The templates directory path
 * @param {Function} fs - File system module (for testing)
 * @returns {Promise<Object>} - Validation result
 */
async function validateTemplate(templateName, templatesDir, fsModule = fs) {
  if (!templateName || typeof templateName !== 'string') {
    return {
      isValid: false,
      error: 'Template name is required',
    };
  }

  // Check for path traversal attempts
  if (templateName.includes('..') || templateName.includes('/') || templateName.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid template name. Template names cannot contain path separators.',
    };
  }

  const templateDir = path.join(templatesDir, templateName);

  try {
    const exists = await fsModule.pathExists(templateDir);

    if (!exists) {
      return {
        isValid: false,
        error: `Template "${templateName}" not found`,
      };
    }

    const stat = await fsModule.stat(templateDir);

    if (!stat.isDirectory()) {
      return {
        isValid: false,
        error: `Template "${templateName}" is not a valid directory`,
      };
    }

    return { isValid: true, error: null };
  } catch (error) {
    return {
      isValid: false,
      error: `Unable to access template: ${error.message}`,
    };
  }
}

export { validateProjectName, validateTargetDirectory, validateTemplate };
