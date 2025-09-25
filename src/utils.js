import path from 'path';
import https from 'https';

import { BINARY_EXTENSIONS, SKIP_DIRECTORIES } from './constants.js';

/**
 * Fetches JSON data from a URL using HTTPS
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} - Parsed JSON data
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
          }
        });
      })
      .on('error', (error) => {
        reject(new Error(`Failed to fetch ${url}: ${error.message}`));
      });
  });
}

/**
 * Fetches all available chains from both mainnet and testnet registries
 * @returns {Promise<Object>} - Object with mainnet and testnet chain arrays
 */
async function fetchAllChains() {
  try {
    const [mainnetChains, testnetChains] = await Promise.all([
      fetchJson('https://registry.initia.xyz/chains.json'),
      fetchJson('https://registry.testnet.initia.xyz/chains.json'),
    ]);

    // Transform mainnet chains
    const formattedMainnet = mainnetChains.map((chain) => ({
      name: `${chain.pretty_name || chain.chain_name} (${chain.chain_id})`,
      value: {
        chainId: chain.chain_id,
        chainName: chain.chain_name,
        prettyName: chain.pretty_name || chain.chain_name,
        networkType: 'mainnet',
        network: 'mainnet',
        description: chain.description || '',
      },
      short: chain.pretty_name || chain.chain_name,
      searchableText:
        `${chain.pretty_name || chain.chain_name} ${chain.chain_id} ${chain.description || ''}`.toLowerCase(),
    }));

    // Transform testnet chains
    const formattedTestnet = testnetChains.map((chain) => ({
      name: `${chain.pretty_name || chain.chain_name} (${chain.chain_id})`,
      value: {
        chainId: chain.chain_id,
        chainName: chain.chain_name,
        prettyName: chain.pretty_name || chain.chain_name,
        networkType: 'testnet',
        network: 'testnet',
        description: chain.description || '',
      },
      short: chain.pretty_name || chain.chain_name,
      searchableText:
        `${chain.pretty_name || chain.chain_name} ${chain.chain_id} ${chain.description || ''}`.toLowerCase(),
    }));

    // Sort chains alphabetically by name
    formattedMainnet.sort((a, b) => a.short.localeCompare(b.short));
    formattedTestnet.sort((a, b) => a.short.localeCompare(b.short));

    return {
      mainnet: formattedMainnet,
      testnet: formattedTestnet,
      all: [...formattedMainnet, ...formattedTestnet],
    };
  } catch (error) {
    // Fallback to original hardcoded options if fetching fails
    console.warn(
      'Warning: Failed to fetch chains from registry, using fallback options:',
      error.message
    );

    const fallbackMainnet = [
      {
        name: 'Initia (interwoven-1)',
        value: {
          chainId: 'interwoven-1',
          chainName: 'initia',
          prettyName: 'Initia',
          networkType: 'mainnet',
          network: 'mainnet',
          description: 'Initia Mainnet',
        },
        short: 'Initia',
        searchableText: 'initia interwoven-1 initia mainnet',
      },
    ];

    const fallbackTestnet = [
      {
        name: 'Initia (initiation-2)',
        value: {
          chainId: 'initiation-2',
          chainName: 'initia',
          prettyName: 'Initia',
          networkType: 'testnet',
          network: 'testnet',
          description: 'Initia Testnet',
        },
        short: 'Initia',
        searchableText: 'initia initiation-2 initia testnet',
      },
    ];

    return {
      mainnet: fallbackMainnet,
      testnet: fallbackTestnet,
      all: [...fallbackMainnet, ...fallbackTestnet],
    };
  }
}

/**
 * Filters chains based on search input - searches by chain name, chain ID, and description
 * @param {Array} chains - Array of chain objects
 * @param {string} input - Search input
 * @returns {Array} - Filtered chains
 */
function filterChains(chains, input) {
  if (!input || input.trim() === '') {
    return chains;
  }

  const searchTerm = input.toLowerCase().trim();
  return chains.filter((chain) => {
    const chainId = chain.value.chainId.toLowerCase();
    const chainName = chain.value.chainName.toLowerCase();
    const prettyName = chain.value.prettyName.toLowerCase();
    const description = chain.value.description.toLowerCase();
    const displayName = chain.name.toLowerCase();

    // Search across multiple fields for better matching
    return (
      chainId.includes(searchTerm) ||
      chainName.includes(searchTerm) ||
      prettyName.includes(searchTerm) ||
      description.includes(searchTerm) ||
      displayName.includes(searchTerm) ||
      chain.searchableText.includes(searchTerm)
    );
  });
}

/**
 * Converts a string to kebab-case
 * @param {string} str - Input string
 * @returns {string} - kebab-case string
 */
