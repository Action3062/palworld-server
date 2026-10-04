@echo off
cd /d "%USERPROFILE%\Documents\palworld-server"
git config user.name >nul 2>&1 || git config --global user.name "Thomas"
git config user.email >nul 2>&1 || git config --global user.email "action@fastmail.de"
git checkout -b abschieds-seite
git add -A
git commit -m "Abschieds-Seite fuer die Server-Schliessung, per Admin-Schalter aktivierbar"
git push -u origin abschieds-seite
echo.
echo ===== Fertig. Fenster kann geschlossen werden. =====
pause
