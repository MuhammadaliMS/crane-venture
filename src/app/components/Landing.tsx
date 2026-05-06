import { useMilestone } from './Layout';
import { IntelligenceHub } from './IntelligenceHub';
import { PortfolioCommandCenter } from './PortfolioCommandCenter';

// Landing page switcher.
// In M1, the Intelligence Hub isn't shipped yet, so the index route renders
// the Command Center. In Full MVP, the Intelligence Hub is the landing page.
export function Landing() {
  const { milestone } = useMilestone();
  if (milestone === 'm1') {
    return <PortfolioCommandCenter />;
  }
  return <IntelligenceHub />;
}
