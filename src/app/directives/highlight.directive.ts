import { Directive, Input, ElementRef, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight: 'closed' | 'waitlist' | 'open' | '' = '';
  @Input() availableSeats: number = 99;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.applyHighlight();
  }

  private applyHighlight(): void {
    // Remove previous classes
    ['highlight-limited', 'highlight-full', 'highlight-waitlist', 'highlight-open']
      .forEach(cls => this.renderer.removeClass(this.el.nativeElement, cls));

    if (this.appHighlight === 'closed' || this.availableSeats <= 0) {
      this.renderer.addClass(this.el.nativeElement, 'highlight-full');
    } else if (this.appHighlight === 'waitlist') {
      this.renderer.addClass(this.el.nativeElement, 'highlight-waitlist');
    } else if (this.availableSeats <= 5) {
      this.renderer.addClass(this.el.nativeElement, 'highlight-limited');
    } else {
      this.renderer.addClass(this.el.nativeElement, 'highlight-open');
    }
  }
}
