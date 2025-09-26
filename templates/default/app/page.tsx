"use client"

import { useState, useEffect } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { truncate } from "@initia/utils"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"

export default function HomePage() {
  const { address, openConnect, openWallet, openBridge, requestTxBlock } = useInterwovenKit()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [toastMessage, setToastMessage] = useState<string>("")
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const showErrorToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 4000) // Disappear after 4 seconds
  }

  const handleCopyAll = async () => {
    if (mounted && navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText('npx create-interwoven-app\ncd my-app\nnpm install\nnpm run dev')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        // Silent fail for clipboard copy
      }
    }
  }

  const handleSendToSelf = async () => {
    if (!address) return

    setIsSendingTx(true)
    try {
      // Create a send transaction to self for 1 INIT (1000000 uinit)
      const messages = [{
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: MsgSend.fromPartial({
          fromAddress: address,
          toAddress: address,
          amount: [{ amount: "1000000", denom: "uinit" }], // 1 INIT
        }),
      }]

      const { transactionHash } = await requestTxBlock({ messages })
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "Transaction failed. Please try again.")
    } finally {
      setIsSendingTx(false)
    }
  }

  const handleOpenBridge = async () => {
    try {
      openBridge()
    } catch (error) {
      showErrorToast("Failed to open bridge. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/initia_logo.png"
                alt="Initia"
                className="h-8 w-auto"
              />
            </div>
            <div>
              {!address ? (
                <button
                  onClick={() => openConnect()}
                  className="px-4 py-1.5 bg-white text-black font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <a
                    href="https://v1.app.testnet.initia.xyz/faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white text-black text-sm rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                  >
                    Faucet
                  </a>
                  <button
                    onClick={handleSendToSelf}
                    disabled={isSendingTx}
                    className="px-3 py-1.5 bg-gray-200 text-black text-sm rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingTx ? "Sending..." : "Send 1 INIT"}
                  </button>
                  <button
                    onClick={handleOpenBridge}
                    className="px-3 py-1.5 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                  >
                    Bridge
                  </button>
                  <button
                    onClick={openWallet}
                    className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    {truncate(address)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            InterwovenKit
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Everything you need to build Interwoven apps
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition-colors duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Documentation</h3>
                <p className="text-gray-400 mb-4">
                  Comprehensive guides and API references to help you build with InterwovenKit and the Initia ecosystem.
                </p>
                <a
                  href="https://docs.initia.xyz/interwovenkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 font-medium inline-flex items-center gap-2 transition-colors duration-200"
                >
                  Explore documentation
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition-colors duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">GitHub Examples</h3>
                <p className="text-gray-400 mb-4">
                  Browse through example repositories and starter templates to accelerate your development process.
                </p>
                <a
                  href="https://github.com/initia-labs/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 font-medium inline-flex items-center gap-2 transition-colors duration-200"
                >
                  View examples
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Quick Start</h2>
          <p className="text-gray-400 mb-6">Get your Interwoven app up and running in four simple steps:</p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="ml-2">Terminal</span>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-all bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-2 rounded text-xs font-medium flex items-center gap-2"
                onClick={handleCopyAll}
                disabled={!mounted}
                suppressHydrationWarning
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-gray-300 space-y-2">
              <div><span className="text-blue-400">$</span> npx create-interwoven-app</div>
              <div className="text-gray-500"># Create a new Interwoven app</div>
              <div className="mt-3"><span className="text-blue-400">$</span> cd my-app</div>
              <div className="text-gray-500"># Navigate to your project</div>
              <div className="mt-3"><span className="text-blue-400">$</span> npm install</div>
              <div className="text-gray-500"># Install dependencies</div>
              <div className="mt-3"><span className="text-blue-400">$</span> npm run dev</div>
              <div className="text-gray-500"># Start the development server</div>
            </div>
          </div>
          <p className="text-gray-400 mt-6 text-sm">
            Your app will be running at <code className="bg-gray-800 px-2 py-1 rounded">http://localhost:3000</code>
          </p>
        </div>
      </main>

      {/* Error Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{toastMessage}</p>
              <button
                onClick={() => setShowToast(false)}
                className="ml-auto text-white hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
