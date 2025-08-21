import { cryptoService } from './crypto';
import { storageService } from './storage';
import { User, LocalAuthCredentials, DecodedGoogleToken } from '../types/auth';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async init(): Promise<void> {
    // Check for existing session
    const sessionData = localStorage.getItem('auth_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.expiresAt > Date.now()) {
          this.currentUser = session.user;
        } else {
          localStorage.removeItem('auth_session');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('auth_session');
      }
    }
  }

  async registerLocal(credentials: LocalAuthCredentials): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await storageService.get<any>('auth_users', credentials.username);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Generate salt and derive key from password
      const salt = cryptoService.generateSalt();
      const key = await cryptoService.deriveKey(credentials.password, salt);
      
      // Hash password for storage
      const passwordHash = await this.hashPassword(credentials.password, salt);

      const user: User = {
        id: crypto.randomUUID(),
        email: credentials.username,
        name: credentials.username.split('@')[0] || credentials.username,
        provider: 'local',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      // Store user data
      await storageService.put('auth_users', {
        id: user.id,
        username: credentials.username,
        passwordHash,
        salt: Array.from(salt),
        user,
      });

      // Set encryption key
      cryptoService.setKey(key);
      this.currentUser = user;
      this.saveSession(user);

      return user;
    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loginLocal(credentials: LocalAuthCredentials): Promise<User> {
    try {
      const userData = await storageService.get<any>('auth_users', credentials.username);
      if (!userData) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const salt = new Uint8Array(userData.salt);
      const passwordHash = await this.hashPassword(credentials.password, salt);
      
      if (passwordHash !== userData.passwordHash) {
        throw new Error('Invalid credentials');
      }

      // Derive encryption key
      const key = await cryptoService.deriveKey(credentials.password, salt);
      cryptoService.setKey(key);

      // Update last login
      const user: User = {
        ...userData.user,
        lastLoginAt: new Date(),
      };

      await storageService.put('auth_users', {
        ...userData,
        user,
      });

      this.currentUser = user;
      this.saveSession(user);

      return user;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loginGoogle(credential: string): Promise<User> {
    try {
      const decoded = this.decodeGoogleToken(credential);
      
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        provider: 'google',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      // For Google auth, we'll use a default encryption key
      // In a real app, you might want to prompt for a master password
      const defaultKey = await cryptoService.generateKey();
      cryptoService.setKey(defaultKey);

      // Store user data (without sensitive info)
      await storageService.put('auth_users', {
        id: user.id,
        user,
        provider: 'google',
      });

      this.currentUser = user;
      this.saveSession(user);

      return user;
    } catch (error) {
      throw new Error(`Google login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    cryptoService.setKey(null as any);
    localStorage.removeItem('auth_session');
    
    // Clear sensitive data from memory
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  private async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const combined = new Uint8Array(data.length + salt.length);
    combined.set(data);
    combined.set(salt, data.length);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private decodeGoogleToken(token: string): DecodedGoogleToken {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  private saveSession(user: User): void {
    const session = {
      user,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };
    localStorage.setItem('auth_session', JSON.stringify(session));
  }
}