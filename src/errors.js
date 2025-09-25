/**
 * Custom error classes for better error handling
 */

/**
 * Base error class for the application
 */
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends AppError {
  constructor(message, field, details = {}) {
    super(message, 'VALIDATION_ERROR', { field, ...details });
    this.field = field;
  }
}

/**
 * Template error for template-related issues
 */
export class TemplateError extends AppError {
  constructor(message, templateName, details = {}) {
    super(message, 'TEMPLATE_ERROR', { templateName, ...details });
    this.templateName = templateName;
  }
}

/**
 * Network error for chain fetch failures
 */
export class NetworkError extends AppError {
  constructor(message, url, details = {}) {
    super(message, 'NETWORK_ERROR', { url, ...details });
    this.url = url;
  }
}

/**
 * File system error
 */
export class FileSystemError extends AppError {
  constructor(message, path, operation, details = {}) {
    super(message, 'FILESYSTEM_ERROR', { path, operation, ...details });
    this.path = path;
    this.operation = operation;
  }
}

/**
 * Installation error for dependency installation failures
 */
export class InstallationError extends AppError {
  constructor(message, exitCode, details = {}) {
    super(message, 'INSTALLATION_ERROR', { exitCode, ...details });
    this.exitCode = exitCode;
  }
}
