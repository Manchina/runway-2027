import { useRef, useState, type ChangeEvent } from "react"
import { AlertTriangle, CheckCircle2, Download, FileJson, RotateCcw, Sparkles, Upload } from "lucide-react"
import { useRunway } from "@/context/RunwayContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Props { isOpen: boolean; onClose: () => void }

export function ExportImportModal({ isOpen, onClose }: Props) {
  const { exportStateJson, importStateJson, resetToDefaults, loadDemoData, dsaProblems, hldWeeks } = useRunway()
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const download = () => {
    try {
      const blob = new Blob([exportStateJson()], { type: "application/json" })
      const href = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = href; anchor.download = `runway_backup_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`; anchor.click()
      URL.revokeObjectURL(href)
      setMessage({ text: "Backup downloaded successfully.", type: "success" })
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Backup failed.", type: "error" }) }
  }
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const result = importStateJson(String(reader.result)); setMessage({ text: result.message, type: result.success ? "success" : "error" }) }
    reader.onerror = () => setMessage({ text: "Could not read that file.", type: "error" })
    reader.readAsText(file); event.target.value = ""
  }
  const reset = () => { if (window.confirm("Reset every local progress record? This cannot be undone.")) { resetToDefaults(); setMessage({ text: "Progress reset to defaults.", type: "success" }) } }

  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="sm:max-w-xl">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><FileJson className="size-4" />Backup &amp; restore</DialogTitle><DialogDescription>Move your Runway state between browsers or restore a clean starting point.</DialogDescription></DialogHeader>
      {message ? <Alert variant={message.type === "error" ? "destructive" : "default"}>{message.type === "error" ? <AlertTriangle /> : <CheckCircle2 />}<AlertTitle>{message.type === "error" ? "Action failed" : "Complete"}</AlertTitle><AlertDescription>{message.text}</AlertDescription></Alert> : null}
      <div className="grid grid-cols-2 gap-3"><Card><CardHeader><CardDescription>Problems logged</CardDescription><CardTitle className="text-2xl">{dsaProblems.length}</CardTitle></CardHeader></Card><Card><CardHeader><CardDescription>Design studies</CardDescription><CardTitle className="text-2xl">{hldWeeks.length}</CardTitle></CardHeader></Card></div>
      <Card><CardHeader><CardTitle>Portable JSON backup</CardTitle><CardDescription>Includes practice logs, recall dates, notes, and design progress.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2"><Button onClick={download}><Download data-icon="inline-start" />Export backup</Button><input ref={inputRef} type="file" accept=".json" className="hidden" onChange={upload} /><Button variant="outline" onClick={() => inputRef.current?.click()}><Upload data-icon="inline-start" />Import backup</Button></CardContent></Card>
      <Separator />
      <div className="space-y-3"><div><h3 className="font-medium">Utilities</h3><p className="text-sm text-muted-foreground">These actions replace current local state.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={loadDemoData}><Sparkles data-icon="inline-start" />Load demo data</Button><Button variant="destructive" onClick={reset}><RotateCcw data-icon="inline-start" />Reset progress</Button></div></div>
      <DialogFooter><Badge variant="secondary" className="mr-auto">Target: Jan 1, 2027</Badge><Button variant="outline" onClick={onClose}>Done</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
