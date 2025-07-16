import { PasswordConfig, PassphraseConfig } from '../types';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR = 'il1Lo0O';

const COMMON_WORDS = [
  'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'harbor',
  'island', 'jungle', 'knight', 'lemon', 'mountain', 'nature', 'ocean', 'palace',
  'queen', 'river', 'sunset', 'tiger', 'umbrella', 'valley', 'winter', 'yellow',
  'zebra', 'bridge', 'castle', 'diamond', 'energy', 'flower', 'galaxy', 'harmony',
  'journey', 'kingdom', 'liberty', 'melody', 'phoenix', 'rainbow', 'thunder', 'victory'
];

export class PasswordGenerator {
  static generatePassword(config: PasswordConfig): string {
    let charset = '';
    
    if (config.includeLowercase) charset += LOWERCASE;
    if (config.includeUppercase) charset += UPPERCASE;
    if (config.includeNumbers) charset += NUMBERS;
    if (config.includeSymbols) charset += SYMBOLS;
    
    if (config.excludeSimilar) {
      charset = charset.split('').filter(char => !SIMILAR.includes(char)).join('');
    }
    
    if (charset.length === 0) {
      throw new Error('At least one character type must be selected');
    }
    
    let password = '';
    const array = new Uint32Array(config.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < config.length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    return password;
  }
  
  static generatePassphrase(config: PassphraseConfig): string {
    const words: string[] = [];
    const array = new Uint32Array(config.wordCount);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < config.wordCount; i++) {
      let word = COMMON_WORDS[array[i] % COMMON_WORDS.length];
      
      if (config.capitalizeWords) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      if (config.includeNumbers && Math.random() > 0.7) {
        word += Math.floor(Math.random() * 100);
      }
      
      words.push(word);
    }
    
    return words.join(config.separator);
  }
  
  static calculateStrength(password: string): {
    score: number;
    feedback: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length scoring
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else feedback.push('Use at least 8 characters');
    
    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Include uppercase letters');
    
    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('Include numbers');
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    else feedback.push('Include special characters');
    
    // Pattern detection
    if (!/(.)\1{2,}/.test(password)) score += 10;
    else feedback.push('Avoid repeated characters');
    
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score >= 80) strength = 'strong';
    else if (score >= 60) strength = 'good';
    else if (score >= 40) strength = 'fair';
    else strength = 'weak';
    
    return { score, feedback, strength };
  }
}