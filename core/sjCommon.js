
/*
 * sjCommon
 * 
 * Shared miscellaneous utility functions used throughout the project.
 * 
 */



/*
 * Provide dummy console overrides for when executing without Firebug console object
 */
if( typeof console == 'undefined' || ( typeof console != 'undefined' && typeof console.debug == 'undefined')) {
	
	console = {
		log: function() { },
		debug: function() { },
		info: function() { },
		warn: function() { },
		error: function() { }
	};
}



/**
 * Object to represent a 2D cartesian point.
 * 
 * @param x  X-coordinate of this point
 * @param y  Y-coordinate of this point 
 * @constructor
 */
function sjPoint( x, y) {
	this.x = x;
	this.y = y;
}



/**
 * Extracts the X-coordinate from an event object.
 * 
 * @param e  Event object
 * @return   X-coordinate
 */
function sjGetClickX( e) {
	return e.layerX ? e.layerX : e.offsetX;
}



/**
 * Extracts the Y-coordinate from an event object.
 * 
 * @param e  Event object
 * @return   Y-coordinate
 */
function sjGetClickY( e) {
	return e.layerY ? e.layerY : e.offsetY;
}



/**
 * Returns a simulation of a mouse click event in terms of the event object. Useful for
 * sending 'fake' mouse clicks to methods.
 * 
 * @param x  X-coordinate of the click to simulate
 * @param y  Y-coordinate of the click to simulate
 * @return
 */
function sjMakeClickEvent( x, y) {
	
	var obj = new Object();
	obj.layerX = x;
	obj.layerY = y;
	
	return obj;
}


/**
 * Converts a value into a boolean and returns only true or false.
 * 
 * @param x  The value to check the boolean status of
 * @return   True if input equates to true, false otherwise
 */
function sjToBool( x) {
	
	return x == true ? true : false;
}



/**
 * Shows the HTML element with the specified identifier.
 * 
 * @param id  Element identifier
 * @return
 */
function sjShowElement( id) {
	document.getElementById( id).style.display = 'block';
}



/**
 * Hides the HTML element with the specified identifier.
 * 
 * @param id  Element identifier
 * @return
 */
function sjHideElement( id) {
	document.getElementById( id).style.display = 'none';
}



/**
 * Sets an HTML element, with the specified identifier, to the value passed.
 * 
 * @param id    Element identifier
 * @param text  Value to set the element to
 * @return
 */
function sjSetHTML( id, text) {
	document.getElementById( id).innerHTML = text;
}



/**
 * Returns an HTML elements content with the specified identifier.
 * 
 * @param id  Element identifier
 * @return    Value of the elements content
 */
function sjGetHTML( id) {
	return document.getElementById( id).innerHTML;
}



/**
 * Sets the content of an HTML element, with the matching id, to the requested value.
 * 
 * @param id     Identifier for the HTML element
 * @param value  Value to set the elements content to
 * @return
 */
function sjSetHTMLInput( id, value) {
	document.getElementById( id).value = value; 
}



/**
 * Retrurns the value of an HTML input element with the matching id
 * 
 * @param id     Identifier for the HTML element
 * @return
 */
function sjGetHTMLInput( id) {
	return document.getElementById( id).value;
}



/**
 * Removes preceeding and ending whitespace from a string and returns the result.
 * 
 * @param str  String to remove the whitespace from
 * @return     Input with whitespace removed
 */
function sjTrim( str) {

   return str.replace( /^\s*|\s*$/g, '');
}



/**
 * Utility to find an object in an array and return it. Not prototype'd so as to avoid 
 * problems with foreach loops.
 * 
 * @param needle    Value to look for
 * @param haystack  Array to look in
 * @return          Returns the array key we've matched if found, otherwise -1
 */
function sjInArray( needle, haystack) {

	for( var e in haystack) {
	
		if( haystack[e] == needle ) {
		
			return e;
		}
	}
	
	// no match
	return -1;
} 



/**
 * Returns the ordinal (i.e. st, nd, rd, etc.) for the passed number.
 * 
 * @param num  The number to calculate the ordinal for
 */
function sjGetOrdinal( num) {
	
	var suffix = '';
	
    if( ( num % 100) > 10 && ( num % 100) < 14) {
    
        suffix = 'th';
    }
  
    else {
    	
        switch( num % 10) {

            case 0:
                suffix = 'th';
                break;

            case 1:
                suffix = 'st';
                break;

            case 2:
                suffix = 'nd';
                break;

            case 3:
                suffix = 'rd';
                break;

            default:
                suffix = 'th';
                break;
        }
	}

    return suffix;
}



/**
 * Utility method to add bookmark to the player's browser, using the passed title and url
 * 
 * @param url    URL of the bookmark to be added
 * @param title  Title of the bookmark to be added
 * @return
 */
function sjAddBookmark( url, title) {
	
	// mozilla
	if( window.sidebar) { 
		
		window.sidebar.addPanel( title, url, '');
	}
	
	// ie
	else if( document.all) {
		
		window.external.AddFavorite( url, title);
	} 
	
	// is this necessary?
	else if( window.opera && window.print ) {
		return true;
	}
}



