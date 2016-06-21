// Transforms an array of values to an RGB value.
function arrayToRGB( array ) {
    return "rgb(" + array[0] + ", " + array[1] + ", " + array[2] + ")";
}

// Transforms an array of values to an RGBA value.
function arrayToRGBA( array, alpha ) {
    return "rgba(" + array[0] + ", " + array[1] + ", " + array[2] + ", " + alpha + ")";
}

// Transforms an RGB value into an array.
function rgbToArray( rgb ) {
    return rgb.replace( /[^\d,]/g, '' ).split( ',' );
}

// Process a color in order to calculate the luminance.
function processColor( val ) {
	// Convert to sRGB
	val /= 255;
	return ( val <= 0.03928 ) ? val / 12.92 : Math.pow( ( ( val + 0.055 ) / 1.055 ), 2.4 );
}

// Calculate a color luminance.
function calculateLuminance( color ) {
	return ( processColor( color[0] ) * 0.2126 ) + ( processColor( color[1] ) * 0.7152 ) + ( processColor( color[2] ) * 0.0722 );
}

// Calculate the contrast ratio between two colors.
function calculateRatio( color1, color2 ) {
    var l1 = calculateLuminance( color1 ),
        l2 = calculateLuminance( color2 );

    return Math.round( ( ( l1 + 0.05 ) / ( l2 + 0.05 ) ) * 100 ) / 100;
}


function processImages() {
    var targetImages = $( ".gallery-item img" ),
        colorThief = new ColorThief(),
        ratios = [],
        colors = [],
        domColor, colorPalette, textColor, contrastRatio;

    targetImages.each( function( index ) {
        var $this = $( this ),
            mainOverlay = $this.siblings( ".main-overlay" ),
            secondaryOverlay = $this.siblings( ".secondary-overlay" );

        // Grab the dominant color and apply it to the corresponding element
        domColor = colorThief.getColor( targetImages[index] );

        secondaryOverlay.children( ".dominant-color" ).css( "background-color", arrayToRGB( domColor ) );

        // Get the color palette and parse through it to create the proper DOM elements.
        colorPalette = colorThief.getPalette( targetImages[index], 6 );

        // Get the text color.
        textColor = mainOverlay.find( ".overlay-content h1" ).css( "color" );

        $.each( colorPalette, function( index ) {
            $( "<li />" ).appendTo( secondaryOverlay.children( ".color-palette" ) ).css( "background-color", arrayToRGB( $( this ) ) );

            // Since we're here, also create two arrays with the colors and the ratios.
            contrastRatio = calculateRatio( rgbToArray( textColor ), $( this ) );

            ratios[index] = ( contrastRatio >= 7 ) ? contrastRatio : 10000;
            colors[index] = $( this );
        } );

        // 1. Calculate the contrast ratio based on the text color and the dominant color.
        contrastRatio = calculateRatio( rgbToArray( textColor ), domColor );

        // 2. If the ratio is above 7 then use that color, otherwise use the color with the next highest ratio above 7.
        domColor = ( contrastRatio >= 7 ) ? domColor : colors[ratios.indexOf( Math.min.apply( Math, ratios ) )];
        mainOverlay.css( "background-color", arrayToRGBA( domColor, .9 ) );
    } );

}

// On document ready.
$( function() {
    // processImages();
    $( 'body' ).imagesLoaded().done( function( instance ) {
        processImages();
    });

    // Mouse events.
    $( ".gallery-item" ).mouseenter( function() {
        $( this ).children( ".main-overlay" ).animate( { "left": "0" }, 500, function() {
            $( this ).siblings( ".secondary-overlay" ).animate( { "left": "65%" }, 500 );
        } );
    } ).mouseleave( function() {
        $( this ).children( ".main-overlay" ).animate( { "left": "-65%" }, 500, function() {
            $( this ).siblings( ".secondary-overlay" ).animate( { "left": "100%" }, 500 );
        } );
    } )
} );
