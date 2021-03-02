AFRAME.registerComponent('thumbstick-goto',{
    init: function () {
      this.el.addEventListener('thumbstickdown', this.gotoEntity);
    },
    gotoEntity: function (evt) {
      console.log(this.el.intersectedEls);
      console.log(evt);
    }
  });