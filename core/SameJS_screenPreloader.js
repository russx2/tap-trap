
/*
 * SameJS_screenPreloader
 * 
 * Used to initially preload all graphic resources before the game begins. Displays a very
 * rough percentage loaded based on total graphics / num loaded.
 * 
 */
 
 
 
/**
 * Defines the data members only and initialises them to basic defaults.
 * 
 * @constructor
 */
function SameJS_screenPreloader( screenID) {

	this.m_screenID = screenID;
	
	// keeping track of resources
	this.m_resources = null;
	this.m_resourcesTotal = 0;
	this.m_resourcesLoaded = 0;
	
	// loading completed callback
	this.m_loadedCallback = null;

	// store a reference to ourselves
	SameJS_screenPreloader.m_instance = this;
	
	// move on to initialisation
	this.initialise();
}



/**
 * Creates necessary data structures and sets values to a safe default.
 * 
 * @return
 */
SameJS_screenPreloader.prototype.initialise = function() {
	
	// array of images which we will preload
	this.m_resources = new Array();
}



/**
 * Shows the screen to the player
 * 
 * @return
 */
SameJS_screenPreloader.prototype.open = function() {
		
	// show this screen
	sjShowElement( this.m_screenID);
}



/**
 * Removes the screen from the players view.
 * 
 * @return
 */
SameJS_screenPreloader.prototype.close = function() {
	
	// hide this screen
	sjHideElement( this.m_screenID);
}



/**
 * Shows the loading screen to the player.
 *
 * @param path       Path (url) to prepend to each resource
 * @param resources  Object array of resouces to load
 * @param message    Text to display during the preload
 * @param callback   Method to callback once the preloading is complete
 * @return
 */
SameJS_screenPreloader.prototype.loadResources = function( path, resources, message, callback) {
	
	var i;
	
	// reset internal resource counters
	this.m_resourcesTotal = resources.length;
	this.m_resourcesLoaded = 0;
	
	// store callback
	this.m_loadedCallback = callback;
	
	// set message on the screen
	sjSetHTML( this.m_screenID + '_message', message);
	
	// set initial preload percentage
	sjSetHTML( this.m_screenID + '_percentage', '0%');
	
	// start the loading of each image
	for( i = 0; i < this.m_resourcesTotal; i++) {
	
		this.m_resources[i] = new Image();
		this.m_resources[i].onload = SameJS_screenPreloader.m_instance.__loadResourceCallback;
		this.m_resources[i].src = path + resources[i];
	}
}



/**
 * Callback for each resource as its loading completes. Updates the percentage loaded
 * display. If loading has completed, frees resources and calls the callback method.
 */
SameJS_screenPreloader.prototype.__loadResourceCallback = function() {
	
	var me = SameJS_screenPreloader.m_instance;
	var base = SameJS.m_instance;
	var percentage;
	
	// mark this resource as loaded
	me.m_resourcesLoaded++;
	
	// calculate new percentage loaded
	percentage = Math.round( ( 100 / me.m_resourcesTotal) * me.m_resourcesLoaded);
	
	// set message on the screen
	sjSetHTML( me.m_screenID + '_percentage', percentage + '%');
	
	// if this is the last resource, close ourselves
	if( me.m_resourcesLoaded == me.m_resourcesTotal) {
		
		// free resources
		this.m_resources = null;
		
		// completed loading callback
		me.m_loadedCallback();
	}
}

