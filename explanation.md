# Crane - How It Works (Demo Explanation Guide)

## Glossary of Abbreviations

### Fund & Investment Terms

| Abbreviation | Full Form | Meaning |
|---|---|---|
| **TVPI** | Total Value to Paid-In | Measures total fund performance. (Current NAV + all distributions returned to LPs) divided by total capital LPs have paid in. A TVPI of 1.72x means for every GBP1 invested, the fund is currently worth GBP1.72. Includes both realised (exited) and unrealised (still held) value. |
| **DPI** | Distributions to Paid-In | Measures how much cash has actually been returned to LPs. Total distributions divided by total paid-in capital. A DPI of 0.45x means 45p of every GBP1 invested has been returned as cash. This is "money in the bank" — unlike TVPI, it only counts realised returns. |
| **NAV** | Net Asset Value | The current fair market value of all the fund's holdings, minus liabilities. Updated quarterly by the fund administrator. Used in TVPI calculation and LP reporting. |
| **MoIC** | Multiple on Invested Capital | For a single company: Carrying Value divided by Cost. If Crane invested GBP1.5M in Arcline and it's now worth GBP2.8M, MoIC = 1.87x. Above 1.0x = gain, below 1.0x = loss. |
| **IRR** | Internal Rate of Return | The annualised rate of return accounting for the timing of cash flows. A 25% IRR means the investment grew at 25% per year, accounting for when money went in and came out. Used mainly for exited investments. |
| **LP** | Limited Partner | The investors in the fund — pension funds, endowments, family offices, fund-of-funds. They commit capital and receive returns but don't manage the fund. Crane reports to LPs quarterly via the Manager's Report. |
| **GP** | General Partner | The fund manager — Crane Venture Partners. The GP makes investment decisions, manages the portfolio, and reports to LPs. In Crane's team, the GP is the senior partner who approves the quarterly report (Step 5). |
| **IC** | Investment Committee | The internal decision-making body that approves new investments. IC papers are the analysis documents prepared before making an investment. Stored in Dropbox. |
| **AUM** | Assets Under Management | Total value of investments the fund manages. Related to NAV but includes committed but uncalled capital. |

### Financial Metrics

| Abbreviation | Full Form | Meaning |
|---|---|---|
| **ARR** | Annual Recurring Revenue | Total recurring revenue on an annualised basis. For SaaS companies, this is the most important growth metric. Calculated as MRR x 12. Example: if a company has GBP45K MRR, their ARR is GBP540K. |
| **MRR** | Monthly Recurring Revenue | Revenue that recurs every month from subscriptions. The core metric for SaaS businesses. Excludes one-time fees, services revenue, or variable usage. |
| **EBITDA** | Earnings Before Interest, Taxes, Depreciation, and Amortisation | A measure of operating profitability. Revenue minus COGS minus Overheads, before accounting adjustments. For early-stage startups, this is usually negative (called LBITDA — Loss Before...). |
| **COGS** | Cost of Goods Sold | Direct costs of delivering the product/service. For SaaS: hosting, infrastructure, customer support, payment processing. Typically 20-40% of revenue. |
| **LTM** | Last Twelve Months | A trailing 12-month window. "Cash Burn LTM" means total cash burned over the past 12 months. Used to smooth out monthly fluctuations. |
| **G&A** | General & Administrative | Operating costs not directly tied to building or selling the product: office rent, legal, accounting, HR, insurance. One of three overhead categories alongside R&D and Sales & Marketing. |
| **R&D** | Research & Development | Costs of building the product: engineering salaries, tools, testing, infrastructure for development. Typically the largest expense category for early-stage tech companies (40%+ of overheads). |
| **CAC** | Customer Acquisition Cost | How much it costs to acquire one new customer. Total Sales & Marketing spend divided by number of new customers acquired. Important for unit economics. |
| **NPS** | Net Promoter Score | Customer satisfaction metric (-100 to +100). Measures how likely customers are to recommend the product. Above 50 is excellent, above 0 is acceptable. |

### Reporting & Assessment

| Abbreviation | Full Form | Meaning |
|---|---|---|
| **RAG** | Red, Amber, Green | Traffic-light status system used across VC to quickly communicate company health. **Green** = on track, meeting/exceeding plan. **Amber** = caution, some concerns or slowing growth. **Red** = significant issues, intervention needed. **Grey** = non-core or insufficient data. Set by the Crane team during quarterly reviews. |
| **KPI** | Key Performance Indicator | The specific metrics tracked for each company. In Crane, these include: ARR, Revenue, EBITDA, Cash Balance, Burn Rate, Runway, Headcount, Customer Count, Net Retention Rate, and diversity metrics. |
| **QoQ** | Quarter over Quarter | Comparing a metric between consecutive quarters. "Burn increased 20% QoQ" means burn this quarter is 20% higher than last quarter. Used for detecting acceleration or deceleration trends. |
| **MoM** | Month over Month | Comparing a metric between consecutive months. "Revenue grew 15% MoM" means this month's revenue is 15% higher than last month's. The primary growth cadence for early-stage companies. |
| **FTE** | Full-Time Equivalent | Headcount normalised for part-time workers. Two half-time employees = 1 FTE. Used for consistent headcount tracking and diversity reporting. |
| **DEI** | Diversity, Equity & Inclusion | The practice of tracking and improving workforce diversity. Crane tracks: Female % (FTE and Board), Ethnic Minority % (FTE and Board). Required by many LPs for ESG reporting. |
| **ESG** | Environmental, Social & Governance | Framework for measuring non-financial impact. The diversity metrics in Crane (female %, ethnic minority %) are part of ESG reporting. Many institutional LPs require quarterly ESG data. |

