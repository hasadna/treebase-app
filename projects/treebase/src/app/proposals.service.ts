import { Injectable } from '@angular/core';

export interface FieldChange {
  field: string;
  fromValue: any;
  toValue: any;
}

export interface TreeProposal {
  id: string;
  treeId: string;
  changes: FieldChange[];
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposer?: string | null;
  approver?: string | null;
}

const PROPOSALS_STORAGE_KEY = 'treebase_proposals';

@Injectable({
  providedIn: 'root'
})
export class ProposalsService {
  private proposals: TreeProposal[] = [];

  constructor() {
    this.loadProposals();
  }

  private loadProposals(): void {
    try {
      const data = localStorage.getItem(PROPOSALS_STORAGE_KEY);
      if (data) {
        this.proposals = JSON.parse(data);
      } else {
        this.proposals = [];
      }
    } catch (e) {
      console.error('Error loading proposals from localStorage:', e);
      this.proposals = [];
    }
  }

  private saveProposals(): void {
    try {
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(this.proposals));
    } catch (e) {
      console.error('Error saving proposals to localStorage:', e);
    }
  }

  getAllProposals(): TreeProposal[] {
    return [...this.proposals];
  }

  getProposalsForTree(treeId: string): TreeProposal[] {
    if (!treeId) return [];
    return this.proposals.filter(p => String(p.treeId) === String(treeId));
  }

  addProposal(
    treeId: string,
    changes: FieldChange[],
    proposer: string | null = null,
    approver: string | null = null
  ): TreeProposal {
    const newProposal: TreeProposal = {
      id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      treeId,
      changes,
      createdAt: new Date().toISOString(),
      status: 'pending',
      proposer: proposer || null,
      approver: approver || null
    };

    this.proposals.push(newProposal);
    this.saveProposals();
    return newProposal;
  }

  rejectProposal(proposalId: string, approver: string | null = null): void {
    this.updateProposalStatus(proposalId, 'rejected', approver);
  }

  acceptProposal(proposalId: string, approver: string | null = null): void {
    this.updateProposalStatus(proposalId, 'accepted', approver);
  }

  updateProposalStatus(
    proposalId: string,
    status: 'pending' | 'accepted' | 'rejected',
    approver: string | null = null
  ): void {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (proposal) {
      proposal.status = status;
      if (approver) {
        proposal.approver = approver;
      }
      this.saveProposals();
    }
  }

  clearProposals(): void {
    this.proposals = [];
    this.saveProposals();
  }
}
