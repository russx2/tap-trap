
/*
 * sjGame
 * 
 * Handles all in-game operations and provides an interface to certain board methods (such
 * as changing the theme, selecting and de-selecting tile groups, etc.).
 * 
 */



sjGame.STATE_INITIALISING = 0;

sjGame.STATE_SEQUENCE_FADE_BEGIN = 100;
sjGame.STATE_SEQUENCE_FADE_END = 101;
sjGame.STATE_SEQUENCE_MOVE_VERTICAL = 102;
sjGame.STATE_SEQUENCE_MOVE_HORIZONTAL = 103;
sjGame.STATE_SEQUENCE_CHECK_STATUS = 104;

sjGame.STATE_HALTED = 200;
sjGame.STATE_PLAYING_WAITING = 300;

sjGame.STATE_GUI = 500;

sjGame.TILE_WIDTH = 31;
sjGame.TILE_HEIGHT = 31;

sjGame.BOARD_WIDTH = 15;
sjGame.BOARD_HEIGHT = 10;

sjGame.ANIMATION_UPDATE_RATE = 25;			// ms

sjGame.TILE_DEFAULT_VERTICAL_RATE_INITIAL = 1;				// pixels per update
sjGame.TILE_DEFAULT_VERTICAL_RATE_ACCELERATION = 0.4;		//		"
sjGame.TILE_DEFAULT_HORIZONTAL_RATE_INITIAL = 1;			//		"
sjGame.TILE_DEFAULT_HORIZONTAL_RATE_ACCELERATION = 0.4;		//		"
sjGame.FADE_DEFAULT_ANIMATION_DURATION = 400;				// ms

sjGame.TILE_FAST_VERTICAL_RATE_INITIAL = 4;				// pixels per update
sjGame.TILE_FAST_VERTICAL_RATE_ACCELERATION = 2;		//		"
sjGame.TILE_FAST_HORIZONTAL_RATE_INITIAL = 4;			//		"
sjGame.TILE_FAST_HORIZONTAL_RATE_ACCELERATION = 2;		//		"
sjGame.FADE_FAST_ANIMATION_DURATION = 200;				// ms

sjGame.POINTS_CLEARANCE_BONUS = 1000;



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @param screenID          GUI element ID for board display
 * @param scoreID           GUI element ID for score display
 * @param scorePotentialID  GUI element ID for potential score display
 * @param callbackEndGame   Function to be called once the game ends
 * @constructor
 */
function sjGame( screenID, scoreID, scorePotentialID) {

	// output elements
	this.m_outputScreenID = screenID;
	this.m_outputScoreID = scoreID;
	this.m_outputScorePotentialID = scorePotentialID;
	
	this.m_outputScoreElm = null;
	this.m_outputScorePotentialElm = null;
	
	// internal member objects
	this.m_input = null;
	this.m_board = null;
	
	// game methods will only process while this is true
	this.m_isActive = true;
	
	// callbacks for game actions
	this.m_callbackEndGame = null;
	this.m_callbackEndMove = null;
	
	// stores the current game state
	this.m_state = sjGame.STATE_INITIALISING;
	
	// total score
	this.m_score = 0;
	
	// bonus flag
	this.m_scoreGotBonus = false;
	
	// for storing last tile mouse was over
	this.m_lastTileX = -1;
	this.m_lastTileY = -1;
	
	// for storing the last coordinate mouse was over
	this.m_lastCoordX = -1;
	this.m_lastCoordY = -1;
	
	// which tiles are currently moving
	this.m_tilesMoving = null;
	this.m_tilesMovingCount = 0;
	
	// settings for tile animation movement speeds
	this.m_rateMovementVerticalInitial = 0;
	this.m_rateMovementVerticalAcceleration = 0;
	this.m_rateMovementHorizontalInitial = 0;
	this.m_rateMovementHorizontalAcceleration = 0;
	this.m_rateFadeAnimation = 0;
	
	// whether or not to allow speed changing mid-game
	this.m_allowSpeedChange = true;
	
	// for communicating with the game server
	this.m_HTTPNewGame = null;
	
	// storage for history of game moves
	this.m_moveHistory = null;
	
	// store a reference to ourself statically
	sjGame.m_instance = this;
	
	// interval used for processing game sequences
	this.m_sequenceIntervalID = null;

	// move on to initialisation
	this.initialise();	
}



