
/*
 * SameJS_screenOptions
 * 
 * A screen object to allow the modification of game options by the player. Implements
 * common screen methods open and close.
 * 
 */



SameJS_screenScores.MAX_WORLD = 30;
SameJS_screenScores.MAX_PLAYER = 5;
SameJS_screenScores.WORLD_SCORE_ID_PREFIX = '_worldscore';
SameJS_screenScores.WORLD_NAME_ID_PREFIX = '_worldname';
SameJS_screenScores.WORLD_GAME_ID_PREFIX = '_worldgame'



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenScores( screenID) {

	this.m_screenID = screenID;

	// high score caches
	this.m_scoresPlayer = null;
	this.m_scoresWorld = null;
	this.m_scoresAverage = null;
	this.m_playerRank = null;

	// http request ref
	this.m_HTTPScores = null;
	
	// store a reference to ourselves
	SameJS_screenScores.m_instance = this;
	
	// move on to initialisation
	this.initialise();
}



/**
 * Creates necessary data structures and sets values to a safe default.
 * 
 * @return
 */
SameJS_screenScores.prototype.initialise = function() {
	
	var elmWorldScores;
	
	// initialise scores to initial dummy data
	this.m_scoresPlayer = new Array();
	this.m_scoresWorld = new Array();
	
	// initialise player scores
	for( i = 0; i < SameJS_screenScores.MAX_PLAYER; i++) {
		
		this.m_scoresPlayer[i] = 'n/a';
	}
	
	// initialise world scores
	for( i = 0; i < SameJS_screenScores.MAX_WORLD; i++) {
		
		this.m_scoresWorld[i] = { player: 'Loading...', score: 'n/a', gameid: null };
	}
	
	// misc items
	this.m_scoresAverage = { player: 'n/a', world: 'n/a' };
	this.m_playerRank = 'n/a';
	
	// create table structure for world high scores
	elmWorldScores = document.getElementById( this.m_screenID + '_scores');
	elmWorldScores.appendChild( this.__createTable());
}



/**
 * Sets the GUI elements to the current values. Sets off a call to the server to load the
 * most current game scores, displaying the screen with current values in the mean time
 * (with a loading message).
 * 
 * @return
 */
SameJS_screenScores.prototype.open = function() {
	
	var HTTPObject;
	var base = SameJS.m_instance;
	var parameters;
	var playerUUID;
	
	// initially show last cached scores before attempting to load latest
	this.__updateScores();
	
	// show 'loading' message as we initiate an server score update
	sjShowElement( this.m_screenID + '_loading');
	
	// show actual screen with currently cached scores
	sjShowElement( this.m_screenID);
	
	// if we're mid-way through another request, forget this one
	if( this.m_HTTPScores !== null) {
		
		return;
	}
	
	// see if we have an existing playerUUID we can use
	playerUUID = base.retrieveValue( 'puuid');
	
	// construct parameters required for game request
	parameters = new Array( { key: 'puuid', value: playerUUID} );
	
	// setup and send the request
	HTTPObject = sjSendHTTPRequest( SameJS.HTTP_SCORES_URL,
									parameters,
									'get',
									SameJS_screenScores.m_instance.__loadScoresCallback
									);
									
	// check for failure
	if( HTTPObject === false) {
									 
		return;
	}
	
	// success - store a reference internally
	this.m_HTTPScores = HTTPObject;
}



/**
 * Removes the screen from the players view.
 * 
 * @return
 */
SameJS_screenScores.prototype.close = function() {
	
	// hide this screen
	sjHideElement( this.m_screenID);
}



/**
 * Creates the table structure for the world high scores table and returns it.
 * 
 * @return  Table element, containing structure for high score table.
 */
SameJS_screenScores.prototype.__createTable = function() {
	
	var elmTable;
	
	// create html table element for world scores and table body
	elmTable = document.createElement( 'table');
	elmTableBody = document.createElement( 'tbody');
	
	// initially create heading row
	rowHead = document.createElement( 'tr');
	
	colHeadRank = document.createElement( 'th');
	colHeadRank.className = 'rank';
	colHeadRank.appendChild( document.createTextNode( 'Rank'));
	rowHead.appendChild( colHeadRank);
	
	colHeadScore = document.createElement( 'th');
	colHeadScore.className = 'score';
	colHeadScore.appendChild( document.createTextNode( 'Score'));
	rowHead.appendChild( colHeadScore);
	
	colHeadPlayer = document.createElement( 'th');
	colHeadPlayer.className = 'name';
	colHeadPlayer.appendChild( document.createTextNode( 'Name'));
	rowHead.appendChild( colHeadPlayer);
	
	colHeadWatch = document.createElement( 'th');
	colHeadWatch.className = 'replay';
	colHeadWatch.appendChild( document.createTextNode( 'Replay'));
	rowHead.appendChild( colHeadWatch);
		
	// add heading row to table
	elmTableBody.appendChild( rowHead);
	
	// now create each score entry row
	for( i = 0; i < SameJS_screenScores.MAX_WORLD; i++) {
		
		row = document.createElement( 'tr');
		
		// rank column
		colRank = document.createElement( 'td');
		colRank.className = 'rank';
		colRank.appendChild( document.createTextNode( i + 1));
		
		row.appendChild( colRank);
		
		// score column
		colScore = document.createElement( 'td');
		colScore.className = 'score';
		
		colScoreSpan = document.createElement( 'span');
		colScoreSpan.id = this.m_screenID + SameJS_screenScores.WORLD_SCORE_ID_PREFIX + i;
		
		colScore.appendChild( colScoreSpan);
		
		row.appendChild( colScore);
		
		// name column
		colName = document.createElement( 'td');
		colName.className = 'name';
		
		colNameSpan = document.createElement( 'span');
		colNameSpan.id = this.m_screenID + SameJS_screenScores.WORLD_NAME_ID_PREFIX + i;
		
		colName.appendChild( colNameSpan);
		
		row.appendChild( colName);
		
		// watch column
		colWatch = document.createElement( 'td');
		colWatch.className = 'replay';
		
		colWatchA = document.createElement( 'a');
		
		// we're wholeheartedly abusing the gameID attribute here to store the gameID. The
		// onclick method set will have access to this var and can hence extract the correct
		// gameID.
		colWatchA.id = this.m_screenID + SameJS_screenScores.WORLD_GAME_ID_PREFIX + i;
		colWatchA.title = 'Watch this game';
		colWatchA.gameID = i;
		colWatchA.onclick = SameJS_screenScores.m_instance.playReplay;
		
		colWatch.appendChild( colWatchA);
		
		row.appendChild( colWatch);
		
		// append row to table body
		elmTableBody.appendChild( row);
	}
	
	// append table body to parent table
	elmTable.appendChild( elmTableBody);
	
	return elmTable;
}



