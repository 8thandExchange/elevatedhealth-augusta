import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { serveElevatedComboCheckout } from "../_shared/elevated-combo-checkout-shared.ts";

serve((req) => serveElevatedComboCheckout(req, "create-elevated-combo-checkout"));
