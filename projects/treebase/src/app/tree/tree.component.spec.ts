import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeComponent } from './tree.component';
import { ProposalsService } from '../proposals.service';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('TreeComponent', () => {
  let component: TreeComponent;
  let fixture: ComponentFixture<TreeComponent>;
  let proposalsService: ProposalsService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FormsModule, MatTooltipModule],
      declarations: [TreeComponent],
      providers: [ProposalsService]
    }).compileComponents();

    fixture = TestBed.createComponent(TreeComponent);
    component = fixture.componentInstance;
    proposalsService = TestBed.inject(ProposalsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect unconfirmed state and allow tree confirmation', () => {
    component.tree = { 'meta-tree-id': 'tree_999', certainty: false };
    expect(component.isConfirmed).toBeFalse();

    component.confirmTree();

    expect(component.isConfirmed).toBeTrue();
    expect(component.proposals.length).toBe(1);
    expect(component.proposals[0].changes[0].field).toBe('certainty');
  });

  it('should allow accepting and rejecting proposals', () => {
    component.tree = { 'meta-tree-id': 'tree_999' };
    const prop1 = proposalsService.addProposal('tree_999', [{ field: 'attributes-height', fromValue: 5, toValue: 10 }]);
    const prop2 = proposalsService.addProposal('tree_999', [{ field: 'attributes-species', fromValue: 'אורן', toValue: 'אלון' }]);

    component.loadProposals();

    component.acceptProposal(prop1.id);
    expect(component.proposals.find(p => p.id === prop1.id)?.status).toBe('accepted');

    component.rejectProposal(prop2.id);
    expect(component.proposals.find(p => p.id === prop2.id)?.status).toBe('rejected');
  });

  it('should toggle overlay display', () => {
    expect(component.showOverlay).toBeTrue();
    component.toggleOverlay();
    expect(component.showOverlay).toBeFalse();
  });
});
