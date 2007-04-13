
/*
 * SameJS
 * 
 * Takes a 'controller' role and handles communication between the GUI and the game
 * object itself.
 * 
 * All real configuration is done at the top of this file, though in theory nothing will
 * need changing. The cookie domain is modified for 2tap.com to allow all subdomains to 
 * access it if necessary.
 * 
 */
 


// custom override for 2tap.com only - set cookie domain to *.2tap.com
if( window.location.hostname.indexOf( '2tap.com') != -1) {
	SameJS.COOKIE_DOMAIN = '.2tap.com'; 
}

// for everywhere else set to current domain
else {
	SameJS.COOKIE_DOMAIN = window.location.hostname;
} 
 
SameJS.HTTP_NEW_GAME_URL = 'server/newgame'
SameJS.HTTP_END_GAME_URL = 'server/storegame';
SameJS.HTTP_REPLAY_GAME_URL = 'server/gamereplay';
SameJS.HTTP_NEW_PLAYER_URL = 'server/newplayer';
SameJS.HTTP_CHANGE_PLAYERNAME_URL = 'server/changeplayer';
SameJS.HTTP_SCORES_URL = 'server/scores';

SameJS.THEME_DEFAULT = 'default';

SameJS.DATA_STORE = 'samegame';
SameJS.DATA_KEY_PLAYERUUID = 'puuid';
SameJS.DATA_KEY_PLAYERNAME = 'pname';
SameJS.DATA_KEY_FASTANIM = 'fastanim';
SameJS.DATA_KEY_THEME = 'theme';

SameJS.GAME_BOARD_ID = 'sjGameScreenBoard';
SameJS.GAME_SCORE_ID = 'sjGameScore';
SameJS.GAME_SCORE_POTENTIAL_ID = 'sjGameScorePotential';

SameJS.SCREEN_PRELOADER_ID = 'sjGameScreenPreloader'
SameJS.SCREEN_REPLAY_ID = 'sjGameScreenReplay';
SameJS.SCREEN_SCORES_ID = 'sjGameScreenScores';
SameJS.SCREEN_OPTIONS_ID = 'sjGameScreenOptions';
SameJS.SCREEN_GAMEOVER_ID = 'sjGameScreenOver';
SameJS.SCREEN_LOADING_ID = 'sjGameScreenLoading';
SameJS.SCREEN_HELP_ID = 'sjGameScreenHelp';

SameJS.RESOURCE_PATH = 'gfx/';
SameJS.RESOURCES = new Array(
	'gui/title_loading.gif', 'gui/loading.gif', 'gui/b_help.gif', 'gui/b_help_on.gif',  'gui/b_newgame_on.gif',
	'gui/b_options.gif', 'gui/b_newgame.gif', 'gui/b_options_on.gif', 'gui/b_scores.gif', 'gui/b_scores_on.gif',
	'gui/bg.jpg', 'gui/logo.gif', 'gui/scores.gif', 'gui/title_gameover.gif', 'gui/title_options.gif', 
	'gui/title_scores.gif', 'gui/gamereplay.gif',
	
	'board/pixel.gif', 'board/default/blue.gif', 'board/default/blue_spin.gif',
	'board/default/fade.gif', 'board/default/green.gif', 'board/default/green_spin.gif',
	'board/default/red.gif', 'board/default/red_spin.gif'
);



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS() {
	
	this.m_game = null;
	
	this.m_HTTPNewGame = null;
	this.m_HTTPReplayGame = null;
	this.m_HTTPNewPlayer = null;
	
	// have we loaded all resources yet?
	this.m_isLoaded = false;
	
	// whether we have a playerUUID
	this.m_isRegisteredPlayer = false;
	
	// gui screens
	this.m_screens = null;
	
	// the current game's id
	this.m_gameID = 0;
	
	// shared data store for persistent storage of options etc.
	this.m_dataStore = null;
	
	// store a reference to ourselves statically
	SameJS.m_instance = this;

	// move on to initialisation
	this.initialise();	
}



