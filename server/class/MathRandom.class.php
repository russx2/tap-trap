<?php	

class sjMathRandom {
	
	/*
	 * These 3 parameters for the linear congruental generator are taken from Paul Houle's
	 * http://www.honeylocust.com/javascript/randomizer.html
	 */
	const PARAM_A = 9301;
	const PARAM_B = 49297;
	const PARAM_C = 233280;
	
	private static $m_seed = 0;
	
	private static $m_hasGMP = false;
	private static $m_hasBCMath = false;
	
	
	public static function setSeed( $seed) {
		
		sjMathRandom::$m_seed = $seed;
		
		// detect which math libraries are available
		sjMathRandom::$m_hasGMP = function_exists( 'gmp_add');
		sjMathRandom::$m_hasBCMath = function_exists( 'bcadd');
	}
	
	private static function nextSeed() {
		
		// GMP available
		if( sjMathRandom::$m_hasGMP) {
			
			sjMathRandom::$m_seed = (int)gmp_mod( gmp_add( gmp_mul( 
				sjMathRandom::$m_seed, sjMathRandom::PARAM_A), sjMathRandom::PARAM_B), sjMathRandom::PARAM_C);
		}
		
		// BCMath available (fallback)
		else if( sjMathRandom::$m_hasBCMath) {
			
			sjMathRandom::$m_seed = (int)bcmod( bcadd( bcmul( 
				sjMathRandom::$m_seed, sjMathRandom::PARAM_A), sjMathRandom::PARAM_B), sjMathRandom::PARAM_C);
		}
		
		else {
			die( 'sjMathRandom: no suported math library available');
		}
	}
	
	public static function getRandom( $max) {
		
		sjMathRandom::nextSeed();
		
		return ceil( (sjMathRandom::$m_seed / (sjMathRandom::PARAM_C)) * $max);
	}
}

?>