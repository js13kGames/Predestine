class Events {
  constructor() {
    this.listeners = {};
    this.lastKnownTouch = 0;

    //D.body.addEventListener('mousedown', this.mousedown.bind(this));
    //D.body.addEventListener('mouseup', this.mouseup.bind(this));
    //D.body.addEventListener('mousemove', this.mousemove.bind(this));
    //this.listeners['mousedown'] = [];
    //this.listeners['mouseup'] = [];
    //this.listeners['mousemove'] = [];

    if ($.input.isTouch) {
      this.registerTouch();
    } else {
      this.registerMouse();
    }
  }

  mousedown(ev) {
    if (this.listeners['mousedown'].length > 0) {
      for (let cb of this.listeners['mousedown']) {
        cb(ev);
      }
    }
  }

  mouseup(ev) {
    if (this.listeners['mouseup'].length > 0) {
      for (let cb of this.listeners['mouseup']) {
        cb(ev);
      }
    }
  }

  mousemove(ev) {
    if (this.listeners['mousemove'].length > 0) {
      for (let cb of this.listeners['mousemove']) {
        cb(ev);
      }
    }
  }

  touchstart(ev) {
    let e = ev.touches[0];
    this.lastKnownTouch = e;
    $.input.updateMousePos(e);
    ev.stopPropagation();
    this.mousedown(new MouseEvent('mousedown', e));
    //D.body.dispatchEvent(new MouseEvent('mousedown', e));
    return false;
  }

  touchmove(ev) {
    let e = ev.touches[0];
    this.lastKnownTouch = e;
    $.input.updateMousePos(e);
    ev.stopPropagation();
    this.mousemove(new MouseEvent('mousemove', e))
    //D.body.dispatchEvent(new MouseEvent('mousemove', e));
    return false;
  }

  touchend(ev) {
    let e = ev.touches[0];
    ev.stopPropagation();
    this.mouseup(new MouseEvent('mouseup', this.lastKnownTouch));
    //D.body.dispatchEvent(new MouseEvent('mouseup', this.lastKnownTouch));
    return false;
  }

  clear() {
    for (let evt in this.listeners) {
      //if (this.systemEvents.indexOf(evt) >= 0) continue;
      this.listeners[evt] = [];
    }
  }

  register(evt) {
    if (!this.listeners[evt]) {
      //if (evt.preventDefault) evt.preventDefault();
      this.listeners[evt] = [];
      D.body.addEventListener(evt, this.onCustom.bind(this, evt));
    }
  }

  registerTouch() {
    this.listeners['mousedown'] = [];
    this.listeners['mouseup'] = [];
    this.listeners['mousemove'] = [];
    D.body.addEventListener('touchstart', this.touchstart.bind(this), true);
    D.body.addEventListener('touchend', this.touchend.bind(this), true);
    D.body.addEventListener('touchmove', this.touchmove.bind(this), true);
    W.addEventListener('scroll', (ev) =>{
      ev.stopPropagation();
      return false;
    }, true);
    D.ontouchmove = function(e){ e.preventDefault(); }
  }

  registerMouse() {
    this.register('mousedown');
    this.register('mouseup');
    this.register('mousemove');
  }

  listen(evt, cb) {
    this.listeners[evt].push(cb);
  }

  emit(evt, data) {
    let ev = new CustomEvent(evt, {detail: data});
    D.body.dispatchEvent(ev);
  }

  onCustom(evt, data) {
    let callbacks = this.listeners[evt];
    if (callbacks) {
      for (let cb of callbacks) {
        cb(data);
      }
    }
  }
}
