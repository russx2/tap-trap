
/*
 * SameJS_screenHelp
 * 
 * A screen object for displaying instructions / tips to the user.
 * 
 */
 
 
 
/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenHelp( screenID) {

	this.m_screenID = screenID;

	// store a reference to ourselves
	SameJS_screenHelp.m_instance = this;
	
	// move on to initialisation
	this.initialise();
}



/**
 * Creates necessary data structures and sets values to a safe default.
 * 
 * @return
 */
SameJS_screenHelp.prototype.initialise = function() {
	
}



/**
 * Simply shows the help screen to the player.
 *
 * @return
 */
SameJS_screenHelp.prototype.open = function() {
	
	// show this screen
	sjShowElement( this.m_screenID);
}



/**
 * Removes the screen from the players view.
 * 
 * @return
 */
SameJS_screenHelp.prototype.close = function() {
	
	// hide this screen
	sjHideElement( this.m_screenID);
}

