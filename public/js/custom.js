$(document).on('click', function () {
    $('.collapse').collapse('hide');
})

$(document).ready(function () {
    $('#myCarousel').carousel({
        interval: 5000 //changes the speed
    })

    $("#myCarousel").swiperight(function () {
        $(this).carousel('prev');
    });
    $("#myCarousel").swipeleft(function () {
		      $(this).carousel('next');
    });
});