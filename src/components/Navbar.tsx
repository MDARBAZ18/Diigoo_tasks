import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plus, Vote, LayoutDashboard, FileBarChart2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, account, tokenBalance, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Proposals', href: '/proposals', icon: Vote },
    { name: 'Create Proposal', href: '/create', icon: Plus },
    { name: 'Results', href: '/results', icon: FileBarChart2 },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 no-underline" onClick={closeMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-bold text-lg">Community DAO</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors no-underline ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/80 hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <item.icon size={16} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wallet connection button */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="text-sm rounded-full bg-muted px-3 py-1">
                  <span className="text-muted-foreground">Balance:</span>{' '}
                  <span className="font-semibold">{tokenBalance} GOV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                  <span className="font-medium text-sm">{formatAddress(account!)}</span>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="btn btn-secondary btn-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary btn-md"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/50">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 no-underline ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/80 hover:bg-primary/5 hover:text-primary'
                }`}
                onClick={closeMenu}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="pt-4 pb-3 border-t border-border/50">
          <div className="px-2 space-y-3">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                  <span className="font-medium">{formatAddress(account!)}</span>
                </div>
                <div className="px-3 py-2">
                  <span className="text-muted-foreground">Balance:</span>{' '}
                  <span className="font-semibold">{tokenBalance} GOV</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary/5 hover:text-primary"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  closeMenu();
                }}
                className="block w-full btn btn-primary btn-md"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;