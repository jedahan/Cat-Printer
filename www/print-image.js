///<reference path="main.js" />
///<reference path="main.d.ts" />

class ImagePrinter {
    WIDTH = 384;
    threshold = 0.6;
    bluetoothMACInput = document.getElementById('bt_mac');
    thresholdInput = document.getElementById('filter_threshold');
    fileSelection = document.getElementById('file_selection');
    dummyImage = new Image();
    canvasPreview = document.getElementById('image_preview');
    previewButton = document.getElementById('preview_button');
    printButton = document.getElementById('print_button');
    preview() {
        let reader = new FileReader();
        reader.onload = event1 => {
            this.dummyImage.src = event1.target.result;
            let height = this.WIDTH / this.dummyImage.width * this.dummyImage.height;
            this.canvasPreview.width = this.WIDTH;
            this.canvasPreview.height = height;
            let context = this.canvasPreview.getContext('2d');
            context.drawImage(this.dummyImage, 0, 0, this.WIDTH, height);
            let data = context.getImageData(0, 0, this.WIDTH, height);
            context.putImageData(this.monoMethod(data, this.threshold), 0, 0);
        }
        reader.readAsDataURL(this.fileSelection.files[0]);
    }
    constructor() {
        this.monoMethod = imageDataColorToMonoSquare;
        this.fileSelection.addEventListener('input', this.preview.bind(this));
        this.previewButton.addEventListener('click', this.preview.bind(this));
        this.thresholdInput.onchange = event => {
            this.threshold = this.thresholdInput.value;
        }
        this.printButton.addEventListener('click', event => {
            // this.preview();
            if (this.canvasPreview.height == 0) {
                notice(i18N.get('Please preview image first'));
                return;
            }
            let mac_address = this.bluetoothMACInput.value;
            if (mac_address == '') {
                notice(i18N.get('Please select a device'));
                return;
            }
            notice(i18N.get('Printing, please wait.'));
            let context = this.canvasPreview.getContext('2d');
            let pbm_data = imageDataMonoToPBM(context.getImageData(0, 0, this.WIDTH, this.canvasPreview.height));
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/~print?address=' + mac_address);
            xhr.setRequestHeader('Content-Type', 'application-octet-stream');
            xhr.onload = () => {
                notice(i18N.get(xhr.responseText));
            }
            xhr.send(pbm_data);
        });
    }
}

var image_printer = new ImagePrinter();
