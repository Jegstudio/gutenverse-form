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
	 * Plugin Update Notice.
	 *
	 * @param string $plugin_name String Plugin Name.
	 * @param string $notice_header String Header For Notice.
	 * @param string $notice_description String Description For Notice.
	 * @param string $notice_action String Action Text For Notice.
	 * @param string $notice_action_2 String Action Text For Notice.
	 */
	public function plugin_update_notice( $plugin_name, $notice_header, $notice_description, $notice_action, $notice_action_2 ) {

		?>
		<style>
			.gutenverse-upgrade-notice.version-missmatch .notice-logo {
				background: #ffe2e2;
				border-left-color: #ff0909;
			}
		</style>
		<div class="notice gutenverse-upgrade-notice page-content-upgrade version-missmatch">
				<div class="notice-logo">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M10 0C4.47754 0 0 4.47915 0 10C0 15.5241 4.47754 20 10 20C15.5225 20 20 15.5241 20 10C20 4.47915 15.5225 0 10 0ZM10 4.43548C10.9353 4.43548 11.6935 5.19371 11.6935 6.12903C11.6935 7.06435 10.9353 7.82258 10 7.82258C9.06468 7.82258 8.30645 7.06435 8.30645 6.12903C8.30645 5.19371 9.06468 4.43548 10 4.43548ZM12.2581 14.6774C12.2581 14.9446 12.0414 15.1613 11.7742 15.1613H8.22581C7.95859 15.1613 7.74194 14.9446 7.74194 14.6774V13.7097C7.74194 13.4425 7.95859 13.2258 8.22581 13.2258H8.70968V10.6452H8.22581C7.95859 10.6452 7.74194 10.4285 7.74194 10.1613V9.19355C7.74194 8.92633 7.95859 8.70968 8.22581 8.70968H10.8065C11.0737 8.70968 11.2903 8.92633 11.2903 9.19355V13.2258H11.7742C12.0414 13.2258 12.2581 13.4425 12.2581 13.7097V14.6774Z" fill="#ff0909"/>
					</svg>
				</div>
				<div class="notice-content">
					<h2>
						<?php
						printf(
							esc_html( $notice_header ),
							esc_html( $plugin_name )
						);
						?>
					</h2>
					<p>
						<?php
						printf(
							esc_html( $notice_description ),
							esc_html( $plugin_name )
						);
						?>
					</p>				
					<p>
						<?php
						printf(
							'%s <strong>%s %s</strong> %s',
							esc_html( $notice_action ),
							esc_html__( 'Please update', 'gutenverse' ),
							esc_html( $plugin_name ),
							esc_html( $notice_action_2 )
						);
						?>
					</p>
					<div class="gutenverse-upgrade-action">
					<a class='button-primary upgrade-themes' href="<?php echo esc_url( admin_url( 'plugins.php' ) ); ?>">
							<?php
								printf(
									// translators: %s is plugin name.
									esc_html__( 'Update %s Plugin', 'gutenverse' ),
									esc_html( $plugin_name )
								);
							?>
						</a>						
					</div>
				</div>
			</div>
		<?php
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

		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$plugins = \get_plugins();
		$checks  = array(
			'gutenverse/gutenverse.php',
			'gutenverse-news/gutenverse-news.php',
			'gutenverse-pro/gutenverse-pro.php',
		);

		$instance = $this;

		foreach ( $checks as $plugin ) {
			if ( isset( $plugins[ $plugin ] ) ) {
				$form = $plugins[ $plugin ];

				$plugin_name      = '';
				$required_version = '1.0.0';
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
					add_action(
						'admin_notices',
						function () use ( $instance, $plugin_name, $required_version ) {
							// translators: %s is plugin name.
							$notice_header = 'Update %s Plugin!';
							// translators: %s is plugin name.
							$notice_description = "We notice that you haven't update %s plugin to version {$required_version} or above but, currently using Gutenverse Form version 2.0.0 or above.";
							$notice_action      = 'You might see issue on the Editor. ';
							$notice_action_2    = 'to ensure smooth editing experience!';
							$instance->plugin_update_notice( $plugin_name, $notice_header, $notice_description, $notice_action, $notice_action_2 );
						}
					);
				}
			}
		}

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
