'use strict';

const model = {
  init () {
    this.content = {
      imageSrc: null,
      topText: null,
      topTextAlign: 'center',
      offsetTop: 50,
      bottomText: null,
      bottomTextAlign: 'center',
      offsetBottom: 25,
    };

    this.textAttributes = {
      font: 'Impact',
      shadow: {
        blur: 0,
        color: '#00000046'
      },
      opacity: 255,
      fontSize: '32pt',
      lineHeight: 40,
      strokeWidth: 3,
      strokeColor: '#000000',
      fillColor: '#ffffff',
    };

    this.colors = {
      theme: 'light'
    };
  },
}

const octopus = {
  init () {
    model.init();
    contentView.init();
    textAttrView.init();
    canvasView.init();
  },

  updateImage(e) {
    const file = e.target.files[0];
    
    const reader = new FileReader();
    reader.onload = function(fileObject) {
      const data = fileObject.target.result;
      
      // Create an image object
      const image = new Image();
      image.onload = function() {
        model.content.imageSrc = this;
        canvasView.redrawMeme();
      }    
      image.src = data;
      console.log(fileObject.target.result);
    };
    reader.readAsDataURL(file);
  },

  updateText(e) {
    const id = e.target.id;
    const text = e.target.value;
     if (id == "top-text-input") {
       model.content.topText = text;
     } else if (id == "bottom-text-input"){
       model.content.bottomText = text;
    }
    canvasView.redrawMeme();
  },

  updateAlignment(e) {
    const alignment = e.target.parentNode.getAttribute('for');
    const alignmentValue = e.target.value;
    console.log(alignmentValue);
    const content = model.content;
    switch (alignment){
      case 'alignment-top':
        content.topTextAlign = alignmentValue;
        break;
      case 'alignment-bottom':
        content.bottomTextAlign = alignmentValue;
        break;
    }
    canvasView.redrawMeme();
  },

  updateContentRanges (e) {
    const targetInput = e.target;
    const suffix = targetInput.dataset.sizing || '';
    const targetInputId = targetInput.id;
    const content = model.content;

    switch (targetInputId){
      case 'offset-top-input':
        content.offsetTop = targetInput.value;
        break;
      case 'offset-bottom-input': 
        content.offsetBottom = targetInput.value;
        break;
    }
    canvasView.redrawMeme();
  },

  updateTextRanges(e) {
    const targetInput = e.target;
    const suffix = targetInput.dataset.sizing || '';
    const targetInputId = targetInput.id;
    const textAttributes = model.textAttributes;
    
    switch(targetInputId){
      case 'shadow-input':
        textAttributes.shadow.blur = Math.floor(targetInput.value / 10) ;
        break;
      case 'opacity-input':
        textAttributes.opacity = targetInput.value;
        console.log(textAttributes.opacity);
        break;
      case 'font-size-input':
        textAttributes.fontSize = `${targetInput.value}pt`;
        break;
      case 'stroke-width-input':
        textAttributes.strokeWidth = targetInput.value / 10;
        break;
      case 'line-height-input': 
        textAttributes.lineHeight = targetInput.value;
        break;
    }

    console.log(targetInput.value, textAttributes);
    canvasView.redrawMeme();
  },

  updateTextColors(e) {
    const targetInput = e.target;
    const targetInputId =  targetInput.id;
    const textAttributes = model.textAttributes;

    switch (targetInputId){
      case 'fill-input':
        textAttributes.fillColor = targetInput.value;
        console.log(textAttributes.fillColor);
        break;
      case 'stroke-input':
        textAttributes.strokeColor = targetInput.value;
        console.log(textAttributes.strokeColor);
        break;
      }
      canvasView.redrawMeme();
  },

  updateTextFont (e) {
    model.textAttributes.font = e.target.value;
    console.log(model.textAttributes.font);
    canvasView.redrawMeme();
  },
  
  saveFile() {
    const url = document.querySelector('canvas').toDataURL();
    this.setAttribute('href', url);
    this.setAttribute('download', 'meme.png');
    console.log(this);
    // const iframe = `<iframe width='100%' height='100%' src='${url}'></iframe>`;
    // const x = window.open();
    // x.document.open();
    // x.document.write(iframe);
    // x.document.close();
  },

  decToHex(n) {
    let h = parseInt(n, 10);
    h = h.toString(16);

    if (h.length == 1)
      h = "0" + h;

    return h;
  },

  getData() {
    return{
      content: model.content,
      textAttributes: model.textAttributes
    }
  }
}

