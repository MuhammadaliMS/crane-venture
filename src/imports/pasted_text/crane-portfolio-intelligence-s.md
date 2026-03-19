
CRANE × KEYVALUE
Portfolio Intelligence Platform
Project Scope & UI Specification

Version
3.0 — Discovery-Informed UI Scope
Date
17 March 2026
Prepared by
Ali / KeyValue
Prepared for
Anna / Crane
Status
Draft — Pending Crane Review


Contents
1.  Executive Summary
2.  Key Facts from Discovery
3.  Project Goals
4.  Portfolio Management Framework
5.  Application Structure & Navigation
6.  Screen-by-Screen UI Specification
6.1  My Dashboard (Personalised Home)
6.2  Portfolio Command Center
6.3  Action Matrix
6.4  Company Detail
6.5  Board Prep View
6.6  Portfolio Review
6.7  Search & Discovery
6.8  Alerts & Activity Feed
6.9  External Intelligence Hub
6.10  Settings & Configuration
7.  Data Model & Metric Definitions
8.  External Data & Signal Architecture
9.  Data Sources & Integrations
10.  System Architecture
11.  What Success Looks Like
12.  Phased Delivery Plan
13.  Open Questions & Next Steps

1. Executive Summary
Crane is an early-stage VC firm investing in technical startups across developer tooling, infrastructure, data, and AI. With approximately 50–60 portfolio companies and adding 10–12 per year, the firm’s portfolio knowledge is fragmented across Attio (CRM), Dropbox (folder-per-company), a nascent Notion database, Granola (call transcripts), email, and external providers like Specter and AlphaSense.
Today’s quarterly reporting involves each team member filling in a Google Sheet that gets compiled into a deck — a manual process that surfaces information reactively rather than proactively. The team tracks only runway, burn, and top-line ARR, but wants to expand to financial health, commercial momentum, product progress, team metrics, and fundraising signals.
This project builds a portfolio intelligence platform that replaces fragmented workflows with a unified, personalised system. Each team member gets a tailored dashboard with their assigned companies, proactive flags, upcoming board prep, and actionable to-dos — rather than a static spreadsheet they fill in quarterly.
The platform is designed for a team of approximately 8–10 investment professionals, with portfolio owners managing between 2–7+ companies each. Scott and Krishna (General Partners) carry the heaviest load. The system must accommodate both their high-volume oversight and the more focused engagement of junior team members.

2. Key Facts from Discovery
The following facts, confirmed during discovery, inform the system design decisions throughout this document.
Parameter
Finding
Portfolio size
50–60 companies, growing 10–12/year
Reporting today
Google Sheet per team member → compiled deck. Quarterly cadence.
Metrics tracked today
Runway, burn, top-line ARR only
Metrics desired
Financial health (revenue/ARR, burn, runway), commercial momentum (customers, growth, wins), product progress (milestones, adoption), team (headcount, diversity, key hires/departures), fundraising (timing, investor interest)
Primary update channels
Board decks in Dropbox, email updates (bi-weekly/quarterly), Granola call recordings
Dropbox structure
Folder per company. Contains IC papers, board decks, legals, financials.
Notion
Created one month ago, WIP with few fields. Want a dynamic, auto-synced system.
Internal ownership
Assigned quarterly. 1 owner per company (sometimes 2 for newer companies). GPs (Scott, Krishna) have 7+ companies each.
Update cadence needed
Weekly/monthly for early-stage (pre-seed to Series A). Quarterly for later-stage.
Access
Full investment team (~8–10 people)
Specter
Want signals overlaid. Can query by domain. No portfolio list yet in Specter.
Other external data
Open to any layerable signal. Budget-conscious on paid subscriptions.
Market layering
All signals valued: competitor fundraising, sector M&A, hiring trends, macro shifts.
Personalised views
Each team member wants their own view with their companies, their to-dos, their flags.
Board prep
Want AI-assisted board prep: ingest latest decks/transcripts/updates, surface discussion points.
Proactive support examples
Flag burn rate acceleration before founder asks. Connect founders with venture partners for new sales motions. Surface pivot signals. Identify key hire needs.


3. Project Goals
Goal 1: Unified Data Layer. Replace the fragmented Google Sheet + Dropbox + Notion + email workflow with a single system that auto-ingests data from all sources and associates it with portfolio companies.
Goal 2: Personalised Portfolio Intelligence. Give each team member a tailored view of their assigned companies with proactive flags, to-dos, board prep, and signals — replacing reactive quarterly reporting with continuous awareness.
Goal 3: Expanded Metric Coverage. Move from tracking only runway/burn/ARR to the full metric set: financial health, commercial momentum, product progress, team, and fundraising signals.
Goal 4: External Signal Overlay. Layer Specter, news, hiring, and market data on top of portfolio companies to surface signals the team would otherwise miss.
Goal 5: AI-Ready Foundation. Design the system so that AI-driven analysis, board prep generation, and conversational querying can be added incrementally.

