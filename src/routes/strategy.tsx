import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Target, ShieldCheck, TrendingUp, Users, Stethoscope,
  Building2, FlaskConical, Rocket, Compass, Activity, BarChart3,
  CheckCircle2, ArrowRight, Lock, Eye, Quote, Zap, HeartPulse, Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid,
} from "recharts";
import { AppGuard } from "@/components/obesity/AppGuard";

export const Route = createFileRoute("/strategy")({
  component: StrategyPage,
  head: () => ({
    meta: [
      { title: "Satya — Strategy, PMF & GTM" },
      { name: "description", content: "Product-market fit, differentiation, pricing and go-to-market for Satya Obesity Intelligence." },
    ],
  }),
});

function StrategyPage() {
  return (
    <AppGuard require="view:strategy">
      <Body />
    </AppGuard>
  );
}

function Body() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Hero />
      <main className="mx-auto max-w-7xl px-6 py-12 space-y-16">
        <PMF />
        <Differentiation />
        <FeatureValue />
        <Trust />
        <Messaging />
        <Pricing />
        <GTM />
        <KPIs />
        <Partnerships />
        <Launch />
        <Footer />
      </main>
    </div>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
      <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-primary">
          <Compass className="h-4 w-4" /> STRATEGY · PMF · GTM
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl font-bold leading-[1.05]">
          Understand Today. <span className="italic text-primary">Prevent Tomorrow.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
          The investor and operator view of Satya — how we translate AI into clinical
          value, where we win versus alternatives, how we price across B2B & B2C, and
          the measurable path to product–market fit.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {["$432B obesity-economy by 2030","1 in 4 adults at risk","82% want prevention, not Rx"].map(t=>(
            <Badge key={t} variant="outline" className="border-primary/40 text-primary">{t}</Badge>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/">Back to product <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/cohort">View live cohort</Link></Button>
        </div>
      </div>
    </header>
  );
}

/* ---------- PMF ---------- */
const pmfSignals = [
  { axis: "Must-have score", v: 78 },
  { axis: "Activation", v: 71 },
  { axis: "Weekly retention", v: 64 },
  { axis: "NPS", v: 58 },
  { axis: "Clinician sign-off", v: 81 },
  { axis: "Payer interest", v: 49 },
];

function PMF() {
  return (
    <Section
      eyebrow="01 · PRODUCT–MARKET FIT"
      title="A measurable path to PMF, not a vibe."
      sub="We use the Sean Ellis must-have score as our north-star qualitative test, paired with three quantitative gates: activation, week-4 retention, and clinician sign-off rate."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">PMF signal radar — pilot cohort (n=412)</h3>
            <Badge variant="outline" className="border-primary/40 text-primary">Q-rolling</Badge>
          </div>
          <div className="h-72 mt-2">
            <ResponsiveContainer>
              <RadarChart data={pmfSignals}>
                <PolarGrid stroke="oklch(0.3 0.02 160)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} />
                <Radar dataKey="v" stroke="oklch(0.82 0.18 145)" fill="oklch(0.82 0.18 145)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="lg:col-span-2 space-y-3">
          <Gate label="Must-have score (>40% = PMF)" val={78} good />
          <Gate label="Day-30 activation" val={71} good />
          <Gate label="Week-4 retention" val={64} good />
          <Gate label="Clinician sign-off" val={81} good />
          <Gate label="Payer LOI conversion" val={49} />
          <Card className="p-4 bg-card border-border text-sm">
            <Quote className="h-4 w-4 text-primary inline mr-1" />
            <span className="italic text-muted-foreground">
              “Three of my pre-diabetic patients reversed trajectory in 90 days. I would be
              very disappointed if I lost Satya.”
            </span>
            <div className="mt-2 text-xs text-muted-foreground">— Endocrinologist, Tier-1 hospital pilot</div>
          </Card>
        </div>
      </div>
    </Section>
  );
}

/* ---------- DIFFERENTIATION ---------- */
const compare = [
  { f: "Multi-omic + behavioural fusion", us: true, noom: false, calibrate: false, wearables: false, ehr: false },
  { f: "Predictive 12-month risk index", us: true, noom: false, calibrate: false, wearables: false, ehr: true },
  { f: "Clinician + patient shared view", us: true, noom: false, calibrate: true, wearables: false, ehr: true },
  { f: "Role-based PHI privacy by design", us: true, noom: false, calibrate: false, wearables: false, ehr: true },
  { f: "Explainable AI signal attribution", us: true, noom: false, calibrate: false, wearables: false, ehr: false },
  { f: "Genetic + epigenetic ingestion", us: true, noom: false, calibrate: false, wearables: false, ehr: false },
  { f: "Treat-before-treatment positioning", us: true, noom: false, calibrate: false, wearables: false, ehr: false },
];

function Differentiation() {
  return (
    <Section
      eyebrow="02 · DIFFERENTIATION"
      title="We are not another weight-loss app or another EHR module."
      sub="Coaching apps optimise for habit. Weight-loss programs optimise for short-term scale loss. EHRs optimise for billing. Satya optimises for a predictive risk trajectory — and acts on it before disease state."
    >
      <Card className="p-0 bg-card border-border overflow-hidden">
        <div className="grid grid-cols-6 text-xs uppercase tracking-wider text-muted-foreground bg-background/40 border-b border-border">
          <div className="col-span-2 p-3">Capability</div>
          <Th>Satya</Th><Th>Noom-class</Th><Th>Calibrate-class</Th><Th>Wearables-only</Th>
        </div>
        {compare.map((r, i) => (
          <div key={r.f} className={`grid grid-cols-6 text-sm ${i % 2 ? "bg-background/20" : ""}`}>
            <div className="col-span-2 p-3 font-medium">{r.f}</div>
            <Cell on={r.us} primary /><Cell on={r.noom} /><Cell on={r.calibrate} /><Cell on={r.wearables} />
          </div>
        ))}
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Positioning statement: <span className="text-foreground">For at-risk individuals and the clinicians who guide them, Satya is the obesity-intelligence layer that predicts and prevents — unlike coaching apps that only track, or EHRs that only record.</span>
      </p>
    </Section>
  );
}

/* ---------- FEATURE → VALUE ---------- */
const fvt = [
  { f: "Composite Risk Index", v: "Patient finally sees a single number that means something — anxiety → action.", who: "Patient" },
  { f: "12-month risk projection", v: "Clinician justifies early intervention to payer with a defensible curve.", who: "Clinician" },
  { f: "Multi-source fusion (gene + wearable + EHR + diet)", v: "Care team stops triangulating across 6 dashboards.", who: "Nurse / Coordinator" },
  { f: "Role-based PHI masking", v: "Researcher gets aggregates without HIPAA exposure — faster IRB.", who: "Researcher / Admin" },
  { f: "Ask Satya AI (transparent reasoning)", v: "Patient gets a coach that cites the signal driving each suggestion.", who: "Patient" },
  { f: "Personalised prevention plan", v: "Replaces 3 separate referrals (dietitian, sleep, activity) with one updating plan.", who: "Patient + Clinician" },
];

function FeatureValue() {
  return (
    <Section
      eyebrow="03 · FEATURE → VALUE TRANSLATION"
      title="Every feature ladders to a buyer outcome."
      sub="We never sell a feature. We sell an outcome — and we name the persona who feels it."
    >
      <div className="grid md:grid-cols-2 gap-4">
        {fvt.map((x) => (
          <Card key={x.f} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
            <Badge variant="outline" className="border-primary/40 text-primary">{x.who}</Badge>
            <div className="mt-3 font-semibold">{x.f}</div>
            <div className="mt-1 text-sm text-muted-foreground">{x.v}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------- TRUST ---------- */
function Trust() {
  return (
    <Section
      eyebrow="04 · AI TRANSPARENCY & TRUST"
      title="Healthcare AI doesn’t win on accuracy alone. It wins on auditability."
      sub="Every Satya output ships with the signals that produced it, the confidence band, and the data-source provenance. No black box. No off-label drift."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { i: <Eye className="h-5 w-5" />, t: "Signal attribution", d: "Every risk movement names the inputs (e.g. sleep -0.7h ⇒ +4 metabolic)." },
          { i: <Lock className="h-5 w-5" />, t: "Privacy by role", d: "Clinician sees PHI. Nurse sees initials + age band. Researcher sees pseudo-IDs only." },
          { i: <ShieldCheck className="h-5 w-5" />, t: "Provenance log", d: "Each data source is timestamped, versioned, and revocable by the patient." },
          { i: <Activity className="h-5 w-5" />, t: "Confidence bands", d: "Risk scores display ± uncertainty so clinicians can weight them appropriately." },
          { i: <Stethoscope className="h-5 w-5" />, t: "Clinician override", d: "All AI suggestions are advisory and require clinician sign-off before plan activation." },
          { i: <FlaskConical className="h-5 w-5" />, t: "Bias monitoring", d: "Risk distribution audited monthly across age, ethnicity and BMI bands." },
        ].map((x) => (
          <Card key={x.t} className="p-5 bg-card border-border">
            <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center">{x.i}</div>
            <div className="mt-3 font-semibold">{x.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{x.d}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------- MESSAGING / NARRATIVE ---------- */
function Messaging() {
  const layers = [
    { a: "B2C patient", b: "Understand today. Prevent tomorrow.", c: "Emotional, hopeful, action-led." },
    { a: "B2B clinician", b: "Treat before treatment.", c: "Clinical authority + economic outcome." },
    { a: "B2B payer/employer", b: "Bend the obesity cost curve before it bends you.", c: "Risk-pool framing + ROI." },
    { a: "Investor", b: "The obesity-intelligence layer for the GLP-1 era.", c: "Category creation + defensibility." },
  ];
  return (
    <Section
      eyebrow="05 · MESSAGING & NARRATIVE"
      title="One story. Four audiences. Zero contradiction."
      sub="Same product truth, re-shaped per buyer. Narrative consistency is what compounds trust across channels."
    >
      <div className="grid md:grid-cols-2 gap-4">
        {layers.map((l) => (
          <Card key={l.a} className="p-6 bg-card border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l.a}</div>
            <div className="mt-2 text-xl font-semibold text-primary">“{l.b}”</div>
            <div className="mt-2 text-sm text-muted-foreground">{l.c}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------- PRICING ---------- */
function Pricing() {
  const b2c = [
    { name: "Free", price: "$0", line: "Forever", feats: ["Risk score + 1 source", "Weekly insight", "Read-only plan"], cta: "Acquisition" },
    { name: "Plus", price: "$14", line: "/ month", feats: ["All 5 data sources", "Ask Satya AI (unlimited)", "Adaptive prevention plan"], cta: "Activation", highlight: true },
    { name: "Family", price: "$29", line: "/ month · up to 5", feats: ["Plus for everyone", "Shared household trends", "Pediatric risk module"], cta: "Expansion" },
  ];
  const b2b = [
    { name: "Clinic", price: "$8", line: "/ active patient / month", feats: ["EHR write-back", "Clinician cockpit", "Outcome reports"], cta: "Pilot → roll-out" },
    { name: "Enterprise / Payer", price: "Custom", line: "PMPM + outcome bonus", feats: ["Population cohort", "Risk-stratified care pathways", "Shared-savings model"], cta: "Annual contract", highlight: true },
    { name: "Research / Pharma", price: "License", line: "Data + cohort access", feats: ["De-identified cohort API", "GLP-1 response panels", "Trial recruitment funnel"], cta: "Master agreement" },
  ];
  return (
    <Section
      eyebrow="06 · PRICING & REVENUE MODEL"
      title="Two motions. One platform. Aligned incentives."
      sub="B2C funds awareness and proves engagement. B2B captures the dollar. Outcome-linked pricing on the enterprise tier aligns Satya’s revenue with the patient’s health."
    >
      <div className="space-y-8">
        <PricingBlock title="B2C — direct to individual & household" tiers={b2c} note="Freemium → subscription. Conversion target: 7% free → Plus by day-30. ARPU: $11.40 blended." />
        <PricingBlock title="B2B — clinics, payers, employers, pharma" tiers={b2b} note="Land with per-patient SaaS, expand to PMPM with shared-savings on prevented downstream events (HbA1c, MACE, NAFLD)." />
      </div>
    </Section>
  );
}

function PricingBlock({ title, tiers, note }: { title: string; tiers: any[]; note: string }) {
  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground max-w-md text-right">{note}</span>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((t) => (
          <Card key={t.name}
            className={`p-6 border-border bg-card relative ${t.highlight ? "border-primary/60 shadow-[0_0_0_1px_oklch(0.82_0.18_145_/_0.3)]" : ""}`}>
            {t.highlight && (
              <Badge className="absolute -top-2 left-6 bg-primary text-primary-foreground">Recommended</Badge>
            )}
            <div className="text-sm text-muted-foreground">{t.name}</div>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-bold">{t.price}</span>
              <span className="text-sm text-muted-foreground pb-1">{t.line}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {t.feats.map((f: string) => (
                <li key={f} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>{f}</span></li>
              ))}
            </ul>
            <div className="mt-4 text-xs uppercase tracking-wider text-primary">{t.cta}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------- GTM ---------- */
function GTM() {
  const channels = [
    { icon: <Users className="h-5 w-5" />, t: "Patient direct", d: "Content + creator partnerships in metabolic-health niche. CAC target: <$22." },
    { icon: <Stethoscope className="h-5 w-5" />, t: "Clinician land-and-expand", d: "Free clinician seat with first 25 patients. Conference-led pilot pipeline." },
    { icon: <Building2 className="h-5 w-5" />, t: "Self-insured employers", d: "Wellness benefit replacement. 90-day ROI pilot, then PMPM contract." },
    { icon: <HeartPulse className="h-5 w-5" />, t: "Payers", d: "Shared-savings pilot tied to prevented diabetes diagnoses & GLP-1 step-therapy." },
    { icon: <FlaskConical className="h-5 w-5" />, t: "Pharma & research", d: "De-identified cohort licensing + recruitment funnel for GLP-1 trials." },
    { icon: <Globe className="h-5 w-5" />, t: "Regional health systems", d: "Public-health pilots in tier-2 cities, co-branded with hospital chains." },
  ];
  return (
    <Section
      eyebrow="07 · GO-TO-MARKET MOTION"
      title="Six distribution paths, one compounding flywheel."
      sub="Patients generate evidence → clinicians get convinced → payers fund coverage → patients trust the brand → more patients."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {channels.map((c) => (
          <Card key={c.t} className="p-5 bg-card border-border">
            <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center">{c.icon}</div>
            <div className="mt-3 font-semibold">{c.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{c.d}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6 bg-card border-border">
        <h3 className="font-semibold mb-4">Distribution flywheel</h3>
        <ol className="grid md:grid-cols-5 gap-3 text-sm">
          {["Patient signs up free","Risk score creates ‘aha’","Shares with clinician","Clinician adopts dashboard","Employer/payer funds it"].map((s,i)=>(
            <li key={s} className="flex gap-3">
              <span className="h-7 w-7 shrink-0 rounded-md bg-primary text-primary-foreground text-xs font-bold grid place-items-center">{i+1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Card>
    </Section>
  );
}

/* ---------- KPIs ---------- */
const kpiTrend = Array.from({ length: 12 }, (_, m) => ({
  m: ["J","F","M","A","M","J","J","A","S","O","N","D"][m],
  mrr: 8 + m * 3.4 + (m % 3) * 1.6,
  patients: 1.2 + m * 0.9,
}));
const funnel = [
  { stage: "Visit", v: 100 },
  { stage: "Sign-up", v: 38 },
  { stage: "Risk score", v: 31 },
  { stage: "Plan activate", v: 19 },
  { stage: "Plus convert", v: 7 },
  { stage: "Clinician share", v: 4.2 },
];
function KPIs() {
  return (
    <Section
      eyebrow="08 · KPI & MEASUREMENT FRAMEWORK"
      title="What we count is what we become."
      sub="A flat measurement stack across acquisition, activation, retention, revenue, referral — and a clinical-outcome layer most software companies ignore."
    >
      <div className="grid md:grid-cols-4 gap-3">
        <Kpi label="North-star" value="Verified prevented events / 1k users" hint="HbA1c crossbacks, BMI band drops, GLP-1 avoidance." />
        <Kpi label="Activation" value="71%" hint="Risk score within 7 days of signup." />
        <Kpi label="Net revenue retention" value="128%" hint="Driven by Family + Clinic upsell." />
        <Kpi label="Clinician adoption" value="3.4 / pilot" hint="Avg clinicians activated per piloted clinic." />
      </div>

      <div className="mt-6 grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-6 bg-card border-border">
          <h3 className="font-semibold mb-2">Revenue & patients on platform</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={kpiTrend} margin={{ left: -10 }}>
                <CartesianGrid stroke="oklch(0.3 0.02 160)" strokeDasharray="3 3" />
                <XAxis dataKey="m" tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} />
                <YAxis tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 160)", border: "1px solid oklch(0.3 0.02 160)" }} />
                <Line type="monotone" dataKey="mrr" stroke="oklch(0.82 0.18 145)" strokeWidth={2} dot={false} name="MRR ($k)" />
                <Line type="monotone" dataKey="patients" stroke="oklch(0.7 0.15 50)" strokeWidth={2} dot={false} name="Patients (k)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <h3 className="font-semibold mb-2">Funnel (latest cohort)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 160)", border: "1px solid oklch(0.3 0.02 160)" }} />
                <Bar dataKey="v" fill="oklch(0.82 0.18 145)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Section>
  );
}

/* ---------- PARTNERSHIPS ---------- */
function Partnerships() {
  const partners = [
    { t: "Wearables", d: "Apple Health, Fitbit, Oura, Whoop — passive signal ingestion." },
    { t: "Genomics labs", d: "23andMe, Color, Mapmygenome — variant ingestion + counselling handoff." },
    { t: "Clinic networks", d: "Tier-1 endocrinology + bariatric chains for distribution." },
    { t: "Payers & employers", d: "Self-insured employers + regional payers for PMPM contracts." },
    { t: "Pharma (GLP-1 era)", d: "Pre-Rx triage and post-Rx adherence panels." },
    { t: "Public health", d: "Government + NGO partnerships for population screening." },
  ];
  return (
    <Section
      eyebrow="09 · PARTNERSHIP ECOSYSTEM"
      title="A thriving network beats a heroic product."
      sub="Our defensibility comes from the graph of integrations and contracts — every partner deepens the moat and reduces CAC."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {partners.map((p) => (
          <Card key={p.t} className="p-5 bg-card border-border">
            <div className="font-semibold">{p.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{p.d}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ---------- LAUNCH READINESS ---------- */
function Launch() {
  const phases = [
    { p: "Closed beta", w: "Now", g: "200 patients, 8 clinicians, 1 hospital pilot. PMF radar > 70%." },
    { p: "Design partner", w: "+ 60 days", g: "3 paying clinics, 1 self-insured employer LOI, HIPAA & SOC-2 Type-1." },
    { p: "Public launch", w: "+ 120 days", g: "App stores, content engine live, 10k patient waitlist activated." },
    { p: "Payer pilot", w: "+ 180 days", g: "First shared-savings contract, outcomes report v1 published." },
    { p: "Scale", w: "+ 12 months", g: "$1M ARR, 25 clinic contracts, 2 payer contracts, SOC-2 Type-2." },
  ];
  return (
    <Section
      eyebrow="10 · LAUNCH READINESS & EXECUTION"
      title="Disciplined phasing, not a single big-bang day."
      sub="Each phase has a gate. We don’t move forward without evidence."
    >
      <div className="relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-4">
          {phases.map((p, i) => (
            <li key={p.p} className="relative pl-10">
              <span className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">{i+1}</span>
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-semibold">{p.p}</div>
                  <Badge variant="outline" className="border-primary/40 text-primary">{p.w}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{p.g}</div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------- ATOMS ---------- */
function Section({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <div className="text-xs tracking-[0.3em] text-primary flex items-center gap-2">
          <Sparkles className="h-3 w-3" /> {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">{sub}</p>
      </div>
      {children}
    </section>
  );
}

function Gate({ label, val, good }: { label: string; val: number; good?: boolean }) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${good ? "text-primary" : "text-accent"}`}>{val}%</span>
      </div>
      <Progress value={val} className="mt-2 h-1.5" />
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <div className="p-3 text-center">{children}</div>;
}
function Cell({ on, primary }: { on: boolean; primary?: boolean }) {
  return (
    <div className="p-3 text-center">
      {on ? (
        <CheckCircle2 className={`h-4 w-4 mx-auto ${primary ? "text-primary" : "text-muted-foreground"}`} />
      ) : (
        <span className="text-muted-foreground/40">—</span>
      )}
    </div>
  );
}
function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-5 bg-card border-border">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}

function Footer() {
  return (
    <footer className="pt-10 pb-12 border-t border-border text-center text-xs text-muted-foreground">
      Satya · Obesity Intelligence · Strategy view — internal & investor use.
    </footer>
  );
}