/**
 * Sets up the internal game object and sets previously selected player options. Takes care
 * of GUI screen creation.
 * 
 * @return
 */
SameJS.prototype.initialise = function() {

	var theme, fastAnim;

	// initialise data store
	this.m_dataStore = new sjDataStore( SameJS.DATA_STORE, SameJS.COOKIE_DOMAIN);
	
	// create gui screens
	this.m_screens = new Array();
	this.m_screens['preloader'] = { screen: new SameJS_screenPreloader( SameJS.SCREEN_PRELOADER_ID), isModal: false };
	this.m_screens['replay'] = { screen: new SameJS_screenReplay( SameJS.SCREEN_REPLAY_ID), isModal: false };
	this.m_screens['scores'] = { screen: new SameJS_screenScores( SameJS.SCREEN_SCORES_ID), isModal: true };
	this.m_screens['options'] = { screen: new SameJS_screenOptions( SameJS.SCREEN_OPTIONS_ID), isModal: true };
	this.m_screens['gameover'] = { screen: new SameJS_screenGameOver( SameJS.SCREEN_GAMEOVER_ID), isModal: false };
	this.m_screens['loading'] = { screen: new SameJS_screenLoading( SameJS.SCREEN_LOADING_ID), isModal: false };
	this.m_screens['help'] = { screen: new SameJS_screenHelp( SameJS.SCREEN_HELP_ID), isModal: true };
	
	// kick off resource loading, passing ourselves as a callback
	this.m_isLoaded = false;
	
	this.screen('preloader').open();
	this.screen('preloader').loadResources( SameJS.RESOURCE_PATH, SameJS.RESOURCES, 'Loading resources', SameJS.m_instance.__preloaderCallback);
	
	// check for an existing player registration
	this.m_isRegisteredPlayer = this.retrieveValue( SameJS.DATA_KEY_PLAYERUUID) == null ? false : true;

	// create game object
	this.m_game = new sjGame( SameJS.GAME_BOARD_ID, SameJS.GAME_SCORE_ID, SameJS.GAME_SCORE_POTENTIAL_ID, this.__endGameCallback);

	// set stored theme, setting to the default theme if no preference is stored
	theme = this.retrieveValue( SameJS.DATA_KEY_THEME);
	theme = theme == null ? SameJS.THEME_DEFAULT : theme;

	this.m_game.setTheme( theme);	
}



/**
 * Callback we passed to the resource preloader screen to be called once all graphics
 * have completed loading. Basically used just to enable the game.
 * 
 * @return
 */
SameJS.prototype.__preloaderCallback = function() {

	var me = SameJS.m_instance;
	
	// flag game as loaded
	me.m_isLoaded = true;
	
	// close loading screen
	me.screen('preloader').close();
}



/**
 * Stores the passed value under the passed key. Wrapper method for the data storage member
 * (m_dataStore). 
 * 
 * @param key    Identifier under which to store this value
 * @param value  Value to store
 * @return
 */
SameJS.prototype.storeValue = function( key, value) {
	
	this.m_dataStore.set( key, value);
}



/**
 * Retrieves the value for the passed key. Wrapper method for the data storage member 
 * (m_dataStore).
 * 
 * @param key    Identifier of value to retrieve
 * @return		 Value if the item exists, null otherwise
 */
SameJS.prototype.retrieveValue = function( key) {
	
	return this.m_dataStore.get( key);
}



/**
 * Passes an 'open' message to the screen with the passed identifier.
 * 
 * @param name  Identifier for the screen to open
 * @return
 */
SameJS.prototype.screenOpen = function( name) {
	
	// are we still loading resources? ignore this request
	if( this.m_isLoaded === false) {
		return;
	}
	
	// initially close all modal screens
	this.screenCloseAll( false);
	
	if( this.m_screens[name]) {
		this.m_screens[name].screen.open();
	}
	else{
		console.warn( 'Trying to open screen \'' + name + '\': does not exist');
	}
}



