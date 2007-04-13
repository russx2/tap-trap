<?php

	require_once '../config.inc.php';
	require_once DIR_INCLUDE . '/common.inc.php';
	
	// make sure the scores aren't cached
	sendXMLHeaders();
	
	// initially see whether this is an existing player
	$playerUUID = getRequest( 'puuid');
	$playerID = getPlayerFromUUID( $playerUUID);
	
	
	
	//
	// At this point, $playerUUID may be false (if one wasn't passed). We can safely ignore
	// this as the queries involving a specific player will all return nothing which is
	// fine.
	//
	
	
	
	//
	// retrieve top player scores
	//
	$qryPlayer = 'SELECT
				  score
				  FROM
				  scores
				  WHERE
				  player_id = \''.(int)$playerID.'\' 
				  ORDER BY
				  score DESC
				  LIMIT ' . MAX_PLAYER_SCORES;
			
	$resPlayer = mysql_query( $qryPlayer);
	
	// extract player scores
	$scorePlayers = array();
	
	for( $i = 0; $i < MAX_PLAYER_SCORES; $i++) {
		
		$row = mysql_fetch_assoc( $resPlayer);
		$scorePlayers[] = $row ? $row['score'] : 'n/a';
	}
	
	
	
	//
	// retrieve top world scores
	//
	$qryWorld = 'SELECT
				 s.score AS score,
				 s.game_id AS game_id,
				 p.name AS player
				 FROM
				 scores AS s
				 LEFT JOIN
				 players AS p
				 ON(s.player_id = p.id)
				 ORDER BY
				 score DESC
				 LIMIT ' . MAX_WORLD_SCORES;
				 
	$resWorld = mysql_query( $qryWorld);
	
	// extract world scores
	$scoreWorld = array();
	
	for( $i = 0; $i < MAX_WORLD_SCORES; $i++) {
		
		$row = mysql_fetch_assoc( $resWorld);
		
		$score = $row ? $row['score'] : 'n/a';
		$player = $row ? $row['player'] : 'n/a';
		$gameID = $row ? $row['game_id'] : '0';
		
		$scoreWorld[] = array( 'player' => $player, 'score' => $score, 'gameID' => $gameID);
	}
	
	
	
	//
	// retrieve player's best ranking
	//
	
	$bestPlayerScore = (int)$scorePlayers[0];
	
	if( $bestPlayerScore > 0) {
		
		// retrieve number of positions above player
		$qryRanking = 'SELECT
					   COUNT(*) AS rank
					   FROM
					   scores AS s
					   WHERE
					   s.score > \''.(int)$bestPlayerScore.'\'';
					   
		$resRanking = mysql_query( $qryRanking);
		
		$row = mysql_fetch_assoc( $resRanking);
		
		// add one because we want it in terms of 1st, 2nd etc.
		$playerBestRank = $row['rank'] + 1;
		$playerBestRank .= getOrdinal( $playerBestRank);
	}
	else {
		
		$playerBestRank = 'n/a';
	}
	
	
	
	//
	// retrieve player and world's average score
	//
	$qryPlayerAvg = 'SELECT
					 AVG(score) AS score
					 FROM
					 scores
					 WHERE
				  	 player_id = \''.(int)$playerID.'\'';
				  	 
	$resPlayerAvg = mysql_query( $qryPlayerAvg);
	$avgPlayer = round( mysql_result( $resPlayerAvg, 0));
	
	$qryWorldAvg = 'SELECT
					AVG(score) AS score
					FROM
					scores';
				  	 
	$resWorldAvg = mysql_query( $qryWorldAvg);
	$avgWorld = round( mysql_result( $resWorldAvg, 0));
?>
<scores>
	<me>
		<?php foreach( $scorePlayers AS $score) { ?>
		<s><?=$score?></s>
		<?php } ?>
	</me>
	<world>
		<?php foreach( $scoreWorld AS $score) { ?>
		<s name="<?=xmlEscape( $score['player'])?>" gameid="<?=xmlEscape( $score['gameID'])?>"><?=$score['score']?></s>
		<?php } ?>
	</world>
	<avg>
		<me><?=$avgPlayer?></me>
		<world><?=$avgWorld?></world>
	</avg>
	<rank>
		<me><?=$playerBestRank?></me>
	</rank>
</scores>
