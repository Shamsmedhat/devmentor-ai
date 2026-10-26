# Rose App tasks in the knowledge base

Not for ingestion - files starting with `_` are never ingested.

- `kb-docs/tasks/rose-task-*.md` - one file per task. The content does not mention a sprint, because a cohort can move a task between sprints.
- `kb-docs/sprints/rose-sprint-<n>.md` - which tasks are in that sprint for now. Moving a task to another sprint only means editing these files.

The `document_id` is the file name without `.md`.

## Add or update a task

```bash
yarn kb:ingest-doc kb-docs/tasks/rose-task-input.md rose-task-input --source-type task --by-section
```

Re-running with the same `document_id` replaces the old chunks.

## Update a sprint plan

```bash
yarn kb:ingest-doc kb-docs/sprints/rose-sprint-1.md rose-sprint-1 --source-type sprint --by-section
```

## Delete a task

```bash
yarn kb:delete-doc rose-task-input
```

Then delete the file and remove the task from the sprint plan (and re-ingest the sprint plan).
