# Vi Data Ops Agent landing page

Open `index.html` in a browser. The page is static and self-contained:
CSS, JavaScript, product screenshots, and Vi logo assets are all in this
folder.

The content was derived from the local `vi-data-ops-agent` codebase and
the running UI:

- React/Vite operator console
- Fastify control server
- SQLite run registry and SSE event stream
- Login gate for the authenticated operator workflow
- Two-audience Analytics: Product Ops and CP View
- Contextual Copilot grounded on route, run id, client id, and operator id
- Multi-user auth with admin-managed accounts, roles, and private/shared mode
- Settings surface for model tier, auth source, backend health, SSE state,
  LAN sharing, output paths, and hidden-client recovery
- Zod-backed OpenAPI and canonical shared enums between UI and control server
- MCP tools for parse, validate, finalize, QA, Search Insights, and knowledge
- Track-specific runners for Intent Audit, Claims QA, and Search Insights
- Search Insights Wizard with parsed-brief preview, audience combo picker,
  BuildGroupTable, run_group_id fan-out, and group manifests
- Claims QA real multipart upload/dispatch with payer modes and the
  No CSV = No QA standing rule
- Audience policy gates for patient, caregiver, and HCP deliverables
- Run Detail readiness badge and re-run action
- Client corrections history and routed-upload confirmation
- System topology with per-layer health and active-flow readouts
- Python analysis engine for trends, anomalies, clustering, prediction, and similarity
- Multi-user auth: username/password login (scrypt), session tokens,
  admin-managed accounts and roles, and a private-mode kill-switch
- Authenticated deliverable downloads
- Validation critic with a bounded self-correction loop, a consolidated
  run quality gate, and per-agent model tiering resolved from the auth context
