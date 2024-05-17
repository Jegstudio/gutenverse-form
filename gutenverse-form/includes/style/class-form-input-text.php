<?php
/**
 * Gutenverse Form_Input_Text
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\style
 */

namespace Gutenverse_Form\Style;

use Gutenverse\Framework\Style_Abstract;

/**
 * Class Form_Input_Text
 *
 * @package gutenverse-form\style
 */
class Form_Input_Text extends Style_Abstract {
	/**
	 * Block Directory
	 *
	 * @var string
	 */
	protected $block_dir = GUTENVERSE_FORM_DIR . '/block/';

	/**
	 * Block Name
	 *
	 * @var array
	 */
	protected $name = 'form-input-text';

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
	 * Creating custom handle background to handle old values because format is changed
	 *
	 * @param string $selector .
	 * @param object $background .
	 */
	public function custom_handle_background( $selector, $background ) {
		$this->inject_style(
			array(
				'selector'       => $selector,
				'property'       => function ( $value ) {
					$gradient_color        = $value['gradientColor'];
					$gradient_type         = $value['gradientType'];
					$gradient_angle        = $value['gradientAngle'];
					$gradient_radial       = $value['gradientRadial'];

					if ( ! empty( $gradient_color ) ) {
						$colors = array();

						foreach ( $gradient_color as $gradient ) {
							$offset  = $gradient['offset'] * 100;
							$colors[] = "{$gradient['color']} {$offset}%";
						}

						$colors = join( ',', $colors );

						if ( 'radial' === $gradient_type ) {
							return "background-image: radial-gradient(at {$gradient_radial}, {$colors});";
						} else {
							return "background-image: linear-gradient({$gradient_angle}deg, {$colors});";
						}
					}
				},
				'value'          => array(
					'gradientColor'       => isset( $background['gradientColor'] ) ? $background['gradientColor'] : null,
					'gradientPosition'    => isset( $background['gradientPosition'] ) ? $background['gradientPosition'] : 0,
					'gradientEndColor'    => isset( $background['gradientEndColor'] ) ? $background['gradientEndColor'] : null,
					'gradientEndPosition' => isset( $background['gradientEndPosition'] ) ? $background['gradientEndPosition'] : 100,
					'gradientType'        => isset( $background['gradientType'] ) ? $background['gradientType'] : 'linear',
					'gradientAngle'       => isset( $background['gradientAngle'] ) ? $background['gradientAngle'] : 180,
					'gradientRadial'      => isset( $background['gradientRadial'] ) ? $background['gradientRadial'] : 'center center',
				),
				'device_control' => false,
			)
		);
	}

