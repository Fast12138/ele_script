/**
 * @平行绳 飞机频道：https://t.me/tigerorrose
 * 变量：ELE_CARME：自己购买的卡密
 * 定时随意，每天跑一遍就可以
 * cron: 0 22 * * *
 * 2023.7.10 更新：首次发版， 目前推送今日乐园币，总吃货豆和钱包余额
 * 推送 wxpush，要求 cookie 里面有 wxUid,如'unb=xxx;cookie2=xxxUSERID=xx;SID=xxx;wxUid=xx;'
 */
const $ = new Env('饿了么资产推送');

const { sign, getToken, wait, checkCk, validateCarmeWithType, User_Agent, getCookies, checkCarmeCount, getUserInfo, tryCatchPromise, getCookieMap } = require('./common.js')
const { sendNotify } = require('./sendNotify1.js')
const request = require('request')
const login_tips = "需要登录, 请重新登录"
const GAME_TYEP = 10
const EXCEPTION_STR = '异常'
let CookieEles = getCookies()
var markdownStr = "| 昵称          | 今日乐园币    | 总吃货豆 |余额 |\n" +
    "| ------------- | ------------------ | ---------|---------|\n"

function formateDate() {
    const date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

function getCurrentTime() {
    var t = new Date, e = t.getMonth() + 1, i = t.getDate();
    return e <= 9 && (e = "0" + e), i <= 9 && (i = "0" + i), t.getFullYear() + "-" + e + "-" + i
}

function getMoney(cookie) {
    const options = {
        url: "https://httpizza.ele.me/walletUserV2/storedcard/queryBalanceBycardType?cardType=platform",
        headers: {
            Cookie: cookie,
            "User-Agent": User_Agent,
            'referer': 'https://r.ele.me/alsc-wallet/home.html?channel=grzx'
        },
    };
    return tryCatchPromise(resolve => {
        request(options, async (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const req = JSON.parse(body)
                try {
                    resolve(req.data.totalAmount);
                } catch (error) {
                    console.log(body);
                    resolve(null)
                }
            } else {
                resolve(null)
            }
        })
    });
}

// 获取当前豆子数量
function getCoupsRecord(cookie) {
    const options = {
        url: "https://h5.ele.me/restapi/svip_biz/v1/supervip/foodie/records?latitude=30.153352&limit=20&longitude=104.153352&offset=0",
        headers: {
            Cookie: cookie,
            "User-Agent": User_Agent,
        },
    };
    return tryCatchPromise(resolve => {
        request(options, async (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const req = JSON.parse(body)
                try {
                    resolve(req.peaCount);
                } catch (error) {
                    console.log(body);
                    resolve(null)
                }
            } else {
                resolve(null)
            }
        })
    });

}

async function getMonthRecord(cookie) {
    s = {
        "content-type": "application/json",
        Cookie: cookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36"
    }
    r = "https://h5.ele.me/restapi/svip_biz/v1/supervip/foodie/records?offset=0&limit=100&longitude=39.916527&latitude=116.397128"
    const options = {
        url: r,
        headers: s,
    };

    return tryCatchPromise(resolve => {
        request(options, async (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const req = JSON.parse(body)
                try {
                    for (var n = getCurrentTime(), a = req.records, s = 0, r = 0; r < a.length; r++) a[r].createdTime.indexOf(n) > -1 && 1 == a[r].optType && (s += a[r].count);
                    resolve(s);
                } catch (error) {
                    console.log(body);
                    resolve(null)
                }
            } else {
                resolve(null)
            }
        })
    });
}

function queryintegralproperty(cookie) {
    var headers = {
        'authority': 'mtop.ele.me',
        'accept': 'application/json',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'cookie': cookie,
        'origin': 'https://tb.ele.me',
        'pragma': 'no-cache',
        'referer': 'https://tb.ele.me/wow/alsc/mod/b9ee9e6451bc8eda7a6afcbb?spm=a2ogi.13162730.zebra-ele-login-module-9089118186&spm=a2ogi.13162730.zebra-ele-login-module-9089118186&spm-pre=a13.b_activity_kb_m71293.ebridge.login',
        'user-agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36',

    };

    var dataJson = { "bizScene": "SWEET_COMPOSE", "actId": ["20221207144029906162546384"], "collectionIds": "[\"20221207144029911927117215\"]" }
    const time = new Date().getTime();
    const appKey = 12574478
    var dataString = 'data=' + encodeURIComponent(JSON.stringify(dataJson));
    const token = getToken(cookie), tokenFirst = token.split('_')[0]
    const dataSign = sign(tokenFirst + '&' + time + '&' + appKey + '&' + JSON.stringify(dataJson))

    var options = {
        url: 'https://mtop.ele.me/h5/mtop.alsc.playgame.mini.game.index/1.0/?jsv=2.7.1&appKey=12574478&t=' + time + '&sign=' + dataSign + '&api=mtop.alsc.playgame.mini.game.index&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp&useNebulaJSbridge=true&useNebulaJSbridgeWithAMAP=true&dangerouslySetWindvaneParams=%5Bobject%20Object%5D&SV=5.0&secttid=h5%40android_chrome_87.0.4280.141&bx_et=cSxCBnAjwQKaAuiux6MwfCvCG7s1aTlCB812dXS3M5zn-V9N6smU0siUGk4fJGX1.',
        method: 'POST',
        headers: headers,
        body: dataString
    };

    return tryCatchPromise(resolve => {
        request(options, async (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const req = JSON.parse(body)
                try {
                    resolve(req.data.data.propertyList[0].amount)
                } catch (error) {
                    console.log(body);
                    resolve(null)
                }

            } else {
                resolve(null)
            }
        })
    });
}

