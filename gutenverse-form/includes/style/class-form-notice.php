<?php
/**
 * Gutenverse Form_Notice
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\style
 */

namespace Gutenverse_Form\Style;

use Gutenverse\Framework\Style_Abstract;

/**
 * Class Form_Notice
 *
 * @package gutenverse-form\style
 */
class Form_Notice extends Style_Abstract {
	/**
	 * Block Directory
	 *
	 * @var string
	 */
	protected $block_dir = GUTENVERSE_FORM_DIR . '/block/';

	/**
	 * Block Name
	 *
	 * @var string
	 */
	protected $name = 'form-notice';

	/**
	 * Constructor
	 *
	 * @param array $attrs Attribute.
	 */
	public function __construct( $attrs ) {
		parent::__construct( $attrs );

		$this->set_feature(
			array(
				'background'  => null,
				'border'      => null,
				'positioning' => null,
				'animation'   => null,
				'advance'     => null,
				'mask'        => null,
			)
		);
	}

	/**
	 * Generate style base on attribute.
	 */
	public function generate() {
		$statuses = array( 'success', 'error' );

		foreach ( $statuses as $status ) {
			$uc_status = ucfirst( $status );
			$selector  = ".{$this->element_id}.notice-{$status}";

			// Container Styles.
			if ( isset( $this->attrs[ "background{$uc_status}" ] ) ) {
				$this->handle_background( $selector, $this->attrs[ "background{$uc_status}" ] );
			}

			if ( isset( $this->attrs[ "borderResponsive{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $selector,
						'property'       => function ( $value ) {
							return $this->handle_border_responsive( $value );
						},
						'value'          => $this->attrs[ "borderResponsive{$uc_status}" ],
						'device_control' => true,
					)
				);
			}

			if ( isset( $this->attrs[ "padding{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $selector,
						'property'       => function ( $value ) {
							return $this->handle_dimension( $value, 'padding' );
						},
						'value'          => $this->attrs[ "padding{$uc_status}" ],
						'device_control' => true,
					)
				);
			}

			if ( isset( $this->attrs[ "margin{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $selector,
						'property'       => function ( $value ) {
							return $this->handle_dimension( $value, 'margin' );
						},
						'value'          => $this->attrs[ "margin{$uc_status}" ],
						'device_control' => true,
					)
				);
			}

			// Icon Layout.
			if ( isset( $this->attrs[ "iconLayout{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => "{$selector} .guten-form-notice-wrapper",
						'property'       => function ( $value ) {
							$direction = 'row';
							switch ( $value ) {
								case 'right':
									$direction = 'row-reverse';
									break;
								case 'top':
									$direction = 'column';
									break;
								case 'bottom':
									$direction = 'column-reverse';
									break;
							}
							return "display: flex; align-items: center; gap: 10px; flex-direction: {$direction};";
						},
						'value'          => $this->attrs[ "iconLayout{$uc_status}" ],
						'device_control' => false,
					)
				);
			}

			// Icon Styles.
			$icon_selector      = "{$selector} .guten-form-notice-icon";
			$icon_core_selector = "{$icon_selector} i, {$icon_selector} svg";

			if ( isset( $this->attrs[ "iconColor{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector' => $icon_core_selector,
						'property' => function ( $value ) {
							return $this->handle_color( $value, 'color' );
						},
						'value'    => $this->attrs[ "iconColor{$uc_status}" ],
					)
				);
			}

			if ( isset( $this->attrs[ "iconSize{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $icon_core_selector,
						'property'       => function ( $value ) {
							return "font-size: {$value}px;";
						},
						'value'          => $this->attrs[ "iconSize{$uc_status}" ],
						'device_control' => true,
					)
				);
			}

			if ( isset( $this->attrs[ "iconBackground{$uc_status}" ] ) ) {
				$this->handle_background( $icon_selector, $this->attrs[ "iconBackground{$uc_status}" ] );
			}

			if ( isset( $this->attrs[ "iconBorder{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $icon_selector,
						'property'       => function ( $value ) {
							return $this->handle_border_responsive( $value );
						},
						'value'          => $this->attrs[ "iconBorder{$uc_status}" ],
						'device_control' => true,
					)
				);
			}

			if ( isset( $this->attrs[ "iconPadding{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $icon_selector,
						'property'       => function ( $value ) {
							return $this->handle_dimension( $value, 'padding' );
						},
						'value'          => $this->attrs[ "iconPadding{$uc_status}" ],
						'device_control' => true,
					)
				);
			}

			// Content Styles.
			$content_selector = "{$selector} .guten-form-notice-content";

			if ( isset( $this->attrs[ "textColor{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector' => $content_selector,
						'property' => function ( $value ) {
							return $this->handle_color( $value, 'color' );
						},
						'value'    => $this->attrs[ "textColor{$uc_status}" ],
					)
				);
			}

			if ( isset( $this->attrs[ "typography{$uc_status}" ] ) ) {
				$this->inject_typography(
					array(
						'selector'       => $content_selector,
						'property'       => function ( $value ) {},
						'value'          => $this->attrs[ "typography{$uc_status}" ],
						'device_control' => false,
					)
				);
			}

			if ( isset( $this->attrs[ "contentMargin{$uc_status}" ] ) ) {
				$this->inject_style(
					array(
						'selector'       => $content_selector,
						'property'       => function ( $value ) {
							return $this->handle_dimension( $value, 'margin' );
						},
						'value'          => $this->attrs[ "contentMargin{$uc_status}" ],
						'device_control' => true,
					)
				);
			}
		}
	}
}
