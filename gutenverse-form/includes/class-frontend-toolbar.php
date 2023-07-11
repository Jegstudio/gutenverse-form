<?php
/**
 * Frontend Toolbar
 *
 * @author Jegstudio
 * @since 1.4.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Frontend Toolbar
 *
 * @package gutenverse-form
 */
class Frontend_Toolbar {
	/**
	 * Frontend Toolbar Construct.
	 */
	public function __construct() {
		add_action( 'gutenverse_setting_toolbar', array( $this, 'setting_toolbar' ), 10, 2 );
	}

	/**
	 * Setting Toolbar.
	 *
	 * @param \WP_Admin_Bar $admin_bar Admin Bar Instance.
	 * @param string        $parent Parent.
	 */
	public function setting_toolbar( $admin_bar, $parent = 'gutenverse-form' ) {
		$admin_bar->add_menu(
			array(
				'id'     => 'form',
				'parent' => $parent,
				'title'  => esc_html__( 'Form Action', 'gutenverse-form' ),
				'href'   => admin_url( 'edit.php?post_type=' . Form::POST_TYPE ),
			)
		);

		$admin_bar->add_menu(
			array(
				'id'     => 'form-entries',
				'parent' => $parent,
				'title'  => esc_html__( 'Form Entries', 'gutenverse-form' ),
				'href'   => admin_url( 'edit.php?post_type=' . Entries::POST_TYPE ),
			)
		);
	}
}
