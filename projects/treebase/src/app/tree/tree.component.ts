import { Component } from '@angular/core';
import { taxonomy } from "../taxonomy";
import { State } from '../states/base-state';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProposalsService, TreeProposal, FieldChange } from '../proposals.service';

const MAPS_API_KEY = 'AIzaSyAW0_GwE7WPDox5RZnUMkESHGiSe5siWdQ';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.less']
})
export class TreeComponent {

  tree: any = null;
  treeExtra: any = {};
  sources: any[] = [];
  streetView: SafeUrl;
  extraItems: any[] = [];
  processedData: any[] = [];

  // Proposals & Overlay state
  proposals: TreeProposal[] = [];
  showOverlay: boolean = true;
  showProposalModal: boolean = false;
  selectedFieldKey: string = '';
  selectedFieldTitle: string = '';
  currentFieldValue: any = '';
  proposedFieldValue: string = '';
  taxonomyFields = taxonomy;

  constructor(
    private sanitizer: DomSanitizer,
    public proposalsService: ProposalsService
  ) {}

  set state(state: State | null) {
    if (state === null) {
      this.tree = null;
      this.sources = [];
      this.proposals = [];
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
    this.extraItems = [];
    for (const item of taxonomy) {
      if (!!this.tree[item.name]) {
        const rec = Object.assign({values: this.treeExtra[item.name]}, item);
        if (rec.type === 'string' && rec.values[0].value.indexOf('http') === 0) {
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
    
    this.loadProposals();
  }

  loadProposals() {
    if (this.tree && this.tree['meta-tree-id']) {
      this.proposals = this.proposalsService.getProposalsForTree(this.tree['meta-tree-id']);
    } else {
      this.proposals = [];
    }
  }

  get isConfirmed(): boolean {
    if (!this.tree || !this.tree['meta-tree-id']) return false;
    if (Boolean(this.tree['certainty']) === true) return true;
    return this.proposals.some(p => p.status !== 'rejected' && p.changes.some(c => (c.field === 'certainty' || c.field === 'attributes-certainty') && Boolean(c.toValue) === true));
  }

  confirmTree() {
    if (!this.tree || !this.tree['meta-tree-id']) return;
    this.proposalsService.addProposal(
      this.tree['meta-tree-id'],
      [{ field: 'certainty', fromValue: Boolean(this.tree['certainty']), toValue: true }]
    );
    this.loadProposals();
  }

  acceptProposal(proposalId: string) {
    this.proposalsService.acceptProposal(proposalId);
    this.loadProposals();
  }

  rejectProposal(proposalId: string) {
    this.proposalsService.rejectProposal(proposalId);
    this.loadProposals();
  }

  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }

  getLatestChangeForField(fieldKey: string): FieldChange | undefined {
    for (let i = this.proposals.length - 1; i >= 0; i--) {
      if (this.proposals[i].status === 'rejected') continue;
      const change = this.proposals[i].changes.find(c => c.field === fieldKey);
      if (change) return change;
    }
    return undefined;
  }

  getFieldTitle(fieldKey: string): string {
    if (fieldKey === 'certainty') return 'אישור וודאות עץ';
    if (fieldKey === 'muni_name' || fieldKey === 'location-city') return 'רשות מקומית / שם יישוב';
    if (fieldKey === 'road_name' || fieldKey === 'location-street') return 'רחוב';
    if (fieldKey === 'cad_code' || fieldKey === 'location-block') return 'גוש/חלקה';
    const item = taxonomy.find(t => t.name === fieldKey);
    return item ? item.title : fieldKey;
  }

  getFieldValue(fieldKey: string): any {
    if (!this.tree) return '';
    if (this.tree[fieldKey] !== undefined && this.tree[fieldKey] !== null && this.tree[fieldKey] !== '') {
      return this.tree[fieldKey];
    }
    if (fieldKey === 'attributes-species' && (this.tree['attributes-species-clean-he'] || this.tree['attributes-species'])) {
      return this.tree['attributes-species-clean-he'] || this.tree['attributes-species'];
    }
    if ((fieldKey === 'location-city' || fieldKey === 'muni_name') && (this.tree['location-city'] || this.tree['muni_name'])) {
      return this.tree['location-city'] || this.tree['muni_name'];
    }
    if ((fieldKey === 'location-street' || fieldKey === 'road_name') && (this.tree['location-street'] || this.tree['road_name'])) {
      return this.tree['location-street'] || this.tree['road_name'];
    }
    if ((fieldKey === 'location-block' || fieldKey === 'cad_code') && (this.tree['location-block'] || this.tree['cad_code'])) {
      return this.tree['location-block'] || this.tree['cad_code'];
    }
    if (fieldKey === 'certainty') {
      return this.tree['certainty'] ?? false;
    }
    return '';
  }

  openProposalModal(fieldKey: string = '', fieldTitle: string = '', currentValue: any = null) {
    this.selectedFieldKey = fieldKey;
    this.selectedFieldTitle = fieldTitle;
    const val = (currentValue !== null && currentValue !== undefined) ? currentValue : (fieldKey ? this.getFieldValue(fieldKey) : '');
    this.currentFieldValue = (val !== null && val !== undefined && val !== '') ? val : 'לא מוגדר';
    this.proposedFieldValue = '';
    this.showProposalModal = true;
  }

  onFieldSelectChange() {
    const item = taxonomy.find(t => t.name === this.selectedFieldKey);
    if (item) {
      this.selectedFieldTitle = item.title;
      const val = this.getFieldValue(item.name);
      this.currentFieldValue = (val !== null && val !== undefined && val !== '') ? val : 'לא מוגדר';
    }
  }

  closeProposalModal() {
    this.showProposalModal = false;
    this.selectedFieldKey = '';
    this.selectedFieldTitle = '';
    this.currentFieldValue = '';
    this.proposedFieldValue = '';
  }

  submitProposal() {
    if (!this.tree || !this.tree['meta-tree-id'] || !this.selectedFieldKey || !this.proposedFieldValue.trim()) {
      return;
    }

    let fromVal = this.currentFieldValue;
    if (!fromVal || fromVal === 'לא מוגדר') {
      const resolved = this.getFieldValue(this.selectedFieldKey);
      fromVal = (resolved !== null && resolved !== undefined && resolved !== '') ? resolved : 'לא מוגדר';
    }

    this.proposalsService.addProposal(
      this.tree['meta-tree-id'],
      [{
        field: this.selectedFieldKey,
        fromValue: fromVal,
        toValue: this.proposedFieldValue.trim()
      }]
    );

    this.loadProposals();
    this.closeProposalModal();
  }

  toNumber(value: any, digits: number = 1) {
    try {
      const ret = parseFloat(value);
      return ret.toFixed(digits);
    } catch (e) {
      return value;
    }
  }

  toBoolean(value: any) {
    return !!value ? 'כן' : 'לא';
  }

  toImage(value: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
