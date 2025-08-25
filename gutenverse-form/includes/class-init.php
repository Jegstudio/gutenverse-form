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
		$flag = $this->register_framework();
		if ( $flag ) {
			add_action( 'plugins_loaded', array( $this, 'plugin_loaded' ) );
		}
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
	 * Get Framework version from file.
	 *
	 * @param string $file file path of the file that has the data framework.
	 */
	public function get_framework_version_from_file( $file ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		WP_Filesystem();
		global $wp_filesystem;

		if ( $wp_filesystem->exists( $file ) ) {

			$content = $wp_filesystem->get_contents( $file );
			if ( preg_match( "/define\(\s*'GUTENVERSE_FRAMEWORK_VERSION'\s*,\s*'([^']+)'\s*\)/", $content, $matches ) ) {
				$version = $matches[1];
				return $version;
			}
		}
		return false;
	}

	/**
	 * Register Framework.
	 */
	public function register_framework() {
		require_once GUTENVERSE_FORM_DIR . 'lib/framework/init.php';
		$init = \Gutenverse_Initialize_Framework::instance();

		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$bootstrap_path         = '/lib/framework/bootstrap.php';
		$self_bootstrap_path    = WP_PLUGIN_DIR . '/gutenverse-form' . $bootstrap_path;
		$self_framework_version = $this->get_framework_version_from_file( $self_bootstrap_path );
		if ( ! $self_framework_version ) {
			$self_framework_version = '1.0.0';
		}
		$plugins = get_plugins();
		$checks  = array(
			'gutenverse' => array(
				'plugin' => 'gutenverse/gutenverse.php',
			),
			'gutenverse-news' => array(
				'plugin' => 'gutenverse-news/gutenverse-news.php',
			),
		);

		$is_using_other_framework = false;
		$arr_equal_ver            = array();
		foreach ( $checks as $key => $plugin ) {
			if ( isset( $plugins[ $plugin['plugin'] ] ) ) {
				if ( is_plugin_active( $plugin['plugin'] ) ) {
					$plugin_bootstrap_path     = WP_PLUGIN_DIR . '/' . $key . '/' . $bootstrap_path;
					$plugin_framework_version  = $this->get_framework_version_from_file( $plugin_bootstrap_path );
					$compare_framework_version = version_compare( $self_framework_version, $plugin_framework_version, '<' );
					if ( $compare_framework_version ) {
						$is_using_other_framework = true;
						break;
					}

					$compare_equal_framework_version = version_compare( $self_framework_version, $plugin_framework_version, '=' );
					if ( $compare_equal_framework_version ) {
						array_push( $arr_equal_ver, $key );
					}
				}
			}
		}
		if ( ! $is_using_other_framework && ! empty( $arr_equal_ver ) ) {
			$arr_equal_ver[] = 'gutenverse-form';
			sort( $arr_equal_ver );
			if ( GUTENVERSE_FORM !== $arr_equal_ver[0] ) {
				$is_using_other_framework = true;
			}
		}

		if ( $is_using_other_framework ) {
			return false;
		}
		$framework_file    = GUTENVERSE_FORM_DIR . 'lib/framework/bootstrap.php';
		$framework_version = $init->get_framework_version( $framework_file );
		$init->register_version( GUTENVERSE_FORM, $framework_version );
		$init->register_pro_version( GUTENVERSE_FORM, GUTENVERSE_FORM_REQUIRED_PRO_VERSION );
		return true;
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

		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$plugins = \get_plugins();
		$checks  = array(
			'gutenverse/gutenverse.php',
			'gutenverse-news/gutenverse-news.php',
			'gutenverse-pro/gutenverse-pro.php',
		);

		$notices = array();

		foreach ( $checks as $plugin ) {
			if ( isset( $plugins[ $plugin ] ) ) {
				$form = $plugins[ $plugin ];

				$plugin_name      = '';
				$required_version = '1.0.0';
				$plugin_arr       = explode( '/', $plugin );
				$plugin_slug      = $plugin_arr[0];
				switch ( $plugin ) {
					case 'gutenverse/gutenverse.php':
						$required_version = '3.0.0';
						$plugin_name      = 'Gutenverse';

						break;
					case 'gutenverse-news/gutenverse-news.php':
						$required_version = '1.0.0';
						$plugin_name      = 'Gutenverse News';
						break;
					case 'gutenverse-pro/gutenverse-pro.php':
						$required_version = '2.0.0';
						$plugin_name      = 'Gutenverse Pro';
						break;
				}

				if ( version_compare( $form['Version'], $required_version, '<' ) && is_plugin_active( $plugin ) ) {
					$notices[ 'gutenverse-update-' . $plugin_slug . '-notice' ] = array(
						'show'               => true,
						'notice_header'      => "Update {$plugin_name} Plugin!",
						'notice_description' => "We notice that you haven't update {$plugin_name} plugin to version {$required_version} or above but, currently using Gutenverse version 3.0.0 or above.",
						'notice_action'      => 'You might see issue on the Editor. ',
						'notice_action_2'    => 'to ensure smooth editing experience!',
						'action_url'         => admin_url( 'plugins.php' ),
						'plugin_name'        => $plugin_name,
					);
				}
			}
		}

		add_filter(
			'gutenverse_dashboard_config',
			function ( $config ) use ( $notices ) {
				$config['noticeActions'] = ! empty( $config['noticeActions'] ) ? $config['noticeActions'] : array();
				$merging_notices         = array_merge( $config['noticeActions'], $notices );
				$config['noticeActions'] = $merging_notices;
				return $config;
			}
		);

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
