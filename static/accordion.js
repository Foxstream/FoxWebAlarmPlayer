$('#accordion').on('shown.bs.collapse', function(event){
    var scroll = event.target.parentElement.offsetTop;
    $('#accordion').animate({
        scrollTop: scroll
    }, 500);
})