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
	 * Icon conditional load by value. This will only work if the icon type is 'icon' and icon default is font icon.
	 *
	 * @param mixed $attrs The value from the attributes array.
	 * @param mixed $name The value from the attributes array.
	 * @param mixed $conditions The value from the attributes array.
	 */
	public function icon_conditional_load_by_value( $attrs, $name, &$conditions ) {
		$type_name = $name . 'Type';

		if ( isset( $attrs[ $type_name ] ) ) {
			if ( 'icon' === $attrs[ $type_name ] && ( ! isset( $attrs[ $name ] ) || '' !== $attrs[ $name ] ) ) {
				$this->icon_conditional_load( $conditions );
			}

			return;
		}

		if ( isset( $attrs[ $name ] ) && '' !== $attrs[ $name ] ) {
			$this->icon_conditional_load( $conditions );
		}
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
					$this->icon_conditional_load_by_value( $attrs, 'icon', $conditions );
				}
				break;
			case 'gutenverse/form-input-telp':
			case 'gutenverse/form-input-text':
			case 'gutenverse/form-input-textarea':
			case 'gutenverse/form-input-number':
			case 'gutenverse/form-input-email':
			case 'gutenverse/form-input-date':
				if ( isset( $attrs['useIcon'] ) && $attrs['useIcon'] ) {
					$this->icon_conditional_load_by_value( $attrs, 'icon', $conditions );
				}
				break;
			case 'gutenverse/form-input-select':
				if ( isset( $attrs['useCustomDropdown'] ) && $attrs['useCustomDropdown'] ) {
					$this->icon_conditional_load_by_value( $attrs, 'dropDownIconOpen', $conditions );
					$this->icon_conditional_load_by_value( $attrs, 'dropDownIconClose', $conditions );
				}
				break;
			case 'gutenverse/form-notice':
				$this->icon_conditional_load_by_value( $attrs, 'iconSuccess', $conditions );
				$this->icon_conditional_load_by_value( $attrs, 'iconError', $conditions );
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
