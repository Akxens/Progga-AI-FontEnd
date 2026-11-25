import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("required route pages and Next.js error boundaries exist", () => {
  const required = [
    "src/app/error.tsx",
    "src/app/(chat)/error.tsx",
    "src/app/(student)/error.tsx",
    "src/app/login/page.tsx",
    "src/app/(chat)/tutor/page.tsx",
    "src/app/(student)/arena/page.tsx",
    "src/app/(student)/lab/page.tsx",
    "src/app/guardian/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/layout.tsx",
    "src/app/admin/mfa/page.tsx",
    "src/app/admin/workspace/page.tsx",
    "src/app/admin/system/config/page.tsx",
  ];
  for (const rel of required) {
    assert.ok(fs.existsSync(path.join(root, rel)), `Missing expected route file: ${rel}`);
  }
  assert.equal(
    fs.existsSync(path.join(root, "src/app/(student)/_tutor-legacy")),
    false,
    "Unused _tutor-legacy directory should be removed",
  );
});

test("middleware PROTECTED list includes /lab and core student/guardian/admin paths", () => {
  const src = fs.readFileSync(path.join(root, "src/middleware.ts"), "utf8");
  for (const p of ["/home", "/tutor", "/lessons", "/lab", "/arena", "/battle", "/rewards", "/leaderboard", "/profile", "/guardian", "/admin"]) {
    assert.ok(src.includes(`"${p}"`), `Middleware PROTECTED list missing ${p}`);
  }
});

test("useEngineChoice prioritizes admin isDefault over hardcoded NOVA_PROVIDER", () => {
  const src = fs.readFileSync(path.join(root, "src/lib/useEngine.ts"), "utf8");
  const idxDefault = src.indexOf("e.isDefault");
  const idxNova = src.indexOf("e.provider === NOVA_PROVIDER");
  assert.ok(idxDefault !== -1 && idxNova !== -1 && idxDefault < idxNova, "Expected isDefault check before NOVA_PROVIDER");
});

test("admin foundation components and api client exist", () => {
  const foundationFiles = [
    "src/lib/admin/types.ts",
    "src/lib/admin/api.ts",
    "src/lib/admin/useAdmin.ts",
    "src/lib/admin/format.ts",
    "src/lib/admin/nav.ts",
    "src/components/admin/shell/AdminShell.tsx",
    "src/components/admin/data/DataTable.tsx",
    "src/components/admin/data/useList.ts",
    "src/components/admin/form/FormPage.tsx",
    "src/components/admin/feedback/PageState.tsx",
    "src/components/admin/display/StatCard.tsx",
    "src/components/admin/charts/LineChart.tsx",
  ];
  for (const f of foundationFiles) {
    assert.ok(fs.existsSync(path.join(root, f)), `Missing foundation file: ${f}`);
  }
});

test("Sprint 2 (Phase 3) People, schools, training, activation and imports routes exist", () => {
  const routes = [
    "src/app/admin/students/page.tsx",
    "src/app/admin/students/new/page.tsx",
    "src/app/admin/students/[id]/page.tsx",
    "src/app/admin/sessions/page.tsx",
    "src/app/admin/students/analytics/page.tsx",
    "src/app/admin/guardians/page.tsx",
    "src/app/admin/guardians/[id]/page.tsx",
    "src/app/admin/teachers/page.tsx",
    "src/app/admin/teachers/new/page.tsx",
    "src/app/admin/teachers/[id]/page.tsx",
    "src/app/admin/teachers/analytics/page.tsx",
    "src/app/admin/schools/page.tsx",
    "src/app/admin/schools/new/page.tsx",
    "src/app/admin/schools/[id]/page.tsx",
    "src/app/admin/activation/page.tsx",
    "src/app/admin/activation/new/page.tsx",
    "src/app/admin/activation/[id]/page.tsx",
    "src/app/admin/training/page.tsx",
    "src/app/admin/training/new/page.tsx",
    "src/app/admin/training/[id]/page.tsx",
    "src/app/admin/imports/page.tsx",
    "src/app/admin/imports/[id]/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(path.join(root, r)), `Missing Sprint 2 route: ${r}`);
  }
});

test("Sprint 3 (Phase 4) Academics, Course Editor, Plans, Subscriptions, Payments routes exist", () => {
  const routes = [
    // Academics (TASK-131)
    "src/app/admin/courses/page.tsx",
    "src/app/admin/courses/new/page.tsx",
    "src/app/admin/courses/[id]/page.tsx",
    "src/app/admin/courses/[id]/edit/page.tsx",
    "src/app/admin/curriculum/page.tsx",
    "src/app/admin/content-review/page.tsx",
    "src/components/admin/forms/CourseForm.tsx",
    // Finance (TASK-138 & TASK-139)
    "src/components/admin/forms/PlanForm.tsx",
    "src/app/admin/finance/plans/page.tsx",
    "src/app/admin/finance/plans/new/page.tsx",
    "src/app/admin/finance/plans/[id]/page.tsx",
    "src/app/admin/finance/plans/[id]/edit/page.tsx",
    "src/app/admin/finance/subscriptions/page.tsx",
    "src/app/admin/finance/subscriptions/[id]/page.tsx",
    "src/app/admin/finance/subscriptions/grant/page.tsx",
    "src/app/admin/finance/payments/page.tsx",
    "src/app/admin/finance/payments/[id]/page.tsx",
    "src/app/admin/finance/reconciliation/page.tsx",
    "src/app/admin/finance/refunds/page.tsx",
    "src/app/admin/finance/refunds/new/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(path.join(root, r)), `Missing Sprint 3 route: ${r}`);
  }
});

