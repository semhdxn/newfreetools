import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from '@/pages/Home';
import SensoryTool from '@/tools/SensoryTool';
import BehaviourTool from '@/tools/BehaviourTool';
import HomeBehaviourTool from '@/tools/HomeBehaviourTool';
import StudentVoiceTool from '@/tools/StudentVoiceTool';
import MwmTool from '@/tools/MwmTool';
import { AdsenseLoader } from '@/components/AdsenseLoader';
import { Header } from '@/components/Header';

/**
 * HashRouter keeps the build deployable as plain static files (any folder, any
 * host) without server rewrite rules.
 */
export default function App() {
  return (
    <HashRouter>
      {/* Needs router context (useLocation) to know which route it's on, so it
          renders inside HashRouter alongside the routes it's gating. */}
      <AdsenseLoader />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sensory" element={<SensoryTool />} />
        <Route path="/behaviour" element={<BehaviourTool />} />
        <Route path="/home-behaviour" element={<HomeBehaviourTool />} />
        <Route path="/student-voice" element={<StudentVoiceTool />} />
        <Route path="/mwm" element={<MwmTool />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}
