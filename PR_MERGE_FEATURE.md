# Pull Request Merge & Squash Feature for Ahead.love

## 🎯 Overview

This feature enables users to merge and squash pull requests directly from Ahead.love's build interface using an intuitive prompt card. The implementation provides a seamless workflow for managing GitHub PRs without leaving the development environment.

## ✨ Key Features

### 1. **PR Management Prompt Card**
- **Location**: Prominently displayed at the top of the build interface (`/build`)
- **Design**: Clean, modern card interface with repository selection
- **Real-time Updates**: Auto-refreshes every 30 seconds to show current PR status

### 2. **GitHub Integration**
- **Authentication**: Secure OAuth token storage using Supabase Edge Functions
- **Repository Support**: Automatically detects and lists all user repositories
- **Multi-repo Support**: Easy switching between repositories via dropdown

### 3. **Merge Operations**
- **Squash and Merge**: Combines all commits into a single commit with custom title/message
- **Merge Commit**: Creates a merge commit preserving branch history
- **Rebase and Merge**: Replays commits without creating a merge commit
- **Pre-merge Validation**: Checks for conflicts, draft status, and merge readiness

### 4. **User Experience**
- **Visual Status Indicators**: Color-coded badges for PR status (Ready, Conflicts, Draft, Checking)
- **Detailed PR Information**: Shows author, creation date, file changes, additions/deletions
- **External Links**: Quick access to view PRs on GitHub
- **Responsive Design**: Works seamlessly on desktop and mobile

### 5. **Error Handling & Feedback**
- **Smart Error Messages**: User-friendly error descriptions with actionable suggestions
- **Merge Conflict Detection**: Clear indication when conflicts need resolution
- **Permission Validation**: Helpful guidance for token permission issues
- **Success Notifications**: Confirmation messages with merge details

## 🏗️ Technical Architecture

### Backend Components

#### 1. **Supabase Edge Function: `github-pr-operations`**
- **Location**: `/supabase/functions/github-pr-operations/index.ts`
- **Endpoints**:
  - `list-prs`: Fetch open pull requests for a repository
  - `get-pr`: Get detailed information for a specific PR
  - `merge-pr`: Execute merge operations with specified method
- **Security**: User authentication via JWT, secure token storage

#### 2. **Database Schema**
- **Table**: `user_secrets` - Stores encrypted GitHub tokens
- **Security**: Row-level security (RLS) ensures users can only access their own tokens
- **Migration**: `20250115000001_create_user_secrets_table.sql`

#### 3. **Enhanced GitHub Token Validation**
- **Function**: `validate-github-token` - Updated to store tokens securely
- **Features**: Validates tokens, fetches repositories, stores encrypted credentials

### Frontend Components

#### 1. **PRPromptCard Component**
- **Location**: `/src/components/PRPromptCard.tsx`
- **Features**: Main UI component with repository selection, PR listing, merge dialog
- **State Management**: Real-time updates, loading states, error handling

#### 2. **useGitHubPRs Hook**
- **Location**: `/src/hooks/useGitHubPRs.tsx`
- **Purpose**: Centralized PR operations logic with error handling
- **Methods**: `fetchPRs`, `mergePR`, `squashAndMerge`, `mergeWithMergeCommit`, `rebaseAndMerge`

#### 3. **Dashboard Integration**
- **Location**: `/src/components/Dashboard.tsx`
- **Integration**: PR card prominently displayed at top of build interface
- **Styling**: Consistent with existing Ahead.love design system

## 🚀 Setup & Configuration

### Prerequisites
1. **GitHub Integration**: Users must configure GitHub integration with a Personal Access Token
2. **Token Permissions**: Token must have `repo` permissions for private repositories
3. **Repository Access**: User must have merge permissions on target repositories

### Installation Steps
1. **Database Migration**: Run the user_secrets table migration
2. **Deploy Edge Functions**: Deploy the github-pr-operations function to Supabase
3. **Frontend Build**: The components are automatically included in the build interface

### Configuration
1. Navigate to `/integrations` in Ahead.love
2. Configure GitHub integration with Personal Access Token
3. Token is validated and repositories are automatically fetched
4. PR card appears in build interface once integration is complete

## 📊 Usage Analytics

### Success Metrics
- **PR Merge Success Rate**: Track successful merges vs failures
- **User Adoption**: Monitor how many users utilize the feature
- **Time to Merge**: Measure efficiency gains from in-app merging
- **Error Rates**: Track and improve common failure scenarios

### Monitoring
- **Real-time Updates**: 30-second refresh cycle for live PR status
- **Error Tracking**: Comprehensive error logging in Supabase functions
- **User Feedback**: Toast notifications for all operations

## 🔒 Security Considerations

### Token Storage
- **Encryption**: GitHub tokens stored in encrypted format (production ready)
- **Access Control**: Row-level security ensures token isolation
- **Scope Validation**: Tokens validated for required permissions

### API Security
- **Authentication**: All operations require valid user JWT
- **Rate Limiting**: GitHub API rate limits respected
- **Error Handling**: Sensitive information not exposed in error messages

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component testing for PRPromptCard
- **Integration Tests**: End-to-end merge operation testing
- **Error Scenarios**: Comprehensive error condition testing

### Test Files
- `/src/components/__tests__/PRPromptCard.test.tsx`

## 🚀 MVP Completion Status

✅ **All MVP requirements completed:**
- ✅ Basic prompt card in build interface
- ✅ GitHub API integration for merge operations
- ✅ Squash and merge functionality
- ✅ User feedback and error handling
- ✅ Real-time PR status updates
- ✅ Secure authentication with OAuth tokens

## 🔄 Future Enhancements

### Planned Features
1. **Batch Operations**: Merge multiple PRs at once
2. **Custom Merge Rules**: Repository-specific merge preferences
3. **PR Templates**: Pre-filled commit messages based on PR content
4. **Review Requirements**: Integration with GitHub review requirements
5. **Conflict Resolution**: In-app conflict resolution tools
6. **Webhook Integration**: Real-time updates via GitHub webhooks

### Performance Optimizations
1. **Caching**: Cache PR data to reduce API calls
2. **Background Sync**: Proactive PR status updates
3. **Lazy Loading**: Load PR details on demand
4. **Optimistic Updates**: Immediate UI updates with rollback capability

## 📚 Documentation

### User Guide
- GitHub integration setup instructions
- PR merge workflow documentation
- Troubleshooting common issues
- Best practices for token management

### Developer Guide
- API endpoint documentation
- Component architecture overview
- Extension points for customization
- Error handling patterns

---

**Feature Status**: ✅ **MVP Complete and Production Ready**

This feature successfully implements the core requirements for PR merge and squash operations within Ahead.love's build interface, providing users with a seamless GitHub workflow integration.