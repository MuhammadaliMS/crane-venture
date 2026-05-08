import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Play, SkipForward, Check, ChevronRight, Download, Clock, Send, FileText,
  Upload, Users, Sparkles, CheckCircle, AlertCircle, Printer, Plus, Calendar,
  ChevronDown, ArrowRight, Save, Pencil, Info,
} from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import { companies, funds, flags, formatCurrency, getHealthColor, getRAGColor, getActionColor, teamMembers, type RAGStatus } from './mock-data';
import { FlagIcon } from './FlagIcon';
import { generateAssetMetrixXLSX, generateFundSummaryCSV, downloadCSV } from './ExportUtils';
import LPReportPreview from './LPReportPreview';
import { useFundFilter, useMilestone } from './Layout';
import { aggregateQuarter, quarterDateRange, getCompanyFyEndMonth, monthIndexToName } from './quarterlyAggregation';
import { validateFieldValue, type FieldKey } from './fieldValidation';

// ── Shared data ───────────────────────────────────────────────────────
const activeCompanies = companies.filter(c => c.lifecycle === 'Active — Core');
const sortedCompanies = [...activeCompanies].sort((a, b) => {
  const order: Record<string, number> = { 'Lean In': 0, 'Lean In / Anticipate': 1, 'Watch': 2, 'De-prioritise': 3 };
  return (order[a.action] || 0) - (order[b.action] || 0);
});

// ── Mock review history ───────────────────────────────────────────────
type ReviewRecord = {
  id: string;
  date: string;
  month?: string;          // e.g. "March 2026"
  quarter?: string;        // e.g. "Q1 2026"
  type: 'Monthly' | 'Quarterly LP';
  companies: number;
  changes: number;
  status: 'Complete' | 'In Progress' | 'Draft';
  completedBy: string;
  duration: string;
  companiesReviewed: string[];
  ragChanges: { company: string; from: RAGStatus; to: RAGStatus }[];
  metricMovements: { company: string; metric: string; from: string; to: string; direction: 'up' | 'down' }[];
  flagsRaised: { company: string; flag: string; urgency: 'high' | 'medium' | 'low' }[];
  flagsResolved: { company: string; flag: string }[];
  actionsCreated: { company: string; action: string; assignee: string }[];
  commentary: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  exported?: boolean;
  companyReviews?: {
    company: string;
    comment: string;
    sendStatus: 'Sent' | 'Not Sent' | 'Draft';
    recentProgress: string;
    summary: string;
    keyConcerns: string;
    actionPoints: string;
    inductionAction: string;
  }[];
};

type MonthlyReviewRecord = {
  id: string;
  date: string;
  month: string;
  status: 'Complete' | 'In Progress';
  completedBy: string;
  lastEditedBy: string;
  lastEditedAt: string;
  companyComments: { company: string; comment: string }[];
};

const monthlyReviewsHistory: MonthlyReviewRecord[] = [
  {
    id: 'mr-2026-03', date: 'Mar 10, 2026', month: 'March 2026', status: 'Complete', completedBy: 'Anna, Marcus', lastEditedBy: 'Marcus', lastEditedAt: 'Mar 10, 2026 4:32 PM',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Strong enterprise pipeline building. Two new logos signed this month. Sales cycle shortening.' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'ARR growth continues. Expansion revenue from existing customers driving numbers. Need to watch churn in SMB segment.' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'Burn rate increased due to new hires. Product roadmap on track. Series A prep underway.' },
      { company: sortedCompanies[3]?.name || 'Co', comment: 'Growth slowing — MRR flat for second month. Founder aware, pivoting GTM strategy.' },
      { company: sortedCompanies[4]?.name || 'Co', comment: 'Runway getting tight. Need to discuss bridge options. Product-market fit still strong.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Post-bridge, team is executing well. New VP Eng started. Rebuilding velocity.' },
    ],
  },
  {
    id: 'mr-2026-02', date: 'Feb 10, 2026', month: 'February 2026', status: 'Complete', completedBy: 'Anna, Sarah', lastEditedBy: 'Sarah', lastEditedAt: 'Feb 10, 2026 3:15 PM',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Good month. Closed a key healthcare customer. Pipeline healthy.' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'Q4 numbers came in strong. Board meeting went well. Planning international expansion.' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'Stable. Hiring plan on track. No concerns.' },
      { company: sortedCompanies[3]?.name || 'Co', comment: 'First signs of slower growth. Will monitor closely next month.' },
      { company: sortedCompanies[4]?.name || 'Co', comment: 'Product launch went well. Early usage metrics positive.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Bridge round closed. Runway extended to 14 months. Relief all round.' },
      { company: sortedCompanies[6]?.name || 'Co', comment: 'Quiet month. Founder focused on hiring CTO replacement.' },
      { company: sortedCompanies[7]?.name || 'Co', comment: 'Revenue ticking up. New channel partnership showing early traction.' },
    ],
  },
  {
    id: 'mr-2026-01', date: 'Jan 10, 2026', month: 'January 2026', status: 'Complete', completedBy: 'Anna', lastEditedBy: 'Anna', lastEditedAt: 'Jan 10, 2026 5:00 PM',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Post-holiday ramp. Team back and focused. Q1 targets set.' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'Burn crept up in December. Watching this month.' },
      { company: sortedCompanies[4]?.name || 'Co', comment: 'Preparing for product launch in Feb. Beta feedback positive.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Bridge round in progress. Expect to close within 2 weeks.' },
      { company: sortedCompanies[8]?.name || 'Co', comment: 'Steady state. No issues flagged.' },
    ],
  },
  {
    id: 'mr-2025-12', date: 'Dec 8, 2025', month: 'December 2025', status: 'Complete', completedBy: 'Full team', lastEditedBy: 'Anna', lastEditedAt: 'Dec 8, 2025 6:10 PM',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Year-end close looking strong. ARR ahead of plan.' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'Solid Q4. Enterprise deals landing. Board happy.' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'New hire ramp increasing costs. Expected to level out in Q1.' },
      { company: sortedCompanies[3]?.name || 'Co', comment: 'Customer concentration risk flagged. Top 3 clients = 60% revenue.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Runway critical. Bridge round being coordinated. Syndicate lined up.' },
    ],
  },
  {
    id: 'mr-2025-11', date: 'Nov 10, 2025', month: 'November 2025', status: 'Complete', completedBy: 'Anna, Marcus', lastEditedBy: 'Marcus', lastEditedAt: 'Nov 10, 2025 4:45 PM',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Series A positioning underway. Warm intros to 3 funds.' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'Expansion into DACH market progressing. First LOI signed.' },
      { company: sortedCompanies[3]?.name || 'Co', comment: 'Founder call — discussed go-to-market shift. Cautiously optimistic.' },
      { company: sortedCompanies[4]?.name || 'Co', comment: 'Beta users growing. Conversion rate improving.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Runway dropping. Need to action bridge round next month.' },
      { company: sortedCompanies[6]?.name || 'Co', comment: 'CTO departure announced. Succession plan in motion.' },
      { company: sortedCompanies[7]?.name || 'Co', comment: 'Exploring new channel partnerships. Pipeline healthy.' },
    ],
  },
];

