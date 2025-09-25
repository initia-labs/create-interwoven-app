# Contributing to Create Interwoven App

Thank you for your interest in contributing to Create Interwoven App! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/create-interwoven-app.git
   cd create-interwoven-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Project Structure

```
create-interwoven-app/
├── bin/                    # CLI entry point
│   └── index.js           # Main CLI application
├── src/                   # Source code
│   ├── __tests__/         # Test files
│   ├── constants.js       # Configuration constants
│   ├── errors.js          # Custom error classes
│   ├── index.js           # Main exports
│   ├── logger.js          # Logging utilities
│   ├── template-processor.js # Template scaffolding
│   ├── utils.js           # Utility functions
│   └── validators.js      # Input validation
├── templates/             # Project templates
│   └── default/           # Default Next.js template
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jest.config.js         # Jest configuration
├── package.json           # Package configuration
└── tsconfig.json          # TypeScript configuration
```

## Development Workflow

### Code Style

This project uses ESLint and Prettier for code formatting. Before committing:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

Even though the project is in JavaScript, we use TypeScript for type checking:

```bash
npm run typecheck
```

### Testing

Run tests with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Testing the CLI Locally

To test the CLI locally without publishing:

```bash
# Link the package globally
npm link

# Test in a new directory
cd /tmp
create-interwoven-app my-test-app

# Unlink when done
npm unlink -g create-interwoven-app
```

## Code Guidelines

### ES Modules

This project uses ES modules. Always use:

- `import` / `export` instead of `require()` / `module.exports`
- `.js` extension in import paths

### Error Handling

Use custom error classes from `src/errors.js`:

```javascript
import { ValidationError, TemplateError } from './errors.js';

// Throw specific errors
throw new ValidationError('Invalid project name', 'projectName');
```

### Logging

Use the logger utility for consistent output:

```javascript
import logger from './logger.js';

logger.info('Information message');
logger.success('Success message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message'); // Only shown in verbose mode
```

### Async Operations

Use the `safeAsync` utility for error handling:

```javascript
import { safeAsync } from './utils.js';

const [error, result] = await safeAsync(() => fs.readFile(path), 'reading file');

if (error) {
  // Handle error
}
```

## Adding New Features

### Adding a New Template

1. Create a new directory in `templates/`
2. Add template files with placeholders:

   ```javascript
   // Use placeholders like {{PROJECT_NAME}}
   export const appName = '{{PROJECT_NAME}}';
   ```

3. Update `TEMPLATE_CONFIG` in `src/constants.js` if needed

### Adding New CLI Options

1. Update the CLI in `bin/index.js`:

   ```javascript
   program.option('--new-option <value>', 'description');
   ```

2. Handle the option in the appropriate functions

3. Update validation if needed

### Adding New Validators

1. Add validation function to `src/validators.js`
2. Export it from the module
3. Add tests in `src/__tests__/validators.test.js`

## Testing

### Writing Tests

Place test files in `src/__tests__/` with the `.test.js` suffix:

```javascript
import { functionToTest } from '../module.js';

describe('functionToTest', () => {
  test('should do something', () => {
    expect(functionToTest(input)).toBe(expected);
  });
});
```

### Mocking

Use Jest mocks for external dependencies:

```javascript
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
};

// Pass mock to function
await processFile(path, mockFs);
```

## Commit Guidelines

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```bash
git commit -m "feat(cli): add support for custom templates"
git commit -m "fix(validator): handle scoped package names"
git commit -m "docs: update contributing guidelines"
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the README.md if needed
5. Submit PR with clear description

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Commit messages follow guidelines

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm

## Getting Help

- Open an issue for bugs or feature requests
- Join discussions in GitHub Discussions
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
