

## Fix Patient Journey Display for Existing Patients

### Problem Summary
Two issues identified in the "Add Existing Patient" flow:

1. **Journey Tracker shows all steps completed** - When adding Melissa Stokes with status "Active on Treatment", the tracker shows all 7 steps (Consult → Kit → Sample → Labs → Protocol → Rx → Active) as green checkmarks. This is inaccurate because existing patients may not have gone through the diagnostic kit flow.

2. **Wrong field used for program type** - The ProviderDashboard passes `treatment_request` (which is often `null`) instead of `primary_program` to the PatientJourneyTracker.

### Solution

#### Part 1: Fix Program Type Reference
Update `ProviderDashboard.tsx` to use `primary_program` instead of `treatment_request`:

```typescript
// Before (broken)
primaryProgram={selectedPatient.patient.treatment_request || null}

// After (fixed)
primaryProgram={selectedPatient.patient.primary_program || selectedPatient.patient.treatment_request || null}
```

#### Part 2: Add "Existing Patient" Visual Treatment
Modify `PatientJourneyTracker.tsx` to recognize `treatment_active` status for patients added via "Add Existing Patient" and show an appropriate visual:

**Option A (Recommended): Skip-to-Active Indicator**
Instead of showing all prior steps as "completed", show them as "skipped" (gray/dotted) with only the Active step highlighted. This accurately reflects that the patient was migrated without going through the full onboarding flow.

**Option B: Collapsed View**
Show a simplified single-step view for existing patients with just "Active Treatment" badge and no stepper.

#### Part 3: Better Status Differentiation
Currently these statuses all map to step 6:
- `treatment_active` (completed full journey)
- `existing_patient` (legacy, migrated)

Consider adding a flag to distinguish:
- `is_migrated_patient: boolean` - Track if patient was added via "Add Existing Patient"
- Show different visual when this flag is true

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/ProviderDashboard.tsx` | Use `primary_program` instead of `treatment_request` |
| `src/components/provider/PatientJourneyTracker.tsx` | Add visual distinction for migrated/existing patients |
| `supabase/functions/add-existing-patient/index.ts` | (Optional) Add `is_migrated_patient: true` flag when creating patient |

### Implementation Details

**Step 1: Fix the immediate bug**
Update ProviderDashboard to pass the correct program type field.

**Step 2: Update Journey Tracker visualization**
Add logic to detect "existing patient" scenario and show appropriate visual:

```typescript
// In PatientJourneyTracker
const isMigratedPatient = onboardingStatus === 'treatment_active' && !hasCompletedIntake;
// Or use a dedicated database flag

// Update step rendering:
{steps.map((step, idx) => {
  const isComplete = idx < currentStepIndex;
  const isSkipped = isMigratedPatient && idx < currentStepIndex; // New
  const isCurrent = idx === currentStepIndex;
  
  return (
    <div className={cn(
      isSkipped && "opacity-50", // Gray out skipped steps
      isComplete && !isSkipped && "bg-green-500", // Only green if truly completed
    )}>
      {isSkipped ? <span>—</span> : isComplete ? <Check /> : step.icon}
    </div>
  );
})}
```

**Step 3: Add "Migrated Patient" indicator**
Show a small badge above the stepper:

```jsx
{isMigratedPatient && (
  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
    <UserPlus className="w-3 h-3" />
    <span>Existing patient - added directly to active treatment</span>
  </div>
)}
```

### Database Enhancement (Optional)
Add a column to track migration:

```sql
ALTER TABLE patients ADD COLUMN IF NOT EXISTS 
  is_migrated_patient BOOLEAN DEFAULT FALSE;
```

Then update the edge function to set `is_migrated_patient: true` when adding existing patients.

### Testing Checklist
After implementation:
- Add new existing patient with "Active on Treatment" status
- Journey tracker shows Active step highlighted, prior steps grayed/skipped
- Badge indicates "Existing patient"
- Add patient with "Labs Uploaded, Pending Review" status
- Journey tracker shows appropriate step highlighted
- Dropdown selection persists and saves correctly

