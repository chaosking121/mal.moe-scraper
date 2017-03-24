var username = "";
var password = "";

document.addEventListener('DOMContentLoaded', function () {
    restoreConfig();
    if (apikey == null) {
        $("#status").text("Before you can use scrape images, please enter your username and password. They will not be stored securely.");
    };
});

document.getElementById('save').addEventListener('click', function () {
    $("#popup").fadeTo("fast", 0.5);
    $("#spin").spin();
    $("#page *").prop('disabled', true);
    $("#save").toggleClass("unclickable");
    readInputs();

    testUsernameAndPassword(username, password).then(function (response) {
        saveConfig();
        $("#popup").stop(true).fadeTo('fast', 1);
        $("#spin").spin(false);
    }).catch(function (error) {
        $("#status").text(error);
        $("#page *").prop('disabled', false);
        $("#save").toggleClass("unclickable");
        $("#popup").stop(true).fadeTo('fast', 1);
        $("#spin").spin(false);
    });
});


function readInputs() {
    username = document.getElementById('username').value.trim();
    password = document.getElementById('password').value.trim();
}


function testUsernameAndPassword(username, password) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var url = "https://mal.moe/api/waifus/all/names"
        var auth = "Basic " + btoa(username + ':' + password);

        request.open("GET", url, true);
        request.setRequestHeader('Authorization', auth);

        request.onload = function () {
            if (this.status === 200) {
                resolve(request.statusText);
            }
            else {
                reject(Error(request.statusText));
            }
        };

        request.onerror = function () {
            reject(Error("Invalid username/password. Or the server is down. Can't say."));
        };

        request.send();

    });

}

function saveConfig() {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    $("#status").text("Sucess! Configuration saved.");
    setTimeout(function () {
        $("#status").text("");
        window.close();
    }, 1500);
}

function restoreConfig() {
    username = localStorage.getItem("username");
    password = localStorage.getItem("password");

    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}
