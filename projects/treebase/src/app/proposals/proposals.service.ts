import { Injectable } from '@angular/core';
import { Observable, Subject, from, of, map, switchMap, catchError, forkJoin, defaultIfEmpty } from 'rxjs';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';
import { FIREBASE_CONFIG } from '../config/firebase-config';
import { AuthService } from '../auth/auth.service';
import { TreeProposal, FieldChange } from './proposal.model';

export { TreeProposal, FieldChange };

const DATABASE_ID = 'treebase-proposals';
const DEFAULT_COLLECTION = 'proposals';

@Injectable({
  providedIn: 'root'
})
export class ProposalsService {

  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;

  private proposals: TreeProposal[] = [];
  public proposalsUpdated$ = new Subject<void>();

  constructor(private authService: AuthService) {
    const config = (window as any).FIREBASE_CONFIG || FIREBASE_CONFIG;
    try {
      this.app = getApps().length === 0 ? initializeApp(config) : getApp();
      this.db = getFirestore(this.app, DATABASE_ID);
      this.storage = getStorage(this.app);
    } catch (e) {
      console.warn('[ProposalsService] Failed to initialize Firebase Services:', e);
    }

    this.loadFromBackend();
  }

  private notifyUpdates(): void {
    this.proposalsUpdated$.next();
  }

