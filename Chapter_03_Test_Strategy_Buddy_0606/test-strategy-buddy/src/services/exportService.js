import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export async function exportTestStrategyDocx(content, filename = 'TestStrategy.docx') {
  const lines = content.split('\n')
  const children = lines.map(line => {
    if (line.startsWith('## ')) {
      return new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2 })
    } else if (line.startsWith('# ')) {
      return new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1 })
    }
    return new Paragraph({ children: [new TextRun({ text: line, size: 24 })] })
  })

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  triggerDownload(blob, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
}

export function exportTestCasesCSV(testCases, filename = 'TestCases.csv') {
  const headers = ['ID', 'Title', 'Type', 'Steps', 'Expected Result']
  const rows = testCases.map(tc => [
    tc.id,
    tc.title,
    tc.type,
    Array.isArray(tc.steps) ? tc.steps.join(' | ') : tc.steps,
    tc.expectedResult,
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename, 'text/csv')
}

function triggerDownload(blob, filename, type) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
