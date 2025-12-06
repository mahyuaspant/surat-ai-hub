import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PublicForm from "./pages/PublicForm";
import SignLetter from "./pages/SignLetter";
import VerifyLetter from "./pages/VerifyLetter";
import IncomingLetters from "./pages/IncomingLetters";
import OutgoingLetters from "./pages/OutgoingLetters";
import NewOutgoingLetter from "./pages/NewOutgoingLetter";
import Dispositions from "./pages/Dispositions";
import UserManagement from "./pages/UserManagement";
import LetterDetail from "./pages/LetterDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/incoming" element={<IncomingLetters />} />
          <Route path="/dashboard/outgoing" element={<OutgoingLetters />} />
          <Route path="/dashboard/outgoing/new" element={<NewOutgoingLetter />} />
          <Route path="/dashboard/letter/:letterId" element={<LetterDetail />} />
          <Route path="/dashboard/disposition" element={<Dispositions />} />
          <Route path="/dashboard/users" element={<UserManagement />} />
          <Route path="/form/:slug" element={<PublicForm />} />
          <Route path="/sign/:letterId?" element={<SignLetter />} />
          <Route path="/verify/:letterId" element={<VerifyLetter />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
