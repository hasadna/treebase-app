import { ComponentFixture, TestBed } from '@angular/core';
import { TreeComponent } from './tree.component';
import { ProposalsService } from '../proposals/proposals.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { User } from 'firebase/auth';

describe('TreeComponent', () => {
  let component: TreeComponent;
  let fixture: ComponentFixture<TreeComponent>;
  let proposalsService: ProposalsService;
  let mockUser$: BehaviorSubject<User | null>;

  beforeEach(async () => {
    mockUser$ = new BehaviorSubject<User | null>({ displayName: 'Jane Doe', email: 'jane@example.com' } as User);

    const mockAuthService = {
      user$: mockUser$,
      currentUser: { displayName: 'Jane Doe', email: 'jane@example.com' } as User
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatTooltipModule],
      declarations: [TreeComponent],
      providers: [
        ProposalsService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TreeComponent);
    component = fixture.componentInstance;
    proposalsService = TestBed.inject(ProposalsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require authentication to propose changes', () => {
    expect(component.isAuthenticated).toBeTrue();
    expect(component.proposerFullName).toBe('Jane Doe');

    mockUser$.next(null);
    expect(component.isAuthenticated).toBeFalse();
    expect(component.proposerFullName).toBe('');
  });

  it('should return static and dynamic field options via getFieldOptions', () => {
    const envOptions = component.getFieldOptions('environment-type');
    expect(envOptions).toBeTruthy();
    expect(envOptions).toContain('רחוב');

    component.muniOptions = ['תל אביב - יפו', 'חיפה'];
    const muniOptions = component.getFieldOptions('muni_name');
    expect(muniOptions).toEqual(['תל אביב - יפו', 'חיפה']);

    expect(component.getFieldOptions('attributes-height')).toBeNull();
  });

  it('should populate full Edit form and submit modified fields as a single proposal', () => {
    component.tree = { 'meta-tree-id': 'tree_999', 'muni_name': 'תל אביב', 'location-x': 34.78, 'location-y': 32.08 };
    component.loadProposals();

    expect(component.showEditModal).toBeFalse();
    component.openEditModal();
    expect(component.showEditModal).toBeTrue();
    expect(component.editFormValues['muni_name']).toBe('תל אביב');
    expect(component.hasFormChanges()).toBeFalse();

    // Modify a field in the form
    component.editFormValues['muni_name'] = 'רמת גן';
    expect(component.hasFormChanges()).toBeTrue();

    component.submitEditForm();
    expect(component.showEditModal).toBeFalse();
    expect(component.getFieldValue('muni_name')).toBe('רמת גן');
  });

  it('should group and sort images in galleryDateGroups by date (newest first) and attribute', () => {
    component.tree = { 'meta-tree-id': 'tree_999' };
    component.processedData = [
      {
        'meta-date': '2023-05-10',
        'meta-source': 'sourceA',
        'photos-leaf': 'https://example.com/leaf1.jpg'
      },
      {
        'meta-date': '2026-07-30',
        'meta-source': 'sourceB',
        'photos-bark': 'https://example.com/bark1.jpg'
      }
    ];

    proposalsService.addProposal('tree_999', [
      { field: 'photos-leaf', fromValue: '', toValue: 'https://example.com/leaf2.jpg' }
    ]);
    component.loadProposals();

    const groups = component.galleryDateGroups;
    expect(groups.length).toBeGreaterThan(0);

    // Newest date first
    expect(groups[0].dateStr).toBe(new Date().toISOString().split('T')[0]);

    // Check secondary grouping by attribute
    const leafGroup = groups.flatMap(g => g.attributeGroups).find(ag => ag.fieldKey === 'photos-leaf');
    expect(leafGroup).toBeTruthy();
  });

  it('should toggle tree confirmation via confirmTree and unconfirmTree', () => {
    component.tree = { 'meta-tree-id': 'tree_999', certainty: false };
    expect(component.isConfirmed).toBeFalse();

    component.confirmTree();
    expect(component.isConfirmed).toBeTrue();

    component.unconfirmTree();
    expect(component.isConfirmed).toBeFalse();
  });

  it('should reflect latest proposed value per field and fallback to original data', () => {
    component.tree = { 'meta-tree-id': 'tree_999', 'muni_name': 'תל אביב' };
    component.loadProposals();
    expect(component.getFieldValue('muni_name')).toBe('תל אביב');

    proposalsService.addProposal('tree_999', [{ field: 'muni_name', fromValue: 'תל אביב', toValue: 'רמת גן' }]);
    component.loadProposals();

    expect(component.getFieldValue('muni_name')).toBe('רמת גן');
  });

  it('should identify photo fields and image URLs', () => {
    expect(component.checkIsPhotoField('photos-bark')).toBeTrue();
    expect(component.checkIsPhotoField('photos-leaf')).toBeTrue();
    expect(component.checkIsPhotoField('muni_name')).toBeFalse();

    expect(component.isImageUrl('https://example.com/tree.jpg')).toBeTrue();
    expect(component.isImageUrl('data:image/png;base64,iVBORw0KGgo=')).toBeTrue();
    expect(component.isImageUrl('תל אביב')).toBeFalse();
  });

  it('should display original date when no proposals exist, and update latestUpdateDate via NOP touchTreeDate', () => {
    component.tree = { 'meta-tree-id': 'tree_999' };
    component.sources = [{ name: 'source1', date: '2022-01-01' }];
    component.loadProposals();

    expect(component.latestUpdateDate).toBe('2022-01-01');

    component.touchTreeDate();
    expect(component.proposals.length).toBe(1);
    expect(component.latestUpdateDate).not.toBe('2022-01-01');
  });

  it('should filter proposals by field and proposer in history modal', () => {
    component.tree = { 'meta-tree-id': 'tree_999' };
    const p1 = proposalsService.addProposal('tree_999', [{ field: 'attributes-height', fromValue: 5, toValue: 10 }], 'Alice');
    const p2 = proposalsService.addProposal('tree_999', [{ field: 'attributes-species-clean-he', fromValue: 'אורן', toValue: 'אלון' }], 'Bob');
    
    component.loadProposals();

    expect(component.proposals.length).toBe(2);

    // Filter by proposer
    component.resetHistoryFilters();
    component.filterProposer = 'Bob';
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].id).toBe(p2.id);

    // Filter by field
    component.resetHistoryFilters();
    component.filterField = 'attributes-height';
    expect(component.filteredProposals.length).toBe(1);
    expect(component.filteredProposals[0].id).toBe(p1.id);
  });

  it('should open and close history modal', () => {
    expect(component.showHistoryModal).toBeFalse();
    component.openHistoryModal();
    expect(component.showHistoryModal).toBeTrue();
    component.closeHistoryModal();
    expect(component.showHistoryModal).toBeFalse();
  });
});
