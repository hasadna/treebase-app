export interface FieldChange {
  field: string;
  fromValue: any;
  toValue: any;
}

export interface TreeProposal {
  id?: string;
  treeId: string;
  changes: FieldChange[];
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | string;
  proposer?: string | null;
  approver?: string | null;
  submittedBy?: string;
  submittedByEmail?: string | null;
  updatedAt?: any;
}
