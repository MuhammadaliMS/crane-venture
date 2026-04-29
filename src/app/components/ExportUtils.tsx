// Export utilities for LP Report PDF and Asset Metrix XLSX
import * as XLSX from 'xlsx';
import { type Company, type FundEntity, type MonthlyFinancials } from './mock-data';

// ========================================
// ASSET METRIX XLSX EXPORT (Multi-sheet)
// ========================================
// Matches the Crane Template Structure from Asset Metrix:
//   Sheet 1: Company Commentary (periodic qualitative data)
//   Sheet 2: Company Static (static company info)
//   Sheet 3: Company Periodic (KPIs, financials, headcount)
//
// Each sheet has 6 header rows:
//   Row 0: Technical field names
//   Row 1: Data types
//   Rows 2-4: Empty (reserved)
//   Row 5: Friendly display names
//   Row 6+: Data

function formatReportingDate(dateStr: string): string {
  // Convert month string like "2026-01" or ISO date to YYYY-MM-DD quarter-end
  if (!dateStr) return '';
  if (dateStr.length === 7) {
    // "2026-01" → find quarter end
    const [y, m] = dateStr.split('-').map(Number);
    const qEnd = Math.ceil(m / 3) * 3;
    const lastDay = new Date(y, qEnd, 0).getDate();
    return `${y}-${String(qEnd).padStart(2, '0')}-${lastDay}`;
  }
  return dateStr;
}

function getQuarterFromMonth(month: string): number {
  const m = parseInt(month.split('-')[1], 10);
  return Math.ceil(m / 3);
}

function getYearFromMonth(month: string): number {
  return parseInt(month.split('-')[0], 10);
}

