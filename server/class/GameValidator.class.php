<?php

		require_once DIR_CLASS . '/MathRandom.class.php';
		
		

class GameValidator {
	
	private $m_matrix;
	
	private $m_isValid;
	private $m_score;
	private $m_gotBonus;
	
	function __construct( $seed) {
		
		$this->m_isValid = false;
		$this->m_score = 0;
		$this->m_gotBonus = false;
		
		$this->initialise( $seed);
	}
	
	
	
	public function initialise( $seed) {
		
		$this->m_matrix = array();
		
		// initialise random number generator with game seed
		sjMathRandom::setSeed( $seed);
		
		$typeCount = 0;
		
		// initialise board matrix, evenly distributing tiles
		for( $x = 0; $x < BOARD_WIDTH; $x++) {
			for( $y = 0; $y < BOARD_HEIGHT; $y++) {
				
				if( $y == 0) {
					$this->m_matrix[$x] = array();
				}
				
				$typeCount = ( $typeCount + 1) % BOARD_NUM_TILES;
				$this->m_matrix[$x][$y] = $typeCount;
			}
		}
	
		// randomise tiles based on seed
		for( $x = 0; $x < BOARD_WIDTH; $x++) {
			for( $y = 0; $y < BOARD_HEIGHT; $y++) {
			
				$newX = sjMathRandom::getRandom( BOARD_WIDTH) - 1;
				$newY = sjMathRandom::getRandom( BOARD_HEIGHT) - 1;
				
				// swop tiles
				$typeA = $this->m_matrix[$x][$y];
				$typeB = $this->m_matrix[$newX][$newY];
				
				$this->m_matrix[$x][$y] = $typeB;
				$this->m_matrix[$newX][$newY] = $typeA;
			}
		}
	}
	
	
	
	public function processMoves( $moves) {
		
		// extract click data from string
		$movesIndividual = explode( '|', $moves);
		
		// process each move
		foreach( $movesIndividual AS $move) {
			
			$coords = explode( ',', $move);
			$clickX = (int)$coords[0];
			$clickY = (int)$coords[1];
			
			// check boundaries on coordinates
			if( $clickX < 0 || $clickX > BOARD_WIDTH - 1 || 
				$clickY < 0 || $clickY > BOARD_HEIGHT - 1) {
					
				// immediate failure - we're being fed some duff data here
				$this->m_isValid = false;
				
				return false;
			}
			
			// retrieve all tiles selected on this click
			$tileSelection = $this->getLinkedTiles( $clickX, $clickY);
			
			// add on score for this selection
			$this->m_score += $this->selectionScore( $tileSelection);
			
			// remove selection from board
			$this->selectionDestroy( $tileSelection);
			
			// alter the game board to reflect destroying selection
			$this->moveTiles( $tileSelection);
		}
		
		// all moves are processed so we're now checking that the game has actually
		// ended at this point
		if( $this->hasFurtherMoves()) {
			
			$this->m_isValid = false;
			return false;
		}
		
		// we have a valid game, now just check if they got the empty board bonus
		if( $this->isEmpty()) {
			
			$this->m_gotBonus = true;
			$this->m_score += BOARD_CLEAR_BONUS;
		}
		
		// game is valid
		$this->m_isValid = true;
	}
	
	
	
	private function selectionScore( $currentSelection) {

		// no selection? no score
		if( count( $currentSelection) === 0) {
			return 0;
		}
		
		$numTiles = count( $currentSelection);
		
		// no score for 2 tiles or less
		if( $numTiles < 3) {
			return 0;	
		}
		
		return ($numTiles - 2) * ($numTiles - 2);
	}
	
	
	
	public function isValid() {
		
		return $this->m_isValid;
	}
	
	
	
	public function getScore() {
		
		return $this->m_score;
	}
	
	
	
	public function gotBonus() {
		
		return $this->m_gotBonus;
	}
	
	
	
	private function getLinkedTiles( $x, $y) {
		
		$linkedTiles = array();
		$typeID = $this->m_matrix[$x][$y];
		
		$this->__getLinkedTiles( $typeID, $x, $y, $linkedTiles);	
		
		return $linkedTiles;
	}



	private function __getLinkedTiles( $typeID, $x, $y, &$results) {

		// check if we've visited this node before - if we have,
		// return immediately
		for( $i = 0; $i < count( $results); $i++) {
		
			if( $results[$i]['x'] == $x && $results[$i]['y'] == $y) {
				return;
			}
		}
		
		// is this tile the correct type? -- REQUIRED?
		if( $this->m_matrix[$x][$y] != $typeID) {
			return;
		}
		
		// now make sure we now add this tile as a match (store reference)
		$res = array();
		$res['x'] = $x;
		$res['y'] = $y;
		$results[] = $res;
		
		// check above
		if( ( $y > 0) && 
			( $this->m_matrix[$x][$y-1] !== null) &&
			( $this->m_matrix[$x][$y-1] == $typeID)) {
			
			$this->__getLinkedTiles( $typeID, $x, $y - 1, $results);
		}
		
		// check below
		if( ( $y < (BOARD_HEIGHT - 1)) && 
			( $this->m_matrix[$x][$y+1] !== null) &&
			( $this->m_matrix[$x][$y+1] == $typeID)) {
			
			$this->__getLinkedTiles( $typeID, $x, $y + 1, $results);
		}
		
		// check left																			
		if( ( $x > 0) && 
			( $this->m_matrix[$x-1][$y] !== null) &&
			( $this->m_matrix[$x-1][$y] == $typeID)) {
			
			$this->__getLinkedTiles( $typeID, $x - 1, $y, $results);
		}
		
		// check right
		if( ( $x < (BOARD_WIDTH - 1)) && 
			( $this->m_matrix[$x+1][$y] !== null) &&
			( $this->m_matrix[$x+1][$y] == $typeID)) {
			
			$this->__getLinkedTiles( $typeID, $x + 1, $y, $results);
		}
	}


