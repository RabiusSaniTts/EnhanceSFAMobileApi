

var xhr;

function getData(url, params) {


    try {

        xhr = new XMLHttpRequest();       

        xhr.open('POST', url, false);

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
       
        xhr.onreadystatechange = function () {

        	console.log ('xhr : ' + xhr.readyState + ', ' + xhr.status);
            if (xhr.readyState == 4) {

                if (xhr.status == 200) {

                    postMessage(xhr.responseText);

                }
                else
                { //alert("else worker.js");
                    setInterval(function() { postMessage(xhr.responseText)}, 7000);

                 }   

            }

        };

        xhr.send(params);

    } catch (e) {
    	console.log('error' +e);
        postMessage('Error occured'+url);

    }

}

 


self.onmessage = function(event) { 
    var d=new Date();
    var n=d.toLocaleTimeString(); 
   var wsurl= event.data;
  
    
    for (var wsCounter=1; wsCounter < 10; wsCounter++) {
			var d=new Date();
			var n=d.toLocaleTimeString(); 
         
		getData(wsurl+"/table/" + wsCounter, "");
		
}
};