/**
 * Passes a 'close' message to the screen with the passed identifier.
 * 
 * @param name  Identifier for the screen to open
 * @return
 */
SameJS.prototype.screenClose = function( name) {
	
	if( this.m_screens[name]) {
		
		this.m_screens[name].screen.close();
	}
	else {
		console.warn( 'Trying to close screen \'' + name + '\': does not exist');
	}
}



/**
 * Closes all open screens. Utility method.
 * 
 * @param closeNonModalScreens  False: closes all 'modal' screens, i.e. the options, high 
 * 								scores etc. but not system screens. 
 * 
 * 								True: closes ALL screens including 'game over', 'loading' and
 * 								other system screens.
 * @return
 */
SameJS.prototype.screenCloseAll = function( closeNonModalScreens) {
	
	for( i in this.m_screens) {
		
		// if we're not closing core screens AND this is one, skip it
		if( closeNonModalScreens === false && this.m_screens[i].isModal === false) {
			
		}
		else {
		
			this.screenClose( i);
		}
	}
}



/**
 * Returns a reference to the screen with the passed identifier.
 * 
 * @param name  Identifier for the screen to open
 * @return		Reference to the screen requested or null if it doesn't exist
 */
SameJS.prototype.screen = function( name) {
	
	if( this.m_screens[name]) {
	
		return this.m_screens[name].screen;
	}
	
	console.warn( 'Trying to return screen \'' + name + '\': does not exist');
	return null;
}



/**
 * Initiates a new game requesting a new game key from the server.
 * Once the request returns, __newGameCallback() handles the rest. Until then
 * a loading screen is activated.
 * 
 * @return
 */
SameJS.prototype.actionNewGame = function() {

	var HTTPObject;
	var me = SameJS.m_instance;
	var game = me.m_game;
	var board = game.m_board;
	var playerUUID;
	var parameters;
	
	// are we still loading?
	if( me.m_isLoaded === false) {
		return;
	}
	
	// if we're already retrieving a game or player registration, ignore this request
	if( me.m_HTTPNewGame !== null || me.m_HTTPNewPlayer !== null) {
		return;
	}
	
	// have we already setup a new game callback?
	if( game.m_callbackEndMove === SameJS.m_instance.actionNewGame) {
		return;
	}
	
	// force all screens to close which may potentially be open
	me.screenCloseAll( true);
	
	// show 'loading' screen
	me.screen( 'loading').open( 'Retrieving game from server');
	
	// check for an existing player registration
	if( me.m_isRegisteredPlayer === false) {
		
		// player isn't registered, retrieve a new playerUUID before starting game.
		me.registerNewPlayer();
		return;
	}

	// retrieve existing playerUUID from data store
	playerUUID = me.retrieveValue( SameJS.DATA_KEY_PLAYERUUID);
	
	// construct parameters required for game request
	parameters = new Array( { key: 'puuid', value: playerUUID} );
	
	// setup and send the request
	HTTPObject = sjSendHTTPRequest( SameJS.HTTP_NEW_GAME_URL,
									parameters,
									'get',
									SameJS.m_instance.__newGameCallback
									);
									
	// check for failure
	if( HTTPObject === false) {
										
		// fallback to local game
		board.randomise( null);
		me.screenClose( 'loading');
		
		return;
	}
	
	// success - store a reference internally
	me.m_HTTPNewGame = HTTPObject;
}



/**
 * Callback for actionNewGame() once a game seed has been returned from the server. Sets
 * the game seed and begins the game.
 * 
 * @return
 */
