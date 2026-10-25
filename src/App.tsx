import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home';
import Privacy from '@/pages/Privacy';
import Faq from '@/pages/Faq';
import SensoryTool from '@/tools/SensoryTool';
import BehaviourTool from '@/tools/BehaviourTool';
import HomeBehaviourTool from '@/tools/HomeBehaviourTool';
import StudentVoiceTool from '@/tools/StudentVoiceTool';
import MwmTool from '@/tools/MwmTool';
import ChronologyTool from '@/tools/ChronologyTool';
import { AdsenseLoader } from '@/components/AdsenseLoader';
import { AnalyticsLoader } from '@/components/AnalyticsLoader';
import { Header } from '@/components/Header';
import { RouteMeta } from '@/components/RouteMeta';

/**
 * BrowserRouter gives every tool a real URL (/sensory, /behaviour, ...) that search
 * engines can index. `npm run build` also writes a static copy of index.html per route
 * (scripts/prerender.mjs), and Amplify needs a 404-to-index.html rewrite so any other
 * deep link still loads the app.
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Needs router context (useLocation) to know which route it's on, so it
          renders inside the router alongside the routes it's gating. */}
      <RouteMeta />
      <AdsenseLoader />
      <AnalyticsLoader />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/sensory" element={<SensoryTool />} />
        <Route path="/behaviour" element={<BehaviourTool />} />
        <Route path="/home-behaviour" element={<HomeBehaviourTool />} />
        <Route path="/student-voice" element={<StudentVoiceTool />} />
        <Route path="/mwm" element={<MwmTool />} />
        <Route path="/chronology" element={<ChronologyTool />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
