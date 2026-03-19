
CRANE × KEYVALUE
Portfolio Intelligence Platform
Project Scope & UI Specification

Version
5.0 — LP Report Structure + Data Model
Date
18 March 2026
Prepared by
Ali / KeyValue
Prepared for
Anna / Crane
Status
Draft — Pending Crane Review


Changelog: v4 → v5
Changes based on analysis of the Crane I LP Quarterly Report (Q4 2022) and Gigs Performance Data Template.

Area
Change
Detail
Portfolio Framework
Added Non-core status
Grey/Non-core status from LP report RAG system. Companies like Plumerai and Omni:us get minimal tracking. Reduces noise in dashboard views.
Command Center
Added Fund Performance section
TVPI, DPI, NAV waterfall, deployed vs available — matching the LP report’s fund-level metrics. Missing entirely from v4.
Company Detail
Restructured to match LP report
Company pages now follow the exact two-page LP report layout: Page 1 = qualitative (details, RAG strip, summary/concerns/actions), Page 2 = monthly financial charts with PY overlay + diversity data.
Data Model
Expanded to match Gigs template
14 new monthly financial fields (ARR, Revenue, COGS, Overheads, Gross Profit, EBITDA, etc.) + diversity metrics (gender/ethnicity at FTE and Board level). Carried forward from LP report analysis.
Fund Entity
New: fund-level data model
Standing data, fund performance metrics (TVPI/DPI/NAV), uses of funds, geographic distribution. Required for LP report generation.
Investment Accounting
New: cost basis + carrying value
Per-company: cost at period, carrying value, MoIC, NAV uplift, and valuation basis. Required for LP report portfolio table.
LP Report Generation
New: Section 6.5 expanded
Detailed spec for auto-generating the LP quarterly report matching the exact structure of the existing Crane I report. ~70-80% auto-generatable.
Exit Tracking
New: exited company handling
Exit date, exit type (sale/wind-down/write-off), IRR, MoIC, escrow status. LP report shows Shipamax, Reinfer, Avora as exited.
Geographic Distribution
New: geography view
Portfolio breakdown by region (UK/DACH/IBERIA/BENELUX/US/NORDICS) in Command Center. From LP report pie chart.
Multi-Currency
New: FX handling
Companies report in GBP/USD/EUR. Fund reports in GBP. Platform needs FX conversion for aggregation.
Separate Mapping Doc
New companion document
Detailed field-by-field mapping: Gigs template → LP report → platform data model. Shared separately.


Contents
1.  Executive Summary
2.  Key Facts from Discovery
3.  Project Goals
4.  Portfolio Management Framework
5.  Application Structure & Navigation
6.  Screen-by-Screen UI Specification
6.1  My Dashboard
6.2  Portfolio Command Center
6.3  Action Matrix
6.4  Company Detail
6.5  Portfolio Review & LP Report Generation
6.6  Founder Data Collection & Validation
6.7  Search & Discovery
6.8  External Intelligence Hub
6.9  Settings & Configuration
7.  Data Model
7.1  Structured Metrics (Gigs Template)
7.2  Qualitative Data
7.3  Investment Accounting
7.4  Fund Entity & Performance
7.5  Unstructured Data
7.6  External Enrichment
8.  External Data & Signal Architecture
9.  Data Sources & Integrations
10. System Architecture
11. What Success Looks Like
12. Phased Delivery Plan
13. Open Questions & Next Steps

