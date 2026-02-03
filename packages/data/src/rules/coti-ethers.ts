export const cotiEthers = [
  {
    title: "Coti Ethers Web3modal Cursor Rules",
    tags:["coti-ethers", "web3modal", "blockchain", "smart-contracts", "onboarding", "typescript", "wallet-connection"],
    libs: ["coti-ethers", "web3modal/react"],
    slug: "coti-ethers-web3modal-cursor-rules",
    content: `
    # COTI-Ethers: Onboarding & Smart Contract Integration Guide
    
    This rule provides essential context and best practices for building applications on the COTI blockchain using the \`coti-ethers\` library. It is intended for developers who want to onboard users and interact with smart contracts in a secure, user-friendly way.
    
    ## What is coti-ethers?
    
    \`coti-ethers\` is a TypeScript/JavaScript library that enables seamless integration with the COTI blockchain in web applications. It provides wallet connection, transaction management, and smart contract interaction capabilities tailored for COTI's network, abstracting away low-level blockchain details.
    
    ## What does onboarding mean?
    
    Onboarding in the COTI context refers to securely connecting a user's wallet, generating or recovering their AES key (for encrypted operations), and preparing the user for blockchain interactions. This process ensures the user is authenticated and ready to send transactions or interact with smart contracts on COTI.
    
    ## Key Concepts
    - **Wallet Connection:** Use coti-ethers to connect user wallets via browser providers (e.g., MetaMask, WalletConnect) and manage session state.
    - **AES Key Management:** Onboarding includes generating or recovering an AES key for the user, which is required for secure operations on COTI.
    - **Smart Contract Integration:** Interact with COTI smart contracts using the abstractions provided by coti-ethers, including contract instantiation, method calls, and event listening.
    - **Network Handling:** Ensure the user is connected to the correct COTI network (e.g., Testnet, Mainnet) and handle network switching gracefully.
    
    ## Example: User Onboarding Flow
    Reference: @App.tsx
    \`\`\`tsx
    import { useState } from 'react';
    import { useWeb3ModalProvider } from '@web3modal/ethers/react';
    import { BrowserProvider } from '@coti-io/coti-ethers';
    
    function App() {
      const [aesKey, setAesKey] = useState('');
      const [txPending, setTxPending] = useState(false);
      const { walletProvider } = useWeb3ModalProvider();
    
      async function onboard() {
        if (!walletProvider) throw Error('Wallet provider is undefined');
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        setTxPending(true);
        await signer.generateOrRecoverAes();
        const key = signer.getUserOnboardInfo();
        setAesKey(key?.aesKey!);
        setTxPending(false);
      }
    
      return (
        <div>
          <w3m-button />
          <button onClick={onboard}>Onboard</button>
          <h3>AES KEY: {aesKey}</h3>
          {txPending && <p>Tx pending...</p>}
        </div>
      );
    }
    \`\`\`
    
    ## Example: Smart Contract Integration
    Reference: @coti-web3modal.ts
    \`\`\`ts
    import { BrowserProvider, Contract } from '@coti-io/coti-ethers';
    
    export class CotiContractManager {
      private contract: Contract;
      private signer: any;
    
      constructor(address: string, abi: any, provider: BrowserProvider) {
        this.contract = new Contract(address, abi, provider);
      }
    
      async initialize() {
        this.signer = await this.contract.provider.getSigner();
        this.contract = this.contract.connect(this.signer);
      }
    
      async transfer(to: string, amount: string) {
        const gasEstimate = await this.contract.transfer.estimateGas(to, amount);
        const gasLimit = Math.floor(gasEstimate.toNumber() * 1.2);
        return this.contract.transfer(to, amount, { gasLimit });
      }
    }
    \`\`\`
    
    ## Best Practices
    - Always validate wallet connection and network before any operation.
    - Handle errors and loading states for all blockchain interactions.
    - Never expose private keys or sensitive data in the frontend.
    - Use TypeScript for type safety and maintainability.
    - Store sensitive onboarding data (like AES keys) securely.
    
    ## File Structure Reference
    - Main onboarding logic: @App.tsx
    - Contract integration patterns: @coti-web3modal.ts
    
    ## Summary
    Use \`coti-ethers\` to provide a secure, robust onboarding experience and seamless smart contract integration for your COTI-based applications. Follow the examples and best practices above to ensure a smooth user experience and reliable blockchain operations.
    `,
    author: {
    name: "Upendra Singh",
    url: "https://x.com/upendra_veer",
    avatar:
      "https://avatars.githubusercontent.com/u/102982552?v=4",
    },
  }
]
