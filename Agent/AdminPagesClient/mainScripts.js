var wsUri = "ws://127.0.0.1:3001";
var output;
var topMenu;
var menuConfig = [
    {
        Name: 'User',
        ID: 'User'
    },
    {
        Name: 'Event',
        ID: 'Event'
    },
    {
        Name: 'Clear',
        ID: 'Clear'
    }
];

function init() {
    output = document.getElementById("mainPages");
    topMenu = document.getElementById("topMenu");
    writeToScreen("Connecting");
    ConnectAdminProtocol();
}

function initMenu() {
    for (var i = 0; i < menuConfig.length; i++) {
        insertMenuToScreen(menuConfig[i].Name, menuConfig[i].ID);
    }
}

function OnButtonClick(id) {
    switch (id) {
        case 'User' :
            writeToScreen("Loading User Module");
            break;
        case 'Event':
            writeToScreen("Loading Event Module");
            break;
        case 'Clear':
            clearScreen();

            break;
        default:
            writeToScreen("Can't find function");
            break;
    }
}

function ConnectAdminProtocol() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function (evt) {
        onOpen(evt)
    };
    websocket.onclose = function (evt) {
        onClose(evt)
    };
    websocket.onmessage = function (evt) {
        onMessage(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };
}


function onOpen(evt) {
    clearScreen();
    writeToScreen("Connected");
    initMenu();
}

function onClose(evt) {

}

function onMessage(evt) {
    //writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');
    //websocket.close();
}

function onError(evt) {
    //writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
    //writeToScreen("SENT: " + message);
    //websocket.send(message);
}

function writeToScreen(message) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

function clearScreen() {
    output.innerHTML = '';
}

function insertMenuToScreen(menu, id) {
    var pre = document.createElement("button");
    pre.innerText = menu;
    pre.id = id;
    pre.onclick = function (ev) {
        OnButtonClick(id);
    };
    topMenu.appendChild(pre);
}

window.addEventListener("load", init, false);