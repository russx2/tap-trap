
/*
 * SameJS_screenGameOver
 * 
 * A screen object used to show the player a 'game over' screen with scores etc. 
 * Implements common screen methods open and close.
 * 
 */
 
 
 
/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenGameOver( screenID) {

	this.m_screenID = screenID;

	// store a reference to ourselves
	SameJS_screenGameOver.m_instance = this;
	
	// move on to initialisation
	this.initialise();
}



/**
 * Creates necessary data structures and sets values to a safe default.
 * 
 * @return
 */
SameJS_screenGameOver.prototype.initialise = function() {
	
}



/**
 * Sets the score elements within the screen to those passed.
 * 
 * @param scoreTotal  Total score player received from the game
 * @param scoreBonus  Whether or not the player received the bonus. Boolean.
 * @return
 */
SameJS_screenGameOver.prototype.setScores = function( scoreTotal, gotBonus) {
	
	var scoreGame;
	var scoreBonus;
	
	// determine whether or not the player got the bonus and adjust totals accordingly
	if( gotBonus) {
		
		scoreGame = scoreTotal - sjGame.POINTS_CLEARANCE_BONUS;
		scoreBonus = sjGame.POINTS_CLEARANCE_BONUS;
	}
	else {
		
		scoreGame = scoreTotal;
		scoreBonus = 0;
	}
	
	// set values within the screen
	sjSetHTML( this.m_screenID + '_score', scoreGame);
	sjSetHTML( this.m_screenID + '_bonus', scoreBonus);
	sjSetHTML( this.m_screenID + '_scoreTotal', scoreTotal);
}



/**
 * Updates the name element on the screen to the passed value.
 * 
 * @param name  Name of player
 * @return
 */
SameJS_screenGameOver.prototype.setName = function( name) {

	sjSetHTML( this.m_screenID + '_name', name);
}



/**
 * Shows this screen to the player
 * 
 * @param scoreTotal  Total score player received from the game
 * @param scoreBonus  Whether or not the player received the bonus. Boolean.
 * @return
 */
SameJS_screenGameOver.prototype.open = function( scoreTotal, gotBonus) {
	
	var base = SameJS.m_instance;
	
	// update scores
	this.setScores( scoreTotal, gotBonus);
	
	// update player name
	this.setName( base.retrieveValue( SameJS.DATA_KEY_PLAYERNAME));
	
	// show this screen
	sjShowElement( this.m_screenID);
}


/**
 * Removes the screen from the players view.
 * 
 * @return
 */
SameJS_screenGameOver.prototype.close = function() {
	
	// hide this screen
	sjHideElement( this.m_screenID);
}

