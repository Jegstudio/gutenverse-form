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
				__( 'Daily Form Summary for %1$s - %2$s', 'gutenverse-form' ),
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
		$forms       = Form::get_all_form_dashboard_data();
		$forms_by_id = array();

		foreach ( $forms as $form ) {
			$forms_by_id[ (int) $form['id'] ] = $form;
		}

		$entries = get_posts(
			array(
				'post_type'      => Entries::POST_TYPE,
				'post_status'    => array( 'publish' ),
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'date_query'     => array(
					array(
						'after'     => $boundaries['start']->format( 'Y-m-d H:i:s' ),
						'before'    => $boundaries['end']->format( 'Y-m-d H:i:s' ),
						'inclusive' => true,
						'column'    => 'post_date',
					),
				),
			)
		);

		$form_counts = array();
		foreach ( $entries as $entry_id ) {
			$form_id = (int) get_post_meta( $entry_id, 'form-id', true );

			if ( ! $form_id ) {
				continue;
			}

			if ( ! isset( $form_counts[ $form_id ] ) ) {
				$form_counts[ $form_id ] = 0;
			}

			++$form_counts[ $form_id ];
		}

		$form_rows = array();
		foreach ( $form_counts as $form_id => $count ) {
			$form_data = isset( $forms_by_id[ $form_id ] ) ? $forms_by_id[ $form_id ] : array();
			$form_rows[] = array(
				'id'            => $form_id,
				'title'         => ! empty( $form_data['title'] ) ? $form_data['title'] : get_the_title( $form_id ),
				'today_count'   => (int) $count,
				'total_entries' => isset( $form_data['total_entries'] ) ? (int) $form_data['total_entries'] : 0,
				'entries_url'   => admin_url( 'edit.php?post_type=' . Entries::POST_TYPE . '&form_id=' . $form_id ),
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
			'site_url'                => home_url( '/' ),
			'dashboard_url'           => admin_url( 'admin.php?page=' . Form::POST_TYPE ),
			'today_total_submissions' => array_sum( $form_counts ),
			'forms_with_submissions'  => count( $form_rows ),
			'tracked_forms'           => count( $forms ),
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
			$form_rows .= '<td style="padding:16px 18px;border-top:1px solid #e6ebf2;color:#101828;font-size:15px;font-weight:700;line-height:1.4;">' . esc_html( $form['title'] ) . '</td>';
			$form_rows .= '<td style="padding:16px 18px;border-top:1px solid #e6ebf2;color:#101828;font-size:15px;font-weight:700;line-height:1.4;text-align:center;">' . esc_html( $form['today_count'] ) . '</td>';
			$form_rows .= '<td style="padding:16px 18px;border-top:1px solid #e6ebf2;color:#667085;font-size:14px;line-height:1.4;text-align:center;">' . esc_html( $form['total_entries'] ) . '</td>';
			$form_rows .= '<td style="padding:16px 18px;border-top:1px solid #e6ebf2;line-height:1.4;text-align:right;"><a href="' . esc_url( $form['entries_url'] ) . '" style="color:#2563eb;font-size:14px;font-weight:700;text-decoration:none;">' . esc_html__( 'View entries', 'gutenverse-form' ) . '</a></td>';
			$form_rows .= '</tr>';
		}

		if ( empty( $form_rows ) ) {
			$form_rows = '<tr><td colspan="4" style="padding:22px 18px;border-top:1px solid #e6ebf2;color:#667085;font-size:14px;line-height:1.5;text-align:center;">' . esc_html__( 'No form submissions were received today.', 'gutenverse-form' ) . '</td></tr>';
		}

		ob_start();
		?>
		<html>
			<body style="margin:0;padding:0;background:#f4f7fb;color:#101828;font-family:Arial,Helvetica,sans-serif;">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f7fb;padding:32px 0;">
					<tr>
						<td align="center" style="padding:0 14px;">
							<table role="presentation" width="680" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#ffffff;border:1px solid #d8e0ec;border-radius:14px;overflow:hidden;">
								<tr>
									<td style="padding:34px 38px 30px;background:#1f3b7a;">
										<p style="margin:0 0 12px;color:#a8bcff;font-size:12px;font-weight:800;letter-spacing:3px;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Gutenverse Form', 'gutenverse-form' ); ?></p>
										<h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;line-height:1.2;"><?php esc_html_e( 'Daily Form Summary', 'gutenverse-form' ); ?></h1>
										<p style="margin:13px 0 0;color:#dbe6ff;font-size:15px;line-height:1.6;">
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
									<td style="padding:26px 38px 8px;">
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;">
											<tr>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Today\'s submissions', 'gutenverse-form' ), $summary['today_total_submissions'] ) ); ?>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Forms with submissions', 'gutenverse-form' ), $summary['forms_with_submissions'] ) ); ?>
												<?php echo wp_kses_post( $this->get_metric_card( __( 'Tracked forms', 'gutenverse-form' ), $summary['tracked_forms'] ) ); ?>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<td style="padding:20px 38px 24px;">
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #d8e0ec;border-radius:10px;border-collapse:separate;border-spacing:0;overflow:hidden;">
											<tr>
												<th align="left" style="padding:13px 18px;background:#f8fafc;color:#475467;font-size:12px;font-weight:800;letter-spacing:.08em;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Form', 'gutenverse-form' ); ?></th>
												<th style="padding:13px 18px;background:#f8fafc;color:#475467;font-size:12px;font-weight:800;letter-spacing:.08em;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Today', 'gutenverse-form' ); ?></th>
												<th style="padding:13px 18px;background:#f8fafc;color:#475467;font-size:12px;font-weight:800;letter-spacing:.08em;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Total', 'gutenverse-form' ); ?></th>
												<th align="right" style="padding:13px 18px;background:#f8fafc;color:#475467;font-size:12px;font-weight:800;letter-spacing:.08em;line-height:1.4;text-transform:uppercase;"><?php esc_html_e( 'Action', 'gutenverse-form' ); ?></th>
											</tr>
											<?php echo wp_kses_post( $form_rows ); ?>
										</table>
									</td>
								</tr>
								<tr>
									<td style="padding:0 38px 34px;">
										<a href="<?php echo esc_url( $summary['dashboard_url'] ); ?>" style="display:inline-block;background:#2563eb;border-radius:8px;color:#ffffff;font-size:15px;font-weight:800;line-height:1;padding:15px 20px;text-decoration:none;"><?php esc_html_e( 'View Form Dashboard', 'gutenverse-form' ); ?></a>
									</td>
								</tr>
								<tr>
									<td style="padding:18px 38px;background:#f8fafc;border-top:1px solid #e6ebf2;color:#667085;font-size:12px;line-height:1.6;">
										<?php
										printf(
											/* translators: %s: site URL */
											esc_html__( 'Generated by Gutenverse Form for %s. This is an automated admin summary.', 'gutenverse-form' ),
											esc_html( $summary['site_url'] )
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
	 *
	 * @return string
	 */
	private function get_metric_card( $label, $value ) {
		return '<td width="33.33%" style="padding:0 8px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #d8e0ec;border-radius:10px;"><tr><td style="padding:18px 18px 16px;"><strong style="display:block;color:#2563eb;font-size:30px;font-weight:800;line-height:1;">' . esc_html( $value ) . '</strong><span style="display:block;margin-top:8px;color:#667085;font-size:13px;line-height:1.45;">' . esc_html( $label ) . '</span></td></tr></table></td>';
	}
}
