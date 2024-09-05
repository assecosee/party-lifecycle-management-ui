import { Directive, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appUppercase]'
})
export class UppercaseDirective {
  @HostListener('input', ['$event']) onInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    console.log(input.value);
    input.value = input.value.toUpperCase();
  }
}
