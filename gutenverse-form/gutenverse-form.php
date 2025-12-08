<?php
/**
 * Plugin Name: Gutenverse Form
 * Description: Powerful and intuitive form builder plugin designed to streamline the process of creating and managing forms on your WordPress website.
 * Plugin URI: https://gutenverse.com/
 * Author: Jegstudio
 * Version: 2.3.2
 * Author URI: https://jegtheme.com/
 * License: GPLv3
 * Text Domain: gutenverse-form
 *
 * @package gutenverse-form
 */

use Gutenverse_Form\Init;

defined( 'GUTENVERSE_FORM' ) || define( 'GUTENVERSE_FORM', 'gutenverse-form' );
defined( 'GUTENVERSE_FORM_VERSION' ) || define( 'GUTENVERSE_FORM_VERSION', '2.3.2' );
defined( 'GUTENVERSE_FORM_NOTICE_VERSION' ) || define( 'GUTENVERSE_FORM_NOTICE_VERSION', '1.0.0' );
defined( 'GUTENVERSE_FORM_NAME' ) || define( 'GUTENVERSE_FORM_NAME', 'Gutenverse Form' );
defined( 'GUTENVERSE_FORM_URL' ) || define( 'GUTENVERSE_FORM_URL', plugins_url( GUTENVERSE_FORM ) );
defined( 'GUTENVERSE_FORM_PLUGIN_URL' ) || define( 'GUTENVERSE_FORM_PLUGIN_URL', plugins_url( GUTENVERSE_FORM ) );
defined( 'GUTENVERSE_FORM_FILE' ) || define( 'GUTENVERSE_FORM_FILE', __FILE__ );
defined( 'GUTENVERSE_FORM_DIR' ) || define( 'GUTENVERSE_FORM_DIR', plugin_dir_path( __FILE__ ) );
defined( 'GUTENVERSE_FORM_CLASS_DIR' ) || define( 'GUTENVERSE_FORM_CLASS_DIR', GUTENVERSE_FORM_DIR . 'includes/' );
defined( 'GUTENVERSE_FORM_LANG_DIR' ) || define( 'GUTENVERSE_FORM_LANG_DIR', GUTENVERSE_FORM_DIR . 'languages' );
defined( 'GUTENVERSE_FORM_PATH' ) || define( 'GUTENVERSE_FORM_PATH', plugin_basename( __FILE__ ) );
defined( 'GUTENVERSE_FORM_LIBRARY_URL' ) || define( 'GUTENVERSE_FORM_LIBRARY_URL', 'https://gutenverse.com/' );

// This constant has been deprecated as of Gutenverse Core v1.0.6 and Gutenverse Form v1.0.5.
// Use GUTENVERSE_FRAMEWORK_URL_PATH instead.
defined( 'GUTENVERSE_FRAMEWORK_URL' ) || define( 'GUTENVERSE_FRAMEWORK_URL', plugins_url( GUTENVERSE_FORM ) . '/lib/framework' );

// Required Pro Version.
defined( 'GUTENVERSE_FORM_REQUIRED_PRO_VERSION' ) || define( 'GUTENVERSE_FORM_REQUIRED_PRO_VERSION', '2.0.0' );

require_once GUTENVERSE_FORM_DIR . 'lib/autoload.php';

Init::instance();
