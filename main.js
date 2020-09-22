const electron = require('electron');
const { app, BrowserWindow, ipcMain, globalShortcut, shell } = require('electron');

let win;
let settings;

function log(arg){
	win.webContents.send('consoleLog', arg);
}

function createWindow(){
 
	const { _width, _height } = electron.screen.getPrimaryDisplay().size;

	win = new BrowserWindow({
		width: _width,
		height: _height,
		center: true,
		alwaysOnTop: true,
		transparent: true,
		frame: false,
		resizable: false,
		kiosk: true,
		titleBarStyle: 'hiddenInset',
		show: true,
		webPreferences: {
			nodeIntegration: true
		},
		backgroundColor: '#00000000'
	});

	win.setIgnoreMouseEvents(true, {forward: true});
	win.loadFile('index.html');
	
	win.on('closed', () => {
		win = null;
	});

	win.setSkipTaskbar(true);

	setTimeout(function(){
		win.webContents.send('settings', app.getAppPath());
	}, 500);

}
app.on('ready', createWindow)

app.on('window-all-closed', () => {

	if (process.platform !== 'darwin'){
		app.quit();
	}

})

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
})

app.on('activate', () => {

	if(win === null){
		createWindow();
	}

})

ipcMain.on('closeWindow', function(event, arg){
	
	win.setIgnoreMouseEvents(true, {forward: true});
	win.blur();

	if( arg == null ){ return; }

	function openFile(cube){

		if( cube.path == null ){ return; }

		if( cube.path.includes("http") ){
			shell.openExternal(cube.path);
			return;
		}

		let exec = require('child_process').exec;
		let fullpath = cube.path;
		if( cube.params ){ fullpath += " " + cube.params; }

		let child = exec(fullpath, function (error, stdout, stderr){
			//console.log('stdout: ' + stdout);
		});

		return;

	}

	switch(arg){
		case "front":
			openFile(settings.front); break;
		case "left":
			openFile(settings.left); break;
		case "right":
			openFile(settings.right); break;
		case "top":
			openFile(settings.top); break;
		case "back":
			openFile(settings.back); break;
		case "bottom":
			openFile(settings.bottom); break;
		default:
			break;
	}

})

ipcMain.on('setSettings', function(event, arg){
	
	settings = JSON.parse(arg);

	globalShortcut.register(settings.hotkey, () => {
		win.setIgnoreMouseEvents(false, {forward: true});
		win.webContents.send('useCube', true);
		win.focus();
	});

	/*
	globalShortcut.register("Ctrl+F12", () => {
		win.webContents.openDevTools();
	});
	*/

})