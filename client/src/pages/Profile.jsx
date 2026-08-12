import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api, { apiErrorMessage } from '../services/api.js';
import Input from '../components/Input.jsx';
import Textarea from '../components/Textarea.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', bio: user?.profile?.bio || '', organization: user?.profile?.organization || '', title: user?.profile?.title || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        profile: { bio: profileForm.bio, organization: profileForm.organization, title: profileForm.title },
      });
      setUser(res.data.data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to update profile.'));
    } finally { setSavingProfile(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/auth/password', passwordForm);
      toast.success('Password updated.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to update password.'));
    } finally { setSavingPassword(false); }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted.');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to delete account.'));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ConfirmDialog open={confirmDeleteOpen} title="Delete your account?" description="This permanently deletes your account, startup ideas, and reports. This cannot be undone."
        confirmLabel="Delete account" loading={deleting} onConfirm={deleteAccount} onCancel={() => setConfirmDeleteOpen(false)} />

      <h1 className="font-display text-2xl font-bold text-ink-900">Profile</h1>

      <Card>
        <h2 className="font-display text-sm font-semibold text-ink-900">Personal information</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <Input id="name" label="Full name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          <Input id="organization" label="Organization" value={profileForm.organization} onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} />
          <Input id="title" label="Title" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} />
          <Textarea id="bio" label="Bio" rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
          <Button type="submit" loading={savingProfile}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-sm font-semibold text-ink-900">Change password</h2>
        <form onSubmit={savePassword} className="mt-4 space-y-4">
          <Input id="currentPassword" type="password" label="Current password" autoComplete="current-password"
            value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          <Input id="newPassword" type="password" label="New password" autoComplete="new-password"
            value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          <Button type="submit" loading={savingPassword}>Update password</Button>
        </form>
      </Card>

      <Card className="border-rose-200">
        <h2 className="font-display text-sm font-semibold text-rose-700">Danger zone</h2>
        <p className="mt-1 text-sm text-ink-500">Permanently delete your account and all associated data.</p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmDeleteOpen(true)}>Delete account</Button>
      </Card>
    </div>
  );
}
