import chalk from 'chalk';

/**
 * Logger utility with colored output and different log levels
 */
class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
  }

  /**
   * Log an info message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    console.log(chalk.blue('ℹ'), message, ...args);
  }

  /**
   * Log a success message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  success(message, ...args) {
    console.log(chalk.green('✓'), message, ...args);
  }

  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    console.log(chalk.yellow('⚠'), message, ...args);
  }

  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  error(message, ...args) {
    console.error(chalk.red('✖'), message, ...args);
  }

  /**
   * Log a debug message (only if verbose mode is enabled)
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  debug(message, ...args) {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), message, ...args);
    }
  }

  /**
   * Log a step in a process
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  step(message, ...args) {
    console.log(chalk.cyan('▶'), message, ...args);
  }

  /**
   * Create a spinner-like loading message
   * @param {string} message - Loading message
   * @returns {Object} - Object with stop method
   */
  loading(message) {
    console.log(chalk.blue('⏳'), message);
    return {
      stop: (successMessage) => {
        if (successMessage) {
          this.success(successMessage);
        }
      },
      fail: (errorMessage) => {
        if (errorMessage) {
          this.error(errorMessage);
        }
      },
    };
  }

  /**
   * Display the InterwovenKit banner
   */
  banner() {
    console.log();
    console.log(chalk.cyan('Welcome to InterwovenKit'));
    console.log();
  }

  /**
   * Log a welcome message
   * @param {string} appName - Application name
   */
  welcome(appName = 'create-interwoven-app') {
    console.log(chalk.cyan(`🌟 Welcome to ${appName}!`));
    console.log();
  }

  /**
   * Log final success instructions
   * @param {string} projectName - Created project name
   * @param {string} projectPath - Full path to project
   */
  successInstructions(projectName, projectPath) {
    console.log();
    console.log(
      chalk.green('🎉 Success!'),
      `Created ${chalk.bold(projectName)} at ${chalk.gray(projectPath)}`
    );
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), projectName);
    console.log(chalk.cyan('  npm run dev'));
    console.log();
    console.log('Happy building with InterwovenKit! 🚀');
  }

  /**
   * Log usage instructions
   */
  usage() {
    console.log();
    console.log('Usage:');
    console.log(chalk.cyan('  npx create-interwoven-app'), chalk.green('<project-name>'));
    console.log();
    console.log('For example:');
    console.log(chalk.cyan('  npx create-interwoven-app'), chalk.green('my-dapp'));
    console.log();
  }

  /**
   * Format and log validation errors
   * @param {Object} validation - Validation result object
   * @param {string} context - Context of the validation
   */
  validationError(validation, context = 'validation') {
    this.error(`${context} failed: ${validation.error}`);
  }

  /**
   * Log a blank line
   */
  newLine() {
    console.log();
  }
}

// Export a singleton instance
const logger = new Logger();
export default logger;
export { Logger };
