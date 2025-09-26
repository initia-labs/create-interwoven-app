# create-interwoven-app

A CLI tool to scaffold new applications with [InterwovenKit](https://docs.initia.xyz/interwovenkit) and Initia Wallet integration

## Usage

### Interactive Mode (recommended)

```bash
npx create-interwoven-app
```

The interactive mode will guide you through:

- Project name selection
- Network type choice (mainnet/testnet/custom)
- Chain selection with searchable autocomplete
- Custom chain configuration (if needed)

### Direct Mode

```bash
npx create-interwoven-app my-interwoven-app
```

### Global Installation

```bash
# With npm
npm install -g create-interwoven-app
create-interwoven-app my-interwoven-app

# With yarn
yarn create interwoven-app my-interwoven-app
```

## What's Included

The generated application includes:

- ⚡ **Next.js 14** with App Router
- 🔗 **InterwovenKit Integration** for wallet connectivity
- 🎨 **Tailwind CSS** for styling
- 📱 **Responsive Design** similar to modern dApp interfaces
- 🔒 **TypeScript** for type safety

## Generated Project Structure

```
my-interwoven-app/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── providers/
│   └── providers.tsx        # InterwovenKit configuration
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

### Quick Start

Get your Interwoven app up and running in four simple steps:

```bash
# Create your project (interactive mode)
npx create-interwoven-app

# Navigate to your project
cd my-interwoven-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Your app will be running at [http://localhost:3000](http://localhost:3000).

### Alternative Quick Start (Direct Mode)

```bash
# Create project directly
npx create-interwoven-app@latest my-app

# Navigate and start
cd my-app
npm install
npm run dev
```

## Chain Selection

The interactive mode provides powerful chain selection features:

- **Network Filtering**: Choose from mainnet, testnet chains
- **Searchable Interface**: Find chains by name or chain ID using autocomplete
- **Custom Chains**: Configure your own chain with custom RPC, REST, gRPC, and indexer endpoints
- **Smart Defaults**: Automatically suggests popular chains like `initiation-2` (testnet) or `interwoven-1` (mainnet)

### Custom Chain Configuration

When selecting "Custom Chain", you'll be prompted for:

- Chain ID and display name
- RPC, REST, gRPC, and indexer URLs
- Fee denomination and gas price
- Bech32 address prefix
- Network type (mainnet/testnet)

## Customization

### Wallet Configuration

Edit `providers/providers.tsx` to:

- Switch between testnet and mainnet
- Add custom chain configurations
- Customize wallet connection options

### Styling

Modify the design by editing:

- `tailwind.config.ts` - Theme and color customization
- `app/globals.css` - Global styles
- Component files - Individual component styling

### Content

Update `app/page.tsx` to:

- Change the main content
- Add new components
- Modify the wallet integration

## Learn More

- [InterwovenKit Documentation](https://docs.initia.xyz/interwovenkit)
- [Initia Docs](https://docs.initia.xyz)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