### People & Roles

| Abbreviation | Full Form | Meaning |
|---|---|---|
| **CEO** | Chief Executive Officer | The founder/leader running the portfolio company. Primary relationship for Crane's team. |
| **CFO** | Chief Financial Officer | Finance lead at the portfolio company. Typically the person providing financial data (Gigs template, board deck financials). |
| **CTO** | Chief Technology Officer | Technology lead. A CTO departure triggers a "Key Departure" alert in Crane because it's a critical role for tech companies. |
| **VP** | Vice President | Senior leadership below C-suite. VP Sales, VP Engineering, VP Product. Departure of a VP can trigger alerts. Hiring a VP (especially VP Sales) is often a positive signal tracked in the Intelligence Hub. |

### Systems & File Formats

| Abbreviation | Full Form | Meaning |
|---|---|---|
| **CRM** | Customer Relationship Management | Software for tracking contacts, interactions, and deal pipelines. Crane uses Attio as its CRM to track founder relationships, meeting history, and deal flow. |
| **API** | Application Programming Interface | How software systems talk to each other. Each of Crane's 8 data connectors uses an API to pull data from the source system (Attio API, Dropbox API, Gmail API, etc.). |
| **CSV** | Comma-Separated Values | Simple spreadsheet format. Used for the Fund Summary export and as a fallback for Asset Metrix data. |
| **XLSX** | Excel Spreadsheet (XML format) | Microsoft Excel file format. The Asset Metrix export generates a multi-sheet XLSX with 3 tabs: Company Commentary, Company Static, Company Periodic. |
| **PDF** | Portable Document Format | The LP Report is generated as a PDF via browser print. Matches the current Crane I Manager's Report format. |
| **SPA** | Single Page Application | The technical architecture of Crane — one HTML page that dynamically updates content without full page reloads. Built with React. |
| **SSO** | Single Sign-On | Authentication method where one login gives access to multiple systems. Mentioned in company progress notes (e.g., "Arcline shipped enterprise SSO"). |
| **OCR** | Optical Character Recognition | Technology that extracts text from images/scanned documents. Used in auto-extraction (Step 1) to read data from board deck PDFs that aren't text-selectable. |
| **SaaS** | Software as a Service | Business model where software is sold as a subscription (monthly/annual). Most Crane portfolio companies are SaaS businesses, which is why ARR/MRR are the primary growth metrics. |

---

## Overview

Crane is a portfolio intelligence platform for Crane Venture Partners. This document explains **how every data point is generated, where it comes from, who inputs it, and what calculations drive the numbers** - not just what each page shows.

---

## The Data Engine: Where Everything Comes From

### Data Sources (8 Integrations)

Crane pulls data from 8 connected systems. Each connector syncs on a schedule and feeds specific parts of the platform:

| Source | What It Provides | Sync Frequency | Example Data |
|--------|-----------------|----------------|--------------|
| **Attio** (CRM) | Company contacts, founder interactions, deal pipeline | Every 2 hours | 58 records - founder names, last meeting date, email threads |
| **Dropbox** | Board decks, legal documents, IC papers, financials | Every 6 hours | 342 records - Q4 board deck PDF, Series A term sheet |
| **Notion** | Portfolio wiki, meeting notes, internal playbooks | Daily | 24 records - company wiki pages, investment theses |
| **Granola** | Meeting transcripts, call notes, conversation summaries | Every 3 days | 89 records - founder call on 15 Mar, board prep discussion |
| **Gmail** | Founder email updates, investor communications | Every 30 min | 116 records - monthly founder update from Arcline CEO |
| **Specter** | Company signals: web traffic, hiring, funding, news | Every 12 hours | 55 records - competitor raised Series B, hiring VP Sales |
| **Fund Accounting** | NAV, TVPI, DPI, cost basis, carrying values | Weekly | 17 records - official fund admin valuations |
| **AlphaSense** | Market intelligence, research reports, sector analysis | Not yet connected | 0 records |

These connectors are configured in **Settings > Data Sources**. Each shows its connection status (green/red/gray), last sync time, and record count. When Granola shows "Error", it means the API token has expired and needs re-authentication.

### Data Input: Who Puts Numbers In?

Data enters Crane through **four channels**:

1. **Automatic extraction** - System pulls metrics from board decks (Dropbox), founder emails (Gmail), and call transcripts (Granola). During the Quarterly LP Report workflow (Step 1), this runs across all connected sources and reports confidence scores (e.g., "14 of 14 fields extracted, High confidence, Source: Board deck + email").

2. **Founder validation** - Pre-populated forms sent to founders (Portfolio Review Step 2). The form contains their latest known metrics. Founders confirm, edit, or flag missing data. This replaces the current Gigs Excel plugin where founders manually fill a spreadsheet each month.

3. **Team input** - Crane team members (Anna, Scott, Krishna, James) manually enter qualitative assessments during reviews: RAG status, Summary, Key Concerns, Action Points, Fundraising status. This happens in Portfolio Review Step 3 (Team Commentary).

4. **Fund administrator** - Official accounting data (cost basis, carrying values, NAV, TVPI) comes from the fund accounting system. These are the audited numbers that go into LP reports.

