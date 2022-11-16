<?php
/**
 * Initializes the Block and applies render filters (if necessary)
 *
 * @package   Barn2/woocommerce-product-table/block
 * @author    Barn2 Plugins <info@barn2.co.uk>
 * @license   GPL-3.0
 * @copyright Barn2 Media Ltd
 */

namespace Barn2\Plugin\WC_Product_Table_Block;

use Barn2\Plugin\WC_Product_Table\Util\Columns_Util;

/**
 * The block class.
 */
class Block {

	/**
	 * Class follows singleton pattern, this private variable stores the Plugin object
	 *
	 * @var $instance object
	 */
	private static $instance = null;

	/**
	 * Default labels for column slugs
	 *
	 * @var $instance array
	 */
	private static $column_defaults = null;

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

		$self = apply_filters( 'barn2_wcptb_block_instance', new Block() );

		self::$instance = $self;

		add_action( 'init', array( $self, 'install' ), 20 );

		do_action( 'barn2_wcptb_block_init', $self );

		return $self;

	}

	/**
	 * Registers block with Block store and registers appropriate editor styles and scripts
	 */
	public function install() {

		wp_register_style(
			'barn2-wc-product-table-block',
			Plugin::$assets_uri . 'css/editor.min.css',
			array(),
			Plugin::$assets_version
		);

		wp_register_script(
			'barn2-wc-product-table-columns-common',
			Plugin::$assets_uri . 'js/common.min.js',
			array( 'jquery-ui-sortable', 'wp-element', 'wp-i18n', 'wp-components', 'wp-compose' ),
			Plugin::$assets_version,
			true
		);

		wp_register_script(
			'barn2-wc-product-table-columns',
			Plugin::$assets_uri . 'js/table-columns.min.js',
			array( 'barn2-wc-product-table-columns-common', 'jquery-ui-sortable', 'wp-element', 'wp-i18n', 'wp-components', 'wp-compose' ),
			Plugin::$assets_version,
			true
		);

		wp_register_script(
			'barn2-wc-product-table-query',
			Plugin::$assets_uri . 'js/product-selection.min.js',
			array( 'barn2-wc-product-table-columns-common', 'jquery-ui-sortable', 'wp-element', 'wp-i18n', 'wp-components', 'wp-compose', 'wp-api-fetch' ),
			Plugin::$assets_version,
			true
		);

		wp_register_script(
			'barn2-wc-product-table-settings',
			Plugin::$assets_uri . 'js/settings-panel.min.js',
			array( 'barn2-wc-product-table-columns-common', 'wp-element', 'wp-i18n', 'wp-components', 'wp-compose' ),
			Plugin::$assets_version,
			true
		);

		wp_register_script(
			'barn2-wc-product-table-block',
			Plugin::$assets_uri . 'js/editor.min.js',
			array( 'barn2-wc-product-table-columns-common', 'barn2-wc-product-table-columns', 'barn2-wc-product-table-query', 'barn2-wc-product-table-settings', 'wc-blocks', 'wp-blocks', 'wp-editor', 'wp-components', 'wp-element', 'wp-i18n' ),
			Plugin::$assets_version,
			true
		);

		if ( ! Plugin::is_wpt_safe() ) {

			wp_localize_script(
				'barn2-wc-product-table-block',
				'wcptbInvalid',
				[
					// translators: %s is the plugin name
					'message' => __( 'Warning! This block is an add-on for the %s plugin, which is not currently installed. Please sign up for a free trial and install the plugin before continuing.', 'block-for-woo-product-table' ),
					'link_text' => __( 'WooCommerce Product Table', 'block-for-woo-product-table' ),
					'link' => 'https://barn2.co.uk/wordpress-plugins/woocommerce-product-table/?utm_source=plugin&utm_medium=wptblock&utm_campaign=wptaddblock&utm_content=wptblockdashboard'
				]
			);

		} elseif ( ! Plugin::is_woocommerce_safe() ) {

			wp_localize_script(
				'barn2-wc-product-table-block',
				'wcptbInvalid',
				[
					'no_woo' => true,
					'message' => __( 'Warning! This block requires WooCommerce to function.', 'block-for-woo-product-table' ),
					'link_text' => __( 'WooCommerce Product Table', 'block-for-woo-product-table' ),
					'link' => 'https://barn2.co.uk/wordpress-plugins/woocommerce-product-table/?utm_source=plugin&utm_medium=wptblock&utm_campaign=wptaddblock&utm_content=wptblockdashboard'
				]
			);

		} else {

			$defaults = Compat::get_default_table_settings();
			if ( empty( $defaults['columns'] ) ) {
				$defaults['columns'] = Compat::get_default_table_columns();
			}
			if ( ! empty( $defaults['columns'] ) ) {
				$defaults['columns'] = explode( ',', $defaults['columns'] );
				foreach ( $defaults['columns'] as &$column ) {
					$column = trim( $column );
				}
			}

			wp_localize_script(
				'barn2-wc-product-table-columns',
				'wcptbSettings',
				[
					'columnLabels'  => self::column_defaults(),
					'defaultValues' => $defaults,
				]
			);

			wp_localize_script(
				'barn2-wc-product-table-query',
				'wcptbNonce',
				[
					'nonce' => wp_create_nonce( 'wp_rest' ),
				]
			);

			wp_localize_script(
				'barn2-wc-product-table-query',
				'wcptbCatalog',
				[
					'categoryTerms' => self::get_product_category_terms(),
					'tagTerms'      => self::get_tag_terms(),
					'attributes'    => self::get_product_attributes(),
				]
			);

		}

		wp_localize_script(
			'barn2-wc-product-table-block',
			'wcptbPreviewImage',
			[
				'src' => plugins_url( 'assets/images/block-preview.jpg', __DIR__ ),
			]
		);

		wp_localize_script(
			'barn2-wc-product-table-block',
			'wcptVersion',
			[
				'version' => version_compare( Compat::wcpt_version(), '2.8', '<' ) ? '< 2.8' : '>= 2.8',
			]
		);

		register_block_type(
			'barn2/wc-product-table',
			[
				'editor_style'  => 'barn2-wc-product-table-block',
				'editor_script' => 'barn2-wc-product-table-block',
			]
		);

	}

	/**
	 * Get the default column headings and responsive priorities.
	 * (Copied from Barn2/woocommerce-product-table:class-wc-product-table-columns.php)
	 *
	 * @return array The column defaults
	 */
	private static function column_defaults() {

		if ( ! self::$column_defaults ) {

			/**
			 * Filtered by Compat::compat_column_names for WPT versions earlier than 2.8
			 */
			self::$column_defaults = Columns_Util::column_defaults();

			self::$column_defaults['att']  = array(
				'heading'  => __( 'Product Attribute', 'block-for-woo-product-table' ),
				'values'   => wc_get_attribute_taxonomies(),
				'priority' => 17,
			);
			self::$column_defaults['cf']  = array( 'heading' => __( 'Custom Field Value', 'block-for-woo-product-table' ), 'placeholder' => __( 'Enter a customer meta key', 'block-for-woo-product-table' ), 'priority' => 17 );
			self::$column_defaults['tax'] = array( 'heading' => __( 'Custom Taxonomy', 'block-for-woo-product-table' ), 'placeholder' => __( 'Enter a taxonomy name', 'block-for-woo-product-table' ), 'priority' => 17  );

			uasort(
				self::$column_defaults,
				function( $a, $b ) {
					return $a['priority'] > $b['priority'] ? 1 : -1;
				}
			);
		}

		return self::$column_defaults;
	}

	/**
	 * Get product categories which are used for creating product selection queries
	 *
	 * @return array A list of product categories
	 */
	private static function get_product_category_terms() {

		$product_categories = get_terms( 'product_cat', [ 'hide_empty' => false ] );

		$return = [];
		foreach ( $product_categories as $cat ) {
			$return[ $cat->slug ] = [ 'label' => $cat->name ];
		}

		return $return;
	}

	/**
	 * Get product tags which are used for creating product selection queries
	 *
	 * @return array A list of product categories
	 */
	private static function get_tag_terms() {

		$tags = get_terms( 'product_tag', [ 'hide_empty' => false ] );

		$return = [];
		foreach ( $tags as $tag ) {
			$return[ $tag->slug ] = [ 'label' => $tag->name ];
		}

		return $return;

	}

	/**
	 * Get product tags which are used for creating product selection queries
	 *
	 * @return array A list of product categories
	 */
	private static function get_product_attributes() {

		$taxonomies = wc_get_attribute_taxonomies();

		$return = [];

		foreach ( $taxonomies as $tax ) {
			$terms = get_terms( 'pa_' . $tax->attribute_name, [ 'hide_empty' => false ] );
			$return[ 'pa_' . $tax->attribute_name ] = [
				'label' => $tax->attribute_label,
				'terms' => [],
			];
			foreach ( $terms as $term ) {
				$return[ 'pa_' . $tax->attribute_name ][ 'terms' ][ $term->slug ] = $term->name;
			}
		}

		$return['product_visibility'] = [
			'label' => 'Visibility',
			'terms' => [
				'featured'   => 'Featured',
				'outofstock' => 'Out of Stock',
			],
		];

		return $return;
	}
}

add_action( 'barn2_wcptb_installed', array( 'Barn2\Plugin\WC_Product_Table_Block\Block', 'init' ) );