const quarterlyReviewsHistory: ReviewRecord[] = [
  {
    id: 'qr-2025-q4',
    date: 'Jan 15, 2026', quarter: 'Q4 2025', type: 'Quarterly LP', companies: 12, changes: 8, status: 'Complete',
    completedBy: 'Full team', duration: '2h 15min', lastEditedBy: 'Anna', lastEditedAt: 'Jan 15, 2026 5:20 PM', exported: true,
    companiesReviewed: sortedCompanies.map(c => c.name),
    ragChanges: [
      { company: sortedCompanies[0]?.name || 'Co', from: 'Green', to: 'Amber' },
      { company: sortedCompanies[5]?.name || 'Co', from: 'Red', to: 'Amber' },
    ],
    metricMovements: [
      { company: sortedCompanies[0]?.name || 'Co', metric: 'ARR', from: '£380K', to: '£480K', direction: 'up' },
      { company: sortedCompanies[5]?.name || 'Co', metric: 'Runway', from: '4mo', to: '14mo', direction: 'up' },
    ],
    flagsRaised: [
      { company: sortedCompanies[0]?.name || 'Co', flag: 'CAC increasing as market matures', urgency: 'medium' },
    ],
    flagsResolved: [
      { company: sortedCompanies[5]?.name || 'Co', flag: 'Runway extended after bridge round' },
    ],
    actionsCreated: [
      { company: sortedCompanies[0]?.name || 'Co', action: 'Review pricing strategy ahead of next board', assignee: 'Anna' },
      { company: sortedCompanies[5]?.name || 'Co', action: 'Support hiring of VP Engineering', assignee: 'Scott' },
    ],
    commentary: 'Q4 2025 quarterly review completed. Asset Metrix XLSX exported and uploaded. LP Report PDF generated. 8 RAG changes across portfolio — broadly positive trajectory.',
    companyReviews: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Strong quarter with key enterprise wins. Pricing strategy needs board review.', sendStatus: 'Sent', recentProgress: 'Closed 3 enterprise deals; ARR up 26% QoQ', summary: 'Excellent growth trajectory. Enterprise pipeline maturing well with shorter sales cycles.', keyConcerns: 'CAC rising as market matures. Need to watch unit economics closely next quarter.', actionPoints: 'Review pricing strategy ahead of next board. Prepare Series B materials.', inductionAction: 'N/A — existing portfolio company' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'Expansion revenue driving growth. SMB churn needs attention.', sendStatus: 'Sent', recentProgress: 'ARR grew from £1.1M to £1.4M. 15 new logos added.', summary: 'ARR growth continues above plan. Expansion revenue is the key driver.', keyConcerns: 'SMB segment churn elevated at 4.2% monthly. Must address or refocus upmarket.', actionPoints: 'Deep-dive on churn drivers with founder. Consider dedicated retention hire.', inductionAction: 'N/A — existing portfolio company' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'Burn increased with new hires but product roadmap on track.', sendStatus: 'Sent', recentProgress: 'Hired VP Eng and 3 engineers. Beta of v2 launched.', summary: 'Investing phase — burn up but justified by product acceleration.', keyConcerns: 'Runway now 10 months. Series A needed in next 2 quarters.', actionPoints: 'Intro to 3 Series A funds. Support pitch deck review.', inductionAction: 'Complete Series A readiness checklist' },
      { company: sortedCompanies[3]?.name || 'Co', comment: 'Growth slowing. Founder pivoting GTM strategy.', sendStatus: 'Draft', recentProgress: 'MRR flat for second consecutive month. New outbound channel launched.', summary: 'Stalling growth is concerning. Founder is responsive and pivoting approach.', keyConcerns: 'Two consecutive flat months. If Q1 doesn\'t recover, may need to reassess.', actionPoints: 'Monthly check-in cadence increased to fortnightly. GTM review session booked.', inductionAction: 'N/A — existing portfolio company' },
      { company: sortedCompanies[4]?.name || 'Co', comment: 'Solid performance. Green RAG maintained.', sendStatus: 'Sent', recentProgress: 'Signed first US customer. Revenue mix diversifying.', summary: 'Consistent performer. International expansion opens new growth vector.', keyConcerns: 'US go-to-market requires local presence — cost implications.', actionPoints: 'Connect with US-based advisors in network. Review expansion budget.', inductionAction: 'N/A — existing portfolio company' },
    ],
  },
  {
    id: 'qr-2025-q3',
    date: 'Oct 12, 2025', quarter: 'Q3 2025', type: 'Quarterly LP', companies: 11, changes: 5, status: 'Complete',
    completedBy: 'Full team', duration: '1h 50min', lastEditedBy: 'Marcus', lastEditedAt: 'Oct 12, 2025 3:45 PM', exported: true,
    companiesReviewed: sortedCompanies.slice(0, 11).map(c => c.name),
    ragChanges: [
      { company: sortedCompanies[3]?.name || 'Co', from: 'Green', to: 'Amber' },
    ],
    metricMovements: [
      { company: sortedCompanies[1]?.name || 'Co', metric: 'ARR', from: '£1.1M', to: '£1.4M', direction: 'up' },
    ],
    flagsRaised: [
      { company: sortedCompanies[5]?.name || 'Co', flag: 'Runway below 6 months — bridge required', urgency: 'high' },
    ],
    flagsResolved: [],
    actionsCreated: [
      { company: sortedCompanies[5]?.name || 'Co', action: 'Coordinate bridge round syndicate', assignee: 'Anna' },
    ],
    commentary: 'Q3 2025 complete. Nebula Data ARR surging. Pulsetrack runway critical — bridge round initiated.',
    companyReviews: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Good quarter. Pipeline building nicely.', sendStatus: 'Sent', recentProgress: 'Added 8 new pipeline opportunities. Win rate improving.', summary: 'Healthy progress on all fronts. Pipeline is strongest it has been.', keyConcerns: 'Sales team capacity — may need additional hire to convert pipeline.', actionPoints: 'Discuss hiring plan with founder at next board.', inductionAction: 'N/A — existing portfolio company' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'ARR milestone hit. Strong quarter.', sendStatus: 'Sent', recentProgress: 'Crossed £1M ARR milestone. Net revenue retention at 125%.', summary: 'Breakout quarter. Product-market fit clearly strengthening.', keyConcerns: 'Engineering bandwidth stretched. Technical debt accumulating.', actionPoints: 'Support eng hiring. Review tech debt backlog with CTO.', inductionAction: 'N/A — existing portfolio company' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Runway critical. Bridge round coordinated.', sendStatus: 'Sent', recentProgress: 'Secured bridge term sheet. Runway extended to 14 months.', summary: 'Crisis averted with bridge round. Now must demonstrate growth to justify Series A.', keyConcerns: 'Must show meaningful traction in next 2 quarters to raise Series A.', actionPoints: 'Coordinate bridge round syndicate. Monthly metrics review.', inductionAction: 'Post-bridge monitoring framework setup' },
    ],
  },
  {
    id: 'qr-2025-q2',
    date: 'Jul 8, 2025', quarter: 'Q2 2025', type: 'Quarterly LP', companies: 10, changes: 3, status: 'Complete',
    completedBy: 'Full team', duration: '1h 40min', lastEditedBy: 'Sarah', lastEditedAt: 'Jul 8, 2025 4:00 PM', exported: true,
    companiesReviewed: sortedCompanies.slice(0, 10).map(c => c.name),
    ragChanges: [
      { company: sortedCompanies[0]?.name || 'Co', from: 'Amber', to: 'Green' },
    ],
    metricMovements: [
      { company: sortedCompanies[0]?.name || 'Co', metric: 'MRR', from: '£25K', to: '£32K', direction: 'up' },
    ],
    flagsRaised: [],
    flagsResolved: [
      { company: sortedCompanies[0]?.name || 'Co', flag: 'Engagement gap resolved' },
    ],
    actionsCreated: [],
    commentary: 'Q2 2025 complete. Portfolio in steady state. Arcline upgraded to Green after strong enterprise wins.',
  },
  {
    id: 'qr-2025-q1',
    date: 'Apr 10, 2025', quarter: 'Q1 2025', type: 'Quarterly LP', companies: 10, changes: 6, status: 'Complete',
    completedBy: 'Full team', duration: '2h 05min', lastEditedBy: 'Anna', lastEditedAt: 'Apr 10, 2025 6:30 PM', exported: true,
    companiesReviewed: sortedCompanies.slice(0, 10).map(c => c.name),
    ragChanges: [
      { company: sortedCompanies[2]?.name || 'Co', from: 'Green', to: 'Amber' },
      { company: sortedCompanies[4]?.name || 'Co', from: 'Amber', to: 'Green' },
    ],
    metricMovements: [],
    flagsRaised: [],
    flagsResolved: [],
    actionsCreated: [],
    commentary: 'Q1 2025 quarterly review. 6 RAG changes. Two new companies onboarded.',
  },
];

