/**
 * Example Component
 *
 * This is an example component that demonstrates how to create
 * reusable UI components using the base Component class.
 */

import type { ComponentProps } from './Component';
import { Component } from './Component';

export interface ExampleComponentProps extends ComponentProps {
  title: string;
  description?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export class ExampleComponent extends Component {
  constructor(props: ExampleComponentProps) {
    super(props);
  }

  /**
   * Get the component template
   */
  protected getTemplate(): string {
    const title = this.getProp<string>('title', 'Default Title');
    const description = this.getProp<string>('description');
    const variant = this.getProp<string>('variant', 'primary');
    const disabled = this.getProp<boolean>('disabled', false);

    return `
      <div class="example-component example-component--${variant} ${disabled ? 'example-component--disabled' : ''}">
        <div class="example-component__header">
          <h3 class="example-component__title">${title}</h3>
        </div>
        ${
          description
            ? `
          <div class="example-component__body">
            <p class="example-component__description">${description}</p>
          </div>
        `
            : ''
        }
        <div class="example-component__footer">
          <button 
            class="example-component__button" 
            ${disabled ? 'disabled' : ''}
            data-action="click"
          >
            ${disabled ? 'Disabled' : 'Click Me'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  protected attachEventListeners(): void {
    const button = this.element?.querySelector(
      '[data-action="click"]'
    ) as HTMLButtonElement;
    const onClick = this.getProp<() => void>('onClick');

    if (button && onClick) {
      button.addEventListener('click', event => {
        event.preventDefault();

        if (!this.getProp<boolean>('disabled', false)) {
          this.logger.debug('Button clicked');
          onClick();
        }
      });
    }
  }

  /**
   * Remove event listeners
   */
  protected removeEventListeners(): void {
    const button = this.element?.querySelector(
      '[data-action="click"]'
    ) as HTMLButtonElement;
    if (button) {
      // Clone and replace to remove all event listeners
      const newButton = button.cloneNode(true);
      button.parentNode?.replaceChild(newButton, button);
    }
  }

  /**
   * Update the component title
   */
  setTitle(title: string): void {
    this.updateProps({ title });
  }

  /**
   * Update the component description
   */
  setDescription(description: string): void {
    this.updateProps({ description });
  }

  /**
   * Enable or disable the component
   */
  setDisabled(disabled: boolean): void {
    this.updateProps({ disabled });
  }

  /**
   * Set the component variant
   */
  setVariant(variant: 'primary' | 'secondary' | 'danger'): void {
    this.updateProps({ variant });
  }

  /**
   * Trigger the click action programmatically
   */
  click(): void {
    const onClick = this.getProp<() => void>('onClick');
    const disabled = this.getProp<boolean>('disabled', false);

    if (onClick && !disabled) {
      this.logger.debug('Programmatic click triggered');
      onClick();
    }
  }

  /**
   * Get component state
   */
  getState(): {
    title: string;
    description?: string;
    variant: string;
    disabled: boolean;
    isMounted: boolean;
  } {
    return {
      title: this.getProp<string>('title', 'Default Title'),
      description: this.getProp<string>('description'),
      variant: this.getProp<string>('variant', 'primary'),
      disabled: this.getProp<boolean>('disabled', false),
      isMounted: this.isMounted(),
    };
  }
}
