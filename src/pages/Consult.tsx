import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/** Legacy /consult URL → pre-enrollment wizard. */
const Consult = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/consult/start", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
      <Footer />
    </div>
  );
};

export default Consult;