4. Portfolio Management Framework
The portfolio intelligence system is built around five components from Crane’s internal framework, producing an action matrix that guides team attention.
4.1 Performance Signals (Expanded)
Based on Anna’s input, the system tracks five signal categories — a significant expansion from today’s runway/burn/ARR baseline:
Financial Health
Commercial
Product
Team
Fundraising
Revenue / ARRBurn rateRunway (months)
Customer countRevenue growthNotable wins
Milestones shippedAdoption / usagePivot signals
HeadcountDiversity metricsKey hires / exits
Next round timingInvestor interestFollow-on signals


4.2 Health Status
On Track
At Risk
Underperforming
Steady revenue growthRunway understood and managedIssues are contained
Growth slowing downRunway pressureKey roles missing
Stagnated metricsRunway concernsTeam / product bottlenecks


4.3 Upside Tracker
High Potential
Emerging
Limited Potential
Clear market pullTiming tailwindsNon-obvious momentumFounder speed of learning
Early signals of market pullMarket clarity developingPath to scale not yet obvious
Fuzzy differentiationLinear progressExecution not changing outcome


4.4 Action Matrix
Health →Upside ↓
On Track
At Risk
Underperforming
High Potential
Lean In
Lean In / Anticipate
Lean In / Anticipate
Emerging
Lean In
Watch
Watch
Limited Potential
Watch
De-prioritise
De-prioritise


Lean In: Proactively invest time. Identify follow-on opportunities. Accelerate introductions.
Lean In / Anticipate: High-potential company facing challenges. Targeted support and anticipate needs before they become critical.
Watch: Monitor signals closely. Regular check-ins without over-investing time.
De-prioritise: Minimum touch. Re-evaluate quarterly or on signal change.

5. Application Structure & Navigation
The platform is a web application with a persistent left sidebar, a top bar, and a main content area. It is structured around ten primary screens, each serving a distinct function. Critically, the application is personalised per user — each team member sees their assigned companies, their flags, and their to-dos by default.

Screen
Purpose
User Question It Answers
My Dashboard
Personalised home for each team member
What do I need to do today?
Portfolio Command Center
Portfolio-level overview across all companies
How is the full portfolio doing?
Action Matrix
Interactive 3×3 prioritisation grid
Where should we spend time this week?
Company Detail
Deep dive on a single company
What’s happening with this company?
Board Prep
AI-assisted meeting preparation
What should I ask at the next board?
Portfolio Review
Structured review workflow
Team meeting and LP report generation
Search
Semantic search across all data
Find a specific metric, quote, or doc
Alerts & Feed
Timeline of signals and changes
What changed since I last looked?
Intelligence Hub
External data and market signals
What’s happening in the market?
Settings
Data sources, team, preferences
Admin and configuration


Global UI Elements
Left Sidebar (Persistent)
Always visible. Contains the Crane logo, navigation links (icon + label) to each primary screen, a quick-access list of the user’s assigned companies (up to 7, with “See all” overflow), and the logged-in user’s avatar and role at the bottom. Collapses to icon-only on narrow viewports.
Top Bar (Persistent)
Shows the current screen title, a global search trigger (Cmd+K), a notification bell with unread count, and the user’s avatar. On the My Dashboard screen, the top bar includes a greeting (“Good morning, Anna”) and the current date.
Command Palette (Cmd+K)
A quick-access overlay for jumping to any company, screen, or action by typing. Results grouped by: Companies, Screens, Recent Documents, Actions. Feels like Spotlight or VS Code’s command palette.
Role-Based Views
All team members see the same navigation structure, but content is scoped to their assignments by default. GPs (Scott, Krishna) with 7+ companies see a denser, more aggregated view. Any user can switch to the “All Portfolio” view to see the full portfolio, but their personal dashboard always shows their assigned companies first.

6. Screen-by-Screen UI Specification
6.1 My Dashboard (Personalised Home)
The default landing screen after login. Each team member sees their own dashboard, scoped to their assigned companies. This directly addresses Anna’s request for personalised views with to-dos, proactive flags, and board prep.
Zone 1 — Greeting & Summary Strip
Top of the screen. Shows “Good morning, [Name]”, the current date, and a row of compact stat cards: My Companies (count), Needs Attention (companies with active flags), Upcoming Boards (next 30 days), Overdue Actions (to-dos past due date), and Days Until Next Review. Each card is clickable and scrolls to the relevant section below.
Zone 2 — Proactive Flags
The most important section of the dashboard. A vertical list of AI-generated or rule-triggered flags, ordered by urgency. Each flag is a card containing: the company name + logo, a flag type icon (risk, opportunity, action needed), a headline (e.g., “Burn rate accelerating at Acme — runway dropped from 14 to 9 months”), a 2–3 line explanation with supporting data, and a suggested action (e.g., “Schedule founder check-in to discuss runway extension”) with a one-click button to create the action.

