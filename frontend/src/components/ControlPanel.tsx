import React, {useState, useEffect, useRef,useMemo} from 'react';
import Utils from '../modules/Utils.js';
import * as constants from "../modules/Constants.js";
import { Button, ButtonGroup, Input, Radio, RadioGroup, Stack} from '@chakra-ui/react';
import {Patient} from '../types'


export default function ControlPanel(props: any){

    const container = useRef(null);
    const [tempData,setTempData] = useState<object>({})

    const smokingStatusNames = ['No/Former','Current'];
    const smokingStatusValues = [0,1];
    const dentalNames = ['No','Yes'];
    const dentalValues = [0,1];

    const getCI = (v: number[]) => v[0].toFixed(0) + ' (' + v[1].toFixed(0) + '-' + v[2].toFixed(0) + ') Months';
    const getCIPct = (v: number[]) => (100*(1-v[0])).toFixed(0) + '% (' + (100*(1-v[2])).toFixed(0) + '-' + (100*(1-v[1])).toFixed(0) + '%)';

    function updateInput(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined){
            let tempData2: object = Object.assign({},tempData);
            tempData2[e.target.name] = Number(value);
            setTempData(tempData2)
        }
    }

    function updateRadio(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined && value !== undefined){
            let tempData2: object = Object.assign({},tempData);
            tempData2[e.target.name] = Number(value);
            setTempData(tempData2)
        }
    }

    function updateData(){
        let newData: Patient = Object.assign({},props.data);
        let flag : boolean = false;
        for(let [key,value] of Object.entries(tempData)){
            if(value !== newData[key]){
                newData[key] = value;
                flag = true;
            }
        }
        if(flag){
            props.setData(newData);
        }
        setTempData({});
    }

    function makeInput(key: string): React.ReactElement{
        const value: number | undefined = props.data[key];
        if(value === undefined){ return <Button>{"no"}</Button>}
        let tempVal: number | undefined = tempData[key];
        let displayVal: number = tempVal === undefined? value: tempVal;
        return (
            <ButtonGroup key={key} style={{'display':'block','marginTop':'1em','width':'100%','maxWidth':'100%'}}>
                <div 
                    className={'toggleButtonLabel'}
                    key={'inputkey'+key}
                >
                    {props.getDisplayName(key)}
                </div>
                <Input 
                variant='outline' 
                size={'lg'} 
                placeholder={displayVal+""} 
                style={{'marginLeft':'0px','maxWidth':'6em','maxHeight':'1.75em'}}
                type='number'
                name={key}
                key={'input'+key}
                onChange={updateInput}
                />
            </ButtonGroup>
        )
    }

    function makeRadio(key: string, options: number[], optionNames: string[] | undefined){
        const value: number | undefined = props.data[key];
        if(value === undefined){ return <Button>{"no"}</Button>}
        let tempVal: number | undefined = tempData[key];
        let displayVal: number = tempVal === undefined? value: tempVal;

        const names: string[] = optionNames !== undefined? optionNames: options.map(d => d+'');
        const rOptions = options.map((d: number, i: number) => {
            const rName: string = names[i];
            return (<Radio value={d+''} key={key+i+'radiooption'}>{rName}</Radio>)
        });
        return (
        <div style={{'justifyContent':'center','textAlign':'center','alignItems':'center','marginTop':'.8em'}}>
        <div 
            className={'toggleButtonLabel'}
            style={{'justifyContent':'center','textAlign':'center','alignItems':'center','width':'100%','marginBottom':'0px'}}
            key={'radio2'+key}
        >
            {props.getDisplayName(key)}
        </div>
        <RadioGroup 
            name={key} 
            key={'radio'+key}
            style={{'display':'inline-flex','height':'2em','maxHeight':'2em!important','width':'100%','justifyContent':'center'}}
            value={displayVal+''} onClick={updateRadio}
            >
            <Stack direction={'row'}>
                {rOptions}
            </Stack>
        </RadioGroup>
        </div>
        )
    }   

    function updateTime(e: any){
        const value: number|string = e.target.value;
        if(Number(value) !== undefined){
            props.setSelectedTime(value);
        }
    }

    function makeSelectTimeThing(){
        return (
            <div>
                <ButtonGroup key={'selectTimeInput'} style={{'display':'block','marginTop':'1em','width':'100%','maxWidth':'100%'}}>
                    <div 
                        className={'toggleButtonLabel'}
                    >
                        {'ORN Risk At: '}
                    </div>
                    <Input 
                    variant='outline' 
                    size={'lg'} 
                    placeholder={props.selectedTime} 
                    style={{'margin':'0px','maxWidth':'2.5em','maxHeight':'1.75em','padding':'.2em'}}
                    type='number'
                    name={props.selectedTime}
                    onChange={updateTime}
                    />
                    <div 
                        className={'toggleButtonLabel'}
                    >
                        {'Months: ' + getCIPct(props.selectedTimeResult)}
                    </div>
                </ButtonGroup>
            </div>
        )
    }
    const [survivalTimes,medianSurvivalTimes]: [number[],number[]] = useMemo(()=>{
        if(props.results === undefined){return [[0,0,0],[0,0,0]]}
        const res = props.results.results.filter((d,i) => props.results.changedVars[i] == 'none')[0]
        return [[res.meanTime,res.meanTimeLower,res.meanTimeUpper], [res.medianTime,res.medianTimeLower,res.medianTimeUpper]];
    },[props.results])

    const defaultStyle = {'height':'95%','width':'95%'};
    const style = Object.assign(defaultStyle,props.style || {});
    return (
        <div
            style={style}
            ref={container}
        >
            <div style={{'width':'100%','display':'block'}}>
                <div className={'title'}>
                    {"Patient Features"}    
                </div>
                {makeInput('D30')}
                {makeRadio('var2',smokingStatusValues,smokingStatusNames)}
                {makeRadio('var3',dentalValues,dentalNames)}
                <Button key='submit' style={{'marginTop':'2em!important'}} colorScheme='blue' onClick={updateData}>
                    {'Submit'}
                </Button>
                <br></br>
                <hr style={{'marginBottom':'1em','marginTop':'1em'}}></hr>
                {makeSelectTimeThing()}
                <hr style={{'marginBottom':'1em','marginTop':'1em'}}></hr>
                <div>{'Mean Survival: ' + getCI(survivalTimes) }</div>
                <div>{'Median Survival: ' + getCI(medianSurvivalTimes) }</div>
                
            </div>
            
        </div>
    );
}