---

## Page-by-Page: How Every Number Is Calculated

---

### 1. MY DASHBOARD

#### "7 Needs Attention" (top-left red card)

**How it's calculated:** Count of active flags (alerts) across the logged-in user's portfolio companies.

**Where flags come from:** The alert engine evaluates each company against configurable threshold rules (Settings > Alert Rules):

| Alert Rule | Trigger Condition | How It's Detected |
|-----------|-------------------|-------------------|
| **Runway Alert** | Cash runway drops below 6 months | `cashBalance / monthlyNetBurn < 6`. Cash balance comes from the latest monthly financials (founder-reported or extracted from board deck). Monthly net burn = absolute value of EBITDA. |
| **Burn Acceleration** | Burn rate increases >20% quarter-over-quarter | Compare `monthlyNetBurn` of current quarter vs previous quarter. If `(current - previous) / previous > 0.20`, flag triggers. |
| **Growth Inflection** | MRR grows >15% month-over-month sustained for 2+ months | Compare consecutive `revenue` values in monthlyFinancials. If `(month[n] - month[n-1]) / month[n-1] > 0.15` for 2+ consecutive months, flag triggers. |
| **Board Coming Up** | Board meeting is within 14 days | `nextBoard` date compared to today. If `daysUntilBoard <= 14`, flag triggers. High urgency if <=7 days. |
| **Engagement Gap** | No interaction with company for >30 days | `lastUpdate` date compared to today. If `daysSinceLastUpdate > 30`, flag triggers. "Interaction" = any data update, email, meeting, or note. |
| **Key Departure** | Senior team member (C-suite, VP) leaves | Detected from LinkedIn signals via Specter, or manually flagged by team. |
| **Fundraising Signal** | Company begins fundraising process | Detected from founder emails, Attio CRM pipeline updates, or team notes. |
| **Market Signal** | Significant competitor activity | Specter signals: competitor funding rounds, major hires, product launches. |
| **Pivot Signal** | Product or positioning change detected | Detected from board deck analysis, founder communications, or website changes tracked by Specter. |

Each flag includes: the company it applies to, a headline summary, detailed explanation, suggested action, and urgency level (high/medium/low).

**Urgency assignment:**
- **High**: Runway <4 months, burn increase >40%, board in <7 days, key departure
- **Medium**: Runway 4-6 months, burn increase 20-40%, board in 7-14 days, fundraising signal
- **Low**: Market signals, minor changes

#### "3 Overdue Actions" (top-right red card)

**How it's calculated:** Count of todos where `todo.completed === false AND todo.dueDate < today`.

**Where todos come from:** Two sources:
1. **Converted from flags** - When a user clicks "Convert to To-Do" on any alert, the flag's `suggestedAction` becomes the todo title, due date is set to 7 days from now, and priority maps from the flag's urgency level.
2. **Manually created** - User clicks "+ New To-Do" and fills in: company, title, due date, priority. Stored in the shared WorkflowContext.

#### Critical Alerts (red banner section)

**What appears here:** The top 3 highest-urgency flags, filtered to the current user's companies only.

**Filtering logic:** `flags.filter(flag => flag.urgency === 'high' && myCompanyIds.includes(flag.companyId)).slice(0, 3)`

**What each alert shows:**
- Company name + flag type badge (e.g., "Burn Acceleration")
- Headline (e.g., "Burn rate accelerating at Vaultik - runway dropped from 14 to 9 months")
- Suggested action (e.g., "Schedule founder check-in to discuss runway extension and cost reduction strategy")
- **"Take Action" dropdown** - four options that update the system state:
  - *Convert to To-Do*: Creates a todo from the flag's suggested action, marks the flag as actioned
  - *Log Note & Resolve*: Opens a note modal, when saved the flag is dismissed and a note is logged in the activity feed
  - *Mark Resolved*: Dismisses the flag immediately, logs resolution in activity feed
  - *Snooze 7 days*: Hides the flag for 7 days, it reappears after

#### My To-Dos (left column)

**Sorting logic:** Todos are sorted by:
1. Overdue items first (due date < today)
2. Then by priority: high > medium > low
3. Then by due date (earliest first)

**What each todo shows:**
- Checkbox (toggles complete/incomplete, persisted to localStorage)
- Title
- Company name as a clickable pill badge (navigates to company detail)
- Due date (shown in red with "Overdue" badge if past due)
- Priority badge (red = high, amber = medium, gray = low)
- Source badge - "from alert" with flame icon if converted from a flag, no badge if manually created

**Persistence:** All todo state is saved to `localStorage` under key `crane_workflow_state_v1`. This means todos survive browser refreshes and session changes.

#### Board Prep (right column)

**How it knows about upcoming boards:** Each company has a `nextBoard` field - a date set by the team when they schedule/learn about board meetings. This date is entered either:
- From Attio CRM (synced calendar events)
- From Granola (detected in meeting transcripts - "next board is March 28")
- Manually in Settings > Companies

**Sorting:** Companies sorted by board date (nearest first). Only companies with `lifecycle === 'Active - Core'` and `nextBoard !== null` appear.

**Days calculation:** `daysUntilBoard = Math.ceil((boardDate - today) / millisecondsPerDay)`
- Shows as "(2d away)" in red if <=7 days
- Shows as "(8d away)" in amber if 8-14 days
- Shows as "(26d away)" in gray otherwise

