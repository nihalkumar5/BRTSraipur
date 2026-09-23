const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');
  if (!html.includes('/_vercel/insights/script.js')) {
    const snippet = `
    <!-- Vercel Web Analytics & Speed Insights -->
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
    <script>
      window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/speed-insights/script.js"></script>
  </head>`;
    html = html.replace('</head>', snippet);
    fs.writeFileSync(indexPath, html, 'utf-8');
    console.log('[inject-vercel-analytics] Injected Vercel Analytics scripts into dist/index.html');
  }
}