const contentView ={
  init () {
    this.fileInput = document.querySelector('#file-input');
    this.textInputs = document.querySelectorAll('.text-input');
    this.alignments = document.querySelectorAll('.alignment [type="radio"]');
    this.rangeInputs = document.querySelectorAll('.content .range-input');
    
    this.setUpEventListeners();
  },  

  setUpEventListeners () {

    this.textInputs.forEach(textInput => textInput.oninput = octopus.updateText);

    this.fileInput.onchange = octopus.updateImage;

    this.alignments.forEach(alignInput => alignInput.onchange = octopus.updateAlignment);
 
    this.rangeInputs.forEach(rangeInput => rangeInput.onchange = octopus.updateContentRanges);

    this.rangeInputs.forEach(rangeInput => rangeInput.onmousemove = octopus.updateContentRanges);
    
  },

}

const textAttrView = {
  init () {
    this.rangeInputs = document.querySelectorAll('.text-attributes .range-input');
    this.colorInputs = document.querySelectorAll('.text-attributes .color-input');
    this.fontInputs = document.querySelectorAll('.font-family [type="radio"]');

    this.render();
    this.setUpEventListeners();
  },  

  setUpEventListeners () {
  
    this.rangeInputs.forEach(rangeInput => rangeInput.onchange = octopus.updateTextRanges);
    
    this.rangeInputs.forEach(rangeInput => rangeInput.onmousemove = octopus.updateTextRanges);
    
    this.colorInputs.forEach(colorInput => colorInput.onchange = octopus.updateTextColors);
 
    this.fontInputs.forEach(fontInput => fontInput.onchange = octopus.updateTextFont);
  },

  render () {
    const data = octopus.getData();
    document.querySelector('#fill-input').value = data.textAttributes.fillColor;
    document.querySelector('#stroke-input').value = data.textAttributes.strokeColor;
  }

}

const canvasView = {

  init () {
    const [CANVAS_HEIGHT, CANVAS_WIDTH] = [500, 500];
    this.canvas = document.querySelector('#animation-canvas');
    this.saveButton = document.querySelector('#save-btn');
    [this.canvas.height, this.canvas.width] = [CANVAS_HEIGHT, CANVAS_WIDTH];
    this.setUpEventListeners();
  },

  setUpEventListeners () {
    this.saveButton.onclick = octopus.saveFile;
  },

  redrawMeme () {
    this.render(octopus.getData());
  },


  writeText (ctx, text, x, y, alignment, maxWidth, lineHeight) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
  
    for (let i = 0; i < words.length; i++){
      const testLine = i === 0 ? line + words[i] : line + ' ' + words[i];
      const testLineWidth = ctx.measureText(testLine).width;
      if(testLineWidth > maxWidth){
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
  
    ctx.textAlign = alignment;
    for(let j = 0; j < lines.length; j++){
      let offsetY = parseInt(y) + lineHeight * j;
      ctx.strokeText(lines[j], x, offsetY);
      ctx.fillText(lines[j], x, offsetY);
    }
  },
  
  getOffsetX (canvasWidth, alignment) { 
    let x = canvasWidth / 2;
    switch (alignment) {
      case 'start':
        x = 10;
        break;
      case 'center':
        x = canvasWidth / 2;
        break;
      case 'end': 
        x = canvasWidth - 10;
        break;
    }
    return x;
  },
  
  render (data) {
   
    const canvas = this.canvas;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0, canvas.width, canvas.height);

    const {content, textAttributes} = data;
    
    console.log(textAttributes);

    if (content.imageSrc != null){
      ctx.drawImage(content.imageSrc, 0, 0, canvas.width, canvas.height);
    }

    ctx.font = `${textAttributes.fontSize} ${textAttributes.font}`;
    
    ctx.shadowBlur = textAttributes.shadow.blur;
    ctx.shadowColor = textAttributes.shadow.color;
    console.log(ctx.shadowBlur, ctx.shadowColor);
    ctx.lineWidth = textAttributes.strokeWidth;
    ctx.strokeStyle = textAttributes.strokeColor + octopus.decToHex(textAttributes.opacity); 
    ctx.fillStyle = textAttributes.fillColor + octopus.decToHex(textAttributes.opacity);
    
    if (content.topText) {
      const alignment = content.topTextAlign;
      const x = this.getOffsetX(canvas.width, alignment);
      const y = content.offsetTop;
      console.log(y);
      this.writeText(ctx, content.topText, x, y, alignment, 500, textAttributes.lineHeight);
    }
    
    if (content.bottomText) {
      const alignment = ctx.textAlign = content.bottomTextAlign; 
      const x = this.getOffsetX(canvas.width, alignment);
      const y = canvas.height - content.offsetBottom;
      this.writeText(ctx, content.bottomText, x, y, alignment, 480, textAttributes.lineHeight);
    }
  }
}

octopus.init();
