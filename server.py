#!/usr/bin/env python3
"""annPlan - 로컬 저장 서버 (start.command 또는 start.bat으로 실행)"""
import http.server, json, os, sys

PORT = 9753
DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(DIR)

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/save-tracking":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            with open(os.path.join(DIR, "tracking.js"), "w", encoding="utf-8") as f:
                f.write(body)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        elif self.path == "/save-data":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            with open(os.path.join(DIR, "data.js"), "w", encoding="utf-8") as f:
                f.write(body)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        msg = str(args)
        if "/save-tracking" in msg:
            sys.stderr.write("  [saved] tracking.js\n")
        elif "/save-data" in msg:
            sys.stderr.write("  [saved] data.js\n")

print(f"""
╔══════════════════════════════════════╗
║         annPlan Server               ║
║  http://localhost:{PORT}               ║
╚══════════════════════════════════════╝
""")
http.server.HTTPServer(("", PORT), Handler).serve_forever()
