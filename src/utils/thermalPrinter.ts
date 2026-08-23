/**
 * Safe, non-blocking thermal and formal receipt printer utility.
 * Uses an isolated hidden iframe so the main React DOM and state never freeze.
 */

export interface PrintTicketOptions {
  title?: string;
  htmlContent: string;
}

export function printTicketSafely(options: PrintTicketOptions): void {
  try {
    // Check if an existing print iframe exists and remove it
    const existingIframe = document.getElementById('vetcare-print-iframe');
    if (existingIframe) {
      document.body.removeChild(existingIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'vetcare-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      // Fallback: direct window print
      window.print();
      return;
    }

    const title = options.title || 'Comprobante VetCare Pro';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            @page {
              margin: 4mm;
              size: auto;
            }
            *, *:before, *:after {
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace, system-ui;
              font-size: 11.5px;
              line-height: 1.35;
              color: #000000;
              background-color: #ffffff;
              margin: 0;
              padding: 6px;
              width: 100%;
              max-width: 320px;
              margin-left: auto;
              margin-right: auto;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .divider {
              border-bottom: 1px dashed #444;
              margin: 6px 0;
            }
            .double-divider {
              border-bottom: 2px solid #000;
              margin: 6px 0;
            }
            .flex-between {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .grid-table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
            }
            .grid-table th {
              border-bottom: 1px solid #000;
              padding: 3px 0;
              font-size: 10px;
              text-transform: uppercase;
            }
            .grid-table td {
              padding: 3px 0;
              font-size: 11px;
            }
            .tag {
              display: inline-block;
              font-size: 9px;
              font-weight: bold;
              border: 1px solid #000;
              padding: 0 3px;
              margin-right: 2px;
            }
            @media print {
              body {
                width: 100%;
                max-width: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${options.htmlContent}
        </body>
      </html>
    `);
    doc.close();

    // Give browser brief time to render styles then print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Error invoking print on iframe:', err);
      } finally {
        // Remove iframe after print dialog completes or is closed
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 150);
  } catch (e) {
    console.error('Fatal error in printTicketSafely:', e);
    // Fallback: window.print
    window.print();
  }
}
