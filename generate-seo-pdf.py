import markdown
from weasyprint import HTML

with open('Darcy-Aviation-SEO-Report.md', 'r') as f:
    md_content = f.read()

html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {{
    size: letter;
    margin: 0.9in 0.8in;
    @bottom-center {{
      content: "Darcy Aviation — SEO Report | Page " counter(page) " of " counter(pages);
      font-size: 9px;
      color: #888;
    }}
  }}
  body {{
    font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1a1a1a;
  }}
  h1 {{
    font-size: 24pt;
    color: #0f172a;
    border-bottom: 3px solid #3b82f6;
    padding-bottom: 12px;
    margin-top: 0;
  }}
  h2 {{
    font-size: 16pt;
    color: #1e3a5f;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 30px;
    page-break-after: avoid;
    page-break-before: auto;
  }}
  h3 {{
    font-size: 13pt;
    color: #2d5a88;
    margin-top: 22px;
    page-break-after: avoid;
  }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 14px 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }}
  tr {{
    page-break-inside: avoid;
  }}
  th {{
    background: linear-gradient(135deg, #0f172a, #1e3a5f);
    color: white;
    padding: 10px 14px;
    text-align: left;
    font-weight: 600;
  }}
  td {{
    border: 1px solid #e2e8f0;
    padding: 8px 14px;
  }}
  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}
  code {{
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 9.5pt;
    color: #3b82f6;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  }}
  pre {{
    background: #0f172a;
    color: #e2e8f0;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 9.5pt;
    line-height: 1.6;
    page-break-inside: avoid;
  }}
  p {{
    orphans: 3;
    widows: 3;
  }}
  pre code {{
    background: none;
    color: #e2e8f0;
    padding: 0;
  }}
  ol, ul {{
    padding-left: 24px;
    page-break-inside: avoid;
  }}
  li {{
    margin-bottom: 5px;
    page-break-inside: avoid;
  }}
  strong {{
    color: #0f172a;
  }}
  hr {{
    border: none;
    border-top: 2px solid #e2e8f0;
    margin: 28px 0;
  }}
  p {{
    margin: 8px 0;
  }}
  blockquote {{
    border-left: 4px solid #3b82f6;
    margin: 14px 0;
    padding: 10px 18px;
    background: #eff6ff;
    color: #1e40af;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }}
  a {{
    color: #3b82f6;
    text-decoration: none;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

HTML(string=full_html).write_pdf('Darcy-Aviation-SEO-Report.pdf')
print("SEO PDF generated!")
