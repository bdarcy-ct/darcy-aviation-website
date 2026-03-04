import markdown
from weasyprint import HTML

with open('HANDOFF-GUIDE-v2.md', 'r') as f:
    md_content = f.read()

html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {{
    size: letter;
    margin: 1in 0.85in;
    @bottom-center {{
      content: "Darcy Aviation — Handoff Guide v2 | Page " counter(page) " of " counter(pages);
      font-size: 9px;
      color: #888;
    }}
  }}
  body {{
    font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    max-width: 100%;
  }}
  h1 {{
    font-size: 22pt;
    color: #0f172a;
    border-bottom: 3px solid #d4af37;
    padding-bottom: 10px;
    margin-top: 0;
  }}
  h2 {{
    font-size: 16pt;
    color: #1e3a5f;
    border-bottom: 1px solid #ddd;
    padding-bottom: 6px;
    margin-top: 28px;
    page-break-after: avoid;
  }}
  h3 {{
    font-size: 13pt;
    color: #2d5a88;
    margin-top: 20px;
    page-break-after: avoid;
  }}
  h4 {{
    font-size: 11pt;
    color: #3b82f6;
    margin-top: 16px;
    page-break-after: avoid;
  }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 10pt;
  }}
  th {{
    background-color: #0f172a;
    color: white;
    padding: 8px 12px;
    text-align: left;
    font-weight: 600;
  }}
  td {{
    border: 1px solid #ddd;
    padding: 7px 12px;
  }}
  tr:nth-child(even) {{
    background-color: #f8f9fa;
  }}
  code {{
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 9.5pt;
    color: #c7254e;
  }}
  pre {{
    background: #f1f5f9;
    padding: 12px 16px;
    border-radius: 6px;
    border-left: 4px solid #3b82f6;
    overflow-x: auto;
    font-size: 9.5pt;
  }}
  ol, ul {{
    padding-left: 24px;
  }}
  li {{
    margin-bottom: 4px;
  }}
  strong {{
    color: #0f172a;
  }}
  hr {{
    border: none;
    border-top: 2px solid #e2e8f0;
    margin: 24px 0;
  }}
  p {{
    margin: 8px 0;
  }}
  blockquote {{
    border-left: 4px solid #d4af37;
    margin: 12px 0;
    padding: 8px 16px;
    background: #fffbeb;
    color: #92400e;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

HTML(string=full_html).write_pdf('Darcy-Aviation-Handoff-Guide-v2.pdf')
print("PDF generated successfully!")
