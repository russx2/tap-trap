
/*
 * sjBoard
 * 
 * Represents a game board. Takes care of its own board tiles and the positions in which
 * they occupy. Contains methods to allow manipulation of the tiles based on coordinates
 * including changing tile animation states.
 * 
 */



sjBoard.NUM_TILE_TYPES_SMALL = 3;
sjBoard.TILE_SPRITE_IDENTIFIER = 'tile';



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function sjBoard( screenID, boardWidth, boardHeight, tileWidth, tileHeight) {

	// member vars
	this.m_matrix = null;
	this.m_screenID = screenID;
	
	this.m_width = boardWidth;
	this.m_height = boardHeight;
	this.m_graphics = new Array(2);
	
	this.m_spriteWidth = tileWidth;
	this.m_spriteHeight = tileHeight;
	
	// cache for speed - stores currently 'selected' tiles
	this.m_currentSelection = null;
	
	// stores reference to all created sprite
	this.m_sprites = new Array();

	// move on to member initialisation
	this.initialise();
}



/**
 * Creates the necessary data structures for the board such as the tile matrix, sprite
 * graphic objects, etc.
 * 
 * @return
 */
sjBoard.prototype.initialise = function() {

	var x, y, typeCount;

	// initialise board matrix
	this.m_matrix = new Array( this.m_width);

	for( i = 0; i < this.m_width; i++) {
		this.m_matrix[i] = new Array( this.m_height);
	}
	
	// created shared sprite images
	this.m_graphics['fade'] = new sjSpriteGraphic();
	this.m_graphics['static'] = new Array();
	this.m_graphics['spin'] = new Array();
	
	for( i = 0; i < sjBoard.NUM_TILE_TYPES_SMALL; i++) {
		
		this.m_graphics['static'][i] = new sjSpriteGraphic();
		this.m_graphics['spin'][i] = new sjSpriteGraphic();
	}
	
	// load default tile set
	this.loadTileSet( SameJS.THEME_DEFAULT);

	// create tile objects
	typeCount = 0;
	
	for( x = 0; x < this.m_width; x++) {
		for( y = 0; y < this.m_height; y++) {

			// create tile sprite, passing it a unique ID (built from its x,y coordinates)
			sprite = new sjSprite( sjBoard.TILE_SPRITE_IDENTIFIER, (y * this.m_width) + x);
			sprite.setDimensions( this.m_spriteWidth, this.m_spriteHeight);
			
			// start off hidden
			sprite.hide();
			
			// allocate types evening to ensure identical distribution
			typeCount = (typeCount + 1) % sjBoard.NUM_TILE_TYPES_SMALL;
			sprite.setType( typeCount);
			
			// associate animations with the sprite by name
			sprite.registerGraphic( 'static', this.m_graphics['static'][sprite.m_type]);
			sprite.registerGraphic( 'spin', this.m_graphics['spin'][sprite.m_type]);
			sprite.registerGraphic( 'fade', this.m_graphics['fade']);
	
			// default to showing static graphic
			sprite.setGraphic( 'static');
			
			// add reference to storage for quick access later
			this.m_sprites[this.m_sprites.length] = sprite;
			
			// add to screen element
			document.getElementById( this.m_screenID).appendChild( sprite.returnElement());
		}
	}
}



/**
 * Loads a new tileset into the shared graphic objects before indicating to the sprites
 * themselves that they should refresh their image.
 * 
 * @param tileset  Name of the tileset to load
 * @return
 */
