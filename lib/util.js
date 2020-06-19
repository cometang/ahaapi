import axios from 'axios'
import CryptoJS from 'crypto-js'

// 是否是uniapp环境
let isUniApp = typeof uni !== 'undefined'
// 是否支持localStorage (微信小程序不支持)
let isSupStorage = typeof localStorage !== 'undefined'

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
 * @isPass  是否绕过token 验证及用户登录验证  默认false(不能绕过)
 * @post 请求方式
 */
function call(api, content, callback, isPass = false, _method = 'POST') {
  let _header = {
    "Content-Type": "application/json"
  }
  let token = ''
  let data = content;
  let url = api

  //从session中读取用户数据 及 token
  if (!isPass) { //不能绕过验证的 在header添加token
    if (isUniApp) {
      token = uni.getStorageSync("token") || ''
    } else {
      token = localStorage.getItem("token") || ''
    }
    //判断token是否存在及是否需要重新请求用户信息及token
    if (token != null) {
      //--header 加上token
      _header = {
        "Content-Type": "application/json",
        "Authorization": token
      }
    }else{
        //这里写重新请求token的逻辑
    }
  }
  //uniapp 请求
  if (isUniApp) {
    uni.request({
      url,
      data,
      header: _header,
      method: _method,
      success(res) {
        //根据状态码判断 接口是否成功
        if (res.statusCode > 300 && res.statusCode != 401) {
          res.rc = RC.FAILURE
          let keys = Object.keys(res.data)
          //后端返回的错误信息提示
          res.msg = res.data[keys[0]] + ''
        } else {
          //成功后给原值加上成功标志的属性
          res.rc = RC.SUCCESS
        }
        callback(res);
      },
      fail(err) {
        //超时--未找到接口提示
        callback({
          rc: RC.AJAXERROR,
          msg: '请求异常'
        })
      }
    });
  } else {
    //axios Vue  react 项目的网页请求
    axios.defaults.headers = _header
    axios({
      method: _method,
      url: url,
      data: data
    }).then(function (res) {
      //根据状态码判断 接口是否成功
      if (res.statusCode > 300 && res.statusCode != 401) {
        res.rc = RC.FAILURE
        let keys = Object.keys(res.data)
        //后端返回的错误信息提示
        res.msg = res.data[keys[0]] + ''
      } else {
        //成功后给原值加上成功标志的属性
        res.rc = RC.SUCCESS
      }
      callback(res);
    }).catch(function (err) {
      //超时--未找到接口提示
      callback({
        rc: RC.AJAXERROR,
        msg: '请求异常'
      })
    })
  }
}


/**
 *@tryParseJson json转换容错
 *
 * @param data      需要json.parse的数据
 * @param dataType  异常后期望返回的类型（{} []）
 * @param isCompel  是否强制转换
 */
function tryParseJson(data, dataType = [], isCompel = true) {
  let resData = null
  try {
    resData = JSON.parse(data)
  } catch (e) {
    console.log('数据异常' + e)
    resData = isCompel ? dataType : data
  }
  return resData
}


export default {
  RC,
  call,
  tryParseJson
}