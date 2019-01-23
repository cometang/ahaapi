import axios from 'axios'
import CryptoJS from 'crypto-js'




/**
 * 返回错误码常量预定义
 */
const RC = {
        SUCCESS: "succ",
        FAILURE: "fail",
        NOSESSION: "no session",
        AJAXERROR: "ajax error"
    };


/**
 *  远程调用方法的封装</br>
 *  （所有方法均尝试进行信息签名，服务端将酌情处理）
 * @param url 接口地址
 * @param content 接口参数对象
 * @param callback 回调方法
 */
function call(api, content, callback) {
  let url = api
  //从session中读取id和secret
  let userSession = sessionStorage.getItem("USER_SESSION");
  let id = undefined;
  let secret = undefined;
  if (userSession != null) {
    id = userSession.id;
    secret = userSession.loginToken;
  }

  let req = {
    c: content
  };
  if (id != undefined && secret != undefined) {
    req.id = id;
    //按id->c的顺序连接字符串，然后再使用HmacSHA1(verifyByHmacSHA1ToID64)和密钥进行签名得到v
    //console.debug("verify->>>" + req.id + "&" + req.cnt + "&" + secret);
    req.v = CryptoJS.HmacSHA1((req.id + req.c), secret).toString(CryptoJS.enc.Hex);
  }
  //转换成字符再传，如果是对象，可能axios会自动设置content-type，导致出现options包
  //将来有问题，也可以强制指定content-type为text/plain这样的简单请求类型
  let data = JSON.stringify(req);

  //console.log(data);
  // console.log("请求长度:" + "------------" + data.length);

  // req.setRequestHeader("Content-Type", "text/plain");//没这句，微信android会发OPTIONS请求
  axios.defaults.headers = {
    "Content-Type": "text/plain"
  }

  axios.post(url, data).then(function (json) {
    // console.error("axios>" + JSON.stringify(json));
    callback(json);
  }).catch(function (readyState, status, error) {
    // console.error("axios>>>" + error);
    console.error(readyState);
    callback({
      rc: RC.AJAXERROR,
      rm: (readyState + "&" + status + "&" + error)
    })
  })
}

function isBlank(str) {
  if (str == null || typeof str == "undefined" ||
    str == "" || str.trim() == "") {
    return true;
  }
  return false;
}


export default {RC, call, isBlank}