sjBoard.prototype.loadTileSet = function( tileset) {
	
	var tilePath = 'gfx/board/' + tileset + '/';

	// static tiles
	this.m_graphics['static'][0].load( tilePath + 'blue.gif');
	this.m_graphics['static'][1].load( tilePath + 'red.gif');
	this.m_graphics['static'][2].load( tilePath + 'green.gif');
		
	// spinning tiles
	this.m_graphics['spin'][0].load( tilePath + 'blue_spin.gif');
	this.m_graphics['spin'][1].load( tilePath + 'red_spin.gif');
	this.m_graphics['spin'][2].load( tilePath + 'green_spin.gif');
	
	// fade tile
	this.m_graphics['fade'].load( tilePath + 'fade.gif');
	
	// tell sprites to refresh themselves from their referenced shared sprite graphic
	for( i = 0; i < this.m_sprites.length; i++) {
			
		this.m_sprites[i].refresh();
	}
}



/**
 * Takes a board coordinate and determines whether or not it is included in the current
 * user selection of tiles.
 * 
 * @param x  X-coordinate to check
 * @param y  Y-coordinate to check
 * @return   True if the tile is within the selection, false otherwise
 */
sjBoard.prototype.isCurrentlySelected = function( x, y) {
	
	// get a ref to the tile at this location
	var tile = this.m_matrix[x][y];
	
	// if there's no tile at this location there's no need to continue
	if( tile == null) {
		return false;
	}
	
	// retrieve this tile's type
	var typeID = tile.m_type;
	
	// see if this tile is in the selection already
	if( this.m_currentSelection != null) {
		
		for( var i = 0; i < this.m_currentSelection.length; i++) {
			
			if( tile == this.m_currentSelection[i]['reference']) {
				return true;
			}
		}
	}
	
	// if we've got here, this tile isn't in the selection
	return false;
}



/**
 * Checks whether or not the board is empty (has no active tiles).
 * 
 * @return  True if the board is empty, false otherwise
 */
sjBoard.prototype.isEmpty = function() {
	
	// check bottom left tile - if this is null, the board must be empty
	if( this.m_matrix[0][this.m_height - 1] == null) {
		return true;
	}
	
	return false;
}



/**
 * Checks whether there are any further valid moves the player can initiate on the board.
 * 
 * @return  True if there are futher moves, false otherwise
 */
sjBoard.prototype.hasFurtherMoves = function() {
	
	var x, y, tileA, tileB;
	
	// if it's an empty board, can't be any further moves
	if( this.isEmpty()) {
		return false;
	}
	
	// check horizontal pairs (starting at bottom left for efficiency since we're most likely to
	// find a match starting here due to how the tiles fall and slide left)
	for( y = this.m_height - 1; y >= 0; y--) {
		
		for( x = 0; x < this.m_width - 1; x++) {
	
			tileA = this.m_matrix[x][y];
			tileB = this.m_matrix[x+1][y];
			
			// if this or the next tile is null, skip 
			if( tileA == null || tileB == null) {
				continue;
			}
			
			// if the two tiles are the same type, we can return true immediately
			if( tileA.m_type == tileB.m_type) {
				return true;
			}
		}
	}
	
	// check vertical pairs (starting bottom left)
	for( x = 0; x < this.m_width; x++) {
		
		for( y = this.m_height - 1; y > 0; y--) {
			
			tileA = this.m_matrix[x][y];
			tileB = this.m_matrix[x][y-1];
			
			// if this or the next tile is null, we can break out of this loop since tiles
			// can't hover! 
			if( tileA == null || tileB == null) {
				break;
			}
			
			// if the two tiles are the same type, we can return true immediately
			if( tileA.m_type == tileB.m_type) {
				return true;
			}
		}
	}
	
	// nothing found - board is frozen!
	return false;
}



/**
 * Checks whether the user is currenly selecting a group of tiles.
 * 
 * @return  True if there is a selection, false otherwise
 */
sjBoard.prototype.isSelection = function() {

	return this.m_currentSelection == null ? false : true;
}



/**
 * Checks whether there is a valid tile (board piece) at the coordinates passed in the
 * paramters.
 * 
 * @param x  The x-coordinate of the board location to check
 * @param y  The y-coordinate of the board location to check
 * @return   True if there is a tile at this location, false otherwise
 */