/**
 * Creates the necessary data structures for the game object and sets up handlers for
 * input requests etc.
 * 
 * @return
 */
sjGame.prototype.initialise = function() {

	// instantiate a new input object
	this.m_input = new sjInput( this.m_outputScreenID);
	
	// request callback from required input handlers
	this.m_input.requestEvents( 'click', sjGame.m_instance.handleMouseClick);
	this.m_input.requestEvents( 'mousemove', sjGame.m_instance.handleMouseMove);
	this.m_input.requestEvents( 'mouseout', sjGame.m_instance.handleMouseOut);
	
	// instantiate a new board object
	this.m_board = new sjBoard( this.m_outputScreenID, sjGame.BOARD_WIDTH, sjGame.BOARD_HEIGHT, 
												 	   sjGame.TILE_WIDTH, sjGame.TILE_HEIGHT);
	
	// store references to the output elements
	this.m_outputScoreElm = document.getElementById( this.m_outputScoreID);
	this.m_outputScorePotentialElm = document.getElementById( this.m_outputScorePotentialID);
	
	// initialise move history
	this.m_moveHistory = new Array();
	
	// set score
	this.updateOutputScore( 0);
	
	// set normal animation speeds
	this.setFastAnimation( false);
	
	// set game state to playing
	this.m_state = sjGame.STATE_PLAYING_WAITING;
}



/**
 * Begins a new game using the seed passed to generate the board. The passed callbacks
 * can be used to 'plug' into the game (for example, the replay behaviour uses these
 * interfaces to 'play' the game automatically).
 * 
 * @param seed              Seed for this games board generation
 * @param callbackMove      Function to call after each move completes - can be null
 * @param callbackEnd       Function to call after the game completes - can be null
 * @param allowSpeedChange  Boolean - whether or not to allow anim speed to be changed mid-game
 * @return
 */
sjGame.prototype.newGame = function( seed, callbackMove, callbackEnd, allowSpeedChange) {
	
	// randomise board based on seed
	this.m_board.randomise( seed);
	
	// reset scores etc.
	this.m_score = 0;
	this.m_scoreGotBonus = false;
	this.updateOutputScore( this.m_score);
	
	// store animation speed option
	this.m_allowSpeedChange = allowSpeedChange;
	
	// set callbacks
	this.m_callbackEndGame = callbackEnd;
	this.m_callbackEndMove = callbackMove;
	
	// clear move history
	this.m_moveHistory = new Array();
	
	// set game to active
	this.m_isActive = true;
	
	// resume play
	this.m_state = sjGame.STATE_PLAYING_WAITING;
}



/**
 * Immediately halts a game by cancelling all game sequence threads and setting a flag
 * to indicate that the game has stopped. Any methods which use setIntervals need to check
 * this flag incase something slipped through the interval cancelling.
 * 
 * @return
 */
sjGame.prototype.halt = function() {
	
	console.info( 'Halting game');
	
	// cancel sequence interval if one is in progress
	if( this.m_sequenceIntervalID !== null) {
		
		clearInterval( this.m_sequenceIntervalID);
		this.m_sequenceIntervalID = null;
	}
	
	// hide board
	if( this.m_board !== null) {
	
		this.m_board.hide();
	}
	
	// flag this game as halted
	this.m_isActive = false;
	this.m_state = sjGame.STATE_HALTED;
}



/**
 * Handles a click within the game area and determines whether to destroy a tile selection.
 * This is an event callback passed to the sjInput object.
 * 
 * @param e  Event object automatically passed from event handlers
 * @return
 * @see      sjInput
 */
sjGame.prototype.handleMouseClick = function( e) {

	var game = sjGame.m_instance;
	var board = game.m_board;
	var score = 0;
	var tileX, tileY;
	
	// only process this click if we're in a suitable state
	if( game.m_state != sjGame.STATE_PLAYING_WAITING) {
		return;
	}
	
	// if there is no current selection we can just ignore the click
	if( board.isSelection() === false) {
		return;
	}
	
	// clear last-tile-over cache (destroying these tiles means they're no longer valid)
	game.lastTileX = -1;
	game.lastTileY = -1;
		
	// set the game state to the beginning of the destroy sequence
	game.m_state = sjGame.STATE_SEQUENCE_FADE_BEGIN;
	
	// remove the current selection from the game board
	board.selectionDetach();
	
	// move the tiles and retrieve a list of where each one should now be
	game.m_tilesMoving = board.moveTiles();
	
	// retrieve score for this selection
	game.m_score += board.selectionScore();
	
	// if the board is now empty, it means we can allocate the bonus
	if( board.isEmpty() === true) {
		
		game.m_scoreGotBonus = true;
		game.m_score += sjGame.POINTS_CLEARANCE_BONUS;
	}
	
	// show this updated score in the gui
	game.updateOutputScore( game.m_score);
	
	// store this move in the history
	tileX = Math.floor( sjGetClickX( e) / sjGame.TILE_WIDTH);
	tileY = Math.floor( sjGetClickY( e) / sjGame.TILE_HEIGHT);
	
	game.m_moveHistory[game.m_moveHistory.length] = tileX + "," + tileY;
	
	// initiate destroy sequence
	game.processGameSequence();
}



