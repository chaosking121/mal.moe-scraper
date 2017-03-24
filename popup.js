"use strict";

document.addEventListener("DOMContentLoaded", function() {
    $("#popup").fadeTo("fast", 0.5);
    $("#spin").spin();
    $("#popup").addClass("unclickable");
});

getCurrentTabUrl(function (url) {
    if (moeExt.config.getUsername() != null) {
        moeExt.popup.init(url);
    } else {
        chrome.runtime.openOptionsPage();
    }

    $('#config').on('click', function () {
        chrome.runtime.openOptionsPage();
    });
});

function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        var tab = tabs[0];
        var url = tab.url;

        callback(url);
    });
}

var moeExt = {

    config: {
        getAuth: function () {
            return "Basic " + btoa(localStorage.getItem('username') + ':' + localStorage.getItem('password'));
        },

        getUsername: function () {
            return localStorage.getItem('username');
        },

        getPassword: function () {
            return localStorage.getItem('password');
        },

        getURL: function () {
            return "https://mal.moe/api/waifus/";
        },
    },

    server: {
        get: function (endpoint, params) {
            return new Promise(function (resolve, reject) {
                var http = new XMLHttpRequest();
                var url = moeExt.config.getURL() + endpoint;

                http.open("GET", url, true);
                http.setRequestHeader('Authorization', moeExt.config.getAuth());

                http.onload = function () {
                    if (this.status === 200) {
                        var results = { "text": JSON.parse(http.responseText), "status": http.status };
                        resolve(results);
                    }
                    else {
                        reject(Error(http.statusText));
                    }
                };

                http.onerror = function () {
                    reject(Error("Network Error"));
                };

                http.send();

            });

        },

        post: function (endpoint, params) {
            return new Promise(function (resolve, reject) {
                var http = new XMLHttpRequest();
                var url = moeExt.config.getURL() + endpoint;

                http.open("POST", url, true);
                http.setRequestHeader('Authorization', moeExt.config.getAuth());
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                http.onload = function () {
                    if (this.status === 200) {
                        var results = { "text": http.responseText, "status": http.status };
                        resolve(results);
                    }
                    else {
                        reject(Error(http.statusText));
                    }
                };

                http.onerror = function () {
                    console.log(http);
                    reject(Error("Network Error"));
                };

                http.send(params);

            });
        }
    },

    popup: {

        init: function (url) {
            $("#popup").stop(true).fadeTo('fast', 1);
            $("#popup").removeClass("unclickable");
            $("#spin").spin(false);

            $("#options").removeClass("hidden");
            $("#buttons").removeClass("hidden");

            moeExt.popup.loadWaifus();

            $('#btnScrape').on('click', function () {
                moeExt.scrapeURL($('#waifu').val(), url);
            });
        },

        info: function(text){
            $('#serverResponse').text(text);
            $("#serverResponse").removeClass("hidden");
        },

        loadWaifus: function () {
            moeExt.server.get("all/names", "").then(function (response) {
                var waifus = response.text;
                for (var i = 0; i < waifus.length; i++) {
                    $('#waifu')
                        .append($('<option>', { value: waifus[i] })
                        .text(waifus[i]));
                }
            }).catch(function (error) {
                moeExt.popup.info("Failed to get a list of waifus! " + error);
            });
        }
    },

    scrapeURL: function(waifu, url) {

        $("#popup").toggleClass("unclickable");
        $("#popup").fadeTo("fast", 0.5);
        $("#serverResponse").removeClass("hidden");
        $("#serverResponse").spin('large');

        var params = "waifu=" + waifu + "&url=" + url;

        moeExt.server.post("scraping/scrape", params).then(function (response) {
            $("#popup").stop(true).fadeTo('fast', 1);
            $('#serverResponse').text("Image(s) Scraped");
            $("#serverResponse").removeClass("hidden");
            $("#popup").removeClass("unclickable");
        }).catch(function (error) {
            $("#popup").stop(true).fadeTo('fast', 1);
            moeExt.popup.info(error);
            $("#popup").toggleClass("unclickable");
        });
    },
}