// ── Shared expandable review detail ───────────────────────────────────
function ReviewDetailExpanded({ review, navigate }: { review: ReviewRecord; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="px-4 pb-4 pt-3 bg-muted/50 border-t border-border/60 space-y-4">
      {/* Summary line */}
      <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
        <span>By <span className="text-foreground font-medium">{review.completedBy}</span></span>
        <span>·</span>
        <span>Duration: {review.duration}</span>
        <span>·</span>
        <span>{review.companiesReviewed.length} companies reviewed</span>
        {review.exported && (
          <>
            <span>·</span>
            <span className="text-muted-foreground flex items-center gap-1"><Download className="w-3 h-3" /> Exported</span>
          </>
        )}
      </div>

      {/* Commentary */}
      {review.commentary && (
        <div className="bg-white rounded-lg border border-border/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-1">Review Summary</p>
          <p className="text-[12px] leading-relaxed text-foreground/80">{review.commentary}</p>
        </div>
      )}

      {/* Two-column: RAG Changes + Metric Movements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-border/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">RAG Status Changes</p>
          {review.ragChanges.length > 0 ? (
            <div className="space-y-1.5">
              {review.ragChanges.map((rc, j) => (
                <div key={j} className="flex items-center gap-2 text-[12px]">
                  <span className="text-foreground font-medium min-w-[80px]">{rc.company}</span>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getRAGColor(rc.from) }} />
                  <span className="text-muted-foreground/70">→</span>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getRAGColor(rc.to) }} />
                  <span className="text-[11px] text-muted-foreground/70">{rc.from} → {rc.to}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/70">No RAG changes this review</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-border/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">Key Metric Movements</p>
          {review.metricMovements.length > 0 ? (
            <div className="space-y-1.5">
              {review.metricMovements.map((mm, j) => (
                <div key={j} className="flex items-center gap-2 text-[12px]">
                  <span className="text-foreground font-medium min-w-[80px]">{mm.company}</span>
                  <span className="text-muted-foreground">{mm.metric}:</span>
                  <span className="font-mono-num text-muted-foreground">{mm.from}</span>
                  <span className="text-muted-foreground/70">→</span>
                  <span className={`font-mono-num font-medium ${mm.direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>{mm.to}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/70">No significant metric movements</p>
          )}
        </div>
      </div>

      {/* Two-column: Flags + Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-border/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">Flags</p>
          <div className="space-y-1.5">
            {review.flagsRaised.map((f, j) => (
              <div key={`r-${j}`} className="flex items-start gap-2 text-[12px]">
                <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${f.urgency === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <span className="text-foreground/80"><span className="font-medium text-foreground">{f.company}:</span> {f.flag}</span>
              </div>
            ))}
            {review.flagsResolved.map((f, j) => (
              <div key={`v-${j}`} className="flex items-start gap-2 text-[12px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground"><span className="font-medium text-foreground/80">{f.company}:</span> {f.flag}</span>
              </div>
            ))}
            {review.flagsRaised.length === 0 && review.flagsResolved.length === 0 && (
              <p className="text-[11px] text-muted-foreground/70">No flag activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">Actions Created</p>
          {review.actionsCreated.length > 0 ? (
            <div className="space-y-1.5">
              {review.actionsCreated.map((a, j) => (
                <div key={j} className="flex items-start gap-2 text-[12px]">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80"><span className="font-medium text-foreground">{a.company}:</span> {a.action} <span className="text-muted-foreground/70">→ {a.assignee}</span></span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground/70">No actions created</p>
          )}
        </div>
      </div>

      {/* Per-company review details */}
      {review.companyReviews && review.companyReviews.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-3">Company Commentary</p>
          <div className="space-y-3">
            {review.companyReviews.map((cr, idx) => {
              const comp = sortedCompanies.find(c => c.name === cr.company);
              return (
                <div key={idx} className="bg-white rounded-lg border border-border/60 p-3 space-y-2.5">
                  {/* Company header with send status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comp && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getRAGColor(comp.rag) }} />}
                      <span className="text-[13px] font-medium text-foreground">{cr.company}</span>
                    </div>
                    <span className={`text-[11px] inline-flex items-center gap-1.5 ${
                      cr.sendStatus === 'Sent' ? 'text-foreground/85' :
                      cr.sendStatus === 'Draft' ? 'text-[#B8763A]' :
                      'text-muted-foreground'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        cr.sendStatus === 'Sent' ? 'bg-[#5C7A6E]' :
                        cr.sendStatus === 'Draft' ? 'bg-[#B8763A]' :
                        'bg-muted-foreground/30'
                      }`} />
                      {cr.sendStatus}
                    </span>
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-0.5">Comment</p>
                    <p className="text-[12px] leading-relaxed text-foreground/80">{cr.comment}</p>
                  </div>

                  {/* Recent Progress */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-0.5">Recent Progress</p>
                    <p className="text-[12px] leading-relaxed text-foreground/80">{cr.recentProgress}</p>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-0.5">Summary</p>
                    <p className="text-[12px] leading-relaxed text-foreground/80">{cr.summary}</p>
                  </div>

                  {/* Concerns + Action Points + Induction Action in a row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-0.5">Key Concerns</p>
                      <p className="text-[12px] leading-relaxed text-foreground/80">{cr.keyConcerns}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-0.5">Action Points</p>
                      <p className="text-[12px] leading-relaxed text-foreground/80">{cr.actionPoints}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 mb-0.5">Induction Action</p>
                      <p className="text-[12px] leading-relaxed text-foreground/80">{cr.inductionAction}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Companies reviewed chips */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">Companies Reviewed</p>
        <div className="flex flex-wrap gap-1.5">
          {review.companiesReviewed.map(name => {
            const comp = sortedCompanies.find(c => c.name === name);
            return (
              <button
                key={name}
                onClick={() => comp && navigate(`/company/${comp.id}`)}
                className="text-[11px] px-2 py-1 bg-white border border-border rounded-lg text-foreground/80 hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {comp && <div className="w-2 h-2 rounded-full" style={{ background: getRAGColor(comp.rag) }} />}
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// MonthlyReview removed — platform focuses on quarterly only
function __removedMonthlyReview() {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [commentaries, setCommentaries] = useState<Record<string, string>>({});
  const [editingReview, setEditingReview] = useState<MonthlyReviewRecord | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { fundFilter, setFundFilter } = useFundFilter();
  const { milestone } = useMilestone();
  const isM1 = milestone === 'm1';

  const current = sortedCompanies[currentIndex];
  const currentFlags = flags.filter(f => f.companyId === current?.id);
  const progress = ((reviewed.size + skipped.size) / activeCompanies.length) * 100;

  const handleReview = () => {
    setReviewed(prev => new Set(prev).add(current.id));
    if (currentIndex < sortedCompanies.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSkip = () => {
    setSkipped(prev => new Set(prev).add(current.id));
    if (currentIndex < sortedCompanies.length - 1) setCurrentIndex(currentIndex + 1);
  };

  // ── Autosave logic ──
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveStatus('saving');
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 800);
  }, []);

  // Trigger autosave when commentaries change
  useEffect(() => {
    if (mode === 'active' && Object.keys(commentaries).length > 0) {
      triggerAutoSave();
    }
  }, [commentaries, mode, triggerAutoSave]);

  // ── Determine current month label and whether an in-progress review exists ──
  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthShort = new Date().toLocaleString('default', { month: 'long' });
  const inProgressReview = monthlyReviewsHistory.find(r => r.status === 'In Progress');
  const hasCurrentMonth = monthlyReviewsHistory.some(r => r.month === currentMonthLabel);

  // ── Open a review for editing (past or current) ──
  const openReviewForEditing = (review: MonthlyReviewRecord) => {
    setEditingReview(review);
    // Pre-populate commentaries from the review's saved comments
    const prePopulated: Record<string, string> = {};
    review.companyComments.forEach(cc => {
      const comp = sortedCompanies.find(c => c.name === cc.company);
      if (comp) prePopulated[comp.id] = cc.comment;
    });
    setCommentaries(prePopulated);
    // Mark companies with comments as reviewed
    const reviewedSet = new Set<string>();
    review.companyComments.forEach(cc => {
      const comp = sortedCompanies.find(c => c.name === cc.company);
      if (comp) reviewedSet.add(comp.id);
    });
    setReviewed(reviewedSet);
    setSkipped(new Set());
    setCurrentIndex(0);
    setMode('active');
  };

  // Review title — editing a past review or new
  const reviewTitle = editingReview ? `${editingReview.month} Review` : `${currentMonthShort} Review`;

  // ── List view ─────────────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[34px] leading-tight text-foreground">Monthly Reviews</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Internal team review — step through companies, add commentary per company
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fundFilter}
              onChange={e => setFundFilter(e.target.value as any)}
              className="text-[13px] border border-border rounded-lg px-3 py-1.5 bg-white text-foreground"
            >
              <option value="all">All Funds</option>
              {funds.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
            <button
              onClick={() => { setMode('active'); setCurrentIndex(0); setReviewed(new Set()); setSkipped(new Set()); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] hover:bg-[var(--primary-muted)] transition-colors"
            >
              {inProgressReview ? (
                <><FileText className="w-3.5 h-3.5" /> Edit {inProgressReview.month.split(' ')[0]} Review</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> Start {currentMonthShort} Review</>
              )}
            </button>
          </div>
        </div>

        {/* Review history list */}
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70 mb-3">Review History</h3>
          <div className="bg-card rounded-md border border-border/70 divide-y divide-border/60">
            {monthlyReviewsHistory.map((review) => (
              <button
                key={review.id}
                onClick={() => openReviewForEditing(review)}
                className="w-full p-4 flex items-center gap-3 text-[13px] hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground">{review.month}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {review.date} · {review.completedBy}
                    <span className="text-muted-foreground/70 ml-1">· Last edited by {review.lastEditedBy}, {review.lastEditedAt}</span>
                  </p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <p className="text-[12px] text-muted-foreground font-mono-num">{review.companyComments.length} companies</p>
                  <span className={`text-[11px] inline-flex items-center gap-1.5 ${
                    review.status === 'Complete' ? 'text-foreground/85' : 'text-[#B8763A]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      review.status === 'Complete' ? 'bg-[#5C7A6E]' : 'bg-[#B8763A]'
                    }`} />
                    {review.status}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.6} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active monthly review flow ────────────────────────────────────
  const companiesWithComments = sortedCompanies.filter(c => (commentaries[c.id] || '').trim().length > 0).length;

  return (
    <div className="max-w-[1100px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => { setMode('list'); setEditingReview(null); }} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">← Back to Reviews</button>
          <h2 className="text-[18px] font-semibold tracking-tight text-foreground">{reviewTitle}</h2>
          {autoSaveStatus === 'saving' && (
            <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1"><Save className="w-3 h-3 animate-pulse" /> Saving...</span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-[11px] text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>
          )}
          {editingReview && autoSaveStatus === 'idle' && (
            <span className="text-[11px] text-muted-foreground/70">Last edited by {editingReview.lastEditedBy}, {editingReview.lastEditedAt}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted-foreground">
            {currentIndex + 1} of {sortedCompanies.length}
          </span>
          <button
            onClick={() => { setMode('list'); setEditingReview(null); }}
            className="flex items-center gap-1.5 px-4 h-9 bg-foreground text-background rounded-md text-[13px] font-medium hover:bg-foreground/90 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.8} /> Complete Review
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left sidebar — company list for jumping */}
        <div className="w-[240px] flex-shrink-0">
          <div className="bg-card rounded-md border border-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">Companies</p>
              <span className="text-[11px] text-muted-foreground font-mono-num">{companiesWithComments}/{sortedCompanies.length}</span>
            </div>
            <div className="divide-y divide-border/60">
            {sortedCompanies.map((c, i) => {
              const hasComment = (commentaries[c.id] || '').trim().length > 0;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={c.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full p-2.5 flex items-center gap-2.5 text-left transition-colors relative ${
                    isCurrent ? 'bg-muted text-foreground' :
                    'hover:bg-muted/60'
                  }`}
                >
                  {isCurrent && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-foreground rounded-r" />}
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
                    isCurrent ? 'bg-foreground text-background' : 'bg-muted-foreground/15 text-muted-foreground'
                  }`}>{c.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] truncate ${isCurrent ? 'text-foreground font-medium' : 'text-foreground/85'}`}>{c.name}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {c.ragHistory.slice(-3).map((r, ri) => (
                        <div key={ri} className="w-1 h-1 rounded-full" style={{ background: getRAGColor(r) }} />
                      ))}
                    </div>
                  </div>
                  {hasComment && <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 flex-shrink-0" title="Has commentary" />}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* Right — main review area */}
        <div className="flex-1">
          {current && (
            <div className="bg-white rounded-xl border border-border/60 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-[15px] font-medium">
                  {current.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-display text-[22px] leading-tight text-foreground">{current.name}</h2>
                    <span className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-sm ml-1.5">{current.stage}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">{current.fund}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-sm bg-foreground/8 text-foreground/85">
                      {current.action}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{current.description}</p>
                </div>
              </div>

              {/* RAG History strip */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">RAG History</span>
                <div className="flex items-center gap-1.5">
                  {current.ragHistory.map((r, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ background: getRAGColor(r) }} title={`Q${i + 1}: ${r}`} />
                      <span className="text-[10px] text-muted-foreground/70">Q{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key metrics — kept as empty shell, data not available initially */}
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">Key Metrics</span>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {['Health', 'MRR', 'Burn', 'Runway', 'MoIC'].map(label => (
                    <div key={label} className="bg-muted/60 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-muted-foreground/70">{label}</p>
                      <p className="text-[13px] mt-0.5 text-muted-foreground/50">—</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Team Commentary
                </label>
                <textarea
                  className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white resize-none h-[72px]"
                  placeholder={`Add commentary for ${current.name}...`}
                  value={commentaries[current.id] || ''}
                  onChange={e => setCommentaries(prev => ({ ...prev, [current.id]: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                {currentIndex < sortedCompanies.length - 1 ? (
                  <button onClick={() => setCurrentIndex(currentIndex + 1)} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] hover:bg-[var(--primary-muted)] transition-colors flex items-center gap-1.5">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => setCurrentIndex(0)} className="px-4 py-2 bg-muted text-foreground/80 rounded-lg text-[13px] hover:bg-secondary transition-colors">
                    Back to first
                  </button>
                )}
                <button onClick={() => navigate(`/company/${current.id}`)} className="ml-auto text-[12px] text-primary hover:text-primary flex items-center gap-1">
                  View Full Detail <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ██ QUARTERLY REVIEW ██
// ══════════════════════════════════════════════════════════════════════
export function QuarterlyReview() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'list' | 'active' | 'lp-report-preview'>('list');
  const [selectedFund, setSelectedFund] = useState(funds[0]);
  const [quarterlyStep, setQuarterlyStep] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [managersCommentary, setManagersCommentary] = useState('');
  const [otherDevelopments, setOtherDevelopments] = useState('');
  const [companyCommentary, setCompanyCommentary] = useState<Record<string, {
    rag: RAGStatus; cashRunway: string; summary: string; recentProgress: string; keyConcerns: string; actionPoints: string;
  }>>({});
  const [editingReview, setEditingReview] = useState<ReviewRecord | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inline founder submission edits (per company → per metric → numeric value)
  const [editingFounderId, setEditingFounderId] = useState<string | null>(null);
  const [founderEdits, setFounderEdits] = useState<Record<string, Record<string, number>>>({});
  // VC's accept/reject decision per (companyId, metric) for previous-quarter amendments
  const [priorAmendmentDecisions, setPriorAmendmentDecisions] = useState<Record<string, Record<string, 'accepted' | 'rejected'>>>({});
  const [founderDrafts, setFounderDrafts] = useState<Record<string, string>>({});
  const [founderEditError, setFounderEditError] = useState<string | null>(null);

  const { fundFilter, setFundFilter } = useFundFilter();
  const { milestone } = useMilestone();
  const isM1 = milestone === 'm1';

  // Mock founder submission data for Q1 2026
  const founderSubmissionStatus: Record<string, 'submitted' | 'partial' | 'sent' | 'not_sent'> = {
    '1': 'submitted', '2': 'sent', '3': 'sent', '4': 'partial', '5': 'not_sent',
  };
  const getFounderStatus = (id: string) => founderSubmissionStatus[id] ?? (parseInt(id) % 3 === 0 ? 'partial' : 'submitted');
  // Tonal status — single dot conveys state, surrounding chrome stays neutral
  const founderStatusConfig = {
    submitted: { label: 'Submitted', dot: '#5C7A6E', bg: 'bg-card',     text: 'text-foreground/85',  border: 'border-border' },
    partial:   { label: 'Partial',   dot: '#B8763A', bg: 'bg-card',     text: 'text-[#B8763A]',      border: 'border-border' },
    sent:      { label: 'Awaiting',  dot: '#6B6660', bg: 'bg-card',     text: 'text-muted-foreground', border: 'border-border' },
    not_sent:  { label: 'Not sent',  dot: '#C8C2B0', bg: 'bg-muted/40', text: 'text-muted-foreground/70', border: 'border-border' },
  };

  // ── Autosave logic ──
  const triggerQAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveStatus('saving');
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 800);
  }, []);

  useEffect(() => {
    if (mode === 'active' && Object.keys(companyCommentary).length > 0) {
      triggerQAutoSave();
    }
  }, [companyCommentary, mode, triggerQAutoSave]);

  // ── Open a past quarterly review for editing ──
  const openQuarterlyForEditing = (review: ReviewRecord) => {
    setEditingReview(review);
    // Pre-populate commentary from saved review
    const prePopulated: Record<string, any> = {};
    (review.companyReviews || []).forEach(cr => {
      const comp = sortedCompanies.find(c => c.name === cr.company);
      if (comp) {
        prePopulated[comp.id] = {
          rag: comp.rag,
          cashRunway: comp.runway + ' months',
          summary: cr.summary || cr.comment || '',
          recentProgress: cr.recentProgress || '',
          keyConcerns: cr.keyConcerns || '',
          actionPoints: cr.actionPoints || '',
        };
      }
    });
    setCompanyCommentary(prePopulated);
    setCurrentIndex(0);
    setQuarterlyStep(1);
    setMode('active');
  };

  // Commentary completeness
  const isCommentaryDone = (id: string) => {
    const cc = companyCommentary[id];
    if (!cc) return false;
    return (cc.summary || '').trim().length > 0 && (cc.keyConcerns || '').trim().length > 0;
  };
  const doneCount = sortedCompanies.filter(c => isCommentaryDone(c.id)).length;
  const qCurrent = sortedCompanies[currentIndex];
  const qCurrentFlags = flags.filter(f => f.companyId === qCurrent?.id);

  // ── Determine current quarter and in-progress state ──
  const currentQuarterNum = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentYear = new Date().getFullYear();
  const currentQuarterLabel = `Q${currentQuarterNum} ${currentYear}`;
  const inProgressQuarterly = quarterlyReviewsHistory.find(r => r.status === 'In Progress');
  const quarterlyReviewTitle = editingReview ? `${editingReview.quarter} Review` : `${currentQuarterLabel} Review`;

  // ── List view ─────────────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[34px] leading-tight text-foreground">Quarterly Reviews</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Full team review — add commentary per company, then export Asset Metrix XLSX{!isM1 && ' or LP Report PDF'}
            </p>
          </div>
          <button
            onClick={() => { setMode('active'); setCurrentIndex(0); setQuarterlyStep(1); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] hover:bg-[var(--primary-muted)] transition-colors"
          >
            {inProgressQuarterly ? (
              <><FileText className="w-3.5 h-3.5" /> Edit {inProgressQuarterly.quarter} Review</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Start {currentQuarterLabel} Review</>
            )}
          </button>
        </div>

        {/* Upcoming / Current quarter callout */}
        <div className="bg-card border border-border rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">{currentQuarterLabel} — Ready for Review</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {sortedCompanies.length} companies · Founder data collection {Math.round(sortedCompanies.length * 0.6)} of {sortedCompanies.length} submitted
              </p>
            </div>
          </div>
          <button
            onClick={() => { setMode('active'); setCurrentIndex(0); setQuarterlyStep(1); }}
            className="flex items-center gap-2 px-4 h-9 bg-foreground text-background rounded-md text-[13px] font-medium hover:bg-foreground/90 transition-colors"
          >
            Begin Review <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Review history list */}
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70 mb-3">Past Quarterly Reviews</h3>
          <div className="bg-card rounded-md border border-border/70 divide-y divide-border/60">
            {quarterlyReviewsHistory.map((review) => (
              <button
                key={review.id}
                onClick={() => openQuarterlyForEditing(review)}
                className="w-full p-4 flex items-center gap-3 text-[13px] hover:bg-muted/60 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground">{review.quarter}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {review.date} · {review.completedBy} · {review.duration}
                    {review.lastEditedBy && <span className="text-muted-foreground/70 ml-1">· Last edited by {review.lastEditedBy}, {review.lastEditedAt}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[12px] text-foreground font-mono-num">{review.companies} companies</p>
                    <p className="text-[11px] text-muted-foreground/70 font-mono-num">{review.changes} RAG changes</p>
                  </div>
                  {review.exported && (
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> Exported
                    </span>
                  )}
                  <span className={`text-[11px] inline-flex items-center gap-1.5 ${
                    review.status === 'Complete' ? 'text-foreground/85' :
                    review.status === 'In Progress' ? 'text-[#B8763A]' :
                    'text-muted-foreground/70'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      review.status === 'Complete' ? 'bg-[#5C7A6E]' :
                      review.status === 'In Progress' ? 'bg-[#B8763A]' :
                      'bg-muted-foreground/30'
                    }`} />
                    {review.status}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.6} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LP Report Preview ─────────────────────────────────────────────
  if (mode === 'lp-report-preview') {
    return (
      <LPReportPreview
        fund={selectedFund}
        companies={companies.filter(c => c.fund === selectedFund.name)}
        managersCommentary={managersCommentary}
        otherDevelopments={otherDevelopments}
        reportDate="31 March 2026"
        onClose={() => { setMode('active'); setQuarterlyStep(2); }}
      />
    );
  }

  // ── Active quarterly review flow ──────────────────────────────────
  const steps = [
    { num: 1, label: 'Team Commentary' },
    { num: 2, label: 'Export' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => { setMode('list'); setEditingReview(null); }} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">← Back to Reviews</button>
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
            {quarterlyReviewTitle}
          </h2>
          {autoSaveStatus === 'saving' && (
            <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1"><Save className="w-3 h-3 animate-pulse" /> Saving...</span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-[11px] text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>
          )}
          {editingReview && autoSaveStatus === 'idle' && editingReview.lastEditedBy && (
            <span className="text-[11px] text-muted-foreground/70">Last edited by {editingReview.lastEditedBy}, {editingReview.lastEditedAt}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { generateAssetMetrixXLSX(selectedFund, companies); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] hover:bg-[var(--primary-muted)] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Asset Metrix
          </button>
        </div>
      </div>

      {/* Single-page layout — same as M1, no 2-step stepper */}
      {quarterlyStep === 1 && (
        <div className="flex gap-4">
          {/* Left sidebar */}
          <div className="w-[240px] flex-shrink-0">
            <div className="bg-card rounded-md border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">Companies</p>
                <span className="text-[11px] text-muted-foreground font-mono-num">{doneCount}/{sortedCompanies.length} done</span>
              </div>
              <div className="divide-y divide-border/60">
              {sortedCompanies.map((c, i) => {
                const isCurrent = i === currentIndex;
                const done = isCommentaryDone(c.id);
                const fStatus = getFounderStatus(c.id);
                const fCfg = founderStatusConfig[fStatus];
                return (
                  <button
                    key={c.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full p-2.5 flex items-center gap-2.5 text-left transition-colors relative ${
                      isCurrent ? 'bg-muted text-foreground' :
                      'hover:bg-muted/60'
                    }`}
                  >
                    {isCurrent && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-foreground rounded-r" />}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
                      isCurrent ? 'bg-foreground text-background' : 'bg-muted-foreground/15 text-muted-foreground'
                    }`}>{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] truncate ${isCurrent ? 'text-foreground font-medium' : 'text-foreground/85'}`}>{c.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getRAGColor(c.rag) }} title={c.rag} />
                        <span className="text-[10px] text-muted-foreground/70 truncate ml-0.5">{c.stage}</span>
                      </div>
                    </div>
                    {done && <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 flex-shrink-0" title="Commentary added" />}
                  </button>
                );
              })}
              </div>
            </div>
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />RAG status
                <div className="w-2 h-2 rounded-full bg-primary/70 ml-2" />Founder form
              </div>
            </div>
          </div>

          {/* Right — company commentary panel */}
          {qCurrent && (
            <div className="flex-1 min-w-0 space-y-3">
              {/* Company header */}
              <div className="bg-card rounded-md border border-border/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-[15px] font-medium flex-shrink-0">
                    {qCurrent.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-display text-[24px] leading-tight text-foreground">{qCurrent.name}</h2>
                      <div className="w-2 h-2 rounded-full ml-1" style={{ background: getRAGColor(qCurrent.rag) }} title={qCurrent.rag} />
                      <span className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">{qCurrent.stage}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">{qCurrent.sector}</span>
                      <div className="flex items-center gap-1.5 ml-auto">
                        {(qCurrent.ownerAvatars || []).map((a: string, i: number) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-foreground/10 text-foreground/80 flex items-center justify-center text-[9px] font-medium">{a}</div>
                        ))}
                        <span className="text-[11px] text-muted-foreground">{qCurrent.owners.join(', ')}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1">{qCurrent.description}</p>
                  </div>
                </div>

              </div>

              {/* Founder submission panel */}
              {(() => {
                const fStatus = getFounderStatus(qCurrent.id);
                const fCfg = founderStatusConfig[fStatus];
                const isEditing = editingFounderId === qCurrent.id;
                return (
                  <div className="rounded-md border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(() => {
                          const fyEnd = getCompanyFyEndMonth(qCurrent.id);
                          const range = quarterDateRange(1, fyEnd, 2026);
                          return (
                            <>
                              <p className="text-[12px] font-medium text-foreground">Founder Submission — Q1 2026</p>
                              <span className="text-[10px] text-muted-foreground font-mono-num" title={`This company's financial year ends in ${monthIndexToName(fyEnd)}`}>
                                {range} · FY ends {monthIndexToName(fyEnd)}
                              </span>
                            </>
                          );
                        })()}
                        <span className={`inline-flex items-center gap-1.5 text-[11px] ${fCfg.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: fCfg.dot }} />
                          {fCfg.label}
                        </span>
                        {/* Resend / Send only when NOT submitted */}
                        {fStatus !== 'submitted' && (
                          <button className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-white border border-border text-foreground/80 hover:bg-muted/60 transition-colors">
                            <Send className="w-3 h-3" />
                            {fStatus === 'not_sent' ? 'Send form' : fStatus === 'sent' ? 'Resend reminder' : 'Resend form'}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <button
                            onClick={() => { setEditingFounderId(qCurrent.id); setFounderDrafts({}); setFounderEditError(null); }}
                            className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-white border border-border text-foreground/80 hover:bg-muted/60 transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingFounderId(null); setFounderDrafts({}); setFounderEditError(null); }}
                              className="text-[11px] px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-white/50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                // Validate every draft, accumulate parsed values
                                const parsed: Record<string, number> = {};
                                let firstError: string | null = null;
                                for (const [key, raw] of Object.entries(founderDrafts)) {
                                  if (!raw) continue;
                                  const fieldKey = key === 'monthlyNetBurn' ? 'cashBurn' : key;
                                  const result = validateFieldValue(fieldKey as FieldKey, raw, qCurrent.currency as any);
                                  if (!result.valid) {
                                    firstError = `${key}: ${result.error}`;
                                    break;
                                  }
                                  if (result.parsedNumber != null) parsed[key] = result.parsedNumber;
                                }
                                if (firstError) { setFounderEditError(firstError); return; }
                                setFounderEdits(prev => ({
                                  ...prev,
                                  [qCurrent.id]: { ...(prev[qCurrent.id] || {}), ...parsed },
                                }));
                                setEditingFounderId(null);
                                setFounderDrafts({});
                                setFounderEditError(null);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {founderEditError && isEditing && (
                      <div className="mb-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-700">{founderEditError}</p>
                      </div>
                    )}
                    {(fStatus === 'submitted' || fStatus === 'partial') ? (
                      <div className="overflow-hidden rounded-lg border border-white/80">
                        <table className="w-full text-[11px]">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-white/90 backdrop-blur border-b border-border/50">
                              <th className="text-left px-2.5 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.06em] w-[200px]">Metric</th>
                              <th className="text-right px-2.5 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.06em]">
                                <div>Q4 2025</div>
                                <div className="text-[9px] font-normal text-muted-foreground/50 normal-case tracking-normal">Previous · {(() => { const fy = getCompanyFyEndMonth(qCurrent.id); return quarterDateRange(4, fy, 2025); })()}</div>
                              </th>
                              <th className="text-right px-2.5 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.06em]">
                                <div>Q1 2026</div>
                                <div className="text-[9px] font-normal text-muted-foreground/50 normal-case tracking-normal">Current · {(() => { const fy = getCompanyFyEndMonth(qCurrent.id); return quarterDateRange(1, fy, 2026); })()}</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              // Reduced 9 core metrics — matches founder form (Bonnie's confirmed list)
                              const allMetrics: { label: string; key: string; isCurrency: boolean; isPercentage?: boolean; section: string; isCalc?: boolean }[] = [
                                { label: 'Revenue (core)', key: 'revenue', isCurrency: true, section: 'Revenue & Growth' },
                                { label: 'ARR', key: 'arr', isCurrency: true, section: 'Revenue & Growth' },
                                { label: 'Gross Margin (%)', key: 'grossMargin', isCurrency: false, isPercentage: true, section: 'Profitability & Margins' },
                                { label: 'EBITDA', key: 'ebitda', isCurrency: true, section: 'Profitability & Margins', isCalc: true },
                                { label: 'Cash Balance', key: 'cashBalance', isCurrency: true, section: 'Cash Position' },
                                { label: 'Cash Burn (excl. funding)', key: 'monthlyNetBurn', isCurrency: true, section: 'Cash Position' },
                                { label: 'Headcount — Male (FTE)', key: 'headcountMale', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Headcount — Female (FTE)', key: 'headcountFemale', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Headcount — Ethnic Minority (FTE)', key: 'headcountEthnicMinority', isCurrency: false, section: 'Team & Diversity' },
                              ];
                              // Current quarter (Q1 2026): Apr-Jun mock
                              const currentQuarterMonths = ['2026-01','2026-02','2026-03'];
                              const dataCurr = currentQuarterMonths.map(m => qCurrent.monthlyFinancials.find((f: any) => f.month === m)).filter(Boolean) as any[];
                              // Previous quarter (Q4 2025): Jan-Mar mock
                              const prevQuarterMonths = ['2025-10','2025-11','2025-12'];
                              const dataPrev = prevQuarterMonths.map(m => qCurrent.monthlyFinancials.find((f: any) => f.month === m)).filter(Boolean) as any[];

                              // Mock: deterministically flag certain (company, metric) pairs as having an amendment to prior quarter
                              const hasAmendment = (key: string): { original: number; amended: number } | null => {
                                // Skip if VC already accepted/rejected
                                if (priorAmendmentDecisions[qCurrent.id]?.[key]) return null;
                                if (key === 'ebitda') return null; // calc, no amendment
                                const hash = (qCurrent.id + key).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                                if (hash % 5 !== 0) return null; // ~20% of cells get an amendment
                                const aggKey = key === 'monthlyNetBurn' ? 'cashBurn' : key;
                                const baseVal = aggregateQuarter(dataPrev, aggKey as any);
                                if (baseVal == null) return null;
                                const drift = (hash % 7) / 100 + 0.05; // 5-12% delta
                                const amended = key.startsWith('headcount')
                                  ? Math.max(0, Math.round(baseVal * (1 + drift)))
                                  : Math.round(baseVal * (1 + drift));
                                return { original: baseVal, amended };
                              };

                              const valueForCurrent = (key: string) => {
                                const savedEdit = founderEdits[qCurrent.id]?.[key];
                                if (savedEdit != null) return savedEdit;
                                if (dataCurr.length === 0) return null;
                                const aggKey = key === 'monthlyNetBurn' ? 'cashBurn' : key;
                                return aggregateQuarter(dataCurr, aggKey as any);
                              };

                              const valueForPrev = (key: string) => {
                                if (dataPrev.length === 0) return null;
                                const aggKey = key === 'monthlyNetBurn' ? 'cashBurn' : key;
                                return aggregateQuarter(dataPrev, aggKey as any);
                              };

                              const formatVal = (val: number | null, metric: typeof allMetrics[number]) => {
                                if (val == null) return null;
                                if (metric.isCurrency) return formatCurrency(val, qCurrent.currency);
                                if (metric.isPercentage) return val + '%';
                                return String(val);
                              };

                              let lastSection = '';
                              return allMetrics.map(metric => {
                                const showSection = metric.section !== lastSection;
                                lastSection = metric.section;
                                const valCurr = valueForCurrent(metric.key);
                                const valPrev = valueForPrev(metric.key);
                                const draftValue = founderDrafts[metric.key];
                                const inputValue = draftValue !== undefined ? draftValue : (valCurr != null ? String(valCurr) : '');
                                const amendment = hasAmendment(metric.key);
                                const decision = priorAmendmentDecisions[qCurrent.id]?.[metric.key];
                                return (
                                  <React.Fragment key={metric.key}>
                                    {showSection && (
                                      <tr key={`section-${metric.section}`}>
                                        <td colSpan={3} className="px-2.5 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] bg-muted/30 border-t border-border/50">
                                          {metric.section}
                                        </td>
                                      </tr>
                                    )}
                                    <tr className="hover:bg-white/40 border-t border-border/40">
                                      <td className="px-2.5 py-1.5 text-foreground/80">{metric.label}{metric.isCalc && <span className="ml-1 text-[9px] text-muted-foreground/70">(auto)</span>}</td>
                                      {/* Previous quarter — with amendment indicator */}
                                      <td className="px-2.5 py-1.5 text-right font-mono-num text-muted-foreground">
                                        {amendment ? (
                                          <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                              <span className="line-through text-muted-foreground/70 text-[10px]">{formatVal(amendment.original, metric)}</span>
                                              <span className="text-red-600 font-semibold">{formatVal(amendment.amended, metric)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <span className="text-[9px] text-red-500 mr-1" title="Founder amended this value in their latest submission">amended</span>
                                              <button
                                                onClick={() => setPriorAmendmentDecisions(prev => ({
                                                  ...prev,
                                                  [qCurrent.id]: { ...(prev[qCurrent.id] || {}), [metric.key]: 'accepted' }
                                                }))}
                                                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                                title="Accept this amendment"
                                              >
                                                <Check className="w-2.5 h-2.5" /> Accept
                                              </button>
                                              <button
                                                onClick={() => setPriorAmendmentDecisions(prev => ({
                                                  ...prev,
                                                  [qCurrent.id]: { ...(prev[qCurrent.id] || {}), [metric.key]: 'rejected' }
                                                }))}
                                                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-muted text-foreground/80 hover:bg-secondary transition-colors"
                                                title="Reject — keep the original value"
                                              >
                                                ✕ Reject
                                              </button>
                                            </div>
                                          </div>
                                        ) : decision === 'accepted' ? (
                                          <span className="text-emerald-600">{formatVal(valPrev, metric) ?? '—'} <span className="text-[9px] text-emerald-500 ml-1">accepted</span></span>
                                        ) : decision === 'rejected' ? (
                                          <span className="text-muted-foreground">{formatVal(valPrev, metric) ?? '—'} <span className="text-[9px] text-muted-foreground/70 ml-1">rejected</span></span>
                                        ) : (
                                          valPrev != null ? formatVal(valPrev, metric) : <span className="text-muted-foreground/50">—</span>
                                        )}
                                      </td>
                                      {/* Current quarter — editable as before */}
                                      <td className="px-2.5 py-1.5 text-right font-mono-num text-foreground">
                                        {isEditing && !metric.isCalc ? (
                                          <input
                                            type="text"
                                            value={inputValue}
                                            onChange={e => { setFounderDrafts(prev => ({ ...prev, [metric.key]: e.target.value })); setFounderEditError(null); }}
                                            placeholder={metric.isCurrency ? 'e.g. 176000 or 176K' : metric.isPercentage ? '0–100' : '0'}
                                            className="w-[140px] text-right text-[11px] font-mono-num border border-border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                                          />
                                        ) : (
                                          valCurr != null ? formatVal(valCurr, metric) : <span className="text-muted-foreground/50">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : fStatus === 'sent' ? (
                      <p className="text-[12px] text-muted-foreground">Form sent — awaiting founder response. You can send a reminder or proceed with last known values.</p>
                    ) : (
                      <p className="text-[12px] text-muted-foreground">No form has been sent to this founder for Q1 2026. Send the form to collect validated data.</p>
                    )}
                  </div>
                );
              })()}

              {/* Commentary fields — matches AI prompt + Asset Metrix Company Commentary sheet */}
              {(() => {
                const cc = companyCommentary[qCurrent.id] || {
                  rag: qCurrent.rag, cashRunway: qCurrent.runway + ' months',
                  summary: qCurrent.summary,
                  recentProgress: qCurrent.recentProgress,
                  keyConcerns: qCurrent.keyConcerns.join('\n'),
                  actionPoints: qCurrent.actionPoints.join('\n'),
                };
                const update = (field: string, value: string) => setCompanyCommentary(prev => ({
                  ...prev,
                  [qCurrent.id]: { ...(prev[qCurrent.id] || cc), [field]: value },
                }));

                return (
                  <div className="bg-white rounded-xl border border-border/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-medium text-foreground">Quarterly Commentary</p>
                      <span className="text-[10px] text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded">M1: manual input · Post-M1: AI-generated</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-muted-foreground">RAG Status</label>
                        <select
                          className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white"
                          defaultValue={cc.rag}
                          onChange={e => update('rag', e.target.value)}
                        >
                          <option>Green</option><option>Amber</option><option>Red</option><option>Grey</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Cash Runway</label>
                        <input
                          className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white"
                          defaultValue={cc.cashRunway}
                          placeholder="e.g. 18 months"
                          onBlur={e => update('cashRunway', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        Summary <span className="text-red-400">*</span>
                        <span className="group/tip relative inline-flex">
                          <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                          <span className="invisible group-hover/tip:visible absolute left-0 top-5 z-10 bg-foreground text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            2–3 sentences: overall performance, current ARR, growth, key metrics
                          </span>
                        </span>
                      </label>
                      <textarea
                        className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white resize-none h-[72px]"
                        defaultValue={cc.summary}
                        placeholder="Performance summary including ARR, quarterly growth, and key relevant metrics..."
                        onBlur={e => update('summary', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        Recent Progress <span className="text-red-400">*</span>
                        <span className="group/tip relative inline-flex">
                          <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                          <span className="invisible group-hover/tip:visible absolute left-0 top-5 z-10 bg-foreground text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                            2–3 sentences: team, customers, revenue, partnerships, product
                          </span>
                        </span>
                      </label>
                      <textarea
                        className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white resize-none h-[72px]"
                        defaultValue={cc.recentProgress}
                        placeholder="Recent progress on team, customer growth, revenue, partnerships, key product announcements..."
                        onBlur={e => update('recentProgress', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground">Key Concerns</label>
                      <textarea
                        className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white resize-none h-[60px]"
                        defaultValue={cc.keyConcerns}
                        placeholder="Any concerns mentioned — runway, churn, growth slowdown, team gaps..."
                        onBlur={e => update('keyConcerns', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground">Action Points</label>
                      <textarea
                        className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-white resize-none h-[60px]"
                        defaultValue={cc.actionPoints}
                        placeholder="Actions for founders or the board to take..."
                        onBlur={e => update('actionPoints', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground/70">{currentIndex + 1} of {sortedCompanies.length}</span>
                  {currentIndex < sortedCompanies.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] hover:bg-[var(--primary-muted)] transition-colors"
                    >
                      Next company →
                    </button>
                  ) : !isM1 ? (
                    <button
                      onClick={() => setQuarterlyStep(2)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] hover:bg-[var(--primary-muted)] transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Finish & Export
                    </button>
                  ) : (
                    <button
                      onClick={() => { setCurrentIndex(0); }}
                      className="px-4 py-2 bg-muted text-foreground/80 rounded-lg text-[13px] hover:bg-secondary transition-colors"
                    >
                      Back to first
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Export ─────────────────────────────────────── */}
      {!isM1 && quarterlyStep === 2 && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-[18px] mb-2 text-foreground font-semibold">Ready to Export</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              Q1 2026 data is ready. {activeCompanies.length} companies reviewed. Export Asset Metrix XLSX or optionally generate LP Report PDF.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => { generateAssetMetrixXLSX(selectedFund, companies); }}
              className="bg-white border-2 border-primary/30 rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all text-left ring-2 ring-primary/10 relative"
            >
              <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-primary text-white rounded-full font-medium">Primary</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-[14px] mb-1 text-foreground font-medium">Asset Metrix XLSX</h3>
              <p className="text-[11px] text-muted-foreground">Multi-sheet XLSX matching Asset Metrix template: Company Commentary, Static Data, and Periodic KPIs.</p>
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1"><Download className="w-3 h-3" /> Download XLSX</p>
            </button>
            <button
              onClick={() => setMode('lp-report-preview')}
              className="bg-white rounded-xl border border-border/60 p-5 hover:shadow-md transition-shadow text-left relative"
            >
              <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">Optional</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Printer className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-[14px] mb-1 text-foreground font-medium">LP Report PDF</h3>
              <p className="text-[11px] text-muted-foreground">Full quarterly report matching Crane structure: cover, standing data, commentary, company snapshots.</p>
              <p className="text-[11px] text-primary mt-2 flex items-center gap-1">Preview & Print →</p>
            </button>
            <button
              onClick={() => { const csv = generateFundSummaryCSV(selectedFund); downloadCSV(csv, `${selectedFund.name.replace(/\s/g, '_')}_Fund_Summary_Q1_2026.csv`); }}
              className="bg-white rounded-xl border border-border/60 p-5 hover:shadow-md transition-shadow text-left relative"
            >
              <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">Optional</div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-[14px] mb-1 text-foreground font-medium">Fund Summary CSV</h3>
              <p className="text-[11px] text-muted-foreground">TVPI history, NAV waterfall, uses of funds, geographic distribution. Full fund data export.</p>
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1"><Download className="w-3 h-3" /> Download CSV</p>
            </button>
          </div>

          <div className="flex justify-between">
            <button onClick={() => { setQuarterlyStep(1); setCurrentIndex(0); }} className="text-[13px] text-muted-foreground">← Back to Commentary</button>
            <button onClick={() => setMode('list')} className="px-4 py-2 border border-border rounded-lg text-[13px]">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legacy export for backwards compatibility ─────────────────────────
export function PortfolioReview() {
  return <QuarterlyReview />;
}
