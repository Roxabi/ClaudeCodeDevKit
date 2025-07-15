/**
 * Base Component Class
 *
 * This is the base class for all frontend components.
 * It provides common functionality and lifecycle methods.
 */

import { Logger } from '../utils/logger';

export interface ComponentProps {
  [key: string]: any;
}

export abstract class Component {
  protected props: ComponentProps;
  protected element?: HTMLElement;
  protected logger: Logger;
  protected children: Component[] = [];

  constructor(props: ComponentProps = {}) {
    this.props = props;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Get the component template
   */
  protected abstract getTemplate(): string;

  /**
   * Render the component
   */
  render(container?: HTMLElement): HTMLElement {
    const template = this.getTemplate();

    if (container) {
      container.innerHTML = template;
      this.element = container.firstElementChild as HTMLElement;
    } else {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = template;
      this.element = wrapper.firstElementChild as HTMLElement;
    }

    this.afterRender();
    return this.element;
  }

  /**
   * Called after the component is rendered
   */
  protected afterRender(): void {
    this.attachEventListeners();
    this.renderChildren();
  }

  /**
   * Attach event listeners to the component
   */
  protected attachEventListeners(): void {
    // Override in subclasses to add specific event listeners
  }

  /**
   * Render child components
   */
  protected renderChildren(): void {
    this.children.forEach(child => {
      const childContainer = this.element?.querySelector(
        `[data-component="${child.constructor.name}"]`
      );
      if (childContainer) {
        child.render(childContainer as HTMLElement);
      }
    });
  }

  /**
   * Add a child component
   */
  addChild(component: Component): void {
    this.children.push(component);
  }

  /**
   * Remove a child component
   */
  removeChild(component: Component): void {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
      component.destroy();
    }
  }

  /**
   * Update component props
   */
  updateProps(newProps: Partial<ComponentProps>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  /**
   * Get a prop value
   */
  protected getProp<T>(key: string, defaultValue?: T): T {
    return this.props[key] !== undefined ? this.props[key] : defaultValue;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    // Destroy all children first
    this.children.forEach(child => child.destroy());
    this.children = [];

    // Remove event listeners
    this.removeEventListeners();

    // Remove from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.logger.debug('Component destroyed');
  }

  /**
   * Remove event listeners
   */
  protected removeEventListeners(): void {
    // Override in subclasses to remove specific event listeners
  }

  /**
   * Get the component's DOM element
   */
  getElement(): HTMLElement | undefined {
    return this.element;
  }

  /**
   * Check if component is mounted
   */
  isMounted(): boolean {
    return this.element !== undefined && document.contains(this.element);
  }
}
