<?php
/**
 * Entries class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Entries
 *
 * @package gutenverse-form
 */
class Entries {
	/**
	 * Post type
	 *
	 * @var string
	 */
	const POST_TYPE = 'gutenverse-entries';

	/**
	 * React entry list admin page slug.
	 *
	 * @var string
	 */
	const PAGE_SLUG = 'gutenverse-form-entries';

	/**
	 * Free entry list limit.
	 *
	 * @var int
	 */
	const FREE_ENTRY_LIMIT = 10;

	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'post_type' ), 9 );
		add_action( 'load-post.php', array( $this, 'protect_entry_detail_screen' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ) );
		add_action( 'admin_notices', array( $this, 'form_action_migration_notice' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( $this, 'custom_column' ), 10, 2 );
		add_action( 'pre_get_posts', array( $this, 'custom_column_query' ) );
		add_action( 'restrict_manage_posts', array( $this, 'filter_form_option' ), 10, 1 );

		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( $this, 'set_custom_column' ) );
		add_filter( 'manage_edit-' . self::POST_TYPE . '_sortable_columns', array( $this, 'sortable_columns' ) );
		add_filter( 'post_row_actions', array( $this, 'modify_row_actions' ), 10, 2 );
		add_filter( 'hidden_meta_boxes', array( $this, 'hide_meta_box' ), 10, 2 );
		add_filter( 'posts_join', array( $this, 'search_join' ) );
		add_filter( 'posts_where', array( $this, 'search_where' ) );
		add_filter( 'posts_groupby', array( $this, 'search_groupby' ) );

		add_action( 'wp_ajax_gutenverse_form_retrigger_integration', array( $this, 'retrigger_integration' ) );
		add_action( 'admin_footer', array( $this, 'admin_footer_scripts' ) );
	}

	/**
	 * Get the React entry list admin URL.
	 *
	 * @param array $args Optional query args.
	 *
	 * @return string
	 */
	public static function get_admin_page_url( $args = array() ) {
		return add_query_arg(
			array_merge(
				array(
					'page' => self::PAGE_SLUG,
				),
				$args
			),
			admin_url( 'admin.php' )
		);
	}

	/**
	 * Render the React entry list page.
	 */
	public function render_entry_list_page() {
		?>
		<div class="wrap">
			<div id="gutenverse-form-entry-list"></div>
		</div>
		<?php
	}

	/**
	 * Check whether Gutenverse PRO is active.
	 *
	 * @return bool
	 */
	private static function has_pro_plugin() {
		return function_exists( 'gutenverse_pro_active' ) && gutenverse_pro_active();
	}

	/**
	 * Get entry list capability flags.
	 *
	 * @return array
	 */
	public static function get_entry_list_capabilities() {
		$has_license  = self::has_pro_plugin() && ! empty( get_option( 'gutenverse-license', '' ) );
		$capabilities = array(
			'viewAll'      => false,
			'export'       => false,
			'filter'       => false,
			'olderDetails' => false,
		);

		$capabilities['viewAll']      = (bool) apply_filters( 'gutenverse_form_entry_list_can_view_all', $capabilities['viewAll'], $has_license );
		$capabilities['export']       = (bool) apply_filters( 'gutenverse_form_entry_list_can_export', $capabilities['export'], $has_license );
		$capabilities['filter']       = (bool) apply_filters( 'gutenverse_form_entry_list_can_filter', $capabilities['filter'], $has_license );
		$capabilities['olderDetails'] = (bool) apply_filters( 'gutenverse_form_entry_list_can_view_older_details', $capabilities['olderDetails'], $has_license );

		$capabilities = wp_parse_args(
			apply_filters( 'gutenverse_form_entry_list_capabilities', $capabilities, $has_license ),
			array(
				'viewAll'      => false,
				'export'       => false,
				'filter'       => false,
				'olderDetails' => false,
			)
		);

		return array_map( 'boolval', $capabilities );
	}

	/**
	 * Get JS config for the entry list.
	 *
	 * @param array $config Existing Gutenverse config.
	 *
	 * @return array
	 */
	public static function get_entry_list_config( $config = array() ) {
		return array(
			'apiPath'       => '/gutenverse-form-client/v1/entries',
			'exportUrl'     => add_query_arg( '_wpnonce', wp_create_nonce( 'wp_rest' ), rest_url( '/gutenverse-form-client/v1/entries/export' ) ),
			'limit'         => self::FREE_ENTRY_LIMIT,
			'pageUrl'       => self::get_admin_page_url(),
			'nativeListUrl' => admin_url( 'edit.php?post_type=' . self::POST_TYPE ),
			'licenseUrl'    => admin_url( 'admin.php?page=gutenverse&path=license' ),
			'upgradeProUrl' => isset( $config['upgradeProUrl'] ) ? $config['upgradeProUrl'] : '',
			'capabilities'  => self::get_entry_list_capabilities(),
		);
	}

	/**
	 * Enqueue Script
	 */
	public function enqueue_script() {
		$screen = get_current_screen();

		if ( self::POST_TYPE === $screen->post_type ) {
			wp_enqueue_style(
				'gutenverse-entries',
				GUTENVERSE_FORM_URL . '/assets/css/form.css',
				null,
				GUTENVERSE_FORM_VERSION
			);
		}
	}

	/**
	 * Get integration label from service id.
	 *
	 * @param string $service Integration service slug.
	 *
	 * @return string
	 */
	private function get_integration_label( $service ) {
		$labels = array(
			'whatsapp'         => 'WhatsApp',
			'telegram'         => 'Telegram',
			'discord'          => 'Discord',
			'mailchimp'        => 'Mail Chimp',
			'slack'            => 'Slack',
			'webhook'          => 'Webhook',
			'get_response'     => 'GetResponse',
			'drip'             => 'Drip',
			'active_campaign'  => 'Active Campaign',
			'convert_kit'      => 'Kit (Convert Kit)',
			'mailer'           => 'Mailer',
			'google_sheets'    => 'Google Sheets',
		);

		return isset( $labels[ $service ] ) ? $labels[ $service ] : ucfirst( str_replace( '_', ' ', (string) $service ) );
	}

	/**
	 * Render a compact integration icon for entry UI.
	 *
	 * @param string $service Integration service slug.
	 *
	 * @return string
	 */
	private function render_integration_icon( $service ) {
		$icon_map = array(
			'whatsapp'        => array( 'label' => 'WA', 'bg' => '#25D366', 'color' => '#ffffff' ),
			'telegram'        => array( 'label' => 'TG', 'bg' => '#229ED9', 'color' => '#ffffff' ),
			'discord'         => array( 'label' => 'DS', 'bg' => '#5865F2', 'color' => '#ffffff' ),
			'mailchimp'       => array( 'label' => 'MC', 'bg' => '#FFE01B', 'color' => '#111827' ),
			'slack'           => array( 'label' => 'SL', 'bg' => '#4A154B', 'color' => '#ffffff' ),
			'webhook'         => array( 'label' => 'WH', 'bg' => '#F0F1F4', 'color' => '#111827' ),
			'get_response'    => array( 'label' => 'GR', 'bg' => '#00A2FF', 'color' => '#ffffff' ),
			'drip'            => array( 'label' => 'DR', 'bg' => '#F224F1', 'color' => '#ffffff' ),
			'active_campaign' => array( 'label' => 'AC', 'bg' => '#356AE6', 'color' => '#ffffff' ),
			'convert_kit'     => array( 'label' => 'KT', 'bg' => '#44B1FF', 'color' => '#ffffff' ),
			'mailer'          => array( 'label' => 'ML', 'bg' => '#00C875', 'color' => '#ffffff' ),
			'google_sheets'   => array( 'label' => 'GS', 'bg' => '#34A853', 'color' => '#ffffff' ),
		);
		$icon     = isset( $icon_map[ $service ] ) ? $icon_map[ $service ] : array(
			'label' => strtoupper( substr( preg_replace( '/[^a-z0-9]/i', '', (string) $service ), 0, 2 ) ),
			'bg'    => '#94A3B8',
			'color' => '#ffffff',
		);

		return '<span class="integration-service-icon" aria-hidden="true" style="background:' . esc_attr( $icon['bg'] ) . ';color:' . esc_attr( $icon['color'] ) . ';">' . esc_html( $icon['label'] ) . '</span>';
	}

	/**
	 * Render form action migration notice on entries list page.
	 */
	public function form_action_migration_notice() {
		$screen = get_current_screen();

		if ( ! $screen || 'edit-' . self::POST_TYPE !== $screen->id ) {
			return;
		}

		Form::render_form_action_migration_notice();
		?>
		<style>
			.gutenverse-form-action-migration-notice{align-items:flex-start;background:#eef4ff;border:1px solid #93c5fd;border-radius:8px;color:#1f2937;display:flex;gap:16px;justify-content:space-between;margin:10px 20px 18px 0;padding:16px 18px 16px 20px;position:relative}
			.gutenverse-form-action-migration-notice:before{background:#2563eb;border-radius:8px 0 0 8px;bottom:-1px;content:"";display:block;left:-1px;position:absolute;top:-1px;width:4px}
			.gutenverse-form-action-migration-notice.is-hidden{display:none}
			.gutenverse-form-action-migration-notice strong{color:#111827;display:block;font-size:14px;font-weight:800;line-height:1.35;margin:0 0 5px}
			.gutenverse-form-action-migration-notice p{color:#475467;font-size:13px;line-height:1.45;margin:0;max-width:820px}
			.gutenverse-form-action-migration-notice button{align-items:center;background:#fff;border:1px solid #bfdbfe;border-radius:4px;color:#475467;cursor:pointer;display:inline-flex;font-size:18px;height:28px;justify-content:center;line-height:1;margin:-2px -2px 0 0;padding:0;width:28px}
			.gutenverse-form-action-migration-notice button:hover,.gutenverse-form-action-migration-notice button:focus{background:#dbeafe;border-color:#60a5fa;color:#1d4ed8;outline:none}
		</style>
		<script>
			document.addEventListener('DOMContentLoaded', function() {
				var notices = document.querySelectorAll('[data-form-action-migration-notice]');

				notices.forEach(function(notice) {
					var dismiss = notice.querySelector('[data-form-action-migration-dismiss]');

					if (dismiss) {
						dismiss.addEventListener('click', function() {
							var data = new window.FormData();

							notice.classList.add('is-hidden');
							data.append('action', 'gutenverse_form_action_migration_notice_close');
							data.append('nonce', dismiss.getAttribute('data-nonce'));

							window.fetch(window.ajaxurl, {
								method: 'POST',
								credentials: 'same-origin',
								body: data
							});
						});
					}
				});
			});
		</script>
		<?php
	}

	/**
	 * Add filter for form option
	 *
	 * @param string $post_type .
	 */
	public function filter_form_option( $post_type ) {
		if ( self::POST_TYPE === $post_type ) {
			$selected       = isset( $_GET['form_id'] ) ? (int) $_GET['form_id'] : '';
			$date_filter    = isset( $_GET['m'] ) ? sanitize_text_field( wp_unslash( $_GET['m'] ) ) : '';
			$forms          = self::get_form_list();
			$export_base    = rest_url( '/gutenverse-form-client/v1/form-action/export/' );
			$export_nonce   = wp_create_nonce( 'wp_rest' );
			$export_label   = $selected ? __( 'Export to CSV', 'gutenverse-form' ) : __( 'Export to CSV? Select a Form Action', 'gutenverse-form' );
			$export_args    = array( '_wpnonce' => $export_nonce );
			$export_args    = $date_filter ? array_merge( $export_args, array( 'm' => $date_filter ) ) : $export_args;
			$export_url     = $selected ? add_query_arg( $export_args, $export_base . $selected ) : '';
			$export_classes = $selected ? 'button button-secondary gutenverse-export-entries-link' : 'button button-secondary gutenverse-export-entries-link disabled';
			?>
			<select name='form_id'>
				<option value=''><?php esc_html_e( 'All Form', 'gutenverse-form' ); ?></option>
			<?php
			foreach ( $forms as $form ) {
				echo wp_kses(
					sprintf(
						'<option value="%s"%s>%s</option>',
						$form->ID,
						(int) $selected === (int) $form->ID ? ' selected="selected"' : '',
						$form->post_title
					),
					array(
						'option' => array(
							'value'    => true,
							'selected' => true,
						),
					)
				);
			}
			?>
			</select>
			<a
				class="<?php echo esc_attr( $export_classes ); ?>"
				href="<?php echo esc_url( $export_url ); ?>"
				id="gutenverse-export-entries-link"
				<?php echo $selected ? '' : 'aria-disabled="true"'; ?>
			>
				<?php echo esc_html( $export_label ); ?>
			</a>
			<script>
				document.addEventListener('DOMContentLoaded', function() {
					var formSelect = document.querySelector('select[name="form_id"]');
					var exportLink = document.getElementById('gutenverse-export-entries-link');

					if (!formSelect || !exportLink) {
						return;
					}

					exportLink.addEventListener('click', function(event) {
						if (exportLink.classList.contains('disabled')) {
							event.preventDefault();
						}
					});
				});
			</script>
			<?php
		}
	}

	/**
	 * Get form title
	 */
	private static function get_form_list() {
		$args = array(
			'post_type'      => Form::POST_TYPE,
			'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		);

		wp_reset_postdata();
		$posts = get_posts( $args );
		wp_reset_postdata();

		return $posts;
	}

	/**
	 * Get form options for the React entry list filter.
	 *
	 * @return array
	 */
	private static function get_form_options() {
		$forms = array();

		foreach ( self::get_form_list() as $form ) {
			$forms[] = array(
				'id'    => (int) $form->ID,
				'title' => get_the_title( $form ),
			);
		}

		return $forms;
	}

	/**
	 * Get latest entry IDs available to free users.
	 *
	 * @return array
	 */
	private static function get_limited_entry_ids() {
		$ids = get_posts(
			array(
				'post_type'              => self::POST_TYPE,
				'post_status'            => array( 'publish' ),
				'posts_per_page'         => self::FREE_ENTRY_LIMIT,
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		return array_map( 'intval', $ids );
	}

	/**
	 * Check if an entry detail is available.
	 *
	 * @param int $entry_id Entry ID.
	 *
	 * @return bool
	 */
	public static function can_view_entry_detail( $entry_id ) {
		$capabilities = self::get_entry_list_capabilities();

		if ( ! empty( $capabilities['olderDetails'] ) ) {
			return true;
		}

		return in_array( (int) $entry_id, self::get_limited_entry_ids(), true );
	}

	/**
	 * Redirect free users away from older entry detail URLs.
	 */
	public function protect_entry_detail_screen() {
		$entry_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action   = isset( $_GET['action'] ) ? sanitize_key( wp_unslash( $_GET['action'] ) ) : 'edit'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( ! $entry_id || 'edit' !== $action || self::POST_TYPE !== get_post_type( $entry_id ) ) {
			return;
		}

		if ( self::can_view_entry_detail( $entry_id ) ) {
			return;
		}

		wp_safe_redirect(
			self::get_admin_page_url(
				array(
					'entry_access' => 'locked',
				)
			)
		);
		exit;
	}

	/**
	 * Build entry list query args.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @param array            $capabilities Entry list capabilities.
	 * @param bool             $export Whether this query is for export.
	 *
	 * @return array
	 */
	private static function get_entry_query_args( $request, $capabilities, $export = false ) {
		$view     = sanitize_key( (string) $request->get_param( 'view' ) );
		$view_all = ! empty( $capabilities['viewAll'] ) && 'all' === $view;
		$per_page = $view_all ? absint( $request->get_param( 'per_page' ) ) : self::FREE_ENTRY_LIMIT;
		$per_page = $per_page ? min( $per_page, self::FREE_ENTRY_LIMIT ) : self::FREE_ENTRY_LIMIT;
		$page     = $view_all ? max( 1, absint( $request->get_param( 'page' ) ) ) : 1;

		if ( $export ) {
			$view_all = true;
			$per_page = -1;
			$page     = 1;
		}

		$args = array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => array( 'publish' ),
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		if ( ! empty( $capabilities['filter'] ) && $view_all ) {
			$form_id = absint( $request->get_param( 'form_id' ) );
			$month   = sanitize_text_field( (string) $request->get_param( 'month' ) );
			$search  = sanitize_text_field( (string) $request->get_param( 'search' ) );

			if ( $form_id ) {
				$args['meta_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'     => 'form-id',
						'compare' => '=',
						'value'   => $form_id,
					),
				);
			}

			if ( preg_match( '/^\d{4}-\d{2}$/', $month ) ) {
				$args['year']     = (int) substr( $month, 0, 4 );
				$args['monthnum'] = (int) substr( $month, 5, 2 );
			}

			if ( '' !== $search ) {
				$args['s'] = $search;
			}
		}

		return apply_filters( 'gutenverse_form_entry_list_query_args', $args, $request, $capabilities, $export );
	}

	/**
	 * Normalize an entry value to plain text.
	 *
	 * @param mixed $value Entry value.
	 *
	 * @return string
	 */
	private static function entry_value_text( $value ) {
		if ( is_array( $value ) ) {
			return implode( ', ', array_map( 'strval', $value ) );
		}

		return (string) $value;
	}

	/**
	 * Prepare one entry for the React list.
	 *
	 * @param \WP_Post $post Entry post.
	 *
	 * @return array
	 */
	private static function prepare_entry_for_list( $post ) {
		$form_id       = (int) get_post_meta( $post->ID, 'form-id', true );
		$ref_id        = (int) get_post_meta( $post->ID, 'post-id', true );
		$entry_data    = get_post_meta( $post->ID, 'entry-data', true );
		$entry_data    = is_array( $entry_data ) ? $entry_data : array();
		$preview       = array();
		$detail_access = self::can_view_entry_detail( $post->ID );

		foreach ( array_slice( $entry_data, 0, 3 ) as $item ) {
			$preview[] = array(
				'id'    => isset( $item['id'] ) ? (string) $item['id'] : '',
				'value' => self::entry_value_text( isset( $item['value'] ) ? $item['value'] : '' ),
			);
		}

		return array(
			'id'              => (int) $post->ID,
			'title'           => get_the_title( $post ),
			'date'            => get_the_date( '', $post ),
			'dateGmt'         => get_gmt_from_date( $post->post_date ),
			'formId'          => $form_id,
			'formTitle'       => $form_id ? get_the_title( $form_id ) : __( 'No form', 'gutenverse-form' ),
			'referralId'      => $ref_id,
			'referralTitle'   => $ref_id ? get_the_title( $ref_id ) : __( 'No referral', 'gutenverse-form' ),
			'referralUrl'     => $ref_id ? get_permalink( $ref_id ) : '',
			'fieldsCount'     => count( $entry_data ),
			'preview'         => $preview,
			'canViewDetail'   => $detail_access,
			'detailUrl'       => $detail_access ? admin_url( 'post.php?post=' . (int) $post->ID . '&action=edit' ) : '',
			'lockedDetail'    => ! $detail_access,
		);
	}

	/**
	 * Get entries for the React admin list.
	 *
	 * @param \WP_REST_Request $request REST request.
	 *
	 * @return array
	 */
	public static function get_entries_for_admin( $request ) {
		$capabilities = self::get_entry_list_capabilities();
		$args         = self::get_entry_query_args( $request, $capabilities );
		$query        = new \WP_Query( $args );
		$entries      = array();

		foreach ( $query->posts as $post ) {
			$entries[] = self::prepare_entry_for_list( $post );
		}

		wp_reset_postdata();

		$view = sanitize_key( (string) $request->get_param( 'view' ) );

		$is_limited = empty( $capabilities['viewAll'] ) || 'all' !== $view;

		return array(
			'entries'      => $entries,
			'total'        => $is_limited ? count( $entries ) : (int) $query->found_posts,
			'totalPages'   => $is_limited ? 1 : (int) $query->max_num_pages,
			'page'         => isset( $args['paged'] ) ? (int) $args['paged'] : 1,
			'perPage'      => isset( $args['posts_per_page'] ) ? (int) $args['posts_per_page'] : self::FREE_ENTRY_LIMIT,
			'limit'        => self::FREE_ENTRY_LIMIT,
			'limited'      => $is_limited,
			'forms'        => ! empty( $capabilities['filter'] ) ? self::get_form_options() : array(),
			'capabilities' => $capabilities,
		);
	}

	/**
	 * Delete one entry from the React admin list.
	 *
	 * @param \WP_REST_Request $request REST request.
	 *
	 * @return array|\WP_Error
	 */
	public static function delete_entry_for_admin( $request ) {
		$entry_id = absint( $request->get_param( 'id' ) );

		if ( ! $entry_id || self::POST_TYPE !== get_post_type( $entry_id ) ) {
			return new \WP_Error(
				'gutenverse_form_entry_not_found',
				__( 'Entry not found.', 'gutenverse-form' ),
				array( 'status' => 404 )
			);
		}

		if ( ! current_user_can( 'delete_post', $entry_id ) ) {
			return new \WP_Error(
				'gutenverse_form_entry_delete_forbidden',
				__( 'You do not have permission to delete this entry.', 'gutenverse-form' ),
				array( 'status' => 403 )
			);
		}

		$deleted = wp_delete_post( $entry_id, true );

		if ( ! $deleted ) {
			return new \WP_Error(
				'gutenverse_form_entry_delete_failed',
				__( 'Could not delete entry. Please try again.', 'gutenverse-form' ),
				array( 'status' => 500 )
			);
		}

		return array(
			'deleted' => true,
			'id'      => $entry_id,
		);
	}

	/**
	 * Export entries from the React list.
	 *
	 * @param \WP_REST_Request $request REST request.
	 *
	 * @return \WP_Error|void
	 */
	public static function export_entries_for_admin( $request ) {
		$capabilities = self::get_entry_list_capabilities();

		if ( empty( $capabilities['export'] ) ) {
			return new \WP_Error(
				'gutenverse_form_entry_export_locked',
				__( 'Exporting entries requires Gutenverse PRO.', 'gutenverse-form' ),
				array( 'status' => 403 )
			);
		}

		$args               = self::get_entry_query_args( $request, $capabilities, true );
		$query              = new \WP_Query( $args );
		$field_keys         = array();
		$prepared_entry_map = array();

		foreach ( $query->posts as $post ) {
			$entry_data = get_post_meta( $post->ID, 'entry-data', true );
			$entry_data = is_array( $entry_data ) ? $entry_data : array();
			$values     = array();

			foreach ( $entry_data as $item ) {
				if ( empty( $item['id'] ) ) {
					continue;
				}

				$key            = (string) $item['id'];
				$field_keys[]   = $key;
				$values[ $key ] = self::entry_value_text( isset( $item['value'] ) ? $item['value'] : '' );
			}

			$prepared_entry_map[ $post->ID ] = $values;
		}

		$field_keys = array_values( array_unique( $field_keys ) );
		$filename   = 'gutenverse-form-entries-' . gmdate( 'Y-m-d-His' ) . '.csv';

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=' . $filename );

		$output = fopen( 'php://output', 'w' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		fputcsv( $output, array_merge( array( 'Entry ID', 'Date', 'Title', 'Form', 'Referral' ), $field_keys ) );

		foreach ( $query->posts as $post ) {
			$form_id  = (int) get_post_meta( $post->ID, 'form-id', true );
			$ref_id   = (int) get_post_meta( $post->ID, 'post-id', true );
			$row      = array(
				$post->ID,
				get_the_date( '', $post ),
				get_the_title( $post ),
				$form_id ? get_the_title( $form_id ) : '',
				$ref_id ? get_the_title( $ref_id ) : '',
			);
			$values   = isset( $prepared_entry_map[ $post->ID ] ) ? $prepared_entry_map[ $post->ID ] : array();

			foreach ( $field_keys as $field_key ) {
				$row[] = isset( $values[ $field_key ] ) ? $values[ $field_key ] : '';
			}

			fputcsv( $output, $row );
		}

		fclose( $output ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		wp_reset_postdata();
		exit;
	}

	/**
	 * Hide parent metaboxes
	 *
	 * @param array $hidden .
	 * @param -     $screen .
	 *
	 * @return array
	 */
	public function hide_meta_box( $hidden, $screen ) {
		if ( self::POST_TYPE === $screen->post_type ) {
			$hidden[] = 'submitdiv';
			$hidden[] = 'pageparentdiv';
		}

		return $hidden;
	}

	/**
	 * Edit row actions
	 *
	 * @param array  $actions .
	 * @param object $post .
	 *
	 * @return array
	 */
	public function modify_row_actions( $actions, $post ) {
		// Check for your post type.
		if ( self::POST_TYPE === $post->post_type && ! empty( $actions['trash'] ) ) {
			$trash   = $actions['trash'];
			$actions = array();
			$url     = admin_url( '/post.php?post=' . $post->ID );
			$link    = add_query_arg( array( 'action' => 'edit' ), $url );

			$actions = array(
				'view' => sprintf(
					'<a href="%1$s">%2$s</a>',
					esc_url( $link ),
					esc_html( __( 'View', 'contact-form-7' ) )
				),
			);

			$actions['trash'] = $trash;
		}

		return $actions;
	}

	/**
	 * Post Join.
	 *
	 * @param string $join .
	 *
	 * @return string
	 */
	public function search_join( $join ) {
		global $pagenow, $wpdb;

		if ( ! is_admin() || 'edit.php' !== $pagenow ) {
			return $join;
		}

		$post_type = isset( $_GET['post_type'] ) ? wp_kses( wp_unslash( $_GET['post_type'] ), wp_kses_allowed_html() ) : '';

		if ( self::POST_TYPE === $post_type ) {
			try {
				$search = get_search_query();
				if ( ! empty( $search ) ) {
					$join .= 'LEFT JOIN ' . $wpdb->postmeta . ' as pm1 ON ' . $wpdb->posts . '.ID = pm1.post_id ';
				}
			} catch ( \Throwable $th ) {
				return $join;
			}
		}
		return $join;
	}

	/**
	 * Post Where.
	 *
	 * @param string $where .
	 *
	 * @return string
	 */
	public function search_where( $where ) {
		global $pagenow, $wpdb;

		if ( ! is_admin() || 'edit.php' !== $pagenow ) {
			return $where;
		}

		$post_type = isset( $_GET['post_type'] ) ? wp_kses( wp_unslash( $_GET['post_type'] ), wp_kses_allowed_html() ) : '';

		if ( self::POST_TYPE === $post_type ) {
			$search = get_search_query();

			if ( ! empty( $search ) ) {
				try {
					$search = get_search_query();
					if ( ! empty( $search ) ) {
						$search_form = " ( SELECT ID from {$wpdb->posts} where {$wpdb->posts}.post_title LIKE '%{$search}%' ) ";
						$post_type   = self::POST_TYPE;

						$where = " AND ( {$wpdb->posts}.post_type = '{$post_type}' AND {$wpdb->posts}.post_title LIKE '%{$search}%' )
								OR ( pm1.meta_key = 'form-id' AND pm1.meta_value IN {$search_form} ) ";
					}
				} catch ( \Throwable $th ) {
					return $where;
				}
			}
		}

		return $where;
	}

	/**
	 * Post Group By.
	 *
	 * @param string $groupby .
	 *
	 * @return string
	 */
	public function search_groupby( $groupby ) {
		global $wpdb;

		$groupby = "{$wpdb->posts}.ID";

		return $groupby;
	}

	/**
	 * Sortable Column
	 *
	 * @param array $columns .
	 *
	 * @return array
	 */
	public function sortable_columns( $columns ) {
		$columns['form_parent'] = 'form_parent';
		$columns['post_parent'] = 'post_parent';
		return $columns;
	}

	/**
	 * Custom column query
	 *
	 * @param Query $query .
	 */
	public function custom_column_query( $query ) {
		if ( is_admin() && isset( $query->query['post_type'] ) && self::POST_TYPE === $query->query['post_type'] ) {
			$orderby = $query->get( 'orderby' );
			$form_id = isset( $_GET['form_id'] ) ? (int) $_GET['form_id'] : '';

			if ( (int) $form_id > 0 ) {
				$meta_query = array(
					array(
						'key'     => 'form-id',
						'compare' => '=',
						'value'   => $form_id,
					),
				);

				$query->set( 'meta_query', $meta_query );
			}

			if ( 'form_parent' === $orderby ) {
				$meta_query = array_merge(
					$meta_query,
					array(
						'relation' => 'OR',
						array(
							'key'     => 'form-id',
							'compare' => 'NOT EXISTS',
						),
						array(
							'key' => 'form-id',
						),
					)
				);

				$query->set( 'meta_query', $meta_query );
				$query->set( 'orderby', 'meta_value' );
			}

			wp_reset_postdata();
		}
	}

	/**
	 * Custom column.
	 *
	 * @param array $column .
	 * @param int   $post_id .
	 */
	public function custom_column( $column, $post_id ) {
		if ( 'form_parent' === $column ) {
			$form_id  = get_post_meta( $post_id, 'form-id', true );
			$title    = get_the_title( $form_id );
			$link     = self::get_admin_page_url( array( 'form_id' => $form_id ) );
			$form_ref = 0 !== (int) $form_id ? '<a href="' . $link . '">' . $title . '</a>' : __( 'no-form', 'gutenverse-form' );

			gutenverse_print_html( $form_ref );
		}

		if ( 'post_parent' === $column ) {
			$ref_id   = get_post_meta( $post_id, 'post-id', true );
			$title    = get_the_title( $ref_id );
			$link     = get_post_permalink( $ref_id );
			$form_ref = 0 !== (int) $ref_id ? '<a href="' . $link . '">' . $title . '</a>' : __( 'no-referral', 'gutenverse-form' );

			gutenverse_print_html( $form_ref );
		}
	}

	/**
	 * Set custom columns.
	 *
	 * @return array
	 */
	public function set_custom_column() {
		$columns['cb']          = __( 'Checkbox', 'gutenverse-form' );
		$columns['title']       = __( 'Title', 'gutenverse-form' );
		$columns['form_parent'] = __( 'Form', 'gutenverse-form' );
		$columns['post_parent'] = __( 'Referral', 'gutenverse-form' );
		$columns['date']        = __( 'Date', 'gutenverse-form' );

		return $columns;
	}

	/**
	 * Save Submitted Data
	 *
	 * @param array $params .
	 *
	 * @return int
	 */
	public static function submit_form_data( $params ) {
		$post_arr = array(
			'post_title'  => __( 'Entry', 'gutenverse-form' ),
			'post_status' => 'publish',
			'post_type'   => self::POST_TYPE,
			'meta_input'  => $params,
		);

		$result = wp_insert_post( $post_arr );

		if ( (int) $result > 0 ) {
			$update_title = array(
				'ID'         => $result,
				'post_title' => self::generate_entry_title( $result, $params ),
			);

			$result = wp_update_post( $update_title );
		}

		return $result;
	}

	/**
	 * Generate an entry title from form action settings.
	 *
	 * @param int   $entry_id Entry post ID.
	 * @param array $params Entry data.
	 *
	 * @return string
	 */
	private static function generate_entry_title( $entry_id, $params ) {
		$form_id    = isset( $params['form-id'] ) ? absint( $params['form-id'] ) : 0;
		$form_title = $form_id ? get_the_title( $form_id ) : '';
		$form_title = $form_title ? $form_title : __( 'Form', 'gutenverse-form' );
		$form_data  = $form_id ? get_post_meta( $form_id, 'form-data', true ) : array();
		$form_data  = is_array( $form_data ) ? $form_data : array();
		$type       = isset( $form_data['entry_title_type'] ) ? $form_data['entry_title_type'] : 'form';
		$title      = '';

		switch ( $type ) {
			case 'static':
				$static_text = isset( $form_data['entry_title_static_text'] ) ? $form_data['entry_title_static_text'] : '';
				$title       = self::format_entry_title_with_id( $static_text ? $static_text : $form_title, $entry_id );
				break;
			case 'input':
				$input_name  = isset( $form_data['entry_title_input_name'] ) ? $form_data['entry_title_input_name'] : '';
				$input_value = self::get_entry_input_value( $params, $input_name );
				$title       = self::format_entry_title_with_id( $input_value ? $input_value : $form_title, $entry_id );
				break;
			case 'custom':
				$format = isset( $form_data['entry_title_custom_format'] ) ? $form_data['entry_title_custom_format'] : '';
				$title  = self::replace_entry_title_placeholders( $format, $entry_id, $params, $form_title );
				break;
			case 'form':
			default:
				$title = sprintf(
					/* translators: 1: form title, 2: entry ID. */
					__( '%1$s - Entry #%2$d', 'gutenverse-form' ),
					$form_title,
					$entry_id
				);
				break;
		}

		$title = sanitize_text_field( wp_strip_all_tags( $title ) );

		if ( strlen( $title ) > 150 ) {
			$title = wp_html_excerpt( $title, 150, '...' );
		}

		if ( '' === $title ) {
			$title = sprintf(
				/* translators: 1: form title, 2: entry ID. */
				__( '%1$s - Entry #%2$d', 'gutenverse-form' ),
				$form_title,
				$entry_id
			);
		}

		return apply_filters( 'gutenverse_form_entry_title', $title, $entry_id, $params, $form_data );
	}

	/**
	 * Format a title with the entry ID suffix.
	 *
	 * @param string $title Entry title base.
	 * @param int    $entry_id Entry post ID.
	 *
	 * @return string
	 */
	private static function format_entry_title_with_id( $title, $entry_id ) {
		return sprintf(
			/* translators: 1: entry title base, 2: entry ID. */
			__( '%1$s #%2$d', 'gutenverse-form' ),
			$title,
			$entry_id
		);
	}

	/**
	 * Get submitted input value by input ID.
	 *
	 * @param array  $params Entry params.
	 * @param string $input_name Input ID.
	 *
	 * @return string
	 */
	private static function get_entry_input_value( $params, $input_name ) {
		if ( empty( $input_name ) || empty( $params['entry-data'] ) || ! is_array( $params['entry-data'] ) ) {
			return '';
		}

		foreach ( $params['entry-data'] as $data ) {
			if ( isset( $data['id'] ) && $input_name === $data['id'] ) {
				$value = isset( $data['value'] ) ? $data['value'] : '';

				if ( is_array( $value ) ) {
					$value = implode( ', ', $value );
				}

				return (string) $value;
			}
		}

		return '';
	}

	/**
	 * Replace placeholders in a custom entry title format.
	 *
	 * @param string $format Entry title format.
	 * @param int    $entry_id Entry post ID.
	 * @param array  $params Entry params.
	 * @param string $form_title Form title.
	 *
	 * @return string
	 */
	private static function replace_entry_title_placeholders( $format, $entry_id, $params, $form_title ) {
		if ( '' === $format ) {
			return '';
		}

		$title = str_replace(
			array( '{{form_title}}', '{{entry_id}}', '{{site_title}}' ),
			array( $form_title, $entry_id, get_bloginfo( 'name' ) ),
			$format
		);

		if ( ! empty( $params['entry-data'] ) && is_array( $params['entry-data'] ) ) {
			foreach ( $params['entry-data'] as $data ) {
				if ( empty( $data['id'] ) ) {
					continue;
				}

				$value = isset( $data['value'] ) ? $data['value'] : '';

				if ( is_array( $value ) ) {
					$value = implode( ', ', $value );
				}

				$title = str_replace( '{{' . $data['id'] . '}}', $value, $title );
			}
		}

		return $title;
	}

	/**
	 * Register Post Type
	 */
	public function post_type() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              =>
					array(
						'name'               => esc_html__( 'Entries', 'gutenverse-form' ),
						'singular_name'      => esc_html__( 'Entries', 'gutenverse-form' ),
						'menu_name'          => esc_html__( 'Entries', 'gutenverse-form' ),
						'add_new'            => esc_html__( 'New Entries', 'gutenverse-form' ),
						'add_new_item'       => esc_html__( 'Create Entry', 'gutenverse-form' ),
						'edit_item'          => esc_html__( 'View Entry', 'gutenverse-form' ),
						'new_item'           => esc_html__( 'New Entry', 'gutenverse-form' ),
						'view_item'          => esc_html__( 'View Entry', 'gutenverse-form' ),
						'search_items'       => esc_html__( 'Search Entry', 'gutenverse-form' ),
						'not_found'          => esc_html__( 'No entry found', 'gutenverse-form' ),
						'not_found_in_trash' => esc_html__( 'No Entry in Trash', 'gutenverse-form' ),
						'parent_item_colon'  => '',
					),
				'description'         => esc_html__( 'Gutenverse Form Entries', 'gutenverse-form' ),
				'public'              => true,
				'exclude_from_search' => true,
				'capability_type'     => 'post',
				'capabilities'        => array(
					'create_posts' => 'do_not_allow',
				),
				'hierarchical'        => false,
				'supports'            => array( 'title', 'revisions', 'page-attributes' ),
				'map_meta_cap'        => true,
				'show_in_menu'        => Form::POST_TYPE,
				'rewrite'             => array(
					'slug' => self::POST_TYPE,
				),
				'publicly_queryable'  => false,
			)
		);
	}

	/**
	 * Add Entry metaboxes
	 *
	 * @param - $post_type post type.
	 */
	public function add_meta_box( $post_type ) {
		if ( self::POST_TYPE === $post_type ) {

			// Form metabox.
			add_meta_box(
				'gutenverse-entries-form',
				__( 'Form Info', 'gutenverse-form' ),
				array( $this, 'form_data_metabox' ),
				self::POST_TYPE,
				'advanced',
				'high'
			);

			// Data metabox.
			add_meta_box(
				'gutenverse-entries-data',
				__( 'Entry Info', 'gutenverse-form' ),
				array( $this, 'entry_data_metabox' ),
				self::POST_TYPE,
				'advanced',
				'high'
			);

			// Integrations metabox.
			add_meta_box(
				'gutenverse-entry-integrations',
				__( 'Integrations', 'gutenverse-form' ),
				array( $this, 'integration_data_metabox' ),
				self::POST_TYPE,
				'advanced',
				'default'
			);

			// Data metabox.
			add_meta_box(
				'gutenverse-browser-data',
				__( 'Browser Info', 'gutenverse-form' ),
				array( $this, 'browser_data_metabox' ),
				self::POST_TYPE,
				'side',
				'high'
			);

			// Payment metabox.
			add_meta_box(
				'gutenverse-payment-data',
				__( 'Payment Info', 'gutenverse-form' ),
				array( $this, 'payment_data_metabox' ),
				self::POST_TYPE,
				'side',
				'default'
			);
		}
	}

	/**
	 * Add Entry metaboxes
	 *
	 * @param - $post post.
	 */
	public function entry_data_metabox( $post ) {
		$entry  = get_post_meta( $post->ID, 'entry-data', true );
		$result = '<div class="gutenverse-entry-detail-list">';

		if ( is_array( $entry ) ) {
			foreach ( $entry as $item ) {
				$result .= $this->entry_detail_item(
					esc_html__( 'Input ID', 'gutenverse-form' ),
					$this->entry_value_html( isset( $item['value'] ) ? $item['value'] : '' ),
					isset( $item['id'] ) ? $item['id'] : ''
				);
			}
		}

		$result .= $this->entry_detail_item( esc_html__( 'Entry ID', 'gutenverse-form' ), esc_html( $post->ID ) );
		$result .= '</div>';

		gutenverse_print_html( $result, 'post' );
	}

	/**
	 * Render integration information for the entry.
	 *
	 * @param - $post post.
	 */
	public function integration_data_metabox( $post ) {
		$integrations = get_post_meta( $post->ID, 'integrations', true );
		$logs         = get_post_meta( $post->ID, 'integration_logs', true );
		$logs         = is_array( $logs ) ? $logs : array();
		$result       = '';
		$services     = $this->get_entry_integration_services( $integrations, $logs );

		if ( ! empty( $services ) ) {
			$retrigger_all_btn = current_user_can( 'manage_options' ) ? ' <button type="button" class="button button-small retrigger-integrations-all" data-entry-id="' . $post->ID . '">' . __( 'Resubmit All', 'gutenverse-form' ) . '</button>' : '';
			$result           .= '<div class="gutenverse-entry-section"><div class="entry-title">' . __( 'Integrations Triggered', 'gutenverse-form' ) . $retrigger_all_btn . '</div>';

			$integration_list = array();
			foreach ( $services as $service ) {
				$service_label      = $this->get_integration_label( $service );
				$retrigger_btn      = current_user_can( 'manage_options' )
					? '<button type="button" class="button button-small retrigger-integration-item" data-entry-id="' . $post->ID . '" data-service="' . esc_attr( $service ) . '">' . __( 'Resend Submission', 'gutenverse-form' ) . '</button>'
					: '';
				$integration_list[] = '<div class="integration-tag"><span class="integration-tag-label">' . esc_html( $service_label ) . '</span>' . $retrigger_btn . '</div>';
			}
			$result .= '<div class="entry-data integration-tag-list">' . implode( '', $integration_list ) . '</div></div>';
		}

		if ( ! empty( $logs ) && is_array( $logs ) ) {
			$result .= '<div class="gutenverse-entry-section integration-log-section"><div class="entry-title">' . __( 'Integration Logs', 'gutenverse-form' ) . '</div>';

			foreach ( $logs as $service => $service_logs ) {
				if ( empty( $service_logs ) || ! is_array( $service_logs ) ) {
					continue;
				}

				$result .= '<div class="entry-data integration-log-service">' . $this->render_integration_icon( $service ) . '<strong>' . esc_html( $this->get_integration_label( $service ) ) . '</strong></div>';

				foreach ( array_reverse( $service_logs ) as $record ) {
					$time    = isset( $record['time'] ) ? esc_html( $record['time'] ) : '';
					$status  = isset( $record['status'] ) ? esc_html( strtoupper( $record['status'] ) ) : '';
					$status_class = isset( $record['status'] ) ? sanitize_html_class( strtolower( (string) $record['status'] ) ) : 'unknown';
					$message = isset( $record['message'] ) ? esc_html( $record['message'] ) : '';
					$context = '';

					if ( ! empty( $record['context'] ) && is_array( $record['context'] ) ) {
						$context_pairs = array();
						foreach ( $record['context'] as $key => $value ) {
							if ( is_array( $value ) ) {
								$value = implode( ', ', array_map( 'strval', $value ) );
							}

							$context_pairs[] = '<span class="integration-log-context-item"><strong>' . esc_html( $key ) . ':</strong> ' . esc_html( (string) $value ) . '</span>';
						}

						if ( ! empty( $context_pairs ) ) {
							$context = '<div class="integration-log-context">' . implode( '', $context_pairs ) . '</div>';
						}
					}

					$result .= '<div class="entry-data integration-log-item"><span class="integration-log-time">' . $time . '</span><div class="integration-log-message"><span class="integration-log-status integration-log-status-' . esc_attr( $status_class ) . '">[' . $status . ']</span> ' . $message . $context . '</div></div>';
				}
			}

			$result .= '</div>';
		}

		if ( '' === $result ) {
			$result = '<div class="entry-data entry-data-empty">' . __( 'No integrations were recorded for this entry.', 'gutenverse-form' ) . '</div>';
		}

		gutenverse_print_html( $result, 'post' );
	}

	/**
	 * Get the integration services shown on an entry.
	 *
	 * Prefer the saved integration actions and fall back to legacy log entries
	 * so older dashboard-fallback submissions still expose resend controls.
	 *
	 * @param array $integrations Entry integration payload.
	 * @param array $logs         Entry integration logs.
	 *
	 * @return array
	 */
	private function get_entry_integration_services( $integrations, $logs ) {
		$services = array();

		if ( ! empty( $integrations['actions'] ) && is_array( $integrations['actions'] ) ) {
			foreach ( $integrations['actions'] as $action ) {
				if ( ! empty( $action['type'] ) ) {
					$services[] = sanitize_key( $action['type'] );
				}
			}
		}

		if ( empty( $services ) && ! empty( $logs ) && is_array( $logs ) ) {
			foreach ( array_keys( $logs ) as $service ) {
				$services[] = sanitize_key( (string) $service );
			}
		}

		return array_values( array_unique( array_filter( $services ) ) );
	}

	/**
	 * Render a label/value row for the entry detail metaboxes.
	 *
	 * @param string $label Label text.
	 * @param string $value Value HTML.
	 * @param string $meta  Optional secondary label.
	 *
	 * @return string
	 */
	private function entry_detail_item( $label, $value, $meta = '' ) {
		$meta_html = $meta ? '<span class="entry-title-meta">' . esc_html( $meta ) . '</span>' : '';

		return '<div class="gutenverse-entry-detail-item"><div class="entry-title"><span>' . esc_html( $label ) . '</span>' . $meta_html . '</div><div class="entry-data">' . $value . '</div></div>';
	}

	/**
	 * Normalize entry values for display.
	 *
	 * @param mixed $value Entry value.
	 *
	 * @return string
	 */
	private function entry_value_html( $value ) {
		if ( is_array( $value ) ) {
			return esc_html( implode( ', ', array_map( 'strval', $value ) ) );
		}

		$value = (string) $value;

		if ( filter_var( $value, FILTER_VALIDATE_URL ) ) {
			return '<a href="' . esc_url( $value ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $value ) . '</a>';
		}

		return esc_html( $value );
	}

	/**
	 * Add Entry metaboxes
	 *
	 * @param - $post post.
	 */
	public function form_data_metabox( $post ) {
		$form_id = get_post_meta( $post->ID, 'form-id', true );

		if ( $form_id ) {
			$form_title = get_the_title( $form_id );
			$form_link  = self::get_admin_page_url( array( 'form_id' => $form_id ) );

			$result = '<div class="gutenverse-entry-detail-list">';
			$result .= $this->entry_detail_item( esc_html__( 'Form ID', 'gutenverse-form' ), esc_html( $form_id ) );
			$result .= $this->entry_detail_item( esc_html__( 'Form Action', 'gutenverse-form' ), '<a href="' . esc_url( $form_link ) . '">' . esc_html( $form_title ) . '</a>' );
			$result .= '</div>';
		} else {
			$result = '<div class="gutenverse-entry-detail-list">';
			$result .= $this->entry_detail_item( esc_html__( 'Form ID', 'gutenverse-form' ), esc_html__( 'Form is not set', 'gutenverse-form' ) );
			$result .= $this->entry_detail_item( esc_html__( 'Form Action', 'gutenverse-form' ), esc_html__( 'Not found', 'gutenverse-form' ) );
			$result .= '</div>';
		}

		gutenverse_print_html( $result, 'post' );
	}

	/**
	 * Add Browser metaboxes
	 *
	 * @param - $post post.
	 */
	public function browser_data_metabox( $post ) {
		$browser = get_post_meta( $post->ID, 'browser-data', true );
		$result  = '<div class="gutenverse-entry-detail-list">';
		$result .= $this->entry_detail_item( esc_html__( 'IP Address', 'gutenverse-form' ), esc_html__( 'Disabled', 'gutenverse-form' ) );
		$result .= $this->entry_detail_item( esc_html__( 'Browser Data', 'gutenverse-form' ), esc_html__( 'Disabled', 'gutenverse-form' ) );
		$result .= '</div>';

		if ( ! empty( $browser ) ) {
			$result  = '<div class="gutenverse-entry-detail-list">';
			$result .= $this->entry_detail_item( esc_html__( 'IP Address', 'gutenverse-form' ), esc_html( isset( $browser['ip'] ) ? $browser['ip'] : '' ) );
			$result .= $this->entry_detail_item( esc_html__( 'Browser Data', 'gutenverse-form' ), esc_html( isset( $browser['user_agent'] ) ? $browser['user_agent'] : '' ) );
			$result .= '</div>';
		}

		gutenverse_print_html( $result, 'post' );
	}

	/**
	 * Add Payment metaboxes.
	 *
	 * @param - $post post.
	 */
	public function payment_data_metabox( $post ) {
		$payment = get_post_meta( $post->ID, 'form-payment', true );
		$method  = esc_html__( 'none', 'gutenverse-form' );
		$status  = esc_html__( 'none', 'gutenverse-form' );

		if ( is_array( $payment ) ) {
			$method = ! empty( $payment['payment'] ) ? $payment['payment'] : $method;
			$method = ! empty( $payment['paymentMethod'] ) ? $payment['paymentMethod'] : $method;
			$method = ! empty( $payment['payment_method'] ) ? $payment['payment_method'] : $method;
			$status = ! empty( $payment['status'] ) ? $payment['status'] : $status;
			$status = ! empty( $payment['paymentStatus'] ) ? $payment['paymentStatus'] : $status;
			$status = ! empty( $payment['payment_status'] ) ? $payment['payment_status'] : $status;
		}

		$result  = '<div class="gutenverse-entry-detail-list">';
		$result .= $this->entry_detail_item( esc_html__( 'Payment Method', 'gutenverse-form' ), esc_html( $method ) );
		$result .= $this->entry_detail_item( esc_html__( 'Payment Status', 'gutenverse-form' ), esc_html( $status ) );
		$result .= '</div>';

		gutenverse_print_html( $result, 'post' );
	}

	/**
	 * Get Total Entries
	 *
	 * @param integer $form_id Form Action ID.
	 *
	 * @return integer
	 */
	public static function get_total_entries( $form_id ) {
		$posts = get_posts(
			array(
				'post_type'      => self::POST_TYPE,
				'posts_per_page' => -1,
				'post_status'    => array( 'publish' ),
				'meta_query'     => array( //phpcs:ignore
					array(
						'key'     => 'form-id',
						'value'   => $form_id,
						'compare' => '=',
					),
				),
			)
		);

		return count( $posts );
	}

	/**
	 * Retrigger Integration AJAX
	 */
	public function retrigger_integration() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied', 'gutenverse-form' ) ) );
		}

		check_ajax_referer( 'gutenverse_form_retrigger', 'nonce' );

		$entry_id = isset( $_POST['entry_id'] ) ? (int) $_POST['entry_id'] : 0;
		$service  = isset( $_POST['service'] ) ? sanitize_text_field( $_POST['service'] ) : '';

		if ( ! $entry_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid Entry ID', 'gutenverse-form' ) ) );
		}

		$params = array(
			'form-id'      => get_post_meta( $entry_id, 'form-id', true ),
			'post-id'      => get_post_meta( $entry_id, 'post-id', true ),
			'entry-data'   => get_post_meta( $entry_id, 'entry-data', true ),
			'browser-data' => get_post_meta( $entry_id, 'browser-data', true ),
			'integrations' => get_post_meta( $entry_id, 'integrations', true ),
		);

		$form_id      = isset( $params['form-id'] ) ? (int) $params['form-id'] : 0;
		$form_setting = get_post_meta( $form_id, 'form-data', true );

		if ( $service ) {
			$integration = new Integration();
			$instance    = $integration->get_service_instance( $service );
			if ( $instance && method_exists( $instance, 'after_store' ) ) {
				$instance->after_store( $entry_id, $params, $form_setting, null );
				wp_send_json_success( array( 'message' => sprintf( __( '%s retriggered successfully', 'gutenverse-form' ), ucfirst( $service ) ) ) );
			} else {
				wp_send_json_error( array( 'message' => __( 'Integration not found or not support retriggering', 'gutenverse-form' ) ) );
			}
		} else {
			do_action( 'gutenverse_form_after_store', $entry_id, $params, $form_setting, null );
			wp_send_json_success( array( 'message' => __( 'All integrations retriggered successfully', 'gutenverse-form' ) ) );
		}
	}

	/**
	 * Admin Footer Scripts for Retriggering
	 */
	public function admin_footer_scripts() {
		$screen = get_current_screen();
		if ( ! $screen || self::POST_TYPE !== $screen->post_type || 'post' !== $screen->base ) {
			return;
		}
		?>
		<div id="gutenverse-form-toast" role="status" aria-live="polite">
			<span class="toast-icon" aria-hidden="true"></span>
			<span class="toast-message"></span>
		</div>

		<script type="text/javascript">
		jQuery(document).ready(function($) {
			var entryListUrl = <?php echo wp_json_encode( self::get_admin_page_url() ); ?>;
			var backLabel = <?php echo wp_json_encode( __( 'Back to entries', 'gutenverse-form' ) ); ?>;
			var allSuccessMessage = <?php echo wp_json_encode( __( 'All Integation Retriggered Successfully', 'gutenverse-form' ) ); ?>;
			var allErrorMessage = <?php echo wp_json_encode( __( 'All Integation Retriggered Failed', 'gutenverse-form' ) ); ?>;
			var defaultErrorMessage = <?php echo wp_json_encode( __( 'Error occurred', 'gutenverse-form' ) ); ?>;
			var ajaxErrorMessage = <?php echo wp_json_encode( __( 'AJAX error occurred', 'gutenverse-form' ) ); ?>;
			var $heading = $('.wrap h1.wp-heading-inline').first();

			if (!$heading.length) {
				$heading = $('.wrap h1').first();
			}

			if ($heading.length && !$heading.parent().hasClass('gutenverse-entry-view-heading')) {
				$heading.wrap('<div class="gutenverse-entry-view-heading"></div>');
				$heading.before(
					$('<a/>', {
						class: 'gutenverse-entry-back-button',
						href: entryListUrl,
						'aria-label': backLabel
					}).append('<span class="dashicons dashicons-arrow-left-alt2"></span>')
				);
			}

			function showToast(message, type) {
				var $toast = $('#gutenverse-form-toast');
				$toast.removeClass('success error').addClass(type);
				$toast.find('.toast-message').text(message);
				$toast.stop(true, true).fadeIn().css('display', 'flex');
				
				setTimeout(function() {
					$toast.css('animation', 'gv-fade-out 0.5s forwards');
					setTimeout(function() {
						$toast.hide().css('animation', '');
					}, 500);
				}, 4000);
			}

			$(document).on('click', '.retrigger-integrations-all, .retrigger-integration-item', function(e) {
				e.preventDefault();
				var $this = $(this);
				var entryId = $this.data('entry-id');
				var service = $this.data('service') || '';
				var nonce = '<?php echo wp_create_nonce( 'gutenverse_form_retrigger' ); ?>';
				var isAll = $this.hasClass('retrigger-integrations-all');

				if ($this.hasClass('loading')) return;

				$this.addClass('loading').css('opacity', '0.5');

				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: {
						action: 'gutenverse_form_retrigger_integration',
						entry_id: entryId,
						service: service,
						nonce: nonce
					},
					success: function(response) {
						if (response.success) {
							showToast(isAll ? allSuccessMessage : response.data.message, 'success');
						} else {
							showToast(isAll ? allErrorMessage : response.data.message || defaultErrorMessage, 'error');
						}
					},
					error: function() {
						showToast(isAll ? allErrorMessage : ajaxErrorMessage, 'error');
					},
					complete: function() {
						$this.removeClass('loading').css('opacity', '1');
					}
				});
			});

			$(document).on('click', '.toggle-integration-status', function(e) {
				e.preventDefault();
				var targetId = $(this).data('target');
				if (!targetId) return;
				$('#' + targetId).toggle();
			});
		});
		</script>
		<?php
	}
}