Flag types include:
Flag Type
Trigger & Detail
Runway Alert
Runway dropped below threshold (configurable, default: 6 months). Shows current runway, burn trend, and comparison to previous quarter.
Burn Acceleration
Burn rate increased significantly while revenue remained flat or declined. Proactive flag before runway formally drops.
Growth Inflection
Revenue growth accelerated (e.g., 2× MoM) or a notable customer win was reported. Opportunity to lean in.
New Sales Motion
Founder reported launching a new go-to-market initiative. Suggests connecting with Crane’s venture partners for support.
Key Departure
A senior team member departed. Flags potential team risk.
Board Coming Up
Board meeting within next 14 days. Links to the Board Prep view with pre-populated discussion points.
Engagement Gap
No team interaction with a portfolio company for 30+ days. Suggests scheduling a check-in.
Fundraising Signal
Company indicated upcoming fundraise, or external signals (Specter, news) suggest investor interest. Flags follow-on opportunity.
Market Signal
A competitor raised a round, sector M&A occurred, or a macro shift was detected. Contextualises portfolio company performance.
Pivot Signal
Product or positioning change detected from updates or transcripts. May require reassessing thesis alignment.


Zone 3 — My To-Do List
A focused task list showing all open actions assigned to this user. Each to-do shows: company name, task title, due date, source (manually created or auto-generated from a flag), and a quick-complete checkbox. To-dos can be sorted by due date (default), company, or priority. A “New To-Do” button allows manual creation. Overdue items are highlighted in red. Completed items move to a collapsible “Done” section at the bottom.
Zone 4 — My Companies (Quick Cards)
A horizontal scrollable row of company cards — one per assigned company. Each card shows: company logo + name, health badge (colour-coded dot), upside badge, the single most critical metric (e.g., runway or MRR) with a sparkline, last interaction date, and a one-line status summary. Clicking a card navigates to Company Detail. Cards are sorted by action priority (Lean In first).
Zone 5 — Upcoming Boards & Check-ins
A calendar-style list of upcoming board meetings and scheduled check-ins for the user’s assigned companies. Each item shows: company name, meeting type (board / check-in / investor update), date and time, and a “Prep” button that navigates to the Board Prep view. Meetings within 7 days are highlighted.

Design Principle: My Dashboard
This screen replaces the Google Sheet. Instead of manually filling in a spreadsheet quarterly, each team member opens a living dashboard that tells them what needs attention right now. The shift is from reactive reporting to proactive awareness. A team member should be able to scan this screen in under 30 seconds and know exactly where to focus.


6.2 Portfolio Command Center
The full-portfolio overview. While My Dashboard is personal, the Command Center is the team-level view — used in team meetings and by GPs who need visibility across all 50–60 companies.
Zone 1 — Portfolio Summary Strip
A horizontal row of aggregate metric cards: Total Companies, On Track (green), At Risk (amber), Underperforming (red), Avg Runway (months), Companies Updated This Month, Companies With No Update (30+ days). Each card is clickable and filters Zone 3 below.
Zone 2 — Compact Action Matrix
A small, interactive 3×3 matrix showing company counts per cell. Clicking a cell filters Zone 3 to that subset. Companies that moved cells since the last review are flagged with a directional arrow. The matrix is the visual anchor of the page.
Zone 3 — Master Company Table
A sortable, filterable data table showing every portfolio company. This is the primary navigation surface for the full portfolio.

Columns:
Column
Content
Company
Logo, name, one-line description. Clickable → Company Detail.
Stage
Investment stage badge: Pre-seed, Seed, Series A, Series B+.
Health
Colour-coded badge: On Track / At Risk / Underperforming.
Upside
Colour-coded badge: High Potential / Emerging / Limited.
Action
Derived action category: Lean In, Watch, De-prioritise.
Owner
Avatar(s) of assigned internal owner(s). Clickable to filter.
Key Metric
The most relevant number for this company (auto-selected based on stage: MRR for revenue-stage, runway for pre-revenue). With a 3-month sparkline.
Revenue / ARR
Latest reported figure with MoM or QoQ trend arrow.
Runway
Months remaining. Red highlight if < 6 months.
Last Update
Date of most recent ingested document or interaction. Red if > 30 days.
Next Board
Date of next scheduled board meeting. Highlighted if within 14 days.
Flags
Count of active proactive flags. Clickable to expand.


Filter Bar
Above the table. Allows filtering by: health status, upside category, action type, owner, stage, sector, and flag status. Filters can be combined. A “Saved Views” dropdown allows saving commonly used filter combinations (e.g., “Scott’s companies”, “At Risk + High Potential”, “Runway < 6 months”). The table supports CSV/Excel export.
Zone 4 — Portfolio Activity Feed (Compact)
A collapsible panel on the right side or below the table showing the 10 most recent portfolio-wide events. Expandable to the full Alerts & Feed screen.

