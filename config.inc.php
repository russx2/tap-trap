<?php

	//
	// database
	//
	
	// local
	if( strpos( $_SERVER['SERVER_ADDR'], '10.') === 0) {
		
		define( 'DB_HOST', 'localhost');
		define( 'DB_USER', 'root');
		define( 'DB_PASS', 'whizz1');
		define( 'DB_DB', 'samegame');
	}
	
	// live
	else {
		
		define( 'DB_HOST', 'localhost');
		define( 'DB_USER', 'samegame');
		define( 'DB_PASS', 'xq49bcp2');
		define( 'DB_DB', 'samegame');
	}
	
	//
	// paths
	//
	define( 'DIR_ROOT', '');
	define( 'DIR_ROOT_DATA', '/var/www-data/samegame');
	define( 'DIR_CLASS', DIR_ROOT . 'class');
	define( 'DIR_INCLUDE', DIR_ROOT . 'include');
	define( 'DIR_LOGS', DIR_ROOT_DATA . '/logs');
	
	//
	// game board
	//
	define( 'BOARD_WIDTH', 15);
	define( 'BOARD_HEIGHT', 10);
	define( 'BOARD_NUM_TILES', 3);
	define( 'BOARD_CLEAR_BONUS', 1000);
	
	//
	// options
	//
	define( 'DEFAULT_PLAYER_NAME', 'Joe Bloggs');
	define( 'MAX_PLAYER_NAME_LENGTH', 20);
	define( 'MAX_WORLD_SCORES', 30);
	define( 'MAX_PLAYER_SCORES', 5);
	
	//
	// logs - set values to null to turn off logging
	//
	define( 'LOG_CHEAT_SCORE', DIR_LOGS . '/cheat-score.log');
	define( 'LOG_CHEAT_NEWPLAYER', DIR_LOGS . '/cheat-newplayer.log');
	define( 'LOG_CHEAT_NEWGAME', DIR_LOGS . '/cheat-newgame.log');
	define( 'LOG_CHEAT_CHANGEPLAYER', DIR_LOGS . '/cheat-changeplayer.log');
	define( 'LOG_CHEAT_GAMEREPLAY', DIR_LOGS . '/cheat-gamereplay.log');
	
	define( 'LOG_EVENT_CHANGEPLAYER', DIR_LOGS . '/event-changeplayer.log')
?>