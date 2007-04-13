
/*
 * sjSprite
 * 
 * Represents an individual sprite object. A sprite may have position, velocity and graphic
 * properites associated with it. Sprites have shared graphic objects (sjSpriteGraphic)
 * registered which are used to provide images for the sprite.
 * 
 */



/**
 * Defines the data members only and initialises them to basic defaults. The idName and 
 * idNum are combined to make a unique identifier for this sprite globally accessible. 
 * e.g. __sprite_tile_10 could be the variable to access this sprite globally.
 * 
 * @constructor
 */
function sjSprite( idName, idNum) {

	// store this sprite's identifier
	this.m_id = idNum;
	this.m_identifier =  '__sprite_' + idName + '_' + idNum;
	eval( this.m_identifier + ' = this');
	
	// type of sprite
	this.m_type = 0;

	// img element
	this.m_element = null;

	// position
	this.m_x = 0;
	this.m_y = 0;
	
	// dimensions
	this.m_width = 0;
	this.m_height = 0;
	
	// movement targets
	this.m_tx = -1;
	this.m_ty = -1;
	
	this.m_currentMovementIntervalID = null;
	this.m_currentMovementRate = 0;
	this.m_currentMovementAcceleration = 0;
	this.m_currentMovementCompletionCallbackVert = null;
	this.m_currentMovementCompletionCallbackHorz = null;

	// loaded graphicsa
	this.m_graphics = new Array();
	this.m_currentGraphic = null;

	// move on to member initialisation
	this.initialise();
}



/**
 * Creates the necessary data structure for the sprite (img object).
 * 
 * @return
 */
sjSprite.prototype.initialise = function() {

	// create image element
	this.m_element = document.createElement( 'img');
	this.m_element.controller = this;
	this.m_element.style.position = 'absolute';
}



/**
 * Allows the sprite to have a 'type' - a value that may be compared to tell if any two
 * given sprites are of the same type.
 * 
 * @param type  Value representings this sprites type
 * @return
 */
sjSprite.prototype.setType = function( type) {
	
	this.m_type = type;
}



/**
 * Sets the width of this sprite (this has no effect on any graphic sizesused).
 * 
 * @param width  Width to set this sprite to
 * @return
 */
sjSprite.prototype.setWidth = function( width) {

	this.m_width = width;
}



/**
 * Sets the height of this sprite (this has no effect on any graphic sizes used).
 * 
 * @param height  Height to set this sprite to
 * @return
 */
sjSprite.prototype.setHeight = function( height) {

	this.m_height = height;
}



/**
 * Sets both dimensions of this sprite (this has no effect on any graphic sizes used).
 * 
 * @param width   Width to set this sprite to
 * @param height  Height to set this sprite to
 * @return
 */
sjSprite.prototype.setDimensions = function( width, height) {

	this.setWidth( width);
	this.setHeight( height);
}



/**
 * Sets the opacity value of this sprite (this modifies how the sprite graphic is displayed).
 * 
 * @param opacity  Value for opacity (0 - 1.0)
 * @return
 */
sjSprite.prototype.setOpacity = function( opacity) {
	
	// TODO: This will not work in IE currently
	this.m_element.style.opacity = opacity;
}



/**
 * Moves the sprite to the passed coordinates.
 * 
 * @param x  X-coordinate to move this sprite to
 * @param y  Y-coordinate to move this sprite to
 * @return
 */
sjSprite.prototype.setPosition = function( x, y) {

	this.m_x = x;
	this.m_y = y;

	// update actual style display properties
	this.m_element.style.left = Math.ceil( x) + 'px';
	this.m_element.style.top = Math.ceil( y) + 'px';
}



/**
 * Sets up the initial parameters for this sprite to slide vertically by a given amount.
 * An initial speed and acceleration can be set.
 * 
 * @param amount        Distance to move
 * @param initialRate   Initial speed to begin this slide at
 * @param acceleration  Amount to accelerate by each move
 * @return
 */
