<?php
/**
 * Gutenverse Form Main class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Init
 *
 * @package gutenverse-form
 */
class Init {
	/**
	 * Instance of Init.
	 *
	 * @var Init
	 */
	private static $instance;

	/**
	 * Hold instance of form
	 *
	 * @var Form
	 */
	public $form;

	/**
	 * Hold instance of entries
	 *
	 * @var Entries
	 */
	public $entries;

	/**
	 * Hold instance of dashboard
	 *
	 * @var Dashboard
	 */
	public $dashboard;

	/**
	 * Hold frontend assets instance
	 *
	 * @var Frontend_Assets
	 */
	public $frontend_assets;

	/**
	 * Hold editor assets instance
	 *
	 * @var Editor_Assets
	 */
	public $editor_assets;

	/**
	 * Hold Style Generator Instance.
	 *
	 * @var Style_Generator
	 */
	public $style_generator;

	/**
	 * Hold Frontend Toolbar Instance.
	 *
	 * @var Frontend_Toolbar
	 */
	public $frontend_toolbar;

	/**
	 * Hold API Variable Instance.
	 *
	 * @var Api
	 */
	public $api;

	/**
	 * Hold Meta Option Variable Instance.
	 *
	 * @var Meta_Option
	 */
	public $meta_option;

	/**
	 * Hold Blocks Instance.
	 *
	 * @var Blocks
	 */
	public $blocks;

	/**
	 * Hold Form Validation Instance.
	 *
	 * @var Form_Validation
	 */
	public $form_validation;

	/**
	 * Singleton page for Init Class
	 *
	 * @return Gutenverse
	 */
	public static function instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	/**
	 * Init constructor.
	 */
	private function __construct() {
		$this->register_framework();
		add_action( 'plugins_loaded', array( $this, 'plugin_loaded' ) );
		add_action( 'plugins_loaded', array( $this, 'framework_loaded' ), 99 );
		add_filter( 'gutenverse_companion_plugin_list', array( $this, 'plugin_name' ) );
		register_activation_hook( GUTENVERSE_FORM_FILE, array( $this, 'set_activation_transient' ) );
	}

	/**
	 * Set Activation Transient
	 */
	public function set_activation_transient() {
		set_transient( 'gutenverse_redirect', 1, 30 );
	}

	/**
	 * Register Plugin name.
	 *
	 * @param array $list .
	 */
	public function plugin_name( $list ) {
		$list[] = GUTENVERSE_FORM_NAME;

		return $list;
	}

	/**
	 * Register Framework.
	 */
	public function register_framework() {
		require_once GUTENVERSE_FORM_DIR . 'lib/framework/init.php';
		$init = \Gutenverse_Initialize_Framework::instance();

		$framework_file    = GUTENVERSE_FORM_DIR . 'lib/framework/bootstrap.php';
		$framework_version = $init->get_framework_version( $framework_file );
		$init->register_version( GUTENVERSE_FORM, $framework_version );
		$init->register_pro_version( GUTENVERSE_FORM, GUTENVERSE_FORM_REQUIRED_PRO_VERSION );
	}

	/**
	 * Check if we can load framework.
	 *
	 * @return boolean
	 */
	public function can_load_framework() {
		require_once GUTENVERSE_FORM_DIR . 'lib/framework/init.php';
		$init = \Gutenverse_Initialize_Framework::instance();

		return $init->can_load_version( GUTENVERSE_FORM );
	}

	/**
	 * Load text domain
	 */
	public function load_textdomain() {
		add_action( 'rest_api_init', array( $this, 'init_api' ) );
		load_plugin_textdomain( 'gutenverse-form', false, GUTENVERSE_FORM_LANG_DIR );
	}

	/**
	 * Plugin Loaded.
	 */
	public function plugin_loaded() {
		require_once GUTENVERSE_FORM_DIR . 'lib/framework/init.php';
		$init = \Gutenverse_Initialize_Framework::instance();

		if ( $init->check_compatibility() ) {
			$this->init_framework();
		}
	}

	/**
	 * Only load when framework already loaded.
	 */
	public function framework_loaded() {
		$this->init_instance();
		$this->init_post_type();
		$this->load_textdomain();
	}

	/**
	 * Initialize Form
	 */
	public function init_post_type() {
		$this->form      = new Form();
		$this->entries   = new Entries();
		$this->dashboard = new Dashboard();
	}

	/**
	 * Initialize Instance
	 */
	public function init_instance() {
		$this->frontend_assets  = new Frontend_Assets();
		$this->editor_assets    = new Editor_Assets();
		$this->style_generator  = new Style_Generator();
		$this->frontend_toolbar = new Frontend_Toolbar();
		$this->meta_option      = new Meta_Option();
		$this->blocks           = new Blocks();
		$this->form_validation  = new Form_Validation();
	}

	/**
	 * Initialize Framework.
	 */
	public function init_framework() {
		if ( $this->can_load_framework() ) {
			defined( 'GUTENVERSE_FRAMEWORK_URL_PATH' ) || define( 'GUTENVERSE_FRAMEWORK_URL_PATH', plugins_url( GUTENVERSE_FORM ) . '/lib/framework' );
			require_once GUTENVERSE_FORM_DIR . 'lib/framework/bootstrap.php';
		}
	}

	/**
	 * Init Rest API
	 */
	public function init_api() {
		$this->api = Api::instance();
	}
}
