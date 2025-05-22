import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { DAOContractService, Proposal } from '../contracts/DAOContract';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

const ProposalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { provider, account } = useWallet();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchProposal = async () => {
      if (provider && account && id) {
        try {
          setLoading(true);
          const daoService = new DAOContractService(provider);
          const proposalData = await daoService.getProposal(parseInt(id), account);
          setProposal(proposalData);
        } catch (err) {
          console.error('Error fetching proposal:', err);
          setError('Failed to load proposal details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProposal();
  }, [provider, account, id]);

  // Update time left
  useEffect(() => {
    if (!proposal) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const endTime = proposal.endTime;
      
      if (now > endTime) {
        setTimeLeft('Voting has ended');
        return;
      }
      
      const diff = endTime.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes}m remaining`);
      }
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, [proposal]);

  const handleVote = async (support: boolean) => {
    if (!provider || !account || !proposal) return;
    
    try {
      setVoting(true);
      setError('');
      
      const daoService = new DAOContractService(provider);
      const success = await daoService.castVote(proposal.id, support);
      
      if (success) {
        // Refresh proposal data
        const updatedProposal = await daoService.getProposal(proposal.id, account);
        setProposal(updatedProposal);
      } else {
        setError('Failed to cast vote');
      }
    } catch (err: any) {
      console.error('Error casting vote:', err);
      setError(err.message || 'An error occurred while voting');
    } finally {
      setVoting(false);
    }
  };

  const handleExecute = async () => {
    if (!provider || !account || !proposal) return;
    
    try {
      setExecuting(true);
      setError('');
      
      const daoService = new DAOContractService(provider);
      const success = await daoService.executeProposal(proposal.id);
      
      if (success) {
        // Refresh proposal data
        const updatedProposal = await daoService.getProposal(proposal.id, account);
        setProposal(updatedProposal);
      } else {
        setError('Failed to execute proposal');
      }
    } catch (err: any) {
      console.error('Error executing proposal:', err);
      setError(err.message || 'An error occurred while executing the proposal');
    } finally {
      setExecuting(false);
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

  const getStatusBadge = () => {
    if (!proposal) return null;
    
    if (proposal.executed) {
      return proposal.passed ? (
        <span className="badge badge-success flex items-center gap-1">
          <CheckCircle size={14} /> Passed
        </span>
      ) : (
        <span className="badge badge-error flex items-center gap-1">
          <XCircle size={14} /> Rejected
        </span>
      );
    } else if (proposal.isActive) {
      return (
        <span className="badge badge-secondary flex items-center gap-1">
          <Clock size={14} /> Active
        </span>
      );
    } else {
      return (
        <span className="badge badge-outline flex items-center gap-1">
          <Clock size={14} /> Pending
        </span>
      );
    }
  };

  const parseProposalContent = (description: string) => {
    const contentUrlMatch = description.match(/Content URL: (.+?)(?=\n\s*\n|$)/s);
    const descriptionMatch = description.match(/Description: (.+?)(?=\n\s*\n|$)/s);
    const reasonMatch = description.match(/Reason for removal: (.+?)(?=\n\s*\n|$)/s);
    
    return {
      contentUrl: contentUrlMatch ? contentUrlMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : description,
      reason: reasonMatch ? reasonMatch[1].trim() : '',
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Proposal Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The proposal you're looking for doesn't exist or you may not have permission to view it.
        </p>
        <button 
          onClick={() => navigate('/proposals')}
          className="btn btn-primary btn-md inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Proposals
        </button>
      </div>
    );
  }

  const { contentUrl, description, reason } = parseProposalContent(proposal.description);

  return (
    <div className="animate-in">
      <button 
        onClick={() => navigate('/proposals')}
        className="btn btn-ghost btn-sm mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft size={16} />
        Back to proposals
      </button>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold">Proposal #{proposal.id}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">
            Created by {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)} • {formatDate(proposal.startTime)}
          </p>
        </div>
        {proposal.isActive && (
          <div className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium">
            {timeLeft}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>
              
              {contentUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Content URL</h3>
                  <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="break-all">
                    {contentUrl}
                  </a>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="whitespace-pre-line">{description}</p>
              </div>
              
              {reason && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Reason for removal</h3>
                  <p className="whitespace-pre-line">{reason}</p>
                </div>
              )}
            </div>
          </div>

          {proposal.isActive && !proposal.hasVoted && (
            <div className="card border-primary/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
                <p className="text-muted-foreground mb-6">
                  Vote on whether this content should be moderated according to the proposal.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleVote(true)}
                    className="btn btn-success flex-1 flex items-center justify-center gap-2"
                    disabled={voting}
                  >
                    {voting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp size={18} />
                    )}
                    Vote For
                  </button>
                  
                  <button
                    onClick={() => handleVote(false)}
                    className="btn btn-error flex-1 flex items-center justify-center gap-2"
                    disabled={voting}
                  >
                    {voting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsDown size={18} />
                    )}
                    Vote Against
                  </button>
                </div>
                
                {error && (
                  <div className="mt-4 bg-error/10 border border-error/20 text-error p-3 rounded-md flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {proposal.hasVoted && (
            <div className="card bg-subtle">
              <div className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle size={18} />
                  <h3 className="font-medium">You've already voted on this proposal</h3>
                </div>
                <p className="text-muted-foreground mt-2">
                  Your vote has been recorded on the blockchain and cannot be changed.
                </p>
              </div>
            </div>
          )}
          
          {!proposal.isActive && !proposal.executed && (
            <div className="card border-primary/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Execute Proposal</h2>
                <p className="text-muted-foreground mb-6">
                  The voting period has ended. The proposal can now be executed.
                </p>
                
                <button
                  onClick={handleExecute}
                  className="btn btn-primary w-full"
                  disabled={executing}
                >
                  {executing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Executing...
                    </>
                  ) : (
                    'Execute Proposal'
                  )}
                </button>
                
                {error && (
                  <div className="mt-4 bg-error/10 border border-error/20 text-error p-3 rounded-md flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card bg-subtle">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Voting Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">For</span>
                    <span className="text-sm font-medium">{proposal.forVotes} votes</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-success h-2.5 rounded-full" 
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
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Against</span>
                    <span className="text-sm font-medium">{proposal.againstVotes} votes</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-error h-2.5 rounded-full" 
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
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Start time</span>
                  <span className="text-sm font-medium">{formatDate(proposal.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">End time</span>
                  <span className="text-sm font-medium">{formatDate(proposal.endTime)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-muted/40">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">How Voting Works</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Each governance token equals one vote</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Votes are recorded on the blockchain and cannot be changed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Proposals require a quorum to pass</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>After voting ends, the proposal can be executed if passed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;