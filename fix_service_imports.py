import pathlib, re, sys
root = pathlib.Path(r'c:/studlyweb/studlyfv2/backend/services')
for py_path in root.rglob('*.py'):
    try:
        text = py_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f'Error reading {py_path}: {e}', file=sys.stderr)
        continue
    if 'from .db import' in text:
        new_text = re.sub(r'^from \.db import', r'from ..db import', text, flags=re.MULTILINE)
        if new_text != text:
            py_path.write_text(new_text, encoding='utf-8')
            print(f'Updated {py_path}')