**Buttons:**
- "Start Prep" navigates to the Board Prep page, pre-selecting that company
- "View Company" navigates to the company detail page

#### Recent Alerts (right column)

**What appears:** All active (non-dismissed, non-snoozed) flags across the user's portfolio, sorted by creation date (newest first). Shows up to 7 alerts with scroll.

**Badge:** Total active count shown as "7 active".

#### My Companies (card strip)

**Which companies appear:** Filtered by the current user's ownership. Anna owns Arcline, Nebula Data, Synthwave, Vaultik, Gridform (+ others).

**MRR value:** Taken from the company's `mrr` field, which comes from the latest monthly financials `revenue` value. Updated when founder reports or when auto-extracted from board decks.

**Growth percentage:** Calculated as: `((currentMRR - previousMRR) / previousMRR) * 100`. Green up arrow if positive, red down arrow if negative.

**Sparkline chart:** Renders the company's `mrrTrend` array - last 6 months of MRR values as a mini area chart.

**"Stale" warning:** If `daysSinceLastUpdate > 30`, the card shows "Stale - 33d ago" in amber instead of "Updated: 12 Mar". Days since update = `Math.floor((today - lastUpdate) / millisecondsPerDay)`.

#### Recent Activity (timeline)

**What feeds this:** A combined event stream from:
- **System events** (pre-seeded): Metric updates, document uploads, flag triggers, customer signals
- **User actions** (generated live): When someone creates a todo, logs a note, dismisses a flag, or completes a review step - an activity event is automatically created and added to the feed

**Activity event types and their icons:**
| Type | Icon | Color | Example |
|------|------|-------|---------|
| Metric Update | TrendingUp | blue | "MRR updated: GBP40K -> GBP45K (+12.5%)" |
| Burn Acceleration | Flame | red | "Burn up 40% while revenue flat" |
| Runway Alert | AlertTriangle | red | "Runway at 4 months - below 6-month threshold" |
| Document Ingested | FileText | blue | "Q1 Board Deck uploaded from Dropbox" |
| Customer Signal | Target | green | "Signed 2 new enterprise customers" |
| Engagement Gap | Clock | amber | "No interaction for 30 days" |
| Note Logged | MessageSquare | blue | User logged a meeting note |
| Action Created | CheckCircle | green | User created a new todo |

**Filtering:** Dashboard shows only events for the current user's companies, limited to 8 most recent.

---

### 2. PORTFOLIO COMMAND CENTER

#### Fund Performance Panel (top section, when fund selected)

**When it appears:** Only when a specific fund is selected in the global filter (e.g., "Fund I" instead of "All Funds").

**Where the numbers come from:** The `FundEntity` object, populated from the **Fund Accounting** connector. These are official, audited numbers from the fund administrator:

| Metric | Calculation | Source |
|--------|-------------|--------|
| **TVPI Net** | (NAV + Distributions) / Paid-In Capital | Fund admin quarterly valuation |
| **TVPI Gross** | (NAV + Distributions + Fees) / Paid-In Capital | Fund admin quarterly valuation |
| **DPI** | Distributions / Paid-In Capital | Fund admin records |
| **NAV** | Sum of all portfolio carrying values | Fund admin quarterly valuation |
| **Committed** | Total LP commitments | Fund formation documents |
| **Deployed** | Total capital called and invested | Fund admin records |
| **Deployed %** | Deployed / Committed * 100 | Calculated |
| **Available** | Committed - Deployed | Calculated |

**NAV Waterfall chart:** Decomposes how NAV changed quarter-over-quarter:
```
Starting NAV (prior quarter)
+ Contributions (new capital called)
+ Realised Gains (exits, distributions received)
+ Unrealised Gains (markup of existing positions)
- Distributions (returned to LPs)
- Operating Costs (management fees, fund expenses)
- GP Share (carried interest accrual)
= Ending NAV (current quarter)
```

**TVPI/DPI Trend chart:** Plots `tvpiHistory` array - quarterly data points from fund inception showing how TVPI and DPI have evolved over time.

**Geographic Distribution pie:** Breaks down portfolio by region (UK, DACH, IBERIA, etc.) based on each company's `region` field.

#### Summary Stat Cards

**How each number is calculated:**

| Card | Calculation |
|------|-------------|
| **12 Active Core** | `companies.filter(c => c.lifecycle === 'Active - Core').length`. Sub-count: `filter(c => c.lifecycle === 'Active - Non-core').length` |
| **7 Green** | `companies.filter(c => c.rag === 'Green').length` |
| **3 Amber** | `companies.filter(c => c.rag === 'Amber').length` |
| **2 Red** | `companies.filter(c => c.rag === 'Red').length` |
| **13mo Avg Runway** | `sum(company.runway for active companies) / count(active companies)` |
| **10 Updated (30d)** | Companies where `daysSinceLastUpdate <= 30` |
| **2 Stale (30d+)** | Companies where `daysSinceLastUpdate > 30` |

**Clicking any card** applies a filter to the table below. E.g., clicking "Amber" sets `healthFilter = 'At Risk'` which filters the table to only Amber companies.

#### Mini Action Matrix

**How cells are populated:** Each company is placed in a cell based on its `health` (column) and `upside` (row) values. The count in each cell = number of companies matching that combination. The action label is derived from the matrix formula (see Action Matrix section below).

#### Portfolio Table