/**
 * Handles a mouse movement within the game area and determines whether this begins and/or
 * ends a tile selection and acts accordingly. This is an event callback passed to the 
 * sjInput object.
 * 
 * @param e  Event object automatically passed from event handlers
 * @return
 * @see		 sjInput
 */
sjGame.prototype.handleMouseMove = function( e) {

	var game = sjGame.m_instance;
	var board = game.m_board;

	var x = sjGetClickX( e);
	var y = sjGetClickY( e);
	
	// quickly validate raw coords
	if( isNaN( x) || isNaN( y)) {
		return;
	}

	game.lastCoordX = x;
	game.lastCoordY = y;
	
	// We're determining here if the currently selected group of tiles need
	// de-selecting and/or whether a new group is to be selected. Can ignore
	// for any game state other than playing_waiting
	if( game.m_state == sjGame.STATE_PLAYING_WAITING) {
		
		var tileX = Math.floor( x / sjGame.TILE_WIDTH);
		var tileY = Math.floor( y / sjGame.TILE_HEIGHT);
		
		// sanity checks
		tileX = tileX < 0 ? 0 : tileX;
		tileX = tileX >= sjGame.BOARD_WIDTH ? sjGame.BOARD_WIDTH - 1 : tileX;
		
		tileY = tileY < 0 ? 0 : tileY;
		tileY = tileY >= sjGame.BOARD_HEIGHT ? sjGame.BOARD_HEIGHT - 1 : tileY;
		
		// most likely is that we're still on the same square so just
		// return quickly if this is the case
		if( game.lastTileX == tileX && game.lastTileY == tileY) {
			return;
		}
		
		// we've moved to a different square so save this change
		game.lastTileX = tileX;
		game.lastTileY = tileY;
		
		// if this tile is currently selected we can ignore this move since
		// there's nothing to change about the selection
		if( board.isCurrentlySelected( tileX, tileY)) {
			return;
		}
		
		// ok so this mouse move will definitely cancel the current
		// selection and (possibly) begin another
		board.selectionStop();
		
		// clear the potential score for this selection
		game.updateOutputScorePotential( null);
		
		// is there a tile at this location?
		if( board.isTile( tileX, tileY) == false) {
			return;
		}
		
		// retrieve list of tiles of same type that are joined to the tile
		// at these coordinates
		var linkedTiles = board.getLinkedTiles( tileX, tileY);
		
		// we need at least 2 tiles to count as a selection
		if( linkedTiles.length <= 1) {
			return;
		}
		
		// begin the selection
		board.selectionStart( linkedTiles);
		
		// show the potential score for this selection
		game.updateOutputScorePotential( board.selectionScore());
	}
	
}



/**
 * Handles a mouse movement which exits the game area and determines whether this ends 
 * a tile selection and acts accordingly. This is an event callback passed to the 
 * sjInput object.
 * 
 * @param e  Event object automatically passed from event handlers
 * @return
 * @see		 sjInput
 */
sjGame.prototype.handleMouseOut = function( e) {

	var game = sjGame.m_instance;
	
	// stop the currently spinning selection (if it exists)
	if( game.m_state == sjGame.STATE_PLAYING_WAITING) {
		
		game.m_board.selectionStop();
	}
	
	// clear potential score
	game.updateOutputScorePotential( null);
	
	// clear last-tile-over cache (since we want it to re-trigger if the mouse
	// moves back onto the screen on the same tile)
	game.lastTileX = -1;
	game.lastTileY = -1;
	
	// whatever the game state, we still need to store the last mouse coordinates
	game.lastCoordX = -1;
	game.lastCoordY = -1;
}



