<?php

	require_once '../config.inc.php';
	require_once DIR_INCLUDE . '/common.inc.php';
	
	// make sure the playerUUID isn't cached
	sendXMLHeaders();
	
	$playerIP = getIP();
	$playerHost = getHost( $playerIP);
	
	//
	// TODO: Check ip etc. within last X minutes/seconds to prevent abuse.
	// If a player UUID was generated in this time, automatically return the relevant
	// existing ID. 
	//
	
	// new player
	$playerUUID = generateUUID();
	
	$qryPlayer = 'INSERT INTO
				  players (
					  id,
					  uuid,
					  joined,
					  ip,
					  host
				  )
				  VALUES(
					  \'\',
					  \''.dbEscape( $playerUUID).'\',
					  NOW(),
					  \''.dbEscape( $playerIP).'\',
					  \''.dbEscape( $playerHost).'\'
				  )';
	
	
	$resPlayer = mysql_query( $qryPlayer);

	// retrieve playerID
	$playerID = mysql_insert_id();
	
	// generate a default player name based on the id and update the entry
	// (all player names should start at 1000 minimum for display consistency)
	$playerName = DEFAULT_PLAYER_NAME . ' ' . ( $playerID + 1000);
	
	setPlayerName( $playerUUID, $playerName);
?>
<newplayer>
	<uuid><?=xmlEscape( $playerUUID)?></uuid>
	<name><?=xmlEscape( $playerName)?></name>
</newplayer>
