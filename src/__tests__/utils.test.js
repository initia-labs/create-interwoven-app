import {
  kebabCase,
  pascalCase,
  camelCase,
  shouldProcessFile,
  shouldProcessDirectory,
  createReplacements,
  filterChains,
  safeAsync,
} from '../utils.js';

describe('String transformations', () => {
  describe('kebabCase', () => {
    test('converts various formats to kebab-case', () => {
      expect(kebabCase('myProjectName')).toBe('my-project-name');
      expect(kebabCase('MyProjectName')).toBe('my-project-name');
      expect(kebabCase('my project name')).toBe('my-project-name');
      expect(kebabCase('my_project_name')).toBe('my-project-name');
      expect(kebabCase('MY_PROJECT_NAME')).toBe('my-project-name');
      expect(kebabCase('  my-project-name  ')).toBe('my-project-name');
      expect(kebabCase('my@#$project')).toBe('myproject');
    });

    test('handles edge cases', () => {
      expect(kebabCase('')).toBe('');
      expect(kebabCase(null)).toBe('');
      expect(kebabCase(undefined)).toBe('');
      expect(kebabCase(123)).toBe('');
    });
  });

  describe('pascalCase', () => {
    test('converts various formats to PascalCase', () => {
      expect(pascalCase('my-project-name')).toBe('MyProjectName');
      expect(pascalCase('my_project_name')).toBe('MyProjectName');
      expect(pascalCase('my project name')).toBe('MyProjectName');
      expect(pascalCase('myProjectName')).toBe('MyProjectName');
      expect(pascalCase('MY_PROJECT_NAME')).toBe('MYPROJECTNAME');
    });

    test('handles edge cases', () => {
      expect(pascalCase('')).toBe('');
      expect(pascalCase(null)).toBe('');
      expect(pascalCase(undefined)).toBe('');
    });
  });

  describe('camelCase', () => {
    test('converts various formats to camelCase', () => {
      expect(camelCase('my-project-name')).toBe('myProjectName');
      expect(camelCase('my_project_name')).toBe('myProjectName');
      expect(camelCase('my project name')).toBe('myProjectName');
      expect(camelCase('MyProjectName')).toBe('myProjectName');
    });

    test('handles edge cases', () => {
      expect(camelCase('')).toBe('');
      expect(camelCase(null)).toBe('');
      expect(camelCase(undefined)).toBe('');
    });
  });
});

describe('File processing', () => {
  describe('shouldProcessFile', () => {
    test('excludes binary files', () => {
      expect(shouldProcessFile('/path/to/image.png', 'image.png')).toBe(false);
      expect(shouldProcessFile('/path/to/font.woff', 'font.woff')).toBe(false);
      expect(shouldProcessFile('/path/to/video.mp4', 'video.mp4')).toBe(false);
      expect(shouldProcessFile('/path/to/archive.zip', 'archive.zip')).toBe(false);
    });

    test('excludes system files', () => {
      expect(shouldProcessFile('/path/.DS_Store', '.DS_Store')).toBe(false);
      expect(shouldProcessFile('/path/Thumbs.db', 'Thumbs.db')).toBe(false);
      expect(shouldProcessFile('/path/package-lock.json', 'package.lock')).toBe(false);
    });

    test('includes text files', () => {
      expect(shouldProcessFile('/path/to/script.js', 'script.js')).toBe(true);
      expect(shouldProcessFile('/path/to/styles.css', 'styles.css')).toBe(true);
      expect(shouldProcessFile('/path/to/config.json', 'config.json')).toBe(true);
      expect(shouldProcessFile('/path/to/README.md', 'README.md')).toBe(true);
    });
  });

  describe('shouldProcessDirectory', () => {
    test('excludes specific directories', () => {
      expect(shouldProcessDirectory('node_modules')).toBe(false);
      expect(shouldProcessDirectory('.git')).toBe(false);
      expect(shouldProcessDirectory('.next')).toBe(false);
      expect(shouldProcessDirectory('dist')).toBe(false);
      expect(shouldProcessDirectory('build')).toBe(false);
    });

    test('excludes hidden directories', () => {
      expect(shouldProcessDirectory('.hidden')).toBe(false);
      expect(shouldProcessDirectory('.cache')).toBe(false);
    });

    test('includes normal directories', () => {
      expect(shouldProcessDirectory('src')).toBe(true);
      expect(shouldProcessDirectory('components')).toBe(true);
      expect(shouldProcessDirectory('pages')).toBe(true);
    });
  });
});

