import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

export default Home;