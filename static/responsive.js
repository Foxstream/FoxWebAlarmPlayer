/**
  * This file handles every JS difference between mobile and
  * desktop versions
  */

var breakpoint = 992;
var viewportWidth = document.documentElement.clientWidth;
var mobile = (viewportWidth < breakpoint);

/**
  * Sets all necesssary event handlers for the desktop version
  */ 
var applyDesktop = function(){

}

var applyMobile = function(){

}



$(function(){
    if (mobile){
        applyMobile();
    } else {
        applyDesktop();
    }

    // Apply changes on window resize
    window.onresize = function(event){
        viewportWidth = document.documentElement.clientWidth;
        if (mobile){
            if (viewportWidth >= breakpoint){
                // location.reload();
            }
        }
        else {
            if (viewportWidth < breakpoint){
                // location.reload();
            }
        }
    }

})