function querypropertydetail(cookie) {
    var headers = {
        'authority': 'mtop.ele.me',
        'accept': 'application/json',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'cookie': cookie,
        'origin': 'https://tb.ele.me',
        'pragma': 'no-cache',
        'referer': 'https://tb.ele.me/wow/alsc/mod/b9ee9e6451bc8eda7a6afcbb?spm=a2ogi.13162730.zebra-ele-login-module-9089118186&spm=a2ogi.13162730.zebra-ele-login-module-9089118186&spm-pre=a13.b_activity_kb_m71293.ebridge.login',
        'user-agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36',
    };

    var dataJson = { "templateId": "1404", "bizScene": "game_center", "convertType": "GAME_CENTER", "startTime": formateDate() + " 00:00:00", "pageNo": 1, "pageSize": "50" }
    const time = new Date().getTime();
    const appKey = 12574478
    var dataString = 'data=' + encodeURIComponent(JSON.stringify(dataJson));
    const token = getToken(cookie), tokenFirst = token.split('_')[0]
    const dataSign = sign(tokenFirst + '&' + time + '&' + appKey + '&' + JSON.stringify(dataJson))

    var options = {
        url: 'https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.querypropertydetail/1.0/?jsv=2.7.1&appKey=12574478&t=' + time + '&sign=' + dataSign + '&api=mtop.koubei.interaction.center.common.querypropertydetail&v=1.0',
        method: 'POST',
        headers: headers,
        body: dataString
    };

    return tryCatchPromise(resolve => {
        request(options, async (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const req = JSON.parse(body)
                try {
                    if (req.data) {
                        var totalAmount = 0
                        for (let index = 0; index < req.data.list.length; index++) {
                            const element = req.data.list[index];
                            if (element.detailType == 'GRANT') {
                                totalAmount += Number(element.amount)
                            }

                        }
                    }
                    resolve(totalAmount)
                } catch (error) {
                    console.log(body);
                }
                resolve(req)
            } else {
                resolve(null)
            }
        })
    });
}

async function assestNotify(cookie, remarks) {
    const cookieMap = getCookieMap(cookie)
    if (!cookieMap.has('wxUid')) {
        console.log('没有获取到推送 uid，不推送消息\n');
    } else {
        await sendNotify('饿了么资产推送', remarks, { uid: cookieMap.get('wxUid') })
    }
}

async function start() {
    const kami = process.env.ELE_CARME
    await validateCarmeWithType(kami, 1)
    for (let i = 0; i < CookieEles.length; i++) {
        let token = CookieEles[i]
        token = await checkCk(token)
        if (token == login_tips) {
            console.log('第', i + 1, "账号失效！请重新登录！！！😭")
            continue
        }

        let user = await getUserInfo(token)
        if (user.name == 'UNAUTHORIZED') {
            console.log('第', i + 1, "账号失效！请重新登录！！！😭")
            continue
        }

        const userId = user.user_id
        await checkCarmeCount(kami, userId, GAME_TYEP)

        console.log('******开始【饿了么账号', i + 1, '】', user.username, '*********')
        var money = await getMoney(token)
        if (!money) {
            money = EXCEPTION_STR
        } else {
            money = money / 100
        }

        var dou = await getCoupsRecord(token)
        if (!dou) {
            dou = EXCEPTION_STR
        }

        var bi = await querypropertydetail(token)
        if (!bi) {
            bi = EXCEPTION_STR
        }
        var zongbi = await queryintegralproperty(token)
        if (!zongbi) {
            zongbi = EXCEPTION_STR
        }
        console.log('乐园币：' + bi);
        console.log('当前乐园币：' + zongbi);
        console.log('总吃货豆：' + dou);
        console.log('余额：' + money);
        var remarks = "###资产推送\n" + markdownStr + "|" + user.username + "|" + bi + "|" + zongbi + "|" + dou + "|" + money + "|"
        await assestNotify(token, remarks)
        await wait(10)
    }
    process.exit(0)
}

start()

// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
