# Install the self-hosted integration runtime and register it with Data
# Factory. Run once, by the VM's CustomScriptExtension.
$ErrorActionPreference = "Stop"
$msi = "$env:TEMP\IntegrationRuntime.msi"
$url = "https://go.microsoft.com/fwlink/?linkid=839822"
Invoke-WebRequest $url -OutFile $msi -UseBasicParsing
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$msi`" /quiet /norestart"
$dir = "C:\Program Files\Microsoft Integration Runtime"
$cmd = Get-ChildItem "$dir\*\Shared\dmgcmd.exe" | Select-Object -First 1
& $cmd.FullName -RegisterNewNode "${key}" "vm-tradefin-shir"
