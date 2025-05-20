const {BrowserWindow, ipcMain, app, } = require('electron');
const path = require('path');
const fs = require('fs');
const {getMessage, printReceipt, savePrinters, getCurrentLocation} = require("./api");
const {config, shop, getConfig, writeFile} = require("./global");
const {screen} = require("electron");
const electron = require("electron");

let win;

// Create main window
function createMainWindow() {
    const size = screen.getPrimaryDisplay().size;
    win = new BrowserWindow({
        height: size.height,
        width: size.width,
        minWidth: config["minWidth"],
        minHeight: config["minHeight"],
        title: `${config['appTitle']} ${config['ver']}`,
        resizable: true,
        fullscreenable: true,
        autoHideMenuBar: true,
        center: true,
        webPreferences: {
            additionalArguments: [],
            allowRunningInsecureContent: true,
            nodeIntegration: false, // Do not enable Node.js integration
            contextIsolation: true, // 启用隔离
            devTools: true,
            webSecurity: false, //禁用同源策略
            // plugins: true, //是否支持插件
            // nativeWindowOpen: true, //是否使用原生的window.open()
            // webviewTag: true, //是否启用 <webview> tag标签
            sandbox: true,
            preload: path.join(__dirname, '../preload.js')
        }
    });

    let serverUrl = config['serverAddress'];
    if (config['isTest']) {
        serverUrl = config['testAddress'];
    }
    win.loadURL(serverUrl).then(r => {
        _debug();

    }).catch((err) => {
        console.log(err);
    });

    win.on('show', () => {})

    win.on('close', (e) => {
        const choice = electron.dialog.showMessageBoxSync(win, {
            type: 'info',
            title: '提示',
            message: '确认退出',
            buttons: ['最小化运行', '立即退出'],
            defaultId: 0,
            cancelId: 0
        });
        if (choice === 0) {
            e.preventDefault();
            win.minimize();
        }
    })
    win.on('closed', (e) => {
        // win.close();
    });

    ////////////////////////////////////////////
    // ipcMain.on('test-print', printReceipt);

    // ipcMain.on('get-system-printers', async (event) => {
    //     _getSystemPrinters()
    // });

    // ipcMain.on('clear-clipboard', async (event) => {
    //     _writeClipBoard('');
    // });

    let messageIntervalId = null;
    ipcMain.on('save-user-login-data', (event, data) => {
        if (data != null && data.trim().length > 0) {
            shop['ownerId'] = data;
            /// 获取打印机，并写入数据库
            _getSystemPrinters(data);

            /// 清除之前可能存在的interval, 防止多个interval同时运行
            if (messageIntervalId != null) {
                clearInterval(messageIntervalId);
            }

            /// 延迟开启打印小票
            _delayAndExecute(() => {
                messageIntervalId = setInterval(function () {
                    if (shop && shop['ownerId']) {
                        getMessage(data);
                    }
                }, 1000);
            });
        }
    });

    // ipcMain.on('get-current-location', (event) => {
    //     getCurrentLocation((error, location) => {
    //         if (error) {
    //             console.error('Error getting current location:', error);
    //             event.reply('current-location-result', { error: error.message });
    //         } else {
    //             console.log('Current location:', location);
    //             event.reply('current-location-result', { location });
    //         }
    //     });
    // });

    // 从系统文件printers.json中获取当前打印机信息
    // ipcMain.on('get-printers-list',  async () => {
    //     return '';
    // });
}

function _debug() {
    if (config['isDebug']) {
        win.openDevTools();
    }
}

function _delayAndExecute(callback) {
    setTimeout(callback, 20*1000);
}

function _getSystemPrinters(shopCode) {
    /// 获取系统中的打印机，并写入文件printers.json, 写入剪贴板
    win.webContents.getPrintersAsync().then(printers => {
        try {
            let txt = JSON.stringify(printers, null, 2);
            if (shopCode != null && shopCode.trim().length > 0) {
                savePrinters(shopCode, txt);
            }
        } catch (err) {
            console.error('Error saving printers to JSON:', err);
        }
        _debug();
    });
}

/// 数据写入剪贴板
// function _writeClipBoard(data) {
//     require('electron').clipboard.writeText(data);
// }

// function _readClipBoard(data) {
//     return require('electron').clipboard.readText('clipboard');
// }

// function isLogin() {
//     return shop != null && shop['ownerId'] != null;
// }

module.exports = {createMainWindow};