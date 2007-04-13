
/*
 * SameJS_screenOptions
 * 
 * A screen object to allow the modification of game options by the player. Implements
 * common screen methods open and close.
 * 
 */
 
 
 
SameJS_screenOptions.ELM_FAST_ANIMATION = 'sjGameScreenOptions_fastAnim';
SameJS_screenOptions.ELM_THEME = 'sjGameScreenOptions_theme';
SameJS_screenOptions.ELM_NAME_CURRENT = 'sjGameScreenOptions_currentName';
SameJS_screenOptions.ELM_NAME_NEW = 'sjGameScreenOptions_newName';



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenOptions( screenID) {

	this.m_screenID = screenID;
	this.m_HTTPChangeName = null;
	
	// store a reference to ourselves
	SameJS_screenOptions.m_instance = this;
	
	// move on to initialisation
	this.initialise();
}



/**
 * Redundant initialisation method - not currently used.
 * 
 * @return
 */
SameJS_screenOptions.prototype.initialise = function() {

}



/**
 * Sets the GUI elements to the current values before showing the screen to the player.
 * 
 * @return
 */
SameJS_screenOptions.prototype.open = function() {
	
	var base = SameJS.m_instance;
	
	var elmFastAnim = document.getElementById( SameJS_screenOptions.ELM_FAST_ANIMATION);
	var elmTheme = document.getElementById( SameJS_screenOptions.ELM_THEME);
	var elmPlayerName = document.getElementById( SameJS_screenOptions.ELM_NAME_CURRENT);
	
	var valFastAnim = base.retrieveValue( SameJS.DATA_KEY_FASTANIM);
	var valTheme = base.retrieveValue( SameJS.DATA_KEY_THEME);
	
	// ensure the 'fast animation' checkbox reflects the current setting	
	elmFastAnim.checked = sjToBool( valFastAnim);
	
	// select the current theme within the theme select area
	for( i = 0; i < elmTheme.options.length; i++) {
		
		// initially set all to not selected ...
		elmTheme.options.selected = false;
		
		// ... unless this happens to be the current theme in use
		if( elmTheme.options[i].value == valTheme) {
			
			elmTheme.options[i].selected = true;
		}
	}
	
	// set player name
	if( base.retrieveValue( SameJS.DATA_KEY_PLAYERNAME)) {
		
		var playerName = base.retrieveValue( SameJS.DATA_KEY_PLAYERNAME);
		
		// show current name
		sjSetHTML( SameJS_screenOptions.ELM_NAME_CURRENT, playerName);
				   
		// set current name in the 'modify name' box
		elmPlayerName.value = playerName;
	}
	
	// if this isn't a registered player, hide the 'current/change name' block altogether
	if( base.m_isRegisteredPlayer === false) {
		
		sjHideElement( this.m_screenID + '_blockName');
	}
	else {
		
		sjShowElement( this.m_screenID + '_blockName');
	}
	
	// display the options screen
	sjShowElement( this.m_screenID);
}



/**
 * Removes the screen from the players view.
 * 
 * @return
 */
SameJS_screenOptions.prototype.close = function() {
	
	// hide this screen
	sjHideElement( this.m_screenID);
}



/**
 * Sets the 'fast animation' property within the game to that selected by the user within
 * the input element. The change is updated in the data store. Usually called as a result 
 * of the user modifying the GUI element.
 * 
 * @return
 */
SameJS_screenOptions.prototype.toggleFastAnimation = function() {
	
	var base = SameJS.m_instance;
	var toggle = document.getElementById( SameJS_screenOptions.ELM_FAST_ANIMATION).checked;
	
	// switch on/off fast animation within the game 
	base.m_game.setFastAnimation( toggle);
	
	// store this change
	value = toggle ? 1 : 0;
	base.storeValue( SameJS.DATA_KEY_FASTANIM, value);
}



/**
 * Sets the current game theme to the passed identifier. The change is updated in the data 
 * store.  
 * 
 * @param name  Identifier for the theme to change to
 * @return
 */
SameJS_screenOptions.prototype.changeTheme = function( name) {
	
	var base = SameJS.m_instance;
	
	// switch game theme to requested
	SameJS.m_instance.m_game.setTheme( name);
	
	// store this change
	base.storeValue( SameJS.DATA_KEY_THEME, name);
}



/**
 * Changes the player name on the server (shown in high scores etc.). Initiates a request
 * to change with the server and passes a callback for the response.
 * 
 * We don't store the changed name here, we wait for the callback so the server can
 * sanitise the input as it chooses.
 * 
 * @return
 */
SameJS_screenOptions.prototype.changeName = function() {

	var newName = sjTrim( sjGetHTMLInput( SameJS_screenOptions.ELM_NAME_NEW));
	var base = SameJS.m_instance;
	
	// are we already mid-request for another change?
	if( this.m_HTTPChangeName !== null) {
		return;
	}
	
	// nothing to change the name to? ignore this request
	if( newName == '') {
		
		// clear possible spaces in the 'new name' input
		sjSetHTMLInput( SameJS_screenOptions.ELM_NAME_NEW, '');
		
		return;
	}
	
	// show loading icon
	sjShowElement( this.m_screenID + '_loading');
	
	// construct parameters required for name change request
	parameters = new Array( { key: 'puuid',  value: base.retrieveValue( SameJS.DATA_KEY_PLAYERUUID) },
							{ key: 'pname',  value: newName}
							);
	
	// setup and send the request
	HTTPObject = sjSendHTTPRequest( SameJS.HTTP_CHANGE_PLAYERNAME_URL,
									parameters,
									'get',
									SameJS_screenOptions.m_instance.__changeNameCallback
									);
									
	// check for failure
	if( HTTPObject === false) {
										
		console.warn( 'Player name change failed');
		return;
	}
	
	// store object for the callback
	this.m_HTTPChangeName = HTTPObject;
}



/**
 * Callback for the changeName method. Retrieves the server-sanitised name from the server
 * response and stores the name for local use.
 * 
 * @return
 */
SameJS_screenOptions.prototype.__changeNameCallback = function() {
	
	var response, playerName;
	var me = SameJS_screenOptions.m_instance;
	var base = SameJS.m_instance;
	
	// we only care about completed callbacks
	if( me.m_HTTPChangeName == null || me.m_HTTPChangeName.readyState != 4) {
		return;
	}
	
	// success - extract player name (as acknowledged by the server)
	if( me.m_HTTPChangeName.status == 200) {
	
		response = me.m_HTTPChangeName.responseXML;
		
		playerUUID = response.getElementsByTagName( 'uuid')[0].firstChild.data;
		playerName = response.getElementsByTagName( 'name')[0].firstChild.data;
	
		response = null;

		// store player name locally
		base.storeValue( SameJS.DATA_KEY_PLAYERNAME, playerName);
		
		// update the 'current name' field
		sjSetHTML( SameJS_screenOptions.ELM_NAME_CURRENT, playerName);
		
		// clear the 'new name' field entry
		sjSetHTMLInput( SameJS_screenOptions.ELM_NAME_NEW, '');
		
		// update the name as displayed on the 'game over' screen. if the user has just come
		// from there, we need to make sure its changed when they go back to avoid confusion!
		base.screen( 'gameover').setName( playerName);

		console.info( 'Retrieved player name change confirmation: playerUUID(%s), playerName(%s)', playerUUID, playerName);
	}
	
	// failure
	else {
		
		console.warn( 'Failure during player name change');
	}
	
	// hide loading icon
	sjHideElement( me.m_screenID + '_loading');
	
	// clear up request object
	me.m_HTTPChangeName = null;
}