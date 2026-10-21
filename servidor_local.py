#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Local de Desarrollo y Respaldo Físico en Disco (Zero-Dependencies)
Planeador de Clases Multigrados

Uso:
    python servidor_local.py
    python servidor_local.py --port 8080 --no-browser
"""

import sys
import os
import json
import mimetypes
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime

DEFAULT_PORT = 8000
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backups')
LATEST_BACKUP_PATH = os.path.join(BACKUP_DIR, 'disk_autosave_latest.json')

# Asegurar tipos MIME estándar
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx')
mimetypes.add_type('application/xml', '.xml')
mimetypes.add_type('image/svg+xml', '.svg')


class PlaneadorRequestHandler(SimpleHTTPRequestHandler):
    """Manejador HTTP con soporte de archivos estáticos y endpoints de respaldo físico."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def do_GET(self):
        # 1. API: Obtener el respaldo físico más reciente
        if self.path == '/api/latest-backup':
            self._handle_get_latest_backup()
            return

        # 2. API: Estado del servidor local
        if self.path == '/api/status':
            self._send_json_response(HTTPStatus.OK, {
                'status': 'running',
                'app': 'Planeador de Clases Multigrados',
                'version': '5.0',
                'timestamp': datetime.now().isoformat()
            })
            return

        # 3. Servir archivos estáticos normales (index.html, js, css, etc.)
        super().do_GET()

    def do_POST(self):
        # 1. API: Guardado físico de respaldo en disco (/api/autosave)
        if self.path == '/api/autosave':
            self._handle_post_autosave()
            return

        self._send_json_response(HTTPStatus.NOT_FOUND, {'error': 'Ruta no encontrada'})

    def _handle_get_latest_backup(self):
        if not os.path.exists(LATEST_BACKUP_PATH):
            self._send_json_response(HTTPStatus.NOT_FOUND, {'error': 'No hay respaldos previos en disco'})
            return

        try:
            with open(LATEST_BACKUP_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self._send_json_response(HTTPStatus.OK, data)
        except Exception as err:
            self._send_json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {
                'error': f'Error al leer respaldo de disco: {str(err)}'
            })

    def _handle_post_autosave(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length <= 0:
            self._send_json_response(HTTPStatus.BAD_REQUEST, {'error': 'Cuerpo de solicitud vacío'})
            return

        try:
            body = self.rfile.read(content_length).decode('utf-8')
            payload = json.loads(body)

            os.makedirs(BACKUP_DIR, exist_ok=True)

            # 1. Guardar como última versión activa para recuperación transparente
            with open(LATEST_BACKUP_PATH, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

            # 2. Guardar copia histórica fechada (máximo 10 rotativas)
            timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
            history_file = os.path.join(BACKUP_DIR, f'autosave_{timestamp_str}.json')
            with open(history_file, 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

            # Rotación de respaldos para no saturar disco
            self._rotate_backups()

            self._send_json_response(HTTPStatus.OK, {
                'status': 'ok',
                'message': 'Respaldo físico en disco guardado exitosamente',
                'savedAt': datetime.now().isoformat(),
                'bytes': len(body)
            })
        except Exception as err:
            self._send_json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {
                'error': f'Error al escribir respaldo en disco: {str(err)}'
            })

    def _rotate_backups(self, max_files=10):
        try:
            files = [
                os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR)
                if f.startswith('autosave_') and f.endswith('.json')
            ]
            files.sort(key=os.path.getmtime)
            while len(files) > max_files:
                oldest = files.pop(0)
                try:
                    os.remove(oldest)
                except OSError:
                    pass
        except Exception:
            pass

    def _send_json_response(self, status_code, data):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.end_headers()
        self.wfile.write(response_bytes)

    def log_message(self, format, *args):
        # Silenciar peticiones estáticas estándar para no ensuciar la consola
        if args and any(str(args[0]).startswith(code) for code in ['200', '304']):
            return
        super().log_message(format, *args)


def run_server():
    port = DEFAULT_PORT
    auto_open = True

    # Parseo de argumentos simples sin dependencias
    args = sys.argv[1:]
    if '--no-browser' in args:
        auto_open = False
        args.remove('--no-browser')
    if '--port' in args:
        idx = args.index('--port')
        if idx + 1 < len(args):
            try:
                port = int(args[idx + 1])
            except ValueError:
                print(f"Puerto inválido: {args[idx + 1]}, usando {DEFAULT_PORT}")

    server_address = ('127.0.0.1', port)
    try:
        httpd = ThreadingHTTPServer(server_address, PlaneadorRequestHandler)
    except OSError as e:
        if 'Address already in use' in str(e) or '10048' in str(e):
            print(f"El puerto {port} está ocupado. Intentando puerto alternativo {port + 1}...")
            port += 1
            server_address = ('127.0.0.1', port)
            httpd = ThreadingHTTPServer(server_address, PlaneadorRequestHandler)
        else:
            raise

    url = f"http://localhost:{port}/index.html"
    print("=" * 70)
    print("  PLANEADOR DE CLASES MULTIGRADOS - SERVIDOR LOCAL OFFLINE")
    print("=" * 70)
    print(f"  Dirección local:       {url}")
    print(f"  Carpeta de respaldos:  {BACKUP_DIR}")
    print(f"  Endpoint de autoguardado en disco: /api/autosave (Activo)")
    print("  Presiona Ctrl + C para detener el servidor.")
    print("=" * 70)

    if auto_open:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido por el usuario.")
    finally:
        httpd.server_close()


if __name__ == '__main__':
    run_server()
