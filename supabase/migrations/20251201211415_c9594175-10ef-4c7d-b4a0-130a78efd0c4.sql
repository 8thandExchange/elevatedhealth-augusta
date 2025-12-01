-- Create the calculate_symptom_scores function
CREATE OR REPLACE FUNCTION public.calculate_symptom_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_symptoms JSONB;
  estrogen_total INTEGER := 0;
  androgen_total INTEGER := 0;
  has_androgen_excess BOOLEAN := FALSE;
  current_flags JSONB;
BEGIN
  -- Get the raw_answers from the new row
  raw_symptoms := NEW.raw_answers->'symptoms';
  
  -- Calculate Estrogen Score: hot_flashes + night_sweats + vaginal_dryness + foggy_thinking + heart_palpitations
  estrogen_total := COALESCE((raw_symptoms->>'hot_flashes')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'night_sweats')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'vaginal_dryness')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'foggy_thinking')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'heart_palpitations')::INTEGER, 0);
  
  -- Calculate Androgen Score: low_libido + muscle_loss + fatigue + thinning_skin
  androgen_total := COALESCE((raw_symptoms->>'low_libido')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'muscle_loss')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'fatigue')::INTEGER, 0)
                  + COALESCE((raw_symptoms->>'thinning_skin')::INTEGER, 0);
  
  -- Safety Check: If acne > 1 OR facial_hair > 1, set androgen_excess_risk to TRUE
  IF COALESCE((raw_symptoms->>'acne')::INTEGER, 0) > 1 
     OR COALESCE((raw_symptoms->>'facial_hair')::INTEGER, 0) > 1 THEN
    has_androgen_excess := TRUE;
  END IF;
  
  -- Update the scores
  NEW.estrogen_score := estrogen_total;
  NEW.androgen_score := androgen_total;
  
  -- Update safety flags if androgen excess detected
  IF has_androgen_excess THEN
    current_flags := COALESCE(NEW.raw_answers->'safety', '{}'::JSONB);
    NEW.raw_answers := jsonb_set(
      NEW.raw_answers,
      '{androgen_excess_risk}',
      'true'::JSONB
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run on every insert to symptom_logs
DROP TRIGGER IF EXISTS trigger_calculate_symptom_scores ON public.symptom_logs;

CREATE TRIGGER trigger_calculate_symptom_scores
  BEFORE INSERT ON public.symptom_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_symptom_scores();