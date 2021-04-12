import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader'; 
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileUploadExample extends LightningElement {
    @track isChartJsInitialized
    pChart 
    characters
    frequencies

    @api recordId;
    fileData
    palindromeOnlyPrint =''

    //logged
    palindromeONLY = []
    chInputArrPOnly = []
    
    //main
    lines
    
    
    //lines
    openfileUpload(event) {
        const file = event.target.files[0]
        console.log('event.target.files[0]'+file)
        console.log(file)
        
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result;// use this to get base64 when readAsDataURL: .split(',')[1]
            console.log(base64)
            this.lines = base64.split(/\n/);
            var arrayLength = this.lines.length;
            var chInputOnly = []
            var map = {}
            //Get Palindromes to palindromeONLY:
            for (var i = 0; i < arrayLength; i++) {
                
                let stripped = this.lines[i].replace(/[^\w]/g,'').toLowerCase()
                let reversed = stripped.split('').reverse().join('')
                if(stripped == reversed) { 
                    this.palindromeONLY.push(this.lines[i]); 
                    this.palindromeOnlyPrint = this.palindromeOnlyPrint + this.lines[i] + '\n' 
                    chInputOnly.push(...this.lines[i].replace(/[^\w]/g,'').toLowerCase().split(''))

                    this.lines[i].replace(/[^\w]/g,'').toLowerCase().split('').forEach(item => {
                        if(map[item]){
                            map[item]++;
                        }else{
                            map[item] = 1;
                        }
                    });
                }  
                
            }
            let arrlength = this.palindromeONLY.length
            console.log(arrlength)
            this.palindromeONLY.forEach( val => console.log(val) );
            console.log(map)

            //Build Chart Data from 'map'
            var charFreq = new Map(Object.entries(map));
            console.log(charFreq)
            var mapAsc = new Map([...charFreq.entries()].sort())
            //console.log(mapAsc)
            this.characters = Array.from( mapAsc.keys() );
            this.frequencies = Array.from( mapAsc.values()  );
            //console.log(this.characters, this.frequencies)

            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }
            console.log(this.fileData)
            console.log(this.isChartJsInitialized )

        }
        reader.readAsText(file)
    }
    
    
    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }

        Promise.all([
            loadScript(this, chartjs),
        ]).then(() => {
            
            const ctx = this.template.querySelector('canvas.linechart').getContext('2d');
            this.pchart = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.characters,
                    datasets: [
                    { 
                        label: 'Input File: Character Frequency',
                        data: this.frequencies
                    }
                    ]
                }
            });
            this.isChartJsInitialized = true;
        }).catch(error => {
            if(this.isChartJsInitialized == true ){ 
                this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error loading ChartJS',
                            message: error.message,
                            variant: 'error',
                        }),
                    );
            }
                
        });
    }

    
}
 