import { useState } from "react";

const C = {
  bg:        "#090d14",
  panel:     "#0e1420",
  card:      "#131c2e",
  border:    "#1e2d44",
  borderMid: "#253654",
  text:      "#e6edf3",
  textSec:   "#7d8590",
  textMuted: "#484f58",
  blue:      "#388bfd",
  blueDim:   "rgba(56,139,253,0.12)",
  green:     "#3fb950",
  greenDim:  "rgba(63,185,80,0.10)",
  orange:    "#e3702a",
  orangeDim: "rgba(227,112,42,0.10)",
  purple:    "#bc8cff",
  purpleDim: "rgba(188,140,255,0.10)",
  red:       "#f85149",
  redDim:    "rgba(248,81,73,0.10)",
  teal:      "#39c5cf",
  tealDim:   "rgba(57,197,207,0.10)",
  yellow:    "#d29922",
};

const MONO = "'JetBrains Mono','Fira Code',monospace";
const SANS = "'DM Sans',system-ui,sans-serif";

// ── Legend item ──────────────────────────────────────────────────────────
const LegendItem = ({ color, label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:24, height:2, background:color, borderRadius:1 }} />
    <span style={{ fontSize:11, color:C.textSec }}>{label}</span>
  </div>
);

// ── Service box ──────────────────────────────────────────────────────────
const Box = ({ label, sub, color, dim, icon, onClick, active, width=140 }) => (
  <div onClick={onClick} style={{
    width, background: active ? dim : C.card,
    border: `1px solid ${active ? color : C.border}`,
    borderTop: `2px solid ${color}`,
    borderRadius:8, padding:"10px 12px", cursor: onClick?"pointer":"default",
    transition:"all 0.15s", userSelect:"none",
    boxShadow: active ? `0 0 12px ${color}20` : "none",
  }}>
    <div style={{ fontSize:16, marginBottom:4 }}>{icon}</div>
    <div style={{ fontSize:12, fontWeight:700, color:C.text, lineHeight:1.2 }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:C.textMuted, marginTop:3, lineHeight:1.3 }}>{sub}</div>}
  </div>
);

// ── Section wrapper ──────────────────────────────────────────────────────
const Section = ({ title, subtitle, color, dim, children, width }) => (
  <div style={{
    background: dim, border:`1px solid ${color}40`,
    borderRadius:12, padding:"16px 18px", width,
  }}>
    <div style={{ fontSize:13, fontWeight:700, color, marginBottom:2 }}>{title}</div>
    {subtitle && <div style={{ fontSize:10, color:C.textMuted, marginBottom:14 }}>{subtitle}</div>}
    {children}
  </div>
);

// ── Arrow label ──────────────────────────────────────────────────────────
const ArrowLabel = ({ text, color, vertical=false }) => (
  <div style={{
    fontSize:9, color, fontFamily:MONO, fontWeight:600,
    background:C.bg, padding:"2px 6px", borderRadius:3,
    border:`1px solid ${color}40`, whiteSpace:"nowrap",
    transform: vertical ? "rotate(-90deg)" : undefined,
  }}>{text}</div>
);

// ── Connector line (SVG) ─────────────────────────────────────────────────
const HArrow = ({ color, dashed=false, label, width=80 }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, width }}>
    {label && <ArrowLabel text={label} color={color} />}
    <svg width={width} height={18} style={{ overflow:"visible" }}>
      <defs>
        <marker id={`ah-${color.replace("#","")}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1="4" y1="9" x2={width-6} y2="9"
        stroke={color} strokeWidth="1.5"
        strokeDasharray={dashed?"5,3":undefined}
        markerEnd={`url(#ah-${color.replace("#","")})`}
      />
    </svg>
  </div>
);

const VArrow = ({ color, dashed=false, label, height=40 }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, height, flexDirection:"column" }}>
    <svg width={18} height={height} style={{ overflow:"visible" }}>
      <defs>
        <marker id={`av-${color.replace("#","")}-${height}`} markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
          <path d="M0,0 L6,0 L3,6 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1="9" y1="4" x2="9" y2={height-6}
        stroke={color} strokeWidth="1.5"
        strokeDasharray={dashed?"5,3":undefined}
        markerEnd={`url(#av-${color.replace("#","")}-${height})`}
      />
    </svg>
    {label && <ArrowLabel text={label} color={color} />}
  </div>
);

