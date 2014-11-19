var log = document.getElementById("log");
var cons = document.getElementsByClassName("console");
var command_box = document.getElementById("command");
var console_header = document.getElementById("location");
var input_state = false;


function add_listeners() {
    command_box.addEventListener('keydown', function(e) {
        if (e.keyCode == 13 && !input_state) {
            var target = e.target;
            e.preventDefault();
            var command = target.innerHTML.trim();
            appendToLog('>> ' + command);
            try {
                parseCommand(command);
            }   catch(e){
                console.log(e);
                appendToLog("Command not found!")
            }
            target.innerHTML = "";
        } else if (input_state && e.keyCode == 83 && e.ctrlKey) {
            e.preventDefault();
            var target = e.target;
            var command = target.innerHTML.trim().replace(new RegExp('<br>', 'g'), "\n");
            target.innerHTML = "";
            try {
                parseCommand('save ' + command);
            }   catch(e){
                console.log(e);
                appendToLog("Command not found!")
            }
        }
    });

    cons[0].addEventListener("click",function(e) {command_box.focus();});
}

function parseCommand(command) {
    command = command.replace(new RegExp('&nbsp;', 'g'), ' ');
    command = command.trim();
    var index = command.indexOf(' ');
    if (command == 'clear') {
        clearLog();
        return;
    }
    if (index > 0) {
        var command_code = command.substring(0, index).trim();
        var parameters = command.substring(index+1).trim();
        fs[command_code](parameters, function(res) {
            if (res.code == 200) {
                if (res['current_tree'] != null) {
                    fs.current_dir = res.current_tree;
                    updateConsoleHeader();
                }   else {
                    if (res.hasOwnProperty('input_state')) {
                        input_state = res['input_state'];
                        if (input_state == false) {
                            updateConsoleHeader();
                        }   else {
                            fs.tree_to_change = res['tree_to_change']
                            clearConsoleHeader();
                        }
                    }
                }
                if (res.text != null) {
                    appendToLog(res.text.replace(new RegExp('\n', 'g'), "<br/>").replace(new RegExp(' ', 'g'), "&nbsp"));
                }
            }   else {
                appendToLog(res.msg);
            }
        });
    }   else {
        fs[command]('', function(res) {
            if (res.code == 200) {
                if (res['current_tree'] != null) {
                    fs.current_dir = res.current_tree;
                }
                if (res.text != null) {
                    appendToLog(res.text.replace(new RegExp('\n', 'g'), "<br/>").replace(new RegExp(' ', 'g'), "&nbsp"));
                }
            }   else {
                appendToLog(res.msg);
            }
            updateConsoleHeader();
        });
    }
}

function appendToLog(text) {
    text = text + '<br/>';
    log.innerHTML += text;
    scrollToBottom(cons[0]);
}

function clearLog() {
    log.innerHTML = '';
}

function updateConsoleHeader() {
    console_header.innerHTML = fs.current_dir.path();
}

function clearConsoleHeader() {
    console_header.innerHTML = '';   
}

function scrollToBottom(e) {
    e.scrollTop = e.scrollHeight;
}

updateConsoleHeader();
add_listeners();