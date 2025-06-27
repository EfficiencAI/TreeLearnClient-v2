import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process';
import fs from 'fs';

let springBootProcess; // 用于保存Spring Boot进程的引用
// 启动Spring Boot应用
function startSpringBoot() {
    return new Promise<void>((resolve, reject) => {
        const jarPath = path.join(__dirname, 'backend', 'TreeLearn-0.0.1-SNAPSHOT.jar');
        
        // 检查JAR文件是否存在
        if (!fs.existsSync(jarPath)) {
            reject(new Error('Spring Boot JAR file not found'));
            return;
        }

        // 启动Spring Boot应用
        springBootProcess = spawn('java', ['-jar', jarPath], {
            stdio: 'pipe'
        });

        springBootProcess.stdout.on('data', (data) => {
            console.log(`Spring Boot: ${data}`);
            // 检测Spring Boot是否启动完成
            if (data.toString().includes('Started') || 
                data.toString().includes('Tomcat started on port')) {
                resolve();
            }
        });

        springBootProcess.stderr.on('data', (data) => {
            console.error(`Spring Boot Error: ${data}`);
        });

        springBootProcess.on('close', (code) => {
            console.log(`Spring Boot process exited with code ${code}`);
        });

        // 设置超时
        setTimeout(() => {
            resolve(); // 即使没有检测到启动消息也继续
        }, 10000);
    });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  // mainWindow.webContents.openDevTools() // uncomment this line to open devtools
}

app.whenReady().then(async () => {
  try{
      // 启动Spring Boot
      await startSpringBoot();
      console.log("Spring Boot Start Successfully");

      electronApp.setAppUserModelId('com.electron')
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })
      ipcMain.on('ping', () => console.log('pong'))

      createWindow()

      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  }catch(e){
      console.log(e)
  }
})

// 应用退出时关闭Spring Boot进程
app.on('before-quit', () => {
    if (springBootProcess) {
        springBootProcess.kill();
    }
});

app.on('window-all-closed', () => {
  if (springBootProcess) {
    springBootProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
