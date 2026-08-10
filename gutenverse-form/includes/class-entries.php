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
	 * Entry ID allowed to receive the first generated title write during creation.
	 *
	 * @var int
	 */
	private static $entry_title_update_id = 0;

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
		add_filter( 'wp_insert_post_data', array( $this, 'protect_entry_title' ), 10, 2 );
		add_filter( 'posts_join', array( $this, 'search_join' ) );
		add_filter( 'posts_where', array( $this, 'search_where' ) );
		add_filter( 'posts_groupby', array( $this, 'search_groupby' ) );

		add_action( 'wp_ajax_gutenverse_form_retrigger_integration', array( $this, 'retrigger_integration' ) );
		add_action( 'do_meta_boxes', array( $this, 'remove_default_entry_meta_boxes' ), 99, 0 );
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
		$capabilities = array(
			'viewAll'      => true,
			'export'       => true,
			'filter'       => true,
			'olderDetails' => true,
		);

		$capabilities = wp_parse_args(
			apply_filters( 'gutenverse_form_entry_list_capabilities', $capabilities, true ),
			array(
				'viewAll'      => true,
				'export'       => true,
				'filter'       => true,
				'olderDetails' => true,
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
			'limit'         => -1,
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
		$svg_map = array(
			'whatsapp'        => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="10" cy="10" r="10" fill="url(#paint0_linear_3299_1903)"/>
									<path fill-rule="evenodd" clip-rule="evenodd" d="M13.5414 6.45333C13.0802 5.99095 12.5313 5.62437 11.9266 5.37489C11.3218 5.1254 10.6733 4.99798 10.0186 5.00002C7.27611 5.00002 5.04157 7.22278 5.04157 9.95536C5.04078 10.8248 5.27017 11.6791 5.70663 12.4323L5 15L7.6396 14.3104C8.36954 14.7064 9.18756 14.9141 10.0189 14.9144H10.0209C12.7652 14.9144 15 12.6917 15 9.95907C15.0015 9.30787 14.8733 8.66284 14.6228 8.06125C14.3723 7.45966 14.0045 6.91345 13.5406 6.45419L13.5414 6.45333ZM10.0201 14.0802C9.27847 14.0803 8.5505 13.8819 7.91251 13.5056L7.76086 13.4157L6.19453 13.8234L6.61277 12.3037L6.51473 12.1476C6.09889 11.4918 5.87906 10.7317 5.88092 9.95622C5.88092 7.68411 7.73764 5.83509 10.0224 5.83509C10.566 5.83517 11.1043 5.94187 11.6065 6.1491C12.1087 6.35633 12.565 6.66003 12.9492 7.04284C13.3334 7.42564 13.6381 7.88005 13.8457 8.38009C14.0534 8.88014 14.16 9.416 14.1595 9.95707C14.1575 12.23 12.301 14.0785 10.0198 14.0785L10.0201 14.0802ZM12.289 10.9933C12.1652 10.9305 11.5529 10.6318 11.439 10.5904C11.3252 10.5491 11.2427 10.528 11.1581 10.6532C11.0736 10.7784 10.8365 11.0558 10.7637 11.1382C10.6909 11.2207 10.6186 11.2321 10.4951 11.1693C10.3715 11.1065 9.96903 10.9762 9.49403 10.5542C9.12481 10.2261 8.87455 9.81985 8.80174 9.69831C8.72892 9.57677 8.79342 9.50688 8.85678 9.44639C8.91411 9.39133 8.98062 9.30203 9.0434 9.22957C9.10617 9.1571 9.12595 9.10632 9.16723 9.02244C9.20851 8.93856 9.18845 8.86781 9.1572 8.80561C9.12595 8.74342 8.87627 8.13374 8.77479 7.88553C8.67475 7.64274 8.57069 7.67669 8.49415 7.67241C8.41761 7.66813 8.33878 7.6687 8.2565 7.6687C8.19353 7.67038 8.13158 7.68495 8.07452 7.71151C8.01746 7.73806 7.9665 7.77603 7.92483 7.82305C7.81017 7.9463 7.4891 8.247 7.4891 8.8564C7.4891 9.46579 7.93458 10.0546 7.99707 10.1377C8.05956 10.2207 8.87455 11.4717 10.1224 12.0075C10.4188 12.1342 10.6504 12.2104 10.831 12.2694C11.0848 12.3455 11.3529 12.3622 11.6142 12.3182C11.8536 12.2831 12.3504 12.0189 12.4544 11.7299C12.5585 11.4409 12.5585 11.1927 12.5275 11.1416C12.4966 11.0906 12.4154 11.056 12.2899 10.9927L12.289 10.9933Z" fill="white"/>
									<defs>
										<linearGradient id="paint0_linear_3299_1903" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
											<stop stop-color="#61FD7D"/>
											<stop offset="1" stop-color="#2BB826"/>
										</linearGradient>
									</defs>
								</svg>',
			'telegram'        => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="url(#paint0_linear_3299_1911)"/>
									<path fill-rule="evenodd" clip-rule="evenodd" d="M4.64643 9.42309C7.33078 8.25356 9.12077 7.48254 10.0164 7.11002C12.5736 6.0464 13.1049 5.86163 13.4513 5.85553C13.5274 5.85419 13.6978 5.87307 13.8081 5.96259C13.9012 6.03818 13.9269 6.14029 13.9391 6.21196C13.9514 6.28362 13.9667 6.44688 13.9545 6.57445C13.816 8.03047 13.2164 11.5638 12.9113 13.1946C12.7822 13.8846 12.5281 14.116 12.282 14.1386C11.7473 14.1878 11.3412 13.7853 10.8233 13.4458C10.0129 12.9145 9.55504 12.5838 8.76838 12.0654C7.85925 11.4663 8.4486 11.137 8.96671 10.5989C9.1023 10.4581 11.4583 8.31507 11.5039 8.12067C11.5096 8.09635 11.5149 8.00572 11.4611 7.95787C11.4073 7.91001 11.3278 7.92638 11.2704 7.93939C11.1892 7.95784 9.89449 8.81357 7.38642 10.5066C7.01893 10.7589 6.68607 10.8819 6.38783 10.8754C6.05906 10.8683 5.42662 10.6895 4.95647 10.5367C4.37981 10.3493 3.9215 10.2502 3.96141 9.93182C3.98219 9.76601 4.21054 9.59643 4.64643 9.42309Z" fill="white"/>
									<defs>
										<linearGradient id="paint0_linear_3299_1911" x1="10" y1="0" x2="10" y2="19.8517" gradientUnits="userSpaceOnUse">
											<stop stop-color="#2AABEE"/>
											<stop offset="1" stop-color="#229ED9"/>
										</linearGradient>
									</defs>
								</svg>',
			'discord'         => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#5865F2"/>
									<path d="M14.2513 6.17783C13.5077 5.82613 12.7103 5.567 11.8766 5.41859C11.8614 5.41573 11.8463 5.42289 11.8384 5.4372C11.7359 5.62522 11.6223 5.8705 11.5427 6.0633C10.646 5.92491 9.75391 5.92491 8.87557 6.0633C8.79601 5.86622 8.67829 5.62522 8.57528 5.4372C8.56746 5.42336 8.55229 5.4162 8.53711 5.41859C7.70384 5.56653 6.90645 5.82565 6.1624 6.17783C6.15596 6.1807 6.15044 6.18547 6.14677 6.19167C4.63429 8.52094 4.21995 10.793 4.42321 13.0368C4.42413 13.0478 4.43011 13.0583 4.43839 13.065C5.43628 13.8204 6.40291 14.279 7.35159 14.583C7.36678 14.5877 7.38286 14.582 7.39252 14.5691C7.61693 14.2532 7.81698 13.9201 7.98849 13.5698C7.99862 13.5493 7.98895 13.525 7.96827 13.5169C7.65097 13.3928 7.34883 13.2415 7.0582 13.0697C7.03521 13.0559 7.03337 13.022 7.05452 13.0058C7.11568 12.9585 7.17686 12.9094 7.23525 12.8597C7.24582 12.8507 7.26054 12.8488 7.27297 12.8545C9.18229 13.7531 11.2494 13.7531 13.1362 12.8545C13.1486 12.8483 13.1633 12.8502 13.1743 12.8593C13.2327 12.9089 13.2939 12.9585 13.3555 13.0058C13.3767 13.022 13.3753 13.0559 13.3523 13.0697C13.0617 13.2449 12.7595 13.3928 12.4418 13.5164C12.4211 13.5245 12.4119 13.5493 12.422 13.5698C12.5972 13.9196 12.7972 14.2527 13.0175 14.5686C13.0267 14.582 13.0433 14.5877 13.0584 14.583C14.0117 14.279 14.9784 13.8204 15.9762 13.065C15.985 13.0583 15.9905 13.0483 15.9914 13.0373C16.2347 10.4431 15.584 8.18976 14.2665 6.19215C14.2633 6.18547 14.2578 6.1807 14.2513 6.17783ZM8.27362 11.6705C7.69878 11.6705 7.22513 11.1265 7.22513 10.4584C7.22513 9.79032 7.6896 9.24631 8.27362 9.24631C8.86223 9.24631 9.33129 9.7951 9.32209 10.4584C9.32209 11.1265 8.85763 11.6705 8.27362 11.6705ZM12.1502 11.6705C11.5754 11.6705 11.1017 11.1265 11.1017 10.4584C11.1017 9.79032 11.5662 9.24631 12.1502 9.24631C12.7388 9.24631 13.2079 9.7951 13.1987 10.4584C13.1987 11.1265 12.7388 11.6705 12.1502 11.6705Z" fill="white"/>
								</svg>',
			'mailchimp'       => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#FFE01B"/>
									<path d="M12.7682 9.66928C12.8487 9.64995 12.9327 9.64995 13.0132 9.66928C13.0503 9.52143 13.0564 9.36753 13.0313 9.21719C12.9753 8.95353 12.8995 8.76569 12.749 8.78436C12.5985 8.80303 12.5985 8.99144 12.6364 9.29244C12.6364 9.44353 12.7116 9.59403 12.7682 9.66928ZM11.3939 9.89503C11.5065 9.95161 11.5817 9.97086 11.601 9.95161C11.657 9.89503 11.5251 9.70661 11.2801 9.61328C11.1524 9.55959 11.0135 9.53831 10.8756 9.55133C10.7376 9.56436 10.6051 9.61129 10.4897 9.68794C10.4145 9.74453 10.3392 9.81978 10.3392 9.87636C10.3579 9.95161 10.6029 9.80053 10.9226 9.80053C11.1302 9.78244 11.2621 9.85769 11.3933 9.89503M11.1483 10.0269C10.9033 10.0455 10.7715 10.1774 10.8094 10.2905C10.8281 10.2905 10.8281 10.3092 10.9412 10.2719C11.0921 10.2151 11.2615 10.1962 11.4493 10.2153C11.5251 10.2153 11.5625 10.2339 11.5811 10.1966C11.6004 10.1587 11.412 9.98953 11.1483 10.0274M12.56 10.4795C12.6358 10.2911 12.2776 10.1027 12.1837 10.2911C12.1085 10.4795 12.4847 10.6487 12.56 10.4795ZM12.9561 9.93353C12.749 9.93353 12.749 10.3664 12.9561 10.3664C13.1631 10.3664 13.1631 9.93353 12.9561 9.93353ZM7.28956 11.9857C7.27031 11.9857 7.13847 12.0044 7.08247 11.9291C6.95064 11.722 7.36481 11.4018 7.15772 11.0063C6.91272 10.5548 6.42272 10.6679 6.25356 10.8558C6.04647 11.1194 6.04647 11.4584 6.12231 11.4584C6.23489 11.477 6.23489 11.3079 6.32939 11.1381C6.40464 10.9876 6.64906 10.931 6.78089 11.0629C7.10114 11.2699 6.79956 11.5149 6.83747 11.7973C6.85614 12.2494 7.30822 12.2301 7.40214 12.0423C7.42139 12.023 7.40214 12.023 7.40214 11.9857C7.36481 12.0044 7.38347 11.9478 7.28956 11.9857ZM15.0835 11.5523C15.0082 11.2326 15.0082 11.3073 14.8956 11.0255C15.0175 10.8546 15.0765 10.6468 15.0626 10.4374C15.0488 10.228 14.963 10.0298 14.8198 9.87636C14.5567 9.59461 13.9541 9.42486 13.7284 9.40619C13.7091 9.12386 13.8602 7.86211 13.1631 7.25953C13.7284 6.69486 14.0294 6.07361 14.0294 5.52761C14.0294 4.49219 12.7869 4.20986 11.2428 4.83111L10.9418 5.00028C10.9418 5.00028 10.3585 4.41694 10.3392 4.41694C8.58864 2.85361 3.09072 8.99144 4.84189 10.441L5.23739 10.7799C5.12448 11.0538 5.08545 11.3525 5.12422 11.6462C5.19947 12.5119 6.04647 13.2089 6.87539 13.2089C8.36289 16.6914 13.841 16.6914 15.2532 13.2842C15.2719 13.171 15.4982 12.6437 15.4982 12.1922C15.479 11.7401 15.2346 11.5517 15.0841 11.5517M6.85614 12.8134C6.25356 12.7948 5.61364 12.2488 5.55706 11.6275C5.40656 10.0269 7.49664 9.66928 7.75972 11.3067C7.85422 12.0604 7.62847 12.8321 6.85614 12.8134ZM6.38539 9.83844C5.99047 9.91428 5.65156 10.1214 5.42522 10.441C5.29339 10.3284 5.04897 10.1214 5.03031 10.0648C4.69139 9.42428 5.40656 8.16311 5.87731 7.46661C7.10114 5.71544 9.00281 4.39711 9.90639 4.64211C10.0569 4.66136 10.5463 5.22603 10.5463 5.22603C10.5463 5.22603 9.64272 5.73411 8.81381 6.41194C7.70372 7.24028 6.85614 8.48278 6.38539 9.83844ZM12.5798 12.4559C12.5798 12.4559 11.657 12.6064 10.7726 12.2674C10.9231 11.7401 11.4691 12.4179 13.2576 11.8906C13.7332 11.7526 14.1797 11.5293 14.5754 11.2314C14.6512 11.4391 14.7259 11.6649 14.7638 11.8719C14.8391 11.8533 15.1401 11.8533 15.0461 12.3427C14.9703 12.8508 14.7259 13.2649 14.387 13.661C14.1599 13.9054 13.8925 14.109 13.5966 14.263C13.4267 14.3462 13.2503 14.4154 13.0692 14.4701C11.6949 14.9222 10.264 14.4514 9.77456 13.3594C9.75589 13.2836 9.69872 13.2089 9.69872 13.0958C9.49222 12.38 9.68064 11.5517 10.2074 11.0057C10.2266 10.987 10.2832 10.9304 10.2832 10.8744C10.2763 10.8317 10.2563 10.7922 10.2261 10.7613C10.0382 10.4976 9.43564 10.0455 9.52956 9.16061C9.60539 8.55861 10.1701 8.10653 10.6787 8.12519H10.81C11.0171 8.14444 11.2428 8.14444 11.4126 8.18178C11.7322 8.20044 11.9959 8.16311 12.3161 7.89944C12.4293 7.82361 12.5232 7.74894 12.6551 7.69236C12.7869 7.67369 12.9187 7.69236 12.9934 7.74894C13.2576 7.89944 13.2763 8.33228 13.3142 8.65253C13.3142 8.84094 13.3329 9.25511 13.3329 9.36769C13.3516 9.63136 13.4081 9.68853 13.5779 9.74453C13.6526 9.76319 13.7284 9.80111 13.841 9.82036C14.1799 9.89503 14.4056 10.0269 14.5001 10.14C14.5689 10.2057 14.6151 10.2915 14.632 10.385C14.6506 10.6674 14.387 11.0436 13.6718 11.3639C12.448 11.9285 11.2241 11.7401 11.0736 11.7401C10.5463 11.6649 10.2453 12.3427 10.565 12.8321C11.1489 13.6984 13.7471 13.3594 14.5188 12.2674C14.5375 12.2488 14.5188 12.2488 14.5001 12.2488C13.4081 12.9826 11.9772 13.2276 11.1676 12.9079C11.0357 12.8508 10.7913 12.7569 10.7347 12.4559C11.8833 12.7942 12.5606 12.4745 12.5606 12.4745C12.5606 12.4745 12.6364 12.4559 12.5798 12.4559ZM8.62598 7.44736C9.07806 6.93928 9.58614 6.48719 10.0756 6.26144H10.0948V6.28011C10.0756 6.35594 9.98164 6.48719 9.96297 6.60094C9.96297 6.61903 9.96297 6.61903 9.98164 6.61903C10.264 6.41194 10.81 6.18619 11.2621 6.16753C11.2807 6.16753 11.2807 6.16753 11.2807 6.18619V6.20486C11.2049 6.26144 11.1302 6.33669 11.0736 6.41194V6.43119H11.0923C11.4126 6.43119 11.8641 6.54378 12.147 6.69428C12.1656 6.71353 12.147 6.75086 12.1277 6.71353C10.3206 6.28011 8.94623 7.18428 8.62598 7.41003C8.66389 7.42869 8.66389 7.42869 8.62598 7.44736Z" fill="#241C15"/>
								</svg>',
			'slack'           => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10Z" fill="#4A154B"/>
									<path d="M7.10972 11.3205C7.10972 11.9017 6.63998 12.3714 6.05877 12.3714C5.47756 12.3714 5.00781 11.9017 5.00781 11.3205C5.00781 10.7393 5.47756 10.2695 6.05877 10.2695H7.10972V11.3205Z" fill="#E01E5A"/>
									<path d="M7.63477 11.3205C7.63477 10.7393 8.10451 10.2695 8.68572 10.2695C9.26693 10.2695 9.73668 10.7393 9.73668 11.3205V13.9479C9.73668 14.5291 9.26693 14.9988 8.68572 14.9988C8.10451 14.9988 7.63477 14.5291 7.63477 13.9479V11.3205Z" fill="#E01E5A"/>
									<path d="M8.68572 7.10191C8.10451 7.10191 7.63477 6.63217 7.63477 6.05096C7.63477 5.46975 8.10451 5 8.68572 5C9.26693 5 9.73668 5.46975 9.73668 6.05096V7.10191H8.68572Z" fill="#36C5F0"/>
									<path d="M8.68631 7.63672C9.26752 7.63672 9.73726 8.10646 9.73726 8.68767C9.73726 9.26888 9.26752 9.73863 8.68631 9.73863H6.05096C5.46975 9.73863 5 9.26888 5 8.68767C5 8.10646 5.46975 7.63672 6.05096 7.63672H8.68631Z" fill="#36C5F0"/>
									<path d="M12.8984 8.68767C12.8984 8.10646 13.3682 7.63672 13.9494 7.63672C14.5306 7.63672 15.0003 8.10646 15.0003 8.68767C15.0003 9.26888 14.5306 9.73863 13.9494 9.73863H12.8984V8.68767Z" fill="#2EB67D"/>
									<path d="M12.3734 8.68631C12.3734 9.26752 11.9037 9.73726 11.3224 9.73726C10.7412 9.73726 10.2715 9.26752 10.2715 8.68631V6.05096C10.2715 5.46975 10.7412 5 11.3224 5C11.9037 5 12.3734 5.46975 12.3734 6.05096V8.68631Z" fill="#2EB67D"/>
									<path d="M11.3224 12.8984C11.9037 12.8984 12.3734 13.3682 12.3734 13.9494C12.3734 14.5306 11.9037 15.0003 11.3224 15.0003C10.7412 15.0003 10.2715 14.5306 10.2715 13.9494V12.8984H11.3224Z" fill="#ECB22E"/>
									<path d="M11.3224 12.3714C10.7412 12.3714 10.2715 11.9017 10.2715 11.3205C10.2715 10.7393 10.7412 10.2695 11.3224 10.2695H13.9578C14.539 10.2695 15.0087 10.7393 15.0087 11.3205C15.0087 11.9017 14.539 12.3714 13.9578 12.3714H11.3224Z" fill="#ECB22E"/>
								</svg>',
			'webhook'         => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="20" height="20" rx="10" fill="#F0F1F4"/>
									<g clip-path="url(#clip0_3299_1914)">
										<path d="M9.60286 8.62385C9.10551 9.44476 8.62903 10.2397 8.14261 11.0287C8.01769 11.2312 7.95586 11.3962 8.05565 11.6537C8.33118 12.365 7.9425 13.0571 7.212 13.245C6.52308 13.4222 5.85187 12.9777 5.71519 12.2535C5.59406 11.6125 6.10069 10.9841 6.8205 10.8839C6.88078 10.8754 6.94237 10.8745 7.04372 10.867L8.13862 9.06431C7.44998 8.39198 7.04011 7.6061 7.13081 6.63221C7.19494 5.94381 7.47065 5.34889 7.97456 4.8613C8.93972 3.92754 10.4122 3.77635 11.5486 4.49305C12.64 5.1815 13.1399 6.52248 12.7138 7.67021C12.3925 7.5847 12.069 7.49845 11.7134 7.40373C11.8471 6.76559 11.7482 6.19258 11.3099 5.70167C11.0203 5.37756 10.6486 5.20768 10.2261 5.14509C9.37898 5.01944 8.54728 5.55379 8.30048 6.37019C8.02036 7.29667 8.44434 8.05351 9.60286 8.62385Z" fill="#C73A63"/>
										<path d="M11.0233 7.65422C11.3737 8.26116 11.7294 8.87725 12.082 9.48768C13.8642 8.94629 15.2079 9.91498 15.69 10.9521C16.2723 12.2048 15.8742 13.6886 14.7307 14.4615C13.557 15.2549 12.0726 15.1193 11.0326 14.1001C11.2977 13.8823 11.564 13.6635 11.8486 13.4297C12.8757 14.0829 13.7741 14.0522 14.441 13.2787C15.0098 12.6188 14.9974 11.6349 14.4122 10.9889C13.7368 10.2435 12.8322 10.2207 11.7387 10.9363C11.2851 10.1462 10.8236 9.36231 10.3843 8.56644C10.2362 8.29821 10.0727 8.14255 9.73885 8.0858C9.18136 7.9909 8.82146 7.52084 8.79985 6.99422C8.77861 6.4734 9.09113 6.00261 9.57957 5.8192C10.0634 5.63745 10.6312 5.78413 10.9567 6.18805C11.2226 6.51805 11.3071 6.88947 11.1672 7.29647C11.1283 7.40997 11.0779 7.51974 11.0233 7.65422Z" fill="#4B4B4B"/>
										<path d="M11.8612 12.616H9.71575C9.51011 13.4465 9.06592 14.1169 8.30059 14.5433C7.70561 14.8747 7.06436 14.987 6.38186 14.8788C5.12523 14.6799 4.09773 13.5692 4.00726 12.3185C3.90489 10.9016 4.89672 9.64225 6.21873 9.35938C6.31 9.68482 6.40225 10.0134 6.49351 10.3381C5.28058 10.9457 4.86076 11.7113 5.20023 12.6686C5.49906 13.511 6.34792 13.9728 7.26962 13.7942C8.21087 13.6119 8.68544 12.8438 8.6275 11.6112C9.51981 11.6112 10.4129 11.6021 11.3053 11.6156C11.6537 11.621 11.9228 11.5855 12.1853 11.2839C12.6175 10.7875 13.413 10.8323 13.8784 11.3011C14.3541 11.7802 14.3313 12.551 13.828 13.0099C13.3423 13.4526 12.575 13.429 12.1206 12.9519C12.0272 12.8536 11.9536 12.7368 11.8612 12.616Z" fill="#4A4A4A"/>
									</g>
									<defs>
										<clipPath id="clip0_3299_1914">
											<rect width="12" height="11" fill="white" transform="translate(4 4)"/>
										</clipPath>
									</defs>
								</svg>',
			'get_response'    => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#00A2FF"/>
									<path d="M10.0017 11.5302C9.07721 11.5302 8.22723 11.1984 7.54318 10.6938C6.66272 10.047 6.13105 9.04126 5.98544 8.15064C5.97528 8.08291 5.96512 8.01857 5.95496 7.961C5.91771 7.71041 6.10058 7.43949 6.40874 7.43949H6.61869C6.81172 8.35043 7.3129 8.99385 7.81747 9.40699C8.49475 9.95558 9.28717 10.1588 9.98476 10.1757C11.8778 10.2163 13.7233 8.5333 14.9018 6.69449C14.8239 6.59628 14.7054 6.53533 14.5699 6.53533H5.42668C5.18964 6.52856 5 6.72158 5 6.95524V12.4649C5 12.7019 5.18964 12.8916 5.42668 12.8916H14.5733C14.8104 12.8916 15 12.6986 15 12.4649V7.74427C13.449 10.4737 11.6644 11.5269 9.99831 11.5302H10.0017Z" fill="white"/>
								</svg>',
			'drip'            => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#F0F1F4"/>
									<path d="M14.375 11.2148H13.0625C13.0625 11.2634 13.0625 11.3121 13.0625 11.3607C13.0625 13.3048 11.4583 14.4714 10 14.4714C8.54167 14.4714 6.9375 13.3048 6.9375 11.3607C6.9375 11.3121 6.9375 11.2634 6.9375 11.2148H5.625C5.625 11.2634 5.625 11.3121 5.625 11.3607C5.625 14.0339 7.8125 15.7837 10 15.7837C12.1875 15.7837 14.375 14.0339 14.375 11.3607C14.375 11.3121 14.375 11.2634 14.375 11.2148Z" fill="#F224F1"/>
									<path d="M10.0002 5.82053L10.9238 7.08425H12.5766C11.7988 6.06355 10.9724 5.04285 10.0002 4.16797C9.02799 5.04285 8.20161 6.06355 7.42383 7.08425H9.07661L10.0002 5.82053Z" fill="#F224F1"/>
									<path d="M7.375 10.0466C7.85825 10.0466 8.25 9.65495 8.25 9.17176C8.25 8.68857 7.85825 8.29688 7.375 8.29688C6.89175 8.29688 6.5 8.68857 6.5 9.17176C6.5 9.65495 6.89175 10.0466 7.375 10.0466Z" fill="#F224F1"/>
									<path d="M10 10.0466C10.4832 10.0466 10.875 9.65495 10.875 9.17176C10.875 8.68857 10.4832 8.29688 10 8.29688C9.51675 8.29688 9.125 8.68857 9.125 9.17176C9.125 9.65495 9.51675 10.0466 10 10.0466Z" fill="#F224F1"/>
									<path d="M12.625 10.0466C13.1082 10.0466 13.5 9.65495 13.5 9.17176C13.5 8.68857 13.1082 8.29688 12.625 8.29688C12.1418 8.29688 11.75 8.68857 11.75 9.17176C11.75 9.65495 12.1418 10.0466 12.625 10.0466Z" fill="#F224F1"/>
								</svg>',
			'active_campaign' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#356AE6"/>
									<path d="M13.3414 9.34521C13.2007 9.22492 7.46658 5.22129 7.20557 5.06015L7.125 5V5.98616C7.125 6.30844 7.28614 6.40831 7.487 6.56945L7.52672 6.58988C7.80815 6.79074 11.8923 9.62778 12.4358 10.0102C11.8923 10.3926 7.748 13.2694 7.487 13.4306C7.16472 13.6314 7.14543 13.7721 7.14543 14.0547V15C7.14543 15 13.2415 10.7547 13.3618 10.6548C13.6433 10.4539 13.7034 10.1918 13.7034 10.0306V9.91035C13.7034 9.70949 13.5831 9.50749 13.3414 9.34748V9.34521Z" fill="white"/>
									<path d="M9.76097 10.4531C9.92211 10.4531 10.0833 10.3929 10.2433 10.2715C10.4441 10.1308 10.6257 10.0105 10.6257 10.0105L10.6858 9.9708L10.6257 9.93108C10.6053 9.91065 7.92941 8.05977 7.64798 7.87933C7.52769 7.77833 7.36655 7.75904 7.26555 7.81919C7.16455 7.87933 7.08398 7.98033 7.08398 8.14148V8.76562L7.10441 8.78605C7.12484 8.80648 8.95526 10.0741 9.31726 10.3146C9.4784 10.4156 9.61912 10.4554 9.75983 10.4554L9.76097 10.4531Z" fill="white"/>
								</svg>',
			'convert_kit'     => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
										<rect width="20" height="20" rx="10" fill="#44B1FF"/>
										<g clip-path="url(#clip0_3299_1997)">
											<mask id="mask0_3299_1997" mask-type="luminance" maskUnits="userSpaceOnUse" x="4" y="7" width="12" height="6">
												<path d="M15.9886 7.5H4V12.5H15.9886V7.5Z" fill="white"/>
											</mask>
											<g mask="url(#mask0_3299_1997)">
												<mask id="mask1_3299_1997" mask-type="luminance" maskUnits="userSpaceOnUse" x="4" y="7" width="12" height="6">
													<path d="M15.9934 7.5H4V12.5H15.9934V7.5Z" fill="white"/>
												</mask>
												<g mask="url(#mask1_3299_1997)">
													<path d="M7.28494 9.58054C8.76075 9.84431 9.21884 11.1059 9.23091 12.3748C9.23118 12.4034 9.20622 12.4266 9.1753 12.4266H7.31756C7.28691 12.4266 7.26195 12.4038 7.26178 12.3754C7.2562 11.391 7.08347 10.5223 6.02713 10.4847C5.99562 10.4836 5.96936 10.5069 5.96936 10.5361V12.3753C5.96936 12.4036 5.94445 12.4266 5.91375 12.4266H4.05561C4.02491 12.4266 4 12.4037 4 12.3753V7.68895C4 7.6606 4.02491 7.6376 4.05561 7.6376H5.91375C5.94445 7.6376 5.96936 7.6606 5.96936 7.68895V9.44446C5.96936 9.4705 5.99221 9.4916 6.02042 9.4916C6.04278 9.4916 6.06265 9.47815 6.06915 9.45836C6.5478 8.0107 7.44169 7.6467 8.89326 7.63775C8.92407 7.63755 8.9493 7.66065 8.9493 7.6891V9.44025C8.9493 9.46859 8.92438 9.4916 8.89369 9.4916H7.29427C7.2674 9.4916 7.24564 9.5117 7.24564 9.53651C7.24564 9.55799 7.26215 9.57651 7.28494 9.58054ZM12.3719 10.678V9.54295C12.3719 9.51459 12.3968 9.4916 12.4275 9.4916H13.7949C13.8218 9.4916 13.8436 9.47145 13.8436 9.4466C13.8436 9.42505 13.827 9.4066 13.8041 9.40245C12.7342 9.2065 12.2404 8.6378 12.2233 7.689C12.2228 7.6608 12.2474 7.6376 12.2778 7.6376H14.2856C14.3163 7.6376 14.3413 7.6606 14.3413 7.68895V8.48825C14.3413 8.5166 14.3662 8.5396 14.3969 8.5396H15.5481C15.5788 8.5396 15.6037 8.5626 15.6037 8.59095V9.44025C15.6037 9.46859 15.5788 9.4916 15.5481 9.4916H14.3969C14.3662 9.4916 14.3413 9.51459 14.3413 9.54295V10.4585C14.3413 10.7819 14.556 10.8886 14.8416 10.8886C15.2891 10.8886 15.7305 10.7024 15.9076 10.618C15.9446 10.6003 15.9886 10.6252 15.9886 10.6636V12.0888C15.9886 12.1269 15.9659 12.1619 15.9294 12.1796C15.7546 12.2645 15.2142 12.4999 14.5961 12.4999C13.3247 12.5 12.3719 12.0214 12.3719 10.678ZM9.75824 12.3753V9.54286C9.75824 9.5145 9.78316 9.49151 9.81385 9.49151H11.672C11.7027 9.49151 11.7276 9.5145 11.7276 9.54286V12.3753C11.7276 12.4036 11.7027 12.4266 11.672 12.4266H9.81385C9.78316 12.4266 9.75824 12.4037 9.75824 12.3753ZM9.65304 8.37295C9.65304 8.85505 10.0217 9.2459 10.7301 9.2459C11.4384 9.2459 11.8071 8.85505 11.8071 8.37295C11.8071 7.89085 11.4384 7.5 10.7301 7.5C10.0217 7.5 9.65304 7.89085 9.65304 8.37295Z" fill="#1E1E1E"/>
												</g>
											</g>
										</g>
									<defs>
										<clipPath id="clip0_3299_1997">
											<rect width="12" height="5" fill="white" transform="translate(4 7.5)"/>
										</clipPath>
									</defs>
								</svg>',
			'mailer'          => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#21C16C"/>
									<path d="M13.8938 5.83203H6.0989C5.49084 5.83203 5 6.32287 5 6.93093V13.9126L6.51648 12.4108H13.9011C14.5092 12.4108 15 11.9199 15 11.3119V6.93093C14.9927 6.32287 14.5018 5.83203 13.8938 5.83203ZM7.337 10.7551C7.337 10.9163 7.20513 11.0481 7.04396 11.0481C6.88278 11.0481 6.75092 10.9163 6.75092 10.7551V7.64156C6.75092 7.48038 6.88278 7.34851 7.04396 7.34851C7.20513 7.34851 7.337 7.48038 7.337 7.64156V10.7551ZM8.69963 10.7551C8.69963 10.9163 8.56777 11.0481 8.40659 11.0481C8.24542 11.0481 8.11355 10.9163 8.11355 10.7551V8.6965C8.11355 8.53533 8.24542 8.40346 8.40659 8.40346C8.56777 8.40346 8.69963 8.53533 8.69963 8.6965V10.7551ZM8.73626 7.75877C8.73626 7.9346 8.59707 8.07379 8.42125 8.07379H8.39194C8.21612 8.07379 8.07692 7.9346 8.07692 7.75877V7.73679C8.07692 7.56097 8.21612 7.42177 8.39194 7.42177H8.42125C8.59707 7.42177 8.73626 7.56097 8.73626 7.73679V7.75877ZM10.8022 10.9749C10.6703 11.0408 10.5238 11.0701 10.37 11.0701C9.86447 11.0701 9.59341 10.8284 9.59341 10.3668V8.95291H9.32967C9.24176 8.95291 9.1685 8.88698 9.1685 8.79906V8.79174C9.1685 8.74046 9.1978 8.68917 9.24176 8.65254L9.89377 8.01518C9.9304 7.97855 9.97436 7.95657 10.0256 7.94925C10.1136 7.94925 10.1941 8.02251 10.1941 8.11042V8.11775V8.42544H10.663C10.8095 8.42544 10.9267 8.54265 10.9267 8.68917C10.9267 8.83569 10.8095 8.95291 10.663 8.95291H10.1941V10.3302C10.1941 10.528 10.2967 10.5427 10.4359 10.5427C10.4945 10.5427 10.5531 10.5353 10.6044 10.5207C10.641 10.506 10.685 10.506 10.7216 10.4987C10.8535 10.4987 10.9634 10.6086 10.9707 10.7478C10.956 10.843 10.8901 10.9383 10.8022 10.9749ZM12.5971 10.5207C12.8095 10.528 13.022 10.4767 13.2125 10.3815C13.2491 10.3595 13.293 10.3522 13.3297 10.3522C13.4762 10.3522 13.5934 10.4621 13.5934 10.6086V10.6159C13.5861 10.7185 13.5275 10.8137 13.4322 10.8577C13.2271 10.9749 13.0073 11.0775 12.5531 11.0775C11.7326 11.0775 11.2344 10.572 11.2344 9.72947C11.2344 8.74046 11.8938 8.38148 12.4506 8.38148C13.2857 8.38148 13.6667 9.04815 13.6667 9.66353C13.674 9.81738 13.5495 9.94925 13.3956 9.95657C13.3883 9.95657 13.381 9.95657 13.3736 9.95657H11.8352C11.9158 10.3229 12.1795 10.5207 12.5971 10.5207Z" fill="white"/>
									<path d="M12.4645 8.90251C12.1422 8.89518 11.8711 9.13694 11.8418 9.45928H13.0945C13.0579 9.13694 12.7869 8.89518 12.4645 8.90251Z" fill="white"/>
								</svg>',
			'google_sheets'   => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="20" height="20" rx="10" fill="#F0F1F4"/>
									<path d="M12.7077 14.375H7.29102C6.94581 14.375 6.66602 14.0952 6.66602 13.75V6.25C6.66602 5.90479 6.94581 5.625 7.29102 5.625H11.2493L13.3327 7.70833V13.75C13.3327 14.0952 13.0529 14.375 12.7077 14.375Z" fill="#20A464"/>
									<path d="M13.3333 7.70833H11.25V5.625L13.3333 7.70833Z" fill="#8ED1B1"/>
									<path d="M11.25 7.70703L13.3333 9.79036V7.70703H11.25Z" fill="url(#paint0_linear_3299_2028)"/>
									<path d="M11.4583 9.79297H8.54167H8.125V10.2096V10.6263V11.043V11.4596V11.8763V12.293V12.7096H11.875V12.293V11.8763V11.4596V11.043V10.6263V10.2096V9.79297H11.4583ZM8.54167 10.2096H9.375V10.6263H8.54167V10.2096ZM8.54167 11.043H9.375V11.4596H8.54167V11.043ZM8.54167 11.8763H9.375V12.293H8.54167V11.8763ZM11.4583 12.293H9.79167V11.8763H11.4583V12.293ZM11.4583 11.4596H9.79167V11.043H11.4583V11.4596ZM11.4583 10.6263H9.79167V10.2096H11.4583V10.6263Z" fill="#E8F5E9"/>
									<defs>
										<linearGradient id="paint0_linear_3299_2028" x1="12.2917" y1="7.70703" x2="12.2917" y2="9.79036" gradientUnits="userSpaceOnUse">
											<stop stop-color="#207E55"/>
											<stop offset="1" stop-color="#20A464"/>
										</linearGradient>
									</defs>
								</svg>',
		);
		$icon_map = array();
		$icon     = isset( $icon_map[ $service ] ) ? $icon_map[ $service ] : array(
			'label' => strtoupper( substr( preg_replace( '/[^a-z0-9]/i', '', (string) $service ), 0, 2 ) ),
			'bg'    => '#94A3B8',
			'color' => '#ffffff',
		);

		if ( isset( $svg_map[ $service ] ) ) {
			return '<span class="integration-service-icon" aria-hidden="true">' . $svg_map[ $service ] . '</span>';
		}

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
				'title' => self::plain_post_title( $form ),
			);
		}

		return $forms;
	}

	/**
	 * Get source options for the React entry list filter.
	 *
	 * @return array
	 */
	private static function get_source_options() {
		global $wpdb;

		$query      = "
			SELECT DISTINCT CAST(source_meta.meta_value AS UNSIGNED) AS source_id
			FROM {$wpdb->posts} entries
			INNER JOIN {$wpdb->postmeta} source_meta ON entries.ID = source_meta.post_id AND source_meta.meta_key = 'post-id'
			WHERE entries.post_type = %s
				AND entries.post_status = %s
				AND CAST(source_meta.meta_value AS UNSIGNED) > 0
		";
		$source_ids = $wpdb->get_col( $wpdb->prepare( $query, self::POST_TYPE, 'publish' ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$sources    = array();

		foreach ( $source_ids as $source_id ) {
			$source_post = get_post( (int) $source_id );

			if ( ! $source_post ) {
				continue;
			}

			$type_object = get_post_type_object( $source_post->post_type );

			$sources[] = array(
				'id'    => (int) $source_post->ID,
				'title' => self::plain_post_title( $source_post ),
				'type'  => $type_object ? $type_object->labels->singular_name : $source_post->post_type,
			);
		}

		usort(
			$sources,
			static function ( $a, $b ) {
				return strcasecmp( $a['title'], $b['title'] );
			}
		);

		return $sources;
	}

	public static function can_view_entry_detail( $entry_id ) {
		return self::POST_TYPE === get_post_type( $entry_id );
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
		$per_page = absint( $request->get_param( 'per_page' ) );
		$page     = max( 1, absint( $request->get_param( 'page' ) ) );

		if ( $export ) {
			$view_all = true;
			$per_page = -1;
			$page     = 1;
		} elseif ( ! $per_page ) {
			$per_page = self::FREE_ENTRY_LIMIT;
		}

		$args = array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => array( 'publish' ),
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		if ( ! $view_all ) {
			$args['date_query'] = array(
				array(
					'after'     => '24 hours ago',
					'inclusive' => true,
					'column'    => 'post_date',
				),
			);
		}

		if ( ! empty( $capabilities['filter'] ) && $view_all ) {
			$form_id    = absint( $request->get_param( 'form_id' ) );
			$source_id  = absint( $request->get_param( 'source_id' ) );
			$month      = sanitize_text_field( (string) $request->get_param( 'month' ) );
			$date_filter = sanitize_text_field( (string) $request->get_param( 'date_filter' ) );
			$date       = sanitize_text_field( (string) $request->get_param( 'date' ) );
			$date_from  = sanitize_text_field( (string) $request->get_param( 'date_from' ) );
			$date_to    = sanitize_text_field( (string) $request->get_param( 'date_to' ) );
			$search     = sanitize_text_field( (string) $request->get_param( 'search' ) );
			$meta_query = array();

			if ( $form_id ) {
				$meta_query[] = array(
					'key'     => 'form-id',
					'compare' => '=',
					'value'   => $form_id,
				);
			}

			if ( $source_id ) {
				$meta_query[] = array(
					'key'     => 'post-id',
					'compare' => '=',
					'value'   => $source_id,
				);
			}

			if ( ! empty( $meta_query ) ) {
				if ( 1 < count( $meta_query ) ) {
					$meta_query = array_merge( array( 'relation' => 'AND' ), $meta_query );
				}

				$args['meta_query'] = $meta_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			}

			if ( preg_match( '/^\d{4}-\d{2}$/', $month ) ) {
				$args['year']     = (int) substr( $month, 0, 4 );
				$args['monthnum'] = (int) substr( $month, 5, 2 );
			}

			if ( 'last_7_days' === $date_filter ) {
				unset( $args['year'], $args['monthnum'] );

				$args['date_query'] = array(
					array(
						'after'     => '7 days ago',
						'inclusive' => true,
						'column'    => 'post_date',
					),
				);
			}

			if ( 'custom' === $date_filter || $date_from || $date_to || $date ) {
				$range_start = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ? $date_from : $date;
				$range_end   = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ? $date_to : $date;

				$parsed_start = $range_start ? date_create_immutable( $range_start, wp_timezone() ) : false;
				$parsed_end   = $range_end ? date_create_immutable( $range_end, wp_timezone() ) : false;

				if ( false !== $parsed_start || false !== $parsed_end ) {
					unset( $args['year'], $args['monthnum'] );

					if ( false !== $parsed_start && false !== $parsed_end && $parsed_start > $parsed_end ) {
						$swap          = $parsed_start;
						$parsed_start  = $parsed_end;
						$parsed_end    = $swap;
					}

					$date_query = array(
						'inclusive' => true,
						'column'    => 'post_date',
					);

					if ( false !== $parsed_start ) {
						$date_query['after'] = $parsed_start->setTime( 0, 0, 0 )->format( 'Y-m-d H:i:s' );
					}

					if ( false !== $parsed_end ) {
						$date_query['before'] = $parsed_end->setTime( 23, 59, 59 )->format( 'Y-m-d H:i:s' );
					}

					$args['date_query'] = array( $date_query );
				}
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
	 * Get a post title as plain text without WordPress display entities.
	 *
	 * @param int|\WP_Post $post     Post ID or object.
	 * @param string       $fallback Fallback title.
	 *
	 * @return string
	 */
	private static function plain_post_title( $post, $fallback = '' ) {
		$post  = get_post( $post );
		$title = $post ? $post->post_title : '';
		$title = '' !== $title ? $title : $fallback;

		return html_entity_decode(
			wp_strip_all_tags( (string) $title ),
			ENT_QUOTES | ENT_HTML5,
			get_bloginfo( 'charset' )
		);
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
		$detail_access = self::can_view_entry_detail( $post->ID );

		return array(
			'id'              => (int) $post->ID,
			'title'           => self::plain_post_title( $post ),
			'date'            => get_the_date( '', $post ),
			'dateGmt'         => get_gmt_from_date( $post->post_date ),
			'formId'          => $form_id,
			'formTitle'       => $form_id ? self::plain_post_title( $form_id ) : __( 'No form', 'gutenverse-form' ),
			'referralId'      => $ref_id,
			'referralTitle'   => $ref_id ? self::plain_post_title( $ref_id ) : __( 'No referral', 'gutenverse-form' ),
			'referralUrl'     => $ref_id ? get_permalink( $ref_id ) : '',
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

		$is_limited = false;

		return array(
			'entries'      => $entries,
			'total'        => (int) $query->found_posts,
			'totalPages'   => (int) $query->max_num_pages,
			'page'         => isset( $args['paged'] ) ? (int) $args['paged'] : 1,
			'perPage'      => isset( $args['posts_per_page'] ) ? (int) $args['posts_per_page'] : -1,
			'limit'        => -1,
			'limited'      => $is_limited,
			'forms'        => self::get_form_options(),
			'sources'      => self::get_source_options(),
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
				self::plain_post_title( $post ),
				$form_id ? self::plain_post_title( $form_id ) : '',
				$ref_id ? self::plain_post_title( $ref_id ) : '',
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
		if ( $screen && self::POST_TYPE === $screen->post_type ) {
			$hidden[] = 'submitdiv';
			$hidden[] = 'pageparentdiv';
			$hidden[] = 'revisionsdiv';
		}

		return $hidden;
	}

	/**
	 * Remove non-entry metaboxes from the entry detail screen.
	 */
	public function remove_default_entry_meta_boxes() {
		$screen = get_current_screen();

		if ( ! $screen || self::POST_TYPE !== $screen->post_type || 'post' !== $screen->base ) {
			return;
		}

		global $wp_meta_boxes;

		if ( empty( $wp_meta_boxes[ self::POST_TYPE ] ) || ! is_array( $wp_meta_boxes[ self::POST_TYPE ] ) ) {
			return;
		}

		$allowed_boxes = array(
			'gutenverse-entries-form'      => true,
			'gutenverse-entries-data'      => true,
			'gutenverse-entry-integrations' => true,
			'gutenverse-browser-data'      => true,
			'gutenverse-payment-data'      => true,
		);
		$advanced_boxes = array(
			'gutenverse-entries-form'       => 'high',
			'gutenverse-entries-data'       => 'default',
			'gutenverse-entry-integrations' => 'default',
		);

		foreach ( $wp_meta_boxes[ self::POST_TYPE ] as $context => $priorities ) {
			if ( ! is_array( $priorities ) ) {
				continue;
			}

			foreach ( $priorities as $priority => $boxes ) {
				if ( ! is_array( $boxes ) ) {
					continue;
				}

				foreach ( $boxes as $box_id => $box ) {
					if ( ! isset( $allowed_boxes[ $box_id ] ) ) {
						unset( $wp_meta_boxes[ self::POST_TYPE ][ $context ][ $priority ][ $box_id ] );
						continue;
					}

					if ( isset( $advanced_boxes[ $box_id ] ) && ( 'advanced' !== $context || $advanced_boxes[ $box_id ] !== $priority ) ) {
						unset( $wp_meta_boxes[ self::POST_TYPE ][ $context ][ $priority ][ $box_id ] );
						$wp_meta_boxes[ self::POST_TYPE ]['advanced'][ $advanced_boxes[ $box_id ] ][ $box_id ] = $box;
					}
				}
			}
		}
	}

	/**
	 * Keep entry titles immutable after an entry has been created.
	 *
	 * @param array $data    Sanitized post data.
	 * @param array $postarr Raw post data.
	 *
	 * @return array
	 */
	public function protect_entry_title( $data, $postarr ) {
		$post_type = isset( $data['post_type'] ) ? $data['post_type'] : ( isset( $postarr['post_type'] ) ? $postarr['post_type'] : '' );

		if ( self::POST_TYPE !== $post_type ) {
			return $data;
		}

		$post_id = isset( $postarr['ID'] ) ? absint( $postarr['ID'] ) : 0;

		if ( ! $post_id ) {
			return $data;
		}

		if ( $post_id === self::$entry_title_update_id ) {
			return $data;
		}

		$entry = get_post( $post_id );

		if ( ! $entry || self::POST_TYPE !== $entry->post_type ) {
			return $data;
		}

		$data['post_title'] = $entry->post_title;
		$data['post_name']  = $entry->post_name;

		return $data;
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

			self::$entry_title_update_id = (int) $result;
			$result = wp_update_post( $update_title );
			self::$entry_title_update_id = 0;
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
		$form_title = $form_id ? self::plain_post_title( $form_id ) : '';
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

		$title = sanitize_text_field(
			html_entity_decode(
				wp_strip_all_tags( $title ),
				ENT_QUOTES | ENT_HTML5,
				get_bloginfo( 'charset' )
			)
		);

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
				'supports'            => array( 'title' ),
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
				'default'
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
		$entry          = get_post_meta( $post->ID, 'entry-data', true );
		$akismet_result = get_post_meta( $post->ID, 'akismet', true );
		$result         = '<div class="gutenverse-entry-detail-list">';

		if ( is_array( $akismet_result ) && ! empty( $akismet_result['status'] ) ) {
			$result .= $this->entry_detail_item(
				esc_html__( 'Spam Status', 'gutenverse-form' ),
				$this->entry_spam_status_html( $akismet_result )
			);
		}

		if ( is_array( $entry ) ) {
			foreach ( $entry as $item ) {
				$input_id = isset( $item['id'] ) ? sanitize_key( $item['id'] ) : '';

				$result .= $this->entry_detail_item(
					$this->entry_field_label( $input_id ),
					$this->entry_value_html( isset( $item['value'] ) ? $item['value'] : '' ),
					$input_id
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
			$retrigger_all_btn = current_user_can( 'manage_options' ) ? ' <button type="button" class="button button-small retrigger-integrations-all" data-entry-id="' . $post->ID . '">' . esc_html__( 'Resubmit All', 'gutenverse-form' ) . '</button>' : '';
			$result           .= '<div class="gutenverse-entry-section"><div class="entry-title">' . esc_html__( 'Integrations Triggered', 'gutenverse-form' ) . $retrigger_all_btn . '</div>';

			$integration_list = array();
			foreach ( $services as $service ) {
				$service_label      = $this->get_integration_label( $service );
				$retrigger_btn      = current_user_can( 'manage_options' )
					? '<button type="button" class="button button-small retrigger-integration-item" data-entry-id="' . $post->ID . '" data-service="' . esc_attr( $service ) . '">' . esc_html__( 'Resend Submission', 'gutenverse-form' ) . '</button>'
					: '';
				$integration_list[] = '<div class="integration-tag"><div class="integration-tag-main"> <span class="integration-tag-copy"><span class="integration-tag-label">' . esc_html( $service_label ) . '</span></span></div>' . $retrigger_btn . '</div>';
			}
			$result .= '<div class="entry-data integration-tag-list">' . implode( '', $integration_list ) . '</div></div>';
		}

		if ( ! empty( $logs ) && is_array( $logs ) ) {
			$result .= '<div class="gutenverse-entry-section integration-log-section"><div class="entry-title">' . esc_html__( 'Integration Logs', 'gutenverse-form' ) . '</div>';

			foreach ( $logs as $service => $service_logs ) {
				if ( empty( $service_logs ) || ! is_array( $service_logs ) ) {
					continue;
				}

				$result .= '<div class="entry-data integration-log-service integration-log-service-' . esc_attr( sanitize_html_class( $service ) ) . '">' . $this->render_integration_icon( $service ) . '<strong>' . esc_html( $this->get_integration_label( $service ) ) . '</strong></div>';

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

					$result .= '<div class="entry-data integration-log-item"><div class="integration-log-message"><span class="integration-log-time">' . $time . '</span> <span class="integration-log-status integration-log-status-' . esc_attr( $status_class ) . '">[' . $status . ']</span> ' . $message . $context . '</div></div>';
				}
			}

			$result .= '</div>';
		}

		if ( '' === $result ) {
			$result = '<div class="entry-data entry-data-empty">' . esc_html__( 'No integrations were recorded for this entry.', 'gutenverse-form' ) . '</div>';
		}

		echo wp_kses( $result, $this->entry_allowed_html_with_svg() );
	}

	/**
	 * Allow standard post HTML plus the SVG tags needed by entry integration icons.
	 *
	 * @return array
	 */
	private function entry_allowed_html_with_svg() {
		$allowed_html = wp_kses_allowed_html( 'post' );
		$svg_tags     = array(
			'svg',
			'g',
			'defs',
			'mask',
			'path',
			'circle',
			'rect',
			'clipPath',
			'clippath',
			'linearGradient',
			'lineargradient',
			'stop',
		);
		$svg_attrs    = array(
			'xmlns'              => true,
			'width'              => true,
			'height'             => true,
			'viewBox'            => true,
			'viewbox'            => true,
			'fill'               => true,
			'fill-opacity'       => true,
			'fill-rule'          => true,
			'clip-rule'          => true,
			'clip-path'          => true,
			'cx'                 => true,
			'cy'                 => true,
			'r'                  => true,
			'rx'                 => true,
			'ry'                 => true,
			'x'                  => true,
			'y'                  => true,
			'x1'                 => true,
			'y1'                 => true,
			'x2'                 => true,
			'y2'                 => true,
			'd'                  => true,
			'id'                 => true,
			'class'              => true,
			'style'              => true,
			'transform'          => true,
			'mask'               => true,
			'maskUnits'          => true,
			'maskunits'          => true,
			'maskContentUnits'   => true,
			'maskcontentunits'   => true,
			'mask-type'          => true,
			'clipPathUnits'      => true,
			'clippathunits'      => true,
			'gradientUnits'      => true,
			'gradientunits'      => true,
			'offset'             => true,
			'stop-color'         => true,
			'stop-opacity'       => true,
			'aria-hidden'        => true,
			'focusable'          => true,
		);

		foreach ( $svg_tags as $tag ) {
			$allowed_html[ $tag ] = $svg_attrs;
		}

		return $allowed_html;
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
	 * Render a concise spam status block for the entry detail screen.
	 *
	 * @param array $akismet_result Saved Akismet metadata.
	 *
	 * @return string
	 */
	private function entry_spam_status_html( $akismet_result ) {
		$status   = isset( $akismet_result['status'] ) ? sanitize_key( (string) $akismet_result['status'] ) : 'unknown';
		$provider = isset( $akismet_result['provider'] ) ? sanitize_text_field( (string) $akismet_result['provider'] ) : 'akismet';
		$message  = isset( $akismet_result['message'] ) ? sanitize_text_field( (string) $akismet_result['message'] ) : '';
		$checked  = isset( $akismet_result['checked_at'] ) ? sanitize_text_field( (string) $akismet_result['checked_at'] ) : '';
		$pro_tip  = isset( $akismet_result['pro_tip'] ) ? sanitize_text_field( (string) $akismet_result['pro_tip'] ) : '';
		$details  = array();

		$labels = array(
			'ham'         => esc_html__( 'Not spam', 'gutenverse-form' ),
			'spam'        => esc_html__( 'Spam', 'gutenverse-form' ),
			'unknown'     => esc_html__( 'Unknown', 'gutenverse-form' ),
			'unavailable' => esc_html__( 'Unavailable', 'gutenverse-form' ),
			'disabled'    => esc_html__( 'Disabled', 'gutenverse-form' ),
		);

		$status_label = isset( $labels[ $status ] ) ? $labels[ $status ] : ucfirst( $status );
		$status_class = sanitize_html_class( $status );
		$provider     = ucwords( str_replace( array( '-', '_' ), ' ', $provider ) );

		$details[] = array(
			'label' => esc_html__( 'Provider', 'gutenverse-form' ),
			'value' => $provider,
		);

		if ( $message ) {
			$details[] = array(
				'label' => esc_html__( 'Result', 'gutenverse-form' ),
				'value' => $message,
			);
		}

		if ( $pro_tip ) {
			$details[] = array(
				'label' => esc_html__( 'Hint', 'gutenverse-form' ),
				'value' => $pro_tip,
			);
		}

		if ( $checked ) {
			$checked_timestamp = strtotime( $checked );
			$checked_display   = $checked_timestamp ? wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $checked_timestamp, wp_timezone() ) : $checked;

			$details[] = array(
				'label' => esc_html__( 'Checked', 'gutenverse-form' ),
				'value' => $checked_display,
			);
		}

		$details = array_map(
			function ( $detail ) {
				return '<span class="entry-spam-status-detail"><span class="entry-spam-status-detail-label">' . esc_html( $detail['label'] ) . '</span><span class="entry-spam-status-detail-value">' . esc_html( $detail['value'] ) . '</span></span>';
			},
			$details
		);

		return '<div class="entry-spam-status entry-spam-status-' . esc_attr( $status_class ) . '"><span class="entry-spam-status-badge">' . esc_html( $status_label ) . '</span><span class="entry-spam-status-details">' . implode( '', $details ) . '</span></div>';
	}

	/**
	 * Normalize entry values for display.
	 *
	 * @param mixed $value Entry value.
	 *
	 * @return string
	 */
	private function entry_value_html( $value ) {
		if ( is_bool( $value ) ) {
			return $value ? esc_html__( 'Yes', 'gutenverse-form' ) : esc_html__( 'No', 'gutenverse-form' );
		}

		if ( is_array( $value ) ) {
			$value = implode( ', ', array_map( 'strval', $value ) );
		} else {
			$value = (string) $value;
		}

		if ( '' === trim( $value ) ) {
			return '<span class="entry-empty-value">' . esc_html__( 'Empty', 'gutenverse-form' ) . '</span>';
		}

		if ( filter_var( $value, FILTER_VALIDATE_URL ) ) {
			return '<a href="' . esc_url( $value ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $value ) . '</a>';
		}

		return esc_html( $value );
	}

	/**
	 * Get a readable fallback label from an entry input ID.
	 *
	 * @param string $input_id Input ID.
	 *
	 * @return string
	 */
	private function entry_field_label( $input_id ) {
		$input_id = sanitize_key( $input_id );

		if ( ! $input_id ) {
			return esc_html__( 'Submitted Field', 'gutenverse-form' );
		}

		$field_types = array(
			'calculation',
			'checkbox',
			'date',
			'email',
			'file',
			'gdpr',
			'mobile',
			'multiselect',
			'number',
			'payment',
			'radio',
			'select',
			'switch',
			'telp',
			'text',
			'textarea',
		);
		$label       = preg_replace( '/^input-/', '', $input_id );
		$parts       = array_values( array_filter( explode( '-', $label ) ) );

		if ( count( $parts ) > 1 && in_array( $parts[0], $field_types, true ) ) {
			array_shift( $parts );
		}

		$label = implode( ' ', $parts );

		if ( '' === $label ) {
			return $input_id;
		}

		return ucwords( $label );
	}

	/**
	 * Get the source page link for an entry.
	 *
	 * @param mixed $source_id Source post ID.
	 *
	 * @return string
	 */
	private function entry_source_link_html( $source_id ) {
		$source_id = absint( $source_id );

		if ( ! $source_id ) {
			return esc_html__( 'No source', 'gutenverse-form' );
		}

		$source_title = self::plain_post_title( $source_id );
		$source_url   = get_permalink( $source_id );

		if ( ! $source_title ) {
			$source_title = sprintf(
				/* translators: %d: Source post ID. */
				__( 'Source #%d', 'gutenverse-form' ),
				$source_id
			);
		}

		if ( ! $source_url ) {
			return esc_html( $source_title );
		}

		return '<a href="' . esc_url( $source_url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $source_title ) . '</a>';
	}

	/**
	 * Get a custom source link label for an entry.
	 *
	 * @param mixed  $source_id Source post ID.
	 * @param string $label     Link label.
	 *
	 * @return string
	 */
	private function entry_source_link_html_with_label( $source_id, $label ) {
		$source_id = absint( $source_id );
		$label     = trim( (string) $label );

		if ( '' === $label ) {
			return esc_html__( 'Not found', 'gutenverse-form' );
		}

		if ( ! $source_id ) {
			return esc_html( $label );
		}

		$source_url = get_permalink( $source_id );

		if ( ! $source_url ) {
			return esc_html( $label );
		}

		return '<a href="' . esc_url( $source_url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $label ) . '</a>';
	}

	/**
	 * Add Entry metaboxes
	 *
	 * @param - $post post.
	 */
	public function form_data_metabox( $post ) {
		$form_id     = get_post_meta( $post->ID, 'form-id', true );
		$source_id   = get_post_meta( $post->ID, 'post-id', true );
		$form_title  = $form_id ? self::plain_post_title( $form_id ) : '';
		$form_action = $form_title ? $this->entry_source_link_html_with_label( $source_id, $form_title ) : esc_html__( 'Not found', 'gutenverse-form' );

		$result  = '<div class="gutenverse-entry-detail-list">';
		$result .= $this->entry_detail_item( esc_html__( 'Form ID', 'gutenverse-form' ), $form_id ? esc_html( $form_id ) : esc_html__( 'Form is not set', 'gutenverse-form' ) );
		$result .= $this->entry_detail_item( esc_html__( 'Form Action', 'gutenverse-form' ), $form_action );
		$result .= '</div>';

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

		$status_class = sanitize_html_class( strtolower( (string) $status ) );
		$method_class = sanitize_html_class( strtolower( (string) $method ) );
		$result       = '<div class="gutenverse-payment-summary">';
		$result      .= '<div class="payment-summary-row"><span class="payment-summary-label">' . esc_html__( 'Method', 'gutenverse-form' ) . '</span><span class="payment-summary-value payment-method payment-method-' . esc_attr( $method_class ) . '">' . esc_html( $method ) . '</span></div>';
		$result      .= '<div class="payment-summary-row"><span class="payment-summary-label">' . esc_html__( 'Status', 'gutenverse-form' ) . '</span><span class="payment-summary-value payment-status payment-status-' . esc_attr( $status_class ) . '">' . esc_html( $status ) . '</span></div>';
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
			var readonlyTitle = <?php echo wp_json_encode( __( 'Entry title is view only', 'gutenverse-form' ) ); ?>;
			var $heading = $('.wrap h1.wp-heading-inline').first();
			var $title = $('#title');

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

			if ($title.length) {
				$title
					.prop('readonly', true)
					.attr('aria-readonly', 'true')
					.attr('title', readonlyTitle)
					.addClass('gutenverse-entry-title-readonly');

				if (!$title.next('.gutenverse-entry-title-display').length) {
					$title.after(
						$('<div/>', {
							class: 'gutenverse-entry-title-display',
							text: $title.val()
						})
					);
				}
			}

			function normalizeEntryMetaboxLayout() {
				var $normalSortables = $('#normal-sortables');
				var $advancedContainer = $('#postbox-container-2');
				var $advancedSortables = $('#advanced-sortables');
				var $formInfo = $('#gutenverse-entries-form');
				var $entryInfo = $('#gutenverse-entries-data');
				var $integrations = $('#gutenverse-entry-integrations');

				if (!$advancedContainer.length || !$formInfo.length || !$entryInfo.length) {
					return;
				}

				if (!$advancedSortables.length) {
					$advancedSortables = $('<div/>', {
						id: 'advanced-sortables',
						class: 'meta-box-sortables ui-sortable'
					}).appendTo($advancedContainer);
				}

				if ($normalSortables.length && !$advancedContainer.find('#post-body-content').length) {
					var $postBodyContent = $('#post-body-content');

					if ($postBodyContent.length) {
						$advancedContainer.prepend($postBodyContent);
					}
				}

				$advancedSortables.append($formInfo);
				$advancedSortables.append($entryInfo);

				if ($integrations.length) {
					$advancedSortables.append($integrations);
				}
			}

			normalizeEntryMetaboxLayout();

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
