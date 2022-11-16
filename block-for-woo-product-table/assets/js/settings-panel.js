( function ( wp, nonce, data ) {
	"use strict";

	const { __ } = wp.i18n;
	const { createElement } = wp.element;
	const { Button, SelectControl, TextControl, TextareaControl, PanelBody } = wp.components;

	const { withState } = wp.compose;

	const el = createElement;

	if ( ! window.productTableBlockComponents ) {
		window.productTableBlockComponents = {};
	}

	window.productTableBlockComponents.SettingsPanel = withState( {

		modalOpened: false

	} )( ( { modalOpened, onChange, attributes, setState } ) => {

		let tableSettingsModalRef = wp.element.createRef();

		let settings = {};
		for ( let setting of attributes.settings ) {
			settings[setting.key] = setting.value;
		}

		let changeSetting = ( key, value ) => {
			settings[key] = value;
			let newSettings = [];
			for ( let key in settings ) {
				newSettings.push( { key, value: settings[key] } );
			}
			onChange( newSettings );
		};

		return [
			el(
				PanelBody,
				{ title: __( 'Add to Cart Column Settings', 'block-for-woo-product-table' ) },
				[
					el(
						SelectControl,
						{
							label: __( 'Add to Cart Button', 'block-for-woo-product-table' ),
							value: settings.cart_button,
							options: [
								{ value: '', label: __( '(Use global option)', 'block-for-woo-product-table' ) },
								{ value: 'button', label: __( 'Button', 'block-for-woo-product-table' ) },
								{ value: 'checkbox', label: __( 'Checkbox', 'block-for-woo-product-table' ) },
								{ value: 'button_checkbox', label: __( 'Button and Checkbox', 'block-for-woo-product-table' ) },
							],
							onChange: ( value ) => {
								changeSetting( 'cart_button', value );
							},
							help: [
								__( "How 'Add to Cart' buttons are displayed in the table. ", 'block-for-woo-product-table' ),
								el(
									'a',
									{ href: 'https://barn2.co.uk/kb/add-to-cart-buttons', target: '_blank' },
									__( 'Read More', 'block-for-woo-product-table' )
								)
							]
						}
					),
					el(
						SelectControl,
						{
							label: __( 'Quantities', 'block-for-woo-product-table' ),
							value: ( settings.show_quantity || settings.quantities ),
							options: [
								{ value: '', label: __( '(Use global option)', 'block-for-woo-product-table' ) },
								{ value: 'true', label: __( 'Show in add to cart column', 'block-for-woo-product-table' ) },
								{ value: 'false', label: __( 'Do not show quantity selectors', 'block-for-woo-product-table' ) },
							],
							onChange: ( value ) => {
								if ( wcptVersion.version === '< 2.8' ) {
									changeSetting( 'show_quantity', value );
								} else {
									changeSetting( 'quantities', value );
									changeSetting( 'show_quantity', '' );
								}
							}
						}
					),
					el(
						SelectControl,
						{
							label: __( 'Variations', 'block-for-woo-product-table' ),
							value: settings.variations,
							options: [
								{ value: '', label: __( '(Use global option)', 'block-for-woo-product-table' ) },
								{ value: 'false', label: __( 'Link to product page', 'block-for-woo-product-table' ) },
								{ value: 'dropdown', label: __( 'Dropdowns in add to cart column', 'block-for-woo-product-table' ) },
								{ value: 'separate', label: __( 'Separate rows in table', 'block-for-woo-product-table' ) },
							],
							onChange: ( value ) => {
								changeSetting( 'variations', value );
							},
							help: [
								__( 'How to display options for variable products. ', 'block-for-woo-product-table' ),
								el(
									'a',
									{ href: 'https://barn2.co.uk/kb/product-variations', target: '_blank' },
									__( 'Read More', 'block-for-woo-product-table' )
								)
							]
						}
					)
				]
			),
			el(
				PanelBody,
				{ title: __( 'Table Controls', 'block-for-woo-product-table' ) },
				[
					el(
						SelectControl,
						{
							label: __( 'Product Filters', 'block-for-woo-product-table' ),
							value: settings.filters,
							options: [
								{ value: '', label: __( '(Use global option)', 'block-for-woo-product-table' ) },
								{ value: 'false', label: __( 'Disabled', 'block-for-woo-product-table' ) },
								{ value: 'true', label: __( 'Show based on columns in table', 'block-for-woo-product-table' ) },
								{ value: 'custom', label: __( 'Custom', 'block-for-woo-product-table' ) },
							],
							onChange: ( value ) => {
								if ( value !== 'custom' ) {
									changeSetting( 'customFilters', '' );
								}
								changeSetting( 'filters', value );
							},
							help: [
								__( 'Dropdown lists to filter the table by category, tag, attribute, or custom taxonomy. ', 'block-for-woo-product-table' ),
								el(
									'a',
									{ href: 'https://barn2.co.uk/kb/wpt-filters/#filter-dropdowns', target: '_blank' },
									__( 'Read More', 'block-for-woo-product-table' )
								)
							]
						}
					),
					el(
						'div',
						{
							className: 'barn2-wc-product-table-block__custom-filter-option',
							'aria-hidden': settings.filters && settings.filters === 'custom' ? 'false' : 'true'
						},
						[
							el(
								TextControl,
								{
									label: __( 'Custom Product Filters', 'block-for-woo-product-table' ),
									value: settings.customFilters,
									onChange: ( value ) => {
										changeSetting( 'customFilters', value );
									}
								}
							)
						]
					),
				]
			),
			el(
				PanelBody,
				{ title: __( 'Additional Options', 'block-for-woo-product-table' ), initialOpen: false },
				[
					el(
						'p',
						{},
						[
							__( 'You can configure additional options globally on the  ', 'block-for-woo-product-table' ),
							el(
								'a',
								{ href: '/wp-admin/admin.php?page=wc-settings&tab=products&section=product-table', target: '_blank' },
								__( 'WooCommerce Product Table settings page', 'block-for-woo-product-table' )
							),
							__( ', or by adding them below with one option per line (e.g. sort_by="name"). ', 'block-for-woo-product-table' ),
							el(
								'a',
								{ href: 'https://barn2.co.uk/kb/product-table-options/', target: '_blank' },
								__( 'See full list of options.', 'block-for-woo-product-table' )
							)
						]
					),
					el(
						TextareaControl,
						{
							label: __( 'Additional Shortcode Attributes', 'block-for-woo-product-table' ),
							value: settings.additional,
							onChange: ( value ) => {
								changeSetting( 'additional', value );
							}
						}
					)
				]
			)
		];

	} );

} )( window.wp );
