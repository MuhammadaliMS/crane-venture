import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PortfolioCommandCenter } from './components/PortfolioCommandCenter';
import { ActionMatrix } from './components/ActionMatrix';
import { CompanyDetail } from './components/CompanyDetail';
import { QuarterlyReview } from './components/PortfolioReview';
import { SearchDiscovery } from './components/SearchDiscovery';
import { IntelligenceHub } from './components/IntelligenceHub';
import { Settings } from './components/Settings';
import { FounderForm } from './components/FounderForm';
import { FounderData } from './components/FounderData';

export const router = createBrowserRouter([
  {
    path: 'form/:token',
    Component: FounderForm,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'portfolio', Component: PortfolioCommandCenter },
      { path: 'matrix', Component: ActionMatrix },
      { path: 'company/:id', Component: CompanyDetail },
      { path: 'review/quarterly', Component: QuarterlyReview },
      { path: 'founder-data', Component: FounderData },
      { path: 'search', Component: SearchDiscovery },
      { path: 'intelligence', Component: IntelligenceHub },
      { path: 'settings', Component: Settings },
    ],
  },
]);
