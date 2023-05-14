from flask import Flask, Request, Response, make_response
from flask import request, render_template_string
import argparse
import jwt
import werkzeug


parser = argparse.ArgumentParser()
parser.add_argument("--port", help="Port on which to run the server", required=False, type=int, default=5000)


app = Flask(__name__)


class middleware():
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)

        # Check for potential payloads in GET params
        for key, value in request.args.items():
            if len(value) > 50:
                res = Response(u'Anormaly long payload', mimetype= 'text/plain', status=400)
                return res(environ, start_response)

        # Check for potential payloads in route
        if len(request.path) > 50:
            res = Response(u'Anormaly long payload', mimetype= 'text/plain', status=400)
            return res(environ, start_response)
        
        return self.app(environ, start_response)

app.wsgi_app = middleware(app.wsgi_app)

def add(a, b):
    return a + b
def substract(a, b):
    return a - b
def multiply(a, b):
    return a * b
def divide(a, b):
    if b < 0:
        return "Error: Division by zero"
    return a / b

operations = {
    "add": add,
    "substract": substract,
    "multiply": multiply,
    "divide": divide
}

def generateGuestToken():
    return jwt.encode({"role": "guest"}, key="key", algorithm="HS256")


@app.route("/")
def calculate():
    token = request.cookies.get('token')
    if token is None:
        token = generateGuestToken()
    try:
        decodedToken = jwt.decode(token, key="key", algorithms=["HS256"])
        decodedToken.get('role')
    except:
        token = generateGuestToken()


    # Check if operation is valid to avoid crashes !
    op = request.args.get('op')
    if op not in ["add", "substract", "multiply", "divide"]:
        resp = make_response("<h2>Invalid operation</h2><br><p>Example: /?op=substract&n1=5&n2=2</p>")
        resp.set_cookie('token', token)
        return resp
    
    n1 = request.args.get('n1')
    n2 = request.args.get('n2')
    # Check if n1 and n2 are numbers, and prevent crashes ahah !
    try:
        n1 = int(n1)
        n2 = int(n2)
    except:
        return "<h2>Invalid number</h2>"

    result = operations[op](n1, n2)

    resp = make_response(render_template_string(render_template_string("""
        <h2>Result: {{ result }}</h2>
    """, result=result)))

    resp.set_cookie('token', token)

    return resp

@app.route("/adminPage")
def admin():

    # Get JWT token from cookies
    token = request.cookies.get('token')

    # Decode JWT token
    try:
        decodedToken = jwt.decode(token, key="key", algorithms=["HS256"])
    except:
        return render_template_string("<h2>Invalid token</h2>"), 403
    
    # Get role
    role = decodedToken.get('role')
    if role is None:
        return render_template_string("<h2>Invalid token</h2>"), 403

    if role == "admin":
        return render_template_string("Welcome admin !"), 200

    return render_template_string("Sorry but you can't access this page, you're a '{role}'", role=role), 403


@app.errorhandler(werkzeug.exceptions.BadRequest)
def handle_page_not_found(e):
    return render_template_string("<h2>{page} was not found</h2><br><p>Only routes / and /adminPage are available</p>", page=request.path), 404

app.register_error_handler(404, handle_page_not_found)


app.run(debug=True, use_debugger=True, use_reloader=False, host="0.0.0.0", port=parser.parse_args().port)