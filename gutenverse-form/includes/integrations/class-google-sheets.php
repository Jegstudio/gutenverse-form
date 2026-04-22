<?php
/**
 * Google Sheets integration.
 *
 * @author Jegstudio
 * @since 2.7.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Class Google_Sheets
 *
 * @package gutenverse-form
 */
class Google_Sheets {
	/**
	 * Saved settings for the active request.
	 *
	 * @var array
	 */
	protected $settings = array();

	/**
	 * Service account access token cache key.
	 */
	const TOKEN_CACHE_KEY = 'gutenverse_form_google_sheets_token';

	/**
	 * Sync meta key stored on the entry.
	 */
	const ENTRY_SYNC_META_KEY = 'google_sheets_sync';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Update active settings.
	 *
	 * @param array $settings Integration settings.
	 *
	 * @return void
	 */
	public function set_settings( $settings ) {
		$this->settings = is_array( $settings ) ? $settings : array();
	}

	/**
	 * Triggered after form data is stored.
	 *
	 * @param int|string $entry_id     Entry ID.
	 * @param array      $params       Submission params.
	 * @param array      $form_setting Form settings.
	 * @param object     $request      REST request object.
	 *
	 * @return void
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data             = \Gutenverse_Form\Integration::prepare_entry_data( $params );
		$options          = get_option( 'gutenverse_form_integrations', array() );
		$global_settings  = get_option( 'gutenverse_form_google_sheets_settings', array() );
		$global_enabled   = ! empty( $options['google_sheets'] );
		$apply_globally   = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;
		$has_local_config = \Gutenverse_Form\Integration::has_local_service_config( 'google_sheets', $form_setting );
		$local_settings   = \Gutenverse_Form\Integration::get_local_service_settings( 'google_sheets', $form_setting );
		$local_enabled    = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;
		$is_admin_refresh = null === $request;

		if ( $global_enabled && $apply_globally && ! $has_local_config ) {
			$this->sync_entry( array_merge( $global_settings, $local_settings ), $entry_id, $params, $data, $is_admin_refresh );
		}

		if ( $local_enabled ) {
			$this->sync_entry( array_merge( $global_settings, $local_settings ), $entry_id, $params, $data, $is_admin_refresh );
		}

		foreach ( \Gutenverse_Form\Integration::get_service_actions( 'google_sheets', $params, $form_setting ) as $action ) {
			$settings = $global_settings;

			foreach ( $action as $key => $value ) {
				if ( '' !== $value && null !== $value ) {
					$settings[ $key ] = $value;
				}
			}

			$this->sync_entry( $settings, $entry_id, $params, $data, $is_admin_refresh );
		}
	}

	/**
	 * Sync one entry to Google Sheets.
	 *
	 * @param array $settings         Merged settings.
	 * @param int   $entry_id         Entry ID.
	 * @param array $params           Submission params.
	 * @param array $data             Prepared form data.
	 * @param bool  $is_admin_refresh Whether the request comes from admin retrigger flow.
	 *
	 * @return bool
	 */
	private function sync_entry( $settings, $entry_id, $params, $data, $is_admin_refresh ) {
		$this->set_settings( $settings );

		if ( ! $this->has_required_settings() ) {
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'google_sheets', false );
			return false;
		}

		$columns  = $this->build_columns( $data, $entry_id, $params );
		$row_data = $this->build_row_data( $columns );
		$response = false;

		if ( $is_admin_refresh ) {
			$response = $this->update_existing_row( $entry_id, $row_data );
		}

		if ( false === $response ) {
			$response = $this->append_row( $row_data );
		}

		$success = \Gutenverse_Form\Integration::handle_send_result( $entry_id, 'google_sheets', $response );

