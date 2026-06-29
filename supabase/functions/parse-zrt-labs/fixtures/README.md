# Lab PDF fixtures (synthetic TEST data)

These `.txt` files simulate the **text layer** extracted from real ZRT / LabCorp PDFs.
Replace with actual sample PDFs (fake patient data only) when available for integration testing.

- `zrt-synthetic-text-layer.txt` — ZRT saliva profile layout
- `labcorp-synthetic-text-layer.txt` — LabCorp comprehensive panel layout

Unit tests in `scripts/lab-pdf-deterministic.test.ts` parse these fixtures directly.
