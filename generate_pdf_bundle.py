from pathlib import Path
import re
from fpdf import FPDF

ROOT = Path(r"c:\Users\MANASWINI\Downloads\mediassist_ai (1)")
OUTPUT = ROOT / "mediassist_project_bundle.pdf"
IGNORED_DIRS = {
    '.git', '.venv', '.venv-1', '__pycache__', 'workspaceStorage', 'node_modules',
    'mediassist_project_all_files.txt', 'mediassist_bundle.md', 'mediassist_full_bundle.md'
}
SKIP_EXT = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp', '.pdf', '.zip'}

PAGE_WIDTH = 210
PAGE_HEIGHT = 297
MARGIN = 10
LINE_HEIGHT = 5
FONT_SIZE = 8


def sanitize_text(text: str) -> str:
    return re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)


def collect_files(root: Path):
    files = []
    for path in sorted(root.rglob('*')):
        if not path.is_file():
            continue
        if any(part in IGNORED_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in SKIP_EXT:
            files.append((path, 'binary'))
            continue
        files.append((path, 'text'))
    return files


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8')
    except Exception:
        try:
            return path.read_text(encoding='latin-1', errors='replace')
        except Exception:
            return ''


class BundlePDF(FPDF):
    def header(self):
        self.set_font('Courier', 'B', 12)
        self.set_text_color(0, 0, 0)
        self.cell(0, 8, 'MediAssist Project Bundle', ln=True, align='L')
        self.ln(2)

    def footer(self):
        self.set_y(-12)
        self.set_font('Courier', '', 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 6, f'Page {self.page_no()}', align='R')


def safe_text(text: str) -> str:
    return text.encode('latin-1', errors='replace').decode('latin-1')


def add_heading(pdf: BundlePDF, text: str):
    pdf.set_font('Courier', 'B', 10)
    pdf.set_text_color(0, 53, 102)
    pdf.multi_cell(0, LINE_HEIGHT + 1, safe_text(text))
    pdf.ln(1)
    pdf.set_font('Courier', '', FONT_SIZE)
    pdf.set_text_color(0, 0, 0)


def add_content(pdf: BundlePDF, text: str):
    pdf.set_font('Courier', '', FONT_SIZE)
    pdf.set_text_color(0, 0, 0)
    for line in text.splitlines() or ['']:
        pdf.multi_cell(0, LINE_HEIGHT, safe_text(line.replace('\t', '    ')), align='L')


def build_pdf():
    files = collect_files(ROOT)
    pdf = BundlePDF(format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font('Courier', '', FONT_SIZE)

    pdf.multi_cell(0, LINE_HEIGHT + 2, safe_text('Generated from workspace files.'))
    pdf.ln(4)

    for path, ftype in files:
        rel = path.relative_to(ROOT)
        pdf.add_page()
        add_heading(pdf, str(rel))
        if ftype == 'binary':
            pdf.multi_cell(0, LINE_HEIGHT, safe_text(f'[Binary file skipped: {path.suffix}]'))
            continue

        text = read_text(path)
        text = sanitize_text(text)
        if not text:
            pdf.multi_cell(0, LINE_HEIGHT, safe_text('[Empty or unreadable file]'))
            continue

        add_content(pdf, text)

    pdf.output(str(OUTPUT))
    print('Saved', OUTPUT)


if __name__ == '__main__':
    build_pdf()
