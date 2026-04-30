const docx = require("docx");
const fs = require("fs");

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, PageBreak, BorderStyle,
  ShadingType, LevelFormat, TableLayoutType, convertInchesToTwip,
} = docx;

// ── Constants ──────────────────────────────────────────────────────────
const BLUE = "2B6692";
const LIGHT_BLUE = "E8F0F7";
const WHITE = "FFFFFF";
const BLACK = "000000";
const LIGHT_GRAY = "F5F5F5";
const TABLE_WIDTH = 9360; // US Letter with 1" margins
const FONT = "Arial";
const BODY_SIZE = 20; // 10pt

// ── Helpers ────────────────────────────────────────────────────────────
const blueShading = { type: ShadingType.CLEAR, color: BLUE, fill: BLUE };
const lightBlueShading = { type: ShadingType.CLEAR, color: LIGHT_BLUE, fill: LIGHT_BLUE };
const whiteShading = { type: ShadingType.CLEAR, color: WHITE, fill: WHITE };
const grayShading = { type: ShadingType.CLEAR, color: LIGHT_GRAY, fill: LIGHT_GRAY };

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
};

function txt(text, opts = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size || BODY_SIZE,
    bold: opts.bold || false,
    italics: opts.italics || false,
    color: opts.color || BLACK,
    ...opts,
  });
}

function para(children, opts = {}) {
  if (typeof children === "string") children = [txt(children)];
  if (!Array.isArray(children)) children = [children];
  return new Paragraph({
    children,
    spacing: { after: opts.after !== undefined ? opts.after : 120, before: opts.before || 0 },
    alignment: opts.alignment || AlignmentType.LEFT,
    ...opts,
  });
}

function heading(text, level = 1) {
  const sizes = { 1: 32, 2: 26, 3: 22 };
  return new Paragraph({
    children: [txt(text, { bold: true, color: BLUE, size: sizes[level] || 26 })],
    spacing: { before: level === 1 ? 360 : 240, after: 120 },
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    children: typeof text === "string" ? [txt(text)] : text,
    numbering: { reference: "bullets", level: opts.level || 0 },
    spacing: { after: 60 },
  });
}

function headerCell(text, width) {
  return new TableCell({
    children: [para([txt(text, { bold: true, color: WHITE, size: 18 })], { alignment: AlignmentType.LEFT, after: 0 })],
    width: { size: width, type: WidthType.DXA },
    shading: blueShading,
    borders: thinBorders,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  });
}

function cell(text, width, opts = {}) {
  const children = typeof text === "string"
    ? [para([txt(text, { size: opts.fontSize || 18 })], { alignment: opts.alignment || AlignmentType.LEFT, after: 0 })]
    : text;
  return new TableCell({
    children,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading || whiteShading,
    borders: thinBorders,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: opts.verticalAlign,
  });
}

function makeTable(headers, rows, colWidths) {
  // Validate widths sum
  const sum = colWidths.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - TABLE_WIDTH) > 5) {
    console.warn(`Table width mismatch: ${sum} vs ${TABLE_WIDTH}. Adjusting last column.`);
    colWidths[colWidths.length - 1] += TABLE_WIDTH - sum;
  }

  const headerRow = new TableRow({
    children: headers.map((h, i) => headerCell(h, colWidths[i])),
    tableHeader: true,
  });

  const dataRows = rows.map((row, ri) => {
    const shade = ri % 2 === 1 ? grayShading : whiteShading;
    return new TableRow({
      children: row.map((c, ci) => {
        const isBold = typeof c === "object" && c.bold;
        const text = typeof c === "object" ? c.text : c;
        const align = typeof c === "object" && c.alignment ? c.alignment : AlignmentType.LEFT;
        return cell(text, colWidths[ci], { shading: shade, alignment: align, fontSize: isBold ? 18 : 18 });
      }),
    });
  });

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    layout: TableLayoutType.FIXED,
  });
}

function boldCell(text, width, shade) {
  return new TableCell({
    children: [para([txt(text, { bold: true, size: 18 })], { after: 0 })],
    width: { size: width, type: WidthType.DXA },
    shading: shade || whiteShading,
    borders: thinBorders,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  });
}

