# Route Groups Structure

This project uses Next.js App Router with route groups to organize routes by functionality without affecting the URL structure.

## Route Groups

### `(auth)` - Authentication Routes
Routes for user authentication and authorization that don't require dashboard layout.

**URL Structure:**
- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/auth/forgot-password` - Password recovery page
- `/auth/reset-password` - Password reset page
- `/auth/verify-email` - Email verification page
- `/auth/otp` - One-time password page
- `/auth/profile` - User profile page
- `/auth/change-password` - Change password page
- `/auth/email-change` - Change email page
- `/auth/email-change-verification` - Email change verification page
- `/auth/logout` - Logout page
- `/auth/teams` - Teams management page
- `/auth/get-teams` - Get teams API page
- `/auth/get-profile` - Get profile API page
- `/auth/get-users` - Get users API page
- `/auth/create-user` - Create user API page
- `/auth/update-user` - Update user API page
- `/auth/delete-user` - Delete user API page
- `/auth/create-role` - Create role API page
- `/auth/update-role` - Update role API page
- `/auth/delete-role` - Delete role API page
- `/auth/generate-api-key` - Generate API key API page
- `/auth/revoke-api-key` - Revoke API key API page
- `/auth/list-api-keys` - List API keys API page
- `/auth/list-roles` - List roles API page
- `/auth/list-users` - List users API page
- `/auth/list-teams` - List teams API page
- `/auth/list-permissions` - List permissions API page
- `/auth/list-sessions` - List sessions API page

**Layout:** `app/(auth)/layout.tsx` - Provides authentication-specific layout with branding and quotes.

### `(dashboard)` - Dashboard Routes
Routes that require the dashboard layout with sidebar and header.

**URL Structure:**
- `/dashboard` - Main dashboard page (redirects to overview)
- `/dashboard/overview` - Dashboard overview page
- `/dashboard/auth` - Authentication management (redirects to overview)
- `/dashboard/auth/overview` - Auth overview with stats and activity
- `/dashboard/auth/users` - User management page
- `/dashboard/auth/roles` - Role management page
- `/dashboard/auth/api-keys` - API key management page

**Layout:** `app/(dashboard)/layout.tsx` - Provides dashboard layout with AppSidebar.

## Benefits of Route Groups

1. **Organizational Structure**: Routes are grouped by functionality (auth vs dashboard)
2. **No URL Impact**: Route groups don't affect the actual URL structure
3. **Shared Layouts**: Each group can have its own layout without affecting others
4. **Team Collaboration**: Different teams can work on different route groups
5. **Code Organization**: Related routes are kept together in the file system

## File Naming Convention

- Route groups use parentheses: `(auth)`, `(dashboard)`
- Each group has its own `layout.tsx` file
- Pages within groups follow Next.js App Router conventions
- All pages use Suspense boundaries for loading states
- Skeleton components provide consistent loading experiences

## Migration Notes

- Old routes in `app/dashboard/` are preserved for backward compatibility
- New routes use the route group structure
- All new development should use the route group structure
- Features are organized in `src/features/` directory
- UI components are imported from `@synoro/ui` package