SameJS.prototype.__newGameCallback = function() {
	
	var response, gameID, gameSeed;
	var me = SameJS.m_instance;
	var game = me.m_game;
	
	// we only care about completed callbacks
	if( me.m_HTTPNewGame == null || me.m_HTTPNewGame.readyState != 4) {
		return;
	}
	
	// success - initialise game based on seed and gameID
	if( me.m_HTTPNewGame.status == 200) {
	
		response = me.m_HTTPNewGame.responseXML;
		
		me.m_gameID = response.getElementsByTagName( 'id')[0].firstChild.data;
		gameSeed = response.getElementsByTagName( 'seed')[0].firstChild.data;
		
		// start the new game based on the seed returned
		game.newGame( gameSeed, null, SameJS.m_instance.__endGameCallback, true);
		
		response = null;

		console.info( 'Retrieved game seed: gameID(%d), gameSeed(%d)', me.m_gameID, gameSeed);
	}
	// failure - resort to local game
	else {
		
		game.newGame( null, null, SameJS.m_instance.__endGameCallback, true);
		
		console.warn( 'Failed retrieving game seed, playing local game');
	}
	
	// clear up request object
	me.m_HTTPNewGame = null;
	
	// set stored animation speed
	fastAnim = me.retrieveValue( SameJS.DATA_KEY_FASTANIM);
	
	if( fastAnim != null) {
	
		game.setFastAnimation( fastAnim);
	}
	
	// hide loading screen
	me.screenClose( 'loading');
}



/**
 * Requests a replay of a previous game based on the gameID. Displays a loading screen until
 * the data is returned from the server at the callback __replayGameCallback.
 * 
 * @param gameID  ID of the game to retrieve (and in turn play) the replay of
 * @return
 */
SameJS.prototype.actionReplayGame = function( gameID) {
	
	var me = SameJS.m_instance;
	
	// force all screens to close which may potentially be open
	me.screenCloseAll( true);
	
	// show 'loading' screen
	me.screen( 'loading').open( 'Retrieving game replay');
	
	// construct parameters required for replay request
	parameters = new Array( { key: 'gid', value: gameID } );
	
	// setup and send the request
	HTTPObject = sjSendHTTPRequest( SameJS.HTTP_REPLAY_GAME_URL,
									parameters,
									'get',
									SameJS.m_instance.__replayGameCallback
									);
									
	// check for failure
	if( HTTPObject === false) {
		
		me.screenClose( 'loading');
		return;
	}
	
	// success - store a reference internally
	me.m_HTTPReplayGame = HTTPObject;
}



/**
 * Callback for actionReplayGame() once the game details have been returned from the server.
 * Extracts the necessary information and begins the replay via the screen replay object.
 * 
 * @return
 */
SameJS.prototype.__replayGameCallback = function() {
	
	var response;
	var me = SameJS.m_instance;
	
	// we only care about completed callbacks
	if( me.m_HTTPReplayGame == null || me.m_HTTPReplayGame.readyState != 4) {
		return;
	}
	
	// success - extract game information 
	if( me.m_HTTPReplayGame.status == 200) {
	
		response = me.m_HTTPReplayGame.responseXML;
		
		gameID = response.getElementsByTagName( 'id')[0].firstChild.data;
		gameSeed = response.getElementsByTagName( 'seed')[0].firstChild.data;
		gameMoves = response.getElementsByTagName( 'moves')[0].firstChild.data;
		gameScore = response.getElementsByTagName( 'score')[0].firstChild.data;
		gameRank = response.getElementsByTagName( 'rank')[0].firstChild.data;
		gamePlayer = response.getElementsByTagName( 'player')[0].firstChild.data;
		
		response = null;

		// begin the replay
		me.screen('replay').open( gameID, gameSeed, gameMoves, gameScore, gameRank, gamePlayer);
	
		console.info( 'Retrieved game replay: gameID(%d), gameSeed(%d), gameMoves(%s), playerName(%s)', gameID, gameSeed, gameMoves, gamePlayer);
	}
	
	// failure
	else {
		
		console.warn( 'Failed retrieving game to replay');
	}
	
	// hide the loading screen
	me.screen( 'loading').close();
	
	// clear up request object
	me.m_HTTPReplayGame = null;
}