// ── Flow detail panel ─────────────────────────────────────────────────────
const FLOWS = {
  predict: {
    title: "Prediction Request Flow",
    color: C.blue,
    steps: [
      { n:"1", from:"React Dashboard",        to:"Client API Proxy (ECS)",      proto:"HTTPS",     note:"POST /api/v1/predictions/predict" },
      { n:"2", from:"Client API Proxy",        to:"Redis Cache",                 proto:"TCP 6379",  note:"Check cache by feature hash" },
      { n:"3", from:"Client API Proxy",        to:"AssetIQ Gateway (Proprietary)",proto:"HTTPS",    note:"POST /v1/predict — ASSETIQ_API_KEY in header" },
      { n:"4", from:"AssetIQ Gateway",         to:"SageMaker Endpoint",          proto:"AWS SDK",   note:"InvokeEndpoint — model inference" },
      { n:"5", from:"SageMaker",               to:"S3 Model Artifacts",          proto:"S3 GetObject", note:"Load model on cold start only" },
      { n:"6", from:"AssetIQ Gateway",         to:"Client API Proxy",            proto:"HTTPS",     note:"PredictionResult JSON response" },
      { n:"7", from:"Client API Proxy",        to:"Redis Cache",                 proto:"TCP 6379",  note:"Store result (TTL 300s)" },
      { n:"8", from:"Client API Proxy",        to:"React Dashboard",             proto:"HTTPS",     note:"Return result to dashboard" },
    ],
  },
  optimize: {
    title: "Portfolio Optimisation Flow",
    color: C.green,
    steps: [
      { n:"1", from:"React Dashboard",         to:"Client API Proxy (ECS)",      proto:"HTTPS",     note:"POST /api/v1/portfolio/optimize" },
      { n:"2", from:"Client API Proxy",        to:"Client RDS (PostgreSQL)",     proto:"TCP 5432",  note:"Load asset registry for portfolio" },
      { n:"3", from:"Client API Proxy",        to:"AssetIQ Gateway (Proprietary)",proto:"HTTPS",    note:"POST /v1/optimize — budget + assets payload" },
      { n:"4", from:"AssetIQ Gateway",         to:"SageMaker Endpoint",          proto:"AWS SDK",   note:"Run capital optimiser (cvxpy)" },
      { n:"5", from:"AssetIQ Gateway",         to:"S3 Outputs Bucket",           proto:"S3 PutObject", note:"Store run results for audit trail" },
      { n:"6", from:"AssetIQ Gateway",         to:"Client API Proxy",            proto:"HTTPS",     note:"OptimisationResult with ranked recommendations" },
      { n:"7", from:"Client API Proxy",        to:"Client RDS",                  proto:"TCP 5432",  note:"Persist results for dashboard history" },
      { n:"8", from:"Client API Proxy",        to:"React Dashboard",             proto:"HTTPS",     note:"Return recommendations to dashboard" },
    ],
  },
  telemetry: {
    title: "Telemetry Ingest Flow",
    color: C.orange,
    steps: [
      { n:"1", from:"Licensee SCADA/IoT",      to:"Client API Proxy (ECS)",      proto:"HTTPS",     note:"POST /api/v1/assets — raw sensor data" },
      { n:"2", from:"Client API Proxy",        to:"Client RDS (PostgreSQL)",     proto:"TCP 5432",  note:"Persist raw telemetry — never leaves licensee VPC" },
      { n:"3", from:"Client API Proxy",        to:"S3 Raw Data Bucket (Client)", proto:"S3 PutObject", note:"Long-term telemetry archive" },
      { n:"4", from:"Client API Proxy",        to:"AssetIQ Gateway (Proprietary)",proto:"HTTPS",    note:"POST /v1/feedback — anonymised usage signal only" },
      { n:"5", from:"AssetIQ Gateway",         to:"S3 Training Data (Proprietary)",proto:"S3 PutObject", note:"Anonymised feedback for model retraining" },
    ],
  },
  auth: {
    title: "Authentication & Secret Flow",
    color: C.purple,
    steps: [
      { n:"1", from:"ECS Task (Client)",       to:"AWS SSM Parameter Store",     proto:"AWS SDK",   note:"Fetch ASSETIQ_API_KEY at task startup" },
      { n:"2", from:"ECS Task (Proprietary)",  to:"AWS SSM Parameter Store",     proto:"AWS SDK",   note:"Fetch API_SECRET_KEY at task startup" },
      { n:"3", from:"Client API Proxy",        to:"AssetIQ Gateway",             proto:"HTTPS",     note:"Bearer: ASSETIQ_API_KEY — per-tenant issued key" },
      { n:"4", from:"AssetIQ Gateway",         to:"Redis (Proprietary)",         proto:"TCP 6379",  note:"Validate key + check rate limit (100 req/min)" },
      { n:"5", from:"AssetIQ Gateway",         to:"Usage Meter (ECS)",           proto:"Internal",  note:"Increment monthly API call counter" },
      { n:"6", from:"Usage Meter",             to:"RDS (Proprietary)",           proto:"TCP 5432",  note:"Persist usage — billed to tenant" },
    ],
  },
};

