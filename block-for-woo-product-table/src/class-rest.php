<?php
/**
 * Setups REST interface for interacting with WC Product Table shortcode functionality
 *
 * @package   Barn2/woocommerce-product-table/block
 * @author    Barn2 Plugins <info@barn2.co.uk>
 * @license   GPL-3.0
 * @copyright Barn2 Media Ltd
 */

namespace Barn2\Plugin\WC_Product_Table_Block;

use Barn2\Plugin\WC_Product_Table\Table_Factory as Table_Factory;

/**
 * The block class.
 */
class Rest {

	/**
	 * Class follows singleton pattern, this private variable stores the Plugin object
	 *
	 * @var $instance object
	 */
	private static $instance = null;

	/**
	 * Class constructor, does nothing. Run install
	 */
	public function __construct() {}

	/**
	 * Access the instantiated Plugin object
	 */
	public static function instance() {
		return self::$instance;
	}

	/**
	 * Initalizes an WC Product Table Block plugin instance.
	 */
	public static function init() {

		$self = apply_filters( 'barn2_wcptb_rest_instance', new Rest() );

		$self->install();

		self::$instance = $self;

		do_action( 'barn2_wcptb_rest_init', $self );

		return $self;

	}

	/**
	 * Registers rest route with WP Rest
	 */
	public function install() {

		register_rest_route( 'wc-product-table/v1', 'count', array(
			'methods'  => 'POST',
			'callback' => array( $this, 'get_product_count' ),
			'permission_callback' => function() {
				return current_user_can( 'edit_pages' );
			},
		) );

	}

	/**
	 * Gets a product count from WC Product Table based on attributes passed
	 */
	public function get_product_count( $request ) {

		$attributes = $request->get_param( 'attrs' );

		$args = [];

		if ( ! empty( $attributes['columns'] && is_array( $attributes['columns'] ) ) ) {
			$args['columns'] = implode( ',', $attributes['columns'] );
		}

		if ( ! empty( $attributes['filters'] && is_array( $attributes['filters'] ) ) ) {
			foreach ( $attributes['filters'] as $filter ) {
				$args[ $filter['key'] ] = $filter['value'];
			}
		}

		$args = Compat::get_legacy_shortcode_atts( $args );
		
		$args['lazy_load'] = 'false';
		$args['product_limit'] = 100;

		$args = shortcode_atts( 
			Compat::get_default_table_args(), 
			$args, 
			'product_table'
		);

		$table = Table_Factory::create( $args );
		$data = $table->get_data( 'array' );
		
		return [ 'args' => $args, 'count' => count( $data ) ];

	}


}

add_action( 'rest_api_init', array( 'Barn2\Plugin\WC_Product_Table_Block\Rest', 'init' ) );