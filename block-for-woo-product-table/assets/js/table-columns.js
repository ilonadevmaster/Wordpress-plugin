( function ( wp, settings ) {
	"use strict";

	const { __ } = wp.i18n;
	const { createElement } = wp.element;
	const { Button, Icon, TextControl } = wp.components;

	const el = createElement;

	if ( ! window.productTableBlockComponents ) {
		window.productTableBlockComponents = {};
	}

	const getTableColumnOrder = ( container ) => {

		let newColumnOrder = [];
		let columnsSelected = container.querySelectorAll( 'li' );

		for( let i = 0; i < columnsSelected.length; i += 1 ) {
			newColumnOrder.push( columnsSelected[i].dataset.slug );
		}

		return newColumnOrder;
	};

	const getTableColumnOptions = () => {

		let options = [
			el(
				'option',
				{ value: '', key: 0 },
				__( 'Add column', 'block-for-woo-product-table' )
			)
		];
		for ( var slug in settings.columnLabels ) {
			if ( ! settings.columnLabels[slug].compat ) {
				options.push( el(
					'option',
					{ value: slug, key: slug },
					settings.columnLabels[slug].heading
				) );
			}
		}

		return options;

	};

	const getTableColumnAttributeOptions = () => {

		let options = [
			el(
				'option',
				{ value: '', key: 0 },
				__( 'Select global attribute', 'block-for-woo-product-table' )
			)
		];

		for ( let index in settings.columnLabels.att.values ) {
			let attr = settings.columnLabels.att.values[index];
			options.push( el(
				'option',
				{ value: attr.attribute_name, key: attr.attribute_id },
				attr.attribute_label
			) );
		}

		return options;

	};

	const addTableColumn = ( { selection, attr, custom, columns } ) => {

		if ( selection.value === 'att' ) {
			columns.push( selection.value + ':' + attr.value.replace(/^att\:/, '').trim() );
		} else if ( selection.value === 'tax' || selection.value === 'cf' ) {
			columns.push( selection.value + ':' + custom.value.replace(/^(tax|cf)\:/, '').trim() );
		} else {
			columns.push( selection.value );
		}

		attr.value = '';
		attr.classList.remove( 'selected' );

		custom.value = '';
		custom.classList.remove( 'selected' );

		selection.value = '';
		selection.classList.remove( 'selected' );
		selection.classList.remove( 'select-attribute' );
		selection.classList.remove( 'select-custom' );

		return columns;

	};


	const selectTableColumn = ( e ) => {

		e.currentTarget.classList.remove( 'selected' );
		e.currentTarget.classList.remove( 'select-attribute' );
		e.currentTarget.classList.remove( 'select-custom' );

		if ( e.currentTarget.value === 'att' ) {
			e.currentTarget.classList.add( 'select-attribute' );
		} else if ( e.currentTarget.value === 'cf' || e.currentTarget.value === 'tax' ) {
			e.currentTarget.classList.add( 'select-custom' );
		} else {
			e.currentTarget.classList.add( 'selected' );
		}

	};

	const selectTableColumnEntry = ( e ) => {

		if ( e.currentTarget.value === '' ) {
			e.currentTarget.classList.remove( 'selected' );
		} else {
			e.currentTarget.classList.add( 'selected' );
		}

	};


	const createTableColumns = ( { columnRef, columns, onChange } ) => {

		let columnNodes = [];

		for ( let i in columns ) {

			let labelSplit = columns[i].split(':');
			let label = [];
			let labelValue = '';

			let labelFree = '';

			if ( [ 'att', 'cf', 'tax' ].indexOf( labelSplit[0] ) === -1 && labelSplit.length > 1 ) {

				label.push( el( 'strong', {}, labelSplit[1] ) );
				label.push( ' (' + settings.columnLabels[ labelSplit[0] ].heading + ')' );

				labelValue = labelSplit[1];
				labelFree = labelSplit[0];

			} else if ( [ 'att', 'cf', 'tax' ].indexOf( labelSplit[0] ) > -1 && labelSplit.length > 2 ) {

				label.push( el( 'strong', {}, labelSplit[2] ) );
				label.push( ' (' + settings.columnLabels[ labelSplit[0] ].heading + ')' );

				labelValue = labelSplit[2];
				labelFree = labelSplit[0] + ':' + labelSplit[1];

			} else {

				label.push( el( 'strong', {}, settings.columnLabels[ labelSplit[0] ].heading ) );
				labelFree = labelSplit[0];

				if ( labelSplit.length === 2 ) {
					labelFree += ':' + labelSplit[1];
				}

			}

			if ( [ 'att', 'cf', 'tax' ].indexOf( labelSplit[0] ) > -1 && labelSplit.length > 1 ) {
				label.push(
					el( 'em', {}, labelSplit[1] )
				);
			}

			let editButtonRef = wp.element.createRef();
			let editInputRef = wp.element.createRef();

			let node = el(
				'li',
				{
					'data-slug': columns[i],
					key: 'table-column-' + i
				},
				[
					el(
						Icon,
						{
							icon: barn2_reorderIcon,
							alt: ''
						}
					),
					el(
						Button,
						{
							className: 'barn2-wc-product-table-block__edit-label-button',
							icon: barn2_editIcon,
							alt: 'Edit Column Name',
							title: 'Edit Column Name',
							'aria-expanded': 'false',
							ref: editButtonRef,
							onClick: (e) => {
								if ( e.currentTarget.getAttribute( 'aria-expanded' ) === 'true' ) {
									e.currentTarget.setAttribute( 'aria-expanded', 'false' );
								} else {
									e.currentTarget.setAttribute( 'aria-expanded', 'true' );
								}
							}
						}
					),
					el(
						'input',
						{
							className: 'barn2-wc-product-table-block__edit-label-input components-text-control__input',
							placeholder: 'Edit Column Header',
							defaultValue: labelValue,
							ref: editInputRef,
							/*onChange: ( e ) => {
								console.log( e.currentTarget );
							}*/
						}
					),
					el(
						Button,
						{
							className: 'barn2-wc-product-table-block__save-label-button is-primary',
							'data-index': i,
							'data-original': labelFree,
							onClick: (e) => {
								editButtonRef.current.setAttribute( 'aria-expanded', 'false' );

								let newLabelValue = editInputRef.current.value;

								let newColumns = JSON.parse( JSON.stringify( columns ) );
								newColumns[ e.currentTarget.dataset.index ] = e.currentTarget.dataset.original;
								if ( newLabelValue.length > 0 ) {
									newColumns[ e.currentTarget.dataset.index ] += ':' + newLabelValue;
								}

								onChange( { newColumns } );
							}
						},
						__( 'Done', 'block-for-woo-product-table' )
					),
					el( 'span', { className: 'barn2-wc-product-table-block__column-label' }, label ),
					el(
						Button,
						{
							className: 'barn2-wc-product-table-block__delete-column',
							icon: barn2_deleteIcon,
							label: 'Remove Column',
							'data-index': i,
							onClick: (e) => {
								onChange( { newColumns: removeArrayIndex( columns, e.currentTarget.dataset.index ) } );
							}
						}
					)
				]
			);
			columnNodes.push( node );
		}

		waitForReference( columnRef, ( ref ) => {
			if ( ! ref.classList.contains( 'ui-sortable' ) ) {
				let $sortRef = jQuery( ref );
				$sortRef.sortable( {
					update: function() {
						let newColumns = getTableColumnOrder( ref );
						$sortRef.sortable( 'cancel' );
						onChange( { newColumns } );
					}
				} );
			}
		} );

		return el(
			'ul',
			{
				className: 'barn2-wc-product-table-block__columns-selected',
				ref: columnRef,
				'data-columns': columns.join( ',' )
			},
			columnNodes
		);

	};

	/*window.productTableBlockComponents.ProductTableColumns = withState( {

		columnsHaveChanged: false,
		modalOpened: false,
		newColumns: null,

	} )( ( { columnsHaveChanged, modalOpened, newColumns, columns, onChange, setState } ) => {*/

	window.productTableBlockComponents.ProductTableColumns = ( { columns, saveColumns } ) => {

		//let tableHeaderColumns = [], firstRun = false, sortable;
		let componentClassName = 'barn2-wc-product-table-block__columns';

		let	columnElements = [
			el( 'h3', {}, __( 'Table Columns', 'block-for-woo-product-table' ) )
		];

		let columnRef = wp.element.createRef();

		columnElements.push( createTableColumns( {
			columnRef,
			columns: columns,
			onChange: ( { newColumns } ) => {
				saveColumns( newColumns );
			}
		} ) );

		columnElements.push( el( 'p', { className: 'empty-options' }, __( '(Using global options)', 'block-for-woo-product-table' ) ) );

		let selectionRef = wp.element.createRef();
		let attrRef = wp.element.createRef();
		let customRef = wp.element.createRef();

		columnElements.push( el(
			'select',
			{
				className: 'barn2-wc-product-table-block__column-selector',
				onChange: selectTableColumn,
				ref: selectionRef,
			},
			getTableColumnOptions()
		) );

		columnElements.push( el(
			'select',
			{
				className: 'barn2-wc-product-table-block__attribute-selector',
				onChange: selectTableColumnEntry,
				ref: attrRef
			},
			getTableColumnAttributeOptions()
		) );

		columnElements.push( el(
			'input',
			{
				className: 'barn2-wc-product-table-block__custom-input',
				onChange: selectTableColumnEntry,
				ref: customRef
			}
		) );

		columnElements.push( el(
			Button,
			{
				className: 'components-button is-secondary barn2-wc-product-table-block__add-column-button',
				onClick: (e) => {
					let newColumns = getTableColumnOrder( columnRef.current );
					newColumns = addTableColumn( {
						selection: selectionRef.current,
						attr: attrRef.current,
						custom: customRef.current,
						columns: newColumns
					} );
					saveColumns( newColumns );
				},
			},
			__( 'Add', 'block-for-woo-product-table' )
		) );

		return el(
			'div',
			{
				className: componentClassName
			},
			columnElements
		);

	};

} )( window.wp, typeof wcptbSettings !== 'undefined' ? wcptbSettings : null );