/**
 * Creates a new HTTP object, taking into account browser compatibility issues.
 * Always sets the mime type to xml.
 * 
 * @return  Instantiated Http object
 */
function sjCreateHTTPObject() {
	
	var HTTPObject = null;

	// w3c
	if( window.XMLHttpRequest) { 
	
		HTTPObject = new XMLHttpRequest();
		
		if( HTTPObject.overrideMimeType) {
			HTTPObject.overrideMimeType( 'text/xml');
		}
	} 
	
	// ie
	else if( window.ActiveXObject) {

		try {
			HTTPObject = new ActiveXObject( 'Msxml2.XMLHTTP');
			
		} catch( e) {
			try {
				HTTPObject = new ActiveXObject( 'Microsoft.XMLHTTP');
				
			} catch( e) {}
		}
	}
	
	return HTTPObject;
}



/**
 * Builds and initiates an XMLHttpRequest from the parameters passed. This supports both
 * GET and POST request types as well as unlimited parameters to either. A callback method
 * may be passed.
 * 
 * @param url
 * @param params    Array object representing each parameter. Each index has a 'key' and
 *                  'value' property.
 * @param type      Type of the request. May only be 'get' or 'post'.
 * @param callback  Function to callback upon receiving data from the request
 * @return          HTTPObject on success, false otherwise
 */
function sjSendHTTPRequest( url, params, type, callback) {
	
	var HTTPObject;
	var reqURL;
	var reqType;
	var reqParams = '';
	var reqData = null;
	var reqCallback;
	
	// encode parameters (if there are any). Same for post and get
	if( params && params.length > 0) {
		
		for( i = 0; i < params.length; i++) {
			
			// construct key=value pair being sure to URL encode the value
			reqParams += params[i].key + '=' + encodeURIComponent( params[i].value);
			
			// we're always appending a forced timestamp param after building this string
			// so we don't need to worry about this being the last one when appending
			// the ampersand
			reqParams += '&';
		}
	}
	
	// supposedly certain versions of IE have a caching issue with requests
	// (even post) if no vars are sent, so here we're including the current timestamp
	// as a forced extra var
	var d = new Date();
	var t = d.getTime();
		
	reqParams += 'tstamp' + t + '=' + t;
	
	// GET - Parameters are passed directly through the URL
	if( type == 'get') {
		
		reqType = 'GET';
		reqURL = url + '?' + reqParams;
		reqData = null;
	}	
	
	// POST
	else {
		
		reqType = 'POST';
		reqURL = url;
		reqData = reqParams;
	}
	
	// callback (if its null, we set it to our dummy callback method to prevent issues with
	// IE).
	reqCallback = callback ? callback : __sjSendHTTPRequestCallback;
	
	// build the request object
	HTTPObject = sjCreateHTTPObject();
	HTTPObject.onreadystatechange = reqCallback;
	HTTPObject.open( reqType, reqURL, true);	
	
	// POST - We need to send the correct header so the server treats the input as standard
	// submitted post data
	if( type == 'post') {
		
		// TODO: Opera 8 doesn't seem to support setRequestHeader (and hence POST).
		HTTPObject.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		HTTPObject.setRequestHeader('Content-length', reqData.length);
	}
	
	// finally we can kick off the request
	try {
		HTTPObject.send( reqData);
		
	} catch( e) {
		return false;
	}

	return HTTPObject;
}



/**
 * Dummy handler for HTTP requests where we've chosen to ignore any results returned. This
 * is primarily for IE as it can fail when onreadystatechange is set to null.
 * 
 * @return
 */
function __sjSendHTTPRequestCallback() {
	
	
}



/*
 * These 3 parameters for the linear congruental generator are taken from Paul Houle's
 * http://www.honeylocust.com/javascript/randomizer.html
 */
Math.sjParamA = 9301;
Math.sjParamB = 49297;
Math.sjParamC = 233280.0;

Math.sjSeed = 0;



/**
 * Sets the seed to be used for all future random number requests. 
 * Math object extension.
 * 
 * @param seed  Seed value to set the generator to
 * @return
 */
Math.setSeed = function( seed) {
	
	// if null is passed we'll use the current time as a seed
	if( seed == null) {
		now = new Date();
		Math.sjSeed = now.getTime();
	}
	else {
		Math.sjSeed = seed;
	}
}



/**
 * Generates the next random seed based on the current using the parameters defined above.
 *
 * @return
 */
Math.nextSeed = function() {
	
	Math.sjSeed = ( ( Math.sjSeed * Math.sjParamA) + Math.sjParamB) % Math.sjParamC;
}



/**
 * Retrieves the next pseudo-random number from the generator.
 * 
 * @param max  Maxiumum value to return
 * @return     Pseudo-random number between 0 and max
 */
Math.getRandom = function( max) {
	
	Math.nextSeed();
	
	return Math.ceil( ( ( Math.sjSeed / Math.sjParamC)) * max);
}