sjSprite.prototype.setupSlideVertical = function( amount, initialRate, acceleration) {

	this.m_ty = this.m_y + amount;
	this.m_tx = -1;
	
	this.m_currentMovementRate = initialRate;
	this.m_currentMovementAcceleration = acceleration
}



/**
 * Sets up the initial parameters for this sprite to slide horizontally by a given amount.
 * An initial speed and acceleration can be set.
 * 
 * @param amount        Distance to move
 * @param initialRate   Initial speed to begin this slide at
 * @param acceleration  Amount to accelerate by each move
 * @return
 */
sjSprite.prototype.setupSlideHorizontal = function( amount, initialRate, acceleration) {

	this.m_tx = this.m_x - amount;
	this.m_ty = -1;
	
	this.m_currentMovementRate = initialRate;
	this.m_currentMovementAcceleration = acceleration
}



/**
 * Performs the next movement for this sprite which it is currently performing (via a 
 * previous call to one of the setupSlide* methods). The call will be ignored if there are
 * no movements left to make).
 * 
 * @return  True if this call completes the movement, false otherwise
 */
sjSprite.prototype.doMovement = function() {
	
	var completedAnimation = false;
	var moveToY;
	var moveToX;
	
	// increase the current movement rate based on the acceleration
	this.m_currentMovementRate += this.m_currentMovementAcceleration;
	
	// is this vertical movement?
	if( this.m_ty != -1) {

		// position this move will take the sprite to
		moveToY = this.m_y + this.m_currentMovementRate;

		// check we're not overshooting the target position
		if( this.m_ty <= moveToY) {
		
			// this call has completed the movement (and possibly gone over) so set the
			// last position to the target and flag this move as complete
			moveToY = this.m_ty;
			completedAnimation = true;
		}
	
		this.setPosition( this.m_x, moveToY);
	}
	
	// horizontal movement?
	else if( this.m_tx != -1) {
		
		// position this move will take the sprite to
		moveToX = this.m_x - this.m_currentMovementRate;
		
		// check we're not overshooting the target position
		if( this.m_tx >= moveToX) {
	
			// this call has completed the movement (and possibly gone over) so set the
			// last position to the target and flag this move as complete
			moveToX = this.m_tx;
			completedAnimation = true;
		}
	
		this.setPosition( moveToX, this.m_y);
	}
	
	if( completedAnimation === true) {
		
		// reset target coordinates
		this.m_tx = -1;
		this.m_ty = -1;
	}

	return completedAnimation;
}



/**
 * Adds a shared graphic object to this sprites library of graphics (under a specified
 * key).
 * 
 * @param name     Name to associate with this graphic
 * @param graphic  Shared graphic object to register
 * @return
 * @see            sjSpriteGraphic
 */
sjSprite.prototype.registerGraphic = function( name, graphic) {

	this.m_graphics[name] = graphic;
}



/**
 * Sets the current graphic that is drawn for this sprite to a previously registered
 * graphic resource.
 * 
 * @param name  Key that is associated with the graphic to set
 * @return
 */
sjSprite.prototype.setGraphic = function( name) {

	// store current graphic reference to allow quick refreshes later on
	this.m_currentGraphic = this.m_graphics[name];
	
	// update display with new graphic
	this.refresh();
}



/**
 * Reloads the currently displayed graphic from the currently set shared sprite graphic.
 * Useful if the shared graphic object itself has changed its image source.
 * 
 * @return
 */
sjSprite.prototype.refresh = function() {
	
	this.m_element.src = this.m_currentGraphic.m_imageURL;
}



/**
 * Returns the element currently associated with this sprite.
 * 
 * @return  This sprites graphic element
 */
sjSprite.prototype.returnElement = function() {

	return this.m_element;
}



/**
 * Shows this sprite onscreen.
 * 
 * @return
 */
sjSprite.prototype.show = function() {
	
	this.m_element.style.display = 'block';
}



/**
 * Hides this sprite from the screen.
 * 
 * @return
 */
sjSprite.prototype.hide = function() {
	
	this.m_element.style.display = 'none';
}
