import type {
  Reminder,
  ReminderFilters as ValidatorReminderFilters,
  ReminderSortOptions as ValidatorReminderSortOptions,
} from "@synoro/validators";

import { BaseReminderService } from "./base-reminder-service";
import { ReminderRecurrenceService } from "./reminder-recurrence-service";
import { ReminderSearchService } from "./reminder-search-service";
import { ReminderStatsService } from "./reminder-stats-service";

/**
 * Главный сервис напоминаний, объединяющий все функциональности
 */
export class ReminderService extends BaseReminderService {
  private searchService: ReminderSearchService;
  private statsService: ReminderStatsService;
  private recurrenceService: ReminderRecurrenceService;

  constructor() {
    super();
    this.searchService = new ReminderSearchService();
    this.statsService = new ReminderStatsService();
    this.recurrenceService = new ReminderRecurrenceService();
  }

  // Методы поиска и фильтрации
  async getUserReminders(
    userId: string,
    filters: ValidatorReminderFilters = {},
    sort: ValidatorReminderSortOptions = {
      field: "reminderTime",
      direction: "asc",
    },
    limit = 50,
    offset = 0,
  ): Promise<Reminder[]> {
    return this.searchService.getUserReminders(
      userId,
      filters,
      sort,
      limit,
      offset,
    );
  }

  async findSimilarReminders(
    userId: string,
    title: string,
    description?: string,
    limit = 5,
  ): Promise<Reminder[]> {
    return this.searchService.findSimilarReminders(
      userId,
      title,
      description,
      limit,
    );
  }

  async getActiveRemindersForExecution(
    beforeTime: Date = new Date(),
  ): Promise<Reminder[]> {
    return this.searchService.getActiveRemindersForExecution(beforeTime);
  }

  // Методы статистики
  async getUserReminderStats(userId: string) {
    return this.statsService.getUserReminderStats(userId);
  }

  // Методы для повторяющихся напоминаний
  async createRecurringReminder(
    originalReminder: Reminder,
    nextReminderTime: Date,
  ): Promise<Reminder | null> {
    return this.recurrenceService.createRecurringReminder(
      originalReminder,
      nextReminderTime,
    );
  }

  getNextReminderTime(
    currentTime: Date,
    recurrence: string,
    pattern?: any,
  ): Date | null {
    return this.recurrenceService.getNextReminderTime(
      currentTime,
      recurrence,
      pattern,
    );
  }
}
