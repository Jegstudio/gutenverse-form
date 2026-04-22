<?php
/**
 * Frontend Assets class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Frontend Assets
 *
 * @package gutenverse-form
 */
class Frontend_Assets {
	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_filter( 'gutenverse_include_frontend', array( $this, 'load_conditional_scripts' ) );
		add_filter( 'gutenverse_include_frontend', array( $this, 'load_conditional_styles' ) );
		add_filter( 'gutenverse_conditional_script_attributes', array( $this, 'font_icon_conditional_load' ), null, 3 );
	}

	/**
	 * Icon conditional load
	 *
	 * @param mixed $conditions The value from the attributes array.
	 *
	 * @since 3.3.0
	 */
	private function icon_conditional_load( &$conditions ) {
		$conditions[] = array(
			'style' => 'fontawesome-gutenverse',
		);

		$conditions[] = array(
			'style' => 'gutenverse-iconlist',
		);

		return $conditions;
	}

	/**
	 * Load the font icon
	 *
	 * @param mixed  $conditions The value from the attributes array.
	 * @param string $attrs The comparison operator (e.g., '===', '!==').
	 * @param mixed  $block_name The value to compare against.
	 *
	 * @since 3.3.0
	 */
	public function font_icon_conditional_load( $conditions, $attrs, $block_name ) {
		switch ( $block_name ) {
			case 'gutenverse/form-input-submit':
			case 'gutenverse/form-input-telp':
			case 'gutenverse/form-input-text':
			case 'gutenverse/form-input-textarea':
			case 'gutenverse/form-input-number':
			case 'gutenverse/form-input-email':
			case 'gutenverse/form-input-date':
				if ( isset( $attrs['showIcon'] ) && $attrs['showIcon'] ) {
					if ( ! isset( $attrs['iconType'] ) || 'icon' === $attrs['iconType'] ) {
						$this->icon_conditional_load( $conditions );
					}
				}
				break;
			case 'gutenverse/form-input-select':
				if ( isset( $attrs['useCustomDropdown'] ) && $attrs['useCustomDropdown'] ) {
					if ( ! isset( $attrs['dropDownIconOpenType'] ) || 'icon' === $attrs['dropDownIconOpenType'] || ! isset( $attrs['dropDownIconCloseType'] ) || 'icon' === $attrs['dropDownIconCloseType'] ) {
						$this->icon_conditional_load( $conditions );
					}
				}
				break;
			case 'gutenverse/form-input-gdpr':
				$this->icon_conditional_load( $conditions );
				break;
		}

		return $conditions;
	}

	/**
	 * Load Conditional Scripts
	 *
	 * @since 2.3.0
	 */
	public function load_conditional_scripts() {
		$blocks = array(
			'form-builder',
			'input-date',
			'input-gdpr',
			'input-multiselect',
			'input-select',
		);

		foreach ( $blocks as $block ) {
			$include   = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/frontend/' . $block . '.asset.php' )['dependencies'];
			$include[] = 'gutenverse-frontend-event';

			wp_register_script(
				'gutenverse-form-frontend-' . $block . '-script',
				GUTENVERSE_FORM_URL . '/assets/js/frontend/' . $block . '.js',
				$include,
				GUTENVERSE_FORM_VERSION,
				true
			);
		}
	}

	/**
	 * Load Conditional Styles
	 *
	 * @since 2.3.0
	 */
	public function load_conditional_styles() {
		wp_register_style(
			'gutenverse-form-frontend-form-input-general-style',
			GUTENVERSE_FORM_URL . '/assets/css/general-input.css',
			array(),
			GUTENVERSE_FORM_VERSION
		);

		$blocks = array(
			'form-builder',
			'form-input-checkbox',
			'form-input-date',
			'form-input-email',
			'form-input-gdpr',
			'form-input-multiselect',
			'form-input-number',
			'form-input-radio',
			'form-input-recaptcha',
			'form-input-select',
			'form-input-submit',
			'form-input-switch',
			'form-input-telp',
			'form-input-text',
			'form-input-textarea',
		);

		foreach ( $blocks as $block ) {
			wp_register_style(
				'gutenverse-form-frontend-' . $block . '-style',
				GUTENVERSE_FORM_URL . '/assets/css/frontend/' . $block . '.css',
				array( 'gutenverse-form-frontend-form-input-general-style' ),
				GUTENVERSE_FORM_VERSION
			);
		}
	}
}