/**
 * Handles the complete (animation) sequence initiated from the player choosing to destroy
 * a tile selection. Goes from the initial tile fade to the dropping and shifting of
 * columns. Calls itself via the use of settimeouts until the sequence is complete. The
 * game state is changed at the beginning of this sequence to prevent any player input
 * before this completes.
 * 
 * @return
 */
sjGame.prototype.processGameSequence = function() {
	
	var game = sjGame.m_instance;
	var board = game.m_board;
	var move = null;
	
	// if the game's not active, ignore
	if( game.m_isActive !== true) {
		return;
	}
	
	// perform action based on current state
	switch( game.m_state) {
		
		// STATE: Fade Begin
		// Initiates the fade for the destroyed tiles but does not destroy the selection.
		case sjGame.STATE_SEQUENCE_FADE_BEGIN:
		
			// set the current selection to fade
			board.selectionFade();
			
			// indicate that we can move on to the next state
			game.m_state++;
			
			// set the next update timeout for the duration of the fade animation
			//setTimeout( sjGame.m_instance.processGameSequence, game.m_rateFadeAnimation);
			game.m_sequenceIntervalID = setInterval( sjGame.m_instance.processGameSequence, game.m_rateFadeAnimation);
			
			break;
		
		// STATE: Fade End
		// Actually removes the tiles and initiates the drop-and-slide sequence
		case sjGame.STATE_SEQUENCE_FADE_END:
		
			// store count of vertical tiles to move
			game.m_tilesMovingCount = game.m_tilesMoving['vertical'].length;
			
			// prepare the floating tiles for their movement
			for( var i = 0; i < game.m_tilesMoving['vertical'].length; i++) {
				
				move = game.m_tilesMoving['vertical'][i];
				move['reference'].setupSlideVertical( move['amount'], 
													  game.m_rateMovementVerticalInitial, 
													  game.m_rateMovementVerticalAcceleration);
			}
			
			// we can get rid of the selection tiles themselves now
			board.selectionDestroy();
			
			// indicate that we can move on to the next state
			game.m_state++;
			
			// initiate recurring next sequence event
			clearInterval( game.m_sequenceIntervalID);
			game.m_sequenceIntervalID = setInterval( sjGame.m_instance.processGameSequence, sjGame.ANIMATION_UPDATE_RATE);
			
			break;
			
		// STATE: Move Vertical
		// Repeatedly handles the dropping of tiles animation until they have all completed. Then sets up
		// the subsequent horizontal animation (if required)
		case sjGame.STATE_SEQUENCE_MOVE_VERTICAL:
			
			// only bother calling the movement methods if we still have any left to move
			if( game.m_tilesMovingCount > 0) {
				
				for( var i = 0; i < game.m_tilesMoving['vertical'].length; i++) {
					
					move = game.m_tilesMoving['vertical'][i];
					
					// already finished moving this tile? skip it
					if( move['reference'] != null) {
						
						// has this completed the animation?
						if( move['reference'].doMovement() === true) {
							
							// null our reference to the tile and reduce the count tally
							game.m_tilesMoving['vertical'][i]['reference'] = null;
							game.m_tilesMovingCount--;
						}
					}
				}
			}
			
			// if we've completed vertical movement, let's setup in preperation for horizontal movement
			if( game.m_tilesMovingCount == 0) {
				
				// store count of horizontal tiles to move
				game.m_tilesMovingCount = game.m_tilesMoving['horizontal'].length;
				
				// prepare the tiles to move for their movement
				for( var i = 0; i < game.m_tilesMoving['horizontal'].length; i++) {
					
					move = game.m_tilesMoving['horizontal'][i];
					move['reference'].setupSlideHorizontal( move['amount'], 
													  	  game.m_rateMovementHorizontalInitial, 
													  	  game.m_rateMovementHorizontalAcceleration);
				}
				
				// indicate that we can move on to the next state
				game.m_state++;
			}
			
			break;
			
		// STATE: Move Horizontal
		// Repeatedly handles the sliding of tiles animation until they have all completed. Then kills
		// the current update sequence.
		case sjGame.STATE_SEQUENCE_MOVE_HORIZONTAL:
		
			// only bother calling the movement methods if we still have any left to move
			if( game.m_tilesMovingCount > 0) {
				
				for( var i = 0; i < game.m_tilesMoving['horizontal'].length; i++) {
					
					move = game.m_tilesMoving['horizontal'][i];
					
					// already finished moving this tile? skip it
					if( move['reference'] != null) {
						
						// has this completed the animation?
						if( move['reference'].doMovement() === true) {
							
							// null our reference to the tile and reduce the count tally
							game.m_tilesMoving['horizontal'][i]['reference'] = null;
							game.m_tilesMovingCount--;
						}
					}
				}
			}
			
			// if we've completed horizontal movement, kill the current processing sequence
			if( game.m_tilesMovingCount == 0) {
				
				// kill the update interval
				clearInterval( game.m_sequenceIntervalID);
				game.m_sequenceIntervalID = null;
				
				// move on to the next state
				game.m_state = sjGame.STATE_PLAYING_WAITING;

				// see if we need to trigger an on-selection (if mouse hasn't moved it 
				// won't trigger a selection even if it's over one)
				if( game.lastCoordX != -1 && game.lastCoordY != -1) {
					
					// trigger a fake mouse event and call our mouse move event handler			
					game.handleMouseMove( sjMakeClickEvent( game.lastCoordX, game.lastCoordY));
				}
				
				// call end move callback if its set
				if( game.m_callbackEndMove !== null) {
					
					game.m_callbackEndMove();
				}
				
				// check for end of game at this point - no further moves AND the current
				// selection has been cleaned up and animated away
				if( board.hasFurtherMoves() === false && board.isSelection() === false) {
			
					game.halt();
		
					// this executes the callback on the parent controller object if set
					if( game.m_callbackEndGame !== null) {
					
						game.m_callbackEndGame();
					}
				}
			}
			
			break;
	}
	
}