  /**
   * Recursively removes all `undefined` values from an object or array to prevent Firestore addDoc errors.
   */
  private sanitizeForFirestore(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForFirestore(item)).filter(item => item !== undefined);
    }
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        result[key] = this.sanitizeForFirestore(val);
      }
    }
    return result;
  }

  private mapDocToTreeProposal(docSnap: any): TreeProposal {
    const data = docSnap.data();
    let createdAtIso = new Date().toISOString();
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === 'function') {
        createdAtIso = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
        createdAtIso = new Date(data.createdAt).toISOString();
      }
    }

    const changesSource = data.changes || data.proposedChanges || data.attributes || [];
    const changes: FieldChange[] = changesSource.map((item: any) => ({
      field: item.field || item.key || '',
      fromValue: item.fromValue !== undefined ? item.fromValue : '',
      toValue: item.toValue !== undefined ? item.toValue : (item.value !== undefined ? item.value : '')
    })).filter((c: FieldChange) => !!c.field);

    return {
      id: docSnap.id,
      treeId: data.treeId || '',
      changes: changes.length > 0 ? changes : [{ field: 'general', fromValue: '', toValue: data.description || '' }],
      createdAt: createdAtIso,
      status: data.status || 'accepted',
      proposer: data.proposer || data.authorName || data.submittedByEmail || data.submittedBy || null,
      approver: data.approver || null,
      submittedBy: data.submittedBy || undefined,
      submittedByEmail: data.submittedByEmail || null
    };
  }

  private mergeBackendProposals(backendProps: TreeProposal[]): void {
    if (!backendProps || backendProps.length === 0) return;
    let changed = false;

    for (const item of backendProps) {
      // 1. Check by exact ID match
      let index = this.proposals.findIndex(p => p.id === item.id);

      // 2. Fallback: Match temporary local proposal (id starts with 'prop_') by treeId, proposer, and changes
      if (index < 0) {
        index = this.proposals.findIndex(p => 
          !!p.id &&
          p.id.startsWith('prop_') &&
          String(p.treeId).trim() === String(item.treeId).trim() &&
          p.proposer === item.proposer &&
          p.changes.length === item.changes.length &&
          p.changes.every((c, i) => c.field === item.changes[i]?.field && String(c.toValue) === String(item.changes[i]?.toValue))
        );
      }

      if (index >= 0) {
        this.proposals[index] = item;
      } else {
        this.proposals.push(item);
      }
      changed = true;
    }

    // Deduplicate array by proposal ID
    const seenIds = new Set<string>();
    const uniqueProposals: TreeProposal[] = [];
    for (const p of this.proposals) {
      const pId = p.id || '';
      if (pId && !seenIds.has(pId)) {
        seenIds.add(pId);
        uniqueProposals.push(p);
      }
    }
    this.proposals = uniqueProposals;

    if (changed) {
      this.notifyUpdates();
    }
  }

  public loadFromBackend(): void {
    this.GetAllProposals().subscribe({
      next: (backendProps) => {
        this.mergeBackendProposals(backendProps);
      },
      error: (err) => {
        console.warn('[ProposalsService] Failed to load proposals from backend service:', err);
      }
    });
  }

  /**
   * Fetches all proposals from Firestore ordered by creation date
   */
  public GetAllProposals(): Observable<TreeProposal[]> {
    if (!this.db) {
      return of([]);
    }
    const colRef = collection(this.db, DEFAULT_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(docSnap => this.mapDocToTreeProposal(docSnap))),
      catchError(err => {
        console.warn('[ProposalsService] Failed to get all proposals:', err);
        return of([]);
      })
    );
  }

  /**
   * Fetches all proposals for a specific tree ID from Firestore
   */
  public GetProposalsPerTree(treeId: string): Observable<TreeProposal[]> {
    if (!this.db || !treeId) {
      return of([]);
    }
    const colRef = collection(this.db, DEFAULT_COLLECTION);
    const q = query(colRef, where('treeId', '==', treeId));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(docSnap => this.mapDocToTreeProposal(docSnap))),
      catchError(err => {
        console.warn(`[ProposalsService] Failed to get proposals for tree ${treeId}:`, err);
        return of([]);
      })
    );
  }

  getAllProposals(): TreeProposal[] {
    return [...this.proposals];
  }

  getProposalsForTree(treeId: string): TreeProposal[] {
    if (!treeId) return [];

    // Async fetch from Firebase backend to sync proposals in background
    this.GetProposalsPerTree(treeId).subscribe({
      next: (backendProps) => {
        this.mergeBackendProposals(backendProps);
      },
      error: (err) => console.warn(`[ProposalsService] Error fetching proposals for tree ${treeId}:`, err)
    });

    return this.proposals.filter(p => String(p.treeId).trim() === String(treeId).trim());
  }

  addProposal(
    treeId: string,
    changes: FieldChange[],
    proposer: string | null = null,
    approver: string | null = null
  ): TreeProposal {
    const tempId = 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newProposal: TreeProposal = {
      id: tempId,
      treeId,
      changes,
      createdAt: new Date().toISOString(),
      status: 'accepted',
      proposer: proposer || null,
      approver: approver || null
    };

    this.proposals.push(newProposal);
    this.notifyUpdates();

    // Directly save TreeProposal model to Firebase backend
    this.CreateProposal(newProposal).subscribe({
      next: (docId) => {
        if (docId) {
          const idx = this.proposals.findIndex(p => p.id === tempId || p.id === docId);
          if (idx >= 0) {
            this.proposals[idx].id = docId;
          }
          newProposal.id = docId;
          this.notifyUpdates();
        }
      },
      error: (err) => console.warn('[ProposalsService] Failed to save proposal to Firebase backend:', err)
    });

    return newProposal;
  }

  /**
   * Processes all photo/image changes, uploads them to Firebase Storage,
   * updates the fields with the returned storage URLs, and saves the TreeProposal document in Firestore.
   */
  public CreateProposal(proposal: TreeProposal): Observable<string> {
    if (!this.db) {
      return of('');
    }

    return this.authService.ensureAuthenticated().pipe(
      switchMap(user => {
        return this.uploadProposalImages(proposal).pipe(
          switchMap(processedProposal => {
            const colRef = collection(this.db!, DEFAULT_COLLECTION);
            const recordData = this.sanitizeForFirestore({
              ...processedProposal,
              submittedBy: user ? user.uid : 'anonymous',
              submittedByEmail: user ? (user.email || null) : null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            return from(addDoc(colRef, recordData));
          })
        );
      }),
      map(docRef => docRef.id),
      catchError(err => {
        console.error('[ProposalsService] Failed to create proposal:', err);
        return of('');
      })
    );
  }

  /**
   * Helper to process all image changes in a TreeProposal, upload to Firebase Storage,
   * and update change.toValue with returned Storage URLs.
   */
  private uploadProposalImages(proposal: TreeProposal): Observable<TreeProposal> {
    if (!this.storage || !proposal.changes || !Array.isArray(proposal.changes)) {
      return of(proposal);
    }

    const storageInstance = this.storage;
    const uploadTasks: Observable<{ apply: (p: TreeProposal) => void }>[] = [];
    const timestamp = Date.now();

    proposal.changes.forEach((change, index) => {
      const valToUpload = change.toValue;
      if (this.isImageField(change.field) || this.isRawImageData(valToUpload)) {
        const storageRef = ref(storageInstance, `proposals/images/${timestamp}_change_${change.field || index}`);
        const upload$ = this.uploadSingleImage(storageRef, valToUpload).pipe(
          map(url => ({
            apply: (p: TreeProposal) => {
              if (p.changes && p.changes[index]) {
                p.changes[index].toValue = url;
              }
            }
          }))
        );
        uploadTasks.push(upload$);
      }
    });

    if (uploadTasks.length === 0) {
      return of(proposal);
    }

    return forkJoin(uploadTasks).pipe(
      defaultIfEmpty([]),
      map(results => {
        const updatedProposal: TreeProposal = {
          ...proposal,
          changes: proposal.changes ? proposal.changes.map(c => ({ ...c })) : []
        };
        results.forEach(task => task.apply(updatedProposal));
        return updatedProposal;
      }),
      catchError(err => {
        console.warn('[ProposalsService] Error uploading images to Storage:', err);
        return of(proposal);
      })
    );
  }

  /**
   * Uploads a single image (File, Blob, or base64 data URL) to Firebase Storage and returns its Download URL.
   */
  private uploadSingleImage(storageRef: any, rawData: any): Observable<string> {
    if (!rawData) {
      return of('');
    }

    if (typeof rawData === 'string' && (rawData.startsWith('data:') || rawData.includes(';base64,'))) {
      return from(uploadString(storageRef, rawData, 'data_url')).pipe(
        switchMap(() => from(getDownloadURL(storageRef))),
        catchError(err => {
          console.warn('[ProposalsService] Firebase Storage upload skipped/failed (permission/quota):', err);
          return of(rawData);
        })
      );
    }

    if (rawData instanceof File || rawData instanceof Blob) {
      return from(uploadBytes(storageRef, rawData)).pipe(
        switchMap(() => from(getDownloadURL(storageRef))),
        catchError(err => {
          console.warn('[ProposalsService] Firebase Storage Blob upload skipped/failed:', err);
          return of('');
        })
      );
    }

    return of(String(rawData));
  }

  private isImageField(fieldKey: string): boolean {
    if (!fieldKey) return false;
    const key = fieldKey.toLowerCase();
    return key.startsWith('photos-') || key.startsWith('photo-') || key.includes('image') || key.includes('photo');
  }

  private isRawImageData(val: any): boolean {
    if (!val) return false;
    if (typeof val === 'string' && (val.startsWith('data:') || val.startsWith('blob:') || val.includes(';base64,'))) return true;
    if (val instanceof File || val instanceof Blob) return true;
    return false;
  }
}
