---
name: Code Search (AST Lookup)
description: Use the provided script to find definitions without wasting context.
---

# Skill: Smart Code Search

## When to use
- You see an import `from .models import UserProfile` and need to know where `UserProfile` is defined.
- You need to find a function logic but don't know the file name.
- **Goal**: Avoid opening random files with `view_file`.

## How to use
Run the `ast_lookup.py` script provided in the kit.

### Command
```bash
python3 .agent/scripts/ast_lookup.py <SymbolName> <RootPath>
```

### Example
**User Request**: "Update the calculate_total function."
**Agent Action**: "I don't know where that function is. I will search for it."

```bash
python3 .agent/scripts/ast_lookup.py calculate_total .
```

**Output**:
`./sales/utils.py:42 [FunctionDef]`

**Next Step**:
Now you can confidently run:
`view_file ./sales/utils.py` (focusing on line 42).