describe('createReplacements', () => {
  test('creates replacements for default testnet', () => {
    const replacements = createReplacements('my-app');

    expect(replacements.PROJECT_NAME).toBe('my-app');
    expect(replacements.PROJECT_NAME_KEBAB).toBe('my-app');
    expect(replacements.PROJECT_NAME_CAMEL).toBe('myApp');
    expect(replacements.PROJECT_NAME_PASCAL).toBe('MyApp');
    expect(replacements.NETWORK_CONFIG).toContain('TESTNET');
    expect(replacements.CHAIN_ID).toBe('initiation-2');
  });

  test('creates replacements for mainnet', () => {
    const replacements = createReplacements('my-app', 'mainnet');

    expect(replacements.NETWORK_CONFIG).toContain('MAINNET');
    expect(replacements.CHAIN_ID).toBe('interwoven-1');
  });

  test('handles scoped packages', () => {
    const replacements = createReplacements('@scope/my-app');

    expect(replacements.PROJECT_NAME).toBe('@scope/my-app');
    expect(replacements.PROJECT_NAME_CLEAN).toBe('my-app');
    expect(replacements.PROJECT_NAME_KEBAB).toBe('my-app');
  });

  test('handles custom chain data', () => {
    const customChain = {
      chainId: 'custom-1',
      chainName: 'custom',
      prettyName: 'Custom Chain',
      networkType: 'testnet',
      customChain: {
        chain_id: 'custom-1',
        apis: {
          rpc: [{ address: 'https://rpc.custom.com' }],
        },
      },
    };

    const replacements = createReplacements('my-app', customChain);

    expect(replacements.CHAIN_ID).toBe('custom-1');
    expect(replacements.CHAIN_NAME).toBe('custom');
    expect(replacements.CHAIN_PRETTY_NAME).toBe('Custom Chain');
    expect(replacements.IS_CUSTOM_CHAIN).toBe('true');
    expect(replacements.NETWORK_CONFIG).toContain('custom-1');
  });
});

describe('filterChains', () => {
  const mockChains = [
    {
      name: 'Initia (initiation-2)',
      value: {
        chainId: 'initiation-2',
        chainName: 'initia',
        prettyName: 'Initia',
        description: 'Initia Testnet',
      },
      searchableText: 'initia initiation-2 initia testnet',
    },
    {
      name: 'Miniwasm (miniwasm-1)',
      value: {
        chainId: 'miniwasm-1',
        chainName: 'miniwasm',
        prettyName: 'Miniwasm',
        description: 'Miniwasm Testnet',
      },
      searchableText: 'miniwasm miniwasm-1 miniwasm testnet',
    },
  ];

  test('returns all chains when no input', () => {
    expect(filterChains(mockChains, '')).toEqual(mockChains);
    expect(filterChains(mockChains, '   ')).toEqual(mockChains);
  });

  test('filters by chain ID', () => {
    const result = filterChains(mockChains, 'initiation');
    expect(result).toHaveLength(1);
    expect(result[0].value.chainId).toBe('initiation-2');
  });

  test('filters by chain name', () => {
    const result = filterChains(mockChains, 'mini');
    expect(result).toHaveLength(1);
    expect(result[0].value.chainName).toBe('miniwasm');
  });

  test('case insensitive search', () => {
    const result = filterChains(mockChains, 'INITIA');
    expect(result).toHaveLength(1);
    expect(result[0].value.chainName).toBe('initia');
  });
});

describe('safeAsync', () => {
  test('returns result on success', async () => {
    const successFn = async () => 'success';
    const [error, result] = await safeAsync(successFn);

    expect(error).toBeNull();
    expect(result).toBe('success');
  });

  test('returns error on failure', async () => {
    const failFn = async () => {
      throw new Error('Test error');
    };
    const [error, result] = await safeAsync(failFn, 'test operation');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.context).toBe('test operation');
    expect(result).toBeNull();
  });
});
