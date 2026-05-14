# Agent Definitions

This directory contains the agent definitions for the Partnerble backend multi-agent workflow.

## Agents

| Agent | File | Role |
|---|---|---|
| Planner | `planner.md` | Task analysis and NestJS implementation planning |
| Validator | `validator.md` | Terminology, DTO, API convention validation |
| Questioner | `questioner.md` | Clarification and admin Q&A |
| Implementer | `implementer.md` | NestJS code implementation |
| QA | `qa.md` | Lint, test, Prisma schema validation |
| Orchestrator | `orchestrator.md` | Multi-agent workflow coordination |

## Usage

These agents are invoked by the `/harness` skill in sequence for each task file in `.claude/tasks/`.
