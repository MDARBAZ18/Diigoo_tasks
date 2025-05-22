import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { DAOContractService } from '../contracts/DAOContract';
import { Loader2 } from 'lucide-react';

const CreateProposal: React.FC = () => {
  const { provider, account, tokenBalance } = useWallet();
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !account) {
      setError('Wallet is not connected.');
      return;
    }
    
    if (parseFloat(tokenBalance) <= 0) {
      setError('You need governance tokens to create a proposal.');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a valid description.');
      return;
    }
    
    const fullDescription = `
      Content URL: ${contentUrl}
      
      Description: ${description}
      
      Reason for removal: ${reason}
    `;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const daoService = new DAOContractService(provider);
      const proposalId = await daoService.createProposal(fullDescription);
      
      if (proposalId) {
        navigate(`/proposals/${proposalId}`);
      } else {
        setError('Failed to create proposal.');
      }
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.message || 'An error occurred while creating the proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create a Proposal</h1>
        <p className="text-muted-foreground mt-2">
          Submit a proposal for content moderation
        </p>
      </div>

      <div className="card">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content-url" className="block text-sm font-medium mb-1">
                Content URL
              </label>
              <input
                id="content-url"
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                placeholder="https://example.com/content-to-moderate"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                The URL of the content you're proposing to moderate
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background text-foreground min-h-[120px]"
                placeholder="Briefly describe the content that should be moderated"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Keep your description clear and specific
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-1">
                Reason for Moderation
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background text-foreground min-h-[120px]"
                placeholder="Explain why this content should be moderated according to community guidelines"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Reference specific community guidelines if applicable
              </p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/proposals')}
                className="btn btn-ghost"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Proposal'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 card bg-muted/40">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Tips for Creating Effective Proposals</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Be specific about what content should be moderated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Clearly explain how the content violates community guidelines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Avoid personal attacks or biased language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Include evidence if applicable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Remember that all proposal information is public on the blockchain</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;