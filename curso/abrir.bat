@echo off
rem Genera el curso, lo sirve en local y lo abre en el navegador.
rem Hace falta servirlo para que el video se reproduzca dentro de la leccion.
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  python -m venv .venv
  .venv\Scripts\python -m pip install -q -r requirements.txt
)
.venv\Scripts\python generar.py --servir
