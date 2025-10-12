/**
 * Types for database tools used by multi-agent system
 */

export interface GetUserEventsInput {
  userId?: string;
  householdId: string;
  limit?: number;
  offset?: number;
  type?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface GetEventByIdInput {
  eventId: string;
  householdId: string;
}

export interface GetUserStatsInput {
  userId?: string;
  householdId: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export interface SearchEventsInput {
  householdId: string;
  userId?: string;
  query: string;
  limit?: number;
  type?: string;
}

export interface GetRecentEventsInput {
  householdId: string;
  userId?: string;
  days?: number;
  limit?: number;
}

export interface GetUpcomingTasksInput {
  householdId: string;
  userId?: string;
  days?: number;
  limit?: number;
}

export interface GetExpenseSummaryInput {
  householdId: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  currency?: string;
}

export interface EventProperty {
  key: string;
  value: unknown;
}

export interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface EventWithDetails {
  id: string;
  householdId: string;
  userId: string | null;
  source: string;
  type: string;
  status: string;
  priority: string;
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  title: string | null;
  notes: string | null;
  amount: string | null;
  currency: string;
  data: Record<string, unknown> | null;
  properties: EventProperty[];
  tags: Tag[];
  assets?: Asset[];
}

export interface UserStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCurrency: Record<
    string,
    { totalAmount: number; averageAmount: number; count: number }
  >;
}

export interface SearchResult {
  events: EventWithDetails[];
  total: number;
  query: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  currency: string;
  byType: Record<string, { count: number; amount: number }>;
  byPeriod: Record<string, { count: number; amount: number }>;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}
