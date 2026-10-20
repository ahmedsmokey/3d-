---
description: Scan the codebase and generate a MASTER_CONTEXT.md file to minimize future context loading.
---

# Workflow: Generate Project Index

## 1. Preparation
Create a dedicated folder for agent context.
```bash
mkdir -p .agent/docs
```

## 2. Model Mapping
Scan all `models.py` files. Create `.agent/docs/MODEL_MAP.md`.
For each App:
- List every Model class.
- List vital fields (PK, ForeignKeys, ManyToMany).
- **Ignore** routine CharFields/IntFields unless critical for business logic.

## 3. API Surface Mapping
Scan all `urls.py` and `views.py`. Create `.agent/docs/API_MAP.md`.
- List every URL pattern.
- Map URL -> View Class/Function.
- Note the Permission Classes (e.g., `IsAuthenticated`).

## 4. Business Logic Index
Scan for `services.py`, `selectors.py`, or `tasks.py`. Create `.agent/docs/LOGIC_MAP.md`.
- List public functions/classes in these files.
- One-line summary of what they do (from docstrings).

## 5. Master Context Compilation
Create `.agent/docs/MASTER_CONTEXT.md`.
Combine the above into a single high-density file.
- **Header**: Project Name & Tech Stack Summary.
- **Section 1**: Core Data Models (Paste content from MODEL_MAP).
- **Section 2**: Key Workflows/APIs (Paste critical endpoints from API_MAP).
- **Section 3**: Unknowns/Todos (List things the agent sees as "TODO" in code).

## 6. Usage Instruction
Append this instruction to the file:
> "To understand this project, read this file first. Only check source code for implementation details."
