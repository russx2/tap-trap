<?php

	require_once '../config.inc.php';
	require_once DIR_INCLUDE . '/common.inc.php';
	
	// make sure the game seed isn't cached'
	sendXMLHeaders();
	
	$playerID = false;
	$playerUUID = '';
	$playerIP = getIP();
	$playerHost = getHost( $playerIP);
		
	// initially check this is a legitimate existing player
	if( getRequest( 'puuid')) {
		
		$playerUUID = getRequest( 'puuid');
		
		// retrieve this player's id
		$playerID = getPlayerFromUUID( $playerUUID);
		
		// check this is a valid player
		if( $playerID === false) {
			
			logCheater( LOG_CHEAT_NEWGAME, 'Invalid playerUUID sent');
			die;
		}
	}
	
	// no playerUUID sent
	else {
		
		logCheater( LOG_CHEAT_NEWGAME, 'No playerUUID sent with request');
		die;
	}
	
	// generate a random game seed
	$gameSeed = mt_rand();
	
	// for debugging / abuse monitoring, we're logging the args sent with this request
	$gameArgs = mb_substr( getRequestAsString(), 0, 255);

	// create db game entry
	$qryGame = 'INSERT INTO
				games (
					id,
					player_id,
					seed,
					processed,
					ip,
					host,
					urlargs
				)
				VALUES(
					\'\',
					\''.(int)dbEscape( $playerID).'\',
					\'' . dbEscape( $gameSeed) .'\',
					NOW(),
					\''.dbEscape( $playerIP).'\',
					\''.dbEscape( $playerHost).'\',
					\''.dbEscape( $gameArgs).'\'
				)';
				
	$resGame = mysql_query( $qryGame);
	$gameID = mysql_insert_id();
?>
<newgame>
	<id><?=xmlEscape( $gameID)?></id>
	<seed><?=xmlEscape( $gameSeed)?></seed>
</newgame>
