
/*
 * sjDataStore
 *
 * An object to allow storage of an arbitary amount of values within a single cookie.
 * 
 * This object handles the getting and setting of key -> value pairs so that the data
 * store is transparent to the caller.
 *
 */



// random strings to prevent conflict
sjDataStore.SEPARATOR = '3xz0y';
sjDataStore.ASSIGNMENT = '9lcfd';
sjDataStore.SEMICOLON_REPLACEMENT = '4kjwb';

sjDataStore.EXPIRES_DAYS = 730;



/**
 * Sets up the data storage object.
 * 
 * @param identifier  This data store will use as its identifier (cookie key)
 * @param domain      Domain (or part thereof) used to set the cookie
 * @constructor
 */
function sjDataStore( identifier, domain) {
	
	this.m_identifier = identifier;
	this.m_domain = domain;
	this.m_values = null;
	
	this.__load();
}



/**
 * Retrieves a value from the store.
 * 
 * @param key  The values key within the store
 * @return     The keys value (if it exists), otherwise null
 */
sjDataStore.prototype.get = function( key) {
	
	return this.m_values[key] ? this.m_values[key] : null;
}



/**
 * Stores a value under the given key. If the key already exists, the value is
 * overwritten.
 * 
 * @param key    The key that this value is to be stored under
 * @param value  The value to be stored  
 * @return
 */
sjDataStore.prototype.set = function( key, value) {
	
	this.m_values[key] = value;
	
	// automatically save out the updated cookie to avoid any data loss
	this.__save();
}



/**
 * Loads all values and their keys from this data store into the object.
 * 
 * @return
 */
sjDataStore.prototype.__load = function() {
	
	var cookies = document.cookie.split( ';');
	var cookie;
	var data = '';
	var pairs;
	
	// initially clear current data store
	this.m_values = new Array();

	// locate the cookie for this store
	for( i in cookies) {
		
		cookie = cookies[i];
		
		// see if this is the cookie we're looking for
		matchIndex = cookie.indexOf( this.m_identifier + '=');
		
		if( matchIndex !== -1) {
			
			// found cookie - extract the data (foundIndex + key length + 1 for '=')
			data = cookie.substring( matchIndex + this.m_identifier.length + 1, cookie.length);
		}
	}
	
	// at this point we have a string with key=value pairs, with defined separator
	pairs = data.split( sjDataStore.SEPARATOR);
	
	for( i in pairs) {
		
		pair = pairs[i];
		assignmentIndex = pair.indexOf( sjDataStore.ASSIGNMENT);
		
		key = pair.substring( 0, assignmentIndex);
		value = pair.substring( assignmentIndex + sjDataStore.ASSIGNMENT.length, pair.length);
		
		// replace random sequence with semi-colon
		value = value.replace( new RegExp( sjDataStore.SEMICOLON_REPLACEMENT, "g"), ';');
		
		// finally load value - the utf8 data is encoded, so we need to decode it first
		this.m_values[key] = decodeURIComponent( value);
	}
}	



/**
 * Saves all values and keys, overwriting any existing values.
 * 
 * @return
 */
sjDataStore.prototype.__save = function() {
	
	var expiry = new Date;
	var values = '';
	var cookie = '';
	var domain = this.m_domain;
	var value;
	
	// calculate and construct expiry date for cookie
	expiry.setTime( expiry.getTime() + (1000 * 60 * 60 * 24 * sjDataStore.EXPIRES_DAYS));
	
	// implode values into a correctly formatted string
	for( i in this.m_values) {
		
		if( i) {
			
			value = this.m_values[i];
			
			// replace special semi-colon separator with random sequence
			if( typeof value == 'string') {
				
				value = value.replace( new RegExp( ';', "g"), sjDataStore.SEMICOLON_REPLACEMENT);
			}
			
			// if there are previous values, we need a separator
			if( values != '') {
				values += sjDataStore.SEPARATOR;
			}
			
			// ensure we encode the utf8 data to avoid mangling in the latin-compatible
			// cookie (encodeURIComponent represents utf8 bytes in a hex format)
			value = encodeURIComponent( value);
			
			values += i + sjDataStore.ASSIGNMENT + value;
		}
	}
	
	// construct cookie string
	cookie = this.m_identifier + '=' + values + '; expires=' + expiry.toGMTString() + '; path=/; domain=' + domain;
	
	// overwrite existing cookie / set new
	document.cookie = cookie;
}