sjBoard.prototype.isTile = function( x, y) {

	return this.m_matrix[x][y] == null ? false : true;
}



/**
 * Takes a collection of linked tiles and 'activates' each by changing their graphic to 
 * the spin state. Records the selection internally for future manipulation.
 * 
 * @param linkedTiles  Array of objects representing each tile in the selection
 * @return
 */
sjBoard.prototype.selectionStart = function( linkedTiles) {

	// for each linked tile, animate
	for( i = 0; i < linkedTiles.length; i++) {
	
		if( linkedTiles[i]['reference'] instanceof sjSprite) {
			linkedTiles[i]['reference'].setGraphic( 'spin');
		}
	}

	// store this list of currently 'selected' tiles
	this.m_currentSelection = linkedTiles;
}



/**
 * Stops the current selection by destroying the internal selected list and resetting each
 * tiles graphic to the static state.
 * 
 * @return
 */
sjBoard.prototype.selectionStop = function() {

	// ignore if there is no current (valid) selection
	if( this.m_currentSelection == null) {
		return;
	}

	// turn off any currently animating tiles
	for( var i = 0; i < this.m_currentSelection.length; i++) {
		this.m_currentSelection[i]['reference'].setGraphic( 'static');
	}
	
	// wipe currently selected and clear last coordinates cache
	this.m_currentSelection = null;
	this.lastX = -1;
	this.lastY = -1;
}



/**
 * Returns the current selections calculated score.
 * TODO: This is really game logic and should be moved to sjGame.
 * 
 * @return  Calculated score for the current selection
 */
sjBoard.prototype.selectionScore = function() {
	
	var numTiles;
	
	// no selection? no score
	if( this.m_currentSelection == null) {
		return 0;
	}
	
	numTiles = this.m_currentSelection.length;
	
	// no score for 2 tiles or less
	if( numTiles < 3) {
		return 0;	
	}
	
	return (numTiles - 2) * (numTiles - 2);
}



/**
 * Sets each tile in the current selection to the graphical fade state.
 * 
 * @return
 */
sjBoard.prototype.selectionFade = function() {
	
	// if there is no current selection, ignore
	if( this.m_currentSelection == null) {
		return;
	}
	
	// set the current selection to a fade-and-die animation
	for( var i = 0; i < this.m_currentSelection.length; i++) {
		this.m_currentSelection[i]['reference'].setGraphic( 'fade');			
	}
}



/**
 * Removes references to the currently selected tiles from the board but does not destroy 
 * the tiles themselves.
 * 
 * @return
 */ 
sjBoard.prototype.selectionDetach = function() {
	
	var tileX, tileY;
	
	// if there is no current selection, ignore
	if( this.m_currentSelection == null) {
		return;
	}
	
	// we're simply removing the tiles from the board here,
	// actually destroying them takes place in method selectionDestroy
	for( var i = 0; i < this.m_currentSelection.length; i++) {
	
		tileX = this.m_currentSelection[i]['x'];
		tileY = this.m_currentSelection[i]['y'];
		
		this.m_matrix[tileX][tileY] = null;
	}
}



/**
 * Destroys each tile within the current selection.
 * 
 * @return
 */
sjBoard.prototype.selectionDestroy = function() {
	
	// if there is no current selection, ignore
	if( this.m_currentSelection == null) {
		return;
	}
	
	// TODO: This won't actually null and destroy the tile will it?
	for( var i = 0; i < this.m_currentSelection.length; i++) {
		
		this.m_currentSelection[i]['reference'].hide();
		this.m_currentSelection[i]['reference'] = null;
	}
	
	this.m_currentSelection = null;
}



/**
 * Moves the tiles to fill newly available spaces in the board (e.g. drop and
 * slide the tiles). Returns a list of vertical and horizontal movements
 * for each tile that is to be moved (used for animation purposes - this method
 * does actually move the tiles in terms of the internal grid matrix).
 * 
 * Note: This MUST be called before selectionDestroy (for obvious reasons!).
 * 
 * @return  Object representing each tile that has been moved, with the horizontal and 
 * 			vertical movements offsets necessary
 */ 
