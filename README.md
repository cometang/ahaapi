#ahaapi 介绍文档

#### 简介

ahaapi 是一个封装了hash1算法的请求的 js插件

###1.安装命令

```
npm install ahaapi --save
```



###2.全局引入

###### 在main.js中引入

```js
import axios from 'axios'
import util from 'ahaapi'
```

###### 在main.js中挂载

```js
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://0.0.0.0/api/**'               //输入项目请求的公共url
Vue.prototype.$util = util
```



####3.在组件中使用



```js
let cnt = {
      id: 1111,
};
/*
*'/xx/xx' ('不包含公共url的请求接口地址',
*cnt: obj,请求的值 
*callback,回调函数)	
*/
this.$util.call('/asset/**',cnt,function (res) {      
  console.log(res)
}

```

