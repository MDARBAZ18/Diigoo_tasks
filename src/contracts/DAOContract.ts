import { ethers } from 'ethers';

// DAO Contract ABI
const daoABI = [
  // View functions
  'function getProposal(uint256 proposalId) view returns (address creator, string description, uint256 forVotes, uint256 againstVotes, uint256 startTime, uint256 endTime, bool executed, bool passed)',
  'function getProposalCount() view returns (uint256)',
  'function hasVoted(uint256 proposalId, address voter) view returns (bool)',
  'function quorum() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  
  // State changing functions
  'function createProposal(string memory description) returns (uint256)',
  'function castVote(uint256 proposalId, bool support)',
  'function executeProposal(uint256 proposalId)',
  
  // Events
  'event ProposalCreated(uint256 proposalId, address creator, string description, uint256 startTime, uint256 endTime)',
  'event VoteCast(address voter, uint256 proposalId, bool support, uint256 weight)',
  'event ProposalExecuted(uint256 proposalId, bool passed)'
];

// Contract address - update with your deployed contract address
const DAO_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with your DAO contract address

// Proposal type
export interface Proposal {
  id: number;
  creator: string;
  description: string;
  forVotes: string;
  againstVotes: string;
  startTime: Date;
  endTime: Date;
  executed: boolean;
  passed: boolean;
  hasVoted: boolean;
  isActive: boolean;
}

// Class to interact with the DAO contract
export class DAOContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor(provider: ethers.providers.Web3Provider | null) {
    if (provider) {
      this.provider = provider;
      this.signer = provider.getSigner();
      this.contract = new ethers.Contract(DAO_CONTRACT_ADDRESS, daoABI, this.signer);
    }
  }

  // Get a proposal by ID
  async getProposal(id: number, account: string | null): Promise<Proposal | null> {
    if (!this.contract || !this.provider) return null;
    
    try {
      const proposal = await this.contract.getProposal(id);
      let hasVoted = false;
      
      if (account) {
        hasVoted = await this.contract.hasVoted(id, account);
      }
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = parseInt(proposal.startTime.toString());
      const endTime = parseInt(proposal.endTime.toString());
      
      return {
        id,
        creator: proposal.creator,
        description: proposal.description,
        forVotes: ethers.utils.formatEther(proposal.forVotes),
        againstVotes: ethers.utils.formatEther(proposal.againstVotes),
        startTime: new Date(startTime * 1000),
        endTime: new Date(endTime * 1000),
        executed: proposal.executed,
        passed: proposal.passed,
        hasVoted,
        isActive: now >= startTime && now <= endTime && !proposal.executed
      };
    } catch (error) {
      console.error("Error getting proposal:", error);
      return null;
    }
  }

  // Get all proposals
  async getAllProposals(account: string | null): Promise<Proposal[]> {
    if (!this.contract || !this.provider) return [];
    
    try {
      const count = await this.contract.getProposalCount();
      const proposals: Proposal[] = [];
      
      for (let i = 1; i <= count.toNumber(); i++) {
        const proposal = await this.getProposal(i, account);
        if (proposal) {
          proposals.push(proposal);
        }
      }
      
      return proposals;
    } catch (error) {
      console.error("Error getting all proposals:", error);
      return [];
    }
  }

  // Create a new proposal
  async createProposal(description: string): Promise<number | null> {
    if (!this.contract || !this.signer) return null;
    
    try {
      const tx = await this.contract.createProposal(description);
      const receipt = await tx.wait();
      
      // Find the ProposalCreated event in the transaction logs
      const event = receipt.events?.find(
        (event: any) => event.event === 'ProposalCreated'
      );
      
      if (event && event.args) {
        return event.args.proposalId.toNumber();
      }
      
      return null;
    } catch (error) {
      console.error("Error creating proposal:", error);
      return null;
    }
  }

  // Cast a vote on a proposal
  async castVote(proposalId: number, support: boolean): Promise<boolean> {
    if (!this.contract || !this.signer) return false;
    
    try {
      const tx = await this.contract.castVote(proposalId, support);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error casting vote:", error);
      return false;
    }
  }

  // Execute a proposal
  async executeProposal(proposalId: number): Promise<boolean> {
    if (!this.contract || !this.signer) return false;
    
    try {
      const tx = await this.contract.executeProposal(proposalId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error executing proposal:", error);
      return false;
    }
  }
}