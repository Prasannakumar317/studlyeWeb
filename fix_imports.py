import pathlib, re, sys
root = pathlib.Path(r'c:/studlyweb/studlyfv2/backend')
for py_path in root.rglob('*.py'):
    try:
        text = py_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f'Error reading {py_path}: {e}', file=sys.stderr)
        continue
    new_text = text
    # Replace imports
    new_text = re.sub(r'^from routes\\.', r'from .routes.', new_text, flags=re.MULTILINE)
    new_text = re.sub(r'^from services\\.', r'from .services.', new_text, flags=re.MULTILINE)
    new_text = re.sub(r'^from db import', r'from .db import', new_text, flags=re.MULTILINE)
    new_text = re.sub(r'^from auth_utils import', r'from .auth_utils import', new_text, flags=re.MULTILINE)
    new_text = re.sub(r'^from notification_helpers import', r'from .notification_helpers import', new_text, flags=re.MULTILINE)
    # Also handle imports inside subpackages like "from ..auth_utils" already relative; skip.
    if new_text != text:
        py_path.write_text(new_text, encoding='utf-8')
        print(f'Updated {py_path}')
