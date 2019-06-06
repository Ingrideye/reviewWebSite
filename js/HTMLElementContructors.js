class HTMLElt {
    constructor(tagName, className, parentElt, innerHTML) {
        
        this.elt = document.createElement(tagName);
        if (className) this.elt.className = className;
        if (innerHTML) this.elt.innerHTML = innerHTML;
        if (parentElt) parentElt.appendChild(this.elt);
    }
}

class InputForm extends HTMLElt {
    constructor (formElt, placeholder, type, required, className) {
        
        const pElt = document.createElement('p');
        
        super('input', className, pElt); 
        
        this.elt.type = type;
        if (placeholder) this.elt.placeholder = placeholder;
        if (required) this.elt.required = true;

        formElt.appendChild(pElt) ;
    }  
}

class Btn extends HTMLElt {
    constructor (containerElt, btnTxt, className, callBack, params) {
        
        super('input', className, containerElt, null);

        this.elt.type  = 'button';
        this.elt.value = btnTxt;
        
        this.elt.addEventListener('click', function(e) {
            callBack(e, params);
        });
    }
}

class DisplayBtn extends Btn {
    constructor (containerElt, btnTxt, className, callBack, params) {
        
        if (!self.canOpenElt) self.canOpenElt = true;
        
        super(containerElt, btnTxt, className, callBack, params);   
    }  
}

class CloseBtn extends DisplayBtn {    
    constructor (containerElt, params) {
        
        const hasBeenClicked = (e, [eltToClose]) => {
            self.canOpenElt = true;
            eltToClose.style.display   = 'none';
            eltToClose.style.width     = '0';
            eltToClose.style.height    = '0';
            e.target.style.display     = 'none';  
        }

        super(containerElt, 'fermer', 'close-street-view-btn', hasBeenClicked, params);
    }


}

class ShowBtn extends DisplayBtn {
    constructor (containerElt, btnTxt, className, params) {
        
        const displayEltInView = (eltToDisplay, closeBtnElt) => {
            let size = 0;
            eltToDisplay.style.display = 'block';
            canOpenElt = false;
            
            let interval = setInterval(function(){
                if (size < 100) {
                    size += 10;
                    eltToDisplay.style.width  = size + '%';
                    eltToDisplay.style.height = size + '%';
                } else {
                    closeBtnElt.style.display = 'block';
                    clearInterval(interval);
                }
            }, 20);
        }    

        const hasBeenClicked = (e, [eltToOpen, closeBtnToShow]) => {
            if (self.canOpenElt) {
                displayEltInView(eltToOpen, closeBtnToShow);
            }
        }

        super(containerElt, btnTxt, className, hasBeenClicked, params);   
    }
}