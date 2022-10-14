// 了么ck提交
//[rule:[\s\S]*USERID=[\s\S]*]

//[priority: 6666666]优先级


function Get_QL_Envs(host, token) {
    try {
        let data = request({
            url: host + "/open/envs",
            method: "get",
            headers: {
                accept: "application/json",
                Authorization: token.token_type + " " + token.token
            }
        })
        return JSON.parse(data).data
    }
    catch (err) {
        return null
    }
}

function match_ck(host, token, ck) {
    var user_id = ck.match(/USERID=([^; ]+)(?=;?)/)[0]
    cklist = Get_QL_Envs(host, token)
    for (i = 0; i < cklist.length; i++) {
        eck = cklist[i]
        if (eck.value.indexOf(user_id) != -1) {
            return Update_QL_Env(host, token, eck.id, ck, eck.remarks)
        }
    }
    return Add_QL_Env(host, token, ck)
}

function Update_QL_Env(host, token, id, value, remark) {
    let body = { "value": value, "name": 'ELE_COOKIE', "remarks": remark, "id": id }
    // if (id.search(/[^\d]/) != -1)
    //     body = { "value": value, "name": 'ELE_COOKIE', "remarks": remark, "_id": id }
    // else
    //     body = { "value": value, "name": 'ELE_COOKIE', "remarks": remark, "id": id }
    try {
        let data = request({
            url: host + "/open/envs",
            method: "put",
            headers: {
                accept: "application/json",
                Authorization: token.token_type + " " + token.token,
                contentType: "application/json"
            },
            body: body,
            dataType: "application/json"
        })
        return JSON.parse(data).data
    } catch (err) {
        return null
    }
}


function Add_QL_Env(host, token, ck) {
    d_t = new Date()
    let year = d_t.getFullYear();
    let month = ("0" + (d_t.getMonth() + 1)).slice(-2);
    let day = ("0" + d_t.getDate()).slice(-2);
    date = year + "-" + month + "-" + day;
    envs = [{
        'name': 'ELE_COOKIE',
        'value': ck,
        'remarks': date,
    }]
    try {
        let data = request({
            url: host + "/open/envs",
            method: "post",
            headers: {
                accept: "application/json",
                Authorization: token.token_type + " " + token.token,
                contentType: "application/json"
            },
            body: envs,
            dataType: "application/json"
        })
        return JSON.parse(data).data
    } catch (err) {
        return null
    }
}

function Get_QL_Token(host, client_id, client_secret) {
    try {
        let data = request({ url: host + "/open/auth/token?client_id=" + client_id + "&client_secret=" + client_secret })
        return JSON.parse(data).data
    }
    catch (err) {
        return null
    }
}

function disable_ck(host, token, id) {
    t = new Date().getTime()
    content = [id]
    try {
        let data = request({
            url: host + "/open/envs/disable?t=" + t,
            method: "put",
            headers: {
                accept: "application/json",
                Authorization: token.token_type + " " + token.token,
                contentType: "application/json"
            },
            body: content,
            dataType: "application/json"
        })
        return JSON.parse(data).data
    } catch (err) {
        return null
    }
}

function main() {
    var eleck = GetContent();

    // let data = bucketGet("qinglong", "QLS")
    // if (data == "") {
    //     sendText("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
    //     return
    // }
    // var QLS=JSON.parse(data)
    // ql_host = QLS[0].host
    // ql_client_id = QLS[0].client_id
    // ql_client_secret = QLS[0].client_secret
    ql_host = "http://192.168.1.219:8889"
    ql_client_id = "d91kmlQ_Wm50"
    ql_client_secret = "DmPuzs4doxARVpTwa_7NnjwU"
    ql_token = Get_QL_Token(ql_host, ql_client_id, ql_client_secret)


    success = match_ck(ql_host, ql_token, eleck)
    if (success != null) {
        sendText("饿了么变量更新成功")
    }
    disable_ck(ql_host, ql_token, success.id)
    sleep(3000)
    RecallMessage(GetMessageID());
}
main();