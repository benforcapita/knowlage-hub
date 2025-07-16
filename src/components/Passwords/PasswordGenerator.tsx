import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Zap, Key } from 'lucide-react';
import { PasswordConfig, PassphraseConfig } from '../../types';
import { PasswordGenerator as Generator } from '../../utils/passwords';

interface PasswordGeneratorProps {
  onUsePassword: (password: string) => void;
}

export function PasswordGenerator({ onUsePassword }: PasswordGeneratorProps) {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [passwordConfig, setPasswordConfig] = useState<PasswordConfig>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });

  const [passphraseConfig, setPassphraseConfig] = useState<PassphraseConfig>({
    wordCount: 4,
    separator: '-',
    includeNumbers: false,
    capitalizeWords: true,
  });

  const generatePassword = () => {
    try {
      const password = mode === 'password' 
        ? Generator.generatePassword(passwordConfig)
        : Generator.generatePassphrase(passphraseConfig);
      setGeneratedPassword(password);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  const copyToClipboard = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const strength = generatedPassword ? Generator.calculateStrength(generatedPassword) : null;

  const strengthColors = {
    weak: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300',
    fair: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
    good: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    strong: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
  };

  React.useEffect(() => {
    generatePassword();
  }, [mode, passwordConfig, passphraseConfig]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password Generator</h3>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('password')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mode === 'password'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Key className="w-4 h-4" />
          Password
        </button>
        <button
          onClick={() => setMode('passphrase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mode === 'passphrase'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          Passphrase
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={generatedPassword}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
          />
          <button
            onClick={generatePassword}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {strength && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Strength:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${strengthColors[strength.strength]}`}>
                {strength.strength.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => onUsePassword(generatedPassword)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Use this password
            </button>
          </div>
        )}
      </div>

      {mode === 'password' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Length: {passwordConfig.length}
            </label>
            <input
              type="range"
              min="8"
              max="64"
              value={passwordConfig.length}
              onChange={(e) => setPasswordConfig(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passwordConfig.includeUppercase}
                onChange={(e) => setPasswordConfig(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passwordConfig.includeLowercase}
                onChange={(e) => setPasswordConfig(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passwordConfig.includeNumbers}
                onChange={(e) => setPasswordConfig(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passwordConfig.includeSymbols}
                onChange={(e) => setPasswordConfig(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$)</span>
            </label>

            <label className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                checked={passwordConfig.excludeSimilar}
                onChange={(e) => setPasswordConfig(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Exclude similar characters (il1Lo0O)</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Word Count: {passphraseConfig.wordCount}
            </label>
            <input
              type="range"
              min="3"
              max="8"
              value={passphraseConfig.wordCount}
              onChange={(e) => setPassphraseConfig(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Separator
            </label>
            <select
              value={passphraseConfig.separator}
              onChange={(e) => setPassphraseConfig(prev => ({ ...prev, separator: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Period (.)</option>
              <option value=" ">Space ( )</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passphraseConfig.capitalizeWords}
                onChange={(e) => setPassphraseConfig(prev => ({ ...prev, capitalizeWords: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Capitalize words</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={passphraseConfig.includeNumbers}
                onChange={(e) => setPassphraseConfig(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include numbers</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}