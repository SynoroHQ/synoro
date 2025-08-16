# Migration Guide: Route Groups

This guide explains how to migrate from the old structure to the new route groups structure.

## What Changed

### Before (Old Structure)

```
app/
├── dashboard/
│   ├── auth/
│   │   ├── overview/
│   │   ├── users/
│   │   ├── roles/
│   │   └── api-keys/
│   ├── overview/
│   ├── monitors/
│   ├── notifiers/
│   ├── onboarding/
│   ├── settings/
│   └── status-pages/
└── status-page/
```

### After (New Structure)

```
app/
├── (auth)/
│   └── auth/
│       ├── login/
│       ├── register/
│       ├── forgot-password/
│       ├── profile/
│       ├── teams/
│       └── ... (all auth-related pages)
├── (dashboard)/
│   └── dashboard/
│       ├── overview/
│       ├── auth/
│       │   ├── overview/
│       │   ├── users/
│       │   ├── roles/
│       │   └── api-keys/
│       ├── monitors/
│       ├── notifiers/
│       ├── onboarding/
│       ├── settings/
│       └── status-pages/
├── dashboard/ (legacy - preserved for backward compatibility)
└── status-page/
```

## Migration Steps

### 1. Update Imports

**Old:**

```tsx
import { CreateUserDialog } from "@/components/forms/auth/create-user-dialog";
```

**New:**

```tsx
import { CreateUserDialog } from "@/features/auth/components/create-user-dialog";
```

### 2. Update Route References

**Old:**

```tsx
<Link href="/dashboard/auth/users">Users</Link>
```

**New:**

```tsx
<Link href="/dashboard/auth/users">Users</Link>
// URL remains the same, but structure is organized better
```

### 3. Update Navigation Components

**Old:**

```tsx
// In navigation components
const routes = [
  { href: "/dashboard/auth/users", label: "Users" },
  { href: "/dashboard/auth/roles", label: "Roles" },
];
```

**New:**

```tsx
// In navigation components
const routes = [
  { href: "/dashboard/auth/users", label: "Users" },
  { href: "/dashboard/auth/roles", label: "Roles" },
];
// URLs remain the same, but pages are now in route groups
```

### 4. Update Layout Imports

**Old:**

```tsx
// In dashboard pages
import { AppSidebar } from "@/components/nav/app-sidebar";
```

**New:**

```tsx
// In dashboard pages - layout is now handled by route group
// No need to import AppSidebar in individual pages
```

## Benefits of Migration

1. **Better Organization**: Auth and dashboard routes are clearly separated
2. **Shared Layouts**: Each route group has its own layout
3. **Easier Maintenance**: Related routes are grouped together
4. **Team Collaboration**: Different teams can work on different route groups
5. **Future-Proof**: Follows Next.js best practices

## Backward Compatibility

- Old routes in `app/dashboard/` are preserved
- All existing URLs continue to work
- Gradual migration is possible
- No breaking changes to existing functionality

## Next Steps

1. **Immediate**: Use new route groups for new development
2. **Short-term**: Migrate existing pages to use new features structure
3. **Long-term**: Remove old dashboard structure when all pages are migrated

## Testing

After migration:

1. Verify all routes work correctly
2. Check that layouts are applied properly
3. Ensure navigation still works
4. Test loading states and error boundaries
5. Verify that old routes still function

## Support

If you encounter issues during migration:

1. Check the README.md for route group structure
2. Verify imports are using the new features structure
3. Ensure route group layouts are properly configured
4. Check that page components are using Suspense boundaries