1. Executive Summary
Crane is an early-stage VC firm with approximately 50–60 portfolio companies across multiple funds (including Crane I LP, a £70M 2018-vintage fund), adding 10–12 per year. Portfolio knowledge is fragmented across Attio (CRM), Dropbox (folder-per-company), Notion, Granola (transcripts), email, and external providers.
Today’s quarterly reporting involves founders completing a line-by-line Excel plugin (Gigs), team members adding commentary in Google Sheets, and the output feeding into Asset Metrix to generate an LP report. The LP report (reviewed in detail for this version) contains fund-level performance metrics (TVPI/DPI/NAV waterfall), an active portfolio table with investment accounting data, per-company RAG-rated snapshot pages, and detailed monthly financial charts with prior-year overlays and diversity metrics.
This project builds a portfolio intelligence platform that automates data extraction, replaces the Gigs Excel plugin with a lightweight founder validation form, gives each team member a personalised dashboard, and auto-generates ~70–80% of the quarterly LP report. The remaining 20–30% (Manager’s Commentary narrative and per-company qualitative updates) is captured during the quarterly review workflow.

2. Key Facts from Discovery
Parameter
Finding
Portfolio size
50–60 companies across multiple funds, growing 10–12/year
Fund structure (Crane I)
£70.3M committed, 2018 vintage, GBP denominated, UK GAAP. 30+ active portfolio companies in Crane I alone.
Reporting today
Founders fill Gigs Excel plugin (monthly financials, line-by-line) → Team adds commentary in Google Sheet → Compiled into Asset Metrix → LP report PDF
LP report structure
Standing data, Manager’s Commentary (NAV waterfall, TVPI charts, portfolio table), Company Snapshots (RAG status + summary), Company Data pages (monthly charts + diversity)
Metrics in Gigs template
Monthly: ARR, Revenue, COGS, Overheads, Gross Profit, Gross Margin, EBITDA, EBITDA Margin, Cash Burn LTM, Cash Balance, Headcount (FTE + Board), Gender split, Ethnic Minority split
RAG status system
Green (at/above expectation), Amber (below), Red (significantly below/triaged), Grey (non-core)
Investment accounting
Per company: cost basis, carrying value, MoIC, NAV uplift, valuation basis notes. Fund-level: TVPI, DPI, NAV waterfall.
Multi-currency
Companies report in GBP, USD, or EUR. Fund reports in GBP. FX conversion needed for aggregation.
Geographic regions
UK (61%), DACH (14%), IBERIA (11%), BENELUX (7%), US (7%), NORDICS (0%)
Company statuses
Active, Exited (Shipamax, Reinfer, Avora, nStack), Wound Down (AIRE, AlertFusion, SQR), Non-core (Plumerai, Omni:us, Optimal Labs, Satchel, Teachercentric)
Primary update channels
Board decks (Dropbox), bi-weekly/quarterly email updates, Granola call recordings
Internal ownership
Assigned quarterly. 1–2 owners. GPs Scott Sage and Krishna Visvanathan carry heaviest load.
Access
Full investment team (~8–10 people)
Alerts preference
No standalone alerts screen. Surface in dashboard + Slack integration.


3. Project Goals
Goal 1: Replace Gigs + Google Sheets. Auto-extract metrics from board decks, transcripts, and emails. Only ask founders for missing data via a lightweight web form.
Goal 2: Auto-Generate LP Reports. Produce ~70–80% of the quarterly LP report (fund performance, portfolio table, company charts, RAG snapshots) automatically. Capture remaining 20–30% during the review workflow.
Goal 3: Personalised Dashboards. Give each team member a tailored view with their to-dos, board prep, and company status.
Goal 4: Investment Accounting Integration. Track cost basis, carrying value, MoIC, TVPI/DPI/NAV per fund and per company.
Goal 5: External Signal Overlay. Layer Specter, news, hiring, and market data on portfolio companies.
Goal 6: AI-Ready Foundation. Design for incremental AI: board prep generation, conversational querying, automated status suggestions.

4. Portfolio Management Framework

Δ Change from v4
Added Non-core / Legacy status (Grey) from LP report RAG system. Companies like Plumerai, Omni:us, Optimal Labs, Satchel, and Teachercentric are tagged as non-core with minimal tracking requirements. Also added Exited and Wound Down lifecycle states.