function kebabCase(str) {
  if (!str || typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Converts a string to PascalCase
 * @param {string} str - Input string
 * @returns {string} - PascalCase string
 */
function pascalCase(str) {
  if (!str || typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Converts a string to camelCase
 * @param {string} str - Input string
 * @returns {string} - camelCase string
 */
function camelCase(str) {
  if (!str || typeof str !== 'string') return '';

  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Determines if a file should be processed for template placeholders
 * @param {string} filePath - Path to the file
 * @param {string} fileName - Name of the file
 * @returns {boolean} - Whether the file should be processed
 */
function shouldProcessFile(filePath, fileName) {
  // Skip binary files based on extension
  const ext = path.extname(fileName).toLowerCase();
  if (BINARY_EXTENSIONS.includes(ext)) {
    return false;
  }

  // Skip files that are likely binary based on name patterns
  const binaryPatterns = [/\.(lock|log)$/i, /^\.DS_Store$/i, /^Thumbs\.db$/i, /\.(tmp|temp)$/i];

  if (binaryPatterns.some((pattern) => pattern.test(fileName))) {
    return false;
  }

  return true;
}

/**
 * Determines if a directory should be processed
 * @param {string} dirName - Name of the directory
 * @returns {boolean} - Whether the directory should be processed
 */
function shouldProcessDirectory(dirName) {
  // Skip specific directories
  if (SKIP_DIRECTORIES.includes(dirName)) {
    return false;
  }

  // Skip hidden directories (starting with .)
  if (dirName.startsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Creates template replacements object
 * @param {string} projectName - Original project name
 * @param {string|Object} networkOrChainData - Network configuration (testnet/mainnet) or chain data object
 * @returns {Object} - Replacements object
 */
function createReplacements(projectName, networkOrChainData = 'testnet') {
  const cleanName = projectName.replace(/^@[^/]+\//, ''); // Remove scope from scoped packages

  // Handle both old string format and new chain data object format
  let networkConfig, networkConfigImport, chainId, chainName, prettyName, isCustomChain;

  if (typeof networkOrChainData === 'object' && networkOrChainData !== null) {
    // New format: chain data object
    const chainData = networkOrChainData;
    chainId = chainData.chainId || 'unknown';
    chainName = chainData.chainName || 'initia';
    prettyName = chainData.prettyName || 'Initia';
    isCustomChain = Boolean(chainData.customChain);

    // Handle custom chain configuration
    if (chainData.customChain) {
      const customChain = chainData.customChain;
      // For custom chains, we don't import TESTNET/MAINNET, and we create custom config
      networkConfigImport = '';
      networkConfig = `{
  defaultChainId: "${chainData.chainId}",
  customChain: ${JSON.stringify(customChain, null, 2)}
}`;
    } else {
      // Standard chain from registry
      const configType = chainData.networkType === 'mainnet' ? 'MAINNET' : 'TESTNET';
      networkConfigImport = configType;
      networkConfig = `{...${configType}}`;
    }
  } else {
    // Legacy format: string (testnet/mainnet)
    const network = networkOrChainData;
    const configType = network === 'mainnet' ? 'MAINNET' : 'TESTNET';
    networkConfigImport = configType;
    networkConfig = `{...${configType}}`;
    chainId = network === 'mainnet' ? 'interwoven-1' : 'initiation-2';
    chainName = 'initia';
    prettyName = 'Initia';
    isCustomChain = false;
  }

  return {
    PROJECT_NAME: projectName,
    PROJECT_NAME_KEBAB: kebabCase(cleanName),
    PROJECT_NAME_CAMEL: camelCase(cleanName),
    PROJECT_NAME_PASCAL: pascalCase(cleanName),
    PROJECT_NAME_CLEAN: cleanName,
    NETWORK_CONFIG: networkConfig,
    NETWORK_CONFIG_IMPORT: networkConfigImport,
    CHAIN_ID: chainId,
    CHAIN_NAME: chainName,
    CHAIN_PRETTY_NAME: prettyName,
    IS_CUSTOM_CHAIN: isCustomChain ? 'true' : 'false',
  };
}

/**
 * Delays execution for a specified number of milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely executes an async function with error handling
 * @param {Function} fn - Async function to execute
 * @param {string} context - Context for error reporting
 * @returns {Promise<[Error|null, any]>} - Tuple of [error, result]
 */
async function safeAsync(fn, context = 'operation') {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    error.context = context;
    return [error, null];
  }
}

export {
  fetchJson,
  fetchAllChains,
  filterChains,
  kebabCase,
  pascalCase,
  camelCase,
  shouldProcessFile,
  shouldProcessDirectory,
  createReplacements,
  delay,
  safeAsync,
};
