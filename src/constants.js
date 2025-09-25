import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File extensions that should be excluded from template processing
 * @type {string[]}
 */
export const BINARY_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.mov',
  '.avi',
  '.webm',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
];

/**
 * Directories to skip during template processing
 * @type {string[]}
 */
export const SKIP_DIRECTORIES = [
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  '.cache',
];

/**
 * Default template configuration
 * @type {Object}
 */
export const TEMPLATE_CONFIG = {
  defaultTemplate: 'default',
  templatesDir: path.join(__dirname, '..', 'templates'),
};

/**
 * Project validation rules
 * @type {Object}
 */
export const VALIDATION_RULES = {
  projectName: {
    minLength: 1,
    maxLength: 214,
    allowedChars: /^[a-z0-9-_@./]+$/i,
    reservedNames: [
      'node_modules',
      'favicon.ico',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      '.git',
      '.gitignore',
      'readme',
      'license',
      'changelog',
    ],
  },
};

/**
 * NPM commands and options
 * @type {Object}
 */
export const NPM_CONFIG = {
  installCommand: 'npm',
  installArgs: ['install', '--legacy-peer-deps'],
  installOptions: {
    stdio: 'inherit',
    shell: false, // Security improvement
  },
};

/**
 * Chain registry URLs
 * @type {Object}
 */
export const CHAIN_REGISTRY = {
  testnets: 'https://raw.githubusercontent.com/initia-labs/chain-registry/main/testnets',
  mainnets: 'https://raw.githubusercontent.com/initia-labs/chain-registry/main',
};
