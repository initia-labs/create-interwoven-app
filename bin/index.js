#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const inquirer = require('inquirer');

// Register autocomplete prompt plugin
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

// Import our refactored modules
const { validateProjectName, validateTargetDirectory, validateTemplate } = require('../src/validators');
const { TEMPLATE_CONFIG } = require('../src/constants');
const { fetchAllChains, filterChains } = require('../src/utils');
const TemplateProcessor = require('../src/template-processor');
const logger = require('../src/logger');

/**
 * Main CLI application
 */
async function main() {
  // Check if no arguments provided - show interactive flow
  if (!process.argv.slice(2).length) {
    await runInteractiveFlow();
    return;
  }

  logger.welcome();

  program
    .name('create-interwoven-app')
    .description('Create a new Interwoven application with InterwovenKit integration')
    .version('1.0.0')
    .argument('[project-name]', 'name of the project')
    .option('-t, --template <template>', 'template to use', TEMPLATE_CONFIG.defaultTemplate)
    .option('-n, --network <network>', 'network to use (testnet/mainnet)', 'testnet')
    .option('-v, --verbose', 'enable verbose logging', false)
    .action(async (projectName, options) => {
      try {
        // Set verbose mode
        if (options.verbose) {
          logger.verbose = true;
          logger.debug('Verbose mode enabled');
        }

        // Validate network option (keep for backward compatibility)
        if (options.network && !['testnet', 'mainnet'].includes(options.network)) {
          logger.error('Invalid network option. Please use "testnet" or "mainnet".');
          logger.info('For more network options, use the interactive mode by running without arguments.');
          process.exit(1);
        }

        await createInterwovenApp(projectName, options);
      } catch (error) {
        logger.error('Failed to create project:', error.message);
        if (options.verbose && error.stack) {
          logger.debug('Stack trace:', error.stack);
        }
        process.exit(1);
      }
    });

  program.parse(process.argv);
}

/**
 * Prompts user for custom chain configuration
 * @returns {Promise<Object>} Custom chain data object
 */
async function promptCustomChain() {
  logger.info('Configure your custom chain:');
  logger.info('This information will be used to create the InterwovenKit provider configuration.');
  logger.newLine();

  const customChainAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'chainId',
      message: 'Chain ID (e.g., "my-chain-1"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Chain ID is required';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input.trim())) {
          return 'Chain ID can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'chainName',
      message: 'Chain name (e.g., "My Chain"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Chain name is required';
        }
        return true;
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'prettyName',
      message: 'Pretty name (display name, e.g., "My Custom Chain"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Pretty name is required';
        }
        return true;
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'rpcUrl',
      message: 'RPC URL (e.g., "https://rpc.my-chain.com"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'RPC URL is required';
        }
        try {
          new URL(input.trim());
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'restUrl',
      message: 'REST/LCD URL (e.g., "https://rest.my-chain.com"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'REST URL is required';
        }
        try {
          new URL(input.trim());
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'grpcUrl',
      message: 'gRPC URL (e.g., "grpc.my-chain.com:443"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'gRPC URL is required';
        }
        // Basic validation for gRPC endpoint format
        const trimmed = input.trim();
        if (!trimmed.includes(':')) {
          return 'gRPC URL should include port (e.g., "grpc.example.com:443")';
        }
        return true;
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'indexerUrl',
      message: 'Indexer URL (e.g., "https://indexer.my-chain.com"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Indexer URL is required';
        }
        try {
          new URL(input.trim());
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'feeDenom',
      message: 'Fee denomination (e.g., "uinit", "stake"):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Fee denomination is required';
        }
        return true;
      },
      filter: (input) => input.trim()
    },
    {
      type: 'input',
      name: 'gasPrice',
      message: 'Fixed minimum gas price (e.g., "0.015"):',
      validate: (input) => {
        if (!input || input.toString().trim() === '') {
          return 'Gas price is required';
        }
        const inputStr = input.toString().trim();
        const parsed = parseFloat(inputStr);
        if (isNaN(parsed) || parsed < 0) {
          return 'Please enter a valid positive number';
        }
        return true;
      },
      filter: (input) => parseFloat(input.toString().trim())
    },
    {
      type: 'input',
      name: 'bech32Prefix',
      message: 'Bech32 prefix (default: "init"):',
      default: 'init',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Bech32 prefix is required';
        }
        if (!/^[a-z]+$/.test(input.trim())) {
          return 'Bech32 prefix should contain only lowercase letters';
        }
        return true;
      },
      filter: (input) => input.trim()
    },
    {
      type: 'list',
      name: 'networkType',
      message: 'Network type:',
      choices: [
        { name: 'Mainnet', value: 'mainnet' },
        { name: 'Testnet', value: 'testnet' }
      ],
      default: 'testnet'
    }
  ]);

  // Create the custom chain object
  const customChainData = {
    chainId: customChainAnswers.chainId,
    chainName: customChainAnswers.chainName,
    prettyName: customChainAnswers.prettyName,
    networkType: customChainAnswers.networkType,
    network: customChainAnswers.networkType,
    description: `Custom ${customChainAnswers.networkType} chain`,
    customChain: {
      chain_id: customChainAnswers.chainId,
      chain_name: customChainAnswers.chainName,
      apis: {
        rpc: [{ address: customChainAnswers.rpcUrl }],
        rest: [{ address: customChainAnswers.restUrl }],
        grpc: [{ address: customChainAnswers.grpcUrl }],
        indexer: [{ address: customChainAnswers.indexerUrl }]
      },
      fees: {
        fee_tokens: [{
          denom: customChainAnswers.feeDenom,
          fixed_min_gas_price: customChainAnswers.gasPrice
        }]
      },
      bech32_prefix: customChainAnswers.bech32Prefix,
      network_type: customChainAnswers.networkType
    }
  };

  return customChainData;
}

