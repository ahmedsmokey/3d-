---
name: Check Context Protocol
description: A strict protocol to ensure no missing context before acting.
---

# Skill: Check Context

## When to use
- **ALWAYS** at the beginning of a complex task.
- When opening a new file you haven't seen before.
- When the user asks "Fix this" without specifying "this".
- When you are about to import a local module using `from .utils import ...` and you don't know what's in `utils`.

## Steps

### 1. The Inventory Check
Ask yourself:
- Do I know the **Model** definitions for the data I am handling?
- Do I know the **URL** structure if I am adding a View?
- Do I know the **Design System** (CSS classes/Variables) if I am building UI?

### 2. The Discovery Actions
If the answer to any of the above is "No", you must finding it **YOURSELF** first.
- run `list_dir` to find file structure.
- run `find_by_name` to locate specific models/views.
- run `grep_search` to find usages of a variable.
- run `view_file` to read the definitions.

### 3. The Stop Trigger
If you have tried "Discovery Actions" and still cannot find the context (e.g., file context is missing from workspace, or the user referred to something external), you must **STOP**.

**Output this to the user via `notify_user`**:
> "I am pausing to preserve context accuracy. You mentioned [X], but I cannot find a definition for it in [Y]. Could you please point me to the correct file or definition?"

## Example Checklist
**Before coding `views.py`**:
- [ ] Read `models.py` (Do I know the fields?)
- [ ] Read `serializers.py` (Do I know the validation logic?)
- [ ] Read `permissions.py` (Who can access this?)