6.3 Action Matrix (Full View)
A full-screen interactive version of the 3×3 matrix. The primary tool for weekly allocation of team attention.
Matrix Grid
Each cell is a container showing company cards. The x-axis is Health Status; the y-axis is Upside. Cell background colours match the action type (blue for Lean In, light blue for Watch, grey for De-prioritise).
Company Cards
Each card shows: company logo + name, a one-line AI summary of latest status (e.g., “MRR up 18% MoM, hired VP Sales”), owner avatar, days since last interaction, and a flag count badge if active flags exist. Hover expands to a mini-preview: last 3 signals, key metric sparkline, and a “View Details” link. Click navigates to Company Detail.
Drag-and-Drop Reclassification
Users can drag a company card between cells to manually reclassify. A confirmation dialog appears showing the old and new classification and derived action, with a required free-text field for the rationale (e.g., “Founder called — growth has stalled, pipeline is thin”). The change is logged in the activity feed.
Time Controls
A date-range selector allows viewing the matrix at any historical point. A “Changes since last review” toggle highlights companies that moved cells. A timeline slider shows the matrix evolving over time — useful in quarterly reviews to see how portfolio health shifted.
Quadrant Summaries
Each cell includes a summary line at the top: company count, average runway, and the count of active flags within that bucket. This provides aggregate context without opening individual cards.

6.4 Company Detail
The deep-dive view for a single company. Everything Crane knows — metrics, documents, transcripts, external signals, team notes — in one place. Used for board prep, founder check-ins, and investigating flags.
Header
Company name, logo, one-line description, sector tags, investment stage, investment date, check size, ownership %, and current health + upside badges. Quick action buttons: “Log Note”, “Create To-Do”, “Schedule Check-in”, “Change Status”, “Start Board Prep”, and “View in Attio” (external link). If active flags exist, a banner below the header shows the most urgent flag with a “Review All Flags” link.
Tab Navigation
Six tabs below the header:

Tab 1: Overview
The default tab. Split into two columns.
Left Column (60%) — Key Metrics Panel. A grid of metric cards organised by the five signal categories (Financial Health, Commercial Momentum, Product Progress, Team, Fundraising). Each card shows: metric name, current value, previous value, trend (sparkline covering last 3–6 months), last-updated date, and data source. Metrics with anomalies are highlighted with an amber or red border. Below the metrics grid: the Assessment Panel showing Health Status and Upside classification dropdowns (editable by the owner), the derived Action category, and a free-text rationale field. Below that: the Support Panel showing the assigned owner(s), current support priorities (editable), and a list of tracked interventions with status (To Do / In Progress / Done).
Right Column (40%) — Activity Timeline. A chronological feed of all interactions, ingested documents, status changes, metric updates, and notes for this company. Grouped by month. Each entry: date, type icon, description, team member. Entries are clickable (documents open preview, notes expand inline).

Tab 2: Metrics & Analytics
Dedicated analytics view. Time range selector at top (3M, 6M, 12M, All Time, custom). Main area: a chart per tracked metric as a line chart with data points marked. Optional overlay toggles: sector average (if available), target threshold line, and previous period comparison. Below each chart: a data table showing raw values, date reported, and source document (linked). Bottom section: Metric Health Summary — auto-generated narrative flagging anomalies (e.g., “Burn rate increased 40% while revenue flat — runway reduced from 18 to 11 months”). These anomalies feed into the proactive flags system.

Tab 3: Documents
All documents associated with this company. List view with columns: document name, type (board deck / IC paper / financials / legal / transcript / email update), source (Dropbox / Notion / Granola / Email), date, and uploaded-by. Grouped by type, collapsible. A document preview panel on the right shows extracted text or a PDF viewer. For Granola transcripts: full transcript with speaker labels, timestamps, and an AI-generated summary at the top. Search bar for within-company document search.

Tab 4: Market Context
External intelligence overlaid on this company. Three sections:
Sector Overview: Sector name, recent funding activity (total raised, deal count, trend), and macro indicators. Sourced from Specter, AlphaSense, and curated news.
Competitor Watch: A list of tagged competitors with their latest signals: funding rounds, hiring changes (headcount delta), web traffic trend (from Specter), product launches, and news mentions. Each competitor is a card that expands to show detail. Competitors can be manually tagged or AI-suggested based on sector and product description.
Signals Timeline: A chronological feed of external events relevant to this company’s sector. Each signal: date, source, headline, relevance tag (High / Medium / Low), and a link to the original source. Signals can be pinned as “Relevant to thesis” or dismissed.

Tab 5: Notes & Actions
Notes: Reverse-chronological list of internal team notes. Each note: author, date, content (rich text), tags (Board Prep / Founder Check-in / Risk Flag / Opportunity / General). “New Note” button opens inline editor. Notes from Granola are auto-imported and tagged.
Actions: A kanban board with three columns (To Do, In Progress, Done). Each card: title, assigned owner, due date, source (flag, note, or manual), and linked company note. Actions can be created from any flag or note. Drag between columns to update status.

Tab 6: Fundraising
Fundraising-specific view. Shows: expected next round timing (as reported by founder), current runway, estimated raise window, level of investor interest (qualitative, from founder updates), Crane’s follow-on assessment (internal, editable), any external signals of fundraising activity (Specter alerts, news), and a timeline of all fundraising-related interactions and notes. This tab is especially relevant for companies approaching their next round.

6.5 Board Prep View
A dedicated screen for preparing for board meetings. This directly addresses Anna’s request to “take the latest updates, board decks and transcripts and flag what are some of the things we should be asking in the upcoming meeting.”
Auto-Generated Board Brief
When a user clicks “Prep” on an upcoming board meeting, the system generates a structured brief by ingesting the latest board deck (from Dropbox), the most recent call transcripts (from Granola), email updates since the last board meeting, and current metric data.

