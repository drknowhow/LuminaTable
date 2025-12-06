@echo off
cd /d u:\R\LuminaTable\LuminaTable
"C:\Program Files\R\R-4.5.1\bin\R.exe" -q -e "shiny::runApp('.', host='127.0.0.1', port=8000, launch.browser=FALSE)"
