import * as constants from './Constants';
import * as d3 from 'd3';

export default class Utils {

    static nameDict = {
        test: 'fomratTest',
        'Aspiration rate Post-therapy': 'AS Post',
        'Aspiration rate Pre-therapy': 'AS Pre',
        'N-category': 'N-cat',
        'T-category': 'T-cat',
        'Pathological_grade':'Path.</br>Grade',
        'Pathological Grade':'Path. Grade',
        'Overall Survival (4 Years)': 'OS',
        'dlt1': 'Dose-Limiting Toxicities',
        'dlt2': 'Dose-Limiting Toxicities',
        'pd1': 'Primary Disease Response',
        'nd1': 'Nodal Disease Reponse',
        'pd2': 'Primary Disease Response',
        'nd2': 'Nodal Disease Response',
        'CR': "Complete",
        'PR': "Partial",
        'SD': "Stable",
        'PD': "Progressive",
        'gender':"Male",
        'White/Caucasion':'Caucasian',
        'African American/Black':'AA/Black',
        'Hispanic/Latino': 'Hispanic',
        'dose_fraction': 'Dose Frac.',
        'packs_per_year': 'Packs/Year',
        'time_to_event': 'OS + FDM + LRC + No Toxicity',
        'OS (Calculated)':'Overall Survival',
        'Locoregional control (Time)': 'Loco-Regional Control',
        'FDM (months)': 'Free From Distant Metastases',
    }


    static radToCartesian(angle,scale=1){
        angle = angle
        let x = Math.cos(angle)*scale;
        let y = Math.sin(angle)*scale;
        return [x,y];
    }

    
    static getVarDisplayName(varName){
        var name;
        if(varName in this.nameDict){
            name = this.nameDict[varName]
        } else{
            name = this.unPythonCase(varName);
        }
        return name;
    }

    static logit(arr){
        return arr.map(v => Math.log(v/(1-v)));
    }

    static std(array){
        const n = array.length
        const mean = array.reduce((a, b) => a + b) / n
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
    }

    static inBetween(val,min,max,lowerInclusive=false,upperInclusive=false){
       
        const upper = upperInclusive? val <= max: val < max;
        const lower = lowerInclusive? val >= min: val > min;
        return lower && upper;
    }

    static signedLog(x){
        if(Math.abs(x) < 1){
            return x
        }
        return Math.sign(x)*Math.log(Math.abs(x));
    }

    static sum(arr){
        let total = 0;
        for(var val of arr){
            total += val;
        }
        return total
    }

    static extents(arr){
        let maxVal = arr[0];
        let minVal = arr[0];
        for(const value of arr){
            maxVal = Math.max(maxVal, value);
            minVal = Math.min(minVal, value)
        }
        return {min: minVal, max: maxVal}
    }

    static midpoint(arr){
        let extents = this.extents(arr);
        return (extents.max + extents.min)/2
    }

    static mean(arr){
        let total = 0;
        for(var val of arr){
            total += val;
        }
        return total/arr.length
    }

    static nonshittySort(arr){
        //javascript uses string sort for arrays of floats
        return arr.sort((a,b) => Number(a) -Number(b))
    }

    static median(arr){
        let sortedArray = arr.slice();
        sortedArray = this.nonshittySort(sortedArray)
        if(sortedArray.length === 1){
            return sortedArray[0]
        }
        else if(sortedArray.length%2 !== 0){
            return sortedArray[parseInt(sortedArray.length/2)]
        } else{
            let lower = parseInt(sortedArray.length/2);
            return (sortedArray[lower] + sortedArray[lower+1])/2
        }
    }

    static mode(arr){
        var counts = {}
        var maxNum = arr[0];
        arr.forEach(e => {
            if(counts[e] === undefined){
                counts[e] = 0;
            } else{ 
                counts[e] += 1;
            }
            if(counts[e] > counts[maxNum]){
                maxNum = e;
            }
        });
        return maxNum;
    }

