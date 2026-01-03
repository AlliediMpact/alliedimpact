'use client';

import { useState } from 'react';

export default function DataPrivacyPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExportData = async () => {
    setExportLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/export-data');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alliedimpact-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Your data has been exported successfully!');
    } catch (err) {
      setError('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm deletion.');
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmationText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Redirect to home page after successful deletion
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Data & Privacy</h1>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 text-green-600 rounded-lg">
            {success}
          </div>
        )}

        {/* Export Data Section */}
        <section className="mb-12 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Export Your Data</h2>
          <p className="text-muted-foreground mb-6">
            Download a copy of all your personal information stored on Allied iMpact. This includes your profile, subscriptions, and transaction history.
          </p>
          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export My Data'}
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            Your data will be provided in JSON format. This process may take a few moments.
          </p>
        </section>

        {/* Delete Account Section */}
        <section className="p-6 border border-destructive rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">Delete Account</h2>
          <p className="text-muted-foreground mb-6">
            Permanently delete your Allied iMpact account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg">
                <h3 className="font-semibold mb-2">⚠️ Warning</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>All your personal information will be permanently deleted</li>
                  <li>Your subscriptions will be cancelled</li>
                  <li>You will lose access to all products</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="font-mono bg-accent px-2 py-1 rounded">DELETE MY ACCOUNT</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmationText('');
                    setError('');
                  }}
                  className="px-6 py-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || confirmationText !== 'DELETE MY ACCOUNT'}
                  className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Account Permanently'}
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="mt-12">
          <a href="/profile" className="text-primary underline">
            ← Back to Profile
          </a>
        </div>
      </div>
    </div>
  );
}
