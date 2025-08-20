import { Template } from '../types';

export async function exportToPDF(template: Template) {
  // In a real application, this would use a PDF generation library
  // For now, we'll just create a simple HTML version
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${template.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <h1>${template.title}</h1>
        ${template.sections.map(section => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div>${section.content}</div>
          </div>
        `).join('')}
      </body>
    </html>
  `;

  // Create a Blob from the HTML
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create a link and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.title.toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}