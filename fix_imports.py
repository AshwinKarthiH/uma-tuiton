import os
import re

auth_funcs = ['getSession', 'saveSession', 'clearSession', 'isAdmin', 'isUser', 'isLoggedIn']

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    orig_content = content

    pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'\"].*?utils/datastore[\'\"];?')
    matches = list(pattern.finditer(content))
    
    # Process from the end so we don't mess up indices if string length changes
    for m in reversed(matches):
        full_match = m.group(0)
        imported_names = [n.strip() for n in m.group(1).split(',')]
        
        auth_imports = [n for n in imported_names if n in auth_funcs]
        other_imports = [n for n in imported_names if n not in auth_funcs]
        
        if not auth_imports:
            continue
            
        auth_path = full_match.split('utils/datastore')[0].split('from ')[1].strip('"\' ') + 'utils/auth'
        
        replacement = ''
        if other_imports:
            replacement += f"import {{ {', '.join(other_imports)} }} from '{full_match.split('utils/datastore')[0].split('from ')[1].strip('\"\' ')}utils/datastore';\n"
        replacement += f"import {{ {', '.join(auth_imports)} }} from '{auth_path}';"
        
        content = content[:m.start()] + replacement + content[m.end():]
        
    if content != orig_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {path}')

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            fix_file(os.path.join(root, f))
