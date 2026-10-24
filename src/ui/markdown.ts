// Sehr kleines Markdown: Absätze, Aufzählungen, Codeblöcke (```), `Code`, **fett**, *kursiv*.
// Eingaben werden immer zuerst escaped – Lektionen können kein HTML einschleusen.
import { escapeHtml } from './dom';
import { zeilenHervorheben } from './highlight';

function codeblock(zeilen: string[]): string {
  const sprache = zeilen[0].replace(/^\s*```/, '').trim() || 'rust';
  const inhalt = zeilen.slice(1, zeilen[zeilen.length - 1].trim() === '```' ? -1 : undefined);
  const html = zeilenHervorheben(inhalt, sprache).map((z) => `<span class="zeile">${z || ' '}</span>`).join('');
  return `<div class="code-figur md-code"><pre class="code"><code>${html}</code></pre></div>`;
}

export function inline(text: string): string {
  return text
    .split('`')
    .map((teil, i) => {
      const e = escapeHtml(teil);
      if (i % 2 === 1) return `<code>${e}</code>`;
      return e
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    })
    .join('');
}

export function md(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const zeilen = block.split('\n');
      if (/^\s*```/.test(zeilen[0])) return codeblock(zeilen);
      if (zeilen.every((z) => /^\s*[-•] /.test(z))) {
        return `<ul>${zeilen.map((z) => `<li>${inline(z.replace(/^\s*[-•] /, ''))}</li>`).join('')}</ul>`;
      }
      if (zeilen.every((z) => /^\s*\d+\. /.test(z))) {
        return `<ol>${zeilen.map((z) => `<li>${inline(z.replace(/^\s*\d+\. /, ''))}</li>`).join('')}</ol>`;
      }
      return `<p>${zeilen.map(inline).join('<br>')}</p>`;
    })
    .join('');
}