4.1 Company Lifecycle States
State
LP Report Equivalent
Description
Active — Core
Green / Amber / Red
Actively managed portfolio company. Full metric tracking, health assessment, and team engagement.
Active — Non-core
Grey
Small position or legacy investment. Minimal tracking (cash balance, runway, status update only). Excluded from main dashboard views by default.
Exited
Exited in QX YYYY
Successfully sold or merged. Track: exit date, exit type, IRR, MoIC, escrow status, distributions received.
Wound Down
Written to £0 / being wound down
Failed or winding down. Track: write-off date, final MoIC (typically 0.0x), lessons learned.


4.2 Health Status (Active Core Companies)
Green / On Track
Amber / At Risk
Red / Underperforming
Grey / Non-core
At or above expectationSteady growthRunway managed
Below expectationGrowth slowingRunway pressureKey roles missing
Significantly below / triagedStagnated metricsRunway concernsTeam or product bottleneck
Non-core positionMinimal trackingCash balance + status onlyExcluded from main views


4.3 Upside Tracker + Action Matrix
Retained from v4. The 3×3 matrix (Health × Upside = Action) applies only to Active Core companies. Non-core, Exited, and Wound Down companies are excluded from the matrix.

5. Application Structure & Navigation
8 primary screens (unchanged from v4). Global fund filter in top bar. Alerts via Slack + inline dashboard to-dos.

Screen
Purpose
User Question
My Dashboard
Personalised home: to-dos, board prep, search
What do I need to do today?
Command Center
Portfolio overview + fund performance
How is the portfolio + fund doing?
Action Matrix
Interactive 3×3 grid with fund filter
Where should we spend time?
Company Detail
Deep dive (matches LP report layout)
What’s happening with this company?
Portfolio Review
Monthly/quarterly + LP report generation
Run the review and generate reports
Search
Semantic search across all data
Find a metric, quote, or document
Intelligence Hub
External signals, sectors, competitors
What’s happening in the market?
Settings
Data sources, funds, team, configuration
Admin and setup


6. Screen-by-Screen UI Specification
6.1 My Dashboard
Retained from v4. Personalised per team member. 5 zones: Search Bar + Greeting, My To-Dos (central), Board Prep Panel, My Companies cards, Upcoming Boards. Auto-generated to-dos from 8 trigger types. See v4 Section 6.1 for full specification.

6.2 Portfolio Command Center

Δ Change from v4
Added Fund Performance section with TVPI/DPI/NAV waterfall, deployed vs available, and geographic distribution — matching the LP report’s fund-level metrics. These were entirely missing from v4.


Zone 1 — Fund Performance Panel (New)
When a specific fund is selected in the global filter, a Fund Performance panel appears at the top of the Command Center. This directly mirrors the LP report’s key fund metrics:
Component
Detail
Key Metrics Strip
Horizontal cards: TVPI (Net), DPI, NAV (current), Total Committed, Deployed (%), Available for Deployment. Each shows current value + trend vs prior quarter.
NAV Waterfall Chart
Interactive waterfall: NAV at period start → LP contributions → Distributions → Realised gains/losses → Unrealised gains/losses → Operating income → GP share → NAV at period end. Matches the exact chart format from the LP report.
TVPI/DPI Trend
Line chart: TVPI (Fund), DPI (Fund), TVPI (Net) by quarter over the fund’s lifetime. Matches the LP report’s TVPI by Year x Quarter chart.
Geographic Distribution
Pie chart showing portfolio allocation by region (UK, DACH, IBERIA, BENELUX, US, NORDICS) by £ invested. Matches LP report.
Uses of Funds
Breakdown table: investments, divestments, GP share, expenses, available. Matches LP report.


