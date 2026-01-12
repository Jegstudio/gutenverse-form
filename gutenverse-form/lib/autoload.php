<?php
/**
 * Autoload Functionality
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form
 */

if ( defined( 'WP_CLI' ) && WP_CLI && ! defined( 'GUTENVERSE_FRAMEWORK_URL_PATH' ) ) {
	// wp-cli fix (framework doesnt load properly)
	define( 'GUTENVERSE_FRAMEWORK_URL_PATH', plugins_url( GUTENVERSE_FORM ) . '/lib/framework' );
	require_once GUTENVERSE_FORM_DIR . 'lib/framework/bootstrap.php';
}

spl_autoload_register(
	function( $class ) {
		$prefix   = 'Gutenverse_Form\\';
		$base_dir = GUTENVERSE_FORM_CLASS_DIR;
		$len      = strlen( $prefix );

		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}

		$relative_class = substr( $class, $len );

		$class_path     = explode( '\\', $relative_class );
		$relative_class = array_pop( $class_path );
		$class_path     = strtolower( implode( '/', $class_path ) );

		$class_name = 'class-' . $relative_class . '.php';
		$class_name = str_replace( '_', '-', $class_name );
		$file       = rtrim( $base_dir, '/' ) . '/' . $class_path . '/' . strtolower( $class_name );

		if ( is_link( $file ) ) {
			$file = readlink( $file );
		}

		if ( is_file( $file ) ) {
			require $file;
		}
	}
);
