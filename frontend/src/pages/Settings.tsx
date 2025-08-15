import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  User,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettings } from '@/hooks/useSettings';

const workspaceSettingsSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name too long'),
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  date_format: z.string().min(1, 'Date format is required'),
});

const userSettingsSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100, 'Name too long'),
  preferred_currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  date_format: z.string().min(1, 'Date format is required'),
  language: z.string().min(1, 'Language is required'),
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  weekly_reports: z.boolean(),
  budget_alerts: z.boolean(),
  goal_reminders: z.boolean(),
});

type WorkspaceSettingsData = z.infer<typeof workspaceSettingsSchema>;
type UserSettingsData = z.infer<typeof userSettingsSchema>;

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

export default function Settings() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('workspace');

  // Use settings hooks
  const {
    userSettings,
    isLoadingUserSettings,
    userSettingsError,
    updateUserSettings,
    isUpdatingUserSettings,
    userSettingsUpdateError,
    updateWorkspaceSettings,
    isUpdatingWorkspaceSettings,
    workspaceSettingsUpdateError,
    isUserSettingsUpdateSuccess,
    isWorkspaceSettingsUpdateSuccess,
  } = useSettings();

  // Workspace Settings Form
  const workspaceForm = useForm<WorkspaceSettingsData>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: currentWorkspace?.name || '',
      currency: currentWorkspace?.currency || 'USD',
      timezone: currentWorkspace?.timezone || 'UTC',
      date_format: currentWorkspace?.date_format || 'MM/DD/YYYY',
    },
  });

  // User Settings Form
  const userForm = useForm<UserSettingsData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      display_name: '',
      preferred_currency: 'USD',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      language: 'en',
      email_notifications: true,
      push_notifications: false,
      weekly_reports: true,
      budget_alerts: true,
      goal_reminders: true,
    },
  });

  // Update form defaults when data loads
  useEffect(() => {
    if (currentWorkspace) {
      workspaceForm.reset({
        name: currentWorkspace.name,
        currency: currentWorkspace.currency,
        timezone: currentWorkspace.timezone || 'UTC',
        date_format: currentWorkspace.date_format || 'MM/DD/YYYY',
      });
    }
  }, [currentWorkspace, workspaceForm]);

  useEffect(() => {
    if (userSettings) {
      userForm.reset({
        display_name: userSettings.display_name,
        preferred_currency: userSettings.preferred_currency,
        timezone: userSettings.timezone,
        date_format: userSettings.date_format,
        language: userSettings.language,
        email_notifications: userSettings.email_notifications,
        push_notifications: userSettings.push_notifications,
        weekly_reports: userSettings.weekly_reports,
        budget_alerts: userSettings.budget_alerts,
        goal_reminders: userSettings.goal_reminders,
      });
    }
  }, [userSettings, userForm]);

  const onWorkspaceSubmit = workspaceForm.handleSubmit((data) => {
    if (!currentWorkspace) return;
    updateWorkspaceSettings({
      workspaceId: currentWorkspace.id,
      data,
    });
  });

  const onUserSubmit = userForm.handleSubmit((data) => {
    updateUserSettings(data);
  });

  if (!currentWorkspace || !user) {
    return (
      <Layout>
        <div className="p-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in and select a workspace to access settings.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your workspace and account preferences
            </p>
          </div>

          {/* Settings Navigation */}
          <Card>
            <CardContent className="p-0">
              <div className="flex border-b">
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'workspace'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('workspace')}
                >
                  <Globe className="h-4 w-4" />
                  Workspace
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'notifications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="h-4 w-4" />
                  Security
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Workspace Settings */}
          {activeTab === 'workspace' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Workspace Settings
                </CardTitle>
                <CardDescription>
                  Configure your workspace preferences and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {workspaceSettingsUpdateError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {workspaceSettingsUpdateError.message || 'Failed to update workspace settings. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {isWorkspaceSettingsUpdateSuccess && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Workspace settings updated successfully.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={onWorkspaceSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="workspace-name">Workspace Name</Label>
                      <Input
                        id="workspace-name"
                        placeholder="My Workspace"
                        {...workspaceForm.register('name')}
                        error={workspaceForm.formState.errors.name?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select 
                        value={workspaceForm.watch('currency')}
                        onValueChange={(value) => workspaceForm.setValue('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {workspaceForm.formState.errors.currency && (
                        <p className="text-sm text-red-600">
                          {workspaceForm.formState.errors.currency.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={workspaceForm.watch('timezone')}
                        onValueChange={(value) => workspaceForm.setValue('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select 
                        value={workspaceForm.watch('date_format')}
                        onValueChange={(value) => workspaceForm.setValue('date_format', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          {DATE_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingWorkspaceSettings}
                      className="min-w-[120px]"
                    >
                      {isUpdatingWorkspaceSettings && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userSettingsUpdateError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {userSettingsUpdateError.message || 'Failed to update user settings. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {isUserSettingsUpdateSuccess && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      User settings updated successfully.
                    </AlertDescription>
                  </Alert>
                )}

                {isLoadingUserSettings && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading settings...</span>
                  </div>
                )}

                <form onSubmit={onUserSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        placeholder="Your name"
                        {...userForm.register('display_name')}
                        error={userForm.formState.errors.display_name?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">
                        Contact support to change your email address
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-currency">Preferred Currency</Label>
                      <Select 
                        value={userForm.watch('preferred_currency')}
                        onValueChange={(value) => userForm.setValue('preferred_currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {userForm.formState.errors.preferred_currency && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.preferred_currency.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-language">Language</Label>
                      <Select 
                        value={userForm.watch('language')}
                        onValueChange={(value) => userForm.setValue('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {userForm.formState.errors.language && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.language.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-timezone">Timezone</Label>
                      <Select 
                        value={userForm.watch('timezone')}
                        onValueChange={(value) => userForm.setValue('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {userForm.formState.errors.timezone && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.timezone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-date-format">Date Format</Label>
                      <Select 
                        value={userForm.watch('date_format')}
                        onValueChange={(value) => userForm.setValue('date_format', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          {DATE_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {userForm.formState.errors.date_format && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.date_format.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Export & Import</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Import from CSV
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingUserSettings || isLoadingUserSettings}
                      className="min-w-[120px]"
                    >
                      {isUpdatingUserSettings && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userSettingsUpdateError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {userSettingsUpdateError.message || 'Failed to update notification preferences. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {isUserSettingsUpdateSuccess && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Notification preferences updated successfully.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={onUserSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={userForm.watch('email_notifications')}
                        onCheckedChange={(checked) => userForm.setValue('email_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={userForm.watch('push_notifications')}
                        onCheckedChange={(checked) => userForm.setValue('push_notifications', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                        <p className="text-sm text-gray-500">
                          Get a weekly summary of your finances
                        </p>
                      </div>
                      <Switch
                        id="weekly-reports"
                        checked={userForm.watch('weekly_reports')}
                        onCheckedChange={(checked) => userForm.setValue('weekly_reports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="budget-alerts">Budget Alerts</Label>
                        <p className="text-sm text-gray-500">
                          Notify when you're approaching budget limits
                        </p>
                      </div>
                      <Switch
                        id="budget-alerts"
                        checked={userForm.watch('budget_alerts')}
                        onCheckedChange={(checked) => userForm.setValue('budget_alerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="goal-reminders">Goal Reminders</Label>
                        <p className="text-sm text-gray-500">
                          Remind you to contribute to your savings goals
                        </p>
                      </div>
                      <Switch
                        id="goal-reminders"
                        checked={userForm.watch('goal_reminders')}
                        onCheckedChange={(checked) => userForm.setValue('goal_reminders', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingUserSettings || isLoadingUserSettings}
                      className="min-w-[120px]"
                    >
                      {isUpdatingUserSettings && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Password</h3>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download Your Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}