The brief contains:
Section
Content
Company Snapshot
Current health status, upside classification, key metrics, and runway. Compared to the state at the previous board meeting.
Key Changes Since Last Board
A bullet list of the most significant changes: metric movements (with direction and magnitude), team changes, product milestones, and customer wins/losses.
Flag Summary
Any active proactive flags relevant to this company, with context.
Suggested Discussion Points
AI-generated questions based on the latest data. E.g., “Burn increased 25% but headcount flat — ask about the driver,” “Two enterprise customers churned — ask about retention strategy,” “Founder mentioned exploring new pricing — follow up on progress.”
Competitor Context
Any notable competitor movements since the last board meeting.
Open Actions
Any to-dos or interventions related to this company that are still in progress.
Source Documents
Links to the board deck, transcripts, and emails that informed the brief.


Editing & Collaboration
The generated brief is fully editable. Team members can add their own questions, annotate sections, and flag items for the partner attending the board. A “Share” button generates a link or exports to PDF/DOCX for offline use. All edits are saved and attributed.

AI Layering: Board Prep
In v1, the brief is structured but primarily assembled from extracted data (metrics, dates, quotes from transcripts). In v2, an LLM synthesises the information into a narrative and generates higher-quality suggested questions that reference specific data points and previous board discussions.


6.6 Portfolio Review
A guided workflow replacing the current Google Sheet → compiled deck process. Supports two modes.
Mode 1: Weekly Team Review
Designed for 30–45 minute team meetings. The system presents companies in action-priority order (Lean In / Anticipate first). For each company: status badges, an AI-generated change summary since last review, key metrics with trends, active flags, and the owner’s notes. The reviewer can update statuses, add notes, and create actions inline. A progress bar shows how many companies have been reviewed. A “Skip” button defers companies that don’t need attention. At the end, a summary screen shows all changes made during the review.
Mode 2: Quarterly LP Report
A comprehensive review that generates a structured output document. The system walks through the portfolio grouped by action category. For each company: performance summary, metric charts, notable events, and team assessment. At the end, the system generates a downloadable PDF or DOCX with: portfolio-level aggregates (total companies, avg runway, health distribution), a portfolio composition breakdown (by stage, sector, geography), and individual company summaries. The report format is configurable in Settings to match Crane’s LP reporting template.
Review History
All completed reviews are saved and browsable. A “Compare Reviews” feature shows side-by-side changes between any two review dates. This replaces the need to look back through old Google Sheets.

6.7 Search & Discovery
Semantic search across all ingested data — documents, transcripts, notes, metrics, and signals.
Search Interface
A prominent search bar supporting natural language queries: “Which companies have less than 6 months runway?”, “What did the Acme founder say about pricing in the last board update?”, “Companies with accelerating revenue growth,” “Who hired a VP Sales recently?”
Result Types
Results grouped by type: Companies (matching profiles), Documents (with highlighted excerpts), Metrics (matching data points), Notes (internal content), Signals (external events). Each result: source, date, relevance score, snippet. Click navigates to the source.
Saved Searches
Save frequent queries as named filters (e.g., “Runway < 6 months”). Quick-access chips below the search bar. Advanced filters: company, date range, document type, source, metric, status.

6.8 Alerts & Activity Feed
The full timeline of all portfolio events. Reverse-chronological. Each event: timestamp, company + logo, event type icon, title, 1–2 line description, source, and severity.
Event Type
Trigger
Example
Status Change
Health or Upside classification changed
Acme moved from On Track → At Risk
Metric Update
New data point ingested
MRR updated: €45K → €52K (+15.5%)
Burn Acceleration
Burn rate increased >20% while revenue flat
Burn up 35% at Beta Corp; runway impact
Document Ingested
New file added
Q4 Board Deck uploaded from Dropbox
External Signal
Market/competitor event from Specter or news
Competitor raised Series B (€12M)
Key Hire / Departure
Team change detected from update or LinkedIn
CTO departed at Delta Inc
Fundraising Signal
Founder or external indicator of upcoming raise
Gamma mentioned Series A timing in email
Board Upcoming
Board meeting within 14 days
Acme board in 5 days — prep not started
Engagement Gap
No interaction for 30+ days
No update from Epsilon since 14 Feb
Runway Alert
Runway below threshold
Runway at 4.5 months — below 6-month threshold
Pivot Signal
Product/positioning change detected
Founder mentioned shifting from B2C to B2B
Customer Signal
Notable win or churn detected
Lost 2 of 5 design partners at Zeta


Notification Preferences
Per-user configuration: which event types trigger push notifications, which appear only in-feed, which are muted. Notification channels: in-app badges (always), email digests (daily/weekly, configurable), and Slack integration (optional, per-channel). GPs can set up a weekly portfolio digest email summarising all flags across their companies.

