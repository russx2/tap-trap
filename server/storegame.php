<?php

	require_once '../config.inc.php';
	require_once DIR_INCLUDE . '/common.inc.php';
	require_once DIR_CLASS .'/GameValidator.class.php';
	
	// make sure the game seed isn't cached'
	sendXMLHeaders();
	
	$isValidGame = false;
	
	$gameID = getRequest( 'gid');
	$playerUUID = getRequest( 'puuid');
	$playerID = getPlayerFromUUID( $playerUUID);
	
	$gameMoves = getRequest( 'gmoves');
	
	// check if this is a valid game, is associated with this player and that
	// no previous score has been submitted
	$qryCheckGame = 'SELECT
					 g.seed AS seed
					 FROM
					 games AS g
					 LEFT JOIN
					 scores AS s
					 ON(g.id = s.game_id)
					 WHERE
					 s.game_id IS NULL AND
					 g.id = \''.(int)$gameID.'\' AND
					 g.player_id = \''.(int)$playerID.'\'';

	$resCheckGame = mysql_query( $qryCheckGame);;
	
	if( mysql_num_rows( $resCheckGame) === 1) {
		
		$gameSeed = mysql_result( $resCheckGame, 0);

		// validate game moves from played seed
		$game = new GameValidator( $gameSeed);
		$game->processMoves( $gameMoves);
		
		$isValidGame = $game->isValid();
	}
	
	if( $isValidGame) {
		
		$gameScore = $game->getScore();
		$gameBonus = $game->gotBonus() ? 1 : 0;
		
		$qrySaveScore = 'INSERT INTO
						 scores(
							game_id,
							player_id,
							score,
							moves,
							bonus,
							processed
						 )
						 VALUES(
							\''.(int)dbEscape( $gameID).'\',
							\''.(int)dbEscape( $playerID).'\',
							\''.(int)dbEscape( $gameScore).'\',
							\''.dbEscape( $gameMoves).'\',
							\''.(int)dbEscape( $gameBonus).'\',
							NOW()
						 )';
						 
		$resSaveScore = mysql_query( $qrySaveScore);
	}
	else {
		
		logCheater( LOG_CHEAT_SCORE);
	}
?>
<s></s>
 