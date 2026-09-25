const sharp = require("sharp");
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  session
} = require("electron");

const path = require("path");
const { setWallpaper } = require("wallpaper");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "assets", "app-logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile("index.html");

  const downloads = session.defaultSession;

  downloads.on("will-download", (event, item) => {
    const filePath = path.join(
      app.getPath("downloads"),
      item.getFilename()
    );

    item.setSavePath(filePath);

    item.once("done", async (_, state) => {
      if (state !== "completed") return;

      const result = await dialog.showMessageBox(mainWindow, {
        type: "question",
        buttons: ["Yes", "No"],
        defaultId: 0,
        title: "Set Background",
        message: "Set this image as your desktop background?"
      });

      if (result.response === 0) {
        try {
          const upscaledPath = path.join(
            path.dirname(filePath),
            path.parse(filePath).name +
              "_4k" +
              path.extname(filePath)
          );

          await sharp(filePath)
            .resize(3840, 2160, {
              fit: "cover"
            })
            .toFile(upscaledPath);

          await setWallpaper(upscaledPath);

          await dialog.showMessageBox(mainWindow, {
            type: "info",
            message: "4K wallpaper created and set!"
          });
        } catch (err) {
          dialog.showErrorBox("Error", err.message);
        }
      }
    });
  });
}

app.whenReady().then(createWindow);

ipcMain.on("open-app", () => {
  mainWindow.loadURL("https://great-image-vortex.base44.app/");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