    static numberWithCommas(x){

        //from https://stackoverflow.com/a/2901298
        //should add commas to a number in thousands place?
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    static emptyObject(obj){
        //checks if something is == {}, bascially
        try{
            var flag = (obj.constructor === Object && Object.keys(obj).length === 0);
            return flag
        } catch{
            return false
        }
    }

    static validData(data){
        let empty = this.emptyObject(data);
        if(data === undefined | data === null | empty | data === '' | data === 0){
            return false;
        }
        return true;
    }

    static allValid(array){ 
        for(let obj of array){
            if(!this.validData(obj)){
                return false;
            }
        }
        return true;
    }

    static itemInArray(item, targetArray){
        for(let target of targetArray){
            if(item === target){
                return true
            }
        }
        return false
    }

    static allNotUndefined(arr){
        for(let a of arr){
            if(a === undefined | a === null){
                return false
            }
        }
        return true
    }

    static arrayUnions(...arrays){
        //should, in theory, join a list of arrays.  May not work
        var newArray = [];
        if(arrays.length === 1){
            return arrays[0];
        }
        for(var arr in arrays){
            newArray.concat( arr[1].filter(x => (!newArray.includes(x)) ));
        }
        return newArray
    }

    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    static capitalize(string){
        return string[0].toUpperCase() + string.slice(1,string.length);
    }
    
    static unCamelCase(string){
        //converts camelCase to Camel Case.  For like, showing names
        //taken from https://stackoverflow.com/a/6229124
        try{
            var newString = string.replace(/([a-z])([A-Z])/g, '$1 $2')  //insert spaces
                .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3') //space before last upper in a sequence fellowed by lower
                .replace(/^./, function(str){ return str.toUpperCase(); });  //uppercase first character
            return newString
        }catch{
            return ''
        }
    }

    static unSnakeCase(string){
        //should convert snake-case to Snake Case.  untested. based on unCamelCase
        try{
            var newString = string.toLowerCase()
                .replace(/([a-z])-([a-z])/g, '$1 $2') 
                .replace(/^./, function(str){ return str.toUpperCase(); });
            return newString;
        } catch{
            return '';
        }
    }

    static max(a,b){
        return (a >= b)? a:b;
    }

    static quantile(arr, q){
        const sorted = arr.sort((a, b) => a - b);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };

    static isTumor(organName){
        var gtvRegex = RegExp('GTV*');
        return gtvRegex.test(organName.toUpperCase());
    }
    static min(a,b){
        return (a <= b)? a:b;
    }

    static unPythonCase(string){
        //should convert snake_case to Snake Case.  untested. based on unCamelCase
        try{
            var newString = string.toLowerCase()
                .replace(/([a-z])_([a-z])/g, '$1 $2') 
                .replace(/^./, function(str){ return str.toUpperCase(); });
            return newString;
        } catch{
            return string;
        }
    }

    static formatPercent(string){
        return Utils.unCamelCase(string+'PerCapita')
    }

    static markifiedLabelLookup(index, markArray){
        //take an array from markify and maps an index to a value, for the slider
        var entry = markArray.filter(d => d.value === index);
        entry = entry[0].label;
        return entry
    }

    static wrapError(func, error_string){
        try{
            func();
        } catch(err){
            console.log(error_string);
            console.log(err);
        }
    }

    static arrayEqual(a1, a2){
        if(a1.length !== a2.length){
            return false
        }
        for(let idx in a1){
            if(a1[idx] !== a2){
                return false
            }
        }
        return true
    }

    static arrange(start, stop, nSteps){
        let stepSize = (stop - start)/(nSteps-1);
        let vals = [];
        let currVal = start;
        while(currVal < stop){
            vals.push(currVal);
            currVal += stepSize;
        }
        vals.push(stop)
        return vals
    }

    static moveTTip(tTip, tipX, tipY){
        var tipBBox = tTip.node().getBoundingClientRect();
        while(tipBBox.width + tipX > window.innerWidth){
            tipX = tipX - 10 ;
        }
        while(tipBBox.height + tipY > window.innerHeight){
            tipY = tipY - 10 ;
        }
        tTip
            .style('left', tipX + 'px')
            .style('top', tipY + 'px')
            .style('visibility', 'visible')
            .style('z-index', 1000);
    }

    static moveTTipEvent(tTip, event){
        var tipX = event.pageX + 30;
        var tipY = event.pageY -10;
        this.moveTTip(tTip,tipX,tipY);
    }

    
    static hideTTip(tTip){
        tTip.style('visibility', 'hidden')
    }

    static addTTipCanvas(tTip, className, width, height){
        tTip.selectAll('svg').selectAll('.'+className).remove();
        let canvas = tTip.append('svg').attr('class',className)
            .attr('height',height).attr('width',width)
            .style('background','white');
        return canvas
    }

    static notAllZero(array,thresholdPCT=0.01){
        if(array === undefined){
            return false
        }
        let nGood = 0;
        const threshold = (array.length)*thresholdPCT;
        for(let value of array){
            //the big value is because I have a bug in the preprocessing and it means it is also missing
            if(value > 1 & value < 10000000){
                nGood += 1;
                if(nGood > threshold){
                    return true
                }
            }
        }
        return false
    }

    static makeStateToggles(names,stateAttr,setStateAttr,displayNames=undefined){
        return names.map((n,i)=>{
            const active = n === stateAttr;
            const onClick = active? ()=>{}: ()=>setStateAttr(n);
            var className = 'toggleButton';
            if(active){
                className += ' toggleButtonActive';
            }
            let displayName =  this.getVarDisplayName(n);
            if(displayNames !== undefined){
                displayName = displayNames[i];
            }
            return <div key={displayName} className={className} onClick={onClick}>{displayName}</div>
        });
    }

}