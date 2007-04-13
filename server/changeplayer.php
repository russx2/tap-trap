<?php

	require_once '../config.inc.php';
	require_once DIR_INCLUDE . '/common.inc.php';
	
	// make sure the response isn't cached
	sendXMLHeaders();
	
	$playerIP = getIP();
	$playerHost = getHost( $playerIP);
	
	// requested player changes (stripslashes on name to get rid of javascript escaping)
	$playerUUID = getRequest( 'puuid');
	$playerName = stripslashes( getRequest( 'pname'));
	
	// cleanup player name (max length 20, remove whitespace)
	$playerName = mb_substr( trim( $playerName), 0, MAX_PLAYER_NAME_LENGTH);
	
	// retrieve playerID
	$playerID = getPlayerFromUUID( $playerUUID);
	
	// validate legitimate player
	if( $playerID === false) {
		
		logCheater( LOG_CHEAT_CHANGEPLAYER, 'Invalid playerUUID sent');
		die;
	}
	
	// logCheater the update
	logEvent( LOG_EVENT_CHANGEPLAYER, '<pid' . $playerID. '> changed to: ' . $playerName);
	
	// perform the update
	setPlayerName( $playerUUID, $playerName);
?>
<changeplayer>
	<uuid><?=xmlEscape( $playerUUID)?></uuid>
	<name><?=xmlEscape( $playerName)?></name>
</changeplayer>