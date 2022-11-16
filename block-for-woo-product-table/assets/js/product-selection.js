( function ( wp, nonceObj, data ) {
	"use strict";

	const { __ } = wp.i18n;
	const { createElement } = wp.element;
	const { Button, Icon, TextControl, ToggleControl } = wp.components;
	const nonce = nonceObj ? nonceObj.nonce : null;

	const { withState } = wp.compose;

	const el = createElement;

	if ( ! window.productTableBlockComponents ) {
		window.productTableBlockComponents = {};
	}

	const filterSelectionOptions = {
		'category': { label: 'Category', andor: true, for: 'category', multiple: true, selectLabel: 'Add category' },
		'tag': { label: 'Tag', andor: true, for: 'tag', multiple: true, selectLabel: 'Add tag' },
		'cf': { label: 'Custom Field', andor: true, keypair: [ 'Key', 'Value' ], multiple: true, for: 'value' },
		'term': { label: 'Custom Taxonomy Term', keypair: [ 'Taxonomy', 'Term' ], multiple: true, for: 'value' },
		'attr': { attr: 'term', andor: true, label: 'Attribute', keypair: [ 'Attribute', 'Term' ], for: 'attr', multiple: true, selectLabel: 'Add global attribute' },
		'year': { label: 'Year', for: 'value' },
		'month': { label: 'Month', for: 'value' },
		'day': { label: 'Day', for: 'value' },
		'status': { label: 'Product Status', for: 'status', values: [ 'publish', 'draft', 'private', 'pending', 'future', 'any' ], multiple: true },
		'include': { label: 'Include Products', description: 'Product IDs', for: 'value', selectLabel: 'Add product' },
		'exclude': { label: 'Exclude Products', description: 'Product IDs', for: 'value', selectLabel: 'Exclude product' },
		'exclude_category': { andor: true, label: 'Exclude Category', for: 'category', multiple: true, selectLabel: 'Exclude category' },
		'user_products': { label: 'Previously Ordered Products', value: 'true', valueLabel: 'Enabled' },
		//'variations=separate': { label: 'Show Variations' },
	};

	const createProductSelectionFilters = ( { filters, onDelete } ) => {

		let filterNodes = [];

		for ( let i in filters ) {
			let prettyValue = filters[i].value.replace(/,/g, ', ').replace(/\+/g, ' + ');

			if ( filterSelectionOptions[ filters[i].key ].valueLabel ) {
				prettyValue = filterSelectionOptions[ filters[i].key ].valueLabel;
			}

			let node = el(
				'li',
				{
					'data-index': i,
					'data-key': filters[i].key,
					'data-value': filters[i].value,
					key: 'table-column-' + i
				},
				[
					/*el(
						Icon,
						{
							icon: barn2_reorderIcon,
							alt: ''
						}
					),*/
					el(
						'span',
						{},
						[
							el( 'strong', {}, filterSelectionOptions[ filters[i].key ].label + ': ' ),
							prettyValue
						]
					),
					el(
						Button,
						{
							icon: barn2_deleteIcon,
							label: 'Remove Selection',
							'data-index': i,
							onClick: (e) => {
								onDelete( e.currentTarget.dataset.index );
							}
						}
					)
				]
			);
			filterNodes.push( node );
		}

		return filterNodes;

	};

	const getFilterSelectionOptions = () => {

		let optionNodes = [];

		optionNodes.push( el(
			'option',
			{ value: '' },
			__( 'Select products', 'block-for-woo-product-table' )
		) );

		for ( let key in filterSelectionOptions ) {

			optionNodes.push( el(
				'option',
				{
					value: key,
					'data-for': filterSelectionOptions[key].for,
					'data-key': filterSelectionOptions[key].attr || key,
					'data-multiple': filterSelectionOptions[key].multiple,
					'data-andor': filterSelectionOptions[key].andor,
					'data-description': filterSelectionOptions[key].description,
					'data-value': filterSelectionOptions[key].value,
				},
				filterSelectionOptions[key].label
			) );

		}

		return optionNodes;

	};

	const getFilterSelectionOptionValues = ( values, label, recursive ) => {

		let optionNodes = [];

		optionNodes.push( el(
			'option',
			{ value: '' },
			__( label, 'block-for-woo-product-table' )
		) );

		for ( let key in values ) {

			if ( recursive && values[key].terms ) {

				for ( let subkey in values[key].terms ) {
					optionNodes.push( el(
						'option',
						{ value: key + ':' + subkey, 'data-key': key },
						values[key].terms[subkey]
					) );
				}

			} else {

				if ( isNaN( key ) ) {

					optionNodes.push( el(
						'option',
						{ value: key },
						values[key].label
					) );

				} else {

					optionNodes.push( el(
						'option',
						{ value: values[key] },
						values[key]
					) );

				}

			}

		}

		return optionNodes;

	};

	const resetPanel = ( panel ) => {

		panel.classList.remove( 'allow-multiple' );
		panel.classList.remove( 'allow-andor' );
		panel.classList.remove( 'has-multiple' );

		let disabled = panel.querySelectorAll( '*[disabled]' );
		for( let option of disabled ) {
			option.disabled = false;
		}

		let selectors = panel.querySelectorAll( 'select,input' );
		for( let obj of selectors ) {
			obj.value = '';
			obj.classList.remove( 'visible' );
			obj.classList.remove( 'selected' );
			obj.classList.remove( 'ready' );
		}


		panel.querySelector( 'ul' ).innerHTML = '';

	};

	const selectProductOption = ( e, panel ) => {

		let self = e.currentTarget;
		let value = self.value;
		let thisOption = self.querySelector( `option[value="${value}"]` );

		resetPanel( panel );

		self.value = value;

		let options = self.parentNode.querySelectorAll( '.barn2-wc-product-table-block__new-option' );
		for( let option of options ) {
			option.classList.remove( 'visible' );
			option.value = '';
			option.setAttribute( 'placeholder', '' );
		}

		if ( thisOption.dataset.for ) {
			let selector = self.parentNode.querySelector( '.barn2-wc-product-table-block__new-option.' + thisOption.dataset.for );
			selector.classList.add( 'visible' );

			if ( thisOption.dataset.multiple ) {
				panel.classList.add( 'allow-multiple' );

				let label = self.parentNode.querySelector( '.barn2-wc-product-table-block__new-filter-selection-label' );
				let button = self.parentNode.querySelector( '.barn2-wc-product-table-block__add-filter-button' );
				if ( label ) {
					label.innerHTML = thisOption.innerHTML + ' ' + __( 'Selections', 'block-for-woo-product-table' );
				}
				if ( button ) {
					button.innerHTML = __( 'Add', 'block-for-woo-product-table' );
					/*if ( filterSelectionOptions[ value ].selectLabel ) {
						button.innerHTML = filterSelectionOptions[ value ].selectLabel;
					}*/
				}
			}
			if ( thisOption.dataset.andor ) {
				panel.classList.add( 'allow-andor' );
			}

			if ( thisOption.dataset.description ) {
				selector.setAttribute( 'placeholder', thisOption.dataset.description );
			}
		} else {
			self.classList.add( 'selected' );
		}

	};

	const selectProductKey = ( e ) => {

		let self = e.currentTarget;

		if ( self.value === '' ) {
			self.classList.remove( 'selected' );
		} else {
			self.classList.add( 'selected' );
		}

	};

	const selectProductAttr = ( e, modal ) => {

		let self = e.currentTarget;

		let attrValues = modal.querySelector( 'select.attr-values' );

		if ( self.value === '' ) {
			self.classList.remove( 'ready' );
			attrValues.classList.remove( 'visible' );
		} else {
			self.classList.add( 'ready' );
			attrValues.classList.add( 'visible' );
		}

		attrValues.value = '';

		let attrOptions = attrValues.querySelectorAll( 'option' );
		for ( let option of attrOptions ) {
			if ( option.dataset.key === self.value ) {
				option.style.display = '';
			} else {
				option.style.display = 'none';
			}
		}


	};

	const selectProductAttrValue = ( e ) => {

		let self = e.currentTarget;

		if ( self.value === '' ) {
			self.classList.remove( 'selected' );
		} else {
			self.classList.add( 'selected' );
		}

	};

	const selectProductValue = ( e ) => {

		let self = e.currentTarget;

		if ( self.value === '' ) {
			self.classList.remove( 'selected' );
		} else {
			self.classList.add( 'selected' );
		}

	};

	const addFilterSelection = ( panel ) => {

		let key = panel.querySelector( '.barn2-wc-product-table-block__add-new-selection' ),
			value = panel.querySelector( '.barn2-wc-product-table-block__new-option.selected' );

		key.disabled = true;

		let list = panel.querySelector( 'ul' ),
			item = document.createElement( 'li' );

		item.innerHTML = '<span>' + value.value + '</span>';
		item.dataset.value = value.value;

		let removeButton = document.createElement( 'button' );
		removeButton.classList.add( 'components-button' );
		removeButton.classList.add( 'has-svg' );
		removeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M16.207,14.793l-1.414,1.414L12,13.414 l-2.793,2.793l-1.414-1.414L10.586,12L7.793,9.207l1.414-1.414L12,10.586l2.793-2.793l1.414,1.414L13.414,12L16.207,14.793z"/></svg>';
		removeButton.addEventListener( 'click', function (e) {
			item.remove();

			if ( list.children.length < 2 ) {
				panel.classList.remove( 'has-multiple' );
			}
		} );

		item.append( removeButton );

		list.append( item );


		if ( list.children.length > 1 ) {
			panel.classList.add( 'has-multiple' );
		}

		key.disabled = true;

		value.value = '';
		value.classList.remove( 'selected' );

		if ( value.tagName === 'SELECT' ) {

			let option = value.querySelector( `option[value="${value.value}"]` );
			if ( option ) {
				option.disabled = true;
			}

		}

	};

	const getNewFilter = ( panel, matchAll ) => {

		let key = panel.querySelector( '.barn2-wc-product-table-block__add-new-selection' ),
			values = panel.querySelectorAll( 'ul li' );

		let selectedOption = key.querySelector( `option[value="${key.value}"]` );

		let newFilterKey, newFilterValue;
		if ( values.length ) {

			newFilterKey = selectedOption.dataset.key;
			let joinChar = panel.classList.contains( 'allow-andor' ) && matchAll ? '+' : ',';
			let filters = [];
			for ( let li of values ) {
				filters.push( li.dataset.value );
			}

			newFilterValue = filters.join( joinChar );

		} else if ( ! panel.classList.contains( 'allow-multiple' ) ) {

			let value = panel.querySelector( '.barn2-wc-product-table-block__new-option.selected' );

			if ( selectedOption.dataset.value && selectedOption.dataset.value.length > 0 ) {

				newFilterKey = key.value;
				newFilterValue = selectedOption.dataset.value;

			} else {

				let value = panel.querySelector( '.barn2-wc-product-table-block__new-option.selected' );
				let split = key.value.split( '=' );
				newFilterKey = split[0];
				newFilterValue = split.length > 1 ? split[1] : '';
				if ( split.length === 1 ) {
					newFilterValue = value.value;
				}

			}

			//saveNewFilter( { key: newFilterKey, value: newFilterValue } );

		}

		return { key: newFilterKey, value: newFilterValue };

	};

	/*const getFiltersOrder = ( list ) => {

		let newColumnOrder = [];
		let columnsSelected = list.querySelectorAll( 'li' );

		for( let i = 0; i < columnsSelected.length; i += 1 ) {
			newColumnOrder.push( { key: columnsSelected[i].dataset.key, value: columnsSelected[i].dataset.value } );
		}

		return newColumnOrder;

	};*/

	window.productTableBlockComponents.ProductSelection = withState( {

		isMatchall: false,
		count: null

	} )( ( { isMatchall, count, attributes, saveFilters, setState } ) => {

		wp.apiFetch.use( wp.apiFetch.createNonceMiddleware( nonce ) );
		wp.apiFetch( {
			path: '/wc-product-table/v1/count',
			method: 'POST',
			data: { attrs: attributes }
		} ).then( res => {
			if ( count == null || res.count !== count ) {
				setState( { count: res.count } );
			}
		} );

		let { filters } = attributes;

		let filterSelectionsRef = wp.element.createRef();
		let newFilterPanelRef = wp.element.createRef();

		let addFilter = ( filter ) => {
			let newFilters = JSON.parse( JSON.stringify( filters ) );
			newFilters.push( filter );

			resetPanel( newFilterPanelRef.current );
			saveFilters( newFilters );
		};

		if ( count != null && count >= 100 ) {
			count = 'At least 100';
		}

		let	productElements = [
			el(
				'h3',
				{},
				[
					__( 'Products', 'block-for-woo-product-table' ),
					el(
						'em',
						{},
						count != null ? `${count} products found` : 'Finding products...'
					)
				]
			),
			el(
				'ul',
				{ className: 'barn2-wc-product-table-block__product-filters', ref: filterSelectionsRef },
				createProductSelectionFilters( {
					filters,
					onDelete: ( index ) => {
						let newFilters = removeArrayIndex( filters, index );
						saveFilters( newFilters );
					}
				} )
			),
			el( 'p', { className: 'empty-options' }, __( '(Using global options)', 'block-for-woo-product-table' ) ),
			el(
				'div',
				{
					className: 'barn2-wc-product-table-block__new-filter-panel',
					ref: newFilterPanelRef
				},
				[
					el(
						'select',
						{
							className: 'barn2-wc-product-table-block__add-new-selection',
							onChange: (e) => {
								selectProductOption( e, newFilterPanelRef.current );
							}
						},
						getFilterSelectionOptions()
					),
					el(
						'strong',
						{ className: 'barn2-wc-product-table-block__new-filter-selection-label' },
						''
					),
					el(
						'ul',
						{
							className: 'barn2-wc-product-table-block__new-filter-selections',
						}
					),
					el(
						ToggleControl,
						{
							className: 'barn2-wc-product-table-block__andor-toggle',
							label: __( 'Products must match all values', 'block-for-woo-product-table' ),
							checked: isMatchall,
							onChange: () => {
								setState( { isMatchall: ! isMatchall } );
							}
						}
					),
					el(
						'select',
						{ className: 'barn2-wc-product-table-block__new-option category', onChange: selectProductKey },
						getFilterSelectionOptionValues( data.categoryTerms, 'Select category' )
					),
					el(
						'select',
						{ className: 'barn2-wc-product-table-block__new-option status', onChange: selectProductKey },
						getFilterSelectionOptionValues( filterSelectionOptions.status.values, 'Select status' )
					),
					el(
						'select',
						{ className: 'barn2-wc-product-table-block__new-option tag', onChange: selectProductKey },
						getFilterSelectionOptionValues( data.tagTerms, 'Select tag' )
					),
					el(
						'select',
						{
							className: 'barn2-wc-product-table-block__new-option attr',
							onChange: ( e ) => {
								selectProductAttr( e, newFilterPanelRef.current );
							}
						},
						getFilterSelectionOptionValues( data.attributes, 'Select global attribute' )
					),
					el(
						'select',
						{ className: 'barn2-wc-product-table-block__new-option attr-values', onChange: selectProductAttrValue },
						getFilterSelectionOptionValues( data.attributes, 'Select attribute value', true )
					),
					el(
						'input',
						{ className: 'barn2-wc-product-table-block__new-option components-text-control__input value', onChange: selectProductValue }
					),
					el(
						Button,
						{
							className: 'is-secondary barn2-wc-product-table-block__add-filter-button',
							onClick: ( e ) => {
								addFilterSelection( newFilterPanelRef.current, addFilter );
							}
						},
						__( 'Select', 'block-for-woo-product-table' )
					),
					el( 'span', { className: 'spacer' }, '' ),
					el(
						Button,
						{
							className: 'is-primary barn2-wc-product-table-block__save-filter-button',
							onClick: (e) => {
								let newFilter = getNewFilter( newFilterPanelRef.current, isMatchall );
								addFilter( newFilter );
							}
						},
						__( 'Done', 'block-for-woo-product-table' )
					),
					el(
						Button,
						{
							className: 'is-secondary barn2-wc-product-table-block__reset-filter-button',
							onClick: (e) => {
								resetPanel( newFilterPanelRef.current );
							}
						},
						__( 'Cancel', 'block-for-woo-product-table' )
					)
				]
			)
		];

		/*waitForReference( filterSelectionsRef, ( ref ) => {
			if ( ! ref.classList.contains( 'ui-sortable' ) ) {
				let $sortRef = jQuery( ref );
				$sortRef.sortable( {
					update: function() {
						let newFilters = getFiltersOrder( ref );
						console.log( newFilters );
						$sortRef.sortable( 'cancel' );
						saveFilters( newFilters );
					}
				} );
			}
		} );*/

		return el(
			'div',
			{
				className: 'barn2-wc-product-table-block__products'
			},
			productElements
		);

	} );

} )(
	window.wp,
	typeof wcptbNonce !== 'undefined' ? wcptbNonce : null,
	typeof wcptbCatalog !== 'undefined' ? wcptbCatalog : null
);