/**
 * Sets the 'potential' score GUI element to the passed value. Called whenever the 
 * potential score for the current selection changes.
 * 
 * @param score  Value of the current potential score
 * @return
 */
sjGame.prototype.updateOutputScorePotential = function( score) {
	
	var scoreOut = score == null ? '' : score; // + ' points';
	this.m_outputScorePotentialElm.innerHTML = scoreOut;
}



/**
 * Sets the score GUI element to the passed value. Called whenever the score for the 
 * current selection changes.
 * 
 * @param score  Value of the current score
 * @return
 */
sjGame.prototype.updateOutputScore = function( score) {
	this.m_outputScoreElm.innerHTML = score; // + ' points';
}



/**
 * Turns fast animation of tile movements on or off.
 * 
 * @param bool  True or false to turn fast animation on or off respectively
 * @return
 */
sjGame.prototype.setFastAnimation = function( bool) {
	
	// if we've requested a game to disallow speed changes, ignore this request
	if( this.m_allowSpeedChange !== true) {
		return;
	}
	
	if( bool == true) {
		
		console.info( 'Setting fast animation to: true');
		
		this.m_rateMovementVerticalInitial = sjGame.TILE_FAST_VERTICAL_RATE_INITIAL;
		this.m_rateMovementVerticalAcceleration = sjGame.TILE_FAST_VERTICAL_RATE_ACCELERATION;
		this.m_rateMovementHorizontalInitial = sjGame.TILE_FAST_HORIZONTAL_RATE_INITIAL;
		this.m_rateMovementHorizontalAcceleration = sjGame.TILE_FAST_HORIZONTAL_RATE_ACCELERATION;
		this.m_rateFadeAnimation = sjGame.FADE_FAST_ANIMATION_DURATION;
	}
	else {
		
		console.info( 'Setting fast animation to: false');
		
		this.m_rateMovementVerticalInitial = sjGame.TILE_DEFAULT_VERTICAL_RATE_INITIAL;
		this.m_rateMovementVerticalAcceleration = sjGame.TILE_DEFAULT_VERTICAL_RATE_ACCELERATION;
		this.m_rateMovementHorizontalInitial = sjGame.TILE_DEFAULT_HORIZONTAL_RATE_INITIAL;
		this.m_rateMovementHorizontalAcceleration = sjGame.TILE_DEFAULT_HORIZONTAL_RATE_ACCELERATION;
		this.m_rateFadeAnimation = sjGame.FADE_DEFAULT_ANIMATION_DURATION;
	}
}



/**
 * Changes the current board theme graphics.
 * 
 * @param name  Identifier for the theme to change to
 * @return
 */
sjGame.prototype.setTheme = function( name) {
	
	console.info( 'Setting theme to: ' + name);
	this.m_board.loadTileSet( name);
}
