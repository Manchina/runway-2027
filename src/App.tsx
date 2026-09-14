import { useMemo, useState, type ReactNode } from "react"
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Cloud, Code2, Database, ExternalLink, Flame, LayoutDashboard, MoreHorizontal, Plus, Search, Settings2, Sparkles, Trash2 } from "lucide-react"
import { RunwayProvider, useRunway } from "@/context/RunwayContext"
import { CloudConfigModal } from "@/components/CloudConfigModal"
import { DsaLoggerModal } from "@/components/DsaSection/DsaLoggerModal"
import { ExportImportModal } from "@/components/ExportImportModal"
import { PATTERN_LIST, SYLLABUS_DSA_PROBLEMS } from "@/data/initialDsaCurriculum"
import type { HldStatus, HldWeekChecklist, PatternName } from "@/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type View = "today" | "practice" | "design" | "review"
const navigation = [
  { value: "today", label: "Today", icon: LayoutDashboard },
  { value: "practice", label: "Practice", icon: Code2 },
  { value: "design", label: "Design", icon: BookOpen },
  { value: "review", label: "Review", icon: CheckCircle2 },
] satisfies Array<{ value: View; label: string; icon: typeof LayoutDashboard }>
const statusLabels: Record<HldStatus, string> = { not_started: "Not started", reading: "Reading", diagrammed: "Diagrammed", mastered: "Mastered" }
const checklistLabels: Record<keyof HldWeekChecklist, string> = { readingDone: "Read the chapter", estimationPracticed: "Practice sizing", diagramCompleted: "Draw the architecture", bottlenecksAudited: "Audit bottlenecks" }
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value)) : "Today"

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="text-base leading-relaxed text-muted-foreground">{description}</p></div>{action}</div>
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Flame }) {
  return <Card><CardHeader><CardDescription>{label}</CardDescription><CardAction><Icon className="size-4 text-muted-foreground" /></CardAction><CardTitle className="text-3xl font-semibold tracking-tight">{value}</CardTitle></CardHeader><CardFooter className="text-sm text-muted-foreground">{detail}</CardFooter></Card>
}