/**
 * Interactive flow when no arguments are provided
 */
async function runInteractiveFlow() {
  try {
    // Show the banner
    logger.banner();

    // Fetch available chains
    logger.info('Fetching available networks...');
    const chainsData = await fetchAllChains();
    
    // Step 1: Get project name
    const projectAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'Project name is required!';
          }
          const nameValidation = validateProjectName(input.trim());
          if (!nameValidation.isValid) {
            return nameValidation.error;
          }
          return true;
        },
        filter: (input) => input.trim()
      }
    ]);

    // Step 2: Choose network type
    const networkTypeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'networkType',
        message: 'Which network type would you like to use?',
        choices: [
          { name: 'Mainnet', value: 'mainnet' },
          { name: 'Testnet', value: 'testnet' },
          { name: 'All', value: 'all' },
          { name: 'Custom Chain', value: 'custom' }
        ],
        default: 'testnet'
      }
    ]);

    // Step 3: Handle chain selection based on network type
    let chainData;

    if (networkTypeAnswer.networkType === 'custom') {
      // Custom chain configuration
      logger.newLine();
      chainData = await promptCustomChain();
      
      logger.newLine();
      logger.info(`Custom chain configured: ${chainData.prettyName} (${chainData.chainId})`);
      logger.info(`Network Type: ${chainData.networkType}`);
      logger.info(`RPC: ${chainData.customChain.apis.rpc[0].address}`);
      logger.info(`REST: ${chainData.customChain.apis.rest[0].address}`);
      logger.info(`gRPC: ${chainData.customChain.apis.grpc[0].address}`);
      logger.info(`Indexer: ${chainData.customChain.apis.indexer[0].address}`);
      logger.newLine();
    } else {
      // Standard chain selection with search
      let availableChains;
      let searchMessage;
      
      switch (networkTypeAnswer.networkType) {
        case 'testnet':
          availableChains = chainsData.testnet;
          searchMessage = 'Search testnet chains by name or chain ID:';
          break;
        case 'mainnet':
          availableChains = chainsData.mainnet;
          searchMessage = 'Search mainnet chains by name or chain ID:';
          break;
        default:
          availableChains = chainsData.all;
          searchMessage = 'Search all chains by name or chain ID:';
      }

      if (availableChains.length === 0) {
        logger.error(`No ${networkTypeAnswer.networkType} chains available. Please try again later.`);
        process.exit(1);
      }

      // Find default chain (prefer initiation-2 for testnet, interwoven-1 for mainnet)
      const defaultChain = availableChains.find(chain => 
        (networkTypeAnswer.networkType === 'testnet' && chain.value.chainId === 'initiation-2') ||
        (networkTypeAnswer.networkType === 'mainnet' && chain.value.chainId === 'interwoven-1')
      ) || availableChains[0];

      const chainAnswer = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'chainData',
          message: searchMessage,
          source: async (answersSoFar, input) => {
            return filterChains(availableChains, input);
          },
          default: defaultChain.value,
          pageSize: 8,
          suggestOnly: false,
          loop: false
        }
      ]);

      chainData = chainAnswer.chainData;

      logger.newLine();
      logger.info(`Selected: ${chainData.prettyName} (${chainData.chainId}) - ${chainData.networkType}`);
      if (chainData.description) {
        logger.info(`Description: ${chainData.description}`);
      }
      logger.newLine();
    }

    // Create the project with selected options
    await createInterwovenApp(projectAnswer.projectName, {
      template: TEMPLATE_CONFIG.defaultTemplate,
      verbose: false,
      chainData: chainData,
      network: chainData.network // Maintain backward compatibility
    });

  } catch (error) {
    logger.error('Interactive flow failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create Interwoven application
 * @param {string} projectName - Project name
 * @param {Object} options - CLI options
 */
async function createInterwovenApp(projectName, options) {
  // Validate project name (should already be validated in interactive flow)
  if (!projectName) {
    logger.error('Please specify a project name:');
    logger.usage();
    process.exit(1);
  }

  const nameValidation = validateProjectName(projectName);
  if (!nameValidation.isValid) {
    logger.validationError(nameValidation, 'Project name validation');
    process.exit(1);
  }

  // Validate template
  const templateValidation = await validateTemplate(
    options.template, 
    TEMPLATE_CONFIG.templatesDir
  );
  if (!templateValidation.isValid) {
    logger.validationError(templateValidation, 'Template validation');
    process.exit(1);
  }

  // Set up target directory
  const targetDir = path.resolve(process.cwd(), projectName);
  
  // Validate target directory
  const dirValidation = await validateTargetDirectory(targetDir);
  if (!dirValidation.isValid) {
    logger.validationError(dirValidation, 'Directory validation');
    process.exit(1);
  }

  // Create project
  logger.info(`Creating a new Interwoven app in ${logger.chalk?.green(targetDir) || targetDir}...`);
  logger.newLine();

  const processor = new TemplateProcessor(options.template);
  await processor.createProject(projectName, targetDir, options.chainData || options.network || 'testnet');

  // Show success message
  logger.successInstructions(projectName, targetDir);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

// Start the CLI
main().catch((error) => {
  logger.error('CLI failed to start:', error.message);
  process.exit(1);
});