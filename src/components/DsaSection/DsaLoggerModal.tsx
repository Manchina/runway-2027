import { useMemo, useState, type FormEvent } from "react"
import { BookOpen, Check, ExternalLink, Search, Sparkles } from "lucide-react"
import { useRunway } from "@/context/RunwayContext"
import { PATTERN_LIST, SYLLABUS_DSA_PROBLEMS } from "@/data/initialDsaCurriculum"
import type { PatternName, StruggleTier, SyllabusDsaProblem } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Props { isOpen: boolean; onClose: () => void; preselectedProblemId?: string }
const tiers: Array<{ value: StruggleTier; title: string; detail: string; review: string }> = [
  { value: 1, title: "Cold solve", detail: "Independent within 30 minutes, without hints.", review: "Optional recall anytime" },
  { value: 2, title: "Hint assisted", detail: "A pattern or text hint unlocked the solution.", review: "Recall in 48 hours" },
  { value: 3, title: "Solution replay", detail: "A full explanation or implementation was needed.", review: "Recall in 48 hours" },
]

export function DsaLoggerModal({ isOpen, onClose, preselectedProblemId }: Props) {
  const { logDsaProblem, dsaProblems } = useRunway()
  const fallback = useMemo(() => {
    const selected = SYLLABUS_DSA_PROBLEMS.find((p) => p.id === preselectedProblemId)
    const logged = new Set(dsaProblems.map((p) => p.leetcodeNumber))
    return selected || SYLLABUS_DSA_PROBLEMS.find((p) => !logged.has(p.leetcodeNumber)) || SYLLABUS_DSA_PROBLEMS[0]
  }, [preselectedProblemId, dsaProblems])
  const existingInitial = dsaProblems.find((p) => p.leetcodeNumber === fallback.leetcodeNumber)
  const [mode, setMode] = useState<"syllabus" | "custom">("syllabus")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(fallback.id)
  const [title, setTitle] = useState(fallback.title)
  const [number, setNumber] = useState(fallback.leetcodeNumber)
  const [pattern, setPattern] = useState<PatternName>(fallback.pattern)
  const [url, setUrl] = useState(fallback.leetcodeUrl)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(fallback.difficulty)
  const [week, setWeek] = useState(fallback.weekNumber)
  const [tier, setTier] = useState<StruggleTier>(existingInitial?.struggleTier || 1)
  const [notes, setNotes] = useState(existingInitial?.notes || "")

  const selectProblem = (problem: SyllabusDsaProblem) => {
    const existing = dsaProblems.find((p) => p.leetcodeNumber === problem.leetcodeNumber)
    setSelectedId(problem.id); setTitle(problem.title); setNumber(problem.leetcodeNumber); setPattern(problem.pattern)
    setUrl(problem.leetcodeUrl); setDifficulty(problem.difficulty); setWeek(problem.weekNumber)
    setTier(existing?.struggleTier || 1); setNotes(existing?.notes || "")
  }
  const results = SYLLABUS_DSA_PROBLEMS.filter((p) => `${p.title} ${p.leetcodeNumber} ${p.pattern} week ${p.weekNumber}`.toLowerCase().includes(query.toLowerCase()))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !number) return
    logDsaProblem({ title: title.trim(), leetcodeNumber: number, pattern, leetcodeUrl: url.trim() || `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`, struggleTier: tier, notes: notes.trim() || undefined, difficulty, weekNumber: week })
    onClose()
  }

  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden p-0 sm:max-w-3xl">
      <DialogHeader className="px-5 pt-5"><DialogTitle>Log a practice session</DialogTitle><DialogDescription>Record the outcome honestly. The review queue is scheduled from your struggle tier.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-5">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "syllabus" | "custom")} className="flex-col">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="syllabus"><BookOpen />Curriculum</TabsTrigger><TabsTrigger value="custom"><Sparkles />Custom</TabsTrigger></TabsList>
            <TabsContent value="syllabus" className="space-y-3 pt-2">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Find curriculum problem" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the curriculum" className="pl-9" /></div>
              <ScrollArea className="h-44 rounded-lg border"><div className="p-1">{results.map((problem) => { const logged = dsaProblems.some((p) => p.leetcodeNumber === problem.leetcodeNumber); return <Button key={problem.id} type="button" variant={selectedId === problem.id ? "secondary" : "ghost"} className="h-auto w-full justify-start px-3 py-2.5" onClick={() => selectProblem(problem)}><span className="w-10 text-left text-xs tabular-nums text-muted-foreground">#{problem.leetcodeNumber}</span><span className="min-w-0 flex-1 truncate text-left">{problem.title}</span><Badge variant="outline">{problem.difficulty}</Badge>{logged ? <Check className="text-muted-foreground" /> : null}</Button> })}</div></ScrollArea>
            </TabsContent>
            <TabsContent value="custom" className="pt-2"><FieldGroup className="grid gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="problem-number">Problem number</FieldLabel><Input id="problem-number" type="number" min={1} value={number} onChange={(e) => setNumber(Number(e.target.value))} required /></Field><Field><FieldLabel htmlFor="problem-title">Problem title</FieldLabel><Input id="problem-title" value={title} onChange={(e) => setTitle(e.target.value)} required /></Field><Field><FieldLabel>Pattern</FieldLabel><Select items={Object.fromEntries(PATTERN_LIST.map((item) => [item, item]))} value={pattern} onValueChange={(value) => setPattern(value as PatternName)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{PATTERN_LIST.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field><Field><FieldLabel>Difficulty</FieldLabel><Select items={{ Easy: "Easy", Medium: "Medium", Hard: "Hard" }} value={difficulty} onValueChange={(value) => setDifficulty(value as typeof difficulty)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{["Easy", "Medium", "Hard"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field></FieldGroup></TabsContent>
          </Tabs>

          <Card><CardHeader><CardTitle className="flex flex-wrap items-center gap-2"><Badge variant="outline">#{number}</Badge>{title}</CardTitle><CardDescription>{pattern} · Week {week} · {difficulty}</CardDescription></CardHeader>{url ? <CardContent><Button type="button" variant="link" nativeButton={false} className="h-auto p-0" render={<a href={url} target="_blank" rel="noreferrer" />}>Open on LeetCode<ExternalLink data-icon="inline-end" /></Button></CardContent> : null}</Card>

          <FieldSet><FieldLegend>How much help did you need?</FieldLegend><FieldDescription>This determines whether the problem returns for recall.</FieldDescription><div className="grid gap-3 sm:grid-cols-3">{tiers.map((item) => <Button key={item.value} type="button" variant={tier === item.value ? "default" : "outline"} className="h-auto items-start justify-start whitespace-normal p-4 text-left" onClick={() => setTier(item.value)}><span><span className="block font-medium">Tier {item.value} · {item.title}</span><span className="mt-1 block text-xs font-normal opacity-80">{item.detail}</span><span className="mt-3 block text-xs font-medium">{item.review}</span></span></Button>)}</div></FieldSet>
          <Field><FieldLabel htmlFor="notes">Engineering notes</FieldLabel><Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Invariant, edge case, complexity, or the exact point where you got stuck." /><FieldDescription>Optional, but specific notes make the next recall attempt useful.</FieldDescription></Field>
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save problem log</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