function Dashboard() {
  const { dsaProblems, hldWeeks, streakCount, lastCompletedDate, isCloudConnected, markProblemCleared, failProblemReview, scheduleProblemForReview, snoozeProblemReview, toggleHldChecklistItem, updateHldWeek, deleteDsaProblem } = useRunway()
  const [view, setView] = useState<View>("today")
  const [loggerOpen, setLoggerOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [cloudOpen, setCloudOpen] = useState(false)
  const [problemId, setProblemId] = useState<string>()
  const [query, setQuery] = useState("")
  const [pattern, setPattern] = useState<PatternName | "All">("All")
  const [reviewFilter, setReviewFilter] = useState<"due" | "all">("due")
  const due = useMemo(() => dsaProblems.filter((p) => p.reviewStatus === "pending" && (!p.scheduledReviewDate || new Date(p.scheduledReviewDate) <= new Date())).sort((a, b) => (a.scheduledReviewDate || "").localeCompare(b.scheduledReviewDate || "")), [dsaProblems])
  const upcoming = useMemo(() => dsaProblems.filter((p) => p.reviewStatus === "pending" && p.scheduledReviewDate && new Date(p.scheduledReviewDate) > new Date()), [dsaProblems])
  const mastered = hldWeeks.filter((w) => w.status === "mastered").length
  const cold = dsaProblems.filter((p) => p.struggleTier === 1).length
  const doneToday = lastCompletedDate === new Date().toISOString().slice(0, 10)
  const completion = Math.min(100, Math.round(((dsaProblems.length / 75) * .65 + (mastered / 16) * .35) * 100))
  const openLogger = (id?: string) => { setProblemId(id); setLoggerOpen(true) }
  const records = useMemo(() => SYLLABUS_DSA_PROBLEMS.filter((p) => (pattern === "All" || p.pattern === pattern) && `${p.title} ${p.leetcodeNumber} ${p.pattern}`.toLowerCase().includes(query.toLowerCase())), [pattern, query])
  const logs = useMemo(() => new Map(dsaProblems.map((p) => [p.leetcodeNumber, p])), [dsaProblems])
  const recommendation = useMemo(() => {
    const counts = new Map(PATTERN_LIST.map((item) => [item, 0]))
    dsaProblems.forEach((p) => counts.set(p.pattern, (counts.get(p.pattern) ?? 0) + 1))
    const weakestPattern = [...PATTERN_LIST].sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0))[0]
    return SYLLABUS_DSA_PROBLEMS.find((p) => p.pattern === weakestPattern && !logs.has(p.leetcodeNumber)) || SYLLABUS_DSA_PROBLEMS.find((p) => !logs.has(p.leetcodeNumber))
  }, [dsaProblems, logs])
  const visibleReviews = reviewFilter === "due" ? due : [...due, ...upcoming]

  return <TooltipProvider>
    <Tabs value={view} onValueChange={(value) => setView(value as View)} className="min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mr-auto gap-2 px-2" onClick={() => setView("today")}><span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">R</span><span className="text-base font-semibold tracking-tight">Runway</span></Button>
          <TabsList className="hidden sm:inline-flex" aria-label="Primary navigation">{navigation.map(({ value, label, icon: Icon }) => <TabsTrigger key={value} value={value}><Icon data-icon="inline-start" />{label}{value === "review" && due.length > 0 ? <Badge variant="secondary" className="ml-1">{due.length}</Badge> : null}</TabsTrigger>)}</TabsList>
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => setCloudOpen(true)} />}><Cloud /><span className="sr-only">Cloud settings</span></TooltipTrigger><TooltipContent>{isCloudConnected ? "Cloud connected" : "Configure cloud"}</TooltipContent></Tooltip>
            <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}><MoreHorizontal /><span className="sr-only">More options</span></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuGroup><DropdownMenuItem onClick={() => setBackupOpen(true)}><Database />Backup &amp; restore</DropdownMenuItem><DropdownMenuItem onClick={() => setCloudOpen(true)}><Settings2 />Cloud settings</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem onClick={() => setView("practice")}><Code2 />Practice library</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
            <Button onClick={() => openLogger()}><Plus data-icon="inline-start" /><span className="hidden min-[420px]:inline">Log practice</span><span className="min-[420px]:hidden">Log</span></Button>
          </div>
        </div>
        <div className="overflow-x-auto border-t px-4 py-2 sm:hidden"><TabsList className="grid w-full min-w-[340px] grid-cols-4">{navigation.map(({ value, label, icon: Icon }) => <TabsTrigger key={value} value={value}><Icon />{label}</TabsTrigger>)}</TabsList></div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <TabsContent value="today" className="space-y-8">
          <PageHeading eyebrow="Daily workspace" title={doneToday ? "Good work. Keep the signal clean." : "One deliberate rep at a time."} description={due.length ? `${due.length} recall ${due.length === 1 ? "check is" : "checks are"} ready. Clear the queue before adding new work.` : "No recall debt today. Choose a problem, solve it honestly, and record what happened."} action={<Button size="lg" onClick={() => due.length ? setView("review") : openLogger()}>{due.length ? "Start review" : "Log a session"}<ArrowRight data-icon="inline-end" /></Button>} />
          <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Problems logged" value={dsaProblems.length} detail="of 75 in the curriculum" icon={Code2} /><MetricCard label="Designs mastered" value={mastered} detail="of 16 system studies" icon={BookOpen} /><MetricCard label="Current streak" value={`${streakCount}d`} detail={doneToday ? "Activity recorded today" : "Ready for today's rep"} icon={Flame} /></div>
          <Card><CardHeader><CardTitle>Overall runway</CardTitle><CardDescription>A weighted view of practice and system-design progress.</CardDescription><CardAction><span className="text-2xl font-semibold tracking-tight">{completion}%</span></CardAction></CardHeader><CardContent><Progress value={completion} aria-label={`${completion}% complete`} /></CardContent></Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Recall queue</CardTitle><CardDescription>Problems ready for blank-canvas retrieval.</CardDescription><CardAction><Button variant="ghost" size="sm" onClick={() => setView("review")}>View all</Button></CardAction></CardHeader><CardContent>{due.length ? <div className="space-y-1">{due.slice(0, 4).map((p) => <Button key={p.id} variant="ghost" className="h-auto w-full justify-between px-2 py-3" onClick={() => setView("review")}><span className="min-w-0 text-left"><span className="block truncate font-medium">{p.title}</span><span className="block truncate text-xs font-normal text-muted-foreground">{p.pattern} · due {formatDate(p.scheduledReviewDate)}</span></span><ArrowRight /></Button>)}</div> : upcoming.length ? <div className="rounded-lg border p-4"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-4 text-muted-foreground" /><div><p className="font-medium">Next recall: {upcoming[0].title}</p><p className="mt-1 text-sm text-muted-foreground">Scheduled {formatDate(upcoming[0].scheduledReviewDate)} · stage {(upcoming[0].reviewStage ?? 0) + 1} of 4</p></div></div></div> : <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><CheckCircle2 /></EmptyMedia><EmptyTitle>Queue clear</EmptyTitle><EmptyDescription>Schedule a cold solve for recall whenever you want a second rep.</EmptyDescription></EmptyHeader>{recommendation ? <EmptyContent><Button variant="outline" onClick={() => openLogger(recommendation.id)}>Log {recommendation.title}</Button></EmptyContent> : null}</Empty>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Practice quality</CardTitle><CardDescription>Cold solves are the clearest fluency signal.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="text-4xl font-semibold tracking-tight">{dsaProblems.length ? Math.round(cold / dsaProblems.length * 100) : 0}%</div><p className="text-sm text-muted-foreground">{dsaProblems.length ? `${cold} of ${dsaProblems.length} logged problems were completed without hints.` : "Log your first problem to start building a useful signal."}</p></CardContent><CardFooter><Button variant="outline" onClick={() => setView("practice")}>Browse the library<ArrowRight data-icon="inline-end" /></Button></CardFooter></Card>
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-8">
          <PageHeading eyebrow="Practice library" title="Build pattern fluency." description="A focused syllabus with honest outcomes—not a graveyard of green checkmarks." action={<Button size="lg" onClick={() => openLogger()}><Plus data-icon="inline-start" />Log practice</Button>} />
          <Card><CardHeader className="gap-4 md:flex-row md:items-center"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search problems" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, number, or pattern" className="pl-9" /></div><Select items={Object.fromEntries(["All", ...PATTERN_LIST].map((item) => [item, item]))} value={pattern} onValueChange={(value) => setPattern(value as PatternName | "All")}><SelectTrigger className="w-full md:w-56" aria-label="Filter by pattern"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All patterns</SelectItem>{PATTERN_LIST.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></CardHeader>
            <CardContent className="px-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Problem</TableHead><TableHead>Pattern</TableHead><TableHead>Difficulty</TableHead><TableHead className="text-right">Result</TableHead></TableRow></TableHeader><TableBody>{records.map((p) => { const log = logs.get(p.leetcodeNumber); const queued = log?.reviewStatus === "pending"; return <TableRow key={p.id}><TableCell><div className="flex min-w-56 items-center gap-3"><span className="w-10 text-xs tabular-nums text-muted-foreground">#{p.leetcodeNumber}</span><a href={p.leetcodeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium hover:underline">{p.title}<ExternalLink className="size-3.5 text-muted-foreground" /></a></div></TableCell><TableCell className="text-muted-foreground">{p.pattern}</TableCell><TableCell><Badge variant={p.difficulty === "Hard" ? "destructive" : p.difficulty === "Medium" ? "secondary" : "outline"}>{p.difficulty}</Badge></TableCell><TableCell className="text-right">{log ? <div className="flex justify-end gap-1"><Badge variant="secondary">Tier {log.struggleTier}</Badge>{!queued ? <Button size="sm" variant="ghost" onClick={() => scheduleProblemForReview(log.id)}>Recall now</Button> : <Badge variant="outline">Queued</Badge>}<Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={() => deleteDsaProblem(log.id)} />}><Trash2 /><span className="sr-only">Remove {p.title} log</span></TooltipTrigger><TooltipContent>Remove log</TooltipContent></Tooltip></div> : <Button size="sm" variant="outline" onClick={() => openLogger(p.id)}>Log<Plus data-icon="inline-end" /></Button>}</TableCell></TableRow>})}</TableBody></Table></div>{!records.length ? <Empty><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>No matching problems</EmptyTitle><EmptyDescription>Try a broader search or choose another pattern.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => { setQuery(""); setPattern("All") }}>Clear filters</Button></EmptyContent></Empty> : null}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-8">
          <PageHeading eyebrow="System design path" title="Think in trade-offs." description={`${mastered} of 16 studies mastered. Draw the system, then explain the compromise.`} action={<Badge variant="secondary" className="h-9 px-3 text-sm">{mastered} / 16 mastered</Badge>} />
          <Card><CardHeader><CardTitle>Sixteen-week roadmap</CardTitle><CardDescription>Open a study to see its deliverable, concepts, and completion checklist.</CardDescription></CardHeader><CardContent><Accordion multiple defaultValue={[]} className="w-full">{hldWeeks.map((w) => { const complete = Object.values(w.checklist).filter(Boolean).length; return <AccordionItem key={w.weekNumber} value={`week-${w.weekNumber}`}><AccordionTrigger><span className="flex min-w-0 flex-1 items-center gap-4 text-left"><span className="text-xs tabular-nums text-muted-foreground">W{String(w.weekNumber).padStart(2, "0")}</span><span className="min-w-0"><span className="block truncate font-medium">{w.chapterTitle}</span><span className="block text-xs font-normal text-muted-foreground">Volume {w.bookVolume} · {statusLabels[w.status]}</span></span></span><Badge variant="outline" className="mr-2">{complete}/4</Badge></AccordionTrigger><AccordionContent className="space-y-5 pl-0 sm:pl-12"><p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{w.deliverable}</p><div className="flex flex-wrap gap-2">{w.coreConcepts.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}</div><Separator /><div className="grid gap-3 sm:grid-cols-2">{(Object.entries(w.checklist) as [keyof HldWeekChecklist, boolean][]).map(([key, checked]) => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"><Checkbox checked={checked} onCheckedChange={() => toggleHldChecklistItem(w.weekNumber, key)} />{checklistLabels[key]}</label>)}</div><Select items={statusLabels} value={w.status} onValueChange={(value) => updateHldWeek(w.weekNumber, { status: value as HldStatus })}><SelectTrigger className="w-full sm:w-48" aria-label={`Status for week ${w.weekNumber}`}><SelectValue /></SelectTrigger><SelectContent>{(Object.entries(statusLabels) as [HldStatus, string][]).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></AccordionContent></AccordionItem>})}</Accordion></CardContent></Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-8">
          <PageHeading eyebrow="Recall checks" title="Retrieval is the work." description="Passes expand the interval: 48 hours, 7 days, 21 days, then 60 days." action={<Badge variant={due.length ? "default" : "secondary"} className="h-9 px-3 text-sm">{due.length} due</Badge>} />
          <div className="flex gap-2"><Button size="sm" variant={reviewFilter === "due" ? "default" : "outline"} onClick={() => setReviewFilter("due")}>Due now ({due.length})</Button><Button size="sm" variant={reviewFilter === "all" ? "default" : "outline"} onClick={() => setReviewFilter("all")}>All scheduled ({due.length + upcoming.length})</Button></div>
          <div className="space-y-4">{visibleReviews.length ? visibleReviews.map((p) => { const isDue = due.some((item) => item.id === p.id); return <Card key={p.id} className={!isDue ? "opacity-80" : undefined}><CardHeader><CardTitle className="flex items-center gap-2"><Badge variant="secondary">Tier {p.struggleTier}</Badge>{p.title}</CardTitle><CardDescription>{p.pattern} · {isDue ? "due now" : `scheduled ${formatDate(p.scheduledReviewDate)}`} · stage {(p.reviewStage ?? 0) + 1} of 4 · {p.reviewHistory?.filter((attempt) => attempt.outcome === "passed").length ?? 0} passed</CardDescription></CardHeader>{p.notes ? <CardContent><p className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground">{p.notes}</p></CardContent> : null}<CardFooter className="flex flex-wrap justify-end gap-2"><Button variant="ghost" nativeButton={false} render={<a href={p.leetcodeUrl} target="_blank" rel="noreferrer" />}>Open problem<ExternalLink data-icon="inline-end" /></Button>{isDue ? <><Button variant="ghost" onClick={() => snoozeProblemReview(p.id)}>Snooze one day</Button><Button variant="outline" onClick={() => failProblemReview(p.id)}>Need another day</Button><Button onClick={() => markProblemCleared(p.id)}><CheckCircle2 data-icon="inline-start" />Pass recall</Button></> : <Button variant="outline" onClick={() => scheduleProblemForReview(p.id)}>Review now</Button>}</CardFooter></Card> }) : <Card><CardContent className="pt-6"><Empty><EmptyHeader><EmptyMedia variant="icon"><Sparkles /></EmptyMedia><EmptyTitle>Nothing waiting</EmptyTitle><EmptyDescription>Your recall queue is clear. Schedule any logged solve for a deliberate second rep.</EmptyDescription></EmptyHeader><EmptyContent><Button onClick={() => setView("practice")}>Choose a problem</Button></EmptyContent></Empty></CardContent></Card>}</div>
        </TabsContent>
      </main>
    </Tabs>
    {loggerOpen ? <DsaLoggerModal isOpen onClose={() => setLoggerOpen(false)} preselectedProblemId={problemId} /> : null}
    {backupOpen ? <ExportImportModal isOpen onClose={() => setBackupOpen(false)} /> : null}
    {cloudOpen ? <CloudConfigModal isOpen onClose={() => setCloudOpen(false)} /> : null}
  </TooltipProvider>
}

export default function App() { return <RunwayProvider><Dashboard /></RunwayProvider> }