Zone 2 — Portfolio Summary Strip
Horizontal aggregate cards filtered by fund: Total Companies (active core / non-core / exited), Green / Amber / Red counts, Avg Runway, Companies Updated This Month, Engagement Gaps (30+ days). Each card clickable.
Zone 3 — Compact Action Matrix
3×3 matrix showing counts per cell (Active Core companies only). Non-core and exited companies excluded.
Zone 4 — Active Portfolio Table
Matches the LP report’s Active Portfolio Companies table. Columns:
Column
Content
Company
Logo + name. Click → Company Detail.
Fund
Which fund the investment belongs to.
Cost Basis
Total invested (£). From fund accounting.
Carrying Value
Current fair value (£). From fund accounting.
MoIC
Carrying value / cost. Colour-coded.
RAG Status
Green / Amber / Red / Grey dot (matching LP report).
Current ARR
Latest reported ARR with currency.
Cash Balance
Latest cash on hand.
Monthly Net Burn
Latest monthly outflow.
Runway (months)
Calculated. Red highlight if < 6.
Fundraising Status
Equity + Debt fundraising status (compact).
Owner
Crane Lead Partner avatar.
Last Update
Most recent data. Red if > 30 days.

This table can toggle between “Active Portfolio” (default), “Exited Companies”, and “All Companies”. Supports CSV/Excel export.

6.3 Action Matrix
Retained from v4. Fund filter, drag-and-drop reclassification, time controls, company cards with hover preview. Active Core companies only — Non-core, Exited, and Wound Down are excluded from the matrix. See v4 Section 6.3 for full specification.

6.4 Company Detail

Δ Change from v4
Restructured to match the LP report’s two-page company layout. Overview tab now includes the 4-quarter RAG status strip, and the Summary/Key Concerns/Action Points structure from the LP report. Metrics tab now shows the exact monthly chart format with prior-year overlays and diversity data from the Gigs template.


Header
Company name, logo, description, sector, stage, fund, investment date, cost basis, carrying value, MoIC, and the 4-quarter RAG status strip (coloured dots for the last 4 quarters, matching the LP report layout). Quick actions: Log Note, Create To-Do, Schedule Check-in, Change Status, Start Board Prep, View in Attio.
Tab 1: Overview (Matches LP Report Page 1)
The Overview tab mirrors the LP report’s qualitative company page:
Section
Content
Company Details
Legal name, location, industry, website, management team, Crane Lead Partner. Left column, matching LP report layout.
Company Description
One-paragraph description. Right column.
Recent Progress
Free-text narrative of recent developments. Editable by owner.
RAG Status Strip
4-quarter visual: coloured dots for the last 4 quarters (Green/Amber/Red/Grey). Matches LP report.
Summary
Quarterly performance summary. Team-authored (AI-suggested draft in v2).
Key Concerns
Numbered list of risks and challenges. Team-authored.
Action Points
Numbered list of Crane’s planned interventions. Team-authored. Links to To-Do system.
Investment Data
Cost basis, carrying value, MoIC, equity/debt fundraising status, burn reduction actions, near-term exit notes.
Activity Timeline
Right sidebar: chronological feed of interactions, documents, status changes.


Tab 2: Metrics & Charts (Matches LP Report Page 2)
The Metrics tab mirrors the LP report’s quantitative company page, showing the exact same chart set:
Chart
Content
Header Strip
Currency, Year, ARR, Revenue, Cost of Sales, Overheads, Total Costs, Gross Profit, Gross Profit Margin, EBITDA, EBITDA Margin — matching the LP report’s top-line summary row.
ARR Chart
Monthly bar chart with prior-year overlay (PY = light, current = bold). 12 months.
Revenue Chart
Monthly bar chart with PY overlay.
Gross Profit Chart
Monthly bar chart with PY overlay.
Gross Margin Chart
Monthly bar chart with PY overlay.
EBITDA by Month
Monthly bar chart with PY overlay. Negative values shown below axis.
Cash Burn Chart
Monthly bar chart with PY overlay. Includes Cash Burn LTM in header.
Cash Balances Chart
Monthly bar chart with PY overlay.
Headcount (FTE)
Monthly line chart. Includes total FTE in header.
Headcount Gender Split
Monthly stacked bar: Female % (red) / Male % (purple). Matches LP report.
Board Headcount Gender
Monthly stacked bar for board composition.
Ethnic Minority (FTE)
Monthly stacked bar: Ethnic Minority % / Non-Ethnic Minority %.
Board Ethnic Minority
Monthly stacked bar for board diversity.