function callout(text) {
  return new Paragraph({
    children: [txt(text, { italics: true, color: BLUE, size: 18 })],
    spacing: { before: 120, after: 120 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 8 },
    },
    indent: { left: 200 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ── DOCUMENT CONTENT ───────────────────────────────────────────────────

// Cover Page
const coverPage = [
  para("", { after: 2400 }),
  para([txt("Crane Portfolio Intelligence", { bold: true, color: BLUE, size: 56 })], { alignment: AlignmentType.CENTER, after: 200 }),
  para([txt("MVP Platform Proposal", { color: BLUE, size: 36 })], { alignment: AlignmentType.CENTER, after: 600 }),
  para([txt("KeyValue  \u00B7  Crane Venture Partners", { size: 24, color: "666666" })], { alignment: AlignmentType.CENTER, after: 200 }),
  para([txt("March 2026  \u00B7  MVP Target: June 2026", { size: 22, color: "666666" })], { alignment: AlignmentType.CENTER, after: 600 }),
  para([txt("Feature Spec  \u00B7  Development Cost  \u00B7  Infrastructure Estimates", { size: 20, color: "999999" })], { alignment: AlignmentType.CENTER }),
  pageBreak(),
];

// Section 1: What We're Building
const section1 = [
  heading("1. What We\u2019re Building"),
  para("Crane Portfolio Intelligence is a purpose-built platform for Crane Venture Partners that consolidates portfolio data, automates monitoring workflows, and surfaces actionable insights across approximately 50\u201360 portfolio companies and 3 funds. The platform serves 20\u201330 internal users including partners, associates, and operations staff."),
  para("Today, Crane\u2019s portfolio tracking relies on a fragmented workflow spanning spreadsheets, Dropbox folders, email threads, and the Gigs Excel tracker. This creates data silos, missed signals, and manual overhead that grows with every new investment. Crane replaces this entirely with a single, integrated intelligence layer."),
  para("The MVP connects 7 data sources \u2014 Attio (CRM), Dropbox (documents), Gmail (correspondence), Notion (internal notes), Granola (meeting transcripts), Specter (market intelligence), and AlphaSense (research analytics) \u2014 to power dashboards, alerts, board preparation, and portfolio review workflows."),
  callout("MVP Principle: Ship a focused, functional product in 2\u20133 months. Every feature earns its place by solving a real workflow problem. Post-MVP features (semantic search, AI assistant, mobile app) are deliberately excluded to protect the timeline."),
  pageBreak(),
];

// Section 2: MVP Feature Scope
const inOutHeaders = ["Category", "IN (MVP)", "OUT (Post-MVP)"];
const inOutWidths = [2340, 3510, 3510];
const inOutRows = [
  ["Dashboard", "Portfolio overview with KPIs, sparklines, fund selector", "Customisable widget layouts"],
  ["Command Center", "Filterable company list with bulk actions", "Saved custom views"],
  ["Action Matrix", "Urgency/impact grid for triage", "Drag-and-drop re-prioritisation"],
  ["Company Detail", "Deep-dive with tabs: overview, financials, docs, contacts", "AI-generated company summaries"],
  ["Board Prep", "Template-based board pack assembly", "Auto-generated board narratives"],
  ["Portfolio Review", "Structured review workflows per company", "Cross-portfolio benchmarking"],
  ["Founder Verification", "Standalone founder data-submission form", "Multi-round verification flows"],
  ["Alert Engine", "9 rule-based alert types with severity levels", "ML-based anomaly detection"],
  ["Connectors", "7 integrations (Attio, Dropbox, Gmail, Notion, Granola, Specter, AlphaSense)", "Slack, Calendar, additional APIs"],
  ["Export", "Asset Metrix XLSX, LP Report PDF", "Custom report builder"],
  ["Auth & Users", "Role-based access (Admin, Partner, Associate, Viewer)", "SSO / SAML integration"],
  ["Search", "Keyword search across companies", "Semantic / vector search"],
  ["AI Features", "Data extraction from documents", "Conversational AI assistant"],
  ["Mobile", "Responsive web design", "Native mobile app"],
  ["Infrastructure", "AWS-hosted, Crane-owned account", "Multi-region / DR"],
];

const section2 = [
  heading("2. MVP Feature Scope"),
  para([txt("IN vs OUT", { bold: true, size: 22, color: BLUE })], { after: 120 }),
  makeTable(inOutHeaders, inOutRows, inOutWidths),
  para("", { after: 120 }),

  // Feature descriptions
  para([txt("Feature Descriptions", { bold: true, size: 22, color: BLUE })], { before: 240, after: 120 }),

  para([txt("Dashboard", { bold: true })]),
  para("Real-time portfolio overview displaying fund-level KPIs, sparkline performance charts, and a filterable company grid. Users select between Fund I, II, and III views, with at-a-glance health indicators for each company."),

  para([txt("Portfolio Command Center", { bold: true })]),
  para("Central hub for day-to-day portfolio management. Presents a sortable, filterable list of all portfolio companies with inline status badges, last-contact dates, and bulk action controls for efficient triage."),

  para([txt("Action Matrix", { bold: true })]),
  para("Two-dimensional urgency/impact grid that visually maps which companies need immediate attention. Companies are plotted by alert severity and business impact, enabling partners to prioritise effectively."),

  para([txt("Company Detail", { bold: true })]),
  para("Deep-dive view for individual portfolio companies with tabbed navigation across overview, financials, documents, contacts, and activity timeline. Pulls consolidated data from all 7 connected sources into a single pane."),

  para([txt("Board Prep", { bold: true })]),
  para("Template-driven workflow for assembling board meeting packs. Users select companies, choose a template, and the system pre-populates financial data, KPIs, and recent updates from connected sources. Export-ready output."),

  para([txt("Portfolio Review", { bold: true })]),
  para("Structured review workflow for systematic assessment of portfolio companies. Supports scoring across multiple dimensions, reviewer assignments, comment threads, and approval flows. Designed around Crane\u2019s quarterly review cadence."),

  para([txt("Founder Verification Form", { bold: true })]),
  para("Standalone, externally accessible form that founders complete to submit or verify company data (revenue, headcount, runway, milestones). No Crane login required. Submissions flow directly into the company record and trigger update alerts."),

  para([txt("Alert Engine", { bold: true })]),
  para("Rule-based notification system that monitors portfolio data for actionable events. Supports 9 alert types with configurable severity levels:"),

  // Alert rules table
  makeTable(
    ["#", "Alert Rule", "Trigger Condition", "Severity"],
    [
      ["1", "Revenue Drop", "MoM revenue decline > 15%", "High"],
      ["2", "Runway Warning", "Remaining runway < 6 months", "Critical"],
      ["3", "KPI Miss", "Key metric below target threshold", "Medium"],
      ["4", "Stale Data", "No data update in 30+ days", "Low"],
      ["5", "Founder Non-Response", "Verification form not completed in 14 days", "Medium"],
      ["6", "Headcount Change", "Headcount change > 20% in quarter", "Medium"],
      ["7", "Follow-on Due", "Time since last investment round > threshold", "Low"],
      ["8", "Board Meeting Due", "Next board meeting within 14 days, pack not started", "High"],
      ["9", "Document Expiry", "Key documents (SHA, cap table) older than 12 months", "Medium"],
    ],
    [480, 2400, 4080, 2400]
  ),
  para(""),

  para([txt("Export & Reporting", { bold: true })]),
  para("Two primary export formats: Asset Metrix-compatible XLSX for LP reporting, and a branded LP Report PDF with fund performance summaries, company snapshots, and portfolio analytics. Both are generated on-demand with current data."),
  pageBreak(),
];

// Section 3: Data Sources
const section3 = [
  heading("3. Data Sources & Integration Costs"),
  makeTable(
    ["#", "Connector", "Data Pulled", "Sync Frequency", "API Cost"],
    [
      ["1", "Attio (CRM)", "Companies, contacts, deals, pipeline stages, custom fields", "Real-time webhook + 15-min poll", "___"],
      ["2", "Dropbox", "Board packs, legal docs, financial reports (PDF/XLSX)", "Webhook on file change", "___"],
      ["3", "Gmail", "Founder correspondence, meeting confirmations, LP emails", "5-minute poll via Gmail API", "___"],
      ["4", "Notion", "Internal company notes, meeting notes, investment memos", "15-minute poll", "___"],
      ["5", "Granola", "Meeting transcripts, action items, AI-generated summaries", "Post-meeting webhook", "___"],
      ["6", "Specter", "Market intelligence, competitive signals, funding alerts", "Daily batch sync", "___"],
      ["7", "AlphaSense", "Research reports, earnings transcripts, sector analytics", "Daily batch sync", "___"],
    ],
    [480, 1440, 3360, 2160, 1920]
  ),
  para(""),

  para([txt("Data Conflict Resolution Priority", { bold: true, size: 22, color: BLUE })], { before: 200, after: 120 }),
  para("When the same data point appears in multiple sources, the system applies the following priority hierarchy:"),
  makeTable(
    ["Priority", "Source", "Rationale"],
    [
      ["1 (Highest)", "Founder Verification Form", "Direct from the company \u2014 most authoritative"],
      ["2", "Attio CRM", "Manually curated by Crane team"],
      ["3", "Financial Documents (Dropbox)", "Board-approved figures from uploaded documents"],
      ["4", "Granola Transcripts", "Verbal confirmations from meetings, AI-extracted"],
      ["5 (Lowest)", "Specter / AlphaSense", "Third-party estimates \u2014 used as fallback only"],
    ],
    [1560, 2800, 5000]
  ),
  pageBreak(),
];

// Section 4: Infrastructure
const section4 = [
  heading("4. Infrastructure Details"),
  para("All infrastructure runs on AWS, set up on Crane\u2019s own AWS account by KeyValue DevOps engineers. On project completion, full ownership transfers to Crane with no vendor lock-in."),
  para(""),
  makeTable(
    ["Component", "Service", "Specification", "Monthly Cost"],
    [
      ["Compute", "EC2 / ECS Fargate", "2x t3.medium (API), 1x t3.small (workers)", "___"],
      ["Database", "RDS PostgreSQL", "db.t3.medium, 100GB, Multi-AZ standby", "___"],
      ["Cache", "ElastiCache Redis", "cache.t3.small, single node", "___"],
      ["File Storage", "S3", "Standard tier, versioning enabled", "___"],
      ["CDN", "CloudFront", "Distribution for static assets and frontend", "___"],
      ["Email", "SES", "Transactional emails (alerts, invitations)", "___"],
      ["Monitoring", "CloudWatch", "Logs, metrics, alarms, dashboards", "___"],
      ["DNS", "Route 53", "Hosted zone + health checks", "___"],
    ],
    [1560, 2200, 3640, 1960]
  ),
  para(""),
  callout("Infrastructure is provisioned via Infrastructure-as-Code (Terraform/CDK) for reproducibility. All secrets managed via AWS Secrets Manager. SSL certificates via AWS Certificate Manager."),
  pageBreak(),
];

// Section 5: Development Cost & Timeline
const section5 = [
  heading("5. Development Cost & Timeline"),

  para([txt("Team Composition", { bold: true, size: 22, color: BLUE })], { after: 120 }),
  makeTable(
    ["Role", "Duration", "Est. Monthly Rate"],
    [
      ["Senior Full-Stack Developer", "2\u20133 months", "___"],
      ["Frontend Developer", "2\u20133 months", "___"],
      ["AI/ML Engineer", "2 months", "___"],
      ["DevOps Engineer", "2\u20133 months", "___"],
      ["Product Manager (Ali)", "2\u20133 months", "___"],
      ["UI/UX Designer", "1\u20132 months", "___"],
      ["QA Tester", "1\u20132 months", "___"],
    ],
    [3600, 2880, 2880]
  ),
  para(""),

  para([txt("Man-Day Effort Breakdown", { bold: true, size: 22, color: BLUE })], { before: 200, after: 120 }),
  para("Estimated effort in man-days by discipline. These are parallel work streams \u2014 the 4 engineers (FE, BE, AI, DevOps) work simultaneously, so the calendar timeline is driven by the longest sequential path (back-end at 38 days \u2248 8 weeks)."),
];

// Man-day table with bold total row
const mdHeaders = ["Category", "FE Days", "BE Days", "AI Days", "Total"];
const mdWidths = [3120, 1560, 1560, 1560, 1560];
const mdRows = [
  ["Setup & Infrastructure", "0.5", "0.5", "0", "1"],
  ["Auth & User Management", "1", "1.5", "0", "2.5"],
  ["Data Connectors (x7)", "0.5", "7.5", "5", "13"],
  ["Dashboard", "3.25", "2.25", "0", "5.5"],
  ["Command Center", "1.25", "1.25", "0", "2.5"],
  ["Action Matrix", "1", "1", "0", "2"],
  ["Company Detail", "4.75", "5", "0", "9.75"],
  ["Portfolio Review", "5", "6", "2", "13"],
  ["Board Prep", "1.25", "2", "3", "6.25"],
  ["Alert Engine", "1.5", "3.5", "0", "5"],
  ["Export & Reporting", "1", "2.5", "0", "3.5"],
  ["Settings & Admin", "1.75", "1", "0", "2.75"],
  ["QA & Testing", "0", "4", "0", "4"],
];

// Build man-day table manually to add bold total row
const mdHeaderRow = new TableRow({
  children: mdHeaders.map((h, i) => headerCell(h, mdWidths[i])),
  tableHeader: true,
});

const mdDataRows = mdRows.map((row, ri) => {
  const shade = ri % 2 === 1 ? grayShading : whiteShading;
  return new TableRow({
    children: row.map((c, ci) => cell(c, mdWidths[ci], { shading: shade })),
  });
});

// Total row
const totalRow = new TableRow({
  children: [
    boldCell("TOTAL", mdWidths[0], lightBlueShading),
    ...["22.75", "38", "10", "70.75"].map((v, i) =>
      new TableCell({
        children: [para([txt(v, { bold: true, size: 18 })], { after: 0 })],
        width: { size: mdWidths[i + 1], type: WidthType.DXA },
        shading: lightBlueShading,
        borders: thinBorders,
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
      })
    ),
  ],
});

const mdTable = new Table({
  rows: [mdHeaderRow, ...mdDataRows, totalRow],
  width: { size: TABLE_WIDTH, type: WidthType.DXA },
  columnWidths: mdWidths,
  layout: TableLayoutType.FIXED,
});

const section5b = [
  mdTable,
  para(""),

  para([txt("Development Cost Estimate", { bold: true, size: 22, color: BLUE })], { before: 200, after: 120 }),
  makeTable(
    ["Line Item", "Low Estimate", "High Estimate"],
    [
      ["Core development team (Full-Stack + FE + DevOps)", "___", "___"],
      ["AI/ML Engineer", "___", "___"],
      ["PM, Design & Testing", "___", "___"],
      ["Buffer (15%)", "___", "___"],
      [{ text: "Total Development Cost", bold: true }, "___", "___"],
    ],
    [4680, 2340, 2340]
  ),
  para(""),

  para([txt("Build Timeline", { bold: true, size: 22, color: BLUE })], { before: 200, after: 120 }),
  para("With 4 engineers working in parallel (frontend, back-end, AI, DevOps), the build completes in approximately 2\u20133 months. The critical path runs through back-end development at 38 man-days (\u22488 weeks)."),
  makeTable(
    ["Phase", "Duration", "What Gets Done"],
    [
      ["Phase 1 \u2014 Foundation", "Weeks 1\u20133", "AWS infrastructure setup, database schema, authentication & RBAC, Attio + Dropbox + Gmail connectors, core data models"],
      ["Phase 2 \u2014 Core Platform", "Weeks 4\u20137", "Dashboard, Command Center, Company Detail, Action Matrix, Board Prep, remaining connectors (Notion, Granola, Specter, AlphaSense), Alert Engine, AI extraction pipeline"],
      ["Phase 3 \u2014 Workflows & Polish", "Weeks 8\u201310", "Portfolio Review workflows, Founder Verification Portal, Asset Metrix XLSX export, LP Report PDF, AI summarisation, QA & regression testing, security review, soft launch"],
    ],
    [2340, 1560, 5460]
  ),
  pageBreak(),
];

// Section 6: Total Cost Summary
const section6 = [
  heading("6. Total Cost Summary"),
  makeTable(
    ["Category", "Low Estimate", "High Estimate"],
    [
      ["Development (one-time)", "___", "___"],
      ["Monthly infrastructure", "___", "___"],
      ["Annual infrastructure", "___", "___"],
      [{ text: "Year-1 Total", bold: true }, "___", "___"],
    ],
    [4680, 2340, 2340]
  ),
  para(""),
  callout("Excludes third-party data-source costs (Specter subscription, AlphaSense licence, etc.) which are billed directly to Crane by each vendor."),
  pageBreak(),
];

// Section 7: What Comes After MVP
const section7 = [
  heading("7. What Comes After MVP"),
  para("The following capabilities are explicitly out of scope for the MVP but represent the natural product roadmap."),
  para(""),
  makeTable(
    ["Feature", "Description", "Added Cost"],
    [
      ["Intelligence Hub", "Centralised AI-powered insights dashboard with trend detection and anomaly alerts", "___"],
      ["Semantic Search", "Vector-based search across all documents, notes, and transcripts", "___"],
      ["AI Assistant", "Conversational interface for natural-language portfolio queries", "___"],
      ["Slack Integration", "Real-time alert delivery and slash-command queries from Slack", "___"],
      ["Mobile App", "Native iOS/Android app for on-the-go portfolio monitoring", "___"],
      ["Investor Portal", "LP-facing read-only dashboard with fund performance and reporting", "___"],
      ["Advanced ESG", "ESG scoring, carbon tracking, and diversity metrics per company", "___"],
      ["Cross-lingual OCR", "Multi-language document parsing for international portfolio companies", "___"],
    ],
    [2340, 5100, 1920]
  ),
  pageBreak(),
];

// Section 8: Key Risks
const section8 = [
  heading("8. Key Risks"),
  makeTable(
    ["#", "Risk", "Impact", "Likelihood", "Mitigation"],
    [
      ["1", "API rate limits or downtime on third-party services", "Data freshness degrades", "Medium", "Implement retry logic, circuit breakers, and cached fallback data"],
      ["2", "Data quality inconsistencies across sources", "Incorrect portfolio metrics", "High", "Conflict resolution hierarchy + data validation rules + manual override"],
      ["3", "Scope creep during build", "Timeline slips past June", "Medium", "Strict MVP boundary enforced by PM; change requests go to post-MVP backlog"],
      ["4", "Founder verification adoption", "Incomplete company data", "Medium", "Simple, mobile-friendly form; automated reminders; fallback to manual entry"],
      ["5", "AWS cost overrun", "Budget exceeded", "Low", "Cost alerts, reserved instances, right-sizing reviews at Week 4 and Week 8"],
      ["6", "Key person dependency", "Delivery stalls if team member unavailable", "Low", "Cross-training, documentation, and pair programming practices"],
      ["7", "Security / data breach", "Reputational and regulatory exposure", "Low", "Encryption at rest and in transit, RBAC, audit logging, pen-test before launch"],
    ],
    [480, 2000, 1800, 1200, 3880]
  ),
  pageBreak(),
];

// Section 9: Assumptions
const section9 = [
  heading("9. Assumptions"),
  para("This proposal is based on the following assumptions. Material changes to these may affect scope, timeline, or cost."),
  bullet("Portfolio size of approximately 50\u201360 companies across 3 funds"),
  bullet("20\u201330 internal users (partners, associates, operations, finance)"),
  bullet("AWS-only infrastructure, hosted on Crane\u2019s own AWS account"),
  bullet("7 data connectors only (Attio, Dropbox, Gmail, Notion, Granola, Specter, AlphaSense) \u2014 no fund accounting integration"),
  bullet("Crane provides timely API credentials and sandbox access for all 7 data sources"),
  bullet("No single sign-on (SSO/SAML) required for MVP \u2014 email/password authentication with RBAC"),
  bullet("Design assets and brand guidelines provided by Crane within Week 1"),
  bullet("One round of UAT feedback incorporated before launch; further iterations are post-MVP"),
  bullet("KeyValue DevOps team sets up and manages infrastructure during build; ownership transfers to Crane on completion"),
  bullet("Third-party data costs (Specter, AlphaSense subscriptions) are borne by Crane directly"),
  pageBreak(),
];

// Section 10: Agreement & Working Terms
const section10 = [
  heading("10. Agreement & Working Terms"),
  para([txt("Payment Schedule", { bold: true })]),
  bullet("30% upfront on signing"),
  bullet("30% at Phase 2 completion (core platform delivered)"),
  bullet("30% at MVP launch"),
  bullet("10% retained for 30-day warranty period"),

  para([txt("Warranty & Support", { bold: true })], { before: 200 }),
  bullet("30-day post-launch warranty covering bug fixes at no additional cost"),
  bullet("Critical bugs (P0/P1) addressed within 24 hours during warranty"),
  bullet("Post-warranty support available under a separate maintenance agreement"),

  para([txt("Intellectual Property", { bold: true })], { before: 200 }),
  bullet("All custom code, documentation, and infrastructure configuration are owned by Crane Venture Partners upon final payment"),
  bullet("KeyValue retains no proprietary claim to the delivered platform"),
  bullet("Open-source components remain under their respective licences"),

  para([txt("Confidentiality", { bold: true })], { before: 200 }),
  bullet("Both parties agree to standard mutual NDA terms covering portfolio data, financial information, and proprietary processes"),
  pageBreak(),
];

// Section 11: Next Steps
const section11 = [
  heading("11. Next Steps"),
  para("To proceed, we recommend the following actions:"),
  para(""),
  makeTable(
    ["#", "Action", "Owner", "Target Date"],
    [
      ["1", "Review and approve this MVP proposal", "Crane Partners", "Week of 31 Mar"],
      ["2", "Sign statement of work and process upfront payment", "Crane + KeyValue", "Week of 7 Apr"],
      ["3", "Provide API credentials for all 7 data sources", "Crane Ops", "Week of 7 Apr"],
      ["4", "Provide brand guidelines and design assets", "Crane", "Week of 7 Apr"],
      ["5", "Kick-off meeting and sprint planning", "KeyValue PM", "Week of 14 Apr"],
      ["6", "AWS account setup and infrastructure provisioning", "KeyValue DevOps", "Week of 14 Apr"],
      ["7", "Phase 1 delivery checkpoint", "KeyValue", "Week of 5 May"],
      ["8", "Phase 2 delivery checkpoint", "KeyValue", "Week of 26 May"],
      ["9", "MVP launch and UAT", "All", "Week of 16 Jun"],
    ],
    [480, 3960, 2280, 2640]
  ),
  para(""),
  para(""),
  para([txt("We look forward to building Crane Portfolio Intelligence together.", { italics: true, color: BLUE, size: 22 })], { alignment: AlignmentType.CENTER }),
  para(""),
  para([txt("KeyValue  \u00B7  ", { color: "666666" }), txt("hello@keyvalue.dev", { color: BLUE })], { alignment: AlignmentType.CENTER }),
];

// ── BUILD DOCUMENT ─────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 180 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "\u25E6",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 180 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font: FONT, size: BODY_SIZE, color: BLACK },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        ...coverPage,
        ...section1,
        ...section2,
        ...section3,
        ...section4,
        ...section5,
        ...section5b,
        ...section6,
        ...section7,
        ...section8,
        ...section9,
        ...section10,
        ...section11,
      ],
    },
  ],
});

// ── WRITE FILE ─────────────────────────────────────────────────────────
const OUTPUT = "/Users/muhammadali/Kevyvalue /Crane Venture/Crane_MVP_Proposal.docx";

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`Document written to: ${OUTPUT}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}).catch((err) => {
  console.error("Error generating document:", err);
  process.exit(1);
});
