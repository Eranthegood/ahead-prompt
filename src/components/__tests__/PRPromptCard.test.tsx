import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PRPromptCard } from '../PRPromptCard';
import { useIntegrations } from '../../hooks/useIntegrations';
import { useGitHubPRs } from '../../hooks/useGitHubPRs';

// Mock the hooks
vi.mock('../../hooks/useIntegrations');
vi.mock('../../hooks/useGitHubPRs');

const mockUseIntegrations = vi.mocked(useIntegrations);
const mockUseGitHubPRs = vi.mocked(useGitHubPRs);

describe('PRPromptCard', () => {
  beforeEach(() => {
    mockUseGitHubPRs.mockReturnValue({
      prs: [],
      isLoading: false,
      error: null,
      fetchPRs: vi.fn(),
      getPR: vi.fn(),
      mergePR: vi.fn(),
      squashAndMerge: vi.fn(),
      mergeWithMergeCommit: vi.fn(),
      rebaseAndMerge: vi.fn(),
    });
  });

  it('shows GitHub integration required when not configured', () => {
    mockUseIntegrations.mockReturnValue({
      integrations: [{ id: 'github', isConfigured: false, isEnabled: false }],
      configureIntegration: vi.fn(),
      testIntegration: vi.fn(),
      isLoading: false,
    } as any);

    render(<PRPromptCard workspaceId="test-workspace" />);
    
    expect(screen.getByText('GitHub Integration Required')).toBeInTheDocument();
    expect(screen.getByText('Configure GitHub')).toBeInTheDocument();
  });

  it('shows empty state when no PRs are available', () => {
    mockUseIntegrations.mockReturnValue({
      integrations: [{
        id: 'github',
        isConfigured: true,
        isEnabled: true,
        metadata: {
          repositories: [{ name: 'test-repo', full_name: 'user/test-repo' }]
        }
      }],
      configureIntegration: vi.fn(),
      testIntegration: vi.fn(),
      isLoading: false,
    } as any);

    render(<PRPromptCard workspaceId="test-workspace" />);
    
    expect(screen.getByText('No open pull requests')).toBeInTheDocument();
    expect(screen.getByText('All caught up! 🎉')).toBeInTheDocument();
  });

  it('shows loading state when fetching PRs', () => {
    mockUseIntegrations.mockReturnValue({
      integrations: [{
        id: 'github',
        isConfigured: true,
        isEnabled: true,
        metadata: {
          repositories: [{ name: 'test-repo', full_name: 'user/test-repo' }]
        }
      }],
      configureIntegration: vi.fn(),
      testIntegration: vi.fn(),
      isLoading: false,
    } as any);

    mockUseGitHubPRs.mockReturnValue({
      prs: [],
      isLoading: true,
      error: null,
      fetchPRs: vi.fn(),
      getPR: vi.fn(),
      mergePR: vi.fn(),
      squashAndMerge: vi.fn(),
      mergeWithMergeCommit: vi.fn(),
      rebaseAndMerge: vi.fn(),
    });

    render(<PRPromptCard workspaceId="test-workspace" />);
    
    expect(screen.getByText('Loading pull requests...')).toBeInTheDocument();
  });
});