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
		add_action( 'gutenverse_loop_blocks', array( $this, 'enqueue_frontend_style' ), 10, 3 );
	}

	/**
	 * Queue the base frontend style when Gutenverse Pro blocks exist.
	 *
	 * @param array  $block Parsed block data.
	 * @param string $style Generated style.
	 * @param mixed  $generator Frontend generator instance.
	 */
	public function enqueue_frontend_style( $block, $style = null, $generator = null ) {
		if ( isset( $block['blockName'] ) && 0 === strpos( $block['blockName'], 'gutenverse/form' ) ) {
			wp_enqueue_style( 'gutenverse-form-frontend-form-input-general-style' );

			$generator->add_script( array( 'style' => 'gutenverse-form-frontend-form-input-general-style' ) );
		}
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
	 * Check whether font icon assets are needed for an icon attribute pair.
	 *
	 * @param array  $attrs The block attributes.
	 * @param string $type_attribute The icon type attribute name.
	 * @param string $icon_attribute The icon class attribute name.
	 *
	 * @return bool
	 */
	private function has_font_icon( $attrs, $type_attribute, $icon_attribute ) {
		return (
			isset( $attrs[ $type_attribute ] ) && 'icon' === $attrs[ $type_attribute ] &&
			( ! isset( $attrs[ $icon_attribute ] ) || ! empty( $attrs[ $icon_attribute ] ) )
		);
	}

	/**
	 * Load the font icon
	 *
	 * @param array $conditions Value of data need to be loaded.
	 * @param array $attrs The value from the attributes array.
	 * @param mixed $block_name The value to compare against.
	 *
	 * @since 3.3.0
	 */
	public function font_icon_conditional_load( $conditions, $attrs, $block_name ) {
		switch ( $block_name ) {
			case 'gutenverse/form-input-submit':
				if ( isset( $attrs['showIcon'] ) && $attrs['showIcon'] ) {
					if ( $this->has_font_icon( $attrs, 'iconType', 'icon' ) ) {
						$this->icon_conditional_load( $conditions );
					}
				}
				break;
			case 'gutenverse/form-input-telp':
			case 'gutenverse/form-input-text':
			case 'gutenverse/form-input-textarea':
			case 'gutenverse/form-input-number':
			case 'gutenverse/form-input-email':
			case 'gutenverse/form-input-date':
				if ( isset( $attrs['useIcon'] ) && $attrs['useIcon'] ) {
					if ( $this->has_font_icon( $attrs, 'iconType', 'icon' ) ) {
						$this->icon_conditional_load( $conditions );
					}
				}
				break;
			case 'gutenverse/form-input-select':
				if ( isset( $attrs['useCustomDropdown'] ) && $attrs['useCustomDropdown'] ) {
					if (
						$this->has_font_icon( $attrs, 'dropDownIconOpenType', 'dropDownIconOpen' ) ||
						$this->has_font_icon( $attrs, 'dropDownIconCloseType', 'dropDownIconClose' )
					) {
						$this->icon_conditional_load( $conditions );
					}
				}
				break;
			case 'gutenverse/form-input-gdpr':
				$this->icon_conditional_load( $conditions );
				break;
			case 'gutenverse/form-notice':
				if ( ! isset( $attrs['iconSuccessType'] ) || 'icon' === $attrs['iconSuccessType'] || ! isset( $attrs['iconErrorType'] ) || 'icon' === $attrs['iconErrorType'] ) {
					$this->icon_conditional_load( $conditions );
				}
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
			'input-radio',
		);

		foreach ( $blocks as $block ) {
			$include   = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/frontend/' . $block . '.asset.php' )['dependencies'];
			$include[] = 'gutenverse-frontend-event';

			wp_register_script(
				'gutenverse-form-frontend-' . $block . '-script',
				GUTENVERSE_FORM_URL . '/assets/js/frontend/' . $block . '.js',
				$include,
				GUTENVERSE_FORM_VERSION,
				array(
					'in_footer' => true,
					'strategy'  => 'defer',
				)
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

		wp_style_add_data(
			'gutenverse-form-frontend-form-input-general-style',
			'path',
			GUTENVERSE_FORM_DIR . '/assets/css/general-input.css'
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
			'form-notice',
		);

		foreach ( $blocks as $block ) {
			$handle = 'gutenverse-form-frontend-' . $block . '-style';

			wp_register_style(
				'gutenverse-form-frontend-' . $block . '-style',
				GUTENVERSE_FORM_URL . '/assets/css/frontend/' . $block . '.css',
				array( 'gutenverse-form-frontend-form-input-general-style' ),
				GUTENVERSE_FORM_VERSION
			);

			wp_style_add_data(
				$handle,
				'path',
				GUTENVERSE_FORM_DIR . '/assets/css/frontend/' . $block . '.css'
			);
		}
	}
}
