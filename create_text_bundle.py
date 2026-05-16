from pathlib import Path
import re

root = Path(r"c:\Users\MANASWINI\Downloads\mediassist_ai (1)")
output = root / 'mediassist_project_all_files.txt'
ignored_dirs = {'.git', '.venv', '.venv-1', '__pycache__', 'workspaceStorage'}

if output.exists():
    output.unlink()

with output.open('w', encoding='utf-8', errors='replace') as out:
    out.write('MediAssist Project Files\n')
    out.write('Generated from workspace files.\n\n')

    for path in sorted(root.rglob('*')):
        if not path.is_file():
            continue
        if any(part in ignored_dirs for part in path.parts):
            continue
        if path.suffix.lower() in {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp', '.pdf'}:
            continue
        rel = path.relative_to(root)
        out.write('=' * 80 + '\n')
        out.write(f'File: {rel}\n')
        out.write('=' * 80 + '\n\n')
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            text = path.read_text(encoding='latin-1', errors='replace')
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        out.write(text)
        out.write('\n\n')
print('Created', output.name)
