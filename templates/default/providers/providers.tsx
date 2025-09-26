"use client"

import { PropsWithChildren, useEffect } from "react"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { 
  initiaPrivyWalletConnector, 
  injectStyles, 
  InterwovenKitProvider
} from "@initia/interwovenkit-react"
import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js"

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
})

const queryClient = new QueryClient()

// InterwovenKit configuration
const interwovenKitConfig = {
  defaultChainId: "initiation-2",
  customChain: {
    "chain_id": "initiation-2",
    "chain_name": "initiation",
    "apis": {
      "rpc": [
        {
          "address": "https://rpc.initiation-2.initia.xyz"
        }
      ],
      "rest": [
        {
          "address": "https://lcd.initiation-2.initia.xyz"
        }
      ],
      "grpc": [
        {
          "address": "grpc.initiation-2.initia.xyz:443"
        }
      ],
      "indexer": [
        {
          "address": "https://api.initiation-2.initia.xyz"
        }
      ]
    },
    "fees": {
      "fee_tokens": [
        {
          "denom": "uinit",
          "fixed_min_gas_price": 0.15
        }
      ]
    },
    "bech32_prefix": "init",
    "network_type": "testnet"
  }
}

export default function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    // Inject styles into the shadow DOM used by Initia Wallet
    injectStyles(InterwovenKitStyles)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider {...interwovenKitConfig}>
          {children}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
