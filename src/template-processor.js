const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { 
  shouldProcessFile, 
  shouldProcessDirectory, 
  createReplacements,
  safeAsync
} = require('./utils');
const { NPM_CONFIG, TEMPLATE_CONFIG } = require('./constants');
const logger = require('./logger');

/**
 * Template processor class for handling project scaffolding
 */
class TemplateProcessor {
  constructor(templateName = 'default') {
    this.templateName = templateName;
    this.templateDir = path.join(TEMPLATE_CONFIG.templatesDir, templateName);
  }

  /**
   * Process template placeholders recursively
   * @param {string} dir - Directory to process
   * @param {Object} replacements - Replacement mappings
   * @returns {Promise<void>}
   */
  async processPlaceholders(dir, replacements) {
    const [error, files] = await safeAsync(
      () => fs.readdir(dir, { withFileTypes: true }),
      'reading directory'
    );

    if (error) {
      throw new Error(`Failed to read directory ${dir}: ${error.message}`);
    }

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory() && shouldProcessDirectory(file.name)) {
        await this.processPlaceholders(filePath, replacements);
      } else if (file.isFile() && shouldProcessFile(filePath, file.name)) {
        await this.processFile(filePath, replacements);
      }
    }
  }

  /**
   * Process a single file for placeholder replacement
   * @param {string} filePath - Path to file
   * @param {Object} replacements - Replacement mappings
   * @returns {Promise<void>}
   */
  async processFile(filePath, replacements) {
    const [readError, content] = await safeAsync(
      () => fs.readFile(filePath, 'utf8'),
      `reading file ${filePath}`
    );

    if (readError) {
      logger.warn(`Skipping file ${filePath}: ${readError.message}`);
      return;
    }

    let processedContent = content;
    let hasChanges = false;

    for (const [placeholder, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      if (regex.test(processedContent)) {
        processedContent = processedContent.replace(regex, replacement);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      const [writeError] = await safeAsync(
        () => fs.writeFile(filePath, processedContent),
        `writing file ${filePath}`
      );

      if (writeError) {
        throw new Error(`Failed to write file ${filePath}: ${writeError.message}`);
      }
    }
  }

  /**
   * Copy template to target directory
   * @param {string} targetDir - Destination directory
   * @returns {Promise<void>}
   */
  async copyTemplate(targetDir) {
    logger.step('Copying template files...');
    
    const [error] = await safeAsync(
      () => fs.copy(this.templateDir, targetDir, {
        filter: (src) => {
          const basename = path.basename(src);
          // Skip copying certain files that might cause issues
          return !basename.startsWith('.DS_Store') && 
                 !basename.includes('.tmp') &&
                 basename !== 'Thumbs.db';
        }
      }),
      'copying template'
    );

    if (error) {
      throw new Error(`Failed to copy template: ${error.message}`);
    }
  }

  /**
   * Install npm dependencies
   * @param {string} projectDir - Project directory
   * @returns {Promise<void>}
   */
  async installDependencies(projectDir) {
    logger.step('Installing dependencies...');
    logger.info('This might take a few minutes.');

    return new Promise((resolve, reject) => {
      const child = spawn(NPM_CONFIG.installCommand, NPM_CONFIG.installArgs, {
        cwd: projectDir,
        ...NPM_CONFIG.installOptions
      });

      // Handle process events
      child.on('error', (error) => {
        reject(new Error(`Failed to start npm install: ${error.message}`));
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`npm install failed with exit code ${code}`));
        } else {
          logger.success('Dependencies installed successfully');
          resolve();
        }
      });

      // Timeout after 10 minutes
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('npm install timed out after 10 minutes'));
      }, 10 * 60 * 1000);

      child.on('close', () => clearTimeout(timeout));
    });
  }

  /**
   * Create a complete project from template
   * @param {string} projectName - Name of the project
   * @param {string} targetDir - Target directory path
   * @param {string} network - Network configuration (testnet/mainnet)
   * @returns {Promise<void>}
   */
  async createProject(projectName, targetDir, network = 'testnet') {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);

    // Copy template files
    await this.copyTemplate(targetDir);

    // Process template placeholders
    logger.step('Configuring project...');
    const replacements = createReplacements(projectName, network);
    await this.processPlaceholders(targetDir, replacements);

    // Install dependencies with error handling
    try {
      await this.installDependencies(targetDir);
    } catch (error) {
      logger.warn('Dependency installation failed. You can run "npm install" manually later.');
      logger.debug('Install error:', error.message);
    }
  }
}

module.exports = TemplateProcessor;
