<?php

	
	require_once DIR_CLASS . '/MathRandom.class.php';
	
	// auto-connect to db
	$db = mysql_connect( DB_HOST, DB_USER, DB_PASS);
	mysql_select_db( DB_DB);
	
	//
	// game server methods
	//
	
	

	/**
	 * Returns the player ID associated with the passed UUID.
	 * 
	 * @param playerUUID  Players public uuid
	 * @return			  Players internal ID
	 */
	function getPlayerFromUUID( $playerUUID) {
		
		$qryPlayer = 'SELECT
					  id
					  FROM
					  players
					  WHERE
					  uuid = \''.dbEscape( $playerUUID).'\'';
					  
		$resPlayer = mysql_query( $qryPlayer);
		
		// we've found the playerID ok	
		if( mysql_num_rows( $resPlayer) === 1) {
			
			return mysql_result( $resPlayer, 0);
		}
		
		return false;
	}

	
	
	/**
	 * Updates the players name associated with the passed uuid.
	 * 
	 * @param playerUUID  The UUID of the player to update
	 * @param playerName  The new name for the player
	 * @return 			  True on success, false on failure
	 */
	function setPlayerName( $playerUUID, $playerName) {
		
		// do the update based on the internal ID, rather than the public UUID
		$playerID = getPlayerFromUUID( $playerUUID);
		
		$qryUpdate = 'UPDATE
					  players
					  SET
					  name = \''.dbEscape( $playerName).'\'
					  WHERE
					  id = \''.(int)dbEscape( $playerID).'\'';
					  
		$resUpdate = mysql_query( $qryUpdate);
		
		return $resUpdate ? true : false;
	}
	
	
	
	//
	// utility methods
	//
	
	function dbEscape( $str) {
		return mysql_real_escape_string( $str);	
	}
	
	function xmlEscape( $str) {
		
		return str_replace( '&', '&amp;', htmlspecialchars( $str, ENT_QUOTES, 'UTF-8'));
	}
	
	function getRequest( $str, $default = '') {
		
		return isset( $_REQUEST[$str]) ? $_REQUEST[$str] : $default;
	}
	
	function getGet( $str, $default = '') {
		
		return isset( $_GET[$str]) ? $_GET[$str] : $default;
	}
	
	function getPost( $str, $default = '') {
		
		return isset( $_POST[$str]) ? $_POST[$str] : $default;
	}
	
	function getOrdinal( $num) {
	
		$suffix = '';
		
	    if( ( $num % 100) > 10 && ( $num %100) < 14) {
	    
	        $suffix = 'th';
	    }
	    
	    else {
	    	
	        switch( $num % 10) {
	
	            case 0:
	                $suffix = 'th';
	                break;
	
	            case 1:
	                $suffix = 'st';
	                break;
	
	            case 2:
	                $suffix = 'nd';
	                break;
	
	            case 3:
	                $suffix = 'rd';
	                break;
	
	            default:
	                $suffix = 'th';
	                break;
	        }
		}
	
	    return $suffix;
	}
	
	function sendXMLHeaders() {
		
		// elminate caching
		header( 'Content-type: text/xml; charset=UTF-8');
		header( 'Expires: Mon, 22 Jan 1998 09:00:00 GMT');
		header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s') . ' GMT'); 
		header( 'Cache-Control: no-cache, must-revalidate'); 
		header( 'Pragma: no-cache');
		
		
		// first item should be encoding type
		echo '<?xml version="1.0" encoding="utf-8"?>';
	}
	
	function getRequestAsString() {
		
		$arguments = '';
		
		if( isset( $_REQUEST)) {
		
			foreach( $_REQUEST AS $key => $val) {
				
				if( $arguments) {
					$arguments .= '&';
				}
				
				$arguments .= $key . '=' . $val;
			}
		}
		
		return $arguments;
	}

	function getIP() {
		
		if( isset( $_SERVER['HTTP_X_FORWARD_FOR']) && $_SERVER['HTTP_X_FORWARD_FOR']) {
			return $_SERVER['HTTP_X_FORWARD_FOR'];
		}
		
		return $_SERVER['REMOTE_ADDR'];
	}
	
	function getHost( $ip) {
		
		return gethostbyaddr( $ip);
	}
	
	function generateUUID() {
		
		return uniqid( mt_rand(), true);
	}
	
	function logCheater( $filepath, $reason = '') {
		
		// logging disabled?
		if( $filepath == null) {
			return;
		}
		
		// reason this is a suspected cheat
		$logReason = '[reason] ' . $reason . "\n";
		
		// retrieve all post input
		$logPost = '[post] ';
		foreach( $_POST AS $key => $val) {
			$logPost .= $key . '=' . $val . '&';
		}
		$logPost .= "\n";
		
		// retrieve all get input
		$logGet = '[get] ';
		foreach( $_GET AS $key => $val) {
			$logGet .= $key . '=' . $val . '&';
		}
		$logGet .= "\n";
		
		// retrieve all cookie input
		$logCookie = '[cookie] ';
		foreach( $_COOKIE AS $key => $val) {
			$logCookie .= $key . '=' . $val . '&';
		}
		$logCookie .= "\n";
		
		// misc items
		$logEnv = '[env] ';
		$logEnv .= 'date=' . date( "m.d.y, H:i:s") . '&';
		$logEnv .= 'ip=' . getIP() . '&';
		$logEnv .= 'host=' . getHost( getIP()) . '&';
		$logEnv .= "\n";
		
		// write out cheater info
		$fp = fopen( $filepath, 'a');
		
		fwrite( $fp, $logReason . $logEnv . $logPost . $logGet . $logCookie . "\n");
		
		fclose( $fp);
	}

	function logEvent( $filepath, $message = '') {
		
		// logging disabled?
		if( $filepath == null) {
			return;
		}
		
		// write out cheater info
		$fp = fopen( $filepath, 'a');
		
		fwrite( $fp, '[' . date( "m.d.y, H:i:s") . '] ' . $message . "\n");
		
		fclose( $fp);
	}
?>