6.9 External Intelligence Hub
A dedicated screen for browsing and configuring external market signals. This is the operational centre for Crane’s market layering capability, separate from company-level signals (which appear in the Company Detail Market Context tab).
Sector Dashboards
For each sector Crane invests in (DevTools, Data Infra, AI/ML, etc.), a dashboard showing: total funding activity (last 30/90/365 days), deal count and average deal size, notable rounds, sector hiring trends (aggregate headcount change), M&A activity, and a news feed of sector-relevant articles. Each portfolio company is tagged to 1–2 sectors, and the sector dashboard shows which Crane portfolio companies operate in that space.
Competitor Graph
A visual map of competitors across the portfolio. For each portfolio company: tagged competitors with signal comparison cards (traffic, headcount, funding, product activity). Competitors can be added manually or suggested by the system based on sector + product overlap. A “Competitive Landscape” view shows a bubble chart: x-axis = funding raised, y-axis = headcount, bubble size = web traffic, colour = Crane portfolio (blue) vs competitor (grey). This makes relative positioning visible at a glance.
Signal Feed (Portfolio-Wide)
A unified feed of all external signals across the portfolio, filterable by: sector, signal type (funding / hiring / M&A / product / news / macro), relevance, and company. This feed is the raw input that generates flags on the My Dashboard — but here, users can browse signals that didn’t trigger a flag and manually promote them.
Specter Integration Panel
A configuration area showing all portfolio companies mapped (or unmapped) to Specter entities. The system auto-matches by domain URL. For unmatched companies, a manual search allows linking. For each matched company, users can toggle which Specter signals to track (website traffic, hiring, tech stack, funding). A sync status indicator shows last-synced time and any errors.
Data Source Budget Tracker
Since Crane is budget-conscious on external data subscriptions, this panel shows: which external data sources are connected, which are free vs paid, estimated monthly cost per source, and usage metrics (API calls, data freshness). This helps the team decide which paid integrations are worth maintaining.

Budget-Conscious External Data Strategy
Not all external data requires paid subscriptions. The system will prioritise free and low-cost sources first: Specter (existing subscription), public Crunchbase data, LinkedIn public profiles, Google News alerts, and web traffic estimates from free sources. Paid enrichment (AlphaSense, LinkedIn Sales Navigator API, premium Crunchbase) can be added per-source as the team validates value.


6.10 Settings & Configuration
Data Sources
Card grid showing each connector: Attio, Dropbox, Notion, Granola, Email, Specter, AlphaSense. Each card: connection status (Connected / Disconnected / Error), last sync, record count, and a “Configure” button. Configure panel: re-auth, folder/database selection, sync frequency, sync logs.
Team Management
Member list with roles (Admin / Member / Viewer). Portfolio assignments (drag-and-drop or multi-select). Notification preference defaults. Invite flow for new members. Role determines: Admin can change settings and assignments; Member can update statuses, add notes, create actions; Viewer is read-only.
Portfolio Configuration
Metric definitions: which metrics to track globally, display names, units, and target thresholds that trigger flags. Per-company metric overrides (e.g., pre-revenue companies skip MRR). Review schedule: weekly cadence day/time, reminder notifications. LP report template: customise branding, section order, and which metrics to include.
Alert & Flag Rules
Configurable thresholds for each flag type. Defaults provided (e.g., runway < 6 months, burn increase > 20%, engagement gap > 30 days) with the ability to customise per company or globally. Enable/disable individual flag types. Set notification routing per flag type.
Company Management
List of all portfolio companies. Add new (or sync from Attio). Archive exited companies. Merge duplicates. Manage sector tags, competitor tags, and owner assignments. Import/export company list. Bulk update stage or sector tags.
External Data Configuration
Per-company Specter entity mapping. Competitor tagging management. Sector taxonomy editor. External signal relevance rules (which signal types to prioritise per sector). Budget/usage dashboard for paid APIs.

7. Data Model & Metric Definitions
Based on Anna’s expanded metric requirements, the system tracks the following data model per portfolio company. Each metric has a defined data type, expected update frequency, and the source system from which it is typically ingested.
Metric
Type
Frequency
Source
Notes
Revenue / ARR
Currency
Monthly
Board deck, email
Primary financial indicator. Pre-revenue companies show leading indicator (e.g., design partner revenue).
Burn Rate
Currency/mo
Monthly
Board deck, email
Monthly cash outflow. Flag if increasing >20% while revenue flat.
Runway
Months
Monthly
Calculated
Cash / burn rate. Critical alert threshold: 6 months.
Customer Count
Integer
Monthly
Board deck, email
Total paying customers or design partners.
Revenue Growth
Percentage
Monthly
Calculated
MoM or QoQ growth rate. Flag acceleration or deceleration.
Notable Wins
Text
As reported
Email, transcript
Major customer logos, partnership announcements.
Product Milestones
Text
As reported
Board deck, email
Major features shipped, product pivots, launches.
Product Adoption
Varies
Monthly
Board deck
Active users, usage metrics, engagement.
Headcount
Integer
Quarterly
Board deck, email
Total FTEs. Track delta per period.
Diversity Metrics
Percentage
Quarterly
Board deck
Gender, ethnicity breakdowns as reported.
Key Hires
Text
As reported
Email, transcript, LinkedIn
VP/C-level additions, critical engineering hires.
Key Departures
Text
As reported
Email, transcript, LinkedIn
Senior departures. Auto-flagged as risk signal.
Next Round Timing
Date range
As reported
Email, transcript
Expected fundraise window. Feeds fundraising tab.
Investor Interest
Qualitative
As reported
Email, transcript
Low / Medium / High. From founder updates.


