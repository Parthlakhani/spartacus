import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ICON_TYPE } from '../../misc/icon/index';
import { NavigationNode } from './navigation-node.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { HamburgerMenuService } from './../../../layout/header/hamburger-menu/hamburger-menu.service';

@Component({
  selector: 'cx-navigation-ui',
  templateUrl: './navigation-ui.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationUIComponent implements OnDestroy {
  /**
   * The navigation node to render.
   */
  @Input() node: NavigationNode;

  /**
   * The number of child nodes that must be wrapped.
   */
  @Input() wrapAfter: number;
  /**
   * the icon type that will be used for navigation nodes
   * with children.
   */
  iconType = ICON_TYPE;

  /**
   * Indicates whether the navigation should support flyout.
   * If flyout is set to true, the
   * nested child navigation nodes will only appear on hover or focus.
   */
  @Input() @HostBinding('class.flyout') flyout = true;

  @Input() @HostBinding('class.is-open') isOpen = false;

  private openNodes: HTMLElement[] = [];
  private subscriptions = new Subscription();
  private resize = new EventEmitter();

  @HostListener('window:resize')
  onResize() {
    this.resize.next();
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private elemRef: ElementRef,
    private hamMenuService: HamburgerMenuService
  ) {
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => this.clear())
    );
    this.subscriptions.add(
      this.resize.pipe(debounceTime(50)).subscribe(() => {
        this.alignWrappersToRightIfStickOut();
      })
    );
    //check configuration
    this.attachListener();
  }

  attachListener(){

    
    this.subscriptions.add(
      this.hamMenuService.isExpanded.pipe(distinctUntilChanged()).subscribe((isExpanded: boolean) => {
        
        if(isExpanded && this.node.children?.length > 6){
        
          //if you expand the view, and theres a expanded sub node, reset it before client can do anything
          if(this.openNodes?.length > 0){
            this.closeSubMenus();
            this.reinitalizeMenu(this.node.children);
          }
        }
      })
    );
  }
  closeSubMenus(){
    let allClosed = false;
    while(!allClosed){
      this.back();
      allClosed = this.openNodes?.length == 0;
    }  
  }

  reinitalizeMenu(mainNodes: NavigationNode){
    if(mainNodes){ 
      //force a refresh on the nav node
      this.flyout = false;
      this.node = null;
      this.node = mainNodes;
    }
  }

  toggleOpen(event: UIEvent): void {
    if (event.type === 'keydown') {
      event.preventDefault();
    }
    const node = <HTMLElement>event.currentTarget;
    if (this.openNodes.includes(node)) {
      if (event.type === 'keydown') {
        this.back();
      } else {
        this.openNodes = this.openNodes.filter((n) => n !== node);
        this.renderer.removeClass(node, 'is-open');
      }
    } else {
      this.openNodes.push(node);
    }

    this.updateClasses();

    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  back(): void {
    if (this.openNodes[this.openNodes.length - 1]) {
      this.renderer.removeClass(
        this.openNodes[this.openNodes.length - 1],
        'is-open'
      );
      this.openNodes.pop();
      this.updateClasses();
    }
  }

  clear(): void {
    this.openNodes = [];
    this.updateClasses();
  }

  onMouseEnter(event: MouseEvent) {
    this.alignWrapperToRightIfStickOut(<HTMLElement>event.currentTarget);
    this.focusAfterPreviousClicked(event);
  }

  getTotalDepth(node: NavigationNode, depth = 0): number {
    if (node.children && node.children.length > 0) {
      return Math.max(
        ...node.children.map((n) => this.getTotalDepth(n, depth + 1))
      );
    } else {
      return depth;
    }
  }

  getColumnCount(length: number): number {
    return Math.round(length / (this.wrapAfter || length));
  }

  focusAfterPreviousClicked(event: MouseEvent) {
    const target: HTMLElement = <HTMLElement>(
      (event.target || event.relatedTarget)
    );
    if (
      target.ownerDocument.activeElement.matches('nav[tabindex]') &&
      target.parentElement.matches('.flyout')
    ) {
      target.focus();
    }
    return target.ownerDocument;
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private alignWrapperToRightIfStickOut(node: HTMLElement) {
    const wrapper = <HTMLElement>node.querySelector('.wrapper');
    const body = <HTMLElement>node.closest('body');
    if (wrapper) {
      this.renderer.removeStyle(wrapper, 'margin-left');
      if (
        wrapper.offsetLeft + wrapper.offsetWidth >
        body.offsetLeft + body.offsetWidth
      ) {
        this.renderer.setStyle(
          wrapper,
          'margin-left',
          `${node.offsetWidth - wrapper.offsetWidth}px`
        );
      }
    }
  }

  private alignWrappersToRightIfStickOut() {
    const navs = <HTMLCollection>this.elemRef.nativeElement.childNodes;
    Array.from(navs)
      .filter((node) => node.tagName === 'NAV')
      .forEach((nav) => this.alignWrapperToRightIfStickOut(<HTMLElement>nav));
  }

  private updateClasses(): void {
    this.openNodes.forEach((node, i) => {
      if (i + 1 < this.openNodes.length) {
        this.renderer.addClass(node, 'is-opened');
        this.renderer.removeClass(node, 'is-open');
      } else {
        this.renderer.removeClass(node, 'is-opened');
        this.renderer.addClass(node, 'is-open');
      }
    });

    this.isOpen = this.openNodes.length > 0;
  }
}
