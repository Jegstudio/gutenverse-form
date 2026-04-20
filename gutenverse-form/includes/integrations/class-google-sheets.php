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

		$sheet_title = $this->get_sheet_name();
		$columns     = $this->build_columns( $data, $entry_id, $params );
		$headers     = array_column( $columns, 'header' );
		$row_values  = array_map(
			function ( $column ) {
				return $column['value'];
			},
			$columns
		);

		$header_result = $this->ensure_header_row( $sheet_title, $headers );
		if ( is_wp_error( $header_result ) ) {
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'google_sheets', $header_result );
			return false;
		}

		$response = false;
		if ( $is_admin_refresh ) {
			$response = $this->update_existing_row( $sheet_title, $entry_id, $headers, $row_values );
		}

		if ( false === $response ) {
			$response = $this->append_row( $sheet_title, $row_values );
		}

		$success = \Gutenverse_Form\Integration::handle_send_result( $entry_id, 'google_sheets', $response );

		if ( $success ) {
			$this->store_sync_meta( $entry_id, $sheet_title, $headers, $response );
		}

		return $success;
	}

	/**
	 * Determine whether current settings are sufficient.
	 *
	 * @return bool
	 */
	private function has_required_settings() {
		return '' !== $this->get_spreadsheet_id()
			&& '' !== $this->get_client_email()
			&& '' !== $this->get_private_key();
	}

	/**
	 * Get spreadsheet id.
	 *
	 * @return string
	 */
	private function get_spreadsheet_id() {
		return sanitize_text_field( (string) ( $this->settings['spreadsheetId'] ?? $this->settings['spreadsheet_id'] ?? '' ) );
	}

	/**
	 * Get configured sheet name.
	 *
	 * @return string
	 */
	private function get_sheet_name() {
		$sheet_name = $this->settings['sheetName'] ?? $this->settings['sheet_name'] ?? 'Form Entries';
		$sheet_name = sanitize_text_field( (string) $sheet_name );

		return '' !== $sheet_name ? $sheet_name : 'Form Entries';
	}

	/**
	 * Get configured service account client email.
	 *
	 * @return string
	 */
	private function get_client_email() {
		return sanitize_email( (string) ( $this->settings['clientEmail'] ?? $this->settings['client_email'] ?? '' ) );
	}

	/**
	 * Get configured private key.
	 *
	 * @return string
	 */
	private function get_private_key() {
		$private_key = (string) ( $this->settings['privateKey'] ?? $this->settings['private_key'] ?? '' );

		return str_replace( array( "\r\n", '\n' ), array( "\n", "\n" ), trim( $private_key ) );
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
	 * Ensure the target sheet exists and has headers.
	 *
	 * @param string $sheet_title Sheet title.
	 * @param array  $headers     Header row.
	 *
	 * @return array|\WP_Error
	 */
	private function ensure_header_row( $sheet_title, $headers ) {
		$sheet_meta = $this->get_sheet_metadata( $sheet_title );
		if ( is_wp_error( $sheet_meta ) ) {
			return $sheet_meta;
		}

		if ( empty( $sheet_meta ) ) {
			$created = $this->create_sheet( $sheet_title );
			if ( is_wp_error( $created ) ) {
				return $created;
			}
		}

		$header_range = $this->build_range( $sheet_title, 1, 1, count( $headers ) );
		$header_get   = $this->request(
			'GET',
			'/values/' . rawurlencode( $header_range ),
			array(
				'majorDimension' => 'ROWS',
			)
		);

		if ( is_wp_error( $header_get ) ) {
			return $header_get;
		}

		$current_headers = $header_get['values'][0] ?? array();
		if ( $current_headers !== $headers ) {
			return $this->request(
				'PUT',
				'/values/' . rawurlencode( $header_range ),
				array(
					'valueInputOption' => 'RAW',
				),
				array(
					'range'          => $header_range,
					'majorDimension' => 'ROWS',
					'values'         => array( array_values( $headers ) ),
				)
			);
		}

		return $header_get;
	}

	/**
	 * Append a row to the sheet.
	 *
	 * @param string $sheet_title Sheet title.
	 * @param array  $row_values  Row values.
	 *
	 * @return array|\WP_Error
	 */
	private function append_row( $sheet_title, $row_values ) {
		$range = $this->quote_sheet_title( $sheet_title ) . '!A1';

		return $this->request(
			'POST',
			'/values/' . rawurlencode( $range ) . ':append',
			array(
				'valueInputOption'             => 'RAW',
				'insertDataOption'             => 'INSERT_ROWS',
				'includeValuesInResponse'      => 'false',
			),
			array(
				'majorDimension' => 'ROWS',
				'values'         => array( array_values( $row_values ) ),
			)
		);
	}

	/**
	 * Update an existing row for an admin-side refresh.
	 *
	 * @param string $sheet_title Sheet title.
	 * @param int    $entry_id    Entry ID.
	 * @param array  $headers     Header row.
	 * @param array  $row_values  Row values.
	 *
	 * @return array|\WP_Error|false
	 */
	private function update_existing_row( $sheet_title, $entry_id, $headers, $row_values ) {
		$row_number = $this->get_existing_row_number( $entry_id, $sheet_title );

		if ( $row_number <= 1 ) {
			$row_number = $this->find_row_by_entry_id( $sheet_title, $entry_id );
		}

		if ( $row_number <= 1 ) {
			return false;
		}

		$range = $this->build_range( $sheet_title, $row_number, 1, count( $headers ) );

		return $this->request(
			'PUT',
			'/values/' . rawurlencode( $range ),
			array(
				'valueInputOption' => 'RAW',
			),
			array(
				'range'          => $range,
				'majorDimension' => 'ROWS',
				'values'         => array( array_values( $row_values ) ),
			)
		);
	}

	/**
	 * Search the first column for a matching entry id.
	 *
	 * @param string $sheet_title Sheet title.
	 * @param int    $entry_id    Entry ID.
	 *
	 * @return int
	 */
	private function find_row_by_entry_id( $sheet_title, $entry_id ) {
		$range    = $this->quote_sheet_title( $sheet_title ) . '!A:A';
		$response = $this->request(
			'GET',
			'/values/' . rawurlencode( $range ),
			array(
				'majorDimension' => 'COLUMNS',
			)
		);

		if ( is_wp_error( $response ) ) {
			return 0;
		}

		$rows = $response['values'][0] ?? array();
		foreach ( $rows as $index => $value ) {
			if ( (string) $entry_id === (string) $value ) {
				return $index + 1;
			}
		}

		return 0;
	}

	/**
	 * Get cached row number for a given entry.
	 *
	 * @param int    $entry_id    Entry ID.
	 * @param string $sheet_title Sheet title.
	 *
	 * @return int
	 */
	private function get_existing_row_number( $entry_id, $sheet_title ) {
		$sync_meta = get_post_meta( $entry_id, self::ENTRY_SYNC_META_KEY, true );
		$sync_meta = is_array( $sync_meta ) ? $sync_meta : array();
		$key       = md5( $this->get_spreadsheet_id() . '|' . $sheet_title );

		return isset( $sync_meta[ $key ]['row'] ) ? (int) $sync_meta[ $key ]['row'] : 0;
	}

	/**
	 * Store sync metadata on the entry after a successful write.
	 *
	 * @param int    $entry_id    Entry ID.
	 * @param string $sheet_title Sheet title.
	 * @param array  $headers      Header row.
	 * @param array  $response     Google API response.
	 *
	 * @return void
	 */
	private function store_sync_meta( $entry_id, $sheet_title, $headers, $response ) {
		$updated_range = $response['updates']['updatedRange'] ?? $response['updatedRange'] ?? '';
		$row_number    = $this->extract_row_number( (string) $updated_range );

		if ( $row_number < 1 ) {
			return;
		}

		$sync_meta = get_post_meta( $entry_id, self::ENTRY_SYNC_META_KEY, true );
		$sync_meta = is_array( $sync_meta ) ? $sync_meta : array();
		$key       = md5( $this->get_spreadsheet_id() . '|' . $sheet_title );

		$sync_meta[ $key ] = array(
			'spreadsheet_id' => $this->get_spreadsheet_id(),
			'sheet_name'     => $sheet_title,
			'row'            => $row_number,
			'headers'        => array_values( $headers ),
			'updated_at'     => current_time( 'mysql', true ),
		);

		update_post_meta( $entry_id, self::ENTRY_SYNC_META_KEY, $sync_meta );
	}

	/**
	 * Create a new tab in the spreadsheet.
	 *
	 * @param string $sheet_title Sheet title.
	 *
	 * @return array|\WP_Error
	 */
	private function create_sheet( $sheet_title ) {
		return $this->request(
			'POST',
			':batchUpdate',
			array(),
			array(
				'requests' => array(
					array(
						'addSheet' => array(
							'properties' => array(
								'title' => $sheet_title,
							),
						),
					),
				),
			)
		);
	}

	/**
	 * Load sheet metadata and find the matching tab.
	 *
	 * @param string $sheet_title Sheet title.
	 *
	 * @return array|\WP_Error
	 */
	private function get_sheet_metadata( $sheet_title ) {
		$response = $this->request(
			'GET',
			'',
			array(
				'fields' => 'sheets(properties(sheetId,title))',
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		foreach ( $response['sheets'] ?? array() as $sheet ) {
			$title = $sheet['properties']['title'] ?? '';
			if ( $sheet_title === $title ) {
				return $sheet;
			}
		}

		return array();
	}

	/**
	 * Perform a Google Sheets API request.
	 *
	 * @param string     $method HTTP method.
	 * @param string     $path   Endpoint path.
	 * @param array      $query  Query params.
	 * @param array|null $body   Optional request body.
	 *
	 * @return array|\WP_Error
	 */
	private function request( $method, $path, $query = array(), $body = null ) {
		$token = $this->get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}

		$url = 'https://sheets.googleapis.com/v4/spreadsheets/' . rawurlencode( $this->get_spreadsheet_id() ) . $path;
		if ( ! empty( $query ) ) {
			$url = add_query_arg( $query, $url );
		}

		$args = array(
			'method'  => strtoupper( $method ),
			'timeout' => 20,
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Content-Type'  => 'application/json',
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
			$message = $body_json['error']['message'] ?? __( 'Google Sheets request failed.', 'gutenverse-form' );
			return new \WP_Error(
				'google_sheets_request_failed',
				$message,
				array(
					'status' => $status_code,
					'body'   => $body_json,
				)
			);
		}

		return is_array( $body_json ) ? $body_json : array();
	}

	/**
	 * Get or mint a service-account access token.
	 *
	 * @return string|\WP_Error
	 */
	private function get_access_token() {
		$cache = get_transient( self::TOKEN_CACHE_KEY . '_' . md5( $this->get_client_email() ) );
		if ( is_array( $cache ) && ! empty( $cache['token'] ) && ! empty( $cache['expires_at'] ) && (int) $cache['expires_at'] > time() + 60 ) {
			return $cache['token'];
		}

		$jwt = $this->build_jwt();
		if ( is_wp_error( $jwt ) ) {
			return $jwt;
		}

		$response = wp_remote_post(
			'https://oauth2.googleapis.com/token',
			array(
				'timeout' => 20,
				'body'    => array(
					'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
					'assertion'  => $jwt,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );
		$body        = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $status_code < 200 || $status_code >= 300 || empty( $body['access_token'] ) ) {
			return new \WP_Error(
				'google_sheets_token_failed',
				$body['error_description'] ?? __( 'Unable to retrieve Google Sheets access token.', 'gutenverse-form' ),
				array(
					'status' => $status_code,
					'body'   => $body,
				)
			);
		}

		set_transient(
			self::TOKEN_CACHE_KEY . '_' . md5( $this->get_client_email() ),
			array(
				'token'      => $body['access_token'],
				'expires_at' => time() + max( 300, (int) ( $body['expires_in'] ?? 3600 ) - 60 ),
			),
			max( 300, (int) ( $body['expires_in'] ?? 3600 ) - 60 )
		);

		return $body['access_token'];
	}

	/**
	 * Build a signed JWT for the service account flow.
	 *
	 * @return string|\WP_Error
	 */
	private function build_jwt() {
		$header = $this->base64url_encode(
			wp_json_encode(
				array(
					'alg' => 'RS256',
					'typ' => 'JWT',
				)
			)
		);

		$issued_at = time();
		$payload   = $this->base64url_encode(
			wp_json_encode(
				array(
					'iss'   => $this->get_client_email(),
					'scope' => 'https://www.googleapis.com/auth/spreadsheets',
					'aud'   => 'https://oauth2.googleapis.com/token',
					'iat'   => $issued_at,
					'exp'   => $issued_at + 3600,
				)
			)
		);

		$unsigned  = $header . '.' . $payload;
		$signature = '';
		$signed    = openssl_sign( $unsigned, $signature, $this->get_private_key(), 'sha256WithRSAEncryption' );

		if ( ! $signed ) {
			return new \WP_Error( 'google_sheets_jwt_failed', __( 'Unable to sign the Google Sheets service account request. Please re-check the private key.', 'gutenverse-form' ) );
		}

		return $unsigned . '.' . $this->base64url_encode( $signature );
	}

	/**
	 * Base64 URL-safe encode.
	 *
	 * @param string $value Raw value.
	 *
	 * @return string
	 */
	private function base64url_encode( $value ) {
		return rtrim( strtr( base64_encode( (string) $value ), '+/', '-_' ), '=' );
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
			'clientEmail' => array(
				'label'       => __( 'Service Account Email', 'gutenverse-form' ),
				'description' => __( 'Paste the Google service account email, then share your spreadsheet with that email as an editor.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => 'gutenverse-form-sync@your-project.iam.gserviceaccount.com',
			),
			'privateKey' => array(
				'label'       => __( 'Private Key', 'gutenverse-form' ),
				'description' => __( 'Paste the full private key from your Google service account JSON file, including the BEGIN and END lines.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'textarea',
				'sensitive'   => true,
				'placeholder' => "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
			),
			'spreadsheetId' => array(
				'label'       => __( 'Spreadsheet ID', 'gutenverse-form' ),
				'description' => __( 'Use the long ID from your Google Sheets URL. This is the default spreadsheet used by forms unless they override it locally.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
			),
			'sheetName' => array(
				'label'       => __( 'Sheet Tab Name', 'gutenverse-form' ),
				'description' => __( 'Choose the tab that should receive entries. It will be created automatically if it does not exist.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'Form Entries', 'gutenverse-form' ),
			),
			'columnsTemplate' => array(
				'label'       => __( 'Column Template', 'gutenverse-form' ),
				'description' => __( 'Optional. Write one column per line using Header={placeholder}. Example: email={email}. Leave empty to use entry_id, submitted_at, form_id, form_title, and all field IDs automatically.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => "entry_id={entry_id}\nsubmitted_at={submitted_at}\nemail={email}\nmessage={message}",
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
