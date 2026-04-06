import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Play, SkipForward, Check, ChevronRight, Download, Clock, Send, FileText,
  Upload, Users, Sparkles, CheckCircle, AlertCircle, Printer, Plus, Calendar,
  ChevronDown, ArrowRight,
} from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import { companies, funds, flags, formatCurrency, getHealthColor, getRAGColor, getActionColor, teamMembers, type RAGStatus } from './mock-data';
import { FlagIcon } from './FlagIcon';
import { generateAssetMetrixXLSX, generateFundSummaryCSV, downloadCSV } from './ExportUtils';
import LPReportPreview from './LPReportPreview';
import { useFundFilter, useMilestone } from './Layout';

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
  companyComments: { company: string; comment: string }[];
};

const monthlyReviewsHistory: MonthlyReviewRecord[] = [
  {
    id: 'mr-2026-03', date: 'Mar 10, 2026', month: 'March 2026', status: 'Complete', completedBy: 'Anna, Marcus',
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
    id: 'mr-2026-02', date: 'Feb 10, 2026', month: 'February 2026', status: 'Complete', completedBy: 'Anna, Sarah',
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
    id: 'mr-2026-01', date: 'Jan 10, 2026', month: 'January 2026', status: 'Complete', completedBy: 'Anna',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Post-holiday ramp. Team back and focused. Q1 targets set.' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'Burn crept up in December. Watching this month.' },
      { company: sortedCompanies[4]?.name || 'Co', comment: 'Preparing for product launch in Feb. Beta feedback positive.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Bridge round in progress. Expect to close within 2 weeks.' },
      { company: sortedCompanies[8]?.name || 'Co', comment: 'Steady state. No issues flagged.' },
    ],
  },
  {
    id: 'mr-2025-12', date: 'Dec 8, 2025', month: 'December 2025', status: 'Complete', completedBy: 'Full team',
    companyComments: [
      { company: sortedCompanies[0]?.name || 'Co', comment: 'Year-end close looking strong. ARR ahead of plan.' },
      { company: sortedCompanies[1]?.name || 'Co', comment: 'Solid Q4. Enterprise deals landing. Board happy.' },
      { company: sortedCompanies[2]?.name || 'Co', comment: 'New hire ramp increasing costs. Expected to level out in Q1.' },
      { company: sortedCompanies[3]?.name || 'Co', comment: 'Customer concentration risk flagged. Top 3 clients = 60% revenue.' },
      { company: sortedCompanies[5]?.name || 'Co', comment: 'Runway critical. Bridge round being coordinated. Syndicate lined up.' },
    ],
  },
  {
    id: 'mr-2025-11', date: 'Nov 10, 2025', month: 'November 2025', status: 'Complete', completedBy: 'Anna, Marcus',
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
    completedBy: 'Full team', duration: '2h 15min', exported: true,
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
    completedBy: 'Full team', duration: '1h 50min', exported: true,
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
    completedBy: 'Full team', duration: '1h 40min', exported: true,
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
    completedBy: 'Full team', duration: '2h 05min', exported: true,
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
    <div className="px-4 pb-4 pt-3 bg-slate-50/50 border-t border-slate-100 space-y-4">
      {/* Summary line */}
      <div className="flex items-center gap-4 text-[12px] text-slate-500">
        <span>By <span className="text-slate-700 font-medium">{review.completedBy}</span></span>
        <span>·</span>
        <span>Duration: {review.duration}</span>
        <span>·</span>
        <span>{review.companiesReviewed.length} companies reviewed</span>
        {review.exported && (
          <>
            <span>·</span>
            <span className="text-emerald-600 flex items-center gap-1"><Download className="w-3 h-3" /> Exported</span>
          </>
        )}
      </div>

      {/* Commentary */}
      {review.commentary && (
        <div className="bg-white rounded-lg border border-slate-200/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1">Review Summary</p>
          <p className="text-[12px] leading-relaxed text-slate-600">{review.commentary}</p>
        </div>
      )}

      {/* Two-column: RAG Changes + Metric Movements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">RAG Status Changes</p>
          {review.ragChanges.length > 0 ? (
            <div className="space-y-1.5">
              {review.ragChanges.map((rc, j) => (
                <div key={j} className="flex items-center gap-2 text-[12px]">
                  <span className="text-slate-700 font-medium min-w-[80px]">{rc.company}</span>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getRAGColor(rc.from) }} />
                  <span className="text-slate-400">→</span>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getRAGColor(rc.to) }} />
                  <span className="text-[11px] text-slate-400">{rc.from} → {rc.to}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">No RAG changes this review</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">Key Metric Movements</p>
          {review.metricMovements.length > 0 ? (
            <div className="space-y-1.5">
              {review.metricMovements.map((mm, j) => (
                <div key={j} className="flex items-center gap-2 text-[12px]">
                  <span className="text-slate-700 font-medium min-w-[80px]">{mm.company}</span>
                  <span className="text-slate-500">{mm.metric}:</span>
                  <span className="font-mono-num text-slate-500">{mm.from}</span>
                  <span className="text-slate-400">→</span>
                  <span className={`font-mono-num font-medium ${mm.direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>{mm.to}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">No significant metric movements</p>
          )}
        </div>
      </div>

      {/* Two-column: Flags + Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">Flags</p>
          <div className="space-y-1.5">
            {review.flagsRaised.map((f, j) => (
              <div key={`r-${j}`} className="flex items-start gap-2 text-[12px]">
                <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${f.urgency === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <span className="text-slate-600"><span className="font-medium text-slate-700">{f.company}:</span> {f.flag}</span>
              </div>
            ))}
            {review.flagsResolved.map((f, j) => (
              <div key={`v-${j}`} className="flex items-start gap-2 text-[12px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-500"><span className="font-medium text-slate-600">{f.company}:</span> {f.flag}</span>
              </div>
            ))}
            {review.flagsRaised.length === 0 && review.flagsResolved.length === 0 && (
              <p className="text-[11px] text-slate-400">No flag activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200/60 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">Actions Created</p>
          {review.actionsCreated.length > 0 ? (
            <div className="space-y-1.5">
              {review.actionsCreated.map((a, j) => (
                <div key={j} className="flex items-start gap-2 text-[12px]">
                  <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-600"><span className="font-medium text-slate-700">{a.company}:</span> {a.action} <span className="text-slate-400">→ {a.assignee}</span></span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">No actions created</p>
          )}
        </div>
      </div>

      {/* Per-company review details */}
      {review.companyReviews && review.companyReviews.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-3">Company Commentary</p>
          <div className="space-y-3">
            {review.companyReviews.map((cr, idx) => {
              const comp = sortedCompanies.find(c => c.name === cr.company);
              return (
                <div key={idx} className="bg-white rounded-lg border border-slate-200/60 p-3 space-y-2.5">
                  {/* Company header with send status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comp && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getRAGColor(comp.rag) }} />}
                      <span className="text-[13px] font-medium text-slate-800">{cr.company}</span>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${
                      cr.sendStatus === 'Sent' ? 'bg-emerald-50 text-emerald-700' :
                      cr.sendStatus === 'Draft' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-50 text-slate-500'
                    }`}>{cr.sendStatus}</span>
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-0.5">Comment</p>
                    <p className="text-[12px] leading-relaxed text-slate-600">{cr.comment}</p>
                  </div>

                  {/* Recent Progress */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-0.5">Recent Progress</p>
                    <p className="text-[12px] leading-relaxed text-slate-600">{cr.recentProgress}</p>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-0.5">Summary</p>
                    <p className="text-[12px] leading-relaxed text-slate-600">{cr.summary}</p>
                  </div>

                  {/* Concerns + Action Points + Induction Action in a row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-0.5">Key Concerns</p>
                      <p className="text-[12px] leading-relaxed text-slate-600">{cr.keyConcerns}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-0.5">Action Points</p>
                      <p className="text-[12px] leading-relaxed text-slate-600">{cr.actionPoints}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-0.5">Induction Action</p>
                      <p className="text-[12px] leading-relaxed text-slate-600">{cr.inductionAction}</p>
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
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">Companies Reviewed</p>
        <div className="flex flex-wrap gap-1.5">
          {review.companiesReviewed.map(name => {
            const comp = sortedCompanies.find(c => c.name === name);
            return (
              <button
                key={name}
                onClick={() => comp && navigate(`/company/${comp.id}`)}
                className="text-[11px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
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

// ══════════════════════════════════════════════════════════════════════
// ██ MONTHLY REVIEW ██
// ══════════════════════════════════════════════════════════════════════
export function MonthlyReview() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'list' | 'active' | 'detail'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [commentaries, setCommentaries] = useState<Record<string, string>>({});
  const [detailReview, setDetailReview] = useState<MonthlyReviewRecord | null>(null);

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

  // ── Determine current month label and whether an in-progress review exists ──
  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthShort = new Date().toLocaleString('default', { month: 'long' });
  const inProgressReview = monthlyReviewsHistory.find(r => r.status === 'In Progress');
  const hasCurrentMonth = monthlyReviewsHistory.some(r => r.month === currentMonthLabel);

  // ── Detail view (read-only past review) ───────────────────────────
  if (mode === 'detail' && detailReview) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => { setMode('list'); setDetailReview(null); }} className="text-[13px] text-slate-500 hover:text-slate-700 transition-colors">← Back to Reviews</button>
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-800">{detailReview.month} Review</h2>
          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
            detailReview.status === 'Complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>{detailReview.status}</span>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-4 text-[12px] text-slate-500 bg-white rounded-xl border border-slate-200/60 px-4 py-3">
          <span>By <span className="text-slate-700 font-medium">{detailReview.completedBy}</span></span>
          <span>·</span>
          <span>{detailReview.date}</span>
          <span>·</span>
          <span>{detailReview.companyComments.length} companies reviewed</span>
        </div>

        {/* Company-by-company read-only cards */}
        <div className="flex gap-4">
          {/* Left sidebar */}
          <div className="w-[220px] flex-shrink-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 mb-2">Companies</p>
            <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
              {detailReview.companyComments.map((cc, i) => {
                const comp = sortedCompanies.find(c => c.name === cc.company);
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full p-2.5 flex items-center gap-2 text-left transition-colors ${
                      isCurrent ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    {comp && <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] flex-shrink-0" style={{ background: comp.logoColor }}>{comp.name[0]}</div>}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] truncate ${isCurrent ? 'text-indigo-700 font-medium' : 'text-slate-700'}`}>{cc.company}</p>
                      {comp && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {comp.ragHistory.slice(-3).map((r, ri) => (
                            <div key={ri} className="w-2 h-2 rounded-full" style={{ background: getRAGColor(r) }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — read-only detail panel */}
          <div className="flex-1">
            {(() => {
              const cc = detailReview.companyComments[currentIndex];
              if (!cc) return null;
              const comp = sortedCompanies.find(c => c.name === cc.company);
              return (
                <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
                  {/* Company header */}
                  <div className="flex items-center gap-4">
                    {comp && (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px]" style={{ background: comp.logoColor }}>
                        {comp.name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[18px] font-semibold text-slate-800">{cc.company}</h2>
                        {comp && (
                          <>
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">{comp.stage}</span>
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">{comp.fund}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: getActionColor(comp.action) + '15', color: getActionColor(comp.action) }}>
                              {comp.action}
                            </span>
                          </>
                        )}
                      </div>
                      {comp && <p className="text-[13px] text-slate-500">{comp.description}</p>}
                    </div>
                  </div>

                  {/* Key metrics (read-only) */}
                  {comp && (
                    <div className="grid grid-cols-5 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">Health</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: getHealthColor(comp.health) }} />
                          <span className="text-[13px] text-slate-700">{comp.health}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">MRR</p>
                        <p className="text-[13px] mt-1 font-mono-num text-slate-700">{formatCurrency(comp.mrr, comp.currency)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">Burn</p>
                        <p className="text-[13px] mt-1 font-mono-num text-slate-700">{formatCurrency(comp.burn, comp.currency)}/mo</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">Runway</p>
                        <p className={`text-[13px] mt-1 font-mono-num ${comp.runway < 6 ? 'text-red-600' : 'text-slate-700'}`}>{comp.runway}mo</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">MoIC</p>
                        <p className="text-[13px] mt-1 font-mono-num text-slate-700">{comp.accounting.moic.toFixed(1)}x</p>
                      </div>
                    </div>
                  )}

                  {/* Commentary (read-only) */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Team Commentary</p>
                    <p className="text-[13px] leading-relaxed text-slate-700">{cc.comment}</p>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-[12px] text-slate-400">{currentIndex + 1} of {detailReview.companyComments.length}</span>
                    <button
                      onClick={() => setCurrentIndex(Math.min(detailReview.companyComments.length - 1, currentIndex + 1))}
                      disabled={currentIndex === detailReview.companyComments.length - 1}
                      className="text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-slate-800">Monthly Reviews</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Internal team review — step through companies, update RAG status, add notes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fundFilter}
              onChange={e => setFundFilter(e.target.value as any)}
              className="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Funds</option>
              {funds.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
            <button
              onClick={() => { setMode('active'); setCurrentIndex(0); setReviewed(new Set()); setSkipped(new Set()); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors"
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
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 mb-3">Review History</h3>
          <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100">
            {monthlyReviewsHistory.map((review) => (
              <button
                key={review.id}
                onClick={() => { setDetailReview(review); setCurrentIndex(0); setMode('detail'); }}
                className="w-full p-3.5 flex items-center gap-3 text-[13px] hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-slate-800">{review.month}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{review.date} · {review.completedBy}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="text-[12px] text-slate-500">{review.companyComments.length} companies</p>
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                    review.status === 'Complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>{review.status}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active monthly review flow ────────────────────────────────────
  return (
    <div className="max-w-[1100px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMode('list')} className="text-[13px] text-slate-500 hover:text-slate-700 transition-colors">← Back to Reviews</button>
        <h2 className="text-[18px] font-semibold tracking-tight text-slate-800">Monthly Internal Review</h2>
        <span className="text-[12px] text-slate-500">
          {reviewed.size + skipped.size} of {sortedCompanies.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className="bg-indigo-500 h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-4">
        {/* Left sidebar — company list for jumping */}
        <div className="w-[240px] flex-shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 mb-2">Companies</p>
          <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {sortedCompanies.map((c, i) => {
              const isReviewed = reviewed.has(c.id);
              const isSkipped = skipped.has(c.id);
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={c.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full p-2.5 flex items-center gap-2 text-left transition-colors ${
                    isCurrent ? 'bg-indigo-50 border-l-2 border-l-indigo-500' :
                    isReviewed ? 'bg-emerald-50/50' :
                    isSkipped ? 'bg-slate-50' :
                    'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] flex-shrink-0" style={{ background: c.logoColor }}>{c.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] truncate ${isCurrent ? 'text-indigo-700 font-medium' : 'text-slate-700'}`}>{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {c.ragHistory.slice(-3).map((r, ri) => (
                        <div key={ri} className="w-2 h-2 rounded-full" style={{ background: getRAGColor(r) }} />
                      ))}
                    </div>
                  </div>
                  {isReviewed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  {isSkipped && <SkipForward className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          {/* Summary counts */}
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> {reviewed.size}</span>
            <span className="flex items-center gap-1"><SkipForward className="w-3 h-3 text-slate-400" /> {skipped.size}</span>
            <span>{sortedCompanies.length - reviewed.size - skipped.size} remaining</span>
          </div>
        </div>

        {/* Right — main review area */}
        <div className="flex-1">
          {current && (
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px]" style={{ background: current.logoColor }}>
                  {current.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-semibold text-slate-800">{current.name}</h2>
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">{current.stage}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">{current.fund}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: getActionColor(current.action) + '15', color: getActionColor(current.action) }}>
                      {current.action}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500">{current.description}</p>
                </div>
              </div>

              {/* RAG History strip */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">RAG History</span>
                <div className="flex items-center gap-1.5">
                  {current.ragHistory.map((r, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ background: getRAGColor(r) }} title={`Q${i + 1}: ${r}`} />
                      <span className="text-[10px] text-slate-400">Q{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key metrics inline */}
              <div className="grid grid-cols-5 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-500">Health</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: getHealthColor(current.health) }} />
                    <span className="text-[13px] text-slate-700">{current.health}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-500">MRR</p>
                  <p className="text-[13px] mt-1 font-mono-num text-slate-700">{formatCurrency(current.mrr, current.currency)}</p>
                  <span className={`text-[11px] font-mono-num ${current.arrGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {current.arrGrowth >= 0 ? '+' : ''}{current.arrGrowth}%
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-500">Burn</p>
                  <p className="text-[13px] mt-1 font-mono-num text-slate-700">{formatCurrency(current.burn, current.currency)}/mo</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-500">Runway</p>
                  <p className={`text-[13px] mt-1 font-mono-num ${current.runway < 6 ? 'text-red-600' : 'text-slate-700'}`}>{current.runway}mo</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[11px] text-slate-500">MoIC</p>
                  <p className="text-[13px] mt-1 font-mono-num text-slate-700">{current.accounting.moic.toFixed(1)}x</p>
                </div>
              </div>

              {currentFlags.length > 0 && (
                <div>
                  <p className="text-[12px] text-slate-500 mb-2">Active Alerts</p>
                  {currentFlags.map(flag => (
                    <div key={flag.id} className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 mb-1">
                      <FlagIcon type={flag.type} size={14} />
                      <div>
                        <p className="text-[12px] text-slate-700">{flag.headline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-[12px] text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Team Commentary
                </label>
                <textarea
                  className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white resize-none h-20"
                  placeholder={`Add commentary for ${current.name}...`}
                  value={commentaries[current.id] || ''}
                  onChange={e => setCommentaries(prev => ({ ...prev, [current.id]: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleReview} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Mark Reviewed
                </button>
                <button onClick={handleSkip} className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] hover:bg-slate-50 flex items-center gap-1.5">
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
                <button onClick={() => navigate(`/company/${current.id}`)} className="ml-auto text-[12px] text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
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
  const [mode, setMode] = useState<'list' | 'active' | 'lp-report-preview' | 'detail'>('list');
  const [selectedFund, setSelectedFund] = useState(funds[0]);
  const [quarterlyStep, setQuarterlyStep] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [managersCommentary, setManagersCommentary] = useState('');
  const [otherDevelopments, setOtherDevelopments] = useState('');
  const [companyCommentary, setCompanyCommentary] = useState<Record<string, {
    recentProgress: string; rag: RAGStatus; summary: string; keyConcerns: string; actionPoints: string;
    equityFundraising: string; debtFundraising: string; burnReduction: string; nearTermExit: string; inductionAction: string;
  }>>({});
  const [detailReview, setDetailReview] = useState<ReviewRecord | null>(null);

  const { fundFilter, setFundFilter } = useFundFilter();
  const { milestone } = useMilestone();
  const isM1 = milestone === 'm1';

  // Mock founder submission data for Q1 2026
  const founderSubmissionStatus: Record<string, 'submitted' | 'partial' | 'sent' | 'not_sent'> = {
    '1': 'submitted', '2': 'sent', '3': 'sent', '4': 'partial', '5': 'not_sent',
  };
  const getFounderStatus = (id: string) => founderSubmissionStatus[id] ?? (parseInt(id) % 3 === 0 ? 'partial' : 'submitted');
  const founderStatusConfig = {
    submitted: { label: 'Submitted', dot: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    partial:   { label: 'Partial',   dot: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
    sent:      { label: 'Awaiting',  dot: '#6366f1', bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
    not_sent:  { label: 'Not sent',  dot: '#94a3b8', bg: 'bg-slate-50',   text: 'text-slate-400',   border: 'border-slate-200' },
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

  // ── Detail view (read-only past quarterly review) ──────────────────
  if (mode === 'detail' && detailReview) {
    const reviewCompanies = detailReview.companyReviews ?? [];
    const detailItems = reviewCompanies.length > 0
      ? reviewCompanies.map(cr => ({ company: cr.company, ...cr }))
      : detailReview.companiesReviewed.map(name => ({ company: name, comment: '', sendStatus: 'Sent' as const, recentProgress: '', summary: '', keyConcerns: '', actionPoints: '', inductionAction: '' }));

    return (
      <div className="max-w-[1100px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => { setMode('list'); setDetailReview(null); }} className="text-[13px] text-slate-500 hover:text-slate-700 transition-colors">← Back to Reviews</button>
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-800">{detailReview.quarter} Review</h2>
          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
            detailReview.status === 'Complete' ? 'bg-emerald-50 text-emerald-700' :
            detailReview.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
            'bg-slate-50 text-slate-500'
          }`}>{detailReview.status}</span>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-4 text-[12px] text-slate-500 bg-white rounded-xl border border-slate-200/60 px-4 py-3">
          <span>By <span className="text-slate-700 font-medium">{detailReview.completedBy}</span></span>
          <span>·</span>
          <span>{detailReview.date}</span>
          <span>·</span>
          <span>{detailReview.duration}</span>
          <span>·</span>
          <span>{detailReview.companies} companies · {detailReview.changes} RAG changes</span>
          {detailReview.exported && (
            <>
              <span>·</span>
              <span className="text-purple-600 flex items-center gap-1"><Download className="w-3 h-3" /> Exported</span>
            </>
          )}
        </div>

        {/* Commentary */}
        {detailReview.commentary && (
          <div className="bg-white rounded-xl border border-slate-200/60 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1">Review Summary</p>
            <p className="text-[13px] leading-relaxed text-slate-600">{detailReview.commentary}</p>
          </div>
        )}

        {/* Company-by-company read-only */}
        <div className="flex gap-4">
          {/* Left sidebar */}
          <div className="w-[220px] flex-shrink-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 mb-2">Companies</p>
            <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
              {detailItems.map((item, i) => {
                const comp = sortedCompanies.find(c => c.name === item.company);
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full p-2.5 flex items-center gap-2 text-left transition-colors ${
                      isCurrent ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    {comp && <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] flex-shrink-0" style={{ background: comp.logoColor }}>{comp.name[0]}</div>}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] truncate ${isCurrent ? 'text-indigo-700 font-medium' : 'text-slate-700'}`}>{item.company}</p>
                      {comp && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {comp.ragHistory.slice(-3).map((r, ri) => (
                            <div key={ri} className="w-2 h-2 rounded-full" style={{ background: getRAGColor(r) }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — read-only detail panel */}
          <div className="flex-1">
            {(() => {
              const item = detailItems[currentIndex];
              if (!item) return null;
              const comp = sortedCompanies.find(c => c.name === item.company);
              return (
                <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
                  {/* Company header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {comp && (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px]" style={{ background: comp.logoColor }}>
                          {comp.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[18px] font-semibold text-slate-800">{item.company}</h2>
                          {comp && (
                            <>
                              <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">{comp.stage}</span>
                              <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">{comp.fund}</span>
                            </>
                          )}
                        </div>
                        {comp && <p className="text-[13px] text-slate-500">{comp.description}</p>}
                      </div>
                    </div>
                    {item.sendStatus && (
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                        item.sendStatus === 'Sent' ? 'bg-emerald-50 text-emerald-700' :
                        item.sendStatus === 'Draft' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-50 text-slate-500'
                      }`}>{item.sendStatus}</span>
                    )}
                  </div>

                  {/* Key metrics (read-only) */}
                  {comp && (
                    <div className="grid grid-cols-5 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">MRR</p>
                        <p className="text-[13px] mt-1 font-mono-num text-slate-700">{formatCurrency(comp.mrr, comp.currency)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">ARR Growth</p>
                        <p className={`text-[13px] mt-1 font-mono-num ${comp.arrGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{comp.arrGrowth >= 0 ? '+' : ''}{comp.arrGrowth}%</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">Burn</p>
                        <p className="text-[13px] mt-1 font-mono-num text-slate-700">{formatCurrency(comp.burn, comp.currency)}/mo</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">Runway</p>
                        <p className={`text-[13px] mt-1 font-mono-num ${comp.runway < 6 ? 'text-red-600' : 'text-slate-700'}`}>{comp.runway}mo</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[11px] text-slate-500">Headcount</p>
                        <p className="text-[13px] mt-1 font-mono-num text-slate-700">{comp.headcount}</p>
                      </div>
                    </div>
                  )}

                  {/* Read-only commentary fields */}
                  {item.comment && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Comment</p>
                      <p className="text-[13px] leading-relaxed text-slate-700">{item.comment}</p>
                    </div>
                  )}

                  {item.recentProgress && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Recent Progress</p>
                      <p className="text-[13px] leading-relaxed text-slate-700">{item.recentProgress}</p>
                    </div>
                  )}

                  {item.summary && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Summary</p>
                      <p className="text-[13px] leading-relaxed text-slate-700">{item.summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {item.keyConcerns && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Key Concerns</p>
                        <p className="text-[12px] leading-relaxed text-slate-700">{item.keyConcerns}</p>
                      </div>
                    )}
                    {item.actionPoints && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Action Points</p>
                        <p className="text-[12px] leading-relaxed text-slate-700">{item.actionPoints}</p>
                      </div>
                    )}
                    {item.inductionAction && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-1.5">Induction Action</p>
                        <p className="text-[12px] leading-relaxed text-slate-700">{item.inductionAction}</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-[12px] text-slate-400">{currentIndex + 1} of {detailItems.length}</span>
                    <button
                      onClick={() => setCurrentIndex(Math.min(detailItems.length - 1, currentIndex + 1))}
                      disabled={currentIndex === detailItems.length - 1}
                      className="text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-slate-800">Quarterly Reviews</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Full team review — add commentary per company, then export Asset Metrix XLSX{!isM1 && ' or LP Report PDF'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fundFilter}
              onChange={e => setFundFilter(e.target.value as any)}
              className="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Funds</option>
              {funds.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
            <button
              onClick={() => { setMode('active'); setCurrentIndex(0); setQuarterlyStep(1); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors"
            >
              {inProgressQuarterly ? (
                <><FileText className="w-3.5 h-3.5" /> Edit {inProgressQuarterly.quarter} Review</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> Start {currentQuarterLabel} Review</>
              )}
            </button>
          </div>
        </div>

        {/* Upcoming / Current quarter callout */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-indigo-900">{currentQuarterLabel} — Ready for Review</p>
              <p className="text-[12px] text-indigo-600 mt-0.5">
                {sortedCompanies.length} companies · Founder data collection {Math.round(sortedCompanies.length * 0.6)} of {sortedCompanies.length} submitted
              </p>
            </div>
          </div>
          <button
            onClick={() => { setMode('active'); setCurrentIndex(0); setQuarterlyStep(1); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors"
          >
            Begin Review <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Review history list */}
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 mb-3">Past Quarterly Reviews</h3>
          <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100">
            {quarterlyReviewsHistory.map((review) => (
              <button
                key={review.id}
                onClick={() => { setDetailReview(review); setCurrentIndex(0); setMode('detail'); }}
                className="w-full p-3.5 flex items-center gap-3 text-[13px] hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4.5 h-4.5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-slate-800">{review.quarter}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{review.date} · {review.completedBy} · {review.duration}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[12px] text-slate-700">{review.companies} companies</p>
                    <p className="text-[11px] text-slate-400">{review.changes} RAG changes</p>
                  </div>
                  {review.exported && (
                    <span className="text-[11px] px-2.5 py-1 rounded-lg font-medium bg-purple-50 text-purple-700 flex items-center gap-1">
                      <Download className="w-3 h-3" /> Exported
                    </span>
                  )}
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                    review.status === 'Complete' ? 'bg-emerald-50 text-emerald-700' :
                    review.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-50 text-slate-500'
                  }`}>{review.status}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
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
        <button onClick={() => setMode('list')} className="text-[13px] text-slate-500 hover:text-slate-700 transition-colors">← Back to Reviews</button>
        <h2 className="text-[18px] font-semibold tracking-tight text-slate-800">
          {isM1 ? 'Q1 2026 Quarterly Review' : 'Q1 2026 LP Report'}
        </h2>
        {!isM1 && <span className="text-[12px] text-slate-500">Step {quarterlyStep} of 2</span>}
        {isM1 && (
          <button
            onClick={() => { generateAssetMetrixXLSX(selectedFund, companies); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Asset Metrix
          </button>
        )}
      </div>

      {/* 2-step stepper (hidden in M1) */}
      {!isM1 && <div className="flex items-center gap-2">
        {steps.map((s) => (
          <button key={s.num} onClick={() => setQuarterlyStep(s.num)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-medium transition-all ${
              quarterlyStep === s.num ? 'bg-indigo-500 text-white ring-2 ring-indigo-500 ring-offset-2' :
              quarterlyStep > s.num ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
            {quarterlyStep > s.num ? <CheckCircle className="w-3.5 h-3.5" /> : (
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">{s.num}</span>
            )}
            {s.label}
          </button>
        ))}
      </div>}

      {/* ── Step 1: Team Commentary — sidebar + main panel ─────── */}
      {quarterlyStep === 1 && (
        <div className="flex gap-4">
          {/* Left sidebar */}
          <div className="w-[220px] flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Companies</p>
              <span className="text-[11px] text-slate-500">{doneCount}/{sortedCompanies.length} done</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
              {sortedCompanies.map((c, i) => {
                const isCurrent = i === currentIndex;
                const done = isCommentaryDone(c.id);
                const fStatus = getFounderStatus(c.id);
                const fCfg = founderStatusConfig[fStatus];
                return (
                  <button
                    key={c.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full p-2.5 flex items-center gap-2 text-left transition-colors ${
                      isCurrent ? 'bg-indigo-50 border-l-2 border-l-indigo-500' :
                      done ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] flex-shrink-0" style={{ background: c.logoColor }}>{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] truncate ${isCurrent ? 'text-indigo-700 font-medium' : 'text-slate-700'}`}>{c.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getRAGColor(c.rag) }} title={c.rag} />
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fCfg.dot }} title={`Founder: ${fCfg.label}`} />
                        <span className="text-[10px] text-slate-400 truncate">{c.stage}</span>
                      </div>
                    </div>
                    {done && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-300" />RAG status
                <div className="w-2 h-2 rounded-full bg-indigo-400 ml-2" />Founder form
              </div>
            </div>
          </div>

          {/* Right — company commentary panel */}
          {qCurrent && (
            <div className="flex-1 min-w-0 space-y-3">
              {/* Company header */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[16px] flex-shrink-0" style={{ background: qCurrent.logoColor }}>
                    {qCurrent.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[17px] font-semibold text-slate-800">{qCurrent.name}</h2>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: getRAGColor(qCurrent.rag) }} title={qCurrent.rag} />
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">{qCurrent.stage}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">{qCurrent.fund}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {(qCurrent.ownerAvatars || []).map((a: string, i: number) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px]">{a}</div>
                        ))}
                        <span className="text-[11px] text-slate-500">{qCurrent.owners.join(', ')}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5">{qCurrent.description}</p>
                  </div>
                  <button onClick={() => navigate(`/company/${qCurrent.id}`)} className="text-[11px] text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5 flex-shrink-0">
                    Full detail <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* KPIs strip */}
                <div className="grid grid-cols-6 gap-2 mt-3">
                  {[
                    { label: 'MRR', value: formatCurrency(qCurrent.mrr, qCurrent.currency) },
                    { label: 'ARR', value: formatCurrency(qCurrent.mrr * 12, qCurrent.currency) },
                    { label: 'Burn/mo', value: formatCurrency(qCurrent.burn, qCurrent.currency) },
                    { label: 'Runway', value: qCurrent.runway + ' mo', red: qCurrent.runway < 6 },
                    { label: 'Headcount', value: qCurrent.headcount.toString() },
                    { label: 'Customers', value: qCurrent.customers.toString() },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400">{m.label}</p>
                      <p className={`text-[13px] font-semibold font-mono-num mt-0.5 ${m.red ? 'text-red-600' : 'text-slate-700'}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Founder submission panel */}
              {(() => {
                const fStatus = getFounderStatus(qCurrent.id);
                const fCfg = founderStatusConfig[fStatus];
                return (
                  <div className={`rounded-xl border p-3.5 ${fCfg.bg} ${fCfg.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-medium text-slate-700">Founder Submission — Q1 2026</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${fCfg.bg} ${fCfg.text} ${fCfg.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: fCfg.dot }} />
                          {fCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(fStatus === 'submitted' || fStatus === 'partial') && (
                          <button onClick={() => navigate(`/form/${qCurrent.id}`)} className="text-[11px] text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5">
                            View form <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg transition-colors ${
                          fStatus === 'not_sent'
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>
                          <Send className="w-3 h-3" />
                          {fStatus === 'not_sent' ? 'Send form' : fStatus === 'sent' ? 'Resend reminder' : 'Resend form'}
                        </button>
                      </div>
                    </div>
                    {(fStatus === 'submitted' || fStatus === 'partial') ? (
                      <div className="overflow-hidden rounded-lg border border-white/80 max-h-[420px] overflow-y-auto">
                        <table className="w-full text-[11px]">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-white/90 backdrop-blur border-b border-slate-100/50">
                              <th className="text-left px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] w-[160px]">Metric</th>
                              {['Jan 2026', 'Feb 2026', 'Mar 2026'].map(m => (
                                <th key={m} className="text-right px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em]">{m}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const allMetrics: { label: string; key: string; isCurrency: boolean; isPercentage?: boolean; section: string }[] = [
                                { label: 'Revenue (core)', key: 'revenue', isCurrency: true, section: 'Revenue & Growth' },
                                { label: 'Revenue (other)', key: 'revenueOther', isCurrency: true, section: 'Revenue & Growth' },
                                { label: 'ARR', key: 'arr', isCurrency: true, section: 'Revenue & Growth' },
                                { label: 'Bookings', key: 'bookings', isCurrency: true, section: 'Revenue & Growth' },
                                { label: 'No. of Customers', key: 'customerCount', isCurrency: false, section: 'Revenue & Growth' },
                                { label: 'Net Retention Rate %', key: 'netRetentionRate', isCurrency: false, isPercentage: true, section: 'Revenue & Growth' },
                                { label: 'Cost of Sales', key: 'cogs', isCurrency: true, section: 'Costs' },
                                { label: 'R&D Costs', key: 'rdCosts', isCurrency: true, section: 'Costs' },
                                { label: 'Sales & Marketing', key: 'salesMarketingCosts', isCurrency: true, section: 'Costs' },
                                { label: 'General & Admin', key: 'generalAdminCosts', isCurrency: true, section: 'Costs' },
                                { label: 'EBITDA / (LBITDA)', key: 'ebitda', isCurrency: true, section: 'Profitability' },
                                { label: 'Cash Balance', key: 'cashBalance', isCurrency: true, section: 'Cash Position' },
                                { label: 'Net Assets / (Liabilities)', key: 'netAssetsLiabilities', isCurrency: true, section: 'Cash Position' },
                                { label: 'Cash Burn in Month', key: 'monthlyNetBurn', isCurrency: true, section: 'Cash Position' },
                                { label: 'Headcount — Male (FTE)', key: 'headcountMale', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Headcount — Female (FTE)', key: 'headcountFemale', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Headcount — Ethnic Minority (FTE)', key: 'headcountEthnicMinority', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Board — Male', key: 'boardMale', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Board — Female', key: 'boardFemale', isCurrency: false, section: 'Team & Diversity' },
                                { label: 'Board — Ethnic Minority', key: 'boardEthnicMinority', isCurrency: false, section: 'Team & Diversity' },
                              ];
                              let lastSection = '';
                              return allMetrics.map(metric => {
                                const showSection = metric.section !== lastSection;
                                lastSection = metric.section;
                                return (
                                  <>
                                    {showSection && (
                                      <tr key={`section-${metric.section}`}>
                                        <td colSpan={4} className="px-2.5 pt-2 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em] bg-slate-50/30 border-t border-slate-100/50">
                                          {metric.section}
                                        </td>
                                      </tr>
                                    )}
                                    <tr key={metric.key} className="hover:bg-white/40 border-t border-slate-50/50">
                                      <td className="px-2.5 py-1 text-slate-600">{metric.label}</td>
                                      {['2026-01', '2026-02', '2026-03'].map(iso => {
                                        const mData = qCurrent.monthlyFinancials.find((f: any) => f.month === iso);
                                        const val = mData?.[metric.key as keyof typeof mData];
                                        return (
                                          <td key={iso} className="px-2.5 py-1 text-right font-mono-num text-slate-700">
                                            {val != null
                                              ? metric.isCurrency ? formatCurrency(val as number, qCurrent.currency)
                                              : metric.isPercentage ? val + '%'
                                              : val.toString()
                                              : <span className="text-slate-300">—</span>
                                            }
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  </>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : fStatus === 'sent' ? (
                      <p className="text-[12px] text-slate-500">Form sent — awaiting founder response. You can send a reminder or proceed with last known values.</p>
                    ) : (
                      <p className="text-[12px] text-slate-500">No form has been sent to this founder for Q1 2026. Send the form to collect validated data.</p>
                    )}
                  </div>
                );
              })()}

              {/* Alerts */}
              {qCurrentFlags.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                  <p className="text-[11px] font-medium text-amber-700 uppercase tracking-[0.06em]">Active Alerts</p>
                  {qCurrentFlags.map(flag => (
                    <div key={flag.id} className="flex items-start gap-2">
                      <FlagIcon type={flag.type} size={13} />
                      <p className="text-[12px] text-slate-700">{flag.headline}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Team Commentary fields */}
              {(() => {
                const cc = companyCommentary[qCurrent.id] || {
                  recentProgress: qCurrent.recentProgress, rag: qCurrent.rag, summary: qCurrent.summary,
                  keyConcerns: qCurrent.keyConcerns.join('\n'), actionPoints: qCurrent.actionPoints.join('\n'),
                  equityFundraising: qCurrent.equityFundraisingStatus, debtFundraising: qCurrent.debtFundraisingStatus,
                  burnReduction: qCurrent.burnReductionActions, nearTermExit: qCurrent.nearTermExit,
                };
                const update = (field: string, value: string) => setCompanyCommentary(prev => ({
                  ...prev,
                  [qCurrent.id]: { ...(prev[qCurrent.id] || cc), [field]: value },
                }));
                const summaryWords = (cc.summary || '').split(/\s+/).filter(Boolean).length;
                const concernsWords = (cc.keyConcerns || '').split(/\s+/).filter(Boolean).length;
                const actionsWords = (cc.actionPoints || '').split(/\s+/).filter(Boolean).length;

                return (
                  <div className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-3">
                    <p className="text-[12px] font-medium text-slate-700">Team Commentary</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500">RAG Status</label>
                        <select
                          className="w-full text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 mt-1 bg-white"
                          defaultValue={cc.rag}
                          onChange={e => update('rag', e.target.value)}
                        >
                          <option>Green</option><option>Amber</option><option>Red</option><option>Grey</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500">Equity Fundraising</label>
                        <input
                          className="w-full text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 mt-1 bg-white"
                          defaultValue={cc.equityFundraising}
                          onBlur={e => update('equityFundraising', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500">Debt Fundraising</label>
                        <input
                          className="w-full text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 mt-1 bg-white"
                          defaultValue={cc.debtFundraising}
                          onBlur={e => update('debtFundraising', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500">Recent Progress</label>
                      <textarea
                        className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white resize-none h-12"
                        defaultValue={cc.recentProgress}
                        onBlur={e => update('recentProgress', e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-500">Summary <span className="text-red-400">*</span></label>
                        <span className={`text-[10px] font-mono-num ${summaryWords < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>{summaryWords} words</span>
                      </div>
                      <textarea
                        className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white resize-none h-16"
                        defaultValue={cc.summary}
                        onBlur={e => update('summary', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-slate-500">Key Concerns <span className="text-red-400">*</span></label>
                          <span className={`text-[10px] font-mono-num ${concernsWords < 5 ? 'text-amber-500' : 'text-emerald-500'}`}>{concernsWords} words</span>
                        </div>
                        <textarea
                          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white resize-none h-20"
                          defaultValue={cc.keyConcerns}
                          onBlur={e => update('keyConcerns', e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-slate-500">Action Points</label>
                          <span className={`text-[10px] font-mono-num ${actionsWords < 5 ? 'text-amber-500' : 'text-slate-400'}`}>{actionsWords} words</span>
                        </div>
                        <textarea
                          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white resize-none h-20"
                          defaultValue={cc.actionPoints}
                          onBlur={e => update('actionPoints', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500">Induction Action</label>
                        <textarea
                          className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white resize-none h-20"
                          defaultValue={cc.inductionAction}
                          onBlur={e => update('inductionAction', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500">Burn Reduction Actions</label>
                        <input className="w-full text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 mt-1 bg-white" defaultValue={cc.burnReduction} onBlur={e => update('burnReduction', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500">Near-term Exit</label>
                        <input className="w-full text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 mt-1 bg-white" defaultValue={cc.nearTermExit} onBlur={e => update('nearTermExit', e.target.value)} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-slate-400">{currentIndex + 1} of {sortedCompanies.length}</span>
                  {currentIndex < sortedCompanies.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors"
                    >
                      Next company →
                    </button>
                  ) : !isM1 ? (
                    <button
                      onClick={() => setQuarterlyStep(2)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-[13px] hover:bg-indigo-600 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Finish & Export
                    </button>
                  ) : (
                    <button
                      onClick={() => { setCurrentIndex(0); }}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[13px] hover:bg-slate-200 transition-colors"
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
            <h3 className="text-[18px] mb-2 text-slate-700 font-semibold">Ready to Export</h3>
            <p className="text-[13px] text-slate-500 mb-4">
              Q1 2026 data is ready. {activeCompanies.length} companies reviewed. Export Asset Metrix XLSX or optionally generate LP Report PDF.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/60 p-3">
            <label className="text-[12px] text-slate-500">Export for:</label>
            <select
              className="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
              value={selectedFund.id}
              onChange={e => setSelectedFund(funds.find(f => f.id === e.target.value) || funds[0])}
            >
              {funds.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.currency} · {f.vintage})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => { generateAssetMetrixXLSX(selectedFund, companies); }}
              className="bg-white border-2 border-primary/30 rounded-xl p-5 hover:shadow-lg hover:border-primary/50 transition-all text-left ring-2 ring-primary/10 relative"
            >
              <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-indigo-500 text-white rounded-full font-medium">Primary</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-[14px] mb-1 text-slate-700 font-medium">Asset Metrix XLSX</h3>
              <p className="text-[11px] text-slate-500">Multi-sheet XLSX matching Asset Metrix template: Company Commentary, Static Data, and Periodic KPIs.</p>
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1"><Download className="w-3 h-3" /> Download XLSX</p>
            </button>
            <button
              onClick={() => setMode('lp-report-preview')}
              className="bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow text-left relative"
            >
              <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">Optional</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Printer className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-[14px] mb-1 text-slate-700 font-medium">LP Report PDF</h3>
              <p className="text-[11px] text-slate-500">Full quarterly report matching Crane structure: cover, standing data, commentary, company snapshots.</p>
              <p className="text-[11px] text-indigo-600 mt-2 flex items-center gap-1">Preview & Print →</p>
            </button>
            <button
              onClick={() => { const csv = generateFundSummaryCSV(selectedFund); downloadCSV(csv, `${selectedFund.name.replace(/\s/g, '_')}_Fund_Summary_Q1_2026.csv`); }}
              className="bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow text-left relative"
            >
              <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">Optional</div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-[14px] mb-1 text-slate-700 font-medium">Fund Summary CSV</h3>
              <p className="text-[11px] text-slate-500">TVPI history, NAV waterfall, uses of funds, geographic distribution. Full fund data export.</p>
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1"><Download className="w-3 h-3" /> Download CSV</p>
            </button>
          </div>

          <div className="flex justify-between">
            <button onClick={() => { setQuarterlyStep(1); setCurrentIndex(0); }} className="text-[13px] text-slate-500">← Back to Commentary</button>
            <button onClick={() => setMode('list')} className="px-4 py-2 border border-slate-200 rounded-lg text-[13px]">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legacy export for backwards compatibility ─────────────────────────
export function PortfolioReview() {
  return <MonthlyReview />;
}
