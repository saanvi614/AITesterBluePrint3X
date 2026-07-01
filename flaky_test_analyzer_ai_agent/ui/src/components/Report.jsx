import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Report({ result }) {
  if (!result) return null;

  const { text, usage, model } = result;

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function handleDownload() {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flaky-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="report-panel">
      <div className="report-header">
        <h2>Analysis Report</h2>
        <div className="report-actions">
          <button className="btn-secondary" onClick={handleCopy}>📋 Copy</button>
          <button className="btn-secondary" onClick={handleDownload}>⬇ Download</button>
        </div>
      </div>

      {(model || usage) && (
        <div className="report-meta">
          {model && <span className="meta-model">🤖 {model}</span>}
          {usage && (
            <span className="meta-tokens">
              Tokens — in: {usage.input_tokens ?? usage.prompt_tokens ?? '—'} /
              out: {usage.output_tokens ?? usage.completion_tokens ?? '—'}
            </span>
          )}
        </div>
      )}

      <div className="report-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </section>
  );
}
