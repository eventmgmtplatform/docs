$ErrorActionPreference = "Stop"
$Script = Join-Path $PSScriptRoot "tools/docs.py"

if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 $Script @args
} else {
    & python $Script @args
}
exit $LASTEXITCODE