**Column data sources:**
| Column | Source | Calculation |
|--------|--------|-------------|
| Company | `company.name`, `company.description` | Static company data |
| Fund | `company.fund` | Assignment (Fund I/II/III) |
| Cost (GBP) | `company.accounting.costAtPeriodEnd` | From fund accounting - total cost basis of investment |
| Carrying Value | `company.accounting.carryingValue` | From fund accounting - current fair value |
| MoIC | `company.accounting.moic` | `carryingValue / costAtPeriodEnd` |
| RAG | `company.rag` | Team assessment (Green/Amber/Red/Grey) |
| ARR | Latest `monthlyFinancials.arr` | `revenue * 12` or directly reported |
| Cash Balance | Latest `monthlyFinancials.cashBalance` | Founder-reported or extracted from financials |
| Net Burn | Latest `monthlyFinancials.monthlyNetBurn` | `abs(EBITDA)` per month |
| Runway | `company.runway` | `cashBalance / monthlyNetBurn` in months |
| Fundraising | `company.equityFundraisingStatus` | Team-maintained status |
| Owner | `company.owner` | Assigned Crane team member |
| Updated | `company.lastUpdate` | Date of most recent data point from any source |

**MoIC color coding:** Red if <1.0x (loss), default if 1.0-2.0x, green if >2.0x (strong return).

**Runway color coding:** Red if <6 months (critical), amber if 6-9 months (warning), default otherwise.

**Sorting:** Click any column header to sort ascending, click again for descending. Active sort column shows a chevron indicator.

**Export XLSX button:** Generates a multi-sheet Excel file matching the Asset Metrix template (see Exports section).

---

### 3. ACTION MATRIX

#### The Framework: How Companies Get Categorised

The Action Matrix uses two independent assessments that combine to determine where the team should focus:

**Axis 1: Health Status** (set by the team during reviews)
- **On Track**: Company meeting or exceeding plan. Revenue growing, runway comfortable, team executing well.
- **At Risk**: Warning signs present. Growth slowing, burn increasing, runway declining, or key challenges emerging.
- **Underperforming**: Significant problems. Revenue declining, critical runway, team issues, or market headwinds.

*How it's determined:* Team assessment during Monthly Internal Review or Quarterly LP Report workflow (Step 3: Team Commentary). The team lead for each company proposes a RAG/health status based on the latest data, and the team discusses and agrees.

**Axis 2: Upside Potential** (set by the team, reviewed quarterly)
- **High Potential**: Large addressable market, strong team, product differentiation, clear path to significant scale. These are the companies that could return the fund.
- **Emerging**: Still early. Product-market fit being validated, early traction, potential is there but unproven. Needs more time to assess.
- **Limited Potential**: Niche market, capped growth, or structural limitations. Unlikely to be a top performer but may return capital.

*How it's determined:* Assessment by the investment team based on market analysis, competitive positioning, team quality, and growth trajectory. Reviewed and updated quarterly.

**The Matrix Calculation** (`getActionType` function):

```
IF upside is "High Potential":
    IF health is "On Track"         → LEAN IN
    IF health is "At Risk"          → ANTICIPATE
    IF health is "Underperforming"  → ANTICIPATE

IF upside is "Emerging":
    IF health is "On Track"         → LEAN IN
    IF health is "At Risk"          → WATCH
    IF health is "Underperforming"  → WATCH

IF upside is "Limited Potential":
    IF health is "On Track"         → WATCH
    IF health is "At Risk"          → DE-PRIORITISE
    IF health is "Underperforming"  → DE-PRIORITISE
```

**What each action means for the team:**
| Action | Time Investment | Activities |
|--------|----------------|------------|
| **Lean In** | High (weekly touchpoints) | Active intros, help with hiring, support fundraising, attend key meetings, co-sell with founder |
| **Anticipate** | Medium-High (bi-weekly) | Scenario planning (bridge round? pivot? acqui-hire?), prepare contingency plans, engage more deeply with founder on challenges |
| **Watch** | Low (monthly check-in) | Monitor metrics, attend scheduled boards, respond to requests but don't proactively engage |
| **De-prioritise** | Minimal (quarterly) | Attend boards only if required, no proactive outreach, focus time on higher-value companies |

#### Filter Pills

Clicking a filter pill (e.g., "Lean In 7") highlights only cells with that action and dims the rest. The count on each pill = number of companies with that action across the entire matrix.

#### Company Cards in Cells

Each mini-card shows data pulled from the company record:
- **MRR**: `company.mrr` formatted as currency per month
- **Flag count**: Count of active flags for that company (flame icon if >0)
- **Runway**: `company.runway` in months
- **On hover expansion**: Shows sparkline from `company.mrrTrend`, ARR growth from `company.arrGrowth`, and 4-quarter RAG history from `company.ragHistory`

---

### 4. COMPANY DETAIL

#### Header Metrics

| Metric | Source | Calculation |
|--------|--------|-------------|
| Cost | Fund accounting | Total invested capital at period end |
| Carrying Value | Fund accounting | Current fair market value per fund admin valuation |
| MoIC | Calculated | `carryingValue / costAtPeriodEnd` (e.g., GBP2.8M / GBP1.5M = 1.9x) |
| Ownership % | Fund records | Crane's equity stake percentage |

#### RAG History (4 colored dots)

Shows the company's RAG status for the last 4 quarters. Each dot represents one quarterly assessment:
- Q1 (oldest) → Q4 (most recent, larger/highlighted)
- Colors: Green / Amber / Red / Grey
- This history shows trajectory: "Was Green, went to Amber, now Red" tells a story of deterioration