Time range: default 12 months with PY overlay. Configurable to 6M, 24M, or custom. All charts show the exact same visual format as the LP report’s Company Data pages. Data sourced from the Gigs template fields (or auto-extracted + founder-validated in the new workflow).

Tab 3: Documents
Retained from v4. Board decks, IC papers, financials, legals, transcripts, emails. List with preview panel.
Tab 4: Market Context
Retained from v4. Sector overview, competitor watch, signals timeline.
Tab 5: Notes & Actions
Retained from v4. Team notes + kanban action board.
Tab 6: Fundraising
Retained from v4. Next round timing, runway, investor interest, follow-on assessment, external signals.

6.5 Portfolio Review & LP Report Generation

Δ Change from v4
Expanded to include detailed LP report auto-generation spec matching the Crane I Q4 2022 report structure. Added Manager’s Commentary authoring workflow.


Mode 1: Monthly Internal Review
Retained from v4. 30–45 minute team meeting flow. Stepped presentation of companies in priority order. Inline status updates, notes, and to-do creation.
Mode 2: Quarterly Review + LP Report
The quarterly review is the formal reporting cycle. It produces the LP report and feeds Asset Metrix.
Step 1: Auto-Extract Metrics
The system extracts the Gigs template fields from board decks, transcripts, and emails. Each field shows source, confidence, and the specific passage it was derived from. This replaces founders filling in the Excel plugin line-by-line.
Step 2: Founder Validation
Lightweight web form sent to founders. Pre-populated with extracted data. Founders accept/edit/reject per field. Only missing fields require manual input. See Section 6.6 for full spec.
Step 3: Team Commentary
Each team member completes the qualitative fields for their assigned companies, matching the LP report structure:
•  Recent Progress (free-text narrative)
•  RAG Status (Green / Amber / Red / Grey dropdown)
•  Summary (quarterly performance narrative)
•  Key Concerns (numbered list)
•  Action Points (numbered list)
•  Equity / Debt Fundraising Status
•  Burn Reduction Actions / Near-Term Exit notes
The system pre-populates a suggested draft based on metrics changes, alerts, and previous quarter’s commentary.
Step 4: Manager’s Commentary
The GP (Scott or Krishna) writes the fund-level Manager’s Commentary section. The system provides:
•  A pre-assembled data pack: NAV waterfall chart, TVPI/DPI trends, active portfolio table, follow-on rounds, geographic distribution, NAV movements table — all auto-generated
•  An AI-suggested narrative outline (v2) based on portfolio performance changes
•  A rich text editor for the GP to write the market outlook and portfolio narrative
•  An “Other Developments” section for team hires, events, and fund updates
Step 5: GP Approval
A GP reviews the compiled report: fund-level data + per-company commentary side by side. Approve, request edits, or add notes. Completion dashboard shows status across all companies.
Step 6: Report Generation
Once approved, the system generates:
•  LP Report PDF/PPTX — matching the exact structure of the Crane I Quarterly Report (cover, standing data, manager’s commentary with charts, company snapshots, company data pages)
•  Asset Metrix CSV — mapped to their ingestion schema
•  Internal review summary — changes made during this review cycle

Auto-Generation Coverage
~70–80% of the LP report is auto-assembled from platform data (fund metrics, charts, portfolio table, company financial pages). ~20–30% requires team input captured in Steps 3–4 (Manager’s Commentary narrative, per-company qualitative updates, Other Developments). The goal is to reduce total quarterly reporting time from weeks to days.


