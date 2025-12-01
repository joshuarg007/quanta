# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

QUANTA is an interactive quantum computing learning platform with:
- **Backend**: FastAPI (Python) - API server with quantum simulation
- **Frontend**: React + TypeScript + Vite - Interactive UI with circuit builder

## Commands

```bash
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# Build
cd frontend && npm run build
```

## Code Conventions

- **Git commits:** Never include Claude as a contributor. Do not add `Co-Authored-By: Claude` or `Generated with Claude Code` lines to commit messages unless explicitly requested by the user.
- **TypeScript:** Use strict types, avoid `any` where possible
- **Python:** Follow PEP 8, use type hints
- **Components:** Keep lesson section components in `frontend/src/components/lessons/sections/`
- **Lessons:** Add new lessons in `backend/app/curriculum/lessons/`
