import { TestBed } from '@angular/core/testing';
import { ProposalsService } from './proposals.service';

describe('ProposalsService', () => {
  let service: ProposalsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposalsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a proposal with multiple field changes and retrieve it for a specific tree', () => {
    const proposal = service.addProposal(
      'tree_123',
      [
        { field: 'attributes-species', fromValue: 'אורן', toValue: 'אלון' },
        { field: 'attributes-height', fromValue: 5, toValue: 8 }
      ]
    );

    expect(proposal.id).toBeTruthy();
    expect(proposal.treeId).toBe('tree_123');
    expect(proposal.changes.length).toBe(2);
    expect(proposal.createdAt).toBeTruthy();
    expect(proposal.status).toEqual('pending');

    const treeProposals = service.getProposalsForTree('tree_123');
    expect(treeProposals.length).toBe(1);
  });

  it('should allow rejecting a proposal', () => {
    const proposal = service.addProposal(
      'tree_123',
      [{ field: 'attributes-species', fromValue: 'אורן', toValue: 'אלון' }]
    );

    expect(proposal.status).toBe('pending');

    service.rejectProposal(proposal.id);

    const updated = service.getProposalsForTree('tree_123')[0];
    expect(updated.status).toBe('rejected');
  });
});
