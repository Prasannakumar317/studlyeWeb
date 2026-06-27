import os, re

root = r'c:/studlyweb/studlyfv2/backend'
for dirpath, _, filenames in os.walk(root):
    for fname in filenames:
        if not fname.endswith('.py'):
            continue
        path = os.path.join(dirpath, fname)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'from services.' not in content:
            continue
        # Determine if file is inside services package
        rel = os.path.relpath(dirpath, root)
        if rel.startswith('services'):
            new_content = re.sub(r'from services\.', r'from .', content)
        else:
            new_content = re.sub(r'from services\.', r'from .services.', content)
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {path}')
