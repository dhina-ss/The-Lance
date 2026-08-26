# Installer artifacts

Drop the built agent installer here so the tenant Download button can serve it:

    EMSAgentSetup-<version>.exe

Build it on Windows from the EMS project:

    dotnet publish EMS/EMS.Agent -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true
    ISCC.exe EMS/installer/EMS.Agent.iss   # output lands in EMS/installer/output/

Then copy the newest EMSAgentSetup-*.exe into this folder. The download endpoint
serves the newest .exe here (falling back to EMS/installer/output/ for local dev).
This folder's binaries are gitignored.
