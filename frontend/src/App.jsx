import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./shared/components/Layout";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import { AuthProvider } from "./shared/context/AuthContext";
import { ToastProvider } from "./shared/context/ToastContext";

const Landing = lazy(() => import("./features/landing/pages/Landing"));
const NotFound = lazy(() => import("./features/landing/pages/NotFound"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Signup = lazy(() => import("./features/auth/pages/Signup"));
const ForgotPassword = lazy(() => import("./features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./features/auth/pages/ResetPassword"));
const Dashboard = lazy(() => import("./features/dashboard/pages/Dashboard"));
const Interviews = lazy(() => import("./features/interviews/pages/Interviews"));
const Resume = lazy(() => import("./features/resume/pages/Resume"));
const MockInterview = lazy(() => import("./features/mockInterview/pages/MockInterview"));
const DSAPractice = lazy(() => import("./features/dsa/pages/DSAPractice"));
const Companies = lazy(() => import("./features/companies/pages/Companies"));
const Profile = lazy(() => import("./features/profile/pages/Profile"));
const Chat = lazy(() => import("./features/chat/pages/Chat"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Persistent shell: Sidebar + Topbar mount once here and
                    stay mounted across every navigation below - only the
                    <Outlet/> content swaps between pages. */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/interviews" element={<Interviews />} />
                  <Route path="/mock-interview" element={<MockInterview />} />
                  <Route path="/resume" element={<Resume />} />
                  <Route path="/dsa" element={<DSAPractice />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/chat" element={<Chat />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