sjBoard.prototype.moveTiles = function() {

	// if there is no current selection, ignore
	if( this.m_currentSelection == null) {
		return;
	}
	
	// setup storage for results to be returned to the calling method. 
	var movedTiles = new Array();
	movedTiles['vertical'] = new Array();
	movedTiles['horizontal'] = new Array();
	
	// cache to avoid duplicates
	var movedTilesFound = new Array();
	movedTilesFound['vertical'] = new Array();
	movedTilesFound['horizontal'] = new Array();
	
	// now we need to move floating tiles down. 
	// TODO: This should probably be optimised.
	var x, y, tile, idx;
	
	// shift all tiles that are now hovering above an empty cell
	for( var i2 in this.m_currentSelection) {
	
		x = this.m_currentSelection[i2]['x'];
		y = this.m_currentSelection[i2]['y'];
		
		// not top row
		if( y > 0) {
		
			// move items above down a row
			var moved = this.shiftColumnDown( x, y - 1, 1);
			
			// for each tile found in this column shift down, check if we've
			// already found it and then either create or increment the y 
			// movement counter
			for( var i in moved) {
				
				tile = moved[i];
				idx = sjInArray( tile.m_id, movedTilesFound['vertical']);
				
				if( idx != - 1) {
					
					// simply increment our vert movement counter 
					movedTiles['vertical'][idx]['amount'] += this.m_spriteHeight;
				}
				else {
					
					// this tile hasn't been moved in this cycle so add it to
					// the movedTiles array
					idx = movedTiles['vertical'].length;
					
					movedTiles['vertical'][idx] = new Array();
					movedTiles['vertical'][idx]['reference'] = tile;
					movedTiles['vertical'][idx]['amount'] = this.m_spriteHeight;
					
					// mark that we've now setup this tiles movement already
					// (so any future changes in this loop will be increments)
					movedTilesFound['vertical'][movedTilesFound['vertical'].length] = tile.m_id;
				}
			}
			
			// the tricky bit - now we need to make sure that any selected
			// tiles (that are below this one) are referenced correctly.
			// fix all references to this column in selected tiles
			for( var e in this.m_currentSelection) {
			
				// 'fix' any stored references to tiles (the y may be wrong now)
				if( this.m_currentSelection[e]['x'] == x && 
					this.m_currentSelection[e]['y'] <= y &&
					this.m_currentSelection[e]['y'] != this.m_height - 1) {
				
					this.m_currentSelection[e]['y']++;
				}
			}
		}
	}
	
	// now check for blank columns - and shift later columns left
	y = this.m_height - 1;
	var moved;
	
	for( x = this.m_width - 1; x > 0; x--) {
	
		while( this.m_matrix[x - 1][y] == null && this.m_matrix[x][y] != null) {
		
			moved = this.shiftColumnLeft( x);
			
			// for each tile found in this column shift down, check if we've
			// already found it and then either create or increment the y 
			// movement counter
			for( var i in moved) {
				
				tile = moved[i];
				idx = sjInArray( tile.m_id, movedTilesFound['horizontal']);
				
				if( idx != - 1) {
					
					// simply increment our vert movement counter 
					movedTiles['horizontal'][idx]['amount'] += this.m_spriteWidth;
				}
				else {
					
					// this tile hasn't been moved in this cycle so add it to
					// the movedTiles array
					idx = movedTiles['horizontal'].length;
					
					movedTiles['horizontal'][idx] = new Array();
					movedTiles['horizontal'][idx]['reference'] = tile;
					movedTiles['horizontal'][idx]['amount'] = this.m_spriteWidth;
					
					// mark that we've now setup this tiles movement already
					// (so any future changes in this loop will be increments)
					movedTilesFound['horizontal'][movedTilesFound['horizontal'].length] = tile.m_id;
				}
			}
		}
	
	}
	
	// be sure to clear current selection finally
	//this.m_currentSelection = null;
	
	// return the tile array indicating which tiles need moving
	return movedTiles;
}



