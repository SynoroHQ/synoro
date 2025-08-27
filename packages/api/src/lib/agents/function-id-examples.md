# Примеры functionId для агентов

Теперь каждый агент имеет свой уникальный `functionId`, который генерируется автоматически в формате:
`agent-{имя-агента}-{операция}`

## Примеры functionId для каждого агента:

### Q&A Specialist Agent
- `agent-qa-specialist-question-detection` - для определения типа вопроса
- `agent-qa-specialist-question-classification` - для классификации вопроса
- `agent-qa-specialist-system-info-search` - для поиска системной информации
- `agent-qa-specialist-answer-question` - для генерации ответа

### Event Processor Agent
- `agent-event-processor-event-type-detection` - для определения типа события
- `agent-event-processor-event-categorization` - для категоризации события
- `agent-event-processor-financial-extraction` - для извлечения финансовой информации

### Data Analyst Agent
- `agent-data-analyst-analytics-request-detection` - для определения аналитического запроса

### Chat Assistant Agent
- `agent-chat-assistant-chat-message-detection` - для определения типа чат-сообщения

### Financial Advisor Agent
- `agent-financial-advisor-financial-request-detection` - для определения финансового запроса

### Task Manager Agent
- `agent-task-manager-task-management-detection` - для определения запроса по управлению задачами

### Quality Evaluator Agent
- `agent-quality-evaluator-quality-evaluation` - для оценки качества ответа
- `agent-quality-evaluator-response-improvement` - для улучшения ответа

### Router Agent
- `agent-router-fallback-classification` - для fallback классификации
- `agent-router-route` - для маршрутизации

### Task Orchestrator Agent
- `agent-task-orchestrator-task-complexity-analysis` - для анализа сложности задачи
- `agent-task-orchestrator-step-quality-evaluation` - для оценки качества этапа
- `agent-task-orchestrator-generate-summary` - для генерации итогового резюме

### General Assistant Agent
- `agent-general-assistant-{операция}` - для различных операций общего помощника

## Преимущества новой системы:

1. **Уникальность**: Каждый агент имеет свой префикс в functionId
2. **Трассируемость**: Легко отследить, какой агент выполнял какую операцию
3. **Автоматизация**: functionId генерируется автоматически, не нужно вручную указывать
4. **Консистентность**: Единый формат для всех агентов
5. **Масштабируемость**: Легко добавлять новые агенты и операции

## Как это работает:

1. Агент вызывает `this.createTelemetry(operation, task, telemetry)`
2. Базовый класс автоматически генерирует `functionId` в формате `agent-{имя}-{операция}`
3. В телеметрию добавляется информация об агенте, задаче и контексте
4. Все вызовы AI функций получают уникальный functionId для трассировки
