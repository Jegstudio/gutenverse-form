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
		$boundaries  = $this->get_today_boundaries();
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
			$form_rows[] = array(
				'id'            => $form_id,
				'title'         => get_the_title( $form_id ),
				'today_count'   => (int) $count,
				'total_entries' => isset( $total_counts[ $form_id ] ) ? (int) $total_counts[ $form_id ] : 0,
				'entries_url'   => Entries::get_admin_page_url( array( 'form_id' => $form_id ) ),
			);
		}

		usort(
			$form_rows,
			static function ( $left, $right ) {
				if ( (int) $left['today_count'] === (int) $right['today_count'] ) {
					return strcmp( $left['title'], $right['title'] );
				}

				return (int) $right['today_count'] <=> (int) $left['today_count'];
			}
		);

		return array(
			'date_label'              => wp_date( get_option( 'date_format' ), $boundaries['start']->getTimestamp(), wp_timezone() ),
			'site_name'               => get_bloginfo( 'name' ),
			'site_url'                => $site_url,
			'site_domain'             => $site_domain,
			'dashboard_url'           => admin_url( 'admin.php?page=' . Form::POST_TYPE ),
			'today_total_submissions' => array_sum( $form_counts ),
			'forms_with_submissions'  => count( $form_rows ),
			'tracked_forms'           => count( $form_ids ),
			'forms'                   => $form_rows,
		);
	}

	/**
	 * Get today boundaries in the site timezone.
	 *
	 * @return array
	 */
	private function get_today_boundaries() {
		$timezone = wp_timezone();
		$now      = new \DateTimeImmutable( 'now', $timezone );

		return array(
			'start' => $now->setTime( 0, 0, 0 ),
			'end'   => $now->setTime( 23, 59, 59 ),
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
		$form_rows = '';

		foreach ( $summary['forms'] as $form ) {
			$form_rows .= '<tr>';
			$form_rows .= '<td class="gv-table-cell gv-border-top" style="padding:18px 22px;border-top:1px solid #eef0f4;color:#071827;font-size:15px;font-weight:400;line-height:1.4;">' . esc_html( $form['title'] ) . '</td>';
			$form_rows .= '<td class="gv-table-cell gv-border-top" style="padding:18px;border-top:1px solid #eef0f4;color:#071827;font-size:15px;font-weight:400;line-height:1.4;text-align:center;">' . esc_html( $form['today_count'] ) . '</td>';
			$form_rows .= '<td class="gv-table-cell gv-border-top" style="padding:18px;border-top:1px solid #eef0f4;color:#071827;font-size:15px;font-weight:400;line-height:1.4;text-align:center;">' . esc_html( $form['total_entries'] ) . '</td>';
			$form_rows .= '<td class="gv-border-top" width="132" nowrap="nowrap" style="width:132px;padding:18px 22px 18px 16px;border-top:1px solid #eef0f4;line-height:1.4;text-align:right;white-space:nowrap;"><a class="gv-link" href="' . esc_url( $form['entries_url'] ) . '" style="display:inline-block;color:#3856ff;font-size:14px;font-weight:700;line-height:1.3;text-decoration:underline;white-space:nowrap;">' . esc_html__( 'View Entries', 'gutenverse-form' ) . '</a></td>';
			$form_rows .= '</tr>';
		}

		if ( empty( $form_rows ) ) {
			$form_rows = '<tr><td class="gv-table-cell gv-border-top" colspan="4" style="padding:22px;border-top:1px solid #eef0f4;color:#405160;font-size:14px;line-height:1.5;text-align:center;">' . esc_html__( 'No form submissions were received today.', 'gutenverse-form' ) . '</td></tr>';
		}

		ob_start();
		?>
		<html>
			<body class="gv-email-body" style="margin:0;padding:0;background:#b6b6b6;color:#071827;font-family:Arial,Helvetica,sans-serif;">
				<table class="gv-email-page" role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#b6b6b6" style="width:100%;background:#b6b6b6;padding:14px 0;">
					<tr>
						<td align="center" style="padding:0 12px;">
							<table class="gv-email-container" role="presentation" width="680" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:680px;width:100%;background:#ffffff;border:1px solid #dfe2e7;border-radius:14px;overflow:hidden;">
								<tr>
									<td class="gv-hero" bgcolor="#4158f5" style="padding:36px 38px 38px;background:#4158f5;">
										<p class="gv-hero-kicker" style="margin:0 0 12px;color:#ffffff;font-size:13px;font-weight:400;letter-spacing:3px;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Gutenverse Form', 'gutenverse-form' ); ?></p>
										<h1 class="gv-hero-title" style="margin:0;color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;"><?php esc_html_e( 'Daily Form Summary', 'gutenverse-form' ); ?></h1>
										<p class="gv-hero-text" style="margin:13px 0 0;color:#dfe4ff;font-size:16px;font-weight:400;line-height:1.6;">
											<?php
											printf(
												/* translators: 1: site name, 2: report date */
												esc_html__( 'Today\'s activity snapshot for %1$s on %2$s.', 'gutenverse-form' ),
												esc_html( $summary['site_name'] ),
												esc_html( $summary['date_label'] )
											);
											?>
										</p>
									</td>
								</tr>
								<tr>
									<td class="gv-content" bgcolor="#ffffff" style="padding:38px 38px 8px;background:#ffffff;">
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;">
											<tr>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Today\'s Submission', 'gutenverse-form' ), $summary['today_total_submissions'] ) ); ?>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Forms with Submission', 'gutenverse-form' ), $summary['forms_with_submissions'] ) ); ?>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Tracked Forms', 'gutenverse-form' ), $summary['tracked_forms'], true ) ); ?>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<td class="gv-content" bgcolor="#ffffff" style="padding:28px 38px 34px;background:#ffffff;">
										<table class="gv-table" role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border:1px solid #e1e3e8;border-radius:7px;border-collapse:separate;border-spacing:0;overflow:hidden;">
											<tr>
												<th class="gv-table-heading" align="left" bgcolor="#fafbfc" style="padding:18px 22px;background:#fafbfc;color:#405160;font-size:15px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;"><?php esc_html_e( 'Form', 'gutenverse-form' ); ?></th>
												<th class="gv-table-heading" width="86" bgcolor="#fafbfc" style="width:86px;padding:18px;background:#fafbfc;color:#405160;font-size:15px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;"><?php esc_html_e( 'Today', 'gutenverse-form' ); ?></th>
												<th class="gv-table-heading" width="86" bgcolor="#fafbfc" style="width:86px;padding:18px;background:#fafbfc;color:#405160;font-size:15px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;"><?php esc_html_e( 'Total', 'gutenverse-form' ); ?></th>
												<th class="gv-table-heading" align="right" width="132" nowrap="nowrap" bgcolor="#fafbfc" style="width:132px;padding:18px 22px 18px 16px;background:#fafbfc;color:#405160;font-size:15px;font-weight:700;letter-spacing:0;line-height:1.4;text-transform:none;white-space:nowrap;"><?php esc_html_e( 'Action', 'gutenverse-form' ); ?></th>
											</tr>
											<?php echo wp_kses_post( $form_rows ); ?>
										</table>
									</td>
								</tr>
								<tr>
									<td class="gv-content" bgcolor="#ffffff" style="padding:0 38px 44px;background:#ffffff;">
										<a class="gv-cta" href="<?php echo esc_url( $summary['dashboard_url'] ); ?>" style="display:inline-block;background:#4158f5;border-radius:6px;color:#ffffff;font-size:15px;font-weight:800;line-height:1;padding:17px 23px;text-decoration:none;"><?php esc_html_e( 'View Form Dashboard', 'gutenverse-form' ); ?></a>
									</td>
								</tr>
								<tr>
									<td class="gv-footer" align="center" bgcolor="#fafbfc" style="padding:28px 38px;background:#fafbfc;border-top:1px solid #e6e8ee;color:#405160;font-size:14px;line-height:1.6;text-align:center;">
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
	 * Get metric card HTML.
	 *
	 * @param string  $label Metric label.
	 * @param integer $value Metric value.
	 * @param boolean $is_last Whether this is the last metric in the row.
	 *
	 * @return string
	 */
	private function get_metric_card( $label, $value, $is_last = false ) {
		$cell_padding = $is_last ? '0' : '0 22px 0 0';

		return '<td width="33.33%" style="padding:' . esc_attr( $cell_padding ) . ';"><table class="gv-card" role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border:1px solid #e1e3e8;border-radius:7px;border-collapse:separate;border-spacing:0;"><tr><td style="padding:8px 10px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;"><tr><td class="gv-card-number" width="56" align="center" valign="middle" bgcolor="#e9edff" style="width:56px;height:56px;background:#e9edff;border-radius:5px;color:#4158f5;font-size:28px;font-weight:800;line-height:56px;text-align:center;">' . esc_html( $value ) . '</td><td class="gv-card-label" valign="middle" style="padding-left:18px;color:#405160;font-size:16px;font-weight:400;line-height:1.25;">' . esc_html( $label ) . '</td></tr></table></td></tr></table></td>';
	}
}
