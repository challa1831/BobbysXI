/* ============================================
   Mascot loader — same bobby.png everywhere.
   Replaces the inline <svg class="bobby-mascot">
   on any page with an <img> referencing bobby.png.
   ============================================ */
(function(){
  function init() {
    const mascot = document.querySelector('svg.bobby-mascot, img.bobby-mascot');
    if (!mascot || mascot.tagName === 'IMG') return; // nothing to do if already an <img>
    const img = document.createElement('img');
    img.src = 'bobby.png';
    img.alt = 'Don Bobby';
    img.className = 'bobby-mascot';
    mascot.parentNode.replaceChild(img, mascot);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