8. External Data & Signal Architecture
This section defines how external data flows into the system, gets matched to portfolio companies, scored for relevance, and surfaced in the UI. This addresses the full Section C requirement from discovery.
8.1 Specter Integration
Specter is Crane’s existing external data provider. The integration works by querying Specter’s API by company domain URL (confirmed as feasible by Anna). No pre-built portfolio list in Specter is needed.
Component
Detail
Entity Matching
Auto-match portfolio companies to Specter entities by domain URL. Manual override for failed matches. Match status visible in the Intelligence Hub Specter panel.
Signals Tracked
Website traffic (monthly visitors, trend), hiring velocity (job postings, headcount changes), funding rounds (competitors and sector), tech stack changes, and any custom signals Specter exposes.
Sync Frequency
Daily sync for all matched companies. On-demand refresh available per company.
Competitor Discovery
When a portfolio company is matched, Specter’s related/similar company data can be used to auto-suggest competitors.
Alerting
Configurable thresholds: e.g., web traffic change > 30% MoM triggers a signal. Signals flow into the Alerts feed and may generate proactive flags on My Dashboard.


8.2 Signal Scoring & Relevance Engine
Without relevance scoring, the external signal feed becomes noise. Every ingested signal passes through a scoring pipeline:
1. Signal Ingestion. Raw signal arrives from Specter, news feed, or other source. Tagged with: source, company/sector, signal type, timestamp.
2. Company Matching. Signal is matched to one or more portfolio companies (by direct company match or sector/competitor association).
3. Relevance Scoring. Scored as High / Medium / Low based on configurable rules. Example rules: competitor raised > €5M = High. Minor hiring change in tangential company = Low. Direct company signal always = High.
4. Flag Promotion. High-relevance signals matching flag patterns are promoted to proactive flags on My Dashboard. Medium signals appear in the company’s Market Context tab and the Intelligence Hub. Low signals are visible in the Intelligence Hub signal feed only.
5. User Feedback Loop. Users can upvote/downvote signal relevance. Over time, this improves scoring rules (manually in v1, ML-assisted in v2).

8.3 Sector Taxonomy & Benchmarking
Each portfolio company is tagged with 1–2 sectors from a managed taxonomy (e.g., DevTools, Data Infrastructure, AI/ML, Security, Fintech). Sectors enable:
•  Sector dashboards in the Intelligence Hub (aggregate funding, hiring, M&A)
•  Sector-average metric benchmarks (e.g., “this company’s revenue growth is 2× the DevTools sector median”)
•  Automatic association of sector-level signals to relevant portfolio companies
•  Competitive landscape views grouped by sector
The taxonomy is editable in Settings. Companies can be re-tagged as they pivot or expand.

8.4 Additional External Sources (Prioritised by Cost)
Source
Cost
Value & Scope
Specter
Existing sub
Primary external signal source. Website traffic, hiring, funding, tech stack. Query by domain.
Google News Alerts
Free
Keyword-based news monitoring per company and sector. Feeds into signals timeline.
Crunchbase (Basic)
Free tier
Company profiles, funding round data, investor networks. Limited API on free tier.
LinkedIn Public Data
Free
Public profile changes, job postings (via scraping or proxy). Feeds hiring signals.
AlphaSense
Existing sub
Market intelligence, research reports, earnings transcripts. Deep sector context.
Crunchbase Pro
Paid
Enhanced funding data, advanced company search, trend analytics. Evaluate after v1.
LinkedIn Sales Nav API
Paid
Structured hiring data, company updates. Evaluate after v1.
G2 / Product Reviews
Free tier
Product review signals, competitive positioning. Low priority for early-stage.


9. Data Sources & Integrations
Source
Type
Data
Status
Attio
Internal CRM
Companies, founders, interactions, pipeline, investment status
API access TBC
Dropbox
Internal Docs
IC papers, board decks, financials, legals (folder-per-company)
API available
Notion
Internal Wiki
Portfolio database (WIP), meeting notes
API available
Granola
Internal Notes
Meeting transcripts, call notes (synced to Attio + Notion)
Integration TBC
Gmail
Internal Comms
Founder updates (bi-weekly/quarterly), investor comms
Gmail API
Google Sheets
Internal Data
Current quarterly reporting sheets (to be replaced)
Sheets API
Specter
External Signals
Company data, funding, web traffic, hiring (query by domain)
Existing subscription
AlphaSense
External Research
Market intelligence, research, transcripts, news
Existing subscription
LinkedIn
External Network
Profiles, job postings, Sales Navigator
No direct API


