import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { DAOContractService, Proposal } from '../contracts/DAOContract';
import { CheckCircle, XCircle, ArrowUpRight, Loader2 } from 'lucide-react';

const Results: React.FC = () => {
  const { provider, account } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'rejected'>('all');

  useEffect(() => {
    const fetchProposals = async () => {
      if (provider && account) {
        setLoading(true);
        const daoService = new DAOContractService(provider);
        const allProposals = await daoService.getAllProposals(account);
        // Only include executed proposals
        setProposals(allProposals.filter(p => p.executed));
        setLoading(false);
      }
    };

    fetchProposals();
  }, [provider, account]);

  const filteredProposals = () => {
    switch (filter) {
      case 'passed':
        return proposals.filter(p => p.passed);
      case 'rejected':
        return proposals.filter(p => !p.passed);
      default:
        return proposals;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Results Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          View the outcome of completed proposals
        </p>
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
            onClick={() => setFilter('passed')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'passed' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            Passed
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'rejected' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            Rejected
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredProposals().length} completed proposals
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Loading...</span>
        </div>
      ) : filteredProposals().length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-subtle">
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'passed' 
              ? "No proposals have passed yet."
              : filter === 'rejected' 
                ? "No proposals have been rejected yet."
                : "There are no completed proposals yet."}
          </p>
          <Link to="/proposals" className="btn btn-primary btn-md">
            View Active Proposals
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
                      Proposal #{proposal.id} • Executed on {formatDate(proposal.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {proposal.passed ? (
                      <span className="badge badge-success flex items-center gap-1">
                        <CheckCircle size={12} /> Passed
                      </span>
                    ) : (
                      <span className="badge badge-error flex items-center gap-1">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                    <ArrowUpRight 
                      size={16} 
                      className="text-muted-foreground group-hover:text-primary transition-colors" 
                    />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-subtle p-3 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium flex items-center gap-1 text-success">
                        <CheckCircle size={14} /> For
                      </span>
                      <span className="text-sm font-medium">{proposal.forVotes} votes</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full" 
                        style={{ 
                          width: `${
                            parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) > 0
                              ? (parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))) * 100
                              : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-subtle p-3 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium flex items-center gap-1 text-error">
                        <XCircle size={14} /> Against
                      </span>
                      <span className="text-sm font-medium">{proposal.againstVotes} votes</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-error h-2 rounded-full" 
                        style={{ 
                          width: `${
                            parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) > 0
                              ? (parseFloat(proposal.againstVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))) * 100
                              : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && proposals.length > 0 && (
        <div className="mt-12 card bg-muted/40">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">DAO Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
              <div className="bg-background p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((proposals.filter(p => p.passed).length / proposals.length) * 100)}%
                </p>
              </div>
              <div className="bg-background p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-success">
                  {proposals.filter(p => p.passed).length}
                </p>
              </div>
              <div className="bg-background p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-error">
                  {proposals.filter(p => !p.passed).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;