6.6 Founder Data Collection & Validation
Replaces the Gigs Excel plugin. The founder-facing form collects the same fields as the Gigs template but is pre-populated from auto-extraction. See the companion Data Model Mapping document for the full field-by-field mapping.
Key design priorities: completable in < 5 minutes, mobile-friendly, no login required (secure token link), stage-specific field visibility (pre-revenue companies skip P&L fields, non-core companies see minimal fields).
Fields collected: Currency, ARR, Revenue, Cost of Sales, Overheads, Gross Profit, EBITDA (all monthly), Cash Burn LTM, Cash Balance, Monthly Net Burn, Headcount FTE, Board Headcount, Gender split (FTE + Board), Ethnic Minority split (FTE + Board), plus qualitative updates.

6.7 Search & Discovery
Retained from v4. Semantic search across all data. Natural language queries. Saved searches. Respects fund filter.

6.8 External Intelligence Hub
Retained from v4. Sector dashboards, competitor graph, signal feed, Specter panel, budget tracker. Will iterate based on usage.

6.9 Settings & Configuration
Retained from v4 with additions: Fund management (define funds, standing data, accounting policy, administrator details), LP report template customisation (branding, section order, chart styles), Gigs template field mapping (confirm which fields are active per stage), exit tracking configuration.

7. Data Model
Significantly expanded based on LP report analysis and Gigs template field mapping. A companion document (Data Model Mapping) provides the complete field-by-field mapping.
7.1 Structured Metrics (from Gigs Template)
Per company, per month. These are the exact fields from the Gigs Performance Data Template, stored as time series:
Metric
Type
Frequency
Notes
Currency
Enum
Per company
GBP / USD / EUR. Set once per company.
Annual Recurring Revenue
Currency
Monthly
Primary financial indicator.
Revenue
Currency
Monthly
Total recognised revenue.
Cost of Sales
Currency
Monthly
Direct costs.
Overheads
Currency
Monthly
Operating expenses.
Total Costs
Currency
Monthly
Calculated: COGS + Overheads.
Gross Profit
Currency
Monthly
Revenue - COGS.
Gross Profit Margin
Percentage
Monthly
GP / Revenue.
EBITDA
Currency
Monthly
Revenue - Total Costs.
EBITDA Margin
Percentage
Monthly
EBITDA / Revenue.
Cash Burn LTM
Currency
Monthly
Last 12 months total cash outflow.
Cash Balance
Currency
Monthly
Cash on hand at month end.
Monthly Net Burn
Currency
Monthly
Net monthly cash outflow.
Cash Runway
Months
Monthly
Calculated: Cash / Monthly Burn.
Headcount (FTE)
Integer
Monthly
Total full-time equivalents.
Board Headcount
Integer
Monthly
Board members.
Female % (FTE)
Percentage
Monthly
Gender diversity at FTE level.
Male % (FTE)
Percentage
Monthly
Complement of Female %.
Female % (Board)
Percentage
Monthly
Board gender diversity.
Male % (Board)
Percentage
Monthly
Complement.
Ethnic Minority % (FTE)
Percentage
Monthly
Ethnic diversity at FTE level.
Ethnic Minority % (Board)
Percentage
Monthly
Board ethnic diversity.


7.2 Qualitative Data (Quarterly)
Field
Author
LP Report Section
Recent Progress
Team member
Company Page 1: Recent Progress
RAG Status
Team member
Company Snapshot: Status dot + Company Page 1: RAG strip
Summary
Team member
Company Snapshot + Company Page 1: Summary
Key Concerns
Team member
Company Page 1: Key Concerns
Action Points
Team member
Company Page 1: Action Points
Equity Fundraising Status
Team member
Portfolio Table: Equity Fund Raising Status
Debt Fundraising Status
Team member
Portfolio Table: Debt Fund Raising Status
Burn Reduction Actions
Team member
Portfolio Table: Burn Reduction Actions
Near Term Exit
Team member
Portfolio Table: Near Term Exit
Manager’s Commentary
GP
Manager’s Commentary section (fund-level narrative)
Other Developments
GP / Team
Manager’s Commentary: Other significant developments


