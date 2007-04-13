
/*
 * sjSpriteGraphic
 * 
 * This is a shared graphic resource which may be registered with multiple sprite objects
 * to allow the sharing of images. 
 */



/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function sjSpriteGraphic() {

	this.m_imageURL = null;
	this.m_image = null;
}



/**
 * Sets this sprite graphics image to the URL passed.
 * 
 * @param imageURL  URL of the image to set this shared graphic to
 * @return
 */
sjSpriteGraphic.prototype.load = function( imageURL) {

	// store image url
	this.m_imageURL = imageURL;	
	
	// kick off loading of the image.
	//
	// Note: this isn't the best way to do this, should probably have an onload handler
	// so we can signal to the user when a tileset load is complete but this is good
	// enough in most cases.
	this.m_image = new Image();
	this.m_image.src = imageURL;
}