**Where it comes from:** `company.ragHistory` array - set by the team during each quarterly review cycle. When the team assigns a new RAG status in Portfolio Review Step 3, it's appended to the history.

#### Metrics & Charts Tab

**Financial data flow:**
```
Founder reports monthly via Gigs/Validation Form
    → Monthly financials stored per company
    → Charts render 12-month time series
```

**How each metric is calculated:**

| Metric | Formula | Source |
|--------|---------|--------|
| Revenue | Directly reported | Founder monthly report |
| Revenue Other | Non-core revenue streams | Founder report (new field) |
| COGS | Cost of goods sold | Founder report |
| Gross Profit | `Revenue - COGS` | Calculated |
| Gross Margin % | `(Gross Profit / Revenue) * 100` | Calculated |
| Overheads | Operating expenses ex-COGS | Founder report |
| R&D Costs | Research & development spend | Founder report (subset of overheads, ~40%) |
| Sales & Marketing | Sales and marketing spend | Founder report (subset of overheads, ~35%) |
| General & Admin | G&A costs | Founder report (remaining overheads) |
| EBITDA | `Revenue - COGS - Overheads` | Calculated |
| EBITDA Margin % | `(EBITDA / Revenue) * 100` | Calculated |
| Cash Balance | Bank balance at month end | Founder report |
| Monthly Net Burn | `abs(EBITDA)` | Calculated |
| Cash Burn LTM | `abs(EBITDA) * 12` | Calculated (annualised) |
| ARR | Annual recurring revenue | `Monthly recurring revenue * 12` |
| Runway | Months of cash remaining | `Cash Balance / Monthly Net Burn` |
| Headcount FTE | Full-time equivalent employees | Founder report |
| Headcount Male/Female | Gender breakdown | Founder report (DEI data) |
| Headcount Ethnic Minority | Ethnic diversity | Founder report (DEI data) |
| Board Male/Female/Ethnic Minority | Board diversity | Founder report (DEI data) |

**Charts:** Each chart plots the last 12 months of data as a line/bar chart with the previous year overlaid for comparison.

---

### 5. BOARD PREP

#### How the Brief is Generated

The board prep brief is **auto-assembled** from multiple data sources:

**Step 1: Pull latest data**
- Current metrics from the company's latest monthly financials
- Flags from the alert engine
- Notes from the WorkflowContext
- Documents from Dropbox (latest board deck, investor update)
- Meeting notes from Granola (recent founder calls)

**Step 2: Calculate changes since last board**
The system compares current metrics to metrics at the time of the previous board meeting:
- MRR change: `currentMRR - mrrAtLastBoard` (shown as delta with % change)
- Runway change: `currentRunway - runwayAtLastBoard` (e.g., "19mo → 16mo")
- Customer change: `currentCustomers - customersAtLastBoard` (e.g., "28 → 32")
- Headcount change: `currentHeadcount - headcountAtLastBoard`
- Burn rate change: compared as QoQ percentage

**Step 3: Generate discussion points**
Based on the metric changes, the system generates contextual questions:
- If burn increased: *"Burn rate increased 8% QoQ, driven by new hires - is this planned investment or drift?"*
- If growth is strong: *"MRR growth is strong at 18% - what's the pipeline for next quarter?"*
- If runway is short: *"Runway at 9 months - what's the fundraising timeline?"*
- If customers grew: *"Customers at 32 - any churn concerns or expansion deals in progress?"*

**Step 4: Attach source documents**
Lists the documents that were used to generate the brief:
- Board deck (from Dropbox, with upload date)
- Monthly update email (from Gmail, with date)
- Call notes (from Granola, with date)

The brief is shown as collapsible sections. User can share it with the team or export as PDF.

---

### 6. PORTFOLIO REVIEW

#### Monthly Internal Review

**Who does it:** The full investment team (Anna, Scott, Krishna, James) during their regular team meeting (configured in Settings > Portfolio Config as a specific day of the week).

**How it works:**
1. Companies are presented one at a time, sorted by priority (At Risk first, then by flag count)
2. For each company, the assigned owner presents: current status, any flags, recent changes
3. The team discusses and the owner updates: RAG status (via dropdown), Summary, Key Concerns, Action Points
4. Owner clicks "Mark Complete" to move to the next company, or "Skip" to defer
5. Progress bar shows: "8 of 12 companies reviewed"
6. Skipped companies can be revisited

**What gets saved:** RAG status, commentary text, and review completion status - all persisted to localStorage.

#### Quarterly LP Report (6-Step Workflow)

**Who does each step:**

| Step | Who | What They Do | Time |
|------|-----|-------------|------|
| **1. Auto-Extract** | System | Pulls metrics from Dropbox, Gmail, Granola. Team reviews extraction quality. | Automatic (team reviews ~15 min) |
| **2. Founder Validation** | Founders | Receive pre-filled forms, confirm/edit data, flag missing items. | 2-5 min per founder (async, usually 1-2 weeks) |
| **3. Team Commentary** | Investment team | Each company owner writes: RAG assessment, summary, recent progress, key concerns, action points, fundraising status. | 5-10 min per company |
| **4. Manager's Commentary** | GP (senior partner) | Writes the fund-level narrative for the LP report opening section. | 30-60 min |
| **5. GP Approval** | GP | Reviews everything, approves for distribution. | 15-30 min |
| **6. Generate Report** | System | Produces LP Report PDF and Asset Metrix XLSX. | Automatic |

