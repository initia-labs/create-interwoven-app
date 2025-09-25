const path = require('path');

// File extensions that should be excluded from template processing
const BINARY_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.mov', '.avi', '.webm',
  '.pdf', '.zip', '.tar', '.gz'
];

// Directories to skip during template processing
const SKIP_DIRECTORIES = [
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  '.cache'
];

// Default template configuration
const TEMPLATE_CONFIG = {
  defaultTemplate: 'default',
  templatesDir: path.join(__dirname, '..', 'templates')
};

// Project validation rules
const VALIDATION_RULES = {
  projectName: {
    minLength: 1,
    maxLength: 214,
    allowedChars: /^[a-z0-9-_@.\/]+$/i,
    reservedNames: [
      'node_modules', 'favicon.ico', 'package.json', 'package-lock.json',
      'yarn.lock', '.git', '.gitignore', 'readme', 'license', 'changelog'
    ]
  }
};

// NPM commands and options
const NPM_CONFIG = {
  installCommand: 'npm',
  installArgs: ['install', '--legacy-peer-deps'],
  installOptions: {
    stdio: 'inherit',
    shell: false // Security improvement
  }
};

module.exports = {
  BINARY_EXTENSIONS,
  SKIP_DIRECTORIES,
  TEMPLATE_CONFIG,
  VALIDATION_RULES,
  NPM_CONFIG
};
