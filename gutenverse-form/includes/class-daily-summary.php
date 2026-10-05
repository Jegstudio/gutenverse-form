<?php
/**
 * Daily summary email class
 *
 * @author Jegstudio
 * @since 2.6.1
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

/**
 * Class Daily_Summary
 *
 * @package gutenverse-form
 */
class Daily_Summary {
	/**
	 * Cron hook name.
	 *
	 * @var string
	 */
	const CRON_HOOK = 'gutenverse_form_daily_summary_email';

	/**
	 * Enabled option name.
	 *
	 * @var string
	 */
	const OPTION_ENABLED = 'gutenverse_form_daily_summary_enabled';

	/**
	 * Gutenverse settings option name.
	 *
	 * @var string
	 */
	const SETTINGS_OPTION = 'gutenverse-settings';

	/**
	 * Daily summary setting group.
	 *
	 * @var string
	 */
	const SETTINGS_GROUP = 'form_settings';

	/**
	 * Daily summary setting section.
	 *
	 * @var string
	 */
	const SETTINGS_SECTION = 'dashboard';

	/**
	 * Daily summary setting key.
	 *
	 * @var string
	 */
	const SETTINGS_KEY = 'daily_admin_summary';

	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_action( 'init', array( __CLASS__, 'migrate_legacy_option' ), 8 );
		add_action( 'init', array( __CLASS__, 'schedule_event' ) );
		add_action( 'updated_option', array( __CLASS__, 'sync_event_after_settings_update' ), 10, 3 );
		add_filter( 'gutenverse_settings_data', array( __CLASS__, 'add_settings_default' ) );
		add_action( self::CRON_HOOK, array( $this, 'send_summary_email' ) );
	}

	/**
	 * Schedule daily summary event.
	 */
	public static function schedule_event() {
		if ( ! self::is_enabled() ) {
			self::clear_event();
			return;
		}

		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( self::get_next_run_timestamp(), 'daily', self::CRON_HOOK );
		}
	}

	/**
	 * Clear daily summary event.
	 */
	public static function clear_event() {
		wp_clear_scheduled_hook( self::CRON_HOOK );
	}

	/**
	 * Check if daily summary email is enabled.
	 *
	 * @return boolean
	 */
	public static function is_enabled() {
		return (bool) apply_filters(
			'gutenverse_form_daily_summary_enabled',
			self::get_settings_enabled()
		);
	}

	/**
	 * Get enabled value from Gutenverse settings.
	 *
	 * @param array|null $settings Optional settings data.
	 *
	 * @return boolean
	 */
	public static function get_settings_enabled( $settings = null ) {
		if ( null === $settings ) {
			$settings = get_option( self::SETTINGS_OPTION, array() );
		}

		if ( isset( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) && is_array( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) && array_key_exists( self::SETTINGS_KEY, $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) ) {
			return rest_sanitize_boolean( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ][ self::SETTINGS_KEY ] );
		}

		return true;
	}

	/**
	 * Add default value to dashboard settings data.
	 *
	 * @param array $settings Settings data.
	 *
	 * @return array
	 */
	public static function add_settings_default( $settings ) {
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		if ( ! isset( $settings[ self::SETTINGS_GROUP ] ) || ! is_array( $settings[ self::SETTINGS_GROUP ] ) ) {
			$settings[ self::SETTINGS_GROUP ] = array();
		}

		if ( ! isset( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) || ! is_array( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) ) {
			$settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] = array();
		}

		if ( ! array_key_exists( self::SETTINGS_KEY, $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) ) {
			$settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ][ self::SETTINGS_KEY ] = true;
		}

		return $settings;
	}

	/**
	 * Move old standalone option into Gutenverse settings.
	 */
	public static function migrate_legacy_option() {
		$legacy = get_option( self::OPTION_ENABLED, null );

		if ( null === $legacy ) {
			return;
		}

		$settings    = get_option( self::SETTINGS_OPTION, array() );
		$has_setting = isset( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) && is_array( $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] ) && array_key_exists( self::SETTINGS_KEY, $settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ] );
		$settings    = self::add_settings_default( $settings );

		if ( ! $has_setting ) {
			$settings[ self::SETTINGS_GROUP ][ self::SETTINGS_SECTION ][ self::SETTINGS_KEY ] = 'yes' === $legacy;
			update_option( self::SETTINGS_OPTION, $settings, true );
		}

		delete_option( self::OPTION_ENABLED );
	}

	/**
	 * Keep the cron event in sync when Gutenverse settings are saved.
	 *
	 * @param string $option    Option name.
	 * @param mixed  $old_value Old value.
	 * @param mixed  $value     New value.
	 */
	public static function sync_event_after_settings_update( $option, $old_value, $value ) {
		if ( self::SETTINGS_OPTION !== $option ) {
			return;
		}

		if ( self::get_settings_enabled( $old_value ) === self::get_settings_enabled( $value ) ) {
			return;
		}

		if ( self::get_settings_enabled( $value ) ) {
			self::schedule_event();
		} else {
			self::clear_event();
		}
	}

	/**
	 * Send summary email.
	 *
	 * @return boolean
	 */
	public function send_summary_email() {
		if ( ! self::is_enabled() ) {
			return false;
		}

		$recipient = apply_filters( 'gutenverse_form_daily_summary_recipient', get_option( 'admin_email' ) );

		if ( ! is_email( $recipient ) ) {
			return false;
		}

		$summary = $this->get_summary_data();
		$subject = apply_filters(
			'gutenverse_form_daily_summary_subject',
			sprintf(
				/* translators: 1: site name, 2: report date */
				__( '[Gutenverse Form] Daily Summary for %1$s - %2$s', 'gutenverse-form' ),
				get_bloginfo( 'name' ),
				$summary['date_label']
			),
			$summary
		);
		$body    = apply_filters( 'gutenverse_form_daily_summary_body', $this->get_summary_body( $summary ), $summary );
		$headers = apply_filters(
			'gutenverse_form_daily_summary_headers',
			array( 'Content-Type: text/html; charset=UTF-8' ),
			$summary
		);

		return wp_mail( $recipient, $subject, $body, $headers );
	}

	/**
	 * Get summary data.
	 *
	 * @return array
	 */
	private function get_summary_data() {
		$boundaries  = $this->get_previous_day_boundaries();
		$site_url    = home_url( '/' );
		$site_domain = wp_parse_url( $site_url, PHP_URL_HOST );

		if ( empty( $site_domain ) ) {
			$site_domain = untrailingslashit( $site_url );
		}

		$form_ids = get_posts(
			array(
				'post_type'              => Form::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		$form_counts  = Form::get_form_entry_count_map(
			array(),
			$boundaries['start']->format( 'Y-m-d H:i:s' ),
			$boundaries['end']->format( 'Y-m-d H:i:s' ),
			'post_date'
		);
		$total_counts = empty( $form_counts ) ? array() : Form::get_form_entry_count_map( array_keys( $form_counts ) );

		$form_rows = array();
		foreach ( $form_counts as $form_id => $count ) {
			$count = (int) $count;

			$form_rows[] = array(
				'id'            => $form_id,
				'title'         => get_the_title( $form_id ),
				'report_count'  => $count,
				'today_count'   => $count,
				'total_entries' => isset( $total_counts[ $form_id ] ) ? (int) $total_counts[ $form_id ] : 0,
				'entries_url'   => Entries::get_admin_page_url( array( 'form_id' => $form_id ) ),
			);
		}

		usort(
			$form_rows,
			static function ( $left, $right ) {
				if ( (int) $left['report_count'] === (int) $right['report_count'] ) {
					return strcmp( $left['title'], $right['title'] );
				}

				return (int) $right['report_count'] <=> (int) $left['report_count'];
			}
		);

		$total_submissions = array_sum( $form_counts );

		return array(
			'date_label'               => wp_date( get_option( 'date_format' ), $boundaries['start']->getTimestamp(), wp_timezone() ),
			'site_name'                => get_bloginfo( 'name' ),
			'site_url'                 => $site_url,
			'site_domain'              => $site_domain,
			'dashboard_url'            => admin_url( 'admin.php?page=' . Form::POST_TYPE ),
			'report_total_submissions' => $total_submissions,
			'today_total_submissions'  => $total_submissions,
			'forms_with_submissions'   => count( $form_rows ),
			'tracked_forms'            => count( $form_ids ),
			'forms'                    => $form_rows,
		);
	}

	/**
	 * Get previous completed day boundaries in the site timezone.
	 *
	 * @return array
	 */
	private function get_previous_day_boundaries() {
		$timezone = wp_timezone();
		$today    = ( new \DateTimeImmutable( 'now', $timezone ) )->setTime( 0, 0, 0 );

		return array(
			'start' => $today->modify( '-1 day' ),
			'end'   => $today->modify( '-1 second' ),
		);
	}

	/**
	 * Get next scheduled run timestamp.
	 *
	 * @return integer
	 */
	private static function get_next_run_timestamp() {
		$timezone = wp_timezone();
		$now      = new \DateTimeImmutable( 'now', $timezone );
		$run      = $now->setTime( 8, 0, 0 );

		if ( $run <= $now ) {
			$run = $run->modify( '+1 day' );
		}

		return $run->getTimestamp();
	}

	/**
	 * Get summary email body.
	 *
	 * @param array $summary Summary data.
	 *
	 * @return string
	 */
	private function get_summary_body( $summary ) {
		$form_rows    = '';
		$upgrade_url = 'https://gutenverse.com/pricing/?utm_source=gutenverse-form&utm_medium=dailyformsummary&coupon=formpro';
		$feature_grid = $this->get_pro_feature_grid();

		foreach ( $summary['forms'] as $form ) {
			$form_rows .= '<tr>';
			$form_rows .= '<td class="gv-table-cell gv-border-top" style="padding:15px 18px;border-top:1px solid #eef0f4;color:#071827;font-size:14px;font-weight:400;line-height:1.4;">' . esc_html( $form['title'] ) . '</td>';
			$form_rows .= '<td class="gv-table-cell gv-border-top" style="padding:15px 12px;border-top:1px solid #eef0f4;color:#071827;font-size:14px;font-weight:400;line-height:1.4;text-align:center;">' . esc_html( $form['report_count'] ) . '</td>';
			$form_rows .= '<td class="gv-table-cell gv-border-top" style="padding:15px 12px;border-top:1px solid #eef0f4;color:#071827;font-size:14px;font-weight:400;line-height:1.4;text-align:center;">' . esc_html( $form['total_entries'] ) . '</td>';
			$form_rows .= '<td class="gv-border-top" width="108" nowrap="nowrap" style="width:108px;padding:15px 14px 15px 12px;border-top:1px solid #eef0f4;line-height:1.4;text-align:right;white-space:nowrap;"><a class="gv-link" href="' . esc_url( $form['entries_url'] ) . '" style="display:inline-block;color:#3856ff;font-size:13px;font-weight:700;line-height:1.3;text-decoration:underline;white-space:nowrap;">' . esc_html__( 'View Entries', 'gutenverse-form' ) . '</a></td>';
			$form_rows .= '</tr>';
		}

		if ( empty( $form_rows ) ) {
			$form_rows = '<tr><td class="gv-table-cell gv-border-top" colspan="4" style="padding:18px;border-top:1px solid #eef0f4;color:#405160;font-size:13px;line-height:1.5;text-align:center;">' . esc_html__( 'No form submissions were received for this report day.', 'gutenverse-form' ) . '</td></tr>';
		}

		ob_start();
		?>
		<html>
			<body class="gv-email-body" style="margin:0;padding:0;background:#b6b6b6;color:#071827;font-family:Arial,Helvetica,sans-serif;">
				<table class="gv-email-page" role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#b6b6b6" style="width:100%;background:#b6b6b6;padding:14px 0;">
					<tr>
						<td align="center" style="padding:0 12px;">
							<table class="gv-email-container" role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #dfe2e7;border-radius:12px;overflow:hidden;">
								<tr>
									<td class="gv-hero" bgcolor="#4158f5" style="padding:28px 32px 30px;background:#4158f5;">
										<p class="gv-hero-kicker" style="margin:0 0 10px;color:#ffffff;font-size:12px;font-weight:400;letter-spacing:2px;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Gutenverse Form', 'gutenverse-form' ); ?></p>
										<h1 class="gv-hero-title" style="margin:0;color:#ffffff;font-size:28px;font-weight:800;line-height:1.2;"><?php esc_html_e( 'Daily Form Summary', 'gutenverse-form' ); ?></h1>
										<p class="gv-hero-text" style="margin:10px 0 0;color:#dfe4ff;font-size:14px;font-weight:400;line-height:1.5;">
											<?php
											printf(
												/* translators: 1: site name, 2: report date */
												esc_html__( 'Activity snapshot for %1$s on %2$s.', 'gutenverse-form' ),
												esc_html( $summary['site_name'] ),
												esc_html( $summary['date_label'] )
											);
											?>
										</p>
									</td>
								</tr>
								<tr>
									<td class="gv-content" bgcolor="#ffffff" style="padding:30px 32px 6px;background:#ffffff;">
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;">
											<tr>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Submissions', 'gutenverse-form' ), $summary['report_total_submissions'] ) ); ?>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Forms with Submission', 'gutenverse-form' ), $summary['forms_with_submissions'] ) ); ?>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Tracked Forms', 'gutenverse-form' ), $summary['tracked_forms'], true ) ); ?>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<td class="gv-content" bgcolor="#ffffff" style="padding:22px 32px 28px;background:#ffffff;">
										<table class="gv-table" role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border:1px solid #e1e3e8;border-radius:7px;border-collapse:separate;border-spacing:0;overflow:hidden;">
											<tr>
												<th class="gv-table-heading" align="left" bgcolor="#fafbfc" style="padding:14px 18px;background:#fafbfc;color:#405160;font-size:14px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;"><?php esc_html_e( 'Form', 'gutenverse-form' ); ?></th>
												<th class="gv-table-heading" width="78" bgcolor="#fafbfc" style="width:78px;padding:14px 12px;background:#fafbfc;color:#405160;font-size:13px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;"><?php esc_html_e( 'Report Day', 'gutenverse-form' ); ?></th>
												<th class="gv-table-heading" width="68" bgcolor="#fafbfc" style="width:68px;padding:14px 12px;background:#fafbfc;color:#405160;font-size:14px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;"><?php esc_html_e( 'Total', 'gutenverse-form' ); ?></th>
												<th class="gv-table-heading" align="right" width="108" nowrap="nowrap" bgcolor="#fafbfc" style="width:108px;padding:14px 14px 14px 12px;background:#fafbfc;color:#405160;font-size:14px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;white-space:nowrap;"><?php esc_html_e( 'Action', 'gutenverse-form' ); ?></th>
											</tr>
											<?php echo wp_kses_post( $form_rows ); ?>
										</table>
									</td>
								</tr>
								<tr>
									<td class="gv-content" bgcolor="#ffffff" style="padding:0 32px 36px;background:#ffffff;">
										<a class="gv-cta" href="<?php echo esc_url( $summary['dashboard_url'] ); ?>" style="display:inline-block;background:#4158f5;border-radius:6px;color:#ffffff;font-size:14px;font-weight:800;line-height:1;padding:15px 20px;text-decoration:none;"><?php esc_html_e( 'View Form Dashboard', 'gutenverse-form' ); ?></a>
									</td>
								</tr>
								<?php if ( ! defined( 'GUTENVERSE_PRO_VERSION' ) ) : ?>
								<tr>
									<td class="gv-promo" align="center" bgcolor="#fafbfc" style="padding:36px 32px 34px;background:#fafbfc;border-top:1px solid #e6e8ee;font-family:Arial,Helvetica,sans-serif;text-align:center;">
										<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 14px;border-collapse:separate;border-spacing:0;">
											<tr>
												<td style="padding:5px 11px;border:1px solid #4158f5;border-radius:18px;color:#4158f5;font-size:11px;font-weight:700;line-height:1.3;text-align:center;white-space:nowrap;"><?php esc_html_e( 'Unlock Full Potential', 'gutenverse-form' ); ?></td>
											</tr>
										</table>
										<h2 style="margin:0;color:#071827;font-size:21px;font-weight:700;line-height:1.3;text-align:center;font-family:Arial,Helvetica,sans-serif;"><?php esc_html_e( 'Unlock Powerful Features with Gutenverse PRO', 'gutenverse-form' ); ?></h2>
										<p style="max-width:480px;margin:8px auto 26px;color:#657481;font-size:14px;font-weight:400;line-height:1.5;text-align:center;font-family:Arial,Helvetica,sans-serif;"><?php esc_html_e( 'Create smarter forms, save time with reusable templates, and connect your favorite tools.', 'gutenverse-form' ); ?></p>
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
											<?php echo wp_kses_post( $feature_grid ); ?>
										</table>
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:22px auto 0;border-collapse:separate;border-spacing:0;">
											<tr>
												<td align="center" bgcolor="#e9edff" style="padding:9px 16px;background:#e9edff;border:1px dashed #4158f5;border-radius:6px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
													<p style="margin:0;color:#071827;font-size:14px;font-weight:700;line-height:1.35;"><?php esc_html_e( 'Get 20% OFF Gutenverse PRO', 'gutenverse-form' ); ?></p>
													<p style="margin:3px 0 0;color:#536471;font-size:12px;font-weight:400;line-height:1.4;"><?php esc_html_e( 'Use coupon code', 'gutenverse-form' ); ?> <strong style="color:#071827;font-weight:700;">FORMPRO</strong> <?php esc_html_e( 'or click the button below.', 'gutenverse-form' ); ?></p>
												</td>
											</tr>
										</table>
										<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:20px auto 0;border-collapse:separate;border-spacing:0;">
											<tr>
												<td align="center" bgcolor="#4158f5" style="background:#4158f5;border-radius:6px;text-align:center;"><a class="gv-cta" href="<?php echo esc_url( $upgrade_url ); ?>" style="display:inline-block;padding:12px 19px;color:#ffffff;font-size:13px;font-weight:700;line-height:1.2;text-decoration:none;white-space:nowrap;"><?php esc_html_e( 'Explore Gutenverse PRO', 'gutenverse-form' ); ?></a></td>
											</tr>
										</table>
									</td>
								</tr>
								<?php endif; ?>
								<tr>
									<td class="gv-footer" align="center" bgcolor="#ffffff" style="padding:20px 32px;background:#ffffff;border-top:1px solid #e6e8ee;color:#536471;font-size:13px;line-height:1.5;text-align:center;font-family:Arial,Helvetica,sans-serif;">
										<?php
										echo wp_kses_post(
											sprintf(
												/* translators: %s: site URL */
												__( 'Generated by Gutenverse Form for %s. This is an automated admin summary.', 'gutenverse-form' ),
												'<a class="gv-link" href="' . esc_url( $summary['site_url'] ) . '" style="color:#3856ff;text-decoration:none;">' . esc_html( $summary['site_domain'] ) . '</a>'
											)
										);
										?>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
		</html>
		<?php

		return ob_get_clean();
	}

	/**
	 * Get the Gutenverse PRO feature grid HTML.
	 *
	 * @return string
	 */
	private function get_pro_feature_grid() {
		$features = array(
			array(
				'title'       => __( 'Advanced Forms', 'gutenverse-form' ),
				'description' => __( 'Build multi-step forms with image radio, grouped select, and payment fields.', 'gutenverse-form' ),
			),
			array(
				'title'       => __( 'Smart Logic', 'gutenverse-form' ),
				'description' => __( 'Show fields conditionally and calculate values.', 'gutenverse-form' ),
			),
			array(
				'title'       => __( 'Reusable Email Templates', 'gutenverse-form' ),
				'description' => __( 'Save designed templates for user confirmations and admin notifications.', 'gutenverse-form' ),
			),
			array(
				'title'       => __( 'Form Integrations', 'gutenverse-form' ),
				'description' => __( 'Send submitted data to Slack, Google Sheets, webhooks, and other services.', 'gutenverse-form' ),
			),
			array(
				'title'       => __( 'Entry Management', 'gutenverse-form' ),
				'description' => __( 'Search, filter, and export form entries as CSV files.', 'gutenverse-form' ),
			),
			array(
				'title'       => __( 'Dashboard Insights', 'gutenverse-form' ),
				'description' => __( 'Review top forms, entry sources, recent activity, and items needing attention.', 'gutenverse-form' ),
			),
		);
		$rows = '';

		foreach ( array_chunk( $features, 2 ) as $row_index => $feature_row ) {
			$rows .= '<tr>';

			foreach ( $feature_row as $column_index => $feature ) {
				$top_padding    = 0 === $row_index ? '0' : '8px';
				$bottom_padding = 2 === $row_index ? '0' : '8px';
				$cell_padding   = 0 === $column_index
					? $top_padding . ' 8px ' . $bottom_padding . ' 0'
					: $top_padding . ' 0 ' . $bottom_padding . ' 8px';

				$rows .= '<td width="50%" valign="top" style="width:50%;padding:' . esc_attr( $cell_padding ) . ';">';
				$rows .= '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border:1px solid #e1e3e8;border-radius:7px;border-collapse:separate;border-spacing:0;"><tr><td style="padding:11px 13px;text-align:left;font-family:Arial,Helvetica,sans-serif;"><p style="margin:0 0 4px;color:#071827;font-size:14px;font-weight:700;line-height:1.3;font-family:Arial,Helvetica,sans-serif;">' . esc_html( $feature['title'] ) . '</p><p style="margin:0;color:#536471;font-size:13px;font-weight:400;line-height:1.45;font-family:Arial,Helvetica,sans-serif;">' . esc_html( $feature['description'] ) . '</p></td></tr></table>';
				$rows .= '</td>';
			}

			$rows .= '</tr>';
		}

		return $rows;
	}

	/**
	 * Get metric card HTML.
	 *
	 * @param string  $label Metric label.
	 * @param integer $value Metric value.
	 * @param boolean $is_last Whether this is the last metric in the row.
	 *
	 * @return string
	 */
	private function get_metric_card( $label, $value, $is_last = false ) {
		$cell_padding = $is_last ? '0' : '0 14px 0 0';

		return '<td width="33.33%" style="padding:' . esc_attr( $cell_padding ) . ';"><table class="gv-card" role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border:1px solid #e1e3e8;border-radius:7px;border-collapse:separate;border-spacing:0;"><tr><td style="padding:7px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;"><tr><td class="gv-card-number" width="50" align="center" valign="middle" bgcolor="#e9edff" style="width:50px;height:50px;background:#e9edff;border-radius:5px;color:#4158f5;font-size:25px;font-weight:800;line-height:50px;text-align:center;">' . esc_html( $value ) . '</td><td class="gv-card-label" valign="middle" style="padding-left:12px;color:#405160;font-size:14px;font-weight:400;line-height:1.25;">' . esc_html( $label ) . '</td></tr></table></td></tr></table></td>';
	}
}
