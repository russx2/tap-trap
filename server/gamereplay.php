<?php

	require_once '../config.inc.php';
	require_once DIR_INCLUDE . '/common.inc.php';
	
	// make sure the output isn't cached
	sendXMLHeaders();
	
	// retrieve game we're requesting the replay for
	$gameID = getRequest( 'gid');
	
	//
	// retrieve game seed, moves etc.
	//
	$qryGame = 'SELECT
				s.game_id AS game_id,
				s.moves AS game_moves,
				s.score AS game_score,
				g.seed AS game_seed,
				p.name AS player
				FROM
				scores AS s
				LEFT JOIN
				games AS g
				ON(s.game_id = g.id)
				LEFT JOIN
				players AS p
				ON(s.player_id = p.id)
				WHERE
				s.game_id = \''.(int)$gameID.'\'
				';
				
	$resGame = mysql_query( $qryGame);
	
	// invalid game requested
	if( mysql_num_rows( $resGame) != 1) {
		
	
		logCheater( LOG_CHEAT_GAMEREPLAY, 'Invalid gameID sent');
		die;
	}
	
	$rowGame = mysql_fetch_assoc( $resGame);

	// extract ready to output
	$gameMoves = $rowGame['game_moves'];
	$gameSeed = $rowGame['game_seed'];
	$gameScore = $rowGame['game_score'];
	$playerName = $rowGame['player'];	
	
	// retrieve this game's ranking
	$qryRanking = 'SELECT
				   COUNT(*) AS rank
				   FROM
				   scores AS s
				   WHERE
				   s.score > \''.(int)$gameScore.'\'';
				   
	$resRanking = mysql_query( $qryRanking);
	
	$rowRanking = mysql_fetch_assoc( $resRanking);
	
	// add one because we want it in terms of 1st, 2nd etc.
	$gameRank = $rowRanking['rank'] + 1;
	//$gameRank .= getOrdinal( $gameRank);
?>
<gamereplay>
	<id><?=xmlEscape( $gameID)?></id>
	<seed><?=xmlEscape( $gameSeed)?></seed>
	<moves><?=xmlEscape( $gameMoves)?></moves>
	<score><?=xmlEscape( $gameScore)?></score>
	<rank><?=xmlEscape( $gameRank)?></rank>
	<player><?=xmlEscape( $playerName)?></player>
</gamereplay>