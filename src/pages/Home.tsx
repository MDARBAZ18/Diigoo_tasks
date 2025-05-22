import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { ArrowRight, Shield, Users, Vote, FileBarChart2 } from 'lucide-react';

const Home: React.FC = () => {
  const { isConnected, connectWallet } = useWallet();

  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Community-Driven Moderation
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          A decentralized autonomous organization for fair and transparent community moderation. 
          Propose, vote, and govern together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isConnected ? (
            <button onClick={connectWallet} className="btn btn-primary btn-lg">
              Connect Wallet
            </button>
          ) : (
            <Link to="/proposals" className="btn btn-primary btn-lg">
              View Proposals
            </Link>
          )}
          <Link to={isConnected ? "/create" : "/"} 
            className={`btn btn-secondary btn-lg ${!isConnected ? 'pointer-events-none opacity-50' : ''}`}
            onClick={(e) => !isConnected && (e.preventDefault() || connectWallet())}>
            Create Proposal
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-6 hover:shadow-md transition-shadow duration-300">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Propose</h3>
            <p className="text-muted-foreground mb-4">
              Create new proposals for content moderation. Specify what content should be removed and why.
            </p>
            <Link to={isConnected ? "/create" : "/"} 
              className="group inline-flex items-center text-primary font-medium no-underline"
              onClick={(e) => !isConnected && (e.preventDefault() || connectWallet())}>
              Create a proposal
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="card p-6 hover:shadow-md transition-shadow duration-300">
            <div className="mb-4 bg-secondary/10 p-3 rounded-full w-fit">
              <Vote className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Vote</h3>
            <p className="text-muted-foreground mb-4">
              Use your governance tokens to vote on active proposals. Each token represents one vote.
            </p>
            <Link to={isConnected ? "/proposals" : "/"} 
              className="group inline-flex items-center text-primary font-medium no-underline"
              onClick={(e) => !isConnected && (e.preventDefault() || connectWallet())}>
              View active proposals
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="card p-6 hover:shadow-md transition-shadow duration-300">
            <div className="mb-4 bg-accent/10 p-3 rounded-full w-fit">
              <FileBarChart2 className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Execute</h3>
            <p className="text-muted-foreground mb-4">
              After voting period ends, proposals with sufficient votes are automatically executed.
            </p>
            <Link to={isConnected ? "/results" : "/"} 
              className="group inline-flex items-center text-primary font-medium no-underline"
              onClick={(e) => !isConnected && (e.preventDefault() || connectWallet())}>
              View results
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Community in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-6">
              <p className="text-4xl font-bold text-primary mb-2">150+</p>
              <p className="text-muted-foreground">Active Members</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-primary mb-2">50+</p>
              <p className="text-muted-foreground">Proposals Created</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-primary mb-2">500+</p>
              <p className="text-muted-foreground">Votes Cast</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-primary mb-2">95%</p>
              <p className="text-muted-foreground">Community Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl my-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Join the DAO?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your wallet to start participating in governance. Create proposals, cast your votes, 
            and help shape the future of our community.
          </p>
          {!isConnected ? (
            <button onClick={connectWallet} className="btn btn-primary btn-lg">
              Connect Wallet to Start
            </button>
          ) : (
            <Link to="/proposals" className="btn btn-primary btn-lg">
              View Current Proposals
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;