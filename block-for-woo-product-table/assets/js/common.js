const { createElement } = wp.element;

const barn2_deleteIcon = createElement(
	'svg',
	{
		xmlns: "http://www.w3.org/2000/svg",
		width: 16,
		height: 16,
		viewBox: "0 0 24 24"
	},
	createElement( 'path',
		{
			d: "M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M16.207,14.793l-1.414,1.414L12,13.414 l-2.793,2.793l-1.414-1.414L10.586,12L7.793,9.207l1.414-1.414L12,10.586l2.793-2.793l1.414,1.414L13.414,12L16.207,14.793z"
		}
	)
);

const barn2_reorderIcon = createElement(
	'svg',
	{
		xmlns: "http://www.w3.org/2000/svg",
		width: 20,
		height: 24,
		viewBox: "0 0 20 24"
	},
	createElement( 'circle', { cx: '5.5', cy: '4.5', r: '2.5' } ),
	createElement( 'circle', { cx: '5.5', cy: '11.5', r: '2.5' } ),
	createElement( 'circle', { cx: '14.5', cy: '11.5', r: '2.5' } ),
	createElement( 'circle', { cx: '5.5', cy: '18.5', r: '2.5' } ),
	createElement( 'circle', { cx: '14.5', cy: '18.5', r: '2.5' } ),
	createElement( 'circle', { cx: '14.5', cy: '4.5', r: '2.5' } )
);

const barn2_editIcon = createElement(
	'svg',
	{
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "0 0 24 24"
	},
	createElement( 'path', { d: 'M0 0h24v24H0V0z', fill: 'none' } ),
	createElement( 'path', { d: 'M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 000-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z' } )
);

const waitForReference = ( ref, ready ) => {
	"use strict";
	
	if ( ref.current ) {
		ready( ref.current );
	} else {
		window.setTimeout( waitForReference, 100, ref, ready );
	}

};

const removeArrayIndex = ( array, index ) => {
	"use strict";

	let newArray = [];

	for ( var i in array ) {
		if ( i !== index ) {
			newArray.push( array[i] );
		}
	}

	return newArray;

};