10. System Architecture
Layer
Responsibility
Components
Ingestion
Connectors per source. Auth, rate limiting, incremental sync, text extraction, document parsing.
Attio, Dropbox, Notion, Granola, Gmail APIs. PDF/deck parser. Specter, AlphaSense APIs. News feed ingestor.
Data
Structured storage (companies, founders, metrics, signals). Vector store for semantic search. Entity resolution.
PostgreSQL + pgvector. Object storage for raw docs. Event log for all changes. Embedding pipeline.
Intelligence
Health assessment, upside classification, flag generation, signal scoring, anomaly detection, board prep assembly.
Rule-based engine (v1). LLM integration for summarisation and Q&A (v2). Configurable thresholds.
Interface
Web app serving all 10 screens. Real-time updates. Personalised per user.
React frontend. REST + WebSocket API. Auth (SSO or email). RBAC. Responsive design.


Data Flow
1. Sources synced on schedule (6-hourly for docs, daily for Specter, real-time for Attio webhooks).
2. Incoming data: raw storage → text extraction → entity resolution (match to company) → structured storage → embedding generation → vector store.
3. Intelligence layer runs assessment rules after new data, updating health/upside if thresholds met.
4. External signals pass through the scoring engine (match, score, promote/filter).
5. Status changes, new docs, and triggered flags push to activity feed and notification system.
6. UI polls or subscribes to changes; personalised dashboards update in near-real-time.

11. What Success Looks Like
The system replaces the current Google Sheet → compiled deck workflow with a living, personalised platform. Success criteria:
•  Each team member has a personalised dashboard showing their companies, flags, and to-dos
•  All portfolio company data (decks, transcripts, emails, metrics) is centralised and searchable
•  The expanded metric set (financial, commercial, product, team, fundraising) is tracked for every company
•  Proactive flags surface risks and opportunities before the team would catch them manually
•  Board prep briefs are auto-generated from the latest ingested data
•  The action matrix is used weekly to guide team attention
•  Portfolio reviews complete in under 45 minutes (vs. the current multi-hour manual process)
•  Quarterly LP reports are generated directly from the system
•  External signals (Specter, news, hiring) are overlaid on portfolio companies and scored for relevance
•  Every portfolio company has an assigned owner and tracked interventions

Measurable targets:
•  Time to complete weekly review: < 45 minutes
•  Time to generate quarterly LP report: < 2 hours (including manual edits)
•  Time to prepare for a board meeting: < 15 minutes (vs. current manual assembly)
•  % of portfolio companies with current data (< 30 days): > 80%
•  Average time from signal to team awareness: < 48 hours
•  % of companies with assigned owner + tracked actions: 100%

12. Phased Delivery Plan
Phase 1a: Foundation + Core Portfolio Views
Data ingestion pipeline (Attio, Dropbox, Notion, Granola, Email). Company data model with the full metric set. My Dashboard (personalised), Portfolio Command Center, Company Detail (all tabs except Market Context), and Settings. Basic search (keyword). Manual health/upside classification with rule-based flag generation.
Phase 1b: Intelligence + External Data
Specter integration with entity matching and signal scoring. Company Detail Market Context tab. External Intelligence Hub. Action Matrix with drag-and-drop. Board Prep view (data assembly, structured brief). Semantic search (vector-based). Portfolio Review workflow (weekly mode). Alert & notification system.
Phase 1c: Reporting + Polish
Quarterly LP Report generation. Review History and Compare Reviews. Export functionality (CSV, PDF, DOCX). Notification preferences and digest emails. Additional external sources (Google News, Crunchbase basic). Performance optimisation for 50–60 company scale.
Phase 2: Deal Flow & AI Enhancement (Future)
CRM intelligence (duplicate detection, auto pipeline updates, monitor list signals). Outbound support (Sales Navigator, email drafts). LLM-powered features: AI board prep narrative, conversational Q&A, automated status suggestions, trend detection. Advanced signal scoring (ML-assisted from user feedback).

13. Open Questions & Next Steps
Remaining Open Questions
#
Question
Impact
1
Attio API access — plan and availability
Determines CRM integration approach
2
Granola API — programmatic transcript access beyond Attio sync?
Determines transcript ingestion method
3
Specter API — confirm endpoints, rate limits, and available signals
Determines external signal scope
4
Google Sheet template from COO (current quarterly reporting)
Helps map existing workflow to new system
5
APAC team Notion setup — details of their tracking approach
Reference for Notion integration scope
6
Specific metric thresholds for flag triggers
Configures the proactive flag engine
7
LP report format/template (current deck structure)
Determines report generation output
8
Timeline pressures (LP meetings, board cadence)
Determines delivery milestones
9
Hosting / security / compliance requirements
Determines infrastructure decisions


Next Steps
1. Crane internal discussion — Anna to share this scope with the team (week of 17 March)
2. Feedback on UI specification — which screens are highest priority for v1?
3. COO to share current Google Sheet template and LP report format
4. Confirm API access: Attio, Specter, Granola
5. Follow-up call — Friday 21 March or Monday/Tuesday 24–25 March
6. Finalised technical spec, delivery timeline, and cost estimate
