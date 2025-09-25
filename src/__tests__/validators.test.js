import { validateProjectName, validateTargetDirectory, validateTemplate } from '../validators.js';

describe('validateProjectName', () => {
  test('accepts valid project names', () => {
    const validNames = ['my-app', 'my_app', 'myApp', 'my-app-123', '@scope/package', 'a'];

    validNames.forEach((name) => {
      const result = validateProjectName(name);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  test('rejects invalid project names', () => {
    const invalidCases = [
      { name: '', error: 'Project name cannot be empty' },
      { name: ' ', error: 'Project name cannot be empty' },
      { name: 'node_modules', error: '"node_modules" is a reserved name' },
      { name: '.git', error: '".git" is a reserved name' },
      { name: '-start', error: 'Project name cannot start or end with a period or hyphen' },
      { name: 'end-', error: 'Project name cannot start or end with a period or hyphen' },
      { name: '.start', error: 'Project name cannot start or end with a period or hyphen' },
      { name: 'end.', error: 'Project name cannot start or end with a period or hyphen' },
      { name: 'my app', error: 'Project name can only contain letters' },
      { name: '@invalid', error: 'Scoped package names must be in format @scope/package-name' },
    ];

    invalidCases.forEach(({ name, error }) => {
      const result = validateProjectName(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain(error.substring(0, 20));
    });
  });

  test('handles null and undefined', () => {
    expect(validateProjectName(null).isValid).toBe(false);
    expect(validateProjectName(undefined).isValid).toBe(false);
    expect(validateProjectName(123).isValid).toBe(false);
  });
});

describe('validateTargetDirectory', () => {
  const mockFs = {
    pathExists: jest.fn(),
    readdir: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('accepts non-existent directory', async () => {
    mockFs.pathExists.mockResolvedValue(false);

    const result = await validateTargetDirectory('/path/to/new', mockFs);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('accepts empty directory', async () => {
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.readdir.mockResolvedValue([]);

    const result = await validateTargetDirectory('/path/to/empty', mockFs);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('rejects non-empty directory', async () => {
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.readdir.mockResolvedValue(['file.txt']);

    const result = await validateTargetDirectory('/path/to/project', mockFs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not empty');
  });

  test('handles file system errors', async () => {
    mockFs.pathExists.mockRejectedValue(new Error('Permission denied'));

    const result = await validateTargetDirectory('/path/to/dir', mockFs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Unable to access directory');
  });
});

describe('validateTemplate', () => {
  const mockFs = {
    pathExists: jest.fn(),
    stat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('accepts valid template', async () => {
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.stat.mockResolvedValue({ isDirectory: () => true });

    const result = await validateTemplate('default', '/templates', mockFs);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('rejects non-existent template', async () => {
    mockFs.pathExists.mockResolvedValue(false);

    const result = await validateTemplate('custom', '/templates', mockFs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not found');
  });

  test('rejects template with path traversal', async () => {
    const invalidTemplates = ['../evil', 'templates/../../../etc', 'some\\path'];

    for (const template of invalidTemplates) {
      const result = await validateTemplate(template, '/templates', mockFs);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid template name');
    }
  });

  test('rejects file instead of directory', async () => {
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.stat.mockResolvedValue({ isDirectory: () => false });

    const result = await validateTemplate('file', '/templates', mockFs);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not a valid directory');
  });
});
