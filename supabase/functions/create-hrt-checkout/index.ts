import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { serveFixedElevatedProgramCheckout } from "../_shared/elevated-program-checkout-shared.ts";

serve((req) => serveFixedElevatedProgramCheckout("hrt", req, "create-hrt-checkout"));