	private function selectionDestroy( $currentSelection) {
		
		// if there is no current selection, ignore
		if( count( $currentSelection) == 0) {
			return;
		}
		
		// remove all tiles in the selection
		for( $i = 0; $i < count( $currentSelection); $i++) {
			$x = $currentSelection[$i]['x'];
			$y = $currentSelection[$i]['y'];
			
			$this->m_matrix[$x][$y] = null;
		}
	}


	private function moveTiles( $currentSelection) {
		
		// if there is no current selection, ignore
		if( count( $currentSelection) < 2) {
			return;
		}
	
		// shift all tiles that are now hovering above an empty cell
		//foreach( $currentSelection AS $i2) {
		for( $i = 0; $i < count( $currentSelection); $i++) {
		
			$x = $currentSelection[$i]['x'];
			$y = $currentSelection[$i]['y'];
			
			// not top row
			if( $y > 0) {
			
				// move items above down a row
				$this->shiftColumnDown( $x, $y - 1, 1);
			}
			
			// the tricky bit - now we need to make sure that any selected
			// tiles (that are below this one) are referenced correctly.
			// fix all references to this column in selected tiles
			foreach( $currentSelection AS $key => $coord) {
			
				// 'fix' any stored references to tiles (the y may be wrong now)
				if( $coord['x'] == $x && 
					$coord['y'] <= $y &&
					$coord['y'] != BOARD_HEIGHT - 1) {
				
					$currentSelection[$key]['y']++;
				}
			}
		}
		
		// now check for blank columns - and shift later columns left
		$y = BOARD_HEIGHT - 1;

		for( $x = BOARD_WIDTH - 1; $x > 0; $x--) {
		
			while( $this->m_matrix[$x - 1][$y] === null && $this->m_matrix[$x][$y] !== null) {
			
				$this->shiftColumnLeft( $x);
			}
		}
	}



	private function shiftColumnDown( $x, $startingAtY, $numMoves) {
	
		// make sure we're not trying to shift out of the array!
		if( $startingAtY > ( BOARD_HEIGHT - 1 - $numMoves)) {
			return;
		}
	
		// sequentially shift each tile down by the number of moves requested
		for( $y = $startingAtY; $y >= 0; $y--) {
		
			$tile = $this->m_matrix[$x][$y];
			
			// move tile down
			$this->m_matrix[$x][$y + $numMoves] = $tile;
			$this->m_matrix[$x][$y] = null;
		}
	}



	private function shiftColumnLeft( $startingAtX) {
		
		// can't shift off the board!
		if( $startingAtX === 0) {
			return;
		}
		
		for( $x = $startingAtX; $x < BOARD_WIDTH; $x++) {
		
			for( $y = 0; $y < BOARD_HEIGHT; $y++) {
				
				$tile = $this->m_matrix[$x][$y];
				
				// move tile left
				$this->m_matrix[$x - 1][$y] = $tile;
				$this->m_matrix[$x][$y] = null;
			}
		}
	}
	

	
	private function isEmpty() {
	
		// check bottom left tile - if this is empty, the board must be empty
		if( $this->m_matrix[0][BOARD_HEIGHT - 1] === null) {
			return true;
		}
		
		return false;
	}
	
	
	
	private function hasFurtherMoves() {
		
		// if it's an empty board, can't be any further moves
		if( $this->isEmpty()) {
			return false;
		}
		
		// check horizontal pairs (starting at bottom left for efficiency since we're most likely to
		// find a match starting here due to how the tiles fall and slide left)
		for( $y = BOARD_HEIGHT - 1; $y >= 0; $y--) {
			
			for( $x = 0; $x < BOARD_WIDTH - 1; $x++) {
		
				$tileA = $this->m_matrix[$x][$y];
				$tileB = $this->m_matrix[$x+1][$y];
				
				// if this or the next tile is null, skip 
				if( $tileA === null || $tileB === null) {
					continue;
				}
				
				// if the two tiles are the same type, we can return true immediately
				if( $tileA === $tileB) {
					return true;
				}
			}
		}
		
		// check vertical pairs (starting bottom left)
		for( $x = 0; $x < BOARD_WIDTH; $x++) {
			
			for( $y = BOARD_HEIGHT - 1; $y > 0; $y--) {
				
				$tileA = $this->m_matrix[$x][$y];
				$tileB = $this->m_matrix[$x][$y-1];
				
				// if this or the next tile is null, we can break out of this loop since tiles
				// can't hover! 
				if( $tileA === null || $tileB === null) {
					break;
				}
				
				// if the two tiles are the same type, we can return true immediately
				if( $tileA === $tileB) {
					return true;
				}
			}
		}
		
		// nothing found - board is frozen!
		return false;
	}


	
	public function __debugDrawBoard() {
	
		// debug
		echo '<br /><table border="1">';
		for( $y = 0; $y < BOARD_HEIGHT; $y++) {
			for( $x = 0; $x < BOARD_WIDTH; $x++) {
			
				if( $x == 0) {
					echo '<tr>';
				}
				
				$num = $this->m_matrix[$x][$y];
				
				if( $num == 0) {
					$colour = 'blue';
				}
				else if( $num == 1) {
					$colour = 'red';
				}
				else if( $num == 2){
					$colour = 'green';
				}
				else if( $num == null){
					$colour = 'white';
				}
				
				echo '<td bgcolor="'.$colour.'"><div style="width: 5px; height: 5px;"></div></td>';
					
				if( $x == (BOARD_WIDTH - 1)) {
					echo '</tr>';
				}	
			}
		}
		echo '</table>';	
	}
}

?>