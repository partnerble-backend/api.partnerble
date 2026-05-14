---
skill: harness
description: Execute Partnerble backend development tasks with multi-agent workflow
---

You are the harness orchestrator for Partnerble backend development.

When the user runs `/harness`, you coordinate a team of specialized agents to execute tasks from `.claude/tasks/` folder.

## Your Role

Orchestrate the multi-agent workflow by spawning specialized agents in sequence and managing the overall task execution pipeline.

## Workflow

For each task file in `.claude/tasks/` (in alphabetical order):

0. **Create Branch**
   - Feature ID를 확인한다. origin에 `feature/*/base` 브랜치가 없으면 사용자에게 묻는다.
   - **Task 브랜치**: `feature/[feature-id]/[task-filename-without-extension]`
   - **Relay 방식**: 첫 번째 task → base에서 생성, 이후 task → 직전 task 브랜치에서 생성

1. **Spawn Planner Agent**
   - Pass task file path
   - Receive implementation plan (modules, controllers, services, DTOs, migrations)
   - Report plan summary to user

2. **Spawn Validator Agent**
   - Pass Planner's output
   - Validate terminology, DTO conventions, API design, Prisma naming
   - Report validation results to user

3. **Spawn Questioner Agent**
   - Pass Planner + Validator outputs
   - Agent will ask user questions directly using AskUserQuestion
   - Receive admin answers summary

4. **Spawn Implementer Agent**
   - Pass all previous outputs
   - Implement NestJS modules, controllers, services, DTOs
   - Run `pnpm prisma migrate dev` if schema changes needed
   - Run `pnpm lint`

5. **Spawn QA Agent**
   - Pass Implementer's output
   - Run `pnpm lint`, check code quality, verify Prisma migration
   - If APPROVED → proceed to step 6
   - If FAILED → Spawn Implementer again with fixes

6. **Commit, Push & Create PR**
   - `git add -A`
   - Commit with descriptive message
   - Push: `git push -u origin feature/[feature-id]/[task]`
   - `gh pr create` with relay base branch
   - Report PR URL to user

## Agent Definitions

All agents are defined in `.claude/agents/`:
- `planner.md` — NestJS task analysis and planning
- `validator.md` — Terminology, DTO, API convention validation
- `questioner.md` — Admin questions and clarification
- `implementer.md` — NestJS code implementation
- `qa.md` — Lint, test, Prisma schema validation

## How to Spawn Agents

Use the Agent tool with `subagent_type`:

```
Agent tool:
- description: "Plan phase-1-application task"
- prompt: "You are the Planner agent. Read .claude/agents/planner.md for your instructions. Then analyze .claude/tasks/phase-1-application.md and create an implementation plan."
- subagent_type: "planner"
```

## Completion

모든 task가 완료되면:

1. `feature/[feature-id]/base` 브랜치로 체크아웃
2. `.claude/tasks/` 내 task md 파일 전체 제거 (`TEMPLATE.md` 제외)
3. 커밋 후 push
4. 관리자에게 Final PR 생성 안내 (`feature/[feature-id]/base` → `dev`)

## Important Notes

- Execute tasks **sequentially** (one at a time)
- Never commit directly to `main` or `feature/[feature-id]/base`
- Prisma migration files are committed as part of the implementation
- **⛔ 절대 금지**: `main` 브랜치에 push하거나 머지하지 않는다
