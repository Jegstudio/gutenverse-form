<?php
/**
 * Gutenverse Form_Input_Gdpr
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\style
 */

namespace Gutenverse_Form\Style;

use Gutenverse\Framework\Style_Abstract;

/**
 * Class Form_Input_Gdpr
 *
 * @package gutenverse-form\style
 */
class Form_Input_Gdpr extends Style_Abstract {
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
	protected $name = 'form-input-gdpr';

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

		if ( isset( $this->attrs['wrapperMargin'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id} .gutenverse-inner-input .guten-gdpr-wrapper",
					'property'       => function ( $value ) {
						return $this->handle_dimension( $value, 'margin' );
					},
					'value'          => $this->attrs['wrapperMargin'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprSize'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before",
					'property'       => function ( $value ) {
						return "font-size: {$value}px;";
					},
					'value'          => $this->attrs['gdprSize'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprSpace'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before",
					'property'       => function ( $value ) {
						return "margin-right: {$value}px;";
					},
					'value'          => $this->attrs['gdprSpace'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprLabelColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['gdprLabelColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['gdprTypography'],
					'device_control' => false,
				)
			);
		}

        if ( isset( $this->attrs['gdprLinkColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label a",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['gdprLinkColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprLinkTypography'] ) ) {
			$this->inject_typography(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label a",
					'property'       => function ( $value ) {},
					'value'          => $this->attrs['gdprLinkTypography'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['gdprColor'],
					'device_control' => false,
				)
			);
		}

		if ( isset( $this->attrs['gdprActiveColor'] ) ) {
			$this->inject_style(
				array(
					'selector'       => ".{$this->element_id}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper input:checked + .check:before",
					'property'       => function ( $value ) {
						return $this->handle_color( $value, 'color' );
					},
					'value'          => $this->attrs['gdprActiveColor'],
					'device_control' => false,
				)
			);
		}
	}
}
