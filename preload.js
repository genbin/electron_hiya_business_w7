const {contextBridge, ipcRenderer} = require('electron');

// 处理来自flutter web的获取打印机请求：
contextBridge.exposeInMainWorld('saveUserLoginData', (data) => {
    ipcRenderer.send('save-user-login-data', data);
});
/*
contextBridge.exposeInMainWorld('getSystemPrinters', (data) => {
    ipcRenderer.send('get-system-printers');
});

contextBridge.exposeInMainWorld('getPrintersList',  (data) => {
    ipcRenderer.send('get-printers-list');
});

contextBridge.exposeInMainWorld('clearClipboard', (data) => {
    ipcRenderer.send('clear-clipboard');
});

contextBridge.exposeInMainWorld('getCurrentLocation', (data) => {
    ipcRenderer.send('get-current-location');
});
* */

