# Changes Summary

## Asset Management System

### New Features

1. **Assets Table** (`packages/db/src/schemas/core/asset.ts`)
   - Created table for storing household assets (vehicles, buildings, appliances, etc.)
   - Supports different asset types: vehicle, building, appliance, electronics, furniture, tool, other
   - Asset statuses: active, inactive, maintenance, sold, disposed
   - Flexible metadata field for type-specific information (VIN, address, serial numbers, etc.)

2. **Event-Asset Linking** (`packages/db/src/schemas/events/event-asset.ts`)
   - Many-to-many relationship between events and assets
   - Allows tracking which events are related to which assets
   - Enables analytics like "all maintenance events for this car"

3. **Asset Service** (`packages/api/src/lib/services/asset-service.ts`)
   - CRUD operations for assets
   - Link events to assets
   - Get all events for a specific asset
   - Soft delete support

4. **Database Migration**
   - Generated migration: `migrations/0003_milky_typhoid_mary.sql`
   - Run with: `bun run migrate` in packages/db

### Updated Features

1. **Event Service**
   - Updated `EventWithDetails` type to include `assets` field
   - Events now return linked asset information

2. **Database Tools Service**
   - All event queries now include asset information
   - Created `formatEvent` helper function for consistent formatting

3. **General Assistant Agent** - **MAJOR REFACTOR**
   - **Removed hardcoded Russian language logic**
   - **Removed date parsing from code** - now handled by AI
   - **Added `getUserEvents` tool** - AI decides when and how to fetch events
   - AI now determines:
     - When to fetch events based on user request
     - Appropriate date ranges (yesterday, last week, etc.)
     - Event type filters
   - Language-agnostic implementation
   - Tool-based architecture for better flexibility

4. **Prompt Updates**
   - Converted to English for language-agnostic operation
   - Added tool usage instructions
   - Removed hardcoded event context placeholder
   - AI now uses tools to fetch data dynamically

## Benefits

1. **Asset Tracking**: Track maintenance, expenses, and events for specific assets
2. **Better Analytics**: Query "all expenses for my car" or "maintenance history for the building"
3. **Flexible Metadata**: Store asset-specific information without schema changes
4. **AI-Driven Logic**: Date parsing and event filtering now handled by AI, not hardcoded
5. **Language Independent**: Works with any language, not just Russian
6. **Tool-Based**: More flexible and extensible architecture

## Usage Examples

### Create an Asset

```typescript
const assetService = new AssetService();
const car = await assetService.createAsset({
  householdId: "household_123",
  type: "vehicle",
  name: "Toyota Camry 2020",
  metadata: {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    vin: "1HGBH41JXMN109186",
    licensePlate: "ABC123",
    mileage: 50000,
  },
});
```

### Link Event to Asset

```typescript
await assetService.linkEventToAsset(eventId, assetId);
```

### Get Asset Events

```typescript
const events = await assetService.getAssetEvents({
  assetId: "asset_123",
  householdId: "household_123",
  limit: 50,
});
```

### AI-Driven Event Queries

User: "Show me my expenses from yesterday"

- AI automatically determines date range
- AI calls getUserEvents tool with appropriate parameters
- AI formats and presents results

User: "What did I spend last month?"

- AI calculates date range for last month
- AI filters by purchase type
- AI presents formatted results

## Migration Steps

1. Run database migration:

   ```bash
   cd packages/db
   bun run migrate
   ```

2. Update Langfuse prompts:
   - Sync the new English prompt for general-assistant-agent
   - The prompt now includes tool usage instructions

3. Test the new functionality:
   - Create some assets
   - Link events to assets
   - Ask AI about events in different languages
   - Verify AI correctly determines date ranges

## Breaking Changes

- `EventWithDetails` type now includes optional `assets` field
- General Assistant Agent no longer has hardcoded Russian keywords
- Prompt template changed from Russian to English (update in Langfuse)