export default function App() {
  const [activeFlow, setActiveFlow] = useState(null);
  const [activeBox,  setActiveBox]  = useState(null);

  const toggle = (id) => setActiveFlow(f => f===id ? null : id);
  const flow = activeFlow ? FLOWS[activeFlow] : null;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:SANS, color:C.text, padding:28 }}>
      <style>{`* { box-sizing:border-box } ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}`}</style>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.02em" }}>
          AssetIQ Infrastructure Architecture
        </h1>
        <p style={{ fontSize:12, color:C.textSec, marginTop:4, marginBottom:0 }}>
          Client ↔ Proprietary communication topology · Click a flow button to trace a request path
        </p>
      </div>

      {/* Flow selector */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {Object.entries(FLOWS).map(([id, f]) => (
          <button key={id} onClick={() => toggle(id)} style={{
            fontSize:11, fontWeight:600, padding:"6px 14px", borderRadius:6,
            cursor:"pointer", fontFamily:SANS, letterSpacing:"0.02em",
            background:  activeFlow===id ? f.color  : C.card,
            color:       activeFlow===id ? "#fff"   : C.textSec,
            border:      activeFlow===id ? `1px solid ${f.color}` : `1px solid ${C.border}`,
            transition:"all 0.15s",
          }}>{f.title.replace(" Flow","")}</button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:12, alignItems:"center" }}>
          <LegendItem color={C.blue}   label="HTTPS / REST" />
          <LegendItem color={C.orange} label="AWS SDK" />
          <LegendItem color={C.green}  label="TCP (internal)" />
          <LegendItem color={C.purple} label="Auth" />
          <LegendItem color={C.textMuted} label="──── dashed = async" />
        </div>
      </div>

      {/* Main diagram */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>

        {/* ── INTERNET / USERS ── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <Section title="🌐 Internet" subtitle="Licensee users & systems" color={C.textMuted} dim="rgba(72,79,88,0.08)" width={160}>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <Box label="React Dashboard" sub="CloudFront → S3" color={C.blue} dim={C.blueDim} icon="📊"
                active={activeBox==="dash"} onClick={()=>setActiveBox(b=>b==="dash"?null:"dash")} />
              <Box label="SCADA / IoT" sub="Licensee field devices" color={C.orange} dim={C.orangeDim} icon="🏭"
                active={activeBox==="scada"} onClick={()=>setActiveBox(b=>b==="scada"?null:"scada")} />
            </div>
          </Section>
        </div>

        <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", gap:20, paddingTop:60 }}>
          <HArrow color={C.blue}   label="HTTPS" width={60} />
          <HArrow color={C.orange} label="HTTPS" width={60} />
        </div>

        {/* ── CLIENT STACK (LICENSEE AWS ACCOUNT) ── */}
        <Section title="🏢 Client Stack" subtitle="Licensee's AWS account" color={C.blue} dim={C.blueDim} width={320}>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>ECS Fargate</div>
              <Box label="Client API Proxy" sub="FastAPI · Port 8000" color={C.blue} dim={C.blueDim} icon="🔀" width={130}
                active={activeBox==="proxy"} onClick={()=>setActiveBox(b=>b==="proxy"?null:"proxy")} />
            </div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <VArrow color={C.green} height={50} label="TCP 5432" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>RDS (Multi-AZ)</div>
              <Box label="PostgreSQL" sub="Asset registry · Cache" color={C.green} dim={C.greenDim} icon="🐘" width={120}
                active={activeBox==="rds-c"} onClick={()=>setActiveBox(b=>b==="rds-c"?null:"rds-c")} />
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>ElastiCache</div>
              <Box label="Redis" sub="Response cache · TTL 300s" color={C.teal} dim={C.tealDim} icon="⚡" width={130}
                active={activeBox==="redis-c"} onClick={()=>setActiveBox(b=>b==="redis-c"?null:"redis-c")} />
            </div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <VArrow color={C.teal} height={50} label="TCP 6379" />
            </div>
            <div style={{ flex:1 }} />
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>S3</div>
              <Box label="Raw Data Bucket" sub="Telemetry archive" color={C.orange} dim={C.orangeDim} icon="🪣" width={130}
                active={activeBox==="s3-raw"} onClick={()=>setActiveBox(b=>b==="s3-raw"?null:"s3-raw")} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>S3</div>
              <Box label="Dashboard Bucket" sub="React SPA → CloudFront" color={C.blue} dim={C.blueDim} icon="🌐" width={130}
                active={activeBox==="s3-dash"} onClick={()=>setActiveBox(b=>b==="s3-dash"?null:"s3-dash")} />
            </div>
          </div>

          <div style={{ marginTop:12, padding:"8px 10px", background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color:C.textMuted, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>AWS Services (shared)</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["SSM Params", "ECR", "ALB", "CloudWatch", "Route53"].map(s => (
                <span key={s} style={{ fontSize:10, color:C.textSec, background:C.panel, border:`1px solid ${C.border}`, padding:"2px 7px", borderRadius:4 }}>{s}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── THE API BOUNDARY ── */}
        <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-start", gap:8, paddingTop:30 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ fontSize:10, color:C.textMuted, fontFamily:MONO, textAlign:"center", lineHeight:1.5 }}>
              api.assetiq.io<br/>HTTPS + API Key
            </div>
            <svg width={80} height={20}>
              <defs>
                <marker id="ah2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill={C.purple} />
                </marker>
                <marker id="ah3" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                  <path d="M6,0 L0,3 L6,6 Z" fill={C.purple} />
                </marker>
              </defs>
              <line x1="4" y1="7" x2="74" y2="7" stroke={C.purple} strokeWidth="1.5" markerEnd="url(#ah2)" markerStart="url(#ah3)" />
              <line x1="4" y1="13" x2="74" y2="13" stroke={C.purple} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#ah2)" markerStart="url(#ah3)" />
            </svg>
            <div style={{ fontSize:9, color:C.purple, fontFamily:MONO, background:C.purpleDim, border:`1px solid ${C.purple}40`, padding:"2px 8px", borderRadius:3 }}>
              ① Predict  ② Optimize
            </div>
            <div style={{ fontSize:9, color:C.textMuted, fontFamily:MONO, background:C.bg, border:`1px solid ${C.border}`, padding:"2px 8px", borderRadius:3 }}>
              ③ Feedback (async)
            </div>
          </div>

          <div style={{ marginTop:16, padding:"8px 10px", background:C.purpleDim, border:`1px solid ${C.purple}40`, borderRadius:6, width:80 }}>
            <div style={{ fontSize:9, color:C.purple, fontWeight:700, marginBottom:4 }}>BOUNDARY</div>
            <div style={{ fontSize:9, color:C.textMuted, lineHeight:1.5 }}>
              Raw data stays in licensee VPC.<br/><br/>
              Only requests cross this line.
            </div>
          </div>
        </div>

        {/* ── PROPRIETARY STACK (ASSETIQ AWS ACCOUNT) ── */}
        <Section title="🔒 Proprietary Stack" subtitle="AssetIQ's AWS account" color={C.purple} dim={C.purpleDim} width={320}>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>ECS Fargate</div>
              <Box label="API Gateway" sub="FastAPI · Auth · Rate limit" color={C.purple} dim={C.purpleDim} icon="🛡" width={130}
                active={activeBox==="gateway"} onClick={()=>setActiveBox(b=>b==="gateway"?null:"gateway")} />
            </div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <VArrow color={C.green} height={50} label="TCP 5432" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>RDS (Multi-AZ)</div>
              <Box label="PostgreSQL" sub="Usage · Tenants · Audit" color={C.green} dim={C.greenDim} icon="🐘" width={120}
                active={activeBox==="rds-p"} onClick={()=>setActiveBox(b=>b==="rds-p"?null:"rds-p")} />
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>ECS Fargate</div>
              <Box label="Usage Meter" sub="Billing · Rate limiting" color={C.orange} dim={C.orangeDim} icon="📊" width={130}
                active={activeBox==="meter"} onClick={()=>setActiveBox(b=>b==="meter"?null:"meter")} />
            </div>
            <div style={{ display:"flex", alignItems:"center" }}>
              <VArrow color={C.teal} height={50} label="TCP 6379" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>ElastiCache</div>
              <Box label="Redis" sub="Rate limits · Key lookup" color={C.teal} dim={C.tealDim} icon="⚡" width={120}
                active={activeBox==="redis-p"} onClick={()=>setActiveBox(b=>b==="redis-p"?null:"redis-p")} />
            </div>
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>SageMaker</div>
            <div style={{ display:"flex", gap:10 }}>
              <Box label="ML Endpoint" sub="RegimeDetector · FailurePredictor" color={C.red} dim={C.redDim} icon="🧠" width={130}
                active={activeBox==="sm"} onClick={()=>setActiveBox(b=>b==="sm"?null:"sm")} />
              <Box label="Capital Optimiser" sub="MetaLearner · cvxpy" color={C.red} dim={C.redDim} icon="⚙️" width={130}
                active={activeBox==="sm2"} onClick={()=>setActiveBox(b=>b==="sm2"?null:"sm2")} />
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>S3</div>
              <Box label="Model Artifacts" sub="Training outputs" color={C.red} dim={C.redDim} icon="🪣" width={130}
                active={activeBox==="s3-model"} onClick={()=>setActiveBox(b=>b==="s3-model"?null:"s3-model")} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>S3</div>
              <Box label="Outputs Bucket" sub="Run results · Audit trail" color={C.orange} dim={C.orangeDim} icon="🪣" width={130}
                active={activeBox==="s3-out"} onClick={()=>setActiveBox(b=>b==="s3-out"?null:"s3-out")} />
            </div>
          </div>

          <div style={{ marginTop:12, padding:"8px 10px", background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color:C.textMuted, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>AWS Services (shared)</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["SSM Params", "ECR", "ALB", "WAF", "CloudWatch", "Route53", "ACM"].map(s => (
                <span key={s} style={{ fontSize:10, color:C.textSec, background:C.panel, border:`1px solid ${C.border}`, padding:"2px 7px", borderRadius:4 }}>{s}</span>
              ))}
            </div>
          </div>
        </Section>

      </div>

      {/* ── Flow detail panel ── */}
      {flow && (
        <div style={{ marginTop:20, background:C.card, border:`1px solid ${flow.color}40`, borderLeft:`3px solid ${flow.color}`, borderRadius:10, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:flow.color }}>{flow.title}</div>
            <button onClick={() => setActiveFlow(null)} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {flow.steps.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"8px 0", borderBottom: i < flow.steps.length-1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:flow.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff", flexShrink:0 }}>{s.n}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:C.text }}>
                    <span style={{ color:flow.color, fontWeight:600 }}>{s.from}</span>
                    <span style={{ color:C.textMuted }}> → </span>
                    <span style={{ fontWeight:600 }}>{s.to}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{s.note}</div>
                </div>
                <div style={{ fontSize:10, color:flow.color, background:`${flow.color}15`, border:`1px solid ${flow.color}30`, padding:"2px 8px", borderRadius:3, fontFamily:MONO, flexShrink:0 }}>{s.proto}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Key design decisions ── */}
      <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          { icon:"🔐", title:"Raw data never leaves client VPC", body:"Sensor telemetry, asset records, and PII stay in the licensee's PostgreSQL and S3. Only anonymised prediction requests cross the API boundary.", color:C.green },
          { icon:"🔑", title:"API key auth per tenant", body:"Each licensee gets a unique ASSETIQ_API_KEY stored in SSM. The gateway validates against Redis on every request and enforces a 100 req/min rate limit.", color:C.purple },
          { icon:"🧠", title:"Models are fully opaque to client", body:"SageMaker endpoints are in AssetIQ's account. The client receives prediction scores and recommendations — never model weights or algorithm code.", color:C.red },
        ].map(({ icon, title, body, color }) => (
          <div key={title} style={{ background:C.card, border:`1px solid ${C.border}`, borderTop:`2px solid ${color}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:18, marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:12, fontWeight:700, color, marginBottom:6 }}>{title}</div>
            <div style={{ fontSize:11, color:C.textSec, lineHeight:1.6 }}>{body}</div>
          </div>
        ))}
      </div>

      {/* ── Network / port reference ── */}
      <div style={{ marginTop:16, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 18px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:10 }}>Network & Port Reference</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[
            { from:"Dashboard",         to:"Client ALB",       port:"443 HTTPS",    dir:"→" },
            { from:"Client ECS",        to:"Proprietary ALB",  port:"443 HTTPS",    dir:"→" },
            { from:"Proprietary ALB",   to:"API Key validation",port:"443 HTTPS",   dir:"→" },
            { from:"Gateway ECS",       to:"SageMaker",        port:"AWS SDK",      dir:"→" },
            { from:"Client ECS",        to:"Client RDS",       port:"5432 TCP",     dir:"↕" },
            { from:"Client ECS",        to:"Client Redis",     port:"6379 TCP",     dir:"↕" },
            { from:"Gateway ECS",       to:"Proprietary RDS",  port:"5432 TCP",     dir:"↕" },
            { from:"Gateway ECS",       to:"Proprietary Redis",port:"6379 TCP",     dir:"↕" },
            { from:"ECS Tasks",         to:"SSM Param Store",  port:"443 HTTPS",    dir:"→" },
            { from:"SageMaker",         to:"S3 Model Artifacts",port:"443 HTTPS",   dir:"→" },
            { from:"Gateway",           to:"S3 Outputs",       port:"443 HTTPS",    dir:"→" },
            { from:"Client Proxy",      to:"S3 Raw Data",      port:"443 HTTPS",    dir:"→" },
          ].map(r => (
            <div key={r.from+r.to} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px" }}>
              <div style={{ fontSize:10, color:C.textSec }}>{r.from}</div>
              <div style={{ fontSize:10, color:C.textMuted }}>{r.dir}</div>
              <div style={{ fontSize:10, color:C.textSec }}>{r.to}</div>
              <div style={{ fontSize:10, color:C.blue, fontFamily:MONO, marginTop:3 }}>{r.port}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
