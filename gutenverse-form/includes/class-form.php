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
	 * Init constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'post_type' ), 9 );
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
			'edit.php?post_type=' . Entries::POST_TYPE
		);
	}

	/**
	 * Render dashboard page under Form admin menu.
	 */
	public function render_dashboard_page() {
		$forms             = self::get_all_form_dashboard_data();
		$total_entries     = array_sum(
			array_map(
				static function ( $form ) {
					return (int) $form['total_entries'];
				},
				$forms
			)
		);
		$total_locations   = array_sum(
			array_map(
				static function ( $form ) {
					return (int) $form['location_count'];
				},
				$forms
			)
		);
		$entries_last_week = array_sum(
			array_map(
				static function ( $form ) {
					return (int) $form['entries_last_week'];
				},
				$forms
			)
		);
		$forms_by_entries  = wp_list_sort( $forms, 'total_entries', 'DESC' );
		$forms_by_recent   = wp_list_sort( $forms, 'last_entry_timestamp', 'DESC' );
		$forms_by_usage    = wp_list_sort( $forms, 'location_count', 'DESC' );
		$trend_contexts    = array(
			7  => self::get_entry_trend_chart_context( 7 ),
			30 => self::get_entry_trend_chart_context( 30 ),
		);
		$needs_attention   = self::get_forms_needing_attention( $forms, 3 );
		$unused_forms      = self::get_unused_form_actions( $forms, 3 );
		$top_sources       = self::get_top_entry_sources( $forms, 3 );
		$entries_url       = admin_url( 'edit.php?post_type=' . Entries::POST_TYPE );
		?>
		<div class="wrap gutenverse-form-admin-dashboard">
			<?php self::render_form_action_migration_notice(); ?>
			<div class="gutenverse-form-admin-dashboard__hero">
				<div class="gutenverse-form-admin-dashboard__intro">
					<h1><?php esc_html_e( 'Form Dashboard', 'gutenverse-form' ); ?></h1>
					<p><?php esc_html_e( 'Track submission performance and jump into the most relevant form locations when something needs quick attention.', 'gutenverse-form' ); ?></p>
					<div class="dashboard-actions">
						<a class="dashboard-button dashboard-button--primary" href="<?php echo esc_url( $entries_url ); ?>"><?php esc_html_e( 'View Entries', 'gutenverse-form' ); ?></a>
					</div>
				</div>
				<div class="gutenverse-form-admin-dashboard__summary">
					<div class="summary-card">
						<strong><?php echo esc_html( $total_entries ); ?></strong>
						<span><?php esc_html_e( 'Total Entries', 'gutenverse-form' ); ?></span>
					</div>
					<div class="summary-card">
						<strong><?php echo esc_html( $entries_last_week ); ?></strong>
						<span><?php esc_html_e( 'Entries In Last 7 Days', 'gutenverse-form' ); ?></span>
					</div>
					<div class="summary-card">
						<strong><?php echo esc_html( $total_locations ); ?></strong>
						<span><?php esc_html_e( 'Live Locations', 'gutenverse-form' ); ?></span>
					</div>
					<div class="summary-card">
						<strong><?php echo esc_html( count( $forms ) ); ?></strong>
						<span><?php esc_html_e( 'Tracked Forms', 'gutenverse-form' ); ?></span>
					</div>
				</div>
			</div>

			<?php if ( empty( $forms ) ) : ?>
				<div class="gutenverse-form-admin-dashboard__empty">
					<?php esc_html_e( 'No forms found yet.', 'gutenverse-form' ); ?>
				</div>
			<?php else : ?>
				<?php
				$chart_top    = 32;
				$chart_base   = 168;
				$recent_forms = array_filter(
					array_slice( $forms_by_recent, 0, 3 ),
					static function ( $form ) {
						return ! empty( $form['last_entry_timestamp'] );
					}
				);
				?>
				<div class="gutenverse-form-admin-dashboard__list dashboard-grid">
					<div class="dashboard-panel dashboard-panel--wide dashboard-panel--chart">
						<div class="dashboard-block__header">
							<div>
								<?php foreach ( array_keys( $trend_contexts ) as $range ) : ?>
									<h2 class="trend-range-copy <?php echo 7 === $range ? 'active' : ''; ?>" data-trend-range-copy="<?php echo esc_attr( $range ); ?>">
										<?php
										printf(
											/* translators: %s: number of days */
											esc_html__( 'Last %s Days', 'gutenverse-form' ),
											esc_html( $range )
										);
										?>
									</h2>
									<div class="dashboard-form-card__meta trend-range-copy <?php echo 7 === $range ? 'active' : ''; ?>" data-trend-range-copy="<?php echo esc_attr( $range ); ?>">
										<?php
										printf(
											/* translators: %s: number of days */
											esc_html__( 'Daily entries for the last %s days.', 'gutenverse-form' ),
											esc_html( $range )
										);
										?>
									</div>
								<?php endforeach; ?>
							</div>
							<div class="dashboard-range-toggle" aria-label="<?php esc_attr_e( 'Chart date range', 'gutenverse-form' ); ?>">
								<button type="button" class="active" data-trend-range="7"><?php esc_html_e( '7 days', 'gutenverse-form' ); ?></button>
								<button type="button" data-trend-range="30"><?php esc_html_e( '30 days', 'gutenverse-form' ); ?></button>
							</div>
						</div>
						<div class="trend-chart trend-chart--compact">
							<?php foreach ( $trend_contexts as $range => $trend_context ) : ?>
								<div class="trend-chart__range <?php echo 7 === $range ? 'active' : ''; ?>" data-trend-range-panel="<?php echo esc_attr( $range ); ?>">
									<div class="trend-chart__line" role="img" aria-label="<?php echo esc_attr( sprintf( __( 'Daily entries for the last %s days', 'gutenverse-form' ), $range ) ); ?>">
										<div class="trend-chart__legend">
											<span class="trend-chart__legend-item"><span class="trend-chart__legend-swatch"></span><?php esc_html_e( 'Entries', 'gutenverse-form' ); ?></span>
										</div>
										<svg class="trend-chart__svg" viewBox="0 0 700 220" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">
											<path class="trend-chart__axis" d="M54 32V168H676"></path>
											<?php foreach ( $trend_context['ticks'] as $tick ) : ?>
												<?php
												$tick_y = $chart_base - ( ( $tick / $trend_context['max'] ) * ( $chart_base - $chart_top ) );
												?>
												<path class="trend-chart__grid-line" d="M54 <?php echo esc_attr( round( $tick_y, 2 ) ); ?>H676"></path>
												<text class="trend-chart__y-label" x="42" y="<?php echo esc_attr( round( $tick_y + 4, 2 ) ); ?>"><?php echo esc_html( $tick ); ?></text>
											<?php endforeach; ?>
											<polyline class="trend-chart__stroke" points="<?php echo esc_attr( $trend_context['line_points'] ); ?>"></polyline>
											<?php foreach ( $trend_context['points'] as $point ) : ?>
												<circle class="trend-chart__point" cx="<?php echo esc_attr( $point['x'] ); ?>" cy="<?php echo esc_attr( $point['y'] ); ?>" r="4">
													<title><?php echo esc_html( $point['tooltip'] ); ?></title>
												</circle>
												<?php if ( $point['show_label'] ) : ?>
													<text class="trend-chart__x-label" x="<?php echo esc_attr( $point['x'] ); ?>" y="202"><?php echo esc_html( $point['label'] ); ?></text>
												<?php endif; ?>
											<?php endforeach; ?>
										</svg>
									</div>
								</div>
							<?php endforeach; ?>
						</div>
					</div>

					<div class="dashboard-masonry">
						<div class="dashboard-panel dashboard-panel--attention">
							<div class="dashboard-panel__title">
								<h3><?php esc_html_e( 'Needs Attention', 'gutenverse-form' ); ?></h3>
							</div>
							<?php if ( empty( $needs_attention ) ) : ?>
								<p class="empty-note"><?php esc_html_e( 'Nothing urgent detected right now.', 'gutenverse-form' ); ?></p>
							<?php else : ?>
								<?php foreach ( $needs_attention as $form ) : ?>
									<?php $primary_location = ! empty( $form['locations'][0] ) ? $form['locations'][0] : null; ?>
									<div class="dashboard-row">
										<div>
											<strong><?php echo esc_html( $form['title'] ); ?></strong>
											<span><?php echo esc_html( $form['attention_reason'] ); ?></span>
										</div>
										<div class="dashboard-row__actions">
											<?php if ( ! empty( $primary_location['edit_url'] ) ) : ?>
												<a href="<?php echo esc_url( $primary_location['edit_url'] ); ?>"><?php esc_html_e( 'Edit Post', 'gutenverse-form' ); ?></a>
											<?php endif; ?>
										</div>
									</div>
								<?php endforeach; ?>
							<?php endif; ?>
						</div>

						<div class="dashboard-panel">
							<div class="dashboard-panel__title">
								<h3><?php esc_html_e( 'Top Entry Sources', 'gutenverse-form' ); ?></h3>
							</div>
							<?php if ( empty( $top_sources ) ) : ?>
								<p class="empty-note"><?php esc_html_e( 'Entry source data will appear after submissions are linked to posts or pages.', 'gutenverse-form' ); ?></p>
							<?php else : ?>
								<?php foreach ( $top_sources as $source ) : ?>
									<div class="dashboard-row">
										<div>
											<strong><?php echo esc_html( $source['title'] ); ?></strong>
											<span>
												<?php
												printf(
													/* translators: 1: entry count, 2: source type */
													esc_html__( '%1$s entries • %2$s', 'gutenverse-form' ),
													esc_html( $source['count'] ),
													esc_html( $source['type'] )
												);
												?>
											</span>
										</div>
										<div class="dashboard-row__actions">
											<?php if ( ! empty( $source['edit_url'] ) ) : ?>
												<a href="<?php echo esc_url( $source['edit_url'] ); ?>"><?php esc_html_e( 'Edit', 'gutenverse-form' ); ?></a>
											<?php endif; ?>
										</div>
									</div>
								<?php endforeach; ?>
							<?php endif; ?>
						</div>

						<?php if ( ! empty( $unused_forms ) ) : ?>
							<div class="dashboard-panel">
								<div class="dashboard-panel__title">
									<h3><?php esc_html_e( 'Unused Form Actions', 'gutenverse-form' ); ?></h3>
								</div>
								<?php foreach ( $unused_forms as $form ) : ?>
									<div class="dashboard-row">
										<div>
											<strong><?php echo esc_html( $form['title'] ); ?></strong>
											<span>
												<?php
												printf(
													/* translators: %s: modified date */
													esc_html__( 'No live location • Updated %s', 'gutenverse-form' ),
													esc_html( $form['modified'] )
												);
												?>
											</span>
										</div>
										<div class="dashboard-row__actions">
											<span class="status-badge"><?php esc_html_e( 'No live post', 'gutenverse-form' ); ?></span>
										</div>
									</div>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>

						<div class="dashboard-panel">
							<div class="dashboard-panel__title">
								<h3><?php esc_html_e( 'Top Forms', 'gutenverse-form' ); ?></h3>
							</div>
							<?php foreach ( array_slice( $forms_by_entries, 0, 3 ) as $form ) : ?>
								<?php $primary_location = ! empty( $form['locations'][0] ) ? $form['locations'][0] : null; ?>
								<div class="dashboard-row">
									<div>
										<strong><?php echo esc_html( $form['title'] ); ?></strong>
										<span>
											<?php
											printf(
												/* translators: 1: total entries, 2: last 7 days count */
												esc_html__( '%1$s total • %2$s this week', 'gutenverse-form' ),
												esc_html( $form['total_entries'] ),
												esc_html( $form['entries_last_week'] )
											);
											?>
										</span>
									</div>
									<div class="dashboard-row__actions">
										<?php if ( ! empty( $primary_location['edit_url'] ) ) : ?>
											<a href="<?php echo esc_url( $primary_location['edit_url'] ); ?>"><?php esc_html_e( 'Edit', 'gutenverse-form' ); ?></a>
										<?php endif; ?>
									</div>
								</div>
							<?php endforeach; ?>
						</div>

						<div class="dashboard-panel">
							<div class="dashboard-panel__title">
								<h3><?php esc_html_e( 'Recent Activity', 'gutenverse-form' ); ?></h3>
							</div>
							<?php if ( empty( $recent_forms ) ) : ?>
								<p class="empty-note"><?php esc_html_e( 'No recent entry activity yet.', 'gutenverse-form' ); ?></p>
							<?php else : ?>
								<?php foreach ( $recent_forms as $form ) : ?>
									<?php $primary_location = ! empty( $form['locations'][0] ) ? $form['locations'][0] : null; ?>
									<div class="dashboard-row">
										<div>
											<strong><?php echo esc_html( $form['title'] ); ?></strong>
											<span>
												<?php
												printf(
													/* translators: %s: last entry date */
													esc_html__( 'Last entry: %s', 'gutenverse-form' ),
													esc_html( $form['last_entry_date'] )
												);
												?>
											</span>
										</div>
										<div class="dashboard-row__actions">
											<?php if ( ! empty( $primary_location['edit_url'] ) ) : ?>
												<a href="<?php echo esc_url( $primary_location['edit_url'] ); ?>"><?php esc_html_e( 'Edit', 'gutenverse-form' ); ?></a>
											<?php endif; ?>
										</div>
									</div>
								<?php endforeach; ?>
							<?php endif; ?>
						</div>
					</div>
				</div>
			<?php endif; ?>
		</div>
		<style>
			.gutenverse-form-admin-dashboard{max-width:1180px;margin:18px 20px 40px 0;color:#1f2937}
			.gutenverse-form-admin-dashboard *{box-sizing:border-box}
			.gutenverse-form-admin-dashboard__hero,.dashboard-panel{background:#fff;border:1px solid #d9dee8;border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
			.gutenverse-form-action-migration-notice{align-items:flex-start;background:#eef4ff;border:1px solid #93c5fd;border-radius:8px;color:#1f2937;display:flex;gap:16px;justify-content:space-between;margin-bottom:18px;padding:16px 18px 16px 20px;position:relative}
			.gutenverse-form-action-migration-notice:before{background:#2563eb;border-radius:8px 0 0 8px;bottom:-1px;content:"";display:block;left:-1px;position:absolute;top:-1px;width:4px}
			.gutenverse-form-action-migration-notice.is-hidden{display:none}
			.gutenverse-form-action-migration-notice strong{color:#111827;display:block;font-size:14px;font-weight:800;line-height:1.35;margin:0 0 5px}
			.gutenverse-form-action-migration-notice p{color:#475467;font-size:13px;line-height:1.45;margin:0;max-width:820px}
			.gutenverse-form-action-migration-notice button{align-items:center;background:#fff;border:1px solid #bfdbfe;border-radius:4px;color:#475467;cursor:pointer;display:inline-flex;font-size:18px;height:28px;justify-content:center;line-height:1;margin:-2px -2px 0 0;padding:0;width:28px}
			.gutenverse-form-action-migration-notice button:hover,.gutenverse-form-action-migration-notice button:focus{background:#dbeafe;border-color:#60a5fa;color:#1d4ed8;outline:none}
			.gutenverse-form-admin-dashboard__hero{display:grid;grid-template-columns:minmax(260px,1fr) minmax(560px,680px);gap:18px;align-items:center;margin-bottom:18px;padding:14px 16px}
			.gutenverse-form-admin-dashboard__intro{display:grid;gap:7px;min-width:0}
			.gutenverse-form-admin-dashboard__hero h1{color:#111827;font-size:22px;font-weight:700;line-height:1.15;margin:0}
			.gutenverse-form-admin-dashboard__hero p{color:#5f6c7b;font-size:13px;line-height:1.4;margin:0;max-width:620px}
			.dashboard-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:3px}
			.dashboard-button{align-items:center;background:#fff;border:1px solid #c8d0dc;border-radius:5px;color:#344054;cursor:pointer;display:inline-flex;font-size:13px;font-weight:600;line-height:1;min-height:32px;padding:8px 12px;text-decoration:none;transition:background .15s ease,border-color .15s ease,color .15s ease}
			.dashboard-button:hover,.dashboard-button:focus{background:#f8fafc;border-color:#98a2b3;color:#111827;text-decoration:none}
			.dashboard-button--primary{background:#2563eb;border-color:#2563eb;color:#fff}
			.dashboard-button--primary:hover,.dashboard-button--primary:focus{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
			.gutenverse-form-admin-dashboard__summary{display:grid;gap:8px;grid-template-columns:repeat(4,minmax(0,1fr))}
			.summary-card{align-items:flex-start;background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);border:1px solid #dce6f6;border-radius:8px;display:flex;flex-direction:column;gap:6px;justify-content:center;min-height:64px;padding:10px 12px}
			.summary-card strong{color:#1d4ed8;display:block;font-size:24px;font-weight:800;line-height:1;margin:0}
			.summary-card span,.dashboard-form-card__meta,.dashboard-row span,.empty-note{color:#667085;display:block;font-size:13px;line-height:1.45}
			.gutenverse-form-admin-dashboard__list{display:grid;gap:16px}
			.dashboard-grid{align-items:start;grid-template-columns:repeat(2,minmax(0,1fr))}
			.dashboard-masonry{column-count:2;column-gap:16px;grid-column:1 / -1}
			.dashboard-masonry .dashboard-panel{break-inside:avoid;display:inline-block;margin:0 0 16px;width:100%}
			.dashboard-panel{overflow:hidden;padding:0}
			.dashboard-panel--wide{grid-column:1 / -1}
			.dashboard-panel--attention{border-color:#d7deea}
			.dashboard-block__header,.dashboard-panel__title{align-items:flex-start;background:#fff;border-bottom:1px solid #edf0f5;display:flex;justify-content:space-between;padding:18px 20px 14px}
			.dashboard-block__header h2{color:#111827;font-size:20px;font-weight:700;line-height:1.2;margin:0 0 5px}
			.dashboard-panel h3{color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.09em;line-height:1.2;margin:0;text-transform:uppercase}
			.trend-range-copy{display:none}
			.trend-range-copy.active{display:block}
			.dashboard-range-toggle{background:#f8fafc;border:1px solid #d7deea;border-radius:6px;display:flex;gap:2px;padding:3px}
			.dashboard-range-toggle button{background:transparent;border:0;border-radius:4px;color:#475467;cursor:pointer;font-size:12px;font-weight:700;line-height:1;padding:7px 10px}
			.dashboard-range-toggle button:hover,.dashboard-range-toggle button:focus{background:#eef4ff;color:#1d4ed8}
			.dashboard-range-toggle button.active{background:#2563eb;color:#fff}
			.trend-chart{background:#fff;padding:18px 20px 20px}
			.dashboard-panel--chart .trend-chart{padding:18px 20px 22px}
			.trend-chart__range{display:none}
			.trend-chart__range.active{display:block}
			.trend-chart__line{background:#fff;border:1px solid #d7deea;border-radius:4px;margin:0 auto;max-width:820px;min-height:276px;padding:14px 16px 12px}
			.trend-chart__legend{align-items:center;display:flex;gap:16px;justify-content:flex-end;margin-bottom:8px}
			.trend-chart__legend-item{align-items:center;color:#1f2937;display:inline-flex;font-size:12px;gap:7px;line-height:1.2}
			.trend-chart__legend-swatch{background:#2563eb;border:1px solid #1d4ed8;display:inline-block;height:13px;width:18px}
			.trend-chart__svg{display:block;height:220px;overflow:visible;width:100%}
			.trend-chart__axis{fill:none;stroke:#8c98a6;stroke-width:1}
			.trend-chart__grid-line{fill:none;stroke:#d8dde6;stroke-width:1}
			.trend-chart__stroke{fill:none;stroke:#2563eb;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}
			.trend-chart__point{fill:#2563eb;stroke:#2563eb;stroke-width:2}
			.trend-chart__x-label,.trend-chart__y-label{fill:#344054;font-size:11px}
			.trend-chart__x-label{text-anchor:middle}
			.trend-chart__y-label{text-anchor:end}
			.dashboard-row{align-items:center;border-top:1px solid #edf0f5;display:grid;gap:16px;grid-template-columns:minmax(0,1fr) auto;min-height:64px;padding:13px 20px}
			.dashboard-panel__title + .dashboard-row{border-top:0}
			.dashboard-row strong{color:#111827;display:block;font-size:14px;font-weight:700;line-height:1.35;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
			.dashboard-row__actions{align-items:center;color:#667085;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;min-width:96px}
			.dashboard-row__actions a{background:#f8fafc;border:1px solid #d7deea;border-radius:4px;color:#1d4ed8;font-size:12px;font-weight:700;line-height:1;padding:7px 9px;text-decoration:none}
			.dashboard-row__actions a:hover,.dashboard-row__actions a:focus{background:#eff6ff;border-color:#bfdbfe;color:#1e40af;text-decoration:none}
			.status-badge{background:#f8fafc;border:1px solid #d7deea;border-radius:999px;color:#475467;display:inline-flex;font-size:12px;font-weight:600;line-height:1;padding:7px 10px;white-space:nowrap}
			.empty-note{align-items:center;display:flex;margin:0;min-height:64px;padding:13px 20px}
			.gutenverse-form-admin-dashboard__empty{background:#fff;border:1px solid #d9dee8;border-radius:8px;color:#50575e;font-size:14px;line-height:1.6;padding:18px 20px}
			@media (max-width:1280px){.gutenverse-form-admin-dashboard__hero{grid-template-columns:1fr}.gutenverse-form-admin-dashboard__summary{grid-template-columns:repeat(4,minmax(0,1fr))}}
			@media (max-width:1100px){.dashboard-grid{grid-template-columns:1fr}.dashboard-masonry{column-count:1}.gutenverse-form-admin-dashboard__summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
			@media (max-width:782px){.gutenverse-form-admin-dashboard{margin-right:10px}.gutenverse-form-admin-dashboard__hero{padding:16px}.gutenverse-form-admin-dashboard__summary,.dashboard-grid{grid-template-columns:1fr}.dashboard-masonry{column-count:1}.dashboard-actions{display:grid}.dashboard-button{justify-content:center}.dashboard-block__header{display:grid;gap:12px}.dashboard-range-toggle{width:max-content}.trend-chart{padding:14px}.trend-chart__line{min-height:230px;padding:12px 10px}.trend-chart__legend{justify-content:flex-start}.trend-chart__svg{height:190px}.trend-chart__x-label,.trend-chart__y-label{font-size:10px}.dashboard-row{grid-template-columns:1fr}.dashboard-row strong{white-space:normal}.dashboard-row__actions{justify-content:flex-start}}
		</style>
		<script>
			document.addEventListener('DOMContentLoaded', function() {
				var dashboard = document.querySelector('.gutenverse-form-admin-dashboard');

				if (!dashboard) {
					return;
				}

				var notice = dashboard.querySelector('[data-form-action-migration-notice]');
				var dismiss = dashboard.querySelector('[data-form-action-migration-dismiss]');

				if (notice && dismiss) {
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

				dashboard.querySelectorAll('[data-trend-range]').forEach(function(button) {
					button.addEventListener('click', function() {
						var range = button.getAttribute('data-trend-range');

						dashboard.querySelectorAll('[data-trend-range]').forEach(function(item) {
							item.classList.toggle('active', item === button);
						});

						dashboard.querySelectorAll('[data-trend-range-panel]').forEach(function(panel) {
							panel.classList.toggle('active', panel.getAttribute('data-trend-range-panel') === range);
						});

						dashboard.querySelectorAll('[data-trend-range-copy]').forEach(function(copy) {
							copy.classList.toggle('active', copy.getAttribute('data-trend-range-copy') === range);
						});
					});
				});
			});
		</script>
		<?php
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
			$form_link     = admin_url( 'edit.php?post_type=' . Entries::POST_TYPE ) . '&form_id=' . $post_id;
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

		if ( self::POST_TYPE === $screen->post_type ) {
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
			$meta = get_post_meta( $id, 'form-data', true );
			$data = array(
				'title' => get_the_title( $id ),
			);

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

		$form_action       = self::get_form_action_data( $id );
		$entry_query       = get_posts(
			array(
				'post_type'      => Entries::POST_TYPE,
				'posts_per_page' => -1,
				'post_status'    => array( 'publish' ),
				'orderby'        => 'date',
				'order'          => 'DESC',
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'     => 'form-id',
						'value'   => $id,
						'compare' => '=',
					),
				),
			)
		);
		$latest_entries    = array();
		$source_post_map   = array();
		$entries_last_week = 0;
		$last_entry_date   = '';
		$last_entry_ts     = 0;
		$week_cutoff       = time() - WEEK_IN_SECONDS;

		foreach ( $entry_query as $index => $entry_post ) {
			$entry_time = get_post_time( 'U', true, $entry_post );
			$post_id    = (int) get_post_meta( $entry_post->ID, 'post-id', true );
			$post_item  = null;
			$post_type  = null;

			if ( $entry_time >= $week_cutoff ) {
				++$entries_last_week;
			}

			if ( $entry_time > $last_entry_ts ) {
				$last_entry_ts   = $entry_time;
				$last_entry_date = get_the_date( '', $entry_post );
			}

			if ( $post_id > 0 ) {
				if ( ! isset( $source_post_map[ $post_id ] ) ) {
					$source_post_map[ $post_id ] = 0;
				}

				++$source_post_map[ $post_id ];
				$post_item = get_post( $post_id );
				$post_type = $post_item ? get_post_type_object( $post_item->post_type ) : null;
			}

			if ( $index < 5 ) {
				$latest_entries[] = array(
					'id'            => $entry_post->ID,
					'title'         => get_the_title( $entry_post ),
					'date'          => get_the_date( '', $entry_post ),
					'edit_url'      => get_edit_post_link( $entry_post->ID, 'raw' ),
					'source_title'  => $post_item ? get_the_title( $post_item ) : '',
					'source_type'   => $post_type ? $post_type->labels->singular_name : '',
					'source_view'   => $post_item ? get_permalink( $post_item ) : '',
					'source_edit'   => $post_item ? get_edit_post_link( $post_item->ID, 'raw' ) : '',
					'source_status' => $post_item ? get_post_status( $post_item ) : '',
				);
			}
		}

		arsort( $source_post_map );

		$top_sources = array();
		foreach ( array_slice( array_keys( $source_post_map ), 0, 5 ) as $source_id ) {
			$source_post = get_post( $source_id );
			$type_object = $source_post ? get_post_type_object( $source_post->post_type ) : null;

			if ( ! $source_post ) {
				continue;
			}

			$top_sources[] = array(
				'id'       => $source_post->ID,
				'title'    => get_the_title( $source_post ),
				'type'     => $type_object ? $type_object->labels->singular_name : $source_post->post_type,
				'count'    => (int) $source_post_map[ $source_id ],
				'status'   => get_post_status( $source_post ),
				'view_url' => get_permalink( $source_post ),
				'edit_url' => get_edit_post_link( $source_post->ID, 'raw' ),
			);
		}

		$locations = self::get_form_locations( $id );

		return array(
			'id'                   => (int) $id,
			'title'                => get_the_title( $id ),
			'created'              => get_the_date( '', $post ),
			'modified'             => get_the_modified_date( '', $post ),
			'edit_url'             => get_edit_post_link( $id, 'raw' ),
			'entries_url'          => admin_url( 'edit.php?post_type=' . Entries::POST_TYPE . '&form_id=' . $id ),
			'export_url'           => rest_url( '/gutenverse-form-client/v1/form-action/export/' . $id . '?_wpnonce=' . wp_create_nonce( 'wp_rest' ) ),
			'total_entries'        => count( $entry_query ),
			'entries_last_week'    => $entries_last_week,
			'last_entry_date'      => $last_entry_date,
			'last_entry_timestamp' => $last_entry_ts,
			'location_count'       => count( $locations ),
			'locations'            => $locations,
			'top_sources'          => $top_sources,
			'latest_entries'       => $latest_entries,
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
				'post_type'      => self::POST_TYPE,
				'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page' => -1,
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);
		$data  = array();

		foreach ( $forms as $form ) {
			$form_dashboard = self::get_form_dashboard_data( $form->ID );

			if ( $form_dashboard ) {
				$data[] = $form_dashboard;
			}
		}

		return $data;
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
		$ignored_types = array(
			self::POST_TYPE,
			Entries::POST_TYPE,
			'gutenverse-email-tpl',
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
				'post_type'      => $post_types,
				'post_status'    => $statuses,
				'posts_per_page' => -1,
			)
		);
		$locations     = array();

		foreach ( $posts as $post ) {
			if ( ! has_blocks( $post->post_content ) ) {
				continue;
			}

			if ( ! self::post_uses_form_action( parse_blocks( $post->post_content ), $form_id ) ) {
				continue;
			}

			$type_object = get_post_type_object( $post->post_type );
			$locations[] = array(
				'id'       => (int) $post->ID,
				'title'    => get_the_title( $post ) ? get_the_title( $post ) : __( '(no title)', 'gutenverse-form' ),
				'type'     => $type_object ? $type_object->labels->singular_name : $post->post_type,
				'status'   => get_post_status( $post ),
				'view_url' => get_permalink( $post ),
				'edit_url' => get_edit_post_link( $post->ID, 'raw' ),
			);
		}

		return $locations;
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
	 * Create Form Action
	 *
	 * @param array $params Form Action Parameter.
	 *
	 * @return array
	 */
	public static function create_form_action( $params ) {
		$form_data = array(
			'post_title'  => $params['title'],
			'post_status' => 'publish',
			'post_type'   => self::POST_TYPE,
			'meta_input'  => array(
				'form-data' => $params,
			),
		);

		return wp_insert_post( $form_data );
	}

	/**
	 * Edit Form Action
	 *
	 * @param array $params Form Action Parameter.
	 *
	 * @return array
	 */
	public static function edit_form_action( $params ) {
		update_post_meta(
			$params['id'],
			'form-data',
			array(
				'require_login'                  => $params['require_login'],
				'user_browser'                   => $params['user_browser'],
				'form_success_notice'            => $params['form_success_notice'],
				'form_error_notice'              => $params['form_error_notice'],
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
				'variable_mapping'               => isset( $params['variable_mapping'] ) ? $params['variable_mapping'] : array(),
			)
		);

		// Update associated email template titles.
		$user_tpl_id  = isset( $params['user_email_template'] ) ? (int) $params['user_email_template'] : 0;
		$admin_tpl_id = isset( $params['admin_email_template'] ) ? (int) $params['admin_email_template'] : 0;

		if ( $user_tpl_id && 'gutenverse-email-tpl' === get_post_type( $user_tpl_id ) ) {
			wp_update_post(
				array(
					'ID'         => $user_tpl_id,
					'post_title' => $params['title'] . ' - ' . __( 'Confirmation', 'gutenverse-form' ),
				)
			);
		}

		if ( $admin_tpl_id && 'gutenverse-email-tpl' === get_post_type( $admin_tpl_id ) ) {
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
	 * @param integer $id Delete Form Action.
	 *
	 * @return mixed
	 */
	public static function delete_form_action( $id ) {
		$post_type = get_post_type( $id );
		if ( self::POST_TYPE !== $post_type && 'revision' !== $post_type ) {
			return new WP_Error(
				'forbidden_permission',
				/* translators: %s is the post type name */
				sprintf( esc_html__( 'Forbidden Access: Target post type is %s', 'gutenverse-form' ), $post_type ),
				array( 'status' => 403 )
			);
		}
		return wp_delete_post( $id, true );
	}

	/**
	 * Clone Form Action
	 *
	 * @param integer $id Delete Form Action.
	 *
	 * @return mixed
	 */
	public static function clone_form_action( $id ) {
		$title     = get_the_title( $id );
		$meta      = get_post_meta( $id, 'form-data', true );
		$new_title = $title . esc_html__( ' Clone', 'gutenverse-form' );

		return self::create_form_action(
			array_merge(
				$meta,
				array(
					'title' => $new_title,
				)
			)
		);
	}
}
