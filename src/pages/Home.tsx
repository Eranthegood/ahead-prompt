import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "@/components/LandingPage";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Allow both authenticated and non-authenticated users to see homepage

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <LandingPage />;
};

export default Home;