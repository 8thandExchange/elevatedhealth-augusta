import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  const isProviderContext =
    location.pathname.startsWith("/provider/") ||
    location.pathname.startsWith("/admin/") ||
    location.pathname.startsWith("/office-manager") ||
    location.pathname.startsWith("/business");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  if (isProviderContext) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <p className="section-label mb-4">404</p>
          <h1 className="font-playfair text-5xl text-foreground mb-4">Page not found</h1>
          <p className="font-jost text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link to="/provider/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Provider Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/login">Provider Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page-shell">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md premium-card-muted p-10 md:p-12">
          <p className="section-label mb-4">404</p>
          <h1 className="font-playfair text-5xl md:text-6xl text-foreground mb-4">Page not found</h1>
          <p className="font-jost text-muted-foreground mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild size="lg">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
