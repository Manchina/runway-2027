import { useState } from "react"
import { AlertCircle, CheckCircle2, Cloud, Database, Server, ShieldCheck, UploadCloud } from "lucide-react"
import { getApiConfig, runwayApi, setApiConfig } from "@/services/api"
import { useRunway } from "@/context/RunwayContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface Props { isOpen: boolean; onClose: () => void; onConnectionChanged?: () => void }

export function CloudConfigModal({ isOpen, onClose, onConnectionChanged }: Props) {
  const { dsaProblems, hldWeeks } = useRunway()
  const initialConfig = getApiConfig()
  const [apiUrl, setApiUrl] = useState(initialConfig.url)
  const [apiKey, setApiKey] = useState(initialConfig.key)
  const [busy, setBusy] = useState<"test" | "sync" | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const test = async () => {
    setBusy("test"); setResult(null)
    try { setApiConfig(apiUrl.trim(), apiKey.trim()); await runwayApi.checkHealth(); setResult({ success: true, message: "Connection to the Runway API succeeded." }); onConnectionChanged?.() }
    catch (error) { setResult({ success: false, message: error instanceof Error ? error.message : "Connection failed." }) }
    finally { setBusy(null) }
  }
  const sync = async () => {
    setBusy("sync"); setResult(null)
    try { await runwayApi.seedHldCurriculum(hldWeeks); for (const problem of dsaProblems) await runwayApi.logDsaProblem(problem); setResult({ success: true, message: `Uploaded ${dsaProblems.length} practice logs and ${hldWeeks.length} design studies.` }) }
    catch (error) { setResult({ success: false, message: error instanceof Error ? error.message : "Upload failed." }) }
    finally { setBusy(null) }
  }
  const save = () => { setApiConfig(apiUrl.trim(), apiKey.trim()); onConnectionChanged?.(); onClose() }
  const localOnly = () => { setApiConfig("", ""); setApiUrl(""); setApiKey(""); setResult({ success: true, message: "Switched to browser-only local storage." }); onConnectionChanged?.() }

  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="sm:max-w-xl">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Cloud className="size-4" />Cloud settings</DialogTitle><DialogDescription>Connect Runway to your private Lambda endpoint and DynamoDB store.</DialogDescription></DialogHeader>
      <div className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-2"><Database className="size-4 text-muted-foreground" /><span className="text-sm font-medium">Current mode</span></div><Badge variant={apiUrl ? "default" : "secondary"}>{apiUrl ? "AWS cloud" : "Local browser"}</Badge></div>
      <FieldGroup>
        <Field><FieldLabel htmlFor="api-url"><Server className="size-4" />API endpoint</FieldLabel><Input id="api-url" type="url" placeholder="https://…lambda-url…on.aws" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} /><FieldDescription>Your AWS Lambda Function URL or compatible local endpoint.</FieldDescription></Field>
        <Field><FieldLabel htmlFor="api-key"><ShieldCheck className="size-4" />Bot-shield key</FieldLabel><Input id="api-key" type="password" placeholder="Private x-runway-key value" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /><FieldDescription>Stored in this browser and sent only to your configured endpoint.</FieldDescription></Field>
      </FieldGroup>
      <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={!apiUrl || busy !== null} onClick={test}>{busy === "test" ? "Testing…" : "Test connection"}</Button>{apiUrl ? <Button variant="outline" disabled={busy !== null} onClick={sync}><UploadCloud data-icon="inline-start" />{busy === "sync" ? "Uploading…" : "Upload local data"}</Button> : null}<Button variant="ghost" onClick={localOnly}>Use local only</Button></div>
      {result ? <Alert variant={result.success ? "default" : "destructive"}>{result.success ? <CheckCircle2 /> : <AlertCircle />}<AlertTitle>{result.success ? "Connected" : "Could not connect"}</AlertTitle><AlertDescription>{result.message}</AlertDescription></Alert> : null}
      <Separator />
      <p className="text-sm leading-relaxed text-muted-foreground">Cloud sync is optional. Local mode keeps all progress in this browser and makes no network requests.</p>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save settings</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