test("Sprint 4 (Phase 5) CSR, Work Queue, System Staff, Roles, Audit & Health routes exist", () => {
  const routes = [
    // CSR (TASK-141 & TASK-142)
    "src/components/admin/forms/PartnerForm.tsx",
    "src/components/admin/forms/ProgrammeForm.tsx",
    "src/app/admin/csr/page.tsx",
    "src/app/admin/csr/partners/page.tsx",
    "src/app/admin/csr/partners/new/page.tsx",
    "src/app/admin/csr/partners/[id]/page.tsx",
    "src/app/admin/csr/partners/[id]/edit/page.tsx",
    "src/app/admin/csr/programmes/page.tsx",
    "src/app/admin/csr/programmes/new/page.tsx",
    "src/app/admin/csr/programmes/[id]/page.tsx",
    "src/app/admin/csr/programmes/[id]/edit/page.tsx",
    "src/app/admin/csr/beneficiaries/page.tsx",
    "src/app/admin/csr/allocations/page.tsx",
    "src/app/admin/csr/ledger/page.tsx",
    // Work Queue & System (TASK-066 & TASK-144)
    "src/app/admin/work-queue/page.tsx",
    "src/app/admin/system/staff/page.tsx",
    "src/app/admin/system/roles/page.tsx",
    "src/app/admin/system/audit/page.tsx",
    "src/app/admin/system/health/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(path.join(root, r)), `Missing Sprint 4 route: ${r}`);
  }
});

test("Sprint 2 (Phase 3) People, schools, training, activation and imports routes exist", () => {
  const routes = [
    "src/app/admin/students/page.tsx",
    "src/app/admin/students/new/page.tsx",
    "src/app/admin/students/[id]/page.tsx",
    "src/app/admin/sessions/page.tsx",
    "src/app/admin/students/analytics/page.tsx",
    "src/app/admin/guardians/page.tsx",
    "src/app/admin/guardians/[id]/page.tsx",
    "src/app/admin/teachers/page.tsx",
    "src/app/admin/teachers/new/page.tsx",
    "src/app/admin/teachers/[id]/page.tsx",
    "src/app/admin/teachers/analytics/page.tsx",
    "src/app/admin/schools/page.tsx",
    "src/app/admin/schools/new/page.tsx",
    "src/app/admin/schools/[id]/page.tsx",
    "src/app/admin/activation/page.tsx",
    "src/app/admin/activation/new/page.tsx",
    "src/app/admin/activation/[id]/page.tsx",
    "src/app/admin/training/page.tsx",
    "src/app/admin/training/new/page.tsx",
    "src/app/admin/training/[id]/page.tsx",
    "src/app/admin/imports/page.tsx",
    "src/app/admin/imports/[id]/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(path.join(root, r)), `Missing Sprint 2 route: ${r}`);
  }
});

test("Sprint 3 (Phase 4) Academics, Course Editor, Plans, Subscriptions, Payments routes exist", () => {
  const routes = [
    // Academics (TASK-131)
    "src/app/admin/courses/page.tsx",
    "src/app/admin/courses/new/page.tsx",
    "src/app/admin/courses/[id]/page.tsx",
    "src/app/admin/courses/[id]/edit/page.tsx",
    "src/app/admin/curriculum/page.tsx",
    "src/app/admin/content-review/page.tsx",
    "src/components/admin/forms/CourseForm.tsx",
    // Finance (TASK-138 & TASK-139)
    "src/components/admin/forms/PlanForm.tsx",
    "src/app/admin/finance/plans/page.tsx",
    "src/app/admin/finance/plans/new/page.tsx",
    "src/app/admin/finance/plans/[id]/page.tsx",
    "src/app/admin/finance/plans/[id]/edit/page.tsx",
    "src/app/admin/finance/subscriptions/page.tsx",
    "src/app/admin/finance/subscriptions/[id]/page.tsx",
    "src/app/admin/finance/subscriptions/grant/page.tsx",
    "src/app/admin/finance/payments/page.tsx",
    "src/app/admin/finance/payments/[id]/page.tsx",
    "src/app/admin/finance/reconciliation/page.tsx",
    "src/app/admin/finance/refunds/page.tsx",
    "src/app/admin/finance/refunds/new/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(path.join(root, r)), `Missing Sprint 3 route: ${r}`);
  }
});

test("Sprint 4 (Phase 5) CSR, Work Queue, System Staff, Roles, Audit & Health routes exist", () => {
  const routes = [
    // CSR (TASK-141 & TASK-142)
    "src/components/admin/forms/PartnerForm.tsx",
    "src/components/admin/forms/ProgrammeForm.tsx",
    "src/app/admin/csr/page.tsx",
    "src/app/admin/csr/partners/page.tsx",
    "src/app/admin/csr/partners/new/page.tsx",
    "src/app/admin/csr/partners/[id]/page.tsx",
    "src/app/admin/csr/partners/[id]/edit/page.tsx",
    "src/app/admin/csr/programmes/page.tsx",
    "src/app/admin/csr/programmes/new/page.tsx",
    "src/app/admin/csr/programmes/[id]/page.tsx",
    "src/app/admin/csr/programmes/[id]/edit/page.tsx",
    "src/app/admin/csr/beneficiaries/page.tsx",
    "src/app/admin/csr/allocations/page.tsx",
    "src/app/admin/csr/ledger/page.tsx",
    // Work Queue & System (TASK-066 & TASK-144)
    "src/app/admin/work-queue/page.tsx",
    "src/app/admin/system/staff/page.tsx",
    "src/app/admin/system/roles/page.tsx",
    "src/app/admin/system/audit/page.tsx",
    "src/app/admin/system/health/page.tsx",
  ];
  for (const r of routes) {
    assert.ok(fs.existsSync(path.join(root, r)), `Missing Sprint 4 route: ${r}`);
  }
});
