
/*
 * SameJS_screenLoading
 * 
 * A screen object used to show the player a loading dialogue (requesting a game key from
 * the server etc.).
 * 
 */
 
 
 
/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenLoading( screenID) {

	this.m_screenID = screenID;

	// store a reference to ourselves
	SameJS_screenLoading.m_instance = this;
	
	// move on to initialisation
	this.initialise();
}



/**
 * Creates necessary data structures and sets values to a safe default.
 * 
 * @return
 */
SameJS_screenLoading.prototype.initialise = function() {
	
}



/**
 * Simply shows the screen to the player.
 *
 * @param message  Text to display along with the loading screen
 * @return
 */
SameJS_screenLoading.prototype.open = function( message) {
	
	// set message on the screen
	sjSetHTML( this.m_screenID + '_message', message);
	
	// show this screen
	sjShowElement( this.m_screenID);
}



/**
 * Removes the screen from the players view.
 * 
 * @return
 */
SameJS_screenLoading.prototype.close = function() {
	
	// hide this screen
	sjHideElement( this.m_screenID);
}

