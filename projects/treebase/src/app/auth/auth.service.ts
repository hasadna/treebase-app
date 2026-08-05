import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of, map, catchError } from 'rxjs';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { FIREBASE_CONFIG } from '../config/firebase-config';
import { isFeatureEnabled, FeatureFlag } from '../config/featureflags';

const REQUIRED_CONFIG_FIELDS: (keyof typeof FIREBASE_CONFIG)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  public user$ = new BehaviorSubject<User | null>(null);

  public isConfigValid = false;
  public configError: string | null = null;

  constructor() {
    this.validateAndInitialize();
  }

  public get isAuthEnabled(): boolean {
    return isFeatureEnabled(FeatureFlag.EnableAuth);
  }

  private validateAndInitialize(): void {
    if (!this.isAuthEnabled) {
      console.info('[AuthService] EnableAuth feature flag is disabled. Auth service loaded in disabled mode.');
      this.isConfigValid = false;
      this.configError = null;
      return;
    }

    const configToValidate = (window as any).FIREBASE_CONFIG || FIREBASE_CONFIG;

    if (!configToValidate) {
      this.isConfigValid = false;
      this.configError = 'auth configuration error';
      console.warn('[AuthService] Firebase config is missing.');
      return;
    }

    const missingOrEmptyField = REQUIRED_CONFIG_FIELDS.find(field => {
      const val = configToValidate[field];
      return !val || typeof val !== 'string' || val.trim() === '' || val.includes('YOUR_FIREBASE');
    });

    if (missingOrEmptyField) {
      this.isConfigValid = false;
      this.configError = 'auth configuration error';
      console.warn(`[AuthService] Invalid or missing field in FIREBASE_CONFIG: ${missingOrEmptyField}`);
      return;
    }

    try {
      this.app = getApps().length === 0 ? initializeApp(configToValidate) : getApp();
      this.auth = getAuth(this.app);
      this.isConfigValid = true;
      this.configError = null;

      onAuthStateChanged(this.auth, (user) => {
        console.debug('[AuthService] Auth state updated:', user ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL } : 'No User');
        this.user$.next(user);
      });
    } catch (e) {
      this.isConfigValid = false;
      this.configError = 'auth configuration error';
      console.error('[AuthService] Failed to initialize Firebase App/Auth:', e);
    }
  }

  get currentUser(): User | null {
    return this.auth ? (this.auth.currentUser || this.user$.value) : null;
  }

  public ensureAuthenticated(): Observable<User> {
    if (!this.isAuthEnabled || !this.isConfigValid || !this.auth) {
      return of({ uid: 'anonymous-guest', isAnonymous: true } as User);
    }

    if (this.auth.currentUser) {
      return from(this.auth.currentUser.getIdToken(true)).pipe(
        map(() => this.auth!.currentUser!),
        catchError(err => {
          console.warn('[AuthService] Token refresh warning:', err);
          return of(this.auth!.currentUser!);
        })
      );
    }
    return of({ uid: 'anonymous-guest', isAnonymous: true } as User);
  }

  loginWithGoogle(): Observable<User> {
    if (!this.isAuthEnabled) {
      throw new Error('Authentication is disabled by feature flag.');
    }
    if (!this.isConfigValid || !this.auth) {
      throw new Error(this.configError || 'auth configuration error');
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return from(signInWithPopup(this.auth, provider)).pipe(
      map(credential => credential.user)
    );
  }

  logout(): Observable<void> {
    if (!this.auth) {
      this.user$.next(null);
      return of(void 0);
    }
    return from(signOut(this.auth)).pipe(
      map(() => void 0)
    );
  }
}