		return $success;
	}

	/**
	 * Determine whether current settings are sufficient.
	 *
	 * @return bool
	 */
	private function has_required_settings() {
		return '' !== $this->get_endpoint_url()
			&& '' !== $this->get_access_key()
			&& '' !== $this->get_secret_key();
	}

	/**
	 * Extract spreadsheet id from the endpoint URL.
	 *
	 * @return string
	 */
	private function get_spreadsheet_id() {
		$endpoint = $this->get_endpoint_url();
		if ( preg_match( '#/data/([^/?]+)/?#', $endpoint, $matches ) ) {
			return sanitize_text_field( (string) $matches[1] );
		}

		return '';
	}

	/**
	 * Get configured API Spreadsheets access key.
	 *
	 * @return string
	 */
	private function get_access_key() {
		return sanitize_text_field( (string) ( $this->settings['accessKey'] ?? $this->settings['access_key'] ?? '' ) );
	}

	/**
	 * Get configured API Spreadsheets secret key.
	 *
	 * @return string
	 */
	private function get_secret_key() {
		return trim( (string) ( $this->settings['secretKey'] ?? $this->settings['secret_key'] ?? '' ) );
	}

	/**
	 * Get configured endpoint URL.
	 *
	 * @return string
	 */
	private function get_endpoint_url() {
		$endpoint = esc_url_raw( trim( (string) ( $this->settings['endpointUrl'] ?? $this->settings['endpoint_url'] ?? '' ) ) );
		return '' !== $endpoint ? trailingslashit( $endpoint ) : '';
	}

	/**
	 * Build row columns.
	 *
	 * @param array $data     Prepared form data.
	 * @param int   $entry_id Entry ID.
	 * @param array $params   Submission params.
	 *
	 * @return array
	 */
	private function build_columns( $data, $entry_id, $params ) {
		$placeholders = $this->build_placeholder_values( $data, $entry_id, $params );
		$template     = (string) ( $this->settings['columnsTemplate'] ?? $this->settings['columns_template'] ?? '' );
		$columns      = array(
			array(
				'header' => 'entry_id',
				'value'  => (string) $entry_id,
			),
		);

		foreach ( $this->parse_columns_template( $template, $placeholders ) as $column ) {
			if ( 'entry_id' === $column['header'] ) {
				$columns[0]['value'] = $column['value'];
				continue;
			}

			$columns[] = $column;
		}

		if ( '' === trim( $template ) ) {
			$columns[] = array(
				'header' => 'submitted_at',
				'value'  => $placeholders['submitted_at'],
			);
			$columns[] = array(
				'header' => 'form_id',
				'value'  => $placeholders['form_id'],
			);
			$columns[] = array(
				'header' => 'form_title',
				'value'  => $placeholders['form_title'],
			);

			foreach ( $data as $field_id => $value ) {
				$columns[] = array(
					'header' => sanitize_key( $field_id ),
					'value'  => is_scalar( $value ) ? (string) $value : '',
				);
			}
		}

		return $columns;
	}

	/**
	 * Build placeholder values for intuitive column templates.
	 *
	 * @param array $data     Prepared form data.
	 * @param int   $entry_id Entry ID.
	 * @param array $params   Submission params.
	 *
	 * @return array
	 */
	private function build_placeholder_values( $data, $entry_id, $params ) {
		$values = array(
			'entry_id'     => (string) $entry_id,
			'form_id'      => (string) (int) ( $params['form-id'] ?? 0 ),
			'form_title'   => get_the_title( (int) ( $params['form-id'] ?? 0 ) ),
			'site_title'   => get_bloginfo( 'name' ),
			'site_url'     => home_url( '/' ),
			'submitted_at' => current_time( 'mysql', true ),
		);

		$all_fields = array();
		foreach ( $data as $key => $value ) {
			$display_value   = is_array( $value ) ? implode( ', ', array_map( 'strval', $value ) ) : (string) $value;
			$values[ $key ]  = $display_value;
			$all_fields[]    = $key . ': ' . $display_value;
		}

		$values['all_fields'] = implode( "\n", $all_fields );

		return $values;
	}

	/**
	 * Parse intuitive "Header={placeholder}" template lines.
	 *
	 * @param string $template     Raw template.
	 * @param array  $placeholders Placeholder values.
	 *
	 * @return array
	 */
	private function parse_columns_template( $template, $placeholders ) {
		$columns = array();
		$lines   = preg_split( '/\r\n|\r|\n/', (string) $template );

		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( '' === $line || false === strpos( $line, '=' ) ) {
				continue;
			}

			list( $header, $value_template ) = array_map( 'trim', explode( '=', $line, 2 ) );
			$header                          = sanitize_key( $header );

			if ( '' === $header ) {
				continue;
			}

			$columns[] = array(
				'header' => $header,
				'value'  => $this->replace_placeholders( $value_template, $placeholders ),
			);
		}

		return $columns;
	}

	/**
	 * Replace placeholders inside a value template.
	 *
	 * @param string $template     Value template.
	 * @param array  $placeholders Placeholder values.
	 *
	 * @return string
	 */
	private function replace_placeholders( $template, $placeholders ) {
		return (string) preg_replace_callback(
			'/\{([a-zA-Z0-9_\-]+)\}/',
			function ( $matches ) use ( $placeholders ) {
				$key = sanitize_key( $matches[1] );
				return isset( $placeholders[ $key ] ) ? (string) $placeholders[ $key ] : '';
			},
			(string) $template
		);
	}

	/**
	 * Convert columns into an associative payload for API Spreadsheets.
	 *
	 * @param array $columns Column definitions.
	 *
	 * @return array
	 */
	private function build_row_data( $columns ) {
		$row_data = array();

		foreach ( $columns as $column ) {
			$header = isset( $column['header'] ) ? sanitize_text_field( (string) $column['header'] ) : '';
			if ( '' === $header ) {
				continue;
			}

			$value = $column['value'] ?? '';
			$row_data[ $header ] = is_scalar( $value ) ? (string) $value : '';
		}

		return $row_data;
	}

	/**
	 * Append a row using API Spreadsheets.
	 *
	 * @param array $row_data Row values keyed by column.
	 *
	 * @return array|\WP_Error
	 */
	private function append_row( $row_data ) {
		return $this->request(
			'POST',
			array(),
			array(
				'data' => $row_data,
			)
		);
	}

	/**
	 * Update an existing row for an admin-side refresh.
	 *
	 * @param int   $entry_id Entry ID.
	 * @param array $row_data Row values keyed by column.
	 *
	 * @return array|\WP_Error|false
	 */
	private function update_existing_row( $entry_id, $row_data ) {
		if ( empty( $row_data['entry_id'] ) ) {
			return false;
		}

		return $this->request(
			'POST',
			array(),
			array(
				'data'  => $row_data,
				'query' => sprintf(
					"select * from %s where entry_id='%s'",
					$this->get_spreadsheet_id(),
					$this->escape_query_value( (string) $entry_id )
				),
			)
		);
	}

	/**
	 * Escape values used inside an API Spreadsheets query.
	 *
	 * @param string $value Raw value.
	 *
	 * @return string
	 */
	private function escape_query_value( $value ) {
		return str_replace( "'", "\\'", $value );
	}

	/**
	 * Perform an API Spreadsheets request.
	 *
	 * @param string     $method HTTP method.
	 * @param array      $query  Query params.
	 * @param array|null $body   Optional request body.
	 *
	 * @return array|\WP_Error
	 */
	private function request( $method, $query = array(), $body = null ) {
		$url = $this->get_endpoint_url();
		if ( ! empty( $query ) ) {
			$url = add_query_arg( $query, $url );
		}

		$args = array(
			'method'  => strtoupper( $method ),
			'timeout' => 20,
			'headers' => array(
				'accessKey'   => $this->get_access_key(),
				'secretKey'   => $this->get_secret_key(),
				'Content-Type'=> 'application/json',
			),
		);

		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );
		$body_json   = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $status_code < 200 || $status_code >= 300 ) {
			$message = $body_json['message'] ?? $body_json['error'] ?? __( 'Google Sheets request failed.', 'gutenverse-form' );
			return new \WP_Error(
				'google_sheets_request_failed',
				$message,
				array(
					'status' => $status_code,
					'body'   => $body_json,
				)
			);
		}

		return $response;
	}

	/**
	 * Quote a sheet title for A1 notation.
	 *
	 * @param string $sheet_title Sheet title.
	 *
	 * @return string
	 */
	private function quote_sheet_title( $sheet_title ) {
		return "'" . str_replace( "'", "''", $sheet_title ) . "'";
	}

	/**
	 * Build an A1 range.
	 *
	 * @param string $sheet_title Sheet title.
	 * @param int    $row_number  1-indexed row.
	 * @param int    $start_col   1-indexed start column.
	 * @param int    $col_count   Total number of columns.
	 *
	 * @return string
	 */
	private function build_range( $sheet_title, $row_number, $start_col, $col_count ) {
		$start = $this->column_number_to_name( $start_col );
		$end   = $this->column_number_to_name( $start_col + $col_count - 1 );

		return $this->quote_sheet_title( $sheet_title ) . '!' . $start . $row_number . ':' . $end . $row_number;
	}

	/**
	 * Convert a column number to its A1 name.
	 *
	 * @param int $number Column number.
	 *
	 * @return string
	 */
	private function column_number_to_name( $number ) {
		$name = '';
		$number = max( 1, (int) $number );

		while ( $number > 0 ) {
			$number--;
			$name   = chr( 65 + ( $number % 26 ) ) . $name;
			$number = (int) floor( $number / 26 );
		}

		return $name;
	}

	/**
	 * Extract a row number from an updated range string.
	 *
	 * @param string $range Updated range.
	 *
	 * @return int
	 */
	private function extract_row_number( $range ) {
		if ( preg_match( '/![A-Z]+(\d+):[A-Z]+(\d+)/', $range, $matches ) ) {
			return (int) $matches[1];
		}

		return 0;
	}

	/**
	 * Fields used on the global integration settings page.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'endpointUrl' => array(
				'label'       => __( 'API Endpoint URL', 'gutenverse-form' ),
				'description' => __( 'Paste the full API Spreadsheets endpoint. The data source ID is read from this URL automatically.', 'gutenverse-form' ),
				'type'        => 'text',
				'sensitive'   => true,
				'required'    => true,
				'placeholder' => 'https://api.apispreadsheets.com/data/DBryPPnM0GlM5u28/',
			),
			'accessKey' => array(
				'label'       => __( 'Access Key', 'gutenverse-form' ),
				'description' => __( 'Paste the accessKey value shown in your API Spreadsheets documentation example.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => '062b1da7839a41aff88c43abf932d4dd',
			),
			'secretKey' => array(
				'label'       => __( 'Secret Key', 'gutenverse-form' ),
				'description' => __( 'Paste the secretKey value shown in your API Spreadsheets documentation example.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'sensitive'   => true,
				'placeholder' => 'ccd2cd6ee8ad1dcf76d844b7434c5154',
			),
			'columnsTemplate' => array(
				'label'       => __( 'Column Template', 'gutenverse-form' ),
				'description' => __( 'Optional. Write one field per line using Column={placeholder}. These values are sent inside the API request body as the "data" object.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => "data={entry_id}\nExample={email}\nmessage={message}",
			),
		);
	}

	/**
	 * Get saved settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_google_sheets_settings', array() );
	}
}
