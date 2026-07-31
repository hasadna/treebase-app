import { TestBed } from '@angular/core';
import { ProposalsService } from './proposals.service';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { User } from 'firebase/auth';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let mockUser$: BehaviorSubject<User | null>;

  beforeEach(() => {
    mockUser$ = new BehaviorSubject<User | null>({ displayName: 'Jane Doe', email: 'jane@example.com' } as User);

    const mockAuthService = {
      user$: mockUser$,
      currentUser: { displayName: 'Jane Doe', email: 'jane@example.com' } as User,
      ensureAuthenticated: () => of({ uid: 'user_123', email: 'jane@example.com' } as User)
    };

    TestBed.configureTestingModule({
      providers: [
        ProposalsService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
    service = TestBed.inject(ProposalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a proposal and retrieve it for a specific tree', () => {
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
    expect(proposal.status).toEqual('accepted');

    const treeProposals = service.getProposalsForTree('tree_123');
    expect(treeProposals.length).toBe(1);
  });
});