// ---------------------
// Sheet: Company Commentary
// ---------------------
function buildCommentarySheet(companies: Company[], reportingDate: string): XLSX.WorkSheet {
  const techNames = [
    'efront_id', 'company_name', 'reporting_item_value_date',
    'year', 'quarter', 'rag', 'cash_runway',
    'summary', 'recent_progress', 'key_concerns', 'action_points',
  ];
  const dataTypes = [
    '', 'string', 'date',
    'integer', 'integer', 'string', 'string',
    'string', 'string', 'string', 'string',
  ];
  const friendlyNames = [
    'Company ID', 'Company Name', 'Reporting Date',
    'Year', 'Quarter No', 'RAG', 'Cash Runway',
    'Summary', 'Recent Progress', 'Key Concerns', 'Action Points',
  ];

  const rows: (string | number | null)[][] = [];
  rows.push(techNames);
  rows.push(dataTypes);
  rows.push(new Array(techNames.length).fill(null)); // row 2
  rows.push(new Array(techNames.length).fill(null)); // row 3
  rows.push(new Array(techNames.length).fill(null)); // row 4
  rows.push(friendlyNames);

  const quarter = getQuarterFromMonth(reportingDate || '2026-03');
  const year = getYearFromMonth(reportingDate || '2026-03');

  for (const c of companies) {
    rows.push([
      c.id,
      c.name,
      formatReportingDate(reportingDate || '2026-03'),
      year,
      quarter,
      c.rag,
      `${c.runway} months`,
      c.summary,
      c.recentProgress,
      c.keyConcerns.join('\n'),
      c.actionPoints.join('\n'),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 14 },
    { wch: 6 }, { wch: 10 }, { wch: 8 }, { wch: 14 },
    { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 60 },
  ];
  return ws;
}

// ---------------------
// Sheet: Company Static
// ---------------------
function buildStaticSheet(companies: Company[]): XLSX.WorkSheet {
  const techNames = [
    'company_efront_id', 'company_name', 'head_office',
    'industry', 'website', 'management_team',
    'lead_partner', 'company_description',
  ];
  const dataTypes = [
    'str', 'str', 'str',
    'str', 'str', 'str',
    'str', 'str',
  ];
  const friendlyNames = [
    'Company ID', 'Company Name', 'Location of Head Office',
    'Industry', 'Website', 'Management team',
    'Crane Lead Partner', 'Company Description',
  ];

  const rows: (string | null)[][] = [];
  rows.push(techNames);
  rows.push(dataTypes);
  rows.push(new Array(techNames.length).fill(null));
  rows.push(new Array(techNames.length).fill(null));
  rows.push(new Array(techNames.length).fill(null));
  rows.push(friendlyNames);

  for (const c of companies) {
    rows.push([
      c.id,
      c.name,
      c.location,
      c.sector,
      c.website,
      c.managementTeam,
      c.owners.join(', '),
      c.description,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 22 },
    { wch: 20 }, { wch: 24 }, { wch: 36 },
    { wch: 18 }, { wch: 50 },
  ];
  return ws;
}

// ---------------------
// Sheet: Company Periodic
// ---------------------
function buildPeriodicSheet(companies: Company[], reportingDate: string): XLSX.WorkSheet {
  // Reduced to 9 core metrics matching the founder form (Bonnie's confirmed list)
  const techNames = [
    'efront_id', 'company_name', 'reporting_item_value_date',
    'revenue', 'arr',
    'gross_margin', 'ebitda',
    'cash_balance', 'cash_burn',
    'headcount_male', 'headcount_female', 'headcount_ethnic_minority',
  ];
  const dataTypes = [
    '', 'string', 'date',
    'float', 'float',
    'float', 'float',
    'float', 'float',
    'integer', 'integer', 'integer',
  ];
  const friendlyNames = [
    'Company ID', 'Company Name', 'Reporting Date',
    'Revenue (core)', 'ARR',
    'Gross Margin %', 'EBITDA',
    'Cash Balance', 'Cash Burn (excl. funding)',
    'Headcount Male', 'Headcount Female', 'Headcount Ethnic Minority',
  ];

  const rows: (string | number | null)[][] = [];
  rows.push(techNames);
  rows.push(dataTypes);
  rows.push(new Array(techNames.length).fill(null));
  rows.push(new Array(techNames.length).fill(null));
  rows.push(new Array(techNames.length).fill(null));
  rows.push(friendlyNames);

  for (const c of companies) {
    const quarterlyFinancials = getQuarterlySnapshots(c.monthlyFinancials, reportingDate);

    for (const f of quarterlyFinancials) {
      // Cash burn must be negative per Bonnie's note
      const cashBurnSigned = f.monthlyNetBurn != null
        ? -Math.abs(f.monthlyNetBurn)
        : null;

      rows.push([
        c.id,
        c.name,
        formatReportingDate(f.month),
        f.revenue ?? null,
        f.arr ?? null,
        f.grossMargin ?? null,
        f.ebitda ?? null,
        f.cashBalance ?? null,
        cashBurnSigned,
        f.headcountMale ?? null,
        f.headcountFemale ?? null,
        f.headcountEthnicMinority ?? null,
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = techNames.map((_, i) => ({
    wch: i <= 2 ? (i === 2 ? 14 : 12) : 18,
  }));
  return ws;
}

// Get quarter-end snapshots from monthly data
function getQuarterlySnapshots(
  financials: MonthlyFinancials[],
  reportingDate: string,
): MonthlyFinancials[] {
  if (financials.length === 0) return [];

  // Group by quarter, take the last month of each quarter
  const quarterMap = new Map<string, MonthlyFinancials>();
  for (const f of financials) {
    const y = getYearFromMonth(f.month);
    const q = getQuarterFromMonth(f.month);
    const key = `${y}-Q${q}`;
    quarterMap.set(key, f); // last month wins
  }

  // Return sorted by date, most recent first (up to 4 quarters)
  return Array.from(quarterMap.values())
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 4)
    .reverse();
}

// ========================================
// MAIN EXPORT: Generate Asset Metrix XLSX
// ========================================

export function generateAssetMetrixXLSX(
  fund: FundEntity,
  companies: Company[],
  reportingDate?: string,
): void {
  const fundCompanies = companies.filter(c => c.fund === fund.name);
  const repDate = reportingDate || '2026-03';

  const wb = XLSX.utils.book_new();

  const commentaryWs = buildCommentarySheet(fundCompanies, repDate);
  XLSX.utils.book_append_sheet(wb, commentaryWs, 'Company Commentary');

  const staticWs = buildStaticSheet(fundCompanies);
  XLSX.utils.book_append_sheet(wb, staticWs, 'Company Static');

  const periodicWs = buildPeriodicSheet(fundCompanies, repDate);
  XLSX.utils.book_append_sheet(wb, periodicWs, 'Company Periodic');

  const filename = `Crane_AssetMetrix_${fund.name.replace(/\s+/g, '_')}_${repDate}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Keep CSV version as a fallback
export function generateAssetMetrixCSV(fund: FundEntity, companies: Company[]): string {
  const fundCompanies = companies.filter(c => c.fund === fund.name);

  const rows = fundCompanies.map(c => {
    const f = c.monthlyFinancials.length > 0
      ? c.monthlyFinancials[c.monthlyFinancials.length - 1]
      : null;

    return {
      'Company Name': c.name,
      'Reporting Date': formatReportingDate(f?.month || ''),
      'Revenue': f?.revenue ?? '',
      'EBITDA': f?.ebitda ?? '',
      'COGS': f?.cogs ?? '',
      'Cash Balance': f?.cashBalance ?? '',
      'Monthly Net Burn': f?.monthlyNetBurn ?? '',
      'ARR': f?.arr ?? c.mrr * 12,
      'Headcount FTE': f?.headcountFTE ?? c.headcount,
      'Headcount Male': f?.headcountMale ?? '',
      'Headcount Female': f?.headcountFemale ?? '',
      'RAG': c.rag,
      'Health Status': c.health,
    };
  });

  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = (row as Record<string, unknown>)[h];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ];
  return csvLines.join('\n');
}

// ========================================
// GIGS PERFORMANCE DATA CSV EXPORT
// ========================================

export function generateGigsCSV(company: Company): string {
  if (company.monthlyFinancials.length === 0) return '';

  const lines: string[] = [];
  const headers = [
    'Investment Ref', 'Category 1', 'Category 2', 'Currency', 'Financial Indicator',
    ...company.monthlyFinancials.map(f => f.month),
  ];
  lines.push(headers.map(h => `"${h}"`).join(','));

  const addRow = (cat1: string, cat2: string, isFinancial: boolean, getter: (f: MonthlyFinancials) => number | undefined) => {
    const values = company.monthlyFinancials.map(f => getter(f) ?? '');
    lines.push([
      `"${company.name}"`, `"${cat1}"`, `"${cat2}"`, `"${company.currency}"`,
      `"${isFinancial ? 'Yes' : 'No'}"`,
      ...values.map(v => `"${v}"`),
    ].join(','));
  };

  addRow('Revenue', 'Revenue - core', true, f => f.revenue);
  addRow('Revenue', 'Revenue - other', true, f => f.revenueOther ?? 0);
  addRow('Costs', 'Cost of Sales', true, f => f.cogs ? -Math.abs(f.cogs) : undefined);
  addRow('Costs', 'R&D costs', true, f => f.rdCosts ? -Math.abs(f.rdCosts) : undefined);
  addRow('Costs', 'Sales and Marketing', true, f => f.salesMarketingCosts ? -Math.abs(f.salesMarketingCosts) : undefined);
  addRow('Costs', 'General and Admin', true, f => f.generalAdminCosts ? -Math.abs(f.generalAdminCosts) : undefined);
  addRow('EBITDA or LBITDA', 'EBITDA or LBITDA', true, f => f.ebitda);
  addRow('Month End Cash', 'Cash', true, f => f.cashBalance);
  addRow('Annual recurring revenue', 'ARR', true, f => f.arr);
  addRow('Bookings', 'Bookings', true, f => f.bookings);
  addRow('No. of customers', 'No. of customers', false, f => f.customerCount);
  addRow('Net retention rate', 'Net retention rate', false, f => f.netRetentionRate);
  addRow('Cash burn', 'Cash burn in the month', true, f => f.monthlyNetBurn ? -Math.abs(f.monthlyNetBurn) : undefined);
  addRow('Headcount', 'Headcount - male (FTE)', false, f => f.headcountMale);
  addRow('Headcount', 'Headcount - female (FTE)', false, f => f.headcountFemale);
  addRow('Headcount', 'Headcount - ethnic minority (FTE)', false, f => f.headcountEthnicMinority);
  addRow('Headcount', 'Board headcount - male', false, f => f.boardMale);
  addRow('Headcount', 'Board headcount - female', false, f => f.boardFemale);
  addRow('Headcount', 'Board headcount - ethnic minority', false, f => f.boardEthnicMinority);

  return lines.join('\n');
}

// ========================================
// FUND SUMMARY CSV (for internal use)
// ========================================

export function generateFundSummaryCSV(fund: FundEntity): string {
  const lines: string[] = [];

  lines.push('"Fund Standing Data"');
  lines.push(`"Fund Name","${fund.name}"`);
  lines.push(`"Currency","${fund.currency}"`);
  lines.push(`"Vintage","${fund.vintage}"`);
  lines.push(`"Total Committed","${fund.totalCommitted}"`);
  lines.push(`"Deployed","${fund.deployed}"`);
  lines.push(`"Deployed %","${fund.deployedPct}%"`);
  lines.push(`"Available","${fund.availableForDeployment}"`);
  lines.push(`"TVPI Net","${fund.tvpiNet}x"`);
  lines.push(`"TVPI Gross","${fund.tvpiGross}x"`);
  lines.push(`"DPI","${fund.dpi}x"`);
  lines.push(`"NAV Current","${fund.navCurrent}"`);
  lines.push(`"NAV Prior","${fund.navPrior}"`);
  lines.push('');

  lines.push('"TVPI History"');
  lines.push('"Quarter","TVPI Fund","DPI","TVPI Net"');
  fund.tvpiHistory.forEach(h => {
    lines.push(`"${h.quarter}","${h.tvpiFund}","${h.dpi}","${h.tvpiNet}"`);
  });
  lines.push('');

  lines.push('"NAV Waterfall"');
  lines.push('"Item","Amount"');
  fund.navWaterfall.forEach(w => {
    lines.push(`"${w.label}","${w.value}"`);
  });
  lines.push('');

  lines.push('"Uses of Funds"');
  lines.push('"Category","Amount"');
  fund.usesOfFunds.forEach(u => {
    lines.push(`"${u.category}","${u.amount}"`);
  });
  lines.push('');

  lines.push('"Geographic Distribution"');
  lines.push('"Region","Percentage","Amount"');
  fund.geographicDistribution.forEach(g => {
    lines.push(`"${g.region}","${g.pct}%","${g.amount}"`);
  });

  return lines.join('\n');
}

// ========================================
// DOWNLOAD HELPERS
// ========================================

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