/**
 * Returns a list of all tiles that are linked to the tile at the passed x and y
 * coordinates. A tile is said to be linked if it is touching another tile of the same
 * type.
 * 
 * @param x  X-coordinate of the tile we wish to retrieve the linked tiles for
 * @param y  Y-coordinate of the tile we wish to retrieve the linked tiles for
 * @return   List of tiles that are linked to the tile passed
 */
sjBoard.prototype.getLinkedTiles = function( x, y) {

	var linkedTiles = new Array();
	var typeID = this.m_matrix[x][y].m_type;
	
	this.__getLinkedTiles( typeID, x, y, linkedTiles);
	
	return linkedTiles;
}



/**
 * Recursively builds a list of tiles that are linked to from the seed tile (passed) until
 * all possible paths are checked. The list is built and appended to by reference, rather
 * than returning.
 * 
 * @param typeID   Type of the tile we are starting the recursion from
 * @param x        X-coordinate of the tile to recurse from
 * @param y        Y-coordinate of the tile to recurse from
 * @param results  All linked tiles are added to this object (by reference) 
 */
sjBoard.prototype.__getLinkedTiles = function( typeID, x, y, results) {

	// check if we've visited this node before - if we have,
	// return immediately
	for( var i = 0; i < results.length; i++) {
	
		if( results[i]['reference'] == this.m_matrix[x][y]) {
			return;
		}
	}
	
	// is this tile the correct type? -- REQUIRED?
	if( this.m_matrix[x][y].m_type != typeID) {
		return;
	}
	
	// now make sure we now add this tile as a match (store reference)
	var res = new Array();
	res['reference'] = this.m_matrix[x][y];
	res['x'] = x;
	res['y'] = y;
	results.push( res);
	
	// check above
	if( ( y > 0) && 
		( this.m_matrix[x][y-1] != null) &&
		( this.m_matrix[x][y-1].m_type == typeID)) {
		
		this.__getLinkedTiles( typeID, x, y - 1, results);
	}
	
	// check below
	if( ( y < (this.m_height - 1)) && 
		( this.m_matrix[x][y+1] != null) &&
		( this.m_matrix[x][y+1].m_type == typeID)) {
		
		this.__getLinkedTiles( typeID, x, y + 1, results);
	}
	
	// check left
	if( ( x > 0) && 
		( this.m_matrix[x-1][y] != null) &&
		( this.m_matrix[x-1][y].m_type == typeID)) {
		
		this.__getLinkedTiles( typeID, x - 1, y, results);
	}
	
	// check right
	if( ( x < (this.m_width - 1)) && 
		( this.m_matrix[x+1][y] != null) &&
		( this.m_matrix[x+1][y].m_type == typeID)) {
		
		this.__getLinkedTiles( typeID, x + 1, y, results);
	}
}



/**
 * Moves a specified portion of a column of tiles down by a specified number of moves.
 * 
 * @param x            X-coordinate of the column we wish to move
 * @param startingAtY  Y-coordinate representing the top of the column we wish to move
 * @param numMoves     Number of spaces we wish to move the column downwards
 * @return             List of tiles moved
 */
