<?php
/** Standalone security regressions: php tests/security-regression.php. */
class WP_REST_Response {
	public function __construct( public $data, public $status = 200 ) {}
}

$filters = array();
$source_post = null;
function apply_filters( $name, $value, ...$args ) {
	global $filters;
	return $filters[ $name ] ?? $value;
}
function absint( $value ) { return abs( (int) $value ); }
function sanitize_key( $value ) { return preg_replace( '/[^a-z0-9_-]/', '', strtolower( $value ) ); }
function get_post( $id ) { global $source_post; return $source_post; }
function get_posts( $args ) { return array(); }
function is_post_publicly_viewable( $post ) { return 'publish' === $post->post_status; }
function current_user_can( ...$args ) { return false; }
function post_password_required( $post ) { return ! empty( $post->post_password ); }
function has_blocks( $content ) { return false; }
function sanitize_text_field( $value ) { return trim( strip_tags( $value ) ); }
function wp_get_current_user() { return (object) array( 'ID' => 1 ); }
function get_user_meta( $id, $key, $single ) { return 'first_name' === $key ? 'Alice' : 'secret-token'; }

require __DIR__ . '/../gutenverse-form/includes/class-api.php';
require __DIR__ . '/../gutenverse-form/includes/class-entries.php';
require __DIR__ . '/../gutenverse-form/includes/class-dynamic-value.php';

function check( $condition, $message ) {
	if ( ! $condition ) {
		throw new RuntimeException( $message );
	}
}
function invoke_private( $class, $method, ...$args ) {
	$reflection = new ReflectionClass( $class );
	return $reflection->getMethod( $method )->invokeArgs( $reflection->newInstanceWithoutConstructor(), $args );
}

$entry = array(
	'postId' => 12,
	'integrationSource' => array( 'type' => 'block', 'elementId' => 'invented' ),
	'data' => array( array( 'id' => 'invented', 'type' => 'text' ) ),
);
foreach ( array( null, (object) array( 'ID' => 12, 'post_status' => 'draft' ), (object) array( 'ID' => 12, 'post_status' => 'publish', 'post_password' => 'protected' ) ) as $source_post ) {
	$result = invoke_private( 'Gutenverse_Form\\Api', 'get_submission_field_schema', $entry, 99 );
	check( $result instanceof WP_REST_Response && 400 === $result->status, 'Unresolved or inaccessible source accepted.' );
}

$field = array( 'type' => 'text', 'required' => true );
check( invoke_private( 'Gutenverse_Form\\Api', 'validate_submitted_form_field_value', $field, '', $entry, 99, array(), 0 ) instanceof WP_REST_Response, 'Required field accepted an empty value.' );
check( null === invoke_private( 'Gutenverse_Form\\Api', 'validate_submitted_form_field_value', $field, 'Valid value', $entry, 99, array(), 0 ), 'Valid required text rejected.' );

foreach ( array( '=1+1', '+1', '-1', '@SUM(A1)', " \t=1", "\rpayload", "\ntext" ) as $value ) {
	check( "'" . $value === invoke_private( 'Gutenverse_Form\\Entries', 'csv_cell_text', $value ), 'CSV formula prefix survived.' );
}
check( 'normal text' === invoke_private( 'Gutenverse_Form\\Entries', 'csv_cell_text', 'normal text' ), 'Plain CSV text changed.' );

$attrs = array( 'userDataType' => 'meta', 'userDataMetaKey' => 'api_token', 'fallbackDefaultValue' => 'fallback' );
check( 'fallback' === invoke_private( 'Gutenverse_Form\\Dynamic_Value', 'resolve_user_data', $attrs ), 'Private user metadata exposed.' );
$attrs['userDataMetaKey'] = 'first_name';
check( 'Alice' === invoke_private( 'Gutenverse_Form\\Dynamic_Value', 'resolve_user_data', $attrs ), 'Approved profile data blocked.' );
check( false === invoke_private( 'Gutenverse_Form\\Dynamic_Value', 'is_allowed_meta_key', 'post', '_secret' ), 'Post metadata allowed by default.' );
$filters['gutenverse_form_dynamic_post_meta_allowed_keys'] = array( 'sku' );
check( true === invoke_private( 'Gutenverse_Form\\Dynamic_Value', 'is_allowed_meta_key', 'post', 'sku' ), 'Explicit metadata approval ignored.' );
check( false === invoke_private( 'Gutenverse_Form\\Dynamic_Value', 'is_allowed_meta_key', 'post', '_secret' ), 'Unapproved metadata allowed.' );
echo "Security regression checks passed.\n";
