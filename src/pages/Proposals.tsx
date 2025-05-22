import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { DAOContractService, Proposal } from '../contracts/DAOContract';
import { Plus, CheckCircle, XCircle, Clock, ArrowUpRight, Loader2 } from 'lucide-react';

const Proposals: React.FC = () => {
  const { provider, account } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const fetchProposals = async () => {
      if (provider && account) {
        setLoading(true);
        const daoService = new DAOContractService(provider);
        const allProposals = await daoService.getAllProposals(account);
        setProposals(allProposals);
        setLoading(false);
      }
    };

    fetchProposals();
  }, [provider, account]);

  const filteredProposals = () => {
    switch (filter) {
      case 'active':
        return proposals.filter(p => p.isActive);
      case 'completed':
        return proposals.filter(p => p.executed);
      default:
        return proposals;
    }
  };

  const getStatusBadge = (proposal: Proposal) => {
    if (proposal.executed) {
      return proposal.passed ? (
        <span className="badge badge-success flex items-center gap-1">
          <CheckCircle size={12} /> Passed
        </span>
      ) : (
        <span className="badge badge-error flex items-center gap-1">
          <XCircle size={12} /> Rejected
        </span>
      );
    } else if (proposal.isActive) {
      return (
        <span className="badge badge-secondary flex items-center gap-1">
          <Clock size={12} /> Active
        </span>
      );
    } else {
      return (
        <span className="badge badge-outline flex items-center gap-1">
          <Clock size={12} /> Pending
        </span>
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground mt-2">
            View and vote on community moderation proposals
          </p>
        </div>
        <Link to="/create" className="btn btn-primary btn-md md:btn-lg inline-flex items-center gap-2">
          <Plus size={18} />
          New Proposal
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'active' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'completed' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            Completed
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredProposals().length} proposals
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Loading...</span>
        </div>
      ) : filteredProposals().length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-subtle">
          <h3 className="text-lg font-medium mb-2">No proposals found</h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'active' 
              ? "There are no active proposals at the moment."
              : filter === 'completed' 
                ? "No proposals have been completed yet."
                : "Be the first to create a proposal for the community."}
          </p>
          <Link to="/create" className="btn btn-primary btn-md inline-flex items-center gap-2">
            <Plus size={16} />
            Create Proposal
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProposals().map((proposal) => (
            <Link
              key={proposal.id}
              to={`/proposals/${proposal.id}`}
              className="card hover:shadow-md transition-all duration-300 group no-underline text-foreground"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {proposal.description.length > 50
                        ? `${proposal.description.substring(0, 50)}...`
                        : proposal.description}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Proposal #{proposal.id} • Created by {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(proposal)}
                    <ArrowUpRight 
                      size={16} 
                      className="text-muted-foreground group-hover:text-primary transition-colors" 
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">For</p>
                      <p className="font-semibold">{proposal.forVotes} votes</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Against</p>
                      <p className="font-semibold">{proposal.againstVotes} votes</p>
                    </div>
                  </div>
                  <div className="sm:ml-auto flex items-center gap-4">
                    {proposal.hasVoted && (
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        You voted
                      </span>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Ends</p>
                      <p className="font-medium">{formatDate(proposal.endTime)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Proposals;