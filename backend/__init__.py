import os, sys
# Ensure the backend directory is in the Python path for absolute imports like 'from db import ...'
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
