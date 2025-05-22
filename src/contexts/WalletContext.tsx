import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Types
interface WalletContextType {
  account: string | null;
  balance: string;
  tokenBalance: string;
  provider: ethers.providers.Web3Provider | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Create Context
const WalletContext = createContext<WalletContextType>({
  account: null,
  balance: '0',
  tokenBalance: '0',
  provider: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

// ABI for the ERC20 token
const tokenABI = [
  // ERC20 standard functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint amount)'
];

// Contract addresses - update with your deployed contract addresses
const TOKEN_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with your token address

export const WalletProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  // Check if MetaMask is installed
  const checkIfMetaMaskIsInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  };

  // Initialize provider when component mounts
  useEffect(() => {
    if (checkIfMetaMaskIsInstalled()) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
      
      // Check if already connected
      const checkConnection = async () => {
        try {
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateBalances(accounts[0], ethProvider);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      };
      
      checkConnection();
    }
  }, []);

  // Update ETH and token balances
  const updateBalances = async (address: string, provider: ethers.providers.Web3Provider) => {
    try {
      // Get ETH balance
      const ethBalance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(ethBalance));
      
      // Get token balance
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI, provider);
      const tokenBalanceRaw = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      setTokenBalance(ethers.utils.formatUnits(tokenBalanceRaw, decimals));
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!checkIfMetaMaskIsInstalled()) {
      window.alert('Please install MetaMask to use this dApp');
      return;
    }
    
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await ethProvider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setProvider(ethProvider);
        updateBalances(accounts[0], ethProvider);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setTokenBalance('0');
  };

  // Listen for account changes
  useEffect(() => {
    if (checkIfMetaMaskIsInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (provider) {
            updateBalances(accounts[0], provider);
          }
        } else {
          setAccount(null);
          setBalance('0');
          setTokenBalance('0');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [provider]);

  const value = {
    account,
    balance,
    tokenBalance,
    provider,
    isConnected: !!account,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);