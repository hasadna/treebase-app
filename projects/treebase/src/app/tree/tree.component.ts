import { Component, ViewChild, ElementRef, OnInit, Optional } from '@angular/core';
import { taxonomy, TaxonomyItem } from "../taxonomy";
import { State } from '../states/base-state';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProposalsService, TreeProposal, FieldChange } from '../proposals/proposals.service';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api.service';
import { User } from 'firebase/auth';

const MAPS_API_KEY = 'AIzaSyAW0_GwE7WPDox5RZnUMkESHGiSe5siWdQ';

export interface GalleryImageItem {
  url: any;
  rawUrl: string;
  fieldKey: string;
  fieldTitle: string;
  dateStr: string;
  displayDate: string;
  source?: string;
}

export interface GalleryAttributeGroup {
  fieldKey: string;
  fieldTitle: string;
  images: GalleryImageItem[];
}

export interface GalleryDateGroup {
  dateStr: string;
  displayDate: string;
  attributeGroups: GalleryAttributeGroup[];
}

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent implements OnInit {

  tree: any = null;
  treeExtra: any = {};
  sources: any[] = [];
  streetView: SafeUrl;
  extraItems: any[] = [];
  processedData: any[] = [];

  userState: User | null = null;

  // Proposals & Edits state
  proposals: TreeProposal[] = [];
  showEditModal: boolean = false;
  showHistoryModal: boolean = false;
  showCameraModal: boolean = false;
  mediaStream: MediaStream | null = null;

  // Full Edit Form State
  editFormValues: { [key: string]: any } = {};
  initialEditFormValues: { [key: string]: any } = {};
  activePhotoFieldKey: string = '';
  focusedFieldKey: string = '';
  taxonomyFields: TaxonomyItem[] = taxonomy;

  // Dynamic Options (Municipalities & Species)
  muniOptions: string[] = [];
  speciesOptions: string[] = [];

  // Gallery state
  galleryDateGroups: GalleryDateGroup[] = [];
  selectedGalleryImage: GalleryImageItem | null = null;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  // History Modal Filters
  filterField: string = '';
  filterProposer: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    public proposalsService: ProposalsService,
    public authService: AuthService,
    @Optional() private apiService?: ApiService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.userState = user;
    });
    this.proposalsService.proposalsUpdated$.subscribe(() => {
      this.loadProposals();
    });
    this.loadDynamicOptions();
  }

  loadDynamicOptions(): void {
    if (!this.apiService) return;

    this.apiService.query('SELECT DISTINCT muni_name FROM munis WHERE muni_name IS NOT NULL ORDER BY muni_name', 'muni-list').subscribe((rows: any[]) => {
      if (rows && Array.isArray(rows)) {
        this.muniOptions = rows.map(r => r.muni_name).filter(Boolean);
      }
    });

    this.apiService.query('SELECT "attributes-species-clean-he" AS species_he FROM trees_compact WHERE "attributes-species-clean-he" IS NOT NULL GROUP BY 1 ORDER BY 1', 'species-list').subscribe((rows: any[]) => {
      if (rows && Array.isArray(rows)) {
        this.speciesOptions = rows.map(r => r.species_he).filter(Boolean);
      }
    });
  }

  get currentUser(): User | null {
    return this.authService.currentUser || this.userState;
  }

  get isAuthenticated(): boolean {
    const user = this.currentUser;
    return !!user && !user.isAnonymous;
  }

  get proposerFullName(): string {
    const user = this.currentUser;
    if (!user || user.isAnonymous) return '';
    return user.displayName || user.email || 'משתמש מחובר';
  }

  set state(state: State | null) {
    if (state === null) {
      this.tree = null;
      this.sources = [];
      this.proposals = [];
      this.galleryDateGroups = [];
      return;
    }
    if (state.data[0] === this.processedData) {
      return;
    }
    this.processedData = state.data[0];
    this.sources = [];
    this.tree = {};
    this.treeExtra = {};
    for (const row of state.data[0]) {
      if (row['meta-source'] && row['meta-date'] && row['meta-source-type'] && row['meta-collection-type']) {
        this.sources.push({
          name: row['meta-source'],
          date: row['meta-date'],
          type: row['meta-source-type'],
          collectionType: row['meta-collection-type'],
        });
      }
      for (const key of Object.keys(row)) {
        this.tree[key] = this.tree[key] || row[key];
        if (!!row[key]) {
          this.treeExtra[key] = this.treeExtra[key] || [];
          let found = false;
          let values = [row[key]];
          if (values[0]?.indexOf && values[0].indexOf('http') === 0) {
            values = values[0].split(' ');
          }
          for (const value of values) {
            for (const item of this.treeExtra[key]) {
              if (item.value === value) {
                found = true;
                item['source'] = item['source'] + ', ' + row['meta-source'];
                break;
              }
            }
            if (!found) {
              this.treeExtra[key].push({
                source: row['meta-source'],
                value
              });
            }
          }
        }
      }
    }
    this.sources = this.sources.sort((a, b) => a.date.localeCompare(b.date));
    this.streetView = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps/embed/v1/streetview?location=${this.tree["location-y"]},${this.tree["location-x"]}&key=${MAPS_API_KEY}`);

    this.loadProposals();

    this.extraItems = [];
    for (const item of taxonomy) {
      if (!!this.tree[item.name] || this.getLatestChangeForField(item.name) !== undefined) {
        const rec = Object.assign({values: this.treeExtra[item.name] || []}, item);
        if (rec.type === 'string' && rec.values[0] && rec.values[0].value && rec.values[0].value.indexOf('http') === 0) {
          rec.type = 'photo';
          rec.values = rec.values.map((v: any) => {
            return {
              source: v.source,
              value: this.sanitizer.bypassSecurityTrustResourceUrl(v.value)
            };
          });
        }
        this.extraItems.push(rec);
      }
    }
  }

  loadProposals() {
    const treeId = this.currentTreeId;
    if (treeId) {
      this.proposals = this.proposalsService.getProposalsForTree(treeId);
    } else {
      this.proposals = [];
    }
    this.updateGalleryDateGroups();
  }

  get currentTreeId(): string {
    if (!this.tree) return '';
    return this.tree['meta-tree-id'] || this.tree['tree-id'] || this.tree['id'] || '';
  }

  get latestUpdateDate(): string {
    if (this.proposals && this.proposals.length > 0) {
      return this.proposals[this.proposals.length - 1].createdAt;
    }
    if (this.sources && this.sources.length > 0) {
      return this.sources[this.sources.length - 1].date;
    }
    if (this.tree && this.tree['meta-date']) {
      return this.tree['meta-date'];
    }
    return '';
  }

  private isTrue(val: any): boolean {
    if (val === true || val === 1) return true;
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      return s === 'true' || s === '1' || s === 't' || s === 'y' || s === 'yes' || s === 'כן' || s === 'מזוהה' || s === 'certain';
    }
    return false;
  }

  get isConfirmed(): boolean {
    if (!this.tree || !this.currentTreeId) return false;

    // 1. Check if user proposal for certainty exists
    const hasProp = this.getLatestChangeForField('certainty') !== undefined || 
                    this.getLatestChangeForField('attributes-certainty') !== undefined;
    if (hasProp) {
      return this.isTrue(this.getFieldValue('certainty')) || this.isTrue(this.getFieldValue('attributes-certainty'));
    }

    // 2. Check explicit dataset certainty fields
    if (this.isTrue(this.tree['certainty']) ||
        this.isTrue(this.tree['attributes-certainty']) ||
        this.isTrue(this.tree['certain']) ||
        this.isTrue(this.tree['attributes-certain']) ||
        this.isTrue(this.tree['status'])) {
      return true;
    }

    // 3. Check ground survey collection types (meta-collection-type containing 'סקר')
    const collectionType = String(this.tree['meta-collection-type'] || '');
    if (collectionType.includes('סקר')) {
      return true;
    }

    return false;
  }

  updateGalleryDateGroups(): void {
    const rawItems: GalleryImageItem[] = [];

    // A) From original dataset rows
    if (this.processedData && Array.isArray(this.processedData)) {
      for (const row of this.processedData) {
        const rawDate = row['meta-date'] || '';
        let dateStr = '0000-00-00';
        let displayDate = 'תאריך לא ידוע';
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
              displayDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            } else {
              dateStr = String(rawDate).split('T')[0];
              displayDate = dateStr;
            }
          } catch (e) {
            dateStr = String(rawDate);
            displayDate = dateStr;
          }
        }

        for (const key of Object.keys(row)) {
          const val = row[key];
          if (!val) continue;
          let isPhoto = this.checkIsPhotoField(key);
          if (isPhoto) {
            let urls = [val];
            if (typeof val === 'string' && val.indexOf('http') === 0) {
              urls = val.split(' ');
            }
            for (const urlStr of urls) {
              if (this.isImageUrl(urlStr)) {
                rawItems.push({
                  url: urlStr,
                  rawUrl: urlStr,
                  fieldKey: key,
                  fieldTitle: this.getFieldTitle(key),
                  dateStr,
                  displayDate,
                  source: row['meta-source'] || 'מקור נתונים'
                });
              }
            }
          }
        }
      }
    }

    // B) From proposals
    for (const p of this.proposals) {
      const rawDate = p.createdAt || '';
      let dateStr = '0000-00-00';
      let displayDate = 'תאריך לא ידוע';
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toISOString().split('T')[0];
            displayDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          } else {
            dateStr = String(rawDate).split('T')[0];
            displayDate = dateStr;
          }
        } catch (e) {
          dateStr = String(rawDate);
          displayDate = dateStr;
        }
      }

      for (const c of p.changes) {
        if (this.checkIsPhotoField(c.field) || this.isImageUrl(c.toValue)) {
          if (this.isImageUrl(c.toValue)) {
            rawItems.push({
              url: c.toValue,
              rawUrl: c.toValue,
              fieldKey: c.field,
              fieldTitle: this.getFieldTitle(c.field),
              dateStr,
              displayDate,
              source: p.proposer ? `מגיש: ${p.proposer}` : 'עדכון'
            });
          }
        }
      }
    }

    // Deduplicate by URL + fieldKey + dateStr
    const uniqueMap = new Map<string, GalleryImageItem>();
    for (const item of rawItems) {
      const uKey = `${item.dateStr}_${item.fieldKey}_${item.rawUrl}`;
      if (!uniqueMap.has(uKey)) {
        uniqueMap.set(uKey, item);
      }
    }

    // Grouping by Date (Newest to Oldest)
    const dateMap = new Map<string, { displayDate: string, items: GalleryImageItem[] }>();
    for (const item of uniqueMap.values()) {
      if (!dateMap.has(item.dateStr)) {
        dateMap.set(item.dateStr, { displayDate: item.displayDate, items: [] });
      }
      dateMap.get(item.dateStr)!.items.push(item);
    }

    // Sort Date keys descending (newest first)
    const sortedDateKeys = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    const result: GalleryDateGroup[] = [];

    for (const dKey of sortedDateKeys) {
      const dVal = dateMap.get(dKey)!;
      // Secondary Grouping / Sorting by Attribute (fieldTitle)
      const attrMap = new Map<string, GalleryAttributeGroup>();
      for (const img of dVal.items) {
        if (!attrMap.has(img.fieldKey)) {
          attrMap.set(img.fieldKey, {
            fieldKey: img.fieldKey,
            fieldTitle: img.fieldTitle,
            images: []
          });
        }
        attrMap.get(img.fieldKey)!.images.push(img);
      }

      // Sort attributes by title alphabetically
      const sortedAttrGroups = Array.from(attrMap.values()).sort((a, b) => a.fieldTitle.localeCompare(b.fieldTitle, 'he'));

      result.push({
        dateStr: dKey,
        displayDate: dVal.displayDate,
        attributeGroups: sortedAttrGroups
      });
    }

    this.galleryDateGroups = result;
  }

  trackByDateGroup(index: number, group: GalleryDateGroup): string {
    return group.dateStr;
  }

  trackByAttrGroup(index: number, attrGroup: GalleryAttributeGroup): string {
    return attrGroup.fieldKey;
  }

  trackByImage(index: number, img: GalleryImageItem): string {
    return img.rawUrl;
  }

  openGalleryLightbox(img: GalleryImageItem) {
    this.selectedGalleryImage = img;
  }

  closeGalleryLightbox() {
    this.selectedGalleryImage = null;
  }

  confirmTree() {
    const treeId = this.currentTreeId;
    if (!treeId || !this.isAuthenticated) return;
    this.proposalsService.addProposal(
      treeId,
      [{ field: 'certainty', fromValue: false, toValue: true }],
      this.proposerFullName
    );
    this.loadProposals();
  }

  unconfirmTree() {
    const treeId = this.currentTreeId;
    if (!treeId || !this.isAuthenticated) return;
    this.proposalsService.addProposal(
      treeId,
      [{ field: 'certainty', fromValue: true, toValue: false }],
      this.proposerFullName
    );
    this.loadProposals();
  }

  touchTreeDate() {
    const treeId = this.currentTreeId;
    if (!treeId || !this.isAuthenticated) return;
    this.proposalsService.addProposal(
      treeId,
      [{ field: 'touch', fromValue: '-', toValue: 'עדכון תאריך' }],
      this.proposerFullName
    );
    this.loadProposals();
  }

  // --- Full Edit Form Modal Methods ---

  openEditModal(focusFieldKey: string = '') {
    if (!this.isAuthenticated) return;

    this.editFormValues = {};
    this.initialEditFormValues = {};

    const x = this.getFieldValue('location-x');
    const y = this.getFieldValue('location-y');
    this.editFormValues['location-x'] = x !== undefined && x !== null ? String(x) : '';
    this.editFormValues['location-y'] = y !== undefined && y !== null ? String(y) : '';
    this.initialEditFormValues['location-x'] = this.editFormValues['location-x'];
    this.initialEditFormValues['location-y'] = this.editFormValues['location-y'];

    for (const field of taxonomy) {
      const val = this.getFieldValue(field.name);
      this.editFormValues[field.name] = val !== undefined && val !== null ? val : '';
      this.initialEditFormValues[field.name] = this.editFormValues[field.name];
    }

    this.focusedFieldKey = focusFieldKey;
    this.showEditModal = true;

    if (focusFieldKey) {
      setTimeout(() => {
        const el = document.getElementById('edit-field-' + focusFieldKey);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 150);
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editFormValues = {};
    this.initialEditFormValues = {};
    this.activePhotoFieldKey = '';
    this.focusedFieldKey = '';
    this.closeCamera();
  }

  hasFormChanges(): boolean {
    if (String(this.editFormValues['location-x'] ?? '').trim() !== String(this.initialEditFormValues['location-x'] ?? '').trim()) return true;
    if (String(this.editFormValues['location-y'] ?? '').trim() !== String(this.initialEditFormValues['location-y'] ?? '').trim()) return true;

    for (const field of taxonomy) {
      const key = field.name;
      const cur = String(this.editFormValues[key] ?? '').trim();
      const init = String(this.initialEditFormValues[key] ?? '').trim();
      if (cur !== init) return true;
    }

    return false;
  }

  submitEditForm() {
    const treeId = this.currentTreeId;
    if (!this.hasFormChanges() || !this.tree || !treeId || !this.isAuthenticated) return;

    const changes: FieldChange[] = [];

    const initX = String(this.initialEditFormValues['location-x'] ?? '').trim();
    const curX = String(this.editFormValues['location-x'] ?? '').trim();
    if (curX !== initX) {
      changes.push({
        field: 'location-x',
        fromValue: this.initialEditFormValues['location-x'],
        toValue: curX ? Number(curX) : ''
      });
    }

    const initY = String(this.initialEditFormValues['location-y'] ?? '').trim();
    const curY = String(this.editFormValues['location-y'] ?? '').trim();
    if (curY !== initY) {
      changes.push({
        field: 'location-y',
        fromValue: this.initialEditFormValues['location-y'],
        toValue: curY ? Number(curY) : ''
      });
    }

    for (const field of taxonomy) {
      const key = field.name;
      const initVal = String(this.initialEditFormValues[key] ?? '').trim();
      const curVal = String(this.editFormValues[key] ?? '').trim();
      if (curVal !== initVal) {
        changes.push({
          field: key,
          fromValue: this.initialEditFormValues[key],
          toValue: this.editFormValues[key]
        });
      }
    }

    if (changes.length > 0) {
      this.proposalsService.addProposal(
        treeId,
        changes,
        this.proposerFullName
      );
    }

    this.closeEditModal();
    this.loadProposals();
  }

  onPhotoSelectedForField(event: any, fieldKey: string) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editFormValues[fieldKey] = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async openCameraForField(fieldKey: string) {
    if (!this.isAuthenticated) return;
    this.activePhotoFieldKey = fieldKey;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.showCameraModal = true;
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        setTimeout(() => {
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.srcObject = this.mediaStream;
          }
        }, 100);
        return;
      } catch (err) {
        console.warn('Camera stream error, falling back to file input:', err);
        this.closeCamera();
      }
    }
  }

  capturePhotoForActiveField() {
    if (!this.videoElement || !this.videoElement.nativeElement || !this.isAuthenticated || !this.activePhotoFieldKey) return;
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.editFormValues[this.activePhotoFieldKey] = canvas.toDataURL('image/jpeg', 0.85);
    }
    this.closeCamera();
  }

  closeCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.showCameraModal = false;
    this.activePhotoFieldKey = '';
  }

  openHistoryModal() {
    this.showHistoryModal = true;
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
  }

  resetHistoryFilters() {
    this.filterField = '';
    this.filterProposer = '';
  }

  get proposalFieldOptions(): { key: string, title: string }[] {
    const fieldsSet = new Set<string>();
    for (const p of this.proposals) {
      for (const c of p.changes) {
        fieldsSet.add(c.field);
      }
    }
    return Array.from(fieldsSet).map(key => ({ key, title: this.getFieldTitle(key) }));
  }

  get filteredProposals(): TreeProposal[] {
    return this.proposals.filter(p => {
      if (this.filterField && !p.changes.some(c => c.field === this.filterField)) {
        return false;
      }
      if (this.filterProposer.trim() && (!p.proposer || !p.proposer.toLowerCase().includes(this.filterProposer.trim().toLowerCase()))) {
        return false;
      }
      return true;
    });
  }

  getLatestChangeForField(fieldKey: string): FieldChange | undefined {
    for (let i = this.proposals.length - 1; i >= 0; i--) {
      const change = this.proposals[i].changes.find(c => c.field === fieldKey);
      if (change) return change;
    }
    return undefined;
  }

  getFieldTitle(fieldKey: string): string {
    if (fieldKey === 'touch' || fieldKey === 'nop') return 'עדכון תאריך בלבד';
    if (fieldKey === 'certainty') return 'אישור וודאות עץ';
    if (fieldKey === 'attributes-species-clean-he' || fieldKey === 'attributes-species') return 'מין העץ';
    if (fieldKey === 'muni_name') return 'רשות מקומית';
    if (fieldKey === 'road_name') return 'רחוב';
    if (fieldKey === 'cad_code') return 'גוש/חלקה';
    if (fieldKey === 'location-x') return 'קו אורך (location-x)';
    if (fieldKey === 'location-y') return 'קו רוחב (location-y)';
    if (fieldKey === 'location-coords') return 'נ.צ (קואורדינטות)';
    const item = taxonomy.find(t => t.name === fieldKey);
    return item ? item.title : fieldKey;
  }

  getFieldOptions(fieldKey: string): string[] | null {
    if (fieldKey === 'muni_name' || fieldKey === 'location-city') {
      return this.muniOptions.length > 0 ? this.muniOptions : null;
    }
    if (fieldKey === 'attributes-species-clean-he' || fieldKey === 'attributes-species') {
      return this.speciesOptions.length > 0 ? this.speciesOptions : null;
    }
    const item = taxonomy.find(t => t.name === fieldKey);
    if (item && item.options && item.options.length > 0) {
      return item.options;
    }
    return null;
  }

  getFieldValue(fieldKey: string): any {
    if (!this.tree) return '';
    const latestChange = this.getLatestChangeForField(fieldKey);
    if (latestChange !== undefined) {
      return latestChange.toValue;
    }
    if (fieldKey === 'attributes-species-clean-he') {
      const altChange = this.getLatestChangeForField('attributes-species');
      if (altChange !== undefined) return altChange.toValue;
    }
    if (fieldKey === 'attributes-species') {
      const altChange = this.getLatestChangeForField('attributes-species-clean-he');
      if (altChange !== undefined) return altChange.toValue;
    }
    if (this.tree[fieldKey] !== undefined && this.tree[fieldKey] !== null && this.tree[fieldKey] !== '') {
      return this.tree[fieldKey];
    }
    if (fieldKey === 'certainty') {
      return this.tree['certainty'] ?? false;
    }
    return '';
  }

  checkIsPhotoField(fieldKey: string): boolean {
    if (!fieldKey) return false;
    if (fieldKey.startsWith('photos-') || fieldKey.startsWith('photo-')) return true;
    const field = taxonomy.find(t => t.name === fieldKey);
    return field ? field.type === 'photo' : false;
  }

  isImageUrl(val: any): boolean {
    if (!val) return false;
    const str = String(val);
    return str.indexOf('http') === 0 || str.indexOf('data:image') === 0 || str.indexOf('blob:') === 0;
  }

  toNumber(val: any, digits: number = 0): string {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return num.toFixed(digits);
  }

  toBoolean(val: any): string {
    if (val === undefined || val === null || val === '') return '';
    const b = Boolean(val);
    return b ? 'כן' : 'לא';
  }
}