**Step 1 detail - Auto-Extract:**
- System scans all connected sources for each company
- Extracts: Revenue, ARR, headcount, cash balance, burn rate, and other financial metrics
- Reports confidence per company: "14 of 14 fields extracted, High confidence"
- Lists sources used: "Board deck + email" or "Email only" or "Manual entry required"
- Fields that couldn't be extracted are flagged for manual entry

**Step 2 detail - Founder Validation:**
- System generates a lightweight form per company, pre-filled with the auto-extracted data
- Form includes all Gigs Performance Data Template fields: Revenue, COGS, R&D costs, Sales & Marketing, G&A, EBITDA, Cash Balance, ARR, Bookings, Customer Count, Net Retention Rate, Headcount (Male/Female/Ethnic Minority), Board (Male/Female/Ethnic Minority)
- Founder reviews, edits any incorrect values, and submits
- Status tracked per company: Pending / Sent / Confirmed / Flagged

**Step 3 detail - Team Commentary:**
- Per-company card showing all current metrics for reference
- Input fields: RAG Status (dropdown with color preview), Summary (textarea), Recent Progress (textarea), Key Concerns (textarea), Action Points (textarea)
- Plus: Equity Fundraising Status, Debt Fundraising Status, Burn Reduction Actions, Near-Term Exit

**Step 6 detail - Generate Report:**
Three exports available:
- **LP Report PDF**: Opens a full print-ready preview matching the current Crane I Manager's Report format. Includes: cover page, fund standing data, manager's commentary with NAV waterfall and TVPI charts, portfolio overview table, per-company snapshots with RAG history and metrics, company data pages with diversity stats, exited companies section, geographic distribution.
- **Asset Metrix XLSX**: Multi-sheet Excel file with 3 tabs matching the fund admin's template: Company Commentary (qualitative), Company Static (reference data), Company Periodic (financial KPIs). Each sheet has metadata header rows (technical field names, data types) followed by data rows.
- **Fund Summary CSV**: TVPI history, NAV waterfall, uses of funds, geographic distribution.

---

### 7. INTELLIGENCE HUB

#### Where the Data Comes From

**Sector Dashboards:** Aggregated from Specter signals and Crunchbase data. Funding activity = sum of announced rounds in the sector over last 90 days. Deal count = number of funding events. Avg deal size = total funding / deal count. Hiring trend = percentage change in job postings (from Specter web scraping).

**Competitor Graph:** Each bubble represents a company (portfolio or competitor). X-axis (Funding) from Crunchbase. Y-axis (Headcount) from LinkedIn/Specter. Bubble size (Web Traffic) from Specter/SimilarWeb. Blue bubbles = Crane portfolio companies. Gray bubbles = competitors and market comparables.

**Signal Feed:** Real-time events from Specter (company signals), news APIs, Crunchbase (funding announcements), and LinkedIn (hiring activity). Each signal has a source badge, relevance score (High/Medium/Low based on portfolio relevance), and sector tag.

**Specter Integration:** Shows the mapping between portfolio companies and their Specter profiles. When a company is "Matched", Crane receives continuous signals about that company. "Unmatched" companies need their domain configured in Specter settings.

---

### 8. SEARCH & DISCOVERY

#### How Search Works

The search engine indexes all data across the platform:
- Company records (name, description, sector, stage, management team)
- Financial metrics (ARR, revenue, runway values)
- Documents (titles, content from OCR/text extraction)
- Activity events (notes, meeting summaries, flag descriptions)
- Flags and alerts (headlines, explanations)

**Saved searches** are pre-configured filters that translate to structured queries:
- "Runway < 6 months" → filters companies where `runway < 6`
- "Revenue growth > 15%" → filters companies where `arrGrowth > 15`
- "No update 30+ days" → filters companies where `daysSinceLastUpdate > 30`
- "High Potential + At Risk" → filters companies where `upside === 'High Potential' && health === 'At Risk'`

Results are grouped by type (Companies, Documents, Activity) and ranked by relevance.

---

### 9. SETTINGS

#### Alert Rules Configuration

Each rule has a threshold that can be adjusted:

| Rule | Default Threshold | Adjustable | Impact |
|------|------------------|------------|--------|
| Runway Alert | < 6 months | Yes (can change to 9 or 12) | Triggers flag on Dashboard, company pages |
| Burn Acceleration | > 20% QoQ increase | Yes | Triggers flag when burn rate jumps |
| Growth Inflection | > 15% MoM for 2+ months | Yes | Positive flag - growth acceleration |
| Engagement Gap | > 30 days no interaction | Yes | Flags companies being neglected |
| Board Coming Up | < 14 days | Yes | Reminder flag for board prep |
| Key Departure | Any C-suite/VP | Toggle on/off | High urgency flag |
| Fundraising Signal | Any detected signal | Toggle on/off | Medium urgency flag |
| Market Signal | High relevance only | Toggle on/off | Low urgency flag |
| Pivot Signal | Any detection | Toggle on/off | Medium urgency flag |

Disabling a rule stops new flags of that type from being generated. Existing flags remain until resolved.

#### Gigs Field Mapping

Maps each field from the Gigs Performance Data Template to the system. This controls:
- Which fields appear in the Founder Validation form (Step 2)
- Which fields are auto-extracted (Step 1)
- Which fields appear in the Company Detail Metrics tab
- Which fields are included in the Asset Metrix XLSX export

