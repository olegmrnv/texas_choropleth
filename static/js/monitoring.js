if( ifvisible.now() ){
	console.log("page is visible");
}

ifvisible.on("blur", function(){
	console.log("switched between tabs or minimized");
});

ifvisible.on("focus", function(){
	console.log("user came back to our page");
});

ifvisible.setIdleDuration(5);

ifvisible.on("idle", function(){
	console.log("user is not interacting with website any longer");
});

ifvisible.on("wakeup", function(){
	console.log("user is active again");
});