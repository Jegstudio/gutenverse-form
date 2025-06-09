<?php
/**
 * Gutenverse Form_Input_Select
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\style
 */

namespace Gutenverse_Form\Style;

use Gutenverse\Framework\Style_Abstract;

/**
 * Class Form_Input_Select
 *
 * @package gutenvers-form\style
 */
class Form_Input_Select extends Style_Abstract {
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
	protected $name = 'form-input-select';


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
					'selector'       => ".{$this->element_id} .main-wrapper .choices__inner",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['inputPadding'],
					'device_control' => true,
				)
			);

			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices::after",
					'property'       => function ( $value ) {
						$right        = floatval( isset( $value['dimension']['right'] ) ? $value['dimension']['right'] : 0 ) - 11.5;
						$right_margin = $right > 0 ? $right : 0;
						$unit         = $value['unit'];
						return "margin-right: {$right_margin}{$unit};";
					},
					'value'          => $this->attrs['inputPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__inner",
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
					'selector'       => ".{$this->element_id} .choices__placeholder:not(.choices__item--choice), .{$this->element_id} .choices .choices__list.choices__list--dropdown input",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['placeholderColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['placeholderBgColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices__inner, .{$this->element_id} .choices .choices__list.choices__list--dropdown input",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['placeholderBgColor'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id} .choices__placeholder, .{$this->element_id} .choices__item, .{$this->element_id} .choices__input",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['inputTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['inputColorNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['inputColorNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesBgColorNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown .choices__item",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['choicesBgColorNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBorderNormal'] ) ) {
			$this->handle_border( 'inputBorderNormal', ".{$this->element_id} .choices .choices__inner, .{$this->element_id} .choices .choices__list.choices__list--dropdown" );
		}

		if ( isset( $this->attrs['inputBorderNormalResponsive'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__inner, .{$this->element_id} .choices .choices__list.choices__list--dropdown",
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
					'selector'       => ".{$this->element_id}:hover .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['inputColorHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesBgColorHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown .choices__item.is-highlighted",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'background-color' );
					},
					'value'          => $this->attrs['choicesBgColorHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['inputBorderHover'] ) ) {
			$this->handle_border( 'inputBorderHover', ".{$this->element_id} .choices .choices__inner:hover, .{$this->element_id} .choices .choices__list.choices__list--dropdown:hover" );
		}

		if ( isset( $this->attrs['inputBorderHoverResponsive'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__inner:hover, .{$this->element_id} .choices .choices__list.choices__list--dropdown:hover",
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

		if ( isset( $this->attrs['inputAreaBoxShadow'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__inner, .{$this->element_id} .choices .choices__list.choices__list--dropdown",
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
					'selector'       => ".{$this->element_id} .choices .choices__inner:hover, .{$this->element_id} .choices .choices__list.choices__list--dropdown:hover",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['inputAreaBoxShadowHover'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['excludePlaceholder'] ) ) {
			$this->inject_style(
				array(
					'selector' => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.choices__placeholder",
					'property' => function ( $value ) {
						if ( $value ) {
							return 'display: none;';
						}
					},
					'value'    => $this->attrs['excludePlaceholder'],
				)
			);
		}

		if ( isset( $this->attrs['choicesPadding'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['choicesPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'margin' );
					},
					'value'          => $this->attrs['choicesMargin'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['choicesTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['choicesColorNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['choicesColorNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesBackgroundNormal'] ) ) {
			$this->handle_background( ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable", $this->attrs['choicesBackgroundNormal'] );
		}

		if ( isset( $this->attrs['choicesBorderNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['choicesBorderNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesColorHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['choicesColorHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesBackgroundHover'] ) ) {
			$this->handle_background( ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted", $this->attrs['choicesBackgroundHover'] );
		}

		if ( isset( $this->attrs['choicesBorderHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['choicesBorderHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesColorSelected'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['choicesColorSelected'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesBackgroundSelected'] ) ) {
			$this->handle_background( ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected", $this->attrs['choicesBackgroundSelected'] );
		}

		if ( isset( $this->attrs['choicesBorderSelected'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['choicesBorderSelected'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesWrapperPadding'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'padding' );
					},
					'value'          => $this->attrs['choicesWrapperPadding'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesWrapperMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'margin' );
					},
					'value'          => $this->attrs['choicesWrapperMargin'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesWrapperBackgroundNormal'] ) ) {
			$this->handle_background( ".{$this->element_id} .choices .choices__list.choices__list--dropdown", $this->attrs['choicesWrapperBackgroundNormal'] );
		}

		if ( isset( $this->attrs['choicesWrapperBorderNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['choicesWrapperBorderNormal'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesWrapperShadowNormal'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['choicesWrapperShadowNormal'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['choicesWrapperBackgroundHover'] ) ) {
			$this->handle_background( ".{$this->element_id} .choices .choices__list.choices__list--dropdown:hover", $this->attrs['choicesWrapperBackgroundHover'] );
		}

		if ( isset( $this->attrs['choicesWrapperBorderHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown:hover",
					'property'       => function ( $value ) {
						return $this->handle_border_responsive( $value );
					},
					'value'          => $this->attrs['choicesWrapperBorderHover'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['choicesWrapperShadowHover'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices .choices__list.choices__list--dropdown:hover",
					'property'       => function ( $value ) {
						return $this->handle_box_shadow( $value );
					},
					'value'          => $this->attrs['choicesWrapperShadowHover'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['dropDownIconOpenColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices.custom-dropdown .choices__inner i",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['dropDownIconOpenColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['dropDownIconOpenSize'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices.custom-dropdown .choices__inner i",
					'property'       => function ( $value ) {
						return "font-size: {$value}px;";
					},
					'value'          => $this->attrs['dropDownIconOpenSize'],
					'device_control' => true,
				)
			);
		}

		if ( isset( $this->attrs['dropDownIconCloseColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices.custom-dropdown.is-open .choices__inner i",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['dropDownIconCloseColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['dropDownIconCloseSize'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .choices.custom-dropdown.is-open .choices__inner i",
					'property'       => function ( $value ) {
						return "font-size: {$value}px;";
					},
					'value'          => $this->attrs['dropDownIconCloseSize'],
					'device_control' => true,
				)
			);
		}
	}
}
