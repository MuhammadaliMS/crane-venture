import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { PortfolioCommandCenter } from './components/PortfolioCommandCenter';
import { ActionMatrix } from './components/ActionMatrix';
import { CompanyDetail } from './components/CompanyDetail';
import { QuarterlyReview } from './components/PortfolioReview';
import { IntelligenceHub } from './components/IntelligenceHub';
import { Landing } from './components/Landing';
import { Settings } from './components/Settings';
import { FounderForm } from './components/FounderForm';
import { FounderData } from './components/FounderData';
import { SignIn } from './components/SignIn';

export const router = createBrowserRouter([
  {
    path: 'signin',
    Component: SignIn,
  },
  {
    path: 'form/:token',
    Component: FounderForm,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: 'intelligence', Component: IntelligenceHub },
      { path: 'portfolio', Component: PortfolioCommandCenter },
      { path: 'matrix', Component: ActionMatrix },
      { path: 'company/:id', Component: CompanyDetail },
      { path: 'review/quarterly', Component: QuarterlyReview },
      { path: 'founder-data', Component: FounderData },
      { path: 'settings', Component: Settings },
    ],
  },
]);
