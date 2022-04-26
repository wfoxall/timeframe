import {Timecode} from '../index';

import {describe,suite} from 'mocha';
import {expect} from 'chai';
import { Framerate } from '../Timeframe';

const strTC1 = "00:00:00:00";

// Foundation for future test writing. More to follow soon.
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

const numFR1 = 25;
const numFR2 = 29.97;
const numFR3 = 33.3333;

suite('Numerical framerates',()=>{
    describe(`${numFR1}`,()=>{
        it('should be interpretted as integer timecode 25fps',()=>{
            let framerate: Framerate = new Framerate(numFR1)
            expect(framerate.toString(),'toString').to.equal('25');
            expect(framerate.FPS,'FPS').to.equal(25);
            expect(framerate.Drop,'Drop').to.equal(false);
            expect(framerate.Baserate,'Baserate').to.equal(25);
            expect(framerate.Fractional.numerator,'Fractional numerator').to.equal(25);
            expect(framerate.Fractional.denominator,'Fractional denominator').to.equal(1);
        })
    })
    describe(`${numFR2}`,()=>{
        it('should be interpretted as integer timecode 29.97fps dropframe',()=>{
            let framerate: Framerate = new Framerate(numFR2)
            expect(framerate.toString(),'toString').to.equal('29.97DF');
            expect(framerate.FPS,'FPS').to.equal(29.97);
            expect(framerate.Drop,'Drop').to.equal(true);
            expect(framerate.Baserate,'Baserate').to.equal(30);
            expect(framerate.Fractional.numerator,'Fractional numerator').to.equal(30000);
            expect(framerate.Fractional.denominator,'Fractional denominator').to.equal(1001);
        })
    })
    describe(`${numFR3}`,()=>{
        it('should be interpretted a fractional timecode',()=>{
            let framerate: Framerate = new Framerate(numFR3)
            expect(framerate.toString(),'toString').to.equal('33.33');
            expect(framerate.FPS).to.equal(33.3333);
            expect(framerate.Drop).to.equal(false);
            expect(framerate.Baserate).to.equal(33);
            expect(framerate.Fractional.numerator).to.equal(333333);
            expect(framerate.Fractional.denominator).to.equal(10000);
        })
    })
})

const strFR1 = "29.97DF"
const strFR2 = "23.976"

suite('String/Standard framerates',()=>{
    describe(`${strFR1}`,()=>{
        it('should be interpretted as standard framerate 29.97 dropframe',()=>{
            let framerate: Framerate = new Framerate(strFR1)
            expect(framerate.toString(),'toString').to.equal('29.97DF');
            expect(framerate.FPS,'FPS').to.equal(29.97);
            expect(framerate.Drop,'Drop').to.equal(true);
            expect(framerate.Baserate,'Baserate').to.equal(30);
            expect(framerate.Fractional.numerator,'Fractional numerator').to.equal(30000);
            expect(framerate.Fractional.denominator,'Fractional denominator').to.equal(1001);
        })
    })
    describe(`${strFR2}`,()=>{
        it('should be interpretted as integer timecode 23.976',()=>{
            let framerate: Framerate = new Framerate(strFR2)
            expect(framerate.toString(),'toString').to.equal('23.976');
            expect(framerate.FPS,'FPS').to.equal(23.976);
            expect(framerate.Drop,'Drop').to.equal(false);
            expect(framerate.Baserate,'Baserate').to.equal(24);
            expect(framerate.Fractional.numerator,'Fractional numerator').to.equal(24000);
            expect(framerate.Fractional.denominator,'Fractional denominator').to.equal(1001);
        })
    })
})