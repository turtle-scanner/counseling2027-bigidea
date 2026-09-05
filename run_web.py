# -*- coding: utf-8 -*-
import http.server
import socketserver
import webbrowser
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(('', PORT), Handler) as httpd:
            url = f'http://localhost:{PORT}/index.html'
            print('=' * 60)
            print('  2027 임용고시 전문상담 핵심 교재 웹 서버 구동 중...')
            print(f'  접속 주소: {url}')
            print('  종료하려면 터미널에서 Ctrl+C 를 누르세요.')
            print('=' * 60)
            webbrowser.open(url)
            httpd.serve_forever()
    except OSError:
        alt_port = 8888
        with socketserver.TCPServer(('', alt_port), Handler) as httpd:
            url = f'http://localhost:{alt_port}/index.html'
            print(f'대체 포트 {alt_port}로 실행합니다: {url}')
            webbrowser.open(url)
            httpd.serve_forever()

if __name__ == '__main__':
    run()
