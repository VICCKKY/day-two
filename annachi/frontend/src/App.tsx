import type { ReactElement } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { STATIC_DEMO } from "./api";
import { AppProvider, useApp } from "./context";
import { Account } from "./pages/Account";
import { Feed } from "./pages/Feed";
import { LeadDetail } from "./pages/LeadDetail";
import { Login } from "./pages/Login";
import { Membership } from "./pages/Membership";
import { MyLeads } from "./pages/MyLeads";
import { Profile } from "./pages/Profile";
import { Support } from "./pages/Support";
import { Wallet } from "./pages/Wallet";

/** Flow from the spec: Login → Profile → Membership → Lead feed. */
function Guard({ children, needMembership = true }: { children: ReactElement; needMembership?: boolean }) {
  const { me, loading } = useApp();
  if (loading) return <div className="loading">…</div>;
  if (!me) return <Navigate to="/login" replace />;
  if (!me.profile_complete) return <Navigate to="/profile" replace />;
  if (needMembership && !me.membership_active) return <Navigate to="/membership" replace />;
  return children;
}

function ProfileGuard() {
  const { me, loading } = useApp();
  if (loading) return <div className="loading">…</div>;
  return me ? <Profile /> : <Navigate to="/login" replace />;
}

function LoginRoute() {
  const { me } = useApp();
  return me ? <Navigate to="/" replace /> : <Login />;
}

// Static demo uses hash URLs so it works in any folder of shared hosting without rewrite rules.
const Router = STATIC_DEMO ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/profile" element={<ProfileGuard />} />
          <Route path="/membership" element={<Guard needMembership={false}><Membership /></Guard>} />
          <Route path="/" element={<Guard><Feed /></Guard>} />
          <Route path="/lead/:id" element={<Guard><LeadDetail /></Guard>} />
          <Route path="/wallet" element={<Guard needMembership={false}><Wallet /></Guard>} />
          <Route path="/my-leads" element={<Guard><MyLeads /></Guard>} />
          <Route path="/support" element={<Guard needMembership={false}><Support /></Guard>} />
          <Route path="/account" element={<Guard needMembership={false}><Account /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
