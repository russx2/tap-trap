
/*
 * SameJS_screenReplay
 * 
 */



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenReplay( screenID) {

	this.m_screenID = screenID;
	
	this.m_gameID = null;
	this.m_moves = null;
	this.m_currentMove = 0;
	
	// store a reference to ourselves
	SameJS_screenReplay.m_instance = this;

	// move on to initialisation
	this.initialise();
}



/**
 * Creates necessary data structures and sets values to a safe default.
 * 
 * @return
 */
SameJS_screenReplay.prototype.initialise = function() {
	

}



/**
 * Shows screen to player. Note, this screen is transparent and operates by overlaying
 * transparent information on top of the standard game screen.
 * 
 * @param gameID     ID of this game
 * @param gameSeed   Seed to reproduce the game
 * @param gameMoves  String containing list of moves for this game (tile coordinates)
 * @param 
 * @return
 */
SameJS_screenReplay.prototype.open = function( gameID, gameSeed, gameMoves, gameScore, gameRank, gamePlayer) {
	
	var game = SameJS.m_instance.m_game;
	
	this.m_gameID = gameID;
	
	// split this game's moves and extract the x,y coordinates
	var m = gameMoves.split( '|');
	var moveCoords = new Array();
	
	for( i in m) {
		
		tmp = m[i].split( ',');
		moveCoords[moveCoords.length] = { x: tmp[0], y: tmp[1] };	
	}
	
	// store coordinates and setup the replay
	this.m_moves = moveCoords;
	this.m_currentMove = 0;
	
	// all replays at normal speed
	game.setFastAnimation( false);
	
	// begin the game, passing ourselves as the move / game end callbacks
	game.newGame( gameSeed, 
				  SameJS_screenReplay.m_instance.__callbackMove, 
				  SameJS_screenReplay.m_instance.__callbackEnd,
				  false);
	
	// set necessary params
	sjSetHTML( this.m_screenID + '_rank', gameRank);
	sjSetHTML( this.m_screenID + '_rankSup', sjGetOrdinal( gameRank));
	sjSetHTML( this.m_screenID + '_player', gamePlayer);
	sjSetHTML( this.m_screenID + '_score', gameScore);

	// hide the close button
	sjHideElement( this.m_screenID + '_close');

	// show ourselves
	sjShowElement( this.m_screenID);
	
	// we need to kick off the first move ourselves as usually it's called from a post-move
	// callback from the game object itself
	this.__callbackMove();
}



/**
 * Callback passed to the game object, called at the end of each move. This is our plugin
 * into the game itself, allowing us to simulate a user playing the game.
 * 
 * Each time we're called we get the next move for the replay and simulate a move and click
 * event.
 * 
 * @return
 */
SameJS_screenReplay.prototype.__callbackMove = function() {
	
	var me = SameJS_screenReplay.m_instance;
	var click;
	var x, y;
	
	// only proceed with the move if we have any left
	if( me.m_currentMove < me.m_moves.length) {
		
		// calculate the coordinates of this click (need to convert from TILE coordinates
		// to WORLD coordinates. we calculate the coordinats as the rough middle of the tile.
		x = ( me.m_moves[me.m_currentMove].x * sjGame.TILE_WIDTH) + Math.round(sjGame.TILE_WIDTH / 2);
		y = ( me.m_moves[me.m_currentMove].y * sjGame.TILE_HEIGHT) + Math.round(sjGame.TILE_HEIGHT / 2);
	
		// simulate a click event object
		click = sjMakeClickEvent( x, y);
	
		// simulate a mouseover and mouseclick event pair
		SameJS.m_instance.m_game.handleMouseMove( click);
		SameJS.m_instance.m_game.handleMouseClick( click);
	
		// finally flag the next move in the list
		me.m_currentMove++;
	}
}



/**
 * Callback for the end of the game. We just show the close button here (previously hidden
 * so as not to detract from the demo too much).
 * 
 * @return
 */
SameJS_screenReplay.prototype.__callbackEnd = function() {
	
	var me = SameJS_screenReplay.m_instance;
	
	console.info( 'Demo completed');
	
	// show close button
	sjShowElement( me.m_screenID + '_close');
}



/**
 * Removes the screen from the players view and clears up the current replayed game.
 * 
 * @return
 */
SameJS_screenReplay.prototype.close = function() {
	
	var game = SameJS.m_instance.m_game;
	
	// we need to clear ourselves up here since we're currently in control of the game
	// which we need to stop!
	game.halt();
	
	// hide this screen
	sjHideElement( this.m_screenID);
}
