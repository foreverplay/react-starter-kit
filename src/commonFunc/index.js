// 获取url参数
export function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    //获取url中"?"符后的字符串并正则匹配
    var context = '';
    if (r != null)
        context = r[2];
    reg = null;
    r = null;
    return context == null || context == '' || context == 'undefined' ? '' : context;
}

// 
export function getUserToken() {
    let token = "TgFWCL7Isu1PGZQjVf9oQNK4S48oe4";
    if (localStorage != undefined && localStorage.getItem("token") != undefined) {
        token = localStorage.getItem("token");
    }
    return token
}