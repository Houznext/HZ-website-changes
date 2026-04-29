# ============================================================
# HOUZNEXT — EXISTING CODEBASE AUDIT (Pre-Store Build)
# Run from: D:\HZ website changes
# Output:   D:\HZ website changes\audit-store.txt
# ============================================================

$ROOT    = "D:\HZ website changes"
$OUT     = "$ROOT\audit-store.txt"
$WEBSITE = "$ROOT\HZ-website"
$ADMIN   = "$ROOT\HZ-admin"
$BACKEND = "$ROOT\HZ-backend"

Set-Location $ROOT
"" | Out-File $OUT -Encoding utf8

function Sep($t) {
    "`n$("="*70)`n=== $t`n$("="*70)`n" | Out-File $OUT -Append -Encoding utf8
}
function Append($text) {
    $text | Out-File $OUT -Append -Encoding utf8
}
function DumpFile($label, $path) {
    if (Test-Path $path) {
        "`n====== FILE: $label ======`n" | Out-File $OUT -Append -Encoding utf8
        Get-Content $path -Raw -Encoding utf8 | Out-File $OUT -Append -Encoding utf8
        "`n" | Out-File $OUT -Append -Encoding utf8
    }
}
function DumpDir($dir, $filter) {
    if (Test-Path $dir) {
        Get-ChildItem $dir -Recurse -Filter $filter |
        Where-Object { $_.FullName -notmatch "node_modules|\\dist\\|\.next|\\\.git" } |
        ForEach-Object { DumpFile ($_.FullName.Replace("$ROOT\","")) $_.FullName }
    }
}

# ── 1. DIRECTORY TREES ──────────────────────────────────────
Sep "1. FULL DIRECTORY TREES"
foreach ($repo in @($WEBSITE,$ADMIN,$BACKEND)) {
    if (Test-Path $repo) {
        "`n--- $repo ---`n" | Out-File $OUT -Append -Encoding utf8
        Get-ChildItem $repo -Recurse |
        Where-Object { $_.FullName -notmatch "node_modules|\\dist\\|\.next|\\\.git" } |
        Select-Object -ExpandProperty FullName |
        ForEach-Object { $_.Replace("$ROOT\","") } |
        Out-File $OUT -Append -Encoding utf8
    }
}

# ── 2. BACKEND CORE CONFIG ──────────────────────────────────
Sep "2. HZ-BACKEND — Core config"
DumpFile "HZ-backend/package.json"      "$BACKEND\package.json"
DumpFile "HZ-backend/src/app.module.ts" "$BACKEND\src\app.module.ts"
DumpFile "HZ-backend/src/guard.ts"      "$BACKEND\src\guard.ts"

$envPath = "$BACKEND\.env"
if (Test-Path $envPath) {
    "`n====== FILE: HZ-backend/.env (KEYS ONLY) ======`n" | Out-File $OUT -Append -Encoding utf8
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^([^#=]+)=") { $Matches[1].Trim() } else { $_ }
    } | Out-File $OUT -Append -Encoding utf8
}

# ── 3. ALL BACKEND ENTITIES ─────────────────────────────────
Sep "3. HZ-BACKEND — All entities"
DumpDir "$BACKEND\src" "*.entity.ts"

# ── 4. ALL BACKEND DTOs ─────────────────────────────────────
Sep "4. HZ-BACKEND — All DTOs"
DumpDir "$BACKEND\src" "*.dto.ts"

# ── 5. ALL CONTROLLERS ──────────────────────────────────────
Sep "5. HZ-BACKEND — All controllers"
DumpDir "$BACKEND\src" "*.controller.ts"

# ── 6. ALL SERVICES ─────────────────────────────────────────
Sep "6. HZ-BACKEND — All services"
DumpDir "$BACKEND\src" "*.service.ts"

# ── 7. ALL MODULES ──────────────────────────────────────────
Sep "7. HZ-BACKEND — All modules"
DumpDir "$BACKEND\src" "*.module.ts"

# ── 8. AUTH / GUARD / JWT ───────────────────────────────────
Sep "8. HZ-BACKEND — Auth, Guard, JWT"
Get-ChildItem "$BACKEND\src" -Recurse -Filter "*.ts" |
Where-Object {
    $_.FullName -notmatch "node_modules|\\dist\\" -and
    ($_.Name -match "guard|jwt|strategy|auth|decorator")
} | ForEach-Object { DumpFile ($_.FullName.Replace("$ROOT\","")) $_.FullName }

# ── 9. S3 / UPLOAD ──────────────────────────────────────────
Sep "9. HZ-BACKEND — S3 / Upload"
Get-ChildItem "$BACKEND\src" -Recurse -Filter "*.ts" |
Where-Object {
    $_.FullName -notmatch "node_modules|\\dist\\" -and
    ($_.FullName -match "s3|upload|storage|bucket" -or $_.Name -match "s3|upload|storage")
} | ForEach-Object { DumpFile ($_.FullName.Replace("$ROOT\","")) $_.FullName }

# ── 10. DATABASE CONFIG ─────────────────────────────────────
Sep "10. HZ-BACKEND — Database / TypeORM config"
Get-ChildItem "$BACKEND\src" -Recurse -Filter "*.ts" |
Where-Object {
    $_.FullName -notmatch "node_modules|\\dist\\" -and
    ($_.FullName -match "database|typeorm|ormconfig" -or $_.Name -match "database|orm")
} | ForEach-Object { DumpFile ($_.FullName.Replace("$ROOT\","")) $_.FullName }

# ── 11. CUSTOMER + INTERIORS AUTH ───────────────────────────
Sep "11. HZ-BACKEND — Interiors module (customer auth lives here)"
DumpDir "$BACKEND\src\interiors" "*.ts"

# ── 12. INVOICE MODULE ──────────────────────────────────────
Sep "12. HZ-BACKEND — Invoice estimator module"
DumpDir "$BACKEND\src\invoice-estimator" "*.ts"

# ── 13. USER / BRANCH / STAFF ───────────────────────────────
Sep "13. HZ-BACKEND — User, Branch, Staff"
foreach ($d in @("user","branch","staff")) {
    DumpDir "$BACKEND\src\$d" "*.ts"
}

# ── 14. SITE CMS ────────────────────────────────────────────
Sep "14. HZ-BACKEND — Site CMS (if exists)"
if (Test-Path "$BACKEND\src\site-cms") {
    DumpDir "$BACKEND\src\site-cms" "*.ts"
} else { Append "site-cms NOT YET CREATED" }

# ── 15. WEBSITE CORE CONFIG ─────────────────────────────────
Sep "15. HZ-WEBSITE — Core config"
DumpFile "HZ-website/package.json"            "$WEBSITE\package.json"
DumpFile "HZ-website/next.config.js"          "$WEBSITE\next.config.js"
DumpFile "HZ-website/tailwind.config.js"      "$WEBSITE\tailwind.config.js"
DumpFile "HZ-website/tsconfig.json"           "$WEBSITE\tsconfig.json"
DumpFile "HZ-website/src/pages/_app.tsx"      "$WEBSITE\src\pages\_app.tsx"
DumpFile "HZ-website/src/pages/_document.tsx" "$WEBSITE\src\pages\_document.tsx"

# ── 16. ALL WEBSITE PAGES ───────────────────────────────────
Sep "16. HZ-WEBSITE — All pages"
DumpDir "$WEBSITE\src\pages" "*.tsx"

# ── 17. KEY WEBSITE COMPONENTS ──────────────────────────────
Sep "17. HZ-WEBSITE — Key shared components"
foreach ($rel in @(
    "src\components\Navbar.tsx",
    "src\components\Footer.tsx",
    "src\components\QuoteModal.tsx",
    "src\components\LoginModal.tsx",
    "src\components\SeoHead.tsx",
    "src\components\ui\EyebrowLabel.tsx",
    "src\components\ui\Reveal.tsx",
    "src\context\CustomerAuthContext.tsx",
    "src\hooks\useCustomerGuard.ts"
)) { DumpFile "HZ-website/$rel" "$WEBSITE\$rel" }

# ── 18. WEBSITE UTILITIES ───────────────────────────────────
Sep "18. HZ-WEBSITE — Utilities, hooks, context, lib"
DumpDir "$WEBSITE\src\utils"   "*.ts"
DumpDir "$WEBSITE\src\hooks"   "*.ts"
DumpDir "$WEBSITE\src\context" "*.tsx"
DumpDir "$WEBSITE\src\lib"     "*.ts"

# ── 19. WEBSITE STYLES ──────────────────────────────────────
Sep "19. HZ-WEBSITE — Styles"
foreach ($rel in @("src\styles\tailwind.css","src\styles\globals.css")) {
    DumpFile "HZ-website/$rel" "$WEBSITE\$rel"
}

# ── 20. ADMIN CORE CONFIG ───────────────────────────────────
Sep "20. HZ-ADMIN — Core config"
DumpFile "HZ-admin/package.json"       "$ADMIN\package.json"
DumpFile "HZ-admin/next.config.js"     "$ADMIN\next.config.js"
DumpFile "HZ-admin/tailwind.config.js" "$ADMIN\tailwind.config.js"
DumpFile "HZ-admin/tsconfig.json"      "$ADMIN\tsconfig.json"
DumpFile "HZ-admin/src/pages/_app.tsx" "$ADMIN\src\pages\_app.tsx"
DumpFile "HZ-admin/src/middleware.ts"  "$ADMIN\src\middleware.ts"

# ── 21. ADMIN LAYOUT + SIDEBAR ──────────────────────────────
Sep "21. HZ-ADMIN — Layout, Sidebar, TopNavbar"
foreach ($rel in @(
    "src\common\AdminLayout\index.tsx",
    "src\components\layout\Sidebar.tsx",
    "src\components\layout\TopNavbar.tsx"
)) { DumpFile "HZ-admin/$rel" "$ADMIN\$rel" }

# ── 22. ALL ADMIN PAGES ─────────────────────────────────────
Sep "22. HZ-ADMIN — All pages"
DumpDir "$ADMIN\src\pages" "*.tsx"

# ── 23. ADMIN UTILITIES ─────────────────────────────────────
Sep "23. HZ-ADMIN — Utilities"
foreach ($rel in @(
    "src\utils\apiClient.ts",
    "src\utils\uploadFile.ts"
)) { DumpFile "HZ-admin/$rel" "$ADMIN\$rel" }

# ── 24. INSTALLED PACKAGES ──────────────────────────────────
Sep "24. INSTALLED PACKAGES"
foreach ($repo in @("HZ-website","HZ-admin","HZ-backend")) {
    $pkg = "$ROOT\$repo\package.json"
    if (Test-Path $pkg) {
        "`n--- $repo ---`n" | Out-File $OUT -Append -Encoding utf8
        $json = Get-Content $pkg -Raw | ConvertFrom-Json
        if ($json.dependencies) {
            $json.dependencies.PSObject.Properties |
            ForEach-Object { "  $($_.Name): $($_.Value)" } |
            Out-File $OUT -Append -Encoding utf8
        }
    }
}

# ── 25. ROUTE + ENTITY SUMMARY ──────────────────────────────
Sep "25. ROUTE AND ENTITY SUMMARY"

Append "`nWEBSITE routes:"
if (Test-Path "$WEBSITE\src\pages") {
    Get-ChildItem "$WEBSITE\src\pages" -Recurse -Filter "*.tsx" |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|_document|_app" } |
    ForEach-Object {
        "  " + $_.FullName.Replace("$WEBSITE\src\pages","").Replace(".tsx","").Replace("\index","").Replace("\","/")
    } | Out-File $OUT -Append -Encoding utf8
}

Append "`nADMIN routes:"
if (Test-Path "$ADMIN\src\pages") {
    Get-ChildItem "$ADMIN\src\pages" -Recurse -Filter "*.tsx" |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|_document|_app" } |
    ForEach-Object {
        "  " + $_.FullName.Replace("$ADMIN\src\pages","").Replace(".tsx","").Replace("\index","").Replace("\","/")
    } | Out-File $OUT -Append -Encoding utf8
}

Append "`nBACKEND controllers:"
if (Test-Path "$BACKEND\src") {
    Get-ChildItem "$BACKEND\src" -Recurse -Filter "*.controller.ts" |
    Where-Object { $_.FullName -notmatch "node_modules|\\dist\\" } |
    ForEach-Object { "  " + $_.FullName.Replace("$ROOT\","") } |
    Out-File $OUT -Append -Encoding utf8
}

Append "`nBACKEND entities:"
if (Test-Path "$BACKEND\src") {
    Get-ChildItem "$BACKEND\src" -Recurse -Filter "*.entity.ts" |
    Where-Object { $_.FullName -notmatch "node_modules|\\dist\\" } |
    ForEach-Object { "  " + $_.FullName.Replace("$ROOT\","") } |
    Out-File $OUT -Append -Encoding utf8
}

# ── DONE ────────────────────────────────────────────────────
"`n`n====== AUDIT COMPLETE ======`n" | Out-File $OUT -Append -Encoding utf8

$size = [math]::Round((Get-Item $OUT).Length / 1MB, 1)
Write-Host "`n✅  Done! File: $OUT" -ForegroundColor Green
Write-Host "    Size: $size MB" -ForegroundColor Cyan
Write-Host "    Upload audit-store.txt to Claude to start building Houznext Store.`n" -ForegroundColor Yellow
