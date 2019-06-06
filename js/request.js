function ajaxGet (url, callBack){
    
    let xhr = new XMLHttpRequest();
    
    xhr.open("GET", url, true);
    
    xhr.addEventListener("readystatechange", function(){
        
        if (xhr.readyState === 4){
        
            const jsonText   = xhr.responseText;
            const parsedJson = JSON.parse(jsonText);
            
            callBack(parsedJson);
            
        }
    });
    
    xhr.send(null);
}



