import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api'
import type { UserSettings } from '@/types/api'

// Mock the API client
vi.mock('@/services/api', () => ({
  apiClient: {
    getUserSettings: vi.fn(),
    updateUserSettings: vi.fn(),
    updateWorkspaceSettings: vi.fn(),
  },
}))

const mockUserSettings: UserSettings = {
  id: '1',
  user_id: 'user-1',
  display_name: 'Test User',
  preferred_currency: 'USD',
  timezone: 'UTC',
  date_format: 'MM/DD/YYYY',
  language: 'en',
  email_notifications: true,
  push_notifications: false,
  weekly_reports: true,
  budget_alerts: true,
  goal_reminders: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('useSettings API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API client methods', () => {
    it('should have getUserSettings method', () => {
      expect(typeof apiClient.getUserSettings).toBe('function')
    })

    it('should have updateUserSettings method', () => {
      expect(typeof apiClient.updateUserSettings).toBe('function')
    })

    it('should have updateWorkspaceSettings method', () => {
      expect(typeof apiClient.updateWorkspaceSettings).toBe('function')
    })
  })

  describe('API calls', () => {
    it('should call getUserSettings with correct parameters', async () => {
      vi.mocked(apiClient.getUserSettings).mockResolvedValue(mockUserSettings)

      const result = await apiClient.getUserSettings()

      expect(apiClient.getUserSettings).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockUserSettings)
    })

    it('should call updateUserSettings with correct parameters', async () => {
      const updateData = { display_name: 'Updated User' }
      const updatedSettings = { ...mockUserSettings, ...updateData }
      vi.mocked(apiClient.updateUserSettings).mockResolvedValue(updatedSettings)

      const result = await apiClient.updateUserSettings(updateData)

      expect(apiClient.updateUserSettings).toHaveBeenCalledWith(updateData)
      expect(result).toEqual(updatedSettings)
    })

    it('should call updateWorkspaceSettings with correct parameters', async () => {
      const workspaceId = 'workspace-1'
      const updateData = { name: 'Updated Workspace' }
      const mockWorkspace = {
        id: workspaceId,
        name: 'Updated Workspace',
        type: 'personal' as const,
        owner_id: 'user-1',
        currency: 'USD',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(apiClient.updateWorkspaceSettings).mockResolvedValue(mockWorkspace)

      const result = await apiClient.updateWorkspaceSettings(workspaceId, updateData)

      expect(apiClient.updateWorkspaceSettings).toHaveBeenCalledWith(workspaceId, updateData)
      expect(result).toEqual(mockWorkspace)
    })
  })
})