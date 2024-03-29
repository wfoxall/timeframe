# Timeframe

A javascript library for parsing and manipulation of SMPTE/EBU/Generic timecodes, framerates and framecounts.

## Install

```shell
npm install @wfoxall/timeframe
```

## Usage

### Timecode Class

Import the `Timecode` class and create an instance.

```typescript
import {Timecode} from '@wfoxall/timeframe';

const tc = new Timecode('00:01:02:03',"29.97DF");

console.log(tc.toString());
// 00;01;02;03
```

A `TimecodeError` is thrown if the supplied string or framerate are invalid or incompatible. And the `toString()` class will take care of formatting the timecode correctly (e.g. semicolons for drop timecode).

Timecodes can be instantiated from a string or framecount, and the framerate can be expressed in any of several ways too (see [Framerate class](#Framerate-Class)):

```typescript
const tc1 = new Timecode('00:01:01:00',"29.97DF");
console.log(tc1.toString());
// 00;01;01;00

const tc2 = new Timecode('00:01:02:15',{denom:1001,numer:30000,drop:true});
console.log(tc2.toString());
// 00;01;02;15

const tc3 = new Timecode(12345,29.97); // 29.97 and 59.94 numbers are interpretted as drop-frame by default
console.log(tc3.toString());
// 00;06;51;27
```

You can add and subtract timecodes (with matching framerates) using the static method on the Timecode class, or with the method on an existing timecode object:

```typescript
let sum = Timecode.add(tc1,tc2); // Immutable - tc1 and tc2 remain unchanged.
console.log(sum.toString());
// 00;02;03;15

tc1.addTimecode(tc3); // Mutable - tc1 is changed
console.log(tc1.toString());
// 00;07;52;27
```

### Framerate Class

Framerate objects can be instantiated by passing a `FramerateLike` value. This can be a string, number or object as follows:

```typescript
let fr1 = "59.94DF"
let fr2 = 59.94
let fr3 = {numer:60000,denom:1001,drop:true}
```

This is particularly useful when marshalling framerates from various formats. For example, some video APIs like to express framerates as a fraction (eg. 29.97 is expressed as 30000/1001).

The resulting Framerate instance can then be used to initialize a Timecode instance.

```typescript
import {Framerate} from '@wfoxall/timeframe';

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