sjBoard.prototype.shiftColumnDown = function( x, startingAtY, numMoves) {

	var tile, y;
	var movedTiles = new Array();
	
	// TODO FIXME: 
	// Although numMoves is currently only ever set to 1, this check needs
	// to be fixed. A numMoves set to 2 may fail, but possibly 1 move could be
	// achieved.
	
	// make sure we're not trying to shift out of the array!
	if( startingAtY > this.m_height - 1 - numMoves) {
		return;
	}

	// sequentially shift each tile down by the number of moves requested
	for( y = startingAtY; y >= 0; y--) {
	
		tile = this.m_matrix[x][y];
		
		// move tile down
		this.m_matrix[x][y + numMoves] = tile;
		this.m_matrix[x][y] = null;
		
		// update tile's position
		if( tile != null) {
		
			// store a reference to this tile
			movedTiles[movedTiles.length] = tile;
		}
	}
	
	return movedTiles;
}



/**
 * Moves an entire column left by one space.
 * 
 * @param startingAtX  X-coordinate for the column we wish to move
 * @return             List of tiles moved
 */
sjBoard.prototype.shiftColumnLeft = function( startingAtX) {

	// can't shift off the board!
	if( startingAtX == 0) {
		return;
	}
	
	var tile, x, y;
	var movedTiles = new Array();
	
	for( x = startingAtX; x < this.m_width; x++) {
	
		for( y = 0; y < this.m_height; y++) {
			
			tile = this.m_matrix[x][y];
			
			// move tile left
			this.m_matrix[x - 1][y] = tile;
			this.m_matrix[x][y] = null;
			
			// update tile's position
			if( tile != null) {
			
				// store a reference to this tile
				movedTiles[movedTiles.length] = tile;
			}
		}
	}
	
	return movedTiles;
}



/**
 * Hides ALL game tiles, regardless of state, from view.
 * 
 * @return
 */
sjBoard.prototype.hide = function() {
	
	for( i = 0; i < this.m_sprites.length; i++) {
		this.m_sprites[i].hide();
	}
}



/**
 * Returns all board tiles to their default position and then 'randomises' their
 * position based on the seed passed. Using this method, any given initial board
 * combination can be represented by a single seed.
 * 
 * @param seed  Seed to use for the board generation
 * @return
 */
sjBoard.prototype.randomise = function( seed) {

	var x, y, newX, newY, sprite, sprite2, tileID;
	
	// seed is optional
	if( seed) {
		Math.setSeed( seed);
	}
	
	// reset tiles to default positions
	for( x = 0; x < this.m_width; x++) {
		for( y = 0; y < this.m_height; y++) {

			// global tileID is based on its x,y coordinates
			tileID = (y * this.m_width) + x;
			
			// get a reference to the sprite by eval'ing its unique identifier
			sprite = eval( '__sprite_' + sjBoard.TILE_SPRITE_IDENTIFIER + '_' + tileID );
			
			// for aesthetics puposes we'll hide the tile before proceeding
			sprite.hide();
			
			// add this sprite to the correct place in the matrix
			this.m_matrix[x][y] = sprite;
			sprite.setPosition( (x * this.m_spriteWidth), (y * this.m_spriteHeight));
			
			sprite.setGraphic( 'static');
		}
	}
	
	// randomise tiles based on seed
	for( x =0; x < this.m_width; x++) {
		for( y = 0; y < this.m_height; y++) {
		
			// pick a random position to swop with this tile
			newX = Math.getRandom( this.m_width) - 1;
			newY = Math.getRandom( this.m_height) - 1;

			// grab references to the two tiles we're swopping
			sprite = this.m_matrix[x][y];
			sprite2 = this.m_matrix[newX][newY]
			
			// swop the tiles within the matrix
			this.m_matrix[x][y] = sprite2;
			this.m_matrix[newX][newY] = sprite;
			
			// swop the tiles actual (graphical) positions
			sprite.setPosition( (newX * this.m_spriteWidth), (newY * this.m_spriteHeight));		
			sprite2.setPosition( (x * this.m_spriteWidth), (y * this.m_spriteHeight));	
		}
	}
	
	// finally, show the tiles again
	for( x =0; x < this.m_width; x++) {
		for( y = 0; y < this.m_height; y++) {
			this.m_matrix[x][y].show();		
		}
	}
	
	return true;
}
