<?php
/**
 * Provides a compatibility layer for multiple versions of WPT
 *
 * @package   Barn2/woocommerce-product-table/block
 * @author    Barn2 Plugins <info@barn2.co.uk>
 * @license   GPL-3.0
 * @copyright Barn2 Media Ltd
 */

namespace Barn2\Plugin\WC_Product_Table_Block;

use \Barn2\Plugin\WC_Product_Table as WPT;

/**
 * The compat class.
 */
class Compat {

	/**
	 * Class follows singleton pattern, this private variable stores the Plugin object
	 *
	 * @var $instance object
	 */
	private static $instance = null;

	public function __construct() {

		add_filter( 'wc_product_table_column_defaults', [ $this, 'compat_column_names' ], 10, 1 );

	}

	/**
	 * Initalizes an WC Product Table Compat plugin instance.
	 */
	public static function init() {

		$self = apply_filters( 'barn2_wc_product_table_block_compat', new Compat() );

		self::$instance = $self;

		return $self;

	}

	/**
	 * Adds backward compatibility for WPT 2.7 column labels and slugs
	 */
	public function compat_column_names( $columns ) {

		$old_columns = [];
		foreach( $columns as $key => $value ) {

			if ( $key === 'buy' ) {

				if ( version_compare( self::wcpt_version(), '2.8', '<' ) ) {

					$value[ 'heading' ] = __( 'Add to Cart', 'block-for-woo-product-table' );

					// why would anyone go back to an old version? i don't know, but that's
					// what this code is for
					$old_value = $value;
					$old_value[ 'compat' ] = true;
					$old_columns[ 'buy' ] = $old_value;

					// and this converts the new heading to the old one
					$key = 'add-to-cart';

				} else {

					$old_value = $value;
					$old_value[ 'compat' ] = true;
					$old_columns[ 'add-to-cart' ] = $old_value;

				}

			}

			$old_columns[ $key ] = $value;


		}

		return $old_columns;

	}

	/**
	 * Checks version number of WPT or returns null if inactive
	 */
	public static function wcpt_version() {

		return Plugin::is_wpt_safe() ? \Barn2\Plugin\WC_Product_Table\PLUGIN_VERSION : null;

	}

	/**
	 * Wrapper for updated namespace of WCPT_Settings
	 */
	public static function get_default_table_settings() {

		if ( version_compare( self::wcpt_version(), '2.8', '>=' ) ) {
			return WPT\Util\Settings::get_setting_table_defaults();
		} else {
			return \WCPT_Settings::get_setting_table_defaults();
		}

	}

	/**
	 * Wrapper for updated namespace of WC_Product_Table_Args
	 */
	public static function get_default_table_args() {

		if ( version_compare( self::wcpt_version(), '2.8', '>=' ) ) {
			return WPT\Table_Args::get_defaults();
		} else {
			return \WC_Product_Table_Args::get_defaults();
		}

		
	}

	/**
	 * Wrapper for updated namespace of WC_Product_Table_Args
	 */
	public static function get_default_table_columns() {

		if ( version_compare( self::wcpt_version(), '2.8', '>=' ) ) {
			return WPT\Table_Args::$default_args['columns'];
		} else {
			return \WC_Product_Table_Args::$default_args['columns'];
		}

	}

	/**
	 * Wrapper for updated function of backward compatible functions
	 */
	public static function get_legacy_shortcode_atts( $args ) {

		if ( version_compare( self::wcpt_version(), '2.8', '>=' ) ) {
			return WPT\Table_Args::back_compat_args( $args );
		} elseif ( version_compare( self::wcpt_version(), '2.6.2', '>=' ) ) {
			return WPT\Table_Shortcode::check_legacy_atts( $args );
		} else {
			return \WC_Product_Table_Shortcode::check_legacy_atts( $args );
		}

	}

}

add_action( 'barn2_wcptb_active', array( 'Barn2\Plugin\WC_Product_Table_Block\Compat', 'init' ) );