7.3 Investment Accounting (New)
Δ Change from v4
Entirely new section. Required for LP report generation and the portfolio table.


Field
Type
Description
Cost at Period End
Currency (£)
Total invested in the company to date.
Carrying Value
Currency (£)
Current fair value. Updated quarterly by fund accounting.
MoIC
Ratio
Carrying value / cost. Calculated.
NAV Uplift
Currency (£)
Quarterly change in fair value.
Valuation Basis
Text
Rationale for valuation (e.g., “Written down to reflect current commercial traction”).
Follow-On Amount
Currency (£)
Any follow-on invested in the quarter.
Follow-On Description
Text
Description of follow-on round.
Exit Date
Date
If exited. Date of completion.
Exit Type
Enum
Sale / Wind-down / Write-off / Secondary.
Exit IRR
Percentage
Realised IRR at exit.
Exit MoIC
Ratio
Realised multiple at exit.
Escrow Amount
Currency (£)
Held in escrow post-exit.
Escrow Release Date
Date
Expected escrow release.


7.4 Fund Entity & Performance (New)
Fund-level data supporting the LP report Standing Data page, NAV waterfall, TVPI/DPI charts, and uses of funds. See the Data Model Mapping companion document for the full field specification. Key entities: Fund (standing data), Fund Performance (quarterly TVPI/DPI/NAV), Uses of Funds (deployment tracking).

7.5 Unstructured Data
Retained from v4. Call transcripts (Granola), board decks (Dropbox), IC papers, email updates, financials, legal documents, internal notes.

7.6 External Enrichment
Retained from v4. Specter signals, news mentions, competitor signals, sector aggregates.

8. External Data & Signal Architecture
Retained from v4. Specter integration (domain-based matching, daily sync), signal scoring engine, sector taxonomy, external source priority by cost. See v4 Section 8 for full specification.

9. Data Sources & Integrations
Source
Type
Data
Status
Attio
Internal CRM
Companies, founders, pipeline, status
API TBC
Dropbox
Internal Docs
Board decks, IC papers, financials, legals
API available
Notion
Internal Wiki
Portfolio database, notes
API available
Granola
Internal Notes
Call transcripts
Integration TBC
Gmail
Internal Comms
Founder updates, investor comms
Gmail API
Gigs / Sheets
Internal Data
Historical Gigs data (to be migrated + replaced)
Sheets API
Fund Accounting
Internal Finance
Cost basis, carrying value, NAV, TVPI/DPI
Manual import or API TBC
Specter
External
Company signals, traffic, hiring, funding
Existing sub
AlphaSense
External
Market intel, research, news
Existing sub
Asset Metrix
Reporting
Quarterly CSV export → LP report PDF
CSV export; API TBC


10. System Architecture
Layer
Responsibility
Components
Ingestion
Source connectors. Auth, sync, text extraction, doc parsing.
Attio, Dropbox, Notion, Granola, Gmail APIs. Specter, AlphaSense. PDF/deck parser.
Extraction
Metric extraction from unstructured docs. Gap detection.
Rule-based (v1). LLM-powered (v2). Maps to Gigs template fields.
Data
Structured storage + vector store + doc store + fund accounting.
PostgreSQL + pgvector. Object storage. Event log. FX conversion layer.
Intelligence
Assessment, flag generation, signal scoring, board prep.
Rule engine (v1). LLM summaries + Q&A (v2). Configurable thresholds.
Interface
Web app (8 screens). Founder validation portal. Slack.
React. REST + WebSocket. Auth (SSO/email). RBAC.
Reporting
LP report generation. Asset Metrix CSV. PDF/PPTX/DOCX.
Template engine matching LP report layout. Chart rendering. Multi-currency.


