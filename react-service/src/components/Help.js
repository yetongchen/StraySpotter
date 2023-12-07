import React from "react"



function Help() {

    
    return (     
        <div>
            <div>
                <h1 tabIndex={'0'}> Help Commands</h1> 
            </div>      
            <h3 tabIndex={'0'}> <strong>In map:</strong> This section describes features related to map navigation.</h3>
            <h3 tabIndex={'0'}><strong>Control + L:</strong> Go into search bar.</h3>                
            <h3 tabIndex={'0'}><strong>Control + F:</strong> Select species filter. Options include: Cat, Dogs, Others</h3>              
            <h3 tabIndex={'0'}><strong>Control + B:</strong> Return to Map link (located in the top left of the website).</h3>
        </div>  
    );

}

export default Help;