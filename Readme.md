# Timeframe

A javascript library for parsing and manipulation of SMPTE/EBU/Generic timecodes, framerates and framecounts.

## Usage

### Timecode Class

```typescript
import {Timecode} from '../';

const tc1 = new Timecode('00:01:01:00',"29.97DF");
console.log(tc1.toString());
// 00;01;01;00

const tc2 = new Timecode('00:01:02:15',{denom:1001,numer:30000,drop:true});
console.log(tc2.toString());
// 00;01;02;15

const tc3 = new Timecode(12345,29.97); // 29.97 and 59.94 numbers are interpretted as drop-frame by default
console.log(tc3.toString());
// 00;06;51;27

let sum = Timecode.add(tc1,tc2); // Immutable - tc1 and tc2 remain unchanged.
console.log(sum.toString());
// 00;02;03;15

tc1.addTimecode(tc3); // Mutable - tc1 is changed
console.log(tc1.toString());
// 00;07;52;27'
```

### Framerate Class

Framerate objects can be instantiated by passing a FramerateLike value. The resulting object can then be used to initialize a Timecode instance.

```typescript
import {Framerate} from '../';

let fr1 = new Framerate(29.97);
console.log(fr1.toString());
// 29.97DF

const tc = new Timecode("01:59:59:28",fr1);
console.log(tc.toString());
// 01;59;59;28
```

As framerates can be expressed in multiple formats, this is useful for marshelling the same framerate into the same uniform type. For example, the following are the same framerate:
```typescript
let fr1 = "59.94DF"
let fr2 = 59.94
let fr3 = {numer:60000,denom:1001,drop:true}
```

## Credit

The logic in the `framesToTimecode` function is based on a [Stack Overflow answer](https://stackoverflow.com/a/6080116) by [Ichthyo](https://stackoverflow.com/users/444796/ichthyo).