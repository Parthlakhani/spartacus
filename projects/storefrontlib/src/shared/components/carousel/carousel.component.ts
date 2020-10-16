import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  isDevMode,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FocusConfig } from 'projects/storefrontlib/src/layout/a11y/keyboard-focus/keyboard-focus.model';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs/operators';
import { ICON_TYPE } from '../../../cms-components/misc/icon/icon.model';
import { CarouselService } from './carousel.service';

/**
 * Generic carousel component that can be used to render any carousel items,
 * such as products, images, banners, or any component. Carousel items are
 * rendered in so-called carousel slides, and the previous/next buttons as well as
 * the indicator-buttons can used to navigate the slides.
 *
 * The component uses an array of Observables (`items$`) as an input, to allow
 * for lazy loading of items.
 *
 * The number of items per slide is calculated with the `itemWidth`, which can given
 * in pixels or percentage.
 *
 * To allow for flexible rendering of items, the rendering is delegated to the
 * given `template`. This allows for maximum flexibility.
 */
@Component({
  selector: 'cx-carousel',
  templateUrl: './carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnInit {
  /**
   * The title is rendered as the carousel heading.
   */
  @Input() title: string;

  /**
   * provides a configuration to add accessibility control to the carousel.
   * The default configuration adds the following:
   * - _locks_ the carousel, so that the carousel can be skipped using the tab key.
   * - traps the focus, which means that the after selecting the last item, the first item is selected
   * - the first item is auto-focused (if it is focusable) is selected.
   *
   * Additionally, a named focus _group_ could be added to refocus the last selected element
   * if the carousel is focussed again.
   */
  @Input() focusConfig: FocusConfig = {
    lock: true,
    autofocus: true,
  };

  /**
   * The items$ represent the carousel items. The items$ are
   * observables so that the items can be loaded on demand.
   */
  items: Observable<any>[];

  @Input('items')
  set setItems(inputItems: Observable<any>[]) {
    this.items = inputItems;
    //Reset slider when changing products
    this.activeSlide = 0;
  }

  /**
   * The template is rendered for each item, so that the actual
   * view can be given by the component that uses the `CarouselComponent`.
   */
  @Input() template: TemplateRef<any>;

  /**
   * Specifies the minimum size of the carousel item, either in px or %.
   * This value is used for the calculation of numbers per carousel, so that
   * the number of carousel items is dynamic. The calculation uses the `itemWidth`
   * and the host element `clientWidth`, so that the carousel is reusable in
   * different layouts (for example in a 50% grid).
   */
  @Input() itemWidth;
  //  = '300px';

  /**
   * Indicates whether the visual indicators are used.
   */
  @Input() hideIndicators = false;

  @Input() indicatorIcon = ICON_TYPE.CIRCLE;
  @Input() previousIcon = ICON_TYPE.CARET_LEFT;
  @Input() nextIcon = ICON_TYPE.CARET_RIGHT;

  activeSlide: number;
  size$: Observable<number>;

  @ViewChild('carousel', { read: ElementRef }) carousel: ElementRef<
    HTMLElement
  >;

  @ViewChildren('item') itemRefs!: QueryList<ElementRef<HTMLElement>>;

  protected readonly visibleItems$: BehaviorSubject<
    Map<number, boolean>
  > = new BehaviorSubject(new Map());

  // protected readonly visible2$ = this.visibleItems$.pipe(
  //   // tap(console.log)
  // );

  protected readonly slides$ = this.visibleItems$.pipe(
    // tap(console.log),
    // Currently a lower debounce time breaks the indicator selection,
    // since the scroll left would end to it's final state.
    debounceTime(300),
    filter((v) => v.size > 0),
    map((visible) =>
      Array.from(visible)
        .filter((value) => !!value[1])
        .map((value) => value[0])
        .sort((a, b) => a - b)
    ),
    distinctUntilChanged(),
    // filter((v) => v.length > 0),
    map((visible) => {
      const slides =
        this.carouselHost.clientWidth > 0
          ? Array.from(
              Array(
                Math.ceil(
                  this.carouselHost.scrollWidth / this.carouselHost.clientWidth
                )
              ).keys()
            )
          : [];

      const previous = {
        visible: slides.length > 1,
        disabled: visible[0] === 0,
        enabled: visible[0] > 0,
      };
      const next = {
        visible: slides.length > 1,
        disabled: visible[visible.length] === this.itemRefs.length - 1,
        enabled: visible[visible.length - 1] < this.itemRefs.length - 1,
      };

      return { slides, previous, next };
    }),
    distinctUntilChanged()
  );

  /**
   * Returns the observed disabled state for the previous button.
   */
  readonly previous$: Observable<any> = this.slides$.pipe(
    map((data) => data.previous),
    distinctUntilChanged()
  );

  /**
   * Returns the observed disabled state for the next button.
   */
  readonly next$: Observable<any> = this.slides$.pipe(
    map((data) => data.next),
    distinctUntilChanged()
  );

  indicators$: Observable<any> = this.slides$.pipe(
    map((data) => {
      const scrollLeft = this.carouselHost.scrollLeft;
      return data.slides.map((index) => {
        const left = this.carouselHost.clientWidth * index;
        const right = this.carouselHost.clientWidth * (index + 1);

        const hasLastMatch =
          scrollLeft + this.carouselHost.clientWidth ===
          this.carouselHost.scrollWidth;

        const selected = hasLastMatch
          ? index === data.slides.length - 1
          : scrollLeft >= left && scrollLeft < right;

        return { index, selected };
      });
    }),
    filter((i) => i.length > 1)
  );

  constructor(
    protected el: ElementRef,
    protected service: CarouselService // protected cd: ChangeDetectorRef, // protected tabFocusService: TabFocusService, // protected selectFocusUtility: SelectFocusUtility
  ) {}

  ngOnInit() {
    if (!this.template) {
      this.renderDxMessage();
      return;
    }

    this.size$ = this.service.getItemsPerSlide(this.host, this.itemWidth).pipe(
      tap(() => {
        if (this.itemWidth) {
          this.activeSlide = 0;
        }
      }),
      map((items) => {
        return this.itemWidth ? items : this.items?.length || 0;
      })
    );
  }

  previous() {
    this.carouselHost.scrollBy({
      left: -this.carouselHost.clientWidth,
    });
  }

  next() {
    this.carouselHost.scrollBy({
      left: this.carouselHost.clientWidth,
    });
  }

  scroll(index: number) {
    this.carouselHost.scrollTo({
      left: this.carouselHost.clientWidth * index,
    });
  }

  /**
   * Maintains a map with all the visible slide items. This is stored in
   * a subject, so that we can observe the visible slides and update the indicators.
   */
  intersect(intersected: boolean, ref: HTMLElement) {
    const index = this.itemRefs
      .toArray()
      .findIndex((item) => item.nativeElement === ref);

    const visibleMap = this.visibleItems$.value;
    visibleMap.set(index, intersected);

    this.visibleItems$.next(visibleMap);
  }

  /**
   * Returns the component native host element.
   */
  protected get host(): HTMLElement {
    return this.el.nativeElement;
  }

  /**
   * Returns the carousel native host element.
   */
  protected get carouselHost(): HTMLElement {
    return this.carousel.nativeElement;
  }

  private renderDxMessage(): void {
    if (isDevMode()) {
      console.error(
        'No template reference provided to render the carousel items for the `cx-carousel`'
      );
    }
  }
}
