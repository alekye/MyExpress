const path = require("path");
const Config = require("./Config");
const conf = Config.load("default.json") || {};
console.log("config = ", conf);
const port = conf.port || 5000;

const express = require("express");
const app = express();

// 代理服务
const proxy = conf.proxy;
if (proxy) {
  const { createProxyMiddleware } = require('http-proxy-middleware');
  if (Array.isArray(proxy)) {
    for(let p of proxy) {
      app.use(p.url, createProxyMiddleware({ target: p.target, changeOrigin: true }));
    }
  } else if (typeof proxy === 'object') {
    app.use(proxy.url, createProxyMiddleware({ target: proxy.target, changeOrigin: true }));
  }
}

// 静态文件服务
const fileDir = conf.fileDir || "./wwwroot";
const fullFilePath = path.join(process.mainModule.path, fileDir);
console.log("web file dir = ", fullFilePath);
// 静态文件配置
const options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html"],
  index: "index.html",
  // maxAge: 0,
  redirect: false,
  setHeaders: function(res, path, stat) {
    res.set("x-timestamp", Date.now());
  }
};
app.use(express.static(fullFilePath, options));

app.listen(port, () => console.log(`Server listening on port ${port}!`));