Each field has: name, data type (Currency/Percentage/Integer/Enum), reporting frequency (Monthly/Quarterly), active toggle, and a "Pre-Revenue" flag (whether to show this field for pre-revenue companies).

---

## State Persistence Model

| Data Type | Storage | Lifetime |
|-----------|---------|----------|
| Company data (metrics, financials) | Mock data layer (regenerated on reload) | Session |
| Fund data (TVPI, NAV, DPI) | Mock data layer | Session |
| Flags/Alerts | Mock data layer + dismissal state in localStorage | Dismissals persist across sessions |
| Todos | localStorage (`crane_workflow_state_v1`) | Persists across sessions |
| Notes | localStorage | Persists across sessions |
| Review progress | localStorage | Persists across sessions |
| Activity feed | Mock data + localStorage events | Session base + persistent additions |

**Reset:** Settings > Demo Controls > "Reset All Data" clears localStorage and returns everything to the demo default state.

---

## Export Formats Explained

### Asset Metrix XLSX (Multi-Sheet)

Generated from the Portfolio Review (Step 6) or Command Center Export button. Contains 3 sheets matching the fund administrator's ingestion template:

**Sheet 1: Company Commentary**
| Column | Source | Example |
|--------|--------|---------|
| Company ID | System-generated | "arcline-001" |
| Company Name | Company record | "Arcline" |
| Reporting Date | Quarter-end date | "2026-03-31" |
| Year | Derived from date | 2026 |
| Quarter No | Derived from date | 1 |
| RAG | Team assessment | "Green" |
| Cash Runway | Calculated | "16 months" |
| Summary | Team input (Step 3) | "Strong enterprise traction..." |
| Recent Progress | Team input (Step 3) | "4 new logos in Q1..." |
| Key Concerns | Team input (Step 3) | "1. CAC increasing..." |
| Action Points | Team input (Step 3) | "1. Connect founders with..." |

**Sheet 2: Company Static**
| Column | Source |
|--------|--------|
| Company ID | System |
| Company Name | Company record |
| Location of Head Office | Company record |
| Industry | Company record (sector) |
| Website | Company record |
| Management team | Company record |
| Crane Lead Partner | Assigned owner |
| Company Description | Company record |

**Sheet 3: Company Periodic**
Contains 31 columns of financial and operational KPIs per company per quarter. All values from the latest monthly financials snapshot at quarter-end.

### LP Report PDF

Generated via browser print (Ctrl+P / Cmd+P) from the LP Report Preview component. Matches the current Crane I Manager's Report structure with:
- Cover page with fund branding
- Fund standing data table
- Manager's commentary (GP-written narrative)
- NAV waterfall bar chart
- TVPI/DPI trend line chart
- Portfolio overview table (all companies with key metrics)
- Per-company snapshots (RAG, summary, concerns, actions)
- Per-company data pages (financial charts, diversity metrics)
- Geographic distribution pie chart

---

## Demo Script (Updated with "How")

1. **Dashboard** - "Anna opens Crane each morning. The system has already scanned overnight data from 8 connected sources - Attio CRM, Dropbox, Gmail, Granola meeting notes, Specter signals, and fund accounting. It found 7 things that need her attention based on configurable threshold rules."

2. **Critical Alert** - "This Burn Acceleration alert triggered because Vaultik's monthly burn increased 40% quarter-over-quarter, crossing the 20% threshold configured in Settings. The system suggests scheduling a founder check-in."

3. **Take Action** - "Anna converts this to a To-Do. The system creates a task with the suggested action as the title, sets it due in 7 days, and marks the alert as actioned. The todo appears in her list immediately."

4. **Command Center** - "This is the full portfolio view. Cost basis and carrying values come from the fund administrator's quarterly valuation. MoIC is simply carrying value divided by cost. Revenue, cash, and burn come from founder-reported monthly data."

5. **Action Matrix** - "Every company sits in this grid based on two team assessments: Health Status (how are they performing right now?) and Upside Potential (how big could this be?). The intersection determines the action. Arcline is On Track + High Potential = Lean In. We spend the most time here. Pulsetrack is Underperforming + Limited Potential = De-prioritise."

6. **Company Detail** - "Everything about Arcline in one place. The RAG history dots show this company has been Green for 4 straight quarters - consistent performer. Metrics come from their monthly founder reports. The team's qualitative assessment - summary, concerns, action points - was written during the last quarterly review."

7. **Board Prep** - "The system knows Vaultik's board is March 22 because it's tracked in Attio. It auto-generated this brief by comparing current metrics to the last board date, pulling changes from Dropbox documents and Gmail updates, and generating discussion questions based on what changed."

8. **Portfolio Review** - "This is the quarterly workflow. Step 1: system auto-extracts metrics from connected sources. Step 2: founders confirm their numbers via lightweight forms (replacing the Gigs Excel plugin). Step 3: each team member writes commentary for their companies. Step 4: the GP writes the fund-level narrative. Step 5: GP approves. Step 6: system generates the LP Report PDF and Asset Metrix XLSX - both matching current formats exactly."

9. **Settings** - "All alert thresholds are configurable. Right now, Runway Alert triggers at 6 months - the team could change this to 9 months if they want earlier warning. Each data source shows its connection status and sync frequency. The Gigs Field Mapping tab controls exactly which financial fields are collected from founders."