/**
 * Sends the score and moves to the server (for validation and high scoring purposes) 
 * before showing a game over screen. The game is always in an inactive state at the time
 * this callback is executed.
 * 
 * Automatically called from the sjGame object once the game has completed. 
 * 
 * @return
 */
SameJS.prototype.__endGameCallback = function() {
	
	var HTTPObject;
	var me = SameJS.m_instance;
	var game = me.m_game;

	var moveHash = '';
	
	// serialise game moves
	for( var i = 0; i< game.m_moveHistory.length; i++) {
		
		moveHash += game.m_moveHistory[i];
		
		if( i != game.m_moveHistory.length - 1) {
			moveHash += '|';
		}
	}
	
	console.info( 'Sending move hash: %s', moveHash);
	
	// construct parameters required for game request
	parameters = new Array( { key: 'puuid',  value: me.retrieveValue( SameJS.DATA_KEY_PLAYERUUID) },
							{ key: 'gid', 	 value: me.m_gameID },
							{ key: 'gmoves', value: moveHash }
							);
	
	// setup and send the request
	HTTPObject = sjSendHTTPRequest( SameJS.HTTP_END_GAME_URL,
									parameters,
									'get',
									null
									);
									
	// check for failure
	if( HTTPObject === false) {
										
		console.warn( 'Sending score failed');
		return;
	}
	
	// show game over screen
	me.screen( 'gameover').open( game.m_score, game.m_scoreGotBonus);
}



/**
 * Builds and sends a request to the server for a new player registration.
 * 
 * @return
 */
SameJS.prototype.registerNewPlayer = function() {

	// setup and send the request
	HTTPObject = sjSendHTTPRequest( SameJS.HTTP_NEW_PLAYER_URL,
									null,
									'get',
									SameJS.m_instance.__newPlayerCallback
									);
									
	// check for failure
	if( HTTPObject === false) {
	
		return;
	}
	
	// success - store a reference internally
	this.m_HTTPNewPlayer = HTTPObject;
}



/**
 * Callback for registerNewPlayer() once a player registration is returned from the server.
 * Extracts the data from the response and saves the UUID and name in the data store. 
 * 
 * Since a new player UUID is only ever requested at the beginning of a new game, it can be
 * assumed that we are currently waiting on this UUID to start the game. At the end of this
 * method, we resume the new game request. 
 * 
 * @return
 */
SameJS.prototype.__newPlayerCallback = function() {
	
	var response, playerUUID, playerName;
	var me = SameJS.m_instance;
	
	// we only care about completed callbacks
	if( me.m_HTTPNewPlayer == null || me.m_HTTPNewPlayer.readyState != 4) {
		return;
	}
	
	// success - extract player uuid and name
	if( me.m_HTTPNewPlayer.status == 200) {
	
		response = me.m_HTTPNewPlayer.responseXML;
		
		playerUUID = response.getElementsByTagName( 'uuid')[0].firstChild.data;
		playerName = response.getElementsByTagName( 'name')[0].firstChild.data;
		
		response = null;

		// store player uuid and name locally
		me.storeValue( SameJS.DATA_KEY_PLAYERUUID, playerUUID);
		me.storeValue( SameJS.DATA_KEY_PLAYERNAME, playerName);

		console.info( 'Retrieved player registration: playerUUID(%d), playerName(%s)', playerUUID, playerName);
	}
	
	// failure
	else {
		
		console.warn( 'Failed during player registration');
	}
	
	// clear up request object
	me.m_HTTPNewPlayer = null;
	
	// flag player as registered
	me.m_isRegisteredPlayer = true;
	
	// resume new game
	me.actionNewGame();
}

