import {Timecode} from '../index';

// const tc1 = new Timecode('00:01:01:00',"29.97DF");
// console.log(tc1.toString());
// // 00;01;01;00

// const tc2 = new Timecode('00:01:02:15',{denom:1001,numer:30000,drop:true});
// console.log(tc2.toString());
// // 00;01;02;15

// const tc3 = new Timecode(12345,29.97); // 29.97 and 59.94 numbers are interpretted as drop-frame by default
// console.log(tc3.toString());
// // 00;06;51;27

// let sum = Timecode.add(tc1,tc2); // Immutable - tc1 and tc2 remain unchanged.
// console.log(sum.toString());
// // 00;02;03;15

// tc1.addTimecode(tc3); // Mutable - tc1 is changed
// console.log(tc1.toString());
// // 00;07;52;27

// import {Framerate} from '../';

// let fr1 = new Framerate(29.97);
// console.log(fr1.toString());
// // 29.97DF

// const tc = new Timecode("01:59:59:28",fr1);
// console.log(tc.toString());
// // 01;59;59;28

// import mocha from 'mocha';
// const {describe,suite} = mocha;
// import chai from 'chai';
// const {expect} = chai;
import {describe,suite} from 'mocha';
import {expect} from 'chai';

const strTC1 = "00:00:00:00";

suite('String timecodes',()=>{
    describe(`${strTC1}`,()=>{
        it('should return 0 frames for all framerates',()=>{
            expect(new Timecode(strTC1,"23.976").Frames).to.equal(0);
            expect(new Timecode(strTC1,"24").Frames).to.equal(0);
            expect(new Timecode(strTC1,"25").Frames).to.equal(0);
            expect(new Timecode(strTC1,"29.97DF").Frames).to.equal(0);
            expect(new Timecode(strTC1,"29.97NDF").Frames).to.equal(0);
            expect(new Timecode(strTC1,"30").Frames).to.equal(0);
            expect(new Timecode(strTC1,"48").Frames).to.equal(0);
            expect(new Timecode(strTC1,"50").Frames).to.equal(0);
            expect(new Timecode(strTC1,"59.94DF").Frames).to.equal(0);
            expect(new Timecode(strTC1,"59.94NDF").Frames).to.equal(0);
            expect(new Timecode(strTC1,24).Frames).to.equal(0);
            expect(new Timecode(strTC1,29.97).Frames).to.equal(0);
            expect(new Timecode(strTC1,{denom:1001,numer:60000,drop:true}).Frames).to.equal(0);
        })
    })
})