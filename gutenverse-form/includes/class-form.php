<?php
/**
 * Form class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

use WP_Error;
use WP_Post;

/**
 * Class Form
 *
 * @package gutenverse-form
 */
class Form {
	/**
	 * Post type
	 *
	 * @var string
	 */
	const POST_TYPE = 'gutenverse-form';

	/**
	 * Form action owner post meta key.
	 *
	 * @var string
	 */
	const OWNER_POST_META = '_gutenverse_form_owner_post_id';

	/**
	 * Form action owner instance meta key.
	 *
	 * @var string
	 */
	const OWNER_INSTANCE_META = '_gutenverse_form_owner_instance_id';

	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'post_type' ), 9 );
		add_action( 'load-edit.php', array( $this, 'prepare_admin_list_screen' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ), 99 );
		add_action( 'admin_footer', array( $this, 'admin_footer' ) );
		add_action( 'admin_menu', array( $this, 'parent_menu' ) );
		add_action( 'wp_ajax_gutenverse_form_action_migration_notice_close', array( $this, 'close_form_action_migration_notice' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( $this, 'custom_column' ), 10, 2 );
		add_filter( 'post_row_actions', array( $this, 'action_row' ), 10, 2 );
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( $this, 'set_custom_column' ) );
	}

	/**
	 * Parent Menu
	 */
	public function parent_menu() {
		add_menu_page(
			esc_html__( 'Form', 'gutenverse-form' ),
			esc_html__( 'Form', 'gutenverse-form' ),
			'manage_options',
			self::POST_TYPE,
			array( $this, 'render_dashboard_page' ),
			GUTENVERSE_FORM_URL . '/assets/icon/icon-form-dashboard.svg',
			31
		);

		add_submenu_page(
			self::POST_TYPE,
			esc_html__( 'Dashboard', 'gutenverse-form' ),
			esc_html__( 'Dashboard', 'gutenverse-form' ),
			'manage_options',
			self::POST_TYPE,
			array( $this, 'render_dashboard_page' )
		);

		remove_submenu_page(
			self::POST_TYPE,
			'edit.php?post_type=' . Entries::POST_TYPE
		);

		add_submenu_page(
			self::POST_TYPE,
			esc_html__( 'Entries', 'gutenverse-form' ),
			esc_html__( 'Entries', 'gutenverse-form' ),
			'manage_options',
			Entries::PAGE_SLUG,
			array( Init::instance()->entries, 'render_entry_list_page' )
		);

		add_submenu_page(
			self::POST_TYPE,
			esc_html__( 'Form Settings', 'gutenverse-form' ),
			esc_html__( 'Form Settings', 'gutenverse-form' ),
			'manage_options',
			admin_url( 'admin.php?page=gutenverse&path=settings&settings=form&sub-menu=form_settings' )
		);

		add_submenu_page(
			self::POST_TYPE,
			esc_html__( 'Form Integrations', 'gutenverse-form' ),
			esc_html__( 'Form Integrations', 'gutenverse-form' ),
			'manage_options',
			admin_url( 'admin.php?page=gutenverse&path=settings&settings=form&sub-menu=form_integrations' )
		);
	}

	/**
	 * Render dashboard page under Form admin menu.
	 */
	public function render_dashboard_page() {
		?>
		<div class="wrap">
			<div id="gutenverse-form-dashboard"></div>
		</div>
		<?php
	}

	/**
	 * Prepare Form admin list screen routing.
	 */
	public function prepare_admin_list_screen() {
		$post_type = 'post';

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( isset( $_GET['post_type'] ) && is_scalar( $_GET['post_type'] ) ) {
			$post_type = sanitize_key( wp_unslash( $_GET['post_type'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}

		if ( Entries::POST_TYPE === $post_type ) {
			$args = array();

			if ( isset( $_GET['form_id'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$args['form_id'] = absint( $_GET['form_id'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			}

			if ( isset( $_GET['m'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$args['month'] = sanitize_text_field( wp_unslash( $_GET['m'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			}

			wp_safe_redirect( Entries::get_admin_page_url( $args ) );
			exit;
		}

		if ( in_array( $post_type, array( self::POST_TYPE, Email_Template::POST_TYPE ), true ) ) {
			wp_safe_redirect( admin_url( 'admin.php?page=' . self::POST_TYPE ) );
			exit;
		}
	}

	/**
	 * Render form action migration notice.
	 */
	public static function render_form_action_migration_notice() {
		if ( get_option( 'gutenverse_form_action_migration_notice' ) ) {
			return;
		}
		?>
		<div class="gutenverse-form-action-migration-notice" data-form-action-migration-notice>
			<div>
				<strong><?php esc_html_e( 'Form actions have moved to Form Builder', 'gutenverse-form' ); ?></strong>
				<p><?php esc_html_e( 'Form actions are now bound to each Form Builder block and can be created, edited, or deleted directly from the Form Builder. They are no longer managed from this admin dashboard.', 'gutenverse-form' ); ?></p>
			</div>
			<button type="button" aria-label="<?php esc_attr_e( 'Dismiss notice', 'gutenverse-form' ); ?>" data-form-action-migration-dismiss data-nonce="<?php echo esc_attr( wp_create_nonce( 'gutenverse_form_action_migration_notice_close' ) ); ?>">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<?php
	}

	/**
	 * Close form action migration notice.
	 */
	public function close_form_action_migration_notice() {
		check_ajax_referer( 'gutenverse_form_action_migration_notice_close', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		update_option( 'gutenverse_form_action_migration_notice', true, false );
		wp_send_json_success();
	}

	/**
	 * Set custom columns.
	 *
	 * @return array
	 */
	public function set_custom_column() {
		$columns['cb']           = '<input type=\'checkbox\' />';
		$columns['title']        = __( 'Title', 'gutenverse-form' );
		$columns['form_entries'] = __( 'Entries', 'gutenverse-form' );
		$columns['author']       = __( 'Author', 'gutenverse-form' );
		$columns['date']         = __( 'Date', 'gutenverse-form' );

		return $columns;
	}

	/**
	 * Row Actions
	 *
	 * @param array    $actions .
	 * @param \WP_Post $post .
	 *
	 * @return string
	 */
	public function action_row( $actions, $post ) {
		if ( self::POST_TYPE === $post->post_type ) {
			unset( $actions['view'] );
			$dashboard_url        = admin_url( 'admin.php?page=' . self::POST_TYPE );
			$actions['dashboard'] = sprintf(
				'<a href="%1$s">%2$s</a>',
				esc_url( $dashboard_url ),
				esc_html__( 'Dashboard', 'gutenverse-form' )
			);
		}
		return $actions;
	}

	/**
	 * Custom column.
	 *
	 * @param array $column .
	 * @param int   $post_id .
	 */
	public function custom_column( $column, $post_id ) {
		if ( 'form_entries' === $column ) {
			$total_entries = Entries::get_total_entries( $post_id );
			$form_link     = Entries::get_admin_page_url( array( 'form_id' => $post_id ) );
			$export_link   = rest_url( '/gutenverse-form-client/v1/form-action/export/' . $post_id . '?_wpnonce=' . wp_create_nonce( 'wp_rest' ) );
			$dashboard_url = admin_url( 'admin.php?page=' . self::POST_TYPE );
			$dashboard_ref = '<a href="' . esc_url( $dashboard_url ) . '">' . esc_html__( 'Dashboard', 'gutenverse-form' ) . '</a>';
			$form_ref      = '<a class="total-entries" href="' . $form_link . '">' . $total_entries . '</a>   |  ' . $dashboard_ref;

			if ( $total_entries > 0 ) {
				$form_ref .= '  |  <a class="export-entries" href="' . $export_link . '">' . esc_html__( 'Export CSV', 'gutenverse-form' ) . '</a>';
			}

			gutenverse_print_html( $form_ref );
		}
	}

	/**
	 * Admin footer
	 */
	public function admin_footer() {
		$screen = get_current_screen();

		if ( self::POST_TYPE === $screen->post_type ) {
			?>
			<div id='gutenverse-form-action'></div>
			<?php
		}
	}

	/**
	 * Enqueue Script
	 */
	public function enqueue_script() {
		$screen = get_current_screen();

		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( self::POST_TYPE === $screen->post_type || in_array( $page, array( self::POST_TYPE, Entries::PAGE_SLUG ), true ) ) {
			$include = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/form.asset.php' )['dependencies'];

			wp_register_script(
				'gutenverse-form',
				GUTENVERSE_FORM_URL . '/assets/js/form.js',
				$include,
				GUTENVERSE_FORM_VERSION,
				true
			);

			wp_localize_script(
				apply_filters( 'gutenverse_block_script_handle', 'gutenverse-form' ),
				'GutenverseConfig',
				$this->js_config()
			);

			wp_set_script_translations( 'gutenverse-form', 'gutenverse-form', GUTENVERSE_FORM_LANG_DIR );

			wp_enqueue_script( 'gutenverse-form' );

			wp_enqueue_style(
				'gutenverse-form',
				GUTENVERSE_FORM_URL . '/assets/css/form.css',
				null,
				GUTENVERSE_FORM_VERSION
			);
		}
	}

	/**
	 * JS Config.
	 */
	public function js_config() {
		$config                      = \Gutenverse\Framework\Init::instance()->editor_assets->gutenverse_config();
		$config['hideFormNotice']    = get_option( 'gutenverse_form_action_notice' );
		$config['hideFormProNotice'] = get_option( 'gutenverse_form_pro_notice' );
		$config['placeholders']      = Placeholder::get_available_placeholders();
		$config['formDashboard']     = array(
			'entriesUrl'                  => Entries::get_admin_page_url(),
			'migrationNoticeHidden'       => (bool) get_option( 'gutenverse_form_action_migration_notice' ),
			'migrationNoticeDismissNonce' => wp_create_nonce( 'gutenverse_form_action_migration_notice_close' ),
			'formActionRestBase'          => rest_url( '/gutenverse-form-client/v1/form-action/' ),
		);
		$config['entryList']         = Entries::get_entry_list_config( $config );

		return $config;
	}

	/**
	 * Register Post Type
	 */
	public function post_type() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'          =>
					array(
						'name'               => esc_html__( 'Form Action', 'gutenverse-form' ),
						'singular_name'      => esc_html__( 'Form Action', 'gutenverse-form' ),
						'menu_name'          => esc_html__( 'Form Action', 'gutenverse-form' ),
						'add_new'            => esc_html__( 'New Form Action', 'gutenverse-form' ),
						'add_new_item'       => esc_html__( 'Create Form', 'gutenverse-form' ),
						'edit_item'          => esc_html__( 'Edit Form Option', 'gutenverse-form' ),
						'new_item'           => esc_html__( 'New Form Entry', 'gutenverse-form' ),
						'view_item'          => esc_html__( 'View Form', 'gutenverse-form' ),
						'search_items'       => esc_html__( 'Search Form', 'gutenverse-form' ),
						'not_found'          => esc_html__( 'No entry found', 'gutenverse-form' ),
						'not_found_in_trash' => esc_html__( 'No Form in Trash', 'gutenverse-form' ),
						'parent_item_colon'  => '',
					),
				'description'     => esc_html__( 'Gutenverse Form Action', 'gutenverse-form' ),
				'public'          => true,
				'show_ui'         => true,
				'menu_position'   => 6,
				'capability_type' => 'post',
				'hierarchical'    => false,
				'supports'        => array( 'title', 'revisions', 'page-attributes' ),
				'map_meta_cap'    => true,
				'show_in_menu'    => false,
				'rewrite'         => array(
					'slug' => self::POST_TYPE,
				),
			)
		);
	}



	/**
	 * Create Form Action
	 *
	 * @param integer $id Post ID.
	 *
	 * @return array
	 */
	public static function get_form_action_data( $id ) {
		if ( $id ) {
			$post = get_post( $id );

			if ( ! $post || self::POST_TYPE !== $post->post_type ) {
				return new WP_Error(
					'invalid_form_action',
					__( 'This form action does not exist on this site.', 'gutenverse-form' ),
					array( 'status' => 404 )
				);
			}

			$meta = get_post_meta( $id, 'form-data', true );
			$data = array(
				'title' => get_the_title( $id ),
			);
			$data['is_data_empty'] = empty( $meta );

			// Extract input names from post content.
			$input_names = array();
			if ( $post ) {
				$blocks = parse_blocks( $post->post_content );
				self::extract_input_names_from_blocks( $blocks, $input_names );
			}
			$data['available_inputs'] = array_unique( $input_names );

			if ( ! is_array( $meta ) ) {
				$meta = array();
			}

			return array_merge( $data, $meta );
		}

		return false;
	}

	/**
	 * Get dashboard data for a form action.
	 *
	 * @param integer $id Form action ID.
	 *
	 * @return array|false
	 */
	public static function get_form_dashboard_data( $id ) {
		$post = get_post( $id );

		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return false;
		}

		$entry_stats   = self::get_entry_dashboard_stats( array( $id ) );
		$locations_map = self::get_form_locations_map( array( $id ) );

		return self::build_form_dashboard_data(
			$post,
			isset( $entry_stats[ $id ] ) ? $entry_stats[ $id ] : array(),
			isset( $locations_map[ $id ] ) ? $locations_map[ $id ] : array()
		);
	}

	/**
	 * Build dashboard data from precomputed entry and location maps.
	 *
	 * @param \WP_Post $post        Form action post.
	 * @param array    $entry_stats Precomputed entry statistics.
	 * @param array    $locations   Precomputed form locations.
	 *
	 * @return array|false
	 */
	private static function build_form_dashboard_data( $post, $entry_stats = array(), $locations = array() ) {
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return false;
		}

		$id          = (int) $post->ID;
		$form_action = self::get_form_action_data( $id );

		if ( is_wp_error( $form_action ) || ! is_array( $form_action ) ) {
			$form_action = array();
		}

		$entry_stats = wp_parse_args( $entry_stats, self::get_empty_entry_dashboard_stats() );
		$locations   = is_array( $locations ) ? $locations : array();

		return array(
			'id'                   => $id,
			'title'                => get_the_title( $id ),
			'created'              => get_the_date( '', $post ),
			'modified'             => get_the_modified_date( '', $post ),
			'edit_url'             => get_edit_post_link( $id, 'raw' ),
			'entries_url'          => Entries::get_admin_page_url( array( 'form_id' => $id ) ),
			'export_url'           => rest_url( '/gutenverse-form-client/v1/form-action/export/' . $id . '?_wpnonce=' . wp_create_nonce( 'wp_rest' ) ),
			'total_entries'        => (int) $entry_stats['total_entries'],
			'entries_last_week'    => (int) $entry_stats['entries_last_week'],
			'last_entry_date'      => $entry_stats['last_entry_date'],
			'last_entry_timestamp' => (int) $entry_stats['last_entry_timestamp'],
			'location_count'       => count( $locations ),
			'locations'            => $locations,
			'top_sources'          => $entry_stats['top_sources'],
			'latest_entries'       => $entry_stats['latest_entries'],
			'available_inputs'     => isset( $form_action['available_inputs'] ) ? array_values( $form_action['available_inputs'] ) : array(),
			'settings'             => array(
				'require_login' => ! empty( $form_action['require_login'] ),
				'user_confirm'  => ! empty( $form_action['user_confirm'] ),
				'admin_confirm' => ! empty( $form_action['admin_confirm'] ),
				'user_browser'  => ! empty( $form_action['user_browser'] ),
				'use_captcha'   => ! empty( $form_action['use_captcha'] ),
			),
		);
	}

	/**
	 * Get dashboard data for all form actions.
	 *
	 * @return array
	 */
	public static function get_all_form_dashboard_data() {
		$forms = get_posts(
			array(
				'post_type'              => self::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => -1,
				'orderby'                => 'modified',
				'order'                  => 'DESC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		$data     = array();
		$form_ids = wp_list_pluck( $forms, 'ID' );

		$entry_stats   = self::get_entry_dashboard_stats( $form_ids );
		$locations_map = self::get_form_locations_map( $form_ids );

		foreach ( $forms as $form ) {
			$form_id        = (int) $form->ID;
			$form_dashboard = self::build_form_dashboard_data(
				$form,
				isset( $entry_stats[ $form_id ] ) ? $entry_stats[ $form_id ] : array(),
				isset( $locations_map[ $form_id ] ) ? $locations_map[ $form_id ] : array()
			);

			if ( $form_dashboard ) {
				$data[] = $form_dashboard;
			}
		}

		return $data;
	}

	/**
	 * Normalize a form ID list.
	 *
	 * @param array $form_ids Form action IDs.
	 *
	 * @return array
	 */
	private static function normalize_form_ids( $form_ids ) {
		return array_values( array_unique( array_filter( array_map( 'absint', (array) $form_ids ) ) ) );
	}

	/**
	 * Get empty entry dashboard statistics.
	 *
	 * @return array
	 */
	private static function get_empty_entry_dashboard_stats() {
		return array(
			'total_entries'        => 0,
			'entries_last_week'    => 0,
			'last_entry_date'      => '',
			'last_entry_timestamp' => 0,
			'top_sources'          => array(),
			'latest_entries'       => array(),
		);
	}

	/**
	 * Get entry counts grouped by form action.
	 *
	 * @param array  $form_ids    Optional form action IDs.
	 * @param string $after       Optional date lower boundary.
	 * @param string $before      Optional date upper boundary.
	 * @param string $date_column Date column to filter by.
	 *
	 * @return array
	 */
	public static function get_form_entry_count_map( $form_ids = array(), $after = '', $before = '', $date_column = 'post_date' ) {
		global $wpdb;

		$form_ids    = self::normalize_form_ids( $form_ids );
		$date_column = in_array( $date_column, array( 'post_date', 'post_date_gmt' ), true ) ? $date_column : 'post_date';
		$where       = array(
			'entries.post_type = %s',
			'entries.post_status = %s',
			"form_meta.meta_key = 'form-id'",
			"form_meta.meta_value <> ''",
			'CAST(form_meta.meta_value AS UNSIGNED) > 0',
		);
		$args        = array(
			Entries::POST_TYPE,
			'publish',
		);

		if ( ! empty( $form_ids ) ) {
			$where[] = 'CAST(form_meta.meta_value AS UNSIGNED) IN (' . implode( ',', array_fill( 0, count( $form_ids ), '%d' ) ) . ')';
			$args    = array_merge( $args, $form_ids );
		}

		if ( $after ) {
			$where[] = "entries.{$date_column} >= %s";
			$args[]  = $after;
		}

		if ( $before ) {
			$where[] = "entries.{$date_column} <= %s";
			$args[]  = $before;
		}

		$query = "
			SELECT CAST(form_meta.meta_value AS UNSIGNED) AS form_id, COUNT(entries.ID) AS entry_count
			FROM {$wpdb->posts} entries
			INNER JOIN {$wpdb->postmeta} form_meta ON entries.ID = form_meta.post_id
			WHERE " . implode( ' AND ', $where ) . '
			GROUP BY CAST(form_meta.meta_value AS UNSIGNED)
		';
		$rows  = $wpdb->get_results( $wpdb->prepare( $query, $args ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$map   = array();

		foreach ( $rows as $row ) {
			$map[ (int) $row['form_id'] ] = (int) $row['entry_count'];
		}

		return $map;
	}

	/**
	 * Get dashboard entry statistics grouped by form action.
	 *
	 * @param array $form_ids Form action IDs.
	 *
	 * @return array
	 */
	private static function get_entry_dashboard_stats( $form_ids ) {
		global $wpdb;

		$form_ids = self::normalize_form_ids( $form_ids );
		$stats    = array();

		foreach ( $form_ids as $form_id ) {
			$stats[ $form_id ] = self::get_empty_entry_dashboard_stats();
		}

		if ( empty( $form_ids ) ) {
			return $stats;
		}

		$week_cutoff = gmdate( 'Y-m-d H:i:s', time() - WEEK_IN_SECONDS );
		$query       = "
			SELECT
				CAST(form_meta.meta_value AS UNSIGNED) AS form_id,
				COUNT(entries.ID) AS total_entries,
				SUM(CASE WHEN entries.post_date_gmt >= %s THEN 1 ELSE 0 END) AS entries_last_week,
				MAX(entries.post_date_gmt) AS last_entry_gmt
			FROM {$wpdb->posts} entries
			INNER JOIN {$wpdb->postmeta} form_meta ON entries.ID = form_meta.post_id AND form_meta.meta_key = 'form-id'
			WHERE entries.post_type = %s
				AND entries.post_status = %s
				AND CAST(form_meta.meta_value AS UNSIGNED) IN (" . implode( ',', array_fill( 0, count( $form_ids ), '%d' ) ) . ')
			GROUP BY CAST(form_meta.meta_value AS UNSIGNED)
		';
		$args        = array_merge( array( $week_cutoff, Entries::POST_TYPE, 'publish' ), $form_ids );
		$rows        = $wpdb->get_results( $wpdb->prepare( $query, $args ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		foreach ( $rows as $row ) {
			$form_id        = (int) $row['form_id'];
			$last_entry_gmt = isset( $row['last_entry_gmt'] ) ? $row['last_entry_gmt'] : '';

			if ( ! isset( $stats[ $form_id ] ) ) {
				$stats[ $form_id ] = self::get_empty_entry_dashboard_stats();
			}

			$stats[ $form_id ]['total_entries']        = (int) $row['total_entries'];
			$stats[ $form_id ]['entries_last_week']    = (int) $row['entries_last_week'];
			$stats[ $form_id ]['last_entry_timestamp'] = $last_entry_gmt ? strtotime( $last_entry_gmt . ' UTC' ) : 0;
			$stats[ $form_id ]['last_entry_date']      = $last_entry_gmt ? get_date_from_gmt( $last_entry_gmt, get_option( 'date_format' ) ) : '';
		}

		$top_sources = self::get_top_sources_by_form( $form_ids );
		foreach ( $top_sources as $form_id => $sources ) {
			$stats[ $form_id ]['top_sources'] = $sources;
		}

		$latest_entries = self::get_latest_entries_by_form( $form_ids );
		foreach ( $latest_entries as $form_id => $entries ) {
			$stats[ $form_id ]['latest_entries'] = $entries;
		}

		return $stats;
	}

	/**
	 * Get top entry sources grouped by form action.
	 *
	 * @param array $form_ids Form action IDs.
	 *
	 * @return array
	 */
	private static function get_top_sources_by_form( $form_ids ) {
		global $wpdb;

		$form_ids = self::normalize_form_ids( $form_ids );
		$sources  = array();

		foreach ( $form_ids as $form_id ) {
			$sources[ $form_id ] = array();
		}

		if ( empty( $form_ids ) ) {
			return $sources;
		}

		$query = "
			SELECT
				CAST(form_meta.meta_value AS UNSIGNED) AS form_id,
				CAST(source_meta.meta_value AS UNSIGNED) AS source_id,
				COUNT(entries.ID) AS entry_count
			FROM {$wpdb->posts} entries
			INNER JOIN {$wpdb->postmeta} form_meta ON entries.ID = form_meta.post_id AND form_meta.meta_key = 'form-id'
			INNER JOIN {$wpdb->postmeta} source_meta ON entries.ID = source_meta.post_id AND source_meta.meta_key = 'post-id'
			WHERE entries.post_type = %s
				AND entries.post_status = %s
				AND CAST(form_meta.meta_value AS UNSIGNED) IN (" . implode( ',', array_fill( 0, count( $form_ids ), '%d' ) ) . ')
				AND CAST(source_meta.meta_value AS UNSIGNED) > 0
			GROUP BY CAST(form_meta.meta_value AS UNSIGNED), CAST(source_meta.meta_value AS UNSIGNED)
			ORDER BY form_id ASC, entry_count DESC
		';
		$args  = array_merge( array( Entries::POST_TYPE, 'publish' ), $form_ids );
		$rows  = $wpdb->get_results( $wpdb->prepare( $query, $args ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		foreach ( $rows as $row ) {
			$form_id   = (int) $row['form_id'];
			$source_id = (int) $row['source_id'];

			if ( ! isset( $sources[ $form_id ] ) || count( $sources[ $form_id ] ) >= 5 || ! $source_id ) {
				continue;
			}

			$source_post = get_post( $source_id );
			$type_object = $source_post ? get_post_type_object( $source_post->post_type ) : null;

			if ( ! $source_post ) {
				continue;
			}

			$sources[ $form_id ][] = array(
				'id'       => $source_post->ID,
				'title'    => get_the_title( $source_post ),
				'type'     => $type_object ? $type_object->labels->singular_name : $source_post->post_type,
				'count'    => (int) $row['entry_count'],
				'status'   => get_post_status( $source_post ),
				'view_url' => get_permalink( $source_post ),
				'edit_url' => get_edit_post_link( $source_post->ID, 'raw' ),
			);
		}

		return $sources;
	}

	/**
	 * Get latest entries grouped by form action.
	 *
	 * @param array   $form_ids Form action IDs.
	 * @param integer $limit    Latest entry limit per form.
	 *
	 * @return array
	 */
	private static function get_latest_entries_by_form( $form_ids, $limit = 5 ) {
		$form_ids = self::normalize_form_ids( $form_ids );
		$entries  = array();

		foreach ( $form_ids as $form_id ) {
			$entries[ $form_id ] = array();
			$entry_ids           = get_posts(
				array(
					'post_type'              => Entries::POST_TYPE,
					'posts_per_page'         => $limit,
					'post_status'            => array( 'publish' ),
					'orderby'                => 'date',
					'order'                  => 'DESC',
					'fields'                 => 'ids',
					'no_found_rows'          => true,
					'update_post_meta_cache' => true,
					'update_post_term_cache' => false,
					'meta_query'             => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
						array(
							'key'     => 'form-id',
							'value'   => $form_id,
							'compare' => '=',
						),
					),
				)
			);

			foreach ( $entry_ids as $entry_id ) {
				$post_id   = (int) get_post_meta( $entry_id, 'post-id', true );
				$post_item = $post_id > 0 ? get_post( $post_id ) : null;
				$post_type = $post_item ? get_post_type_object( $post_item->post_type ) : null;

				$entries[ $form_id ][] = array(
					'id'            => $entry_id,
					'title'         => get_the_title( $entry_id ),
					'date'          => get_the_date( '', $entry_id ),
					'edit_url'      => get_edit_post_link( $entry_id, 'raw' ),
					'source_title'  => $post_item ? get_the_title( $post_item ) : '',
					'source_type'   => $post_type ? $post_type->labels->singular_name : '',
					'source_view'   => $post_item ? get_permalink( $post_item ) : '',
					'source_edit'   => $post_item ? get_edit_post_link( $post_item->ID, 'raw' ) : '',
					'source_status' => $post_item ? get_post_status( $post_item ) : '',
				);
			}
		}

		return $entries;
	}

	/**
	 * Get dashboard summary data for the React admin dashboard.
	 *
	 * @return array
	 */
	public static function get_form_dashboard_summary() {
		$forms            = self::get_all_form_dashboard_data();
		$forms_by_entries = wp_list_sort( $forms, 'total_entries', 'DESC' );
		$forms_by_recent  = wp_list_sort( $forms, 'last_entry_timestamp', 'DESC' );
		$forms_by_usage   = wp_list_sort( $forms, 'location_count', 'DESC' );
		$recent_forms     = array_filter(
			array_slice( $forms_by_recent, 0, 3 ),
			static function ( $form ) {
				return ! empty( $form['last_entry_timestamp'] );
			}
		);

		return array(
			'forms'           => $forms,
			'totalEntries'    => array_sum(
				array_map(
					static function ( $form ) {
						return (int) $form['total_entries'];
					},
					$forms
				)
			),
			'totalLocations'  => array_sum(
				array_map(
					static function ( $form ) {
						return (int) $form['location_count'];
					},
					$forms
				)
			),
			'entriesLastWeek' => array_sum(
				array_map(
					static function ( $form ) {
						return (int) $form['entries_last_week'];
					},
					$forms
				)
			),
			'formsByEntries'  => array_values( $forms_by_entries ),
			'formsByRecent'   => array_values( $forms_by_recent ),
			'formsByUsage'    => array_values( $forms_by_usage ),
			'trendContexts'   => array(
				7  => self::get_entry_trend_chart_context( 7 ),
				30 => self::get_entry_trend_chart_context( 30 ),
			),
			'needsAttention'  => self::get_forms_needing_attention( $forms, 3 ),
			'unusedForms'     => self::get_unused_form_actions( $forms, 3 ),
			'topSources'      => self::get_top_entry_sources( $forms, 3 ),
			'recentForms'     => array_values( $recent_forms ),
		);
	}

	/**
	 * Get aggregated entries trend data.
	 *
	 * @param integer $days Number of days.
	 *
	 * @return array
	 */
	private static function get_entry_trend_data( $days = 7 ) {
		$days       = max( 1, (int) $days );
		$start_date = gmdate( 'Y-m-d 00:00:00', strtotime( '-' . ( $days - 1 ) . ' days', time() ) );
		$entries    = get_posts(
			array(
				'post_type'      => Entries::POST_TYPE,
				'post_status'    => array( 'publish' ),
				'posts_per_page' => -1,
				'date_query'     => array(
					array(
						'after'     => $start_date,
						'inclusive' => true,
						'column'    => 'post_date_gmt',
					),
				),
			)
		);
		$buckets    = array();

		for ( $i = $days - 1; $i >= 0; --$i ) {
			$key             = gmdate( 'Y-m-d', strtotime( '-' . $i . ' days', time() ) );
			$buckets[ $key ] = 0;
		}

		foreach ( $entries as $entry ) {
			$key = get_post_time( 'Y-m-d', true, $entry );

			if ( isset( $buckets[ $key ] ) ) {
				++$buckets[ $key ];
			}
		}

		$result = array();
		foreach ( $buckets as $key => $count ) {
			$result[] = array(
				'label' => gmdate( 'M j', strtotime( $key ) ),
				'count' => $count,
			);
		}

		return $result;
	}

	/**
	 * Get chart-ready entry trend data.
	 *
	 * @param integer $days Number of days.
	 *
	 * @return array
	 */
	private static function get_entry_trend_chart_context( $days ) {
		$entry_trend  = self::get_entry_trend_data( $days );
		$trend_max    = max(
			array_map(
				static function ( $trend_item ) {
					return (int) $trend_item['count'];
				},
				$entry_trend
			)
		);
		$trend_max    = max( 1, $trend_max );
		$trend_points = array();
		$chart_width  = 700;
		$chart_top    = 32;
		$chart_base   = 168;
		$chart_left   = 54;
		$chart_right  = 676;
		$trend_total  = count( $entry_trend );

		foreach ( $entry_trend as $index => $trend_item ) {
			$count = (int) $trend_item['count'];
			$x     = 1 === $trend_total ? ( $chart_width / 2 ) : $chart_left + ( ( $chart_right - $chart_left ) * ( $index / ( $trend_total - 1 ) ) );
			$y     = $chart_base - ( ( $count / $trend_max ) * ( $chart_base - $chart_top ) );

			$trend_points[] = array(
				'x'          => round( $x, 2 ),
				'y'          => round( $y, 2 ),
				'count'      => $count,
				'label'      => $trend_item['label'],
				'show_label' => 7 === (int) $days || 0 === $index || 0 === $index % 5 || $index === $trend_total - 1,
				'tooltip'    => sprintf(
					/* translators: 1: day label, 2: count */
					__( '%1$s: %2$s entries', 'gutenverse-form' ),
					$trend_item['label'],
					$count
				),
			);
		}

		$line_points = implode(
			' ',
			array_map(
				static function ( $point ) {
					return $point['x'] . ',' . $point['y'];
				},
				$trend_points
			)
		);

		return array(
			'max'         => $trend_max,
			'ticks'       => array_unique(
				array(
					0,
					(int) ceil( $trend_max / 2 ),
					$trend_max,
				)
			),
			'points'      => $trend_points,
			'line_points' => $line_points,
		);
	}

	/**
	 * Get forms that need attention.
	 *
	 * @param array   $forms Form dashboard data.
	 * @param integer $limit Result limit.
	 *
	 * @return array
	 */
	private static function get_forms_needing_attention( $forms, $limit = 5 ) {
		$results = array();

		foreach ( $forms as $form ) {
			$reason = '';

			if ( empty( $form['location_count'] ) ) {
				$reason = __( 'Not used on any live post or page.', 'gutenverse-form' );
			} elseif ( empty( $form['total_entries'] ) ) {
				$reason = __( 'Live but has not received any entries yet.', 'gutenverse-form' );
			} elseif ( empty( $form['entries_last_week'] ) ) {
				$reason = __( 'No submissions in the last 7 days.', 'gutenverse-form' );
			}

			if ( $reason ) {
				$form['attention_reason'] = $reason;
				$results[]                = $form;
			}
		}

		return array_slice( $results, 0, $limit );
	}

	/**
	 * Get unused form actions.
	 *
	 * @param array   $forms Form dashboard data.
	 * @param integer $limit Result limit.
	 *
	 * @return array
	 */
	private static function get_unused_form_actions( $forms, $limit = 5 ) {
		$unused = array_filter(
			$forms,
			static function ( $form ) {
				return empty( $form['location_count'] );
			}
		);

		return array_slice( array_values( $unused ), 0, $limit );
	}

	/**
	 * Get top entry sources from dashboard data.
	 *
	 * @param array   $forms Form dashboard data.
	 * @param integer $limit Result limit.
	 *
	 * @return array
	 */
	private static function get_top_entry_sources( $forms, $limit = 5 ) {
		$sources = array();

		foreach ( $forms as $form ) {
			if ( empty( $form['top_sources'] ) || ! is_array( $form['top_sources'] ) ) {
				continue;
			}

			foreach ( $form['top_sources'] as $source ) {
				$source_id = isset( $source['id'] ) ? (int) $source['id'] : 0;

				if ( ! $source_id ) {
					continue;
				}

				if ( ! isset( $sources[ $source_id ] ) ) {
					$sources[ $source_id ] = $source;
					continue;
				}

				$sources[ $source_id ]['count'] += (int) $source['count'];
			}
		}

		uasort(
			$sources,
			static function ( $left, $right ) {
				return (int) $right['count'] <=> (int) $left['count'];
			}
		);

		return array_slice( array_values( $sources ), 0, $limit );
	}

	/**
	 * Get locations that use a form action.
	 *
	 * @param integer $form_id Form action ID.
	 *
	 * @return array
	 */
	private static function get_form_locations( $form_id ) {
		$locations_map = self::get_form_locations_map( array( $form_id ) );

		return isset( $locations_map[ (int) $form_id ] ) ? $locations_map[ (int) $form_id ] : array();
	}

	/**
	 * Get locations that use form actions.
	 *
	 * @param array $form_ids Form action IDs.
	 *
	 * @return array
	 */
	private static function get_form_locations_map( $form_ids ) {
		$form_ids = self::normalize_form_ids( $form_ids );
		$lookup   = array_fill_keys( $form_ids, true );
		$map      = array();

		foreach ( $form_ids as $form_id ) {
			$map[ $form_id ] = array();
		}

		if ( empty( $form_ids ) ) {
			return $map;
		}

		$ignored_types = array(
			self::POST_TYPE,
			Entries::POST_TYPE,
			Email_Template::POST_TYPE,
			'attachment',
			'revision',
			'nav_menu_item',
			'wp_navigation',
			'wp_template',
			'wp_template_part',
		);
		$post_types    = array_diff( get_post_types( array( 'show_ui' => true ), 'names' ), $ignored_types );
		$statuses      = array( 'publish', 'future', 'draft', 'pending', 'private' );
		$posts         = get_posts(
			array(
				'post_type'              => $post_types,
				'post_status'            => $statuses,
				'posts_per_page'         => -1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		foreach ( $posts as $post ) {
			if ( ! has_blocks( $post->post_content ) || false === strpos( $post->post_content, 'gutenverse/form-builder' ) ) {
				continue;
			}

			$used_form_ids = array();
			self::collect_form_action_ids_from_blocks( parse_blocks( $post->post_content ), $used_form_ids );
			$used_form_ids = array_values( array_unique( array_filter( array_map( 'absint', $used_form_ids ) ) ) );
			$used_form_ids = array_values(
				array_filter(
					$used_form_ids,
					static function ( $used_form_id ) use ( $lookup ) {
						return isset( $lookup[ $used_form_id ] );
					}
				)
			);

			if ( empty( $used_form_ids ) ) {
				continue;
			}

			$type_object = get_post_type_object( $post->post_type );
			$location    = array(
				'id'       => (int) $post->ID,
				'title'    => get_the_title( $post ) ? get_the_title( $post ) : __( '(no title)', 'gutenverse-form' ),
				'type'     => $type_object ? $type_object->labels->singular_name : $post->post_type,
				'status'   => get_post_status( $post ),
				'view_url' => get_permalink( $post ),
				'edit_url' => get_edit_post_link( $post->ID, 'raw' ),
			);

			foreach ( $used_form_ids as $used_form_id ) {
				$map[ $used_form_id ][] = $location;
			}
		}

		return $map;
	}

	/**
	 * Check whether a block tree uses a form action.
	 *
	 * @param array   $blocks  Parsed blocks.
	 * @param integer $form_id Form action ID.
	 *
	 * @return boolean
	 */
	private static function post_uses_form_action( $blocks, $form_id ) {
		foreach ( $blocks as $block ) {
			if ( 'gutenverse/form-builder' === ( $block['blockName'] ?? '' ) ) {
				$form_attr = $block['attrs']['formId'] ?? null;
				$block_id  = null;

				if ( is_array( $form_attr ) && isset( $form_attr['value'] ) ) {
					$block_id = (int) $form_attr['value'];
				} elseif ( is_scalar( $form_attr ) ) {
					$block_id = (int) $form_attr;
				}

				if ( (int) $form_id === $block_id ) {
					return true;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) && self::post_uses_form_action( $block['innerBlocks'], $form_id ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Collect form action IDs from a parsed block tree.
	 *
	 * @param array $blocks   Parsed blocks.
	 * @param array $form_ids Form action IDs.
	 */
	private static function collect_form_action_ids_from_blocks( $blocks, &$form_ids ) {
		foreach ( $blocks as $block ) {
			if ( 'gutenverse/form-builder' === ( $block['blockName'] ?? '' ) ) {
				$form_attr = $block['attrs']['formId'] ?? null;
				$form_id   = null;

				if ( is_array( $form_attr ) && isset( $form_attr['value'] ) ) {
					$form_id = $form_attr['value'];
				} elseif ( is_scalar( $form_attr ) ) {
					$form_id = $form_attr;
				}

				if ( $form_id ) {
					$form_ids[] = (int) $form_id;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::collect_form_action_ids_from_blocks( $block['innerBlocks'], $form_ids );
			}
		}
	}

	/**
	 * Count form builder references to a form action inside parsed blocks.
	 *
	 * @param array   $blocks  Parsed blocks.
	 * @param integer $form_id Form action ID.
	 *
	 * @return integer
	 */
	private static function count_form_action_references_in_blocks( $blocks, $form_id ) {
		$count = 0;

		foreach ( $blocks as $block ) {
			if ( 'gutenverse/form-builder' === ( $block['blockName'] ?? '' ) ) {
				$form_attr = $block['attrs']['formId'] ?? null;
				$block_id  = null;

				if ( is_array( $form_attr ) && isset( $form_attr['value'] ) ) {
					$block_id = (int) $form_attr['value'];
				} elseif ( is_scalar( $form_attr ) ) {
					$block_id = (int) $form_attr;
				}

				if ( (int) $form_id === $block_id ) {
					++$count;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$count += self::count_form_action_references_in_blocks( $block['innerBlocks'], $form_id );
			}
		}

		return $count;
	}

	/**
	 * Count form builder references to a form action across editable content.
	 *
	 * @param integer $form_id Form action ID.
	 *
	 * @return integer
	 */
	private static function get_form_action_reference_count( $form_id ) {
		$form_id = absint( $form_id );

		if ( ! $form_id ) {
			return 0;
		}

		$ignored_types = array(
			self::POST_TYPE,
			Entries::POST_TYPE,
			Email_Template::POST_TYPE,
			'attachment',
			'revision',
			'nav_menu_item',
			'wp_navigation',
			'wp_template',
			'wp_template_part',
		);
		$post_types    = array_diff( get_post_types( array( 'show_ui' => true ), 'names' ), $ignored_types );
		$statuses      = array( 'publish', 'future', 'draft', 'pending', 'private' );
		$posts         = get_posts(
			array(
				'post_type'              => $post_types,
				'post_status'            => $statuses,
				'posts_per_page'         => -1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		$count = 0;

		foreach ( $posts as $post ) {
			if ( ! has_blocks( $post->post_content ) || false === strpos( $post->post_content, 'gutenverse/form-builder' ) ) {
				continue;
			}

			$count += self::count_form_action_references_in_blocks( parse_blocks( $post->post_content ), $form_id );
		}

		return $count;
	}

	/**
	 * Sanitize a form builder instance ID.
	 *
	 * @param string $instance_id Form builder instance ID.
	 *
	 * @return string
	 */
	private static function sanitize_form_instance_id( $instance_id ) {
		return sanitize_text_field( wp_unslash( (string) $instance_id ) );
	}

	/**
	 * Get form action owner metadata.
	 *
	 * @param integer $form_id Form action ID.
	 *
	 * @return array
	 */
	private static function get_form_action_owner( $form_id ) {
		return array(
			'post_id'     => absint( get_post_meta( $form_id, self::OWNER_POST_META, true ) ),
			'instance_id' => self::sanitize_form_instance_id( get_post_meta( $form_id, self::OWNER_INSTANCE_META, true ) ),
		);
	}

	/**
	 * Check whether owner metadata exists.
	 *
	 * @param array $owner Form action owner data.
	 *
	 * @return boolean
	 */
	private static function has_form_action_owner( $owner ) {
		return ! empty( $owner['post_id'] ) && ! empty( $owner['instance_id'] );
	}

	/**
	 * Check whether a form action belongs to a form builder instance.
	 *
	 * @param array   $owner       Form action owner data.
	 * @param integer $post_id     Owner post ID.
	 * @param string  $instance_id Owner instance ID.
	 *
	 * @return boolean
	 */
	private static function is_matching_form_action_owner( $owner, $post_id, $instance_id ) {
		return (int) $owner['post_id'] === (int) $post_id && (string) $owner['instance_id'] === (string) $instance_id;
	}

	/**
	 * Update form action owner metadata.
	 *
	 * @param integer $form_id     Form action ID.
	 * @param integer $post_id     Owner post ID.
	 * @param string  $instance_id Owner instance ID.
	 */
	private static function update_form_action_owner( $form_id, $post_id, $instance_id ) {
		$post_id     = absint( $post_id );
		$instance_id = self::sanitize_form_instance_id( $instance_id );

		if ( ! $post_id || empty( $instance_id ) ) {
			return;
		}

		update_post_meta( $form_id, self::OWNER_POST_META, $post_id );
		update_post_meta( $form_id, self::OWNER_INSTANCE_META, $instance_id );
	}

	/**
	 * Prepare form action assignment response.
	 *
	 * @param integer $form_id Form action ID.
	 * @param array   $flags   Response flags.
	 *
	 * @return array
	 */
	private static function prepare_form_action_assignment_response( $form_id, $flags = array() ) {
		$title = get_the_title( $form_id );

		return array_merge(
			array(
				'id'      => (int) $form_id,
				'title'   => $title,
				'formId'  => array(
					'label' => $title,
					'value' => (int) $form_id,
				),
				'copied'  => false,
				'claimed' => false,
			),
			$flags
		);
	}

	/**
	 * Ensure a form action belongs to the current form builder instance.
	 *
	 * @param integer $id          Form action ID.
	 * @param integer $post_id     Owner post ID.
	 * @param string  $instance_id Owner instance ID.
	 *
	 * @return array|WP_Error
	 */
	public static function ensure_form_action_ownership( $id, $post_id, $instance_id ) {
		$id          = absint( $id );
		$post_id     = absint( $post_id );
		$instance_id = self::sanitize_form_instance_id( $instance_id );
		$post        = get_post( $id );

		if ( ! $id || ! $post_id || empty( $instance_id ) ) {
			return new WP_Error(
				'invalid_form_action_owner',
				__( 'A form action, post, and form instance are required before ownership can be checked.', 'gutenverse-form' ),
				array( 'status' => 400 )
			);
		}

		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return new WP_Error(
				'invalid_form_action',
				__( 'This form action does not exist on this site.', 'gutenverse-form' ),
				array( 'status' => 404 )
			);
		}

		$owner = self::get_form_action_owner( $id );

		if ( self::is_matching_form_action_owner( $owner, $post_id, $instance_id ) ) {
			return self::prepare_form_action_assignment_response( $id );
		}

		if ( ! self::has_form_action_owner( $owner ) && self::get_form_action_reference_count( $id ) <= 1 ) {
			self::update_form_action_owner( $id, $post_id, $instance_id );

			return self::prepare_form_action_assignment_response(
				$id,
				array(
					'claimed' => true,
				)
			);
		}

		$copied_id = self::clone_form_action( $id, $post_id, $instance_id );

		if ( is_wp_error( $copied_id ) ) {
			return $copied_id;
		}

		return self::prepare_form_action_assignment_response(
			$copied_id,
			array(
				'copied' => true,
			)
		);
	}

	/**
	 * Extract input names from blocks.
	 *
	 * @param array $blocks Blocks.
	 * @param array $input_names Input names array.
	 */
	private static function extract_input_names_from_blocks( $blocks, &$input_names ) {
		foreach ( $blocks as $block ) {
			if ( isset( $block['blockName'] ) && strpos( $block['blockName'], 'gutenverse/form-input' ) !== false ) {
				if ( isset( $block['attrs']['inputName'] ) ) {
					$input_names[] = $block['attrs']['inputName'];
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::extract_input_names_from_blocks( $block['innerBlocks'], $input_names );
			}
		}
	}

	/**
	 * Normalize form action settings before saving.
	 *
	 * @param array $params Form Action Parameter.
	 *
	 * @return array
	 */
	private static function normalize_form_action_params( $params ) {
		$params = wp_parse_args(
			$params,
			array(
				'id'                             => '',
				'title'                          => '',
				'require_login'                  => '',
				'user_browser'                   => '',
				'form_success_notice'            => '',
				'form_error_notice'              => '',
				'entry_title_type'                => 'form',
				'entry_title_static_text'         => '',
				'entry_title_input_name'          => '',
				'entry_title_custom_format'       => '',
				'user_confirm'                   => '',
				'auto_select_email'              => '',
				'email_input_name'               => '',
				'user_email_subject'             => '',
				'user_email_form'                => '',
				'user_email_reply_to'            => '',
				'user_email_reply_to_type'       => 'static',
				'user_email_reply_to_dynamic'    => '',
				'user_email_body'                => '',
				'admin_confirm'                  => '',
				'admin_email_subject'            => '',
				'admin_email_to'                 => '',
				'admin_email_from'               => '',
				'admin_email_reply_to'           => '',
				'admin_email_reply_to_type'      => 'static',
				'admin_email_reply_to_dynamic'   => '',
				'admin_note'                     => '',
				'user_email_subject_type'        => 'static',
				'user_email_subject_meta_key'    => '',
				'user_message_type'              => 'static',
				'admin_email_subject_type'       => 'static',
				'admin_email_subject_meta_key'   => '',
				'admin_email_type'               => 'static',
				'admin_email_source'             => 'post_author',
				'admin_email_meta_key'           => '',
				'admin_message_type'             => 'static',
				'admin_message_input_name'       => '',
				'user_email_template'            => '',
				'admin_email_template'           => '',
				'overwrite_default_confirmation' => '',
				'overwrite_default_notification' => '',
				'use_captcha'                    => '',
				'max_size_file'                  => '',
				'allowed_extensions'             => '',
				'integrations'                   => array(),
				'variable_mapping'               => array(),
			)
		);

		$static_defaults = array(
			'user_email_reply_to_type'  => 'static',
			'user_email_subject_type'   => 'static',
			'user_message_type'         => 'static',
			'admin_email_reply_to_type' => 'static',
			'admin_email_subject_type'  => 'static',
			'admin_email_type'          => 'static',
			'admin_message_type'        => 'static',
		);

		foreach ( $static_defaults as $key => $default ) {
			if ( empty( $params[ $key ] ) ) {
				$params[ $key ] = $default;
			}
		}

		if ( empty( $params['entry_title_type'] ) ) {
			$params['entry_title_type'] = 'form';
		}

		if ( empty( $params['admin_email_source'] ) ) {
			$params['admin_email_source'] = 'post_author';
		}

		if ( ! is_array( $params['variable_mapping'] ) ) {
			$params['variable_mapping'] = array();
		}

		if ( ! isset( $params['integrations'] ) || ! is_array( $params['integrations'] ) ) {
			$params['integrations'] = array();
		}

		return $params;
	}

	/**
	 * Create Form Action
	 *
	 * @param array $params Form Action Parameter.
	 *
	 * @return array
	 */
	public static function create_form_action( $params ) {
		$owner_post_id     = isset( $params['owner_post_id'] ) ? absint( $params['owner_post_id'] ) : 0;
		$owner_instance_id = isset( $params['owner_instance_id'] ) ? self::sanitize_form_instance_id( $params['owner_instance_id'] ) : '';

		unset( $params['owner_post_id'], $params['owner_instance_id'] );

		$params = self::normalize_form_action_params( $params );
		unset( $params['id'] );

		$form_data = array(
			'post_title'  => $params['title'],
			'post_status' => 'publish',
			'post_type'   => self::POST_TYPE,
			'meta_input'  => array(
				'form-data' => $params,
			),
		);

		$form_id = wp_insert_post( $form_data );

		if ( ! is_wp_error( $form_id ) && $form_id && $owner_post_id && ! empty( $owner_instance_id ) ) {
			self::update_form_action_owner( $form_id, $owner_post_id, $owner_instance_id );
		}

		return $form_id;
	}

	/**
	 * Edit Form Action
	 *
	 * @param array $params Form Action Parameter.
	 *
	 * @return array
	 */
	public static function edit_form_action( $params ) {
		$params = self::normalize_form_action_params( $params );

		update_post_meta(
			$params['id'],
			'form-data',
			array(
				'require_login'                  => $params['require_login'],
				'user_browser'                   => $params['user_browser'],
				'form_success_notice'            => $params['form_success_notice'],
				'form_error_notice'              => $params['form_error_notice'],
				'entry_title_type'                => isset( $params['entry_title_type'] ) ? $params['entry_title_type'] : 'form',
				'entry_title_static_text'         => isset( $params['entry_title_static_text'] ) ? $params['entry_title_static_text'] : '',
				'entry_title_input_name'          => isset( $params['entry_title_input_name'] ) ? $params['entry_title_input_name'] : '',
				'entry_title_custom_format'       => isset( $params['entry_title_custom_format'] ) ? $params['entry_title_custom_format'] : '',
				'user_confirm'                   => $params['user_confirm'],
				'auto_select_email'              => $params['auto_select_email'],
				'email_input_name'               => $params['email_input_name'],
				'user_email_subject'             => $params['user_email_subject'],
				'user_email_form'                => $params['user_email_form'],
				'user_email_reply_to'            => $params['user_email_reply_to'],
				'user_email_reply_to_type'       => isset( $params['user_email_reply_to_type'] ) ? $params['user_email_reply_to_type'] : 'static',
				'user_email_reply_to_dynamic'    => isset( $params['user_email_reply_to_dynamic'] ) ? $params['user_email_reply_to_dynamic'] : '',
				'user_email_body'                => $params['user_email_body'],
				'admin_confirm'                  => $params['admin_confirm'],
				'admin_email_subject'            => $params['admin_email_subject'],
				'admin_email_to'                 => $params['admin_email_to'],
				'admin_email_from'               => $params['admin_email_from'],
				'admin_email_reply_to'           => $params['admin_email_reply_to'],
				'admin_email_reply_to_type'      => isset( $params['admin_email_reply_to_type'] ) ? $params['admin_email_reply_to_type'] : 'static',
				'admin_email_reply_to_dynamic'   => isset( $params['admin_email_reply_to_dynamic'] ) ? $params['admin_email_reply_to_dynamic'] : '',
				'admin_note'                     => $params['admin_note'],
				'user_email_subject_type'        => isset( $params['user_email_subject_type'] ) ? $params['user_email_subject_type'] : 'static',
				'user_email_subject_meta_key'    => isset( $params['user_email_subject_meta_key'] ) ? $params['user_email_subject_meta_key'] : '',
				'user_message_type'              => isset( $params['user_message_type'] ) ? $params['user_message_type'] : 'static',
				'admin_email_subject_type'       => isset( $params['admin_email_subject_type'] ) ? $params['admin_email_subject_type'] : 'static',
				'admin_email_subject_meta_key'   => isset( $params['admin_email_subject_meta_key'] ) ? $params['admin_email_subject_meta_key'] : '',
				'admin_email_type'               => isset( $params['admin_email_type'] ) ? $params['admin_email_type'] : 'static',
				'admin_email_source'             => isset( $params['admin_email_source'] ) ? $params['admin_email_source'] : 'post_author',
				'admin_email_meta_key'           => isset( $params['admin_email_meta_key'] ) ? $params['admin_email_meta_key'] : '',
				'admin_message_type'             => isset( $params['admin_message_type'] ) ? $params['admin_message_type'] : 'static',
				'admin_message_input_name'       => isset( $params['admin_message_input_name'] ) ? $params['admin_message_input_name'] : '',
				'user_email_template'            => isset( $params['user_email_template'] ) ? $params['user_email_template'] : '',
				'admin_email_template'           => isset( $params['admin_email_template'] ) ? $params['admin_email_template'] : '',
				'overwrite_default_confirmation' => $params['overwrite_default_confirmation'],
				'overwrite_default_notification' => $params['overwrite_default_notification'],
				'use_captcha'                    => $params['use_captcha'],
				'max_size_file'                  => $params['max_size_file'],
				'allowed_extensions'             => $params['allowed_extensions'],
				'integrations'                   => isset( $params['integrations'] ) ? $params['integrations'] : array(),
				'variable_mapping'               => isset( $params['variable_mapping'] ) ? $params['variable_mapping'] : array(),
			)
		);

		// Update associated email template titles.
		$user_tpl_id  = isset( $params['user_email_template'] ) ? (int) $params['user_email_template'] : 0;
		$admin_tpl_id = isset( $params['admin_email_template'] ) ? (int) $params['admin_email_template'] : 0;

		if ( $user_tpl_id && Email_Template::POST_TYPE === get_post_type( $user_tpl_id ) ) {
			wp_update_post(
				array(
					'ID'         => $user_tpl_id,
					'post_title' => $params['title'] . ' - ' . __( 'Confirmation', 'gutenverse-form' ),
				)
			);
		}

		if ( $admin_tpl_id && Email_Template::POST_TYPE === get_post_type( $admin_tpl_id ) ) {
			wp_update_post(
				array(
					'ID'         => $admin_tpl_id,
					'post_title' => $params['title'] . ' - ' . __( 'Notification', 'gutenverse-form' ),
				)
			);
		}

		return wp_update_post(
			array(
				'ID'         => $params['id'],
				'post_title' => $params['title'],
			)
		);
	}

	/**
	 * Delete Form Action
	 *
	 * @param integer $id                Delete Form Action.
	 * @param integer $owner_post_id     Owner post ID.
	 * @param string  $owner_instance_id Owner instance ID.
	 *
	 * @return mixed
	 */
	public static function delete_form_action( $id, $owner_post_id = 0, $owner_instance_id = '' ) {
		$id                = absint( $id );
		$owner_post_id     = absint( $owner_post_id );
		$owner_instance_id = self::sanitize_form_instance_id( $owner_instance_id );
		$post              = get_post( $id );

		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return new WP_Error(
				'forbidden_permission',
				esc_html__( 'Forbidden Access: Target form action does not exist.', 'gutenverse-form' ),
				array( 'status' => 403 )
			);
		}

		$reference_count = self::get_form_action_reference_count( $id );
		$owner           = self::get_form_action_owner( $id );
		$has_requester   = $owner_post_id && ! empty( $owner_instance_id );

		if ( $reference_count > 0 && ! $has_requester ) {
			return new WP_Error(
				'form_action_in_use',
				__( 'This form action is still used by a form builder and cannot be deleted from here.', 'gutenverse-form' ),
				array(
					'status'     => 409,
					'references' => $reference_count,
				)
			);
		}

		if ( $reference_count > 1 ) {
			return new WP_Error(
				'form_action_in_use',
				__( 'This form action is still used by more than one form builder. Create private copies or remove the other references before deleting it.', 'gutenverse-form' ),
				array(
					'status'     => 409,
					'references' => $reference_count,
				)
			);
		}

		if ( self::has_form_action_owner( $owner ) && $has_requester && ! self::is_matching_form_action_owner( $owner, $owner_post_id, $owner_instance_id ) ) {
			return new WP_Error(
				'form_action_owner_mismatch',
				__( 'This form action belongs to another form builder and cannot be deleted from this form.', 'gutenverse-form' ),
				array( 'status' => 403 )
			);
		}

		return wp_delete_post( $id, true );
	}

	/**
	 * Duplicate email templates attached to a cloned form action.
	 *
	 * @param array   $meta               Form action meta.
	 * @param integer $new_form_action_id New form action ID.
	 * @param string  $new_form_title     New form action title.
	 *
	 * @return array|WP_Error
	 */
	private static function duplicate_email_templates_for_cloned_action( $meta, $new_form_action_id, $new_form_title ) {
		if ( ! is_array( $meta ) || ! $new_form_action_id ) {
			return $meta;
		}

		$template_fields  = array( 'user_email_template', 'admin_email_template' );
		$template_map     = array();
		$cloned_templates = array();

		foreach ( $template_fields as $field_name ) {
			$template_id = ! empty( $meta[ $field_name ] ) ? absint( $meta[ $field_name ] ) : 0;

			if ( ! $template_id ) {
				continue;
			}

			if ( ! isset( $template_map[ $template_id ] ) ) {
				$cloned_template_id = self::duplicate_email_template_for_cloned_action(
					$template_id,
					$new_form_action_id,
					$new_form_title,
					$field_name
				);

				if ( is_wp_error( $cloned_template_id ) ) {
					foreach ( $cloned_templates as $created_template_id ) {
						wp_delete_post( $created_template_id, true );
					}

					return $cloned_template_id;
				}

				if ( ! $cloned_template_id ) {
					continue;
				}

				$template_map[ $template_id ] = $cloned_template_id;
				$cloned_templates[]           = $cloned_template_id;
			}

			$meta[ $field_name ] = $template_map[ $template_id ];
		}

		return $meta;
	}

	/**
	 * Duplicate one email template post for a cloned form action.
	 *
	 * @param integer $template_id        Source email template ID.
	 * @param integer $new_form_action_id New form action ID.
	 * @param string  $new_form_title     New form action title.
	 * @param string  $field_name         Form action template field name.
	 *
	 * @return integer|WP_Error
	 */
	private static function duplicate_email_template_for_cloned_action( $template_id, $new_form_action_id, $new_form_title, $field_name ) {
		$template_id        = absint( $template_id );
		$new_form_action_id = absint( $new_form_action_id );
		$template           = get_post( $template_id );

		if ( ! $template || Email_Template::POST_TYPE !== $template->post_type ) {
			return 0;
		}

		$current_user_id = get_current_user_id();
		$template_type   = 'user_email_template' === $field_name
			? __( 'Confirmation', 'gutenverse-form' )
			: __( 'Notification', 'gutenverse-form' );
		$template_name   = trim( $new_form_title )
			? $new_form_title . ' - ' . $template_type
			: get_the_title( $template ) . esc_html__( ' Clone', 'gutenverse-form' );

		$new_template_id = wp_insert_post(
			array(
				'post_author'  => $current_user_id ? $current_user_id : (int) $template->post_author,
				'post_content' => $template->post_content,
				'post_excerpt' => $template->post_excerpt,
				'post_status'  => $template->post_status,
				'post_title'   => $template_name,
				'post_type'    => Email_Template::POST_TYPE,
			),
			true
		);

		if ( is_wp_error( $new_template_id ) ) {
			return $new_template_id;
		}

		if ( ! $new_template_id ) {
			return new WP_Error(
				'email_template_clone_failed',
				__( 'Could not duplicate the email template for this form action.', 'gutenverse-form' ),
				array( 'status' => 500 )
			);
		}

		$template_meta_keys = Email_Template::get_meta_keys();

		foreach ( $template_meta_keys as $meta_key ) {
			update_post_meta( $new_template_id, $meta_key, get_post_meta( $template_id, $meta_key, true ) );
		}

		update_post_meta( $new_template_id, Email_Template::META_FORM_ACTION, (string) $new_form_action_id );

		return absint( $new_template_id );
	}

	/**
	 * Clone Form Action
	 *
	 * @param integer $id                Form Action ID.
	 * @param integer $owner_post_id     Owner post ID.
	 * @param string  $owner_instance_id Owner instance ID.
	 *
	 * @return mixed
	 */
	public static function clone_form_action( $id, $owner_post_id = 0, $owner_instance_id = '' ) {
		$id                = absint( $id );
		$owner_post_id     = absint( $owner_post_id );
		$owner_instance_id = self::sanitize_form_instance_id( $owner_instance_id );
		$post              = get_post( $id );

		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return new WP_Error(
				'invalid_form_action',
				__( 'This form action does not exist on this site.', 'gutenverse-form' ),
				array( 'status' => 404 )
			);
		}

		$title     = get_the_title( $post );
		$meta      = get_post_meta( $id, 'form-data', true );
		$new_title = $title . esc_html__( ' Clone', 'gutenverse-form' );

		if ( ! is_array( $meta ) ) {
			$meta = array();
		}

		$new_form_action_id = self::create_form_action(
			array_merge(
				$meta,
				array(
					'title'             => $new_title,
					'owner_post_id'     => $owner_post_id,
					'owner_instance_id' => $owner_instance_id,
				)
			)
		);

		if ( is_wp_error( $new_form_action_id ) ) {
			return $new_form_action_id;
		}

		if ( ! $new_form_action_id ) {
			return new WP_Error(
				'form_action_clone_failed',
				__( 'Could not duplicate this form action.', 'gutenverse-form' ),
				array( 'status' => 500 )
			);
		}

		$cloned_meta = get_post_meta( $new_form_action_id, 'form-data', true );
		$cloned_meta = self::duplicate_email_templates_for_cloned_action( $cloned_meta, $new_form_action_id, $new_title );

		if ( is_wp_error( $cloned_meta ) ) {
			wp_delete_post( $new_form_action_id, true );

			return $cloned_meta;
		}

		update_post_meta( $new_form_action_id, 'form-data', $cloned_meta );

		return $new_form_action_id;
	}
}
