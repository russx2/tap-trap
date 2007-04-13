
/*
 * sjInput
 * 
 * This object can be used to listen to input events by attaching itself to the game screen
 * element. Callbacks can then be easily registered with this object to callback other
 * game objects.
 * 
 */
 


/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @param screenID  Element ID on which to attach this input object
 * @constructor
 */
function sjInput( screenID) {

	// member vars
	this.m_screenID = screenID;
	this.m_element = null;

	// move on to initialisation
	this.initialise();
}



/**
 * Creates input element layer and attaches it to the screen.
 * 
 * @return
 */
sjInput.prototype.initialise = function() {

	// retrieve required attribs from screen container
	var screen = document.getElementById( this.m_screenID);
	
	// create new element to overlay the screen for input capture
	this.m_element = document.createElement( 'div');
	this.m_element.id = 'sjGameInput';
	
	// hook this input layer over the screen
	screen.appendChild( this.m_element);
}



/**
 * Adds an event handler (mousemove, mouseout, etc.) to this input object and registers
 * it to a passed callback function.
 * 
 * @param event     Name of the event we are registering for
 * @param callback  Function used as a callback when the event occurs
 */
sjInput.prototype.requestEvents = function( event, callback) {

	// ie
	if( this.m_element.attachEvent) {
		
		event = 'on' + event;
		this.m_element.attachEvent( event, callback);
	}
	
	// w3c
	else {
		this.m_element.addEventListener( event, callback, false);
	}
}