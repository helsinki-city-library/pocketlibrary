from bottle import run, get, static_file, response
import random
import os
import sys

@get('/patron.json/:cid')
def get_patron(cid):
    return static_file('patron.json', root='.')

@get(':name#.+#')
def get_static(name):
    response.add_header('Access-Control-Allow-Origin', 'http://192.168.0.103:8000')
    return static_file(name, root='.')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        host, port = sys.argv[1].split(':')
    else:
        port = 8000 + random.randint(0, 1000)
        host='localhost'

    with open('/tmp/fiddle.addr', 'w') as f:
        f.write('http://%s:%s/static/index.html' % (host, port,))

    run(host=host, port=port, reloader=True)
