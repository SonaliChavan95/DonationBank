let basePath = location.origin;
$.getScript(`${basePath}/public/js/location.js`);
$.getScript(`${basePath}/public/js/auth.js`);
$.getScript(`${basePath}/public/js/home.js`);
$.getScript(`${basePath}/public/js/users.js`);
$.getScript(`${basePath}/public/js/order.js`);

// autoclose the alert message
window.setTimeout(function () {
  $('.alert').fadeTo(550, 0, function () {
    $(this).remove();
  });
}, 3000);

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('#sidebar').mCustomScrollbar({
    theme: 'minimal',
  });

  $('.images-carousel').slick({
    infinite: true,
    autoplay: true,
    dots: true,
    autoplaySpeed: 1500,
  });

  $('.images-carousel-listing').slick({
    infinite: true,
    dots: true,
  });

  $('#sidebarCollapse').on('click', function () {
    $('#sidebar, #content').toggleClass('active');
    $('.collapse.in').toggleClass('in');
    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
  });
});