11. What Success Looks Like
•  Gigs Excel plugin eliminated — founders spend < 5 minutes validating pre-populated data
•  LP quarterly report is ~70–80% auto-generated from platform data
•  LP report matches the exact structure and chart format of the current Crane I report
•  TVPI/DPI/NAV and investment accounting data visible in the Command Center
•  Each team member has a personalised dashboard with to-dos, board prep, and RAG status
•  Monthly internal reviews complete in < 45 minutes
•  Total quarterly reporting cycle reduced from weeks to days
•  Board prep briefs auto-generated in < 15 minutes
•  All views filterable by fund, with full multi-currency support
•  Non-core and exited companies tracked separately without cluttering active views
•  External signals overlaid and scored for relevance
•  100% of active companies have an assigned owner and tracked actions

12. Phased Delivery Plan
Phase 1a: Foundation + Core Views
Data ingestion (Attio, Dropbox, Notion, Granola, Gmail). Company data model with full Gigs template field set + investment accounting. My Dashboard, Command Center (including Fund Performance panel), Company Detail (Overview matching LP report layout + Metrics with PY overlay charts). Settings (data sources, funds, team). Basic search.
Phase 1b: Review Workflow + Founder Validation
Quarterly review pipeline: auto-extraction → founder validation portal → team commentary (RAG + summary/concerns/actions) → Manager’s Commentary authoring → GP approval. LP report generation (PDF/PPTX matching current format). Asset Metrix CSV export. Monthly internal review. Action Matrix. Alert generation + Slack integration. Semantic search.
Phase 1c: External Intelligence + Polish
Specter integration. Market Context tab. Intelligence Hub. Board Prep auto-generation. Fundraising tab. Historical Gigs data migration. Additional free signal sources. Performance optimisation.
Phase 2: AI + Deal Flow (Future)
LLM-powered metric extraction. AI board prep narratives. AI-suggested Manager’s Commentary drafts. Conversational Q&A search. CRM intelligence. Outbound support. Advanced signal scoring.

13. Open Questions & Next Steps
Remaining Open Questions
#
Question
Impact
1
Asset Metrix CSV schema — exact field names, types, format
Determines export mapping
2
Gigs Excel template — can Anna share the actual xlsx?
Confirm fields match our LP report analysis
3
Fund accounting data source — how are cost basis, carrying value, NAV currently maintained?
Determines investment accounting ingestion method
4
Historical Gigs data — can past monthly data be exported for migration?
Determines whether charts show historical PY overlay from day 1
5
Multi-currency FX rates — source for GBP/USD/EUR conversion?
Determines aggregation accuracy
6
Attio API access
Determines CRM integration
7
Granola API — programmatic transcript access?
Determines transcript ingestion method
8
Specter API — endpoints, rate limits, signals
Determines external signal scope
9
Fund structure details — how many funds, naming, company-to-fund mapping
Determines fund filter and LP report scope
10
LP report branding — do all funds use the same template (Crane pink/coral)?
Determines report template configurability
11
Slack workspace + desired notification channels
Configures Slack integration
12
Timeline / milestone pressures
Determines delivery milestones
13
Hosting / security / compliance requirements
Determines infrastructure


Next Steps
1. Crane to review v5 scope + Data Model Mapping companion document
2. Confirm Gigs template fields match our LP report analysis (share xlsx if possible)
3. Clarify fund accounting data source (manual import vs integration)
4. Confirm Asset Metrix CSV schema with fund admin
5. Confirm historical Gigs data availability for migration
6. API access confirmation: Attio, Specter, Granola
7. Follow-up call to align on Phase 1a scope and timeline
8. KeyValue to deliver technical spec, cost estimate, and delivery plan
