import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'textStripHtml'
})
export class TextStripHtmlPipe implements PipeTransform {

  transform(text: string): string {
    return text.replace(/(<([^>]+)>)|(&nbsp;)/ig, '');
  }

}

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform{
  transform(value: string, args: string[]) : string {
    let limit = args.length > 0 ? parseInt(args[0], 10) : 10;
    let trail = args.length > 1 ? args[1] : '...';

    return value.length > limit ? value.split(' ').splice(0, limit).join(' ') + trail : value;
  }
}

@Pipe({
  name: 'padZero'
})
export class PadZeroPipe implements PipeTransform {
  
  transform(value: string, length: number) {
    var s = value || "";
    s += "";
    while (s.length < length) s = "0" + s;
    return s;
  }
}

@Pipe({
  name: 'padK'
})
export class PadKPipe implements PipeTransform {
  constructor(protected decimalPipe: DecimalPipe) {
    
  }
  
  transform(value: any) {
    let n = Number(value);
    if (Number.isNaN(n)) return value;
    let s = (n/1000);
    return n < 1000 ? n + '' : this.decimalPipe.transform(s, '.0-1') + 'k';
  }
}
