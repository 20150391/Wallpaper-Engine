const sharp = require("sharp");

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  session
} = require("electron");

const path = require("path");
const fs = require("fs");
const { spawn, execFile } = require("child_process");
const { setWallpaper } = require("wallpaper");

let mainWindow;
let livelyReady = false;

const LIVELY_PACKAGE_ID = "9NTM2QC6QWS7";

const LIVELY_EXE_PATHS = [
  "C:\\Program Files\\Lively Wallpaper\\Lively.exe",

  "C:\\Program Files (x86)\\Lively Wallpaper\\Lively.exe",

  path.join(
    process.env.LOCALAPPDATA || "",
    "Programs",
    "Lively Wallpaper",
    "Lively.exe"
  ),

  path.join(
    process.env.LOCALAPPDATA || "",
    "Lively Wallpaper",
    "Lively.exe"
  )
];

function isImageFile(filePath, mimeType = "") {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".avif"
  ];

  const extension = path.extname(filePath).toLowerCase();

  return (
    imageExtensions.includes(extension) ||
    mimeType.toLowerCase().startsWith("image/")
  );
}

function isVideoFile(filePath, mimeType = "") {
  const videoExtensions = [
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".mkv",
    ".flv",
    ".wmv",
    ".m4v"
  ];

  const extension = path.extname(filePath).toLowerCase();

  return (
    videoExtensions.includes(extension) ||
    mimeType.toLowerCase().startsWith("video/")
  );
}

function isAudioFile(filePath, mimeType = "") {
  const audioExtensions = [
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".flac",
    ".aac",
    ".wma"
  ];

  const extension = path.extname(filePath).toLowerCase();

  return (
    audioExtensions.includes(extension) ||
    mimeType.toLowerCase().startsWith("audio/")
  );
}

function findLivelyExe() {
  for (const livelyPath of LIVELY_EXE_PATHS) {
    if (fs.existsSync(livelyPath)) {
      return livelyPath;
    }
  }

  return null;
}

function runWingetInstall() {
  return new Promise((resolve, reject) => {
    const installProcess = spawn(
      "winget",
      [
        "install",
        "--id",
        LIVELY_PACKAGE_ID,
        "--exact",
        "--source",
        "msstore",
        "--accept-source-agreements",
        "--accept-package-agreements"
      ],
      {
        windowsHide: false,
        stdio: "inherit"
      }
    );

    installProcess.once("error", (error) => {
      reject(
        new Error(
          `Could not start winget.\n\n${error.message}`
        )
      );
    });

    installProcess.once("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Lively installation failed. winget exit code: ${code}`
          )
        );
      }
    });
  });
}

async function ensureLivelyInstalled() {
  if (process.platform !== "win32") {
    throw new Error(
      "Video wallpapers are supported only on Windows."
    );
  }

  let livelyExe = findLivelyExe();

  if (livelyExe) {
    livelyReady = true;
    return livelyExe;
  }

  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["Install Lively", "Cancel"],
    defaultId: 0,
    cancelId: 1,
    title: "Lively Wallpaper Required",
    message: "Lively Wallpaper is required for video backgrounds.",
    detail:
      "The installer will use winget to install Lively Wallpaper from the Microsoft Store."
  });

  if (result.response !== 0) {
    throw new Error(
      "Lively Wallpaper was not installed."
    );
  }

  try {
    await runWingetInstall();
  } catch (error) {
    throw new Error(
      `Could not install Lively Wallpaper.\n\n${error.message}`
    );
  }

  // Give Windows a few seconds to finish registering the installation.
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

  livelyExe = findLivelyExe();

  if (!livelyExe) {
    throw new Error(
      "Lively installed, but Lively.exe could not be found.\n\n" +
      "Open Lively Wallpaper once from the Windows Start menu, then restart this app."
    );
  }

  livelyReady = true;
  return livelyExe;
}

function setVideoWallpaper(livelyExe, videoPath) {
  return new Promise((resolve, reject) => {
    execFile(
      livelyExe,
      ["setwp", "--file", videoPath],
      {
        windowsHide: true
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              stderr ||
              stdout ||
              error.message ||
              "Lively could not set the video wallpaper."
            )
          );

          return;
        }

        resolve(stdout);
      }
    );
  });
}

async function handleVideoDownload(filePath) {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["Set Wallpaper", "Keep Downloaded"],
    defaultId: 0,
    cancelId: 1,
    title: "Video Downloaded",
    message: "Set this video as your animated desktop background?"
  });

  if (result.response !== 0) {
    return;
  }

  try {
    const livelyExe = await ensureLivelyInstalled();

    await setVideoWallpaper(livelyExe, filePath);

    await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Success",
      message: "Video wallpaper set successfully."
    });
  } catch (error) {
    dialog.showErrorBox(
      "Video Wallpaper Error",
      error.message || "Could not set the video wallpaper."
    );
  }
}

async function handleImageDownload(filePath) {
  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["Yes", "No"],
    defaultId: 0,
    cancelId: 1,
    title: "Set Background",
    message: "Set this image as your desktop background?"
  });

  if (result.response !== 0) {
    return;
  }

  try {
    const upscaledPath = path.join(
      path.dirname(filePath),
      `${path.parse(filePath).name}_4k.jpg`
    );

    await sharp(filePath)
      .resize(3840, 2160, {
        fit: "cover",
        position: "centre"
      })
      .jpeg({
        quality: 95
      })
      .toFile(upscaledPath);

    await setWallpaper(upscaledPath);

    await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Success",
      message: "4K wallpaper created and set."
    });
  } catch (error) {
    console.error("Image wallpaper error:", error);

    dialog.showErrorBox(
      "Image Wallpaper Error",
      error.message || "Could not process the image."
    );
  }
}

async function handleDownload(item, state) {
  if (state !== "completed") {
    await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "Download Failed",
      message: `The download failed: ${state}`
    });

    return;
  }

  const filePath = item.getSavePath();
  const mimeType = item.getMimeType() || "";

  if (isVideoFile(filePath, mimeType)) {
    await handleVideoDownload(filePath);
    return;
  }

  if (isAudioFile(filePath, mimeType)) {
    await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Audio Downloaded",
      message: "The audio file was downloaded successfully."
    });

    return;
  }

  if (isImageFile(filePath, mimeType)) {
    await handleImageDownload(filePath);
    return;
  }

  await dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "File Downloaded",
    message: "The file was downloaded successfully."
  });
}

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

  session.defaultSession.on("will-download", (event, item) => {
    const filePath = path.join(
      app.getPath("downloads"),
      item.getFilename()
    );

    item.setSavePath(filePath);

    item.once("done", (_, state) => {
      handleDownload(item, state).catch((error) => {
        console.error("Download handler error:", error);

        dialog.showErrorBox(
          "Download Error",
          error.message || "An unexpected error occurred."
        );
      });
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  // Check/install Lively after the Electron window is visible.
  ensureLivelyInstalled()
    .then(() => {
      console.log("Lively Wallpaper is ready.");
    })
    .catch((error) => {
      console.error("Lively setup error:", error);

      dialog.showMessageBox(mainWindow, {
        type: "warning",
        title: "Video Wallpapers Unavailable",
        message: error.message,
        detail:
          "Images will still work. Video files will download, but they cannot become wallpapers until Lively is installed."
      });
    });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("open-app", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(
      "https://great-image-vortex.base44.app/"
    );
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