	/**
	 * Generate style base on attribute.
	 */
	public function generate() {
		if ( isset( $this->attrs['labelWidth'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .label-wrapper",
					'property'       => function ( $value ) {
						return "width: {$value}%;";
					},
					'value'          => $this->attrs['labelWidth'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['labelColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .label-wrapper .input-label",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['labelColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['labelTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id} .label-wrapper .input-label",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['labelTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['labelPadding'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .label-wrapper",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['labelPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['labelMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .label-wrapper",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'margin' );
					},
					'value'          => $this->attrs['labelMargin'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['labelRequireColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .label-wrapper .required-badge",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['labelRequireColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['helperColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .input-helper",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['helperColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['helperTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id} .input-helper",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['helperTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['helperPadding'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .input-helper",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['helperPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['warningColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .validation-error",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['warningColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['warningTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id} .validation-error",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['warningTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['inputPadding'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['inputPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'margin' );
					},
					'value'          => $this->attrs['inputMargin'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['placeholderColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input::placeholder",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['placeholderColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['inputTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['inputColorNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['inputColorNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBgColorNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['inputBgColorNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBorderNormal'] ) ) {
			$this->handle_border( 'inputBorderNormal', ".{$this->element_id} .gutenverse-input" );
		}

		if ( isset( $this->attrs['inputBorderNormalResponsive'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['inputBorderNormalResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}

		if ( isset( $this->attrs['inputColorHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:hover",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['inputColorHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBgColorHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:hover",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['inputBgColorHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBorderHover'] ) ) {
			$this->handle_border( 'inputBorderHover', ".{$this->element_id} .gutenverse-input:hover" );
		}

		if ( isset( $this->attrs['inputBorderHoverResponsive'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:hover",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['inputBorderHoverResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}

		if ( isset( $this->attrs['inputColorFocus'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:focus, .{$this->element_id} .gutenverse-input:focus-visible",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['inputColorFocus'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBgColorFocus'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:focus, .{$this->element_id} .gutenverse-input:focus-visible",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['inputBgColorFocus'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBorderFocus'] ) ) {
			$this->handle_border( 'inputBorderFocus', ".{$this->element_id} .gutenverse-input:focus, .{$this->element_id} .gutenverse-input:focus-visible" );
		}

		if ( isset( $this->attrs['inputBorderFocusResponsive'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:focus, .{$this->element_id} .gutenverse-input:focus-visible",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['inputBorderFocusResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}

		if ( isset( $this->attrs['inputAreaBoxShadow'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['inputAreaBoxShadow'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['inputAreaBoxShadowHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-input:hover",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['inputAreaBoxShadowHover'],
					'device_control' => false,
				)
			);
		}

		/*
		* Icon Style
		*/
		if ( isset( $this->attrs['iconAlignment'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon",
					'property'       => function ( $value ) {
						return "justify-content: {$value};";
					},
					'value'          => $this->attrs['iconAlignment'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['iconType'] ) && 'icon' === $this->attrs['iconType'] ) {
			if ( isset( $this->attrs['iconSize'] ) ) {
				$this->inject_style(
					array(
						'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon i",
						'property'       => function ( $value ) {
							return "font-size: {$value}px;";
						},
						'value'          => $this->attrs['iconSize'],
						'device_control' => true,
					)
				);
			}

			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .gutenverse-input-text",
					'property'       => function ( $value ) {
						if ( 'left' === $this->attrs['iconAlignment'] ) {
							$padding_left = $value + 15;
							return "padding-left: {$padding_left}px !important";
						} else {
							return 'padding: 8px !important;';
						}
					},
					'value'          => $this->attrs['iconSize'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['iconType'] ) && 'image' === $this->attrs['iconType'] ) {
			if ( isset( $this->attrs['imageWidth'] ) ) {
				$this->inject_style(
					array(
						'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
						'property'       => function ( $value ) {
							return "width: {$value}px;";
						},
						'value'          => $this->attrs['imageWidth'],
						'device_control' => true,
					)
				);

				$this->inject_style(
					array(
						'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .gutenverse-input-text",
						'property'       => function ( $value ) {
							if ( 'left' === $this->attrs['iconAlignment'] ) {
								$padding_left = $value + 20;
								return "padding-left: {$padding_left}px !important";
							} else {
								return 'padding: 8px !important;';
							}
						},
						'value'          => $this->attrs['imageWidth'],
						'device_control' => true,
					)
				);
			}

			if ( isset( $this->attrs['imageHeight'] ) ) {
				$this->inject_style(
					array(
						'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
						'property'       => function ( $value ) {
							return "height: {$value}px;";
						},
						'value'          => $this->attrs['imageHeight'],
						'device_control' => true,
					)
				);
			}
		}

		/*
		* Tab Style
		*/

		if ( isset( $this->attrs['iconColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon i",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['iconColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['iconHoverColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover i",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['iconHoverColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['iconBgColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['iconBgColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['iconHoverBgColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['iconHoverBgColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['iconBackground'] ) ) {
			$this->custom_handle_background( ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon.style-gradient", $this->attrs['iconBackground'] );
		}

		if ( isset( $this->attrs['iconBackgroundHover'] ) ) {
			$this->custom_handle_background( ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover.style-gradient", $this->attrs['iconBackgroundHover'] );
		}

		if ( isset( $this->attrs['iconBorder'] ) && 'icon' === $this->attrs['iconType'] ) {
			$this->handle_border( 'iconBorder', ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon" );
		}
		if ( isset( $this->attrs['iconBorder'] ) && 'image' === $this->attrs['iconType'] ) {
			$this->handle_border( 'iconBorder', ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon" );
		}

		if ( isset( $this->attrs['iconBorderResponsive'] ) && 'icon' === $this->attrs['iconType'] ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['iconBorderResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}
		if ( isset( $this->attrs['iconBorderResponsive'] ) && 'image' === $this->attrs['iconType'] ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['iconBorderResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}

		if ( isset( $this->attrs['iconBoxShadow'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['iconBoxShadow'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['iconBorderHover'] ) && 'icon' === $this->attrs['iconType'] ) {
			$this->handle_border( 'iconBorderHover', ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover" );
		}
		if ( isset( $this->attrs['iconBorderHover'] ) && 'image' === $this->attrs['iconType'] ) {
			$this->handle_border( 'iconBorderHover', ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover" );
		}

		if ( isset( $this->attrs['iconBorderHoverResponsive'] ) && 'icon' === $this->attrs['iconType'] ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['iconBorderHoverResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}
		if ( isset( $this->attrs['iconBorderHoverResponsive'] ) && 'image' === $this->attrs['iconType'] ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['iconBorderHoverResponsive'],
					'device_control' => true,
					'skip_device'    => array(
						'Desktop',
					),
				)
			);
		}

		if ( isset( $this->attrs['iconBoxShadowHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon:hover",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['iconBoxShadowHover'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['iconPadding'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['iconPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['iconMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'margin' );
					},
					'value'          => $this->attrs['iconMargin'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['iconRotate'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon",
					'property'       => function ( $value ) {
						return "transform: rotate({$value}deg);";
					},
					'value'          => $this->attrs['iconRotate'],
					'device_control' => true,
				)
			);
		}
	}
}
