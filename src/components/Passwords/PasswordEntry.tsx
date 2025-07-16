import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, ExternalLink, Check } from 'lucide-react';
import { PasswordEntry as Entry } from '../../types';

interface PasswordEntryProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
}

export function PasswordEntry({ entry, onEdit, onDelete }: PasswordEntryProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openUrl = () => {
    if (entry.url) {
      window.open(entry.url.startsWith('http') ? entry.url : `https://${entry.url}`, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
              {entry.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{entry.name}</h3>
            {entry.url && (
              <button
                onClick={openUrl}
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {entry.url}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 w-20">Username:</span>
          <span className="flex-1 text-sm text-gray-900 dark:text-white font-mono">
            {entry.username}
          </span>
          <button
            onClick={() => copyToClipboard(entry.username, 'username')}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {copiedField === 'username' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 w-20">Password:</span>
          <span className="flex-1 text-sm text-gray-900 dark:text-white font-mono">
            {showPassword ? entry.password : '••••••••••••'}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => copyToClipboard(entry.password, 'password')}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {copiedField === 'password' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {entry.notes && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}