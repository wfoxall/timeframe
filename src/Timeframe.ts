type StandardFramerate = "23.976" | "24" | "25" | "29.97DF" | "29.97NDF" | "30" | "48" | "50" | "59.94DF" | "59.94NDF";
type FractionalFramerate = {numer:number;denom:number;drop:boolean}
type FramerateLike = StandardFramerate | FractionalFramerate | number;
type TimecodeElements = {hh:number;mm:number;ss:number;ff:number}

function timecodeToFrames(timecode: TimecodeElements, framerate: Framerate){

    const {hh,mm,ss,ff} = timecode;
    const {Baserate,Drop} = framerate;

    let frames = 0;
    if(!Number.isInteger(hh) || !Number.isInteger(mm) || !Number.isInteger(ss) || !Number.isInteger(ff)){
        throw "Invalid timecode entered";
    }
    if(mm>59 || ss > 59 || ff >= Baserate){
        throw "Invalid timecode entered";
    }
    frames += hh*60*60*Baserate;
    frames += mm*60*Baserate;
    frames += ss*Baserate;
    frames += ff;
    if(Drop && (Baserate == 30 || Baserate && 60)){
        if((mm%10 != 0) && ss == 0 && (ff == 0 || ff == 1)){
            throw `Invalid timecode "${hh}:${mm}:${ss}:${ff}" entered. Entered frame number should be dropped in this drop-frame framerate`;
        }
        let drops = 0;
        drops += hh * 18 * 6;
        let nondropmins = Math.floor(mm/10); // Every 10th minute doesn't drop
        drops += mm * 2 - nondropmins * 2;

        frames -= (Baserate == 60) ? 2 * drops : drops;
    }
    return frames;
}

function framesToTimecode(framecount: number, framerate: Framerate): TimecodeElements {

    const {Baserate,Drop} = framerate;

    //let framesBucket = framecount;
    if(Drop){
        // The tricky stuff of compensating for drop-frame.
        // Adapted from Ichthyo's answer on Stack Overflow:
        // https://stackoverflow.com/a/6080116

        const droprate = (Baserate == 30) ? 2 : 4;
        const framesInMin = Baserate * 60 - droprate;
        const framesIn10Min = Baserate * 60 * 10 - (9 * droprate);
        const discrepancy = 60 * Baserate - framesInMin;

        // Number of complete blocks of 10mins that have elapsed for framecount.
        let num10mins = Math.trunc(framecount / framesIn10Min);
        // The remaining frames in the 'last' 10min block.
        let remFrames = framecount % framesIn10Min;
        // The number of complete minutes in the 'last' 10min block.
        let remainingMins = Math.trunc((remFrames - discrepancy) / framesInMin);
        // Calculate the number of dropped frames for the given timecode in drop-frame vs non-drop.
        // For each complete 10min block there are 9 instances. And one more for each 'remaining minute'.
        // Multiply by the droprate (2 for 29.97 and 4 for 59.94)
        let drops = (9 * num10mins + remainingMins) * droprate;
        // Finally update the framecount and proceed to calculate as if non-drop.
        framecount += drops;
    }

    let hh = Math.floor(framecount/(Baserate * 60 * 60));
    framecount -= hh * (Baserate * 60 * 60);
    let mm = Math.floor(framecount/(Baserate * 60));
    framecount -= mm * (Baserate * 60);
    let ss = Math.floor(framecount / Baserate);
    framecount -= ss * (Baserate);
    let ff = framecount;

    return {hh,mm,ss,ff};
}

function padTwoDigits(num:number): string{
    return (num<10) ? `0${num.toPrecision(1)}` : num.toPrecision(2);
}

export class Timecode {
    private frames: number;
    private framerate: Framerate;

    constructor(string: string, framerate: Framerate | FramerateLike);
    constructor(frames: number, framerate: Framerate | FramerateLike);
    constructor(arg: any, framerate: Framerate | FramerateLike){
        if(typeof framerate === "object" && 'Baserate' in framerate && 'FPS' in framerate && 'Drop' in framerate){
            this.framerate = framerate;
        }else{
            this.framerate = new Framerate(framerate);
        }
        let frames: number;
        if(typeof arg === "string"){
            const tcRegex = /([0-9]{1,2})[;:]([0-9]{1,2})[;:]([0-9]{1,2})[;:]([0-9]{1,2})/;
            const matchResults = tcRegex.exec(arg);
            if(!matchResults || matchResults.length < 5) throw new TimecodeError("Invalid timecode string provided.");
            let [,hh,mm,ss,ff] = matchResults.map(el=>Number.parseInt(el));
            // Check elements of timecode are valid
            if(mm >= 60) throw new TimecodeError("Invalid timecode string provided.");
            if(ss >= 60) throw new TimecodeError("Invalid timecode string provided.");
            if(ff >= this.framerate.Baserate) throw new TimecodeError("Invalid timecode string provided.");
            this.frames = timecodeToFrames({hh,mm,ss,ff},this.framerate)
        }else{
            this.frames = arg;
        }
    }

    toString(): string {
        // const {drop} = parseFramerate(this.framerate);
        const sep = (this.framerate.Drop) ? ";" : ":";
        const {hh,mm,ss,ff} = framesToTimecode(this.frames,this.framerate);
        return [hh,mm,ss,ff].map(n=>padTwoDigits(n)).join(sep);
    }

    get Frames() {return this.frames;}
    set Frames(frames: number) {
        if(Number.isInteger(frames) && frames > 0){
            this.frames = frames;
        }else{
            throw new TimecodeError("Cannot set frames to non-integer or negative value.")
        }
    }

