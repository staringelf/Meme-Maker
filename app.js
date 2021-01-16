'use strict';

const model = {
  init () {
    this.content = {
      img: {
        src: null,
        filter: null,
      },
      
      topText: {
        text: null,
        align: 'center',
        offset: 50
      },
      
      bottomText: {
        text: null,
        align: 'center',
        offset: 25
      }
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
      theme: 'light',
    };

    this.switchFlow = 'fixed';
  },
}

const octopus = {
  init () {
    model.init();
    contentView.init();
    textAttrView.init();
    tabsView.init();
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
        model.content.img.src = this;
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
       model.content.topText.text = text;
     } else if (id == "bottom-text-input"){
       model.content.bottomText.text = text;
    }
    canvasView.redrawMeme();
  },

  updateAlignment(e) {
    const textType = e.target.closest('.form__block').dataset.for;
    const alignmentValue = e.target.value;
    console.log(alignmentValue);
    const content = model.content;
    switch (textType){
      case 'top-text':
        content.topText.align = alignmentValue;
        break;
      case 'bottom-text':
        content.bottomText.align = alignmentValue;
        break;
    }
    contentView.render();
    canvasView.redrawMeme();
  },

  updateContentRanges (e) {
    const targetInput = e.target;
    const suffix = targetInput.dataset.sizing || '';
    const targetInputId = targetInput.id;
    const content = model.content;

    switch (targetInputId){
      case 'offset-top-input':
        content.topText.offset = targetInput.value;
        break;
      case 'offset-bottom-input': 
        content.bottomText.offset = targetInput.value;
        break;
    }
    canvasView.redrawMeme();
    contentView.render();
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
    textAttrView.render();
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

  switchTab() {
    const [switches, tabs] = [tabsView.switches, tabsView.tabs];

    switches.forEach(switchBtn => switchBtn.classList.remove('btn--switch--active'));
    this.classList.add('btn--switch--active');

    const targetTabId = this.dataset.target;
    tabs.forEach(tab => {
      if(tab.id === targetTabId){
        tab.classList.remove('curtain');
      } else {
        tab.classList.add('curtain');
      }
    });
     model.switchFlow = document.body.getBoundingClientRect().height > window.innerHeight ? 'sticky' : 'fixed';

    tabsView.render();
  },

  fillRangeLower(rangeInput) {
    const percentage = 100*(rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min);
    const background = `linear-gradient(90deg, #100c08 ${percentage}%, #777 ${percentage+0.1}%)`;
    rangeInput.style.background = background;
    return rangeInput;
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
  },

  getSwitchFlow () {
    return model.switchFlow;
  }
}

const contentView ={
  init () {
    this.fileInput = document.querySelector('#file-input');
    this.textInputs = document.querySelectorAll('.form__text');
    this.alignments = document.querySelectorAll('.alignment');
    this.alignmentLabels = document.querySelectorAll('.form__block--radio label');
    this.rangeInputs = document.querySelectorAll('.form--content .form__range');
    
    this.setUpEventListeners();
    this.render();
  },  

  setUpEventListeners () {

    this.textInputs.forEach(textInput => textInput.oninput = octopus.updateText);

    this.fileInput.onchange = octopus.updateImage;

    this.alignments.forEach(alignInput => alignInput.onchange = octopus.updateAlignment);
 
    this.rangeInputs.forEach(rangeInput => rangeInput.onchange = octopus.updateContentRanges);

    this.rangeInputs.forEach(rangeInput => rangeInput.onmousemove = octopus.updateContentRanges);
    
    this.rangeInputs.forEach(rangeInput => rangeInput.ontouchmove = octopus.updateContentRanges);
    
  },

  render() {
    this.alignments.forEach((alignmentInput, index) => {
      alignmentInput.checked ? this.alignmentLabels[index].classList.add('darken') : this.alignmentLabels[index].classList.remove('darken'); 
    })

    this.rangeInputs.forEach(rangeInput => octopus.fillRangeLower(rangeInput));
  }

}

