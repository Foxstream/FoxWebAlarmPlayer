$('#accordion').on('shown.bs.collapse', function(event){
    var scroll = event.target.parentElement.offsetTop;
    console.log(scroll);
    //$('#accordion').scrollTop(scroll);
    $('#accordion').animate({
        scrollTop: scroll
    }, 500);
})