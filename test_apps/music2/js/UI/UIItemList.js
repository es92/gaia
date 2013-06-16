var UIItemList = function(div){
  this.dom = {};
  this.dom.list = div;
  div.classList.add('itemList');
}

UIItemList.prototype = {
  empty: function(){
    Utils.empty(this.dom.list);
  },
  append: function(item){
    var div = item.createDiv();
    this.dom.list.appendChild(div);
  },
  remove: function(item){
    this.dom.list.removeChild(item.dom.div);
  }
}