const textAttrView = {
  init () {
    this.rangeInputs = document.querySelectorAll('.form--text-attributes .form__range');
    this.colorInputs = document.querySelectorAll('.form--text-attributes .form__color');
    this.fontInputs = document.querySelectorAll('.form__font-family [type="radio"]');
    this.fontLabels = document.querySelectorAll('.form__font-family label');
    this.render();
    this.setUpEventListeners();
  },  

  setUpEventListeners () {
  
    this.rangeInputs.forEach(rangeInput => rangeInput.onchange = octopus.updateTextRanges);
    
    this.rangeInputs.forEach(rangeInput => rangeInput.onmousemove = octopus.updateTextRanges);

    this.rangeInputs.forEach(rangeInput => rangeInput.ontouchmove = octopus.updateTextRanges);
    
    this.colorInputs.forEach(colorInput => colorInput.onchange = octopus.updateTextColors);
 
    this.fontInputs.forEach(fontInput => fontInput.onchange = octopus.updateTextFont);

    this.fontLabels.forEach((fontLabel, index) => {
      fontLabel.style.fontFamily = this.fontInputs[index].value;
    });
  },

  render () {
    const data = octopus.getData();
    document.querySelector('#fill-input').value = data.textAttributes.fillColor;
    document.querySelector('#stroke-input').value = data.textAttributes.strokeColor;

   
    this.rangeInputs.forEach(rangeInput => octopus.fillRangeLower(rangeInput));
  }

}

const tabsView = {
  init () {
    this.switches = document.querySelectorAll('.btn--switch');
    
    this.tabs = document.querySelectorAll('.form');

    this.switchesContainer = document.querySelector('.switches');
    
    this.render();
    
    this.setUpEventListeners();
  },

  setUpEventListeners () {
    this.switches.forEach(switchBtn => switchBtn.onclick = octopus.switchTab);
  },

  render () {
    this.switchesContainer.style.position = model.switchFlow;
  } 

}

const canvasView = {

  init () {
    const CANVAS_WIDTH = screen.width < 550 ? screen.width : 550;
    const CANVAS_HEIGHT = CANVAS_WIDTH;
    this.saveButton = document.querySelector('#save-btn');
    this.canvas = this.createCanvas(CANVAS_HEIGHT, CANVAS_WIDTH);
    this.setUpEventListeners();
  },

  createCanvas(height, width) {
    const canvas = document.createElement('canvas');
    [canvas.height, canvas.width] = [height, width];
    canvas.id = 'animation-canvas';
    document.querySelector('.canvas_container').insertAdjacentElement('afterbegin', canvas);
    canvas.style.height = height + 'px';
    return canvas;
  },

  setUpEventListeners () {
    this.saveButton.onclick = octopus.saveFile;
  },

  redrawMeme () {
    this.render(octopus.getData());
  },


  writeText (ctx, text, x, y, alignment, maxWidth, lineHeight) {
    ctx.filter = 'none';
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
    
    const {topText, bottomText, img} = content;
    console.log(content, topText);

    if (img.src != null){
      ctx.drawImage(img.src, 0, 0, canvas.width, canvas.height);
    }

    ctx.font = `${textAttributes.fontSize} ${textAttributes.font}`;
    ctx.shadowBlur = textAttributes.shadow.blur;
    ctx.shadowColor = textAttributes.shadow.color;
    ctx.lineWidth = textAttributes.strokeWidth;
    ctx.strokeStyle = textAttributes.strokeColor + octopus.decToHex(textAttributes.opacity); 
    ctx.fillStyle = textAttributes.fillColor + octopus.decToHex(textAttributes.opacity);
    ctx.filter = img.filter;

    if (topText.text) {
      const alignment = topText.align;
      const x = this.getOffsetX(canvas.width, alignment);
      const y = topText.offset;
      console.log(y);
      this.writeText(ctx, topText.text, x, y, alignment, canvas.width - 10, textAttributes.lineHeight);
    }
    
    if (bottomText.text) {
      const alignment = ctx.textAlign = bottomText.align; 
      const x = this.getOffsetX(canvas.width, alignment);
      const y = canvas.height - bottomText.offset;
      this.writeText(ctx, bottomText.text, x, y, alignment, canvas.width - 10, textAttributes.lineHeight);
    }
  }
}

octopus.init();
