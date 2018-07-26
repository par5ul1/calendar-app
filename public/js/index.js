var currentPage = 0;
const pages = ["welcome","p0","p1","p2","p3","p4","p5","p6","p7","p8"]

function scrollDiv(a, b, direction) {
  if (direction == 'next') {
    $(a).css('left', '-200%');
    $(b).css('left', '50%');
    currentPage++;
  } else {
    $(b).css('left', '200%');
    $(a).css('left', '50%');
    currentPage--;
  }
  $('.progress').css('width', (currentPage)*100 / 9 + 1 + 'vw');
}

$(document).ready(function () {
  $('input').keydown(function(e) {
    if (e.which == 13 || e.which == 9 || e.which == 37 || e.which == 39) return false;
  });
  $(document).keydown(function(e) {
    if (e.which == 37 && currentPage > 0) {
      scrollDiv('#'+pages[currentPage-1], '#'+pages[currentPage], 'back');
    }
    if (e.which == 39 && currentPage < 9) {
      scrollDiv('#'+pages[currentPage], '#'+pages[currentPage+1], 'next');
    }
  });
})