/**
 * Callback for when the server returns the latest scores. If the data is complete, the
 * scores are updated in the screen display and cached for future use. The loading message
 * is removed.
 * 
 * @return
 */
SameJS_screenScores.prototype.__loadScoresCallback = function() {
	
	var response, gameID, gameSeed;
	var me = SameJS_screenScores.m_instance;
	var scoresPlayer, scoresWorld, scoresAverage;

	// we only care about completed callbacks
	if( me.m_HTTPScores == null || me.m_HTTPScores.readyState != 4) {
		return;
	}
	
	// something went wrong
	if( me.m_HTTPScores.status != 200) {
		
		console.warn( 'Loading scores failed');
		return;
	}
	
	// success - extract scores from returned data
	scoresPlayer = new Array();
	scoresWorld = new Array();
	scoresAverage = new Array();
	response = me.m_HTTPScores.responseXML;
	
	// extract player scores
	playerNode = response.getElementsByTagName( 'me')[0];
	playerNodeScores = playerNode.getElementsByTagName( 's');
	
	for( i = 0; i < playerNodeScores.length; i++) {
		
		scoresPlayer[scoresPlayer.length] = playerNodeScores[i].firstChild.data;
	}
	
	// extract world scores
	worldNode = response.getElementsByTagName( 'world')[0];
	worldNodeScores = worldNode.getElementsByTagName( 's');
	
	for( i = 0; i < worldNodeScores.length; i++) {

		scoresWorld[scoresWorld.length] = { player: worldNodeScores[i].getAttribute( 'name'),
											score: worldNodeScores[i].firstChild.data,
											gameid: worldNodeScores[i].getAttribute( 'gameid') };
	}
	
	// extract averages
	averageNode = response.getElementsByTagName( 'avg')[0];
	averageNodePlayer = averageNode.getElementsByTagName( 'me')[0];
	averageNodeWorld = averageNode.getElementsByTagName( 'world')[0];
	
	scoresAverage['player'] = averageNodePlayer.firstChild.data;
	scoresAverage['world'] = averageNodeWorld.firstChild.data;
	
	// extract player best rank
	rankNode = response.getElementsByTagName( 'rank')[0];
	rankNodePlayer = rankNode.getElementsByTagName( 'me')[0];
	
	rankPlayer = rankNodePlayer.firstChild.data;
	
	// update game score data
	me.m_scoresPlayer = scoresPlayer;
	me.m_scoresWorld = scoresWorld;
	me.m_scoresAverage = scoresAverage;
	me.m_playerRank = rankPlayer;
	
	response = null;

	// clear up request object
	me.m_HTTPScores = null;
	
	// now we've got the scores, let's update the screen
	me.__updateScores();
	
	// and hide the loading message
	sjHideElement( me.m_screenID + '_loading');
}



/**
 * Updates the screen GUI with the latest scores we have stored.
 * 
 * @return
 */
SameJS_screenScores.prototype.__updateScores = function() {

	var pScoreID, wScoreID, wNameID;
	
	// update player scores
	for( i = 0; i < SameJS_screenScores.MAX_PLAYER; i++) {
	
		// construct this scores element ID
		pScoreID = this.m_screenID + '_playerScore' + i;
		
		// update html
		sjSetHTML( pScoreID, this.m_scoresPlayer[i]);
	}	
	
	// update world scores
	for( i = 0; i < SameJS_screenScores.MAX_WORLD; i++) {
		
		wNameID = this.m_screenID + SameJS_screenScores.WORLD_NAME_ID_PREFIX + i;
		wScoreID = this.m_screenID + SameJS_screenScores.WORLD_SCORE_ID_PREFIX + i;
		wGameID = this.m_screenID + SameJS_screenScores.WORLD_GAME_ID_PREFIX + i;
		
		sjSetHTML( wNameID, this.m_scoresWorld[i].player);
		sjSetHTML( wScoreID, this.m_scoresWorld[i].score);
		
		// set gameID in the 'watch' anchor
		document.getElementById( wGameID).gameID = this.m_scoresWorld[i].gameid;
	}
	
	// update average scores
	pAverageID = this.m_screenID + '_playerAverage';
	wAverageID = this.m_screenID + '_worldAverage';
	
	sjSetHTML( pAverageID, this.m_scoresAverage['player']);
	sjSetHTML( wAverageID, this.m_scoresAverage['world']);
	
	// update player best rank
	sjSetHTML( this.m_screenID + '_playerRank', this.m_playerRank);
}


SameJS_screenScores.prototype.playReplay = function() {
	
	var base = SameJS.m_instance;
	var gameID = this.gameID;
	
	base.actionReplayGame( gameID);
	
	return false;
}