    addTimecode(tc: Timecode): Timecode{
        const result = Timecode.add(this,tc);
        this.frames = result.frames;
        return this;
    }
    subtractTimecode(tc: Timecode): Timecode{
        const result = Timecode.subtract(this,tc);
        this.frames = result.frames;
        return this;
    }

    static add(TC1:Timecode,TC2:Timecode): Timecode {
        if(TC1.framerate.Baserate !== TC2.framerate.Baserate || TC1.framerate.Drop !== TC2.framerate.Drop)
            throw new TimecodeError(`Cannot add timecodes with different framerates. ${TC1.framerate.toString()} != ${TC1.framerate.toString()}`)
        return new Timecode(TC1.frames + TC2.frames,TC1.framerate);
    }
    static subtract(TC1:Timecode,TC2:Timecode): Timecode {
        if(TC1.framerate.Baserate !== TC2.framerate.Baserate || TC1.framerate.Drop !== TC2.framerate.Drop)
            throw new TimecodeError(`Cannot add timecodes with different framerates. ${TC1.framerate.toString()} != ${TC1.framerate.toString()}`)
        return new Timecode((TC1.frames - TC2.frames) < 0 ? 0 : TC1.frames - TC2.frames,TC1.framerate);
    }

}

export class Framerate {
    private baserate: number = 0;
    private fps: number = 0;
    private drop: boolean = false;

    constructor(framerate: FramerateLike){
        switch (typeof framerate) {
            case "string":
                this.loadFromStandard(framerate);
                break;
            case "object":
                this.loadFromFractional(framerate);
                break;
            case "number":
                this.loadFromNumber(framerate);
                break;
            default:
                throw new TimecodeError("Supplied framerate was in an unsupported format.");
        }
    }
    private loadFromStandard(framerate: StandardFramerate){
        switch (framerate) {
            case "23.976":
                [this.baserate,this.fps,this.drop] = [24,23.976,false]
                break;
            case "24":
                [this.baserate,this.fps,this.drop] = [24,24,false]
                break;
            case "25":
                [this.baserate,this.fps,this.drop] = [25,25,false]
                break;
            case "29.97DF":
                [this.baserate,this.fps,this.drop] = [30,29.97,true]
                break;
            case "29.97NDF":
                [this.baserate,this.fps,this.drop] = [30,29.97,false]
                break;
            case "30":
                [this.baserate,this.fps,this.drop] = [30,30,false]
                break;
            case "48":
                [this.baserate,this.fps,this.drop] = [48,48,false]
                break;
            case "50":
                [this.baserate,this.fps,this.drop] = [50,50,false]
                break;
            case "59.94DF":
                [this.baserate,this.fps,this.drop] = [60,59.94,true]
                break;
            case "59.94NDF":
                [this.baserate,this.fps,this.drop] = [60,59.94,false]
                break;
            default:
                throw new TimecodeError("Supplied framerate was in an unsupported format.");
        }
    }
    private loadFromFractional(framerate: FractionalFramerate){
        switch ((framerate.numer/framerate.denom).toFixed(3)) {
            case "23.976":
                [this.baserate,this.fps,this.drop] = [24,23.976,false]
                break;
            case "24.000":
                [this.baserate,this.fps,this.drop] = [24,24,false]
                break;
            case "25.000":
                [this.baserate,this.fps,this.drop] = [25,25,false]
                break;
            case "29.970":
                [this.baserate,this.fps,this.drop] = [30,29.97,(framerate.drop)?true:false]
                break;
            case "30.000":
                [this.baserate,this.fps,this.drop] = [30,30,false]
                break;
            case "48.000":
                [this.baserate,this.fps,this.drop] = [48,48,false]
                break;
            case "50.000":
                [this.baserate,this.fps,this.drop] = [50,50,false]
                break;
            case "59.940":
                [this.baserate,this.fps,this.drop] = [60,59.94,(framerate.drop)?true:false]
                break;
            default:
                [this.baserate,this.fps,this.drop] = [Math.round(framerate.numer/framerate.denom),(framerate.numer/framerate.denom),false];
                break;
        }
    }
    private loadFromNumber(framerate: number){
        switch ((framerate).toFixed(3)) {
            case "23.976":
                [this.baserate,this.fps,this.drop] = [24,23.976,false]
                break;
            case "24.000":
                [this.baserate,this.fps,this.drop] = [24,24,false]
                break;
            case "25.000":
                [this.baserate,this.fps,this.drop] = [25,25,false]
                break;
            case "29.970":
                [this.baserate,this.fps,this.drop] = [30,29.97,true]
                break;
            case "30.000":
                [this.baserate,this.fps,this.drop] = [30,30,false]
                break;
            case "48.000":
                [this.baserate,this.fps,this.drop] = [48,48,false]
                break;
            case "50.000":
                [this.baserate,this.fps,this.drop] = [50,50,false]
                break;
            case "59.940":
                [this.baserate,this.fps,this.drop] = [60,59.94,true]
                break;
            default:
                [this.baserate,this.fps,this.drop] = [Math.round(framerate),framerate,false];
                break;
        }
    }
    get Drop() { return this.drop };
    get FPS() { return this.fps };
    get Baserate() { return this.baserate };

    toString(): string {
        if(Number.isInteger(this.fps)) return this.fps.toFixed(0);
        else{
            switch (this.fps.toFixed(3)) {
                case "23.976":
                    return "23.976";
                case "29.970":
                    return (this.drop) ? "29.97DF" : "29.97NDF";
                case "59.940":
                    return (this.drop) ? "59.94DF" : "59.94NDF";
                default:
                    return this.fps.toFixed(2);
            }
        }
    }
}

class TimecodeError extends Error {
    name = 'TimecodeError';
    constructor(message: string){
        super(message);
        Object.setPrototypeOf(this,TimecodeError.prototype)
    }
}