import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Vibe Plan Forge
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Please <Link to="/auth" className="text-primary hover:text-primary-glow underline">sign in</Link> to access your workspace
        </p>
      </div>
    </div>
  );
};

export default NotFound;
