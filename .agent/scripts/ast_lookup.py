import ast
import os
import sys

def find_definition(target_name, search_path="."):
    """
    Scans Python files in search_path to find the definition of target_name.
    Returns a list of matches (filename, lineno, type).
    """
    matches = []
    
    for root, _, files in os.walk(search_path):
        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                try:
                    with open(full_path, "r", encoding="utf-8") as f:
                        tree = ast.parse(f.read(), filename=full_path)
                        
                    for node in ast.walk(tree):
                        if isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
                            if node.name == target_name:
                                matches.append(f"{full_path}:{node.lineno} [{type(node).__name__}]")
                except Exception:
                    continue # Skip unparseable files

    return matches

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ast_lookup.py <SymbolName> [path]")
        sys.exit(1)
        
    target = sys.argv[1]
    path = sys.argv[2] if len(sys.argv) > 2 else "."
    
    results = find_definition(target, path)
    if results:
        print("\n".join(results))
    else:
        print(f"No definition found for '{target}' in '{path}'")
