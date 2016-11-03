
; Fox Web Alarm Player setup script

[Setup]
AppName=Fox Web Alarm Player
AppPublisher=Foxstream SAS
AppVersion=1.0
DefaultDirName={pf}\Foxstream\FoxWeb Alarm Player
;DefaultGroupName=Foxstream
Compression=lzma2
SolidCompression=yes
OutputDir=Setup
PrivilegesRequired=poweruser
UninstallDisplayIcon={app}\client\img\foxstream.ico

[UninstallDelete]
Type: filesandordirs; Name: "{app}\server\data"
Type: dirifempty; Name: "{app}"

[Files]
Source: ".\release\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

; Fichiers d'installation de nodejs
;Source: ".\node-v6.9.1-x86.msi"; DestDir: "{app}"; Check: Not IsWin64; Flags: deleteafterinstall
;Source: ".\node-v6.9.1-x64.msi"; DestDir: "{app}"; Check: IsWin64; Flags: deleteafterinstall
Source: ".\node-v6.9.1-x86.msi"; DestDir: "{app}"; Flags: deleteafterinstall

[Run]
;Filename: "{app}\node-v6.9.1-x86.msi"; Check: Not IsWin64; Description: "Install NodeJS v6.9.1"; Flags: postinstall shellexec waituntilterminated skipifsilent
;Filename: "{app}\node-v6.9.1-x64.msi"; Check: IsWin64; Description: "Install NodeJS v6.9.1"; Flags: postinstall shellexec waituntilterminated skipifsilent
Filename: "{app}\node-v6.9.1-x86.msi"; Description: "Install NodeJS v6.9.1"; Flags: postinstall shellexec waituntilterminated skipifsilent
Filename: "{cmd}"; Parameters: "/C cd ""{app}"" && node win-service.js"; Flags: runascurrentuser

[UninstallRun]
Filename: "{cmd}"; Parameters: "/C cd ""{app}"" && node win-service.js --uninstall"; Flags: runascurrentuser

