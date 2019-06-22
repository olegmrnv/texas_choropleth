if (ifvisible.now()) {
    console.log((new Date()).toUTCString() + " page is visible");
}

ifvisible.on("blur", function() {
    console.log((new Date()).toUTCString() + " switched between tabs or minimized");
});

ifvisible.on("focus", function() {
    console.log((new Date()).toUTCString() + " user came back to our page");
});

ifvisible.setIdleDuration(5);

ifvisible.on("idle", function() {
    console.log((new Date()).toUTCString() + " user is not interacting with website any longer");
});

ifvisible.on("wakeup", function() {
    console.log((new Date()).toUTCString() + " user is active again");
});