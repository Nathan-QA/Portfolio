"""Serve the already-built portfolio locally. Python 3, standard library only."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading
import webbrowser

ROOT = Path(__file__).resolve().parent / 'dist'
PORT = 4173

class Handler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404 and (ROOT / '404.html').is_file():
            body = (ROOT / '404.html').read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
        else:
            super().send_error(code, message, explain)

if __name__ == '__main__':
    if not (ROOT / 'index.html').is_file():
        raise SystemExit('Le dossier dist est absent. Construire le site avec npm run build.')
    try:
        server = ThreadingHTTPServer(('127.0.0.1', PORT), partial(Handler, directory=str(ROOT)))
    except OSError as error:
        raise SystemExit(f'Impossible de démarrer le serveur sur le port {PORT}: {error}')
    url = f'http://127.0.0.1:{PORT}'
    print(f'Portfolio : {url}\nCtrl+C pour arrêter le serveur')
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
