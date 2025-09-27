export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]) {
  if (!rows.length) return ""
  const keys = headers ?? Object.keys(rows[0])
  const escape = (s: any) => {
    const str = s == null ? "" : String(s)
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const head = keys.join(",")
  const body = rows.map((r) => keys.map((k) => escape(r[k])).join(",")).join("\n")
  return [head, body].join("\n")
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
